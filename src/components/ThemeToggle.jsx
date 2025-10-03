import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  return (
    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-accent transition">
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  )
}
