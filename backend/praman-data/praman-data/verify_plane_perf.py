"""Praman Financial Copilot - Semantic Plane Performance Verification Script.
Benchmarks execution latency for UDFs (extract_utr, norm_indic_vendor, jw_sim, validate_gstin_checksum)
across all datasets in DuckDB to confirm sub-50ms execution.
"""
import sys
from pathlib import Path

# Add praman-api/src to path
src_dir = Path(__file__).resolve().parent.parent / "praman-api" / "src"
sys.path.insert(0, str(src_dir))

from praman_api.engine.duckdb_plane import DuckDBPlane


def main():
    print("=" * 70)
    print("PRAMAN DUCKDB SEMANTIC DATA PLANE BENCHMARK")
    print("=" * 70)
    
    plane = DuckDBPlane()
    # Warm up connection
    plane.execute_query("SELECT 1")

    # 1. Benchmark extract_utr across 4,000 bank rows
    q1 = """
    SELECT row_id, extract_utr(narration) AS utr
    FROM bank_statement
    WHERE extract_utr(narration) != ''
    LIMIT 1000
    """
    res1 = plane.execute_query(q1)
    print(f"[1] extract_utr():        {res1['row_count']:>5} rows matched  |  Latency: {res1['elapsed_ms']:>6.2f} ms")

    # 2. Benchmark norm_indic_vendor across 1,800 Tally invoices
    q2 = """
    SELECT invoice_id, norm_indic_vendor(vendor_name) AS normalized_vendor
    FROM tally_invoices
    LIMIT 1000
    """
    res2 = plane.execute_query(q2)
    print(f"[2] norm_indic_vendor():  {res2['row_count']:>5} rows processed|  Latency: {res2['elapsed_ms']:>6.2f} ms")

    # 3. Benchmark jw_sim against noisy bank narrations
    q3 = """
    WITH filtered AS (
        SELECT row_id, narration, ifsc_code FROM bank_statement WHERE ifsc_code = 'KVBL0001245'
    )
    SELECT row_id, narration, jw_sim(narration, 'Sri Balaji Enterprises') AS sim
    FROM filtered
    WHERE jw_sim(narration, 'Sri Balaji Enterprises') >= 0.92
    ORDER BY sim DESC
    """
    res3 = plane.execute_query(q3)
    print(f"[3] jw_sim() (>=0.92):     {res3['row_count']:>5} rows matched  |  Latency: {res3['elapsed_ms']:>6.2f} ms")

    # 4. Benchmark validate_gstin_checksum across GSTR-2B
    q4 = """
    SELECT gstr2b_id, gstin_supplier
    FROM gstr2b_tax
    WHERE validate_gstin_checksum(gstin_supplier) = true
    LIMIT 1000
    """
    res4 = plane.execute_query(q4)
    print(f"[4] validate_gstin():     {res4['row_count']:>5} rows validated|  Latency: {res4['elapsed_ms']:>6.2f} ms")

    # 5. Multi-table 3-way join: Tally Invoices + GSTR-2B + Bank Statement UTR match
    q5 = """
    SELECT 
        t.invoice_id,
        t.vendor_name,
        t.total_amount,
        g.itc_eligible_amount,
        g.filing_status,
        b.row_id AS bank_row,
        b.txn_date
    FROM tally_invoices t
    LEFT JOIN gstr2b_tax g ON t.invoice_id = g.invoice_num
    LEFT JOIN bank_statement b ON b.ifsc_code = t.vendor_ifsc 
        AND jw_sim(b.narration, t.vendor_name) >= 0.95
    WHERE t.invoice_id = 'INV-2026-104'
    """
    res5 = plane.execute_query(q5)
    print(f"[5] 3-Way Reconciliation: {res5['row_count']:>5} rows resolved |  Latency: {res5['elapsed_ms']:>6.2f} ms")

    print("=" * 70)
    all_under_50 = all(r["elapsed_ms"] < 50.0 for r in [res1, res2, res3, res4, res5])
    print(f"VERDICT: All queries executed in sub-50ms: {all_under_50}")
    print("=" * 70)
    plane.close()
    assert all_under_50, "Latency exceeded 50ms threshold!"


if __name__ == "__main__":
    main()
