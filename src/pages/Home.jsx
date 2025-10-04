// src/pages/Home.jsx (COMPONENTE PRINCIPAL INTELIGENTE)
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useAuth from "@/hooks/useAuth"
import LandingPage from "./LandingPage"
import Dashboard from "./Dashboard"

function Home() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Se estiver carregando, mostra loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Renderiza a página correta baseada no status de autenticação
  return user ? <Dashboard /> : <LandingPage />
}

export default Home