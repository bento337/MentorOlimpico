import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/Header"
import { Link, useNavigate } from "react-router-dom"
import { auth } from "@/services/firebaseConfig"
import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/services/firebaseConfig"
import { format } from "date-fns"
import { CalendarIcon, Clock, Eye, Trash2, Plus } from "lucide-react"  

// Configuração das olimpíadas para exibir no dashboard
const CONFIG_OLIMPIADAS = {
  OBMEP: {
    titulo: "OBMEP",
    descricao: "Olimpíada Brasileira de Matemática das Escolas Públicas",
    cor: "bg-blue-500"
  },
  OMIF: {
    titulo: "OMIF", 
    descricao: "Olimpíada de Matemática das Instituições Federais",
    cor: "bg-green-500"
  },
  OIMSF: {
    titulo: "OIMSF",
    descricao: "Olimpíada Internacional de Matemática Sem Fronteiras",
    cor: "bg-purple-500"
  }
}

function Dashboard() {
  const user = auth.currentUser
  const navigate = useNavigate()
  const [cronogramasSalvos, setCronogramasSalvos] = useState([])

  // Carrega cronogramas salvos do usuário
  useEffect(() => {
    if (!user) {
      setCronogramasSalvos([])
      return
    }

    const cronogramasRef = collection(db, "cronogramas")
    const q = query(cronogramasRef, where("userId", "==", user.uid))
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const cronogramas = []
        snapshot.forEach((doc) => {
          cronogramas.push({
            id: doc.id,
            ...doc.data()
          })
        })
        setCronogramasSalvos(cronogramas)
      },
      (error) => {
        console.error("Erro ao carregar cronogramas:", error)
      }
    )

    return () => unsubscribe()
  }, [user])

  // Função para excluir cronograma
  const excluirCronograma = async (cronogramaId) => {
    try {
      await deleteDoc(doc(db, "cronogramas", cronogramaId))
    } catch (error) {
      console.error("Erro ao excluir cronograma:", error)
      alert("❌ Erro ao excluir cronograma")
    }
  }

  const carregarCronograma = (cronograma) => {
    // Garante que as datas sejam objetos Date válidos
    const cronogramaProcessado = {
      ...cronograma,
      dataInicio: cronograma.dataInicio?.toDate ? cronograma.dataInicio.toDate() : cronograma.dataInicio,
      dataProva: cronograma.dataProva?.toDate ? cronograma.dataProva.toDate() : cronograma.dataProva,
      dataCriacao: cronograma.dataCriacao?.toDate ? cronograma.dataCriacao.toDate() : cronograma.dataCriacao,
      semanas: cronograma.semanas?.map(semana => ({
        ...semana,
        dataInicio: semana.dataInicio?.toDate ? semana.dataInicio.toDate() : semana.dataInicio,
        dataFim: semana.dataFim?.toDate ? semana.dataFim.toDate() : semana.dataFim
      })) || []
    }

    // Salva na sessionStorage como fallback
    sessionStorage.setItem('cronogramaCarregado', JSON.stringify(cronogramaProcessado))

    navigate('/cronograma', { 
      state: { 
        cronogramaCarregado: cronogramaProcessado 
      } 
    })
  }

  return (
    <>
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-4 text-center">Bem-vindo ao Mentor Olímpico!</h1>
        <p className="text-muted-foreground mb-8 text-center">
          {user ? `Olá, ${user.email}!` : "Carregando..."} <br />
          Aqui você encontrará suas trilhas de estudo, cronogramas e recomendações.
        </p>

        {/* Ações principais */}
        <div className="flex justify-center gap-4 mb-12">
          <Button asChild><Link to="/trilhas">Minhas Trilhas</Link></Button>
          <Button variant="outline" asChild><Link to="/configuracoes">Configurações</Link></Button>
        </div>

        {/* Seção de cronogramas */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Seus Cronogramas</h2>
            <Button asChild>
              <Link to="/cronogramas" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Cronograma
              </Link>
            </Button>
          </div>
          
          {cronogramasSalvos.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* // No Dashboard, substitua o Card do cronograma por este: */}
          {cronogramasSalvos.slice(0, 6).map((cronograma) => (
            <Card 
              key={cronograma.id}
              className="relative group hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="flex-1 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => carregarCronograma(cronograma)}
                  >
                    <div className="font-medium text-lg">{cronograma.titulo}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(cronograma.dataCriacao?.toDate?.() || cronograma.dataCriacao, "dd/MM/yyyy")}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Tem certeza que deseja excluir o cronograma "${cronograma.titulo}"?`)) {
                        excluirCronograma(cronograma.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {cronograma.semanas?.length} semanas
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {cronograma.horasPorSemana}h/semana
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {CONFIG_OLIMPIADAS[cronograma.olimpiada]?.titulo || cronograma.olimpiada}
                  </Badge>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation() // Importante: previne que o clique propague para o elemento pai
                      carregarCronograma(cronograma)
                    }}
                    className="text-xs"
                  >
                    Abrir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum cronograma criado</h3>
                <p className="text-muted-foreground mb-4">
                  Crie seu primeiro cronograma personalizado para começar seus estudos organizados.
                </p>
                <Button asChild>
                  <Link to="/cronogramas" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Cronograma
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Trilhas recomendadas */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Recomendações para você</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg shadow-sm bg-white dark:bg-background">
              <h3 className="font-bold">OBMEP</h3>
              <p className="text-sm text-muted-foreground mb-3">Matemática para todos os níveis.</p>
              <Button asChild size="sm"><Link to="/trilhas/obmep">Continuar</Link></Button>
            </div>
            <div className="p-6 border rounded-lg shadow-sm bg-white dark:bg-background">
              <h3 className="font-bold">OMIF</h3>
              <p className="text-sm text-muted-foreground mb-3">Iniciação científica no ensino médio.</p>
              <Button asChild size="sm"><Link to="/trilhas/omif">Explorar</Link></Button>
            </div>
            <div className="p-6 border rounded-lg shadow-sm bg-white dark:bg-background">
              <h3 className="font-bold">OIMSF</h3>
              <p className="text-sm text-muted-foreground mb-3">Matemática sem fronteiras.</p>
              <Button asChild size="sm"><Link to="/trilhas/oimsf">Explorar</Link></Button>
            </div>
          </div>
        </section>

        {/* Motivação */}
        <section className="text-center mt-16">
          <blockquote className="italic text-muted-foreground">
            “A preparação transforma o talento em conquista.”
          </blockquote>
        </section>
      </div>
    </>
  )
}

export default Dashboard


