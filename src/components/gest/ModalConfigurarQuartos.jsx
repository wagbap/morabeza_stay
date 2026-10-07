// src/features/alojamento/components/ModalConfigurarQuartos.jsx
// ============================================================
// 🛡️ Modal Configurar Quartos — com calendário de bloqueio (Sincronizado)
// ============================================================
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X, Bed, Users, Lock, Unlock, Loader2, Calendar, AlertCircle, CheckCircle,
  ChevronLeft, ChevronRight, Info
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API_BASE = 'https://welovepalop.com';
const FETCH_TIMEOUT_MS = 10000;
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_SEMANA = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

// ============================================================
// Helpers
// ============================================================
const safeJsonParse = (text) => {
  if (typeof text !== 'string') return null;
  const i = text.indexOf('{'), f = text.lastIndexOf('}');
  if (i === -1 || f === -1 || f <= i) return null;
  try { return JSON.parse(text.substring(i, f + 1)); } catch { return null; }
};

const fetchComTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const fetchJsonSeguro = async (url, options = {}) => {
  const res = await fetchComTimeout(url, options);
  const text = await res.text();
  const data = safeJsonParse(text);
  if (!data) throw new Error(`Resposta inválida (${res.status})`);
  return { data, ok: res.ok, status: res.status };
};

const pad2 = (n) => String(n).padStart(2, '0');
const formatarData = (a, m, d) => `${a}-${pad2(m + 1)}-${pad2(d)}`;
const normalizarData = (s) => {
  if (!s) return null;
  const str = String(s).substring(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : null;
};

const hojeStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const isDataPassada = (dataStr) => {
  if (!dataStr) return false;
  return dataStr < hojeStr();
};

const isHoje = (dataStr) => dataStr === hojeStr();

// ============================================================
// MiniCalendarioBloqueio (Sincronizado por filtragem local)
// ============================================================
function MiniCalendarioBloqueio({
  tipoId,
  alojamentoId,
  onToast,
  mostrarToast,
  isGlobal = false,
  refreshKey = 0,
}) {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [bloqueios, setBloqueios] = useState({});
  const [reservados, setReservados] = useState(new Set());
  const [selecionados, setSelecionados] = useState(new Set());
  const [carregando, setCarregando] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [modo, setModo] = useState('bloquear');

  const carregar = useCallback(async () => {
    if (!alojamentoId) {
      setBloqueios({});
      setReservados(new Set());
      return;
    }
    setCarregando(true);
    try {
      // 🔑 Buscamos todos os bloqueios do alojamento para o mês (igual ao Calendario.jsx)
      const params = new URLSearchParams({
        action: 'listar',
        alojamento_id: String(alojamentoId),
        ano: String(ano),
        mes: String(mes + 1),
      });

      const url = `${API_BASE}/api/alojamento_bloqueios.php?${params.toString()}`;
      const { data } = await fetchJsonSeguro(url);

      if (!data?.success) {
        mostrarToast?.('erro', data?.error || 'Erro a carregar bloqueios.');
        return;
      }

      const mapa = {};
      (data.bloqueios || []).forEach(b => {
        const d = normalizarData(b.data);
        if (!d) return;
        const qid = Number(b.quarto_id ?? 0);

        if (isGlobal) {
          // Visão global: considera bloqueado se for global (0) ou qualquer quarto
          if (qid === 0) mapa[d] = true;
        } else {
          // Visão por quarto: qid === 0 (alojamento inteiro) ou qid corresponde ao quarto específico
          if (qid === 0 || qid === Number(tipoId)) {
            mapa[d] = true;
          }
        }
      });
      setBloqueios(mapa);

      const reservadosSet = new Set();
      (data.dias_reservados || []).forEach(d => {
        const nd = normalizarData(d);
        if (nd) reservadosSet.add(nd);
      });
      setReservados(reservadosSet);
    } catch (e) {
      console.error('[MiniCalendario]', e);
      mostrarToast?.('erro', 'Erro de rede ao carregar.');
    } finally {
      setCarregando(false);
    }
  }, [alojamentoId, tipoId, ano, mes, mostrarToast, isGlobal, refreshKey]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    setSelecionados(new Set());
    setDragStart(null);
    setIsDragging(false);
  }, [mes, ano, tipoId]);

  const dias = useMemo(() => {
    const primeiro = new Date(ano, mes, 1);
    const ultimo = new Date(ano, mes + 1, 0);
    const dow = primeiro.getDay();
    const startOffset = dow === 0 ? 6 : dow - 1;
    const arr = [];
    const diasPrev = new Date(ano, mes, 0).getDate();

    for (let i = startOffset - 1; i >= 0; i--) {
      arr.push({ dia: diasPrev - i, mesAtual: false, dataStr: null, isHoje: false });
    }
    for (let d = 1; d <= ultimo.getDate(); d++) {
      const dataStr = formatarData(ano, mes, d);
      arr.push({ dia: d, mesAtual: true, dataStr, isHoje: isHoje(dataStr) });
    }
    const faltam = 42 - arr.length;
    for (let i = 1; i <= faltam; i++) {
      arr.push({ dia: i, mesAtual: false, dataStr: null, isHoje: false });
    }
    return arr;
  }, [ano, mes]);

  const getEstado = (dataStr) => {
    if (!dataStr) return 'fora';
    if (isDataPassada(dataStr)) return 'passado';
    if (reservados.has(dataStr)) return 'reservado';
    if (bloqueios[dataStr]) return 'bloqueado';
    return 'livre';
  };

  const corEstado = (estado, sel) => {
    if (sel) {
      return modo === 'bloquear'
        ? 'bg-red-500 text-white border-red-600 shadow-md scale-95 border'
        : 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-95 border';
    }
    switch (estado) {
      case 'livre': return 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100';
      case 'bloqueado': return 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100';
      case 'reservado': return 'bg-blue-50 text-blue-700 border border-blue-200 cursor-not-allowed';
      case 'passado': return 'bg-slate-50 text-slate-300 border border-slate-200 cursor-not-allowed opacity-60';
      default: return 'bg-transparent text-slate-300 border border-transparent';
    }
  };

  const onDown = (dataStr) => {
    if (!dataStr) return;
    if (isDataPassada(dataStr)) return;
    const est = getEstado(dataStr);
    if (est === 'reservado') return;
    setModo(est === 'bloqueado' ? 'desbloquear' : 'bloquear');
    setIsDragging(true);
    setDragStart(dataStr);
    setSelecionados(new Set([dataStr]));
  };

  const onEnter = (dataStr) => {
    if (!isDragging || !dragStart || !dataStr) return;
    if (isDataPassada(dataStr)) return;
    if (getEstado(dataStr) === 'reservado') return;

    const a = new Date(dragStart + 'T00:00:00');
    const b = new Date(dataStr + 'T00:00:00');
    const [ini, fim] = a <= b ? [a, b] : [b, a];
    const nova = new Set();
    const cur = new Date(ini);
    while (cur <= fim) {
      const s = formatarData(cur.getFullYear(), cur.getMonth(), cur.getDate());
      if (isDataPassada(s)) { cur.setDate(cur.getDate() + 1); continue; }
      const est = getEstado(s);
      if (modo === 'bloquear' && est !== 'reservado') nova.add(s);
      if (modo === 'desbloquear' && est === 'bloqueado') nova.add(s);
      cur.setDate(cur.getDate() + 1);
    }
    setSelecionados(nova);
  };

  useEffect(() => {
    const up = () => { if (isDragging) setIsDragging(false); };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, [isDragging]);

  const aplicar = async () => {
    if (selecionados.size === 0) return;
    setAGuardar(true);
    try {
      const endpoint = modo === 'bloquear'
        ? `${API_BASE}/api/alojamento_bloqueios.php?action=bloquear`
        : `${API_BASE}/api/alojamento_bloqueios.php?action=desbloquear`;

      const { data } = await fetchJsonSeguro(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alojamento_id: alojamentoId,
          quarto_id: isGlobal ? 0 : Number(tipoId),
          datas: Array.from(selecionados),
          motivo: isGlobal ? 'Bloqueio manual (alojamento inteiro)' : 'Bloqueio manual (quarto)',
        }),
      });

      if (data?.success) {
        mostrarToast?.('sucesso',
          modo === 'bloquear'
            ? `${selecionados.size} data(s) bloqueada(s).`
            : `${selecionados.size} data(s) desbloqueada(s).`);
        setSelecionados(new Set());
        await carregar();
        onToast?.();
      } else {
        mostrarToast?.('erro', data?.error || 'Erro ao aplicar.');
      }
    } catch (e) {
      mostrarToast?.('erro', 'Erro de rede.');
    } finally {
      setAGuardar(false);
    }
  };

  const mudarMes = (dir) => {
    let m = mes + dir, a = ano;
    if (m < 0) { m = 11; a--; }
    else if (m > 11) { m = 0; a++; }
    setMes(m); setAno(a);
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-slate-500" />
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            {isGlobal ? 'Bloquear alojamento inteiro' : 'Bloquear datas'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => mudarMes(-1)} className="p-1 hover:bg-slate-100 rounded" type="button">
            <ChevronLeft size={14} className="text-slate-500" />
          </button>
          <span className="text-xs font-bold text-slate-700 min-w-[120px] text-center">
            {MESES[mes]} {ano}
          </span>
          <button onClick={() => mudarMes(1)} className="p-1 hover:bg-slate-100 rounded" type="button">
            <ChevronRight size={14} className="text-slate-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_SEMANA.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-bold text-slate-400 uppercase">{d}</div>
        ))}
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={16} className="animate-spin text-blue-900" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {dias.map((d, i) => {
            const sel = d.dataStr && selecionados.has(d.dataStr);
            const est = getEstado(d.dataStr);
            return (
              <button
                key={i}
                type="button"
                onMouseDown={() => onDown(d.dataStr)}
                onMouseEnter={() => onEnter(d.dataStr)}
                disabled={!d.mesAtual}
                className={`aspect-square rounded text-[11px] font-bold transition-all select-none ${
                  !d.mesAtual ? 'text-transparent cursor-default' : 'cursor-pointer'
                } ${d.mesAtual ? corEstado(est, sel) : ''} ${
                  d.isHoje ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                }`}
              >
                {d.dia}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-[9px] font-bold uppercase flex-wrap">
          <span className="flex items-center gap-1 text-emerald-700"><span className="w-2 h-2 rounded bg-emerald-400"></span> Livre</span>
          <span className="flex items-center gap-1 text-red-700"><span className="w-2 h-2 rounded bg-red-400"></span> Bloqueado</span>
          <span className="flex items-center gap-1 text-blue-700"><span className="w-2 h-2 rounded bg-blue-400"></span> Reservado</span>
          <span className="flex items-center gap-1 text-slate-500"><span className="w-2 h-2 rounded bg-slate-300"></span> Passado</span>
        </div>

        {selecionados.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-600">{selecionados.size} dia(s)</span>
            <button type="button" onClick={() => setSelecionados(new Set())} className="text-[10px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1">
              Cancelar
            </button>
            <button
              type="button"
              onClick={aplicar}
              disabled={aGuardar}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-md text-white flex items-center gap-1 ${
                modo === 'bloquear' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
              } disabled:opacity-50`}
            >
              {aGuardar ? <><Loader2 size={11} className="animate-spin" /> A guardar...</> : modo === 'bloquear' ? <><Lock size={11} /> Bloquear</> : <><Unlock size={11} /> Desbloquear</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Modal principal
// ============================================================
const ModalConfigurarQuartos = ({
  isOpen,
  onClose,
  alojamentoId,
  tiposQuarto = [],
  datasParaVerificar = { checkIn: null, checkOut: null, checkout: null },
  modeloVenda = null,
  onAtualizar = null,
}) => {
  const { t } = useTranslation();
  const [stocks, setStocks] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [aGuardar, setAGuardar] = useState(null);
  const [erro, setErro] = useState(null);
  const [toast, setToast] = useState(null);
  const [quartoExpandido, setQuartoExpandido] = useState(null);
  const [bloqueioGlobalAberto, setBloqueioGlobalAberto] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const forcarRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const isPorQuartoModal = (() => {
    if (!modeloVenda) return false;
    const s = String(modeloVenda).toLowerCase();
    return s === 'por_quarto' || s === 'por-quarto' || s === 'quarto';
  })();

  const mostrarToast = useCallback((tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setStocks({});
      setErro(null);
      setToast(null);
      setAGuardar(null);
      setQuartoExpandido(null);
      setBloqueioGlobalAberto(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      forcarRefresh();
    }
  }, [isOpen, forcarRefresh]);

  const carregarDados = useCallback(async () => {
    if (!isOpen) return;
    if (!alojamentoId || alojamentoId <= 0) {
      setErro('Alojamento inválido.');
      return;
    }
    if (!tiposQuarto || tiposQuarto.length === 0) {
      setErro('Sem tipos de quarto configurados.');
      return;
    }

    setCarregando(true);
    setErro(null);

    const checkinVal = datasParaVerificar.checkIn || datasParaVerificar.checkin;
    const checkoutVal = datasParaVerificar.checkOut || datasParaVerificar.checkout;

    try {
      const { data } = await fetchJsonSeguro(`${API_BASE}/api/get_stock_quartos.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alojamento_id: alojamentoId,
          tipos_quarto: tiposQuarto.map(tq => ({
            tipo_quarto_id: tq.tipo_quarto_id || tq.id,
            nome: tq.nome || tq.tipo_nome,
          })),
          checkin: checkinVal,
          checkout: checkoutVal,
        }),
      });

      if (!data?.success) {
        setErro(data?.error || 'Erro a carregar stock.');
        return;
      }

      const mapaStocks = {};
      (data.quartos || []).forEach(q => {
        const tId = q.tipo_quarto_id || q.id;
        mapaStocks[tId] = {
          alojamento_quarto_id: q.alojamento_quarto_id ?? q.quarto_id ?? q.id ?? null,
          quantidade_total: q.quantidade_total,
          quantidade_disponivel: q.quantidade_disponivel,
          quantidade_reservada: q.quantidade_reservada,
          quantidade_bloqueada: q.quantidade_bloqueada,
          preco_noite: q.preco_noite,
          capacidade: q.capacidade,
          datas_bloqueadas: q.datas_bloqueadas || [],
        };
      });
      setStocks(mapaStocks);
    } catch (e) {
      console.error('[Modal]', e);
      setErro('Erro de rede ao carregar stock.');
    } finally {
      setCarregando(false);
    }
  }, [isOpen, alojamentoId, tiposQuarto, datasParaVerificar]);

  useEffect(() => { if (isOpen) carregarDados(); }, [isOpen, carregarDados]);

  const alternarAtivo = async (tipoQuartoId, ativoAtual) => {
    if (!alojamentoId || !tipoQuartoId) return;
    setAGuardar(tipoQuartoId);
    try {
      const { data } = await fetchJsonSeguro(`${API_BASE}/api/toggle_quarto_ativo.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alojamento_id: alojamentoId,
          tipo_quarto_id: tipoQuartoId,
          ativo: ativoAtual ? 0 : 1,
        }),
      });
      if (data?.success) {
        mostrarToast('sucesso', ativoAtual ? 'Quarto desativado.' : 'Quarto ativado.');
        await carregarDados();
        onAtualizar?.();
      } else {
        mostrarToast('erro', data?.error || 'Erro ao alterar.');
      }
    } catch {
      mostrarToast('erro', 'Erro de rede.');
    } finally {
      setAGuardar(null);
    }
  };

  const handleMiniCalendarioChange = useCallback(() => {
    carregarDados();
    forcarRefresh();
    onAtualizar?.();
  }, [carregarDados, forcarRefresh, onAtualizar]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900 text-white p-2 rounded-xl">
              <Bed size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Configurar Quartos</h2>
              <p className="text-xs text-slate-500 font-medium">
                {isPorQuartoModal ? 'Stock e disponibilidade por tipo de quarto' : 'Bloqueio de datas — alojamento inteiro ou por quarto'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {carregando && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-900 mb-3" size={32} />
              <p className="text-sm text-slate-500">A carregar stock...</p>
            </div>
          )}

          {erro && !carregando && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{erro}</p>
            </div>
          )}

          {!carregando && !erro && (
            <div className="space-y-3">
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-800">Bloquear Alojamento Inteiro</p>
                      <p className="text-xs text-red-600 mt-0.5">Aplica o bloqueio a <strong>todos os quartos</strong> ao mesmo tempo.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBloqueioGlobalAberto(v => !v)}
                    className={`shrink-0 px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 ${
                      bloqueioGlobalAberto ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    <Lock size={12} />
                    {bloqueioGlobalAberto ? 'Fechar' : 'Bloquear tudo'}
                  </button>
                </div>

                {bloqueioGlobalAberto && (
                  <div className="mt-3 bg-white rounded-lg border border-red-200 p-3">
                    <MiniCalendarioBloqueio
                      tipoId={0}
                      alojamentoId={alojamentoId}
                      mostrarToast={mostrarToast}
                      onToast={handleMiniCalendarioChange}
                      isGlobal={true}
                      refreshKey={refreshKey}
                    />
                  </div>
                )}
              </div>

              {tiposQuarto.map(tq => {
                const tipoId = Number(tq.tipo_quarto_id || tq.id);
                const stock = stocks[tipoId] || stocks[String(tipoId)];
                const quartoRealId = Number(
                  stock?.alojamento_quarto_id ?? 
                  stock?.quarto_id ?? 
                  stock?.id ?? 
                  tq.alojamento_quarto_id ?? 
                  tq.quarto_id ?? 
                  tipoId
                );
                const bloqueiosTipo = stock?.datas_bloqueadas || [];
                const ativo = (stock?.quantidade_total ?? 1) > 0;
                const imagem = tq.imagem || tq.imagem_url || tq.foto_capa;
                const expandido = quartoExpandido === tipoId;

                return (
                  <div key={tipoId} className={`border rounded-xl transition-colors ${expandido ? 'border-blue-300 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {imagem ? (
                            <img src={imagem} alt={tq.nome || tq.tipo_nome} className="w-14 h-14 rounded-lg object-cover border border-slate-100 shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <Bed size={20} className="text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{tq.nome || tq.tipo_nome}</h4>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                <Users size={11} /> {stock?.capacidade || tq.capacidade || 2} hóspedes
                              </span>
                              {stock && (
                                <span className="text-[11px] font-bold text-blue-900">
                                  {Math.round(stock.preco_noite || 0).toLocaleString('pt-PT')} CVE <span className="font-normal text-slate-400">/ noite</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQuartoExpandido(expandido ? null : tipoId)}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
                              expandido ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <Calendar size={12} />
                            {expandido ? 'Fechar' : 'Bloquear Datas'}
                          </button>
                          <button
                            type="button"
                            onClick={() => alternarAtivo(tipoId, ativo)}
                            disabled={aGuardar === tipoId}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
                              ativo ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                            } disabled:opacity-50`}
                          >
                            {aGuardar === tipoId ? <Loader2 size={12} className="animate-spin" /> : ativo ? <Unlock size={12} /> : <Lock size={12} />}
                            {ativo ? 'Ativo' : 'Inativo'}
                          </button>
                        </div>
                      </div>

                      {stock && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                            <p className="text-[9px] font-bold text-slate-500 uppercase">Total</p>
                            <p className="text-sm font-black text-slate-900">{stock.quantidade_total}</p>
                          </div>
                          <div className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
                            <p className="text-[9px] font-bold text-emerald-700 uppercase">Disponível</p>
                            <p className="text-sm font-black text-emerald-700">{stock.quantidade_disponivel}</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                            <p className="text-[9px] font-bold text-blue-700 uppercase">Reservado</p>
                            <p className="text-sm font-black text-blue-700">{stock.quantidade_reservada}</p>
                          </div>
                          <div className="bg-red-50 rounded-lg p-2.5 border border-red-100">
                            <p className="text-[9px] font-bold text-red-700 uppercase">Bloqueado</p>
                            <p className="text-sm font-black text-red-700">{stock.quantidade_bloqueada}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {expandido && (
                      <div className="px-4 pb-4">
                        <MiniCalendarioBloqueio
                          tipoId={quartoRealId}
                          alojamentoId={alojamentoId}
                          mostrarToast={mostrarToast}
                          onToast={handleMiniCalendarioChange}
                          isGlobal={false}
                          refreshKey={refreshKey}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
          <p className="text-[11px] text-slate-500 font-medium">Bloqueia datas no alojamento inteiro ou em cada quarto</p>
          <button onClick={onClose} className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-lg transition-colors">
            Fechar
          </button>
        </div>

        {toast && (
          <div className={`absolute bottom-4 right-4 px-4 py-2.5 rounded-lg shadow-xl text-white text-xs font-bold flex items-center gap-2 ${
            toast.tipo === 'sucesso' ? 'bg-emerald-600' : 'bg-red-600'
          }`}>
            {toast.tipo === 'sucesso' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalConfigurarQuartos;