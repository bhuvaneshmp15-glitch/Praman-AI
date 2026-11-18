"""Praman API Data Models and Schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime


class HealthResponse(BaseModel):
    status: str
    environment: str
    database: str
    total_rows: int
    table_counts: Dict[str, int]
    registered_udfs: List[str]


class DiscrepancyCase(BaseModel):
    case_id: str
    title: str
    category: str
    severity: str
    status: str = "TRIGGERED"  # TRIGGERED, INVESTIGATING, BRIEF_READY, APPROVED
    amount_at_risk: float
    invoice_or_ref_id: str
    description: str
    scenario_metadata: Dict[str, Any] = Field(default_factory=dict)
    brief: Optional[Dict[str, Any]] = None
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    actions: List[Dict[str, Any]] = Field(default_factory=list)
    approval_result: Optional[Dict[str, Any]] = None


class TriggerCaseResponse(BaseModel):
    case_id: str
    status: str
    message: str
    case: DiscrepancyCase


class CitationDetailResponse(BaseModel):
    citation_key: str
    case_id: str
    source_table: str
    row_id: str
    target_row: Dict[str, Any]
    context_rows: List[Dict[str, Any]]
    live_ifsc: Optional[Dict[str, Any]] = None


class ActionApprovalRequest(BaseModel):
    notes: Optional[str] = "Approved by Finance Controller"
    override_actions: Optional[List[Dict[str, Any]]] = None


class ActionApprovalResponse(BaseModel):
    case_id: str
    status: str = "APPROVED"
    idempotency_key: str
    external_ref_id: str
    routing_headers: Dict[str, Any]
    vendor_notice_html: str
    db_update_result: Dict[str, Any]
    audit_trail_entry: Dict[str, Any]
    executed_at: str
