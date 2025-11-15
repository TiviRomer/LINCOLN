# Script de Diagnostico de Persistencia
# Este script te ayuda a diagnosticar por que no se guardan los datos

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DIAGNOSTICO DE PERSISTENCIA         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar carpeta emulator-data
Write-Host "[1/6] Verificando carpeta emulator-data..." -ForegroundColor Yellow
if (Test-Path ".\emulator-data") {
    Write-Host "   [OK] Carpeta existe" -ForegroundColor Green
    
    # Verificar contenido
    $authExport = Test-Path ".\emulator-data\auth_export"
    $firestoreExport = Test-Path ".\emulator-data\firestore_export"
    
    Write-Host ""
    Write-Host "   Contenido actual:" -ForegroundColor Cyan
    if ($authExport) {
        $authFiles = Get-ChildItem ".\emulator-data\auth_export" -Recurse -ErrorAction SilentlyContinue | Measure-Object
        Write-Host ("   - auth_export/: OK (" + $authFiles.Count + " archivos)") -ForegroundColor Green
    } else {
        Write-Host "   - auth_export/: NO EXISTE" -ForegroundColor Red
    }
    
    if ($firestoreExport) {
        $firestoreFiles = Get-ChildItem ".\emulator-data\firestore_export" -Recurse -ErrorAction SilentlyContinue | Measure-Object
        Write-Host ("   - firestore_export/: OK (" + $firestoreFiles.Count + " archivos)") -ForegroundColor Green
    } else {
        Write-Host "   - firestore_export/: NO EXISTE" -ForegroundColor Red
    }
} else {
    Write-Host "   [X] Carpeta NO existe" -ForegroundColor Red
    Write-Host "   Creando carpeta..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path ".\emulator-data" -Force | Out-Null
    Write-Host "   [OK] Carpeta creada" -ForegroundColor Green
}

Write-Host ""

# 2. Verificar firebase.json
Write-Host "[2/6] Verificando configuracion de firebase.json..." -ForegroundColor Yellow
$firebaseJson = Get-Content ".\firebase.json" -Raw | ConvertFrom-Json

if ($firebaseJson.emulators.export) {
    Write-Host "   [OK] Configuracion de export encontrada" -ForegroundColor Green
    Write-Host ("      Path: " + $firebaseJson.emulators.export.path) -ForegroundColor Cyan
} else {
    Write-Host "   [X] NO hay configuracion de export" -ForegroundColor Red
    Write-Host "   SOLUCION: Ejecuta este comando:" -ForegroundColor Yellow
    Write-Host '   Agregar a firebase.json en "emulators":' -ForegroundColor Cyan
    Write-Host '   "export": { "enabled": true, "path": "./emulator-data" }' -ForegroundColor White
}

Write-Host ""

# 3. Verificar Firebase CLI
Write-Host "[3/6] Verificando Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>&1
    Write-Host ("   [OK] Firebase CLI instalado: " + $firebaseVersion) -ForegroundColor Green
} catch {
    Write-Host "   [X] Firebase CLI NO instalado" -ForegroundColor Red
    Write-Host "   SOLUCION: npm install -g firebase-tools" -ForegroundColor Yellow
}

Write-Host ""

# 4. Verificar procesos activos
Write-Host "[4/6] Verificando procesos activos..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue

if ($nodeProcesses -or $javaProcesses) {
    Write-Host "   [!] Hay procesos activos:" -ForegroundColor Yellow
    if ($nodeProcesses) {
        Write-Host ("      - Node: " + $nodeProcesses.Count + " proceso(s)") -ForegroundColor Cyan
    }
    if ($javaProcesses) {
        Write-Host ("      - Java (Firebase): " + $javaProcesses.Count + " proceso(s)") -ForegroundColor Cyan
    }
    Write-Host ""
    Write-Host "   RECOMENDACION:" -ForegroundColor Yellow
    Write-Host "   Si quieres probar la persistencia desde cero:" -ForegroundColor Cyan
    Write-Host "   1. Cierra los procesos con Ctrl+C" -ForegroundColor White
    Write-Host "   2. Espera a que termine la exportacion" -ForegroundColor White
} else {
    Write-Host "   [OK] No hay procesos activos" -ForegroundColor Green
}

Write-Host ""

# 5. Verificar permisos de escritura
Write-Host "[5/6] Verificando permisos de escritura..." -ForegroundColor Yellow
try {
    $testFile = ".\emulator-data\test-$(Get-Random).txt"
    "test" | Out-File $testFile -ErrorAction Stop
    Remove-Item $testFile -ErrorAction Stop
    Write-Host "   [OK] Permisos de escritura correctos" -ForegroundColor Green
} catch {
    Write-Host "   [X] NO hay permisos de escritura" -ForegroundColor Red
    Write-Host ("   Error: " + $_.Exception.Message) -ForegroundColor Red
    Write-Host "   SOLUCION: Ejecuta PowerShell como Administrador" -ForegroundColor Yellow
}

Write-Host ""

# 6. Verificar usuarios existentes
Write-Host "[6/6] Verificando usuarios guardados..." -ForegroundColor Yellow
if (Test-Path ".\emulator-data\auth_export\accounts.json") {
    try {
        $accounts = Get-Content ".\emulator-data\auth_export\accounts.json" -Raw | ConvertFrom-Json
        $userCount = $accounts.users.Count
        Write-Host "   [OK] Archivo de usuarios encontrado" -ForegroundColor Green
        Write-Host ("      Usuarios guardados: " + $userCount) -ForegroundColor Cyan
        
        if ($userCount -gt 0) {
            Write-Host ""
            Write-Host "   Usuarios:" -ForegroundColor Cyan
            foreach ($user in $accounts.users) {
                Write-Host ("   - " + $user.email) -ForegroundColor White
            }
        }
    } catch {
        Write-Host "   [!] Error al leer el archivo de usuarios" -ForegroundColor Yellow
        Write-Host ("      " + $_.Exception.Message) -ForegroundColor Gray
    }
} else {
    Write-Host "   [i] No hay usuarios guardados aun" -ForegroundColor Gray
    Write-Host "      (Esto es normal si es la primera vez)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "         DIAGNOSTICO COMPLETO          " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Resumen y recomendaciones
Write-Host "RESUMEN Y RECOMENDACIONES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para que la persistencia funcione:" -ForegroundColor Cyan
Write-Host "1. [OK] Carpeta emulator-data debe existir" -ForegroundColor White
Write-Host "2. [OK] firebase.json debe tener configuracion de export" -ForegroundColor White
Write-Host "3. [OK] Cerrar con Ctrl+C (una vez) y ESPERAR" -ForegroundColor White
Write-Host "4. [OK] Verificar que aparezcan archivos en auth_export/" -ForegroundColor White
Write-Host ""
Write-Host "PRUEBA ESTO:" -ForegroundColor Yellow
Write-Host "1. Ejecuta: .\start-firebase.ps1" -ForegroundColor Cyan
Write-Host "2. En otra terminal: cd frontend && npm run dev" -ForegroundColor Cyan
Write-Host "3. Registra un usuario en http://localhost:3000" -ForegroundColor Cyan
Write-Host "4. En la terminal de Firebase: Ctrl+C (una vez)" -ForegroundColor Cyan
Write-Host "5. ESPERA hasta ver 'Export complete'" -ForegroundColor Cyan
Write-Host "6. Ejecuta nuevamente: .\test-persistencia.ps1" -ForegroundColor Cyan
Write-Host "7. Deberias ver el usuario en [6/6]" -ForegroundColor Cyan
Write-Host ""
