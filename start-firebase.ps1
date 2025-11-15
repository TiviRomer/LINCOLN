# Script para iniciar Firebase Emulators con persistencia garantizada
# Este script se asegura de que los datos se exporten correctamente

Write-Host ""
Write-Host "🔥 Iniciando Firebase Emulators con Persistencia..." -ForegroundColor Cyan
Write-Host ""

# Verificar si existe la carpeta emulator-data
if (Test-Path ".\emulator-data") {
    Write-Host "📂 Carpeta emulator-data encontrada" -ForegroundColor Green
    Write-Host "   Se importaran los datos previos" -ForegroundColor Cyan
} else {
    Write-Host "📂 Creando carpeta emulator-data..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path ".\emulator-data" -Force | Out-Null
    Write-Host "   ✅ Carpeta creada" -ForegroundColor Green
}

Write-Host ""
Write-Host "💾 CONFIGURACION DE PERSISTENCIA:" -ForegroundColor Yellow
Write-Host "   Import: ./emulator-data" -ForegroundColor Cyan
Write-Host "   Export: ./emulator-data (al cerrar)" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE PARA GUARDAR DATOS:" -ForegroundColor Red
Write-Host "   Presiona Ctrl+C UNA VEZ y ESPERA" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Iniciar Firebase con exportación automática
firebase emulators:start --import=./emulator-data --export-on-exit

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ Firebase Emulators cerrados" -ForegroundColor Green

# Verificar que se exportaron los datos
if (Test-Path ".\emulator-data\auth_export") {
    Write-Host "💾 Datos de Auth exportados correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  No se encontraron datos de Auth" -ForegroundColor Yellow
}

if (Test-Path ".\emulator-data\firestore_export") {
    Write-Host "💾 Datos de Firestore exportados correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  No se encontraron datos de Firestore" -ForegroundColor Yellow
}

Write-Host ""

