import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import './index.css'

import Login from "@/pages/Login"
import Cadastro from "@/pages/Cadastro"
import Trilhas from "@/pages/Trilhas"
import Trilha from "./pages/Trilha"
import Inicio from "./pages/Inicio"
import QuemSomos from "@/pages/QuemSomos"
import Configuracoes from "./pages/Configuracoes"
import PrivateRoute from "./components/PrivateRoute"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/trilhas" element={<Trilhas />} />
        <Route path="/trilhas/:id" element={<Trilha />} />
        <Route path="/quemsomos" element={<QuemSomos />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/privateroute" element={<PrivateRoute />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
