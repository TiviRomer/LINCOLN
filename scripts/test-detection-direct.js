/**
 * Script para probar la detección directamente y ver qué está pasando
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
} from 'firebase/firestore';

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

async function testDetection() {
  try {
    console.log('🔍 Verificando qué métricas lee el detector...\n');

    // Obtener servidores
    const serversSnapshot = await getDocs(collection(db, 'servers'));
    const servers = serversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`📡 Servidores encontrados: ${servers.length}\n`);

    for (const server of servers) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📊 SERVIDOR: ${server.name} (${server.id})`);
      console.log(`   Status: ${server.status}, Active: ${server.isActive}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      // Verificar si el detector procesaría este servidor
      if (!server.isActive || server.status !== 'online') {
        console.log(`   ⚠️  Servidor NO procesado: !isActive o status !== 'online'\n`);
        continue;
      }

      // Obtener la métrica MÁS RECIENTE (como hace el detector)
      const metricsRef = collection(db, 'servers', server.id, 'metrics');
      const metricsSnapshot = await getDocs(
        query(metricsRef, orderBy('timestamp', 'desc'), limit(1))
      );

      if (metricsSnapshot.empty) {
        console.log(`   ⚠️  No hay métricas para este servidor\n`);
        continue;
      }

      const metricDoc = metricsSnapshot.docs[0];
      const metric = metricDoc.data();
      const timestamp = metric.timestamp?.toDate 
        ? metric.timestamp.toDate() 
        : (metric.timestamp?.toMillis 
          ? new Date(metric.timestamp.toMillis()) 
          : new Date());
      
      const timeAgo = Math.round((Date.now() - timestamp.getTime()) / 1000 / 60);
      
      console.log(`\n📈 Métrica más reciente (que leerá el detector):`);
      console.log(`   ID: ${metricDoc.id}`);
      console.log(`   ⏰ Hace ${timeAgo} minutos`);
      console.log(`   🔢 failedLoginAttempts: ${metric.failedLoginAttempts || 0}`);
      console.log(`   🔢 networkOut: ${metric.networkOut ? (metric.networkOut / 1024 / 1024).toFixed(2) + ' MB' : '0 MB'}`);
      console.log(`   🔢 cpuUsage: ${metric.cpuUsage || 0}%`);
      console.log(`   🔢 memoryUsage: ${metric.memoryUsage || 0}%`);
      console.log(`   🔗 networkConnections: ${metric.networkConnections?.length || 0}`);
      
      // Verificar qué debería detectar
      const shouldDetectIntrusion = (metric.failedLoginAttempts || 0) >= 5;
      const shouldDetectDataLeak = (metric.networkOut || 0) > 100 * 1024 * 1024; // 100 MB
      const shouldDetectAnomaly = (metric.cpuUsage || 0) > 90 || (metric.memoryUsage || 0) > 90;
      const shouldDetectRansomware = metric.processes?.some(p => 
        ['crypt', 'encrypt', 'locky', 'wannacry'].some(sus => 
          (p.name || '').toLowerCase().includes(sus)
        )
      ) || metric.fileChanges?.some(f => 
        (f.filename || '').includes('.encrypted') || 
        (f.filename || '').includes('.locked')
      );

      console.log(`\n   ✅ Detecciones esperadas:`);
      if (shouldDetectIntrusion) {
        console.log(`      🚨 INTRUSIÓN (${metric.failedLoginAttempts} intentos fallidos >= 5)`);
      }
      if (shouldDetectDataLeak) {
        console.log(`      🚨 DATA-LEAK (${(metric.networkOut / 1024 / 1024).toFixed(2)} MB > 100 MB)`);
      }
      if (shouldDetectAnomaly) {
        console.log(`      🚨 ANOMALÍA (CPU: ${metric.cpuUsage}% o Mem: ${metric.memoryUsage}% > 90%)`);
      }
      if (shouldDetectRansomware) {
        console.log(`      🚨 RANSOMWARE (procesos o archivos sospechosos)`);
      }
      if (!shouldDetectIntrusion && !shouldDetectDataLeak && !shouldDetectAnomaly && !shouldDetectRansomware) {
        console.log(`      ⚠️  Ninguna (no cumple umbrales)`);
      }

      // Verificar conexiones sospechosas
      if (metric.networkConnections?.length > 0) {
        const suspiciousPorts = [22, 23, 3389, 5900, 1433, 3306, 5432];
        const suspicious = metric.networkConnections.filter(conn => 
          suspiciousPorts.includes(conn.localPort) ||
          ['SYN_SENT', 'FIN_WAIT', 'CLOSE_WAIT'].includes(conn.state)
        );
        if (suspicious.length > 0) {
          console.log(`      🚨 INTRUSIÓN (${suspicious.length} conexiones sospechosas detectadas)`);
        }
      }

      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 DIAGNÓSTICO:');
    console.log('   El detector solo lee la MÁS RECIENTE métrica (limit 1)');
    console.log('   Si la más reciente no tiene valores sospechosos, no detectará');
    console.log('   Para probar un ataque específico, simúlalo y ejecuta detección inmediatamente\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDetection();

