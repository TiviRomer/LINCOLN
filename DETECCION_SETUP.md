# 🚀 Guía de Configuración del Sistema de Detección

## ✅ Estado Actual

- ✅ Sistema de detección implementado
- ✅ Funciones compiladas correctamente
- ✅ Detectores listos (Ransomware, Intrusion, Data Leak, Anomaly)

## 📋 Pasos Siguientes

### 1. Iniciar el Entorno de Desarrollo

```powershell
# Opción 1: Script completo (recomendado)
.\start.ps1

# Opción 2: Solo Firebase Emulators
.\start-firebase.ps1

# Opción 3: Manual
firebase emulators:start --import=./emulator-data --export-on-exit
```

**En otra terminal**, inicia las funciones:

```powershell
cd functions
npm run serve
```

### 2. Configurar el Sistema de Detección

Ejecuta el script de configuración:

```powershell
node scripts/setup-detection-config.js
```

Esto creará la configuración en `config/detection` en Firestore con:
- ✅ Detección de ransomware habilitada
- ✅ Detección de intrusiones habilitada
- ✅ Prevención de filtraciones habilitada
- ✅ Detección de anomalías habilitada
- ✅ Lista de procesos sospechosos

### 3. Poblar Datos de Prueba

#### 3.1. Poblar Servidores y Datos Básicos

```powershell
node scripts/populate-firestore.js
```

Esto crea:
- Servidores de prueba
- Alertas de ejemplo
- Incidentes de ejemplo
- Usuarios de prueba

#### 3.2. Poblar Métricas de Servidores (IMPORTANTE)

```powershell
node scripts/populate-server-metrics.js
```

Este script es **crucial** porque:
- Crea métricas históricas para cada servidor (últimas 24 horas)
- Agrega métricas con amenazas para probar los detectores:
  - ⚠️ Proceso sospechoso de ransomware (`crypt.exe`)
  - ⚠️ Múltiples intentos de login fallidos (12 intentos)
  - ⚠️ Transferencia masiva de datos (150 MB)
  - ⚠️ Uso anómalo de CPU/Memoria (95%/92%)

### 4. Probar el Sistema de Detección

#### Opción A: Ejecución Automática (Programada)

Las detecciones se ejecutan automáticamente cada minuto mediante la función programada `runDetectionScheduled`.

**Para verificar que funciona:**
1. Espera 1-2 minutos después de poblar las métricas
2. Revisa la colección `alerts` en Firestore UI (http://localhost:4001)
3. Busca alertas con `source: 'automated_detection'`

#### Opción B: Ejecución Manual

```powershell
node scripts/test-detection.js
```

Este script:
- ✅ Verifica que hay servidores y métricas
- ✅ Verifica la configuración
- ✅ Intenta ejecutar la detección manualmente
- ✅ Muestra las alertas creadas
- ✅ Muestra los logs de auditoría

### 5. Verificar Resultados

#### En Firestore UI (http://localhost:4001)

1. **Alertas creadas:**
   - Ve a la colección `alerts`
   - Filtra por `source == 'automated_detection'`
   - Deberías ver alertas como:
     - "Proceso Sospechoso de Ransomware Detectado"
     - "Múltiples Intentos de Login Fallidos Detectados"
     - "Posible Filtración de Datos Detectada"
     - "Uso Anómalo de CPU Detectado"

2. **Logs de auditoría:**
   - Ve a la colección `audit_logs`
   - Filtra por `action == 'threat_detected'`
   - Verás el historial de todas las detecciones

#### En el Dashboard (http://localhost:3000)

1. Inicia sesión en la aplicación
2. Ve al Dashboard
3. Deberías ver:
   - Alertas activas en tiempo real
   - Amenazas detectadas
   - Métricas actualizadas

## 🔧 Configuración Avanzada

### Modificar la Configuración de Detección

Puedes modificar la configuración desde Firestore UI o mediante código:

```javascript
// En Firestore UI: config/detection
{
  "enableRansomwareDetection": true,
  "enableIntrusionDetection": true,
  "enableDataLeakPrevention": true,
  "enableAnomalyDetection": true,
  "suspiciousProcesses": ["crypt", "encrypt", "locky", ...],
  "detectionInterval": 60
}
```

### Ajustar Umbrales de Detección

Los umbrales están hardcodeados en los detectores. Para modificarlos, edita:

- **RansomwareDetector**: `functions/src/services/detection/detectors/ransomware.detector.ts`
- **IntrusionDetector**: `functions/src/services/detection/detectors/intrusion.detector.ts`
  - `maxFailedLogins` (línea 29)
- **DataLeakDetector**: `functions/src/services/detection/detectors/data-leak.detector.ts`
  - `dataLeakThreshold` (línea 29)
- **AnomalyDetector**: `functions/src/services/detection/detectors/anomaly.detector.ts`
  - `cpuThreshold`, `memoryThreshold`, `diskThreshold`

## 🧪 Pruebas Adicionales

### Crear Métricas Personalizadas

Puedes crear métricas manualmente desde Firestore UI:

```javascript
// En: servers/{serverId}/metrics
{
  "cpuUsage": 95,
  "memoryUsage": 90,
  "networkOut": 200000000, // 200 MB
  "failedLoginAttempts": 15,
  "processes": [
    {
      "pid": 1234,
      "name": "suspicious_process",
      "cpuUsage": 80,
      "memoryUsage": 20,
      "command": "suspicious_process --malicious",
      "user": "unknown",
      "startTime": Timestamp.now()
    }
  ],
  "fileChanges": [],
  "networkConnections": [],
  "timestamp": Timestamp.now()
}
```

### Ejecutar Detección para un Servidor Específico

Si las funciones están desplegadas, puedes llamar:

```javascript
// Desde el frontend o mediante HTTP
const runDetection = httpsCallable(functions, 'runDetectionManual');
const result = await runDetection({ serverId: 'tu-server-id' });
```

## 📊 Monitoreo

### Ver Logs de las Funciones

```powershell
# Si las funciones están corriendo localmente
# Los logs aparecen en la terminal donde ejecutaste npm run serve

# Si están desplegadas
firebase functions:log
```

### Verificar Estado de las Detecciones

1. **Firestore UI**: Revisa `audit_logs` para ver todas las detecciones
2. **Dashboard**: Las alertas aparecen automáticamente
3. **Consola del navegador**: Logs de las funciones en tiempo real

## 🚨 Solución de Problemas

### No se crean alertas

1. **Verifica que hay métricas:**
   ```powershell
   node scripts/test-detection.js
   ```

2. **Verifica la configuración:**
   - Asegúrate de que `config/detection` existe en Firestore
   - Verifica que los detectores están habilitados

3. **Verifica los logs:**
   - Revisa la consola donde corren las funciones
   - Busca errores o warnings

### Las funciones no se ejecutan

1. **Verifica que las funciones están compiladas:**
   ```powershell
   cd functions
   npm run build
   ```

2. **Verifica que las funciones están corriendo:**
   ```powershell
   npm run serve
   ```

3. **Verifica la conexión a los emuladores:**
   - Firestore: http://localhost:8082
   - Functions: http://localhost:5001
   - UI: http://localhost:4001

### Las alertas no aparecen en el Dashboard

1. **Verifica que el frontend está conectado a los emuladores**
2. **Revisa la consola del navegador** para errores
3. **Verifica que las alertas existen en Firestore** con `source: 'automated_detection'`

## 🎯 Próximos Pasos Sugeridos

1. **Ajustar sensibilidad**: Modifica los umbrales según tu entorno
2. **Agregar más detectores**: Extiende `BaseDetectorImpl` para nuevos tipos
3. **Notificaciones**: Integra email/Slack para alertas críticas
4. **Dashboard de detecciones**: Crea una vista específica para monitorear detecciones
5. **Métricas históricas**: Analiza tendencias de amenazas detectadas

## 📝 Notas Importantes

- Las detecciones se ejecutan **cada minuto** automáticamente
- Solo se detectan amenazas en servidores **activos y online**
- Las alertas se crean automáticamente cuando se detecta una amenaza
- Todos los eventos se registran en `audit_logs` para auditoría
- El sistema es **tolerante a fallos**: si un detector falla, los demás continúan

## 🔗 Recursos

- **Documentación del sistema**: `functions/src/services/detection/README.md`
- **Scripts disponibles**: `scripts/`
- **Firebase UI**: http://localhost:4001
- **Frontend**: http://localhost:3000

