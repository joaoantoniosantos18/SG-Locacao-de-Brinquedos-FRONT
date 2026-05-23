import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// roles é um array com os perfis que podem acessar a rota
// Ex: roles={['admin']} ou roles={['cliente', 'funcionario']}
function RotaProtegida({ children, roles }) {
  const { usuario } = useAuth()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RotaProtegida