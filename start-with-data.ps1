# LINCOLN - Inicio con Auto-Población de Datos
# Este script inicia Firebase y puebla automáticamente si está vacío

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   LINCOLN - INICIO CON DATOS          " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Limpiar procesos previos
Write-Host "[*] Limpiando procesos previos..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Crear carpeta si no existe
if (-not (Test-Path ".\emulator-data")) {
    New-Item -ItemType Directory -Path ".\emulator-data" -Force | Out-Null
}

Write-Host ""
Write-Host "PASO 1: Iniciando Firebase Emulators..." -ForegroundColor Cyan
Write-Host ""

# Iniciar Firebase en background
$firebaseJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    firebase emulators:start --import=./emulator-data --export-on-exit
} -ArgumentList (Get-Location).Path

# Esperar a que Firebase inicie (15 segundos)
Write-Host "Esperando a que Firebase inicie..." -ForegroundColor Yellow
for ($i = 15; $i -gt 0; $i--) {
    Write-Host "   $i segundos..." -ForegroundColor Gray
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "PASO 2: Verificando y poblando datos..." -ForegroundColor Cyan
Write-Host ""

# Verificar si hay datos
$testResult = node scripts/test-connection.js 2>&1
if ($testResult -match "Servidores actuales: 0") {
    Write-Host "[!] Firestore vacío - Poblando con datos de prueba..." -ForegroundColor Yellow
    Write-Host ""
    node scripts/populate-firestore.js
    Write-Host ""
    Write-Host "[OK] Datos poblados exitosamente" -ForegroundColor Green
} else {
    Write-Host "[OK] Firestore ya tiene datos" -ForegroundColor Green
    node scripts/view-data.js
}

Write-Host ""
Write-Host "PASO 3: Iniciando Frontend..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Ejecuta en OTRA terminal:" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   SISTEMA LISTO                       " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs disponibles:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Firebase UI: http://localhost:4000" -ForegroundColor White
Write-Host ""
Write-Host "NOTA: Los datos de Firestore no persisten entre reinicios" -ForegroundColor Yellow
Write-Host "      (limitacion de emuladores). Se auto-pueblan al iniciar." -ForegroundColor Gray
Write-Host ""
Write-Host "Para cerrar: Ctrl+C" -ForegroundColor Cyan
Write-Host ""

# Esperar y mostrar logs de Firebase
Wait-Job $firebaseJob
Receive-Job $firebaseJob
Remove-Job $firebaseJob

