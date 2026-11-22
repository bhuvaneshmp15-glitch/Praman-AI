"""Praman API - Ad-Hoc Testing & Semantic Tools Router.
Provides live endpoint for testing unstructured bank narrations, UTR extraction,
and Jaro-Winkler fuzzy vendor matching across 10,040 rows in DuckDB.
"""
import time
import csv
import io
import re
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any, List

from praman_api.models import TestNarrationRequest, TestNarrationResponse, StatementUploadResponse
from praman_api.engine.duckdb_plane import db_plane
from praman_api.engine.udfs import extract_utr, norm_indic_vendor, jw_sim

router = APIRouter(prefix="/tools", tags=["tools"])


_cached_vendors_catalog = None


def _get_vendors_catalog(conn):
    global _cached_vendors_catalog
    if _cached_vendors_catalog is None:
        rows = conn.execute("""
            SELECT DISTINCT vendor_name, norm_indic_vendor(vendor_name) AS norm_v
            FROM tally_invoices
            WHERE vendor_name IS NOT NULL AND vendor_name != '';
        """).fetchall()
        _cached_vendors_catalog = [(r[0], r[1]) for r in rows]
    return _cached_vendors_catalog


def _fetch_dicts(conn, sql: str, params: list = None) -> List[Dict[str, Any]]:
    """Helper to execute query and return list of row dictionaries."""
    cur = conn.execute(sql, params or [])
    cols = [d[0] for d in cur.description] if cur.description else []
    return [dict(zip(cols, row)) for row in cur.fetchall()]


@router.post("/test-narration", response_model=TestNarrationResponse)
def test_narration(payload: TestNarrationRequest):
    """Executes live UTR extraction, Indic vendor normalization, and fuzzy candidate matching

    across all 10,040 rows in praman.duckdb with sub-50ms analytical latency.
    """
    start = time.time()
    raw = payload.raw_text.strip()
    extracted_utr = extract_utr(raw)
    norm_vendor = norm_indic_vendor(raw)

    conn = db_plane.connect(read_only=True)

    # 1. Top 5 Fuzzy Candidates across all unique vendors in Tally ERP
    fuzzy_query = """
    SELECT vendor_name, vendor_gstin, ROUND(jw_sim(vendor_name, ?), 4) AS sim_score
    FROM (
        SELECT DISTINCT vendor_name, vendor_gstin FROM tally_invoices
    )
    ORDER BY sim_score DESC
    LIMIT 5;
    """
    top_candidates_raw = conn.execute(fuzzy_query, [raw]).fetchall()
    top_fuzzy_candidates = [
        {"vendor_name": r[0], "vendor_gstin": r[1], "sim_score": float(r[2])}
        for r in top_candidates_raw
    ]

    # 2. Matched Tally Invoices (matched by invoice id in raw text, or top fuzzy vendor)
    top_vendor = top_fuzzy_candidates[0]["vendor_name"] if top_fuzzy_candidates and top_fuzzy_candidates[0]["sim_score"] >= 0.70 else None

    tally_query = """
    SELECT invoice_id, invoice_date, vendor_name, vendor_gstin, taxable_value, igst_amount, total_amount, payout_status
    FROM tally_invoices
    WHERE (? != '' AND INSTR(?, invoice_id) > 0)
       OR (? IS NOT NULL AND vendor_name = ?)
    LIMIT 10;
    """
    tally_rows = _fetch_dicts(conn, tally_query, [raw, raw, top_vendor, top_vendor])

    # 3. Matched GSTR-2B Records (matched by invoice in raw or matched tally invoices)
    matched_inv_ids = [r["invoice_id"] for r in tally_rows]
    if matched_inv_ids:
        placeholders = ",".join(["?"] * len(matched_inv_ids))
        gstr_query = f"""
        SELECT gstr2b_id, gstin_supplier, invoice_num, itc_eligible_amount, filing_status
        FROM gstr2b_tax
        WHERE invoice_num IN ({placeholders})
        LIMIT 10;
        """
        gstr_rows = _fetch_dicts(conn, gstr_query, matched_inv_ids)
    else:
        gstr_rows = []

    # 4. Matched Bank Statement Rows (by extracted UTR or fuzzy narration)
    bank_query = """
    SELECT row_id, txn_date, narration, withdrawal, deposit, running_balance, ifsc_code,
           extract_utr(narration) AS extracted_utr,
           ROUND(jw_sim(narration, ?), 4) AS sim_score
    FROM bank_statement
    WHERE (? != '' AND extract_utr(narration) = ?)
       OR jw_sim(narration, ?) >= 0.85
    ORDER BY sim_score DESC
    LIMIT 10;
    """
    bank_rows = _fetch_dicts(conn, bank_query, [raw, extracted_utr, extracted_utr, raw])

    elapsed_ms = round((time.time() - start) * 1000, 2)

    return TestNarrationResponse(
        raw_text=raw,
        extracted_utr=extracted_utr,
        normalized_vendor=norm_vendor,
        top_fuzzy_candidates=top_fuzzy_candidates,
        matched_gstr2b=gstr_rows,
        matched_tally=tally_rows,
        matched_bank_rows=bank_rows,
        latency_ms=elapsed_ms
    )


@router.post("/upload-statement", response_model=StatementUploadResponse)
def upload_statement(file: UploadFile = File(...)):
    """Accepts a multipart CSV bank statement, parses it into an ephemeral DuckDB query,
    runs extract_utr() and norm_indic_vendor() against tally_invoices and gstr2b_tax,
    and returns comprehensive reconciliation matches.
    """
    start = time.time()
    filename = file.filename or "statement.csv"
    if not (filename.lower().endswith(".csv") or filename.lower().endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only CSV files (.csv, .txt) are supported.")
    
    content_bytes = file.file.read()
    try:
        content_text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        content_text = content_bytes.decode("latin-1")

    reader = csv.DictReader(io.StringIO(content_text))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="Uploaded CSV file is empty or corrupted.")

    date_col = next((f for f in reader.fieldnames if f.strip().lower() in ("date", "txn_date", "txndate", "transaction_date")), None)
    narration_col = next((f for f in reader.fieldnames if f.strip().lower() in ("narration", "description", "details", "remarks", "particulars")), None)
    withdrawal_col = next((f for f in reader.fieldnames if f.strip().lower() in ("withdrawal", "debit", "dr", "withdrawals")), None)
    deposit_col = next((f for f in reader.fieldnames if f.strip().lower() in ("deposit", "credit", "cr", "deposits")), None)

    if not narration_col:
        raise HTTPException(
            status_code=400, 
            detail=f"CSV missing narration column. Found headers: {list(reader.fieldnames)}. Expected: 'narration' or 'description'."
        )

    parsed_rows = []
    for idx, row in enumerate(reader):
        narr = (row.get(narration_col) or "").strip()
        if not narr:
            continue
        d_val = 0.0
        w_val = 0.0
        if deposit_col and row.get(deposit_col):
            try:
                d_val = float(str(row.get(deposit_col)).replace(",", "").strip() or 0.0)
            except ValueError:
                d_val = 0.0
        if withdrawal_col and row.get(withdrawal_col):
            try:
                w_val = float(str(row.get(withdrawal_col)).replace(",", "").strip() or 0.0)
            except ValueError:
                w_val = 0.0
        txn_date = (row.get(date_col) or "").strip() if date_col else ""
        
        utr = extract_utr(narr)
        norm_v = norm_indic_vendor(narr)
        parsed_rows.append({
            "row_index": idx + 1,
            "txn_date": txn_date,
            "narration": narr,
            "withdrawal": w_val,
            "deposit": d_val,
            "extracted_utr": utr,
            "norm_vendor": norm_v
        })

    conn = db_plane.connect(read_only=True)
    matched_records = []
    unmatched_records = []

    # Extract all non-empty UTRs from parsed rows for bulk lookup
    all_utrs = list({r["extracted_utr"] for r in parsed_rows if r["extracted_utr"]})
    upi_by_utr = {}
    bank_by_utr = {}

    if all_utrs:
        # Bulk query razorpay_upi
        placeholders = ",".join(["?"] * len(all_utrs))
        upi_sql = f"""
        SELECT payment_id, gross_amount, status, rrn_utr, customer_vpa
        FROM razorpay_upi
        WHERE rrn_utr IN ({placeholders});
        """
        for row in conn.execute(upi_sql, all_utrs).fetchall():
            upi_by_utr[str(row[3])] = {
                "payment_id": row[0],
                "amount": float(row[1]),
                "status": str(row[2]),
                "rrn_utr": str(row[3]),
                "customer_vpa": str(row[4])
            }

        # Bulk query bank_statement by UTR
        bank_sql = f"""
        SELECT row_id, extract_utr(narration) AS u, deposit, withdrawal, narration, ifsc_code
        FROM bank_statement
        WHERE extract_utr(narration) IN ({placeholders});
        """
        for row in conn.execute(bank_sql, all_utrs).fetchall():
            bank_by_utr[str(row[1])] = {
                "row_id": str(row[0]),
                "extracted_utr": str(row[1]),
                "deposit": float(row[2]),
                "withdrawal": float(row[3]),
                "narration": str(row[4]),
                "ifsc_code": str(row[5])
            }

    MAX_FUZZY_ROWS = 250
    fuzzy_scanned_count = 0
    truncated_fuzzy_count = 0

    for r in parsed_rows:
        narr = r["narration"]
        utr = r["extracted_utr"]
        amt = r["deposit"] if r["deposit"] > 0 else r["withdrawal"]
        direction = "CREDIT" if r["deposit"] > 0 else ("DEBIT" if r["withdrawal"] > 0 else "UNKNOWN")

        upi_match = upi_by_utr.get(utr) if utr else None
        bank_match = bank_by_utr.get(utr) if utr else None

        # 1. Evaluate UPI Gateway Match by UTR
        if upi_match:
            upi_amt = upi_match["amount"]
            upi_status = upi_match["status"]
            reconciliation_status = "RECONCILED"
            reason = "Reconciled with captured Razorpay UPI payment"

            # Check 1: Gateway Discrepancy Status (disputed / refunded / failed_at_switch)
            if upi_status in ("disputed", "refunded", "failed_at_switch"):
                reconciliation_status = "ACTION_REQUIRED"
                reason = f"Gateway status flagged: {upi_status}"
            # Check 2: Amount Comparison
            elif abs(amt - upi_amt) > 0.01:
                reconciliation_status = "ACTION_REQUIRED"
                reason = f"Amount mismatch: statement shows ₹{amt:,.2f}, Razorpay UPI shows ₹{upi_amt:,.2f}"
            # Check 3: Cashflow Direction (inbound UPI settlement must be CREDIT)
            elif direction == "DEBIT" or r["withdrawal"] > 0:
                reconciliation_status = "ACTION_REQUIRED"
                reason = "Direction mismatch: outgoing debit carrying inbound UPI UTR"

            matched_records.append({
                "row_index": r["row_index"],
                "narration": narr,
                "amount": amt,
                "direction": direction,
                "extracted_utr": utr,
                "matched_type": "UPI_GATEWAY",
                "upi_gateway": upi_match,
                "bank_statement": bank_match,
                "matched_invoice": None,
                "reconciliation_status": reconciliation_status,
                "reason": reason
            })
            continue

        # 2. Evaluate Direct Bank Statement Match by UTR
        if bank_match:
            b_amt = bank_match["deposit"] if bank_match["deposit"] > 0 else bank_match["withdrawal"]
            b_dir = "CREDIT" if bank_match["deposit"] > 0 else "DEBIT"
            reconciliation_status = "RECONCILED"
            reason = "Reconciled with bank statement ledger"

            if abs(amt - b_amt) > 0.01:
                reconciliation_status = "ACTION_REQUIRED"
                reason = f"Amount mismatch: statement shows ₹{amt:,.2f}, ledger shows ₹{b_amt:,.2f}"
            elif direction != b_dir:
                reconciliation_status = "ACTION_REQUIRED"
                reason = f"Direction mismatch: statement shows {direction}, ledger shows {b_dir}"

            matched_records.append({
                "row_index": r["row_index"],
                "narration": narr,
                "amount": amt,
                "direction": direction,
                "extracted_utr": utr,
                "matched_type": "BANK_STATEMENT",
                "upi_gateway": None,
                "bank_statement": bank_match,
                "matched_invoice": None,
                "reconciliation_status": reconciliation_status,
                "reason": reason
            })
            continue

        # 3. Only run fuzzy vendor matching on unmatched rows where extracted_utr == "" or no UTR match found
        # Check if row mentions an exact invoice ID (e.g. INV-2026-XXXX)
        inv_matches = re.findall(r'INV-\d{4}-\d{4}', narr, re.IGNORECASE)
        top_tally = None

        if inv_matches:
            target_inv = inv_matches[0].upper()
            tally_exact = conn.execute("""
                SELECT t.invoice_id, t.vendor_name, t.total_amount, t.payout_status,
                       COALESCE(g.itc_eligible_amount, 0.0) AS gstr2b_itc,
                       COALESCE(g.filing_status, 'NOT_FILED') AS gstr2b_filing_status
                FROM tally_invoices t
                LEFT JOIN gstr2b_tax g ON t.invoice_id = g.invoice_num
                WHERE t.invoice_id = ?
                LIMIT 1;
            """, [target_inv]).fetchall()
            if tally_exact:
                top_tally = tally_exact[0]

        # If no invoice ID match, run capped fuzzy search
        if not top_tally:
            if fuzzy_scanned_count >= MAX_FUZZY_ROWS:
                truncated_fuzzy_count += 1
                unmatched_records.append({
                    "row_index": r["row_index"],
                    "narration": narr,
                    "amount": amt,
                    "direction": direction,
                    "extracted_utr": utr,
                    "reconciliation_status": "UNMATCHED_IN_LEDGER",
                    "reason": f"Fuzzy scan capped (max {MAX_FUZZY_ROWS} unmatched rows scanned)"
                })
                continue

            fuzzy_scanned_count += 1
            # Fast in-memory candidate evaluation across 153 pre-normalized vendors
            catalog = _get_vendors_catalog(conn)
            norm_n = norm_indic_vendor(narr)
            best_vendor = None
            best_sim = 0.0

            for v_name, norm_v in catalog:
                sim = jw_sim(norm_n, norm_v)
                if sim > best_sim:
                    best_sim = sim
                    best_vendor = v_name
                    if sim >= 0.98:
                        break

            if best_vendor and best_sim >= 0.88:
                tally_query = """
                SELECT t.invoice_id, t.vendor_name, t.total_amount, t.payout_status,
                       COALESCE(g.itc_eligible_amount, 0.0) AS gstr2b_itc,
                       COALESCE(g.filing_status, 'NOT_FILED') AS gstr2b_filing_status
                FROM tally_invoices t
                LEFT JOIN gstr2b_tax g ON t.invoice_id = g.invoice_num
                WHERE t.vendor_name = ?
                ORDER BY t.invoice_date DESC
                LIMIT 1;
                """
                fuzzy_matches = conn.execute(tally_query, [best_vendor]).fetchall()
                if fuzzy_matches:
                    top_tally = fuzzy_matches[0]

        if top_tally:
            t_amt = float(top_tally[2])
            gstr_status = top_tally[5]
            is_filed = gstr_status == "FILED"
            amt_matches = abs(amt - t_amt) <= 0.01

            reconciliation_status = "RECONCILED" if (is_filed and amt_matches) else "ACTION_REQUIRED"
            reason = "Reconciled with filed GSTR-2B Tally invoice" if reconciliation_status == "RECONCILED" else (
                f"ITC Hold: GSTR-2B {gstr_status}" if not is_filed else f"Amount mismatch: statement ₹{amt:,.2f} vs invoice ₹{t_amt:,.2f}"
            )

            matched_records.append({
                "row_index": r["row_index"],
                "narration": narr,
                "amount": amt,
                "direction": direction,
                "extracted_utr": utr,
                "matched_type": "TALLY_INVOICE",
                "upi_gateway": None,
                "bank_statement": None,
                "matched_invoice": {
                    "invoice_id": top_tally[0],
                    "vendor_name": top_tally[1],
                    "total_amount": t_amt,
                    "payout_status": top_tally[3],
                    "gstr2b_filing_status": gstr_status
                },
                "reconciliation_status": reconciliation_status,
                "reason": reason
            })
        else:
            unmatched_records.append({
                "row_index": r["row_index"],
                "narration": narr,
                "amount": amt,
                "direction": direction,
                "extracted_utr": utr,
                "reconciliation_status": "UNMATCHED_IN_LEDGER",
                "reason": "Not found in bank statement, Razorpay UPI, or Tally ledger"
            })

    elapsed_ms = round((time.time() - start) * 1000, 2)
    rec_count = len([m for m in matched_records if m.get("reconciliation_status") == "RECONCILED"])
    unrec_count = len(parsed_rows) - rec_count

    return StatementUploadResponse(
        filename=filename,
        total_rows=len(parsed_rows),
        reconciled_count=rec_count,
        unreconciled_count=unrec_count,
        matched_records=matched_records,
        unmatched_records=unmatched_records,
        truncated_fuzzy_count=truncated_fuzzy_count,
        summary=f"Processed {len(parsed_rows)} statement rows in {elapsed_ms}ms: {rec_count} reconciled, {unrec_count} require investigation or unrecorded.",
        latency_ms=elapsed_ms
    )
