// src/components/gest/HistoricoSessoes.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import {
  Loader2, X, Calendar, BarChart3, DollarSign, Users,
  RefreshCw, AlertCircle, ChevronDown, ChevronRight, TrendingUp,
  Package, CheckCircle2, Clock
} from 'lucide-react';

const API_BASE = 'https://welovepalop.com';

// ============================================================
// HELPERS
// ============================================================
const fmtData = (d) => {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-PT', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const fmtCVE = (v) =>
  Number(v || 0).toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const fmtPct = (n) =>
  `${Number(n || 0).toFixed(0)}%`;

const corOcupacao = (pct) =>
  pct >= 90 ? 'text-red-600' :
  pct >= 70 ? 'text-orange-500' :
  pct >= 40 ? 'text-yellow-600' : 'text-green-600';

const bgOcupacao = (pct) =>
  pct >= 90 ? 'bg-red-500' :
  pct >= 70 ? 'bg-orange-500' :
  pct >= 40 ? 'bg-yellow-500' : 'bg-green-500';

const MOTIVO_LABEL = {
  transferencia: '🔁 Transferência',
  limpeza_automatica: '🧹 Limpeza automática',
  encerramento: '🔒 Encerramento',
  manual: '✋ Manual'
};

const MOTIVO_COR = {
  transferencia: 'bg-blue-100 text-blue-700',
  limpeza_automatica: 'bg-slate-100 text-slate-700',
  encerramento: 'bg-purple-100 text-purple-700',
  manual: 'bg-amber-100 text-amber-700'
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const HistoricoSessoes = memo(function HistoricoSessoes({
  experienciaId,
  onClose
}) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [filtroMotivo, setFiltroMotivo] = useState('');
  const [expandidoId, setExpandidoId] = useState(null);

  const abortRef = useRef(null);

  // cleanup
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ============================================================
  // FETCH HISTÓRICO
  // ============================================================
  const fetchHistorico = useCallback(async () => {
    if (!experienciaId) return;
    setLoading(true);
    setErro('');

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let url = `${API_BASE}/api/historico_sessoes.php?experiencia_id=${experienciaId}`;
      if (filtroInicio) url += `&data_inicio=${filtroInicio}`;
      if (filtroFim) url += `&data_fim=${filtroFim}`;
      if (filtroMotivo) url += `&motivo=${encodeURIComponent(filtroMotivo)}`;

      const res = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Resposta inválida do servidor');
      }

      if (data.success) {
        setHistorico(data.historico || []);
      } else {
        setErro(data.error || 'Erro ao carregar histórico');
        setHistorico([]);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('❌ Erro histórico:', err);
      setErro(err.message || 'Erro de conexão');
      setHistorico([]);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [experienciaId, filtroInicio, filtroFim, filtroMotivo]);

  useEffect(() => {
    fetchHistorico();
  }, [fetchHistorico]);

  // ============================================================
  // TOTAIS
  // ============================================================
  const totais = useMemo(() => {
    const totalDias = historico.length;
    const totalSessoes = historico.reduce((a, h) => a + (Number(h.total_sessoes) || 0), 0);
    const totalReservas = historico.reduce((a, h) => a + (Number(h.vagas_ocupadas) || 0), 0);
    const totalReceita = historico.reduce((a, h) => a + (Number(h.receita_estimada) || 0), 0);
    const totalCapacidade = historico.reduce((a, h) => a + (Number(h.capacidade_total) || 0), 0);
    const ocupacaoMedia = totalCapacidade > 0 ? (totalReservas / totalCapacidade) * 100 : 0;

    return { totalDias, totalSessoes, totalReservas, totalReceita, ocupacaoMedia };
  }, [historico]);

  // ============================================================
  // LIMPAR FILTROS
  // ============================================================
  const limparFiltros = useCallback(() => {
    setFiltroInicio('');
    setFiltroFim('');
    setFiltroMotivo('');
  }, []);

  const toggleExpandir = useCallback((id) => {
    setExpandidoId(prev => prev === id ? null : id);
  }, []);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 text-left max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart3 size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Histórico de Sessões</h3>
              <p className="text-xs text-slate-500">
                Dias arquivados, ocupação e receita estimada
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* FILTROS */}
        <div className="flex flex-wrap gap-3 mb-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              De
            </label>
            <input
              type="date"
              value={filtroInicio}
              onChange={(e) => setFiltroInicio(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 bg-white"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Até
            </label>
            <input
              type="date"
              value={filtroFim}
              onChange={(e) => setFiltroFim(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 bg-white"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Motivo
            </label>
            <select
              value={filtroMotivo}
              onChange={(e) => setFiltroMotivo(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 bg-white"
            >
              <option value="">Todos</option>
              <option value="transferencia">Transferência</option>
              <option value="limpeza_automatica">Limpeza automática</option>
              <option value="encerramento">Encerramento</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={limparFiltros}
              className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={fetchHistorico}
              className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>
        </div>

        {/* ERRO */}
        {erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 font-medium">{erro}</p>
          </div>
        )}

        {/* TOTAIS */}
        {!loading && historico.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={12} className="text-slate-400" />
                <p className="text-[10px] text-slate-500 font-bold uppercase">Dias</p>
              </div>
              <p className="text-xl font-bold text-slate-900">{totais.totalDias}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Package size={12} className="text-blue-500" />
                <p className="text-[10px] text-blue-600 font-bold uppercase">Sessões</p>
              </div>
              <p className="text-xl font-bold text-blue-900">{totais.totalSessoes}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Users size={12} className="text-orange-500" />
                <p className="text-[10px] text-orange-600 font-bold uppercase">Reservas</p>
              </div>
              <p className="text-xl font-bold text-orange-900">{totais.totalReservas}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign size={12} className="text-emerald-500" />
                <p className="text-[10px] text-emerald-600 font-bold uppercase">Receita</p>
              </div>
              <p className="text-xl font-bold text-emerald-900">
                {fmtCVE(totais.totalReceita)}
                <span className="text-xs font-normal text-emerald-600 ml-1">CVE</span>
              </p>
            </div>
          </div>
        )}

        {/* LISTA */}
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">A carregar histórico...</p>
          </div>
        ) : historico.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-xl">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={28} className="text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Sem histórico ainda</h3>
            <p className="text-xs text-slate-500">
              Os dias passados serão arquivados automaticamente
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {historico.map((h) => {
              const ocupacaoPct = h.capacidade_total > 0
                ? (h.vagas_ocupadas / h.capacidade_total) * 100
                : 0;
              const expandido = expandidoId === h.id;

              return (
                <div
                  key={h.id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-sm transition"
                >
                  {/* LINHA PRINCIPAL */}
                  <button
                    type="button"
                    onClick={() => toggleExpandir(h.id)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition"
                  >
                    <div className="shrink-0">
                      {expandido
                        ? <ChevronDown size={16} className="text-slate-400" />
                        : <ChevronRight size={16} className="text-slate-400" />}
                    </div>

                    <div className="w-24 shrink-0">
                      <p className="text-sm font-bold text-slate-900">
                        {fmtData(h.data)}
                      </p>
                    </div>

                    <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      MOTIVO_COR[h.motivo] || MOTIVO_COR.manual
                    }`}>
                      {MOTIVO_LABEL[h.motivo] || h.motivo}
                    </span>

                    <div className="flex-1 grid grid-cols-3 gap-3 items-center">
                      {/* Ocupação */}
                      <div>
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">
                            Ocupação
                          </span>
                          <span className={`text-xs font-bold ${corOcupacao(ocupacaoPct)}`}>
                            {fmtPct(ocupacaoPct)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${bgOcupacao(ocupacaoPct)}`}
                            style={{ width: `${Math.min(ocupacaoPct, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Reservas */}
                      <div className="hidden sm:block">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">
                          Reservas
                        </p>
                        <p className="text-xs font-bold text-slate-700">
                          {h.vagas_ocupadas}/{h.capacidade_total}
                        </p>
                      </div>

                      {/* Receita */}
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">
                          Receita
                        </p>
                        <p className="text-xs font-bold text-emerald-600">
                          {fmtCVE(h.receita_estimada)} CVE
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* DETALHE EXPANDIDO */}
                  {expandido && (
                    <div className="px-3 pb-3 pt-2 border-t border-slate-100 bg-slate-50/50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">
                            Sessões
                          </p>
                          <p className="text-sm font-bold text-slate-900">
                            {h.total_sessoes}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">
                            Capacidade
                          </p>
                          <p className="text-sm font-bold text-slate-900">
                            {h.capacidade_total}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">
                            Vagas livres
                          </p>
                          <p className="text-sm font-bold text-green-600">
                            {h.vagas_disponiveis}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">
                            Preço (min-max)
                          </p>
                          <p className="text-sm font-bold text-slate-900">
                            {h.preco_min || h.preco_max
                              ? `${fmtCVE(h.preco_min)} – ${fmtCVE(h.preco_max)}`
                              : '—'}
                          </p>
                        </div>
                      </div>

                      {h.observacao && (
                        <div className="mt-3 pt-3 border-t border-slate-200 flex items-start gap-2">
                          <Clock size={12} className="text-slate-400 mt-0.5 shrink-0" />
                          <p className="text-[11px] text-slate-500 italic">
                            {h.observacao}
                          </p>
                        </div>
                      )}

                      {h.criado_em && (
                        <p className="text-[10px] text-slate-400 mt-2">
                          Arquivado em {new Date(h.criado_em).toLocaleString('pt-PT')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-end pt-5 mt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
});

export default HistoricoSessoes;