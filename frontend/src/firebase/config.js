import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Configuración para desarrollo local
// En desarrollo usamos siempre los emuladores con configuración demo
const isDevelopment = import.meta.env.DEV;
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR !== 'false' && isDevelopment;

// Configuración de Firebase
// Para desarrollo local con emuladores, estos valores son suficientes
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-lincoln',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-lincoln.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456'
};

console.log('🔧 Configuración de Firebase cargada');
console.log('📍 Modo:', isDevelopment ? 'Desarrollo' : 'Producción');
if (useEmulator) {
  console.log('🔌 Usando emuladores de Firebase (localhost)');
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// Conectar a emuladores en desarrollo ANTES de configurar persistencia
if (useEmulator) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8082);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('✅ Emuladores conectados correctamente');
  } catch (error) {
    console.warn('⚠️ Error al conectar con los emuladores:', error.message);
    console.log('💡 Asegúrate de iniciar los emuladores con: npm run emulators');
  }
}

// Configurar persistencia de autenticación después de conectar emuladores
// La persistencia se configurará por cada login, no aquí globalmente

export { db, auth, functions, app };
