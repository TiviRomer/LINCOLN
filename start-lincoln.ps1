# LINCOLN - Script de Inicio Completo con Auto-Población
# Este script maneja todo el flujo de inicio

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "      INICIANDO LINCOLN v2.0           " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Limpiar procesos previos
Write-Host "[1/4] Limpiando procesos previos..." -ForegroundColor Yellow
Get-Process -Name "node","java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "      [OK] Procesos limpiados" -ForegroundColor Green
Write-Host ""

# Crear carpeta si no existe
if (-not (Test-Path ".\emulator-data")) {
    New-Item -ItemType Directory -Path ".\emulator-data" -Force | Out-Null
}

# Iniciar Firebase
Write-Host "[2/4] Iniciando Firebase Emulators..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\start-simple-no-functions.ps1" -WindowStyle Normal

# Esperar a que Firebase inicie
Write-Host "      Esperando a que Firebase inicie..." -ForegroundColor Gray
for ($i = 12; $i -gt 0; $i--) {
    Write-Host "      $i..." -ForegroundColor Gray
    Start-Sleep -Seconds 1
}
Write-Host "      [OK] Firebase debería estar listo" -ForegroundColor Green
Write-Host ""

# Poblar datos
Write-Host "[3/4] Poblando Firestore con datos de prueba..." -ForegroundColor Yellow
try {
    $output = node scripts/populate-firestore.js 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "      [OK] Datos poblados" -ForegroundColor Green
    } else {
        Write-Host "      [!] Hubo un problema poblando datos" -ForegroundColor Yellow
        Write-Host "      Puedes poblarlo manualmente después con:" -ForegroundColor Gray
        Write-Host "      node scripts/populate-firestore.js" -ForegroundColor Gray
    }
} catch {
    Write-Host "      [!] Error al poblar" -ForegroundColor Yellow
}
Write-Host ""

# Iniciar Frontend
Write-Host "[4/4] Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev" -WindowStyle Normal
Write-Host "      [OK] Frontend iniciándose..." -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "      LINCOLN INICIADO                 " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs disponibles:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Firebase UI: http://localhost:4000" -ForegroundColor White
Write-Host ""
Write-Host "NOTA IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   - Datos de USUARIOS: Persisten (Auth)" -ForegroundColor White
Write-Host "   - Datos de FIRESTORE: Se regeneran al iniciar" -ForegroundColor White
Write-Host "   - (Limitacion de emuladores)" -ForegroundColor Gray
Write-Host ""
Write-Host "Para cerrar todo:" -ForegroundColor Cyan
Write-Host "   Cierra ambas ventanas de PowerShell que se abrieron" -ForegroundColor White
Write-Host ""

