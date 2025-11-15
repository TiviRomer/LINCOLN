/**
 * Script para verificar que los datos estén en Firestore
 * Ejecutar con: node scripts/verify-data.js
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
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

async function verifyData() {
  try {
    console.log('🔍 Verificando datos en Firestore...\n');

    // Verificar servidores
    console.log('📡 Verificando servidores...');
    const serversSnapshot = await getDocs(collection(db, 'servers'));
    console.log(`   ✅ Servidores encontrados: ${serversSnapshot.size}`);
    if (serversSnapshot.size > 0) {
      serversSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log(`      - ${data.name} (${data.status})`);
      });
    } else {
      console.log('   ⚠️  No hay servidores. Ejecuta populate-firestore.js');
    }

    // Verificar alertas
    console.log('\n🚨 Verificando alertas...');
    const alertsSnapshot = await getDocs(collection(db, 'alerts'));
    console.log(`   ✅ Alertas encontradas: ${alertsSnapshot.size}`);
    if (alertsSnapshot.size > 0) {
      alertsSnapshot.docs.slice(0, 3).forEach((doc) => {
        const data = doc.data();
        console.log(`      - ${data.title} (${data.severity})`);
      });
    } else {
      console.log('   ⚠️  No hay alertas. Ejecuta populate-firestore.js');
    }

    // Verificar configuración
    console.log('\n⚙️  Verificando configuración...');
    const configSnapshot = await getDocs(collection(db, 'config'));
    const hasDetectionConfig = configSnapshot.docs.some((d) => d.id === 'detection');
    console.log(`   ✅ Configuración de detección: ${hasDetectionConfig ? 'Sí' : 'No'}`);
    if (!hasDetectionConfig) {
      console.log('   ⚠️  Ejecuta setup-detection-config.js');
    }

    // Verificar métricas
    console.log('\n📊 Verificando métricas de servidores...');
    let totalMetrics = 0;
    for (const serverDoc of serversSnapshot.docs) {
      const metricsSnapshot = await getDocs(
        collection(db, 'servers', serverDoc.id, 'metrics'),
      );
      totalMetrics += metricsSnapshot.size;
    }
    console.log(`   ✅ Métricas encontradas: ${totalMetrics}`);
    if (totalMetrics === 0) {
      console.log('   ⚠️  No hay métricas. Ejecuta populate-server-metrics.js');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (serversSnapshot.size > 0 && alertsSnapshot.size > 0 && hasDetectionConfig) {
      console.log('✅ Datos verificados correctamente');
      console.log('💡 Si el frontend no muestra datos, verifica:');
      console.log('   1. Que los emuladores estén corriendo');
      console.log('   2. La consola del navegador para errores');
      console.log('   3. Que el frontend esté conectado a localhost:8082');
    } else {
      console.log('⚠️  Faltan datos. Ejecuta los scripts de población:');
      console.log('   1. node scripts/setup-detection-config.js');
      console.log('   2. node scripts/populate-firestore.js');
      console.log('   3. node scripts/populate-server-metrics.js');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error verificando datos:', error);
    console.log('\n💡 Asegúrate de que los emuladores estén corriendo:');
    console.log('   firebase emulators:start');
  }
}

verifyData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

