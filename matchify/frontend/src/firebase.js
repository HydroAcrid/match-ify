// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMG73zXRUkNWCFtGX4uzvGrzxRRdg9A2s",
  authDomain: "ked225.firebaseapp.com",
  projectId: "ked225",
  storageBucket: "ked225.firebasestorage.app",
  messagingSenderId: "364682479707",
  appId: "1:364682479707:web:b24c46e43dacf80c12977e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
export default app;
