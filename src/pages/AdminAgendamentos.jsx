import { useEffect, useState } from 'react'
import api from '../services/api'

const STATUS = {
  pendente:   { texto: 'Pendente',   classe: 'badge-pendente' },
  confirmado: { texto: 'Confirmado', classe: 'badge-confirmado' },
  recusado:   { texto: 'Recusado',   classe: 'badge-recusado' }
}

function AdminAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [funcionarios, setFuncionarios] = useState([])
  const [aberto, setAberto] = useState(null)
  const [toast, setToast] = useState('')
  const [equipeForm, setEquipeForm] = useState({})

  useEffect(() => {
    api.get('/agendamentos').then(res => setAgendamentos(res.data))
    api.get('/funcionarios').then(res => setFuncionarios(res.data))
  }, [])

  const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500) }

  const atualizarStatus = async (id, status) => {
    try {
      const equipe = (equipeForm[id] || []).filter(e => e.funcionario && e.remuneracao)
      const res = await api.put(`/agendamentos/${id}/status`, { status, equipe })
      setAgendamentos(agendamentos.map(a => a._id === id ? res.data : a))
      mostrarToast(`Status atualizado para "${STATUS[status].texto}"`)
      setAberto(null)
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

  const stats = [
    { label: 'Total', valor: agendamentos.length, cor: 'var(--secundaria)' },
    { label: 'Pendentes', valor: agendamentos.filter(a => a.status === 'pendente').length, cor: '#D97706' },
    { label: 'Confirmados', valor: agendamentos.filter(a => a.status === 'confirmado').length, cor: 'var(--verde)' },
    { label: 'Recusados', valor: agendamentos.filter(a => a.status === 'recusado').length, cor: 'var(--vermelho)' },
  ]

  return (
    <div>
      {toast && <div className="toast-custom">{toast}</div>}

      <div className="row g-3 mb-4">
        {stats.map(s => (
          <div key={s.label} className="col-6 col-md-3">
            <div className="card card-hover text-center p-3" style={{ borderRadius: 18 }}>
              <div className="fw-black" style={{ fontSize: '2.2rem', color: s.cor }}>{s.valor}</div>
              <div className="text-secundario fw-bold small">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex flex-column gap-3">
        {agendamentos.map(ag => (
          <div key={ag._id} className="card card-hover" style={{ borderRadius: 18, overflow: 'hidden' }}>
            <div className="p-3 d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer' }}
              onClick={() => setAberto(aberto === ag._id ? null : ag._id)}>
              <div className="d-flex flex-wrap align-items-center gap-3">
                <strong className="fw-black">{ag.cliente?.nome}</strong>
                <span className="text-secundario fw-bold small">
                  {new Date(ag.dataEvento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {ag.horaInicio}
                </span>
                <span className="text-secundario small">
                  {ag.itens.map(i => `${i.brinquedo?.nome} x${i.quantidade}`).join(', ')}
                </span>
                <strong style={{ color: 'var(--primaria)' }}>R$ {Number(ag.valorTotal).toFixed(2)}</strong>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className={`badge rounded-pill ${STATUS[ag.status].classe}`}>{STATUS[ag.status].texto}</span>
                <span className="text-secundario">{aberto === ag._id ? '▲' : '▼'}</span>
              </div>
            </div>

            {aberto === ag._id && (
              <div className="p-3 border-top border-tema" style={{ background: 'var(--bg-secundario)' }}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <p className="fw-black small text-uppercase mb-1" style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>Cliente</p>
                    <p className="mb-0 fw-bold">{ag.cliente?.nome} — {ag.cliente?.email}</p>
                    {ag.cliente?.telefone && <p className="mb-0 text-secundario">{ag.cliente.telefone}</p>}
                  </div>
                  <div className="col-md-6">
                    <p className="fw-black small text-uppercase mb-1" style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>Local</p>
                    <p className="mb-0 fw-bold">{ag.localEvento}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="fw-black small text-uppercase mb-1" style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>Brinquedos</p>
                    {ag.itens.map((item, i) => (
                      <p key={i} className="mb-0 fw-bold">{item.brinquedo?.nome} × {item.quantidade} = R$ {(item.brinquedo?.preco * item.quantidade).toFixed(2)}</p>
                    ))}
                  </div>
                  <div className="col-md-6">
                    <p className="fw-black small text-uppercase mb-1" style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>Data do pedido</p>
                    <p className="mb-0 fw-bold">{new Date(ag.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {ag.status === 'pendente' && (
                  <div className="mb-3">
                    <p className="fw-black small text-uppercase mb-2" style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>Escalar equipe</p>
                    {(equipeForm[ag._id] || []).map((item, i) => (
                      <div key={i} className="d-flex gap-2 mb-2">
                        <select className="form-select" value={item.funcionario}
                          onChange={e => editarFuncionario(ag._id, i, 'funcionario', e.target.value)}>
                          <option value="">Selecione o funcionário</option>
                          {funcionarios.map(f => <option key={f._id} value={f._id}>{f.nome}</option>)}
                        </select>
                        <input type="number" className="form-control" placeholder="R$ Remuneração" style={{ width: 180 }}
                          value={item.remuneracao}
                          onChange={e => editarFuncionario(ag._id, i, 'remuneracao', e.target.value)} />
                        <button className="btn btn-outline-danger fw-bold rounded-circle" style={{ width: 40, height: 40 }}
                          onClick={() => removerFuncionario(ag._id, i)}>✕</button>
                      </div>
                    ))}
                    <button className="btn btn-outline-secondary btn-sm fw-bold rounded-pill"
                      onClick={() => adicionarFuncionario(ag._id)}>+ Adicionar funcionário</button>
                  </div>
                )}

                {ag.status === 'confirmado' && ag.equipe?.length > 0 && (
                  <div className="mb-3">
                    <p className="fw-black small text-uppercase mb-2" style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>Equipe escalada</p>
                    {ag.equipe.map((e, i) => (
                      <p key={i} className="mb-1 fw-bold">{e.funcionario?.nome} — R$ {Number(e.remuneracao).toFixed(2)}</p>
                    ))}
                  </div>
                )}

                {ag.status === 'pendente' && (
                  <div className="d-flex gap-2">
                    <button className="btn fw-black rounded-pill px-4"
                      style={{ background: 'linear-gradient(135deg, var(--verde), #04B589)', color: '#fff', boxShadow: '0 4px 12px rgba(6,214,160,0.35)' }}
                      onClick={() => atualizarStatus(ag._id, 'confirmado')}>
                      ✓ Confirmar
                    </button>
                    <button className="btn fw-black rounded-pill px-4"
                      style={{ background: 'linear-gradient(135deg, var(--vermelho), #FF2F45)', color: '#fff', boxShadow: '0 4px 12px rgba(255,71,87,0.35)' }}
                      onClick={() => atualizarStatus(ag._id, 'recusado')}>
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