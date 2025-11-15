/**
 * Script para ejecutar detecciones directamente sin usar Functions
 * Útil para probar cuando las functions no están corriendo
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  connectFirestoreEmulator,
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

// Simular la lógica de detección
async function runDetectionDirect() {
  try {
    console.log('🔍 Ejecutando detección directa...\n');

    // Verificar y crear datos necesarios si no existen
    const { servers: availableServers } = await ensureAllData(db);
    
    const servers = availableServers.filter((s) => s.isActive && s.status === 'online');
    console.log(`   ✅ ${servers.length} servidor(es) activo(s)\n`);

    if (servers.length === 0) {
      console.log('⚠️  No hay servidores activos para analizar');
      return;
    }

    // 2. Para cada servidor, verificar métricas y detectar amenazas
    let totalThreats = 0;
    const detectedThreats = [];

    for (const server of servers) {
      console.log(`📊 Analizando: ${server.name}...`);

      // Obtener métricas más recientes
      const metricsSnapshot = await getDocs(
        collection(db, 'servers', server.id, 'metrics')
      );

      if (metricsSnapshot.empty) {
        console.log(`   ⏭️  Sin métricas para ${server.name}\n`);
        continue;
      }

      // Analizar todas las métricas recientes (últimas 10)
      const allMetrics = metricsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const timeA = a.timestamp?.toMillis?.() || 0;
          const timeB = b.timestamp?.toMillis?.() || 0;
          return timeB - timeA;
        })
        .slice(0, 10); // Últimas 10 métricas

      // Detectar amenazas basadas en todas las métricas
      const threats = [];

      // Analizar cada métrica y detectar todas las amenazas
      const detectedTypes = new Set(); // Para evitar duplicados del mismo tipo

      for (const metric of allMetrics) {
        // Detección de Ransomware: proceso sospechoso
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
            threats.push({
              type: 'ransomware',
              severity: 'critical',
              title: 'Proceso Sospechoso de Ransomware Detectado',
              description: `Proceso sospechoso detectado: ${suspiciousProcesses[0].name}`,
            });
            detectedTypes.add('ransomware');
          }
        }

        // Detección de Intrusión: múltiples intentos de login fallidos
        if (metric.failedLoginAttempts && metric.failedLoginAttempts > 5 && !detectedTypes.has('intrusion')) {
          threats.push({
            type: 'intrusion',
            severity: 'high',
            title: 'Múltiples Intentos de Login Fallidos Detectados',
            description: `${metric.failedLoginAttempts} intentos de login fallidos detectados`,
          });
          detectedTypes.add('intrusion');
        }

        // Detección de Filtración de Datos: transferencia masiva
        if (metric.networkOut && metric.networkOut > 100 * 1024 * 1024 && !detectedTypes.has('data_leak')) {
          const mb = (metric.networkOut / (1024 * 1024)).toFixed(2);
          threats.push({
            type: 'data_leak',
            severity: 'high',
            title: 'Posible Filtración de Datos Detectada',
            description: `Transferencia masiva de datos detectada: ${mb} MB`,
          });
          detectedTypes.add('data_leak');
        }

        // Detección de Anomalía: CPU/Memoria muy altos
        if (
          !detectedTypes.has('anomalous_behavior') &&
          ((metric.cpuUsage && metric.cpuUsage > 90) ||
          (metric.memoryUsage && metric.memoryUsage > 90))
        ) {
          threats.push({
            type: 'anomalous_behavior',
            severity: 'medium',
            title: 'Uso Anómalo de Recursos Detectado',
            description: `CPU: ${metric.cpuUsage || 0}%, Memoria: ${metric.memoryUsage || 0}%`,
          });
          detectedTypes.add('anomalous_behavior');
        }
      }

      if (threats.length > 0) {
        console.log(`   ⚠️  ${threats.length} amenaza(s) detectada(s):`);
        threats.forEach((threat) => {
          console.log(`      - [${threat.severity.toUpperCase()}] ${threat.title}`);
        });
        totalThreats += threats.length;
        detectedThreats.push(...threats.map((t) => ({ ...t, serverName: server.name })));
      } else {
        console.log(`   ✅ Sin amenazas detectadas`);
      }
      console.log('');
    }

    // Resumen
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN DE DETECCIÓN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Servidores analizados: ${servers.length}`);
    console.log(`⚠️  Amenazas detectadas: ${totalThreats}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (totalThreats > 0) {
      console.log('💡 NOTA: Este script solo detecta amenazas, no crea alertas.');
      console.log('   Para crear alertas automáticamente, usa las Functions:');
      console.log('   1. Asegúrate de que las functions estén corriendo');
      console.log('   2. Ejecuta: node scripts/test-detection.js');
      console.log('   3. O espera la ejecución automática cada minuto\n');
    } else {
      console.log('💡 No se detectaron amenazas en las métricas actuales.');
      console.log('   Esto es normal si las métricas no contienen patrones sospechosos.\n');
    }
  } catch (error) {
    console.error('❌ Error ejecutando detección:', error);
    throw error;
  }
}

runDetectionDirect()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

