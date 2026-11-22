"""Praman API Data Models and Schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import date, datetime

ScenarioType = Literal["GST_ITC_HOLD", "UPI_DOUBLE_DEBIT", "SLA_PRORATA_CREDIT", "CUSTOM_INVESTIGATION"]


class HealthResponse(BaseModel):
    status: str
    environment: str
    database: str
    total_rows: int
    table_counts: Dict[str, int]
    registered_udfs: List[str]


class DiscrepancyCase(BaseModel):
    case_id: str
    scenario_type: ScenarioType = "CUSTOM_INVESTIGATION"
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


class CustomCaseRequest(BaseModel):
    query: str
    raw_narration: Optional[str] = None


class TestNarrationRequest(BaseModel):
    raw_text: str


class FuzzyCandidate(BaseModel):
    vendor_name: str
    vendor_gstin: Optional[str] = None
    sim_score: float


class TestNarrationResponse(BaseModel):
    raw_text: str
    extracted_utr: str
    normalized_vendor: str
    top_fuzzy_candidates: List[Dict[str, Any]]
    matched_gstr2b: List[Dict[str, Any]]
    matched_tally: List[Dict[str, Any]]
    matched_bank_rows: List[Dict[str, Any]]
    latency_ms: float


class StatementUploadResponse(BaseModel):
    filename: str
    total_rows: int
    reconciled_count: int
    unreconciled_count: int
    matched_records: List[Dict[str, Any]]
    unmatched_records: List[Dict[str, Any]]
    truncated_fuzzy_count: int = 0
    summary: str
    latency_ms: float

