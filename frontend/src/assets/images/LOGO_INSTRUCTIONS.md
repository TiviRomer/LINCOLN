# Instrucciones para Agregar el Logo de LINCOLN

## Opción 1: Usar una imagen local (Recomendado)

1. Descarga la imagen del logo desde el enlace de Grok Imagine
2. Guarda la imagen en esta carpeta (`frontend/src/assets/images/`)
3. Nombra el archivo como `lincoln-logo.png` (o `.svg`, `.jpg`, `.webp`)
4. El componente Logo la usará automáticamente

## Opción 2: Usar una URL externa

Si prefieres usar una URL directamente, puedes pasar la prop `imageUrl` al componente:

```tsx
<Logo size="large" imageUrl="https://tu-url-del-logo.com/logo.png" />
```

## Opción 3: Deshabilitar la imagen y usar SVG

Si quieres usar solo el SVG por defecto:

```tsx
<Logo size="large" useImage={false} />
```

## Formatos soportados

- PNG (recomendado para logos con fondo transparente)
- SVG (mejor calidad, escalable)
- JPG/JPEG
- WebP
- GIF

## Notas

- Si la imagen no se carga, el componente automáticamente mostrará el SVG por defecto
- El logo mantendrá las animaciones y efectos visuales independientemente del formato usado

