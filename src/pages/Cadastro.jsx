import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Login.css'

function Cadastro() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', telefone: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const { cadastrar } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

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
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-titulo">Criar conta</h1>
        <p className="auth-subtitulo">Preencha os dados abaixo</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="campo">
            <label>Nome completo</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="campo">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="campo">
            <label>Telefone</label>
            <input
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              placeholder="(85) 99999-9999"
            />
          </div>

          <div className="campo">
            <label>Senha</label>
            <input
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {erro && <p className="auth-erro">{erro}</p>}

          <button type="submit" className="btn-primary" disabled={carregando}>
            {carregando ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-link">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}

export default Cadastro