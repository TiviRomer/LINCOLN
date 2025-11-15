# LINCOLN - Frontend Estático (HTML, CSS, JavaScript, TypeScript)

Este frontend está construido con tecnologías web básicas sin frameworks.

## Estructura del Proyecto

```
frontend/
├── login.html          # Página de inicio de sesión
├── register.html       # Página de registro
├── styles/
│   ├── global.css      # Estilos globales
│   └── auth.css        # Estilos de autenticación
├── ts/
│   ├── login.ts        # Lógica TypeScript para login
│   └── register.ts     # Lógica TypeScript para registro
├── js/                 # JavaScript compilado (generado)
│   ├── login.js
│   └── register.js
└── tsconfig.json       # Configuración de TypeScript
```

## Requisitos

- Node.js 16.x o superior
- npm 8.x o superior
- TypeScript (se instala automáticamente con npm install)

## Instalación

```bash
cd frontend
npm install
```

## Desarrollo

### Compilar TypeScript

```bash
npm run build:ts
```

### Compilar y observar cambios

```bash
npm run watch:ts
```

### Servir las páginas HTML

```bash
npm run serve
```

O usar ambos comandos juntos:

```bash
npm start
```

Esto compilará TypeScript y abrirá un servidor HTTP en `http://localhost:3000`

## Uso

1. Abre `login.html` o `register.html` en tu navegador
2. O usa el servidor de desarrollo: `npm start`
3. Navega a `http://localhost:3000/login.html` o `http://localhost:3000/register.html`

## Características

- ✅ Validación de formularios en tiempo real
- ✅ Diseño responsive
- ✅ Tema de ciberseguridad (azul y verde)
- ✅ Logo SVG animado
- ✅ Animaciones y efectos visuales
- ✅ Manejo de errores
- ✅ TypeScript para type safety

## Personalización del Logo

Para reemplazar el logo SVG con una imagen personalizada:

1. Coloca tu imagen en `frontend/assets/images/lincoln-logo.png`
2. Edita `login.html` y `register.html`
3. Reemplaza el `<svg>` con:
   ```html
   <img src="assets/images/lincoln-logo.png" alt="LINCOLN Logo" class="logo-image">
   ```

## Notas

- Los archivos TypeScript se compilan a JavaScript en la carpeta `js/`
- Los archivos HTML referencian los archivos JavaScript compilados
- Las validaciones están implementadas en TypeScript
- La conexión con la API está preparada pero comentada (ver `ts/login.ts` y `ts/register.ts`)

