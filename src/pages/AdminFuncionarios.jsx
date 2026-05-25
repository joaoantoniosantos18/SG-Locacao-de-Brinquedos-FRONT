import { useEffect, useState } from 'react'
import api from '../services/api'
import '../styles/AdminFuncionarios.css'
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
      mostrarToast('Funcionário cadastrado!')
      carregar()
    } catch (err) {
      mostrarToast(err.response?.data?.mensagem || 'Erro ao cadastrar')
    }
  }

  const alternarAtivo = async (id) => {
    await api.patch(`/funcionarios/${id}/ativo`)
    mostrarToast('Status atualizado')
    carregar()
  }

  return (
    <div className="af-container">
      {toast && <div className="toast">{toast}</div>}

      <form onSubmit={handleSubmit} className="af-form">
        <h3>Cadastrar Funcionário</h3>
        <div className="af-form-grid">
          <div className="campo">
            <label>Nome</label>
            <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
          </div>
          <div className="campo">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="campo">
            <label>Telefone</label>
            <input
              value={form.telefone}
              onChange={e => setForm({ ...form, telefone: mascaraTelefone(e.target.value) })}
            />
          </div>
          <div className="campo">
            <label>Senha inicial</label>
            <input type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} required />
          </div>
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Cadastrar</button>
      </form>

      <div className="af-lista">
        {funcionarios.map(f => (
          <div key={f._id} className="af-item">
            <div className="af-item-info">
              <strong>{f.nome}</strong>
              <span>{f.email}</span>
              {f.telefone && <span>{f.telefone}</span>}
            </div>
            <div className="af-item-acoes">
              <span className={`badge ${f.ativo ? 'badge-verde' : 'badge-vermelho'}`}>
                {f.ativo ? 'Ativo' : 'Inativo'}
              </span>
              <button
                className={f.ativo ? 'btn-remover-item' : 'btn-editar'}
                onClick={() => alternarAtivo(f._id)}
              >
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