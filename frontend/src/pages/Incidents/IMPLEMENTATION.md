# Implementación de Incidentes - LINCOLN

## ✅ Implementaciones Completadas

### 1. **Modelo de Datos Backend**
- ✅ Creado `functions/src/models/incident.model.ts`
- ✅ Tipos: `Incident`, `CreateIncident`, `IncidentStatus`, `IncidentTimelineEvent`
- ✅ Converter para Firestore

### 2. **Servicio de Firestore (Frontend)**
- ✅ Agregado `incidentsService` en `firestore.service.ts`
- ✅ Funciones implementadas:
  - `getAll()` - Obtener todos los incidentes
  - `onIncidentsChange()` - Listener en tiempo real
  - `getById()` - Obtener incidente por ID
  - `create()` - Crear nuevo incidente
  - `updateStatus()` - Actualizar estado con timeline
  - `addManualAction()` - Agregar acción manual
  - `addAutomatedResponse()` - Agregar respuesta automatizada
  - `createFromAlert()` - Crear incidente desde alerta

### 3. **Componente Incidents**
- ✅ Actualizado para usar servicio real de Firestore
- ✅ Carga en tiempo real con listeners
- ✅ Cambio de estado funcional
- ✅ Integración con URL parameters

### 4. **Integración con Alertas**
- ✅ Dashboard: Botón "Investigar" crea incidente
- ✅ Threats: Botón "Investigar" crea incidente
- ✅ Navegación automática al incidente creado

### 5. **Script de Población de Datos**
- ✅ Actualizado `scripts/populate-firestore.js`
- ✅ Crea 3 incidentes de ejemplo con timeline completo

## 🔧 Funcionalidades Disponibles

### Operaciones CRUD
- ✅ **CREATE**: Crear incidentes manualmente o desde alertas
- ✅ **READ**: Leer todos los incidentes o por ID
- ✅ **UPDATE**: Actualizar estado de incidentes
- ✅ **DELETE**: (Pendiente - estructura lista)

### Gestión de Estados
- ✅ **Active** → **Investigating**
- ✅ **Investigating** → **Contained**
- ✅ **Contained/Investigating** → **Resolved**

### Timeline Automático
- ✅ Cada cambio de estado agrega evento al timeline
- ✅ Eventos incluyen: timestamp, actor, acción, descripción
- ✅ Historial completo de todas las acciones

## 📊 Estructura de Datos en Firestore

```javascript
incidents/
  {incidentId}/
    title: string
    type: 'ransomware' | 'intrusion' | 'data_leak' | 'anomalous_behavior'
    severity: 'critical' | 'high' | 'medium' | 'low'
    status: 'active' | 'investigating' | 'contained' | 'resolved'
    affectedServers: string[]
    detectedAt: Timestamp
    resolvedAt?: Timestamp
    automatedResponses: string[]
    manualActions: string[]
    timeline: [
      {
        timestamp: Timestamp
        action: string
        actor: string
        description: string
      }
    ]
    createdBy: string
    createdAt: Timestamp
    updatedAt: Timestamp
```

## 🚀 Cómo Usar

### 1. Poblar Datos de Prueba
```bash
cd scripts
node populate-firestore.js
```

### 2. Crear Incidente desde Alerta
- En Dashboard o Threats, hacer clic en "Investigar" en una alerta
- Se crea automáticamente un incidente y navega a la página de incidentes

### 3. Cambiar Estado de Incidente
- En la página de Incidentes, usar los botones de acción
- O desde el modal de detalles
- El timeline se actualiza automáticamente

### 4. Ver Timeline Completo
- Abrir modal de detalles de cualquier incidente
- Ver timeline completo con todos los eventos

## 📝 Próximas Mejoras Sugeridas

### Alta Prioridad
1. **Asignación de Responsables**
   - Campo `assignedTo` en incidentes
   - UI para asignar usuarios

2. **Comentarios y Notas**
   - Agregar comentarios a incidentes
   - Notas internas del equipo

3. **Filtros Avanzados**
   - Por responsable asignado
   - Por rango de fechas
   - Por servidor afectado

### Media Prioridad
4. **Exportación de Reportes**
   - Exportar incidentes a PDF
   - Generar reportes de resolución

5. **Notificaciones**
   - Notificar cambios de estado
   - Alertas por email/Slack

6. **Métricas de Tiempo**
   - Tiempo promedio de resolución
   - SLA tracking

### Baja Prioridad
7. **Archivos Adjuntos**
   - Adjuntar evidencia
   - Logs y capturas de pantalla

8. **Plantillas de Incidentes**
   - Plantillas predefinidas
   - Respuestas rápidas

## 🔍 Troubleshooting

### Los incidentes no se cargan
1. Verifica que Firebase esté configurado
2. Asegúrate de que los emuladores estén corriendo
3. Verifica la consola del navegador

### Error al crear incidente desde alerta
1. Verifica que la alerta exista
2. Revisa los permisos de Firestore
3. Verifica la estructura de datos

### El timeline no se actualiza
1. Verifica que el listener esté activo
2. Revisa la consola para errores
3. Asegúrate de que los timestamps sean válidos

## 📚 Referencias

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [React Hooks Documentation](https://react.dev/reference/react)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Implementado para LINCOLN** - Sistema de Seguridad para Servidores Gubernamentales
Versión: 1.0.0

