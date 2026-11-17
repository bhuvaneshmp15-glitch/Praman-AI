"""Praman Financial Copilot - Synthetic Data Generator.
Generates 10,000+ realistic, noisy Indian financial records across 6 CSV datasets.
"""
import os
import random
from datetime import datetime, timedelta
from pathlib import Path
import numpy as np
import pandas as pd
from faker import Faker

# Fixed random seed for deterministic reproducibility
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

fake = Faker("en_IN")
Faker.seed(RANDOM_SEED)

# Reference IFSC codes from major Indian commercial banks
REAL_IFSC_CODES = [
    "HDFC0000240",  # HDFC Bank, Fort, Mumbai
    "ICIC0000009",  # ICICI Bank, Connaught Place, New Delhi
    "SBIN0000300",  # State Bank of India, Kolkata Main
    "KVBL0001245",  # Karur Vysya Bank, Chennai Main
    "UTIB0000004",  # Axis Bank, Bengaluru
    "PUNB0000100",  # Punjab National Bank, Delhi
    "YESB0000001",  # Yes Bank, Worli, Mumbai
    "KKBK0000001",  # Kotak Mahindra Bank, Nariman Point
    "BARB0000002",  # Bank of Baroda, Mandvi
    "CNRB0000101",  # Canara Bank, Bangalore
]

STATE_CODES = ["27", "33", "29", "07", "24", "19", "09", "06", "36", "32"]
PAN_CHARS = "ABCDE"


def generate_valid_gstin(state_code: str = None) -> str:
    """Generates a valid-format 15-character Indian GSTIN."""
    st = state_code or random.choice(STATE_CODES)
    pan_alpha = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=3)) + random.choice("CFHPT") + random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    pan_digits = f"{random.randint(1000, 9999)}"
    pan_check = random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    entity_num = str(random.randint(1, 9))
    check_char = random.choice("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    return f"{st}{pan_alpha}{pan_digits}{pan_check}{entity_num}Z{check_char}"


def generate_company_name() -> str:
    """Generates realistic Indian SME vendor and business trade names."""
    suffixes = [
        "Enterprises", "Industries", "Technologies Pvt Ltd", "Logistics",
        "Solutions", "Infotech", "Trading Co", "Engineering Works",
        "Textiles", "Chemicals Ltd", "Electricals", "Packaging"
    ]
    name_prefixes = [
        "Sri Lakshmi", "Balaji", "Om Sai", "Venkateshwara", "Radhe Shyam",
        "Apex", "Zenith", "Surya", "Bharat", "Kaveri", "Delta", "Navkar",
        "Patel", "Sharma", "Agarwal", "Murugan", "Ganpati", "Swastik"
    ]
    return f"{random.choice(name_prefixes)} {random.choice(suffixes)}"


def generate_datasets(output_dir: Path):
    """Generates 10,000+ realistic rows across all 6 raw CSV files."""
    output_dir.mkdir(parents=True, exist_ok=True)
    start_date = datetime(2026, 6, 1)
    end_date = datetime(2026, 11, 18)
    date_range_days = (end_date - start_date).days

    print(f"Generating datasets in {output_dir} with seed={RANDOM_SEED}...")

    # =========================================================================
    # 1. TALLY INVOICES (1,800 rows)
    # =========================================================================
    print("Generating tally_invoices.csv (1,800 rows)...")
    tally_rows = []
    vendor_registry = []
    for _ in range(250):
        v_name = generate_company_name()
        v_gstin = generate_valid_gstin()
        v_ifsc = random.choice(REAL_IFSC_CODES)
        vendor_registry.append((v_name, v_gstin, v_ifsc))

    for i in range(1, 1801):
        inv_id = f"INV-2026-{i:04d}"
        days_offset = random.randint(0, date_range_days)
        inv_date = (start_date + timedelta(days=days_offset)).strftime("%Y-%m-%d")
        vendor = random.choice(vendor_registry)
        
        # Realistic Indian B2B ticket sizes: ₹5,000 to ₹4,50,000
        taxable_val = round(float(random.choice([
            random.uniform(5000, 25000),
            random.uniform(25000, 100000),
            random.uniform(100000, 350000),
            random.uniform(350000, 600000)
        ])), 2)

        # Inter-state (IGST 18%) vs Intra-state (CGST 9% + SGST 9%)
        is_interstate = random.random() < 0.45
        if is_interstate:
            cgst = 0.00
            sgst = 0.00
            igst = round(taxable_val * 0.18, 2)
        else:
            cgst = round(taxable_val * 0.09, 2)
            sgst = round(taxable_val * 0.09, 2)
            igst = 0.00

        total_amt = round(taxable_val + cgst + sgst + igst, 2)
        payout_status = random.choices(["PAID", "PENDING_APPROVAL", "ON_HOLD"], weights=[0.65, 0.28, 0.07])[0]

        tally_rows.append({
            "invoice_id": inv_id,
            "invoice_date": inv_date,
            "vendor_name": vendor[0],
            "vendor_gstin": vendor[1],
            "taxable_value": taxable_val,
            "cgst_amount": cgst,
            "sgst_amount": sgst,
            "igst_amount": igst,
            "total_amount": total_amt,
            "payout_status": payout_status,
            "vendor_ifsc": vendor[2]
        })

    df_tally = pd.DataFrame(tally_rows)

    # =========================================================================
    # 2. GSTR-2B TAX (1,700 rows)
    # =========================================================================
    print("Generating gstr2b_tax.csv (1,700 rows)...")
    gstr_rows = []
    # 1,700 rows matching invoices from Tally (simulating realistic supplier auto-population)
    for i in range(1700):
        inv = tally_rows[i]
        inv_dt = datetime.strptime(inv["invoice_date"], "%Y-%m-%d")
        filing_period = inv_dt.strftime("%Y-%m")
        itc_eligible = round(inv["cgst_amount"] + inv["sgst_amount"] + inv["igst_amount"], 2)
        filing_status = random.choices(["FILED", "NOT_FILED"], weights=[0.95, 0.05])[0]

        gstr_rows.append({
            "gstr2b_id": f"G2B-{i+1:04d}",
            "gstin_supplier": inv["vendor_gstin"],
            "legal_trade_name": inv["vendor_name"],
            "invoice_num": inv["invoice_id"],
            "filing_period": filing_period,
            "taxable_val": inv["taxable_value"],
            "itc_eligible_amount": itc_eligible if filing_status == "FILED" else 0.00,
            "filing_status": filing_status
        })

    df_gstr2b = pd.DataFrame(gstr_rows)

    # =========================================================================
    # 3. RAZORPAY UPI (2,500 rows)
    # =========================================================================
    print("Generating razorpay_upi.csv (2,500 rows)...")
    vpa_handles = ["okhdfcbank", "okicici", "okaxis", "paytm", "ybl", "upi", "postbank"]
    razorpay_rows = []
    for i in range(1, 2501):
        pay_id = f"pay_Rzp{i:07d}"
        order_id = f"order_Ord{i:07d}"
        days_offset = random.randint(0, date_range_days)
        hrs = random.randint(8, 22)
        mins = random.randint(0, 59)
        secs = random.randint(0, 59)
        dt = (start_date + timedelta(days=days_offset, hours=hrs, minutes=mins, seconds=secs))
        created_at = dt.strftime("%Y-%m-%dT%H:%M:%SZ")

        # Indian D2C / B2B UPI ticket sizes: ₹150 to ₹75,000
        gross_amt = round(float(random.choice([
            random.uniform(150, 2500),
            random.uniform(2500, 15000),
            random.uniform(15000, 50000),
            random.uniform(50000, 75000)
        ])), 2)

        status = random.choices(
            ["captured", "failed_at_switch", "refunded", "disputed"],
            weights=[0.88, 0.07, 0.03, 0.02]
        )[0]

        if status == "captured":
            mdr_fee = round(gross_amt * 0.02, 2)  # 2.0% standard PG MDR
            gst_on_fee = round(mdr_fee * 0.18, 2) # 18% GST on MDR
            net_settlement = round(gross_amt - mdr_fee - gst_on_fee, 2)
        else:
            mdr_fee = 0.00
            gst_on_fee = 0.00
            net_settlement = 0.00

        rrn_utr = f"{random.randint(100000000000, 999999999999)}"
        cust_vpa = f"{fake.user_name().lower()}{random.randint(10, 99)}@{random.choice(vpa_handles)}"

        razorpay_rows.append({
            "payment_id": pay_id,
            "order_id": order_id,
            "created_at": created_at,
            "gross_amount": gross_amt,
            "mdr_fee": mdr_fee,
            "gst_on_fee": gst_on_fee,
            "net_settlement": net_settlement,
            "status": status,
            "rrn_utr": rrn_utr,
            "customer_vpa": cust_vpa
        })

    df_razorpay = pd.DataFrame(razorpay_rows)

    # =========================================================================
    # 4. BANK STATEMENT (4,000 rows)
    # =========================================================================
    print("Generating bank_statement.csv (4,000 rows)...")
    bank_rows = []
    # Generate 4,000 timestamps evenly across June 1, 2026 to Nov 18, 2026
    timestamps = sorted([
        start_date + timedelta(seconds=random.randint(0, int(date_range_days * 86400)))
        for _ in range(4000)
    ])
    # Ensure final timestamp is Nov 18, 2026
    timestamps[-1] = datetime(2026, 11, 18, 17, 30, 0)

    for i in range(4000):
        row_id = f"BNK-{i+1:04d}"
        txn_dt = timestamps[i].strftime("%Y-%m-%d")
        ifsc = random.choice(REAL_IFSC_CODES)

        is_deposit = random.random() < 0.48
        if is_deposit:
            # Razorpay settlement, customer NEFT credit, POS swipe, investor advance
            deposit = round(float(random.choice([
                random.uniform(5000, 35000),
                random.uniform(35000, 120000),
                random.uniform(120000, 450000)
            ])), 2)
            withdrawal = 0.00
            utr_sample = random.randint(100000000000, 999999999999)
            patterns = [
                f"UPI-CR-{ifsc}-RAZORPAY NODAL SETTLEMENT-RRN/{utr_sample}",
                f"NEFT-CR-{ifsc}-{generate_company_name()[:15].upper()}-SETTLEMENT/{utr_sample}",
                f"RTGS-CR-{ifsc}-CLIENT INVOICE RECEIPT-UTR/{utr_sample}",
                f"POS-CR-{ifsc}-PAYTM SWIPE MERCHANT CR/{utr_sample}"
            ]
            narration = random.choice(patterns)
        else:
            # Supplier payout, payroll, loan EMI, GST challan, rent
            withdrawal = round(float(random.choice([
                random.uniform(4000, 30000),
                random.uniform(30000, 115000),
                random.uniform(115000, 400000)
            ])), 2)
            deposit = 0.00
            utr_sample = random.randint(100000000000, 999999999999)
            patterns = [
                f"NEFT-DR-{ifsc}-{generate_company_name()[:15].upper()}-PAYMENT/{utr_sample}",
                f"RTGS-DR-{ifsc}-VENDOR SETTLEMENT-INV/PO{random.randint(1000, 9999)}",
                f"IMPS-DR-{ifsc}-STAFF REIMBURSEMENT-REF/{utr_sample}",
                f"ACH-DR-{ifsc}-COMMERCIAL LOAN EMI DEBIT/ACH{utr_sample}",
                f"GST-DR-{ifsc}-CBIC GST PMT06 CHALLAN DEBIT/{utr_sample}"
            ]
            narration = random.choice(patterns)

        bank_rows.append({
            "row_id": row_id,
            "txn_date": txn_dt,
            "narration": narration,
            "withdrawal": withdrawal,
            "deposit": deposit,
            "running_balance": 0.00,  # Will be calculated backwards precisely in patch_scenarios
            "ifsc_code": ifsc
        })

    df_bank = pd.DataFrame(bank_rows)

    # =========================================================================
    # 5. CASHFLOW COMMITMENTS (25 rows)
    # =========================================================================
    print("Generating cashflow_commitments.csv (25 rows)...")
    commitments_data = [
        ("COM-001", "LOAN_EMI", "HDFC Bank Business Banking (Loan A/c 50200091823)", "2026-11-25", 110000.00, "CRITICAL_DEFAULT_RISK"),
        ("COM-002", "PAYROLL", "SME Monthly Executive & Engineering Payroll Disbursement", "2026-11-30", 380000.00, "CRITICAL_DEFAULT_RISK"),
        ("COM-003", "RENT", "Commercial Warehouse Lease - Bhiwandi Logistics Complex", "2026-12-05", 95000.00, "HIGH"),
        ("COM-004", "GST_CHALLAN", "Goods & Services Tax Network (GSTN) Monthly PMT-06", "2026-11-20", 84500.00, "CRITICAL_DEFAULT_RISK"),
        ("COM-005", "LOAN_EMI", "ICICI Bank Machinery & Equipment Term Loan", "2026-12-01", 65000.00, "HIGH"),
        ("COM-006", "PAYROLL", "Contract Logistics & Security Staff Fortnightly Payout", "2026-11-22", 45000.00, "HIGH"),
        ("COM-007", "RENT", "Corporate Headquarters Lease - DLF Horizon Tower", "2026-12-01", 125000.00, "HIGH"),
        ("COM-008", "GST_CHALLAN", "TDS Deductions Treasury Challan Section 194C / 194J", "2026-12-07", 38200.00, "HIGH"),
        ("COM-009", "LOAN_EMI", "SBI Working Capital Credit Line Minimum Interest", "2026-11-28", 42000.00, "NORMAL"),
        ("COM-010", "PAYROLL", "Sales Team Incentive & Commission Pool", "2026-12-10", 52000.00, "NORMAL"),
        ("COM-011", "RENT", "Regional Hub Lease - Chennai Guindy Estate", "2026-12-05", 35000.00, "NORMAL"),
        ("COM-012", "LOAN_EMI", "Kotak Commercial Vehicle Fleet Hypothecation EMI", "2026-12-03", 28000.00, "NORMAL"),
        ("COM-013", "GST_CHALLAN", "Professional Tax State Statutory Remittance", "2026-11-26", 14500.00, "NORMAL"),
        ("COM-014", "PAYROLL", "Employee Provident Fund (EPFO) Monthly ECR Deposit", "2026-12-15", 48000.00, "HIGH"),
        ("COM-015", "RENT", "Branch Office Space - Pune Baner High Street", "2026-12-05", 40000.00, "NORMAL"),
        ("COM-016", "LOAN_EMI", "Axis Bank Short-Term Invoice Discounting Facility", "2026-12-12", 72000.00, "NORMAL"),
        ("COM-017", "PAYROLL", "Employee State Insurance (ESIC) Statutory Contribution", "2026-12-15", 16800.00, "NORMAL"),
        ("COM-018", "GST_CHALLAN", "Advance Corporate Income Tax Q3 Instalment", "2026-12-15", 185000.00, "CRITICAL_DEFAULT_RISK"),
        ("COM-019", "RENT", "Secondary Transit Storage - Hyderabad Shamshabad", "2026-12-01", 22000.00, "NORMAL"),
        ("COM-020", "LOAN_EMI", "Tata Capital Supply Chain Credit Facility", "2026-12-20", 34000.00, "NORMAL"),
        ("COM-021", "PAYROLL", "Customer Support & BPO Vendor Monthly Retainer", "2026-12-08", 68000.00, "NORMAL"),
        ("COM-022", "RENT", "Server Rack Colocation Facility - Sify Data Center", "2026-12-02", 45000.00, "NORMAL"),
        ("COM-023", "LOAN_EMI", "Bajaj Finserv Business Overdraft Interest", "2026-12-18", 19500.00, "NORMAL"),
        ("COM-024", "GST_CHALLAN", "Municipal Corporation Commercial Property Tax", "2026-12-22", 18000.00, "NORMAL"),
        ("COM-025", "PAYROLL", "Annual Gratuity Trust Statutory Reserve Allocation", "2026-12-28", 50000.00, "NORMAL"),
    ]
    df_commitments = pd.DataFrame(commitments_data, columns=[
        "commitment_id", "commitment_type", "lender_or_payee", "due_date", "amount", "priority"
    ])

    # =========================================================================
    # 6. COMPANY POLICIES (15 rows)
    # =========================================================================
    print("Generating company_policies.csv (15 rows)...")
    policies_data = [
        (
            "POL-001", "SLA_DISPUTE", "Vendor Downtime & Cloud Infrastructure SLA Penalty Policy",
            "In the event of vendor cloud/service downtime exceeding 99.5% SLA commitment, a pro-rata service credit of exactly ₹5,600.00 shall be deducted via debit note from invoice INV-2026-881 prior to approving payment, rather than granting a full refund or unverified debit write-off.",
            "SEC-4.2"
        ),
        (
            "POL-002", "LIQUIDITY_BUFFER", "Statutory Solvency & Minimum Debt Service Reserve Ratio",
            "No non-essential vendor disbursement may be approved if the projected post-settlement bank balance falls within ₹1,10,000.00 of upcoming CRITICAL_DEFAULT_RISK loan EMIs due within 15 calendar days.",
            "SEC-1.1"
        ),
        (
            "POL-003", "GST_RECONCILIATION", "CGST Section 16(2)(aa) & Rule 36(4) Mandatory ITC Verification",
            "Vendor invoices lacking matching entries in GSTR-2B or possessing zero eligible ITC must be placed on immediate payment hold to avoid cash outflow on non-creditable input taxes.",
            "SEC-2.3"
        ),
        (
            "POL-004", "CHARGEBACK_RESOLUTION", "UPI Bank Switch Failure & Nodal Double-Debit Resolution",
            "Where a customer reports a double debit but the payment gateway logs indicate status failed_at_switch, funds remain in the banking switch/issuing bank node and are slated for automated RBI circular clearing. Merchants must not initiate double refunds.",
            "SEC-3.1"
        ),
        (
            "POL-005", "PAYOUT_APPROVAL", "Split Payment & Multi-UTR Duplicate Payout Prevention",
            "Accounts payable must inspect bank statement debits for split-disbursements against common purchase orders before executing single-tranche approval for pending ledger invoices.",
            "SEC-5.0"
        ),
        (
            "POL-006", "GST_RECONCILIATION", "Vendor GSTIN State Code & Name Discrepancy Tolerance",
            "Supplier entity names in bank narrations must be cross-matched against GSTIN records using a minimum normalized Jaro-Winkler threshold of 0.92 to prevent false-positive matching against phonetic decoys.",
            "SEC-2.5"
        ),
        (
            "POL-007", "LIQUIDITY_BUFFER", "Emergency Operating Reserve Threshold",
            "A non-negotiable operational liquidity buffer of ₹50,000.00 must be retained in the primary clearing account at all times following all scheduled debits.",
            "SEC-1.4"
        ),
        (
            "POL-008", "PAYOUT_APPROVAL", "Dual Authorization Threshold for High-Value Payouts",
            "All outbound transfers exceeding ₹1,00,000.00 require secondary approval from the Head of Finance after three-way matching against PO, GRN, and GSTR-2B.",
            "SEC-5.2"
        ),
        (
            "POL-009", "CHARGEBACK_RESOLUTION", "Payment Gateway MDR & Settlement Fee Audit",
            "Payment gateway settlements must be audited daily to verify that MDR fees do not exceed 2.0% plus applicable 18% GST.",
            "SEC-3.4"
        ),
        (
            "POL-010", "SLA_DISPUTE", "Escalation Matrix for Recurring Vendor SLA Failures",
            "Vendors incurring more than two SLA penalties in a rolling 90-day window shall be placed on supplier probation with payment terms extended from Net-30 to Net-60.",
            "SEC-4.5"
        ),
        (
            "POL-011", "PAYOUT_APPROVAL", "Real-Time IFSC Validation Requirement",
            "Outbound NEFT/RTGS beneficiary IFSC codes must be checked against RBI master directory or Razorpay IFSC validator to ensure active branch routing.",
            "SEC-5.4"
        ),
        (
            "POL-012", "GST_RECONCILIATION", "GSTR-2B Filing Cutoff Date Rules",
            "GSTR-2B downloads on the 14th of each month represent the final binding tax baseline for supplier payments due between the 15th and end of the month.",
            "SEC-2.1"
        ),
        (
            "POL-013", "LIQUIDITY_BUFFER", "Payroll Priority Ring-Fencing",
            "Funds allocated for monthly payroll (scheduled on the last calendar day of the month) are legally ring-fenced 5 business days in advance and cannot be diverted to trade creditors.",
            "SEC-1.2"
        ),
        (
            "POL-014", "PAYOUT_APPROVAL", "MSMED Act Section 15 Compliance for Micro & Small Enterprises",
            "Registered MSME vendors with valid UDYAM certificates must be paid within 45 days of invoice acceptance, provided GSTR-2B compliance is satisfied.",
            "SEC-5.6"
        ),
        (
            "POL-015", "SLA_DISPUTE", "Debit Note Issuance Protocol",
            "Approved SLA penalty deductions must be accompanied by an officially generated debit note referencing the contract clause, vendor ticket number, and root cause analysis.",
            "SEC-4.8"
        ),
    ]
    df_policies = pd.DataFrame(policies_data, columns=[
        "policy_id", "domain", "title", "rule_body", "section_ref"
    ])

    # =========================================================================
    # IMPORT AND APPLY DETERMINISTIC SCENARIO PATCHING
    # =========================================================================
    print("Applying canonical scenario patches...")
    from patch_scenarios import patch_all_scenarios
    df_bank, df_razorpay, df_tally, df_gstr2b, df_commitments, df_policies = patch_all_scenarios(
        df_bank, df_razorpay, df_tally, df_gstr2b, df_commitments, df_policies
    )

    # =========================================================================
    # WRITE RAW CSVS TO DISK
    # =========================================================================
    print("Writing CSV files to disk...")
    df_bank.to_csv(output_dir / "bank_statement.csv", index=False)
    df_razorpay.to_csv(output_dir / "razorpay_upi.csv", index=False)
    df_tally.to_csv(output_dir / "tally_invoices.csv", index=False)
    df_gstr2b.to_csv(output_dir / "gstr2b_tax.csv", index=False)
    df_commitments.to_csv(output_dir / "cashflow_commitments.csv", index=False)
    df_policies.to_csv(output_dir / "company_policies.csv", index=False)

    total_rows = len(df_bank) + len(df_razorpay) + len(df_tally) + len(df_gstr2b) + len(df_commitments) + len(df_policies)
    print("\nGeneration and Scenario Patching Complete!")
    print(f"- bank_statement.csv:      {len(df_bank):>5} rows")
    print(f"- razorpay_upi.csv:        {len(df_razorpay):>5} rows")
    print(f"- tally_invoices.csv:      {len(df_tally):>5} rows")
    print(f"- gstr2b_tax.csv:          {len(df_gstr2b):>5} rows")
    print(f"- cashflow_commitments.csv:{len(df_commitments):>5} rows")
    print(f"- company_policies.csv:    {len(df_policies):>5} rows")
    print(f"Total Rows:                {total_rows:>5} rows (Target: 10,000+)")

    return {
        "bank": df_bank,
        "razorpay": df_razorpay,
        "tally": df_tally,
        "gstr2b": df_gstr2b,
        "commitments": df_commitments,
        "policies": df_policies
    }


def main():
    raw_dir = Path(__file__).resolve().parent / "raw_csvs"
    generate_datasets(raw_dir)


if __name__ == "__main__":
    main()
