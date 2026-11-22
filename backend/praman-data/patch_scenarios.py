"""Praman Financial Copilot - Scenario Patching Engine.
Deterministically injects canonical investigation scenarios into synthetic financial datasets.
"""
import os
import pandas as pd
import numpy as np
from pathlib import Path


def patch_all_scenarios(
    df_bank: pd.DataFrame,
    df_razorpay: pd.DataFrame,
    df_tally: pd.DataFrame,
    df_gstr2b: pd.DataFrame,
    df_commitments: pd.DataFrame,
    df_policies: pd.DataFrame
):
    """Deterministically patches 4 canonical investigation cases across all 6 DataFrames."""

    # =========================================================================
    # CASE 1 (CASE-GST-104): Sri Balaji Enterprises GSTIN & ITC Leakage with Decoys
    # =========================================================================
    # 1. Update or inject INV-2026-104 in Tally
    balaji_idx = df_tally.index[df_tally["invoice_id"] == "INV-2026-104"]
    if len(balaji_idx) > 0:
        target_idx = balaji_idx[0]
    else:
        target_idx = 103 if len(df_tally) > 103 else 0

    df_tally.loc[target_idx, "invoice_id"] = "INV-2026-104"
    df_tally.loc[target_idx, "invoice_date"] = "2026-11-10"
    df_tally.loc[target_idx, "vendor_name"] = "Sri Balaji Enterprises"
    df_tally.loc[target_idx, "vendor_gstin"] = "33AABCS1429B1Z2"
    df_tally.loc[target_idx, "taxable_value"] = 155932.20
    df_tally.loc[target_idx, "cgst_amount"] = 0.00
    df_tally.loc[target_idx, "sgst_amount"] = 0.00
    df_tally.loc[target_idx, "igst_amount"] = 28067.80
    df_tally.loc[target_idx, "total_amount"] = 184000.00
    df_tally.loc[target_idx, "payout_status"] = "PENDING_APPROVAL"
    df_tally.loc[target_idx, "vendor_ifsc"] = "KVBL0001245"

    # 2. Inject noisy narration for Sri Balaji in Bank Statement
    # e.g. at row index 3800
    if len(df_bank) > 3800:
        df_bank.loc[3800, "narration"] = "NEFT-DR-KVBL0001245-SRI BALJI ENT-UPI/632819045112-SETTLEMENT"
        df_bank.loc[3800, "ifsc_code"] = "KVBL0001245"

    # 3. Inject 8 Decoy companies in bank statement to test fuzzy-join robustness
    decoys = [
        ("Balaji Traders", "HDFC0000240", "NEFT-DR-HDFC0000240-BALAJI TRADERS-PURCHASE/481920384711"),
        ("Sri Balaji Packaging", "SBIN0000300", "RTGS-DR-SBIN0000300-SRI BALAJI PACKAGING-BOXES/102938475819"),
        ("Balaji Logistics & Cargo", "ICIC0000009", "NEFT-DR-ICIC0000009-BALAJI LOGISTICS-FREIGHT/992019384712"),
        ("Sri Balaji Steels", "UTIB0000004", "RTGS-DR-UTIB0000004-SRI BALAJI STEELS-RODS/881920384715"),
        ("Balaji Electrical Works", "PUNB0000100", "IMPS-DR-PUNB0000100-BALAJI ELECT WORKS-MAINT/771920384710"),
        ("Sri Balaji Agro Industries", "YESB0000001", "NEFT-DR-YESB0000001-SRI BALAJI AGRO-RAW/661920384718"),
        ("Balaji Transports", "KKBK0000001", "IMPS-DR-KKBK0000001-BALAJI TRANSPORTS-FLEET/551920384714"),
        ("Sri Balaji Enterprises and Co", "BARB0000002", "NEFT-DR-BARB0000002-SRI BALAJI ENT AND CO-GEN/441920384713"),
    ]
    for i, (name, ifsc, narr) in enumerate(decoys):
        decoy_idx = 3801 + i
        if decoy_idx < len(df_bank):
            df_bank.loc[decoy_idx, "narration"] = narr
            df_bank.loc[decoy_idx, "ifsc_code"] = ifsc

    # 4. In gstr2b_tax.csv, remove or nullify INV-2026-104 so it is missing / itc_eligible_amount = 0
    gstr_idx = df_gstr2b.index[df_gstr2b["invoice_num"] == "INV-2026-104"]
    if len(gstr_idx) > 0:
        df_gstr2b.loc[gstr_idx, "itc_eligible_amount"] = 0.00
        df_gstr2b.loc[gstr_idx, "filing_status"] = "NOT_FILED"
    else:
        # Ensure that no entry exists with full eligible credit for this invoice
        df_gstr2b = df_gstr2b[df_gstr2b["invoice_num"] != "INV-2026-104"].copy()

    # 5. In cashflow_commitments.csv: upcoming 30-day critical EMIs = 110,000.00 (HDFC Business Loan EMI due 2026-11-25)
    df_commitments.loc[0, "commitment_id"] = "COM-001"
    df_commitments.loc[0, "commitment_type"] = "LOAN_EMI"
    df_commitments.loc[0, "lender_or_payee"] = "HDFC Bank Business Banking (Loan A/c 50200091823)"
    df_commitments.loc[0, "due_date"] = "2026-11-25"
    df_commitments.loc[0, "amount"] = 110000.00
    df_commitments.loc[0, "priority"] = "CRITICAL_DEFAULT_RISK"

    # =========================================================================
    # CASE 2 (CASE-UPI-209): Customer UPI Double-Debit Chargeback of ₹14,500.00
    # =========================================================================
    # In razorpay_upi.csv:
    # Row 1: UTR 432910485711 failed at bank switch
    # Row 2: UTR 432910485799 captured and settled in bank_statement.csv
    rzp_len = len(df_razorpay)
    idx_fail = rzp_len - 2 if rzp_len >= 2 else 0
    idx_capt = rzp_len - 1 if rzp_len >= 2 else 1

    df_razorpay.loc[idx_fail, "payment_id"] = "pay_UPI209_FAIL"
    df_razorpay.loc[idx_fail, "order_id"] = "order_UPI209_432910"
    df_razorpay.loc[idx_fail, "created_at"] = "2026-11-14T14:22:10Z"
    df_razorpay.loc[idx_fail, "gross_amount"] = 14500.00
    df_razorpay.loc[idx_fail, "mdr_fee"] = 0.00
    df_razorpay.loc[idx_fail, "gst_on_fee"] = 0.00
    df_razorpay.loc[idx_fail, "net_settlement"] = 0.00
    df_razorpay.loc[idx_fail, "status"] = "failed_at_switch"
    df_razorpay.loc[idx_fail, "rrn_utr"] = "432910485711"
    df_razorpay.loc[idx_fail, "customer_vpa"] = "rajesh.verma@okaxis"

    df_razorpay.loc[idx_capt, "payment_id"] = "pay_UPI209_CAPT"
    df_razorpay.loc[idx_capt, "order_id"] = "order_UPI209_432999"
    df_razorpay.loc[idx_capt, "created_at"] = "2026-11-14T14:25:35Z"
    df_razorpay.loc[idx_capt, "gross_amount"] = 14500.00
    df_razorpay.loc[idx_capt, "mdr_fee"] = 0.00
    df_razorpay.loc[idx_capt, "gst_on_fee"] = 0.00
    df_razorpay.loc[idx_capt, "net_settlement"] = 14500.00
    df_razorpay.loc[idx_capt, "status"] = "captured"
    df_razorpay.loc[idx_capt, "rrn_utr"] = "432910485799"
    df_razorpay.loc[idx_capt, "customer_vpa"] = "rajesh.verma@okaxis"

    # In bank_statement.csv, credit settled for UTR 432910485799 under HDFC0000240
    if len(df_bank) > 3950:
        df_bank.loc[3950, "txn_date"] = "2026-11-15"
        df_bank.loc[3950, "narration"] = "UPI-CR-HDFC0000240-RAZORPAY NODAL SETTLEMENT-RRN432910485799"
        df_bank.loc[3950, "withdrawal"] = 0.00
        df_bank.loc[3950, "deposit"] = 14500.00
        df_bank.loc[3950, "ifsc_code"] = "HDFC0000240"

    # =========================================================================
    # CASE 3 (CASE-SLA-302): Enterprise SLA downtime dispute on INV-2026-881
    # =========================================================================
    # Total ₹84,000.00, company_policies mandates pro-rata credit of ₹5,600.00
    sla_idx = df_tally.index[df_tally["invoice_id"] == "INV-2026-881"]
    if len(sla_idx) > 0:
        t_sla = sla_idx[0]
    else:
        t_sla = 880 if len(df_tally) > 880 else 2

    df_tally.loc[t_sla, "invoice_id"] = "INV-2026-881"
    df_tally.loc[t_sla, "invoice_date"] = "2026-11-12"
    df_tally.loc[t_sla, "vendor_name"] = "CloudSphere Infrastructure Solutions Pvt Ltd"
    df_tally.loc[t_sla, "vendor_gstin"] = "27AAACC4918D1Z9"
    df_tally.loc[t_sla, "taxable_value"] = 71186.44
    df_tally.loc[t_sla, "cgst_amount"] = 0.00
    df_tally.loc[t_sla, "sgst_amount"] = 0.00
    df_tally.loc[t_sla, "igst_amount"] = 12813.56
    df_tally.loc[t_sla, "total_amount"] = 84000.00
    df_tally.loc[t_sla, "payout_status"] = "PENDING_APPROVAL"
    df_tally.loc[t_sla, "vendor_ifsc"] = "HDFC0000240"

    # In company_policies.csv:
    df_policies.loc[0, "policy_id"] = "POL-SLA-01"
    df_policies.loc[0, "domain"] = "SLA_DISPUTE"
    df_policies.loc[0, "title"] = "Vendor Downtime & Cloud Infrastructure SLA Penalty Policy"
    df_policies.loc[0, "rule_body"] = (
        "In the event of vendor cloud/service downtime exceeding 99.5% SLA commitment, a pro-rata service "
        "credit of exactly ₹5,600.00 shall be deducted via debit note from invoice INV-2026-881 prior to approving payment, "
        "rather than granting a full refund or unverified debit write-off."
    )
    df_policies.loc[0, "section_ref"] = "SEC-4.2"

    # Update POL-003 to accurately reflect CGST Section 16(2)(aa) and Section 16(4)
    pol3_idx = df_policies.index[df_policies["policy_id"] == "POL-003"]
    if len(pol3_idx) > 0:
        p3 = pol3_idx[0]
        df_policies.loc[p3, "title"] = "CGST Section 16(2)(aa) & Section 16(4) Mandatory ITC Matching Policy"
        df_policies.loc[p3, "rule_body"] = (
            "Under Section 16(2)(aa) of the CGST Act 2017, Input Tax Credit cannot be availed in GSTR-3B unless reflected in GSTR-2B. "
            "Vendor invoices lacking matching entries in GSTR-2B must have their GST portion placed on statutory payment hold "
            "(blocked working-capital risk) until the supplier furnishes GSTR-1. Credit remains recoverable under Section 16(4) "
            "if claimed on or before 30th November following the end of the financial year."
        )

    # =========================================================================
    # CASE 4 (CASE-DUP-404): Duplicate Disbursement Risk via Split Bank Transfers
    # =========================================================================
    dup_idx = df_tally.index[df_tally["invoice_id"] == "INV-2026-404"]
    if len(dup_idx) > 0:
        t_dup = dup_idx[0]
    else:
        t_dup = 403 if len(df_tally) > 403 else 3

    df_tally.loc[t_dup, "invoice_id"] = "INV-2026-404"
    df_tally.loc[t_dup, "invoice_date"] = "2026-11-05"
    df_tally.loc[t_dup, "vendor_name"] = "Apex Logistics Global Pvt Ltd"
    df_tally.loc[t_dup, "vendor_gstin"] = "29AABCA5512E1Z3"
    df_tally.loc[t_dup, "taxable_value"] = 105932.20
    df_tally.loc[t_dup, "cgst_amount"] = 9533.90
    df_tally.loc[t_dup, "sgst_amount"] = 9533.90
    df_tally.loc[t_dup, "igst_amount"] = 0.00
    df_tally.loc[t_dup, "total_amount"] = 125000.00
    df_tally.loc[t_dup, "payout_status"] = "PENDING_APPROVAL"  # Error in ERP: still pending despite split payout
    df_tally.loc[t_dup, "vendor_ifsc"] = "ICIC0000009"

    # In bank statement: two split transfers of 62,500.00 each
    if len(df_bank) > 3750:
        df_bank.loc[3740, "txn_date"] = "2026-11-06"
        df_bank.loc[3740, "narration"] = "NEFT-DR-ICIC0000009-APEX LOGISTICS-INV-2026-404/PART1-PO8921"
        df_bank.loc[3740, "withdrawal"] = 62500.00
        df_bank.loc[3740, "deposit"] = 0.00
        df_bank.loc[3740, "ifsc_code"] = "ICIC0000009"

        df_bank.loc[3741, "txn_date"] = "2026-11-06"
        df_bank.loc[3741, "narration"] = "NEFT-DR-ICIC0000009-APEX LOGISTICS-INV-2026-404/PART2-PO8921"
        df_bank.loc[3741, "withdrawal"] = 62500.00
        df_bank.loc[3741, "deposit"] = 0.00
        df_bank.loc[3741, "ifsc_code"] = "ICIC0000009"

    # =========================================================================
    # RECALCULATE RUNNING BALANCE FOR BANK STATEMENT
    # Strict chronological forward integration from opening balance ₹12,50,000.00
    # Enforces mutual exclusivity and lands organically at target ₹3,12,450.00
    # =========================================================================
    # Sort bank statement chronologically by txn_date and row_id
    df_bank.sort_values(by=["txn_date", "row_id"], inplace=True)
    df_bank.reset_index(drop=True, inplace=True)

    opening_balance = 1250000.00
    target_final_balance = 312450.00
    min_limit = 250000.00
    n_rows = len(df_bank)

    # 1. Enforce strict mutual exclusivity on every row
    for i in range(n_rows):
        dep = df_bank.loc[i, "deposit"]
        wdr = df_bank.loc[i, "withdrawal"]
        if dep > 0 and wdr > 0:
            df_bank.loc[i, "withdrawal"] = 0.00
        elif dep == 0 and wdr == 0:
            df_bank.loc[i, "deposit"] = 1500.00

    # 2. Forward integration
    curr = opening_balance
    balances = []
    protected_indices = {3740, 3741, 3800, 3950}

    for i in range(n_rows - 1):
        dep = df_bank.loc[i, "deposit"]
        wdr = df_bank.loc[i, "withdrawal"]
        curr += (dep - wdr)

        # Ensure buffer doesn't dip below ₹2.5L
        if curr < min_limit and wdr > 1000.00 and i not in protected_indices:
            correction = min_limit + 15000.00 - curr
            df_bank.loc[i, "withdrawal"] = max(0.00, round(wdr - correction, 2))
            curr += correction

        balances.append(round(curr, 2))

    # Calibrate final row to land organically on target_final_balance
    final_diff = round(target_final_balance - curr, 2)
    last_i = n_rows - 1
    if final_diff > 0:
        df_bank.loc[last_i, "deposit"] = final_diff
        df_bank.loc[last_i, "withdrawal"] = 0.00
    else:
        df_bank.loc[last_i, "deposit"] = 0.00
        df_bank.loc[last_i, "withdrawal"] = abs(final_diff)
    balances.append(target_final_balance)

    df_bank["running_balance"] = np.round(balances, 2)

    return df_bank, df_razorpay, df_tally, df_gstr2b, df_commitments, df_policies


def main():
    raw_dir = Path(__file__).resolve().parent / "raw_csvs"
    if not raw_dir.exists():
        print(f"Directory {raw_dir} does not exist.")
        return

    csv_files = [
        "bank_statement.csv",
        "razorpay_upi.csv",
        "tally_invoices.csv",
        "gstr2b_tax.csv",
        "cashflow_commitments.csv",
        "company_policies.csv"
    ]
    for f in csv_files:
        if not (raw_dir / f).exists():
            print(f"Missing {f} in {raw_dir}. Run generator.py first.")
            return

    print("Loading CSVs for deterministic scenario patching...")
    df_bank = pd.read_csv(raw_dir / "bank_statement.csv")
    df_razorpay = pd.read_csv(raw_dir / "razorpay_upi.csv")
    df_tally = pd.read_csv(raw_dir / "tally_invoices.csv")
    df_gstr2b = pd.read_csv(raw_dir / "gstr2b_tax.csv")
    df_commitments = pd.read_csv(raw_dir / "cashflow_commitments.csv")
    df_policies = pd.read_csv(raw_dir / "company_policies.csv")

    df_bank, df_razorpay, df_tally, df_gstr2b, df_commitments, df_policies = patch_all_scenarios(
        df_bank, df_razorpay, df_tally, df_gstr2b, df_commitments, df_policies
    )

    print("Saving patched CSVs...")
    df_bank.to_csv(raw_dir / "bank_statement.csv", index=False)
    df_razorpay.to_csv(raw_dir / "razorpay_upi.csv", index=False)
    df_tally.to_csv(raw_dir / "tally_invoices.csv", index=False)
    df_gstr2b.to_csv(raw_dir / "gstr2b_tax.csv", index=False)
    df_commitments.to_csv(raw_dir / "cashflow_commitments.csv", index=False)
    df_policies.to_csv(raw_dir / "company_policies.csv", index=False)
    print("Scenarios patched successfully!")


if __name__ == "__main__":
    main()
