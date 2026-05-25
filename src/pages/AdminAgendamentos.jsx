import { useEffect, useState, useMemo } from 'react'
import api from '../services/api'

const STATUS = {
  pendente:   { texto: 'Pendente',   classe: 'badge-pendente' },
  confirmado: { texto: 'Confirmado', classe: 'badge-confirmado' },
  recusado:   { texto: 'Recusado',   classe: 'badge-recusado' }
}

// Retorna o início e fim da semana (domingo a sábado) de uma data
const semanaAtual = () => {
  const hoje = new Date()
  const inicio = new Date(hoje)
  inicio.setDate(hoje.getDate() - hoje.getDay())
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date(inicio)
  fim.setDate(inicio.getDate() + 6)
  fim.setHours(23, 59, 59, 999)
  return { inicio, fim }
}

function AdminAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [funcionarios, setFuncionarios] = useState([])
  const [aberto, setAberto] = useState(null)
  const [toast, setToast] = useState('')
  const [equipeForm, setEquipeForm] = useState({})

  // Filtros
  const [tipofiltro, setTipoFiltro] = useState('mes') // 'semana' | 'mes' | 'ano' | 'todos'
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1)
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear())
  const [filtroStatus, setFiltroStatus] = useState('todos')

  useEffect(() => {
    api.get('/agendamentos').then(res => setAgendamentos(res.data))
    api.get('/funcionarios').then(res => setFuncionarios(res.data))
  }, [])

  const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500) }

  const atualizarStatus = async (id, status) => {
  // Se estiver confirmando, valida se tem pelo menos um funcionário escalado
  if (status === 'confirmado') {
    const equipe = (equipeForm[id] || []).filter(e => e.funcionario && e.remuneracao)
    if (equipe.length === 0) {
      mostrarToast('⚠️ Escale pelo menos um funcionário antes de confirmar')
      return
    }
  }

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

  // Filtragem principal — roda toda vez que algum filtro muda
  const agendamentosFiltrados = useMemo(() => {
    let lista = [...agendamentos]

    // Filtro de período
    if (tipofiltro === 'semana') {
      const { inicio, fim } = semanaAtual()
      lista = lista.filter(ag => {
        const data = new Date(ag.dataEvento)
        return data >= inicio && data <= fim
      })
    } else if (tipofiltro === 'mes') {
      lista = lista.filter(ag => {
        const data = new Date(ag.dataEvento)
        return data.getUTCMonth() + 1 === Number(filtroMes) && data.getUTCFullYear() === Number(filtroAno)
      })
    } else if (tipofiltro === 'ano') {
      lista = lista.filter(ag => {
        const data = new Date(ag.dataEvento)
        return data.getUTCFullYear() === Number(filtroAno)
      })
    }

    // Filtro de status
    if (filtroStatus !== 'todos') {
      lista = lista.filter(ag => ag.status === filtroStatus)
    }

    // Ordena do mais recente para o mais antigo
    return lista.sort((a, b) => new Date(a.dataEvento) - new Date(b.dataEvento))
  }, [agendamentos, tipofiltro, filtroMes, filtroAno, filtroStatus])

  // Stats sempre refletem a lista filtrada
  const stats = [
    { label: 'Total', valor: agendamentosFiltrados.length, cor: 'var(--secundaria)' },
    { label: 'Pendentes', valor: agendamentosFiltrados.filter(a => a.status === 'pendente').length, cor: '#D97706' },
    { label: 'Confirmados', valor: agendamentosFiltrados.filter(a => a.status === 'confirmado').length, cor: 'var(--verde)' },
    { label: 'Recusados', valor: agendamentosFiltrados.filter(a => a.status === 'recusado').length, cor: 'var(--vermelho)' },
  ]

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  const meses = [
    { v: 1, l: 'Janeiro' }, { v: 2, l: 'Fevereiro' }, { v: 3, l: 'Março' },
    { v: 4, l: 'Abril' }, { v: 5, l: 'Maio' }, { v: 6, l: 'Junho' },
    { v: 7, l: 'Julho' }, { v: 8, l: 'Agosto' }, { v: 9, l: 'Setembro' },
    { v: 10, l: 'Outubro' }, { v: 11, l: 'Novembro' }, { v: 12, l: 'Dezembro' }
  ]

  return (
    <div>
      {toast && <div className="toast-custom">{toast}</div>}

      {/* Painel de filtros */}
      <div className="card p-3 mb-4" style={{ borderRadius: 18, border: '2px solid var(--cinza-200)' }}>
        <div className="d-flex flex-wrap align-items-end gap-3">

          {/* Tipo de período */}
          <div>
            <label className="form-label small fw-black text-uppercase" style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>
              Período
            </label>
            <div className="d-flex gap-1">
              {[
                { key: 'semana', label: 'Semana' },
                { key: 'mes',    label: 'Mês' },
                { key: 'ano',    label: 'Ano' },
                { key: 'todos',  label: 'Todos' }
              ].map(t => (
                <button key={t.key} onClick={() => setTipoFiltro(t.key)}
                  className="btn btn-sm fw-bold"
                  style={{
                    borderRadius: 20,
                    border: '2px solid var(--cinza-200)',
                    background: tipofiltro === t.key ? 'linear-gradient(135deg, var(--secundaria), #7B2FBE)' : 'transparent',
                    color: tipofiltro === t.key ? '#fff' : 'var(--texto-secundario)',
                    fontSize: '0.82rem',
                    transition: 'all 0.2s'
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Seletor de mês — só aparece no modo mês */}
          {tipofiltro === 'mes' && (
            <div>
              <label className="form-label small fw-black text-uppercase" style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>
                Mês
              </label>
              <select className="form-select form-select-sm fw-bold" style={{ minWidth: 140 }}
                value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
                {meses.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
              </select>
            </div>
          )}

          {/* Seletor de ano — aparece no modo mês e ano */}
          {(tipofiltro === 'mes' || tipofiltro === 'ano') && (
            <div>
              <label className="form-label small fw-black text-uppercase" style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>
                Ano
              </label>
              <select className="form-select form-select-sm fw-bold" style={{ minWidth: 100 }}
                value={filtroAno} onChange={e => setFiltroAno(e.target.value)}>
                {anos.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}

          {/* Filtro de status */}
          <div>
            <label className="form-label small fw-black text-uppercase" style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>
              Status
            </label>
            <select className="form-select form-select-sm fw-bold" style={{ minWidth: 140 }}
              value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="pendente">Pendentes</option>
              <option value="confirmado">Confirmados</option>
              <option value="recusado">Recusados</option>
            </select>
          </div>

          {/* Label de resultado */}
          <div className="ms-auto">
            <span className="fw-black" style={{ color: 'var(--texto-secundario)', fontSize: '0.9rem' }}>
              {agendamentosFiltrados.length} agendamento{agendamentosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Cards de stats */}
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

      {/* Lista de agendamentos */}
      {agendamentosFiltrados.length === 0 ? (
        <div className="text-center py-5">
          <p className="fw-bold text-secundario fs-5">Nenhum agendamento encontrado para este período 🎪</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {agendamentosFiltrados.map(ag => (
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
                        <div key={i} className="d-flex gap-2 mb-2 flex-wrap">
                          <select className="form-select" style={{ minWidth: 180 }} value={item.funcionario}
                            onChange={e => editarFuncionario(ag._id, i, 'funcionario', e.target.value)}>
                            <option value="">Selecione o funcionário</option>
                            {funcionarios.map(f => <option key={f._id} value={f._id}>{f.nome}</option>)}
                          </select>
                          <input type="number" className="form-control" placeholder="R$ Remuneração" style={{ maxWidth: 180 }}
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
                    <div className="d-flex gap-2 flex-wrap">
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
      )}
    </div>
  )
}

export default AdminAgendamentos