/**
 * Script para probar el sistema de detección manualmente
 * Ejecutar con: node scripts/test-detection.js
 * Asegúrate de que los emuladores y las funciones estén corriendo
 */

import {initializeApp} from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {getFunctions, httpsCallable, connectFunctionsEmulator} from "firebase/functions";
import { ensureAllData } from "./helpers/ensure-data.js";

// Configuración de Firebase para emuladores
// Nota: El projectId debe coincidir con el del .firebaserc para que las funciones funcionen
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "lincoln-587b0", // Debe coincidir con .firebaserc
  storageBucket: "lincoln-587b0.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};

console.log("🔥 Inicializando Firebase...");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

// Conectar a emuladores
console.log("🔌 Conectando a emuladores...");
connectFirestoreEmulator(db, "localhost", 8082);
connectFunctionsEmulator(functions, "localhost", 5001);
console.log("✅ Conectado a emuladores\n");

async function testDetection() {
  try {
    console.log("🧪 Probando sistema de detección...\n");

    // Verificar y crear datos necesarios si no existen
    const { servers: availableServers } = await ensureAllData(db);
    
    const onlineServers = availableServers.filter((s) => s.isActive && s.status === "online");
    
    // Verificar métricas para mostrar el conteo
    console.log("📊 Verificando métricas de servidores...");
    let totalMetrics = 0;
    for (const server of onlineServers) {
      const metricsSnapshot = await getDocs(
        collection(db, "servers", server.id, "metrics"),
      );
      totalMetrics += metricsSnapshot.size;
    }
    console.log(`   ✅ Encontradas ${totalMetrics} métrica(s)\n`);

    // Ejecutar detección manualmente (si las funciones están disponibles)
    console.log("🔍 Ejecutando detección manual...");
    console.log(`   📍 Project ID: ${firebaseConfig.projectId}`);
    console.log(`   📍 Functions Emulator: localhost:5001\n`);
    let detectionExecuted = false;
    
    // Intentar primero con función callable
    try {
      const runDetection = httpsCallable(functions, "runDetectionManual");
      console.log("   🔄 Intentando función callable 'runDetectionManual'...");
      const result = await runDetection({});
      console.log("   ✅ Detección ejecutada (callable):");
      console.log(`      - Amenazas detectadas: ${result.data.threatsDetected}`);
      console.log(`      - Total detecciones: ${result.data.totalDetections}`);
      detectionExecuted = true;
    } catch (callableError) {
      console.log("   ⚠️  Función callable no disponible:");
      console.log(`      Error: ${callableError.message || callableError.code || callableError}`);
      console.log("   🔄 Intentando función HTTP como fallback...");
      
      // Intentar con función HTTP como fallback
      try {
        // El formato de URL para emuladores: http://localhost:5001/{projectId}/{region}/{functionName}
        // En emuladores, la región puede ser 'us-central1' o puede no ser necesaria
        const possibleUrls = [
          `http://localhost:5001/lincoln-587b0/us-central1/runDetectionManualHTTP`,
          `http://127.0.0.1:5001/lincoln-587b0/us-central1/runDetectionManualHTTP`,
          `http://localhost:5001/lincoln-587b0/runDetectionManualHTTP`, // Sin región
          `http://127.0.0.1:5001/lincoln-587b0/runDetectionManualHTTP`, // Sin región
        ];
        
        let httpSuccess = false;
        for (const httpUrl of possibleUrls) {
          try {
            // Usar fetch si está disponible (Node.js 18+), sino usar node-fetch o deshabilitar
            let response;
            if (typeof fetch !== 'undefined') {
              response = await fetch(httpUrl, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
            } else {
              // Fallback: intentar con http module nativo de Node.js
              const http = await import('http');
              response = await new Promise((resolve, reject) => {
                const req = http.get(httpUrl, (res) => {
                  let data = '';
                  res.on('data', chunk => data += chunk);
                  res.on('end', () => {
                    res.data = data;
                    res.ok = res.statusCode >= 200 && res.statusCode < 300;
                    resolve(res);
                  });
                });
                req.on('error', reject);
                req.setTimeout(5000, () => {
                  req.destroy();
                  reject(new Error('Timeout'));
                });
              });
            }
            
            if (response.ok || (response.statusCode >= 200 && response.statusCode < 300)) {
              const result = typeof response.json === 'function' 
                ? await response.json() 
                : JSON.parse(response.data || '{}');
              
              console.log("   ✅ Detección ejecutada (HTTP):");
              console.log(`      - Amenazas detectadas: ${result.threatsDetected || 0}`);
              console.log(`      - Total detecciones: ${result.totalDetections || 0}`);
              detectionExecuted = true;
              httpSuccess = true;
              break;
            }
          } catch (urlError) {
            // Continuar con la siguiente URL si esta falla
            continue;
          }
        }
        
        if (!httpSuccess) {
          throw new Error('No se pudo conectar a ninguna URL de función HTTP');
        }
      } catch (httpError) {
        console.log("\n   ⚠️  No se pudo ejecutar la función:");
        console.log(`      Error callable: ${callableError.message || callableError.code || callableError}`);
        if (httpError.message) {
          console.log(`      Error HTTP: ${httpError.message}`);
        }
        console.log("\n   💡 DIAGNÓSTICO:");
        console.log("      - Verifica que los emuladores estén corriendo:");
        console.log("        http://localhost:4001 (Firebase UI)");
        console.log("      - Verifica que las functions estén compiladas:");
        console.log("        cd functions && npm run build");
        console.log("      - Verifica los logs de functions en:");
        console.log("        http://localhost:4001/logs");
        console.log("\n   💡 SOLUCIONES:");
        console.log("      1. Compilar functions:");
        console.log("         cd functions && npm run build");
        console.log("      2. Reiniciar emuladores (si ya están corriendo):");
        console.log("         Ctrl+C y luego: firebase emulators:start");
        console.log("      3. O usar el script directo (sin functions):");
        console.log("         node scripts/run-detection-direct.js");
        console.log("      4. O usar el script que crea alertas directamente:");
        console.log("         node scripts/run-detection-create-alerts.js");
      }
    }
    
    if (!detectionExecuted) {
      console.log("   💡 Las detecciones se ejecutarán automáticamente cada minuto cuando las functions estén activas");
    }

    // Verificar alertas creadas
    console.log("\n📋 Verificando alertas creadas...");
    const alertsSnapshot = await getDocs(
      query(
        collection(db, "alerts"),
        where("source", "==", "automated_detection"),
        orderBy("createdAt", "desc"),
        limit(10),
      ),
    );

    const alerts = alertsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`   ✅ Encontradas ${alerts.length} alerta(s) de detección automática\n`);

    if (alerts.length > 0) {
      console.log("   📋 Últimas alertas:");
      alerts.slice(0, 5).forEach((alert, index) => {
        console.log(`      ${index + 1}. [${alert.severity.toUpperCase()}] ${alert.title}`);
        console.log(`         Servidor: ${alert.serverName}`);
        console.log(`         Tipo: ${alert.type}`);
      });
    }

    // Verificar logs de auditoría
    console.log("\n📝 Verificando logs de auditoría...");
    const auditLogsSnapshot = await getDocs(
      query(
        collection(db, "audit_logs"),
        where("action", "==", "threat_detected"),
        orderBy("timestamp", "desc"),
        limit(10),
      ),
    );

    const auditLogs = auditLogsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`   ✅ Encontrados ${auditLogs.length} log(s) de detección\n`);

    console.log("✅ Prueba completada!");
    console.log("\n💡 Próximos pasos:");
    console.log("   1. Revisa el dashboard para ver las alertas");
    console.log("   2. Verifica los logs en Firestore UI");
    console.log("   3. Las detecciones se ejecutarán automáticamente cada minuto");
  } catch (error) {
    console.error("❌ Error probando detección:", error);
    throw error;
  }
}

// Ejecutar
testDetection()
  .then(() => {
    console.log("\n✅ Script completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });

