/**
 * Script para configurar la colección de configuración de detección
 * Ejecutar con: node scripts/setup-detection-config.js
 * Asegúrate de que los emuladores estén corriendo
 */

import {initializeApp} from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
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

async function setupDetectionConfig() {
  try {
    console.log("⚙️  Configurando sistema de detección...\n");

    const config = {
      enableRansomwareDetection: true,
      enableIntrusionDetection: true,
      enableDataLeakPrevention: true,
      enableAnomalyDetection: true,
      suspiciousProcesses: [
        "crypt",
        "encrypt",
        "locky",
        "wannacry",
        "petya",
        "notpetya",
        "cerber",
        "lockbit",
        "revil",
        "maze",
        "ryuk",
        "sodinokibi",
      ],
      detectionInterval: 60, // segundos
    };

    await setDoc(doc(db, "config", "detection"), config);

    console.log("✅ Configuración de detección creada:");
    console.log(JSON.stringify(config, null, 2));
    console.log("\n💡 La configuración se puede modificar desde Firestore UI");
    console.log("   Ruta: config/detection");
  } catch (error) {
    console.error("❌ Error configurando detección:", error);
    throw error;
  }
}

// Ejecutar
setupDetectionConfig()
  .then(() => {
    console.log("\n✅ Script completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });

