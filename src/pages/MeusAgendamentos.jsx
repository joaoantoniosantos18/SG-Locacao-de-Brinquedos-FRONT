import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'

const STATUS = {
  pendente:   { texto: 'Pendente',   classe: 'badge-pendente' },
  confirmado: { texto: 'Confirmado', classe: 'badge-confirmado' },
  recusado:   { texto: 'Recusado',   classe: 'badge-recusado' }
}

function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [toast, setToast] = useState('')
  const location = useLocation()

  useEffect(() => {
    if (location.state?.sucesso) {
      setToast(location.state.sucesso)
      setTimeout(() => setToast(''), 3500)
    }
    api.get('/agendamentos/meus')
      .then(res => setAgendamentos(res.data))
      .finally(() => setCarregando(false))
  }, [])

  return (
    <>
      <Navbar />
      {toast && <div className="toast-custom">{toast}</div>}
      <div className="container py-4" style={{ maxWidth: 800 }}>
        <h2 className="fw-black mb-4" style={{ letterSpacing: '-0.03em' }}>Meus Agendamentos 📋</h2>

        {carregando ? (
          <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--secundaria)' }} /></div>
        ) : agendamentos.length === 0 ? (
          <p className="text-center text-secundario fw-bold py-5">Você ainda não fez nenhum agendamento.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {agendamentos.map(ag => (
              <div key={ag._id} className="card card-hover p-3" style={{ borderRadius: 18 }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <p className="fw-black mb-0 fs-5">
                      {new Date(ag.dataEvento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {ag.horaInicio}
                    </p>
                    <p className="text-secundario fw-bold small mb-0">{ag.localEvento}</p>
                  </div>
                  <span className={`badge rounded-pill fs-6 ${STATUS[ag.status].classe}`}>
                    {STATUS[ag.status].texto}
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2 my-2">
                  {ag.itens.map((item, i) => (
                    <span key={i} className="item-tag">{item.brinquedo?.nome} x{item.quantidade}</span>
                  ))}
                </div>

                <div className="d-flex justify-content-between pt-2 border-top border-tema">
                  <span className="text-secundario fw-bold small">
                    Total: <strong style={{ color: 'var(--primaria)' }}>R$ {Number(ag.valorTotal).toFixed(2)}</strong>
                  </span>
                  <span className="text-secundario small">
                    Criado em {new Date(ag.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default MeusAgendamentos