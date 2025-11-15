# Restart LINCOLN - Script Todo-en-Uno
# Este script limpia todos los procesos y reinicia el sistema

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   REINICIANDO LINCOLN LIMPIAMENTE     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# PASO 1: Limpieza
Write-Host "🧹 PASO 1/3: Limpiando procesos anteriores..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar script de limpieza
& "$PSScriptRoot\cleanup.ps1"

# PASO 2: Esperar
Write-Host ""
Write-Host "⏳ PASO 2/3: Esperando que los procesos terminen completamente..." -ForegroundColor Cyan

for ($i = 3; $i -gt 0; $i--) {
    Write-Host "   $i..." -ForegroundColor White
    Start-Sleep -Seconds 1
}

# PASO 3: Verificar puertos
Write-Host ""
Write-Host "🔍 PASO 3/3: Verificando que los puertos estén libres..." -ForegroundColor Cyan
Write-Host ""

$portsToCheck = @(3000, 4000, 5001, 8081, 9099)
$allClear = $true

foreach ($port in $portsToCheck) {
    $connection = netstat -ano | Select-String ":$port.*LISTENING"
    if ($connection) {
        Write-Host "  ⚠️  Advertencia: Puerto $port todavía en uso" -ForegroundColor Yellow
        $allClear = $false
    } else {
        Write-Host "  ✅ Puerto $port: Libre" -ForegroundColor Green
    }
}

Write-Host ""

if (-not $allClear) {
    Write-Host "⚠️  ADVERTENCIA: Algunos puertos todavía están en uso" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "¿Quieres intentar cerrarlos de forma más agresiva? (S/N): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq "S" -or $response -eq "s") {
        Write-Host ""
        Write-Host "💥 Cerrando TODOS los procesos de Node y Java..." -ForegroundColor Red
        
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
        Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force
        
        Write-Host "✅ Procesos cerrados" -ForegroundColor Green
        Write-Host ""
        Write-Host "⏳ Esperando 3 segundos..." -ForegroundColor Cyan
        Start-Sleep -Seconds 3
    }
}

# Iniciar sistema
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   🚀 INICIANDO LINCOLN...             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Iniciar el script principal
node start-dev.js

