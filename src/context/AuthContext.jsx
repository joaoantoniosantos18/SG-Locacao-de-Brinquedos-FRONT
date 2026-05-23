import { createContext, useContext, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    // Tenta recuperar o usuário salvo no localStorage ao carregar a página
    const salvo = localStorage.getItem('usuario')
    return salvo ? JSON.parse(salvo) : null
  })

  const login = async (email, senha) => {
    const resposta = await api.post('/auth/login', { email, senha })
    const { token, usuario } = resposta.data

    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(usuario))
    setUsuario(usuario)

    return usuario // Retorna para o componente saber o role e redirecionar
  }

  const cadastrar = async (dados) => {
    const resposta = await api.post('/auth/cadastro', dados)
    return resposta.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}