import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// IMPORTANT: Replace the placeholder values with your actual Firebase project configuration.
// You can find these details in your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyCCvCVSWWNwGWbFmzZEEe7fIBrO2t6KRCc",
  authDomain: "ai-portfolio-eda2b.firebaseapp.com",
  projectId: "ai-portfolio-eda2b",
  storageBucket: "ai-portfolio-eda2b.firebasestorage.app",
  messagingSenderId: "930806736438",
  appId: "1:930806736438:web:d29e7d0d51ad602f671a97"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
