import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Clientes from './pages/Clientes'
import Productos from './pages/Productos'
import Plazos from './pages/Plazos'
import NuevaFactura from './pages/NuevaFactura'
import Historial from './pages/Historial'

function Inicio() {
  return (
    <div className="flex items-center gap-4 p-6">
      <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-800">GQG System</h1>
        <p className="text-gray-400 text-sm mt-0.5">Módulo de Pagos — seleccioná una opción del menú</p>
      </div>
    </div>
  )
}

export default function App() {
  const [usuario, setUsuario] = useState(() => sessionStorage.getItem('gqg_user') || null)

  const handleLogin = (user) => { setUsuario(user); sessionStorage.setItem('gqg_user', user) }
  const handleLogout = () => { setUsuario(null); sessionStorage.removeItem('gqg_user') }

  if (!usuario) return <Login onLogin={handleLogin} />

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar usuario={usuario} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-brand h-11 flex items-center justify-end px-4 shrink-0">
          <div className="flex items-center gap-2 text-white text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span>{usuario}</span>
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/facturas" element={<NuevaFactura />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/plazos" element={<Plazos />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
