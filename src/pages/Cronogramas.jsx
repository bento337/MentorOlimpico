import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from "@/components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ChevronRight, Clock, BookOpen, CheckCircle2, Download, Save, Trash2, Eye } from "lucide-react"
import { format, addWeeks, addDays, differenceInWeeks, differenceInDays, isBefore, isAfter } from "date-fns"
import { ptBR } from "date-fns/locale"
import { db } from "@/services/firebaseConfig"
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, onSnapshot } from "firebase/firestore"
import { auth } from "@/services/firebaseConfig"
import { onAuthStateChanged } from "firebase/auth"
import { useNavigate, useLocation } from "react-router-dom"
import { jsPDF } from "jspdf"


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
  const location = useLocation()
  const user = auth.currentUser
  const [materias, setMaterias] = useState([])
  const [cronogramasSalvos, setCronogramasSalvos] = useState([])
  const [loading, setLoading] = useState(false)
  const [cronogramaGerado, setCronogramaGerado] = useState([])
  const [materiaSelecionada, setMateriaSelecionada] = useState(null)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [dialogDescarteAberto, setDialogDescarteAberto] = useState(false)
  
  // Estados do formulário
  const [olimpiadaSelecionada, setOlimpiadaSelecionada] = useState("")
  const [dataInicio, setDataInicio] = useState(null)
  const [dataProva, setDataProva] = useState(null)
  const [horasPorSemana, setHorasPorSemana] = useState(10)

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

  // Monitora estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCronogramasSalvos([]);
        setCronogramaGerado([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // CARREGA CRONOGRAMAS SALVOS AUTOMATICAMENTE COM TRATAMENTO DE ERROS
  useEffect(() => {
    if (!user) {
      setCronogramasSalvos([]);
      return;
    }

    const cronogramasRef = collection(db, "cronogramas");
    const q = query(cronogramasRef, where("userId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const cronogramas = [];
        snapshot.forEach((doc) => {
          cronogramas.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setCronogramasSalvos(cronogramas);
      },
      (error) => {
        console.error("Erro ao carregar cronogramas:", error);
        if (error.code === 'permission-denied') {
          console.log("Permissões do Firestore não configuradas corretamente");
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  // CARREGA CRONOGRAMA PASSADO PELO DASHBOARD
  useEffect(() => {
    if (location.state?.cronogramaCarregado) {
      carregarCronograma(location.state.cronogramaCarregado);
      // Limpa o estado para evitar recarregar na próxima navegação
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  // FUNÇÃO PARA GERAR E SALVAR AUTOMATICAMENTE
  const gerarCronograma = async () => {
    if (!user) {
      alert("Você precisa estar logado para gerar cronogramas!");
      navigate("/login");
      return;
    }

    if (!olimpiadaSelecionada || !dataInicio || !dataProva) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    if (isBefore(dataProva, dataInicio)) {
      alert("A data da prova não pode ser anterior à data de início!");
      return;
    }

    setLoading(true);

    try {
      // Calcula total de semanas disponíveis
      const totalSemanas = Math.max(1, differenceInWeeks(dataProva, dataInicio))
      
      // CALCULA TOTAL DE HORAS DISPONÍVEIS (horasPorSemana × totalSemanas)
      const totalHorasDisponiveis = totalSemanas * horasPorSemana

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

      // ORDENA POR RELEVÂNCIA E IMPORTÂNCIA (Alta > Média > Baixa)
      const materiasOrdenadas = materiasOlimpiada.sort((a, b) => {
        // Prioriza por relevância (Alta > Média > Baixa)
        const relevanciaOrder = { "Alta": 3, "Média": 2, "Baixa": 1 }
        const relevanciaA = relevanciaOrder[a.relevancia] || 0
        const relevanciaB = relevanciaOrder[b.relevancia] || 0
        
        if (relevanciaA !== relevanciaB) {
          return relevanciaB - relevanciaA
        }
        
        // Se relevância igual, ordena por importância numérica
        return (b.importancia || 0) - (a.importancia || 0)
      })

      // SELEÇÃO INTELIGENTE: Seleciona matérias até preencher o total de horas disponíveis
      let horasAlocadas = 0
      const materiasSelecionadas = []

      for (const materia of materiasOrdenadas) {
        const horasMateria = materia.tempo || 0
        
        // Verifica se a matéria cabe no tempo restante
        if (horasAlocadas + horasMateria <= totalHorasDisponiveis) {
          materiasSelecionadas.push({
            ...materia,
            tempoAjustado: horasMateria
          })
          horasAlocadas += horasMateria
        } else {
          // Se não couber totalmente, verifica se podemos adicionar uma parte
          const horasRestantes = totalHorasDisponiveis - horasAlocadas
          if (horasRestantes > 0 && horasRestantes >= Math.ceil(horasMateria * 0.3)) { // Pelo menos 30% da matéria
            materiasSelecionadas.push({
              ...materia,
              tempoAjustado: horasRestantes
            })
            horasAlocadas += horasRestantes
            break // Para após preencher todas as horas disponíveis
          }
        }
        
        // Para se já preencheu todas as horas disponíveis
        if (horasAlocadas >= totalHorasDisponiveis) {
          break
        }
      }

      // DISTRIBUIÇÃO POR SEMANAS: Distribui as matérias selecionadas pelas semanas
      const cronograma = []
      let semanaAtual = 1
      let horasSemanaAtual = 0
      let materiasDaSemana = []
      let materiasParaDistribuir = [...materiasSelecionadas]

      while (materiasParaDistribuir.length > 0 && semanaAtual <= totalSemanas) {
        const materia = materiasParaDistribuir[0]
        const horasMateria = materia.tempoAjustado

        // Se a matéria couber na semana atual
        if (horasSemanaAtual + horasMateria <= horasPorSemana) {
          materiasDaSemana.push(materia)
          horasSemanaAtual += horasMateria
          materiasParaDistribuir.shift() // Remove a matéria da lista
        } else {
          // Se não couber, tenta dividir a matéria entre semanas
          const horasRestantesSemana = horasPorSemana - horasSemanaAtual
          
          if (horasRestantesSemana > 0) {
            // Adiciona parte da matéria nesta semana
            materiasDaSemana.push({
              ...materia,
              tempoAjustado: horasRestantesSemana
            })
            horasSemanaAtual = horasPorSemana
            
            // Atualiza a matéria com horas restantes
            materiasParaDistribuir[0] = {
              ...materia,
              tempoAjustado: horasMateria - horasRestantesSemana
            }
          }

          // Finaliza a semana atual
          cronograma.push({
            semana: semanaAtual,
            dataInicio: addWeeks(dataInicio, semanaAtual - 1),
            dataFim: addDays(addWeeks(dataInicio, semanaAtual - 1), 6),
            materias: [...materiasDaSemana],
            totalHoras: horasSemanaAtual
          })
          
          // Prepara próxima semana
          semanaAtual++
          horasSemanaAtual = 0
          materiasDaSemana = []
          
          if (semanaAtual > totalSemanas) break
        }

        // Se é a última matéria ou última semana, finaliza
        if (materiasParaDistribuir.length === 0 || semanaAtual > totalSemanas) {
          if (materiasDaSemana.length > 0) {
            cronograma.push({
              semana: semanaAtual,
              dataInicio: addWeeks(dataInicio, semanaAtual - 1),
              dataFim: addDays(addWeeks(dataInicio, semanaAtual - 1), 6),
              materias: [...materiasDaSemana],
              totalHoras: horasSemanaAtual
            })
          }
          break
        }
      }

      // SALVA AUTOMATICAMENTE NO FIREBASE
      const cronogramaId = `cronograma_${Date.now()}`
      const cronogramaData = {
        id: cronogramaId,
        olimpiada: olimpiadaSelecionada,
        dataInicio: dataInicio,
        dataProva: dataProva,
        horasPorSemana: horasPorSemana,
        semanas: cronograma,
        dataCriacao: new Date(),
        userId: user.uid,
        titulo: `${CONFIG_OLIMPIADAS[olimpiadaSelecionada]?.titulo} - ${format(new Date(), "dd/MM/yyyy")}`
      }

      await setDoc(doc(db, "cronogramas", cronogramaId), cronogramaData)
      setCronogramaGerado(cronograma)
      
      // EXIBE RESUMO DA ALOCAÇÃO
      const horasUtilizadas = cronograma.reduce((total, semana) => total + semana.totalHoras, 0)
      const eficiencia = ((horasUtilizadas / totalHorasDisponiveis) * 100).toFixed(1)
      
      console.log(`📊 Resumo da geração:
        • Horas disponíveis: ${totalHorasDisponiveis}h
        • Horas utilizadas: ${horasUtilizadas}h
        • Eficiência: ${eficiencia}%
        • Matérias incluídas: ${materiasSelecionadas.length}/${materiasOlimpiada.length}
        • Semanas utilizadas: ${cronograma.length}/${totalSemanas}`)
        
    } catch (error) {
      console.error("Erro ao gerar cronograma:", error);
      
      if (error.code === 'permission-denied') {
        alert("❌ Erro de permissão. Verifique se você está logado corretamente.");
      } else {
        alert("❌ Erro ao gerar cronograma: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  // FUNÇÃO PARA DESCARTAR CRONOGRAMA
  const descartarCronograma = async () => {
    if (cronogramaGerado.length === 0) return
    
    try {
      // Encontra o cronograma atual na lista de salvos
      const cronogramaAtual = cronogramasSalvos.find(c => 
        c.olimpiada === olimpiadaSelecionada && 
        c.dataInicio?.toDate?.().getTime() === dataInicio?.getTime()
      )
      
      if (cronogramaAtual) {
        await deleteDoc(doc(db, "cronogramas", cronogramaAtual.id))
      }
      
      setCronogramaGerado([])
      setDialogDescarteAberto(false)
      alert("Cronograma descartado com sucesso!")
    } catch (error) {
      console.error("Erro ao descartar cronograma:", error)
      alert("❌ Erro ao descartar cronograma")
    }
  }


  // FUNÇÃO PARA CARREGAR CRONOGRAMA SALVO
  const carregarCronograma = (cronograma) => {
    navigate('/cronograma', { 
      state: { 
        cronogramaCarregado: cronograma 
      } 
    })
  }

  // FUNÇÃO PARA GERAR PDF DO CRONOGRAMA 
  const exportarPDF = () => {
    if (cronogramaGerado.length === 0) {
      alert("Gere um cronograma primeiro!")
      return
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let y = margin
    const olimpiada = CONFIG_OLIMPIADAS[olimpiadaSelecionada]

    // Configurar fonte padrão (evitar problemas de caracteres)
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
    doc.text(olimpiada?.titulo || olimpiadaSelecionada, pageWidth / 2, 32, { align: "center" })
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, pageWidth / 2, 42, { align: "center" })

    y = 60

    // ======= INFORMAÇÕES GERAIS =======
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("INFORMAÇÕES DO PLANO DE ESTUDO", margin, y)
    y += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    
    // Usar ícones simples em texto para evitar problemas de codificação
    const infos = [
      `Período: ${format(dataInicio, "dd/MM/yyyy")} - ${format(dataProva, "dd/MM/yyyy")}`,
      `Horas por semana: ${horasPorSemana}h`,
      `Total de semanas: ${cronogramaGerado.length}`,
      `Total de matérias: ${cronogramaGerado.reduce((t, s) => t + s.materias.length, 0)}`,
      `Horas totais: ${cronogramaGerado.reduce((t, s) => t + s.totalHoras, 0)}h`
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
    cronogramaGerado.forEach((semana, idx) => {
      if (y > pageHeight - 60) { 
        doc.addPage(); 
        y = margin 
      }

      // Cabeçalho da semana - usar cores em vez de emojis
      doc.setFillColor(240, 248, 255)
      doc.rect(margin, y - 4, pageWidth - 2 * margin, 14, "F")
      doc.setDrawColor(59, 130, 246)
      doc.rect(margin, y - 4, pageWidth - 2 * margin, 14)
      
      doc.setFontSize(12)
      doc.setTextColor(0)
      doc.setFont("helvetica", "bold")
      doc.text(`SEMANA ${semana.semana}`, margin + 4, y + 4)
      
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text(`${format(semana.dataInicio, "dd/MM/yyyy")} - ${format(semana.dataFim, "dd/MM/yyyy")}`, margin + 50, y + 4)
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
    const totalHoras = cronogramaGerado.reduce((t, s) => t + s.totalHoras, 0)
    const totalMaterias = cronogramaGerado.reduce((t, s) => t + s.materias.length, 0)
    const eficiencia = Math.round((totalHoras / (cronogramaGerado.length * horasPorSemana)) * 100)
    
    const resumo = [
      `• Total de semanas: ${cronogramaGerado.length}`,
      `• Total de matérias: ${totalMaterias}`,
      `• Horas totais de estudo: ${totalHoras}h`,
      `• Média de horas por semana: ${Math.round(totalHoras / cronogramaGerado.length)}h`,
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
        `Página ${i} de ${totalPages} • Mentor Olímpico • ${olimpiada?.titulo || olimpiadaSelecionada}`,
        pageWidth / 2, 
        pageHeight - 10, 
        { align: "center" }
      )
    }

    doc.save(`cronograma-${olimpiadaSelecionada}-${format(new Date(), "dd-MM-yyyy")}.pdf`)
  }


  // FUNÇÃO PARA CALCULAR PROGRESSO
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

  // FUNÇÃO PARA ABRIR DETALHES DA MATÉRIA
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
                <Select value={olimpiadaSelecionada} onValueChange={setOlimpiadaSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma olimpíada" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONFIG_OLIMPIADAS).map(([key, olimpiada]) => (
                      <SelectItem key={key} value={key}>
                        {olimpiada.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            {/* Informação sobre semanas disponíveis */}
            {dataInicio && dataProva && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Período de Estudo</span>
                </div>
                <p className="text-blue-700">
                  Você terá <strong>{differenceInWeeks(dataProva, dataInicio)} semanas</strong> para se preparar, 
                  com <strong>{horasPorSemana} horas por semana</strong>.
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  O cronograma será gerado priorizando as matérias mais importantes para caber neste período.
                </p>
              </div>
            )}

            {/* Informações Calculadas */}
            {dataInicio && dataProva && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Semanas disponíveis:</span>
                    <br />
                    {differenceInWeeks(dataProva, dataInicio)} semanas
                  </div>
                  <div>
                    <span className="font-semibold">Horas por semana:</span>
                    <br />
                    {horasPorSemana}h
                  </div>
                  <div>
                    <span className="font-semibold">Total de horas disponíveis:</span>
                    <br />
                    {differenceInWeeks(dataProva, dataInicio) * horasPorSemana}h
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚡ O cronograma priorizará as matérias mais relevantes dentro do tempo total disponível.
                </p>
              </div>
            )}

            <Button 
              onClick={gerarCronograma} 
              className="w-full mt-6"
              size="lg"
              disabled={loading}
            >
              {loading ? "Gerando e Salvando..." : "Gerar Cronograma Personalizado"}
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
                  <span className="ml-2 text-green-600">✓ Salvo automaticamente</span>
                </p>
              </div>
              
              {/* Botões de Ação */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportarPDF} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setDialogDescarteAberto(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Descartar
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
                                <Badge variant="outline" className="text-xs">
                                📚 {materia.SITES.length}
                                </Badge>
                            )}
                            {materia.VIDEOS && materia.VIDEOS.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                🎥 {materia.VIDEOS.length}
                                </Badge>
                            )}
                            {materia.EXERCICIOS && materia.EXERCICIOS.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                📝 {materia.EXERCICIOS.length}
                                </Badge>
                            )}
                            {materia.RESOLUCOES && materia.RESOLUCOES.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                ✅ {materia.RESOLUCOES.length}
                                </Badge>
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

            {/* Resumo Final - ATUALIZADO */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-5 gap-4 text-center">
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
                  <div>
                    <div className="text-2xl font-bold text-cyan-600">
                      {Math.round((cronogramaGerado.reduce((total, semana) => total + semana.totalHoras, 0) / (cronogramaGerado.length * horasPorSemana)) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Eficiência</div>
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
                    {materiaSelecionada.tempoAjustado || materiaSelecionada.tempo} horas
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
                  <div>
                    <span className="font-semibold">Importância:</span>
                    <br />
                    {materiaSelecionada.importancia || "Não definida"}
                  </div>
                  <div>
                    <span className="font-semibold">Olimpíadas:</span>
                    <br />
                    {materiaSelecionada.OLIMPIADAS?.join(", ") || "Nenhuma"}
                  </div>
                </div>

                {/* Links de Estudo */}
                {materiaSelecionada.SITES && materiaSelecionada.SITES.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Materiais de Teoria ({materiaSelecionada.SITES.length})
                    </h4>
                    <div className="space-y-1">
                    {materiaSelecionada.SITES.map((site, index) => (
                        <a 
                        key={index}
                        href={site} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                        >
                        📚 Material de estudo {index + 1}
                        </a>
                    ))}
                    </div>
                </div>
                )}

                {materiaSelecionada.VIDEOS && materiaSelecionada.VIDEOS.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2">Vídeos Recomendados ({materiaSelecionada.VIDEOS.length})</h4>
                    <div className="space-y-1">
                    {materiaSelecionada.VIDEOS.map((video, index) => (
                        <a 
                        key={index}
                        href={video} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                        >
                        🎥 Videoaula {index + 1}
                        </a>
                    ))}
                    </div>
                </div>
                )}

                {materiaSelecionada.EXERCICIOS && materiaSelecionada.EXERCICIOS.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2">Exercícios ({materiaSelecionada.EXERCICIOS.length})</h4>
                    <div className="space-y-1">
                    {materiaSelecionada.EXERCICIOS.map((exercicio, index) => (
                        <a 
                        key={index}
                        href={exercicio} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                        >
                        📝 Lista de exercícios {index + 1}
                        </a>
                    ))}
                    </div>
                </div>
                )}

                {materiaSelecionada.RESOLUCOES && materiaSelecionada.RESOLUCOES.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2">Resoluções ({materiaSelecionada.RESOLUCOES.length})</h4>
                    <div className="space-y-1">
                    {materiaSelecionada.RESOLUCOES.map((resolucao, index) => (
                        <a 
                        key={index}
                        href={resolucao} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                        >
                        ✅ Resolução {index + 1}
                        </a>
                    ))}
                    </div>
                </div>
                )}

                {(!materiaSelecionada.SITES || materiaSelecionada.SITES.length === 0) &&
                 (!materiaSelecionada.VIDEOS || materiaSelecionada.VIDEOS.length === 0) &&
                 (!materiaSelecionada.EXERCICIOS || materiaSelecionada.EXERCICIOS.length === 0) &&
                 (!materiaSelecionada.RESOLUCOES || materiaSelecionada.RESOLUCOES.length === 0) && (
                  <div className="text-center text-muted-foreground py-4">
                    Nenhum material de estudo disponível para esta matéria.
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação para Descartar */}
        <Dialog open={dialogDescarteAberto} onOpenChange={setDialogDescarteAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Descartar Cronograma</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Tem certeza que deseja descartar este cronograma?</p>
              <p className="text-sm text-muted-foreground mt-2">
                Esta ação não pode ser desfeita e o cronograma será removido permanentemente.
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDialogDescarteAberto(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={descartarCronograma}
              >
                Descartar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Estado Vazio */}
        {cronogramaGerado.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="max-w-md mx-auto">
                <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum cronograma gerado</h3>
                <p className="text-muted-foreground mb-6">
                  Configure as opções acima e clique em "Gerar Cronograma Personalizado" para criar seu plano de estudos.
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>
                    <div className="font-semibold">1. Selecione</div>
                    <div>Escolha a olimpíada e datas</div>
                  </div>
                  <div>
                    <div className="font-semibold">2. Configure</div>
                    <div>Ajuste horas e semanas</div>
                  </div>
                  <div>
                    <div className="font-semibold">3. Gere</div>
                    <div>Crie seu plano automático</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      
    </>
  )
}

export default Cronogramas