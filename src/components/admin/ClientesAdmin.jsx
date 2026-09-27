import React, { useState, useEffect } from 'react';
import {
  Eye, Check, X, Loader2, Search, Download, ExternalLink,
  Car, MapPin, Shield, UserCheck, Clock, Calendar,
  CreditCard, FileText, AlertCircle, AlertTriangle,
  ChevronDown, ChevronUp, Filter, RefreshCw, Plane, Hotel
} from 'lucide-react';

const API = 'https://welovepalop.com/api';

const STATUS_RESERVA = {
  pendente:   { label: 'Pendente',   cor: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  confirmada: { label: 'Confirmada', cor: 'bg-green-50 text-green-700 border-green-200' },
  cancelada:  { label: 'Cancelada',  cor: 'bg-red-50 text-red-700 border-red-200' },
  concluida:  { label: 'Concluída',  cor: 'bg-blue-50 text-blue-700 border-blue-200' }
};

const STATUS_DOCS = {
  sem_docs:     { label: 'Sem documentos', cor: 'bg-gray-50 text-gray-600 border-gray-200', icone: '—' },
  pendente:     { label: 'Em verificação', cor: 'bg-yellow-50 text-yellow-700 border-yellow-200', icone: '⏳' },
  aprovado:     { label: 'Verificado',     cor: 'bg-green-50 text-green-700 border-green-200', icone: '✅' },
  rejeitado:    { label: 'Rejeitado',      cor: 'bg-red-50 text-red-700 border-red-200', icone: '❌' }
};

const ReservasCarroAdmin = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [filtroDocs, setFiltroDocs] = useState('todos');
  const [expandida, setExpandida] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
  const [rejeitando, setRejeitando] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [visualizandoDoc, setVisualizandoDoc] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [aProcessar, setAProcessar] = useState(null);

  // ==================== CARREGAR ====================
  const carregarReservas = async () => {
    setLoading(true);
    try {
      const adminSession = JSON.parse(localStorage.getItem('morabeza_admin') || '{}');
      const adminId = adminSession.id || 21;

      const params = new URLSearchParams({ admin_id: adminId });
      if (filtroStatus !== 'todas') params.append('status', filtroStatus);
      if (filtroDocs !== 'todos')   params.append('docs', filtroDocs);

      const res = await fetch(`${API}/admin/reservas_carro_listar.php?${params}`);
      const data = await res.json();

      if (data.success) setReservas(data.data || []);
      else console.error(data.message);
    } catch (err) {
      console.error('Erro ao carregar reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarReservas(); }, [filtroStatus, filtroDocs]);

  // ==================== DETALHE ====================
  const abrirDetalhe = async (reservaId) => {
    if (expandida === reservaId) {
      setExpandida(null);
      setDetalhe(null);
      return;
    }
    setExpandida(reservaId);
    setCarregandoDetalhe(true);
    try {
      const adminSession = JSON.parse(localStorage.getItem('morabeza_admin') || '{}');
      const adminId = adminSession.id || 21;

      const res = await fetch(`${API}/admin/reserva_carro_detalhe.php?id=${reservaId}&admin_id=${adminId}`);
      const data = await res.json();

      if (data.success) setDetalhe(data.data);
      else setDetalhe(null);
    } catch (err) {
      console.error('Erro ao carregar detalhe:', err);
      setDetalhe(null);
    } finally {
      setCarregandoDetalhe(false);
    }
  };

  // ==================== AÇÕES ====================
  const verificarCondutor = async (reservaId, acao, motivoRejeicao = null) => {
    setAProcessar(reservaId);
    try {
      const adminSession = JSON.parse(localStorage.getItem('morabeza_admin') || '{}');
      const adminId = adminSession.id || 21;

      const res = await fetch(`${API}/admin/reserva_carro_verificar.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reserva_id: reservaId,
          admin_id: adminId,
          acao,
          motivo: motivoRejeicao
        })
      });
      const data = await res.json();

      if (data.success) {
        setRejeitando(null);
        setMotivo('');
        carregarReservas();
        if (expandida === reservaId) abrirDetalhe(reservaId);
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (err) {
      alert('Erro de conexão: ' + err.message);
    } finally {
      setAProcessar(null);
    }
  };

  // ==================== FILTROS ====================
  const filtrar = () => reservas.filter(r => {
    const t = pesquisa.toLowerCase();
    return (
      r.codigo_reserva?.toLowerCase().includes(t) ||
      r.cliente_nome?.toLowerCase().includes(t) ||
      r.cliente_email?.toLowerCase().includes(t) ||
      r.carro_titulo?.toLowerCase().includes(t) ||
      r.matricula?.toLowerCase().includes(t)
    );
  });

  // ==================== HELPERS ====================
  const fmt = (v) => parseFloat(v || 0).toLocaleString('pt-PT', { minimumFractionDigits: 0 });
  const fmtData = (d) => d ? new Date(d).toLocaleDateString('pt-PT') : '—';
  const fmtDataHora = (d) => d ? new Date(d).toLocaleString('pt-PT') : '—';

  const badge = (tipo, valor) => {
    const cfg = tipo === 'reserva' ? STATUS_RESERVA[valor] : STATUS_DOCS[valor];
    if (!cfg) return null;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border ${cfg.cor}`}>
        {tipo === 'docs' && <span>{cfg.icone}</span>}
        {cfg.label}
      </span>
    );
  };

  // ==================== RENDER ====================
  return (
    <div className="space-y-6">

      {/* ==================== CABEÇALHO ==================== */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580]">Reservas de Veículos</h1>
          <p className="text-gray-600 mt-1">
            Auditoria de levantamento, caução, políticas e verificação do condutor.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Código, cliente, carro..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
            />
          </div>
          <button
            onClick={carregarReservas}
            className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
            title="Atualizar"
          >
            <RefreshCw size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* ==================== FILTROS ==================== */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-gray-400" />
        <span className="text-xs text-gray-500 font-bold uppercase">Status:</span>
        {['todas', 'pendente', 'confirmada', 'cancelada', 'concluida'].map(s => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filtroStatus === s
                ? 'bg-[#003580] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s === 'todas' ? 'Todas' : STATUS_RESERVA[s]?.label}
          </button>
        ))}

        <span className="text-xs text-gray-500 font-bold uppercase ml-4">Docs:</span>
        {['todos', 'pendente', 'aprovado', 'rejeitado'].map(d => (
          <button
            key={d}
            onClick={() => setFiltroDocs(d)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filtroDocs === d
                ? 'bg-[#003580] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {d === 'todos' ? 'Todos' : STATUS_DOCS[d]?.label}
          </button>
        ))}
      </div>

      {/* ==================== TABELA ==================== */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center items-center gap-2">
            <Loader2 className="animate-spin text-[#003580]" size={24} />
            <span className="text-gray-600">A carregar reservas...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4">Reserva</th>
                  <th className="px-4 py-4">Cliente</th>
                  <th className="px-4 py-4">Veículo</th>
                  <th className="px-4 py-4">Levantamento</th>
                  <th className="px-4 py-4">Devolução</th>
                  <th className="px-4 py-4 text-right">Pago Online</th>
                  <th className="px-4 py-4 text-right">Caução</th>
                  <th className="px-4 py-4 text-center">Docs</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-4 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrar().length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8 text-gray-500">
                      Nenhuma reserva encontrada
                    </td>
                  </tr>
                ) : (
                  filtrar().map((r) => (
                    <React.Fragment key={r.id}>
                      <tr
                        className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                          expandida === r.id ? 'bg-blue-50/40' : ''
                        }`}
                        onClick={() => abrirDetalhe(r.id)}
                      >
                        <td className="px-4 py-4">
                          <div className="font-bold text-[#003580] text-xs">
                            {r.codigo_reserva}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {fmtData(r.data_reserva)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900 text-xs truncate max-w-[140px]">
                            {r.cliente_nome}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate max-w-[140px]">
                            {r.cliente_email}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-xs font-medium truncate max-w-[140px]">
                            {r.carro_titulo}
                          </div>
                          {r.matricula && (
                            <div className="text-[10px] text-gray-400 font-mono">
                              {r.matricula}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-xs">{fmtData(r.data_levantamento)}</div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock size={10} /> {r.hora_levantamento?.slice(0, 5)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-xs">{fmtData(r.data_devolucao)}</div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock size={10} /> {r.hora_devolucao?.slice(0, 5)}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="text-xs font-bold text-gray-900">
                            {fmt(r.preco_total)} <span className="text-[10px] font-normal">CVE</span>
                          </div>
                          <div className={`text-[10px] ${
                            r.pagamento_status === 'pago' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {r.pagamento_status}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {parseInt(r.exige_caucao) === 1 ? (
                            <>
                              <div className="text-xs font-bold text-amber-700">
                                {fmt(r.caucao_valor)} <span className="text-[10px] font-normal">CVE</span>
                              </div>
                              <div className="text-[10px] text-gray-400">no levantamento</div>
                            </>
                          ) : (
                            <span className="text-[10px] text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {badge('docs', r.docs_status || 'sem_docs')}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {badge('reserva', r.status)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); abrirDetalhe(r.id); }}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                            title={expandida === r.id ? 'Fechar' : 'Ver detalhe'}
                          >
                            {expandida === r.id ? <ChevronUp size={14} /> : <Eye size={14} />}
                          </button>
                        </td>
                      </tr>

                      {/* ==================== DETALHE EXPANDIDO ==================== */}
                      {expandida === r.id && (
                        <tr>
                          <td colSpan="10" className="bg-blue-50/30 p-0">
                            {carregandoDetalhe ? (
                              <div className="py-8 flex justify-center items-center gap-2">
                                <Loader2 className="animate-spin text-[#003580]" size={20} />
                                <span className="text-gray-500 text-sm">A carregar detalhe...</span>
                              </div>
                            ) : detalhe ? (
                              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">

                                {/* ---- LEVANTAMENTO ---- */}
                                <Bloco icone={<MapPin size={16} />} titulo="Levantamento (14)">
                                  <Linha label="Ilha" valor={detalhe.levantamento_ilha || '—'} />
                                  <Linha label="Local" valor={detalhe.levantamento_local || '—'} />
                                  <Linha
                                    label="Horário"
                                    valor={`${detalhe.levantamento_hora_inicio?.slice(0, 5) || '—'} → ${detalhe.levantamento_hora_fim?.slice(0, 5) || '—'}`}
                                  />
                                  <Linha
                                    label="Devolução"
                                    valor={parseInt(detalhe.devolucao_mesmo_local) === 1
                                      ? 'Mesmo local'
                                      : detalhe.devolucao_local_alternativo || 'Outro local'}
                                  />
                                  {parseInt(detalhe.entrega_aeroporto) === 1 && (
                                    <Linha
                                      icon={<Plane size={12} />}
                                      label="Entrega aeroporto"
                                      valor={`+${fmt(detalhe.entrega_custo_aeroporto)} CVE`}
                                      destaque="text-blue-600"
                                    />
                                  )}
                                  {parseInt(detalhe.entrega_hotel) === 1 && (
                                    <Linha
                                      icon={<Hotel size={12} />}
                                      label="Entrega hotel"
                                      valor={`+${fmt(detalhe.entrega_custo_hotel)} CVE`}
                                      destaque="text-blue-600"
                                    />
                                  )}
                                  {detalhe.levantamento_notas && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Notas</p>
                                      <p className="text-[11px] text-gray-600 italic">
                                        "{detalhe.levantamento_notas}"
                                      </p>
                                    </div>
                                  )}
                                </Bloco>

                                {/* ---- CAUÇÃO ---- */}
                                <Bloco
                                  icone={<Shield size={16} />}
                                  titulo="Caução (15/16)"
                                  destaque={parseInt(detalhe.exige_caucao) === 1 ? 'amber' : null}
                                >
                                  {parseInt(detalhe.exige_caucao) === 1 ? (
                                    <>
                                      <Linha
                                        label="Valor"
                                        valor={`${fmt(detalhe.caucao_valor)} CVE`}
                                        destaque="text-amber-700 font-bold"
                                      />
                                      <Linha label="Formas" valor={detalhe.caucao_formas || '—'} />
                                      {detalhe.caucao_condicoes && (
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                          <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                                            Condições
                                          </p>
                                          <p className="text-[11px] text-gray-600 italic">
                                            "{detalhe.caucao_condicoes}"
                                          </p>
                                        </div>
                                      )}
                                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2">
                                        <p className="text-[10px] text-amber-800 font-bold">
                                          ⚠️ Paga no local, fora do valor online
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <p className="text-[12px] text-gray-400 py-4 text-center">
                                      Este veículo não exige caução
                                    </p>
                                  )}
                                </Bloco>

                                {/* ---- POLÍTICAS CONDUTOR ---- */}
                                <Bloco icone={<UserCheck size={16} />} titulo="Condutor (17)">
                                  <Linha label="Idade mínima" valor={`${detalhe.idade_minima} anos`} />
                                  <Linha label="Carta mínima" valor={`${detalhe.carta_minima_anos} anos`} />
                                  <Linha label="Franquia" valor={`${fmt(detalhe.franquia)} CVE`} />
                                  <Linha
                                    label="Combustível"
                                    valor={{
                                      cheio_cheio: 'Cheio → Cheio',
                                      cheio_vazio: 'Cheio → Vazio',
                                      mesmo_nivel: 'Mesmo nível'
                                    }[detalhe.politica_combustivel] || detalhe.politica_combustivel}
                                  />
                                  <Linha
                                    label="Limite KM"
                                    valor={parseInt(detalhe.limite_km) === 0
                                      ? 'Ilimitado'
                                      : `${fmt(detalhe.limite_km)} km (+${fmt(detalhe.custo_km_extra)}/extra)`}
                                  />
                                  <Linha
                                    label="2º condutor"
                                    valor={parseInt(detalhe.segundo_condutor) === 1 ? 'Permitido' : 'Não permitido'}
                                  />
                                  {detalhe.politica_atraso && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Atraso</p>
                                      <p className="text-[11px] text-gray-600 italic">
                                        "{detalhe.politica_atraso}"
                                      </p>
                                    </div>
                                  )}
                                </Bloco>

                                {/* ---- PAGAMENTO ---- */}
                                <Bloco icone={<CreditCard size={16} />} titulo="Pagamento (21)">
                                  <Linha label="Subtotal" valor={`${fmt(detalhe.preco_total)} CVE`} />
                                  <Linha
                                    label="Comissão Morabeza"
                                    valor={`${fmt(detalhe.comissao)} CVE`}
                                    destaque="text-blue-600"
                                  />
                                  <Linha
                                    label="Líquido proprietário"
                                    valor={`${fmt(detalhe.valor_liquido_anfitriao)} CVE`}
                                    destaque="text-green-700 font-bold"
                                  />
                                  <Linha
                                    label="Status pagamento"
                                    valor={detalhe.pagamento_status}
                                    destaque={detalhe.pagamento_status === 'pago' ? 'text-green-600' : 'text-yellow-600'}
                                  />
                                </Bloco>

                                {/* ---- ACEITE DO CLIENTE ---- */}
                                <Bloco icone={<Check size={16} />} titulo="Aceite do Cliente">
                                  {detalhe.aceite_cliente ? (
                                    <>
                                      <Linha label="Aceitou" valor="Sim ✅" destaque="text-green-700 font-bold" />
                                      <Linha label="Em" valor={fmtDataHora(detalhe.aceite_em)} />
                                      <Linha label="IP" valor={detalhe.aceite_ip || '—'} />
                                    </>
                                  ) : (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                      <p className="text-[11px] text-red-700 font-bold">
                                        ⚠️ Sem registo de aceite
                                      </p>
                                    </div>
                                  )}
                                </Bloco>

                                {/* ---- DOCUMENTOS CONDUTOR ---- */}
                                <Bloco icone={<FileText size={16} />} titulo="Documentos (19/20)">
                                  {detalhe.documentos && detalhe.documentos.length > 0 ? (
                                    <div className="space-y-2">
                                      {detalhe.documentos.map((doc, i) => (
                                        <div
                                          key={i}
                                          className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5"
                                        >
                                          <div className="min-w-0">
                                            <p className="text-[11px] font-bold truncate">
                                              {doc.tipo_label || doc.tipo}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                              {fmtData(doc.enviado_em)}
                                            </p>
                                          </div>
                                          <button
                                            onClick={() => setVisualizandoDoc(doc.url)}
                                            className="p-1.5 rounded hover:bg-blue-100 text-blue-600"
                                            title="Ver documento"
                                          >
                                            <Eye size={12} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-[12px] text-gray-400 py-3 text-center">
                                      Nenhum documento enviado
                                    </p>
                                  )}

                                  {/* Ações de verificação */}
                                  {detalhe.docs_status === 'pendente' && (
                                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                                      <button
                                        onClick={() => verificarCondutor(detalhe.id, 'aprovar')}
                                        disabled={aProcessar === detalhe.id}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                                      >
                                        {aProcessar === detalhe.id ? (
                                          <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                          <Check size={12} />
                                        )}
                                        Aprovar
                                      </button>
                                      <button
                                        onClick={() => setRejeitando({ reservaId: detalhe.id })}
                                        disabled={aProcessar === detalhe.id}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg border border-red-200 disabled:opacity-50"
                                      >
                                        <X size={12} /> Rejeitar
                                      </button>
                                    </div>
                                  )}
                                </Bloco>

                              </div>
                            ) : (
                              <div className="py-6 text-center text-gray-400 text-sm">
                                Erro ao carregar detalhe
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================== MODAL PDF ==================== */}
      {visualizandoDoc && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">Documento do Condutor</h3>
              <div className="flex gap-2">
                <a
                  href={visualizandoDoc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg"
                >
                  <ExternalLink size={16} /> Abrir
                </a>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = visualizandoDoc;
                    link.download = 'documento.pdf';
                    link.click();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg"
                >
                  <Download size={16} /> Baixar
                </button>
                <button
                  onClick={() => { setVisualizandoDoc(null); setPdfError(null); }}
                  className="p-2 hover:bg-gray-200 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 bg-gray-100">
              {pdfError ? (
                <div className="h-full flex flex-col items-center justify-center bg-red-50 rounded-lg">
                  <X size={48} className="text-red-500 mb-4" />
                  <p className="text-red-600 text-center max-w-md">{pdfError}</p>
                </div>
              ) : (
                <iframe
                  src={visualizandoDoc}
                  className="w-full h-full rounded-lg shadow-lg"
                  title="Visualizador"
                  style={{ border: 'none' }}
                  onError={() => setPdfError('Erro ao carregar o documento.')}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL REJEIÇÃO ==================== */}
      {rejeitando && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Rejeitar Documentos</h3>
            <p className="text-sm text-gray-500 mb-4">
              O cliente será notificado para corrigir os documentos.
            </p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              placeholder="Ex: Carta de condução ilegível, documento expirado..."
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm mb-4 resize-none"
              autoFocus
            />
            <div className="flex gap-3 justify-end text-sm font-semibold">
              <button
                onClick={() => { setRejeitando(null); setMotivo(''); }}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => verificarCondutor(rejeitando.reservaId, 'rejeitar', motivo)}
                disabled={!motivo.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm disabled:opacity-50"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== COMPONENTES AUXILIARES ====================
const Bloco = ({ icone, titulo, children, destaque }) => (
  <div className={`bg-white rounded-xl border p-4 ${
    destaque === 'amber' ? 'border-amber-200' : 'border-gray-100'
  }`}>
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
      <span className="text-[#003580]">{icone}</span>
      <h4 className="text-[12px] font-bold text-gray-800 uppercase tracking-wide">
        {titulo}
      </h4>
    </div>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const Linha = ({ label, valor, destaque, icon }) => (
  <div className="flex items-center justify-between text-[11px]">
    <span className="text-gray-500 flex items-center gap-1">
      {icon}
      {label}
    </span>
    <span className={`font-medium text-gray-800 text-right ${destaque || ''}`}>
      {valor}
    </span>
  </div>
);

export default ReservasCarroAdmin;