# Guía de Implementación de Firebase para LINCOLN

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#-requisitos-previos)
2. [Configuración Inicial](#-configuración-inicial)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Configuración de Firebase](#-configuración-de-firebase)
5. [Códigos de Ejemplo](#-códigos-de-ejemplo)
6. [Despliegue](#-despliegue)
7. [Pruebas Locales](#-pruebas-locales)
8. [Mantenimiento](#-mantenimiento)
9. [Solución de Problemas](#-solución-de-problemas)

## 🛠 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Cuenta de Google (para Firebase)
- Git instalado
- Editor de código (VS Code recomendado)

## 🚀 Configuración Inicial

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/LINCOLN.git
cd LINCOLN
```

### 2. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 3. Iniciar Sesión en Firebase
```bash
firebase login
```

## 📁 Estructura del Proyecto

```
LINCOLN/
├── frontend/           # Aplicación web
│   └── src/
│       └── firebase/   # Configuración de Firebase
│           ├── config.js
│           ├── auth.js
│           └── firestore.js
├── functions/          # Cloud Functions
│   ├── src/
│   │   └── index.ts
│   └── package.json
├── .firebaserc         # Configuración de proyectos de Firebase
└── firebase.json       # Configuración de despliegue
```

## 🔧 Configuración de Firebase

### 1. Crear Proyecto en Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Añadir proyecto"
3. Sigue las instrucciones en pantalla
4. Activa **Firestore Database** y **Authentication** desde el menú lateral

### 2. Inicializar Firebase en tu Proyecto
```bash
# Navega a la raíz del proyecto
cd LINCOLN

# Inicializa Firebase
firebase init
```

Selecciona las siguientes opciones:
- **Firestore**: Configura reglas de seguridad
- **Functions**: Configura Cloud Functions
- **Hosting**: Configura alojamiento web

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:
```
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu-proyecto
REACT_APP_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## 💻 Códigos de Ejemplo

### 1. Configuración de Firebase (frontend/src/firebase/config.js)
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
```

### 2. Autenticación (frontend/src/firebase/auth.js)
```javascript
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

// Registrar nuevo usuario
export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Iniciar sesión
export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Cerrar sesión
export const logoutUser = () => {
  return signOut(auth);
};

// Observador de estado de autenticación
export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};
```

### 3. Operaciones con Firestore (frontend/src/firebase/firestore.js)
```javascript
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from './config';

// Obtener todos los documentos de una colección
export const getCollection = async (collectionName) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Obtener un documento por ID
export const getDocument = async (collectionName, docId) => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error('Documento no encontrado');
  }
};

// Añadir un nuevo documento
export const addDocument = async (collectionName, data) => {
  const docRef = await addDoc(collection(db, collectionName), data);
  return { id: docRef.id, ...data };
};

// Actualizar un documento existente
export const updateDocument = async (collectionName, docId, data) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data);
  return { id: docId, ...data };
};

// Eliminar un documento
export const deleteDocument = async (collectionName, docId) => {
  await deleteDoc(doc(db, collectionName, docId));
  return docId;
};
```

### 4. Cloud Function de Ejemplo (functions/src/index.ts)
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Ejemplo de función que se dispara cuando se crea un nuevo usuario
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    const { uid, email, displayName, photoURL } = user;
    
    // Crear un perfil de usuario en Firestore
    await admin.firestore().collection('users').doc(uid).set({
      email,
      displayName: displayName || '',
      photoURL: photoURL || '',
      role: 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Perfil creado para el usuario: ${uid}`);
    return null;
  } catch (error) {
    console.error('Error al crear el perfil del usuario:', error);
    return null;
  }
});

// Ejemplo de función HTTP
export const helloWorld = functions.https.onRequest((request, response) => {
  response.json({ message: "¡Hola desde Cloud Functions!" });
});
```

## 🚀 Despliegue

### 1. Desplegar Reglas de Seguridad (firestore.rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite lectura/escritura solo a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Reglas específicas para la colección de usuarios
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 🚀 Configuración del Entorno de Desarrollo Local

### 1. Instalar Firebase Tools (si aún no está instalado)
```bash
npm install -g firebase-tools
```

### 2. Configurar Emuladores de Firebase
```bash
# Iniciar sesión en Firebase (solo primera vez)
firebase login

# Inicializar emuladores (si es la primera vez)
firebase init emulators
```

### 3. Iniciar los Emuladores
```bash
# Navegar al directorio del proyecto
cd functions

# Instalar dependencias
npm install

# Iniciar todos los emuladores
firebase emulators:start
```

### 4. Probar las Funciones Localmente
Una vez que los emuladores estén en ejecución, podrás:

1. **Acceder a la interfaz de los emuladores**:
   - Abre tu navegador en: http://localhost:4000

2. **Probar funciones HTTP localmente**:
   - Las funciones estarán disponibles en `http://localhost:5001/lincoln-587b0/us-central1/helloWorld`

3. **Probar funciones de autenticación**:
   - Usa la pestaña de Authentication en la interfaz del emulador

4. **Probar Firestore localmente**:
   - Los datos se almacenarán localmente en tu máquina
   - Accede desde http://localhost:4000/firestore

## 🔄 Flujo de Trabajo con Emuladores

1. **Desarrollo**:
   ```bash
   # En una terminal
   firebase emulators:start
   
   # En otra terminal, para reconstruir funciones automáticamente
   npm run serve
   ```

2. **Pruebas**:
   - Todas las funciones se ejecutarán localmente
   - Los datos se mantendrán entre reinicios en la carpeta `.firebase`

3. **Reiniciar datos de prueba**:
   ```bash
   # Detener los emuladores y limpiar datos
   firebase emulators:start --only firestore,auth,functions --import=./emulator-data --export-on-exit
   ```

## 📱 Conectar la Aplicación Frontend a los Emuladores

En tu aplicación frontend, configura la conexión a los emuladores en desarrollo:

```javascript
// En tu archivo de configuración de Firebase
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Configuración de Firebase
const app = initializeApp(firebaseConfig);

// Configuración para desarrollo local
if (window.location.hostname === 'localhost') {
  const auth = getAuth();
  const db = getFirestore();
  const functions = getFunctions();
  
  // Conectar a los emuladores
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  
  console.log('Conectado a emuladores locales');
}
```

## 🧪 Pruebas Locales Avanzadas

### 1. Iniciar Emuladores Específicos
```bash
# Iniciar solo los emuladores necesarios
firebase emulators:start --only firestore,auth,functions
```

### 2. Ejecutar Pruebas con los Emuladores
```bash
# En una terminal, inicia los emuladores
firebase emulators:start
```

### 3. Verificar Estado de los Emuladores
- **Firestore UI**: http://localhost:4000/firestore
- **Auth UI**: http://localhost:4000/auth
- **Functions Logs**: http://localhost:4000/logs
- **Emulator Hub**: http://localhost:4000

### 4. Limpiar Datos de los Emuladores
```bash
# Detener los emuladores y limpiar datos
firebase emulators:exec "npm test" --import=./test-data --export-on-exit
```
# En otra terminal, ejecuta tus pruebas
cd frontend
npm test
```

## 🛠 Mantenimiento

### Verificar Estado del Despliegue
```bash
# Ver estado de las funciones desplegadas
firebase functions:list

# Ver logs en tiempo real
firebase functions:log
```

### Actualizar Dependencias
```bash
# Actualizar Firebase CLI
npm install -g firebase-tools@latest

# Actualizar dependencias de las funciones
cd functions
npm update
```

## 🚨 Solución de Problemas

### Error: "Missing or insufficient permissions"
1. Verifica que el usuario esté autenticado
2. Revisa las reglas de seguridad de Firestore
3. Asegúrate de que el usuario tenga los permisos necesarios

### Error: "Function failed on loading user code"
1. Verifica que todas las dependencias estén instaladas
2. Ejecuta `npm install` en el directorio `functions/`
3. Verifica que no haya errores de sintaxis en tu código

### Error: "Project ID not found"
1. Asegúrate de estar autenticado: `firebase login`
2. Verifica el proyecto actual: `firebase use`
3. Si es necesario, selecciona o añade un proyecto: `firebase use --add`

## 📚 Recursos Adicionales

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Guía de Seguridad de Firestore](https://firebase.google.com/docs/firestore/security/get-started)
- [Referencia de Cloud Functions](https://firebase.google.com/docs/functions/callable)
- [Ejemplos de Código de Firebase](https://github.com/firebase/snippets-web)

## 🤝 Contribuir

1. Haz un fork del repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Haz commit de tus cambios: `git commit -m 'Añadir nueva funcionalidad'`
4. Haz push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

¿Neitas ayuda con algo más? ¡No dudes en preguntar! 🚀
