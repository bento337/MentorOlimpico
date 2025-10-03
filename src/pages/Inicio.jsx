import { Button } from "@/components/ui/button"
import Header from "@/components/Header"
import { Link } from "react-router-dom"
import { auth } from "@/services/firebaseConfig"

function Inicio() {
  const user = auth.currentUser

  return (
    <>
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-4 text-center">Bem-vindo ao Mentor Olímpico!</h1>
        <p className="text-muted-foreground mb-8 text-center">
          {user ? `Olá, ${user.email}!` : "Carregando..."} <br />
          Aqui você encontrará suas trilhas de estudo, recomendações e progresso.
        </p>

        {/* Ações principais */}
        <div className="flex justify-center gap-4 mb-12">
          <Button asChild><Link to="/trilhas">Minhas Trilhas</Link></Button>
          <Button variant="outline" asChild><Link to="/configuracoes">Configurações</Link></Button>
        </div>

        {/* Seção de progresso */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Seu Progresso</h2>
          <div className="p-6 rounded-lg shadow-sm border bg-white dark:bg-background">
            <p className="text-muted-foreground">Você concluiu <strong>30%</strong> da trilha OBMEP.</p>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 mt-3">
              <div className="bg-primary h-3 rounded-full" style={{ width: "30%" }}></div>
            </div>
          </div>
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

export default Inicio
