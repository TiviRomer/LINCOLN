# Página de Servidores - LINCOLN

## 📋 Descripción

Página completa de gestión y monitoreo de servidores para el sistema LINCOLN. Diseñada con un estilo cybersecurity dark mode y completamente integrada con Firebase/Firestore.

## ✨ Características Implementadas

### 1. **Estadísticas Generales**
- **Total de Servidores**: Muestra el total de servidores registrados
- **Servidores En Línea**: Cuenta de servidores activos
- **Con Advertencias**: Servidores con problemas detectados
- **Fuera de Línea**: Servidores desconectados

### 2. **Búsqueda y Filtros Avanzados**
- 🔍 **Búsqueda en tiempo real**: Por nombre, IP o ubicación
- 📊 **Filtro por estado**: All / Online / Warning / Offline
- 🏢 **Filtro por departamento**: Filtrado dinámico según departamentos disponibles
- 🔄 **Actualización en tiempo real**: Conexión con Firestore usando listeners

### 3. **Vistas de Visualización**
- 📱 **Vista Grid**: Tarjetas con diseño de cuadrícula (responsive)
- 📝 **Vista Lista**: Formato de lista detallada
- 🔄 **Toggle de vistas**: Cambio instantáneo entre grid/lista

### 4. **Información Detallada de Cada Servidor**
Cada tarjeta de servidor muestra:
- 💻 **Nombre del servidor** y **dirección IP**
- 📍 **Ubicación física** y **departamento**
- 🔴 **Estado visual** con indicador de color
- 📊 **Métricas en tiempo real**:
  - CPU Usage (%)
  - RAM Usage (%)
  - Disk Usage (%)
- ⏰ **Última actividad** (formato relativo: "Hace 5m", "Hace 2h")
- 🏷️ **Tags/Etiquetas** (production, critical, web-server, etc.)

### 5. **Acciones Disponibles**
Cada servidor tiene botones de acción:
- 👁️ **Ver Detalles**: Muestra información completa del servidor
- 🔍 **Escanear**: Ejecuta un escaneo de seguridad
- ✏️ **Editar**: Modifica la configuración del servidor
- 🗑️ **Eliminar**: Elimina el servidor (con confirmación)

### 6. **Modales Interactivos**
- ➕ **Modal de Agregar/Editar Servidor**: Para crear o modificar servidores
- ⚠️ **Modal de Confirmación de Eliminación**: Confirmación con advertencia visual

### 7. **Estado Vacío**
- 🎨 **Empty State**: Mensaje amigable cuando no hay servidores o cuando los filtros no coinciden
- ➕ **Botón de acción rápida**: Para agregar el primer servidor

## 🎨 Diseño Visual

### Paleta de Colores
- **Primary Cyan**: `#00d4ff` - Elementos interactivos principales
- **Primary Green**: `#00ff88` - Estado "online" y positivo
- **Warning Orange**: `#ffaa00` - Advertencias
- **Error Red**: `#ff4444` - Estados críticos y errores
- **Dark Background**: `#0a1929` - Fondo principal
- **Card Background**: `rgba(10, 25, 41, 0.95)` - Tarjetas

### Componentes de UI
- ✅ **Gradientes cyber**: Efectos de gradiente en títulos y botones
- ✅ **Hover effects**: Animaciones suaves al pasar el mouse
- ✅ **Bordes brillantes**: Bordes con glow effect
- ✅ **Iconos SVG**: Iconografía completa y consistente
- ✅ **Barras de progreso**: Para métricas de CPU/RAM/Disco
- ✅ **Badges de estado**: Indicadores visuales de color

## 🔌 Integración con Firebase

### Conexión en Tiempo Real
```typescript
// Listener automático de cambios en Firestore
firestoreService.servers.onServersChange((newServers) => {
  setServers(newServers);
});
```

### Operaciones CRUD (Preparadas)
- ✅ **READ**: Lectura en tiempo real de servidores
- 🔨 **CREATE**: Estructura preparada para agregar servidores
- 🔨 **UPDATE**: Estructura preparada para editar servidores
- 🔨 **DELETE**: Estructura preparada para eliminar servidores

## 📱 Responsive Design

- ✅ **Desktop (>1200px)**: Vista completa con grid de 3-4 columnas
- ✅ **Tablet (768px - 1200px)**: Grid de 2 columnas
- ✅ **Mobile (<768px)**: Vista de lista/columna única

## 🚀 Rutas y Navegación

### URL Principal
```
/servers
```

### Query Parameters
- `?action=add` - Abre automáticamente el modal de agregar servidor

### Navegación desde Dashboard
- El sidebar ya incluye el enlace a `/servers`
- Botón "Agregar Servidor" en QuickActions redirige a `/servers?action=add`

## 📂 Estructura de Archivos

```
frontend/src/pages/Servers/
├── Servers.tsx         # Componente principal (React)
├── Servers.scss        # Estilos (SASS)
└── README.md          # Esta documentación
```

## 🎯 Próximas Funcionalidades (TODO)

### Alta Prioridad
1. **Formulario de Agregar/Editar Servidor**
   - Campos: nombre, IP, hostname, OS, ubicación, departamento
   - Validación de campos
   - Guardado en Firestore

2. **Vista de Detalles Completa**
   - Página dedicada `/servers/:id`
   - Historial de actividad
   - Logs del servidor
   - Gráficos de métricas históricas

3. **Operaciones CRUD Completas**
   - Implementar `firestoreService.servers.create()`
   - Implementar `firestoreService.servers.update()`
   - Implementar `firestoreService.servers.delete()`

### Media Prioridad
4. **Escaneo de Seguridad**
   - Integración con backend de escaneo
   - Progreso en tiempo real
   - Resultados y recomendaciones

5. **Exportación de Datos**
   - Exportar lista de servidores a CSV/Excel
   - Generar reportes PDF

6. **Filtros Avanzados**
   - Filtro por rango de métricas (CPU > 80%)
   - Filtro por tags
   - Filtro por environment (production, staging, development)

### Baja Prioridad
7. **Bulk Actions**
   - Selección múltiple de servidores
   - Acciones en masa (escanear todos, actualizar tags)

8. **Notificaciones**
   - Alertas cuando un servidor cambia de estado
   - Notificaciones de métricas críticas

## 🔧 Uso desde Código

### Importar y usar
```typescript
import Servers from './pages/Servers/Servers';

// En App.tsx (ya implementado)
<Route 
  path="/servers" 
  element={
    <ProtectedRoute>
      <Servers />
    </ProtectedRoute>
  } 
/>
```

### Datos de Ejemplo
Los servidores se cargan automáticamente desde Firestore. Para poblar datos de prueba:
```bash
cd scripts
node populate-firestore.js
```

## 🎨 Personalización

### Cambiar colores
Edita las variables en `frontend/src/styles/global.scss`:
```scss
:root {
  --primary-cyan: #00d4ff;
  --primary-green: #00ff88;
  --success-color: #00ff88;
  --warning-color: #ffaa00;
  --error-color: #ff4444;
}
```

### Ajustar animaciones
En `Servers.scss`, modifica las transiciones:
```scss
:root {
  --transition-fast: 0.15s ease;
  --transition-base: 0.3s ease;
  --transition-slow: 0.5s ease;
}
```

## 📊 Screenshots (Conceptual)

### Vista Desktop - Grid
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Gestión de Servidores              [+ Agregar Servidor] │
├─────────────────────────────────────────────────────────────┤
│ [Total: 5]  [Online: 3]  [Warning: 1]  [Offline: 1]       │
├─────────────────────────────────────────────────────────────┤
│ [🔍 Buscar...]  [Estado▼]  [Dept▼]  [⊞⊟]                   │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│ │ Server 1 │ │ Server 2 │ │ Server 3 │                     │
│ │ Online   │ │ Online   │ │ Warning  │                     │
│ │ CPU: 45% │ │ CPU: 78% │ │ CPU: 92% │                     │
│ │ [👁][🔍] │ │ [👁][🔍] │ │ [👁][🔍] │                     │
│ └──────────┘ └──────────┘ └──────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Los servidores no se cargan
1. Verifica que Firebase esté configurado correctamente
2. Asegúrate de que los emuladores estén corriendo
3. Verifica la consola del navegador para errores

### Los filtros no funcionan
1. Revisa que los datos tengan los campos correctos
2. Verifica la estructura de datos en Firestore

### Estilos no se aplican
1. Asegúrate de que `Servers.scss` esté importado en el componente
2. Limpia el cache de Vite: `npm run dev -- --force`

## 📝 Notas de Implementación

- ✅ **TypeScript**: Tipado completo con interfaces de `dashboard.ts`
- ✅ **React Hooks**: useState, useEffect para gestión de estado
- ✅ **React Router**: Navegación y parámetros de URL
- ✅ **Firebase Listeners**: Actualización en tiempo real
- ✅ **SCSS/SASS**: Estilos organizados y modulares
- ✅ **Responsive**: Mobile-first design

## 📚 Referencias

- [React Router Documentation](https://reactrouter.com/)
- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [SASS Documentation](https://sass-lang.com/documentation)

---

**Desarrollado para LINCOLN** - Sistema de Seguridad para Servidores Gubernamentales
Versión: 1.0.0

