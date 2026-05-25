import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mascaraTelefone } from '../utils/mascara'

function Cadastro() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', telefone: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { cadastrar } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await cadastrar(form)
      navigate('/login')
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao cadastrar')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: 'linear-gradient(160deg, #FFF3E0, #EDE0FF)' }}>
      <div className="card border-0 shadow-lg p-4 w-100" style={{ maxWidth: 440, borderRadius: 28 }}>
        <h1 className="text-center fw-black mb-1 fs-3" style={{ color: 'var(--secundaria)' }}>Criar conta</h1>
        <p className="text-center text-secundario fw-bold mb-4">Preencha os dados abaixo</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nome completo</label>
            <input className="form-control" placeholder="Seu nome"
              value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="seu@email.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Telefone</label>
            <input className="form-control" placeholder="(85) 99999-9999"
              value={form.telefone} onChange={e => setForm({ ...form, telefone: mascaraTelefone(e.target.value) })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input type="password" className="form-control" placeholder="••••••••"
              value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} required />
          </div>

          {erro && <p className="text-danger text-center fw-bold small">{erro}</p>}

          <button type="submit" className="btn btn-festa w-100 py-2 mt-2" disabled={carregando}>
            {carregando ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center mt-3 text-secundario fw-bold small">
          Já tem conta? <Link to="/login" style={{ color: 'var(--primaria)' }} className="fw-black">Entrar</Link>
        </p>
      </div>
    </div>
  )
}

export default Cadastro