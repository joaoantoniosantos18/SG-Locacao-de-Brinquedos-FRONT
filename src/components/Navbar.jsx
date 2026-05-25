import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

function Navbar() {
  const { usuario, logout } = useAuth()
  const { tema, alternarTema } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="navbar px-4" style={{ background: 'linear-gradient(135deg, #9B5DE5, #7B2FBE)', minHeight: 64 }}>
      <Link to="/" className="navbar-brand text-white fw-black fs-4 text-decoration-none">
        🎪 SG Locação
      </Link>

      <div className="d-flex align-items-center gap-2">
        {usuario?.role === 'cliente' && (
          <>
            <Link to="/" className="btn btn-link text-white text-decoration-none fw-bold">Catálogo</Link>
            <Link to="/meus-agendamentos" className="btn btn-link text-white text-decoration-none fw-bold">Meus Agendamentos</Link>
          </>
        )}
        {usuario?.role === 'admin' && (
          <Link to="/admin" className="btn btn-link text-white text-decoration-none fw-bold">Painel Admin</Link>
        )}
        {usuario?.role === 'funcionario' && (
          <Link to="/funcionario" className="btn btn-link text-white text-decoration-none fw-bold">Meus Eventos</Link>
        )}

        <button
          className="btn rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.2)', border: 'none' }}
          onClick={alternarTema}
        >
          {tema === 'claro' ? '🌙' : '☀️'}
        </button>

        <button
          className="btn fw-bold"
          style={{ border: '2px solid rgba(255,255,255,0.6)', color: '#fff', borderRadius: 30 }}
          onClick={handleLogout}
        >
          Sair
        </button>
      </div>
    </nav>
  )
}

export default Navbar