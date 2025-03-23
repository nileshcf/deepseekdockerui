//Very important step!
//Populate this file with your Firebase Credentials and rename it firebase.js



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
  apiKey: "",
  authDomain: "",
  projectId: "i",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
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