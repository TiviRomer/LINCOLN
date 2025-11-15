# LINCOLN - Script de Cierre Seguro
# Cierra los servicios correctamente para guardar los datos

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   CERRANDO LINCOLN CORRECTAMENTE      " -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "[*] Buscando procesos de LINCOLN..." -ForegroundColor Cyan

# Buscar procesos de Node (Frontend y start-dev.js)
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

# Buscar procesos de Java (Firebase Emulators)
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue

if (-not $nodeProcesses -and -not $javaProcesses) {
    Write-Host "[OK] No hay procesos de LINCOLN en ejecucion" -ForegroundColor Green
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "Procesos encontrados:" -ForegroundColor Cyan
if ($nodeProcesses) {
    Write-Host "  - $($nodeProcesses.Count) proceso(s) Node" -ForegroundColor White
}
if ($javaProcesses) {
    Write-Host "  - $($javaProcesses.Count) proceso(s) Java (Firebase)" -ForegroundColor White
}

Write-Host ""
Write-Host "[!] ADVERTENCIA:" -ForegroundColor Red
Write-Host "    Este script cierra FORZADAMENTE los procesos" -ForegroundColor Yellow
Write-Host "    Los datos NO se exportaran automaticamente" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para cerrar CORRECTAMENTE y GUARDAR datos:" -ForegroundColor Green
Write-Host "  1. Ve a la terminal donde ejecutaste start.ps1" -ForegroundColor Cyan
Write-Host "  2. Presiona Ctrl+C UNA VEZ" -ForegroundColor Cyan
Write-Host "  3. Espera a que termine la exportacion" -ForegroundColor Cyan
Write-Host ""

$response = Read-Host "¿Continuar con cierre FORZADO? (S/N)"

if ($response -ne "S" -and $response -ne "s") {
    Write-Host ""
    Write-Host "[*] Operacion cancelada" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "[*] Cerrando procesos..." -ForegroundColor Yellow

$totalClosed = 0

# Cerrar Node
if ($nodeProcesses) {
    foreach ($proc in $nodeProcesses) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        $totalClosed++
    }
    Write-Host "  [OK] Cerrados $($nodeProcesses.Count) procesos Node" -ForegroundColor Green
}

# Cerrar Java
if ($javaProcesses) {
    foreach ($proc in $javaProcesses) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        $totalClosed++
    }
    Write-Host "  [OK] Cerrados $($javaProcesses.Count) procesos Java" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Total: $totalClosed procesos cerrados " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "[!] RECORDATORIO:" -ForegroundColor Yellow
Write-Host "    Los datos NO fueron exportados" -ForegroundColor Red
Write-Host "    Para guardar datos, usa Ctrl+C en la terminal" -ForegroundColor Yellow
Write-Host ""

