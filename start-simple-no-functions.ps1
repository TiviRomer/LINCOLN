# LINCOLN - Iniciar sin Functions (temporalmente)
# Para evitar errores de compilacion de las functions

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   LINCOLN - SIN FUNCTIONS             " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Limpiar procesos previos
Write-Host "[*] Limpiando procesos previos..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "NOTA: Functions desactivadas temporalmente" -ForegroundColor Yellow
Write-Host "      (Por errores de compilacion)" -ForegroundColor Gray
Write-Host ""
Write-Host "INSTRUCCIONES:" -ForegroundColor Green
Write-Host "1. Este script inicia Auth y Firestore Emulators" -ForegroundColor Cyan
Write-Host "2. Abre OTRA terminal y ejecuta:" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "PERSISTENCIA: Activada" -ForegroundColor Green
Write-Host "   Carpeta: ./emulator-data" -ForegroundColor Cyan
Write-Host ""
Write-Host "PARA GUARDAR DATOS:" -ForegroundColor Yellow
Write-Host "   1. Presiona Ctrl+C UNA VEZ" -ForegroundColor White
Write-Host "   2. ESPERA 'Export complete'" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

# Verificar/crear carpeta
if (-not (Test-Path ".\emulator-data")) {
    New-Item -ItemType Directory -Path ".\emulator-data" -Force | Out-Null
}

Write-Host "Iniciando Firebase Emulators (Auth + Firestore)..." -ForegroundColor Cyan
Write-Host ""

# Iniciar emuladores (Auth, Firestore y UI)
firebase emulators:start --import=./emulator-data --export-on-exit

Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

if (Test-Path ".\emulator-data\auth_export") {
    Write-Host "[OK] Datos exportados correctamente" -ForegroundColor Green
} else {
    Write-Host "[!] No se encontraron datos exportados" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[OK] Emulators cerrados" -ForegroundColor Green
Write-Host ""

