param(
    [switch]$Install
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    throw "Python nao foi encontrado no PATH. Instale Python 3.12+."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "Node.js/npm nao foi encontrado no PATH. Instale Node.js 18+."
}

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"
$python = Join-Path $backendPath "venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
    Write-Host "Criando ambiente virtual do backend..."
    python -m venv (Join-Path $backendPath "venv")
}

if ($Install) {
    & $python -m pip install -r (Join-Path $backendPath "requirements.txt")
    npm --prefix $frontendPath install
}

$redisUrl = Get-Content (Join-Path $backendPath ".env") | Where-Object { $_ -match '^REDIS_URL=' } | Select-Object -First 1
if ($redisUrl -match '^REDIS_URL=redis://localhost:6379') {
    if (-not (Test-NetConnection -ComputerName localhost -Port 6379 -InformationLevel Quiet)) {
        Write-Warning "Redis nao esta acessivel em localhost:6379. A API pode iniciar, mas o Celery nao funcionara."
    }
}

$backendCommand = "Set-Location '$backendPath'; & '$python' -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
$workerCommand = "Set-Location '$backendPath'; & '$python' -m celery -A app.core.celery worker --loglevel=info --pool=solo"
$beatCommand = "Set-Location '$backendPath'; & '$python' -m celery -A app.core.celery beat --loglevel=info"
$frontendCommand = "Set-Location '$frontendPath'; npm run dev"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand
Start-Process powershell -ArgumentList "-NoExit", "-Command", $workerCommand
Start-Process powershell -ArgumentList "-NoExit", "-Command", $beatCommand

Write-Host "Servicos iniciados: frontend (3000), backend (8000), Celery worker e Celery beat."d