# Sistema de Detección de Amenazas - LINCOLN

## 📋 Descripción General

El sistema de detección de amenazas de LINCOLN es un conjunto de detectores especializados que monitorean servidores en busca de diferentes tipos de amenazas de seguridad. Cuando se detecta una amenaza, el sistema crea automáticamente una alerta en Firestore que aparece en el dashboard.

## 🏗️ Arquitectura

```
detection.service.ts (Coordinador)
    ├── RansomwareDetector (Detector de Ransomware)
    ├── IntrusionDetector (Detector de Intrusiones)
    ├── DataLeakDetector (Detector de Filtraciones)
    └── AnomalyDetector (Detector de Comportamiento Anómalo)
```

## 🔍 Detectores Implementados

### 1. RansomwareDetector

**Detecta:**
- Procesos sospechosos relacionados con ransomware (crypt, encrypt, locky, wannacry, etc.)
- Patrones de encriptación masiva de archivos
- Alta actividad de CPU combinada con cambios masivos de archivos
- Extensiones de archivos sospechosas (.encrypted, .locked, .crypto, etc.)

**Severidad:**
- **Crítica**: Procesos sospechosos detectados o >100 archivos modificados
- **Alta**: 50-100 archivos modificados o CPU alta con muchos cambios
- **Media**: 10-50 archivos modificados

### 2. IntrusionDetector

**Detecta:**
- Múltiples intentos de login fallidos (fuerza bruta)
- Conexiones sospechosas a puertos sensibles (SSH, RDP, SQL, etc.)
- Escaneo de puertos (múltiples conexiones a diferentes puertos desde la misma IP)
- Conexiones desde IPs desconocidas o no autorizadas

**Severidad:**
- **Crítica**: >10 intentos de login fallidos o escaneo de >10 puertos
- **Alta**: 5-10 intentos de login fallidos o escaneo de 5-10 puertos
- **Media**: Conexiones sospechosas detectadas

### 3. DataLeakDetector

**Detecta:**
- Transferencias masivas de datos salientes (>100 MB)
- Conexiones a servicios de almacenamiento en la nube
- Actividad de red inusual (picos anómalos)
- Patrones de transferencia fuera de lo normal

**Severidad:**
- **Crítica**: >500 MB transferidos o actividad 5x mayor que el promedio
- **Alta**: 100-500 MB transferidos o actividad 3x mayor que el promedio
- **Media**: Actividad significativamente mayor que el promedio

### 4. AnomalyDetector

**Detecta:**
- Uso anómalo de CPU (>90% y significativamente mayor que el promedio)
- Uso anómalo de memoria (>90% y significativamente mayor que el promedio)
- Procesos con comportamiento inusual (alto consumo de recursos)
- Actividad fuera de horario normal (horas no laborales)
- Cambios en patrones de uso del sistema

**Severidad:**
- **Crítica**: CPU/Memoria >95% o actividad fuera de horario con alto consumo
- **Alta**: CPU/Memoria >90% o cambios significativos en patrones
- **Media**: Actividad inusual detectada

## ⚙️ Configuración

La configuración se almacena en Firestore en la colección `config` con el documento `detection`:

```typescript
{
  enableRansomwareDetection: boolean,
  enableIntrusionDetection: boolean,
  enableDataLeakPrevention: boolean,
  enableAnomalyDetection: boolean,
  suspiciousProcesses: string[],
  detectionInterval: number // en segundos
}
```

### Configuración por Defecto

```json
{
  "enableRansomwareDetection": true,
  "enableIntrusionDetection": true,
  "enableDataLeakPrevention": true,
  "enableAnomalyDetection": true,
  "suspiciousProcesses": ["crypt", "encrypt", "locky", "wannacry"],
  "detectionInterval": 60
}
```

## 🚀 Uso

### Ejecución Automática (Programada)

El sistema ejecuta detecciones automáticamente cada minuto mediante una función programada de Firebase:

```typescript
runDetectionScheduled
```

Esta función:
1. Obtiene la configuración de detección
2. Itera sobre todos los servidores activos
3. Ejecuta todos los detectores habilitados
4. Crea alertas automáticamente para amenazas detectadas

### Ejecución Manual

Puedes ejecutar detecciones manualmente mediante una función HTTP:

```bash
POST https://your-project.cloudfunctions.net/runDetectionManual
Authorization: Bearer YOUR_TOKEN
```

**Parámetros:**
- `serverId` (opcional): Si se proporciona, solo detecta amenazas para ese servidor

**Respuesta:**
```json
{
  "success": true,
  "threatsDetected": 2,
  "totalDetections": 8,
  "results": [
    {
      "type": "ransomware",
      "threatDetected": true,
      "severity": "critical",
      "title": "Proceso Sospechoso de Ransomware Detectado",
      "confidence": 90
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📊 Métricas del Servidor

Los detectores requieren métricas del servidor que deben estar almacenadas en Firestore en:

```
servers/{serverId}/metrics/{metricId}
```

**Estructura de métricas:**
```typescript
{
  cpuUsage: number,              // Porcentaje 0-100
  memoryUsage: number,           // Porcentaje 0-100
  diskUsage: number,             // Porcentaje 0-100
  networkIn: number,             // Bytes
  networkOut: number,             // Bytes
  activeConnections: number,
  failedLoginAttempts: number,
  processes: ProcessInfo[],
  fileChanges: FileChangeInfo[],
  networkConnections: NetworkConnectionInfo[],
  timestamp: Timestamp
}
```

## 🔔 Creación Automática de Alertas

Cuando un detector encuentra una amenaza, el sistema automáticamente:

1. Crea una alerta en la colección `alerts` de Firestore
2. Registra el evento en `audit_logs`
3. La alerta aparece automáticamente en el dashboard del frontend

**Estructura de la alerta creada:**
```typescript
{
  title: string,
  description: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  type: 'intrusion' | 'malware' | 'policy_violation' | 'vulnerability' | 'other',
  serverId: string,
  serverName: string,
  source: 'automated_detection',
  evidence: string, // JSON con detalles de la detección
  status: 'open',
  createdBy: 'system',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🧪 Pruebas

Para probar el sistema de detección:

1. **Asegúrate de tener servidores con métricas:**
   ```javascript
   // Ejemplo de métrica de prueba
   await admin.firestore()
     .collection('servers')
     .doc('server-id')
     .collection('metrics')
     .add({
       cpuUsage: 95,
       memoryUsage: 80,
       networkOut: 200 * 1024 * 1024, // 200 MB
       failedLoginAttempts: 10,
       processes: [
         {
           name: 'crypt.exe',
           cpuUsage: 50,
           memoryUsage: 15,
           pid: 1234,
           command: 'crypt.exe --encrypt',
           user: 'unknown',
           startTime: new Date()
         }
       ],
       fileChanges: [],
       networkConnections: [],
       timestamp: admin.firestore.FieldValue.serverTimestamp()
     });
   ```

2. **Ejecuta la detección manualmente o espera la ejecución programada**

3. **Verifica las alertas creadas en Firestore:**
   ```javascript
   const alerts = await admin.firestore()
     .collection('alerts')
     .where('source', '==', 'automated_detection')
     .orderBy('createdAt', 'desc')
     .limit(10)
     .get();
   ```

## 🔧 Extensión del Sistema

Para agregar un nuevo detector:

1. Crea una clase que extienda `BaseDetectorImpl`:
   ```typescript
   export class MyCustomDetector extends BaseDetectorImpl {
     async detect(serverId: string, server: Server): Promise<DetectionResult[]> {
       // Tu lógica de detección aquí
     }
   }
   ```

2. Agrega el detector al `DetectionService`:
   ```typescript
   private myCustomDetector: MyCustomDetector;
   
   constructor() {
     // ...
     this.myCustomDetector = new MyCustomDetector();
   }
   ```

3. Ejecuta el detector en `detectThreats`:
   ```typescript
   if (config.enableMyCustomDetection !== false) {
     const results = await this.myCustomDetector.detect(serverId, server);
     results.push(...results);
   }
   ```

## 📝 Notas Importantes

- Los detectores son **no bloqueantes**: si un detector falla, los demás continúan ejecutándose
- Las detecciones se ejecutan de forma **asíncrona** para no bloquear el sistema
- El sistema registra todos los eventos de detección en `audit_logs` para auditoría
- Las alertas creadas automáticamente tienen `source: 'automated_detection'` para distinguirlas de las manuales
- El sistema calcula la **confianza** (0-100) de cada detección basándose en la evidencia encontrada

## 🚨 Mejores Prácticas

1. **Ajusta los umbrales** según tu entorno específico
2. **Revisa regularmente** las alertas generadas para ajustar la sensibilidad
3. **Monitorea los logs** de auditoría para detectar falsos positivos
4. **Configura notificaciones** para alertas críticas
5. **Mantén las métricas actualizadas** para que las detecciones sean precisas

## 🔐 Seguridad

- Las funciones HTTP requieren autenticación mediante Bearer token
- Las funciones programadas se ejecutan con permisos de administrador
- Todas las acciones se registran en `audit_logs` para cumplimiento
- Las alertas creadas automáticamente no pueden ser modificadas directamente por usuarios

