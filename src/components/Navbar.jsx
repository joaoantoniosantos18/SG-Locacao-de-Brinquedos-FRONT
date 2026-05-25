import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

function Navbar() {
  const { usuario, logout } = useAuth()
  const { tema, alternarTema } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
   <nav className="navbar px-3 py-2 flex-wrap gap-2" style={{ background: 'linear-gradient(135deg, #9B5DE5, #7B2FBE)', minHeight: 64 }}>
  <Link to="/" className="navbar-brand text-white fw-black fs-5 text-decoration-none">
    🎪 SG Locação
  </Link>

  <div className="d-flex align-items-center flex-wrap gap-2">
    {usuario?.role === 'cliente' && (
      <>
        <Link to="/" className="btn btn-link text-white text-decoration-none fw-bold p-1 small">Catálogo</Link>
        <Link to="/meus-agendamentos" className="btn btn-link text-white text-decoration-none fw-bold p-1 small">Meus Agendamentos</Link>
      </>
    )}
    {usuario?.role === 'admin' && (
      <Link to="/admin" className="btn btn-link text-white text-decoration-none fw-bold p-1 small">Painel Admin</Link>
    )}
    {usuario?.role === 'funcionario' && (
      <Link to="/funcionario" className="btn btn-link text-white text-decoration-none fw-bold p-1 small">Meus Eventos</Link>
    )}
    <button
      className="btn rounded-circle d-flex align-items-center justify-content-center"
      style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', border: 'none', flexShrink: 0 }}
      onClick={alternarTema}
    >
      {tema === 'claro' ? '🌙' : '☀️'}
    </button>
    <button
      className="btn fw-bold small"
      style={{ border: '2px solid rgba(255,255,255,0.6)', color: '#fff', borderRadius: 30, flexShrink: 0 }}
      onClick={handleLogout}
    >
      Sair
    </button>
  </div>
</nav>
  )
}

export default Navbar