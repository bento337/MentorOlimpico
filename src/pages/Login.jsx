import { useState } from "react"
import { loginUser } from "../services/authService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"

function Login() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setErro("")
    setLoading(true)

    try {
      await loginUser(email, senha)
      navigate("/inicio") // redireciona para trilhas
    } catch (error) {
      console.error(error.code)
      if (error.code === "auth/user-not-found") {
        setErro("Usuário não encontrado.")
      } else if (error.code === "auth/wrong-password") {
        setErro("Senha incorreta.")
      } else if (error.code === "auth/invalid-email") {
        setErro("Email inválido.")
      } else {
        setErro("Erro ao fazer login. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Lado esquerdo – Ilustração / texto */}
      <div className="hidden md:flex items-center justify-center bg-muted">
        <div className="text-center px-6">
          <img src="/Mat2.png" alt="Login ilustrativo" className="max-w-lg mb-4" />
          <h2 className="text-2xl font-bold">Bem-vindo de volta!</h2>
          <p className="text-muted-foreground mt-2">Continue sua jornada olímpica com estratégia.</p>
        </div>
      </div>

      {/* Lado direito – Formulário */}
      <div className="flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 border p-8 rounded-xl shadow-sm bg-white dark:bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Entrar no Mentor Olímpico</h1>
            <p className="text-sm text-muted-foreground">Acesse sua conta e comece a estudar!</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="mb-3">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="mb-3">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Mensagem de erro */}
          {erro && <p className="text-red-500 text-sm mt-3 text-center">{erro}</p>}

          <div className="text-center text-sm text-muted-foreground mt-4">
            Ainda não tem uma conta?{" "}
            <Link to="/cadastro" className="text-primary hover:underline font-medium">
              Cadastre-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
