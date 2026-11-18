# Praman (`praman-copilot`)
> Autonomous B2B Financial Reconciliation & Cash-Flow Protection Engine for Indian SMEs

Praman is an intelligent agentic financial reconciliation system designed specifically for the Indian SME ecosystem. It bridges the gap between bank statements, GST (GSTR-2B), ERPs (Tally), UPI payment gateways (Razorpay), company policies, and statutory cash-flow commitments.

---

## 🏛️ Architecture Overview

```
praman-copilot/
├── .env.example
├── .gitignore
├── README.md
├── praman-data/                 # Synthetic data generation & DuckDB seeds
│   ├── generator.py             # 10,000+ realistic noisy Indian financial records
│   ├── patch_scenarios.py       # Canonical deterministic scenario injection
│   ├── seed_duckdb.py           # DuckDB database seeder
│   └── raw_csvs/                # Generated source CSV datasets
├── praman-api/                  # High-performance FastAPI backend & Agent Engine
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── src/praman_api/
│       ├── config.py            # Pydantic settings & environment configuration
│       ├── main.py              # Application entrypoint & CORS setup
│       ├── models.py            # Domain schemas & API payloads
│       ├── engine/              # DuckDB OLAP query plane & custom UDFs
│       ├── agent/               # Autonomous LLM investigation loop & tools
│       ├── adapters/            # Bank IFSC validation & settlement dispatchers
│       ├── services/            # Citation tracking & cashflow mathematics
│       └── api/                 # API router endpoints
└── praman-ui/                   # Modern React / Next.js investigation workspace
```

---

## 🚀 Key Capabilities

1. **Jaro-Winkler & GSTIN Multi-Pass Reconciliation**: Reconciles noisy bank narrations against Tally vendors and GSTR-2B input tax credits while filtering out phonetic decoys.
2. **Deterministic Cashflow Protection & EMI Safeguards**: Computes real-time liquidity runways, safeguarding upcoming high-priority commitments (e.g. ₹1,10,000 HDFC loan EMI) before approving vendor payouts.
3. **UPI Switch Failure Discrepancy Resolution**: Tracks payment gateway double-debits, distinguishing between bank switch failures and captured settlements.
4. **Autonomous Evidence-Backed Audit Trails**: Produces deterministic citations with exact row IDs across DuckDB queries and ledger sources.
5. **Zero-Key Public API Integration**: 4 live, keyless public APIs (`https://ifsc.razorpay.com`, `api.postalpincode.in`, `api.frankfurter.app`, and `api.xposedornot.com`) with 3s timeout and offline fallback caches.

---

## 💻 Running the Monorepo

### 1. Backend (FastAPI + DuckDB)
```powershell
cd praman-api
pip install -r requirements.txt
$env:PYTHONPATH="src"
python -m uvicorn praman_api.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend (React + TypeScript + Vite + Tailwind CSS)
```powershell
cd praman-ui
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Backend Test Suite
```powershell
$env:PYTHONPATH="praman-api/src"; python -m pytest praman-api/tests/ -v
```
