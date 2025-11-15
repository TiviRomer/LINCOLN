/**
 * Script para ejecutar detecciones DIRECTAMENTE sin pasar por funciones HTTP
 * Esto evita problemas con las funciones y ejecuta la lógica directamente
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  connectFirestoreEmulator,
  Timestamp,
} from 'firebase/firestore';
import { ensureAllData } from './helpers/ensure-data.js';

const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-lincoln',
  storageBucket: 'demo-lincoln.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456',
};

console.log('🔥 Inicializando Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔌 Conectando a emuladores...');
connectFirestoreEmulator(db, 'localhost', 8082);
console.log('✅ Conectado a emuladores\n');

// Lógica de detección simplificada (sin pasar por funciones)
async function detectThreatsDirectly() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 DETECCIÓN DIRECTA DE AMENAZAS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Asegurar que hay datos
    await ensureAllData(db);

    // Paso 1: Obtener servidores activos y online
    console.log('📡 Obteniendo servidores activos...');
    const serversSnapshot = await getDocs(
      query(collection(db, 'servers'), where('isActive', '==', true))
    );

    const servers = [];
    serversSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'online') {
        servers.push({ id: doc.id, ...data });
      }
    });

    console.log(`   ✅ Servidores online encontrados: ${servers.length}\n`);

    if (servers.length === 0) {
      console.log('⚠️  No hay servidores activos y online');
      return [];
    }

    const allResults = [];

    // Paso 2: Para cada servidor, obtener métricas y detectar amenazas
    for (const server of servers) {
      console.log(`🔍 Analizando servidor: ${server.name} (${server.id})`);

      // Obtener métrica más reciente
      const metricsRef = collection(db, 'servers', server.id, 'metrics');
      const latestMetricsSnapshot = await getDocs(
        query(metricsRef, orderBy('timestamp', 'desc'), limit(1))
      );

      if (latestMetricsSnapshot.empty) {
        console.log(`   ⚠️  No hay métricas para este servidor\n`);
        continue;
      }

      const metricDoc = latestMetricsSnapshot.docs[0];
      const metric = metricDoc.data();
      const timestamp = metric.timestamp?.toDate?.() || new Date(metric.timestamp);
      const ageMinutes = (Date.now() - timestamp.getTime()) / 1000 / 60;

      console.log(`   📊 Métrica: ${metricDoc.id} (hace ${ageMinutes.toFixed(1)} minutos)`);
      console.log(`      failedLoginAttempts: ${metric.failedLoginAttempts || 0}`);
      console.log(`      networkConnections: ${metric.networkConnections?.length || 0}`);
      console.log(`      networkOut: ${metric.networkOut ? (metric.networkOut / 1024 / 1024).toFixed(2) + ' MB' : '0 MB'}`);
      console.log(`      cpuUsage: ${metric.cpuUsage || 0}%`);
      console.log(`      memoryUsage: ${metric.memoryUsage || 0}%`);

      // Detectar intrusion
      const failedLogins = metric.failedLoginAttempts || 0;
      if (failedLogins >= 5) {
        console.log(`   🚨 INTRUSIÓN DETECTADA: ${failedLogins} intentos fallidos (>= 5)`);
        
        const result = {
          type: 'intrusion',
          threatDetected: true,
          severity: failedLogins > 10 ? 'critical' : 'high',
          title: 'Múltiples Intentos de Login Fallidos Detectados',
          description: `Se detectaron ${failedLogins} intentos de inicio de sesión fallidos. Esto puede indicar un intento de fuerza bruta o acceso no autorizado.`,
          serverId: server.id,
          serverName: server.name,
          confidence: Math.min(60 + failedLogins * 5, 95),
          timestamp: new Date(),
        };
        allResults.push(result);
        
        // Crear alerta directamente
        await createAlertDirectly(db, result, server);
      }

      // Detectar conexiones sospechosas
      const connections = metric.networkConnections || [];
      const suspiciousPorts = [22, 23, 3389, 5900, 1433, 3306, 5432];
      const suspiciousStates = ['SYN_SENT', 'FIN_WAIT', 'CLOSE_WAIT'];
      
      const suspicious = connections.filter(conn => 
        suspiciousPorts.includes(conn.localPort) || 
        suspiciousStates.includes(conn.state)
      );

      if (suspicious.length > 0) {
        console.log(`   🚨 INTRUSIÓN DETECTADA: ${suspicious.length} conexiones sospechosas`);
        
        const result = {
          type: 'intrusion',
          threatDetected: true,
          severity: suspicious.length > 10 ? 'critical' : 'high',
          title: 'Conexiones Sospechosas Detectadas',
          description: `Se detectaron ${suspicious.length} conexión(es) sospechosa(s) al servidor. Estas conexiones pueden indicar intentos de intrusión o acceso no autorizado.`,
          serverId: server.id,
          serverName: server.name,
          confidence: Math.min(65 + suspicious.length * 3, 90),
          timestamp: new Date(),
        };
        allResults.push(result);
        
        // Crear alerta directamente
        await createAlertDirectly(db, result, server);
      }

      // Detectar data leak
      const networkOutMB = (metric.networkOut || 0) / 1024 / 1024;
      if (networkOutMB > 100) {
        console.log(`   🚨 DATA-LEAK DETECTADA: ${networkOutMB.toFixed(2)} MB salientes (> 100 MB)`);
        
        const result = {
          type: 'data_leak',
          threatDetected: true,
          severity: networkOutMB > 500 ? 'critical' : 'high',
          title: 'Posible Filtración de Datos Detectada',
          description: `Se detectó una transferencia masiva de datos salientes (${networkOutMB.toFixed(2)} MB). Esto puede indicar una filtración de datos.`,
          serverId: server.id,
          serverName: server.name,
          confidence: Math.min(70 + (networkOutMB / 10), 95),
          timestamp: new Date(),
        };
        allResults.push(result);
        
        // Crear alerta directamente
        await createAlertDirectly(db, result, server);
      }

      // Detectar anomalía (CPU o memoria alta)
      const cpuUsage = metric.cpuUsage || 0;
      const memoryUsage = metric.memoryUsage || 0;
      
      if (cpuUsage > 90 || memoryUsage > 90) {
        console.log(`   🚨 ANOMALÍA DETECTADA: CPU ${cpuUsage}% o Mem ${memoryUsage}% (> 90%)`);
        
        const result = {
          type: 'anomalous_behavior',
          threatDetected: true,
          severity: (cpuUsage > 95 || memoryUsage > 95) ? 'critical' : 'high',
          title: 'Uso Anómalo de Recursos Detectado',
          description: `El uso de recursos está en niveles anómalos (CPU: ${cpuUsage}%, Memoria: ${memoryUsage}%). Esto puede indicar actividad maliciosa o un proceso no autorizado.`,
          serverId: server.id,
          serverName: server.name,
          confidence: Math.min(70 + ((cpuUsage - 90) * 2), 90),
          timestamp: new Date(),
        };
        allResults.push(result);
        
        // Crear alerta directamente
        await createAlertDirectly(db, result, server);
      }

      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ Total de amenazas detectadas: ${allResults.length}`);
    
    if (allResults.length > 0) {
      console.log(`\n🚨 AMENAZAS DETECTADAS:\n`);
      allResults.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.type.toUpperCase()} - ${r.title}`);
        console.log(`      Severidad: ${r.severity}, Servidor: ${r.serverName}\n`);
      });
    } else {
      console.log(`\n⚠️  No se detectaron amenazas`);
    }

    return allResults;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Función para verificar si ya existe una alerta similar reciente
async function alertExistsRecently(db, result, server, minutes = 10) {
  try {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - minutes);
    
    const alertsRef = collection(db, 'alerts');
    const recentAlertsSnapshot = await getDocs(
      query(
        alertsRef,
        where('serverId', '==', result.serverId),
        where('type', '==', mapDetectionTypeToAlertType(result.type)),
        where('status', '==', 'open'),
        where('createdAt', '>=', Timestamp.fromDate(cutoffTime)),
        orderBy('createdAt', 'desc'),
        limit(5)
      )
    );

    // Verificar si hay una alerta con el mismo título reciente
    let exists = false;
    recentAlertsSnapshot.forEach(doc => {
      const alert = doc.data();
      // Si el título es muy similar, considerarlo duplicado
      if (alert.title === result.title || alert.title.includes(result.type)) {
        exists = true;
      }
    });

    return exists;
  } catch (error) {
    // Si falla la query (por ejemplo, falta índice), no bloquear la creación
    // pero intentar una verificación más simple
    try {
      const allAlertsSnapshot = await getDocs(
        query(
          collection(db, 'alerts'),
          where('serverId', '==', result.serverId),
          where('type', '==', mapDetectionTypeToAlertType(result.type)),
          where('status', '==', 'open'),
          orderBy('createdAt', 'desc'),
          limit(5)
        )
      );

      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - minutes);

      let exists = false;
      allAlertsSnapshot.forEach(doc => {
        const alert = doc.data();
        const alertTime = alert.createdAt?.toDate?.() || alert.createdAt;
        
        if (alertTime && new Date(alertTime) >= cutoffTime) {
          if (alert.title === result.title || alert.title.includes(result.type)) {
            exists = true;
          }
        }
      });

      return exists;
    } catch (fallbackError) {
      // Si todo falla, permitir la creación pero con un mensaje
      console.log(`      ⚠️  No se pudo verificar alertas duplicadas: ${fallbackError.message}`);
      return false;
    }
  }
}

// Función para crear alertas directamente
async function createAlertDirectly(db, result, server) {
  try {
    // Verificar si ya existe una alerta similar reciente (últimos 10 minutos)
    const exists = await alertExistsRecently(db, result, server, 10);
    
    if (exists) {
      console.log(`      ⏭️  Alerta similar ya existe (últimos 10 min), omitiendo: ${result.title}`);
      return;
    }

    const alertData = {
      title: result.title,
      description: result.description,
      severity: result.severity,
      type: mapDetectionTypeToAlertType(result.type),
      serverId: result.serverId,
      serverName: result.serverName || server.name,
      status: 'open',
      assignedTo: null,
      createdBy: 'system',
      source: 'automated_detection',
      evidence: JSON.stringify({
        type: result.type,
        confidence: result.confidence,
        timestamp: result.timestamp.toISOString(),
      }),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await addDoc(collection(db, 'alerts'), alertData);
    console.log(`      ✅ Alerta creada: ${result.title}`);
  } catch (error) {
    console.error(`      ❌ Error creando alerta: ${error.message}`);
  }
}

function mapDetectionTypeToAlertType(detectionType) {
  switch (detectionType) {
    case 'ransomware':
      return 'malware';
    case 'intrusion':
      return 'intrusion';
    case 'data_leak':
      return 'policy_violation';
    case 'anomalous_behavior':
      return 'other';
    default:
      return 'other';
  }
}

// Ejecutar detección cuando se ejecuta directamente
detectThreatsDirectly()
  .then((results) => {
    console.log(`\n✅ Detección completada. ${results.length} amenaza(s) detectada(s)\n`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });

