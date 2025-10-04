// main.jsx (ATUALIZADO)
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home" // componente inteligente
import './index.css'

import Login from "@/pages/Login"
import Cadastro from "@/pages/Cadastro"
import Trilhas from "@/pages/Trilhas"
import Trilha from "./pages/Trilha"
import QuemSomos from "@/pages/QuemSomos"
import Configuracoes from "./pages/Configuracoes"
import PrivateRoute from "./components/PrivateRoute"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rota principal inteligente */}
        <Route path="/" element={<Home />} />
        
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/quemsomos" element={<QuemSomos />} />
        
        {/* Rotas Protegidas */}
        <Route path="/trilhas" element={<PrivateRoute><Trilhas /></PrivateRoute>} />
        <Route path="/trilhas/:id" element={<PrivateRoute><Trilha /></PrivateRoute>} />
        <Route path="/configuracoes" element={<PrivateRoute><Configuracoes /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)