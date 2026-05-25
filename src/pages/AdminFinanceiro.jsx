import { useEffect, useState, useMemo } from 'react'
import api from '../services/api'

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

const meses = [
  { v: 1, l: 'Janeiro' }, { v: 2, l: 'Fevereiro' }, { v: 3, l: 'Março' },
  { v: 4, l: 'Abril' }, { v: 5, l: 'Maio' }, { v: 6, l: 'Junho' },
  { v: 7, l: 'Julho' }, { v: 8, l: 'Agosto' }, { v: 9, l: 'Setembro' },
  { v: 10, l: 'Outubro' }, { v: 11, l: 'Novembro' }, { v: 12, l: 'Dezembro' }
]

function AdminFinanceiro() {
  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [tipoFiltro, setTipoFiltro] = useState('mes')
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1)
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear())

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  useEffect(() => {
    api.get('/agendamentos')
      .then(res => setAgendamentos(res.data))
      .finally(() => setCarregando(false))
  }, [])

  const agendamentosFiltrados = useMemo(() => {
    let lista = [...agendamentos]

    if (tipoFiltro === 'semana') {
      const { inicio, fim } = semanaAtual()
      lista = lista.filter(ag => {
        const data = new Date(ag.dataEvento)
        return data >= inicio && data <= fim
      })
    } else if (tipoFiltro === 'mes') {
      lista = lista.filter(ag => {
        const data = new Date(ag.dataEvento)
        return data.getUTCMonth() + 1 === Number(filtroMes) && data.getUTCFullYear() === Number(filtroAno)
      })
    } else if (tipoFiltro === 'ano') {
      lista = lista.filter(ag => {
        const data = new Date(ag.dataEvento)
        return data.getUTCFullYear() === Number(filtroAno)
      })
    }

    return lista
  }, [agendamentos, tipoFiltro, filtroMes, filtroAno])

  const financeiro = useMemo(() => {
    const confirmados = agendamentosFiltrados.filter(a => a.status === 'confirmado')
    const pendentes   = agendamentosFiltrados.filter(a => a.status === 'pendente')
    const recusados   = agendamentosFiltrados.filter(a => a.status === 'recusado')

    const faturamento = confirmados.reduce((s, a) => s + Number(a.valorTotal), 0)
    const emAberto    = pendentes.reduce((s, a) => s + Number(a.valorTotal), 0)
    const ticketMedio = confirmados.length > 0 ? faturamento / confirmados.length : 0

    // Ranking conta SÓ confirmados
    const brinquedosMap = {}
    confirmados.forEach(ag => {
      ag.itens.forEach(item => {
        const nome = item.brinquedo?.nome || 'Desconhecido'
        if (!brinquedosMap[nome]) brinquedosMap[nome] = { quantidade: 0, receita: 0 }
        brinquedosMap[nome].quantidade += item.quantidade
        brinquedosMap[nome].receita += (item.brinquedo?.preco || 0) * item.quantidade
      })
    })

    const rankingBrinquedos = Object.entries(brinquedosMap)
      .map(([nome, dados]) => ({ nome, ...dados }))
      .sort((a, b) => b.quantidade - a.quantidade)

    const maxQuantidade = rankingBrinquedos[0]?.quantidade || 1

    return { faturamento, emAberto, ticketMedio, confirmados, pendentes, recusados, rankingBrinquedos, maxQuantidade }
  }, [agendamentosFiltrados])

  const labelPeriodo = () => {
    if (tipoFiltro === 'semana') return 'esta semana'
    if (tipoFiltro === 'mes') return `${meses.find(m => m.v === Number(filtroMes))?.l} de ${filtroAno}`
    if (tipoFiltro === 'ano') return `ano de ${filtroAno}`
    return 'todos os períodos'
  }

  if (carregando) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--secundaria)' }} />
    </div>
  )

  return (
    <div>
      {/* Filtro de período */}
      <div className="card p-3 mb-4" style={{ borderRadius: 18, border: '2px solid var(--cinza-200)' }}>
        <div className="d-flex flex-wrap align-items-end gap-3">
          <div>
            <label className="form-label small fw-black text-uppercase mb-2"
              style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>
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
                    background: tipoFiltro === t.key ? 'linear-gradient(135deg, var(--secundaria), #7B2FBE)' : 'transparent',
                    color: tipoFiltro === t.key ? '#fff' : 'var(--texto-secundario)',
                    fontSize: '0.82rem',
                    transition: 'all 0.2s'
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tipoFiltro === 'mes' && (
            <div>
              <label className="form-label small fw-black text-uppercase mb-2"
                style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>Mês</label>
              <select className="form-select form-select-sm fw-bold" style={{ minWidth: 140 }}
                value={filtroMes} onChange={e => setFiltroMes(Number(e.target.value))}>
                {meses.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
              </select>
            </div>
          )}

          {(tipoFiltro === 'mes' || tipoFiltro === 'ano') && (
            <div>
              <label className="form-label small fw-black text-uppercase mb-2"
                style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>Ano</label>
              <select className="form-select form-select-sm fw-bold" style={{ minWidth: 100 }}
                value={filtroAno} onChange={e => setFiltroAno(Number(e.target.value))}>
                {anos.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}

          <div className="ms-auto">
            <span className="fw-black small" style={{ color: 'var(--texto-secundario)' }}>
              Exibindo {labelPeriodo()}
            </span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card card-hover text-center p-3" style={{ borderRadius: 18, borderTop: '4px solid var(--verde)' }}>
            <div className="small fw-black text-uppercase mb-1" style={{ color: 'var(--verde)', letterSpacing: '0.07em', fontSize: '0.72rem' }}>
              Faturamento
            </div>
            <div className="fw-black" style={{ fontSize: '1.6rem', color: 'var(--verde)' }}>
              R$ {financeiro.faturamento.toFixed(2)}
            </div>
            <div className="small text-secundario fw-bold">
              {financeiro.confirmados.length} confirmado{financeiro.confirmados.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card card-hover text-center p-3" style={{ borderRadius: 18, borderTop: '4px solid #D97706' }}>
            <div className="small fw-black text-uppercase mb-1" style={{ color: '#D97706', letterSpacing: '0.07em', fontSize: '0.72rem' }}>
              Em Aberto
            </div>
            <div className="fw-black" style={{ fontSize: '1.6rem', color: '#D97706' }}>
              R$ {financeiro.emAberto.toFixed(2)}
            </div>
            <div className="small text-secundario fw-bold">
              {financeiro.pendentes.length} pendente{financeiro.pendentes.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card card-hover text-center p-3" style={{ borderRadius: 18, borderTop: '4px solid var(--secundaria)' }}>
            <div className="small fw-black text-uppercase mb-1" style={{ color: 'var(--secundaria)', letterSpacing: '0.07em', fontSize: '0.72rem' }}>
              Ticket Médio
            </div>
            <div className="fw-black" style={{ fontSize: '1.6rem', color: 'var(--secundaria)' }}>
              R$ {financeiro.ticketMedio.toFixed(2)}
            </div>
            <div className="small text-secundario fw-bold">por evento confirmado</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card card-hover text-center p-3" style={{ borderRadius: 18, borderTop: '4px solid var(--vermelho)' }}>
            <div className="small fw-black text-uppercase mb-1" style={{ color: 'var(--vermelho)', letterSpacing: '0.07em', fontSize: '0.72rem' }}>
              Recusados
            </div>
            <div className="fw-black" style={{ fontSize: '1.6rem', color: 'var(--vermelho)' }}>
              {financeiro.recusados.length}
            </div>
            <div className="small text-secundario fw-bold">no período</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Ranking de brinquedos */}
        <div className="col-md-6">
          <div className="card p-4" style={{ borderRadius: 18, border: '2px solid var(--cinza-200)' }}>
            <h6 className="fw-black text-uppercase mb-3" style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>
              🎪 Brinquedos mais alugados
            </h6>

            {financeiro.rankingBrinquedos.length === 0 ? (
              <p className="text-secundario fw-bold text-center py-3">Nenhum dado no período</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {financeiro.rankingBrinquedos.map((b, i) => (
                  <div key={b.nome}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-black d-flex align-items-center justify-content-center rounded-circle"
                          style={{
                            width: 26, height: 26, fontSize: '0.75rem',
                            background: i === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                                       : i === 1 ? 'linear-gradient(135deg, #C0C0C0, #A0A0A0)'
                                       : i === 2 ? 'linear-gradient(135deg, #CD7F32, #A0522D)'
                                       : 'var(--cinza-200)',
                            color: i < 3 ? '#fff' : 'var(--texto-secundario)'
                          }}>
                          {i + 1}
                        </span>
                        <span className="fw-black" style={{ fontSize: '0.9rem' }}>{b.nome}</span>
                      </div>
                      <div className="text-end">
                        <span className="fw-black small" style={{ color: 'var(--primaria)' }}>
                          {b.quantidade}x
                        </span>
                        {b.receita > 0 && (
                          <span className="text-secundario small fw-bold ms-2">
                            R$ {b.receita.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="rounded-pill overflow-hidden" style={{ height: 8, background: 'var(--cinza-200)' }}>
                      <div className="rounded-pill h-100" style={{
                        width: `${(b.quantidade / financeiro.maxQuantidade) * 100}%`,
                        background: i === 0 ? 'linear-gradient(90deg, var(--secundaria), var(--rosa))'
                                   : i === 1 ? 'linear-gradient(90deg, var(--azul), var(--secundaria))'
                                   : 'linear-gradient(90deg, var(--primaria), var(--amarelo))',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Eventos confirmados no período */}
        <div className="col-md-6">
          <div className="card p-4" style={{ borderRadius: 18, border: '2px solid var(--cinza-200)' }}>
            <h6 className="fw-black text-uppercase mb-3" style={{ color: 'var(--secundaria)', letterSpacing: '0.07em' }}>
              ✅ Eventos confirmados
            </h6>

            {financeiro.confirmados.length === 0 ? (
              <p className="text-secundario fw-bold text-center py-3">Nenhum evento confirmado no período</p>
            ) : (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: 380, overflowY: 'auto' }}>
                {financeiro.confirmados
                  .sort((a, b) => new Date(a.dataEvento) - new Date(b.dataEvento))
                  .map(ag => (
                    <div key={ag._id} className="p-3 rounded-3 d-flex justify-content-between align-items-center"
                      style={{ background: 'var(--bg-secundario)', border: '2px solid var(--cinza-200)' }}>
                      <div>
                        <p className="fw-black mb-0 small">{ag.cliente?.nome}</p>
                        <p className="text-secundario mb-0 small fw-bold">
                          {new Date(ag.dataEvento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {ag.horaInicio}
                        </p>
                        <p className="mb-0 small text-secundario fw-bold">
                          {ag.itens.map(i => `${i.brinquedo?.nome} x${i.quantidade}`).join(', ')}
                        </p>
                      </div>
                      <div className="fw-black text-end" style={{ color: 'var(--verde)', whiteSpace: 'nowrap' }}>
                        R$ {Number(ag.valorTotal).toFixed(2)}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {financeiro.confirmados.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3"
                style={{ borderTop: '2px solid var(--cinza-200)' }}>
                <span className="fw-black text-secundario">Total confirmado</span>
                <span className="fw-black fs-5" style={{ color: 'var(--verde)' }}>
                  R$ {financeiro.faturamento.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminFinanceiro