"""Integration tests for Praman FastAPI Backend using TestClient."""
import pytest
from fastapi.testclient import TestClient
from praman_api.main import app

client = TestClient(app)


def test_api_health():
    """Verify GET /api/health returns 10,000+ rows, table counts, and registered UDFs."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "OPERATIONAL"
    assert data["total_rows"] >= 10000
    assert "bank_statement" in data["table_counts"]
    assert "tally_invoices" in data["table_counts"]
    assert "razorpay_upi" in data["table_counts"]
    assert data["table_counts"]["bank_statement"] == 4000
    assert data["table_counts"]["razorpay_upi"] == 2500
    assert data["table_counts"]["tally_invoices"] == 1800
    assert data["table_counts"]["gstr2b_tax"] == 1700
    assert data["table_counts"]["cashflow_commitments"] == 25
    assert data["table_counts"]["company_policies"] == 15
    assert "extract_utr" in data["registered_udfs"]
    assert "jw_sim" in data["registered_udfs"]
    assert "norm_indic_vendor" in data["registered_udfs"]
    assert "validate_gstin_checksum" in data["registered_udfs"]


def test_list_cases():
    """Verify GET /api/cases lists all canonical scenarios with risk amounts."""
    resp = client.get("/api/cases")
    assert resp.status_code == 200
    cases = resp.json()
    assert len(cases) >= 3
    case_ids = [c["case_id"] for c in cases]
    assert "CASE-GST-104" in case_ids
    assert "CASE-UPI-209" in case_ids
    assert "CASE-SLA-302" in case_ids

    # Verify CASE-GST-104 metadata
    gst_case = next(c for c in cases if c["case_id"] == "CASE-GST-104")
    assert gst_case["amount_at_risk"] == 184000.00
    assert gst_case["category"] == "GST_ITC_LEAKAGE"


def test_trigger_case():
    """Verify POST /api/cases/trigger/{scenario_id} resets and triggers the case."""
    resp = client.post("/api/cases/trigger/CASE-GST-104")
    assert resp.status_code == 200
    data = resp.json()
    assert data["case_id"] == "CASE-GST-104"
    assert data["status"] == "INVESTIGATING"
    assert "initialized" in data["message"]


def test_stream_investigation():
    """Verify GET /api/cases/{case_id}/stream yields real-time SSE events."""
    resp = client.get("/api/cases/CASE-GST-104/stream")
    assert resp.status_code == 200
    assert "text/event-stream" in resp.headers["content-type"]
    content = resp.text

    # Verify essential SSE event types
    assert "event: trigger_received" in content
    assert "event: sql_attempt" in content
    assert "event: ifsc_verified" in content
    assert "event: finding_recorded" in content
    assert "event: runway_calculated" in content
    assert "event: brief_completed" in content

    # Verify exact financial data inside stream
    assert "184000.0" in content or "184,000.00" in content
    assert "KVBL0001245" in content
    assert "HOLD_GST_PORTION" in content


def test_get_citation_detail():
    """Verify GET /api/citations/{case_id}/{citation_key} returns exact row and context."""
    # First trigger the stream so citations are populated
    client.get("/api/cases/CASE-GST-104/stream")

    resp = client.get("/api/citations/CASE-GST-104/CIT-1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["citation_key"] == "CIT-1"
    assert data["source_table"] == "tally_invoices"
    assert data["target_row"]["invoice_id"] == "INV-2026-104"
    assert data["target_row"]["vendor_name"] == "Sri Balaji Enterprises"
    assert data["target_row"]["total_amount"] == 184000.00
    assert len(data["context_rows"]) > 0
    assert data["live_ifsc"]["BANK"] == "Karur Vysya Bank"


def test_approve_case_action():
    """Verify POST /api/cases/{case_id}/approve executes full approval pipeline."""
    payload = {"notes": "Approved by Chief Risk Officer"}
    resp = client.post("/api/cases/CASE-GST-104/approve", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["case_id"] == "CASE-GST-104"
    assert data["status"] == "APPROVED"
    assert "IDEMP-PRAMAN" in data["idempotency_key"]
    assert "EXT-DISP" in data["external_ref_id"]

    # Verify live routing headers
    headers = data["routing_headers"]
    assert headers["X-Praman-Bank-Name"] == "Karur Vysya Bank"
    assert headers["X-Praman-IFSC"] == "KVBL0001245"
    assert headers["X-Praman-RTGS-Capable"] == "TRUE"

    # Verify rendered HTML vendor notice
    html = data["vendor_notice_html"]
    assert "Sri Balaji Enterprises" in html
    assert "STATUTORY GST HOLD APPLIED" in html
    assert "28,067.80" in html
    assert "Section 16(2)(aa)" in html

    # Verify DuckDB update and audit log
    db_res = data["db_update_result"]
    assert db_res["target_table"] == "tally_invoices"
    assert db_res["rows_affected"] == 1
    assert db_res["audit_logged"] is True

    # Verify case state now reflects APPROVED
    case_resp = client.get("/api/cases/CASE-GST-104")
    assert case_resp.json()["status"] == "APPROVED"


def test_create_custom_case_and_stream():
    """Verify POST /api/cases/custom creates an unscripted case and streams AI-planned SSE events."""
    payload = {
        "query": "Investigate unfiled GST credit and bank reconciliation for invoice INV-2026-104",
        "raw_narration": "NEFT-DR-KVBL0001245-SRI BALJI ENT-UPI/632819045112-SETTLEMENT"
    }
    resp = client.post("/api/cases/custom", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "CASE-CUSTOM-" in data["case_id"]
    assert data["status"] == "INVESTIGATING"
    assert "/api/cases/" in data["stream_url"]

    # Stream the custom investigation
    stream_resp = client.get(data["stream_url"])
    assert stream_resp.status_code == 200
    assert "text/event-stream" in stream_resp.headers["content-type"]
    stream_content = stream_resp.text
    assert "event: trigger_received" in stream_content
    assert "event: agent_thought" in stream_content
    assert "event: sql_attempt" in stream_content
    assert "event: finding_recorded" in stream_content
    assert "event: brief_completed" in stream_content


def test_narration_tester_tool():
    """Verify POST /api/tools/test-narration extracts UTR and ranks fuzzy candidates across 10,040 rows."""
    payload = {"raw_text": "NEFT-DR-KVBL0001245-SRI BALJI ENT-UPI/632819045112-SETTLEMENT"}
    resp = client.post("/api/tools/test-narration", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["extracted_utr"] == "632819045112"
    assert "BALJI ENTERPRISES" in data["normalized_vendor"]
    assert len(data["top_fuzzy_candidates"]) == 5
    # Verify top candidate is Sri Balaji Enterprises with high similarity
    top_cand = data["top_fuzzy_candidates"][0]
    assert "Balaji" in top_cand["vendor_name"]
    assert top_cand["sim_score"] >= 0.85
    assert data["latency_ms"] >= 0
    assert isinstance(data["matched_bank_rows"], list)

