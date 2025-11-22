import { useState } from "react"
import { registerUser } from "../services/authService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"

function Cadastro() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [olimpiada, setOlimpiada] = useState("OBMEP")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleCadastro = async (e) => {
    e.preventDefault()
    setErro("")
    setLoading(true)

    try {
      await registerUser(email, senha)
      navigate("/dashboard") // redireciona para a página inicial pós-login
    } catch (error) {
      console.error(error.code)
      if (error.code === "auth/email-already-in-use") {
        setErro("Este email já está cadastrado.")
      } else if (error.code === "auth/weak-password") {
        setErro("A senha deve ter pelo menos 6 caracteres.")
      } else if (error.code === "auth/invalid-email") {
        setErro("Email inválido.")
      } else {
        setErro("Erro ao criar conta. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex items-center justify-center bg-muted">
        <div className="text-center px-6">
          <img src="/Mat1.png" alt="Cadastro ilustrativo" className="max-w-xl mb-6" />
          <h2 className="text-2xl font-bold">Junte-se ao Mentor Olímpico!</h2>
          <p className="text-muted-foreground mt-2">Personalize seus estudos e conquiste medalhas.</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 border p-8 rounded-xl shadow-sm bg-white dark:bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Criar Conta</h1>
            <p className="text-sm text-muted-foreground">Comece sua jornada olímpica agora.</p>
          </div>

          <form onSubmit={handleCadastro} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" type="text" placeholder="Seu nome completo"
                value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Crie uma senha"
                value={senha} onChange={(e) => setSenha(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="olimpiada">Qual olimpíada você pretende estudar?</Label>
              <select id="olimpiada" className="bg-background border rounded px-3 py-2 w-full"
                value={olimpiada} onChange={(e) => setOlimpiada(e.target.value)}>
                <option value="OBMEP">OBMEP</option>
                <option value="OIMSF">OIMSF</option>
                <option value="OMIF">OMIF</option>
              </select>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          {erro && <p className="text-red-500 text-sm mt-3 text-center">{erro}</p>}

          <div className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cadastro
