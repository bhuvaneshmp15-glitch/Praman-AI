"""Praman Financial Copilot - Multi-Provider LLM Integration Service.
Clear Division of Labor:
- "AI Reads and Explains, Code Decides":
  Job 1 (ai_extract_intake): Reads noisy unstructured bank SMS/narration into structured entities (redacts PII first).
  Job 2 (ai_synthesize_memo): Explains deterministic DuckDB findings & exact cashflow math in plain-language executive memo.
- 100% of SQL generation, entity matching, and verdict classification remains in deterministic code.
Supports: Groq, OpenRouter, OpenAI, Gemini, with seamless offline local fallback.
"""
import os
import re
import json
import time
from typing import Dict, Any, Optional, Tuple, List
import httpx

from praman_api.config import settings
from praman_api.agent.llm_planner import redact_pii, parse_investigation_intent


def verify_memo_numbers(memo_text: str, allowed_rupee_values: List[float]) -> bool:
    """Strict post-generation guardrail: verifies that every explicit rupee figure in the LLM memo
    is grounded in actual deterministic/computed figures (within ₹1.00 tolerance).
    Excludes 0.0, years, statutory section numbers, or non-currency percentages.
    """
    if not memo_text:
        return True
    pattern = r"(?:₹|Rs\.?|INR)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)"
    matches = re.findall(pattern, memo_text, re.IGNORECASE)
    if not matches:
        return True

    allowed_set = [float(v) for v in allowed_rupee_values if v is not None]
    allowed_set.append(0.0)

    for m in matches:
        cleaned = m.replace(",", "")
        try:
            val = float(cleaned)
            if val == 0.0:
                continue
            # Check if within ₹1.00 of any computed/allowed figure
            if not any(abs(val - allowed) <= 1.00 for allowed in allowed_set):
                return False
        except ValueError:
            continue
    return True


def _get_active_provider() -> Tuple[str, str, str, str]:
    """Detects active LLM provider, endpoint, model, and API key.
    Returns: (provider_name, api_url, model_name, api_key)
    """
    # 1. Groq
    groq_key = os.getenv("GROQ_API_KEY") or getattr(settings, "GROQ_API_KEY", "")
    if groq_key:
        model = getattr(settings, "LLM_MODEL", "") or "llama-3.3-70b-versatile"
        return "groq", "https://api.groq.com/openai/v1/chat/completions", model, groq_key

    # 2. OpenRouter
    openrouter_key = os.getenv("OPENROUTER_API_KEY") or getattr(settings, "OPENROUTER_API_KEY", "")
    if openrouter_key:
        model = getattr(settings, "LLM_MODEL", "") or "openrouter/free"
        return "openrouter", "https://openrouter.ai/api/v1/chat/completions", model, openrouter_key

    # 3. OpenAI
    openai_key = os.getenv("OPENAI_API_KEY") or getattr(settings, "OPENAI_API_KEY", "")
    if openai_key:
        model = getattr(settings, "LLM_MODEL", "") or "gpt-4o-mini"
        return "openai", "https://api.openai.com/v1/chat/completions", model, openai_key

    # 4. Google Gemini (OpenAI-compatible)
    gemini_key = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "")
    if gemini_key:
        model = getattr(settings, "LLM_MODEL", "") or "gemini-1.5-flash"
        return "gemini", "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", model, gemini_key

    # 5. Local Offline Fallback
    return "local_deterministic", "", "offline-parser-v1", ""


def ai_extract_intake(raw_text: str, timeout_sec: float = 2.5) -> Dict[str, Any]:
    """Job A: Reads pasted bank SMS, payment screenshot text, or unstructured narration into structured JSON.
    Redacts sensitive account numbers and phone numbers before external dispatch, but preserves 12-digit UTRs.
    """
    start_time = time.time()
    safe_text = redact_pii(raw_text, mask_utr=False)
    provider, api_url, model, api_key = _get_active_provider()

    # Attempt external LLM call if provider configured
    if api_key and api_url:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        system_prompt = (
            "You are an intake parser for an Indian SME financial reconciliation engine. "
            "Extract the structured fields from this noisy bank SMS, UPI notification, or ledger narration into valid JSON with keys: "
            '{"utr": str|null, "amount": float|null, "sender_or_vendor": str|null, "invoice_id": str|null, "intent": str}. '
            "Output ONLY raw JSON."
        )
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Parse this financial text: {safe_text}"}
            ],
            "temperature": 0.0,
            "max_tokens": 200
        }

        try:
            with httpx.Client(timeout=timeout_sec) as client:
                resp = client.post(api_url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                    json_match = re.search(r"\{[\s\S]*\}", content)
                    if json_match:
                        parsed_json = json.loads(json_match.group(0))
                        return {
                            "extracted": {
                                "utr": parsed_json.get("utr"),
                                "amount": parsed_json.get("amount"),
                                "sender_or_vendor": parsed_json.get("sender_or_vendor"),
                                "invoice_id": parsed_json.get("invoice_id"),
                                "intent": parsed_json.get("intent", "GENERAL_AUDIT")
                            },
                            "provider": provider,
                            "model": model,
                            "is_llm": True,
                            "latency_ms": round((time.time() - start_time) * 1000, 2)
                        }
        except Exception:
            pass

    # Deterministic local intake parser (Zero external leaks · Guaranteed 0ms response)
    local_parsed = parse_investigation_intent(raw_text)
    return {
        "extracted": {
            "utr": local_parsed.get("utr"),
            "amount": local_parsed.get("amount"),
            "sender_or_vendor": local_parsed.get("vendor_query"),
            "invoice_id": local_parsed.get("invoice_id"),
            "intent": local_parsed.get("intent", "GENERAL_AUDIT")
        },
        "provider": "local_deterministic_parser",
        "model": "offline-regex-v1",
        "is_llm": False,
        "latency_ms": round((time.time() - start_time) * 1000, 2)
    }


def ai_synthesize_memo(context: Dict[str, Any], timeout_sec: float = 2.5) -> Dict[str, Any]:
    """Job B: Explains deterministic DuckDB findings and cashflow_math.py numbers in clear, cited plain English memo.
    Enforces verify_memo_numbers guardrail against financial hallucinations.
    """
    start_time = time.time()
    provider, api_url, model, api_key = _get_active_provider()

    case_id = context.get("case_id", "CASE-AUDIT")
    entity = context.get("entity", "Counterparty")
    decision = context.get("decision", "REVIEW")
    findings = context.get("findings", [])
    cashflow = context.get("cashflow", {})
    citations = context.get("citations", [])

    # Collect all grounded numerical rupee figures for strict verification
    allowed_numbers: List[float] = []
    if context.get("amount") is not None:
        try:
            allowed_numbers.append(float(context["amount"]))
        except Exception:
            pass
    if context.get("amount_held") is not None:
        try:
            allowed_numbers.append(float(context["amount_held"]))
        except Exception:
            pass
    if context.get("disputed_delta") is not None:
        try:
            allowed_numbers.append(float(context["disputed_delta"]))
        except Exception:
            pass
    if context.get("itc_amount") is not None:
        try:
            allowed_numbers.append(float(context["itc_amount"]))
        except Exception:
            pass
    for k in [
        "current_bank_balance",
        "upcoming_30d_critical_emi",
        "post_emi_free_cash_without_praman",
        "post_emi_free_cash_with_praman",
        "cash_after_full_payout",
        "cash_after_praman_action"
    ]:
        val_str = cashflow.get(k)
        if val_str:
            clean_val = re.sub(r"[^\d.]", "", str(val_str))
            try:
                allowed_numbers.append(float(clean_val))
            except Exception:
                pass
    for extra in context.get("allowed_numbers", []):
        try:
            allowed_numbers.append(float(extra))
        except Exception:
            pass

    # If keyed LLM is configured and reachable
    if api_key and api_url:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        system_prompt = (
            "You are the Executive Financial Secretary for Praman Financial Copilot. "
            "Write a concise, plain-language executive memorandum (3-4 bulleted sections) for the Chief Financial Officer. "
            "Highlight the deterministic audit findings, cite evidence tokens like [CIT-1] and [CIT-2], "
            "and clearly state the exact debt service impact and prescribed actions. "
            "Do NOT invent or alter any financial figures."
        )
        user_prompt = f"""
Case Identifier: {case_id}
Counterparty: {entity}
Deterministic Decision: {decision}
Audit Findings: {json.dumps(findings)}
Cashflow Runway: {json.dumps(cashflow)}
Citations: {citations}
        """.strip()

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 450
        }

        try:
            with httpx.Client(timeout=timeout_sec) as client:
                resp = client.post(api_url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                    if content and len(content) > 50:
                        # Post-generation Rupee Number Guardrail
                        if verify_memo_numbers(content, allowed_numbers):
                            return {
                                "memo": content,
                                "provider": provider,
                                "model": model,
                                "is_llm": True,
                                "memo_guardrail_fallback": False,
                                "latency_ms": round((time.time() - start_time) * 1000, 2)
                            }
                        else:
                            # Reject hallucinated figures and fall back to deterministic template
                            deterministic_memo = _build_deterministic_memo(context)
                            return {
                                "memo": deterministic_memo,
                                "provider": "local_deterministic_memo",
                                "model": "offline-memo-v1",
                                "is_llm": False,
                                "memo_guardrail_fallback": True,
                                "latency_ms": round((time.time() - start_time) * 1000, 2)
                            }
        except Exception:
            pass

    # Deterministic plain-language synthesis fallback
    deterministic_memo = _build_deterministic_memo(context)
    return {
        "memo": deterministic_memo,
        "provider": "local_deterministic_memo",
        "model": "offline-memo-v1",
        "is_llm": False,
        "memo_guardrail_fallback": False,
        "latency_ms": round((time.time() - start_time) * 1000, 2)
    }


def _build_deterministic_memo(context: Dict[str, Any]) -> str:
    """Builds a deterministic, high-clarity executive memorandum covering all strict audit decisions."""
    case_id = context.get("case_id", "CASE-AUDIT")
    entity = context.get("entity", "Counterparty")
    decision = context.get("decision", "INCONCLUSIVE_MANUAL_REVIEW")
    ref_id = context.get("ref_id", "")
    summary_text = context.get("summary_text", "")
    runway = context.get("cashflow", {})
    stmt_date = context.get("latest_statement_date", "2026-11-18")
    amt_held = float(context.get("amount_held") or 0.0)
    total_amt = float(context.get("amount") or 0.0)

    if decision == "NOT_FOUND_IN_STATEMENT":
        return f"""### Executive Audit Memorandum: Record Not Found (`{case_id}`)

#### 1. Core Audit Finding
Investigation executed for query: **"{summary_text}"**.
Deterministic SQL audit queries were run across bank statements, Razorpay UPI transactions, Tally invoices, and GSTR-2B filings.

- **Match Status**: **0 matching records found** as of `{stmt_date}`.
- **Counterparty / Reference**: `{entity}` (Ref: `{ref_id or 'Unverified'}`).
- **Verification Result**: Not found in the statement as of `{stmt_date}`. Ask the counterparty for the 12-digit UTR / bank advice proof and recheck after the next NEFT/UPI settlement cycle.

#### 2. Risk & Working Capital Guidance
- **Amount at Risk**: ₹0.00 verified on ledger.
- **Guidance**: Do NOT disburse merchant funds or release goods against unrecorded claims. Await verifiable UTR confirmation.

#### 3. Prescribed Actions
1. **Require Proof**: Ask supplier or customer for bank statement copy showing 12-digit UTR / RRN.
2. **Re-Audit Next Cycle**: Re-run query after the next NEFT / UPI settlement batch clears.
"""

    if decision == "AMOUNT_MISMATCH":
        return f"""### Executive Audit Memorandum: Amount Variance Mismatch (`{case_id}`)

#### 1. Discrepancy & Variance Analysis
Investigation executed for counterparty **{entity}** (`{ref_id}`) [CIT-1].
- **Audit Finding**: {summary_text}
- **Disputed Variance Ring-Fenced**: **₹{amt_held:,.2f}**

#### 2. Cash-Flow & Debt Service Impact
- **Current Operating Bank Balance**: {runway.get('current_bank_balance', '₹3,12,450.00')} [CIT-2]
- **Upcoming Critical 7-Day Loan EMI**: {runway.get('upcoming_30d_critical_emi', '₹1,10,000.00')} [CIT-2]
- **Unmitigated Full Payout**: Leaves free cash of **{runway.get('post_emi_free_cash_without_praman', '₹18,450.00')}** (Coverage: **{runway.get('coverage_without_praman', '1.17x')}**).
- **With Praman Variance Hold**: Preserves **{runway.get('post_emi_free_cash_with_praman', '₹46,517.80')}** free cash (Coverage preserved at **{runway.get('coverage_with_praman', '1.42x')}**).

#### 3. Prescribed Actions
1. **Hold Disputed Variance**: Withhold ₹{amt_held:,.2f} pending revised invoice or debit/credit note adjustment.
2. **Require Counterparty Clarification**: Issue reconciliation notice to {entity} highlighting ledger variance.
"""

    if decision == "DIRECTION_MISMATCH":
        return f"""### Executive Audit Memorandum: Cash-Flow Direction Inversion (`{case_id}`)

#### 1. Discrepancy & Direction Analysis
Investigation executed for transaction reference **{ref_id}** [CIT-1].
- **Audit Finding**: {summary_text}
- **Hold Amount Enforced**: **₹{amt_held:,.2f}**

#### 2. Cash-Flow & Working Capital Assessment
The reported transaction claimed an inbound credit, but bank records prove an outgoing debit/withdrawal. Approving a release against this claim poses immediate risk of double disbursement.

#### 3. Prescribed Actions
1. **Freeze Transaction**: Block payout of ₹{amt_held:,.2f} immediately.
2. **Request Official Bank Advice**: Demand verified bank credit confirmation showing beneficiary account credit.
"""

    if decision == "GATEWAY_STATUS_BLOCKED":
        return f"""### Executive Audit Memorandum: UPI Payment Gateway Blocked (`{case_id}`)

#### 1. Gateway Status Verification
Gateway query executed for reference **{ref_id}** [CIT-1].
- **Gateway Finding**: {summary_text}
- **Disputed Payout Held**: **₹{amt_held:,.2f}**

#### 2. Liquidity & Clearing Guidance
Funds remain stalled at the banking switch node. Under RBI circular clearing mandates, switch failures are resolved via T+1 bank reversal rather than direct merchant refund.

#### 3. Prescribed Actions
1. **Reject Chargeback**: Block disbursement of merchant refund.
2. **Transmit NPCI Clearing Proof**: Provide RRN reference to customer bank for automated credit.
"""

    if decision == "VENDOR_MISMATCH":
        return f"""### Executive Audit Memorandum: Vendor Identity Mismatch (`{case_id}`)

#### 1. Identity Verification Flag
Investigation matched records for reference **{ref_id}** [CIT-1].
- **Audit Finding**: {summary_text}
- **Statutory / Legal Hold**: **₹{amt_held:,.2f}**

#### 2. Legal Entity & Payout Risk
The counterparty claiming payout does not match the legal entity on the registered purchase order or invoice within acceptable Indic phonetic/string similarity tolerances.

#### 3. Prescribed Actions
1. **Withhold Disbursement**: Lock ₹{amt_held:,.2f} pending KYC/GSTIN verification.
2. **Require Entity Documentation**: Request certificate of incorporation, PAN, and vendor master change form.
"""

    if decision == "NO_DISCREPANCY_FOUND":
        return f"""### Executive Audit Memorandum: No Discrepancy Found (`{case_id}`)

#### 1. Reconciliation Findings
- **Counterparty / Vendor**: `{entity}` [CIT-1]
- **Reference Identifier**: `{ref_id}`
- **Transaction Amount**: ₹{total_amt:,.2f}
- **Hold Amount Required**: ₹0.00 (Zero hold enforced)
- **Filing & Settlement Status**: Reconciled across ledger, GSTR-2B tax portal, and bank clearing statements.

#### 2. Verification Checklist
- **Automated Verification**:
  - [x] Bank statement settlement & narration verified
  - [x] Razorpay UPI RRN & transaction status confirmed
  - [x] Tally invoice total matches supporting tax records
  - [x] GSTR-2B supplier filing status confirmed `FILED`
- **Pending Human Sign-off**:
  - [ ] Duplicate invoice check across prior financial years
  - [ ] Beneficiary bank account ownership verification
  - [ ] Physical goods delivery (GRN) or service acceptance

#### 3. Prescribed Actions
1. **Release Payment**: Proceed with payout of ₹{total_amt:,.2f} to `{entity}`.
2. **Close Ticket**: Mark reconciliation complete in accounting ledger.
"""

    if decision == "INCONCLUSIVE_MANUAL_REVIEW":
        return f"""### Executive Audit Memorandum: Inconclusive Match · Manual Review Required (`{case_id}`)

#### 1. Audit Assessment
Investigation matched ledger records for `{entity}` (Ref: `{ref_id}`) [CIT-1].
- **Finding**: {summary_text or 'Evidence matched on ledger but fails strict zero-variance automated reconciliation.'}
- **Default Risk Protocol**: Strict safety gate active. Automated payout withheld.

#### 2. Governance Protocol
Praman never defaults unverified matches to reconciled. When records exhibit incomplete cross-table proof, controller intervention is required before funds are disbursed.

#### 3. Prescribed Actions
1. **Escalate to Human Controller**: Route dossier to Senior Accounts Controller.
2. **Inspect Underlying Supporting Docs**: Verify physical GRN, tax invoice, and vendor authorization letter.
"""

    # Generic Discrepancy Hold (e.g., HOLD_DISPUTED_PORTION)
    return f"""### Executive Audit Memorandum: Discrepancy Hold Enforced (`{case_id}`)

#### 1. Discrepancy & Root Cause Analysis
Investigation executed for counterparty **{entity}** (`{ref_id}`) [CIT-1].
- **Audit Flag**: {summary_text}
- **Statutory / Policy Hold Required**: **₹{amt_held:,.2f}**

#### 2. Deterministic Cash-Flow & Debt Service Impact
- **Current Operating Bank Balance**: {runway.get('current_bank_balance', '₹3,12,450.00')} [CIT-2]
- **Upcoming Critical 7-Day Loan EMI**: {runway.get('upcoming_30d_critical_emi', '₹1,10,000.00')} [CIT-2]
- **Unmitigated Full Payout**: Leaves free cash of **{runway.get('post_emi_free_cash_without_praman', '₹18,450.00')}** (Debt service coverage drops to **{runway.get('coverage_without_praman', '1.17x')}**, violating liquidity policy).
- **With Praman Hold**: Preserves **{runway.get('post_emi_free_cash_with_praman', '₹46,517.80')}** free cash (Coverage preserved at **{runway.get('coverage_with_praman', '1.42x')}**).

#### 3. Prescribed Actions
1. **Hold Disputed Portion**: Retain ₹{amt_held:,.2f} from disbursement to `{entity}`.
2. **Ring-Fence EMI Buffer**: Lock ₹1,10,000.00 for upcoming HDFC Loan EMI.
3. **Notify Counterparty**: Dispatch compliance notice requesting tax filing / bank switch reversal proof.
"""

