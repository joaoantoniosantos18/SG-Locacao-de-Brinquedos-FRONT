import { Routes, Route, Navigate } from 'react-router-dom'
import RotaProtegida from './components/RotaProtegida'

import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Home from './pages/Home'
import FazerAgendamento from './pages/FazerAgendamento'
import MeusAgendamentos from './pages/MeusAgendamentos'
import AdminPainel from './pages/AdminPainel'
import FuncionarioPainel from './pages/FuncionarioPainel'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      <Route path="/" element={
        <RotaProtegida roles={['cliente']}>
          <Home />
        </RotaProtegida>
      } />

      <Route path="/agendar" element={
        <RotaProtegida roles={['cliente']}>
          <FazerAgendamento />
        </RotaProtegida>
      } />

      <Route path="/meus-agendamentos" element={
        <RotaProtegida roles={['cliente']}>
          <MeusAgendamentos />
        </RotaProtegida>
      } />

      <Route path="/admin" element={
        <RotaProtegida roles={['admin']}>
          <AdminPainel />
        </RotaProtegida>
      } />

      <Route path="/funcionario" element={
        <RotaProtegida roles={['funcionario']}>
          <FuncionarioPainel />
        </RotaProtegida>
      } />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App