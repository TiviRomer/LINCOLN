// Test rápido de conexión a emuladores
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, connectFirestoreEmulator } from 'firebase/firestore';

const app = initializeApp({
  projectId: 'demo-lincoln',
});

const db = getFirestore(app);
connectFirestoreEmulator(db, 'localhost', 8082);

console.log('🔌 Probando conexión a Firestore...');

try {
  const serversCol = collection(db, 'servers');
  const snapshot = await getDocs(serversCol);
  console.log(`✅ Conexión exitosa. Servidores actuales: ${snapshot.size}`);
  process.exit(0);
} catch (error) {
  console.error('❌ Error de conexión:', error.message);
  process.exit(1);
}

