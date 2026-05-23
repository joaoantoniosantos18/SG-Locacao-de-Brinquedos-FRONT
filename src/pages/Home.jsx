import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'
import '../styles/Home.css'

function Home() {
  const [brinquedos, setBrinquedos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/brinquedos')
      .then(res => setBrinquedos(res.data))
      .catch(err => console.error(err))
      .finally(() => setCarregando(false))
  }, [])

  return (
    <>
      <Navbar />
      <main className="home-container">
        <div className="home-header">
          <h2>Nossos Brinquedos</h2>
          <p>Escolha os brinquedos para o seu evento e faça um agendamento</p>
        </div>

        {carregando ? (
          <p className="home-carregando">Carregando...</p>
        ) : brinquedos.length === 0 ? (
          <p className="home-vazio">Nenhum brinquedo disponível no momento.</p>
        ) : (
          <div className="home-grid">
            {brinquedos.map(b => (
              <div key={b._id} className="brinquedo-card">
                {b.imagem ? (
                  <img
                    src={`http://localhost:3000/uploads/${b.imagem}`}
                    alt={b.nome}
                    className="brinquedo-img"
                  />
                ) : (
                  <div className="brinquedo-img-placeholder">🎪</div>
                )}
                <div className="brinquedo-info">
                  <h3>{b.nome}</h3>
                  <p className="brinquedo-descricao">{b.descricao}</p>
                  <p className="brinquedo-preco">
                    R$ {Number(b.preco).toFixed(2)} <span>/ evento</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="home-agendar">
          <button className="btn-primary" onClick={() => navigate('/agendar')}>
            Fazer Agendamento
          </button>
        </div>
      </main>
    </>
  )
}

export default Home