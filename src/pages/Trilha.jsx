import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import Header from "@/components/Header"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { db } from "@/services/firebaseConfig"
import { collection, getDocs } from "firebase/firestore"

const CONFIG_OLIMPIADAS = {
  OBMEP: {
    titulo: "Olimpíada Brasileira de Matemática das Escolas Públicas",
    descricao: "A maior olimpíada acadêmica do Brasil, focada em raciocínio lógico e problemas desafiadores.",
    anos: "6º Ano EF ao 3º Ano EM",
    data: "Maio/Setembro (2 fases)",
    cores: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA46BE"]
  },
  OMIF: {
    titulo: "Olimpíada de Matemática das Instituições Federais", 
    descricao: "Voltada para estudantes de Institutos Federais, com foco em fundamentos teóricos.",
    anos: "1º Ano EM ao Técnico Integrado",
    data: "Agosto/Outubro (2 fases)",
    cores: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]
  },
  OIMSF: {
    titulo: "Olimpíada Internacional de Matemática Sem Fronteiras",
    descricao: "Competição internacional que incentiva trabalho em grupo e interdisciplinaridade.",
    anos: "6º Ano EF ao 3º Ano EM", 
    data: "Março/Abril (1 fase)",
    cores: ["#6A0572", "#AB83A1", "#3C91E6", "#A2D729", "#FF9F1C"]
  }
}

function Trilha() {
  const { id } = useParams()
  const [materias, setMaterias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const configOlimpiada = CONFIG_OLIMPIADAS[id?.toUpperCase()]

  useEffect(() => {
    const buscarMaterias = async () => {
      if (!id || !configOlimpiada) {
        setError("Olimpíada não encontrada")
        setLoading(false)
        return
      }

      try {
        console.log(`🔍 Buscando TODAS as matérias...`)
        
        const materiasRef = collection(db, "Materias")
        const querySnapshot = await getDocs(materiasRef)
        
        console.log(`✅ Total de documentos:`, querySnapshot.size)

        const todasMaterias = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          todasMaterias.push({
            id: doc.id,
            ...data
          })
        })

        // Filtragem no cliente
        const materiasFiltradas = todasMaterias.filter(materia => 
          materia.OLIMPIADAS && 
          Array.isArray(materia.OLIMPIADAS) && 
          materia.OLIMPIADAS.includes(id.toUpperCase())
        )

        // Ordena por importância (DECRESCENTE - maior importância primeiro)
        const materiasOrdenadas = materiasFiltradas.sort((a, b) => 
          (b.importancia || 0) - (a.importancia || 0)
        )

        console.log(`🎯 Matérias filtradas para ${id}:`, materiasOrdenadas)
        setMaterias(materiasOrdenadas)
        setError("")
        
      } catch (err) {
        console.error("❌ ERRO:", err)
        setError(`Erro ao carregar: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    buscarMaterias()
  }, [id, configOlimpiada])

  // 🌟 FUNÇÃO PARA FORMATAR TEMPO EM HORAS
  const formatarTempo = (tempo) => {
    if (!tempo) return "⏳ A definir"
    
    // Se já estiver em formato de horas (ex: "10h")
    if (typeof tempo === 'string' && tempo.includes('h')) {
      return tempo
    }
    
    // Se for número (horas)
    if (typeof tempo === 'number') {
      return `${tempo}h`
    }
    
    // Se for string com semanas, converte para horas
    if (typeof tempo === 'string') {
      if (tempo.includes('semana')) {
        const semanas = parseInt(tempo) || 1
        const horas = semanas * 10 // 10h por semana
        return `${horas}h (${semanas} ${semanas === 1 ? 'semana' : 'semanas'})`
      }
    }
    
    return tempo
  }

  // Dados do gráfico - baseado na IMPORTÂNCIA
  const pieData = materias.map((materia) => ({
    name: materia.nome,
    value: materia.importancia || 1,
  }))

  // 🌟 CALCULA TEMPO TOTAL DE ESTUDO
  const tempoTotal = materias.reduce((total, materia) => {
    if (materia.tempo && typeof materia.tempo === 'number') {
      return total + materia.tempo
    }
    return total
  }, 0)

  // 🌟 FUNÇÃO PARA RENDERIZAR LINKS
  const renderizarLinks = (titulo, emoji, links, tipo) => {
    if (!links || links.length === 0) return null

    return (
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          {emoji} {titulo}
          <Badge variant="outline" className="text-xs">
            {links.length} {links.length === 1 ? 'link' : 'links'}
          </Badge>
        </h4>
        <ul className="space-y-2 ml-2">
          {links.map((link, index) => (
            <li key={index}>
              <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center gap-2"
              >
                {tipo === 'site' && `Site teórico ${index + 1}`}
                {tipo === 'video' && `Videoaula ${index + 1}`}
                {tipo === 'exercicio' && `Lista de exercícios ${index + 1}`}
                {tipo === 'resolucao' && `Resolução ${index + 1}`}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (!configOlimpiada) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-center text-red-500 text-xl">Olimpíada "{id}" não encontrada</p>
          <p className="text-center text-muted-foreground mt-2">
            Olimpíadas disponíveis: OBMEP, OMIF, OIMSF
          </p>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Carregando matérias de {configOlimpiada.titulo}...</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">{configOlimpiada.titulo}</h1>
        <p className="text-muted-foreground mb-6">{configOlimpiada.descricao}</p>

        {/* Resumo da prova */}
        <section className="bg-muted/30 rounded-xl p-6 mb-10 shadow-sm border grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-2xl font-semibold mb-3">Plano de Estudos</h2>
            <p><strong>Tempo total estimado:</strong> {tempoTotal > 0 ? `${tempoTotal}h` : 'A calcular'}</p>
            <p><strong>Matérias:</strong> {materias.length} tópicos</p>
            <p><strong>Ordenado por:</strong> Importância</p>
            <p><strong>Período:</strong> {configOlimpiada.anos}</p>
            <p><strong>Data da prova:</strong> {configOlimpiada.data}</p>
          </div>
          
          {materias.length > 0 && (
            <div className="h-52">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={configOlimpiada.cores[index % configOlimpiada.cores.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      `Importância: ${value}/10`, 
                      name
                    ]}
                    labelFormatter={(name) => `📊 ${name}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Conteúdos */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Módulos de Estudo</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Ordenado por importância • {materias.length} {materias.length === 1 ? 'matéria' : 'matérias'}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-sm">
                🎯 {materias.length} matérias
              </Badge>
              {tempoTotal > 0 && (
                <Badge variant="secondary" className="text-sm">
                  ⏰ {tempoTotal}h total
                </Badge>
              )}
            </div>
          </div>
          
          {materias.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-lg font-semibold">Materiais em desenvolvimento</p>
              <p className="text-sm mt-2">Estamos preparando o conteúdo para {configOlimpiada.titulo}</p>
              <p className="text-xs mt-1">Volte em breve!</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {materias.map((materia, idx) => (
                <AccordionItem key={materia.id} value={`item-${materia.id}`} className="border rounded-lg">
                  <AccordionTrigger className="flex justify-between items-center hover:no-underline px-6 py-4">
                    <div className="flex items-center gap-4 text-left">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: configOlimpiada.cores[idx % configOlimpiada.cores.length] }}
                      />
                      <div>
                        <span className="font-medium text-lg">{materia.nome}</span>
                        <div className="flex gap-2 mt-1">
                          {/* Indicadores de importância */}
                          <Badge variant={
                            materia.importancia >= 8 ? "destructive" : 
                            materia.importancia >= 5 ? "default" : "secondary"
                          }>
                            🎯 {materia.importancia || 5}/10
                          </Badge>
                          
                          {/* Contadores de materiais */}
                          {materia.SITES && materia.SITES.length > 0 && (
                            <Badge variant="outline" className="text-xs">📘 {materia.SITES.length}</Badge>
                          )}
                          {materia.VIDEOS && materia.VIDEOS.length > 0 && (
                            <Badge variant="outline" className="text-xs">🎥 {materia.VIDEOS.length}</Badge>
                          )}
                          {materia.EXERCICIOS && materia.EXERCICIOS.length > 0 && (
                            <Badge variant="outline" className="text-xs">📝 {materia.EXERCICIOS.length}</Badge>
                          )}
                          {materia.RESOLUCOES && materia.RESOLUCOES.length > 0 && (
                            <Badge variant="outline" className="text-xs">🎬 {materia.RESOLUCOES.length}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                        ⏰ {formatarTempo(materia.tempo)}
                      </span>
                      <Badge variant={
                        materia.relevancia === "Alta" ? "destructive" : 
                        materia.relevancia === "Média" ? "default" : "secondary"
                      }>
                        {materia.relevancia}
                      </Badge>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-6 mt-4">
                      {/* Material Teórico - SITES */}
                      {renderizarLinks("Material Teórico", "📘", materia.SITES, 'site')}

                      {/* Videoaulas - VIDEOS */}
                      {renderizarLinks("Videoaulas", "🎥", materia.VIDEOS, 'video')}

                      {/* Exercícios - EXERCICIOS */}
                      {renderizarLinks("Lista de Exercícios", "📝", materia.EXERCICIOS, 'exercicio')}

                      {/* Resoluções - RESOLUCOES */}
                      {renderizarLinks("Resoluções em Vídeo", "🎬", materia.RESOLUCOES, 'resolucao')}

                      {/* Se não tiver nenhum material */}
                      {!materia.SITES && !materia.VIDEOS && !materia.EXERCICIOS && !materia.RESOLUCOES && (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>📝 Materiais em breve...</p>
                          <p className="text-sm mt-1">Estamos preparando o conteúdo para esta matéria</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </section>
      </div>
    </>
  )
}

export default Trilha