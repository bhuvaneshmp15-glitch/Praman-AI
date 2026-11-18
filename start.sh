#!/usr/bin/env bash
# ==============================================================================
# Praman Copilot — Autonomous B2B Financial Reconciliation Engine
# Arthaton 2026 Judge Startup Script (Unix / macOS / WSL)
# ==============================================================================

set -e

echo ""
echo "======================================================================"
echo "  PRAMAN AI — Autonomous Financial Reconciliation & Cashflow Protection"
echo "  Arthaton 2026 Startup Orchestrator"
echo "======================================================================"
echo ""

# 1. Check Python and Node dependencies
command -v python3 >/dev/null 2>&1 || { echo >&2 "Python3 is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "npm is required but not installed. Aborting."; exit 1; }

PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

# 2. Check and seed DuckDB / raw synthetic financial datasets if missing
if [ ! -f "praman-data/praman.duckdb" ] || [ ! -f "praman-data/raw_csvs/bank_statement.csv" ]; then
    echo "[1/3] Generating 10,040+ realistic noisy Indian financial rows & injecting scenarios..."
    $PYTHON_CMD praman-data/generator.py
    $PYTHON_CMD praman-data/patch_scenarios.py
    $PYTHON_CMD praman-data/seed_duckdb.py
else
    echo "[1/3] DuckDB analytical store (praman.duckdb) and 10,040+ CSV rows verified."
fi

# 3. Check and install frontend packages if node_modules is missing
if [ ! -d "praman-ui/node_modules" ]; then
    echo "[*] Installing frontend dependencies in praman-ui..."
    (cd praman-ui && npm install)
fi

echo ""
echo "[2/3] Starting FastAPI Backend with DuckDB Semantic Plane on http://127.0.0.1:8000 ..."
export PYTHONPATH="$(pwd)/praman-api/src"
$PYTHON_CMD -m uvicorn praman_api.main:app --host 127.0.0.1 --port 8000 &
API_PID=$!

echo "[3/3] Starting Vite Frontend on http://127.0.0.1:5173 ..."
(cd praman-ui && npm run dev -- --port 5173 --host 127.0.0.1) &
UI_PID=$!

# Trap Ctrl+C to cleanly kill both processes
cleanup() {
    echo ""
    echo "Shutting down Praman servers (API: $API_PID, UI: $UI_PID)..."
    kill $API_PID 2>/dev/null || true
    kill $UI_PID 2>/dev/null || true
    echo "Praman successfully stopped."
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

echo ""
echo "======================================================================"
echo "  Praman Copilot is LIVE:"
echo "  - Executive Dossier UI:  http://127.0.0.1:5173"
echo "  - FastAPI Documentation: http://127.0.0.1:8000/docs"
echo "  - Real-time Health:      http://127.0.0.1:8000/api/health"
echo "======================================================================"
echo "Press Ctrl+C to stop all servers."
echo ""

wait
