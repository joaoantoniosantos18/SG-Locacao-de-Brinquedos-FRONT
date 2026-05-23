import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    // Lê preferência salva ou usa preferência do sistema
    const salvo = localStorage.getItem('tema')
    if (salvo) return salvo
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema)
    localStorage.setItem('tema', tema)
  }, [tema])

  const alternarTema = () => {
    setTema(t => t === 'claro' ? 'escuro' : 'claro')
  }

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}