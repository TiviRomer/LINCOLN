/**
 * Script para ejecutar detecciones y crear alertas directamente
 * No requiere que las Functions estén corriendo
 * 
 * Ejecutar con: node scripts/run-detection-create-alerts.js
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  Timestamp,
  connectFirestoreEmulator,
  serverTimestamp,
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

// Simular la lógica de detección y crear alertas
async function runDetectionAndCreateAlerts() {
  try {
    console.log('🔍 Ejecutando detección y creando alertas...\n');

    // Verificar y crear datos necesarios si no existen
    const { servers: availableServers } = await ensureAllData(db);
    
    const servers = availableServers.filter((s) => s.isActive && s.status === 'online');

    console.log(`📡 Analizando ${servers.length} servidor(es) activo(s)\n`);

    if (servers.length === 0) {
      console.log('⚠️  No hay servidores activos para analizar');
      return;
    }

    let totalThreats = 0;
    const createdAlerts = [];

    // 2. Para cada servidor, analizar métricas y crear alertas
    for (const server of servers) {
      console.log(`📊 Analizando: ${server.name}...`);

      const metricsSnapshot = await getDocs(
        collection(db, 'servers', server.id, 'metrics')
      );

      if (metricsSnapshot.empty) {
        console.log(`   ⏭️  Sin métricas\n`);
        continue;
      }

      // Obtener las métricas más recientes (últimas 10)
      const allMetrics = metricsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const timeA = a.timestamp?.toMillis?.() || 0;
          const timeB = b.timestamp?.toMillis?.() || 0;
          return timeB - timeA;
        })
        .slice(0, 10);

      const detectedTypes = new Set();

      // Analizar cada métrica
      for (const metric of allMetrics) {
        // Detección de Ransomware
        if (metric.processes && !detectedTypes.has('ransomware')) {
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
            detectedTypes.add('ransomware');
            totalThreats++;
            console.log(`   ⚠️  [CRITICAL] Ransomware detectado - Alerta creada: ${alertRef.id}`);
          }
        }

        // Detección de Intrusión
        if (metric.failedLoginAttempts && metric.failedLoginAttempts > 5 && !detectedTypes.has('intrusion')) {
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
          detectedTypes.add('intrusion');
          totalThreats++;
          console.log(`   ⚠️  [HIGH] Intrusión detectada - Alerta creada: ${alertRef.id}`);
        }

        // Detección de Filtración de Datos
        if (metric.networkOut && metric.networkOut > 100 * 1024 * 1024 && !detectedTypes.has('data_leak')) {
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
          detectedTypes.add('data_leak');
          totalThreats++;
          console.log(`   ⚠️  [HIGH] Filtración de datos detectada - Alerta creada: ${alertRef.id}`);
        }

        // Detección de Anomalía
        if (
          !detectedTypes.has('anomalous_behavior') &&
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
          detectedTypes.add('anomalous_behavior');
          totalThreats++;
          console.log(`   ⚠️  [MEDIUM] Anomalía detectada - Alerta creada: ${alertRef.id}`);
        }
      }

      console.log('');
    }

    // Resumen
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN DE DETECCIÓN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Servidores analizados: ${servers.length}`);
    console.log(`⚠️  Amenazas detectadas: ${totalThreats}`);
    console.log(`📝 Alertas creadas: ${createdAlerts.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (createdAlerts.length > 0) {
      console.log('📋 Alertas creadas:');
      createdAlerts.forEach((alert, index) => {
        console.log(`   ${index + 1}. [${alert.severity.toUpperCase()}] ${alert.title}`);
        console.log(`      Servidor: ${alert.serverName}`);
        console.log(`      ID: ${alert.id}\n`);
      });
    }

    console.log('💡 Próximos pasos:');
    console.log('   1. Verifica las alertas en: http://localhost:4001/firestore');
    console.log('   2. Revisa el Dashboard: http://localhost:3000/dashboard');
    console.log('   3. Las alertas deberían aparecer automáticamente en tiempo real\n');
  } catch (error) {
    console.error('❌ Error ejecutando detección:', error);
    throw error;
  }
}

runDetectionAndCreateAlerts()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

