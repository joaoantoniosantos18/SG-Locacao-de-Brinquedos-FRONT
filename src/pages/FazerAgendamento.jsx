import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'
import '../styles/FazerAgendamento.css'

function FazerAgendamento() {
  const [brinquedos, setBrinquedos] = useState([])
  const [itens, setItens] = useState([]) // [{brinquedo, quantidade}]
  const [form, setForm] = useState({ dataEvento: '', horaInicio: '', localEvento: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/brinquedos').then(res => setBrinquedos(res.data))
  }, [])

  const toggleBrinquedo = (id) => {
    const existe = itens.find(i => i.brinquedo === id)
    if (existe) {
      setItens(itens.filter(i => i.brinquedo !== id))
    } else {
      setItens([...itens, { brinquedo: id, quantidade: 1 }])
    }
  }

  const alterarQuantidade = (id, quantidade) => {
    setItens(itens.map(i => i.brinquedo === id ? { ...i, quantidade: Number(quantidade) } : i))
  }

  const calcularTotal = () => {
    return itens.reduce((total, item) => {
      const b = brinquedos.find(b => b._id === item.brinquedo)
      return total + (b ? b.preco * item.quantidade : 0)
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')

    if (itens.length === 0) {
      setErro('Selecione pelo menos um brinquedo')
      return
    }

    setCarregando(true)
    try {
      await api.post('/agendamentos', { ...form, itens })
      navigate('/meus-agendamentos', { state: { sucesso: 'Agendamento criado com sucesso!' } })
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao criar agendamento')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="ag-container">
        <h2>Fazer Agendamento</h2>
        <p className="ag-subtitulo">Selecione os brinquedos e informe os dados do evento</p>

        <form onSubmit={handleSubmit} className="ag-form">
          <section className="ag-secao">
            <h3>1. Escolha os brinquedos</h3>
            <div className="ag-brinquedos-grid">
              {brinquedos.map(b => {
                const selecionado = itens.find(i => i.brinquedo === b._id)
                return (
                  <div
                    key={b._id}
                    className={`ag-brinquedo-card ${selecionado ? 'selecionado' : ''}`}
                    onClick={() => toggleBrinquedo(b._id)}
                  >
                    {b.imagem
                      ? <img src={`http://localhost:3000/uploads/${b.imagem}`} alt={b.nome} />
                      : <div className="ag-placeholder">🎪</div>
                    }
                    <div className="ag-brinquedo-info">
                      <strong>{b.nome}</strong>
                      <span>R$ {Number(b.preco).toFixed(2)}</span>
                    </div>
                    {selecionado && (
                      <div className="ag-quantidade" onClick={e => e.stopPropagation()}>
                        <label>Qtd:</label>
                        <input
                          type="number"
                          min="1"
                          value={selecionado.quantidade}
                          onChange={e => alterarQuantidade(b._id, e.target.value)}
                        />
                      </div>
                    )}
                    {selecionado && <div className="ag-check">✓</div>}
                  </div>
                )
              })}
            </div>
          </section>

          <section className="ag-secao">
            <h3>2. Dados do evento</h3>
            <div className="ag-campos">
              <div className="campo">
                <label>Data do evento</label>
                <input
                  type="date"
                  value={form.dataEvento}
                  onChange={e => setForm({ ...form, dataEvento: e.target.value })}
                  required
                />
              </div>
              <div className="campo">
                <label>Horário de início</label>
                <input
                  type="time"
                  value={form.horaInicio}
                  onChange={e => setForm({ ...form, horaInicio: e.target.value })}
                  required
                />
              </div>
              <div className="campo campo-full">
                <label>Local do evento (endereço completo)</label>
                <input
                  type="text"
                  value={form.localEvento}
                  onChange={e => setForm({ ...form, localEvento: e.target.value })}
                  placeholder="Rua, número, bairro, cidade"
                  required
                />
              </div>
            </div>
          </section>

          {itens.length > 0 && (
            <div className="ag-resumo">
              <span>Total estimado:</span>
              <strong>R$ {calcularTotal().toFixed(2)}</strong>
            </div>
          )}

          {erro && <p className="auth-erro">{erro}</p>}

          <button type="submit" className="btn-primary" disabled={carregando}>
            {carregando ? 'Enviando...' : 'Confirmar Agendamento'}
          </button>
        </form>
      </main>
    </>
  )
}

export default FazerAgendamento