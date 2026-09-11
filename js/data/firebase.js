// Conexión a Firebase (SDK modular vía CDN, sin npm/build). El apiKey de una app web de
// Firebase no es secreto por diseño — la seguridad real la dan las reglas de Firestore
// (que ahora exigen sesión iniciada) y el login con Google, no esconder esta config.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  enableIndexedDbPersistence,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAvwapGPrCKp_I-aW-R9W8mYAaTzB-o3cI',
  authDomain: 'entrenamiento-app-1a505.firebaseapp.com',
  projectId: 'entrenamiento-app-1a505',
  storageBucket: 'entrenamiento-app-1a505.firebasestorage.app',
  messagingSenderId: '708536388795',
  appId: '1:708536388795:web:30c5009e5054d146826d9e',
};

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

// Cache local de Firestore (para que la app siga funcionando sin señal en el gym).
// Falla silenciosamente si hay más de una pestaña abierta o el navegador no lo soporta;
// localStorage sigue de respaldo en ese caso.
enableIndexedDbPersistence(db).catch(() => {});

// El documento vive bajo el uid de quien inició sesión (users/{uid}/entrenamiento/estado),
// para que las reglas de Firestore puedan exigir "solo el dueño lee/escribe lo suyo".
export function stateDocFor(uid) {
  return doc(db, 'users', uid, 'entrenamiento', 'estado');
}

export function signIn() {
  return signInWithPopup(auth, googleProvider);
}

export { setDoc, onSnapshot, onAuthStateChanged, signOut };
