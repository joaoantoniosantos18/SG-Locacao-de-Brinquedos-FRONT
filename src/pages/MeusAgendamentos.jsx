import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'
import '../styles/MeusAgendamentos.css'

const STATUS_LABEL = {
  pendente: { texto: 'Pendente', classe: 'badge-amarelo' },
  confirmado: { texto: 'Confirmado', classe: 'badge-verde' },
  recusado: { texto: 'Recusado', classe: 'badge-vermelho' }
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
      {toast && <div className="toast">{toast}</div>}
      <main className="ma-container">
        <h2>Meus Agendamentos</h2>

        {carregando ? (
          <p className="ma-info">Carregando...</p>
        ) : agendamentos.length === 0 ? (
          <p className="ma-info">Você ainda não fez nenhum agendamento.</p>
        ) : (
          <div className="ma-lista">
            {agendamentos.map(ag => (
              <div key={ag._id} className="ma-card">
                <div className="ma-card-topo">
                  <div>
                    <p className="ma-data">
                      {new Date(ag.dataEvento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {ag.horaInicio}
                    </p>
                    <p className="ma-local">{ag.localEvento}</p>
                  </div>
                  <span className={`badge ${STATUS_LABEL[ag.status].classe}`}>
                    {STATUS_LABEL[ag.status].texto}
                  </span>
                </div>

                <div className="ma-itens">
                  {ag.itens.map((item, i) => (
                    <span key={i} className="ma-item-tag">
                      {item.brinquedo?.nome} x{item.quantidade}
                    </span>
                  ))}
                </div>

                <div className="ma-rodape">
                  <span>Total: <strong>R$ {Number(ag.valorTotal).toFixed(2)}</strong></span>
                  <span className="ma-criado">
                    Criado em {new Date(ag.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default MeusAgendamentos