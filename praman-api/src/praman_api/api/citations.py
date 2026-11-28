"""Praman API - Citations & Evidence Deep-Dive Router."""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from praman_api.models import CitationDetailResponse
from praman_api.engine.duckdb_plane import db_plane
from praman_api.services.citations import citation_service
from praman_api.adapters.razorpay_ifsc import razorpay_ifsc_adapter
from praman_api.api.cases import get_case_or_404

router = APIRouter(prefix="/citations", tags=["citations"])

# Canonical evidence map fallback for instant deterministic resolution
CANONICAL_CITATION_MAP = {
    "CASE-GST-104": {
        "CIT-1": {"table": "tally_invoices", "row_id": "INV-2026-104", "pk_col": "invoice_id"},
        "CIT-2": {"table": "gstr2b_tax", "row_id": "INV-2026-104", "pk_col": "invoice_num"},
        "CIT-3": {"table": "bank_statement", "row_id": "BNK-3801", "pk_col": "row_id"},
        "CIT-4": {"table": "cashflow_commitments", "row_id": "COM-001", "pk_col": "commitment_id"},
    },
    "CASE-UPI-209": {
        "CIT-1": {"table": "razorpay_upi", "row_id": "pay_UPI209_FAIL", "pk_col": "payment_id"},
        "CIT-2": {"table": "razorpay_upi", "row_id": "pay_UPI209_CAPT", "pk_col": "payment_id"},
        "CIT-3": {"table": "bank_statement", "row_id": "BNK-3951", "pk_col": "row_id"},
        "CIT-4": {"table": "company_policies", "row_id": "POL-004", "pk_col": "policy_id"},
    },
    "CASE-SLA-302": {
        "CIT-1": {"table": "tally_invoices", "row_id": "INV-2026-881", "pk_col": "invoice_id"},
        "CIT-2": {"table": "company_policies", "row_id": "POL-SLA-01", "pk_col": "policy_id"},
    },
    "CASE-DUP-404": {
        "CIT-1": {"table": "tally_invoices", "row_id": "INV-2026-404", "pk_col": "invoice_id"},
        "CIT-2": {"table": "bank_statement", "row_id": "BNK-3741", "pk_col": "row_id"},
    }
}


@router.get("/{case_id}/{citation_key}", response_model=CitationDetailResponse)
def get_citation_evidence(case_id: str, citation_key: str):
    """Returns exact underlying row from DuckDB plus surrounding context rows and live IFSC data for UI inspection modal."""
    case = get_case_or_404(case_id)
    case_key = case["case_id"]
    cit_key = citation_key.strip().upper()

    # 1. Resolve citation mapping
    cit_lookup = cit_key.strip("[]")
    cit = citation_service.get(cit_key) or citation_service.get(cit_lookup)
    
    # If not found directly, check prefix match (e.g. if URL anchor dropped '#...')
    if not cit:
        for c in citation_service.all():
            cid = c.get("citation_id", "")
            if cid.upper() == cit_key or cid.upper().startswith(f"{cit_key}#") or cid.upper().startswith(f"{cit_lookup}#"):
                cit = citation_service.get(cid)
                break

    if cit:
        source_table = cit.source_table
        row_id = cit.row_id
        cit_return_key = cit.citation_id
    else:
        # Check canonical fallback map
        case_map = CANONICAL_CITATION_MAP.get(case_key, {})
        entry = case_map.get(cit_key, case_map.get(cit_lookup, {"table": "tally_invoices", "row_id": case.get("invoice_or_ref_id", ""), "pk_col": "invoice_id"}))
        source_table = entry["table"]
        row_id = entry["row_id"]
        cit_return_key = cit_key

    # 2. Query target row from DuckDB or Public API citation payload
    if source_table in ("razorpay_ifsc", "postal_pincode", "public_apis", "external_api"):
        target_row = cit.value if (cit and isinstance(cit.value, dict)) else {"citation_id": cit_lookup, "source": source_table, "row_id": row_id}
        context_rows = []
        live_ifsc = cit.value if (cit and source_table == "razorpay_ifsc" and isinstance(cit.value, dict)) else None
    else:
        conn = db_plane.connect()
        try:
            # Determine likely column
            if source_table == "tally_invoices":
                sql_target = f"SELECT * FROM tally_invoices WHERE invoice_id = '{row_id}'"
            elif source_table == "gstr2b_tax":
                sql_target = f"SELECT * FROM gstr2b_tax WHERE invoice_num = '{row_id}' OR gstr2b_id = '{row_id}'"
            elif source_table == "bank_statement":
                sql_target = f"SELECT * FROM bank_statement WHERE row_id = '{row_id}'"
            elif source_table == "razorpay_upi":
                sql_target = f"SELECT * FROM razorpay_upi WHERE payment_id = '{row_id}' OR rrn_utr = '{row_id}'"
            elif source_table == "cashflow_commitments":
                sql_target = f"SELECT * FROM cashflow_commitments WHERE commitment_id = '{row_id}'"
            elif source_table == "company_policies":
                sql_target = f"SELECT * FROM company_policies WHERE policy_id = '{row_id}'"
            else:
                sql_target = f"SELECT * FROM {source_table} LIMIT 1"

            df_target = conn.execute(sql_target).fetchdf()
            if len(df_target) > 0:
                target_row = df_target.iloc[0].to_dict()
            else:
                target_row = {"row_id": row_id, "note": "Record missing or unfiled in statutory portal"}

            # Query 3 surrounding context rows from the same table
            df_ctx = conn.execute(f"SELECT * FROM {source_table} LIMIT 3").fetchdf()
            context_rows = df_ctx.to_dict(orient="records")

        except Exception as e:
            target_row = {"row_id": row_id, "error": str(e)}
            context_rows = []

        # Attach live IFSC routing if IFSC code is present in target row or case
        ifsc_code = target_row.get("vendor_ifsc") or target_row.get("ifsc_code") or case.get("scenario_metadata", {}).get("vendor_ifsc")
        live_ifsc = None
        if ifsc_code:
            live_ifsc = razorpay_ifsc_adapter.lookup_sync(str(ifsc_code))

    return CitationDetailResponse(
        citation_key=cit_return_key,
        case_id=case_key,
        source_table=source_table,
        row_id=row_id,
        target_row=target_row,
        context_rows=context_rows,
        live_ifsc=live_ifsc
    )
