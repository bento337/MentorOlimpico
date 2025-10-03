import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from "@/components/Header"
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
import { Link } from "react-router-dom"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { auth, db } from "@/services/firebaseConfig" 
import { doc, setDoc } from "firebase/firestore"

function Configuracoes() {
  const user = auth.currentUser // ✅ Usando auth diretamente
  const [nome, setNome] = useState("")
  const [foto, setFoto] = useState("")
  const [preferencia, setPreferencia] = useState("OBMEP")
  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")

  const salvar = async (e) => {
    e.preventDefault()
    if (!user) {
      setErro("Usuário não autenticado.")
      return
    }

    try {
      await setDoc(doc(db, "usuarios", user.uid), {
        nome,
        foto,
        preferencia,
        email: user.email,
      })
      setMensagem("✅ Dados salvos com sucesso!")
      setErro("")
    } catch (err) {
      console.error(err)
      setMensagem("")
      setErro("❌ Erro ao salvar dados.")
    }
  }

  return (
    <>
      <Header />
    

    <div className="max-w-lg mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">Configurações da Conta</h1>

      <form onSubmit={salvar} className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
          />
        </div>

        <div>
          <Label htmlFor="foto">Foto de perfil (URL)</Label>
          <Input
            id="foto"
            value={foto}
            onChange={(e) => setFoto(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label htmlFor="preferencia">Preferência de Olimpíada</Label>
          <select
            id="preferencia"
            value={preferencia}
            onChange={(e) => setPreferencia(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="OBMEP">OBMEP</option>
            <option value="OMIF">OMIF</option>
            <option value="OIMSF">OIMSF</option>
          </select>
        </div>

        <Button type="submit" className="w-full">
          Salvar Alterações
        </Button>
      </form>

      {mensagem && <p className="text-center mt-4 text-sm text-green-600">{mensagem}</p>}
      {erro && <p className="text-center mt-4 text-sm text-red-600">{erro}</p>}
    </div>

    </>  
  )
}

export default Configuracoes