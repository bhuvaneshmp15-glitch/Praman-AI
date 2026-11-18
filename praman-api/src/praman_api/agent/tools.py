"""Praman Financial Copilot - Agent Tools.
Exposes DuckDB OLAP queries, 4 live keyless public APIs, citation logging,
cashflow runway calculation, and case conclusion.
"""
from typing import Dict, Any, List, Optional
from praman_api.engine.duckdb_plane import db_plane, SqlSemanticError
from praman_api.services.citations import citation_service
from praman_api.services.cashflow_math import compute_runway_impact
from praman_api.adapters.public_apis import (
    verify_ifsc_live,
    verify_gst_state_pincode,
    fetch_live_usd_inr,
    check_vendor_email_breach,
    IFSC_FALLBACK_CACHE
)

# Backwards compatible alias
IFSC_FALLBACK_REGISTRY = IFSC_FALLBACK_CACHE


def duckdb_sql(query: str, purpose: str = "") -> Dict[str, Any]:
    """Runs a wide multi-table SQL query across the DuckDB semantic plane.
    
    Can raise SqlSemanticError if financial guardrails are breached.
    """
    result = db_plane.execute_query(query)
    result["purpose"] = purpose
    return result


def record_finding(
    title: str,
    detail: str,
    citation_id: str,
    source_table: str,
    row_id: str
) -> Dict[str, Any]:
    """Logs a verified finding and registers the row citation in the audit service."""
    cit = citation_service.register(
        citation_id=citation_id,
        source_table=source_table,
        row_id=row_id,
        field="finding",
        value=detail,
        note=title
    )
    return {
        "citation_id": cit.citation_id,
        "source_table": cit.source_table,
        "row_id": cit.row_id,
        "status": "RECORDED"
    }


def calculate_emi_runway(
    current_balance: float,
    upcoming_emi: float,
    total_payout: float,
    amount_held: float
) -> Dict[str, Any]:
    """Calls compute_runway_impact() and returns exact verified rupee figures."""
    return compute_runway_impact(
        current_bank_balance=current_balance,
        upcoming_30d_critical_emi=upcoming_emi,
        disputed_or_payout_amount=total_payout,
        recommended_hold_or_recovery=amount_held
    )


def conclude_brief(
    headline: str,
    decision: str,
    markdown_brief: str,
    actions: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Finalizes the investigation case and outputs structured decision payload."""
    return {
        "status": "CONCLUDED",
        "headline": headline,
        "decision": decision,
        "markdown_brief": markdown_brief,
        "actions": actions,
        "citations": citation_service.all()
    }
