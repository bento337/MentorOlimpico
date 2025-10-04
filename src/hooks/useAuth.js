import { useEffect, useState } from "react"
import { auth } from "@/services/firebaseConfig"
import { onAuthStateChanged } from "firebase/auth"

function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return { user, loading }
}

export default useAuth