import { useEffect, useState } from 'react'
import api from '../services/api'
import '../styles/AdminBrinquedos.css'

function AdminBrinquedos() {
  const [brinquedos, setBrinquedos] = useState([])
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '', quantidadeTotal: '', disponivel: true })
  const [imagem, setImagem] = useState(null)
  const [preview, setPreview] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => { carregar() }, [])

  const carregar = () => api.get('/brinquedos/todos').then(res => setBrinquedos(res.data))

  const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500) }

  const handleImagem = (e) => {
    const file = e.target.files[0]
    setImagem(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  const resetForm = () => {
    setForm({ nome: '', descricao: '', preco: '', quantidadeTotal: '', disponivel: true })
    setImagem(null)
    setPreview(null)
    setEditandoId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()
    Object.entries(form).forEach(([k, v]) => data.append(k, v))
    if (imagem) data.append('imagem', imagem)

    try {
      if (editandoId) {
        await api.put(`/brinquedos/${editandoId}`, data)
        mostrarToast('Brinquedo atualizado!')
      } else {
        await api.post('/brinquedos', data)
        mostrarToast('Brinquedo criado!')
      }
      resetForm()
      carregar()
    } catch (err) {
      mostrarToast(err.response?.data?.mensagem || 'Erro ao salvar')
    }
  }

  const editar = (b) => {
    setForm({ nome: b.nome, descricao: b.descricao || '', preco: b.preco, quantidadeTotal: b.quantidadeTotal, disponivel: b.disponivel })
    setPreview(b.imagem ? `http://localhost:3000/uploads/${b.imagem}` : null)
    setEditandoId(b._id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deletar = async (id) => {
    if (!window.confirm('Remover este brinquedo?')) return
    await api.delete(`/brinquedos/${id}`)
    mostrarToast('Brinquedo removido')
    carregar()
  }

  return (
    <div className="ab-container">
      {toast && <div className="toast">{toast}</div>}

      <form onSubmit={handleSubmit} className="ab-form">
        <h3>{editandoId ? 'Editar Brinquedo' : 'Novo Brinquedo'}</h3>
        <div className="ab-form-grid">
          <div className="campo">
            <label>Nome</label>
            <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
          </div>
          <div className="campo">
            <label>Preço (R$)</label>
            <input type="number" min="0" step="0.01" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} required />
          </div>
          <div className="campo">
            <label>Quantidade total</label>
            <input type="number" min="1" value={form.quantidadeTotal} onChange={e => setForm({ ...form, quantidadeTotal: e.target.value })} required />
          </div>
          <div className="campo">
            <label>Disponível</label>
            <select value={form.disponivel} onChange={e => setForm({ ...form, disponivel: e.target.value === 'true' })}>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
          <div className="campo campo-full">
            <label>Descrição</label>
            <input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
          </div>
          <div className="campo campo-full">
            <label>Imagem</label>
            <input type="file" accept="image/*" onChange={handleImagem} />
            {preview && <img src={preview} alt="preview" className="ab-preview" />}
          </div>
        </div>
        <div className="ab-form-botoes">
          <button type="submit" className="btn-primary">{editandoId ? 'Salvar alterações' : 'Criar brinquedo'}</button>
          {editandoId && <button type="button" className="btn-cancelar" onClick={resetForm}>Cancelar</button>}
        </div>
      </form>

      <div className="ab-lista">
        {brinquedos.map(b => (
          <div key={b._id} className="ab-item">
            {b.imagem
              ? <img src={`http://localhost:3000/uploads/${b.imagem}`} alt={b.nome} className="ab-item-img" />
              : <div className="ab-item-placeholder">🎪</div>
            }
            <div className="ab-item-info">
              <strong>{b.nome}</strong>
              <span>R$ {Number(b.preco).toFixed(2)} · {b.quantidadeTotal} unidades</span>
              <span className={`badge ${b.disponivel ? 'badge-verde' : 'badge-vermelho'}`}>
                {b.disponivel ? 'Disponível' : 'Indisponível'}
              </span>
            </div>
            <div className="ab-item-acoes">
              <button className="btn-editar" onClick={() => editar(b)}>Editar</button>
              <button className="btn-remover-item" onClick={() => deletar(b._id)}>Remover</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminBrinquedos