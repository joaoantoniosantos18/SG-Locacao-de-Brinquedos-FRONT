import { useState } from 'react'
import Navbar from '../components/Navbar'
import AdminAgendamentos from './AdminAgendamentos'
import AdminBrinquedos from './AdminBrinquedos'
import AdminFuncionarios from './AdminFuncionarios'

function AdminPainel() {
  const [aba, setAba] = useState('agendamentos')

  return (
    <>
      <Navbar />
      <div className="container py-4" style={{ maxWidth: 1100 }}>
        <h2 className="fw-black mb-4" style={{ letterSpacing: '-0.03em' }}>Painel Administrativo ⚙️</h2>

        {/* <div className="d-flex gap-2 mb-4 p-1 rounded-pill w-auto d-inline-flex"
          style={{ background: 'var(--bg-card)', border: '2px solid var(--cinza-200)' }}>
          {['agendamentos', 'brinquedos', 'funcionarios'].map(a => (
            <button key={a} onClick={() => setAba(a)}
              className="btn fw-bold px-4 py-2"
              style={{
                borderRadius: 30,
                border: 'none',
                background: aba === a ? 'linear-gradient(135deg, var(--secundaria), #7B2FBE)' : 'transparent',
                color: aba === a ? '#fff' : 'var(--texto-secundario)',
                boxShadow: aba === a ? '0 4px 12px rgba(155,93,229,0.35)' : 'none',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}>
              {a === 'agendamentos' ? '📋 Agendamentos' : a === 'brinquedos' ? '🎪 Brinquedos' : '👥 Funcionários'}
            </button>
          ))}
        </div> */}

        {/* {aba === 'agendamentos' && <AdminAgendamentos />}
        {aba === 'brinquedos'   && <AdminBrinquedos />}
        {aba === 'funcionarios' && <AdminFuncionarios />} */}

        <div className="mb-4" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div className="d-flex gap-2 p-1 rounded-pill"
            style={{ background: 'var(--bg-card)', border: '2px solid var(--cinza-200)', width: 'max-content', minWidth: '100%' }}>
            {[
              { key: 'agendamentos', label: '📋 Agendamentos' },
              { key: 'brinquedos',   label: '🎪 Brinquedos' },
              { key: 'funcionarios', label: '👥 Funcionários' }
            ].map(a => (
              <button key={a.key} onClick={() => setAba(a.key)}
                className="btn fw-bold px-3 py-2"
                style={{
                  borderRadius: 30,
                  border: 'none',
                  whiteSpace: 'nowrap',
                  background: aba === a.key ? 'linear-gradient(135deg, var(--secundaria), #7B2FBE)' : 'transparent',
                  color: aba === a.key ? '#fff' : 'var(--texto-secundario)',
                  boxShadow: aba === a.key ? '0 4px 12px rgba(155,93,229,0.35)' : 'none',
                  transition: 'all 0.2s',
                  fontSize: '0.9rem'
                }}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
              </div>
            
            </>
  )
}

export default AdminPainel