# LINCOLN - Contexto del Proyecto

## Visión General

**LINCOLN** es un sistema avanzado de ciberseguridad diseñado específicamente para la prevención, detección y respuesta ante amenazas en servidores gubernamentales. El proyecto combina múltiples tecnologías para crear una solución integral de seguridad.

## Propósito y Objetivos

El sistema está diseñado para:
- **Monitoreo en tiempo real** de amenazas y actividades sospechosas
- **Detección de ransomware** mediante análisis avanzado de patrones
- **Prevención de filtraciones** de datos sensibles
- **Análisis de comportamiento anómalo** en la infraestructura
- **Respuesta automatizada** ante incidentes de seguridad
- **Cumplimiento normativo** para entornos gubernamentales

## Arquitectura del Sistema

### Stack Tecnológico

#### Backend
- **Go 1.20+**: Servicios web, APIs REST y lógica de negocio principal
  - Framework: Gin (web framework)
  - Configuración: Viper (gestión de configuración)
  - Base de datos: PostgreSQL (driver: lib/pq)
  - Caché/Colas: Redis (go-redis)
  - Autenticación: JWT (golang-jwt/jwt)
  - Logging: Logrus
  - Criptografía: golang.org/x/crypto

- **C++** (planificado): Componentes críticos de rendimiento
- **Rust** (planificado): Componentes de seguridad y criptografía

#### Frontend
- **React 18.2+**: Framework principal de UI
- **TypeScript 5.3+**: Tipado estático
- **React Router 6.20+**: Navegación y enrutamiento
- **SASS/SCSS**: Preprocesador CSS para estilos
- **Vite 7.2+**: Build tool y servidor de desarrollo

#### Base de Datos e Infraestructura
- **PostgreSQL**: Base de datos relacional principal
- **Redis**: Caché y sistema de colas
- **Firebase** (mencionado en README): Autenticación y almacenamiento (configuración presente pero no implementada)

## Estructura del Proyecto

```
LINCOLN/
├── backend/
│   └── go/
│       └── config/
│           └── config.yaml          # Configuración del backend Go
│
├── cmd/
│   └── lincoln/
│       └── main.go                 # Punto de entrada principal (modos: server/agent)
│
├── configs/
│   └── config.example.toml         # Plantilla de configuración TOML
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                 # Componente raíz con rutas
│   │   ├── components/
│   │   │   └── Logo/               # Componente de logo
│   │   ├── pages/
│   │   │   ├── Home/               # Página de inicio/landing
│   │   │   ├── Login/              # Página de inicio de sesión
│   │   │   ├── Register/           # Página de registro
│   │   │   └── ForgotPassword/     # Recuperación de contraseña
│   │   ├── styles/
│   │   │   └── global.scss         # Estilos globales
│   │   ├── types/
│   │   │   ├── auth.ts             # Tipos de autenticación
│   │   │   └── images.d.ts         # Declaraciones de tipos para imágenes
│   │   └── utils/
│   │       └── validation.ts      # Utilidades de validación
│   ├── package.json
│   └── vite.config.ts
│
├── scripts/
│   └── build/
│       └── build.ps1               # Script de construcción para Windows
│
├── go.mod                          # Dependencias de Go
├── start.ps1                       # Script de inicio del sistema
└── README.md                       # Documentación principal
```

## Estado Actual del Proyecto

### Implementado

#### Backend (Go)
- ✅ Estructura básica del servidor con modo `server` y `agent`
- ✅ Sistema de configuración con Viper (soporta TOML, YAML, variables de entorno)
- ✅ Manejo de señales para cierre graceful
- ✅ Configuración por defecto para servidor, base de datos, Redis
- ✅ Logger básico (preparado para logrus)
- ⚠️ Funciones `runServer()` y `runAgent()` están stub (requieren implementación)

#### Frontend (React/TypeScript)
- ✅ Estructura de rutas básica (Home, Login, Register, ForgotPassword)
- ✅ Componente Logo reutilizable
- ✅ Página de inicio (Home) con diseño moderno y características destacadas
- ✅ Estilos SCSS organizados por componente
- ✅ Sistema de tipos TypeScript
- ⚠️ Páginas de autenticación (Login, Register, ForgotPassword) existen pero necesitan implementación funcional
- ⚠️ No hay integración con backend aún

### Pendiente de Implementación

#### Backend
- ❌ API REST endpoints (Gin routes)
- ❌ Conexión a PostgreSQL
- ❌ Conexión a Redis
- ❌ Sistema de autenticación JWT completo
- ❌ Lógica de detección de amenazas
- ❌ Sistema de monitoreo y alertas
- ❌ Componentes C++ y Rust mencionados en README

#### Frontend
- ❌ Integración con API backend
- ❌ Formularios funcionales de autenticación
- ❌ Dashboard de administración
- ❌ Panel de monitoreo en tiempo real
- ❌ Gestión de alertas y notificaciones
- ❌ Redux para gestión de estado (mencionado en README)

#### Infraestructura
- ❌ Configuración de Docker
- ❌ GitHub Actions para CI/CD
- ❌ Configuración de Firebase (si se usa)

## Configuración

### Archivos de Configuración

1. **`configs/config.example.toml`**: Configuración principal del sistema
   - Servidor (host, puerto, entorno)
   - Base de datos PostgreSQL
   - Redis
   - Agente (intervalos de verificación)
   - Seguridad (encriptación, JWT)
   - Monitoreo y métricas
   - Alertas (email, Slack)
   - Detección de amenazas
   - Logging

2. **`backend/go/config/config.yaml`**: Configuración específica del backend Go
   - Similar a config.toml pero en formato YAML
   - Incluye configuraciones adicionales: OAuth, almacenamiento, colas de mensajes

### Variables de Entorno Requeridas

Según el README, se necesitan:
- Firebase credentials (si se usa)
- Database credentials (PostgreSQL)
- API keys y secrets de seguridad
- Configuración de email/SMTP
- Webhooks de Slack (opcional)

## Modos de Operación

El sistema puede ejecutarse en dos modos:

1. **`server`**: Servidor central que recibe reportes de agentes y proporciona API
2. **`agent`**: Agente que monitorea servidores locales y reporta al servidor central

## Scripts de Utilidad

- **`start.ps1`**: Inicia el sistema completo (API + Frontend)
  - Soporta entornos: Development, Staging, Production
  - Verifica salud de la API antes de iniciar frontend
  - Abre navegador automáticamente

- **`scripts/build/build.ps1`**: Construye ejecutables del proyecto

- **`install-dependencies.ps1`**: Instala dependencias del sistema

## Dependencias Principales

### Go (go.mod)
- `github.com/gin-gonic/gin`: Web framework
- `github.com/spf13/viper`: Gestión de configuración
- `github.com/lib/pq`: Driver PostgreSQL
- `github.com/go-redis/redis/v8`: Cliente Redis
- `github.com/golang-jwt/jwt/v4`: JWT
- `github.com/sirupsen/logrus`: Logger estructurado
- `golang.org/x/crypto`: Utilidades criptográficas

### Frontend (package.json)
- `react`, `react-dom`: Framework React
- `react-router-dom`: Enrutamiento
- `typescript`: Tipado estático
- `vite`: Build tool
- `sass`: Preprocesador CSS

## Próximos Pasos Sugeridos

1. **Implementar API REST básica** en Go con Gin
2. **Conectar base de datos PostgreSQL** y crear modelos/schemas
3. **Implementar autenticación JWT** completa
4. **Completar formularios de autenticación** en frontend
5. **Integrar frontend con backend** mediante servicios API
6. **Implementar lógica de detección de amenazas** básica
7. **Crear dashboard de administración** en frontend
8. **Configurar Docker** para desarrollo y producción
9. **Implementar sistema de logging** estructurado con Logrus
10. **Agregar tests** unitarios e integración

## Notas Importantes

- El proyecto está en **fase temprana de desarrollo**
- Muchas funcionalidades están planificadas pero no implementadas
- La estructura está preparada para escalar
- El código actual es principalmente scaffolding y estructura base
- Se requiere configuración de entorno antes de ejecutar (crear `configs/config.toml` desde ejemplo)

## Contacto y Contribución

- Ver `README.md` para información de instalación y uso
- Ver `LICENSE` para términos de licencia
- El proyecto está bajo licencia MIT

