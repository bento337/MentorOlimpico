// src/pages/Cronograma.jsx
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import Header from "@/components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, Clock, BookOpen, CheckCircle2, ArrowLeft, Download, Edit } from "lucide-react"
import { format, addWeeks, addDays, differenceInWeeks, differenceInDays, isBefore, isAfter } from "date-fns"
import { ptBR } from "date-fns/locale"
import { jsPDF } from "jspdf"

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

function Cronograma() {
  const location = useLocation()
  const navigate = useNavigate()
  const [cronograma, setCronograma] = useState(null)
  const [materiaSelecionada, setMateriaSelecionada] = useState(null)
  const [dialogAberto, setDialogAberto] = useState(false)

  // Carrega o cronograma do state de navegação
  useEffect(() => {
    if (location.state?.cronogramaCarregado) {
      setCronograma(location.state.cronogramaCarregado)
    } else {
      // Se não veio pelo state, redireciona para dashboard
      navigate("/")
    }
  }, [location.state, navigate])

  // FUNÇÃO PARA CALCULAR PROGRESSO
  const calcularProgresso = () => {
    if (!cronograma?.semanas || cronograma.semanas.length === 0) return 0
    
    const hoje = new Date()
    const primeiraSemana = cronograma.semanas[0]?.dataInicio?.toDate?.() || cronograma.semanas[0]?.dataInicio
    const ultimaSemana = cronograma.semanas[cronograma.semanas.length - 1]?.dataFim?.toDate?.() || cronograma.semanas[cronograma.semanas.length - 1]?.dataFim

    if (!primeiraSemana || !ultimaSemana) return 0
    if (isBefore(hoje, primeiraSemana)) return 0
    if (isAfter(hoje, ultimaSemana)) return 100

    const totalDias = differenceInDays(ultimaSemana, primeiraSemana)
    const diasPassados = differenceInDays(hoje, primeiraSemana)
    
    return Math.min(100, Math.max(0, (diasPassados / totalDias) * 100))
  }

  // FUNÇÃO PARA EXPORTAR O PDF DO CRONOGRAMA
  const exportarPDF = () => {
    if (!cronograma || !cronograma.semanas || cronograma.semanas.length === 0) {
      alert("Cronograma não disponível para exportação!")
      return
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let y = margin
    const olimpiada = CONFIG_OLIMPIADAS[cronograma.olimpiada]

    // Configurar fonte padrão
    doc.setFont("helvetica")
    doc.setFontSize(10)

    // ======= CABEÇALHO =======
    doc.setFillColor(30, 64, 175)
    doc.rect(0, 0, pageWidth, 50, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.text("CRONOGRAMA DE ESTUDOS", pageWidth / 2, 20, { align: "center" })
    doc.setFontSize(14)
    doc.text(olimpiada?.titulo || cronograma.olimpiada, pageWidth / 2, 32, { align: "center" })
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, pageWidth / 2, 42, { align: "center" })

    y = 60

    // ======= INFORMAÇÕES GERAIS =======
    const dataInicioCronograma = cronograma.dataInicio?.toDate?.() || cronograma.dataInicio
    const dataProvaCronograma = cronograma.dataProva?.toDate?.() || cronograma.dataProva
    
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("INFORMAÇÕES DO PLANO DE ESTUDO", margin, y)
    y += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    const infos = [
      `Período: ${format(dataInicioCronograma, "dd/MM/yyyy")} - ${format(dataProvaCronograma, "dd/MM/yyyy")}`,
      `Horas por semana: ${cronograma.horasPorSemana}h`,
      `Total de semanas: ${cronograma.semanas.length}`,
      `Total de matérias: ${cronograma.semanas.reduce((t, s) => t + s.materias.length, 0)}`,
      `Horas totais: ${cronograma.semanas.reduce((t, s) => t + s.totalHoras, 0)}h`
    ]
    
    infos.forEach((txt) => {
      doc.text(txt, margin + 5, y)
      y += 5
    })
    y += 8

    // ======= DETALHAMENTO =======
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("CRONOGRAMA DETALHADO", margin, y)
    y += 10

    // ======= LOOP DE SEMANAS =======
    cronograma.semanas.forEach((semana, idx) => {
      if (y > pageHeight - 60) { 
        doc.addPage(); 
        y = margin 
      }

      // Cabeçalho da semana
      doc.setFillColor(240, 248, 255)
      doc.rect(margin, y - 4, pageWidth - 2 * margin, 14, "F")
      doc.setDrawColor(59, 130, 246)
      doc.rect(margin, y - 4, pageWidth - 2 * margin, 14)
      
      doc.setFontSize(12)
      doc.setTextColor(0)
      doc.setFont("helvetica", "bold")
      doc.text(`SEMANA ${semana.semana}`, margin + 4, y + 4)
      
      const dataInicioSemana = semana.dataInicio?.toDate?.() || semana.dataInicio
      const dataFimSemana = semana.dataFim?.toDate?.() || semana.dataFim
      
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text(`${format(dataInicioSemana, "dd/MM/yyyy")} - ${format(dataFimSemana, "dd/MM/yyyy")}`, margin + 50, y + 4)
      doc.text(`${semana.totalHoras}h`, pageWidth - margin - 10, y + 4, { align: "right" })

      y += 18

      // ======= MATÉRIAS =======
      semana.materias.forEach((materia) => {
        if (y > pageHeight - 80) { 
          doc.addPage(); 
          y = margin 
        }

        // Cabeçalho da matéria
        doc.setDrawColor(200, 200, 200)
        doc.setFillColor(248, 250, 252)
        doc.rect(margin + 5, y, pageWidth - 2 * margin - 10, 10, "F")
        doc.rect(margin + 5, y, pageWidth - 2 * margin - 10, 10)
        
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.setTextColor(30, 30, 30)
        doc.text(`${materia.nome}`, margin + 8, y + 7)
        
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.text(`${materia.tempoAjustado || materia.tempo}h • ${materia.relevancia}`, pageWidth - margin - 10, y + 7, { align: "right" })
        
        y += 14

        // Função utilitária para imprimir seção de materiais (sem emojis)
        const printSection = (titulo, cor, lista, prefixo) => {
          if (!lista || lista.length === 0) return
          if (y > pageHeight - 40) { 
            doc.addPage(); 
            y = margin 
          }

          doc.setFont("helvetica", "bold")
          doc.setFontSize(9)
          doc.setTextColor(...cor)
          doc.text(`${titulo}`, margin + 10, y)
          y += 5
          
          doc.setFont("helvetica", "normal")
          doc.setFontSize(8)
          doc.setTextColor(0, 0, 0)
          
          lista.forEach((url, i) => {
            if (y > pageHeight - 20) { 
              doc.addPage(); 
              y = margin 
            }
            
            // Encurta o URL para caber melhor
            const urlShort = url.length > 70 ? url.substring(0, 70) + "..." : url
            doc.setTextColor(0, 0, 255)
            doc.textWithLink(`${prefixo} ${i + 1}. ${urlShort}`, margin + 15, y, { url })
            doc.setTextColor(0, 0, 0)
            y += 4
          })
          y += 4
        }

        // Imprime cada seção de materiais (usando prefixos em texto)
        printSection("MATERIAIS DE TEORIA", [30, 64, 175], materia.SITES, "Teoria")
        printSection("VIDEOAULAS", [220, 38, 127], materia.VIDEOS, "Videoaula")
        printSection("EXERCÍCIOS", [34, 197, 94], materia.EXERCICIOS, "Exercício")
        printSection("RESOLUÇÕES", [168, 85, 247], materia.RESOLUCOES, "Resolução")

        y += 6
      })

      y += 8
    })

    // ======= RESUMO FINAL =======
    if (y > pageHeight - 40) {
      doc.addPage()
      y = margin
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text("RESUMO DO CRONOGRAMA", margin, y)
    y += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    const totalHoras = cronograma.semanas.reduce((t, s) => t + s.totalHoras, 0)
    const totalMaterias = cronograma.semanas.reduce((t, s) => t + s.materias.length, 0)
    const eficiencia = Math.round((totalHoras / (cronograma.semanas.length * cronograma.horasPorSemana)) * 100)
    
    const resumo = [
      `• Total de semanas: ${cronograma.semanas.length}`,
      `• Total de matérias: ${totalMaterias}`,
      `• Horas totais de estudo: ${totalHoras}h`,
      `• Média de horas por semana: ${Math.round(totalHoras / cronograma.semanas.length)}h`,
      `• Eficiência de alocação: ${eficiencia}%`
    ]

    resumo.forEach((txt) => {
      doc.text(txt, margin + 5, y)
      y += 4
    })

    // ======= RODAPÉ =======
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(
        `Página ${i} de ${totalPages} • Mentor Olímpico • ${olimpiada?.titulo || cronograma.olimpiada}`,
        pageWidth / 2, 
        pageHeight - 10, 
        { align: "center" }
      )
    }

    doc.save(`cronograma-${cronograma.olimpiada}-${format(new Date(), "dd-MM-yyyy")}.pdf`)
  }

  // FUNÇÃO PARA ABRIR DETALHES DA MATÉRIA
  const abrirDetalhesMateria = (materia) => {
    setMateriaSelecionada(materia)
    setDialogAberto(true)
  }

  if (!cronograma) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-red-500 text-xl">Cronograma não encontrado</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Voltar para o Dashboard
            </Button>
          </div>
        </div>
      </>
    )
  }

  const progresso = calcularProgresso()
  const olimpiada = CONFIG_OLIMPIADAS[cronograma.olimpiada]

  return (
    <>
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{cronograma.titulo || `Cronograma ${olimpiada?.titulo}`}</h1>
              <p className="text-muted-foreground">
                Criado em {format(cronograma.dataCriacao?.toDate?.() || cronograma.dataCriacao, "dd/MM/yyyy")}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportarPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
            <Button onClick={() => navigate("/cronogramas")} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Criar Novo
            </Button>
          </div>
        </div>

        {/* Informações do Cronograma */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-muted-foreground">Olimpíada</div>
                <div className="font-semibold flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${olimpiada?.cor}`} />
                  {olimpiada?.titulo || cronograma.olimpiada}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Período</div>
                <div className="font-semibold">
                  {format(cronograma.dataInicio?.toDate?.() || cronograma.dataInicio, "dd/MM/yyyy")} - {format(cronograma.dataProva?.toDate?.() || cronograma.dataProva, "dd/MM/yyyy")}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Horas/Semana</div>
                <div className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {cronograma.horasPorSemana}h
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Semanas</div>
                <div className="font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {cronograma.semanas?.length || 0} semanas
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Barra de Progresso */}
        <div className="bg-muted p-4 rounded-lg mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium">
                {progresso.toFixed(0)}% do tempo decorrido
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {format(new Date(), "dd/MM/yyyy")}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progresso}%` }}
            ></div>
          </div>
        </div>

        {/* Lista de Semanas */}
        <div className="space-y-6">
          {cronograma.semanas?.map((semana, index) => {
            const hoje = new Date()
            const dataInicio = semana.dataInicio?.toDate?.() || semana.dataInicio
            const dataFim = semana.dataFim?.toDate?.() || semana.dataFim
            const semanaPassada = dataFim && isBefore(dataFim, hoje)
            const semanaAtual = dataInicio && dataFim && !semanaPassada && isAfter(hoje, dataInicio)
            
            return (
              <Card key={semana.semana} className={
                semanaAtual ? "border-2 border-green-500" : 
                semanaPassada ? "opacity-75" : ""
              }>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Semana {semana.semana}
                        {semanaAtual && (
                          <Badge variant="default" className="bg-green-600">
                            Esta Semana
                          </Badge>
                        )}
                        {semanaPassada && (
                          <Badge variant="secondary">
                            Concluída
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {dataInicio && format(dataInicio, "dd/MM/yyyy")} - {dataFim && format(dataFim, "dd/MM/yyyy")}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {semana.totalHoras}h
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {semana.materias?.map((materia, idx) => (
                      <div 
                        key={materia.id || idx} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => abrirDetalhesMateria(materia)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${olimpiada?.cor}`} />
                          <div>
                            <div className="font-medium">{materia.nome}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <BookOpen className="h-3 w-3" />
                              {materia.tempoAjustado || materia.tempo}h • 
                              <Badge variant={
                                materia.relevancia === "Alta" ? "destructive" : 
                                materia.relevancia === "Média" ? "default" : "secondary"
                              } className="text-xs">
                                {materia.relevancia}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Indicadores de materiais disponíveis */}
                          {materia.SITES && materia.SITES.length > 0 && (
                            <Badge variant="outline" className="text-xs">Teoria</Badge>
                          )}
                          {materia.VIDEOS && materia.VIDEOS.length > 0 && (
                            <Badge variant="outline" className="text-xs">Vídeos</Badge>
                          )}
                          {materia.EXERCICIOS && materia.EXERCICIOS.length > 0 && (
                            <Badge variant="outline" className="text-xs">Exercícios</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Resumo Final */}
        {cronograma.semanas && cronograma.semanas.length > 0 && (
          <Card className="bg-muted/50 mt-8">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {cronograma.semanas.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Semanas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {cronograma.semanas.reduce((total, semana) => total + (semana.materias?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Matérias</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {cronograma.semanas.reduce((total, semana) => total + (semana.totalHoras || 0), 0)}h
                  </div>
                  <div className="text-sm text-muted-foreground">Total de horas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(cronograma.semanas.reduce((total, semana) => total + (semana.totalHoras || 0), 0) / cronograma.semanas.length)}h
                  </div>
                  <div className="text-sm text-muted-foreground">Média por semana</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog de Detalhes da Matéria */}
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{materiaSelecionada?.nome}</DialogTitle>
            </DialogHeader>
            
            {materiaSelecionada && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Tempo estimado:</span>
                    <br />
                    {materiaSelecionada.tempoAjustado || materiaSelecionada.tempo}h
                  </div>
                  <div>
                    <span className="font-semibold">Relevância:</span>
                    <br />
                    <Badge variant={
                      materiaSelecionada.relevancia === "Alta" ? "destructive" : 
                      materiaSelecionada.relevancia === "Média" ? "default" : "secondary"
                    }>
                      {materiaSelecionada.relevancia}
                    </Badge>
                  </div>
                </div>

                {/* Materiais Disponíveis */}
                <div className="space-y-3">
                  {materiaSelecionada.SITES && materiaSelecionada.SITES.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">📘 Material Teórico</h4>
                      <ul className="space-y-1 ml-2">
                        {materiaSelecionada.SITES.map((site, index) => (
                          <li key={index}>
                            <a 
                              href={site} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Site teórico
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {materiaSelecionada.VIDEOS && materiaSelecionada.VIDEOS.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">🎥 Videoaulas</h4>
                      <ul className="space-y-1 ml-2">
                        {materiaSelecionada.VIDEOS.map((video, index) => (
                          <li key={index}>
                            <a 
                              href={video} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Videoaula
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {materiaSelecionada.EXERCICIOS && materiaSelecionada.EXERCICIOS.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">📝 Exercícios</h4>
                      <ul className="space-y-1 ml-2">
                        {materiaSelecionada.EXERCICIOS.map((exercicio, index) => (
                          <li key={index}>
                            <a 
                              href={exercicio} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Lista de exercícios
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {materiaSelecionada.RESOLUCOES && materiaSelecionada.RESOLUCOES.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">🎬 Resoluções</h4>
                      <ul className="space-y-1 ml-2">
                        {materiaSelecionada.RESOLUCOES.map((resolucao, index) => (
                          <li key={index}>
                            <a 
                              href={resolucao} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Resolução em vídeo
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default Cronograma