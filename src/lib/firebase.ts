import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCJaCNpMJncehPGGE8dW8YX9x_jvh2VuE0",
  authDomain: "learnhub-3773f.firebaseapp.com",
  projectId: "learnhub-3773f",
  storageBucket: "learnhub-3773f.firebasestorage.app",
  messagingSenderId: "433410934988",
  appId: "1:433410934988:web:1f426bfc220a8c2beb5a69",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
