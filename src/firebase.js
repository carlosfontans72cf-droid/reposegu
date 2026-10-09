import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Estos valores identifican el proyecto y no son secretos: la protección real
// está en las reglas de Firestore y Storage (firestore.rules / storage.rules).
const firebaseConfig = {
  apiKey: 'AIzaSyBNg4NQHoPUjG0FB3MiosenD6e5HDnVaLQ',
  authDomain: 'project-c6e6ed98-7ea4-4bc7-bcf.firebaseapp.com',
  projectId: 'project-c6e6ed98-7ea4-4bc7-bcf',
  storageBucket: 'project-c6e6ed98-7ea4-4bc7-bcf.firebasestorage.app',
  messagingSenderId: '836125789056',
  appId: '1:836125789056:web:3413f71dcf4000d21e0f65',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// La caché local reduce lecturas (la cuota gratuita es de 50.000 por día).
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
export const storage = getStorage(app);
