import { useParams } from "react-router-dom"
import { Link } from "react-router-dom"
import trilhas from "../trilhas"
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


import { ThemeToggle } from "@/components/ThemeToggle"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"


function Trilha() {
  const { id } = useParams()
  const trilha = trilhas[id]

  if (!trilha) {
    return <p className="text-center mt-10 text-red-500">Trilha não encontrada</p>
  }

  // Dados do gráfico (simulação)
  const pieData = trilha.materiasDetalhadas.map((m) => ({
    name: m.nome,
    value: m.importancia || 1, // % de relevância definida no objeto
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA46BE"]


  return (
    <>
        <Header />


    {/* Cabeçalho da olimpíada */}
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Título */}
      <h1 className="text-4xl font-bold mb-2">{trilha.titulo}</h1>
      <p className="text-muted-foreground mb-6">{trilha.descricao}</p>

      {/* Resumo da prova com gráfico */}
      <section className="bg-muted/30 rounded-xl p-6 mb-10 shadow-sm border grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-2xl font-semibold mb-3">Sobre a prova</h2>
          <p><strong>Anos:</strong> {trilha.anos}</p>
          <p><strong>Data prevista:</strong> {trilha.data}</p>
          <p><strong>Número de fases:</strong> 2 (Exemplo)</p>
        </div>
        <div className="h-52">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Conteúdos em Accordion */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Módulos de Estudo</h2>
        
        <Accordion type="single" collapsible className="w-full">
          {trilha.materiasDetalhadas?.map((materia, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="flex justify-between items-center">
                <span>{materia.nome}</span>
                <div className="flex items-center gap-3 ml-auto">
                  <span className="text-sm text-muted-foreground">{materia.tempo}</span>
                  <Badge variant={materia.relevancia === "Alta" ? "destructive" : "secondary"}>
                    {materia.relevancia}
                  </Badge>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <ul className="list-disc list-inside space-y-2 mt-2 text-muted-foreground">
                  <li>
                    📘 <a href={materia.teoria} target="_blank" className="underline">Material teórico</a>
                  </li>
                  <li>
                    🎥 <a href={materia.videoaula} target="_blank" className="underline">Videoaula</a>
                  </li>
                  <li>
                    📝 <a href={materia.questoes} target="_blank" className="underline">Lista de questões</a>
                  </li>
                  <li>
                    🎬 <a href={materia.resolucao} target="_blank" className="underline">Resolução em vídeo</a>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
    </>
  )
}

export default Trilha
