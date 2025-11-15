# Quick script to start the backend
Write-Host "Starting LINCOLN Backend..." -ForegroundColor Cyan
Write-Host ""

$backendPath = "backend\c++\build\bin\Release\lincoln-api.exe"

if (-not (Test-Path $backendPath)) {
    Write-Host "ERROR: Backend not found at $backendPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "You need to build it first:" -ForegroundColor Yellow
    Write-Host "  cd backend\c++" -ForegroundColor White
    Write-Host "  .\build.ps1" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "Found backend executable" -ForegroundColor Green
Write-Host "Starting server on http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Keep this window open!" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the backend
& $backendPath

