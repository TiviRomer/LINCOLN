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