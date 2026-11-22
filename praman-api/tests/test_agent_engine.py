"""Unit and integration tests for the Praman AI Investigator Engine."""
import pytest
from praman_api.services.cashflow_math import compute_runway_impact, format_inr
from praman_api.services.citations import CitationTracker
from praman_api.agent.tools import verify_ifsc_live, calculate_emi_runway
from praman_api.agent.loop import run_investigation_sync
from praman_api.agent.llm_planner import redact_pii, parse_investigation_intent, _build_deterministic_sql
from praman_api.services.llm_service import ai_extract_intake, ai_synthesize_memo, verify_memo_numbers
from praman_api.engine.duckdb_plane import db_plane


def test_ai_extract_intake():
    """Verify Job 1: AI unstructured intake parser with PII redaction and entity extraction."""
    raw_sms = "Dear SBI User, your A/c XX4892 debited by Rs 18,400.00 on 18-Nov-26 transfer to SRI BALAJI ENT UPI Ref 632819045112"
    res = ai_extract_intake(raw_sms)
    assert res["extracted"]["utr"] == "632819045112"
    assert "BALAJI" in res["extracted"]["sender_or_vendor"]
    assert res["provider"] in ("local_deterministic_parser", "groq", "openrouter", "openai", "gemini")


def test_ai_synthesize_memo():
    """Verify Job 2: AI plain-language executive memorandum synthesis."""
    ctx = {
        "case_id": "CASE-TEST-001",
        "entity": "Sri Balaji Enterprises",
        "decision": "NO_DISCREPANCY_FOUND",
        "ref_id": "INV-2026-0037",
        "amount": 54131.69,
        "summary_text": "Verify clean invoice"
    }
    res = ai_synthesize_memo(ctx)
    assert "Executive Audit Memorandum" in res["memo"]
    assert "Verification Checklist" in res["memo"]
    assert res["provider"] in ("local_deterministic_memo", "groq", "openrouter", "openai", "gemini")


def test_pii_redaction():
    """Verify that UTRs, VPAs, mobile numbers, and bank account numbers are redacted."""
    raw = "Vendor Balaji paid via UPI 632819045112 by user.name99@okhdfcbank mob 9876543210 acc 1234567890123"
    redacted = redact_pii(raw)
    assert "632819045112" not in redacted
    assert "<UTR_TOKEN>" in redacted
    assert "user.name99@okhdfcbank" not in redacted
    assert "<VPA_TOKEN>" in redacted
    assert "9876543210" not in redacted
    assert "<PHONE_TOKEN>" in redacted
    assert "1234567890123" not in redacted
    assert "<ACCOUNT_TOKEN>" in redacted


def test_intent_parsing():
    """Verify local deterministic entity extraction and intent classification."""
    p1 = parse_investigation_intent("Check invoice INV-2026-104 for Sri Balaji Enterprises")
    assert p1["intent"] == "INVOICE_DISCREPANCY"
    assert p1["invoice_id"] == "INV-2026-104"
    assert "BALAJI" in p1["vendor_query"]

    p2 = parse_investigation_intent("Investigate double debit for UPI RRN 432910485711")
    assert p2["intent"] == "UPI_CHARGEBACK"
    assert p2["utr"] == "432910485711"

    p3 = parse_investigation_intent("Verify GSTIN 33AABCS1429B1Z2")
    assert p3["intent"] == "GSTIN_VERIFICATION"
    assert p3["gstin"] == "33AABCS1429B1Z2"


def test_cashflow_math_case_gst_104():
    """Verify exact financial mathematics for CASE-GST-104 with natural balance ₹3,12,450.00."""
    current_balance = 312450.00
    payout = 184000.00
    emi = 110000.00

    # Scenario 1: Partial hold of unfiled GST portion (₹28,067.80)
    gst_hold = 28067.80
    r1 = compute_runway_impact(
        current_bank_balance=current_balance,
        upcoming_30d_critical_emi=emi,
        disputed_or_payout_amount=payout,
        recommended_hold_or_recovery=gst_hold
    )
    # Check unmitigated full payout figures
    assert r1["cash_after_full_payout"] == 128450.00
    assert r1["post_emi_free_cash_without_praman"] == 18450.00
    assert r1["emi_coverage_ratio_without_praman"] == 1.17

    # Check mitigated figures with GST hold
    assert r1["cash_after_praman_action"] == 156517.80
    assert r1["post_emi_free_cash_with_praman"] == 46517.80
    assert r1["emi_coverage_ratio_with_praman"] == 1.42
    assert r1["buffer_preservation"] == 28067.80

    # Scenario 2: Conservative full hold pending GSTR-2B filing (₹184,000.00)
    full_hold = 184000.00
    r2 = compute_runway_impact(
        current_bank_balance=current_balance,
        upcoming_30d_critical_emi=emi,
        disputed_or_payout_amount=payout,
        recommended_hold_or_recovery=full_hold
    )
    assert r2["cash_after_praman_action"] == 312450.00
    assert r2["post_emi_free_cash_with_praman"] == 202450.00
    assert r2["emi_coverage_ratio_with_praman"] == 2.84
    assert r2["buffer_preservation"] == 184000.00


def test_format_inr():
    assert format_inr(184000.00) == "₹1,84,000.00"
    assert format_inr(28067.80) == "₹28,067.80"
    assert format_inr(312450.00) == "₹3,12,450.00"
    assert format_inr(16000.00) == "₹16,000.00"


def test_citation_tracker():
    tracker = CitationTracker()
    cit = tracker.register(
        source_table="tally_invoices",
        row_id="INV-2026-104",
        field="total_amount",
        value=184000.00,
        note="Vendor Invoice Amount"
    )
    assert cit.citation_id == "CIT-1"
    assert cit.source_table == "tally_invoices"
    assert tracker.get("CIT-1") is not None
    assert len(tracker.all()) == 1


def test_verify_ifsc_live_fallback():
    res = verify_ifsc_live("KVBL0001245")
    assert res["valid"] is True
    assert res["BANK"] == "Karur Vysya Bank"
    assert res["IFSC"] == "KVBL0001245"


def test_investigation_stream_case_gst_104():
    """Verify full end-to-end investigation stream for CASE-GST-104."""
    events = list(run_investigation_sync("CASE-GST-104"))

    # 1. Verify thought event emitted
    thoughts = [e for e in events if e.get("type") == "thought"]
    assert len(thoughts) >= 1

    # 2. Verify deterministic guardrail retry event emitted
    retries = [e for e in events if e.get("type") == "sql_retry"]
    assert len(retries) >= 1
    assert retries[0]["attempt"] == 1
    assert "CARTESIAN FANOUT DETECTED" in retries[0]["error"]

    # 3. Verify findings registered
    findings = [e for e in events if e.get("type") == "finding"]
    assert len(findings) >= 4
    citation_ids = [f["data"]["citation_id"] for f in findings]
    assert "CIT-1" in citation_ids
    assert "CIT-2" in citation_ids
    assert "CIT-3" in citation_ids
    assert "CIT-4" in citation_ids

    # 4. Verify final verdict payload
    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    verdict_data = verdicts[0]["data"]
    assert verdict_data["decision"] == "HOLD_GST_PORTION"
    brief = verdict_data["markdown_brief"]
    # Verify embedded citation tokens
    assert "[CIT-1]" in brief
    assert "[CIT-2]" in brief
    assert "[CIT-3]" in brief
    assert "[CIT-4]" in brief
    # Verify exact financial figures in brief
    assert "₹1,84,000.00" in brief
    assert "₹28,067.80" in brief
    assert "₹1,28,450.00" in brief
    assert "₹1,56,517.80" in brief
    assert "1.17x" in brief
    assert "1.42x" in brief


def test_investigation_stream_case_upi_209():
    """Verify investigation stream for CASE-UPI-209."""
    events = list(run_investigation_sync("CASE-UPI-209"))

    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    assert verdicts[0]["data"]["decision"] == "REJECT_CHARGEBACK_SWITCH_FAIL"
    brief = verdicts[0]["data"]["markdown_brief"]
    assert "[CIT-1]" in brief
    assert "[CIT-2]" in brief
    assert "[CIT-3]" in brief
    assert "failed_at_switch" in brief
    assert "432910485711" in brief


def test_investigation_stream_case_sla_302():
    """Verify investigation stream for CASE-SLA-302."""
    events = list(run_investigation_sync("CASE-SLA-302"))

    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    assert verdicts[0]["data"]["decision"] == "APPROVE_NET_SLA_CREDIT"
    brief = verdicts[0]["data"]["markdown_brief"]
    assert "₹5,600.00" in brief
    assert "₹78,400.00" in brief
    assert "[CIT-1]" in brief
    assert "[CIT-2]" in brief


def test_investigation_stream_custom_case_not_found():
    """Verify that fake UTR 999999999999 yields NOT_FOUND_IN_STATEMENT with 0 citations."""
    case_data = {
        "case_id": "CASE-CUSTOM-FAKE",
        "description": "Investigate fake payment proof with UTR 999999999999",
        "scenario_metadata": {
            "custom_query": "Investigate fake payment proof with UTR 999999999999",
            "raw_narration": "UPI-DR-999999999999-FAKE CLAIM"
        }
    }
    events = list(run_investigation_sync("CASE-CUSTOM-FAKE", case_data=case_data))

    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    vdata = verdicts[0]["data"]
    assert vdata["decision"] == "NOT_FOUND_IN_STATEMENT"
    assert "Not found in the statement as of" in vdata["markdown_brief"]

    # Verify zero citations registered
    findings = [e for e in events if e.get("type") == "finding"]
    assert len(findings) == 0


def test_investigation_stream_custom_case_verified_safe_to_pay():
    """Verify that clean filed invoice yields NO_DISCREPANCY_FOUND with zero hold and checklist."""
    case_data = {
        "case_id": "CASE-CUSTOM-CLEAN",
        "description": "Verify supplier invoice INV-2026-0037 Ganpati Trading Co",
        "scenario_metadata": {
            "custom_query": "Verify invoice INV-2026-0037 for Ganpati Trading Co",
            "raw_narration": None
        }
    }
    events = list(run_investigation_sync("CASE-CUSTOM-CLEAN", case_data=case_data))

    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    vdata = verdicts[0]["data"]
    assert vdata["decision"] == "NO_DISCREPANCY_FOUND"
    assert "[CIT-1]" in vdata["markdown_brief"]
    assert "Verification Checklist" in vdata["markdown_brief"]
    assert "₹0.00" in vdata["markdown_brief"]


def test_amount_regex_precision():
    """Verify that amount parser extracts exact numbers without digit truncation or invoice confusion."""
    # Test "Rs 88452" -> 88452.0
    p1 = parse_investigation_intent("Transfer to Sri Balaji Rs 88452 on 18-Nov")
    assert p1["amount"] == 88452.0

    # Test "4500" -> 4500.0
    p2 = parse_investigation_intent("Dispute charge 4500 for vendor services")
    assert p2["amount"] == 4500.0

    # Test invoice ID "INV-2026-0006" is not extracted as amount
    p3 = parse_investigation_intent("Verify invoice INV-2026-0006")
    assert p3["invoice_id"] == "INV-2026-0006"
    assert p3["amount"] is None


def test_parameterized_sql_with_apostrophes():
    """Verify that DuckDB parameters handle single quotes safely without syntax errors or injection."""
    vendor_with_quote = "O'Brien Traders"
    sql, params = _build_deterministic_sql("Verify vendor record", norm_vendor=vendor_with_quote)
    assert "$1" in sql
    assert params == [vendor_with_quote]

    # Execute on DuckDB plane
    res = db_plane.execute_query(sql, params=params)
    assert "columns" in res
    assert isinstance(res["rows"], list)


def test_evidence_comparison_amount_mismatch():
    """Verify AMOUNT_MISMATCH verdict when claimed amount differs from ledger invoice amount."""
    case_data = {
        "case_id": "CASE-CUSTOM-AMT-DIFF",
        "scenario_type": "CUSTOM_INVESTIGATION",
        "description": "Investigate payment for Sri Balaji Ent Rs 18,400",
        "scenario_metadata": {
            "custom_query": "Investigate invoice INV-2026-104 for Sri Balaji Ent claimed Rs 18,400",
            "raw_narration": "Dear SBI User, your A/c XX4892 debited by Rs 18,400.00 on 18-Nov-26"
        }
    }
    events = list(run_investigation_sync("CASE-CUSTOM-AMT-DIFF", case_data=case_data))
    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    vdata = verdicts[0]["data"]
    assert vdata["decision"] == "AMOUNT_MISMATCH"
    assert "Amount Mismatch" in vdata["headline"]
    # Check that variance delta (184000 - 18400 = 165600) is held
    actions = vdata["actions"]
    assert any(act.get("variance_amount") == 165600.00 for act in actions)


def test_evidence_comparison_direction_mismatch():
    """Verify DIRECTION_MISMATCH when claim says inbound credit but bank statement is an outbound debit."""
    case_data = {
        "case_id": "CASE-CUSTOM-DIR-DIFF",
        "scenario_type": "CUSTOM_INVESTIGATION",
        "description": "Customer customer paid us deposit received for INV-2026-104",
        "scenario_metadata": {
            "custom_query": "Customer customer paid us deposit received for INV-2026-104",
            "raw_narration": "Customer claims customer paid us deposit received for INV-2026-104"
        }
    }
    events = list(run_investigation_sync("CASE-CUSTOM-DIR-DIFF", case_data=case_data))
    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    vdata = verdicts[0]["data"]
    assert vdata["decision"] == "DIRECTION_MISMATCH"


def test_evidence_comparison_gateway_blocked():
    """Verify GATEWAY_STATUS_BLOCKED when UPI transaction is failed_at_switch."""
    case_data = {
        "case_id": "CASE-CUSTOM-UPI-FAIL",
        "scenario_type": "CUSTOM_INVESTIGATION",
        "description": "Check UPI transaction 432910485711",
        "scenario_metadata": {
            "custom_query": "Check UPI RRN 432910485711",
            "raw_narration": "UPI RRN 432910485711"
        }
    }
    events = list(run_investigation_sync("CASE-CUSTOM-UPI-FAIL", case_data=case_data))
    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    vdata = verdicts[0]["data"]
    assert vdata["decision"] == "GATEWAY_STATUS_BLOCKED"


def test_scenario_type_routing_no_substring():
    """Verify that case_id containing '104' or 'UPI' routes by scenario_type, not substring."""
    case_data = {
        "case_id": "CASE-104-CUSTOM-TEST",
        "scenario_type": "CUSTOM_INVESTIGATION",
        "description": "Check fake reference 999999999999",
        "scenario_metadata": {
            "custom_query": "Check fake reference 999999999999"
        }
    }
    events = list(run_investigation_sync("CASE-104-CUSTOM-TEST", case_data=case_data))
    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    # Must NOT route to CASE-GST-104; must route to CUSTOM_INVESTIGATION
    assert verdicts[0]["data"]["decision"] == "NOT_FOUND_IN_STATEMENT"


def test_verify_memo_numbers_guardrail():
    """Verify that verify_memo_numbers strictly rejects hallucinated rupee numbers."""
    allowed = [184000.00, 28067.80, 110000.00]

    # Valid memo with allowed numbers
    valid_memo = "The invoice is for ₹1,84,000.00 with statutory IGST of ₹28,067.80. EMI buffer is ₹1,10,000.00."
    assert verify_memo_numbers(valid_memo, allowed) is True

    # Hallucinated memo with invented number
    fake_memo = "The approved payout is ₹99,999.00 with an unverified credit of ₹50,000.00."
    assert verify_memo_numbers(fake_memo, allowed) is False


def test_universal_vendor_gate_mismatch():
    """Verify that universal vendor gate blocks payment when claimed vendor differs from invoice owner."""
    case_data = {
        "case_id": "CASE-CUSTOM-VENDOR-MISMATCH",
        "scenario_type": "CUSTOM_INVESTIGATION",
        "description": "Release payment for INV-2026-104 to Totally Different Traders",
        "scenario_metadata": {
            "custom_query": "Release payment for INV-2026-104 to Totally Different Traders",
            "raw_narration": "Payment request for INV-2026-104 payee Totally Different Traders"
        }
    }
    events = list(run_investigation_sync("CASE-CUSTOM-VENDOR-MISMATCH", case_data=case_data))
    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    vdata = verdicts[0]["data"]
    assert vdata["decision"] == "VENDOR_MISMATCH"
    assert "Vendor Identity Mismatch" in vdata["headline"]
    assert any(act.get("action") == "BLOCK_DISBURSEMENT_IDENTITY" for act in vdata["actions"])


def test_utr_amount_mismatch_sample_2_sms():
    """Verify Sample 2 SMS matching BNK-3801: claimed ₹18,400 vs ledger debit ₹88,452.76."""
    case_data = {
        "case_id": "CASE-CUSTOM-SAMPLE2-SMS",
        "scenario_type": "CUSTOM_INVESTIGATION",
        "description": "Investigate payment for Sri Balaji Ent Rs 18,400",
        "scenario_metadata": {
            "custom_query": "Investigate payment for Sri Balaji Ent Rs 18,400",
            "raw_narration": "Dear SBI User, your A/c XX4892 debited by Rs 18,400.00 on 18-Nov-26 transfer to SRI BALAJI ENT UPI Ref 632819045112"
        }
    }
    events = list(run_investigation_sync("CASE-CUSTOM-SAMPLE2-SMS", case_data=case_data))
    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    vdata = verdicts[0]["data"]
    assert vdata["decision"] == "AMOUNT_MISMATCH"
    # Claimed 18400 vs ledger debit 88452.76 -> delta 70052.76 held
    actions = vdata["actions"]
    assert any(abs(act.get("variance_amount", 0) - 70052.76) < 0.1 for act in actions)


def test_utr_direction_mismatch_inbound_vs_debit():
    """Verify DIRECTION_MISMATCH when claim says inbound customer payment but UTR is a bank debit."""
    case_data = {
        "case_id": "CASE-CUSTOM-DIR-UTR",
        "scenario_type": "CUSTOM_INVESTIGATION",
        "description": "Customer claims customer paid us deposit received for UTR 632819045112",
        "scenario_metadata": {
            "custom_query": "Customer claims customer paid us deposit received for UTR 632819045112",
            "raw_narration": "Credit received from customer for order ref UTR 632819045112"
        }
    }
    events = list(run_investigation_sync("CASE-CUSTOM-DIR-UTR", case_data=case_data))
    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    vdata = verdicts[0]["data"]
    assert vdata["decision"] == "DIRECTION_MISMATCH"
    assert "Direction Mismatch" in vdata["headline"]


def test_vendor_due_diligence_summary():
    """Verify VENDOR_RISK_SUMMARY read-only exposure report with zero payout actions."""
    case_data = {
        "case_id": "CASE-CUSTOM-VDD",
        "scenario_type": "CUSTOM_INVESTIGATION",
        "description": "Is Sri Balaji Enterprises safe to pay?",
        "scenario_metadata": {
            "custom_query": "Is Sri Balaji Enterprises safe to pay?"
        }
    }
    events = list(run_investigation_sync("CASE-CUSTOM-VDD", case_data=case_data))
    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    vdata = verdicts[0]["data"]
    assert vdata["decision"] == "VENDOR_RISK_SUMMARY"
    assert "Vendor Exposure Summary" in vdata["headline"]
    # Read-only inquiry must have NO payout buttons
    assert len(vdata["actions"]) == 0
    assert "Vendor Due Diligence Exposure Summary" in vdata["markdown_brief"]


def test_vendor_due_diligence_not_found():
    """Verify VENDOR_NOT_FOUND when vendor does not exist in master, offering KYC onboarding guidance."""
    case_data = {
        "case_id": "CASE-CUSTOM-VDD-NONE",
        "scenario_type": "CUSTOM_INVESTIGATION",
        "description": "Is Totally Different Traders safe to pay?",
        "scenario_metadata": {
            "custom_query": "Is Totally Different Traders safe to pay?"
        }
    }
    events = list(run_investigation_sync("CASE-CUSTOM-VDD-NONE", case_data=case_data))
    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    vdata = verdicts[0]["data"]
    assert vdata["decision"] == "VENDOR_NOT_FOUND"
    assert "Vendor Not Found" in vdata["headline"]
    assert len(vdata["actions"]) == 0
    assert "onboard vendor master before creating a purchase order" in vdata["markdown_brief"]


def test_nodal_batch_settlement_warning():
    """Verify NODAL_BATCH_SETTLEMENT when customer payment claim matches Razorpay batch payout."""
    case_data = {
        "case_id": "CASE-CUSTOM-NODAL",
        "scenario_type": "CUSTOM_INVESTIGATION",
        "description": "Customer customer paid us order payment Rs 1,500 with UTR 382407240552",
        "scenario_metadata": {
            "custom_query": "Customer customer paid us order payment Rs 1,500 with UTR 382407240552",
            "raw_narration": "Customer paid us Rs 1,500 for order with UTR 382407240552"
        }
    }
    events = list(run_investigation_sync("CASE-CUSTOM-NODAL", case_data=case_data))
    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    vdata = verdicts[0]["data"]
    assert vdata["decision"] == "NODAL_BATCH_SETTLEMENT"
    assert "Nodal Batch Settlement Alert" in vdata["headline"]
    assert "is a Razorpay nodal settlement batch" in vdata["markdown_brief"]


def test_customer_payment_mark_order_paid_cta():
    """Verify that customer payment claims recommend MARK_ORDER_PAID, never APPROVE_DISBURSEMENT."""
    case_data = {
        "case_id": "CASE-CUSTOM-CUST-PAID",
        "scenario_type": "CUSTOM_INVESTIGATION",
        "description": "Customer customer paid us for invoice INV-2026-0037",
        "scenario_metadata": {
            "custom_query": "Customer customer paid us for invoice INV-2026-0037",
            "raw_narration": "Inbound customer payment received for INV-2026-0037"
        }
    }
    events = list(run_investigation_sync("CASE-CUSTOM-CUST-PAID", case_data=case_data))
    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    vdata = verdicts[0]["data"]
    # Should recommend MARK_ORDER_PAID
    actions = vdata["actions"]
    action_types = [a.get("action") for a in actions]
    assert "APPROVE_DISBURSEMENT" not in action_types
    assert "MARK_ORDER_PAID" in action_types


def test_all_153_vendors_no_fanout_crash():
    """Verify all 153 unique vendors execute without Cartesian fanout or look-alike crashes."""
    vendors_res = db_plane.execute_query("SELECT DISTINCT vendor_name FROM tally_invoices ORDER BY vendor_name")
    unique_vendors = [row[0] for row in vendors_res["rows"] if row[0]]
    assert len(unique_vendors) == 153

    # Explicitly assert target look-alike vendor groups are present
    assert any("Venkateshwara" in v for v in unique_vendors)
    assert any("Delta" in v for v in unique_vendors)
    assert any("Radhe Shyam" in v for v in unique_vendors)

    for vendor in unique_vendors:
        sql, params = _build_deterministic_sql(f"Check vendor {vendor}")
        res = db_plane.execute_query(sql, params)
        assert res is not None
        assert res["row_count"] <= 25  # Capped by defensive LIMIT 25 and QUALIFY


def test_memo_checklist_parity():
    """Verify that memo checkmarks strictly reflect the dynamic verification_checklist object."""
    case_data = {
        "case_id": "CASE-MEMO-PARITY",
        "scenario_type": "CUSTOM_INVESTIGATION",
        "description": "Verify Ganpati Trading Co UTR 432910485799",
        "scenario_metadata": {
            "custom_query": "Verify Ganpati Trading Co UTR 432910485799",
            "raw_narration": "UPI/432910485799/041126123045/PAYTO GANPATI TRADING CO/HDFC/001928374829"
        }
    }
    events = list(run_investigation_sync("CASE-MEMO-PARITY", case_data=case_data))
    verdicts = [e for e in events if e.get("type") == "verdict"]
    assert len(verdicts) == 1
    vdata = verdicts[0]["data"]
    checklist = vdata.get("verification_checklist", {})
    brief = vdata.get("markdown_brief", "")

    # For each checklist item, verify its pass/fail status is accurately represented in the memo
    for item in checklist.get("checked", []):
        assert f"- [x] {item}" in brief
    for item in checklist.get("pending_human_signoff", []):
        assert f"- [ ] {item}" in brief


