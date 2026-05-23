import { useState } from 'react'
import Navbar from '../components/Navbar'
import AdminAgendamentos from './AdminAgendamentos'
import AdminBrinquedos from './AdminBrinquedos'
import AdminFuncionarios from './AdminFuncionarios'
import '../styles/AdminPainel.css'

function AdminPainel() {
  const [aba, setAba] = useState('agendamentos')

  return (
    <>
      <Navbar />
      <main className="ap-container">
        <h2>Painel Administrativo</h2>

        <div className="ap-abas">
          <button
            className={`ap-aba ${aba === 'agendamentos' ? 'ativa' : ''}`}
            onClick={() => setAba('agendamentos')}
          >
            Agendamentos
          </button>
          <button
            className={`ap-aba ${aba === 'brinquedos' ? 'ativa' : ''}`}
            onClick={() => setAba('brinquedos')}
          >
            Brinquedos
          </button>
          <button
            className={`ap-aba ${aba === 'funcionarios' ? 'ativa' : ''}`}
            onClick={() => setAba('funcionarios')}
          >
            Funcionários
          </button>
        </div>

        <div className="ap-conteudo">
          {aba === 'agendamentos' && <AdminAgendamentos />}
          {aba === 'brinquedos' && <AdminBrinquedos />}
          {aba === 'funcionarios' && <AdminFuncionarios />}
        </div>
      </main>
    </>
  )
}

export default AdminPainel