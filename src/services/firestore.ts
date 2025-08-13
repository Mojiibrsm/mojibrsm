
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAN1I_7T73BUDgY8vzykNGpJZO9_nm2qEU",
  authDomain: "mojib-rsm-portfolio.firebaseapp.com",
  projectId: "mojib-rsm-portfolio",
  storageBucket: "mojib-rsm-portfolio.appspot.com",
  messagingSenderId: "808651355933",
  appId: "1:808651355933:web:42d41a48333a1001efd3f4"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };
