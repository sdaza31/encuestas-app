import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCft40qhjvAjy5zosiNDr_RidPo0VQPh5M",
    authDomain: "encuestas-e60a0.firebaseapp.com",
    projectId: "encuestas-e60a0",
    storageBucket: "encuestas-e60a0.firebasestorage.app",
    messagingSenderId: "400312841962",
    appId: "1:400312841962:web:e67a045917b94470aec993",
    measurementId: "G-0BJKXXDL40"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
