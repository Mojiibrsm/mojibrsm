// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "mojib-rsm-portfolio.firebaseapp.com",
  projectId: "mojib-rsm-portfolio",
  storageBucket: "mojib-rsm-portfolio.appspot.com",
  messagingSenderId: "808651355933",
  appId: "1:808651355933:web:42d41a48333a1001efd3f4"
};

// Validate that the API key is available
if (!firebaseConfig.apiKey) {
  throw new Error("Firebase API key is not set. Please add NEXT_PUBLIC_FIREBASE_API_KEY to your .env.local file.");
}


// Initialize Firebase for SSR
let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };
