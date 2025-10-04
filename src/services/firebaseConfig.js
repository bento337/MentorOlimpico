import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBB_L_ausJfBa4DNJ-7hwoHVQI1b4gilCg",
  authDomain: "mentorolimpico-7a077.firebaseapp.com",
  projectId: "mentorolimpico-7a077",
  storageBucket: "mentorolimpico-7a077.firebasestorage.app",
  messagingSenderId: "999725331555",
  appId: "1:999725331555:web:e216db41f6d2ac2704b456",
  measurementId: "G-9T0K71D99F"
};


const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)