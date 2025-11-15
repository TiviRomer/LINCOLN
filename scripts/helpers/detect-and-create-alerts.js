/**
 * Helper para ejecutar detecciones y crear alertas directamente
 * Utilizado por otros scripts para detectar amenazas y crear alertas automáticamente
 */

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

/**
 * Ejecuta detecciones y crea alertas para todos los servidores
 * @param {any} db - Instancia de Firestore
 * @param {Array} servers - Array de servidores a analizar
 * @param {Object} options - Opciones adicionales
 * @param {number} options.onlyRecentMinutes - Solo analizar métricas de los últimos N minutos (opcional)
 */
export async function detectAndCreateAlerts(db, servers, options = {}) {
  // Si servers no está definido, obtenerlos
  if (!servers || (Array.isArray(servers) && servers.length === 0)) {
    const serversSnapshot = await getDocs(collection(db, 'servers'));
    servers = serversSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(s => s.isActive && s.status === 'online');
  }
  
  if (!Array.isArray(servers) || servers.length === 0) {
    return {
      success: false,
      error: 'No hay servidores para analizar',
      threatsDetected: 0,
      alertsCreated: 0,
      serversAnalyzed: 0,
    };
  }
  const createdAlerts = [];
  let totalThreats = 0;
  const { onlyRecentMinutes } = options;
  const now = Date.now();
  const cutoffTime = onlyRecentMinutes ? now - (onlyRecentMinutes * 60 * 1000) : 0;

  for (const server of servers) {
    const metricsSnapshot = await getDocs(
      collection(db, 'servers', server.id, 'metrics')
    );

    if (metricsSnapshot.empty) {
      continue;
    }

    // Obtener las métricas, filtrando por tiempo si es necesario
    let allMetrics = metricsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((metric) => {
        if (!onlyRecentMinutes) return true;
        const timestamp = metric.timestamp?.toMillis?.() || 0;
        return timestamp >= cutoffTime;
      })
      .sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || 0;
        const timeB = b.timestamp?.toMillis?.() || 0;
        return timeB - timeA;
      });

    // Si solo queremos métricas recientes, tomar solo la más reciente para evitar falsos positivos
    if (onlyRecentMinutes) {
      allMetrics = allMetrics.slice(0, 1); // Solo la más reciente
    } else {
      allMetrics = allMetrics.slice(0, 10); // Últimas 10 como antes
    }

    if (allMetrics.length === 0) {
      continue;
    }

    // Analizar cada métrica
    const serverDetectedTypes = new Set();
    
    for (const metric of allMetrics) {
      // Detección de Ransomware
      if (metric.processes && !serverDetectedTypes.has('ransomware')) {
        const suspiciousProcesses = metric.processes.filter((proc) => {
          const name = (proc.name || '').toLowerCase();
          return (
            name.includes('crypt') ||
            name.includes('encrypt') ||
            name.includes('locky') ||
            name.includes('wannacry')
          );
        });

        if (suspiciousProcesses.length > 0) {
          const alertData = {
            title: 'Proceso Sospechoso de Ransomware Detectado',
            description: `Se detectaron ${suspiciousProcesses.length} proceso(s) sospechoso(s) ejecutándose: ${suspiciousProcesses.map(p => p.name).join(', ')}. Estos procesos pueden estar relacionados con actividad de ransomware.`,
            severity: 'critical',
            type: 'malware',
            serverId: server.id,
            serverName: server.name,
            source: 'automated_detection',
            evidence: JSON.stringify({
              processes: suspiciousProcesses.map((p) => ({
                pid: p.pid,
                name: p.name,
                command: p.command,
                user: p.user,
              })),
            }),
            status: 'open',
            assignedTo: null,
            createdBy: 'system',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          const alertRef = await addDoc(collection(db, 'alerts'), alertData);
          createdAlerts.push({ id: alertRef.id, ...alertData });
          serverDetectedTypes.add('ransomware');
          detectedTypes.add('ransomware');
          totalThreats++;
        }
      }

      // Detección de Intrusión
      if (metric.failedLoginAttempts && metric.failedLoginAttempts > 5 && !serverDetectedTypes.has('intrusion')) {
        const alertData = {
          title: 'Múltiples Intentos de Login Fallidos Detectados',
          description: `${metric.failedLoginAttempts} intentos de login fallidos detectados en el servidor. Posible intento de intrusión o ataque de fuerza bruta.`,
          severity: 'high',
          type: 'intrusion',
          serverId: server.id,
          serverName: server.name,
          source: 'automated_detection',
          evidence: JSON.stringify({
            failedLoginAttempts: metric.failedLoginAttempts,
            timestamp: metric.timestamp,
          }),
          status: 'open',
          assignedTo: null,
          createdBy: 'system',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

          const alertRef = await addDoc(collection(db, 'alerts'), alertData);
          createdAlerts.push({ id: alertRef.id, ...alertData });
          serverDetectedTypes.add('intrusion');
          totalThreats++;
      }

      // Detección de Filtración de Datos
      if (metric.networkOut && metric.networkOut > 100 * 1024 * 1024 && !serverDetectedTypes.has('data_leak')) {
        const mb = (metric.networkOut / (1024 * 1024)).toFixed(2);
        const alertData = {
          title: 'Posible Filtración de Datos Detectada',
          description: `Transferencia masiva de datos detectada: ${mb} MB salientes. Esto puede indicar una filtración de datos no autorizada.`,
          severity: 'high',
          type: 'policy_violation',
          serverId: server.id,
          serverName: server.name,
          source: 'automated_detection',
          evidence: JSON.stringify({
            networkOut: metric.networkOut,
            networkOutMB: mb,
            timestamp: metric.timestamp,
          }),
          status: 'open',
          assignedTo: null,
          createdBy: 'system',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

          const alertRef = await addDoc(collection(db, 'alerts'), alertData);
          createdAlerts.push({ id: alertRef.id, ...alertData });
          serverDetectedTypes.add('data_leak');
          totalThreats++;
      }

      // Detección de Anomalía
      if (
        !serverDetectedTypes.has('anomalous_behavior') &&
        ((metric.cpuUsage && metric.cpuUsage > 90) ||
        (metric.memoryUsage && metric.memoryUsage > 90))
      ) {
        const alertData = {
          title: 'Uso Anómalo de Recursos Detectado',
          description: `Uso anormalmente alto de recursos detectado: CPU ${metric.cpuUsage || 0}%, Memoria ${metric.memoryUsage || 0}%. Esto puede indicar actividad maliciosa o un problema del sistema.`,
          severity: 'medium',
          type: 'other',
          serverId: server.id,
          serverName: server.name,
          source: 'automated_detection',
          evidence: JSON.stringify({
            cpuUsage: metric.cpuUsage,
            memoryUsage: metric.memoryUsage,
            timestamp: metric.timestamp,
          }),
          status: 'open',
          assignedTo: null,
          createdBy: 'system',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

          const alertRef = await addDoc(collection(db, 'alerts'), alertData);
          createdAlerts.push({ id: alertRef.id, ...alertData });
          serverDetectedTypes.add('anomalous_behavior');
          totalThreats++;
      }
    }
  }

  return {
    success: true,
    threatsDetected: totalThreats,
    alertsCreated: createdAlerts.length,
    serversAnalyzed: servers.length,
    createdAlerts,
    totalThreats,
  };
}

