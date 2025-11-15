/**
 * Script que verifica si Firestore está vacío y lo puebla automáticamente
 * Se ejecuta al iniciar el frontend
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, connectFirestoreEmulator } from 'firebase/firestore';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const app = initializeApp({ projectId: 'demo-lincoln' });
const db = getFirestore(app);

try {
  connectFirestoreEmulator(db, 'localhost', 8082);
} catch (error) {
  console.error('❌ No se puede conectar a Firestore. ¿Está corriendo?');
  process.exit(1);
}

async function checkAndPopulate() {
  try {
    // Verificar si hay servidores
    const serversSnap = await getDocs(collection(db, 'servers'));
    
    if (serversSnap.size === 0) {
      console.log('📊 Firestore vacío - Poblando datos...');
      const { stdout } = await execAsync('node scripts/populate-firestore.js');
      console.log(stdout);
    } else {
      console.log(`✅ Firestore ya tiene datos (${serversSnap.size} servidores)`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Esperar 2 segundos antes de verificar
setTimeout(checkAndPopulate, 2000);

