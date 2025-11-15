# Script para iniciar los emuladores de Firebase
# Este script compila las funciones y luego inicia los emuladores

Write-Host "Iniciando emuladores de Firebase..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estemos en el directorio correcto
if (-not (Test-Path "firebase.json")) {
    Write-Host "Error: No se encontro firebase.json. Asegurate de estar en el directorio raiz del proyecto." -ForegroundColor Red
    exit 1
}

# Compilar las funciones primero
Write-Host "Compilando funciones de Firebase..." -ForegroundColor Yellow
Push-Location functions

if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias de funciones..." -ForegroundColor Yellow
    npm install
}

Write-Host "Compilando TypeScript..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar las funciones." -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "Funciones compiladas correctamente" -ForegroundColor Green
Write-Host ""

# Volver al directorio raiz
Pop-Location

# Iniciar los emuladores
Write-Host "Iniciando emuladores de Firebase..." -ForegroundColor Cyan
Write-Host "Emuladores disponibles:" -ForegroundColor Yellow
Write-Host "  - Functions: http://localhost:5001" -ForegroundColor White
Write-Host "  - Firestore: http://localhost:8082" -ForegroundColor White
Write-Host "  - UI: http://localhost:4001" -ForegroundColor White
Write-Host ""

firebase emulators:start --only functions,firestore
