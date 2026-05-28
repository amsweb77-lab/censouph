import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import AppBar from './components/AppBar/AppBar'
import Sidebar from './components/Sidebar/Sidebar'
import Home from './pages/Home/Home'
import CNHP from './pages/CNHP/CNHP'
import Noticias from './pages/Noticias/Noticias'
import Downloads from './pages/Downloads/Downloads'
import Menu from './pages/Menu/Menu'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Login from './pages/Login/Login'
import CadastroUsuario from './pages/CadastroUsuario/CadastroUsuario'
import CadastroSinodal from './pages/CadastroSinodal/CadastroSinodal'
import CadastroFederacao from './pages/CadastroFederacao/CadastroFederacao'
import CadastroUPH from './pages/CadastroUPH/CadastroUPH'
import CadastroDiretoria from './pages/CadastroDiretoria/CadastroDiretoria'
import ConsultarSinodais from './pages/ConsultarSinodais/ConsultarSinodais'
import ConsultarFederacoes from './pages/ConsultarFederacoes/ConsultarFederacoes'
import ConsultarUPHs from './pages/ConsultarUPHs/ConsultarUPHs'
import Tesouraria from './pages/Tesouraria/Tesouraria'
import MapaIPB from './pages/MapaIPB/MapaIPB'
import GerenciarBanners from './pages/GerenciarBanners/GerenciarBanners'

const pageTitles = {
  '/': 'SECNHP - Secretário Executivo da Confederação Nacional de Homens Presbiterianos',
  '/cnhp': 'CNHP',
  '/noticias': 'Notícias da UPH',
  '/downloads': 'Materiais para download',
  '/menu': 'Estatística',
  '/formularios': 'Formulários',
  '/tesouraria': 'Tesouraria',
  '/login': 'Login',
  '/cadastro-usuario': 'Cadastro de Usuário',
  '/cadastrar-sinodais': 'Cadastro de Sinodais',
  '/cadastrar-federacoes': 'Cadastro de Federações',
  '/cadastrar-uphs': 'Cadastro de UPHs',
  '/cadastrar-diretorias': 'Cadastro de Diretorias',
  '/consultar-sinodais': 'Consulta de Sinodais',
  '/consultar-federacoes': 'Consulta de Federações',
  '/consultar-uphs': 'Consulta de UPHs',
  '/mapa-ipb': 'Mapa IPB',
  '/gerenciar-banners': 'Gerenciar Banners',
}

function App() {
  const location = useLocation()
  const currentTitle = pageTitles[location.pathname] || 'SECNHP - Secretário Executivo da Confederação Nacional de Homens Presbiterianos'

  // Mobile hamburger menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      {/* Sidebar: desktop rail + mobile drawer */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* AppBar: visible on mobile only, has hamburger button */}
        <AppBar
          title={currentTitle}
          showBack={false}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main style={{
          flex: 1,
          paddingBottom: 'var(--bottom-nav-height)',
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cnhp" element={<CNHP />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/formularios" element={<Downloads />} />
            <Route path="/tesouraria" element={<Tesouraria />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro-usuario" element={<CadastroUsuario />} />

            <Route path="/cadastrar-sinodais" element={<ProtectedRoute><CadastroSinodal /></ProtectedRoute>} />
            <Route path="/cadastrar-federacoes" element={<ProtectedRoute><CadastroFederacao /></ProtectedRoute>} />
            <Route path="/cadastrar-uphs" element={<ProtectedRoute><CadastroUPH /></ProtectedRoute>} />
            <Route path="/cadastrar-diretorias" element={<ProtectedRoute><CadastroDiretoria /></ProtectedRoute>} />
            <Route path="/gerenciar-banners" element={<ProtectedRoute><GerenciarBanners /></ProtectedRoute>} />

            <Route path="/consultar-sinodais" element={<ConsultarSinodais />} />
            <Route path="/consultar-federacoes" element={<ConsultarFederacoes />} />
            <Route path="/consultar-uphs" element={<ConsultarUPHs />} />
            <Route path="/mapa-ipb" element={<MapaIPB />} />
          </Routes>
        </main>

        {/* Bottom Nav removido — navegação feita pelo menu hambúrguer */}
      </div>
    </div>
  )
}

export default App
