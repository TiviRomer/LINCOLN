/**
 * Script para ejecutar las detecciones automáticas periódicamente
 * Simula la función programada runDetectionScheduled
 * 
 * Ejecutar con: node scripts/run-automatic-detection.js [intervalo_en_segundos]
 * Por defecto: ejecuta cada 60 segundos (1 minuto)
 * Desde start.ps1: ejecuta cada 30 segundos
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

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
console.log('✅ Conectado a emuladores');
console.log('💡 Usando detección directa (sin funciones HTTP)\n');

// Obtener intervalo desde argumentos (en segundos)
const intervalSeconds = parseInt(process.argv[2]) || 60;

async function runDetection() {
  try {
    console.log(`🔍 [${new Date().toLocaleTimeString()}] Ejecutando detección automática...`);

    // Usar detección directa en lugar de funciones HTTP
    const { ensureAllData } = await import('./helpers/ensure-data.js');
    const { detectAndCreateAlerts } = await import('./helpers/detect-and-create-alerts.js');
    
    // Verificar y crear datos necesarios
    const { servers: allServers } = await ensureAllData(db);
    const servers = allServers.filter(s => s.isActive && s.status === 'online');
    
    if (servers.length === 0) {
      console.log(`   ⚠️  No hay servidores activos y online`);
      return;
    }
    
    // Ejecutar detección y crear alertas directamente
    const { createdAlerts, totalThreats } = await detectAndCreateAlerts(db, servers, {
      onlyRecentMinutes: 2 // Solo métricas de los últimos 2 minutos
    });
    
    if (totalThreats > 0) {
      console.log(`   ✅ Detección completada: ${totalThreats} amenaza(s) detectada(s)`);
      console.log(`   🚨 ${totalThreats} ALERTA(S) CREADA(S):`);
      createdAlerts.forEach((alert, i) => {
        console.log(`      ${i + 1}. [${alert.severity.toUpperCase()}] ${alert.type.toUpperCase()} - ${alert.title}`);
        console.log(`         Servidor: ${alert.serverName}`);
      });
    } else {
      console.log(`   ✅ Detección completada: 0 amenazas detectadas`);
    }
  } catch (error) {
    const errorMsg = error.message || String(error);
    console.error(`   ❌ Error ejecutando detección: ${errorMsg}`);
    if (error.stack) {
      console.error(`   Stack: ${error.stack}`);
    }
  }
  
  console.log(`\n⏰ Próxima ejecución en ${intervalSeconds} segundos...\n`);
}

// Ejecutar inmediatamente la primera vez
runDetection();

// Configurar intervalo
const interval = setInterval(runDetection, intervalSeconds * 1000);

console.log(`🔄 Detección automática iniciada - ejecutándose cada ${intervalSeconds} segundos`);
console.log(`   Presiona Ctrl+C para detener\n`);

// Manejar cierre limpio
process.on('SIGINT', () => {
  console.log('\n\n🛑 Deteniendo detección automática...');
  clearInterval(interval);
  process.exit(0);
});

