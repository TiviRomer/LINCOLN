# LINCOLN - Script de Inicio Inteligente
# Limpia procesos previos automaticamente y luego inicia el sistema

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "      INICIANDO LINCOLN v2.0           " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PERSISTENCIA DE DATOS: Activada" -ForegroundColor Green
Write-Host "  Los datos se guardan en: ./emulator-data" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE: Para cerrar correctamente:" -ForegroundColor Yellow
Write-Host "  1. Presiona Ctrl+C UNA SOLA VEZ" -ForegroundColor Yellow
Write-Host "  2. ESPERA a que termine la exportacion" -ForegroundColor Yellow
Write-Host "  3. Tus datos se guardaran automaticamente" -ForegroundColor Yellow
Write-Host ""

# PASO 1: Limpieza automatica de procesos previos
Write-Host "[*] Paso 1/2: Limpiando procesos previos..." -ForegroundColor Yellow

# Cerrar procesos de Java (Firebase Emulators)
$javaCount = 0
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcesses) {
    Write-Host "  [!] Cerrando emuladores de Firebase..." -ForegroundColor Yellow
    Write-Host "     NOTA: Si tenias datos sin guardar, se perderan" -ForegroundColor Red
    Write-Host "     Para evitar esto, cierra siempre con Ctrl+C" -ForegroundColor Yellow
    foreach ($proc in $javaProcesses) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        $javaCount++
    }
}

# Cerrar procesos de Node
$nodeCount = 0
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    $nodeCount++
}

if ($javaCount -gt 0 -or $nodeCount -gt 0) {
    Write-Host "  [OK] Cerrados: $nodeCount procesos Node, $javaCount procesos Java" -ForegroundColor Green
    Write-Host "  [*] Esperando que los puertos se liberen..." -ForegroundColor Cyan
    Start-Sleep -Seconds 4
} else {
    Write-Host "  [OK] No hay procesos previos que limpiar" -ForegroundColor Green
}

# Verificar que los puertos esten libres
Write-Host ""
Write-Host "[*] Verificando puertos..." -ForegroundColor Cyan

$portsToCheck = @(3000, 4000, 5001, 8082, 9099)
$allClear = $true

foreach ($port in $portsToCheck) {
    $connection = netstat -ano | Select-String ":$port.*LISTENING"
    if ($connection) {
        Write-Host "  [!] Puerto $port todavia en uso" -ForegroundColor Yellow
        $allClear = $false
        
        # Intentar cerrar el proceso en ese puerto
        $line = $connection[0].ToString().Trim()
        $parts = $line -split '\s+'
        if ($parts.Count -ge 5) {
            $pid = $parts[-1]
            if ($pid -match '^\d+$') {
                Write-Host "     Cerrando proceso (PID: $pid)..." -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 1
            }
        }
    } else {
        Write-Host "  [OK] Puerto $port libre" -ForegroundColor Green
    }
}

if (-not $allClear) {
    Write-Host ""
    Write-Host "  [*] Esperando a que los puertos se liberen completamente..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
}

# PASO 2: Iniciar el sistema
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "      INICIANDO SERVICIOS...           " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Iniciar el script de Node
node start-dev.js
