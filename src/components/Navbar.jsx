import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import '../styles/Navbar.css'

function Navbar() {
  const { usuario, logout } = useAuth()
  const { tema, alternarTema } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">SG Locação</Link>
      </div>

      <div className="navbar-acoes">
        {usuario?.role === 'cliente' && (
          <>
            <Link to="/" className="navbar-link">Catálogo</Link>
            <Link to="/meus-agendamentos" className="navbar-link">Meus Agendamentos</Link>
          </>
        )}

        {usuario?.role === 'admin' && (
          <Link to="/admin" className="navbar-link">Painel Admin</Link>
        )}

        {usuario?.role === 'funcionario' && (
          <Link to="/funcionario" className="navbar-link">Meus Eventos</Link>
        )}

        <button className="btn-tema" onClick={alternarTema} title="Alternar tema">
          {tema === 'claro' ? '🌙' : '☀️'}
        </button>

        <button className="btn-logout" onClick={handleLogout}>Sair</button>
      </div>
    </nav>
  )
}

export default Navbar