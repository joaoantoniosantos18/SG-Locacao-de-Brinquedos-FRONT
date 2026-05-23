import { useEffect, useState } from 'react'
import api from '../services/api'
import '../styles/AdminAgendamentos.css'

const STATUS_LABEL = {
  pendente: { texto: 'Pendente', classe: 'badge-amarelo' },
  confirmado: { texto: 'Confirmado', classe: 'badge-verde' },
  recusado: { texto: 'Recusado', classe: 'badge-vermelho' }
}

function AdminAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [funcionarios, setFuncionarios] = useState([])
  const [aberto, setAberto] = useState(null)
  const [toast, setToast] = useState('')
  const [equipeForm, setEquipeForm] = useState({}) // {agId: [{funcionario, remuneracao}]}

  useEffect(() => {
    api.get('/agendamentos').then(res => setAgendamentos(res.data))
    api.get('/funcionarios').then(res => setFuncionarios(res.data))
  }, [])

  const mostrarToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const atualizarStatus = async (id, status) => {
    try {
      const equipe = equipeForm[id] || []
      const res = await api.put(`/agendamentos/${id}/status`, { status, equipe })
      setAgendamentos(agendamentos.map(a => a._id === id ? res.data : a))
      mostrarToast(`Status atualizado para "${STATUS_LABEL[status].texto}"`)
    } catch (err) {
      mostrarToast(err.response?.data?.mensagem || 'Erro ao atualizar')
    }
  }

  const adicionarFuncionario = (agId) => {
    const atual = equipeForm[agId] || []
    setEquipeForm({ ...equipeForm, [agId]: [...atual, { funcionario: '', remuneracao: '' }] })
  }

  const editarFuncionario = (agId, index, campo, valor) => {
    const atual = [...(equipeForm[agId] || [])]
    atual[index] = { ...atual[index], [campo]: valor }
    setEquipeForm({ ...equipeForm, [agId]: atual })
  }

  const removerFuncionario = (agId, index) => {
    const atual = [...(equipeForm[agId] || [])]
    atual.splice(index, 1)
    setEquipeForm({ ...equipeForm, [agId]: atual })
  }

  const pendentes = agendamentos.filter(a => a.status === 'pendente').length
  const confirmados = agendamentos.filter(a => a.status === 'confirmado').length
  const recusados = agendamentos.filter(a => a.status === 'recusado').length

  return (
    <div className="aa-container">
      {toast && <div className="toast">{toast}</div>}

      <div className="aa-stats">
        <div className="aa-stat"><span>{agendamentos.length}</span><p>Total</p></div>
        <div className="aa-stat amarelo"><span>{pendentes}</span><p>Pendentes</p></div>
        <div className="aa-stat verde"><span>{confirmados}</span><p>Confirmados</p></div>
        <div className="aa-stat vermelho"><span>{recusados}</span><p>Recusados</p></div>
      </div>

      <div className="aa-lista">
        {agendamentos.map(ag => (
          <div key={ag._id} className="aa-card">
            <div className="aa-linha" onClick={() => setAberto(aberto === ag._id ? null : ag._id)}>
              <div className="aa-linha-info">
                <strong>{ag.cliente?.nome}</strong>
                <span>{new Date(ag.dataEvento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {ag.horaInicio}</span>
                <span>{ag.itens.map(i => `${i.brinquedo?.nome} x${i.quantidade}`).join(', ')}</span>
                <span className="aa-total">R$ {Number(ag.valorTotal).toFixed(2)}</span>
              </div>
              <div className="aa-linha-direita">
                <span className={`badge ${STATUS_LABEL[ag.status].classe}`}>{STATUS_LABEL[ag.status].texto}</span>
                <span className="aa-seta">{aberto === ag._id ? '▲' : '▼'}</span>
              </div>
            </div>

            {aberto === ag._id && (
              <div className="aa-detalhes">
                <div className="aa-detalhes-grid">
                  <div>
                    <p className="aa-label">Cliente</p>
                    <p>{ag.cliente?.nome} — {ag.cliente?.email}</p>
                    {ag.cliente?.telefone && <p>{ag.cliente.telefone}</p>}
                  </div>
                  <div>
                    <p className="aa-label">Local do evento</p>
                    <p>{ag.localEvento}</p>
                  </div>
                  <div>
                    <p className="aa-label">Brinquedos</p>
                    {ag.itens.map((item, i) => (
                      <p key={i}>{item.brinquedo?.nome} × {item.quantidade} = R$ {(item.brinquedo?.preco * item.quantidade).toFixed(2)}</p>
                    ))}
                  </div>
                  <div>
                    <p className="aa-label">Data do agendamento</p>
                    <p>{new Date(ag.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {ag.status === 'pendente' && (
                  <div className="aa-equipe-form">
                    <p className="aa-label">Escalar equipe (opcional ao confirmar)</p>
                    {(equipeForm[ag._id] || []).map((item, i) => (
                      <div key={i} className="aa-equipe-linha">
                        <select
                          value={item.funcionario}
                          onChange={e => editarFuncionario(ag._id, i, 'funcionario', e.target.value)}
                        >
                          <option value="">Selecione o funcionário</option>
                          {funcionarios.map(f => (
                            <option key={f._id} value={f._id}>{f.nome}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Remuneração (R$)"
                          value={item.remuneracao}
                          onChange={e => editarFuncionario(ag._id, i, 'remuneracao', e.target.value)}
                        />
                        <button className="btn-remover" onClick={() => removerFuncionario(ag._id, i)}>✕</button>
                      </div>
                    ))}
                    <button className="btn-add-func" onClick={() => adicionarFuncionario(ag._id)}>
                      + Adicionar funcionário
                    </button>
                  </div>
                )}

                {ag.status === 'confirmado' && ag.equipe?.length > 0 && (
                  <div className="aa-equipe-view">
                    <p className="aa-label">Equipe escalada</p>
                    {ag.equipe.map((e, i) => (
                      <p key={i}>{e.funcionario?.nome} — R$ {Number(e.remuneracao).toFixed(2)}</p>
                    ))}
                  </div>
                )}

                {ag.status === 'pendente' && (
                  <div className="aa-botoes">
                    <button className="btn-confirmar" onClick={() => atualizarStatus(ag._id, 'confirmado')}>
                      ✓ Confirmar
                    </button>
                    <button className="btn-recusar" onClick={() => atualizarStatus(ag._id, 'recusado')}>
                      ✕ Recusar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminAgendamentos