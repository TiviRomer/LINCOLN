# 🚀 Cómo Ejecutar LINCOLN Frontend

## Requisitos Previos

- **Node.js** 18.x o superior ([Descargar](https://nodejs.org/))
- **npm** 9.x o superior (viene con Node.js)

## Instalación Rápida

### 1. Instalar Dependencias

Abre PowerShell o Terminal en la carpeta del proyecto y ejecuta:

```powershell
cd frontend
npm install
```

Esto instalará todas las dependencias necesarias (React, Vite, TypeScript, etc.)

### 2. Ejecutar en Modo Desarrollo

```powershell
npm run dev
```

O simplemente:

```powershell
npm start
```

El servidor de desarrollo se iniciará automáticamente y abrirá tu navegador en:
**http://localhost:3000**

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` o `npm start` | Inicia el servidor de desarrollo con hot-reload |
| `npm run build` | Compila la aplicación para producción |
| `npm run preview` | Previsualiza la versión de producción |
| `npm run lint` | Ejecuta el linter para verificar el código |

## Estructura de Rutas

Una vez que la aplicación esté corriendo, puedes acceder a:

- **http://localhost:3000/** → Redirige a `/login`
- **http://localhost:3000/login** → Página de inicio de sesión
- **http://localhost:3000/register** → Página de registro

## Solución de Problemas

### Error: "Cannot find module 'react'"
```powershell
# Asegúrate de estar en la carpeta frontend
cd frontend
npm install
```

### Error: "Port 3000 is already in use"
```powershell
# Cambia el puerto en vite.config.ts o cierra la aplicación que usa el puerto 3000
```

### El navegador no se abre automáticamente
Simplemente abre manualmente: **http://localhost:3000**

## Características del Servidor de Desarrollo

- ✅ **Hot Module Replacement (HMR)** - Los cambios se reflejan instantáneamente
- ✅ **TypeScript** - Soporte completo para TypeScript
- ✅ **SCSS/SASS** - Soporte para estilos SCSS
- ✅ **Fast Refresh** - Recarga rápida de componentes React

## Producción

Para crear una versión optimizada para producción:

```powershell
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

Para previsualizar la versión de producción:

```powershell
npm run preview
```

