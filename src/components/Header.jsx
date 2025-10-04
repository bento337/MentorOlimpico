// src/components/Header.jsx (ATUALIZADO)
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Link, useNavigate } from "react-router-dom"
import { ThemeToggle } from "@/components/ThemeToggle"
import { auth, db } from "@/services/firebaseConfig"
import { signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import useAuth from "@/hooks/useAuth"

function Header() {
  const { user } = useAuth() // ⭐ Agora usando o hook correto
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userData, setUserData] = useState(null)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  // ⭐ FUNÇÃO IMPORTANTE: Define para onde o logo redireciona
  const getHomePath = () => {
    return user ? "/" : "/" // Ambos vão para "/" mas o componente Home decide o que mostrar
  }

  // Carrega dados do usuário do Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data())
        } else {
          // cria automaticamente se não existir
          await setDoc(doc(db, "usuarios", user.uid), {
            nome: user.email.split('@')[0],
            email: user.email,
            preferencia: "OBMEP",
            dataCriacao: new Date()
          })
        }
      }
    }
    loadUserData()
  }, [user])

  // Fecha o dropdown quando clica fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/")
      setIsDropdownOpen(false)
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  // Função para obter o nome do usuário
  const getUserName = () => {
    if (userData && userData.nome) {
      return userData.nome
    }
    
    if (!user || !user.email) return "Usuário"
    
    const email = user.email
    const namePart = email.split('@')[0]
    return namePart.charAt(0).toUpperCase() + namePart.slice(1)
  }

  // Função para obter a inicial do nome
  const getUserInitial = () => {
    const name = getUserName()
    return name.charAt(0).toUpperCase()
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <header className="w-full border-b px-6 py-4 flex items-center justify-between bg-background shadow-sm">
      {/* Logo - Agora redireciona inteligentemente */}
      <div className="flex-1">
        <Link to={getHomePath()}>
          <img src="/Logo_Branca_Final.png" alt="Mentor Olímpico" className="h-12 hidden dark:block" />
          <img src="/Logo_Preta_Final.png" alt="Mentor Olímpico" className="h-12 dark:hidden" />
        </Link>
      </div>

      {/* Resto do código do header permanece igual */}
      <div className="flex-1 flex justify-center">
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-6">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-muted-foreground font-bold">Trilhas</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="p-4 grid gap-3 w-[200px]">
                  <li><Link to="/trilhas/obmep" className="text-muted-foreground hover:text-foreground font-semibold transition-colors">OBMEP</Link></li>
                  <li><Link to="/trilhas/omif" className="text-muted-foreground hover:text-foreground font-semibold transition-colors">OMIF</Link></li>
                  <li><Link to="/trilhas/oimsf" className="text-muted-foreground hover:text-foreground font-semibold transition-colors">OIMSF</Link></li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="#cronogramas" className="hover:text-primary font-bold transition-colors">Cronogramas</Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/quemsomos" className="hover:text-primary font-bold transition-colors">Quem Somos</Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Lado direito - autenticação */}
      <div className="flex-1 flex justify-end items-center gap-3">
        <ThemeToggle />
        
        {user ? (
          // Usuário LOGADO
          <div className="relative">
            <button
              ref={buttonRef}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={toggleDropdown}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                {getUserInitial()}
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {getUserName()}
              </span>
            </button>

            {isDropdownOpen && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 top-full mt-2 w-48 bg-background border rounded-lg shadow-lg py-2 z-50"
              >
                <Link 
                  to="/configuracoes" 
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  ⚙️ Configurações
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-muted transition-colors text-red-600"
                >
                  🚪 Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          // Usuário NÃO LOGADO
          <>
            <Button variant="outline" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/cadastro">Criar Conta</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  )
}

export default Header