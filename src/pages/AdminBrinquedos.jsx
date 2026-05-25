import { useEffect, useState } from 'react'
import api from '../services/api'

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
    setImagem(null); setPreview(null); setEditandoId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()
    Object.entries(form).forEach(([k, v]) => data.append(k, v))
    if (imagem) data.append('imagem', imagem)
    try {
      editandoId ? await api.put(`/brinquedos/${editandoId}`, data) : await api.post('/brinquedos', data)
      mostrarToast(editandoId ? 'Brinquedo atualizado! 🎉' : 'Brinquedo criado! 🎉')
      resetForm(); carregar()
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
    mostrarToast('Brinquedo removido'); carregar()
  }

  return (
    <div>
      {toast && <div className="toast-custom">{toast}</div>}

      <div className="card p-4 mb-4 card-hover" style={{ borderRadius: 18 }}>
        <h5 className="fw-black mb-3" style={{ color: 'var(--secundaria)' }}>
          {editandoId ? '✏️ Editar Brinquedo' : '🆕 Novo Brinquedo'}
        </h5>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nome</label>
              <input className="form-control" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Preço (R$)</label>
              <input type="number" min="0" step="0.01" className="form-control"
                value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Quantidade total</label>
              <input type="number" min="1" className="form-control"
                value={form.quantidadeTotal} onChange={e => setForm({ ...form, quantidadeTotal: e.target.value })} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Descrição</label>
              <input className="form-control" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Disponível</label>
              <select className="form-select" value={form.disponivel}
                onChange={e => setForm({ ...form, disponivel: e.target.value === 'true' })}>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Imagem</label>
              <input type="file" accept="image/*" className="form-control" onChange={handleImagem} />
              {preview && <img src={preview} alt="preview" className="mt-2 rounded-3" style={{ width: 100, height: 75, objectFit: 'cover' }} />}
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn btn-festa px-4">{editandoId ? 'Salvar alterações' : 'Criar brinquedo'}</button>
            {editandoId && <button type="button" className="btn btn-outline-secondary fw-bold rounded-pill px-4" onClick={resetForm}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="d-flex flex-column gap-3">
        {brinquedos.map(b => (
          <div key={b._id} className="card card-hover p-3 d-flex flex-row align-items-center gap-3" style={{ borderRadius: 18 }}>
            {b.imagem
              ? <img src={`http://localhost:3000/uploads/${b.imagem}`} alt={b.nome} className="rounded-3" style={{ width: 72, height: 56, objectFit: 'cover', flexShrink: 0 }} />
              : <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: 72, height: 56, background: 'var(--bg-secundario)', fontSize: '1.5rem', flexShrink: 0 }}>🎪</div>
            }
            <div className="flex-grow-1 d-flex flex-wrap align-items-center gap-3">
              <strong className="fw-black">{b.nome}</strong>
              <span className="text-secundario fw-bold small">R$ {Number(b.preco).toFixed(2)} · {b.quantidadeTotal} unidades</span>
              <span className={`badge rounded-pill ${b.disponivel ? 'badge-confirmado' : 'badge-recusado'}`}>
                {b.disponivel ? 'Disponível' : 'Indisponível'}
              </span>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary fw-bold rounded-pill btn-sm px-3" onClick={() => editar(b)}>Editar</button>
              <button className="btn btn-outline-danger fw-bold rounded-pill btn-sm px-3" onClick={() => deletar(b._id)}>Remover</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminBrinquedos