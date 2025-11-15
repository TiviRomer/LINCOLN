# Script de instalación de dependencias para LINCOLN
# Uso: .\install-dependencies.ps1 [-All] [-Dev] [-Backend] [-Frontend] [-Docker]

param (
    [switch]$All = $false,
    [switch]$Dev = $false,
    [switch]$Backend = $false,
    [switch]$Frontend = $false,
    [switch]$Docker = $false
)

# Si no se especifican opciones, instalar todo
if (-not ($All -or $Dev -or $Backend -or $Frontend -or $Docker)) {
    $All = $true
}

# Colores para la salida
$colors = @{
    Info = 'Cyan'
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
}

# Función para mostrar mensajes
function Write-Status {
    param(
        [string]$Message,
        [string]$Status = 'Info'
    )
    
    $color = $colors[$Status]
    if (-not $color) { $color = 'White' }
    
    $timestamp = Get-Date -Format 'HH:mm:ss'
    Write-Host "[$timestamp] " -NoNewline
    Write-Host $Message -ForegroundColor $color
}

# Función para ejecutar comandos
function Invoke-SafeCommand {
    param(
        [string]$Command,
        [string]$WorkingDirectory = $PWD.Path,
        [string]$SuccessMessage = "Comando ejecutado correctamente",
        [string]$ErrorMessage = "Error al ejecutar el comando"
    )
    
    Write-Status "Ejecutando: $Command"
    
    try {
        $previousLocation = Get-Location
        Set-Location $WorkingDirectory
        
        $global:LASTEXITCODE = 0
        Invoke-Expression $Command
        
        if ($LASTEXITCODE -ne 0) {
            throw "$ErrorMessage (código $LASTEXITCODE)"
        }
        
        if ($SuccessMessage) {
            Write-Status $SuccessMessage -Status 'Success'
        }
        
        return $true
    }
    catch {
        Write-Status "ERROR: $_" -Status 'Error'
        return $false
    }
    finally {
        Set-Location $previousLocation
    }
}

# Verificar si se está ejecutando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# Instalar Chocolatey (solo Windows y si no está instalado)
if (($All -or $Dev) -and ($env:OS -like "*Windows*" -and -not (Get-Command choco -ErrorAction SilentlyContinue))) {
    Write-Status "Instalando Chocolatey..." -Status 'Info'
    
    if (-not $isAdmin) {
        Write-Status "Se requieren privilegios de administrador para instalar Chocolatey" -Status 'Warning'
        Write-Status "Por favor, ejecuta este script como administrador o instala Chocolatey manualmente" -Status 'Warning'
    }
    else {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
        
        # Actualizar la variable de entorno PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    }
}

# Instalar dependencias de desarrollo
if ($All -or $Dev) {
    Write-Status "Instalando dependencias de desarrollo..." -Status 'Info'
    
    # Instalar Git
    Invoke-SafeCommand -Command "choco install git -y" -SuccessMessage "Git instalado correctamente" -ErrorMessage "Error al instalar Git"
    
    # Instalar Node.js LTS
    Invoke-SafeCommand -Command "choco install nodejs-lts --version=18.15.0 -y" -SuccessMessage "Node.js instalado correctamente" -ErrorMessage "Error al instalar Node.js"
    
    # Instalar Go
    Invoke-SafeCommand -Command "choco install golang --version=1.20.4 -y" -SuccessMessage "Go instalado correctamente" -ErrorMessage "Error al instalar Go"
    
    # Instalar Rust
    Invoke-SafeCommand -Command "choco install rustup.install -y" -SuccessMessage "Rust instalado correctamente" -ErrorMessage "Error al instalar Rust"
    
    # Configurar Rust
    Invoke-SafeCommand -Command "rustup default stable" -SuccessMessage "Rust configurado correctamente" -ErrorMessage "Error al configurar Rust"
    
    # Instalar CMake
    Invoke-SafeCommand -Command "choco install cmake --installargs 'ADD_CMAKE_TO_PATH=System' -y" -SuccessMessage "CMake instalado correctamente" -ErrorMessage "Error al instalar CMake"
    
    # Instalar Visual Studio Build Tools (para C++ en Windows)
    Invoke-SafeCommand -Command "choco install visualstudio2019buildtools --package-parameters '--add Microsoft.VisualStudio.Workload.VCTools' -y" -SuccessMessage "Visual Studio Build Tools instalado correctamente" -ErrorMessage "Error al instalar Visual Studio Build Tools"
    
    # Instalar Python
    Invoke-SafeCommand -Command "choco install python --version=3.11.3 -y" -SuccessMessage "Python instalado correctamente" -ErrorMessage "Error al instalar Python"
    
    # Actualizar pip
    Invoke-SafeCommand -Command "python -m pip install --upgrade pip" -SuccessMessage "pip actualizado correctamente" -ErrorMessage "Error al actualizar pip"
    
    # Instalar herramientas de desarrollo globales
    Invoke-SafeCommand -Command "npm install -g firebase-tools @angular/cli @vue/cli typescript" -SuccessMessage "Herramientas de desarrollo instaladas correctamente" -ErrorMessage "Error al instalar herramientas de desarrollo"
}

# Instalar dependencias del backend
if ($All -or $Backend) {
    Write-Status "Instalando dependencias del backend..." -Status 'Info'
    
    # Instalar dependencias de Go
    if (Test-Path "backend/go") {
        Set-Location "backend/go"
        
        # Instalar dependencias de Go
        Invoke-SafeCommand -Command "go mod download" -WorkingDirectory "$PWD" -SuccessMessage "Dependencias de Go instaladas correctamente" -ErrorMessage "Error al instalar dependencias de Go"
        
        # Instalar herramientas de desarrollo de Go
        $goTools = @(
            "github.com/golangci/golangci-lint/cmd/golangci-lint@latest",
            "github.com/securego/gosec/v2/cmd/gosec@latest",
            "golang.org/x/tools/cmd/goimports@latest",
            "github.com/vektra/mockery/v2@latest",
            "github.com/swaggo/swag/cmd/swag@latest"
        )
        
        foreach ($tool in $goTools) {
            Invoke-SafeCommand -Command "go install $tool" -SuccessMessage "Herramienta $tool instalada correctamente" -ErrorMessage "Error al instalar la herramienta $tool"
        }
        
        Set-Location "../.."
    }
    
    # Instalar dependencias de Rust
    if (Test-Path "backend/rust") {
        Set-Location "backend/rust"
        
        # Actualizar Rust
        Invoke-SafeCommand -Command "rustup update" -SuccessMessage "Rust actualizado correctamente" -ErrorMessage "Error al actualizar Rust"
        
        # Instalar herramientas de Rust
        Invoke-SafeCommand -Command "rustup component add rustfmt clippy" -SuccessMessage "Herramientas de Rust instaladas correctamente" -ErrorMessage "Error al instalar herramientas de Rust"
        
        # Instalar dependencias de Rust
        Invoke-SafeCommand -Command "cargo update" -SuccessMessage "Dependencias de Rust actualizadas correctamente" -ErrorMessage "Error al actualizar dependencias de Rust"
        
        Set-Location "../.."
    }
}

# Instalar dependencias del frontend
if (($All -or $Frontend) -and (Test-Path "frontend")) {
    Write-Status "Instalando dependencias del frontend..." -Status 'Info'
    
    Set-Location "frontend"
    
    # Instalar dependencias de Node.js
    Invoke-SafeCommand -Command "npm install" -SuccessMessage "Dependencias de Node.js instaladas correctamente" -ErrorMessage "Error al instalar dependencias de Node.js"
    
    Set-Location ".."
}

# Configurar Docker (opcional)
if (($All -or $Docker) -and (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Status "Configurando Docker..." -Status 'Info'
    
    # Crear red de Docker si no existe
    Invoke-SafeCommand -Command "docker network create lincoln-network" -ErrorAction SilentlyContinue | Out-Null
    
    # Iniciar contenedores de desarrollo
    if (Test-Path "docker-compose.dev.yml") {
        Invoke-SafeCommand -Command "docker-compose -f docker-compose.dev.yml up -d" -SuccessMessage "Contenedores de desarrollo iniciados" -ErrorMessage "Error al iniciar los contenedores de desarrollo"
    }
}

Write-Status "¡Instalación completada!" -Status 'Success'
