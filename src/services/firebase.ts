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
  apiKey: "AIzaSyBjXJsIpr0fHJWrUvEqOU0iWJjNMc_K3A4",
  authDomain: "md-stash.firebaseapp.com",
  projectId: "md-stash",
  storageBucket: "md-stash.firebasestorage.app",
  messagingSenderId: "269950943966",
  appId: "1:269950943966:web:116e3e55a321c6dab3f84f",
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
