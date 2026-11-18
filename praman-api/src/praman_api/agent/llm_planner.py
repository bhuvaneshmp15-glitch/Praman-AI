"""Praman Financial Copilot - Neuro-Symbolic LLM Planner.
Hybrid architecture:
- AI plans & writes SQL using keyless Pollinations AI or optional OpenAI/Gemini;
- Deterministic DuckDB engine & cashflow_math.py execute and enforce guardrails.
Transparent fallback to deterministic neuro-symbolic plan on offline / sandboxed tests.
"""
import os
import re
import time
from typing import Dict, Any, Optional
import httpx

from praman_api.engine.udfs import extract_utr, norm_indic_vendor, jw_sim, validate_gstin_checksum

POLLINATIONS_ENDPOINT = "https://text.pollinations.ai/openai/chat/completions"

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


def _extract_sql_from_response(text: str) -> Optional[str]:
    """Extracts SQL query from LLM markdown code fence or text."""
    match = re.search(r"```(?:sql)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    # Check if text looks like a SELECT statement
    cleaned = text.strip()
    if cleaned.upper().startswith("SELECT") or cleaned.upper().startswith("WITH"):
        return cleaned
    return None


def plan_sql_with_llm(
    query: str,
    raw_narration: Optional[str] = None,
    timeout_sec: float = 1.5
) -> Dict[str, Any]:
    """Generates an investigation SQL query using LLM planner with deterministic fallback.
    
    Returns:
        dict containing 'sql', 'purpose', 'planner_source', and 'latency_ms'.
    """
    start_time = time.time()
    extracted_utr = extract_utr(raw_narration or "") if raw_narration else extract_utr(query)
    norm_vendor = norm_indic_vendor(raw_narration or query)

    user_content = f"Investigation Query: {query}\n"
    if raw_narration:
        user_content += f"Raw Bank Narration: {raw_narration}\n"
    if extracted_utr:
        user_content += f"Extracted 12-digit UTR: {extracted_utr}\n"
    if norm_vendor:
        user_content += f"Normalized Entity: {norm_vendor}\n"

    # 1. Try calling Pollinations AI / OpenAI endpoint if network is reachable
    openai_key = os.getenv("OPENAI_API_KEY")
    api_url = "https://api.openai.com/v1/chat/completions" if openai_key else POLLINATIONS_ENDPOINT
    headers = {"Content-Type": "application/json"}
    if openai_key:
        headers["Authorization"] = f"Bearer {openai_key}"

    payload = {
        "model": "gpt-4o-mini" if openai_key else "openai",
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
                    return {
                        "sql": sql,
                        "purpose": "Autonomous LLM-planned SQL investigation query",
                        "planner_source": "openai" if openai_key else "pollinations_ai",
                        "latency_ms": round((time.time() - start_time) * 1000, 2),
                        "extracted_utr": extracted_utr,
                        "norm_vendor": norm_vendor
                    }
    except Exception:
        # Fallback smoothly on any timeout, connection error, or sandboxed execution
        pass

    # 2. Deterministic Neuro-Symbolic SQL Generator (Guaranteed instant fallback)
    deterministic_sql = _build_deterministic_sql(query, raw_narration, extracted_utr, norm_vendor)
    return {
        "sql": deterministic_sql,
        "purpose": "Deterministic Neuro-Symbolic SQL plan (fallback active)",
        "planner_source": "deterministic_neuro_symbolic",
        "latency_ms": round((time.time() - start_time) * 1000, 2),
        "extracted_utr": extracted_utr,
        "norm_vendor": norm_vendor
    }


def _build_deterministic_sql(
    query: str,
    raw_narration: Optional[str],
    extracted_utr: str,
    norm_vendor: str
) -> str:
    """Builds a deterministic, defensive DuckDB SQL query matching user query semantics."""
    query_upper = (query + " " + (raw_narration or "")).upper()

    # Case A: Invoice specific check (e.g., INV-2026-104)
    inv_match = re.search(r"INV-\d{4}-\d+", query_upper)
    if inv_match:
        inv_id = inv_match.group(0)
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

    # Case B: UTR / UPI specific query
    if extracted_utr:
        return f"""
        WITH upi_match AS (
            SELECT payment_id, order_id, created_at, gross_amount, net_settlement, status, rrn_utr, customer_vpa
            FROM razorpay_upi
            WHERE rrn_utr = '{extracted_utr}'
        ),
        bank_match AS (
            SELECT row_id, txn_date, narration, withdrawal, deposit, ifsc_code
            FROM bank_statement
            WHERE extract_utr(narration) = '{extracted_utr}'
        )
        SELECT u.*, b.row_id AS bank_row, b.txn_date AS bank_date, b.narration AS bank_narration, b.deposit AS bank_deposit
        FROM upi_match u
        FULL OUTER JOIN bank_match b ON 1=1;
        """.strip()

    # Case C: GSTIN query
    gstin_match = re.search(r"[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}", query_upper)
    if gstin_match:
        gstin = gstin_match.group(0)
        return f"""
        SELECT t.invoice_id, t.vendor_name, t.vendor_gstin, t.total_amount, t.payout_status,
               g.gstr2b_id, g.itc_eligible_amount, g.filing_status
        FROM tally_invoices t
        LEFT JOIN gstr2b_tax g ON t.vendor_gstin = g.gstin_supplier AND t.invoice_id = g.invoice_num
        WHERE t.vendor_gstin = '{gstin}';
        """.strip()

    # Case D: General Vendor fuzzy query
    search_term = norm_vendor[:15] if norm_vendor else "BALAJI"
    return f"""
    SELECT invoice_id, invoice_date, vendor_name, vendor_gstin, total_amount, payout_status,
           jw_sim(vendor_name, '{search_term}') AS sim_score
    FROM tally_invoices
    ORDER BY sim_score DESC
    LIMIT 10;
    """.strip()
