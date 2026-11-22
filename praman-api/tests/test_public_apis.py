"""Tests for Praman Financial Copilot Public APIs and Zero-Key Deterministic Execution."""
import pytest
from praman_api.direct_client import client

from praman_api.main import app
from praman_api.adapters.public_apis import (
    verify_ifsc_live,
    verify_gst_state_pincode,
    fetch_live_usd_inr,
    check_vendor_email_breach,
)
from praman_api.agent.loop import run_investigation_sync
from praman_api.config import settings


def test_verify_ifsc_live():
    """Verifies that IFSC lookup returns live/cached bank routing details."""
    res = verify_ifsc_live("KVBL0001245")
    assert res["valid"] is True
    assert "Karur Vysya Bank" in res.get("BANK", "")
    assert res.get("RTGS") is True
    assert res.get("NEFT") is True

    # Test HDFC
    hdfc = verify_ifsc_live("HDFC0000240")
    assert hdfc["valid"] is True
    assert "HDFC" in hdfc.get("BANK", "")


def test_verify_gst_state_pincode():
    """Verifies that postal state is cross-checked against 2-digit GSTIN prefix."""
    # Tamil Nadu pincode (600053) against GSTIN starting with 33
    res_tn = verify_gst_state_pincode("600053", "33AABCS1429B1Z2")
    assert res_tn["state_match"] is True
    assert res_tn["gstin_state_code"] == "33"
    assert res_tn["expected_state"] == "TAMIL NADU"
    assert res_tn["status"] == "VERIFIED_MATCH"

    # Karnataka pincode (560001) against GSTIN starting with 29
    res_ka = verify_gst_state_pincode("560001", "29ABCDE1234F1Z5")
    assert res_ka["state_match"] is True
    assert res_ka["gstin_state_code"] == "29"
    assert res_ka["expected_state"] == "KARNATAKA"
    assert res_ka["status"] == "VERIFIED_MATCH"

    # Mismatch: Tamil Nadu pincode (600053) against Maharashtra GSTIN (27)
    res_mismatch = verify_gst_state_pincode("600053", "27AABCS1429B1Z2")
    assert res_mismatch["state_match"] is False
    assert res_mismatch["status"] == "DISCREPANCY_MISMATCH"


def test_fetch_live_usd_inr():
    """Verifies live USD/INR exchange rate retrieval."""
    res = fetch_live_usd_inr()
    assert res["base"] == "USD"
    assert res["target"] == "INR"
    assert isinstance(res["rate"], float)
    assert res["rate"] > 80.0  # Real or cached rate ~93.48


def test_check_vendor_email_breach():
    """Verifies vendor BEC audit returns structured safe/breach state."""
    res = check_vendor_email_breach("clean-vendor-xyz123@domain.in")
    assert res["email"] == "clean-vendor-xyz123@domain.in"
    assert res["status"] in ("SAFE", "BREACH_EXPOSURE_DETECTED")
    assert isinstance(res["breaches"], list)


def test_zero_env_investigation_trace():
    """Verifies that the entire investigation runs with ZERO API keys in .env
    and emits the self-healing SQL retry, public API enrichments, and cashflow math.
    """
    # Guarantee no key is required
    events = list(run_investigation_sync("CASE-GST-104"))
    assert len(events) >= 10

    event_types = [e.get("type") for e in events]
    assert "thought" in event_types
    assert "action" in event_types
    assert "sql_retry" in event_types  # Self-healing retry triggered on Cartesian loose threshold
    assert "observation" in event_types
    assert "finding" in event_types
    assert "verdict" in event_types

    # Verify sql_retry details
    retry_ev = [e for e in events if e.get("type") == "sql_retry"][0]
    assert retry_ev["attempt"] == 1
    assert "cartesian" in retry_ev["error"].lower()
    assert "jw_sim threshold to >= 0.92" in retry_ev["healing_strategy"]

    # Verify verdict payload
    verdict_ev = [e for e in events if e.get("type") == "verdict"][0]
    verdict_data = verdict_ev["data"]
    assert verdict_data["decision"] == "HOLD_GST_PORTION"
    assert len(verdict_data["citations"]) >= 4

    citation_ids = [c["citation_id"] for c in verdict_data["citations"]]
    assert "CIT-1" in citation_ids
    assert "CIT-2" in citation_ids
    assert "CIT-3" in citation_ids
    assert "CIT-4" in citation_ids
    assert "ifsc_live#KVBL0001245" in citation_ids
    assert "pincode_live#600053" in citation_ids


def test_live_public_api_citation_endpoint():
    """Verifies that citation endpoint resolves live public API citations."""
    # First trigger the investigation so citations are registered
    list(run_investigation_sync("CASE-GST-104"))

    # Test live IFSC citation lookup (both URL-encoded '%23' and anchor fallback)
    resp_ifsc = client.get("/api/citations/CASE-GST-104/ifsc_live%23KVBL0001245")
    assert resp_ifsc.status_code == 200
    data_ifsc = resp_ifsc.json()
    assert "ifsc_live" in data_ifsc["citation_key"].lower()
    assert data_ifsc["source_table"] == "razorpay_ifsc"
    assert data_ifsc["target_row"]["BANK"] == "Karur Vysya Bank"

    # Test live pincode citation lookup
    resp_pin = client.get("/api/citations/CASE-GST-104/pincode_live%23600053")
    assert resp_pin.status_code == 200
    data_pin = resp_pin.json()
    assert "pincode_live" in data_pin["citation_key"].lower()
    assert data_pin["source_table"] == "postal_pincode"
    assert data_pin["target_row"]["state_match"] is True
