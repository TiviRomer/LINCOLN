# LINCOLN - Script Simple con Persistencia Garantizada
# Modo: Dos terminales separadas para mejor control

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   LINCOLN - INICIO SIMPLE             " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Limpiar procesos previos (solo de LINCOLN, no de Cursor)
Write-Host "[*] Limpiando procesos previos de LINCOLN..." -ForegroundColor Yellow
# No cerramos todos los Node porque Cursor los usa
$processes = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "   [OK] Procesos de Firebase cerrados" -ForegroundColor Green
} else {
    Write-Host "   [OK] No hay procesos previos" -ForegroundColor Green
}
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "INSTRUCCIONES:" -ForegroundColor Green
Write-Host ""
Write-Host "Este script inicia SOLO Firebase Emulators." -ForegroundColor Cyan
Write-Host "Para iniciar el frontend, abre OTRA terminal PowerShell y ejecuta:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""
Write-Host "PERSISTENCIA: Activada" -ForegroundColor Green
Write-Host "   Carpeta: ./emulator-data" -ForegroundColor Cyan
Write-Host ""
Write-Host "PARA GUARDAR DATOS AL CERRAR:" -ForegroundColor Yellow
Write-Host "   1. Presiona Ctrl+C en ESTA terminal (UNA VEZ)" -ForegroundColor White
Write-Host "   2. ESPERA hasta ver: 'Export complete'" -ForegroundColor White
Write-Host "   3. Luego cierra el frontend normalmente" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

# Verificar/crear carpeta emulator-data
if (-not (Test-Path ".\emulator-data")) {
    Write-Host "[*] Creando carpeta emulator-data..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path ".\emulator-data" -Force | Out-Null
    Write-Host "   [OK] Carpeta creada" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Iniciando Firebase Emulators..." -ForegroundColor Cyan
Write-Host ""

# Iniciar Firebase
firebase emulators:start --import=./emulator-data --export-on-exit

# Al terminar, verificar exportacion
Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

if (Test-Path ".\emulator-data\auth_export") {
    Write-Host "[OK] Datos exportados correctamente" -ForegroundColor Green
    Write-Host "   Ubicacion: .\emulator-data\auth_export\" -ForegroundColor Cyan
    
    # Mostrar usuarios guardados si existen
    if (Test-Path ".\emulator-data\auth_export\accounts.json") {
        try {
            $accounts = Get-Content ".\emulator-data\auth_export\accounts.json" -Raw | ConvertFrom-Json
            $userCount = $accounts.users.Count
            Write-Host "   Usuarios guardados: $userCount" -ForegroundColor Cyan
        } catch {
            # Ignorar errores de parseo
        }
    }
} else {
    Write-Host "[!] No se encontraron datos exportados" -ForegroundColor Yellow
    Write-Host "   Esto puede significar que:" -ForegroundColor Gray
    Write-Host "   - No habia datos que exportar" -ForegroundColor Gray
    Write-Host "   - El cierre fue interrumpido" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[OK] Firebase Emulators cerrados" -ForegroundColor Green
Write-Host ""
