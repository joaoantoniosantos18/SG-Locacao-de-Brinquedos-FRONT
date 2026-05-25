import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mascaraTelefone } from '../utils/mascara'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      const usuario = await login(email, senha)
      if (usuario.role === 'admin') navigate('/admin')
      else if (usuario.role === 'funcionario') navigate('/funcionario')
      else navigate('/')
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao fazer login')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: 'linear-gradient(160deg, #FFF3E0, #EDE0FF)' }}>
      <div className="card border-0 shadow-lg p-4 w-100" style={{ maxWidth: 420, borderRadius: 28 }}>
        <h1 className="text-center fw-black mb-1 fs-2" style={{ color: 'var(--secundaria)' }}>🎪 SG Locação</h1>
        <p className="text-center text-secundario fw-bold mb-4">Brinquedos para seu evento</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="seu@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input type="password" className="form-control" placeholder="••••••••"
              value={senha} onChange={e => setSenha(e.target.value)} required />
          </div>

          {erro && <p className="text-danger text-center fw-bold small">{erro}</p>}

          <button type="submit" className="btn btn-festa w-100 py-2 mt-2" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-3 text-secundario fw-bold small">
          Não tem conta? <Link to="/cadastro" style={{ color: 'var(--primaria)' }} className="fw-black">Cadastre-se</Link>
        </p>
      </div>
    </div>
  )
}

export default Login