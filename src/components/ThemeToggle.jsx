import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    //Carrega do localStorage ou usa preferência do sistema
    return localStorage.getItem("theme") || 
           (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove ambas as classes primeiro
    root.classList.remove("light", "dark")
    // Adiciona a classe atual
    root.classList.add(theme)
    // Salva no localStorage
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  return (
    <button 
      onClick={toggleTheme} 
      className="p-2 rounded-full hover:bg-accent transition"
      aria-label="Alternar tema"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  )
}