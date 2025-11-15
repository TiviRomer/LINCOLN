# LINCOLN - Sistema de Seguridad para Servidores Gubernamentales

Sistema avanzado de ciberseguridad para la prevención, detección y respuesta ante amenazas en servidores gubernamentales.

## Características Principales

- Monitoreo en tiempo real de amenazas
- Detección de intentos de secuestro (ransomware)
- Prevención de filtraciones de datos
- Análisis de comportamiento anómalo
- Respuesta automatizada ante incidentes
- Panel de administración centralizado
- Cumplimiento de normativas gubernamentales
- Encriptación de datos sensibles

## Stack Tecnológico

### Backend
- **C++**: Para componentes críticos de rendimiento
- **Go**: Para servicios web y APIs
- **Rust**: Para componentes de seguridad y criptografía

### Frontend
- **HTML5**
- **CSS3** (con preprocesador SASS/SCSS)
- **JavaScript** / **TypeScript**
- **React.js** (Framework principal)
- **Redux** (Gestión de estado)
- **Material-UI** (Componentes de UI)

### Base de Datos
- **Firebase** (Firestore, Authentication, Storage)

### Infraestructura
- **Docker** (Contenedorización)
- **GitHub Actions** (CI/CD)

## Estructura del Proyecto

```
LINCOLN/
├── .github/                 # Configuraciones de GitHub
│   └── workflows/          # GitHub Actions
├── backend/                # Código del servidor
│   ├── c++/               # Componentes en C++
│   │   ├── core/          # Núcleo del sistema
│   │   └── security/      # Componentes de seguridad
│   ├── go/                # Servicios en Go
│   │   ├── api/           # API REST
│   │   └── services/      # Lógica de negocio
│   └── rust/              # Módulos en Rust
│       └── crypto/        # Criptografía y seguridad
├── frontend/              # Aplicación web
│   ├── public/            # Archivos estáticos
│   └── src/               # Código fuente
│       ├── components/    # Componentes reutilizables
│       ├── pages/         # Páginas de la aplicación
│       ├── services/      # Servicios y APIs
│       ├── styles/        # Estilos globales
│       └── utils/         # Utilidades
├── configs/               # Archivos de configuración
├── docs/                  # Documentación
└── scripts/               # Scripts de utilidad
```

## Requisitos del Sistema

### Para Desarrollo
- Windows 10/11 64-bit o Linux/macOS
- Git
- Node.js 18.x o superior
- Go 1.20 o superior
- Rust 1.65 o superior
- C++ Compiler (MSVC en Windows, GCC en Linux)
- CMake 3.15 o superior
- Python 3.8+ (para algunos scripts)

### Dependencias de Terceros
- Firebase CLI (para despliegue)
- Docker (opcional, para contenedores)
- PostgreSQL (para la base de datos)
- Redis (para caché y colas)

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/LINCOLN.git
cd LINCOLN
```

### 2. Configurar Entorno de Desarrollo

#### Windows

1. Instalar Chocolatey (gestor de paquetes para Windows):
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
   ```

2. Instalar dependencias básicas:
   ```powershell
   choco install git cmake python --version=3.9.0 golang rustup.install nodejs-lts visualstudio2019buildtools -y
   ```

3. Configurar Rust:
   ```powershell
   rustup default stable
   rustup target add wasm32-unknown-unknown
   ```

#### Linux (Ubuntu/Debian)

```bash
# Instalar dependencias básicas
sudo apt update && sudo apt install -y git build-essential cmake python3 python3-pip nodejs npm

# Instalar Go
wget https://golang.org/dl/go1.20.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.20.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 3. Configurar Firebase

1. Instalar Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Iniciar sesión en Firebase:
   ```bash
   firebase login
   ```

### 4. Instalar Dependencias del Proyecto

#### Frontend
```bash
cd frontend
npm install
```

#### Backend Go
```bash
cd backend/go
go mod download
```

#### Backend Rust
```bash
cd backend/rust
cargo fetch
```

## Ejecución

### 1. Iniciar el Backend

#### Servidor API (Go)
```bash
cd backend/go/api
go run main.go
```

#### Componentes C++
```bash
cd backend/c++
mkdir -p build && cd build
cmake ..
cmake --build .
```

### 2. Iniciar el Frontend

```bash
cd frontend
npm start
```

### 3. Acceder a la Aplicación

Abre tu navegador y visita:
- Frontend: http://localhost:3000
- API: http://localhost:8080

## Construir Ejecutables

### Para Windows

```powershell
# Construir todo el proyecto
.\scripts\build\build.ps1

# Los ejecutables se encontrarán en la carpeta 'dist/'
```

### Para Linux/macOS

```bash
# Dar permisos de ejecución al script
chmod +x scripts/build/build.sh

# Construir todo el proyecto
./scripts/build/build.sh
```

## Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Firebase
FIREBASE_API_KEY=tu_api_key
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
FIREBASE_APP_ID=tu_app_id

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lincoln
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# Configuración de la API
API_PORT=8080
ENVIRONMENT=development
```

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/LINCOLN.git
cd LINCOLN

# Instalar dependencias
go mod download

# Construir el proyecto
go build -o bin/lincoln ./cmd/lincoln
```

## Configuración

1. Copiar el archivo de configuración de ejemplo:
   ```bash
   cp configs/config.example.toml configs/config.toml
   ```
2. Editar el archivo `configs/config.toml` con tus configuraciones.

## Uso

```bash
# Iniciar el servidor
./bin/lincoln server

# Iniciar el agente
./bin/lincoln agent
```

## Documentación

Consulta nuestra [documentación completa](docs/README.md) para obtener información detallada sobre la instalación, configuración y uso del sistema.

## Contribución

Las contribuciones son bienvenidas. Por favor, lee nuestra [guía de contribución](CONTRIBUTING.md) antes de enviar un pull request.

## Seguridad

Si descubres alguna vulnerabilidad de seguridad, por favor repórtala de manera responsable a través de nuestro [proceso de divulgación de seguridad](SECURITY.md).

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
