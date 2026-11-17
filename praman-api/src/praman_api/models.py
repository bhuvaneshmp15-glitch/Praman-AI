from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime


class BankStatementRow(BaseModel):
    row_id: str
    txn_date: date
    narration: str
    withdrawal: float = 0.0
    deposit: float = 0.0
    running_balance: float
    ifsc_code: str


class RazorpayUPIRow(BaseModel):
    payment_id: str
    order_id: str
    created_at: datetime
    gross_amount: float
    mdr_fee: float
    gst_on_fee: float
    net_settlement: float
    status: str
    rrn_utr: str
    customer_vpa: str


class TallyInvoiceRow(BaseModel):
    invoice_id: str
    invoice_date: date
    vendor_name: str
    vendor_gstin: str
    taxable_value: float
    cgst_amount: float
    sgst_amount: float
    igst_amount: float
    total_amount: float
    payout_status: str
    vendor_ifsc: str


class GSTR2BRow(BaseModel):
    gstr2b_id: str
    gstin_supplier: str
    legal_trade_name: str
    invoice_num: str
    filing_period: str
    taxable_val: float
    itc_eligible_amount: float
    filing_status: str


class CashflowCommitmentRow(BaseModel):
    commitment_id: str
    commitment_type: str
    lender_or_payee: str
    due_date: date
    amount: float
    priority: str


class CompanyPolicyRow(BaseModel):
    policy_id: str
    domain: str
    title: str
    rule_body: str
    section_ref: str


class DiscrepancyCase(BaseModel):
    case_id: str
    title: str
    category: str
    severity: str
    invoice_or_ref_id: str
    amount: float
    status: str = "OPEN"
    description: str
    citations: List[Dict[str, Any]] = Field(default_factory=list)
