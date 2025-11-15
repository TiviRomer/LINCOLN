/**
 * Script para probar la detección directamente usando el código de las funciones
 * Esto nos permite ver exactamente qué está pasando
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Configurar Firebase Admin para emuladores
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8082';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

console.log('🔥 Inicializando Firebase Admin...');
const app = initializeApp({
  projectId: 'demo-lincoln',
});

const db = getFirestore(app);

async function testDetectionDirectly() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 PRUEBA DIRECTA DE DETECCIÓN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Paso 1: Obtener servidores activos
    console.log('📡 Paso 1: Obteniendo servidores activos...');
    const serversSnapshot = await db.collection('servers')
      .where('isActive', '==', true)
      .get();

    console.log(`   Servidores activos encontrados: ${serversSnapshot.size}`);

    if (serversSnapshot.empty) {
      console.log('   ❌ No hay servidores activos');
      return;
    }

    const servers = [];
    serversSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'online') {
        servers.push({ id: doc.id, ...data });
        console.log(`   ✅ ${data.name} (${doc.id}) - Status: ${data.status}`);
      } else {
        console.log(`   ⚠️  ${data.name} (${doc.id}) - Status: ${data.status} (no online)`);
      }
    });

    console.log(`\n📡 Servidores online: ${servers.length}`);

    if (servers.length === 0) {
      console.log('   ❌ No hay servidores online');
      return;
    }

    // Paso 2: Para cada servidor, obtener métricas y simular detección
    for (const server of servers) {
      console.log(`\n🔍 Analizando servidor: ${server.name} (${server.id})`);
      
      // Obtener métrica más reciente
      const metricsSnapshot = await db
        .collection('servers')
        .doc(server.id)
        .collection('metrics')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (metricsSnapshot.empty) {
        console.log(`   ⚠️  No hay métricas para este servidor`);
        continue;
      }

      const metricDoc = metricsSnapshot.docs[0];
      const metric = metricDoc.data();
      const timestamp = metric.timestamp?.toDate ? metric.timestamp.toDate() : new Date(metric.timestamp);
      
      console.log(`   📊 Métrica encontrada: ${metricDoc.id}`);
      console.log(`      failedLoginAttempts: ${metric.failedLoginAttempts || 0}`);
      console.log(`      networkConnections: ${metric.networkConnections?.length || 0}`);
      console.log(`      timestamp: ${timestamp.toISOString()}`);

      // Simular detección de intrusión
      const failedLogins = metric.failedLoginAttempts || 0;
      const maxFailedLogins = 5;

      if (failedLogins >= maxFailedLogins) {
        console.log(`   🚨 INTRUSIÓN DETECTADA: ${failedLogins} intentos fallidos (>= ${maxFailedLogins})`);
        
        // Verificar conexiones sospechosas
        const connections = metric.networkConnections || [];
        const suspiciousPorts = [22, 23, 3389, 5900, 1433, 3306, 5432];
        const suspiciousStates = ['SYN_SENT', 'FIN_WAIT', 'CLOSE_WAIT'];
        
        const suspicious = connections.filter(conn => 
          suspiciousPorts.includes(conn.localPort) || 
          suspiciousStates.includes(conn.state)
        );

        if (suspicious.length > 0) {
          console.log(`   🚨 INTRUSIÓN DETECTADA: ${suspicious.length} conexiones sospechosas`);
        }

        console.log(`   ✅ DEBERÍA CREAR ALERTA PARA ESTE SERVIDOR`);
      } else {
        console.log(`   ℹ️  No se detecta intrusión (${failedLogins} < ${maxFailedLogins})`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 CONCLUSIÓN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Si viste alertas arriba pero las funciones no las detectan,');
    console.log('el problema está en la lógica de las funciones o en cómo');
    console.log('se están ejecutando las funciones en los emuladores.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDetectionDirectly();

