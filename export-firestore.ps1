# Script para exportar datos de Firestore manualmente
# Ejecutar MIENTRAS Firebase está corriendo

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   EXPORTAR DATOS DE FIRESTORE         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Firebase esté corriendo
$javaProcess = Get-Process -Name "java" -ErrorAction SilentlyContinue

if (-not $javaProcess) {
    Write-Host "[X] Firebase NO está corriendo" -ForegroundColor Red
    Write-Host "   Inicia Firebase primero con: .\start-simple-no-functions.ps1" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "[OK] Firebase está corriendo" -ForegroundColor Green
Write-Host ""
Write-Host "Exportando datos a ./emulator-data ..." -ForegroundColor Cyan
Write-Host ""

# Ejecutar exportación
firebase emulators:export ./emulator-data --force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Verificar exportación
if (Test-Path ".\emulator-data\firestore_export") {
    $files = Get-ChildItem ".\emulator-data\firestore_export" -Recurse
    Write-Host "[OK] Exportacion completa" -ForegroundColor Green
    Write-Host ("   Archivos exportados: " + $files.Count) -ForegroundColor Cyan
} else {
    Write-Host "[!] No se encontraron archivos exportados" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Para ver los datos:" -ForegroundColor Cyan
Write-Host "   node scripts/view-data.js" -ForegroundColor White
Write-Host ""

