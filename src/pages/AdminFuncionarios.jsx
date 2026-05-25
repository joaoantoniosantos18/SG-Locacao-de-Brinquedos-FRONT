import { useEffect, useState } from 'react'
import api from '../services/api'
import { mascaraTelefone } from '../utils/mascara'

function AdminFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([])
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '' })
  const [toast, setToast] = useState('')

  useEffect(() => { carregar() }, [])

  const carregar = () => api.get('/funcionarios').then(res => setFuncionarios(res.data))
  const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/funcionarios', form)
      setForm({ nome: '', email: '', telefone: '', senha: '' })
      mostrarToast('Funcionário cadastrado! 🎉'); carregar()
    } catch (err) {
      mostrarToast(err.response?.data?.mensagem || 'Erro ao cadastrar')
    }
  }

  const alternarAtivo = async (id) => {
    await api.patch(`/funcionarios/${id}/ativo`)
    mostrarToast('Status atualizado'); carregar()
  }

  return (
    <div>
      {toast && <div className="toast-custom">{toast}</div>}

      <div className="card p-4 mb-4 card-hover" style={{ borderRadius: 18 }}>
        <h5 className="fw-black mb-3" style={{ color: 'var(--secundaria)' }}>👥 Cadastrar Funcionário</h5>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nome</label>
              <input className="form-control" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Telefone</label>
              <input className="form-control" placeholder="(85) 99999-9999"
                value={form.telefone} onChange={e => setForm({ ...form, telefone: mascaraTelefone(e.target.value) })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Senha inicial</label>
              <input type="password" className="form-control" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn btn-festa px-4 mt-3">Cadastrar</button>
        </form>
      </div>

      <div className="d-flex flex-column gap-3">
        {funcionarios.map(f => (
          <div key={f._id} className="card card-hover p-3 d-flex flex-row justify-content-between align-items-center" style={{ borderRadius: 18 }}>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="d-flex align-items-center justify-content-center rounded-circle fw-black text-white"
                style={{ width: 44, height: 44, background: 'linear-gradient(135deg, var(--secundaria), var(--rosa))', fontSize: '1.1rem', flexShrink: 0 }}>
                {f.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong className="fw-black d-block">{f.nome}</strong>
                <span className="text-secundario small fw-bold">{f.email}</span>
                {f.telefone && <span className="text-secundario small fw-bold ms-2">· {f.telefone}</span>}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className={`badge rounded-pill ${f.ativo ? 'badge-confirmado' : 'badge-recusado'}`}>
                {f.ativo ? 'Ativo' : 'Inativo'}
              </span>
              <button
                className={`btn btn-sm fw-bold rounded-pill px-3 ${f.ativo ? 'btn-outline-danger' : 'btn-outline-success'}`}
                onClick={() => alternarAtivo(f._id)}>
                {f.ativo ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminFuncionarios