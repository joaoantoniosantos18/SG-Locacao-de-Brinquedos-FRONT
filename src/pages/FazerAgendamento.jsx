import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'

function FazerAgendamento() {
  const [brinquedos, setBrinquedos] = useState([])
  const [itens, setItens] = useState([])
  const [form, setForm] = useState({ dataEvento: '', horaInicio: '', localEvento: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/brinquedos').then(res => setBrinquedos(res.data))
  }, [])

  const toggleBrinquedo = (id) => {
    const existe = itens.find(i => i.brinquedo === id)
    setItens(existe ? itens.filter(i => i.brinquedo !== id) : [...itens, { brinquedo: id, quantidade: 1 }])
  }

  const alterarQuantidade = (id, quantidade) => {
    setItens(itens.map(i => i.brinquedo === id ? { ...i, quantidade: Number(quantidade) } : i))
  }

  const calcularTotal = () => itens.reduce((total, item) => {
    const b = brinquedos.find(b => b._id === item.brinquedo)
    return total + (b ? b.preco * item.quantidade : 0)
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    if (itens.length === 0) { setErro('Selecione pelo menos um brinquedo'); return }
    setCarregando(true)
    try {
      await api.post('/agendamentos', { ...form, itens })
      navigate('/meus-agendamentos', { state: { sucesso: 'Agendamento criado com sucesso! 🎉' } })
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao criar agendamento')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="container py-4" style={{ maxWidth: 900 }}>
        <h2 className="fw-black mb-1" style={{ letterSpacing: '-0.03em' }}>Fazer Agendamento 🎠</h2>
        <p className="text-secundario fw-bold mb-4">Selecione os brinquedos e informe os dados do evento</p>

        <form onSubmit={handleSubmit}>
          <div className="card card-hover mb-4 p-4" style={{ borderRadius: 18 }}>
            <h6 className="fw-black text-uppercase mb-3" style={{ color: 'var(--secundaria)', letterSpacing: '0.08em' }}>
              1. Escolha os brinquedos
            </h6>
            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
              {brinquedos.map(b => {
                const selecionado = itens.find(i => i.brinquedo === b._id)
                return (
                  <div key={b._id} className="col">
                    <div
                      className="card h-100 position-relative"
                      style={{
                        borderRadius: 14,
                        cursor: 'pointer',
                        border: `2px solid ${selecionado ? 'var(--secundaria)' : 'var(--cinza-200)'}`,
                        boxShadow: selecionado ? '0 0 0 3px rgba(155,93,229,0.2)' : 'none',
                        background: 'var(--bg-card)'
                      }}
                      onClick={() => toggleBrinquedo(b._id)}
                    >
                      {b.imagem
                        ? <img src={`http://localhost:3000/uploads/${b.imagem}`} className="card-img-top" style={{ height: 110, objectFit: 'cover', borderRadius: '12px 12px 0 0' }} alt={b.nome} />
                        : <div className="d-flex align-items-center justify-content-center" style={{ height: 110, fontSize: '2.5rem', background: 'var(--bg-secundario)', borderRadius: '12px 12px 0 0' }}>🎪</div>
                      }
                      <div className="card-body p-2">
                        <p className="fw-black small mb-0">{b.nome}</p>
                        <p className="fw-black small mb-0" style={{ color: 'var(--primaria)' }}>R$ {Number(b.preco).toFixed(2)}</p>
                      </div>
                      {selecionado && (
                        <div className="p-2 pt-0" onClick={e => e.stopPropagation()}>
                          <div className="d-flex align-items-center gap-2">
                            <small className="text-secundario fw-bold">Qtd:</small>
                            <input type="number" min="1" className="form-control form-control-sm" style={{ width: 65 }}
                              value={selecionado.quantidade}
                              onChange={e => alterarQuantidade(b._id, e.target.value)} />
                          </div>
                        </div>
                      )}
                      {selecionado && (
                        <div className="position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center rounded-circle"
                          style={{ width: 26, height: 26, background: 'linear-gradient(135deg, var(--secundaria), var(--rosa))', color: '#fff', fontSize: '0.75rem', fontWeight: 900 }}>
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card card-hover mb-4 p-4" style={{ borderRadius: 18 }}>
            <h6 className="fw-black text-uppercase mb-3" style={{ color: 'var(--secundaria)', letterSpacing: '0.08em' }}>
              2. Dados do evento
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Data do evento</label>
                <input type="date" className="form-control"
                  value={form.dataEvento} onChange={e => setForm({ ...form, dataEvento: e.target.value })} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Horário de início</label>
                <input type="time" className="form-control"
                  value={form.horaInicio} onChange={e => setForm({ ...form, horaInicio: e.target.value })} required />
              </div>
              <div className="col-12">
                <label className="form-label">Local do evento</label>
                <input className="form-control" placeholder="Rua, número, bairro, cidade"
                  value={form.localEvento} onChange={e => setForm({ ...form, localEvento: e.target.value })} required />
              </div>
            </div>
          </div>

          {itens.length > 0 && (
            <div className="d-flex justify-content-between align-items-center p-3 rounded-4 mb-3"
              style={{ background: 'linear-gradient(135deg, var(--secundaria), #7B2FBE)', color: '#fff' }}>
              <span className="fw-bold fs-5">Total estimado</span>
              <strong className="fs-3 fw-black" style={{ color: 'var(--amarelo)' }}>R$ {calcularTotal().toFixed(2)}</strong>
            </div>
          )}

          {erro && <p className="text-danger text-center fw-bold mb-3">{erro}</p>}

          <button type="submit" className="btn btn-festa w-100 py-3 fs-5" disabled={carregando}>
            {carregando ? 'Enviando...' : '🎉 Confirmar Agendamento'}
          </button>
        </form>
      </div>
    </>
  )
}

export default FazerAgendamento