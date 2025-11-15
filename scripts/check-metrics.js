/**
 * Script para verificar las métricas más recientes y por qué no se detectan
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  connectFirestoreEmulator,
  orderBy,
  query,
  limit,
  Timestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-lincoln', // Usar el mismo que en view-data.js
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

async function checkMetrics() {
  try {
    console.log('🔍 Verificando métricas de servidores...\n');

    // Obtener servidores
    const serversSnapshot = await getDocs(collection(db, 'servers'));
    const servers = serversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`📡 Servidores encontrados: ${servers.length}\n`);

    for (const server of servers) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📊 SERVIDOR: ${server.name} (${server.id})`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      // Obtener todas las métricas ordenadas por timestamp
      const metricsRef = collection(db, 'servers', server.id, 'metrics');
      const metricsSnapshot = await getDocs(
        query(metricsRef, orderBy('timestamp', 'desc'), limit(5))
      );

      console.log(`\n📈 Métricas encontradas: ${metricsSnapshot.size}\n`);

      if (metricsSnapshot.empty) {
        console.log('   ⚠️  No hay métricas para este servidor\n');
        continue;
      }

      // Mostrar las métricas más recientes
      metricsSnapshot.docs.forEach((doc, index) => {
        const metric = doc.data();
        const timestamp = metric.timestamp?.toDate 
          ? metric.timestamp.toDate() 
          : (metric.timestamp?.toMillis 
            ? new Date(metric.timestamp.toMillis()) 
            : new Date());
        
        const timeAgo = Math.round((Date.now() - timestamp.getTime()) / 1000 / 60);
        
        console.log(`   ${index + 1}. Métrica ${doc.id}`);
        console.log(`      ⏰ Hace ${timeAgo} minutos`);
        console.log(`      🔢 failedLoginAttempts: ${metric.failedLoginAttempts || 0}`);
        console.log(`      🔢 networkOut: ${metric.networkOut ? (metric.networkOut / 1024 / 1024).toFixed(2) + ' MB' : '0 MB'}`);
        console.log(`      🔢 cpuUsage: ${metric.cpuUsage || 0}%`);
        console.log(`      🔢 memoryUsage: ${metric.memoryUsage || 0}%`);
        console.log(`      🔗 networkConnections: ${metric.networkConnections?.length || 0}`);
        console.log(`      🔧 processes: ${metric.processes?.length || 0}`);
        
        // Verificar si debería detectar algo
        const shouldDetectIntrusion = (metric.failedLoginAttempts || 0) >= 5;
        const shouldDetectDataLeak = (metric.networkOut || 0) > 100 * 1024 * 1024; // 100 MB
        const shouldDetectAnomaly = (metric.cpuUsage || 0) > 90 || (metric.memoryUsage || 0) > 90;
        const shouldDetectRansomware = metric.processes?.some(p => 
          ['crypt', 'encrypt', 'locky', 'wannacry'].some(sus => 
            (p.name || '').toLowerCase().includes(sus)
          )
        );

        console.log(`      ✅ Detecciones esperadas:`);
        if (shouldDetectIntrusion) {
          console.log(`         🚨 INTRUSIÓN (${metric.failedLoginAttempts} intentos fallidos >= 5)`);
        }
        if (shouldDetectDataLeak) {
          console.log(`         🚨 DATA-LEAK (${(metric.networkOut / 1024 / 1024).toFixed(2)} MB > 100 MB)`);
        }
        if (shouldDetectAnomaly) {
          console.log(`         🚨 ANOMALÍA (CPU: ${metric.cpuUsage}% o Mem: ${metric.memoryUsage}% > 90%)`);
        }
        if (shouldDetectRansomware) {
          console.log(`         🚨 RANSOMWARE (procesos sospechosos detectados)`);
        }
        if (!shouldDetectIntrusion && !shouldDetectDataLeak && !shouldDetectAnomaly && !shouldDetectRansomware) {
          console.log(`         ⚠️  Ninguna (no cumple umbrales)`);
        }
        console.log('');
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 DIAGNÓSTICO:');
    console.log('   - Si ves métricas pero no se detectan amenazas,');
    console.log('     puede ser que los umbrales no se cumplan');
    console.log('   - Si las métricas tienen valores correctos pero');
    console.log('     no se detectan, puede ser un problema con los detectores\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkMetrics();
