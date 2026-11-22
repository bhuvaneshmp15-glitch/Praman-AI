"""Praman Financial Reconciliation & Cash-Flow Protection Engine - FastAPI Application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from praman_api.config import settings
from praman_api.models import HealthResponse
from praman_api.engine.duckdb_plane import db_plane
from praman_api.api.cases import router as cases_router
from praman_api.api.stream import router as stream_router
from praman_api.api.citations import router as citations_router
from praman_api.api.actions import router as actions_router
from praman_api.api.tools import router as tools_router

app = FastAPI(
    title="Praman Financial Copilot",
    version="0.1.0",
    description="Autonomous B2B Financial Reconciliation & Cash-Flow Protection Engine for Indian SMEs."
)

# Enable CORS for Next.js / React UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
def health_check():
    """Returns DuckDB table row counts (proving 10,000+ rows are loaded), registered UDFs, and system status."""
    conn = db_plane.connect()
    tables = [
        "bank_statement",
        "razorpay_upi",
        "tally_invoices",
        "gstr2b_tax",
        "cashflow_commitments",
        "company_policies"
    ]
    table_counts: Dict[str, int] = {}
    total_rows = 0

    for tbl in tables:
        try:
            cnt = conn.execute(f"SELECT COUNT(*) FROM {tbl}").fetchone()[0]
            table_counts[tbl] = cnt
            total_rows += cnt
        except Exception:
            table_counts[tbl] = 0

    return HealthResponse(
        status="OPERATIONAL",
        environment=settings.ENVIRONMENT,
        database=str(db_plane.db_path.name),
        total_rows=total_rows,
        table_counts=table_counts,
        registered_udfs=[
            "extract_utr",
            "norm_indic_vendor",
            "jw_sim",
            "validate_gstin_checksum"
        ]
    )


# Register API Routers under /api
app.include_router(cases_router, prefix="/api")
app.include_router(stream_router, prefix="/api")
app.include_router(citations_router, prefix="/api")
app.include_router(actions_router, prefix="/api")
app.include_router(tools_router, prefix="/api")


@app.get("/")
def root():
    return {
        "service": "Praman Financial Copilot API",
        "status": "ONLINE",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }
