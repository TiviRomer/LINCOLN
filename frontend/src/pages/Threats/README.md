# Página de Threats & Alerts - LINCOLN

## 📋 Descripción

Página completa de monitoreo y gestión de amenazas y alertas de seguridad para el sistema LINCOLN. Diseñada con un estilo cybersecurity dark mode y completamente integrada con Firebase/Firestore en tiempo real.

## ✨ Características Implementadas

### 1. **Estadísticas Generales**
- **Alertas Críticas**: Contador de alertas con severidad crítica
- **Alertas Activas**: Total de alertas en estado activo
- **Total Alertas**: Número total de alertas en el sistema
- **Amenazas Detectadas**: Total de amenazas detectadas
- **Resueltas Hoy**: Alertas resueltas en el día actual

### 2. **Sistema de Tabs**
- 🔔 **Tab de Alertas**: Vista completa de todas las alertas del sistema
- ⚡ **Tab de Amenazas**: Vista de timeline de amenazas detectadas
- 🔄 **Cambio dinámico**: Intercambio instantáneo entre vistas

### 3. **Búsqueda y Filtros Avanzados**
- 🔍 **Búsqueda en tiempo real**: Por título, descripción o servidor
- 📊 **Filtro por severidad**: Critical / High / Medium / Low
- 🎯 **Filtro por tipo**: Ransomware / Intrusión / Filtración / Comportamiento Anómalo
- 📋 **Filtro por estado** (solo alertas): Active / Acknowledged / Resolved / Escalated
- 🖥️ **Filtro por servidor**: Filtrado por servidor específico
- 🔄 **Actualización en tiempo real**: Conexión con Firestore usando listeners

### 4. **Vista de Alertas**
Cada alerta muestra:
- 🎨 **Indicador de severidad**: Barra de color en la parte superior
- 📝 **Título y descripción** completos
- 🏷️ **Tipo y severidad**: Badges visuales
- 📍 **Servidor afectado** y **timestamp**
- ⚡ **Estado actual**: Active, Acknowledged, Resolved, Escalated
- 🎯 **Acciones disponibles**:
  - 👁️ Ver detalles
  - ✅ Reconocer (solo si está activa)
  - 🔍 Investigar
  - ✓ Resolver (solo si está reconocida)
  - ⬆️ Escalar

### 5. **Vista de Amenazas (Timeline)**
- 📅 **Timeline visual**: Línea vertical con marcadores de color
- 🎨 **Marcadores por severidad**: Colores según nivel de amenaza
- 📊 **Información completa**: Tipo, descripción, servidor, timestamp
- 🔄 **Ordenamiento automático**: Por severidad y fecha

### 6. **Modal de Detalles**
- 📋 **Información completa**: Todos los detalles de la alerta/amenaza
- 🎨 **Visualización organizada**: Grid de información estructurada
- 🎯 **Acciones rápidas**: Botones para investigar o cerrar

### 7. **Indicador de Monitoreo en Tiempo Real**
- 🟢 **Live indicator**: Punto animado que indica monitoreo activo
- ⚡ **Actualización automática**: Sin necesidad de recargar

## 🎨 Diseño Visual

### Paleta de Colores
- **Critical**: `#ff4444` - Alertas críticas
- **High**: `#ff6b6b` - Alertas de alta severidad
- **Medium**: `#ffaa00` - Alertas de severidad media
- **Low**: `#ffd93d` - Alertas de baja severidad
- **Primary Cyan**: `#00d4ff` - Elementos interactivos
- **Success Green**: `#00ff88` - Estados positivos

### Componentes de UI
- ✅ **Cards con bordes de color**: Según severidad
- ✅ **Timeline visual**: Para amenazas
- ✅ **Badges y tags**: Para tipo y severidad
- ✅ **Iconos contextuales**: Diferentes iconos según tipo de amenaza
- ✅ **Animaciones suaves**: Transiciones y hover effects
- ✅ **Modal interactivo**: Para detalles completos

## 🔌 Integración con Firebase

### Conexión en Tiempo Real
```typescript
// Listeners automáticos de cambios en Firestore
firestoreService.alerts.onAlertsChange((newAlerts) => {
  setAlerts(newAlerts);
});

firestoreService.threats.onThreatsChange((newThreats) => {
  setThreats(newThreats);
});
```

### Operaciones Disponibles
- ✅ **READ**: Lectura en tiempo real de alertas y amenazas
- ✅ **UPDATE**: Actualización de estado de alertas (acknowledge, resolve, escalate)
- 🔨 **CREATE**: Estructura preparada para crear nuevas alertas
- 🔨 **DELETE**: Estructura preparada para eliminar alertas

## 📱 Responsive Design

- ✅ **Desktop (>1200px)**: Vista completa con todas las funcionalidades
- ✅ **Tablet (768px - 1200px)**: Layout adaptado, filtros en columna
- ✅ **Mobile (<768px)**: Vista optimizada, timeline simplificado

## 🚀 Rutas y Navegación

### URL Principal
```
/threats
```

### Navegación desde Dashboard
- El sidebar ya incluye el enlace a `/threats`
- Botón "Threats & Alerts" en el sidebar

## 📂 Estructura de Archivos

```
frontend/src/pages/Threats/
├── Threats.tsx         # Componente principal (React)
├── Threats.scss        # Estilos (SASS)
└── README.md          # Esta documentación
```

## 🎯 Tipos de Amenazas Soportadas

### 1. **Ransomware**
- 🔒 Detección de intentos de cifrado
- 🛡️ Icono: Escudo con candado
- ⚠️ Severidad: Generalmente Critical o High

### 2. **Intrusión**
- 🚪 Intentos de acceso no autorizado
- 🔐 Icono: Puerta con candado
- ⚠️ Severidad: High o Medium

### 3. **Filtración de Datos**
- 📤 Transferencias masivas de datos
- 📥 Icono: Flecha hacia abajo
- ⚠️ Severidad: Critical o High

### 4. **Comportamiento Anómalo**
- 📊 Actividad inusual del sistema
- 📈 Icono: Gráfico de líneas
- ⚠️ Severidad: Medium o Low

## 🎯 Estados de Alertas

1. **Active**: Alerta recién detectada, requiere atención
2. **Acknowledged**: Alerta reconocida por un usuario
3. **Resolved**: Alerta resuelta y cerrada
4. **Escalated**: Alerta escalada a nivel superior

## 🔧 Uso desde Código

### Importar y usar
```typescript
import Threats from './pages/Threats/Threats';

// En App.tsx (ya implementado)
<Route 
  path="/threats" 
  element={
    <ProtectedRoute>
      <Threats />
    </ProtectedRoute>
  } 
/>
```

### Acciones Disponibles
```typescript
// Reconocer alerta
await firestoreService.alerts.updateStatus(alertId, 'acknowledged');

// Resolver alerta
await firestoreService.alerts.updateStatus(alertId, 'resolved');

// Escalar alerta
await firestoreService.alerts.updateStatus(alertId, 'escalated');
```

## 🎨 Personalización

### Cambiar colores de severidad
Edita las funciones en `Threats.tsx`:
```typescript
const getSeverityColor = (severity: ThreatSeverity): string => {
  switch (severity) {
    case 'critical': return '#ff4444';
    case 'high': return '#ff6b6b';
    case 'medium': return '#ffaa00';
    case 'low': return '#ffd93d';
  }
};
```

### Agregar nuevos tipos de amenazas
1. Actualiza el tipo `ThreatType` en `types/dashboard.ts`
2. Agrega el caso en `getTypeLabel()` y `getTypeIcon()`
3. Actualiza los filtros en el componente

## 📊 Screenshots (Conceptual)

### Vista Desktop - Alertas
```
┌─────────────────────────────────────────────────────────────┐
│  Threats & Alerts                    [🟢 Monitoreo en Vivo] │
├─────────────────────────────────────────────────────────────┤
│  [5 Críticas] [12 Activas] [45 Total] [8 Amenazas] [3 Hoy] │
├─────────────────────────────────────────────────────────────┤
│  [Alertas (45)] [Amenazas (8)]                             │
├─────────────────────────────────────────────────────────────┤
│  [🔍 Buscar...] [Severidad▼] [Tipo▼] [Estado▼] [Server▼]  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🔴 Intento de Ransomware Detectado                  │   │
│  │ CRITICAL | Ransomware | Active                      │   │
│  │ Proceso sospechoso intentando cifrar archivos...   │   │
│  │ 🖥️ Servidor Principal | ⏰ Hace 5m                 │   │
│  │ [👁️] [✅] [🔍] [⬆️]                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Vista Desktop - Amenazas (Timeline)
```
┌─────────────────────────────────────────────────────────────┐
│  │ ──────────────────── Timeline ────────────────────     │
│  │ ●                                                     │   │
│  │   ┌─────────────────────────────────────────────┐     │   │
│  │   │ 🔒 Ransomware | CRITICAL                    │     │   │
│  │   │ Descripción de la amenaza...                │     │   │
│  │   │ 🖥️ Servidor Principal | ⏰ Hace 10m        │     │   │
│  │   └─────────────────────────────────────────────┘     │   │
│  │ ●                                                     │   │
│  │   ┌─────────────────────────────────────────────┐     │   │
│  │   │ 🚪 Intrusión | HIGH                         │     │   │
│  │   │ Múltiples intentos de acceso...            │     │   │
│  │   └─────────────────────────────────────────────┘     │   │
└─────────────────────────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Las alertas no se cargan
1. Verifica que Firebase esté configurado correctamente
2. Asegúrate de que los emuladores estén corriendo
3. Verifica la consola del navegador para errores

### Los filtros no funcionan
1. Revisa que los datos tengan los campos correctos
2. Verifica la estructura de datos en Firestore
3. Asegúrate de que los tipos coincidan

### El timeline no se muestra
1. Verifica que haya amenazas en la base de datos
2. Revisa que los filtros no estén ocultando todas las amenazas
3. En mobile, el timeline se simplifica automáticamente

## 📝 Notas de Implementación

- ✅ **TypeScript**: Tipado completo con interfaces de `dashboard.ts`
- ✅ **React Hooks**: useState, useEffect para gestión de estado
- ✅ **React Router**: Navegación integrada
- ✅ **Firebase Listeners**: Actualización en tiempo real
- ✅ **SCSS/SASS**: Estilos organizados y modulares
- ✅ **Responsive**: Mobile-first design
- ✅ **Accesibilidad**: Iconos y labels descriptivos

## 🔮 Próximas Funcionalidades (TODO)

### Alta Prioridad
1. **Exportación de Reportes**
   - Exportar alertas a PDF/CSV
   - Generar reportes de amenazas

2. **Notificaciones Push**
   - Alertas en tiempo real
   - Notificaciones del navegador

3. **Bulk Actions**
   - Selección múltiple
   - Acciones en masa (reconocer, resolver)

### Media Prioridad
4. **Gráficos y Estadísticas**
   - Gráficos de tendencias
   - Distribución por tipo/severidad

5. **Filtros Avanzados**
   - Filtro por rango de fechas
   - Filtro por usuario asignado

6. **Historial Completo**
   - Timeline de cambios de estado
   - Comentarios y notas

### Baja Prioridad
7. **Integración con Incidentes**
   - Crear incidente desde alerta
   - Vincular alertas a incidentes

8. **Automatización**
   - Reglas de auto-resolución
   - Auto-escalado basado en tiempo

## 📚 Referencias

- [React Router Documentation](https://reactrouter.com/)
- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [SASS Documentation](https://sass-lang.com/documentation)

---

**Desarrollado para LINCOLN** - Sistema de Seguridad para Servidores Gubernamentales
Versión: 1.0.0

