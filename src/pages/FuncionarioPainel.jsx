import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import '../styles/FuncionarioPainel.css'

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
      <main className="fp-container">
        <h2>Olá, {usuario?.nome}!</h2>
        <p className="fp-subtitulo">Estes são os eventos em que você está escalado</p>

        {carregando ? (
          <p className="fp-info">Carregando...</p>
        ) : eventos.length === 0 ? (
          <p className="fp-info">Você não está escalado em nenhum evento no momento.</p>
        ) : (
          <div className="fp-lista">
            {eventos.map(ev => {
              const minhaEntrada = ev.equipe.find(e => e.funcionario?._id === usuario?.id || e.funcionario === usuario?.id)
              return (
                <div key={ev._id} className="fp-card">
                  <div className="fp-card-topo">
                    <div>
                      <p className="fp-data">
                        {new Date(ev.dataEvento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {ev.horaInicio}
                      </p>
                      <p className="fp-local">{ev.localEvento}</p>
                    </div>
                    {minhaEntrada && (
                      <div className="fp-remuneracao">
                        <span>Sua remuneração</span>
                        <strong>R$ {Number(minhaEntrada.remuneracao).toFixed(2)}</strong>
                      </div>
                    )}
                  </div>

                  <div className="fp-brinquedos">
                    <p className="fp-label">Brinquedos do evento:</p>
                    <div className="fp-tags">
                      {ev.itens.map((item, i) => (
                        <span key={i} className="ma-item-tag">
                          {item.brinquedo?.nome} x{item.quantidade}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="fp-equipe">
                    <p className="fp-label">Equipe escalada:</p>
                    <div className="fp-tags">
                      {ev.equipe.map((e, i) => (
                        <span key={i} className="ma-item-tag">
                          {e.funcionario?.nome}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}

export default FuncionarioPainel