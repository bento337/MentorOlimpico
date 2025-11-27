import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import Header from "@/components/Header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ThemeToggle } from "@/components/ThemeToggle"

function Trilhas() {
  return (
    <>
      <Header />

      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">Escolha sua Olimpíada</h1>

        {/* Cartões de cada olimpíada */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 - OBMEP */}
          <Card className="
            shadow-md hover:shadow-lg 
            p-6 
            transition-all duration-300 ease-in-out 
            hover:scale-[1.02]
            h-full flex flex-col
          ">
            <CardTitle className="text-xl mb-3">🧠 OBMEP</CardTitle>
            <CardDescription className="
              text-justify text-muted-foreground
              mb-6 flex-grow
            ">
              A OBMEP (Olimpíada Brasileira de Matemática das Escolas Públicas) é voltada para alunos do 6º ano do Ensino Fundamental ao 3º ano do Ensino Médio. É a maior olimpíada acadêmica do Brasil, focando em raciocínio lógico, álgebra, geometria e problemas desafiadores. Possui três níveis, divididos por faixa escolar.
            </CardDescription>
            <div className="mt-auto">
              <Button className="w-full" asChild>
                <Link to="/trilhas/obmep">Ver Trilha →</Link>
              </Button>
            </div>
          </Card>

          {/* Card 2 - OIMSF */}
          <Card className="
            shadow-md hover:shadow-lg 
            p-6 
            transition-all duration-300 ease-in-out 
            hover:scale-[1.02]
            h-full flex flex-col
          ">
            <CardTitle className="text-xl mb-3">📐 OIMSF</CardTitle>
            <CardDescription className="
              text-justify text-muted-foreground
              mb-6 flex-grow
            ">
              A OIMSF (Olimpíada Internacional de Matemática Sem Fronteiras) é uma competição internacional que incentiva o trabalho em grupo. Voltada para alunos do Ensino Fundamental II (a partir do 6º ano) até o Ensino Médio, inclui também questões em outras línguas, promovendo interdisciplinaridade.
            </CardDescription>
            <div className="mt-auto">
              <Button className="w-full" asChild>
                <Link to="/trilhas/oimsf">Ver Trilha →</Link>
              </Button>
            </div>
          </Card>

          {/* Card 3 - OMIF */}
          <Card className="
            shadow-md hover:shadow-lg 
            p-6 
            transition-all duration-300 ease-in-out 
            hover:scale-[1.02]
            h-full flex flex-col
        ">
            <CardTitle className="text-xl mb-3">🔬 OMIF</CardTitle>
            <CardDescription className="
              text-justify text-muted-foreground
              mb-6 flex-grow
            ">
              A OMIF (Olimpíada de Matemática das Instituições Federais) é voltada para estudantes de Institutos Federais e similares, abrangendo desde o 1º ano do Ensino Médio até o Ensino Técnico Integrado. A prova valoriza tanto lógica quanto fundamentos teóricos da matemática.              
            </CardDescription>
            <div className="mt-auto">
              <Button className="w-full" asChild>
                <Link to="/trilhas/omif">Ver Trilha →</Link>
              </Button>
            </div>
          </Card>
        </div>

      </main>
    </>
  )
}

export default Trilhas
