import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Header from "@/components/Header"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { auth, db, storage } from "@/services/firebaseConfig" 
import { doc, setDoc, getDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { updatePassword, updateProfile, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { Camera, Save, Shield, Bell, User, BookOpen, Trash2 } from "lucide-react"

function Configuracoes() {
  const user = auth.currentUser
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [fotoLoading, setFotoLoading] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")
  
  // Estados dos dados do usuário
  const [dadosUsuario, setDadosUsuario] = useState({
    nome: "",
    bio: "",
    escola: "",
    serie: "",
    preferencias: {
      olimpiadaFavorita: "OBMEP",
      nivel: "iniciante",
      notificacoes: true,
      emailMarketing: false
    },
    foto: "",
    metas: {
      horasEstudo: 10,
      olimpiadaAlvo: "OBMEP"
    }
  })

  // Estados para segurança
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")

  // Carrega dados existentes do usuário
  useEffect(() => {
    const carregarDados = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "usuarios", user.uid))
          if (userDoc.exists()) {
            const dados = userDoc.data()
            setDadosUsuario(prev => ({
              ...prev,
              ...dados,
              preferencias: { ...prev.preferencias, ...dados.preferencias },
              metas: { ...prev.metas, ...dados.metas }
            }))
          }
        } catch (err) {
          console.error("Erro ao carregar dados:", err)
          setErro("Erro ao carregar dados do usuário.")
        }
      }
    }
    carregarDados()
  }, [user])

  //   FUNÇÃO PARA ABRIR O SELETOR DE ARQUIVOS
  const abrirSeletorArquivos = () => {
    fileInputRef.current?.click()
  }

  //   FUNÇÃO PARA UPLOAD DE FOTO
  const handleFotoUpload = async (event) => {
    const file = event.target.files[0]
    console.log("📁 Arquivo selecionado:", file)
    
    if (!file || !user) {
      console.log("❌ Arquivo ou usuário não encontrado")
      return
    }

    // Verifica se é imagem
    if (!file.type.startsWith('image/')) {
      setErro("Por favor, selecione uma imagem válida (PNG, JPG, JPEG).")
      return
    }

    console.log("✅ Arquivo é uma imagem:", file.type)

    // Verifica tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErro("A imagem deve ter menos de 5MB.")
      return
    }

    console.log("✅ Tamanho do arquivo OK:", file.size)

    setFotoLoading(true)
    try {
      console.log("🟡 Iniciando upload...")
      
      // Cria referência no Storage
      const fotoRef = ref(storage, `profile-pictures/${user.uid}/${Date.now()}-${file.name}`)
      console.log("📤 Referência criada:", fotoRef.fullPath)

      // Faz upload
      console.log("🟡 Fazendo upload...")
      const snapshot = await uploadBytes(fotoRef, file)
      console.log("✅ Upload completo:", snapshot)

      // Pega URL de download
      console.log("🟡 Obtendo URL...")
      const downloadURL = await getDownloadURL(snapshot.ref)
      console.log("✅ URL obtida:", downloadURL)

      // Atualiza estado LOCALMENTE primeiro (para mostrar a foto imediatamente)
      setDadosUsuario(prev => ({
        ...prev,
        foto: downloadURL
      }))

      // Salva no Firestore
      console.log("🟡 Salvando no Firestore...")
      await setDoc(doc(db, "usuarios", user.uid), {
        ...dadosUsuario,
        foto: downloadURL
      }, { merge: true })
      console.log("✅ Firestore atualizado")
      
      // Atualiza também no auth profile
      console.log("🟡 Atualizando perfil do auth...")
      await updateProfile(user, {
        photoURL: downloadURL
      })
      console.log("✅ Perfil do auth atualizado")

      setMensagem("✅ Foto de perfil atualizada com sucesso!")
      setErro("")
      
      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      event.target.value = ""
      
    } catch (err) {
      console.error("🔴 ERRO DETALHADO:", err)
      console.error("🔴 Código do erro:", err.code)
      console.error("🔴 Mensagem:", err.message)
      setErro(`❌ Erro ao fazer upload: ${err.message}`)
    } finally {
      setFotoLoading(false)
    }
  }

  //   FUNÇÃO PARA REMOVER FOTO
  const removerFoto = async () => {
    if (!user || !dadosUsuario.foto) return

    setFotoLoading(true)
    try {
      // Tenta deletar do Storage (se a URL for do Storage)
      if (dadosUsuario.foto.includes('firebasestorage.googleapis.com')) {
        const fotoRef = ref(storage, dadosUsuario.foto)
        await deleteObject(fotoRef)
      }

      // Atualiza estado LOCALMENTE primeiro
      setDadosUsuario(prev => ({
        ...prev,
        foto: ""
      }))

      // Atualiza Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        ...dadosUsuario,
        foto: ""
      }, { merge: true })

      // Remove do auth profile
      await updateProfile(user, {
        photoURL: null
      })

      setMensagem("✅ Foto removida com sucesso!")
      setErro("")
    } catch (err) {
      console.error("Erro ao remover foto:", err)
      // Mesmo se der erro no Storage, remove do estado local
      setDadosUsuario(prev => ({
        ...prev,
        foto: ""
      }))
      setErro("❌ Erro ao remover foto, mas foi removida localmente.")
    } finally {
      setFotoLoading(false)
    }
  }

  //   FUNÇÃO PARA SALVAR DADOS GERAIS
  const salvarDadosGerais = async (e) => {
    e.preventDefault()
    if (!user) {
      setErro("Usuário não autenticado.")
      return
    }

    setLoading(true)
    try {
      await setDoc(doc(db, "usuarios", user.uid), dadosUsuario, { merge: true })
      setMensagem("✅ Dados salvos com sucesso!")
      setErro("")
    } catch (err) {
      console.error("Erro ao salvar:", err)
      setErro("❌ Erro ao salvar dados.")
    } finally {
      setLoading(false)
    }
  }

  //   FUNÇÃO PARA ALTERAR SENHA
  const alterarSenha = async (e) => {
    e.preventDefault()
    if (!user) {
      setErro("Usuário não autenticado.")
      return
    }

    if (!senhaAtual || !novaSenha) {
      setErro("Preencha todos os campos de senha.")
      return
    }

    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres.")
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.")
      return
    }

    setLoading(true)
    try {
      // Reautentica o usuário
      const credential = EmailAuthProvider.credential(user.email, senhaAtual)
      await reauthenticateWithCredential(user, credential)
      
      // Atualiza a senha
      await updatePassword(user, novaSenha)
      
      setMensagem("✅ Senha alterada com sucesso!")
      setSenhaAtual("")
      setNovaSenha("")
      setConfirmarSenha("")
      setErro("")
    } catch (err) {
      console.error("Erro ao alterar senha:", err)
      if (err.code === 'auth/wrong-password') {
        setErro("❌ Senha atual incorreta.")
      } else if (err.code === 'auth/weak-password') {
        setErro("❌ A senha é muito fraca.")
      } else {
        setErro("❌ Erro ao alterar senha.")
      }
    } finally {
      setLoading(false)
    }
  }

  //   ATUALIZAÇÃO DE CAMPOS INDIVIDUAIS
  const atualizarCampo = (campo, valor) => {
    setDadosUsuario(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  const atualizarPreferencia = (campo, valor) => {
    setDadosUsuario(prev => ({
      ...prev,
      preferencias: {
        ...prev.preferencias,
        [campo]: valor
      }
    }))
  }

  const atualizarMeta = (campo, valor) => {
    setDadosUsuario(prev => ({
      ...prev,
      metas: {
        ...prev.metas,
        [campo]: valor
      }
    }))
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-red-500 text-center">Usuário não autenticado</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
    
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Configurações da Conta</h1>
          <p className="text-muted-foreground mt-2">Gerencie suas informações e preferências</p>
        </div>

        {/* Seção Perfil */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Perfil</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Foto de Perfil */}
            <div className="flex-shrink-0">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24 border-2">
                  <AvatarImage src={dadosUsuario.foto} />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {dadosUsuario.nome ? dadosUsuario.nome.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFotoUpload}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    disabled={fotoLoading} 
                    className="gap-2"
                    onClick={abrirSeletorArquivos}
                  >
                    <Camera className="h-4 w-4" />
                    {fotoLoading ? "Carregando..." : "Alterar Foto"}
                  </Button>
                  
                  {dadosUsuario.foto && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={removerFoto}
                      disabled={fotoLoading}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </Button>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  PNG, JPG até 5MB
                </p>
              </div>
            </div>

            {/* Formulário de Dados */}
            <div className="flex-1 grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={dadosUsuario.nome}
                  onChange={(e) => atualizarCampo('nome', e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="escola">Escola</Label>
                <Input
                  id="escola"
                  value={dadosUsuario.escola}
                  onChange={(e) => atualizarCampo('escola', e.target.value)}
                  placeholder="Nome da sua escola"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serie">Série/Ano</Label>
                <select
                  id="serie"
                  value={dadosUsuario.serie}
                  onChange={(e) => atualizarCampo('serie', e.target.value)}
                  className="border rounded px-3 py-2 w-full bg-background"
                >
                  <option value="">Selecione</option>
                  <option value="6ano">6º Ano EF</option>
                  <option value="7ano">7º Ano EF</option>
                  <option value="8ano">8º Ano EF</option>
                  <option value="9ano">9º Ano EF</option>
                  <option value="1ano">1º Ano EM</option>
                  <option value="2ano">2º Ano EM</option>
                  <option value="3ano">3º Ano EM</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="olimpiadaFavorita">Olimpíada Favorita</Label>
                <select
                  id="olimpiadaFavorita"
                  value={dadosUsuario.preferencias.olimpiadaFavorita}
                  onChange={(e) => atualizarPreferencia('olimpiadaFavorita', e.target.value)}
                  className="border rounded px-3 py-2 w-full bg-background"
                >
                  <option value="OBMEP">OBMEP</option>
                  <option value="OMIF">OMIF</option>
                  <option value="OIMSF">OIMSF</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={dadosUsuario.bio}
                  onChange={(e) => atualizarCampo('bio', e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção Metas de Estudo */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Metas de Estudo</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="horasEstudo">Horas de estudo por semana</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="horasEstudo"
                  type="number"
                  min="1"
                  max="40"
                  value={dadosUsuario.metas.horasEstudo}
                  onChange={(e) => atualizarMeta('horasEstudo', parseInt(e.target.value) || 1)}
                />
                <span className="text-sm text-muted-foreground">horas</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="olimpiadaAlvo">Olimpíada Principal</Label>
              <select
                id="olimpiadaAlvo"
                value={dadosUsuario.metas.olimpiadaAlvo}
                onChange={(e) => atualizarMeta('olimpiadaAlvo', e.target.value)}
                className="border rounded px-3 py-2 w-full bg-background"
              >
                <option value="OBMEP">OBMEP</option>
                <option value="OMIF">OMIF</option>
                <option value="OIMSF">OIMSF</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seção Preferências */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Preferências</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notificacoes" className="font-medium">Notificações por email</Label>
                <p className="text-sm text-muted-foreground">Receba lembretes de estudo e novidades</p>
              </div>
              <Switch
                id="notificacoes"
                checked={dadosUsuario.preferencias.notificacoes}
                onCheckedChange={(checked) => atualizarPreferencia('notificacoes', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailMarketing" className="font-medium">Email marketing</Label>
                <p className="text-sm text-muted-foreground">Receba dicas e materiais exclusivos</p>
              </div>
              <Switch
                id="emailMarketing"
                checked={dadosUsuario.preferencias.emailMarketing}
                onCheckedChange={(checked) => atualizarPreferencia('emailMarketing', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivel">Nível de Conhecimento</Label>
              <select
                id="nivel"
                value={dadosUsuario.preferencias.nivel}
                onChange={(e) => atualizarPreferencia('nivel', e.target.value)}
                className="border rounded px-3 py-2 w-full bg-background"
              >
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seção Segurança */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Segurança</h2>
          </div>

          <form onSubmit={alterarSenha} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senhaAtual">Senha Atual *</Label>
                <Input
                  id="senhaAtual"
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="Sua senha atual"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova Senha *</Label>
                <Input
                  id="novaSenha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Digite novamente"
                />
              </div>
            </div>

            <Button type="submit" variant="outline" disabled={loading}>
              {loading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </form>
        </div>

        {/* Botão Salvar Tudo */}
        <div className="flex justify-end">
          <Button 
            onClick={salvarDadosGerais} 
            disabled={loading}
            className="gap-2"
            size="lg"
          >
            <Save className="h-4 w-4" />
            {loading ? "Salvando..." : "Salvar Todas as Alterações"}
          </Button>
        </div>

        {/* Mensagens */}
        {mensagem && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{mensagem}</p>
          </div>
        )}
        
        {erro && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{erro}</p>
          </div>
        )}
      </div>
    </>  
  )
}

export default Configuracoes