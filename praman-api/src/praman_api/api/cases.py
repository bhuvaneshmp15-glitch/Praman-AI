"""Praman API - Cases Router.
Manages listing, triggering, and state transitions of reconciliation discrepancy cases.
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional

from praman_api.models import DiscrepancyCase, TriggerCaseResponse

router = APIRouter(prefix="/cases", tags=["cases"])

# Canonical In-Memory Case Repository with deterministic initial state
INITIAL_CASES: Dict[str, Dict[str, Any]] = {
    "CASE-GST-104": {
        "case_id": "CASE-GST-104",
        "title": "Sri Balaji Enterprises GSTIN ITC Leakage & Debt Service Buffer",
        "category": "GST_ITC_LEAKAGE",
        "severity": "CRITICAL",
        "status": "TRIGGERED",
        "amount_at_risk": 184000.00,
        "invoice_or_ref_id": "INV-2026-104",
        "description": "Tally invoice INV-2026-104 unfiled in GSTR-2B. 8 phonetic decoys in bank narrations. Upcoming ₹1,10,000.00 HDFC Business Loan EMI due in 7 days.",
        "scenario_metadata": {
            "vendor_name": "Sri Balaji Enterprises",
            "vendor_gstin": "33AABCS1429B1Z2",
            "vendor_ifsc": "KVBL0001245",
            "unfiled_gst_component": 28067.80,
            "upcoming_critical_emi": 110000.00,
            "emi_due_date": "2026-11-25"
        },
        "citations": [],
        "actions": []
    },
    "CASE-UPI-209": {
        "case_id": "CASE-UPI-209",
        "title": "Customer UPI Double-Debit Chargeback: Switch Failure vs Captured Credit",
        "category": "UPI_DOUBLE_DEBIT",
        "severity": "HIGH",
        "status": "TRIGGERED",
        "amount_at_risk": 14500.00,
        "invoice_or_ref_id": "pay_UPI209_FAIL",
        "description": "Customer reported ₹14,500 double debit. Gateway logs confirm UTR 432910485711 failed at bank switch, while UTR 432910485799 settled to merchant account under HDFC0000240.",
        "scenario_metadata": {
            "failed_utr": "432910485711",
            "captured_utr": "432910485799",
            "vendor_ifsc": "HDFC0000240",
            "customer_vpa": "rajesh.verma@okaxis"
        },
        "citations": [],
        "actions": []
    },
    "CASE-SLA-302": {
        "case_id": "CASE-SLA-302",
        "title": "CloudSphere Infrastructure B2B SLA Downtime Dispute",
        "category": "SLA_DOWNTIME_PENALTY",
        "severity": "HIGH",
        "status": "TRIGGERED",
        "amount_at_risk": 84000.00,
        "invoice_or_ref_id": "INV-2026-881",
        "description": "Invoice INV-2026-881 pending. Company policy POL-SLA-01 (SEC-4.2) mandates pro-rata deduction of ₹5,600.00 via debit note rather than full refund.",
        "scenario_metadata": {
            "vendor_name": "CloudSphere Infrastructure Solutions Pvt Ltd",
            "policy_id": "POL-SLA-01",
            "section_ref": "SEC-4.2",
            "sla_credit_amount": 5600.00,
            "approved_net_payout": 78400.00,
            "vendor_ifsc": "HDFC0000240"
        },
        "citations": [],
        "actions": []
    },
    "CASE-DUP-404": {
        "case_id": "CASE-DUP-404",
        "title": "Apex Logistics Split-Payment Duplicate Payout Risk",
        "category": "DUPLICATE_DISBURSEMENT",
        "severity": "CRITICAL",
        "status": "TRIGGERED",
        "amount_at_risk": 125000.00,
        "invoice_or_ref_id": "INV-2026-404",
        "description": "Invoice INV-2026-404 marked PENDING_APPROVAL in ERP yet bank statement reflects two split payments of ₹62,500.00 each against PO8921.",
        "scenario_metadata": {
            "vendor_name": "Apex Logistics Global Pvt Ltd",
            "split_amounts": [62500.00, 62500.00],
            "vendor_ifsc": "ICIC0000009"
        },
        "citations": [],
        "actions": []
    }
}

# Live mutable cases dict
CASE_STORE: Dict[str, Dict[str, Any]] = {k: v.copy() for k, v in INITIAL_CASES.items()}


def get_case_or_404(case_id: str) -> Dict[str, Any]:
    key = case_id.strip().upper()
    if key in CASE_STORE:
        return CASE_STORE[key]
    # Check partial match
    for k, v in CASE_STORE.items():
        if key in k or k in key or key in v.get("invoice_or_ref_id", ""):
            return v
    raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found in Praman repository.")


@router.get("", response_model=List[DiscrepancyCase])
def list_discrepancy_cases():
    """Lists all active and resolved investigation cases with status and risk amounts."""
    return [DiscrepancyCase(**c) for c in CASE_STORE.values()]


@router.get("/{case_id}", response_model=DiscrepancyCase)
def get_case(case_id: str):
    """Retrieves single case by ID."""
    case = get_case_or_404(case_id)
    return DiscrepancyCase(**case)


@router.post("/trigger/{scenario_id}", response_model=TriggerCaseResponse)
def trigger_case(scenario_id: str):
    """Resets and triggers investigation for a canonical scenario or custom ID."""
    key = scenario_id.strip().upper()
    
    # Reset case to clean initial state if canonical
    if key in INITIAL_CASES:
        CASE_STORE[key] = INITIAL_CASES[key].copy()
        CASE_STORE[key]["status"] = "INVESTIGATING"
        target_case = CASE_STORE[key]
    else:
        # Custom case fallback
        target_case = {
            "case_id": key,
            "title": f"Custom Discrepancy Investigation: {key}",
            "category": "CUSTOM_QUERY",
            "severity": "HIGH",
            "status": "INVESTIGATING",
            "amount_at_risk": 50000.00,
            "invoice_or_ref_id": key,
            "description": f"Autonomous investigation triggered for custom reference {key}.",
            "scenario_metadata": {"vendor_ifsc": "HDFC0000240"},
            "citations": [],
            "actions": []
        }
        CASE_STORE[key] = target_case

    return TriggerCaseResponse(
        case_id=target_case["case_id"],
        status="INVESTIGATING",
        message=f"Investigation workflow initialized for {target_case['case_id']}.",
        case=DiscrepancyCase(**target_case)
    )
