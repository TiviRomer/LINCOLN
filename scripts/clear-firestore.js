// Limpiar todas las colecciones de Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, connectFirestoreEmulator } from 'firebase/firestore';

const app = initializeApp({ projectId: 'demo-lincoln' });
const db = getFirestore(app);
connectFirestoreEmulator(db, 'localhost', 8082);

console.log('🗑️  Limpiando Firestore...\n');

const collectionsToDelete = ['servers', 'alerts', 'config', 'stats'];

try {
  for (const collectionName of collectionsToDelete) {
    const col = collection(db, collectionName);
    const snapshot = await getDocs(col);
    
    console.log(`📁 ${collectionName}: ${snapshot.size} documentos`);
    
    for (const document of snapshot.docs) {
      await deleteDoc(doc(db, collectionName, document.id));
    }
    
    console.log(`   ✅ ${collectionName} limpiado`);
  }

  console.log('\n✅ Firestore limpiado exitosamente\n');
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

