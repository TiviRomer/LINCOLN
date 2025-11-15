/**
 * Script de prueba completa para verificar la detección de ataques
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  Timestamp,
  connectFirestoreEmulator,
  query,
  orderBy,
  limit,
  where,
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

async function testFullDetection() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 PRUEBA COMPLETA DE DETECCIÓN DE ATAQUES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Paso 1: Obtener servidor activo
    console.log('📡 Paso 1: Obteniendo servidores activos...');
    const serversSnapshot = await getDocs(collection(db, 'servers'));
    const servers = serversSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(s => s.isActive && s.status === 'online');

    if (servers.length === 0) {
      console.error('   ❌ No hay servidores activos');
      return;
    }

    const targetServer = servers[0];
    console.log(`   ✅ Servidor seleccionado: ${targetServer.name} (${targetServer.id})`);
    console.log(`      Status: ${targetServer.status}, Active: ${targetServer.isActive}\n`);

    // Paso 2: Crear métrica de ataque de intrusión
    console.log('🔨 Paso 2: Creando métrica de ataque de intrusión...');
    const timestamp = new Date();
    const attackMetrics = {
      cpuUsage: 30,
      memoryUsage: 40,
      diskUsage: 50,
      networkIn: 5 * 1024 * 1024, // 5 MB
      networkOut: 2 * 1024 * 1024, // 2 MB
      activeConnections: 25,
      failedLoginAttempts: 25, // ← Esto debería detectar INTRUSIÓN
      processes: [],
      fileChanges: [],
      networkConnections: Array.from({ length: 25 }, (_, i) => ({
        protocol: 'tcp',
        localAddress: targetServer.ipAddress || '192.168.1.10',
        localPort: 22, // SSH - puerto sospechoso
        remoteAddress: `203.45.67.${80 + i}`,
        remotePort: 54321 + i,
        state: 'SYN_SENT', // Estado sospechoso
        processName: 'sshd',
        timestamp: Timestamp.fromDate(timestamp),
      })),
      timestamp: Timestamp.fromDate(timestamp),
    };

    const metricRef = await addDoc(
      collection(db, 'servers', targetServer.id, 'metrics'),
      attackMetrics
    );
    console.log(`   ✅ Métrica de ataque creada: ${metricRef.id}`);
    console.log(`      failedLoginAttempts: ${attackMetrics.failedLoginAttempts} (debería detectar >= 5)`);
    console.log(`      networkConnections: ${attackMetrics.networkConnections.length} (puerto 22, estado SYN_SENT)\n`);

    // Paso 3: Esperar un momento para asegurar que la métrica está guardada
    console.log('⏳ Paso 3: Esperando 2 segundos para asegurar que la métrica está guardada...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('   ✅ Listo\n');

    // Paso 4: Verificar que la métrica está en Firestore
    console.log('🔍 Paso 4: Verificando métrica en Firestore...');
    const metricsRef = collection(db, 'servers', targetServer.id, 'metrics');
    const latestMetricsSnapshot = await getDocs(
      query(metricsRef, orderBy('timestamp', 'desc'), limit(1))
    );

    if (latestMetricsSnapshot.empty) {
      console.error('   ❌ No se encontró la métrica');
      return;
    }

    const latestMetric = latestMetricsSnapshot.docs[0].data();
    console.log(`   ✅ Métrica más reciente encontrada: ${latestMetricsSnapshot.docs[0].id}`);
    console.log(`      failedLoginAttempts: ${latestMetric.failedLoginAttempts || 0}`);
    console.log(`      networkConnections: ${latestMetric.networkConnections?.length || 0}`);
    console.log(`      timestamp: ${latestMetric.timestamp?.toDate?.()?.toLocaleString() || 'N/A'}\n`);

    // Paso 5: Llamar a la función de detección HTTP
    console.log('🚀 Paso 5: Ejecutando detección manual...');
    console.log('   URL: http://localhost:5001/lincoln-587b0/us-central1/runDetectionManualHTTP');
    console.log('   💡 IMPORTANTE: Revisa los logs en la ventana donde están corriendo los emuladores');
    console.log('   💡 Deberías ver logs detallados como:');
    console.log('      🔍 Buscando servidores activos...');
    console.log('      📊 BaseDetector: Buscando métricas recientes...');
    console.log('      🚨 IntrusionDetector: Detección de login fallidos...\n');
    
    let response;
    try {
      if (typeof fetch !== 'undefined') {
        response = await fetch('http://localhost:5001/lincoln-587b0/us-central1/runDetectionManualHTTP');
      } else {
        const http = await import('http');
        response = await new Promise((resolve, reject) => {
          const req = http.get('http://localhost:5001/lincoln-587b0/us-central1/runDetectionManualHTTP', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              resolve({
                ok: res.statusCode === 200,
                status: res.statusCode,
                json: async () => JSON.parse(data),
                text: async () => data
              });
            });
          });
          req.on('error', reject);
          req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Timeout'));
          });
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`   ❌ Error HTTP: ${response.status}`);
        console.error(`      ${errorText}`);
        return;
      }

      const result = await response.json();
      console.log(`   ✅ Detección ejecutada`);
      console.log(`      Success: ${result.success}`);
      console.log(`      Threats Detected: ${result.threatsDetected}`);
      console.log(`      Total Detections: ${result.totalDetections}\n`);

      if (result.results && result.results.length > 0) {
        console.log(`   📊 Resultados de detección:`);
        result.results.forEach((r, i) => {
          console.log(`      ${i + 1}. Tipo: ${r.type}`);
          console.log(`         Threat Detected: ${r.threatDetected}`);
          console.log(`         Title: ${r.title || 'N/A'}`);
          console.log(`         Severity: ${r.severity || 'N/A'}`);
          console.log(`         Confidence: ${r.confidence || 'N/A'}\n`);
        });
      } else {
        console.log(`   ⚠️  No se retornaron resultados\n`);
      }

      // Paso 6: Verificar alertas creadas
      console.log('📋 Paso 6: Verificando alertas creadas...');
      const alertsSnapshot = await getDocs(
        query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(10))
      );

      console.log(`   📊 Total de alertas encontradas: ${alertsSnapshot.size}`);
      if (alertsSnapshot.size > 0) {
        console.log(`   🚨 Alertas recientes:`);
        alertsSnapshot.docs.slice(0, 5).forEach((doc, i) => {
          const alert = doc.data();
          const createdAt = alert.createdAt?.toDate?.()?.toLocaleString() || 'N/A';
          console.log(`      ${i + 1}. ${alert.title || 'Sin título'}`);
          console.log(`         Tipo: ${alert.type || 'N/A'}, Severidad: ${alert.severity || 'N/A'}`);
          console.log(`         Creada: ${createdAt}`);
          console.log(`         Server: ${alert.serverName || alert.serverId || 'N/A'}\n`);
        });
      } else {
        console.log(`   ⚠️  No se encontraron alertas\n`);
      }

      // Diagnóstico final
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 DIAGNÓSTICO FINAL:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      if (result.threatsDetected > 0) {
        console.log('   ✅ DETECCIÓN FUNCIONANDO CORRECTAMENTE');
        console.log(`      Se detectaron ${result.threatsDetected} amenaza(s)`);
      } else {
        console.log('   ❌ DETECCIÓN NO FUNCIONA');
        console.log('      Posibles causas:');
        console.log('      1. El detector no está leyendo la métrica correcta');
        console.log('      2. Los umbrales no se cumplen');
        console.log('      3. El detector tiene un error en su lógica');
        console.log('      4. La función no está creando alertas');
      }

      if (alertsSnapshot.size === 0 && result.threatsDetected > 0) {
        console.log('\n   ⚠️  PROBLEMA: Se detectaron amenazas pero no se crearon alertas');
        console.log('      El detector funciona pero AlertService no está creando alertas');
      }

    } catch (error) {
      console.error(`   ❌ Error ejecutando detección:`, error.message);
      if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
        console.error('      ⚠️  No se pudo conectar a las funciones');
        console.error('      Asegúrate de que los emuladores estén ejecutándose');
      }
    }

    console.log('\n✅ Prueba completada\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en prueba:', error);
    process.exit(1);
  }
}

testFullDetection();

