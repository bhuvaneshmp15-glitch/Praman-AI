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
2. **Cashflow Protection & EMI Safeguards**: Computes real-time liquidity runways, safeguarding upcoming high-priority commitments (e.g. loan EMIs, payroll, GST challans) before approving vendor payouts.
3. **UPI Switch Failure Discrepancy Resolution**: Tracks payment gateway double-debits, distinguishing between bank switch failures and captured settlements.
4. **Autonomous Evidence-Backed Audit Trails**: Produces deterministic citations with exact row IDs across DuckDB queries and ledger sources.
