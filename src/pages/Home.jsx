import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'

function Home() {
  const [brinquedos, setBrinquedos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/brinquedos')
      .then(res => setBrinquedos(res.data))
      .finally(() => setCarregando(false))
  }, [])

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="text-center mb-4">
          <h2 className="fw-black fs-1" style={{ color: 'var(--texto-principal)', letterSpacing: '-0.03em' }}>
            Nossos <span style={{ color: 'var(--primaria)' }}>Brinquedos</span> 🎠
          </h2>
          <p className="fw-bold text-secundario">Escolha os brinquedos para o seu evento e faça um agendamento</p>
        </div>

        {carregando ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--secundaria)' }} />
          </div>
        ) : brinquedos.length === 0 ? (
          <p className="text-center text-secundario fw-bold py-5">Nenhum brinquedo disponível no momento.</p>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {brinquedos.map(b => (
              <div key={b._id} className="col">
                <div className="card h-100 card-hover" style={{ borderRadius: 18 }}>
                  {b.imagem
                    ? <img src={`http://localhost:3000/uploads/${b.imagem}`} className="card-img-top" style={{ height: 190, objectFit: 'cover' }} alt={b.nome} />
                    : <div className="d-flex align-items-center justify-content-center bg-secundario" style={{ height: 190, fontSize: '3.5rem' }}>🎪</div>
                  }
                  <div className="card-body">
                    <h5 className="card-title fw-black">{b.nome}</h5>
                    <p className="card-text text-secundario small fw-bold">{b.descricao}</p>
                    <p className="fw-black fs-5 mb-0" style={{ color: 'var(--primaria)' }}>
                      R$ {Number(b.preco).toFixed(2)} <span className="text-secundario fw-normal small">/ evento</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-5">
          <button className="btn btn-festa px-5 py-3 fs-5" onClick={() => navigate('/agendar')}>
            🎉 Fazer Agendamento
          </button>
        </div>
      </div>
    </>
  )
}

export default Home