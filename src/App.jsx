import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav/BottomNav'
import AppBar from './components/AppBar/AppBar'
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


import Sidebar from './components/Sidebar/Sidebar'


const pageTitles = {
  '/': 'CensoUPH',
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
}

function App() {
  const location = useLocation()
  const currentTitle = pageTitles[location.pathname] || 'CensoUPH'
  const isHome = location.pathname === '/'

  return (
    <>
      <Sidebar />
      <AppBar title={currentTitle} showBack={false} />
      <main style={{
        paddingTop: 'var(--appbar-height)',
        paddingBottom: 'var(--bottom-nav-height)',
        minHeight: '100dvh',
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

          <Route path="/consultar-sinodais" element={<ConsultarSinodais />} />
          <Route path="/consultar-federacoes" element={<ConsultarFederacoes />} />
          <Route path="/consultar-uphs" element={<ConsultarUPHs />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  )
}

export default App
