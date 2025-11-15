# Script para iniciar solo las Functions de Firebase
# Asegúrate de que los emuladores estén corriendo primero

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INICIANDO FIREBASE FUNCTIONS        " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "  Asegúrate de que los emuladores estén corriendo" -ForegroundColor Yellow
Write-Host "  (Ejecuta .\start.ps1 en otra terminal primero)" -ForegroundColor Yellow
Write-Host ""

# Cambiar al directorio de functions
Set-Location functions

Write-Host "[*] Compilando Functions..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Error al compilar Functions" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Functions compiladas correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "[*] Iniciando Functions Emulator..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Las Functions estarán disponibles en:" -ForegroundColor Green
Write-Host "  - http://localhost:5001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para detener, presiona Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Iniciar el emulador de functions
firebase emulators:start --only functions

