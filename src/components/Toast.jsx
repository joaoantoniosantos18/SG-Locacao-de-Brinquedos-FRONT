function Toast({ mensagem, tipo = 'sucesso' }) {
  if (!mensagem) return null
  return (
    <div className={tipo === 'erro' ? 'toast-erro' : 'toast-custom'}>
      {mensagem}
    </div>
  )
}

export default Toast