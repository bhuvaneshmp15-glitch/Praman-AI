"""Praman API - Actions & Settlement Approval Router."""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from praman_api.models import ActionApprovalRequest, ActionApprovalResponse
from praman_api.api.cases import get_case_or_404, CASE_STORE
from praman_api.adapters.settlement_dispatcher import settlement_dispatcher

router = APIRouter(prefix="/cases", tags=["actions"])


@router.post("/{case_id}/approve", response_model=ActionApprovalResponse)
def approve_case_action(case_id: str, request: ActionApprovalRequest = ActionApprovalRequest()):
    """Executes the human-approved actions sequentially through adapters/settlement_dispatcher.py."""
    case = get_case_or_404(case_id)
    case_key = case["case_id"]

    # Execute approval pipeline through settlement dispatcher
    approval_result = settlement_dispatcher.execute_approval(
        case_id=case_key,
        case_data=case,
        notes=request.notes or "Approved by Finance Controller"
    )

    # Update case state in repository to APPROVED
    if case_key in CASE_STORE:
        CASE_STORE[case_key]["status"] = "APPROVED"
        CASE_STORE[case_key]["approval_result"] = approval_result

    return ActionApprovalResponse(**approval_result)
