// src/components/gest/ConfigurarSessoes.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Loader2, Plus, Trash2, Calendar, Clock, Users, Save, ArrowLeft,
  AlertCircle, CheckCircle, X, Sun, Sunset, Info, Edit2, Copy,
  ToggleLeft, ToggleRight, DollarSign, RefreshCw, Search, ArrowRight,
  BarChart3, AlertTriangle
} from 'lucide-react';
import ModalTransferir from './ModalTransferir';
import HistoricoSessoes from './HistoricoSessoes';

const API_BASE = 'https://welovepalop.com';

// ============================================================
// HELPER: obter utilizador do JWT
// ============================================================
function obterUsuarioId() {
  try {
    const token = localStorage.getItem('token')
      || localStorage.getItem('morabeza_token')
      || localStorage.getItem('access_token')
      || localStorage.getItem('jwt');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const parsed = JSON.parse(decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      ));
      const user = parsed?.data || parsed?.user || parsed?.usuario || parsed;
      const id = user?.id || user?.userId || user?.user_id || user?.usuario_id || parsed?.sub;
      if (id) return Number(id);
    }
    const savedUser = localStorage.getItem('user') || localStorage.getItem('morabeza_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      if (u?.id) return Number(u.id);
    }
    return null;
  } catch { return null; }
}

// ============================================================
// HELPER: normalizar data -> sempre "YYYY-MM-DD"
// Aceita: "2026-10-08", "2026-10-08 00:00:00", "08/10/2026", etc.
// ============================================================
const normalizarData = (d) => {
  if (!d) return '';
  const s = String(d).trim();

  // Formato ISO: "2026-10-08..." ou "2026-10-08T..."
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  // Formato PT: "08/10/2026"
  const ptMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (ptMatch) return `${ptMatch[3]}-${ptMatch[2]}-${ptMatch[1]}`;

  return s;
};

// ============================================================
// HELPER: normalizar hora -> sempre "HH:MM"
// Aceita: "08:00", "08:00:00", "8:00", "08:00:00.000"
// ============================================================
const normalizarHora = (h) => {
  if (!h) return '';
  const s = String(h).trim();
  const match = s.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return s.substring(0, 5);
  return `${match[1].padStart(2, '0')}:${match[2]}`;
};

// ============================================================
// HELPER: sanitizar mensagens de erro do backend
// Cobre SQLSTATE, Duplicate, Integrity, uk_sessao, PDOException,
// Erro BD, MySQL, etc. — devolve SEMPRE mensagem amigável.
// ============================================================
const sanitizarErroBackend = (msg, contexto = {}) => {
  const { data, hora_inicio } = contexto;

  if (!msg) {
    return 'Não foi possível guardar a sessão. Tente novamente.';
  }

  const texto = String(msg);
  const lower = texto.toLowerCase();

  // ─── Duplicação (UNIQUE) ───
  const isDuplicado =
    lower.includes('duplicate') ||
    lower.includes('1062') ||
    lower.includes('uk_sessao') ||
    lower.includes('integrity constraint') ||
    lower.includes('integrity') ||
    lower.includes('já existe') ||
    lower.includes('ja existe') ||
    lower.includes('duplicad');

  if (isDuplicado) {
    const dataFmt = data ? normalizarData(data) : '';
    const horaFmt = hora_inicio ? normalizarHora(hora_inicio) : '';
    const quando = dataFmt && horaFmt ? ` (${dataFmt} às ${horaFmt})` : '';
    return `Já existe uma sessão nesse horário${quando}. Escolha um horário diferente ou edite a sessão existente.`;
  }

  // ─── Qualquer erro técnico SQL / BD ───
  const isTecnico =
    lower.includes('sqlstate') ||
    lower.includes('pdoexception') ||
    lower.includes('syntax error') ||
    lower.includes('mysql') ||
    lower.includes('sqlite') ||
    lower.includes('erro bd') ||
    lower.includes('erro db') ||
    lower.includes('database error') ||
    lower.includes('base de dados') ||
    lower.includes('unknown column') ||
    lower.includes('foreign key') ||
    lower.includes('constraint');

  if (isTecnico) {
    return 'Não foi possível guardar a sessão. Verifique os dados e tente novamente.';
  }

  // ─── Rede ───
  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('load failed')
  ) {
    return 'Não foi possível contactar o servidor. Verifique a sua ligação à internet.';
  }

  // ─── Mensagem já amigável do backend → passa ───
  return texto;
};

// ============================================================
// HELPER: extrair mensagem de erro do backend
// Suporta data.error, data.erro, data.message, data.mensagem
// ============================================================
const extrairErroBackend = (data) => {
  if (!data || typeof data !== 'object') return '';
  return (
    data.error ||
    data.erro ||
    data.message ||
    data.mensagem ||
    ''
  );
};

// ============================================================
// MODAL: Criar/Editar Sessão
// ============================================================
const ModalSessao = memo(function ModalSessao({
  show, onClose, onSave, sessaoEditando, experienciaId, sessoesExistentes = []
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    data: '',
    hora_inicio: '08:00',
    hora_fim: '11:00',
    periodo: 'Manhã',
    capacidade_maxima: 15,
    preco_especial: '',
    ativo: 1
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const abortRef = useRef(null);

  // cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Reset quando abre
  useEffect(() => {
    if (show) {
      setErro('');
      if (sessaoEditando) {
        setForm({
          data: normalizarData(sessaoEditando.data) || '',
          hora_inicio: normalizarHora(sessaoEditando.hora_inicio) || '08:00',
          hora_fim: normalizarHora(sessaoEditando.hora_fim) || '11:00',
          periodo: sessaoEditando.periodo || 'Manhã',
          capacidade_maxima: sessaoEditando.capacidade_maxima || 15,
          preco_especial: sessaoEditando.preco_especial || '',
          ativo: sessaoEditando.ativo ?? 1
        });
      } else {
        setForm({
          data: new Date().toISOString().split('T')[0],
          hora_inicio: '08:00',
          hora_fim: '11:00',
          periodo: 'Manhã',
          capacidade_maxima: 15,
          preco_especial: '',
          ativo: 1
        });
      }
    }
  }, [show, sessaoEditando]);

  // Auto-detectar período
  useEffect(() => {
    const hora = parseInt(form.hora_inicio.split(':')[0]);
    let periodo = 'Manhã';
    if (hora >= 12 && hora < 15) periodo = 'Meio dia';
    else if (hora >= 15) periodo = 'Tarde';
    if (periodo !== form.periodo) {
      setForm(prev => ({ ...prev, periodo }));
    }
  }, [form.hora_inicio, form.periodo]);

  // Auto-calcular hora fim (+3h)
  useEffect(() => {
    const [h, m] = form.hora_inicio.split(':').map(Number);
    const fimH = (h + 3) % 24;
    const fimStr = `${String(fimH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    if (fimStr !== form.hora_fim) {
      setForm(prev => ({ ...prev, hora_fim: fimStr }));
    }
  }, [form.hora_inicio, form.hora_fim]);

  // ============================================================
  // Sessões do dia (com DATA NORMALIZADA — correção do bug)
  // ============================================================
  const sessoesDoDia = useMemo(() => {
    if (!form.data) return [];
    const dataFormNorm = normalizarData(form.data);

    return sessoesExistentes
      .filter(s => normalizarData(s.data) === dataFormNorm)
      .filter(s => !sessaoEditando || Number(s.id) !== Number(sessaoEditando.id))
      .sort((a, b) =>
        normalizarHora(a.hora_inicio).localeCompare(normalizarHora(b.hora_inicio))
      );
  }, [sessoesExistentes, form.data, sessaoEditando]);

  // ============================================================
  // Conflito em tempo real — mesma HORA INÍCIO (normalizada)
  // ============================================================
  const conflito = useMemo(() => {
    if (!form.data || !form.hora_inicio) return null;
    const horaFormNorm = normalizarHora(form.hora_inicio);
    return sessoesDoDia.find(s =>
      normalizarHora(s.hora_inicio) === horaFormNorm
    ) || null;
  }, [sessoesDoDia, form.data, form.hora_inicio]);

  // ============================================================
  // handleSave — validação + sanitização SEMPRE
  // ============================================================
  const handleSave = useCallback(async () => {
    setErro('');

    // ─────────────────────────────────────────────
    // VALIDAÇÕES BÁSICAS
    // ─────────────────────────────────────────────
    if (!form.data) { setErro('Indique a data da sessão.'); return; }
    if (!form.hora_inicio || !form.hora_fim) { setErro('Indique as horas de início e fim.'); return; }
    if (form.capacidade_maxima < 1) { setErro('A capacidade mínima é 1 pessoa.'); return; }

    // ─────────────────────────────────────────────
    // ✅ VALIDAÇÃO 1 — hora fim > hora início
    // ─────────────────────────────────────────────
    if (normalizarHora(form.hora_fim) <= normalizarHora(form.hora_inicio)) {
      setErro('A hora de fim tem de ser posterior à hora de início.');
      return;
    }

    // ─────────────────────────────────────────────
    // ✅ VALIDAÇÃO 2 — duplicado (DATA NORMALIZADA + HORA NORMALIZADA)
    // ─────────────────────────────────────────────
    const dataFormNorm = normalizarData(form.data);
    const horaFormNorm = normalizarHora(form.hora_inicio);

    const duplicado = sessoesExistentes.find(s => {
      if (sessaoEditando && Number(s.id) === Number(sessaoEditando.id)) return false;
      return (
        normalizarData(s.data) === dataFormNorm &&
        normalizarHora(s.hora_inicio) === horaFormNorm
      );
    });

    if (duplicado) {
      setErro(
        `Já existe uma sessão em ${dataFormNorm} às ${horaFormNorm}. ` +
        `Escolha outro horário ou edite a sessão existente.`
      );
      return;
    }

    setSalvando(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const payload = {
        experiencia_id: Number(experienciaId),
        data: form.data,
        hora_inicio: form.hora_inicio,
        hora_fim: form.hora_fim,
        periodo: form.periodo,
        capacidade_maxima: parseInt(form.capacidade_maxima),
        preco_especial: form.preco_especial !== '' ? parseFloat(form.preco_especial) : null,
        ativo: form.ativo ? 1 : 0
      };

      if (sessaoEditando) payload.id = Number(sessaoEditando.id);

      const isEdicao = !!sessaoEditando;
      let url = `${API_BASE}/api/sessoes_experiencia.php`;
      if (isEdicao) url += `?action=update`;

      const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        // Backend devolveu texto não-JSON (raro) → sanitizar mesmo assim
        setErro(sanitizarErroBackend(text, {
          data: form.data,
          hora_inicio: form.hora_inicio
        }));
        return;
      }

      if (data.success) {
        onSave?.();
        onClose?.();
      } else {
        // Extrair erro de qualquer campo possível (error, erro, message, mensagem)
        const msgBackend = extrairErroBackend(data);

        // ✅ Sanitização blindada — SQLSTATE nunca chega ao utilizador
        setErro(sanitizarErroBackend(msgBackend, {
          data: form.data,
          hora_inicio: form.hora_inicio
        }));
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('❌ Erro:', err);

      // ✅ Também sanitiza erros de exceção (rede, parse, etc.)
      setErro(sanitizarErroBackend(err.message, {
        data: form.data,
        hora_inicio: form.hora_inicio
      }));
    } finally {
      setSalvando(false);
      abortRef.current = null;
    }
  }, [form, sessaoEditando, experienciaId, onSave, onClose, sessoesExistentes]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 text-left max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {sessaoEditando ? 'Editar Sessão' : 'Nova Sessão'}
              </h3>
              <p className="text-xs text-slate-500">
                {sessaoEditando ? 'Atualize os dados da sessão' : 'Crie uma nova sessão de horário'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* ERRO */}
        {erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 font-medium">{erro}</p>
          </div>
        )}

        {/* ⚠️ AVISO: sessões já existentes no dia */}
        {sessoesDoDia.length > 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-amber-800">
                Já existem {sessoesDoDia.length} sessão(ões) neste dia:
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sessoesDoDia.map(s => {
                const isConflito = normalizarHora(s.hora_inicio) === normalizarHora(form.hora_inicio);
                return (
                  <span
                    key={s.id}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isConflito
                        ? 'bg-red-100 text-red-700 ring-1 ring-red-300'
                        : 'bg-white text-amber-800 border border-amber-200'
                    }`}
                  >
                    <Clock size={9} />
                    {normalizarHora(s.hora_inicio)} – {normalizarHora(s.hora_fim)}
                    {isConflito && ' • conflito'}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ⚠️ AVISO EM TEMPO REAL: conflito detetado */}
        {conflito && !erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-red-700">
              Já existe uma sessão às <strong>{normalizarHora(conflito.hora_inicio)}</strong>.
              Escolha outro horário.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* DATA */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Data *</label>
            <input
              type="date"
              value={form.data}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm(prev => ({ ...prev, data: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            />
          </div>

          {/* HORAS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Hora início *</label>
              <input
                type="time"
                value={form.hora_inicio}
                onChange={(e) => setForm(prev => ({ ...prev, hora_inicio: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Hora fim *</label>
              <input
                type="time"
                value={form.hora_fim}
                onChange={(e) => setForm(prev => ({ ...prev, hora_fim: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
              />
            </div>
          </div>

          {/* PERÍODO */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Período</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Manhã', Icon: Sun, cor: 'yellow' },
                { label: 'Meio dia', Icon: Sun, cor: 'orange' },
                { label: 'Tarde', Icon: Sunset, cor: 'red' }
              ].map((p) => {
                const Icon = p.Icon;
                const isSelected = form.periodo === p.label;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, periodo: p.label }))}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all gap-1 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <Icon size={16} className={
                      isSelected
                        ? (p.cor === 'yellow' ? 'text-yellow-500' : p.cor === 'orange' ? 'text-orange-400' : 'text-red-400')
                        : 'text-slate-300'
                    } />
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CAPACIDADE */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Capacidade máxima *</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, capacidade_maxima: Math.max(1, prev.capacidade_maxima - 1) }))}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={form.capacidade_maxima}
                onChange={(e) => setForm(prev => ({ ...prev, capacidade_maxima: parseInt(e.target.value) || 1 }))}
                className="flex-1 border border-slate-200 rounded-xl p-3 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
              />
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, capacidade_maxima: prev.capacidade_maxima + 1 }))}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold"
              >
                +
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Número máximo de pessoas nesta sessão</p>
          </div>

          {/* PREÇO ESPECIAL */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Preço especial (opcional)</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.preco_especial}
                onChange={(e) => setForm(prev => ({ ...prev, preco_especial: e.target.value }))}
                placeholder="Deixe vazio para usar o preço base"
                className="w-full border border-slate-200 rounded-xl p-3 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
              />
            </div>
          </div>

          {/* ATIVO */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs font-bold text-slate-700">Sessão ativa</p>
              <p className="text-[10px] text-slate-400">Sessões inativas não aparecem para os clientes</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, ativo: prev.ativo ? 0 : 1 }))}
              className="text-blue-600"
            >
              {form.ativo ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-300" />}
            </button>
          </div>
        </div>

        {/* AÇÕES */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={salvando || !!conflito}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title={conflito ? 'Resolva o conflito de horário primeiro' : ''}
          >
            {salvando ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                A guardar...
              </>
            ) : (
              <>
                <Save size={12} />
                {sessaoEditando ? 'Atualizar' : 'Criar Sessão'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function ConfigurarSessoes() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [experiencia, setExperiencia] = useState(null);
  const [sessoes, setSessoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingExp, setLoadingExp] = useState(true);
  const [modalShow, setModalShow] = useState(false);
  const [sessaoEditando, setSessaoEditando] = useState(null);
  const [deletandoId, setDeletandoId] = useState(null);
  const [filtroData, setFiltroData] = useState(new Date().toISOString().split('T')[0]);
  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [transferirShow, setTransferirShow] = useState(false);
  const [historicoShow, setHistoricoShow] = useState(false);

  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // ============================================================
  // CARREGAR EXPERIÊNCIA
  // ============================================================
  useEffect(() => {
    const abortController = new AbortController();

    const fetchExperiencia = async () => {
      if (!id) return;
      setLoadingExp(true);
      try {
        const res = await fetch(`${API_BASE}/api/get_experiencias.php?id=${id}`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: { 'Accept': 'application/json' },
          signal: abortController.signal
        });
        const data = await res.json();

        let exp = null;
        if (data.success && data.data) {
          exp = Array.isArray(data.data) ? data.data[0] : data.data;
        } else if (Array.isArray(data)) {
          exp = data.find(e => Number(e.id) === Number(id)) || data[0];
        }

        setExperiencia(exp);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Erro ao buscar experiência:', err);
      } finally {
        setLoadingExp(false);
      }
    };
    fetchExperiencia();

    return () => abortController.abort();
  }, [id]);

  // ============================================================
  // CARREGAR SESSÕES — SEMPRE TODAS (sem filtro de data)
  // para que a validação no modal veja TODAS as sessões.
  // O filtro visual é aplicado só na renderização.
  // ============================================================
  const fetchSessoes = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const url = `${API_BASE}/api/sessoes_experiencia.php?experiencia_id=${id}`;

      const res = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: { 'Accept': 'application/json' }
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Resposta inválida do servidor');
      }

      if (data.success) {
        const lista = (data.sessoes || []).map(s => ({
          ...s,
          data: normalizarData(s.data),
          hora_inicio: normalizarHora(s.hora_inicio),
          hora_fim: normalizarHora(s.hora_fim),
          vagas_disponiveis: s.vagas_disponiveis ?? ((s.capacidade_maxima || 0) - (s.vagas_ocupadas || 0))
        }));
        setSessoes(lista);
      } else {
        setSessoes([]);
      }
    } catch (err) {
      console.error('Erro ao buscar sessões:', err);
      showToast('Erro ao carregar sessões', 'error');
      setSessoes([]);
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchSessoes();
  }, [fetchSessoes]);

  // ============================================================
  // Sessões filtradas para EXIBIÇÃO
  // ============================================================
  const sessoesFiltradas = useMemo(() => {
    const filtroNorm = filtroData ? normalizarData(filtroData) : '';
    return sessoes.filter(s => {
      if (filtroNorm && normalizarData(s.data) !== filtroNorm) return false;
      if (filtroPeriodo && s.periodo !== filtroPeriodo) return false;
      return true;
    });
  }, [sessoes, filtroData, filtroPeriodo]);

  // ============================================================
  // DELETAR SESSÃO
  // ============================================================
  const deletarSessao = useCallback(async (sessaoId) => {
    if (!window.confirm('Tem certeza que deseja eliminar esta sessão?')) return;
    setDeletandoId(sessaoId);
    try {
      const res = await fetch(`${API_BASE}/api/sessoes_experiencia.php?id=${sessaoId}`, {
        method: 'DELETE',
        mode: 'cors',
        credentials: 'omit',
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Sessão eliminada!', 'success');
        fetchSessoes();
      } else {
        showToast(sanitizarErroBackend(extrairErroBackend(data)), 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(sanitizarErroBackend(err.message), 'error');
    } finally {
      setDeletandoId(null);
    }
  }, [fetchSessoes, showToast]);

  // ============================================================
  // TOGGLE ATIVO
  // ============================================================
  const toggleAtivo = useCallback(async (sessao) => {
    const payload = {
      id: Number(sessao.id),
      experiencia_id: Number(id),
      data: sessao.data,
      hora_inicio: sessao.hora_inicio,
      hora_fim: sessao.hora_fim,
      periodo: sessao.periodo,
      capacidade_maxima: sessao.capacidade_maxima,
      preco_especial: sessao.preco_especial,
      ativo: sessao.ativo ? 0 : 1
    };

    try {
      const res = await fetch(`${API_BASE}/api/sessoes_experiencia.php?action=update`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        fetchSessoes();
      } else {
        showToast(sanitizarErroBackend(extrairErroBackend(data)), 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(sanitizarErroBackend(err.message), 'error');
    }
  }, [id, fetchSessoes, showToast]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const abrirNovaSessao = useCallback(() => {
    // 🔄 Refresca as sessões ANTES de abrir o modal, para garantir
    //    que a validação tem a lista mais recente.
    fetchSessoes();
    setSessaoEditando(null);
    setModalShow(true);
  }, [fetchSessoes]);

  const abrirEditarSessao = useCallback((sessao) => {
    setSessaoEditando(sessao);
    setModalShow(true);
  }, []);

  const fecharModalSessao = useCallback(() => {
    setModalShow(false);
    setSessaoEditando(null);
  }, []);

  const abrirTransferir = useCallback(() => setTransferirShow(true), []);
  const fecharTransferir = useCallback(() => setTransferirShow(false), []);
  const abrirHistorico = useCallback(() => setHistoricoShow(true), []);
  const fecharHistorico = useCallback(() => setHistoricoShow(false), []);

  const onTransferSuccess = useCallback(() => {
    setTransferirShow(false);
    showToast('Sessões transferidas!', 'success');
    fetchSessoes();
  }, [showToast, fetchSessoes]);

  const onSaveSessao = useCallback(() => {
    fetchSessoes();
    showToast('Sessão guardada!', 'success');
  }, [fetchSessoes, showToast]);

  const duplicarSessao = useCallback((sessao) => {
    setSessaoEditando({
      ...sessao,
      id: null,
      hora_inicio: '',
      hora_fim: ''
    });
    setModalShow(true);
  }, []);

  // ============================================================
  // DERIVADOS
  // ============================================================
  const sessoesPorPeriodo = useMemo(() => ({
    'Manhã': sessoesFiltradas.filter(s => s.periodo === 'Manhã'),
    'Meio dia': sessoesFiltradas.filter(s => s.periodo === 'Meio dia'),
    'Tarde': sessoesFiltradas.filter(s => s.periodo === 'Tarde')
  }), [sessoesFiltradas]);

  const totais = useMemo(() => ({
    capacidade: sessoesFiltradas.reduce((acc, s) => acc + (s.capacidade_maxima || 0), 0),
    ocupadas: sessoesFiltradas.reduce((acc, s) => acc + (s.vagas_ocupadas || 0), 0),
    disponiveis: sessoesFiltradas.reduce((acc, s) => acc + (s.vagas_disponiveis || 0), 0)
  }), [sessoesFiltradas]);

  const hojeStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="text-left">
      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-2xl text-white font-medium text-sm flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600' :
          toast.type === 'error' ? 'bg-red-600' : 'bg-amber-600'
        }`}>
          <AlertCircle size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              type="button"
              onClick={() => navigate('/gest/minhas-experiencias')}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={16} className="text-slate-600" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Configurar Sessões</h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">
            {loadingExp ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" /> A carregar experiência...
              </span>
            ) : experiencia ? (
              <>
                <span className="font-semibold text-slate-700">{experiencia.titulo}</span>
                {experiencia.ilha && <span className="text-slate-400"> — {experiencia.ilha}</span>}
              </>
            ) : (
              'Experiência não encontrada'
            )}
          </p>
        </div>

        {/* AÇÕES */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={abrirHistorico}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm px-4 py-3 rounded-xl transition shadow-sm"
            title="Ver histórico de dias arquivados"
          >
            <BarChart3 size={16} />
            Histórico
          </button>
          <button
            type="button"
            onClick={abrirTransferir}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm px-4 py-3 rounded-xl transition shadow-sm"
            title="Transferir todas as sessões de uma data para outra"
          >
            <ArrowRight size={16} />
            Transferir dia
          </button>

          <button
            type="button"
            onClick={abrirNovaSessao}
            className="flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm px-5 py-3 rounded-xl transition shadow-md"
          >
            <Plus size={16} />
            Nova Sessão
          </button>
        </div>
      </div>

      {/* INFO BOX */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 mb-6">
        <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-900">Como funcionam as sessões</p>
          <p className="text-xs text-blue-700 mt-1">
            Cada sessão tem uma capacidade máxima. Quando um cliente reserva, as vagas diminuem automaticamente.
            O sistema bloqueia overbooking. Ao cancelar uma reserva, as vagas são restauradas. Lembre-se a regra de antecedência aplica-se só a sessões 24h depois aparece na pagina de detalhes. (ex: se são 16h, uma sessão às 20h de hoje não deve aparecer, Sessões com menos de 24h são totalmente escondidas na página pública.);
          </p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Data</label>
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 bg-white"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Período</label>
          <select
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 bg-white"
          >
            <option value="">Todos os períodos</option>
            <option value="Manhã">Manhã</option>
            <option value="Meio dia">Meio dia</option>
            <option value="Tarde">Tarde</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => { setFiltroData(''); setFiltroPeriodo(''); }}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={fetchSessoes}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {/* LISTA DE SESSÕES */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">A carregar sessões...</p>
        </div>
      ) : sessoesFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhuma sessão criada</h3>
          <p className="text-sm text-slate-500 mb-6">
            {filtroData || filtroPeriodo
              ? 'Nenhuma sessão encontrada com estes filtros'
              : 'Comece por criar a primeira sessão para esta experiência'}
          </p>
          <button
            type="button"
            onClick={abrirNovaSessao}
            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm px-5 py-3 rounded-xl transition"
          >
            <Plus size={16} />
            Criar primeira sessão
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(sessoesPorPeriodo).map(([periodo, lista]) => {
            if (lista.length === 0) return null;
            return (
              <div key={periodo}>
                <div className="flex items-center gap-2 mb-3">
                  {periodo === 'Manhã' && <Sun size={16} className="text-yellow-500" />}
                  {periodo === 'Meio dia' && <Sun size={16} className="text-orange-400" />}
                  {periodo === 'Tarde' && <Sunset size={16} className="text-red-400" />}
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{periodo}</h2>
                  <span className="text-xs text-slate-400 font-medium">
                    ({lista.length} {lista.length === 1 ? 'sessão' : 'sessões'})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lista.map((sessao) => {
                    const vagas = sessao.vagas_disponiveis;
                    const isEsgotado = vagas === 0;
                    const percentagem = sessao.capacidade_maxima > 0
                      ? (sessao.vagas_ocupadas / sessao.capacidade_maxima) * 100
                      : 0;

                    return (
                      <div
                        key={sessao.id}
                        className={`border rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition-all ${
                          !sessao.ativo ? 'opacity-60 border-slate-200' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-blue-600" />
                              <span className="text-base font-bold text-slate-900">
                                {sessao.hora_inicio}
                              </span>
                              <span className="text-xs text-slate-400">→ {sessao.hora_fim}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {sessao.data ? new Date(sessao.data + 'T00:00:00').toLocaleDateString('pt-PT', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              }) : '—'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleAtivo(sessao)}
                            className="text-blue-600"
                            title={sessao.ativo ? 'Desativar' : 'Ativar'}
                          >
                            {sessao.ativo
                              ? <ToggleRight size={24} />
                              : <ToggleLeft size={24} className="text-slate-300" />}
                          </button>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Ocupação</span>
                            <span className={`text-xs font-bold ${
                              vagas >= 4 ? 'text-green-600' :
                              vagas >= 1 ? 'text-orange-500' : 'text-red-600'
                            }`}>
                              {sessao.vagas_ocupadas}/{sessao.capacidade_maxima}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                percentagem >= 100 ? 'bg-red-500' :
                                percentagem >= 70 ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentagem, 100)}%` }}
                            />
                          </div>
                          <p className={`text-[10px] mt-1 font-medium ${
                            vagas >= 4 ? 'text-green-600' :
                            vagas >= 1 ? 'text-orange-500' : 'text-red-500'
                          }`}>
                            {isEsgotado ? 'Esgotado' : `${vagas} vagas disponíveis`}
                          </p>
                        </div>

                        {sessao.preco_especial && (
                          <div className="flex items-center gap-1 mb-3 px-2 py-1 bg-orange-50 rounded-lg border border-orange-100">
                            <DollarSign size={10} className="text-orange-500" />
                            <span className="text-[10px] font-bold text-orange-600">
                              Preço especial: {Number(sessao.preco_especial).toLocaleString('pt-PT')} CVE
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => abrirEditarSessao(sessao)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                          >
                            <Edit2 size={12} />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicarSessao(sessao)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                            title="Duplicar para outro horário"
                          >
                            <Copy size={12} />
                            Duplicar
                          </button>
                          <button
                            type="button"
                            onClick={() => deletarSessao(sessao.id)}
                            disabled={deletandoId === sessao.id}
                            className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                            title="Eliminar"
                          >
                            {deletandoId === sessao.id
                              ? <Loader2 size={12} className="animate-spin" />
                              : <Trash2 size={12} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RESUMO GERAL */}
      {!loading && sessoesFiltradas.length > 0 && (
        <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Resumo geral</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Total sessões</p>
              <p className="text-2xl font-bold text-slate-900">{sessoesFiltradas.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Capacidade total</p>
              <p className="text-2xl font-bold text-slate-900">{totais.capacidade}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Vagas ocupadas</p>
              <p className="text-2xl font-bold text-orange-600">{totais.ocupadas}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Vagas disponíveis</p>
              <p className="text-2xl font-bold text-green-600">{totais.disponiveis}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SESSÃO */}
      <ModalSessao
        show={modalShow}
        onClose={fecharModalSessao}
        onSave={onSaveSessao}
        sessaoEditando={sessaoEditando}
        experienciaId={id}
        sessoesExistentes={sessoes}
      />

      {/* MODAL TRANSFERIR */}
      {transferirShow && (
        <ModalTransferir
          experienciaId={id}
          onClose={fecharTransferir}
          onSuccess={onTransferSuccess}
        />
      )}

      {historicoShow && (
        <HistoricoSessoes
          experienciaId={id}
          onClose={fecharHistorico}
        />
      )}
    </div>
  );
}