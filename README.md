# Praman (प्रमाण)
### Autonomous B2B Financial Reconciliation & Cash-Flow Protection Engine for Indian SMEs
> **Built for Arthaton 2026** · *Zero-Key Autonomous Neuro-Symbolic Architecture*

[![Python 3.13](https://img.shields.io/badge/Python-3.13+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![DuckDB](https://img.shields.io/badge/DuckDB-1.1.0-FFF000.svg?style=flat&logo=duckdb&logoColor=black)](https://duckdb.org)
[![Vite + React](https://img.shields.io/badge/Frontend-React_18_+_Vite-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://vitejs.dev)
[![Tests](https://img.shields.io/badge/Tests-29%20Passed%20(100%25)-success.svg)](https://pytest.org)
[![Zero API Keys](https://img.shields.io/badge/Keys_Required-ZERO_(Keyless_APIs)-brightgreen.svg)](#-live-keyless-public-apis)

---

## 🏛️ Executive Summary

Indian Small and Medium Enterprises (SMEs) face a recurring structural liquidity risk: **statutory Input Tax Credit (ITC) leakage, untracked UPI nodal failures, and unmitigated vendor payouts that wipe out operating cash balances right before high-priority debt commitments (such as ₹1,10,000 monthly bank loan EMIs).**

Standard enterprise solutions fail Indian finance teams because:
1. **Bank statement narrations are deeply corrupted:** Primary keys (12-digit UTRs/RRNs) are buried within unstructured text (`UPI/432910485711/CR/BALAJI/HDFC...`), while vendor names are corrupted by honorifics and abbreviations (`M/s Sri Balaji Ent Pvt Ltd` vs. `Balaji Traders`).
2. **Naive LLMs hallucinatory SQL:** Generic LLMs naively execute `SUM(running_balance)` across bank statements (an arithmetic financial catastrophe) or perform loose string joins (`LIKE '%Balaji%'`) that generate Cartesian explosions across decoy transactions.
3. **LLMs cannot do mental arithmetic:** Asking an LLM to compute post-disbursement EMI coverage ratios results in contradictory numbers and fabricated safety claims.

**Praman** solves this by pairing an **in-memory DuckDB Semantic Data Plane (10,040 rows across 6 tables)** with **4 pure Indic/Financial Python UDFs**, an **autonomous Self-Healing SQL Loop**, **deterministic Cash-Flow Runway Math**, and **4 live, keyless public APIs**. It produces an **Editorial Financial Dossier** with verifiable row-level citations and 1-click human execution.

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
 │  │  • Self-Healing SQL Retry Diagnostics  │  │  • 30-Day Loan EMI Runway Widget     │  │
 │  │  • Live Bank Routing / IFSC Headers    │  │  • 1-Click Human Approval Cinematic  │  │
 │  └───────────────────▲────────────────────┘  └──────────────────▲───────────────────┘  │
 └──────────────────────┼──────────────────────────────────────────┼──────────────────────┘
                        │ Server-Sent Events (SSE)                 │ REST API / Actions
 ┌──────────────────────┴──────────────────────────────────────────┴──────────────────────┐
 │                                   PRAMAN FASTAPI BACKEND                               │
 │                                                                                        │
 │   ┌────────────────────────────────────────────────────────────────────────────────┐   │
 │   │                   Autonomous Neuro-Symbolic Agent Loop                         │   │
 │   │  • Deterministic Planner (Runs with ZERO API keys in .env · No 429 Rate Limits)│   │
 │   │  • Self-Healing SQL: Catches Cartesian Fanouts & Retries with Defensive CTEs   │   │
 │   └───────────────────▲─────────────────────────────────────────▲──────────────────┘   │
 │                       │                                         │                      │
 │   ┌───────────────────┴───────────────────────┐ ┌───────────────┴──────────────────┐   │
 │   │      Deterministic Cashflow Calculator    │ │     Public Keyless APIs Adapter   │   │
 │   │  • Zero-LLM Mental Arithmetic             │ │  • Razorpay IFSC API (RBI Master) │   │
 │   │  • EMI Debt Service Coverage Ratios       │ │  • India Post API (GST State Match)│  │
 │   │  • Verified Rupee Math Formulae           │ │  • Frankfurter FX (USD/INR Rate)  │   │
 │   └───────────────────────────────────────────┘ │  • XposedOrNot (Vendor BEC Audit) │   │
 │                                                 └───────────────────────────────────┘   │
 │   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
 │   │                     DuckDB Semantic Data Plane (praman.duckdb)                  │   │
 │   │  • 10,040 Indexed Rows across 6 Relational SME Financial Tables                 │   │
 │   │  • Anti-Bug Guardrail 1: Blocks SUM(running_balance) on Bank Statements         │   │
 │   │  • Anti-Bug Guardrail 2: Blocks Unranked Cartesian Fuzzy Matches (sim < 0.92)   │   │
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
| **Phonetic Decoys** | Matches 8 decoy companies (`Balaji Traders`, `Sri Balaji Packaging`), causing Cartesian explosion. | Guardrail blocks loose matches; Self-Healing Loop raises threshold to `jw_sim >= 0.92` with `QUALIFY ROW_NUMBER() = 1`. |
| **Bank Balance Math** | Attempts `SUM(running_balance)`, resulting in astronomical false cash figures. | DuckDB plane raises `SqlSemanticError`; forces query into window CTE `ORDER BY txn_date DESC, row_id DESC LIMIT 1`. |
| **Cashflow Protection** | Hallucinates post-payout runway math; claims ₹16,000 cash buffer is "safe". | Deterministic Python calculator enforces liquidity thresholds, proving debt service ratio drops from 2.82x to 1.15x. |
| **API Costs & Rate Limits** | Requires expensive LLM tokens; frequently crashes with `429 Too Many Requests`. | **ZERO API keys required** in `.env`. Operates with keyless public APIs and deterministic symbolic planning. |

---

## 🛠️ The 4 Indic & Financial DuckDB UDFs

Registered directly into DuckDB session via `conn.create_function(...)`:

### 1. `extract_utr(text: str) -> str`
Extracts the exact 12-digit RBI Unique Transaction Reference / RRN from noisy unstructured Indian bank narrations.
```python
# Handles UPI, IMPS, RTGS, NEFT, and RRN variations:
r'(?:UPI/|UTR[-/:]?|IMPS[-/:]?|RRN[-/:]?)([0-9]{12})'
```

### 2. `norm_indic_vendor(name: str) -> str`
Standardizes Indian SME corporate nomenclature:
- Strips honorifics: `M/S`, `SHRI`, `SRI`, `SHREE`.
- Expands Indian legal abbreviations: `ENT` $\rightarrow$ `ENTERPRISES`, `PVT LTD` $\rightarrow$ `PRIVATE LIMITED`, `TRD` $\rightarrow$ `TRADERS`, `IND` $\rightarrow$ `INDUSTRIES`.
- Cleans punctuation and whitespace.

### 3. `jw_sim(s1: str, s2: str) -> float`
Enhanced Jaro-Winkler similarity calculator with token sliding-window matching. Evaluates normalized vendor names against narration fragments, achieving **0.987** on genuine matches while rejecting phonetic decoys at **< 0.89**.

### 4. `validate_gstin_checksum(gstin: str) -> bool`
Validates 15-character Indian Goods and Services Tax Identification Numbers:
```
^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$
```

---

## 🛡️ Anti-Bug Semantic Guardrails & Self-Healing SQL

The DuckDB plane (`DuckDBPlane.execute_query`) intercepts hazardous SQL before database evaluation:

1. **Anti-Bug Guardrail 1 (Running Balance Sum Check):**
   ```python
   if re.search(r'SUM\s*\(\s*(?:\w+\.)?running_balance\s*\)', sql, re.IGNORECASE):
       raise SqlSemanticError("CRITICAL FINANCIAL BUG: Never SUM(running_balance) on bank_statement...")
   ```
2. **Anti-Bug Guardrail 2 (Cartesian Fanout Prevention):**
   Detects naive fuzzy joins with thresholds $< 0.90$ lacking window ranking functions.

### Self-Healing SQL Loop in Action:
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

## 🌐 4 Live Keyless Public APIs

Praman integrates 4 public endpoints (`Auth: None`) with 3.0s timeouts and deterministic fallback caches:

1. **Razorpay IFSC API (`https://ifsc.razorpay.com/{ifsc}`)**: Live RBI bank branch resolution, MICR, RTGS/NEFT/UPI routing headers.
2. **India Post Pincode API (`https://api.postalpincode.in/pincode/{pincode}`)**: Verifies vendor postal jurisdiction against the 2-digit GSTIN state prefix (`33` = Tamil Nadu, `27` = Maharashtra, `29` = Karnataka).
3. **Frankfurter FX API (`https://api.frankfurter.app/latest?from=USD&to=INR`)**: Live currency conversion for USD-pegged SaaS and cloud infrastructure SLAs.
4. **XposedOrNot Breach Check API (`https://api.xposedornot.com/v1/check-email/{email}`)**: Real-time Business Email Compromise (BEC) and vendor credential exposure check.

---

## 📊 Database Schema Catalog (10,040 Total Rows)

| Table Name | Rows | Description & Key Columns |
| :--- | :--- | :--- |
| `bank_statement` | 4,000 | `row_id`, `txn_date`, `narration`, `withdrawal`, `deposit`, `running_balance`, `ifsc_code`. |
| `tally_invoices` | 2,000 | `invoice_id`, `invoice_date`, `vendor_name`, `vendor_gstin`, `taxable_value`, `igst_amount`, `total_amount`, `vendor_ifsc`, `payout_status`. |
| `gstr2b_tax` | 2,000 | `gstr2b_id`, `gstin_supplier`, `invoice_num`, `invoice_date`, `itc_eligible_amount`, `filing_status`. |
| `razorpay_upi` | 2,000 | `payment_id`, `order_id`, `created_at`, `gross_amount`, `fee_mdr`, `net_settlement`, `status`, `rrn_utr`, `customer_vpa`. |
| `cashflow_commitments` | 20 | `commitment_id`, `due_date`, `amount`, `commitment_type`, `priority`, `lender_or_payee`. |
| `company_policies` | 20 | `policy_id`, `category`, `rule_text`, `threshold_inr`, `action_required`. |

---

## ⚡ The 3 Canonical Judge Scenarios

### Scenario 1: Missing GSTR-2B ITC Hold (`CASE-GST-104`)
- **Vendor:** Sri Balaji Enterprises (`33AABCS1429B1Z2`, IFSC: `KVBL0001245`).
- **Disputed Invoice:** `INV-2026-104` for **₹1,84,000.00** (Taxable ₹1,55,932.20 + IGST ₹28,067.80).
- **Core Discrepancy:** Missing in GSTR-2B portal (`itc_eligible = ₹0.00`). Disbursing full payout violates CGST Sec 16(2)(aa) and Rule 36(4).
- **Cashflow Impact:** Current balance **₹3,10,000.00**; Critical HDFC Business Loan EMI **₹1,10,000.00** due in 7 days.
  - *Full Payout:* Leaves only ₹16,000.00 free cash (**1.15x EMI coverage** $\rightarrow$ `CRITICAL_DEFAULT_RISK`).
  - *Praman Withholding:* Holds ₹28,067.80 GST portion; preserves ₹44,067.80 free cash (**1.40x EMI coverage**).
  - *Full Hold pending filing:* Preserves ₹2,00,000.00 post-EMI free cash (**2.82x EMI coverage**).

### Scenario 2: UPI Switch Double-Debit Dispute (`CASE-UPI-209`)
- **Customer Dispute:** Double-debit of **₹14,500.00** on 2026-11-14.
- **Evidence:** Gateway logs show Attempt 1 (`432910485711`) failed at NPCI switch node (`net = ₹0.00`). Attempt 2 (`432910485799`) succeeded and credited net ₹14,157.80 into HDFC nodal account (`HDFC0000240`).
- **Verdict:** Reject merchant refund (avoids double loss); transmit NPCI failure clearing proof for automatic T+1 bank reversal.

### Scenario 3: B2B SLA Downtime Pro-Rata Credit (`CASE-SLA-302`)
- **Vendor:** CloudSphere Infrastructure Solutions Pvt Ltd (`INV-2026-881`, ₹84,000.00).
- **Evidence:** Outage violated 99.5% uptime commitment. Policy `POL-SLA-01` (`SEC-4.2`) mandates pro-rata service credit of ₹5,600.00 via debit note.
- **Verdict:** Issue Debit Note `DN-2026-881` for ₹5,600.00 and disburse net ₹78,400.00.

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

### Method B: Manual Step-by-Step

#### 1. Setup Data & Analytical Plane:
```bash
# Generate 10,040 synthetic Indian financial rows
python praman-data/generator.py
python praman-data/patch_scenarios.py
python praman-data/seed_duckdb.py
```

#### 2. Start FastAPI Backend:
```bash
cd praman-api
pip install -r requirements.txt
# Windows PowerShell:
$env:PYTHONPATH="src"; python -m uvicorn praman_api.main:app --host 127.0.0.1 --port 8000
# Linux/macOS:
PYTHONPATH="src" python3 -m uvicorn praman_api.main:app --host 127.0.0.1 --port 8000
```

#### 3. Start React Frontend:
```bash
cd praman-ui
npm install
npm run dev -- --port 5173
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🧪 Comprehensive Verification Suite

Run the full pytest suite (all 29 tests pass with zero `.env` keys required):

```powershell
$env:PYTHONPATH="praman-api/src"; python -m pytest praman-api/tests/ -v
```

```
praman-api/tests/test_agent_engine.py::test_cashflow_math_case_gst_104 PASSED
praman-api/tests/test_agent_engine.py::test_format_inr PASSED
praman-api/tests/test_agent_engine.py::test_citation_tracker PASSED
praman-api/tests/test_agent_engine.py::test_verify_ifsc_live_fallback PASSED
praman-api/tests/test_agent_engine.py::test_investigation_stream_case_gst_104 PASSED
praman-api/tests/test_agent_engine.py::test_investigation_stream_case_upi_209 PASSED
praman-api/tests/test_agent_engine.py::test_investigation_stream_case_sla_302 PASSED
praman-api/tests/test_api_endpoints.py::test_api_health PASSED
praman-api/tests/test_api_endpoints.py::test_list_cases PASSED
praman-api/tests/test_api_endpoints.py::test_trigger_case PASSED
praman-api/tests/test_api_endpoints.py::test_stream_investigation PASSED
praman-api/tests/test_api_endpoints.py::test_get_citation_detail PASSED
praman-api/tests/test_api_endpoints.py::test_approve_case_action PASSED
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

======================= 29 passed in 69.06s =======================
```

---

## 📂 Monorepo Structure

```
Praman-AI/
├── README.md                          # Comprehensive Arthaton Documentation
├── start.sh                           # 1-Click Startup for Unix/macOS/WSL
├── start.ps1                          # 1-Click Startup for Windows PowerShell
├── .gitignore
├── praman-data/                       # Data Generation & DuckDB Storage
│   ├── generator.py                   # Generates 10,040 rows (seed=42)
│   ├── patch_scenarios.py             # Deterministic injection of canonical scenarios
│   ├── seed_duckdb.py                 # DuckDB physical loader & table validator
│   ├── praman.duckdb                  # Physical DuckDB columnar database
│   └── raw_csvs/                      # 6 Source CSV files (bank, tally, gstr2b, etc.)
├── praman-api/                        # FastAPI Backend & Neuro-Symbolic Agent Engine
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── tests/                         # 29 Pytest unit & integration tests
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
│       │   ├── prompts.py             # System prompts & few-shot financial exemplars
│       │   ├── tools.py               # Tool catalog exposed to planner
│       │   └── loop.py                # Self-Healing loop & deterministic planner
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
            ├── LiveSqlFeed.tsx        # Obsidian SQL Terminal & Self-Healing trace
            ├── InvestigationBrief.tsx # Cited Dossier & Markdown memo
            ├── CitationChip.tsx       # Brand-colored citation badges
            ├── CitationDetailModal.tsx# Evidence inspection modal with UDF diff
            ├── RunwayWidget.tsx       # Recharts 30-Day EMI Runway bar chart
            └── ApprovalCinematic.tsx  # 4-step human approval execution drawer
```

---

## 🏆 Arthaton 2026 Evaluation Checklist

- [x] **10,000+ Row Dataset**: 10,040 rows seeded across 6 relational tables with fixed seed (`42`).
- [x] **4 Indic/Financial Python UDFs**: `extract_utr`, `norm_indic_vendor`, `jw_sim`, `validate_gstin_checksum`.
- [x] **Anti-Hallucination Guardrails**: Prohibits `SUM(running_balance)` and Cartesian joins $< 0.90$.
- [x] **Self-Healing SQL Loop**: Naive fuzzy attempt intercepted $\rightarrow$ auto-healed into defensive CTE with window ranking.
- [x] **Zero Mental Arithmetic**: Deterministic Python calculator enforces exact rupee liquidity math (1.15x risk vs. 1.40x protected).
- [x] **Zero Mandatory Keys**: Seamlessly runs with 4 keyless public APIs (`Auth: None`) and deterministic symbolic planning.
- [x] **Editorial Financial Dossier UI**: Warm paper aesthetic, deep obsidian SQL feed, Recharts runway chart, and interactive human approval cinematic.
- [x] **100% Test Pass Rate**: 29 automated test cases passing in CI.

---
*Developed with precision for Arthaton 2026.*
