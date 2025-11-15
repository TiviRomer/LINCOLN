# Backend de LINCOLN

Este directorio contiene el código fuente del backend del sistema LINCOLN, desarrollado en C++, Go y Rust.

## Estructura

```
backend/
├── c++/                 # Componentes en C++
│   ├── core/           # Núcleo del sistema
│   └── security/       # Componentes de seguridad
├── go/                 # Servicios en Go
│   ├── api/            # API REST
│   └── services/       # Lógica de negocio
└── rust/               # Módulos en Rust
    └── crypto/         # Criptografía y seguridad
```

## Requisitos

### C++
- Compilador C++17 o superior
- CMake 3.15+
- Conan (gestor de dependencias)

### Go
- Go 1.20 o superior
- Go Modules

### Rust
- Rust 1.65 o superior
- Cargo

## Configuración

### C++
1. Instalar dependencias con Conan:
   ```bash
   cd backend/c++
   mkdir build && cd build
   conan install .. --build=missing
   ```
2. Compilar con CMake:
   ```bash
   cmake .. -DCMAKE_BUILD_TYPE=Release
   cmake --build .
   ```

### Go
1. Configurar variables de entorno:
   ```bash
   export GO111MODULE=on
   export GOPATH=$HOME/go
   export PATH=$PATH:$(go env GOPATH)/bin
   ```
2. Descargar dependencias:
   ```bash
   cd backend/go
   go mod download
   ```

### Rust
1. Configurar el entorno de Rust:
   ```bash
   rustup default stable
   ```
2. Construir el proyecto:
   ```bash
   cd backend/rust
   cargo build --release
   ```

## Despliegue

Se recomienda usar Docker para el despliegue. Se proporcionan archivos Dockerfile para cada componente.

## Pruebas

Ejecutar las pruebas para cada componente:

```bash
# C++
cd backend/c++/build
ctest -V

# Go
cd backend/go
go test ./...

# Rust
cd backend/rust
cargo test
```
