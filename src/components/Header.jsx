import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { Link, useNavigate } from "react-router-dom"
import { ThemeToggle } from "@/components/ThemeToggle"
import { auth, db } from "@/services/firebaseConfig"
import { signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

function Header() {
  const user = auth.currentUser
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userData, setUserData] = useState(null)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  // Carrega dados do usuário do Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "usuarios", user.uid))
          if (userDoc.exists()) {
            setUserData(userDoc.data())
          }
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error)
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
      {/* Logo */}
      <div className="flex-1">
        <Link to="/">
          <img src="/Logo_Branca_Final.png" alt="Mentor Olímpico" className="h-12 hidden dark:block" />
          <img src="/Logo_Preta_Final.png" alt="Mentor Olímpico" className="h-12 dark:hidden" />
        </Link>
      </div>

      {/* Navegação */}
      <div className="flex-1 flex justify-center">
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-6">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-muted-foreground font-bold">Trilhas</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="p-4 grid gap-3 w-[200px]">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/trilhas/obmep" className="text-muted-foreground hover:text-foreground font-semibold transition-colors">OBMEP</Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/trilhas/omif" className="text-muted-foreground hover:text-foreground font-semibold transition-colors">OMIF</Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/trilhas/oimsf" className="text-muted-foreground hover:text-foreground font-semibold transition-colors">OIMSF</Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="#cronogramas" className="hover:text-primary font-bold transition-colors">Cronogramas</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/quemsomos" className="hover:text-primary font-bold transition-colors">Quem Somos</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Lado direito - muda conforme autenticação */}
      <div className="flex-1 flex justify-end items-center gap-3">
        <ThemeToggle />
        
        {user ? (
          // Usuário LOGADO - mostra avatar com dropdown
          <div className="relative">
            <button
              ref={buttonRef}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={toggleDropdown}
              onMouseEnter={() => setIsDropdownOpen(true)}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                {getUserInitial()}
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {getUserName()}
              </span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 top-full mt-2 w-48 bg-background border rounded-lg shadow-lg py-2 z-50"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <Link 
                  to="/configuracoes" 
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configurações
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-muted transition-colors text-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          // Usuário NÃO LOGADO - mostra botões de login/cadastro
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