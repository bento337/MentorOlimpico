// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { getAnalytics } from "firebase/analytics";

// 🔥 pegue esses dados no Firebase Console (Configurações do app -> SDK setup)
const firebaseConfig = {
  apiKey: "AIzaSyBB_L_ausJfBa4DNJ-7hwoHVQI1b4gilCg",
  authDomain: "mentorolimpico-7a077.firebaseapp.com",
  projectId: "mentorolimpico-7a077",
  storageBucket: "mentorolimpico-7a077.firebasestorage.app",
  messagingSenderId: "999725331555",
  appId: "1:999725331555:web:e216db41f6d2ac2704b456",
  measurementId: "G-9T0K71D99F"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const analytics = getAnalytics(app);