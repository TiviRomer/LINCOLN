const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = getFirestore(app);

async function initTestData() {
  try {
    console.log('🔧 Inicializando datos de prueba...');
    
    // Crear usuario de prueba
    const usersRef = db.collection('users');
    await usersRef.doc('test@example.com').set({
      email: 'test@example.com',
      displayName: 'Usuario de Prueba',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Crear colección de prueba
    const testRef = db.collection('test');
    await testRef.add({
      message: 'Conexión exitosa con Firestore',
      timestamp: new Date()
    });

    console.log('✅ Datos de prueba inicializados correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar datos de prueba:', error);
    process.exit(1);
  }
}

initTestData();
