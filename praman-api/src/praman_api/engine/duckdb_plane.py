"""Praman Financial Copilot - DuckDB Semantic Data Plane.
High-performance OLAP query execution engine with registered semantic UDFs and financial guardrails.
"""
import re
import time
import threading
from pathlib import Path
from typing import Dict, Any, Optional, List
import duckdb
import pandas as pd
import numpy as np

from praman_api.config import settings
from praman_api.engine.udfs import (
    extract_utr,
    norm_indic_vendor,
    jw_sim,
    validate_gstin_checksum,
)


class SqlSemanticError(Exception):
    """Raised when an invalid, dangerous, or mathematically nonsensical financial SQL query is attempted."""
    pass


class DuckDBPlane:
    """Analytical OLAP Execution Plane for Praman Financial Copilot."""

    def __init__(self, db_path: Optional[str] = None):
        self.db_path = Path(db_path or settings.DUCKDB_PATH)
        self._main_conn: Optional[duckdb.DuckDBPyConnection] = None
        self._local = threading.local()
        self._ensure_database_exists()

    def _ensure_database_exists(self):
        """Initializes database from raw CSVs if praman.duckdb does not exist."""
        if not self.db_path.exists() or self.db_path.stat().st_size == 0:
            print(f"[DuckDBPlane] Database not found at {self.db_path}. Initializing from raw CSVs...")
            raw_dir = Path(settings.RAW_CSVS_DIR)
            if raw_dir.exists():
                self._seed_from_csvs(raw_dir)
            else:
                print(f"[DuckDBPlane] Warning: Raw CSVs directory {raw_dir} does not exist.")

    def _seed_from_csvs(self, raw_dir: Path):
        """Loads all raw CSV files directly into DuckDB."""
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = duckdb.connect(str(self.db_path))
        csv_tables = {
            "bank_statement": raw_dir / "bank_statement.csv",
            "razorpay_upi": raw_dir / "razorpay_upi.csv",
            "tally_invoices": raw_dir / "tally_invoices.csv",
            "gstr2b_tax": raw_dir / "gstr2b_tax.csv",
            "cashflow_commitments": raw_dir / "cashflow_commitments.csv",
            "company_policies": raw_dir / "company_policies.csv",
        }
        for table, path in csv_tables.items():
            if path.exists():
                conn.execute(f"DROP TABLE IF EXISTS {table}")
                conn.execute(
                    f"CREATE TABLE {table} AS SELECT * FROM read_csv_auto('{path.as_posix()}', header=True)"
                )
        conn.close()

    @property
    def conn(self) -> duckdb.DuckDBPyConnection:
        return self.connect()

    def _get_main_conn(self) -> duckdb.DuckDBPyConnection:
        if self._main_conn is None:
            self._main_conn = duckdb.connect(str(self.db_path), read_only=False)
            self._register_udfs(self._main_conn)
        return self._main_conn

    def connect(self, read_only: bool = False) -> duckdb.DuckDBPyConnection:
        """Returns thread-isolated DuckDB cursor with all 4 semantic UDFs registered."""
        main_conn = self._get_main_conn()
        if not hasattr(self._local, "cursor") or self._local.cursor is None:
            self._local.cursor = main_conn.cursor()
        return self._local.cursor

    def _register_udfs(self, conn: duckdb.DuckDBPyConnection):
        """Registers the 4 pure Python UDFs into the DuckDB catalog."""
        try:
            conn.create_function("extract_utr", extract_utr)
            conn.create_function("norm_indic_vendor", norm_indic_vendor)
            conn.create_function("jw_sim", jw_sim)
            conn.create_function("validate_gstin_checksum", validate_gstin_checksum)
        except Exception:
            pass

    def execute_query(self, sql: str) -> Dict[str, Any]:
        """Runs read-only SQL, measures execution latency in ms, and enforces financial guardrails.
        
        Returns:
            { "columns": [...], "rows": [...], "row_count": int, "elapsed_ms": float }
        """
        clean_sql = sql.strip()

        # 1. Guardrail: Prohibit mutation statements
        destructive_pattern = r'\b(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|CREATE)\b'
        if re.search(destructive_pattern, clean_sql, re.IGNORECASE):
            # Allow CTEs and SELECT statements only
            if not re.match(r'^(WITH|SELECT|EXPLAIN|PRAGMA|DESCRIBE)\b', clean_sql, re.IGNORECASE):
                raise SqlSemanticError("READ-ONLY ERROR: DDL and DML mutation statements are strictly prohibited.")

        # 2. Anti-Bug Guardrail 1 (Running Balance Sum Check)
        sum_balance_pattern = r'\bsum\s*\(\s*(?:[a-zA-Z0-9_]+\.)?running_balance\s*\)'
        if re.search(sum_balance_pattern, clean_sql, re.IGNORECASE):
            raise SqlSemanticError(
                "CRITICAL FINANCIAL BUG: Never SUM(running_balance) on bank_statement. "
                "Use a CTE with ORDER BY txn_date DESC, row_id DESC LIMIT 1 to get the latest balance."
            )

        # 3. Anti-Bug Guardrail 2 (Cartesian Fanout Check - Static threshold analysis)
        # Check for jw_sim(...) >= 0.xx or > 0.xx where xx < 0.90
        jw_thresh_match = re.search(r'jw_sim\s*\(.*?\)\s*(?:>=|>)\s*(0\.\d+)', clean_sql, re.IGNORECASE)
        if jw_thresh_match:
            thresh_val = float(jw_thresh_match.group(1))
            if thresh_val < 0.90:
                raise SqlSemanticError(
                    "CARTESIAN FANOUT DETECTED: Fuzzy join threshold too loose or missing ranking window function. "
                    "Tighten jw_sim >= 0.92 or rank top match per invoice_id."
                )

        # Check for inverted pattern: jw_sim(...) < 0.90
        if re.search(r'jw_sim\s*\(.*?\)\s*<\s*0\.90', clean_sql, re.IGNORECASE):
            raise SqlSemanticError(
                "CARTESIAN FANOUT DETECTED: Fuzzy join threshold too loose or missing ranking window function. "
                "Tighten jw_sim >= 0.92 or rank top match per invoice_id."
            )

        # Execute query and measure latency
        conn = self.connect()
        t0 = time.perf_counter()
        try:
            df = conn.execute(clean_sql).fetchdf()
        except Exception as e:
            raise SqlSemanticError(f"SQL execution error: {str(e)}")
        t1 = time.perf_counter()
        elapsed_ms = round((t1 - t0) * 1000, 2)

        # 4. Anti-Bug Guardrail 2 (Cartesian Fanout Check - Runtime row explosion check)
        is_fuzzy_query = bool(re.search(r'\bjw_sim\b', clean_sql, re.IGNORECASE))
        has_invoice_filter = bool(re.search(r'\b(invoice_id|inv-\d+|dispute)\b', clean_sql, re.IGNORECASE))
        has_ranking_or_limit = bool(re.search(r'\b(QUALIFY|LIMIT)\b', clean_sql, re.IGNORECASE))

        if is_fuzzy_query and has_invoice_filter and not has_ranking_or_limit:
            if len(df) > 50:
                raise SqlSemanticError(
                    "CARTESIAN FANOUT DETECTED: Fuzzy join threshold too loose or missing ranking window function. "
                    "Tighten jw_sim >= 0.92 or rank top match per invoice_id."
                )

        # Format rows cleanly for JSON serialization
        columns = list(df.columns)
        # Convert NaN values to None, and date/timestamp objects to string
        rows_list = []
        for row in df.itertuples(index=False):
            clean_row = []
            for item in row:
                if pd.isna(item):
                    clean_row.append(None)
                elif hasattr(item, "isoformat"):
                    clean_row.append(item.isoformat())
                else:
                    clean_row.append(item)
            rows_list.append(clean_row)

        return {
            "columns": columns,
            "rows": rows_list,
            "row_count": len(rows_list),
            "elapsed_ms": elapsed_ms
        }

    def close(self):
        """Closes active DuckDB connection."""
        if hasattr(self._local, "cursor") and self._local.cursor:
            try:
                self._local.cursor.close()
            except Exception:
                pass
            self._local.cursor = None
        if self._main_conn:
            try:
                self._main_conn.close()
            except Exception:
                pass
            self._main_conn = None


db_plane = DuckDBPlane()
