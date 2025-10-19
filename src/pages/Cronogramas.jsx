// src/pages/Cronogramas.jsx
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from "@/components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, ChevronRight, Clock, BookOpen, CheckCircle2, Download, Save } from "lucide-react"
import { format, addWeeks, addDays, differenceInWeeks, differenceInDays, isBefore, isAfter } from "date-fns"
import { ptBR } from "date-fns/locale"
import { db } from "@/services/firebaseConfig"
import { collection, getDocs, doc, setDoc } from "firebase/firestore"
import { auth } from "@/services/firebaseConfig"
import { useNavigate } from "react-router-dom"
import jsPDF from "jspdf"

const CONFIG_OLIMPIADAS = {
  OBMEP: {
    titulo: "OBMEP",
    descricao: "Olimpíada Brasileira de Matemática das Escolas Públicas",
    semanasRecomendadas: 12,
    cor: "bg-blue-500"
  },
  OMIF: {
    titulo: "OMIF", 
    descricao: "Olimpíada de Matemática das Instituições Federais",
    semanasRecomendadas: 10,
    cor: "bg-green-500"
  },
  OIMSF: {
    titulo: "OIMSF",
    descricao: "Olimpíada Internacional de Matemática Sem Fronteiras",
    semanasRecomendadas: 8,
    cor: "bg-purple-500"
  }
}

function Cronogramas() {
  const navigate = useNavigate()
  const user = auth.currentUser
  const [materias, setMaterias] = useState([])
  const [loading, setLoading] = useState(false)
  const [cronogramaGerado, setCronogramaGerado] = useState([])
  const [materiaSelecionada, setMateriaSelecionada] = useState(null)
  const [dialogAberto, setDialogAberto] = useState(false)
  
  // Estados do formulário
  const [olimpiadaSelecionada, setOlimpiadaSelecionada] = useState("")
  const [dataInicio, setDataInicio] = useState(null)
  const [dataProva, setDataProva] = useState(null)
  const [horasPorSemana, setHorasPorSemana] = useState(10)
  const [tipoSemanas, setTipoSemanas] = useState("disponiveis") // "disponiveis" ou "recomendadas"

  // Carrega todas as matérias do Firebase
  useEffect(() => {
    const carregarMaterias = async () => {
      setLoading(true)
      try {
        const materiasRef = collection(db, "Materias")
        const querySnapshot = await getDocs(materiasRef)
        
        const todasMaterias = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          todasMaterias.push({
            id: doc.id,
            ...data
          })
        })
        
        setMaterias(todasMaterias)
      } catch (err) {
        console.error("Erro ao carregar matérias:", err)
      } finally {
        setLoading(false)
      }
    }

    carregarMaterias()
  }, [])

  // 🌟 FUNÇÃO PARA GERAR CRONOGRAMA MELHORADA
  const gerarCronograma = () => {
    if (!olimpiadaSelecionada || !dataInicio || !dataProva) {
      alert("Preencha todos os campos obrigatórios!")
      return
    }

    if (isBefore(dataProva, dataInicio)) {
      alert("A data da prova não pode ser anterior à data de início!")
      return
    }

    // Calcula total de semanas baseado na escolha do usuário
    let totalSemanas
    if (tipoSemanas === "recomendadas") {
      totalSemanas = CONFIG_OLIMPIADAS[olimpiadaSelecionada]?.semanasRecomendadas || 8
    } else {
      totalSemanas = Math.max(1, differenceInWeeks(dataProva, dataInicio))
    }

    if (totalSemanas < 1) {
      alert("É necessário pelo menos 1 semana de preparação!")
      return
    }

    // Filtra matérias da olimpíada selecionada
    const materiasOlimpiada = materias.filter(materia => 
      materia.OLIMPIADAS && 
      Array.isArray(materia.OLIMPIADAS) && 
      materia.OLIMPIADAS.includes(olimpiadaSelecionada.toUpperCase())
    )

    if (materiasOlimpiada.length === 0) {
      alert(`Nenhuma matéria encontrada para ${CONFIG_OLIMPIADAS[olimpiadaSelecionada]?.titulo}`)
      return
    }

    // Ordena por importância (mais importante primeiro)
    const materiasOrdenadas = materiasOlimpiada.sort((a, b) => 
      (b.importancia || 0) - (a.importancia || 0)
    )

    // Calcula tempo total necessário
    const tempoTotalNecessario = materiasOrdenadas.reduce((total, materia) => 
      total + (materia.tempo || 0), 0
    )

    // Calcula horas disponíveis totais
    const horasDisponiveisTotal = totalSemanas * horasPorSemana

    console.log(`📊 Tempo necessário: ${tempoTotalNecessario}h, Disponível: ${horasDisponiveisTotal}h`)

    // 🌟 ALGORITMO INTELIGENTE: Seleciona apenas as matérias que cabem no tempo
    let horasAlocadas = 0
    const materiasSelecionadas = []

    for (const materia of materiasOrdenadas) {
      const horasMateria = materia.tempo || 0
      
      // Se ainda cabe no tempo total, adiciona a matéria
      if (horasAlocadas + horasMateria <= horasDisponiveisTotal) {
        materiasSelecionadas.push({
          ...materia,
          tempoAjustado: horasMateria
        })
        horasAlocadas += horasMateria
      } else {
        console.log(`⏰ Pulando "${materia.nome}" - não cabe no tempo disponível`)
      }
    }

    console.log(`✅ Matérias selecionadas: ${materiasSelecionadas.length}/${materiasOrdenadas.length}`)

    // Distribui matérias pelas semanas
    const cronograma = []
    let semanaAtual = 1
    let horasSemanaAtual = 0
    let materiasDaSemana = []

    for (const materia of materiasSelecionadas) {
      const horasMateria = materia.tempoAjustado
      
      // Se não cabe na semana atual e já tem matérias, fecha a semana
      if (horasSemanaAtual + horasMateria > horasPorSemana && materiasDaSemana.length > 0) {
        cronograma.push({
          semana: semanaAtual,
          dataInicio: addWeeks(dataInicio, semanaAtual - 1),
          dataFim: addDays(addWeeks(dataInicio, semanaAtual - 1), 6),
          materias: [...materiasDaSemana],
          totalHoras: horasSemanaAtual
        })
        
        semanaAtual++
        horasSemanaAtual = 0
        materiasDaSemana = []
        
        // Se ultrapassou o número de semanas, para
        if (semanaAtual > totalSemanas) break
      }

      // Adiciona matéria à semana atual
      materiasDaSemana.push(materia)
      horasSemanaAtual += horasMateria

      // Se é a última matéria ou última semana, fecha
      if (materia === materiasSelecionadas[materiasSelecionadas.length - 1] || semanaAtual === totalSemanas) {
        cronograma.push({
          semana: semanaAtual,
          dataInicio: addWeeks(dataInicio, semanaAtual - 1),
          dataFim: addDays(addWeeks(dataInicio, semanaAtual - 1), 6),
          materias: [...materiasDaSemana],
          totalHoras: horasSemanaAtual
        })
      }
    }

    setCronogramaGerado(cronograma)
  }

  // 🌟 FUNÇÃO PARA SALVAR NO FIREBASE
  const salvarCronograma = async () => {
    if (!user) {
      alert("Você precisa estar logado para salvar cronogramas!")
      navigate("/login")
      return
    }

    if (cronogramaGerado.length === 0) {
      alert("Gere um cronograma primeiro!")
      return
    }

    try {
      const cronogramaId = `cronograma_${Date.now()}`
      const cronogramaData = {
        id: cronogramaId,
        olimpiada: olimpiadaSelecionada,
        dataInicio: dataInicio,
        dataProva: dataProva,
        horasPorSemana: horasPorSemana,
        tipoSemanas: tipoSemanas,
        semanas: cronogramaGerado,
        dataCriacao: new Date(),
        userId: user.uid
      }

      await setDoc(doc(db, "cronogramas", cronogramaId), cronogramaData)
      alert("✅ Cronograma salvo com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar cronograma:", error)
      alert("❌ Erro ao salvar cronograma")
    }
  }

  // 🌟 FUNÇÃO PARA EXPORTAR PDF
  const exportarPDF = () => {
    if (cronogramaGerado.length === 0) {
      alert("Gere um cronograma primeiro!")
      return
    }

    const doc = new jsPDF()
    const olimpiada = CONFIG_OLIMPIADAS[olimpiadaSelecionada]

    // Cabeçalho
    doc.setFontSize(20)
    doc.text(`Cronograma - ${olimpiada?.titulo}`, 20, 20)
    doc.setFontSize(12)
    doc.text(`Período: ${format(dataInicio, "dd/MM/yyyy")} - ${format(dataProva, "dd/MM/yyyy")}`, 20, 30)
    doc.text(`Horas por semana: ${horasPorSemana}h`, 20, 37)

    let yPosition = 50

    // Conteúdo das semanas
    cronogramaGerado.forEach((semana, index) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.text(`Semana ${semana.semana} (${format(semana.dataInicio, "dd/MM")} - ${format(semana.dataFim, "dd/MM")})`, 20, yPosition)
      yPosition += 10

      semana.materias.forEach((materia, idx) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFontSize(10)
        doc.text(`• ${materia.nome} - ${materia.tempoAjustado || materia.tempo}h (${materia.relevancia})`, 25, yPosition)
        yPosition += 6
      })

      yPosition += 5
    })

    doc.save(`cronograma-${olimpiadaSelecionada}.pdf`)
  }

  // 🌟 FUNÇÃO PARA CALCULAR PROGRESSO
  const calcularProgresso = () => {
    if (cronogramaGerado.length === 0) return 0
    const hoje = new Date()
    const primeiraSemana = cronogramaGerado[0]?.dataInicio
    const ultimaSemana = cronogramaGerado[cronogramaGerado.length - 1]?.dataFim

    if (isBefore(hoje, primeiraSemana)) return 0
    if (isAfter(hoje, ultimaSemana)) return 100

    const totalDias = differenceInDays(ultimaSemana, primeiraSemana)
    const diasPassados = differenceInDays(hoje, primeiraSemana)
    
    return Math.min(100, Math.max(0, (diasPassados / totalDias) * 100))
  }

  // 🌟 FUNÇÃO PARA ABRIR DETALHES DA MATÉRIA
  const abrirDetalhesMateria = (materia) => {
    setMateriaSelecionada(materia)
    setDialogAberto(true)
  }

  const progresso = calcularProgresso()

  return (
    <>
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Cronogramas Personalizados</h1>
          <p className="text-muted-foreground text-lg">
            Crie seu plano de estudos sob medida para suas olimpíadas
          </p>
        </div>

        {/* Formulário de Configuração */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configure seu Cronograma</CardTitle>
            <CardDescription>
              Preencha as informações para gerar um plano de estudos personalizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Seleção de Olimpíada */}
              <div className="space-y-2">
                <Label htmlFor="olimpiada">Olimpíada *</Label>
                <select
                  id="olimpiada"
                  value={olimpiadaSelecionada}
                  onChange={(e) => setOlimpiadaSelecionada(e.target.value)}
                  className="border rounded px-3 py-2 w-full bg-background"
                >
                  <option value="">Selecione uma olimpíada</option>
                  {Object.entries(CONFIG_OLIMPIADAS).map(([key, olimpiada]) => (
                    <option key={key} value={key}>
                      {olimpiada.titulo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data de Início */}
              <div className="space-y-2">
                <Label>Data de Início *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicio ? format(dataInicio, "dd/MM/yyyy") : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataInicio}
                      onSelect={setDataInicio}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Data da Prova */}
              <div className="space-y-2">
                <Label>Data da Prova *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataProva ? format(dataProva, "dd/MM/yyyy") : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataProva}
                      onSelect={setDataProva}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Horas por Semana */}
              <div className="space-y-2">
                <Label htmlFor="horas">Horas por Semana</Label>
                <Input
                  id="horas"
                  type="number"
                  min="1"
                  max="40"
                  value={horasPorSemana}
                  onChange={(e) => setHorasPorSemana(parseInt(e.target.value) || 1)}
                  placeholder="10"
                />
              </div>
            </div>

            {/* Seleção do tipo de semanas */}
            <div className="mt-6 space-y-2">
              <Label>Usar semanas:</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="disponiveis"
                    checked={tipoSemanas === "disponiveis"}
                    onChange={(e) => setTipoSemanas(e.target.value)}
                    className="text-blue-600"
                  />
                  <span>Disponíveis até a prova ({differenceInWeeks(dataProva, dataInicio) || 0} semanas)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="recomendadas"
                    checked={tipoSemanas === "recomendadas"}
                    onChange={(e) => setTipoSemanas(e.target.value)}
                    className="text-blue-600"
                  />
                  <span>Recomendadas ({CONFIG_OLIMPIADAS[olimpiadaSelecionada]?.semanasRecomendadas || 0} semanas)</span>
                </label>
              </div>
            </div>

            {/* Informações Calculadas */}
            {dataInicio && dataProva && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Semanas disponíveis:</span>
                    <br />
                    {differenceInWeeks(dataProva, dataInicio)} semanas
                  </div>
                  <div>
                    <span className="font-semibold">Horas totais disponíveis:</span>
                    <br />
                    {(tipoSemanas === "recomendadas" 
                      ? (CONFIG_OLIMPIADAS[olimpiadaSelecionada]?.semanasRecomendadas || 0) * horasPorSemana
                      : differenceInWeeks(dataProva, dataInicio) * horasPorSemana
                    )}h
                  </div>
                  <div>
                    <span className="font-semibold">Semanas recomendadas:</span>
                    <br />
                    {CONFIG_OLIMPIADAS[olimpiadaSelecionada]?.semanasRecomendadas || "-"}
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={gerarCronograma} 
              className="w-full mt-6"
              size="lg"
              disabled={loading}
            >
              {loading ? "Gerando..." : "Gerar Cronograma Personalizado"}
            </Button>
          </CardContent>
        </Card>

        {/* Cronograma Gerado */}
        {cronogramaGerado.length > 0 && (
          <div className="space-y-6">
            {/* Cabeçalho do Cronograma */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Seu Cronograma de Estudos</h2>
                <p className="text-muted-foreground">
                  {CONFIG_OLIMPIADAS[olimpiadaSelecionada]?.titulo} • {cronogramaGerado.length} semanas
                </p>
              </div>
              
              {/* Botões de Ação */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={salvarCronograma} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
                <Button onClick={exportarPDF} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="bg-muted p-4 rounded-lg">
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
            <div className="space-y-4">
              {cronogramaGerado.map((semana, index) => {
                const hoje = new Date()
                const semanaPassada = isBefore(semana.dataFim, hoje)
                const semanaAtual = !semanaPassada && isAfter(hoje, semana.dataInicio)
                
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
                            {format(semana.dataInicio, "dd/MM/yyyy")} - {format(semana.dataFim, "dd/MM/yyyy")}
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
                        {semana.materias.map((materia, idx) => (
                          <div 
                            key={materia.id} 
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => abrirDetalhesMateria(materia)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${CONFIG_OLIMPIADAS[olimpiadaSelecionada]?.cor}`} />
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
                              
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {cronogramaGerado.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Semanas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {cronogramaGerado.reduce((total, semana) => total + semana.materias.length, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Matérias</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {cronogramaGerado.reduce((total, semana) => total + semana.totalHoras, 0)}h
                    </div>
                    <div className="text-sm text-muted-foreground">Total de horas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(cronogramaGerado.reduce((total, semana) => total + semana.totalHoras, 0) / cronogramaGerado.length)}h
                    </div>
                    <div className="text-sm text-muted-foreground">Média por semana</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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

export default Cronogramas