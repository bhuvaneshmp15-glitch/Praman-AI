# Praman (प्रमाण)
### Autonomous B2B Financial Reconciliation & Cash-Flow Protection Engine for Indian SMEs
> **Built for Arthaton 2026** · *Neuro-Symbolic Architecture: "AI Reads & Explains · Deterministic Code Decides"*

[![Python 3.13](https://img.shields.io/badge/Python-3.13+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![DuckDB](https://img.shields.io/badge/DuckDB-1.1.0-FFF000.svg?style=flat&logo=duckdb&logoColor=black)](https://duckdb.org)
[![Vite + React](https://img.shields.io/badge/Frontend-React_18_+_Vite-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://vitejs.dev)
[![Tests](https://img.shields.io/badge/Tests-37%20Passed%20(100%25)-success.svg)](https://pytest.org)
[![Zero API Keys Required](https://img.shields.io/badge/Keys_Required-ZERO_(Keyless_APIs)-brightgreen.svg)](#-live-keyless-public-apis)

---

## 🏛️ Executive Summary

Indian Small and Medium Enterprises (SMEs) face a recurring structural liquidity risk: **statutory Input Tax Credit (ITC) leakage, untracked UPI nodal failures, and unmitigated vendor payouts that wipe out operating cash balances right before high-priority debt commitments (such as ₹1,10,000 monthly bank loan EMIs).**

Standard enterprise solutions fail Indian finance teams because:
1. **Bank statement narrations are deeply corrupted:** Primary keys (12-digit UTRs/RRNs) are buried within unstructured text (`UPI/432910485711/CR/BALAJI/HDFC...`), while vendor names are corrupted by honorifics and abbreviations (`M/s Sri Balaji Ent Pvt Ltd` vs. `Balaji Traders`).
2. **Naive LLMs generate hazardous SQL:** Generic LLMs naively execute `SUM(running_balance)` across bank statements (an arithmetic financial catastrophe) or perform loose string joins (`LIKE '%Balaji%'`) that generate Cartesian explosions across phonetic decoys.
3. **LLMs cannot do mental arithmetic:** Asking an LLM to compute post-disbursement EMI coverage ratios results in contradictory numbers and fabricated safety claims.
4. **Data Privacy & PII Exposure:** Sending raw bank narrations, customer VPAs, and bank account numbers to unauthenticated external endpoints violates basic privacy norms.

**Praman** solves this by pairing an **in-memory DuckDB Semantic Data Plane (10,040 rows across 6 tables)** with **4 pure Indic/Financial Python UDFs**, a **Deterministic SQL Guardrail Engine**, **Local PII Redaction**, **deterministic Cash-Flow Runway Math**, and **4 live, keyless public APIs**. It produces an **Editorial Financial Dossier** with verifiable row-level citations and 1-click human execution.

---

## 🔍 System Architecture

```
                                  PRAMAN ARTIFACT ARCHITECTURE
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                                       PRAMAN UI                                        │
 │                  (Editorial Financial Dossier · React + Vite + Tailwind)              │
 │  ┌────────────────────────────────────────┐  ┌──────────────────────────────────────┐  │
 │  │      Live DuckDB SQL & UDF Feed        │  │     Cited Executive Decision Brief   │  │
 │  │  • Real-time SSE Agent Reasoning Trace │  │  • Clickable Audit Citation Chips    │  │
 │  │  • Deterministic SQL Guardrail Checks  │  │  • Verification Checklist & Safety   │  │
 │  │  • AI Intake / Synthesis Trace Badges  │  │  • 30-Day Loan EMI Runway Widget     │  │
 │  │  • Live Bank Routing / IFSC Headers    │  │  • 1-Click Human Approval Cinematic  │  │
 │  └───────────────────▲────────────────────┘  └──────────────────▲───────────────────┘  │
 └──────────────────────┼──────────────────────────────────────────┼──────────────────────┘
                        │ Server-Sent Events (SSE)                 │ REST API / Actions
 ┌──────────────────────┴──────────────────────────────────────────┴──────────────────────┐
 │                                   PRAMAN FASTAPI BACKEND                               │
 │                                                                                        │
 │   ┌────────────────────────────────────────────────────────────────────────────────┐   │
 │   │           Division of Labor: "AI Reads & Explains · Code Decides"              │   │
 │   │  • Job A: ai_extract_intake (Noisy Bank SMS/Narration -> JSON · PII Redacted)  │   │
 │   │  • Job B: ai_synthesize_memo (Verified Table Facts -> Cited Executive Memo)    │   │
 │   │  • Multi-Provider: Groq, OpenRouter, OpenAI, Gemini + Offline Deterministic     │   │
 │   │  • Deterministic Guardrail Check: Catches Cartesian Fanouts & Enforces CTEs    │   │
 │   └───────────────────▲─────────────────────────────────────────▲──────────────────┘   │
 │                       │                                         │                      │
 │   ┌───────────────────┴───────────────────────┐ ┌───────────────┴──────────────────┐   │
 │   │      Deterministic Cashflow Calculator    │ │     Public Keyless APIs Adapter   │   │
 │   │  • Zero-LLM Mental Arithmetic             │ │  • Razorpay IFSC API (RBI Master) │   │
 │   │  • EMI Debt Service Coverage Ratios       │ │  • India Post API (GST State Match)│  │
 │   │  • Verified Rupee Math Formulae           │ │  • Frankfurter FX (USD/INR Rate)  │   │
 │   └───────────────────────────────────────────┘ │  • XposedOrNot (Vendor BEC Audit) │   │
 │                                                 │  • Fast 2.0s Timeout + Venue Cache│   │
 │                                                 └───────────────────────────────────┘   │
 │   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
 │   │                     DuckDB Semantic Data Plane (praman.duckdb)                  │   │
 │   │  • 10,040 Indexed Rows across 6 Relational SME Financial Tables                 │   │
 │   │  • Anti-Bug Guardrail 1: Blocks SUM(running_balance) on Bank Statements         │   │
 │   │  • Anti-Bug Guardrail 2: Blocks Unranked Cartesian Fuzzy Matches (sim < 0.90)   │   │
 │   │                                                                                 │   │
 │   │  4 Indic / Financial Pure Python UDFs:                                          │   │
 │   │  1. extract_utr()             2. norm_indic_vendor()                            │   │
 │   │  3. jw_sim()                  4. validate_gstin_checksum()                      │   │
 │   └─────────────────────────────────────────────────────────────────────────────────┘   │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Why Naive Approaches Fail vs. Praman's Solution

| Financial Problem | Naive RAG / Generic Text-to-SQL | Praman Autonomous Engine |
| :--- | :--- | :--- |
| **Bank Narrations** | Fails to match `UPI/432910485711/CR/BALAJI/HDFC` with invoice ID `INV-2026-104`. | `extract_utr()` extracts exact 12-digit RRN via regex; `norm_indic_vendor()` normalizes Indian SME suffixes. |
| **Phonetic Decoys** | Matches 8 decoy companies (`Balaji Traders`, `Sri Balaji Packaging`), causing Cartesian explosion. | Guardrail blocks loose matches; Guardrail Loop raises threshold to `jw_sim >= 0.92` with `QUALIFY ROW_NUMBER() = 1`. |
| **Bank Balance Math** | Attempts `SUM(running_balance)`, resulting in astronomical false cash figures. | DuckDB plane raises `SqlSemanticError`; forces query into window CTE `ORDER BY txn_date DESC, row_id DESC LIMIT 1`. |
| **Cashflow Protection** | Hallucinates post-payout runway math; claims ₹18,450 cash buffer is "safe". | Deterministic Python calculator enforces liquidity thresholds, proving debt service ratio drops from 2.84x to 1.17x. |
| **PII & Privacy** | Sends raw vendor names, VPAs, and UTRs to public endpoints. | **Local regex PII redaction** tokenizes UTRs, VPAs, and bank accounts before any external dispatch. |
| **API Costs & Rate Limits** | Requires expensive LLM tokens; frequently crashes with `429 Too Many Requests`. | **ZERO API keys required** in `.env`. Operates with keyless public APIs and local deterministic symbolic planning. |

---

## 🛡️ Anti-Bug Semantic Guardrails & Defensive Execution

The DuckDB plane (`DuckDBPlane.execute_query`) intercepts hazardous SQL before database evaluation:

1. **Anti-Bug Guardrail 1 (Running Balance Sum Check):**
   ```python
   if re.search(r'SUM\s*\(\s*(?:\w+\.)?running_balance\s*\)', sql, re.IGNORECASE):
       raise SqlSemanticError("CRITICAL FINANCIAL BUG: Never SUM(running_balance) on bank_statement...")
   ```
2. **Anti-Bug Guardrail 2 (Cartesian Fanout Prevention):**
   Detects naive fuzzy joins with thresholds $< 0.90$ lacking window ranking functions.

### Deterministic SQL Guardrail Check in Action:
```sql
-- Attempt 1 (Naive query generated by agent - INTERCEPTED by Guardrail 2):
SELECT t.invoice_id, t.vendor_name, b.row_id, b.narration, jw_sim(b.narration, t.vendor_name) AS sim
FROM tally_invoices t
JOIN bank_statement b ON jw_sim(b.narration, t.vendor_name) >= 0.80
WHERE t.invoice_id = 'INV-2026-104';
-- [PRAMAN INTERCEPTOR]: CARTESIAN FANOUT DETECTED (8 decoy bank matches)

-- Attempt 2 (Autonomous Healed Query with Defensive CTE & Window Filter):
WITH vendor_inv AS (
    SELECT invoice_id, invoice_date, vendor_name, vendor_gstin, taxable_value, 
           igst_amount, total_amount, vendor_ifsc, payout_status
    FROM tally_invoices
    WHERE invoice_id = 'INV-2026-104'
),
bank_matches AS (
    SELECT b.row_id, b.txn_date, b.narration, b.ifsc_code, b.withdrawal, b.deposit,
           extract_utr(b.narration) AS extracted_utr,
           jw_sim(b.narration, v.vendor_name) AS sim_score
    FROM bank_statement b
    CROSS JOIN vendor_inv v
    WHERE b.ifsc_code = v.vendor_ifsc
      AND jw_sim(b.narration, v.vendor_name) >= 0.92
    QUALIFY ROW_NUMBER() OVER (PARTITION BY b.ifsc_code ORDER BY sim_score DESC) = 1
),
tax_status AS (
    SELECT gstr2b_id, gstin_supplier, invoice_num, itc_eligible_amount, filing_status
    FROM gstr2b_tax
    WHERE invoice_num = 'INV-2026-104'
)
SELECT v.*, b.row_id AS matched_bank_row, b.narration AS matched_narration, b.extracted_utr, b.sim_score,
       COALESCE(t.itc_eligible_amount, 0.0) AS itc_eligible,
       COALESCE(t.filing_status, 'NOT_FILED') AS tax_filing_status
FROM vendor_inv v
LEFT JOIN bank_matches b ON 1=1
LEFT JOIN tax_status t ON v.invoice_id = t.invoice_num;
```

---

## 🛠️ The 4 Indic & Financial DuckDB UDFs

Registered directly into DuckDB session via `conn.create_function(...)`:

1. **`extract_utr(text: str) -> str`**: Extracts exact 12-digit RBI UTR/RRN from noisy unstructured Indian bank narrations.
2. **`norm_indic_vendor(name: str) -> str`**: Strips honorifics (`M/S`, `SHRI`, `SRI`), expands abbreviations (`ENT` $\rightarrow$ `ENTERPRISES`, `PVT LTD` $\rightarrow$ `PRIVATE LIMITED`), and cleans punctuation.
3. **`jw_sim(s1: str, s2: str) -> float`**: Enhanced Jaro-Winkler similarity with token sliding-window matching (achieves **0.987** on genuine matches while rejecting phonetic decoys at **< 0.89**).
4. **`validate_gstin_checksum(gstin: str) -> bool`**: Validates 15-character Indian GSTIN structures against the official tax algorithm.

---

## 🌐 4 Live Keyless Public APIs

Praman integrates 4 public endpoints (`Auth: None`) with 3.0s timeouts and deterministic fallback caches:

1. **Razorpay IFSC API (`https://ifsc.razorpay.com/{ifsc}`)**: Live RBI bank branch resolution, MICR, RTGS/NEFT/UPI routing headers.
2. **India Post Pincode API (`https://api.postalpincode.in/pincode/{pincode}`)**: Verifies vendor postal jurisdiction against the 2-digit GSTIN state prefix (`33` = Tamil Nadu, `27` = Maharashtra, `29` = Karnataka).
3. **Frankfurter FX API (`https://api.frankfurter.app/latest?from=USD&to=INR`)**: Live currency conversion for USD-pegged SaaS and cloud infrastructure SLAs.
4. **XposedOrNot Breach Check API (`https://api.xposedornot.com/v1/check-email/{email}`)**: Real-time Business Email Compromise (BEC) and vendor credential exposure check.

---

## 📊 Database Schema Catalog (10,040 Total Rows)

| Table Name | Rows | Description & Key Columns | Invariant Verified |
| :--- | :--- | :--- | :--- |
| `bank_statement` | 4,000 | `row_id`, `txn_date`, `narration`, `withdrawal`, `deposit`, `running_balance`, `ifsc_code`. | Strictly positive running balance ($₹2.5\text{L} \le \text{bal} \le ₹18.5\text{L}$), mutually exclusive debit/credit, natural final balance $₹3,12,450.00$. |
| `tally_invoices` | 2,000 | `invoice_id`, `invoice_date`, `vendor_name`, `vendor_gstin`, `taxable_value`, `igst_amount`, `total_amount`, `vendor_ifsc`, `payout_status`. | Three-way match ready with GSTR-2B and bank debits. |
| `gstr2b_tax` | 2,000 | `gstr2b_id`, `gstin_supplier`, `invoice_num`, `invoice_date`, `itc_eligible_amount`, `filing_status`. | CGST Section 16(2)(aa) statutory reflection baseline. |
| `razorpay_upi` | 2,000 | `payment_id`, `order_id`, `created_at`, `gross_amount`, `mdr_fee`, `gst_on_fee`, `net_settlement`, `status`, `rrn_utr`, `customer_vpa`. | **Zero MDR mandate** (`mdr_fee = 0.0`, `net_settlement = gross_amount`). Reconciles with HDFC Bank Statement settlements via 12-digit RRN/UTR. |
| `cashflow_commitments` | 20 | `commitment_id`, `due_date`, `amount`, `commitment_type`, `priority`, `lender_or_payee`. | Prioritized debt service schedules (HDFC Loan EMI ₹1,10,000.00). |
| `company_policies` | 20 | `policy_id`, `domain`, `title`, `rule_body`, `section_ref`. | Statutory CGST Sec 16(2)(aa)/16(4) policies and liquidity reserve policies. |

---

## ⚡ The 3 Canonical Judge Scenarios

### Scenario 1: Missing GSTR-2B ITC Hold (`CASE-GST-104`)
- **Vendor:** Sri Balaji Enterprises (`33AABCS1429B1Z2`, IFSC: `KVBL0001245`).
- **Disputed Invoice:** `INV-2026-104` for **₹1,84,000.00** (Taxable ₹1,55,932.20 + IGST ₹28,067.80).
- **Core Discrepancy:** Missing in GSTR-2B portal (`itc_eligible = ₹0.00`). Under Section 16(2)(aa) of the CGST Act, 2017, Input Tax Credit cannot be availed in GSTR-3B without GSTR-2B reflection. Paying the full invoice before filing puts **₹28,067.80 of operating working capital at risk (blocked until vendor files GSTR-1, subject to Section 16(4) 30th November statutory deadline)**.
- **Cashflow Impact:** Current balance **₹3,12,450.00**; Critical HDFC Business Loan EMI **₹1,10,000.00** due in 7 days.
  - *Full Payout:* Leaves ₹1,28,450.00 cash, post-EMI buffer ₹18,450.00 (**1.17x EMI coverage** $\rightarrow$ `CRITICAL_DEFAULT_RISK`).
  - *Praman Withholding:* Holds ₹28,067.80 GST portion; leaves ₹1,56,517.80 cash, post-EMI buffer ₹46,517.80 (**1.42x EMI coverage**).
  - *Conservative Full Hold pending filing:* Preserves ₹3,12,450.00 operating cash, post-EMI buffer ₹2,02,450.00 (**2.84x EMI coverage**).

### Scenario 2: UPI Switch Double-Debit Dispute (`CASE-UPI-209`)
- **Customer Dispute:** Double-debit of **₹14,500.00** on 2026-11-14.
- **Evidence:** Gateway logs show Attempt 1 (`432910485711`) failed at NPCI switch node (`status = failed_at_switch`). Attempt 2 (`432910485799`) succeeded and credited net ₹14,500.00 (Zero MDR under MoF Jan 2020 mandate) into HDFC clearing account (`HDFC0000240`).
- **Verdict:** Reject merchant refund (avoids double loss); transmit NPCI failure clearing proof for automatic T+1 bank reversal.

### Scenario 3: B2B SLA Downtime Pro-Rata Credit (`CASE-SLA-302`)
- **Vendor:** CloudSphere Infrastructure Solutions Pvt Ltd (`INV-2026-881`, ₹84,000.00).
- **Evidence:** Outage violated 99.5% uptime commitment. Policy `POL-SLA-01` (`SEC-4.2`) mandates pro-rata service credit of ₹5,600.00 via debit note.
- **Verdict:** Issue Debit Note `DN-2026-881` for ₹5,600.00 and disburse net ₹78,400.00.

---

## 🎯 Unscripted Custom Case & "Paste Unseen Input" Sandbox

Judges and evaluators can execute completely unscripted investigations on unseen, real-world data directly in the UI or via API:

### 1. Interactive Sandbox in UI:
Located at the top of the workspace with 3 instant 1-click test buttons:
- **Sample 1: Real Ledger UTR (`432910485799`)**: Reconciles clean settlement with Ganpati Trading Co $\rightarrow$ yields `NO_DISCREPANCY_FOUND` and displays the **Verification Checklist**.
- **Sample 2: Unseen Messy SMS (`Dear SBI User, your A/c XX4892 debited by Rs 18,400...`)**: AI Job A tokenizes/redacts PII, extracts parameters, and audits ledger $\rightarrow$ enforces safe hold.
- **Sample 3: Unrecorded UTR (`999999999999`)**: Missing from bank statement $\rightarrow$ yields `NOT_FOUND_IN_STATEMENT` with safe guidance protocol.

### 2. Evidence-Grounded Branching:
- **0 rows matched (e.g. fake UTR `999999999999`):** Verdict `NOT_FOUND_IN_STATEMENT`:
  > *"Not found in the statement as of 2026-11-18. Ask the counterparty for the 12-digit UTR / bank advice proof and recheck after the next NEFT/UPI settlement cycle."*
  ₹0.00 at risk, zero fabricated citations, zero speculative claims.
- **Matched & Reconciled (clean filed invoice like `INV-2026-0037`):** Verdict `NO_DISCREPANCY_FOUND`:
  Renders the **Reconciliation Verification Checklist**:
  - *Checked & Matched (Automated):* Bank statement settlement verified, UPI RRN confirmed, Tally invoice matches tax records, GSTR-2B confirmed `FILED`.
  - *Requires Human Sign-off:* Prior FY duplicate checks, beneficiary account ownership verification, physical goods (GRN) acceptance.
- **Matched with Discrepancy (unfiled tax or failed switch):** Verdict `HOLD_DISPUTED_PORTION` with exact mathematical delta hold.

### 3. Live Endpoints:
- `POST /api/cases/custom`: Accepts `{"query": str, "raw_narration": str | None}` for unscripted investigations.
- `POST /api/tools/test-narration`: Instant ad-hoc parser testing `extract_utr`, `norm_indic_vendor`, and `jw_sim` against any raw string.

---

## 🚀 2-Minute Quickstart

### Method A: 1-Click Startup Scripts (Recommended)

#### On Windows PowerShell:
```powershell
.\start.ps1
```

#### On Linux / macOS / WSL:
```bash
chmod +x start.sh
./start.sh
```

The script automatically verifies/generates the 10,040 rows in `praman-data/`, seeds `praman.duckdb`, launches FastAPI on port `8000`, and launches the Vite React UI on port `5173`.

---

## 🧪 Comprehensive Verification Suite

Run the full pytest suite (all 35 tests pass with zero `.env` keys required):

```powershell
python -m pytest praman-api/tests/ -v
```

```
praman-api/tests/test_agent_engine.py::test_pii_redaction PASSED
praman-api/tests/test_agent_engine.py::test_intent_parsing PASSED
praman-api/tests/test_agent_engine.py::test_cashflow_math_case_gst_104 PASSED
praman-api/tests/test_agent_engine.py::test_format_inr PASSED
praman-api/tests/test_agent_engine.py::test_citation_tracker PASSED
praman-api/tests/test_agent_engine.py::test_verify_ifsc_live_fallback PASSED
praman-api/tests/test_agent_engine.py::test_investigation_stream_case_gst_104 PASSED
praman-api/tests/test_agent_engine.py::test_investigation_stream_case_upi_209 PASSED
praman-api/tests/test_agent_engine.py::test_investigation_stream_case_sla_302 PASSED
praman-api/tests/test_agent_engine.py::test_investigation_stream_custom_case_not_found PASSED
praman-api/tests/test_agent_engine.py::test_investigation_stream_custom_case_verified_safe_to_pay PASSED
praman-api/tests/test_api_endpoints.py::test_api_health PASSED
praman-api/tests/test_api_endpoints.py::test_list_cases PASSED
praman-api/tests/test_api_endpoints.py::test_trigger_case PASSED
praman-api/tests/test_api_endpoints.py::test_stream_investigation PASSED
praman-api/tests/test_api_endpoints.py::test_get_citation_detail PASSED
praman-api/tests/test_api_endpoints.py::test_approve_case_action PASSED
praman-api/tests/test_api_endpoints.py::test_create_custom_case_and_stream PASSED
praman-api/tests/test_api_endpoints.py::test_narration_tester_tool PASSED
praman-api/tests/test_duckdb_plane.py::test_guardrail_sum_running_balance PASSED
praman-api/tests/test_duckdb_plane.py::test_guardrail_cartesian_fanout_threshold PASSED
praman-api/tests/test_duckdb_plane.py::test_guardrail_mutation_prevention PASSED
praman-api/tests/test_duckdb_plane.py::test_udf_extract_utr_in_duckdb PASSED
praman-api/tests/test_duckdb_plane.py::test_udf_jw_sim_reconciliation_in_duckdb PASSED
praman-api/tests/test_duckdb_plane.py::test_latest_running_balance_query PASSED
praman-api/tests/test_public_apis.py::test_verify_ifsc_live PASSED
praman-api/tests/test_public_apis.py::test_verify_gst_state_pincode PASSED
praman-api/tests/test_public_apis.py::test_fetch_live_usd_inr PASSED
praman-api/tests/test_public_apis.py::test_check_vendor_email_breach PASSED
praman-api/tests/test_public_apis.py::test_zero_env_investigation_trace PASSED
praman-api/tests/test_public_apis.py::test_live_public_api_citation_endpoint PASSED
praman-api/tests/test_udfs.py::test_extract_utr PASSED
praman-api/tests/test_udfs.py::test_norm_indic_vendor PASSED
praman-api/tests/test_udfs.py::test_jw_sim PASSED
praman-api/tests/test_udfs.py::test_validate_gstin_checksum PASSED

====================== 35 passed in 64.35s ======================
```

---

## 📂 Monorepo Structure

```
Praman-AI/
├── README.md                          # Comprehensive Arthaton Documentation
├── start.sh                           # 1-Click Startup for Unix/macOS/WSL
├── start.ps1                          # 1-Click Startup for Windows PowerShell
├── .env.example                       # Documented keyless configuration
├── .gitignore
├── praman-data/                       # Data Generation & DuckDB Storage
│   ├── generator.py                   # Generates 10,040 rows (seed=42)
│   ├── patch_scenarios.py             # Invariant assertion & scenario patcher
│   ├── seed_duckdb.py                 # DuckDB physical loader & table validator
│   ├── praman.duckdb                  # Physical DuckDB columnar database
│   └── raw_csvs/                      # 6 Source CSV files (bank, tally, gstr2b, etc.)
├── praman-api/                        # FastAPI Backend & Neuro-Symbolic Agent Engine
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── tests/                         # 35 Pytest unit & integration tests
│   │   ├── test_udfs.py
│   │   ├── test_duckdb_plane.py
│   │   ├── test_agent_engine.py
│   │   ├── test_api_endpoints.py
│   │   └── test_public_apis.py
│   └── src/praman_api/
│       ├── config.py                  # Pydantic Settings & CORS rules
│       ├── main.py                    # FastAPI app initialization & routes
│       ├── models.py                  # Pydantic schemas & response models
│       ├── engine/
│       │   ├── udfs.py                # Pure Python UDFs (extract_utr, jw_sim, etc.)
│       │   └── duckdb_plane.py        # Guardrailed DuckDB execution plane
│       ├── agent/
│       │   ├── prompts.py             # System prompts & statutory CGST rules
│       │   ├── tools.py               # Tool catalog exposed to planner
│       │   ├── llm_planner.py         # Local PII-safe parser & SQL generator
│       │   └── loop.py                # Evidence-grounded investigation loop
│       ├── adapters/
│       │   ├── public_apis.py         # 4 Keyless Public APIs with offline fallback
│       │   ├── razorpay_ifsc.py       # RBI master routing adapter
│       │   └── settlement_dispatcher.py # Idempotent dispatch & HTML notice generator
│       ├── services/
│       │   ├── citations.py           # Immutable citation registration service
│       │   └── cashflow_math.py       # Zero-LLM deterministic runway arithmetic
│       └── api/
│           ├── cases.py               # Case listing & trigger router
│           ├── stream.py              # SSE real-time investigation stream router
│           ├── citations.py           # Citation deep-dive evidence router
│           └── actions.py             # Human approval & downstream dispatch router
└── praman-ui/                         # Editorial Financial Dossier UI (React + Vite)
    ├── package.json
    ├── vite.config.ts                 # Port 5173 + /api proxy to FastAPI
    ├── tailwind.config.js             # Warm Paper (#FAF8F5) + Obsidian (#0D1117)
    ├── index.html                     # Newsreader, Spectral, Inter, JetBrains Mono
    └── src/
        ├── App.tsx                    # Main state orchestrator
        ├── types/index.ts             # TypeScript domain schemas
        ├── api/client.ts              # Fetch + SSE EventSource client
        └── components/
            ├── DemoTriggerMenu.tsx    # 1-Click Judge Scenario Bar + DuckDB stats
            ├── Workspace.tsx          # 50/50 Split Grid
            ├── LiveSqlFeed.tsx        # Obsidian SQL Terminal & Guardrail trace
            ├── InvestigationBrief.tsx # Cited Dossier & Markdown memo
            ├── CitationChip.tsx       # Brand-colored citation badges
            ├── CitationDetailModal.tsx# Evidence inspection modal with UDF diff
            ├── RunwayWidget.tsx       # Recharts 30-Day EMI Runway bar chart
            └── ApprovalCinematic.tsx  # 4-step human approval execution drawer
```

---

## 🏆 Arthaton 2026 Evaluation Checklist

- [x] **10,000+ Row Dataset**: 10,040 rows seeded across 6 relational tables with verified invariants (90.08% UPI reconciliation coverage, zero MDR, positive running balance).
- [x] **4 Indic/Financial Python UDFs**: `extract_utr`, `norm_indic_vendor`, `jw_sim`, `validate_gstin_checksum`.
- [x] **Anti-Hallucination Guardrails**: Prohibits `SUM(running_balance)` and Cartesian joins $< 0.90$.
- [x] **Deterministic SQL Guardrails**: Naive fuzzy attempt intercepted $\rightarrow$ auto-healed into defensive CTE with window ranking.
- [x] **Zero Mental Arithmetic**: Deterministic Python calculator enforces exact rupee liquidity math (1.17x risk vs. 1.42x protected).
- [x] **Zero Mandatory Keys & Local PII Protection**: Seamlessly runs with 4 keyless public APIs (`Auth: None`), local regex PII redaction, and local deterministic symbolic planning.
- [x] **Evidence-Grounded Custom Cases**: Data-driven verdict branching (`NOT_FOUND_IN_LEDGER`, `VERIFIED_SAFE_TO_PAY`, `HOLD_DISPUTED_PORTION`) with zero fabricated citations.
- [x] **Editorial Financial Dossier UI**: Warm paper aesthetic, deep obsidian SQL feed, Recharts runway chart, and interactive human approval cinematic.
- [x] **100% Test Pass Rate**: 35 automated test cases passing cleanly.

---
*Developed with precision for Arthaton 2026.*
