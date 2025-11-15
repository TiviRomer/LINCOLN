/**
 * Script para verificar el estado completo del sistema de detecciones
 * Ejecutar con: node scripts/check-detection-status.js
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  connectFirestoreEmulator,
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

async function checkDetectionStatus() {
  try {
    console.log('🔍 VERIFICANDO ESTADO DEL SISTEMA DE DETECCIONES\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. Verificar servidores
    console.log('1️⃣ SERVIDORES');
    const serversSnapshot = await getDocs(collection(db, 'servers'));
    const servers = serversSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    const onlineServers = servers.filter(s => s.isActive && s.status === 'online');
    console.log(`   Total: ${servers.length}`);
    console.log(`   Online: ${onlineServers.length}`);
    
    if (onlineServers.length === 0) {
      console.log('   ❌ No hay servidores online. Ejecuta: node scripts/simulate-attack.js');
      return;
    }
    console.log('   ✅ Hay servidores online\n');

    // 2. Verificar métricas
    console.log('2️⃣ MÉTRICAS DE SERVIDORES');
    let totalMetrics = 0;
    let recentMetrics = 0;
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);

    for (const server of onlineServers) {
      const metricsSnapshot = await getDocs(
        collection(db, 'servers', server.id, 'metrics')
      );
      const metrics = metricsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      totalMetrics += metrics.length;
      
      // Contar métricas recientes (últimos 5 minutos)
      const recent = metrics.filter(m => {
        const timestamp = m.timestamp?.toMillis?.() || 0;
        return timestamp >= fiveMinutesAgo;
      });
      recentMetrics += recent.length;
      
      if (metrics.length > 0) {
        const lastMetric = metrics[metrics.length - 1];
        const lastTime = lastMetric.timestamp?.toMillis?.() || 0;
        const minutesAgo = Math.floor((now - lastTime) / (60 * 1000));
        console.log(`   ${server.name}: ${metrics.length} métricas (última hace ${minutesAgo} min)`);
      }
    }
    
    console.log(`   Total de métricas: ${totalMetrics}`);
    console.log(`   Métricas recientes (<5 min): ${recentMetrics}`);
    
    if (totalMetrics === 0) {
      console.log('   ❌ No hay métricas. Ejecuta: node scripts/simulate-attack.js');
      return;
    }
    console.log('   ✅ Hay métricas disponibles\n');

    // 3. Verificar configuración de detección
    console.log('3️⃣ CONFIGURACIÓN DE DETECCIÓN');
    const configDoc = await getDocs(collection(db, 'config'));
    const detectionConfig = configDoc.docs.find(d => d.id === 'detection');
    
    if (!detectionConfig) {
      console.log('   ❌ No hay configuración. Ejecuta: node scripts/setup-detection-config.js');
      return;
    }
    
    const config = detectionConfig.data();
    console.log('   ✅ Configuración encontrada:');
    console.log(`      - Ransomware: ${config.enableRansomwareDetection ? '✅' : '❌'}`);
    console.log(`      - Intrusión: ${config.enableIntrusionDetection ? '✅' : '❌'}`);
    console.log(`      - Filtración: ${config.enableDataLeakPrevention ? '✅' : '❌'}`);
    console.log(`      - Anomalías: ${config.enableAnomalyDetection ? '✅' : '❌'}`);
    console.log(`      - Intervalo: ${config.detectionInterval || 60} segundos\n`);

    // 4. Verificar alertas
    console.log('4️⃣ ALERTAS');
    const alertsSnapshot = await getDocs(collection(db, 'alerts'));
    const allAlerts = alertsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    const automatedAlerts = allAlerts.filter(a => a.source === 'automated_detection');
    const openAlerts = allAlerts.filter(a => a.status === 'open');
    const recentAlerts = allAlerts.filter(a => {
      const timestamp = a.createdAt?.toMillis?.() || 0;
      return timestamp >= fiveMinutesAgo;
    });
    
    console.log(`   Total de alertas: ${allAlerts.length}`);
    console.log(`   Alertas automáticas: ${automatedAlerts.length}`);
    console.log(`   Alertas abiertas: ${openAlerts.length}`);
    console.log(`   Alertas recientes (<5 min): ${recentAlerts.length}`);
    
    if (automatedAlerts.length === 0) {
      console.log('   ⚠️  No hay alertas automáticas. Esto puede significar:');
      console.log('      1. Las detecciones no se han ejecutado aún');
      console.log('      2. Las functions no están corriendo');
      console.log('      3. No se detectaron amenazas en las métricas');
    } else {
      console.log('   ✅ Hay alertas automáticas');
      console.log('\n   📋 Últimas 5 alertas automáticas:');
      automatedAlerts
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        })
        .slice(0, 5)
        .forEach((alert, idx) => {
          const time = alert.createdAt?.toMillis?.() || 0;
          const minutesAgo = Math.floor((now - time) / (60 * 1000));
          console.log(`      ${idx + 1}. [${alert.severity?.toUpperCase()}] ${alert.title}`);
          console.log(`         Servidor: ${alert.serverName || 'N/A'}`);
          console.log(`         Hace ${minutesAgo} minutos`);
        });
    }
    console.log('');

    // 5. Verificar logs de auditoría
    console.log('5️⃣ LOGS DE AUDITORÍA');
    const auditLogsSnapshot = await getDocs(
      query(
        collection(db, 'audit_logs'),
        where('action', '==', 'threat_detected'),
        orderBy('timestamp', 'desc'),
        limit(10)
      )
    );
    
    const auditLogs = auditLogsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    const recentLogs = auditLogs.filter(log => {
      const timestamp = log.timestamp?.toMillis?.() || 0;
      return timestamp >= fiveMinutesAgo;
    });
    
    console.log(`   Total de logs de detección: ${auditLogs.length}`);
    console.log(`   Logs recientes (<5 min): ${recentLogs.length}`);
    
    if (auditLogs.length === 0) {
      console.log('   ⚠️  No hay logs de detección. Las detecciones no se han ejecutado.');
    } else {
      console.log('   ✅ Hay logs de detección');
      if (recentLogs.length > 0) {
        console.log('\n   📋 Últimas 3 detecciones:');
        recentLogs.slice(0, 3).forEach((log, idx) => {
          const time = log.timestamp?.toMillis?.() || 0;
          const minutesAgo = Math.floor((now - time) / (60 * 1000));
          console.log(`      ${idx + 1}. Tipo: ${log.detectionType || 'N/A'}`);
          console.log(`         Amenaza: ${log.threatDetected ? '✅ Detectada' : '❌ No'}`);
          console.log(`         Severidad: ${log.severity || 'N/A'}`);
          console.log(`         Hace ${minutesAgo} minutos`);
        });
      }
    }
    console.log('');

    // 6. Resumen y recomendaciones
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN\n');
    
    const issues = [];
    if (onlineServers.length === 0) {
      issues.push('❌ No hay servidores online');
    }
    if (totalMetrics === 0) {
      issues.push('❌ No hay métricas');
    }
    if (recentMetrics === 0 && totalMetrics > 0) {
      issues.push('⚠️  No hay métricas recientes (simula un ataque)');
    }
    if (!detectionConfig) {
      issues.push('❌ No hay configuración de detección');
    }
    if (recentLogs.length === 0 && recentMetrics > 0) {
      issues.push('⚠️  No hay detecciones recientes (las functions pueden no estar corriendo)');
    }
    if (automatedAlerts.length === 0 && recentLogs.length > 0) {
      issues.push('⚠️  Se ejecutaron detecciones pero no se crearon alertas');
    }
    
    if (issues.length === 0) {
      console.log('✅ Todo parece estar funcionando correctamente\n');
    } else {
      console.log('⚠️  Problemas encontrados:\n');
      issues.forEach(issue => console.log(`   ${issue}\n`));
    }
    
    console.log('💡 PRÓXIMOS PASOS:\n');
    console.log('   1. Si no hay métricas recientes:');
    console.log('      node scripts/simulate-attack.js\n');
    console.log('   2. Si las detecciones no se ejecutan automáticamente:');
    console.log('      - Verifica que las functions estén corriendo:');
    console.log('        firebase emulators:start --only functions');
    console.log('      - O ejecuta detecciones manualmente:');
    console.log('        node scripts/run-detection-create-alerts.js\n');
    console.log('   3. Para forzar una detección inmediata:');
    console.log('      node scripts/run-detection-create-alerts.js\n');
    console.log('   4. Verifica el frontend:');
    console.log('      - Abre la consola del navegador (F12)');
    console.log('      - Revisa si hay errores');
    console.log('      - Verifica que aparezcan logs de "📡 onAlertsChange"\n');

  } catch (error) {
    console.error('❌ Error verificando estado:', error);
    throw error;
  }
}

checkDetectionStatus()
  .then(() => {
    console.log('✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });

