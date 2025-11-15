# Script de construcción para Windows
# Uso: .\scripts\build\build.ps1 [-Configuration Debug|Release] [-Platform x64|x86]

param (
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Release',
    
    [ValidateSet('x64', 'x86')]
    [string]$Platform = 'x64',
    
    [string]$OutputPath = "$PSScriptRoot\..\..\dist"
)

# Detener en caso de error
$ErrorActionPreference = "Stop"

# Mostrar información de la compilación
Write-Host "=== LINCOLN - Sistema de Seguridad ===" -ForegroundColor Cyan
Write-Host "Plataforma: $Platform" -ForegroundColor Yellow
Write-Host "Configuración: $Configuration" -ForegroundColor Yellow
Write-Host "Directorio de salida: $OutputPath" -ForegroundColor Yellow
Write-Host ""

# Crear directorio de salida si no existe
if (-not (Test-Path -Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath | Out-Null
}

# Función para ejecutar comandos
function Invoke-CommandWithStatus {
    param (
        [string]$Command,
        [string]$WorkingDirectory = $PWD.Path
    )
    
    Write-Host "Ejecutando: $Command" -ForegroundColor DarkGray
    $startTime = Get-Date
    
    try {
        $global:LASTEXITCODE = 0
        Invoke-Expression $Command
        
        if ($LASTEXITCODE -ne 0) {
            throw "El comando falló con código de salida $LASTEXITCODE"
        }
        
        $duration = (Get-Date) - $startTime
        Write-Host "✓ Completado en $($duration.TotalSeconds.ToString('0.00'))s" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Error: $_" -ForegroundColor Red
        exit 1
    }
}

# Construir backend Go
Write-Host "=== Construyendo Backend (Go) ===" -ForegroundColor Cyan
$env:GOOS = "windows"
$env:GOARCH = if ($Platform -eq "x64") { "amd64" } else { "386" }

Invoke-CommandWithStatus -Command "go build -o `"$OutputPath\lincoln-api.exe`" -ldflags='-s -w' -trimpath .\backend\go\api\main.go"

# Construir componentes C++
Write-Host "`n=== Construyendo Componentes C++ ===" -ForegroundColor Cyan
$buildDir = "$PSScriptRoot\..\..\backend\c++\build"

# Crear directorio de construcción si no existe
if (-not (Test-Path -Path $buildDir)) {
    New-Item -ItemType Directory -Path $buildDir | Out-Null
}

# Configurar con CMake
Invoke-CommandWithStatus -Command "cmake -G 'Visual Studio 16 2019' -A $Platform -DCMAKE_BUILD_TYPE=$Configuration .." -WorkingDirectory $buildDir

# Compilar
Invoke-CommandWithStatus -Command "cmake --build . --config $Configuration" -WorkingDirectory $buildDir

# Copiar archivos de salida
$cxxOutputDir = "$buildDir\bin\$Configuration"
if (Test-Path -Path $cxxOutputDir) {
    Get-ChildItem -Path $cxxOutputDir -Filter "*.dll" | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $OutputPath -Force
    }
    Get-ChildItem -Path $cxxOutputDir -Filter "*.exe" | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $OutputPath -Force
    }
}

# Construir componentes Rust
Write-Host "`n=== Construyendo Componentes Rust ===" -ForegroundColor Cyan
$env:RUSTFLAGS = "-C target-cpu=native"
$rustTarget = if ($Platform -eq "x64") { "x86_64-pc-windows-msvc" } else { "i686-pc-windows-msvc" }

Invoke-CommandWithStatus -Command "cargo build --release --target $rustTarget" -WorkingDirectory "$PSScriptRoot\..\..\backend\rust"

# Copiar archivos de salida
$rustOutputDir = "$PSScriptRoot\..\..\backend\rust\target\$rustTarget\release"
if (Test-Path -Path $rustOutputDir) {
    Get-ChildItem -Path $rustOutputDir -Filter "*.dll" | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $OutputPath -Force
    }
    Get-ChildItem -Path $rustOutputDir -Filter "*.exe" | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $OutputPath -Force
    }
}

# Construir frontend
Write-Host "`n=== Construyendo Frontend ===" -ForegroundColor Cyan
Invoke-CommandWithStatus -Command "npm install" -WorkingDirectory "$PSScriptRoot\..\..\frontend"
Invoke-CommandWithStatus -Command "npm run build" -WorkingDirectory "$PSScriptRoot\..\..\frontend"

# Copiar frontend a la carpeta de salida
$frontendBuildDir = "$PSScriptRoot\..\..\frontend\build"
if (Test-Path -Path $frontendBuildDir) {
    $frontendOutputDir = "$OutputPath\www"
    if (Test-Path -Path $frontendOutputDir) {
        Remove-Item -Path $frontendOutputDir -Recurse -Force
    }
    Copy-Item -Path $frontendBuildDir -Destination $frontendOutputDir -Recurse -Force
}

# Crear archivo de versión
$version = git describe --tags --always
if (-not $?) { $version = "0.1.0-dev" }
$buildDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

@{
    version = $version
    buildDate = $buildDate
    platform = $Platform
    configuration = $Configuration
} | ConvertTo-Json | Set-Content -Path "$OutputPath\build-info.json" -Encoding UTF8

# Mostrar resumen
Write-Host "`n=== Resumen de la construcción ===" -ForegroundColor Green
Write-Host "Versión: $version"
Write-Host "Fecha: $buildDate"
Write-Host "Plataforma: $Platform"
Write-Host "Configuración: $Configuration"
Write-Host "Directorio de salida: $OutputPath"
Write-Host "`n¡Construcción completada con éxito!" -ForegroundColor Green
