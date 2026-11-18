"""Unit and integration tests for the Praman AI Investigator Engine."""
import pytest
from praman_api.services.cashflow_math import compute_runway_impact, format_inr
from praman_api.services.citations import CitationTracker
from praman_api.agent.tools import verify_ifsc_live, calculate_emi_runway
from praman_api.agent.loop import run_investigation_sync
from praman_api.agent.llm_planner import redact_pii, parse_investigation_intent


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
    """Verify that fake UTR 999999999999 yields NOT_FOUND_IN_LEDGER with 0 citations."""
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
    assert vdata["decision"] == "NOT_FOUND_IN_LEDGER"
    assert "0 matching records found" in vdata["markdown_brief"]

    # Verify zero citations registered
    findings = [e for e in events if e.get("type") == "finding"]
    assert len(findings) == 0


def test_investigation_stream_custom_case_verified_safe_to_pay():
    """Verify that clean filed invoice yields VERIFIED_SAFE_TO_PAY with zero hold."""
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
    assert vdata["decision"] == "VERIFIED_SAFE_TO_PAY"
    assert "[CIT-1]" in vdata["markdown_brief"]
    assert "₹0.00" in vdata["markdown_brief"]
