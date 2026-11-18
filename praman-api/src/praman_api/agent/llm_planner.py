"""Praman Financial Copilot - Neuro-Symbolic LLM Planner.
Hybrid architecture:
- AI plans & writes SQL using optional keyed LLM (OpenAI or Gemini) with PII tokenization;
- Local deterministic entity parser & SQL template engine when running keyless;
- Deterministic DuckDB engine & cashflow_math.py execute and enforce guardrails.
"""
import os
import re
import time
from typing import Dict, Any, Optional
import httpx

from praman_api.engine.udfs import extract_utr, norm_indic_vendor, jw_sim, validate_gstin_checksum

PLANNER_SYSTEM_PROMPT = """You are the Senior SQL Architect for Praman Financial Copilot, an autonomous Indian SME cash-flow investigation engine.
You are given a query and optional bank narration describing a financial discrepancy.
Your task is to write a valid, defensive DuckDB SQL query to investigate the issue across our database tables and UDFs.

Available Tables:
1. tally_invoices (invoice_id, invoice_date, vendor_name, vendor_gstin, taxable_value, igst_amount, total_amount, vendor_ifsc, payout_status)
2. bank_statement (row_id, txn_date, narration, withdrawal, deposit, running_balance, ifsc_code)
3. gstr2b_tax (gstr2b_id, gstin_supplier, invoice_num, itc_eligible_amount, filing_status)
4. razorpay_upi (payment_id, order_id, created_at, gross_amount, net_settlement, status, rrn_utr, customer_vpa)
5. cashflow_commitments (commitment_id, commitment_type, amount, due_date, lender_or_payee, priority)
6. company_policies (policy_id, policy_name, clause_reference, rule_definition, penalty_formula, statutory_citation)

Registered DuckDB UDFs:
- extract_utr(text: VARCHAR) -> VARCHAR: Extracts 12-digit UTR/RRN from noisy Indian bank narrations.
- norm_indic_vendor(name: VARCHAR) -> VARCHAR: Normalizes Indian SME vendor names (strips M/S, expands ENT/PVT LTD/TRD).
- jw_sim(s1: VARCHAR, s2: VARCHAR) -> DOUBLE: Jaro-Winkler similarity on normalized strings.
- validate_gstin_checksum(gstin: VARCHAR) -> BOOLEAN: Validates 15-char Indian GSTIN.

Strict Guardrails:
- NEVER run SUM(running_balance) on bank_statement. Use CTE with ORDER BY txn_date DESC, row_id DESC LIMIT 1.
- Use jw_sim >= 0.90 for fuzzy matching and qualify with ROW_NUMBER() to eliminate phonetic decoys.
- Return ONLY the raw SQL query inside a ```sql ... ``` code block.
"""


def redact_pii(text: str) -> str:
    """Masks Indian financial PII (UTRs, VPAs, account numbers, phone numbers) before external dispatch."""
    if not text:
        return ""
    # Mask 12-digit UTR / RRN numbers
    redacted = re.sub(r"\b\d{12}\b", "<UTR_TOKEN>", text)
    # Mask VPAs (e.g., user@okhdfcbank, someone@upi)
    redacted = re.sub(r"[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}", "<VPA_TOKEN>", redacted)
    # Mask 10-digit Indian mobile numbers (starts with 6,7,8,9)
    redacted = re.sub(r"\b[6-9]\d{9}\b", "<PHONE_TOKEN>", redacted)
    # Mask bank account numbers (11 to 18 digits)
    redacted = re.sub(r"\b\d{11,18}\b", "<ACCOUNT_TOKEN>", redacted)
    return redacted


def parse_investigation_intent(query: str, raw_narration: Optional[str] = None) -> Dict[str, Any]:
    """Deterministically extracts structured financial intent and entities from user query & narration."""
    combined = f"{query} {raw_narration or ''}".strip()
    
    # 1. Extract 12-digit UTR (either via UTR_REGEX or standalone 12-digit sequence)
    utr_standalone = re.search(r"\b([0-9]{12})\b", combined)
    utr = utr_standalone.group(1) if utr_standalone else (extract_utr(raw_narration or "") if raw_narration else extract_utr(query))
    
    # 2. Extract Invoice ID (INV-YYYY-XXXX or INV-XXXX)
    inv_match = re.search(r"INV-\d{4}-\d+|INV-\d+", combined, re.IGNORECASE)
    invoice_id = inv_match.group(0).upper() if inv_match else None
    
    # 3. Extract 15-char GSTIN
    gstin_match = re.search(r"[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}", combined)
    gstin = gstin_match.group(0) if gstin_match else None
    
    # 4. Extract Amount
    amt_match = re.search(
        r"(?:₹|INR|RS\.?|AMOUNT\s*:?\s*)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|\b[0-9]{4,8}(?:\.[0-9]{1,2})?\b)",
        combined,
        re.IGNORECASE
    )
    amount = None
    if amt_match:
        val_str = amt_match.group(1).replace(",", "")
        try:
            val = float(val_str)
            if val > 0:
                amount = val
        except ValueError:
            amount = None

    # 5. Extract Vendor Query
    vendor_query = norm_indic_vendor(raw_narration or query)

    # 6. Intent classification
    combined_upper = combined.upper()
    if invoice_id:
        intent = "INVOICE_DISCREPANCY"
    elif utr or "UPI" in combined_upper or "RRN" in combined_upper or "DOUBLE" in combined_upper or "CHARGEBACK" in combined_upper:
        intent = "UPI_CHARGEBACK"
    elif gstin:
        intent = "GSTIN_VERIFICATION"
    elif "SLA" in combined_upper or "DOWNTIME" in combined_upper:
        intent = "SLA_DISPUTE"
    elif vendor_query and len(vendor_query) > 2:
        intent = "VENDOR_LOOKUP"
    else:
        intent = "GENERAL_AUDIT"

    return {
        "intent": intent,
        "utr": utr,
        "invoice_id": invoice_id,
        "gstin": gstin,
        "vendor_query": vendor_query,
        "amount": amount
    }


def _extract_sql_from_response(text: str) -> Optional[str]:
    """Extracts SQL query from LLM markdown code fence or text."""
    match = re.search(r"```(?:sql)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    cleaned = text.strip()
    if cleaned.upper().startswith("SELECT") or cleaned.upper().startswith("WITH"):
        return cleaned
    return None


def plan_sql_with_llm(
    query: str,
    raw_narration: Optional[str] = None,
    timeout_sec: float = 3.0
) -> Dict[str, Any]:
    """Generates an investigation SQL query using local parser + guardrail or optional keyed LLM.
    
    Zero unauthenticated external API calls containing PII.
    If OPENAI_API_KEY or GEMINI_API_KEY is configured, prompt is sent with PII redacted.
    Otherwise, uses deterministic local parser and SQL template engine.
    """
    start_time = time.time()
    parsed = parse_investigation_intent(query, raw_narration)
    extracted_utr = parsed["utr"]
    norm_vendor = parsed["vendor_query"]

    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")

    # If keyed LLM is available, call it with PII tokenized
    if openai_key or gemini_key:
        safe_query = redact_pii(query)
        safe_narration = redact_pii(raw_narration) if raw_narration else None
        
        user_content = f"Investigation Query: {safe_query}\n"
        if safe_narration:
            user_content += f"Bank Narration: {safe_narration}\n"
        if extracted_utr:
            user_content += f"Extracted 12-digit UTR Token: <UTR_TOKEN>\n"
        if norm_vendor:
            user_content += f"Normalized Vendor: {norm_vendor}\n"

        if openai_key:
            api_url = "https://api.openai.com/v1/chat/completions"
            headers = {"Content-Type": "application/json", "Authorization": f"Bearer {openai_key}"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": PLANNER_SYSTEM_PROMPT},
                    {"role": "user", "content": user_content}
                ],
                "temperature": 0.1,
                "max_tokens": 400
            }
        else:
            api_url = f"https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
            headers = {"Content-Type": "application/json", "Authorization": f"Bearer {gemini_key}"}
            payload = {
                "model": "gemini-1.5-flash",
                "messages": [
                    {"role": "system", "content": PLANNER_SYSTEM_PROMPT},
                    {"role": "user", "content": user_content}
                ],
                "temperature": 0.1,
                "max_tokens": 400
            }

        try:
            with httpx.Client(timeout=timeout_sec) as client:
                resp = client.post(api_url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    sql = _extract_sql_from_response(content)
                    if sql and ("SELECT" in sql.upper() or "WITH" in sql.upper()):
                        # Re-substitute actual UTR if tokenized
                        if extracted_utr:
                            sql = sql.replace("<UTR_TOKEN>", extracted_utr)
                        return {
                            "sql": sql,
                            "purpose": "Autonomous LLM-planned SQL investigation query (PII-safe)",
                            "planner_source": "keyed_llm",
                            "latency_ms": round((time.time() - start_time) * 1000, 2),
                            "extracted_utr": extracted_utr,
                            "norm_vendor": norm_vendor,
                            "parsed_intent": parsed
                        }
        except Exception:
            pass

    # Local Deterministic SQL Template Engine (Zero API Key, Zero PII Leaks, Instant Response)
    deterministic_sql = _build_deterministic_sql(query, raw_narration, parsed)
    return {
        "sql": deterministic_sql,
        "purpose": "Deterministic SQL Guardrail Plan (Local PII-Safe)",
        "planner_source": "local_deterministic_guardrail",
        "latency_ms": round((time.time() - start_time) * 1000, 2),
        "extracted_utr": extracted_utr,
        "norm_vendor": norm_vendor,
        "parsed_intent": parsed
    }


def _build_deterministic_sql(
    query: str,
    raw_narration: Optional[str] = None,
    parsed: Optional[Dict[str, Any]] = None,
    extracted_utr: Optional[str] = None,
    norm_vendor: Optional[str] = None
) -> str:
    """Builds a deterministic, defensive DuckDB SQL query matching user query semantics."""
    if parsed is None:
        parsed = parse_investigation_intent(query, raw_narration)
    
    inv_id = parsed.get("invoice_id")
    utr = parsed.get("utr") or extracted_utr
    gstin = parsed.get("gstin")
    vendor = parsed.get("vendor_query") or norm_vendor

    # Case A: Invoice specific check (e.g., INV-2026-104 or INV-2026-0037)
    if inv_id:
        return f"""
        WITH target_inv AS (
            SELECT invoice_id, invoice_date, vendor_name, vendor_gstin, taxable_value, igst_amount, total_amount, vendor_ifsc, payout_status
            FROM tally_invoices
            WHERE invoice_id = '{inv_id}'
        ),
        tax_info AS (
            SELECT gstr2b_id, gstin_supplier, invoice_num, itc_eligible_amount, filing_status
            FROM gstr2b_tax
            WHERE invoice_num = '{inv_id}'
        ),
        bank_matches AS (
            SELECT b.row_id, b.txn_date, b.narration, b.withdrawal, b.deposit,
                   extract_utr(b.narration) AS extracted_utr,
                   jw_sim(b.narration, v.vendor_name) AS sim_score
            FROM bank_statement b
            CROSS JOIN target_inv v
            WHERE jw_sim(b.narration, v.vendor_name) >= 0.92
            QUALIFY ROW_NUMBER() OVER (PARTITION BY b.ifsc_code ORDER BY sim_score DESC) = 1
        )
        SELECT v.*, 
               COALESCE(t.itc_eligible_amount, 0.0) AS gstr2b_itc,
               COALESCE(t.filing_status, 'NOT_FILED') AS gstr2b_filing_status,
               b.row_id AS bank_row, b.narration AS bank_narration, b.withdrawal AS bank_withdrawal
        FROM target_inv v
        LEFT JOIN tax_info t ON v.invoice_id = t.invoice_num
        LEFT JOIN bank_matches b ON 1=1;
        """.strip()

    # Case B: UTR / UPI specific query (e.g., 432910485711 or fake 999999999999)
    if utr:
        return f"""
        WITH upi_match AS (
            SELECT payment_id, order_id, created_at, gross_amount, net_settlement, status, rrn_utr, customer_vpa
            FROM razorpay_upi
            WHERE rrn_utr = '{utr}'
        ),
        bank_match AS (
            SELECT row_id, txn_date, narration, withdrawal, deposit, ifsc_code
            FROM bank_statement
            WHERE extract_utr(narration) = '{utr}'
        )
        SELECT u.payment_id, u.order_id, u.created_at, u.gross_amount, u.net_settlement, u.status, u.rrn_utr, u.customer_vpa,
               b.row_id AS bank_row, b.txn_date AS bank_date, b.narration AS bank_narration, b.deposit AS bank_deposit
        FROM upi_match u
        FULL OUTER JOIN bank_match b ON 1=1
        WHERE u.payment_id IS NOT NULL OR b.row_id IS NOT NULL;
        """.strip()

    # Case C: GSTIN query
    if gstin:
        return f"""
        SELECT t.invoice_id, t.vendor_name, t.vendor_gstin, t.taxable_value, t.igst_amount, t.total_amount, t.payout_status,
               g.gstr2b_id, g.itc_eligible_amount, g.filing_status
        FROM tally_invoices t
        LEFT JOIN gstr2b_tax g ON t.vendor_gstin = g.gstin_supplier AND t.invoice_id = g.invoice_num
        WHERE t.vendor_gstin = '{gstin}';
        """.strip()

    # Case D: General Vendor query with fuzzy matching and tax join
    if vendor and len(vendor) >= 3:
        clean_vendor = vendor[:20].strip()
        return f"""
        WITH vendor_candidates AS (
            SELECT invoice_id, invoice_date, vendor_name, vendor_gstin, taxable_value, igst_amount, total_amount, payout_status,
                   jw_sim(norm_indic_vendor(vendor_name), '{clean_vendor}') AS sim_score
            FROM tally_invoices
            WHERE jw_sim(norm_indic_vendor(vendor_name), '{clean_vendor}') >= 0.85
        )
        SELECT v.invoice_id, v.invoice_date, v.vendor_name, v.vendor_gstin, v.taxable_value, v.igst_amount, v.total_amount, v.payout_status,
               COALESCE(g.itc_eligible_amount, 0.0) AS gstr2b_itc,
               COALESCE(g.filing_status, 'NOT_FILED') AS gstr2b_filing_status
        FROM vendor_candidates v
        LEFT JOIN gstr2b_tax g ON v.invoice_id = g.invoice_num
        ORDER BY v.sim_score DESC, v.invoice_date DESC
        LIMIT 10;
        """.strip()

    # Fallback Case: Query top pending invoices with tax filing status
    return """
    SELECT t.invoice_id, t.invoice_date, t.vendor_name, t.vendor_gstin, t.taxable_value, t.igst_amount, t.total_amount, t.payout_status,
           COALESCE(g.itc_eligible_amount, 0.0) AS gstr2b_itc,
           COALESCE(g.filing_status, 'NOT_FILED') AS gstr2b_filing_status
    FROM tally_invoices t
    LEFT JOIN gstr2b_tax g ON t.invoice_id = g.invoice_num
    ORDER BY t.invoice_date DESC
    LIMIT 5;
    """.strip()
