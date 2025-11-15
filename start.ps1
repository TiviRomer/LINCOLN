# LINCOLN - Ejecutador Principal Unificado
# Este script maneja TODO: compilacion de funciones, emuladores, etc.
# Todo se ejecuta desde este unico punto de entrada

param(
    [switch]$NoFunctions,
    [switch]$Help,
    [switch]$NoFrontend
)

# Mostrar ayuda si se solicita
if ($Help) {
    Write-Host ""
    Write-Host "LINCOLN - Ejecutador Principal Unificado" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor Yellow
    Write-Host "  .\start.ps1                    # Inicia TODO (compila funciones + emuladores)"
    Write-Host "  .\start.ps1 -NoFunctions       # Inicia solo emuladores sin compilar funciones"
    Write-Host "  .\start.ps1 -NoFrontend        # Inicia emuladores sin frontend"
    Write-Host ""
    exit 0
}

# Configuracion
$ErrorActionPreference = "Stop"
$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   LINCOLN - Sistema de Seguridad      " -ForegroundColor Cyan
Write-Host "   Ejecutador Principal Unificado      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "$rootDir\firebase.json")) {
    Write-Host "Error: No se encontro firebase.json" -ForegroundColor Red
    Write-Host "Asegurate de estar en el directorio raiz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Limpiar procesos previos
Write-Host "[*] Limpiando procesos previos..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Verificar/crear carpeta de datos del emulador
if (-not (Test-Path "$rootDir\emulator-data")) {
    Write-Host "[*] Creando carpeta emulator-data..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "$rootDir\emulator-data" -Force | Out-Null
}

# Compilar funciones (solo si no se especifica -NoFunctions)
if (-not $NoFunctions) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Gray
    Write-Host "   COMPILANDO FUNCIONES DE FIREBASE    " -ForegroundColor Gray
    Write-Host "========================================" -ForegroundColor Gray
    Write-Host ""
    
    Push-Location "$rootDir\functions"
    
    # Verificar si existe node_modules
    if (-not (Test-Path "node_modules")) {
        Write-Host "[*] Instalando dependencias de funciones..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error: No se pudieron instalar las dependencias" -ForegroundColor Red
            Pop-Location
            exit 1
        }
    }
    
    # Compilar funciones
    Write-Host "[*] Compilando funciones TypeScript..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Error: No se pudieron compilar las funciones" -ForegroundColor Red
        Write-Host "Usa -NoFunctions para iniciar sin funciones:" -ForegroundColor Yellow
        Write-Host "  .\start.ps1 -NoFunctions" -ForegroundColor White
        Write-Host ""
        Pop-Location
        exit 1
    }
    
    Write-Host "[OK] Funciones compiladas correctamente" -ForegroundColor Green
    Pop-Location
}

# Iniciar emuladores (TODO UNIFICADO AQUI)
Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host "   INICIANDO EMULADORES DE FIREBASE     " -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

# Determinar que emuladores iniciar
if ($NoFunctions) {
    Write-Host "[*] Modo: Sin Functions (solo Auth + Firestore)" -ForegroundColor Yellow
    $emulatorsList = "firestore,auth"
} else {
    Write-Host "[*] Modo: Completo (Auth + Firestore + Functions)" -ForegroundColor Green
    $emulatorsList = "functions,firestore,auth"
}

Write-Host "[*] Iniciando emuladores..." -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs disponibles:" -ForegroundColor Yellow
Write-Host "  - UI Emulator: http://localhost:4001" -ForegroundColor White
if (-not $NoFunctions) {
    Write-Host "  - Functions: http://localhost:5001" -ForegroundColor White
}
Write-Host "  - Firestore: http://localhost:8082" -ForegroundColor White
Write-Host "  - Auth: http://localhost:9099" -ForegroundColor White
Write-Host ""
Write-Host "NOTA: Todo se ejecuta desde este mismo proceso" -ForegroundColor Cyan
Write-Host "      No necesitas ejecutar otros scripts" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

# EJECUTAR TODO AQUI - Iniciar emuladores y frontend
Write-Host "[*] Ejecutando firebase emulators:start..." -ForegroundColor Gray
Write-Host ""

# Iniciar emuladores en background si no se especifica -NoFrontend
if (-not $NoFrontend) {
    Write-Host "[*] Los emuladores iniciarán en una nueva ventana" -ForegroundColor Cyan
    Write-Host "[*] El frontend se iniciará automáticamente después de 15 segundos" -ForegroundColor Cyan
    Write-Host ""
    
    # Iniciar emuladores en una nueva ventana de PowerShell
    if ($NoFunctions) {
        $emulatorProcess = Start-Process powershell -ArgumentList @(
            "-NoExit",
            "-Command",
            "cd '$rootDir'; firebase emulators:start --import=./emulator-data --export-on-exit --only firestore,auth"
        ) -PassThru
    } else {
        $emulatorProcess = Start-Process powershell -ArgumentList @(
            "-NoExit",
            "-Command",
            "cd '$rootDir'; firebase emulators:start --import=./emulator-data --export-on-exit"
        ) -PassThru
    }
    
    Write-Host "[OK] Emuladores iniciando en nueva ventana (PID: $($emulatorProcess.Id))..." -ForegroundColor Green
    Write-Host "[*] Esperando 15 segundos para que los emuladores estén listos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Iniciar detección automática en segundo plano
    if (-not $NoFunctions) {
        Write-Host ""
        Write-Host "[*] Iniciando detección automática en segundo plano..." -ForegroundColor Cyan
        $autoDetectionScript = Join-Path $rootDir "scripts\run-automatic-detection.js"
        if (Test-Path $autoDetectionScript) {
            # Usar detección directa en lugar de función HTTP
            $wrapperScript = Join-Path $rootDir "scripts\auto-detection-wrapper.js"
            if (Test-Path $wrapperScript) {
                $autoDetectionProcess = Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList $wrapperScript,"30" -PassThru
                Write-Host "[OK] Detección automática iniciada (cada 30 segundos, PID: $($autoDetectionProcess.Id))" -ForegroundColor Green
                Write-Host "      Usando detección directa (sin funciones HTTP)" -ForegroundColor Cyan
            } else {
                $autoDetectionProcess = Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList $autoDetectionScript,"30" -PassThru
                Write-Host "[OK] Detección automática iniciada (cada 30 segundos, PID: $($autoDetectionProcess.Id))" -ForegroundColor Green
            }
        } else {
            Write-Host "[!] Script de detección automática no encontrado: $autoDetectionScript" -ForegroundColor Yellow
        }
    }
    
    # Iniciar frontend
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Gray
    Write-Host "   INICIANDO FRONTEND                   " -ForegroundColor Gray
    Write-Host "========================================" -ForegroundColor Gray
    Write-Host ""
    
    Push-Location "$rootDir\frontend"
    
    # Verificar si existe node_modules en frontend
    if (-not (Test-Path "node_modules")) {
        Write-Host "[*] Instalando dependencias del frontend..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error: No se pudieron instalar las dependencias del frontend" -ForegroundColor Red
            Pop-Location
            exit 1
        }
    }
    
    Write-Host "[*] Iniciando frontend..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "URLs disponibles:" -ForegroundColor Yellow
    Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "  - UI Emulator: http://localhost:4001" -ForegroundColor White
    if (-not $NoFunctions) {
        Write-Host "  - Functions: http://localhost:5001" -ForegroundColor White
    }
    Write-Host "  - Firestore: http://localhost:8082" -ForegroundColor White
    Write-Host "  - Auth: http://localhost:9099" -ForegroundColor White
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Gray
    Write-Host ""
    
    # Ejecutar frontend (esto mantendrá la terminal activa)
    npm run dev
    
    Pop-Location
    
    # Cuando se cierre el frontend, informar sobre los emuladores
    Write-Host ""
    Write-Host "[*] Frontend cerrado" -ForegroundColor Yellow
    Write-Host "[*] Los emuladores siguen corriendo en otra ventana" -ForegroundColor Cyan
    Write-Host "[*] Para cerrarlos, cierra la ventana de emuladores o presiona Ctrl+C en ella" -ForegroundColor Cyan
    
} else {
    # Solo iniciar emuladores (sin frontend)
    if ($NoFunctions) {
        firebase emulators:start --import=./emulator-data --export-on-exit --only firestore,auth
    } else {
        firebase emulators:start --import=./emulator-data --export-on-exit
    }
}

# Cuando se cierren los emuladores
Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host "   EMULADORES CERRADOS                  " -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

# Verificar exportacion de datos
if (Test-Path "$rootDir\emulator-data\firestore_export") {
    Write-Host "[OK] Datos de Firestore exportados" -ForegroundColor Green
} else {
    Write-Host "[!] No se encontraron datos de Firestore" -ForegroundColor Yellow
}

if (Test-Path "$rootDir\emulator-data\auth_export") {
    Write-Host "[OK] Datos de Auth exportados" -ForegroundColor Green
} else {
    Write-Host "[!] No se encontraron datos de Auth" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[OK] Proceso completado" -ForegroundColor Green
Write-Host ""
