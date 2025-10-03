// src/services/authService.js
import { auth } from "./firebaseConfig"
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth"

// Registrar usuário
export const registerUser = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password)
}

// Login
export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password)
}

// Logout
export const logoutUser = async () => {
  return await signOut(auth)
}
