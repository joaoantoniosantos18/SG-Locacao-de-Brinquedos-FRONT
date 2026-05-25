import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

function FuncionarioPainel() {
  const [eventos, setEventos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const { usuario } = useAuth()

  useEffect(() => {
    api.get('/agendamentos/meus-eventos')
      .then(res => setEventos(res.data))
      .finally(() => setCarregando(false))
  }, [])

  return (
    <>
      <Navbar />
      <div className="container py-4" style={{ maxWidth: 800 }}>
        <h2 className="fw-black mb-1" style={{ letterSpacing: '-0.03em' }}>Olá, {usuario?.nome}! 👋</h2>
        <p className="text-secundario fw-bold mb-4">Estes são os eventos em que você está escalado</p>

        {carregando ? (
          <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--secundaria)' }} /></div>
        ) : eventos.length === 0 ? (
          <p className="text-center text-secundario fw-bold py-5">Você não está escalado em nenhum evento no momento.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {eventos.map(ev => {
              const minhaEntrada = ev.equipe.find(e => e.funcionario?._id === usuario?.id || e.funcionario === usuario?.id)
              return (
                <div key={ev._id} className="card card-hover p-3" style={{ borderRadius: 18 }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="fw-black fs-5 mb-0">
                        {new Date(ev.dataEvento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {ev.horaInicio}
                      </p>
                      <p className="text-secundario fw-bold small mb-0">{ev.localEvento}</p>
                    </div>
                    {minhaEntrada && (
                      <div className="text-end">
                        <div className="text-secundario small fw-bold">Sua remuneração</div>
                        <div className="fw-black fs-4" style={{ color: 'var(--verde)' }}>
                          R$ {Number(minhaEntrada.remuneracao).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    <p className="fw-black small text-uppercase mb-1" style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>Brinquedos</p>
                    <div className="d-flex flex-wrap gap-2">
                      {ev.itens.map((item, i) => (
                        <span key={i} className="item-tag">{item.brinquedo?.nome} x{item.quantidade}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="fw-black small text-uppercase mb-1" style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>Equipe</p>
                    <div className="d-flex flex-wrap gap-2">
                      {ev.equipe.map((e, i) => (
                        <span key={i} className="item-tag">{e.funcionario?.nome}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default FuncionarioPainel