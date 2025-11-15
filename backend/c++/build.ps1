# Build script for LINCOLN C++ Backend (Windows)
# Usage: .\build.ps1 [Release|Debug]

param(
    [ValidateSet('Release', 'Debug')]
    [string]$Configuration = 'Release'
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LINCOLN C++ Backend Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if CMake is available
$cmakePath = Get-Command cmake -ErrorAction SilentlyContinue
if (-not $cmakePath) {
    # Try common installation paths
    $commonPaths = @(
        "C:\Program Files\CMake\bin\cmake.exe",
        "C:\Program Files (x86)\CMake\bin\cmake.exe"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $env:PATH = "$(Split-Path $path);$env:PATH"
            $cmakePath = Get-Command cmake -ErrorAction SilentlyContinue
            if ($cmakePath) {
                break
            }
        }
    }
    
    if (-not $cmakePath) {
        Write-Host "Error: CMake is not installed or not in PATH" -ForegroundColor Red
        Write-Host "Please install CMake from https://cmake.org/download/" -ForegroundColor Yellow
        Write-Host "Or add CMake to your PATH environment variable" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "CMake found: $($cmakePath.Source)" -ForegroundColor Green

# Create build directory
$buildDir = "build"
if (Test-Path $buildDir) {
    Write-Host "Cleaning existing build directory..." -ForegroundColor Yellow
    Remove-Item -Path $buildDir -Recurse -Force
}

Write-Host "Creating build directory..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $buildDir -Force | Out-Null
Set-Location $buildDir

try {
    # Configure with CMake
    Write-Host ""
    Write-Host "Configuring with CMake..." -ForegroundColor Cyan
    
    # Try to find a suitable generator
    $generator = $null
    
    # Check for Visual Studio
    if (Test-Path "C:\Program Files\Microsoft Visual Studio") {
        # Try Visual Studio 2022 first, then 2019
        $vs2022 = Get-ChildItem "C:\Program Files\Microsoft Visual Studio\2022" -ErrorAction SilentlyContinue | Where-Object { $_.Name -match "Community|Professional|Enterprise|BuildTools" } | Select-Object -First 1
        if ($vs2022) {
            $generator = "Visual Studio 17 2022"
            Write-Host "Using generator: $generator" -ForegroundColor Green
        } else {
            $vs2019 = Get-ChildItem "C:\Program Files\Microsoft Visual Studio\2019" -ErrorAction SilentlyContinue | Where-Object { $_.Name -match "Community|Professional|Enterprise|BuildTools" } | Select-Object -First 1
            if ($vs2019) {
                $generator = "Visual Studio 16 2019"
                Write-Host "Using generator: $generator" -ForegroundColor Green
            }
        }
    }
    
    # Check for MinGW
    if (-not $generator) {
        $gppPath = Get-Command g++ -ErrorAction SilentlyContinue
        if ($gppPath) {
            $generator = "MinGW Makefiles"
            $mingwBinPath = Split-Path $gppPath.Source
            $env:PATH = "$mingwBinPath;$env:PATH"
            Write-Host "Using generator: $generator" -ForegroundColor Green
            Write-Host "MinGW found at: $mingwBinPath" -ForegroundColor Gray
        } elseif (Test-Path "C:\MinGW\bin\g++.exe") {
            $generator = "MinGW Makefiles"
            $env:PATH = "C:\MinGW\bin;$env:PATH"
            Write-Host "Using generator: $generator" -ForegroundColor Green
        } elseif (Test-Path "C:\msys64\mingw64\bin\g++.exe") {
            $generator = "MinGW Makefiles"
            $env:PATH = "C:\msys64\mingw64\bin;$env:PATH"
            Write-Host "Using generator: $generator" -ForegroundColor Green
        }
    }
    
    if (-not $generator) {
        Write-Host "Error: No C++ compiler found!" -ForegroundColor Red
        Write-Host "Please install Visual Studio Build Tools or MinGW" -ForegroundColor Yellow
        exit 1
    }
    
    # Build CMake command
    $cmakeArgs = @("..")
    if ($generator) {
        $cmakeArgs += "-G", $generator
    }
    if ($Configuration -eq "Release") {
        $cmakeArgs += "-DCMAKE_BUILD_TYPE=Release"
    } else {
        $cmakeArgs += "-DCMAKE_BUILD_TYPE=Debug"
    }
    
    & cmake $cmakeArgs
    
    if ($LASTEXITCODE -ne 0) {
        throw "CMake configuration failed"
    }
    
    # Build
    Write-Host ""
    Write-Host "Building project..." -ForegroundColor Cyan
    
    # Use appropriate build command based on generator
    if ($generator -eq "MinGW Makefiles") {
        # For MinGW, try to find make or mingw32-make
        $makeCmd = $null
        $makePath = Get-Command make -ErrorAction SilentlyContinue
        if ($makePath) {
            $makeCmd = "make"
        } else {
            $mingwMakePath = Get-Command mingw32-make -ErrorAction SilentlyContinue
            if ($mingwMakePath) {
                $makeCmd = "mingw32-make"
            }
        }
        
        if ($makeCmd) {
            Write-Host "Using $makeCmd to build..." -ForegroundColor Gray
            & $makeCmd -j4
        } else {
            # Fallback to cmake --build
            Write-Host "Using cmake --build..." -ForegroundColor Gray
            cmake --build . --config $Configuration
        }
    } else {
        # For Visual Studio, use cmake --build
        cmake --build . --config $Configuration
    }
    
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Build completed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Executable location:" -ForegroundColor Cyan
    if ($generator -eq "MinGW Makefiles") {
        Write-Host "  bin\lincoln-api.exe" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To run the server:" -ForegroundColor Cyan
        Write-Host "  .\bin\lincoln-api.exe" -ForegroundColor Yellow
    } else {
        if ($Configuration -eq 'Release') {
            Write-Host "  bin\Release\lincoln-api.exe" -ForegroundColor Yellow
        } else {
            Write-Host "  bin\Debug\lincoln-api.exe" -ForegroundColor Yellow
        }
        Write-Host ""
        Write-Host "To run the server:" -ForegroundColor Cyan
        Write-Host "  .\bin\$Configuration\lincoln-api.exe" -ForegroundColor Yellow
    }
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Build failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    Set-Location ..
}

