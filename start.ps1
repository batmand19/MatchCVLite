Write-Host "=== MatchCV Lite ===" -ForegroundColor Cyan
Write-Host ""

# 1. Install backend dependencies
Write-Host "[1/4] Instalando dependencias del backend..." -ForegroundColor Yellow
pip install -r backend\requirements.txt 2>&1 | Out-Null

# 2. Install frontend dependencies
Write-Host "[2/4] Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install 2>&1 | Out-Null
Set-Location ..

# 3. Start backend (in new window)
Write-Host "[3/4] Iniciando backend (puerto 8000)..." -ForegroundColor Yellow
$backendJob = Start-Process -WindowStyle Hidden -FilePath "python" -ArgumentList "-m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000" -PassThru
Start-Sleep -Seconds 2

# 4. Start frontend (in new window)
Write-Host "[4/4] Iniciando frontend (puerto 5173)..." -ForegroundColor Yellow
$frontendJob = Start-Process -WindowStyle Normal -FilePath "cmd" -ArgumentList "/c cd /d `"$(Get-Location)`" && npm --prefix frontend run dev" -PassThru

Write-Host ""
Write-Host "=== LISTO ===" -ForegroundColor Green
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Abre http://localhost:5173 en tu navegador." -ForegroundColor White
Write-Host "Para ver los logs del backend, abre otra terminal y corre:" -ForegroundColor Gray
Write-Host "  python -m uvicorn backend.main:app --reload" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona Ctrl+C para cerrar el servidor frontend." -ForegroundColor Gray

# Keep the script running so the frontend stays visible
Wait-Process -Id $frontendJob.Id
