// src/features/alojamento/components/ModalConfigurarQuartos.jsx
// ============================================================
// 🛡️ Modal Configurar Quartos — select global vs por tipo de quarto
// ============================================================
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  X, Bed, Users, Lock, Unlock, Loader2, Calendar, AlertCircle, CheckCircle,
  ChevronLeft, ChevronRight, Info, Building2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API_BASE = 'https://welovepalop.com';
const FETCH_TIMEOUT_MS = 15000;
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
// 🔒 Modal interno de motivo
// ============================================================
function ModalMotivoInterno({ isOpen, onClose, onConfirm, aGuardar, quantidadeDias, nomeItem }) {
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMotivo('');
      setErro('');
      setTimeout(() => ref.current?.focus(), 250);
    }
    if (!isOpen) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const confirmar = () => {
    const limpo = motivo.trim();
    if (limpo.length < 3) {
      setErro('Escreve um motivo com pelo menos 3 caracteres.');
      return;
    }
    onConfirm(limpo);
  };

  return (
    <div
      className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => !aGuardar && onClose()}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-md">
              <Lock size={17} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Motivo do bloqueio</h3>
              <p className="text-[11px] text-slate-500 font-medium">Ficará registado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={aGuardar}
            className="p-2 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-sm text-slate-700 leading-snug">
              Vais bloquear <strong className="text-slate-900">{quantidadeDias} dia{quantidadeDias > 1 ? 's' : ''}</strong>
              {nomeItem ? <> em <strong className="text-slate-900">{nomeItem}</strong></> : null}.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">
              Motivo *
            </label>
            <textarea
              ref={ref}
              value={motivo}
              onChange={(e) => { setMotivo(e.target.value); if (erro) setErro(''); }}
              rows={3}
              maxLength={200}
              placeholder="Ex: Manutenção, uso pessoal, obra, evento privado..."
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none transition"
            />
            <div className="flex items-center justify-between mt-1.5">
              {erro ? (
                <span className="text-[11px] font-semibold text-red-600">{erro}</span>
              ) : (
                <span className="text-[11px] text-slate-400">Obrigatório</span>
              )}
              <span className="text-[11px] text-slate-400">{motivo.length}/200</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['Manutenção', 'Uso pessoal', 'Obra', 'Evento privado', 'Indisponível'].map(sug => (
              <button
                key={sug}
                type="button"
                onClick={() => { setMotivo(sug); if (erro) setErro(''); }}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-700 rounded-full transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={aGuardar}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={aGuardar}
            className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition flex items-center gap-2 disabled:opacity-50 shadow-md shadow-red-600/20"
          >
            {aGuardar ? (
              <><Loader2 size={14} className="animate-spin" /> A bloquear...</>
            ) : (
              <><Lock size={14} /> Confirmar bloqueio</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MiniCalendarioBloqueio
// ============================================================
function MiniCalendarioBloqueio({
  tipoQuartoId,          // tipo_quarto_id (0 se global)
  alojamentoId,
  onToast,
  mostrarToast,
  isGlobal = false,
  refreshKey = 0,
  nomeItem = '',
}) {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [bloqueiosPorData, setBloqueiosPorData] = useState({});
  const [reservados, setReservados] = useState(new Set());
  const [selecionados, setSelecionados] = useState(new Set());
  const [carregando, setCarregando] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [modo, setModo] = useState('bloquear');
  const [motivoModalAberto, setMotivoModalAberto] = useState(false);

  const carregar = useCallback(async () => {
    if (!alojamentoId) {
      setBloqueiosPorData({});
      setReservados(new Set());
      return;
    }
    setCarregando(true);
    try {
      const params = new URLSearchParams({
        action: 'listar',
        alojamento_id: String(alojamentoId),
        ano: String(ano),
        mes: String(mes + 1),
      });

      // ✅ Se for por tipo, filtra por tipo_quarto_id (backend já suporta)
      if (!isGlobal && tipoQuartoId) {
        params.set('tipo_quarto_id', String(tipoQuartoId));
      }

      const url = `${API_BASE}/api/alojamento_bloqueios.php?${params.toString()}`;
      const { data } = await fetchJsonSeguro(url);

      if (!data?.success) {
        mostrarToast?.('erro', data?.error || 'Erro a carregar bloqueios.');
        return;
      }

      const porData = {};
      (data.bloqueios || []).forEach(b => {
        const d = normalizarData(b.data);
        if (!d) return;
        const qid = Number(b.quarto_id ?? 0);
        if (!porData[d]) porData[d] = { global: false, quartos: new Set() };
        if (qid === 0) porData[d].global = true;
        else porData[d].quartos.add(qid);
      });
      setBloqueiosPorData(porData);

      const reservadosSet = new Set();
      (data.dias_reservados || []).forEach(item => {
        const d  = typeof item === 'string' ? item : (item?.data ?? item?.dia);
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
  }, [alojamentoId, ano, mes, mostrarToast, refreshKey, isGlobal, tipoQuartoId]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    setSelecionados(new Set());
    setDragStart(null);
    setIsDragging(false);
  }, [mes, ano, tipoQuartoId, isGlobal]);

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

    const info = bloqueiosPorData[dataStr];
    if (!info) return 'livre';

    if (isGlobal) {
      if (info.global || info.quartos.size > 0) return 'bloqueado';
      return 'livre';
    }

    // Por tipo: como o backend já filtrou por tipo_quarto_id,
    // qualquer bloqueio devolvido é deste tipo → bloqueado.
    if (info.global || info.quartos.size > 0) return 'bloqueado';
    return 'livre';
  };

  const corEstado = (estado, sel) => {
    if (sel) {
      return modo === 'bloquear'
        ? 'bg-red-500 text-white border-red-600 shadow-md scale-95 border'
        : 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-95 border';
    }
    switch (estado) {
      case 'livre':     return 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100';
      case 'bloqueado': return 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100';
      case 'parcial':   return 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100';
      case 'reservado': return 'bg-blue-50 text-blue-700 border border-blue-200 cursor-not-allowed';
      case 'passado':   return 'bg-slate-50 text-slate-300 border border-slate-200 cursor-not-allowed opacity-60';
      default:          return 'bg-transparent text-slate-300 border border-transparent';
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

    const a = new Date(dragStart + 'T00:00:00');
    const b = new Date(dataStr + 'T00:00:00');
    const [ini, fim] = a <= b ? [a, b] : [b, a];
    const nova = new Set();
    const cur = new Date(ini);
    while (cur <= fim) {
      const s = formatarData(cur.getFullYear(), cur.getMonth(), cur.getDate());
      if (isDataPassada(s)) { cur.setDate(cur.getDate() + 1); continue; }
      const est = getEstado(s);
      if (modo === 'bloquear' && est !== 'reservado' && est !== 'passado') nova.add(s);
      if (modo === 'desbloquear' && est === 'bloqueado') nova.add(s);
      cur.setDate(cur.getDate() + 1);
    }
    setSelecionados(nova);
  };

  useEffect(() => {
    const up = () => { if (isDragging) setIsDragging(false); };
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }, [isDragging]);

  const aplicar = async (motivoFinal = null) => {
    if (selecionados.size === 0) return;
    setAGuardar(true);
    try {
      const endpoint = modo === 'bloquear'
        ? `${API_BASE}/api/alojamento_bloqueios.php?action=bloquear`
        : `${API_BASE}/api/alojamento_bloqueios.php?action=desbloquear`;

      const motivo = modo === 'bloquear'
        ? (motivoFinal || (isGlobal ? 'Bloqueio manual (alojamento inteiro)' : 'Bloqueio manual (tipo de quarto)'))
        : 'Desbloqueio manual';

      // ✅ Sempre quarto_id=0; tipo_quarto_id=0 se global, senão o ID do tipo
      const body = {
        alojamento_id: Number(alojamentoId),
        quarto_id: 0,
        tipo_quarto_id: isGlobal ? 0 : Number(tipoQuartoId),
        datas: Array.from(selecionados),
        motivo,
      };

      const { data } = await fetchJsonSeguro(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (data?.success) {
        mostrarToast?.('sucesso',
          modo === 'bloquear'
            ? `${selecionados.size} data(s) bloqueada(s).`
            : `${selecionados.size} data(s) desbloqueada(s).`);
        setSelecionados(new Set());
        setMotivoModalAberto(false);
        await carregar();
        onToast?.();
      } else {
        mostrarToast?.('erro', data?.error || 'Erro ao aplicar.');
      }
    } catch (e) {
      console.error('[MiniCalendario aplicar]', e);
      mostrarToast?.('erro', 'Erro de rede.');
    } finally {
      setAGuardar(false);
    }
  };

  const handleAplicarClick = () => {
    if (modo === 'bloquear') {
      setMotivoModalAberto(true);
    } else {
      aplicar();
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
            {isGlobal ? 'Bloquear alojamento inteiro' : `Bloquear ${nomeItem}`}
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
                onTouchStart={() => onDown(d.dataStr)}
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
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="text-[10px] font-bold text-slate-600">{selecionados.size} dia(s)</span>
            <button type="button" onClick={() => setSelecionados(new Set())} className="text-[10px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1">
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAplicarClick}
              disabled={aGuardar}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-md text-white flex items-center gap-1 transition ${
                modo === 'bloquear' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
              } disabled:opacity-50`}
            >
              {aGuardar ? <><Loader2 size={11} className="animate-spin" /> A guardar...</> : modo === 'bloquear' ? <><Lock size={11} /> Bloquear</> : <><Unlock size={11} /> Desbloquear</>}
            </button>
          </div>
        )}
      </div>

      <ModalMotivoInterno
        isOpen={motivoModalAberto}
        onClose={() => setMotivoModalAberto(false)}
        onConfirm={(motivo) => aplicar(motivo)}
        aGuardar={aGuardar}
        quantidadeDias={selecionados.size}
        nomeItem={nomeItem}
      />
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
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ NOVO: modo global vs por tipo, escolhido no select box
  const [modoBloqueio, setModoBloqueio] = useState('inteiro'); // 'inteiro' | 'tipo'
  const [tipoSelecionado, setTipoSelecionado] = useState(null); // tipo_quarto_id

  const forcarRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const temQuartos = useMemo(
    () => Array.isArray(tiposQuarto) && tiposQuarto.length > 0,
    [tiposQuarto]
  );

  // Se não houver quartos, força modo inteiro
  useEffect(() => {
    if (!temQuartos) {
      setModoBloqueio('inteiro');
      setTipoSelecionado(null);
    }
  }, [temQuartos]);

  // Quando muda para 'tipo', garante que há um tipo selecionado
  useEffect(() => {
    if (modoBloqueio === 'tipo' && temQuartos && !tipoSelecionado) {
      const primeiro = tiposQuarto[0];
      const id = Number(primeiro.tipo_quarto_id || primeiro.id);
      setTipoSelecionado(id);
    }
  }, [modoBloqueio, temQuartos, tiposQuarto, tipoSelecionado]);

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
      setModoBloqueio('inteiro');
      setTipoSelecionado(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      forcarRefresh();
    }
  }, [isOpen, forcarRefresh]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const carregarDados = useCallback(async () => {
    if (!isOpen) return;
    if (!alojamentoId || alojamentoId <= 0) {
      setErro('Alojamento inválido.');
      return;
    }
    if (!tiposQuarto || tiposQuarto.length === 0) {
      setStocks({});
      setErro(null);
      setCarregando(false);
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
          quantidade_total: q.quantidade_total,
          quantidade_disponivel: q.quantidade_disponivel,
          quantidade_reservada: q.quantidade_reservada,
          quantidade_bloqueada: q.quantidade_bloqueada,
          preco_noite: q.preco_noite,
          capacidade: q.capacidade,
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

  const handleMiniCalendarioChange = useCallback(() => {
    carregarDados();
    forcarRefresh();
    onAtualizar?.();
  }, [carregarDados, forcarRefresh, onAtualizar]);

  // Nome do item para mostrar no mini-calendário / modal de motivo
  const nomeItemAtual = useMemo(() => {
    if (modoBloqueio === 'inteiro') return 'alojamento inteiro';
    const tq = tiposQuarto.find(t => Number(t.tipo_quarto_id || t.id) === Number(tipoSelecionado));
    return tq ? (tq.nome || tq.tipo_nome || 'tipo de quarto') : 'tipo de quarto';
  }, [modoBloqueio, tiposQuarto, tipoSelecionado]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-800 to-blue-950 text-white p-2 rounded-xl shadow-md">
              {modoBloqueio === 'inteiro' ? <Building2 size={18} /> : <Bed size={18} />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Gestão de Bloqueios</h2>
              <p className="text-xs text-slate-500 font-medium">
                Escolhe o que queres bloquear e marca os dias no calendário
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition">
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
            <div className="space-y-4">

              {/* ============================================================
                  🎛️ SELECT BOX — escolher cenário
                  ============================================================ */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-2">
                  O que queres bloquear?
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setModoBloqueio('inteiro')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                      modoBloqueio === 'inteiro'
                        ? 'bg-red-600 text-white border-red-700 shadow-md'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Building2 size={16} />
                    Alojamento inteiro
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoBloqueio('tipo')}
                    disabled={!temQuartos}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                      modoBloqueio === 'tipo'
                        ? 'bg-blue-700 text-white border-blue-800 shadow-md'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <Bed size={16} />
                    Por tipo de quarto
                  </button>
                </div>

                {modoBloqueio === 'tipo' && temQuartos && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">
                      Escolhe o tipo de quarto
                    </label>
                    <select
                      value={tipoSelecionado ?? ''}
                      onChange={(e) => setTipoSelecionado(Number(e.target.value))}
                      className="w-full px-3 py-2.5 text-sm font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                    >
                      {tiposQuarto.map(tq => {
                        const id = Number(tq.tipo_quarto_id || tq.id);
                        const nome = tq.nome || tq.tipo_nome || 'Quarto';
                        return (
                          <option key={id} value={id}>{nome}</option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              {/* ============================================================
                  📅 MINI-CALENDÁRIO ÚNICO — muda conforme o modo
                  ============================================================ */}
              <div className={`p-4 rounded-xl border ${
                modoBloqueio === 'inteiro'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle size={18} className={`shrink-0 mt-0.5 ${
                    modoBloqueio === 'inteiro' ? 'text-red-600' : 'text-blue-700'
                  }`} />
                  <div>
                    <p className={`text-sm font-bold ${
                      modoBloqueio === 'inteiro' ? 'text-red-800' : 'text-blue-900'
                    }`}>
                      {modoBloqueio === 'inteiro'
                        ? 'Bloquear alojamento inteiro'
                        : `Bloquear ${nomeItemAtual}`}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      modoBloqueio === 'inteiro' ? 'text-red-600' : 'text-blue-700'
                    }`}>
                      {modoBloqueio === 'inteiro'
                        ? 'Fica indisponível para toda a propriedade.'
                        : 'Fica indisponível apenas para este tipo de quarto.'}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-3">
                  <MiniCalendarioBloqueio
                    key={`${modoBloqueio}-${tipoSelecionado ?? 0}`}
                    tipoQuartoId={modoBloqueio === 'inteiro' ? 0 : Number(tipoSelecionado ?? 0)}
                    alojamentoId={alojamentoId}
                    mostrarToast={mostrarToast}
                    onToast={handleMiniCalendarioChange}
                    isGlobal={modoBloqueio === 'inteiro'}
                    refreshKey={refreshKey}
                    nomeItem={nomeItemAtual}
                  />
                </div>
              </div>

              {!temQuartos && (
                <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>Este alojamento não tem quartos configurados. Só é possível bloquear o alojamento inteiro.</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
          <p className="text-[11px] text-slate-500 font-medium">
            {modoBloqueio === 'inteiro'
              ? 'Bloqueia datas em todo o alojamento'
              : `Bloqueia datas no tipo "${nomeItemAtual}"`}
          </p>
          <button onClick={onClose} className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-lg transition-colors">
            Fechar
          </button>
        </div>

        {toast && (
          <div className={`absolute bottom-4 right-4 px-4 py-2.5 rounded-lg shadow-xl text-white text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
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