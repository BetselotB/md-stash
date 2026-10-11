import { initializeApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBjXJsIpr0fHJWrUvEqOU0iWJjNMc_K3A4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "md-stash.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "md-stash",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "md-stash.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "269950943966",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:269950943966:web:116e3e55a321c6dab3f84f",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// Enforce browser local persistence (remembers login session forever across browser restarts)
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase persistence warning:', err);
});

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
};
export type { User };
