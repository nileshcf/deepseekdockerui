// Importing Firebase app initialization and authentication functions
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

// Importing Firestore database functions for data operations
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  getDocs,
  setDoc,
  where,
} from 'firebase/firestore';

// Importing Firebase Storage for file handling
import { getStorage } from 'firebase/storage';

// Firebase configuration object with project-specific details
const firebaseConfig = {
  apiKey: "AIzaSyB1VQBFdT4kpa9loXDhCqefu6-vz3V2vIk",
  authDomain: "rag-chat-ui.firebaseapp.com",
  projectId: "rag-chat-ui",
  storageBucket: "rag-chat-ui.firebasestorage.app",
  messagingSenderId: "226808539339",
  appId: "1:226808539339:web:145d2a03d99b59e3f2934e",
  measurementId: "G-FC20QKC0N8",
};

// Initialize the Firebase app with the provided configuration
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get the auth instance
const auth = getAuth(app);

// Initialize Firestore database and get the db instance
const db = getFirestore(app);

// Initialize Firebase Storage and get the storage instance
const storage = getStorage(app);

// Set up Google Auth Provider for Google sign-in
const googleProvider = new GoogleAuthProvider();

// Export all necessary Firebase services and functions for use in the app
export {
  auth,
  db,
  storage,
  googleProvider,
  signInWithPopup,
  signOut,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  getDocs,
  setDoc,
  where,
};