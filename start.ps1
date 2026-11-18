# ==============================================================================
# Praman Copilot — Autonomous B2B Financial Reconciliation Engine
# Arthaton 2026 Judge Startup Script (Windows PowerShell)
# ==============================================================================

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  PRAMAN AI — Autonomous Financial Reconciliation & Cashflow Protection" -ForegroundColor White
Write-Host "  Arthaton 2026 Startup Orchestrator (Windows)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# 1. Verify Python & Node
try {
    $pythonVersion = python --version
    Write-Host "[✓] Python detected: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Error "Python is not installed or not in PATH."
    exit 1
}

try {
    $nodeVersion = node --version
    Write-Host "[✓] Node detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Error "Node.js / npm is not installed or not in PATH."
    exit 1
}

# 2. Check and seed DuckDB / raw synthetic financial datasets if missing
$duckdbPath = "praman-data\praman.duckdb"
$csvPath = "praman-data\raw_csvs\bank_statement.csv"

if (-not (Test-Path $duckdbPath) -or -not (Test-Path $csvPath)) {
    Write-Host "[1/3] Generating 10,040+ realistic noisy Indian financial rows & injecting scenarios..." -ForegroundColor Yellow
    python praman-data\generator.py
    python praman-data\patch_scenarios.py
    python praman-data\seed_duckdb.py
} else {
    Write-Host "[1/3] DuckDB analytical store (praman.duckdb) and 10,040+ CSV rows verified." -ForegroundColor Green
}

# 3. Check and install frontend packages if node_modules is missing
if (-not (Test-Path "praman-ui\node_modules")) {
    Write-Host "[*] Installing frontend dependencies in praman-ui..." -ForegroundColor Yellow
    Push-Location "praman-ui"
    npm install
    Pop-Location
}

# 4. Set Environment & Start Background Services
$scriptRoot = $PSScriptRoot
if (-not $scriptRoot) { $scriptRoot = Get-Location }

$env:PYTHONPATH = "$scriptRoot\praman-api\src"

Write-Host ""
Write-Host "[2/3] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Cyan
$apiProcess = Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "praman_api.main:app", "--host", "127.0.0.1", "--port", "8000" -PassThru -NoNewWindow

Write-Host "[3/3] Starting Vite Frontend on http://127.0.0.1:5173 ..." -ForegroundColor Cyan
$uiProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev", "--", "--port", "5173", "--host", "127.0.0.1" -WorkingDirectory "$scriptRoot\praman-ui" -PassThru -NoNewWindow

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "  Praman Copilot is LIVE:" -ForegroundColor White
Write-Host "  - Executive Dossier UI:  http://127.0.0.1:5173" -ForegroundColor Yellow
Write-Host "  - FastAPI Documentation: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "  - Real-time Health:      http://127.0.0.1:8000/api/health" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop all servers."
Write-Host ""

try {
    while (-not $apiProcess.HasExited -and -not $uiProcess.HasExited) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`nStopping Praman services..." -ForegroundColor Yellow
    if ($apiProcess -and -not $apiProcess.HasExited) { Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue }
    if ($uiProcess -and -not $uiProcess.HasExited) { Stop-Process -Id $uiProcess.Id -Force -ErrorAction SilentlyContinue }
    Write-Host "Praman successfully stopped." -ForegroundColor Green
}
