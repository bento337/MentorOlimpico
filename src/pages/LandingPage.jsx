import { Button } from "@/components/ui/button"
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
import { loginUser } from "../services/authService"

function LandingPage() {
  return (
    <>
      <title>Mentor Olímpico</title>
      <link rel="shortcut icon" type="imagex/png" href="../assets/logo.ico"></link>

      <Header />

      {/* Main */}
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <br /><br />
        <h1 className="text-4xl font-bold mb-6 max-w-2xl">
          Estude para olimpíadas com foco, estratégia e organização
        </h1>
        <p className="text-lg mb-6 text-muted-foreground max-w-2xl">
          O Mentor Olímpico te ajuda a montar trilhas de estudo personalizadas e eficientes, com base em seu tempo e objetivos.
        </p>
        <Button size="lg" className="mb-8 transition-transform hover:scale-[1.02]">
          <Link to="/trilhas">Começar Agora</Link>
        </Button>

        <img src="/Estudantes.png" alt="Estudante" className="max-w-md mb-12 rounded-lg shadow-md" />

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
          <div className="p-6 rounded-xl shadow-sm bg-background border text-left">
            <h3 className="text-lg font-semibold mb-2">Cronogramas Personalizados</h3>
            <p className="text-sm text-muted-foreground">Adapte seu plano de estudo ao tempo que você tem disponível.</p>
          </div>
          <div className="p-6 rounded-xl shadow-sm bg-background border text-left">
            <h3 className="text-lg font-semibold mb-2">Trilhas por Olimpíada</h3>
            <p className="text-sm text-muted-foreground">Conteúdos divididos por matéria e fase para OBMEP, OMIF, OIMSF e outras.</p>
          </div>
          <div className="p-6 rounded-xl shadow-sm bg-background border text-left">
            <h3 className="text-lg font-semibold mb-2">Acesso a Materiais de Qualidade</h3>
            <p className="text-sm text-muted-foreground">Playlist do YouTube, PDFs e links confiáveis em um só lugar.</p>
          </div>
        </div>

        <section className="mt-20 w-full bg-background py-16">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Por que usar o Mentor Olímpico?</h2>
            <p className="text-muted-foreground mb-8">
              Feito para quem quer ir além na escola e conquistar medalhas nas maiores olimpíadas do Brasil.
            </p>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
              <img src="/Medalhista2.png" alt="Gráfico de desempenho" className="w-72 md:w-80" />
              <div className="text-left max-w-md">
                <ul className="space-y-3 text-muted-foreground list-disc list-inside">
                  <li>Foque nas matérias certas para cada fase</li>
                  <li>Evite se perder com conteúdos fora do edital</li>
                  <li>Acompanhe sua evolução com cronogramas práticos</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-muted text-muted-foreground py-10 mt-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">

          {/* Links úteis */}
          <div>
            <h4 className="text-base font-semibold mb-2">Mentor Olímpico</h4>
            <ul className="space-y-2">
              <li><a href="#cronogramas" className="hover:underline">Cronogramas</a></li>
              <li><a href="#quem-somos" className="hover:underline">Quem Somos</a></li>
              <li><Link to="/login" className="hover:underline">Entrar</Link></li>
              <li><Link to="/cadastro" className="hover:underline">Criar Conta</Link></li>
            </ul>
          </div>

          {/* Trilhas */}
          <div>
            <h4 className="text-base font-semibold mb-2">Trilhas</h4>
            <ul className="space-y-2">
              <li><Link to="/trilhas/obmep" className="hover:underline">OBMEP</Link></li>
              <li><Link to="/trilhas/omif" className="hover:underline">OMIF</Link></li>
              <li><Link to="/trilhas/oimsf" className="hover:underline">OIMSF</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-base font-semibold mb-2">Contato</h4>
            <ul className="space-y-2">
              <li>Email: mentor@olimpico.com</li>
              <li>Instagram: @mentor.olimpico</li>
              <li><a href="#privacidade" className="hover:underline">Política de Privacidade</a></li>
              <li><a href="#termos" className="hover:underline">Termos de Uso</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Mentor Olímpico. Todos os direitos reservados.
        </div>
      </footer>
    </>
  )
}

export default LandingPage
