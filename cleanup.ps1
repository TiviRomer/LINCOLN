# Script de Limpieza para LINCOLN
# Cierra todos los procesos de Node y Firebase

Write-Host "🧹 Limpiando procesos de LINCOLN..." -ForegroundColor Yellow
Write-Host ""

# Función para cerrar procesos por puerto
function Stop-ProcessOnPort {
    param([int]$Port)
    
    $connections = netstat -ano | Select-String ":$Port"
    
    if ($connections) {
        Write-Host "🔍 Encontrado proceso en puerto $Port" -ForegroundColor Cyan
        
        foreach ($connection in $connections) {
            $line = $connection.ToString().Trim()
            $parts = $line -split '\s+'
            
            if ($parts.Count -ge 5) {
                $pid = $parts[-1]
                
                if ($pid -match '^\d+$') {
                    try {
                        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                        if ($process) {
                            Write-Host "  ⚠️  Cerrando proceso: $($process.ProcessName) (PID: $pid)" -ForegroundColor Yellow
                            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                            Write-Host "  ✅ Proceso cerrado" -ForegroundColor Green
                        }
                    } catch {
                        # Ignorar errores
                    }
                }
            }
        }
    }
}

# Cerrar procesos en puertos específicos
Write-Host "🔍 Buscando procesos en puertos de LINCOLN..." -ForegroundColor Cyan
Write-Host ""

$ports = @(3000, 4000, 5000, 5001, 8081, 9099)

foreach ($port in $ports) {
    Stop-ProcessOnPort -Port $port
}

Write-Host ""
Write-Host "🔍 Buscando procesos de Node.js y Firebase..." -ForegroundColor Cyan

# Cerrar procesos de Node que puedan estar relacionados
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "  ⚠️  Encontrados $($nodeProcesses.Count) procesos de Node.js" -ForegroundColor Yellow
    foreach ($proc in $nodeProcesses) {
        $cmdLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
        if ($cmdLine -like "*firebase*" -or $cmdLine -like "*vite*" -or $cmdLine -like "*LINCOLN*") {
            Write-Host "  ⚠️  Cerrando: $cmdLine" -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            Write-Host "  ✅ Cerrado" -ForegroundColor Green
        }
    }
}

# Cerrar procesos de Java (Firebase Emulators)
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcesses) {
    Write-Host "  ⚠️  Encontrados procesos de Java (Firebase Emulators)" -ForegroundColor Yellow
    foreach ($proc in $javaProcesses) {
        $cmdLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
        if ($cmdLine -like "*firebase*" -or $cmdLine -like "*firestore*") {
            Write-Host "  ⚠️  Cerrando emulador de Firebase" -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            Write-Host "  ✅ Cerrado" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "✅ Limpieza completada!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Ahora puedes iniciar el sistema con:" -ForegroundColor Cyan
Write-Host "   node start-dev.js" -ForegroundColor White
Write-Host ""

