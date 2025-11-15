// Ver datos actuales en Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, connectFirestoreEmulator } from 'firebase/firestore';

const app = initializeApp({ projectId: 'demo-lincoln' });
const db = getFirestore(app);
connectFirestoreEmulator(db, 'localhost', 8082);

console.log('📊 Consultando datos de Firestore...\n');

try {
  // Servidores
  const serversSnap = await getDocs(collection(db, 'servers'));
  console.log(`🖥️  SERVIDORES (${serversSnap.size}):`);
  serversSnap.forEach((doc) => {
    const data = doc.data();
    console.log(`   - ${data.name} (${data.ipAddress}) - ${data.status}`);
  });

  console.log('');

  // Alertas
  const alertsSnap = await getDocs(collection(db, 'alerts'));
  console.log(`🚨 ALERTAS (${alertsSnap.size}):`);
  alertsSnap.forEach((doc) => {
    const data = doc.data();
    console.log(`   - ${data.title} - ${data.severity} - ${data.status}`);
  });

  console.log('');

  // Usuarios
  const usersSnap = await getDocs(collection(db, 'users'));
  console.log(`👥 USUARIOS (${usersSnap.size}):`);
  usersSnap.forEach((doc) => {
    const data = doc.data();
    console.log(`   - ${data.email} - ${data.role}`);
  });

  console.log('\n✅ Datos obtenidos exitosamente');
  console.log('\n💡 Si ves datos aquí, significa que están en Firestore');
  console.log('   Problema: El Dashboard no los está cargando correctamente\n');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

