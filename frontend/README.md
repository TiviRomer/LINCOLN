# Frontend de LINCOLN

Interfaz de usuario del sistema LINCOLN, desarrollada con React, TypeScript y Material-UI.

## Características

- Interfaz de usuario moderna y responsiva
- Autenticación con Firebase
- Panel de administración
- Visualización en tiempo real de amenazas
- Gráficos y estadísticas

## Estructura del Proyecto

```
frontend/
├── public/            # Archivos estáticos
│   ├── index.html    # Plantilla HTML principal
│   └── assets/       # Imágenes, fuentes, etc.
└── src/               # Código fuente
    ├── components/    # Componentes reutilizables
    ├── pages/         # Páginas de la aplicación
    ├── services/      # Servicios y APIs
    ├── styles/        # Estilos globales
    ├── utils/         # Utilidades
    ├── App.tsx        # Componente raíz
    └── index.tsx      # Punto de entrada
```

## Requisitos

- Node.js 16.x o superior
- npm 8.x o superior
- Firebase CLI (opcional, para despliegue)

## Instalación

1. Instalar dependencias:
   ```bash
   cd frontend
   npm install
   ```

2. Configurar Firebase:
   - Crear un archivo `.env` en la raíz del proyecto con las credenciales de Firebase:
     ```
     REACT_APP_FIREBASE_API_KEY=tu_api_key
     REACT_APP_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
     REACT_APP_FIREBASE_PROJECT_ID=tu_proyecto
     REACT_APP_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
     REACT_APP_FIREBASE_APP_ID=tu_app_id
     ```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm start
```

El servidor estará disponible en [http://localhost:3000](http://localhost:3000).

## Construcción para producción

Para crear una versión optimizada para producción:

```bash
npm run build
```

## Despliegue

### Firebase Hosting

1. Instalar Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Iniciar sesión en Firebase:
   ```bash
   firebase login
   ```

3. Inicializar Firebase (si es la primera vez):
   ```bash
   firebase init
   ```

4. Desplegar:
   ```bash
   npm run build
   firebase deploy
   ```

## Pruebas

Para ejecutar las pruebas:

```bash
npm test
```

## Formato de código

Para formatear el código automáticamente:

```bash
npm run format
```

## Estructura de componentes

- **components/**: Componentes reutilizables
  - `layout/`: Componentes de diseño (Header, Sidebar, etc.)
  - `ui/`: Componentes de interfaz de usuario (Botones, tarjetas, etc.)
  - `charts/`: Componentes de gráficos
  - `alerts/`: Componentes de alertas y notificaciones

- **pages/**: Páginas de la aplicación
  - `Dashboard/`: Panel principal
  - `Login/`: Página de inicio de sesión
  - `Alerts/`: Lista de alertas
  - `Settings/`: Configuración
  - `Reports/`: Informes

- **services/**: Servicios y APIs
  - `api.ts`: Cliente HTTP
  - `auth.ts`: Autenticación
  - `firebase.ts`: Configuración de Firebase
  - `alerts.ts`: Servicio de alertas

- **styles/**: Estilos globales
  - `theme.ts`: Tema de Material-UI
  - `global.scss`: Estilos globales

- **utils/**: Utilidades
  - `constants.ts`: Constantes de la aplicación
  - `helpers.ts`: Funciones de ayuda
  - `types.ts`: Tipos de TypeScript
