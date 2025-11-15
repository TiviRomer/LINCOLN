# Script de inicio para LINCOLN
# Uso: .\start.ps1 [-Environment Development|Staging|Production]

param (
    [ValidateSet('Development', 'Staging', 'Production')]
    [string]$Environment = 'Development'
)

# Configuración
$ErrorActionPreference = "Stop"
$distDir = ".\dist"
$apiExecutable = "$distDir\lincoln-api.exe"
$frontendUrl = "http://localhost:3000"
$apiUrl = "http://localhost:8080"

# Verificar si el directorio dist existe
if (-not (Test-Path -Path $distDir)) {
    Write-Host "No se encontró el directorio de distribución. Ejecuta primero .\scripts\build\build.ps1" -ForegroundColor Red
    exit 1
}

# Verificar si el ejecutable de la API existe
if (-not (Test-Path -Path $apiExecutable)) {
    Write-Host "No se encontró el ejecutable de la API. Asegúrate de que la compilación se haya completado correctamente." -ForegroundColor Red
    exit 1
}

# Función para abrir una URL en el navegador predeterminado
function Start-Browser {
    param([string]$url)
    try {
        Start-Process $url
    }
    catch {
        Write-Host "No se pudo abrir la URL en el navegador. Por favor, abre manualmente: $url" -ForegroundColor Yellow
    }
}

# Mostrar banner
Write-Host ""
Write-Host "  _      ___  _   _  ____  _   _  _   _ " -ForegroundColor Cyan
Write-Host " | |    |_ _|| \ | ||  _ \| \ | || \ | |" -ForegroundColor Cyan
Write-Host " | |     | | |  \| || |_) |  \| ||  \| |" -ForegroundColor Cyan
Write-Host " | |___  | | | |\  ||  __/| |\  || |\  |" -ForegroundColor Cyan
Write-Host " |_____||___||_| \_||_|   |_| \_||_| \_|" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Sistema de Seguridad para Servidores Gubernamentales" -ForegroundColor White
Write-Host "  ===========================================" -ForegroundColor Gray
Write-Host "  Entorno: $Environment" -ForegroundColor Yellow
Write-Host "  API: $apiUrl" -ForegroundColor Green
Write-Host "  Frontend: $frontendUrl" -ForegroundColor Green
Write-Host ""

# Iniciar la API
Write-Host "Iniciando API..." -ForegroundColor Cyan
$apiProcess = Start-Process -FilePath $apiExecutable -ArgumentList "--env $Environment" -PassThru -NoNewWindow

# Esperar a que la API esté lista
Write-Host "Esperando a que la API esté lista..." -ForegroundColor Cyan
$apiReady = $false
$attempts = 0
$maxAttempts = 10

while (-not $apiReady -and $attempts -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "$apiUrl/health" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $apiReady = $true
            Write-Host "API lista!" -ForegroundColor Green
        }
    }
    catch {
        $attempts++
        Start-Sleep -Seconds 1
        Write-Host "." -NoNewline -ForegroundColor DarkGray
    }
}

if (-not $apiReady) {
    Write-Host "No se pudo conectar a la API después de $maxAttempts intentos." -ForegroundColor Red
    Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

# Iniciar el frontend en modo desarrollo
if ($Environment -eq 'Development') {
    Write-Host "Iniciando frontend en modo desarrollo..." -ForegroundColor Cyan
    $frontendProcess = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory ".\frontend" -PassThru -NoNewWindow
    
    # Esperar un momento para que el servidor de desarrollo se inicie
    Start-Sleep -Seconds 5
    
    # Abrir el navegador con la aplicación
    Start-Browser -url $frontendUrl
}
else {
    # En producción, servir los archivos estáticos
    Write-Host "Sirviendo archivos estáticos..." -ForegroundColor Cyan
    $frontendProcess = Start-Process -FilePath "npx" -ArgumentList "http-server .\dist\www -p 3000 -c-1" -PassThru -NoNewWindow
    
    # Abrir el navegador con la aplicación
    Start-Browser -url $frontendUrl
}

# Mostrar mensaje de ayuda
Write-Host ""
Write-Host "=== Controles ===" -ForegroundColor Cyan
Write-Host "Presiona Ctrl+C para detener los servicios" -ForegroundColor Yellow
Write-Host ""

# Esperar a que el usuario presione Ctrl+C
try {
    # Mantener el script en ejecución
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    # Limpiar al salir
    Write-Host ""
    Write-Host "Deteniendo servicios..." -ForegroundColor Cyan
    
    # Detener procesos
    if ($apiProcess -and -not $apiProcess.HasExited) {
        Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    if ($frontendProcess -and -not $frontendProcess.HasExited) {
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    # Detener cualquier proceso de Node.js que haya quedado
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "Servicios detenidos." -ForegroundColor Green
}
