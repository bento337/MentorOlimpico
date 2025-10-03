import { useEffect, useState } from "react"
import { auth } from "@/services/firebaseConfig"
import { onAuthStateChanged } from "firebase/auth"

function useAuth() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  return user
}

export default useAuth
