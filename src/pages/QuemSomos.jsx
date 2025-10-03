import { BookHeart, GraduationCap, Users } from "lucide-react"
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


function QuemSomos() {
  return (
    <>
        <Header />
    
        <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-10">Quem Somos</h1>

        {/* Vvalores */}
        <section className="mb-12">
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
            O <strong>Mentor Olímpico</strong> é uma iniciativa educacional criada por estudantes apaixonados por ensino e tecnologia. Nosso objetivo é facilitar o acesso a olimpíadas acadêmicas e ajudar jovens a conquistarem seus sonhos através da educação.
            </p>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-20 text-muted-foreground">
            <div className="bg-background rounded-xl border shadow-sm p-6">
            <GraduationCap className="text-primary w-8 h-8 mb-2" />
            <h3 className="font-semibold text-lg mb-1">Missão</h3>
            <p className="text-sm">Guiar estudantes em jornadas de estudo para olimpíadas acadêmicas com organização, estratégia e apoio digital.</p>
            </div>

            <div className="bg-background rounded-xl border shadow-sm p-6">
            <BookHeart className="text-primary w-8 h-8 mb-2" />
            <h3 className="font-semibold text-lg mb-1">Visão</h3>
            <p className="text-sm">Democratizar o acesso à preparação olímpica e transformar vidas por meio da educação de qualidade e personalizada.</p>
            </div>

            <div className="bg-background rounded-xl border shadow-sm p-6">
            <Users className="text-primary w-8 h-8 mb-2" />
            <h3 className="font-semibold text-lg mb-1">Valores</h3>
            <p className="text-sm">Empatia, acessibilidade, excelência, compromisso com o aprendizado e uso ético da tecnologia.</p>
            </div>
        </section>

        {/* Integrantes do grupo */}
        <section className="text-center text-muted-foreground mb-20">
            <h2 className="text-2xl font-bold mb-4">Sobre o projeto</h2>
            <p className="text-sm max-w-2xl mx-auto">
            O projeto foi idealizado por estudantes do ensino médio técnico do CEFET-MG, com base em suas próprias experiências com olimpíadas como a OBMEP e a OMIF. Eles buscam tornar o processo de preparação mais leve e acessível para outros jovens com grandes sonhos.
            </p>
        </section>
        
        </div>
    </>
  )
}

export default QuemSomos
