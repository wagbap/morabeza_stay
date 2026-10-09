// src/components/gest/Calendario.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Search, Car, Home, Compass, ChevronDown, Check,
  Lock, Unlock, Loader2, MousePointer2, Info, Building2, Bed, X, Palette
} from 'lucide-react';
import LegendaCoresTooltip from './LegendaCoresTooltip';
const API_BASE = 'https://welovepalop.com';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    setIsMobile(mq.matches);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, [breakpoint]);

  return isMobile;
}

async function fetchJsonBlindado(url, options = {}) {
  const res = await fetch(url, options);
  const texto = await res.text();
  const inicio = texto.indexOf('{');
  const fim = texto.lastIndexOf('}');
  if (inicio === -1 || fim === -1) {
    console.error('[fetchJsonBlindado] Resposta sem JSON:', url, '→', texto);
    return { ok: false, status: res.status, data: null, texto };
  }
  let data;
  try {
    data = JSON.parse(texto.substring(inicio, fim + 1));
  } catch (e) {
    console.error('[fetchJsonBlindado] JSON inválido:', url, '→', texto);
    return { ok: false, status: res.status, data: null, texto };
  }
  return { ok: res.ok, status: res.status, data, texto };
}

function LegendaCoresModal({ isOpen, onClose, temQuartos }) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const itens = [
    { cor: 'bg-[#dcfce7] border-[#bbf7d0]', dot: 'bg-emerald-500', titulo: 'Disponível', desc: 'Dia livre para reserva.' },
    { cor: 'bg-[#fee2e2] border-[#fecaca]', dot: 'bg-red-500', titulo: 'Bloqueado', desc: 'Dia bloqueado manualmente.' },
    ...(temQuartos ? [{ cor: 'bg-[#fef3c7] border-[#fde68a]', dot: 'bg-amber-500', titulo: 'Parcial', desc: 'Alguns quartos bloqueados, outros livres.' }] : []),
    { cor: 'bg-[#dbeafe] border-[#bfdbfe]', dot: 'bg-blue-500', titulo: 'Reservado', desc: 'Já tem reserva confirmada.' },
    { cor: 'bg-gray-100 border-gray-200', dot: 'bg-gray-300', titulo: 'Passado', desc: 'Dia que já passou.' },
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-900 flex items-center justify-center shadow-md">
              <Palette size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0f172a] leading-tight">Legenda de Cores</h3>
              <p className="text-[11px] text-slate-500 font-medium">O que cada cor significa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Fechar"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-[65vh] overflow-y-auto">
          {itens.map((it, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-gray-50 transition"
              style={{ animation: `slideUp 0.35s ease-out ${i * 0.05}s both` }}
            >
              <div className={`w-10 h-10 rounded-lg ${it.cor} border flex items-center justify-center shrink-0`}>
                <span className={`w-3 h-3 rounded-full ${it.dot}`}></span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#0f172a]">{it.titulo}</p>
                <p className="text-xs text-slate-500 leading-snug">{it.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function ModalMotivoBloqueio({ isOpen, onClose, onConfirm, aGuardar, quantidadeDias, nomeItem }) {
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMotivo('');
      setErro('');
      setTimeout(() => textareaRef.current?.focus(), 250);
    }
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirmar = () => {
    const limpo = motivo.trim();
    if (limpo.length < 3) {
      setErro('Escreve um motivo com pelo menos 3 caracteres.');
      return;
    }
    onConfirm(limpo);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => !aGuardar && onClose()}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-md animate-in zoom-in duration-500">
              <Lock size={17} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0f172a] leading-tight">Motivo do bloqueio</h3>
              <p className="text-[11px] text-slate-500 font-medium">Ficará registado para consulta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={aGuardar}
            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-sm text-slate-700 leading-snug">
              Vais bloquear <strong className="text-[#0f172a]">{quantidadeDias} dia{quantidadeDias > 1 ? 's' : ''}</strong>
              {nomeItem ? <> em <strong className="text-[#0f172a]">{nomeItem}</strong></> : null}.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">
              Motivo *
            </label>
            <textarea
              ref={textareaRef}
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

        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={aGuardar}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-gray-100 rounded-xl transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
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
// Calendario principal
// ============================================================
export default function Calendario() {
  const isMobile = useIsMobile(768);

  const [activeTab, setActiveTab] = useState('alojamentos');
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [disponibilidade, setDisponibilidade] = useState({});
  const [tabsPermitidas, setTabsPermitidas] = useState(['alojamentos', 'carros', 'experiencias']);

  const [dropdownAberto, setDropdownAberto] = useState(false);
  const dropdownRef = useRef(null);

  const [bloqueiosPorData, setBloqueiosPorData] = useState({});
  const [diasReservados, setDiasReservados] = useState(new Set());
  const [selecionados, setSelecionados] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [modoSelecao, setModoSelecao] = useState('bloquear');
  const [aGuardar, setAGuardar] = useState(false);
  const [toast, setToast] = useState(null);

  const [motivoModalAberto, setMotivoModalAberto] = useState(false);
  const [legendaModalAberto, setLegendaModalAberto] = useState(false);

  const [tiposQuarto, setTiposQuarto] = useState([]);
  const [carregandoQuartos, setCarregandoQuartos] = useState(false);
  const [quartoAtivo, setQuartoAtivo] = useState(null);

  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const diasSemanaCurto = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const isAlojamento = activeTab === 'alojamentos';

  const obterAlojamentoId = (item) => {
    if (!item) return null;
    const id = item.alojamento_id
            ?? item.id_alojamento
            ?? item.alojamentoId
            ?? item.id;
    return id != null ? Number(id) : null;
  };

  const temQuartos = tiposQuarto.length > 0;
  const modelo = String(selectedItem?.modelo_venda || '').toLowerCase();
  const isInteiro = modelo === 'inteiro' || modelo === 'alojamento_inteiro';
  const isPorQuarto = !isInteiro && temQuartos;
  const modoBloqueio = isPorQuarto ? 'quarto' : 'alojamento';

  const pad2 = (n) => String(n).padStart(2, '0');
  const formatarData = (ano, mes, dia) => `${ano}-${pad2(mes + 1)}-${pad2(dia)}`;

  const hojeStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  };
  const isDataPassada = (dataStr) => {
    if (!dataStr) return false;
    return dataStr < hojeStr();
  };
  const isHoje = (dataStr) => dataStr === hojeStr();

  const mostrarToast = useCallback((tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const obterUserId = () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('morabeza_token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const parsed = JSON.parse(jsonPayload);
        if (parsed.data?.id) return parsed.data.id;
        if (parsed.id) return parsed.id;
      }
      const savedUser = localStorage.getItem('morabeza_user') || localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        return user.id;
      }
    } catch (e) {
      console.error('Erro ao obter ID:', e);
    }
    return null;
  };

  useEffect(() => {
    const fetchUserRoles = async () => {
      const userId = obterUserId();
      if (!userId) return;
      try {
        const response = await fetch(`${API_BASE}/api/usuarios/listar_roles.php?usuario_id=${userId}`);
        const data = await response.json();
        if (data.success && data.roles && data.roles.length > 0) {
          const isAnfitrion = data.roles.some(r => r.name === 'anfitrion' && r.status === 'approved');
          const isGuia = data.roles.some(r => r.name === 'guia_experiencias' && r.status === 'approved');
          const isProprietarioVeiculos = data.roles.some(r => r.name === 'proprietario_veiculos' && r.status === 'approved');
          const tabs = [];
          if (isAnfitrion) tabs.push('alojamentos');
          if (isProprietarioVeiculos) tabs.push('carros');
          if (isGuia) tabs.push('experiencias');
          if (tabs.length > 0) {
            setTabsPermitidas(tabs);
            if (!tabs.includes(activeTab)) setActiveTab(tabs[0]);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar roles:', error);
      }
    };
    fetchUserRoles();
  }, []);

  useEffect(() => { fetchItems(); }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const userId = obterUserId();
      if (!userId) { setLoading(false); return; }
      let url = '';
      if (activeTab === 'alojamentos') {
        url = `${API_BASE}/api/get_alojamentos_by_proprietario.php?proprietario_id=${userId}`;
      } else if (activeTab === 'carros') {
        url = `${API_BASE}/api/get_carros_by_proprietario.php?proprietario_id=${userId}`;
      } else if (activeTab === 'experiencias') {
        url = `${API_BASE}/api/get_experiencias_by_proprietario.php?proprietario_id=${userId}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      let itemsList = [];
      if (data.success && data.data) {
        itemsList = Array.isArray(data.data) ? data.data : [data.data];
      }
      setItems(itemsList);
      setSelectedItem(itemsList.length > 0 ? itemsList[0] : null);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisponibilidade = async () => {
    if (!selectedItem) return;
    try {
      const ano = selectedYear;
      const mes = selectedMonth;
      const ultimoDia = new Date(ano, mes + 1, 0).getDate();
      const disponibilidadeMap = {};
      for (let dia = 1; dia <= ultimoDia; dia++) {
        const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        let url = '';
        if (activeTab === 'alojamentos') {
          url = `${API_BASE}/api/disponibilidade/alojamento.php?alojamento_id=${obterAlojamentoId(selectedItem)}&data_checkin=${dataStr}&data_checkout=${dataStr}`;
        } else if (activeTab === 'carros') {
          url = `${API_BASE}/api/disponibilidade/carro.php?carro_id=${selectedItem.id}&data_inicio=${dataStr}&data_fim=${dataStr}`;
        } else if (activeTab === 'experiencias') {
          url = `${API_BASE}/api/disponibilidade/experiencia.php?experiencia_id=${selectedItem.id}&data=${dataStr}`;
        }
        try {
          const response = await fetch(url);
          const result = await response.json();
          disponibilidadeMap[dia] = result.success && result.data ? result.data.disponivel : true;
        } catch (e) {
          disponibilidadeMap[dia] = true;
        }
      }
      setDisponibilidade(disponibilidadeMap);
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error);
    }
  };

  const fetchTiposQuarto = useCallback(async (item = null) => {
    const alvo = item || selectedItem;
    if (!alvo) { setTiposQuarto([]); return; }
    const alojamentoId = obterAlojamentoId(alvo);
    if (!alojamentoId) { setTiposQuarto([]); return; }
    setCarregandoQuartos(true);
    try {
      const url = `${API_BASE}/api/get_tipos_quarto.php?alojamento_id=${alojamentoId}&t=${Date.now()}`;
      const { ok, data, texto } = await fetchJsonBlindado(url);
      if (!ok || !data?.success) {
        console.error('[fetchTiposQuarto] resposta:', texto);
        setTiposQuarto([]);
        return;
      }
      const lista = data?.tipos_quarto || data?.data || data?.quartos || [];
      const normalizada = (Array.isArray(lista) ? lista : [])
        .map(tq => {
          const tipoId = tq.tipo_quarto_id ?? tq.tipoQuartoId ?? tq.id ?? null;
          const realId = tq.alojamento_quarto_id ?? tq.quarto_id ?? null;
          return {
            ...tq,
            tipo_quarto_id: tipoId !== null ? Number(tipoId) : null,
            alojamento_quarto_id: realId !== null ? Number(realId) : null,
            nome: tq.nome || tq.tipo_nome || tq.titulo || 'Quarto',
          };
        })
        .filter(tq => tq.tipo_quarto_id !== null);
      if (normalizada.length > 0) setTiposQuarto(normalizada);
      else setTiposQuarto([]);
    } catch (e) {
      console.error('Erro ao buscar tipos de quarto:', e);
      setTiposQuarto([]);
    } finally {
      setCarregandoQuartos(false);
    }
  }, [selectedItem]);

  const fetchBloqueiosManuais = useCallback(async () => {
    if (!selectedItem || !isAlojamento) return;
    try {
      const alojamentoId = obterAlojamentoId(selectedItem);
      const params = new URLSearchParams({
        action: 'listar',
        alojamento_id: String(alojamentoId),
        ano: String(selectedYear),
        mes: String(selectedMonth + 1),
      });
      if (isPorQuarto && quartoAtivo?.tipo_quarto_id) {
        params.set('tipo_quarto_id', String(quartoAtivo.tipo_quarto_id));
      }
      const url = `${API_BASE}/api/alojamento_bloqueios.php?${params.toString()}`;
      const { ok, data, texto } = await fetchJsonBlindado(url);
      if (!ok || !data?.success) {
        console.error('[fetchBloqueiosManuais] resposta:', texto);
        return;
      }

      const porData = {};
      (data.bloqueios || []).forEach(b => {
        const dia = String(b.data).substring(0, 10);
        const qid = Number(b.quarto_id ?? 0);
        if (!porData[dia]) porData[dia] = { global: false, quartos: new Set() };
        if (qid === 0) porData[dia].global = true;
        else porData[dia].quartos.add(qid);
      });
      const totalQuartos = tiposQuarto.length || 0;
      Object.values(porData).forEach(info => {
        info.todosQuartos = info.global || (totalQuartos > 0 && info.quartos.size >= totalQuartos);
      });
      setBloqueiosPorData(porData);
      setDiasReservados(new Set(data.dias_reservados || []));
    } catch (e) {
      console.error('Erro ao buscar bloqueios:', e);
    }
  }, [selectedItem, selectedYear, selectedMonth, isAlojamento, tiposQuarto, isPorQuarto, quartoAtivo?.tipo_quarto_id]);

  useEffect(() => {
    if (!selectedItem || !isAlojamento) { setTiposQuarto([]); return; }
    fetchTiposQuarto(selectedItem);
  }, [selectedItem, isAlojamento, fetchTiposQuarto]);

  useEffect(() => {
    if (selectedItem) {
      fetchDisponibilidade();
      if (isAlojamento) fetchBloqueiosManuais();
    }
  }, [selectedItem, selectedMonth, selectedYear, activeTab, tiposQuarto, fetchBloqueiosManuais]);

  useEffect(() => {
    if (!selectedItem) { setQuartoAtivo(null); return; }
    if (tiposQuarto.length === 0) { setQuartoAtivo(null); return; }
    const aindaExiste = quartoAtivo && tiposQuarto.some(
      tq => String(tq.tipo_quarto_id) === String(quartoAtivo.tipo_quarto_id)
    );
    if (!aindaExiste) {
      const primeiro = tiposQuarto[0];
      setQuartoAtivo({
        tipo_quarto_id: Number(primeiro.tipo_quarto_id),
        alojamento_quarto_id: Number(primeiro.alojamento_quarto_id),
        nome: primeiro.nome,
      });
    }
  }, [tiposQuarto, selectedItem?.id]);

  useEffect(() => {
    setSelecionados(new Set());
    setDragStart(null);
    setIsDragging(false);
  }, [selectedItem, selectedMonth, selectedYear, activeTab, quartoAtivo?.tipo_quarto_id]);

  const getEstadoDiaAtual = (dataStr) => {
    if (!dataStr) return 'fora';
    if (isDataPassada(dataStr)) return 'passado';
    if (diasReservados.has(dataStr)) return 'reservado';
    const info = bloqueiosPorData[dataStr];
    if (!info) return 'livre';
    if (modoBloqueio === 'alojamento') {
      if (info.global || info.quartos.size > 0) return 'bloqueado';
      return 'livre';
    }
    if (info.global || info.todosQuartos) return 'bloqueado_global';
    const qidAtivo = quartoAtivo?.alojamento_quarto_id;
    if (qidAtivo && info.quartos.has(Number(qidAtivo))) return 'bloqueado_quarto';
    if (info.quartos.size > 0) return 'parcial';
    return 'livre';
  };

  const getStatusColorFromEstado = (estado, selecionado) => {
    if (selecionado) {
      return modoSelecao === 'bloquear'
        ? 'bg-red-500 text-white border-red-600 shadow-md border'
        : 'bg-emerald-500 text-white border-emerald-600 shadow-md border';
    }
    switch (estado) {
      case 'livre':             return 'bg-[#dcfce7] text-[#16a34a] font-bold border border-[#bbf7d0]';
      case 'bloqueado':         return 'bg-[#fee2e2] text-[#dc2626] font-bold border border-[#fecaca]';
      case 'bloqueado_global':  return 'bg-[#fee2e2] text-[#dc2626] font-bold border border-[#fecaca]';
      case 'bloqueado_quarto':  return 'bg-[#fee2e2] text-[#dc2626] font-bold border border-[#fecaca]';
      case 'parcial':           return 'bg-[#fef3c7] text-[#d97706] font-bold border border-[#fde68a]';
      case 'reservado':         return 'bg-[#dbeafe] text-[#1d4ed8] font-bold border border-[#bfdbfe] cursor-not-allowed';
      case 'passado':           return 'bg-gray-100 text-gray-300 font-semibold border border-gray-200 cursor-not-allowed opacity-60';
      default:                  return 'bg-white text-[#0f172a] border border-transparent';
    }
  };

  const getStatusLabelFromEstado = (estado) => {
    switch (estado) {
      case 'livre':             return 'Disponível';
      case 'bloqueado':         return 'Bloqueado';
      case 'bloqueado_global':  return 'Bloqueado';
      case 'bloqueado_quarto':  return 'Bloqueado';
      case 'parcial':           return 'Parcial';
      case 'reservado':         return 'Reservado';
      case 'passado':           return 'Passado';
      default:                  return '';
    }
  };

  const getStatusDotFromEstado = (estado) => {
    switch (estado) {
      case 'livre':             return 'bg-emerald-500';
      case 'bloqueado':         return 'bg-red-500';
      case 'bloqueado_global':  return 'bg-red-500';
      case 'bloqueado_quarto':  return 'bg-red-500';
      case 'parcial':           return 'bg-amber-500';
      case 'reservado':         return 'bg-blue-500';
      case 'passado':           return 'bg-gray-300';
      default:                  return 'bg-transparent';
    }
  };

  const getDiasMes = () => {
    const ano = selectedYear;
    const mes = selectedMonth;
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diaSemanaInicio = primeiroDia.getDay();
    let startOffset = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1;
    const dias = [];
    const diasMesAnterior = new Date(ano, mes, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      dias.push({ dia: diasMesAnterior - i, mesAtual: false, dataStr: null, isHoje: false });
    }
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const dataStr = formatarData(ano, mes, dia);
      let estado = null;
      if (isDataPassada(dataStr)) {
        estado = 'passado';
      } else if (isAlojamento) {
        estado = getEstadoDiaAtual(dataStr);
      } else {
        if (disponibilidade[dia] === true) estado = 'livre';
        else if (disponibilidade[dia] === false) estado = 'reservado';
        else estado = 'fora';
      }
      dias.push({ dia, mesAtual: true, estado, dataStr, isHoje: isHoje(dataStr) });
    }
    const totalDias = dias.length;
    const diasFaltando = 42 - totalDias;
    for (let i = 1; i <= diasFaltando; i++) {
      dias.push({ dia: i, mesAtual: false, dataStr: null, isHoje: false });
    }
    return dias;
  };

  const mudarMes = (direcao) => {
    let novoMes = selectedMonth + direcao;
    let novoAno = selectedYear;
    if (novoMes < 0) { novoMes = 11; novoAno--; }
    else if (novoMes > 11) { novoMes = 0; novoAno++; }
    setSelectedMonth(novoMes);
    setSelectedYear(novoAno);
  };

  const filteredItems = items.filter(item =>
    item.titulo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoIcone = (tab, size = 18) => {
    switch(tab) {
      case 'alojamentos': return <Home size={size} className="text-blue-600 shrink-0" />;
      case 'carros': return <Car size={size} className="text-green-600 shrink-0" />;
      case 'experiencias': return <Compass size={size} className="text-purple-600 shrink-0" />;
      default: return null;
    }
  };

  const podeSelecionar = (dataStr) => {
    if (!isAlojamento || !dataStr) return false;
    const estado = getEstadoDiaAtual(dataStr);
    if (estado === 'passado' || estado === 'reservado') return false;
    return true;
  };

  const handleMouseDown = (dataStr) => {
    if (!podeSelecionar(dataStr)) return;
    const estado = getEstadoDiaAtual(dataStr);
    const jaBloqueado = estado === 'bloqueado' || estado === 'bloqueado_global' || estado === 'bloqueado_quarto';
    setModoSelecao(jaBloqueado ? 'desbloquear' : 'bloquear');
    setIsDragging(true);
    setDragStart(dataStr);
    setSelecionados(new Set([dataStr]));
  };

  const handleMouseEnter = (dataStr) => {
    if (!isDragging || !dragStart || !dataStr) return;
    if (isDataPassada(dataStr)) return;
    const start = new Date(dragStart);
    const end = new Date(dataStr);
    const [menor, maior] = start <= end ? [start, end] : [end, start];
    const novaSelecao = new Set();
    const cursor = new Date(menor);
    while (cursor <= maior) {
      const s = cursor.toISOString().split('T')[0];
      if (isDataPassada(s)) { cursor.setDate(cursor.getDate() + 1); continue; }
      const est = getEstadoDiaAtual(s);
      if (modoSelecao === 'bloquear' && est !== 'reservado' && est !== 'passado') novaSelecao.add(s);
      if (modoSelecao === 'desbloquear' && (est === 'bloqueado' || est === 'bloqueado_global' || est === 'bloqueado_quarto')) novaSelecao.add(s);
      cursor.setDate(cursor.getDate() + 1);
    }
    setSelecionados(novaSelecao);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const executarAcao = async (motivoFinal = null) => {
    if (!selectedItem || selecionados.size === 0 || !isAlojamento) return;

    // ✅ CORREÇÃO: por_quarto envia o alojamento_quarto_id (quarto físico),
    // NÃO o tipo_quarto_id. Assim o PHP bloqueia apenas esse quarto,
    // em vez de bloquear todos os quartos do mesmo tipo.
    const quartoFisicoId = isPorQuarto
      ? Number(quartoAtivo?.alojamento_quarto_id)
      : 0;

    if (isPorQuarto && (!Number.isFinite(quartoFisicoId) || quartoFisicoId <= 0)) {
      mostrarToast('erro', 'Quarto inválido. Escolhe um quarto no dropdown.');
      return;
    }

    setAGuardar(true);
    try {
      const endpoint = modoSelecao === 'bloquear'
        ? `${API_BASE}/api/alojamento_bloqueios.php?action=bloquear`
        : `${API_BASE}/api/alojamento_bloqueios.php?action=desbloquear`;
      const alojamentoId = obterAlojamentoId(selectedItem);

      const body = {
        alojamento_id: Number(alojamentoId),
        datas: Array.from(selecionados),
        quarto_id: quartoFisicoId,   // ✅ quarto físico específico
        tipo_quarto_id: 0,           // ✅ 0 = não bloquear por tipo
        motivo: modoSelecao === 'bloquear' ? (motivoFinal || 'Bloqueio manual') : 'Desbloqueio manual',
      };

      console.log('📦 [Calendario] POST →', endpoint, body);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const texto = await res.text();
      console.log('📦 [Calendario] response → status:', res.status, 'body:', texto);

      if (!res.ok) {
        mostrarToast('erro', `Erro do servidor (${res.status}).`);
        return;
      }

      const inicio = texto.indexOf('{');
      const fim = texto.lastIndexOf('}');
      if (inicio === -1 || fim === -1) {
        mostrarToast('erro', 'Resposta inválida do servidor.');
        return;
      }
      let data;
      try {
        data = JSON.parse(texto.substring(inicio, fim + 1));
      } catch (e) {
        console.error('[Calendario] JSON inválido:', texto);
        mostrarToast('erro', 'Erro ao processar resposta.');
        return;
      }

      if (data.success) {
        mostrarToast('sucesso',
          modoSelecao === 'bloquear'
            ? `${selecionados.size} data(s) bloqueada(s).`
            : `${selecionados.size} data(s) desbloqueada(s).`);
        setSelecionados(new Set());
        setMotivoModalAberto(false);
        await fetchBloqueiosManuais();
      } else {
        mostrarToast('erro', data.error || 'Erro ao aplicar ação.');
      }
    } catch (e) {
      console.error('[Calendario executarAcao]', e);
      mostrarToast('erro', 'Erro de rede.');
    } finally {
      setAGuardar(false);
    }
  };

  const aplicarAcao = () => {
    if (!selectedItem || selecionados.size === 0 || !isAlojamento) return;
    if (modoSelecao === 'bloquear') setMotivoModalAberto(true);
    else executarAcao();
  };

  const limparSelecao = () => setSelecionados(new Set());

  const handleTrocarQuarto = (e) => {
    const tq = tiposQuarto.find(t => String(t.tipo_quarto_id) === String(e.target.value));
    if (tq) {
      setQuartoAtivo({
        tipo_quarto_id: Number(tq.tipo_quarto_id),
        alojamento_quarto_id: Number(tq.alojamento_quarto_id),
        nome: tq.nome,
      });
    }
  };

  const renderLegenda = () => {
    if (isMobile) {
      return (
        <button
          type="button"
          onClick={() => setLegendaModalAberto(true)}
          className="shrink-0 w-9 h-9 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-700 transition shadow-sm active:scale-95"
          aria-label="Ver legenda de cores"
        >
          <Info size={16} />
        </button>
      );
    }
    return (
      <div className="shrink-0">
        <LegendaCoresTooltip />
      </div>
    );
  };

  const jaEstouNoMesAtual =
    selectedMonth === new Date().getMonth() &&
    selectedYear === new Date().getFullYear();

  if (isMobile) {
    return (
      <div className="max-w-6xl w-full text-[#0f172a] px-3 sm:px-4 py-4 sm:py-6 md:px-0">
        <h1 className="text-lg sm:text-[22px] font-bold mb-4 sm:mb-6">Calendário de Disponibilidade</h1>

        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto no-scrollbar">
          {tabsPermitidas.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 capitalize whitespace-nowrap ${
                activeTab === tab ? 'text-blue-900 border-b-2 border-blue-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {getTipoIcone(tab, 16)} {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => mudarMes(-1)}
                className="p-1.5 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white shrink-0"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <h2 className="text-sm sm:text-[18px] font-bold text-[#0f172a] whitespace-nowrap">
                {meses[selectedMonth]} {selectedYear}
              </h2>
              <button
                onClick={() => mudarMes(1)}
                className="p-1.5 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white shrink-0"
                aria-label="Próximo mês"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>
            <button
              onClick={() => { setSelectedMonth(new Date().getMonth()); setSelectedYear(new Date().getFullYear()); }}
              disabled={jaEstouNoMesAtual}
              className={`px-3 sm:px-4 py-1.5 text-[11px] sm:text-[13px] font-semibold text-[#475569] bg-white border border-gray-200 rounded-full shadow-sm shrink-0 ${
                jaEstouNoMesAtual ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Hoje
            </button>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2 w-full flex-wrap">
              <div className="relative flex-1 min-w-[160px]" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownAberto(!dropdownAberto)}
                  className="w-full flex items-center justify-between bg-white border border-gray-200 text-[#0f172a] text-xs sm:text-[14px] font-medium rounded-xl px-3 sm:px-4 py-2.5 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    {getTipoIcone(activeTab, 16)}
                    <span className="truncate">{selectedItem?.titulo || 'Selecione um item...'}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform shrink-0 ml-2 ${dropdownAberto ? 'rotate-180' : ''}`} />
                </button>

                {dropdownAberto && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Pesquisar anúncio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none bg-gray-50/50"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-1">
                      {filteredItems.length > 0 ? (
                        filteredItems.map(item => {
                          const isSelected = selectedItem?.id === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setSelectedItem(item);
                                setDropdownAberto(false);
                                setSearchTerm('');
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                                isSelected ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <span className="truncate">{item.titulo}</span>
                              {isSelected && <Check size={14} className="text-blue-900 shrink-0 ml-2" />}
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-center py-3 text-xs text-gray-400">Nenhum anúncio encontrado</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {isAlojamento && isPorQuarto && (
                <select
                  value={quartoAtivo?.tipo_quarto_id ?? ''}
                  onChange={handleTrocarQuarto}
                  className="shrink-0 max-w-[140px] px-3 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 truncate"
                  title={quartoAtivo?.nome || 'Quarto'}
                >
                  {tiposQuarto.map(tq => (
                    <option key={tq.tipo_quarto_id} value={tq.tipo_quarto_id}>
                      {tq.nome}
                    </option>
                  ))}
                </select>
              )}

              {renderLegenda()}
            </div>
          )}
        </div>

        {isAlojamento && !isPorQuarto && selectedItem && (
          <div className="mb-4 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-xs text-slate-700 font-semibold">
            <Building2 size={14} className="shrink-0 mt-0.5" />
            <span>A bloquear <strong>alojamento inteiro</strong>.</span>
          </div>
        )}

        {isAlojamento && selecionados.size > 0 && (
          <div className="sticky top-2 z-40 mb-3 sm:mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="bg-slate-900 text-white rounded-xl sm:rounded-2xl shadow-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold min-w-0">
                <MousePointer2 size={14} className="text-blue-400 shrink-0" />
                <span className="whitespace-nowrap">{selecionados.size} dia{selecionados.size > 1 ? 's' : ''}</span>
                <span className={`hidden sm:inline text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  modoSelecao === 'bloquear' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {modoSelecao === 'bloquear' ? 'Bloquear' : 'Desbloquear'}
                </span>
                {isPorQuarto && (
                  <span className="hidden sm:inline text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10">
                    {quartoAtivo?.nome || '—'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={limparSelecao}
                  className="px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={aplicarAcao}
                  disabled={aGuardar}
                  className={`px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    modoSelecao === 'bloquear' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  } text-white disabled:opacity-50`}
                >
                  {aGuardar ? (
                    <><Loader2 size={12} className="animate-spin" /> <span className="hidden sm:inline">A guardar...</span></>
                  ) : modoSelecao === 'bloquear' ? (
                    <><Lock size={12} /> Bloquear</>
                  ) : (
                    <><Unlock size={12} /> Desbloquear</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
            <p className="text-slate-500 mt-2 text-sm">Carregando calendário...</p>
          </div>
        )}

        {!loading && selectedItem && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
              {diasSemana.map((dia, idx) => (
                <div key={idx} className="py-2 sm:py-3 text-center">
                  <span className="hidden sm:inline text-[13px] font-bold text-[#0f172a]">{dia}</span>
                  <span className="sm:hidden text-[11px] font-bold text-[#0f172a]">{diasSemanaCurto[idx]}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {getDiasMes().map((dayObj, index) => {
                const selecionado = dayObj.dataStr && selecionados.has(dayObj.dataStr);
                const isMobileFiller = !dayObj.mesAtual;
                const clicavel = isAlojamento;
                const label = getStatusLabelFromEstado(dayObj.estado);
                return (
                  <div
                    key={index}
                    className={`border-b border-r border-gray-100 last:border-r-0 ${isMobileFiller ? 'bg-gray-50/40' : ''}`}
                    onMouseEnter={() => handleMouseEnter(dayObj.dataStr)}
                  >
                    <div
                      onMouseDown={() => clicavel && handleMouseDown(dayObj.dataStr)}
                      onTouchStart={() => clicavel && handleMouseDown(dayObj.dataStr)}
                      className={`aspect-square sm:aspect-auto sm:min-h-[95px] w-full flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-md sm:rounded-lg m-0.5 sm:m-1 transition-all duration-150 select-none ${
                        clicavel ? 'cursor-pointer' : ''
                      } ${
                        isMobileFiller ? 'text-transparent' : getStatusColorFromEstado(dayObj.estado, selecionado)
                      } ${
                        dayObj.isHoje ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                      }`}
                    >
                      <span className="text-[13px] sm:text-[14px] font-semibold leading-none">
                        {isMobileFiller ? '' : dayObj.dia}
                      </span>
                      {dayObj.estado && dayObj.mesAtual && (
                        <>
                          <span className={`sm:hidden w-1.5 h-1.5 rounded-full ${getStatusDotFromEstado(dayObj.estado)}`} />
                          <span className="hidden sm:inline text-[10px] uppercase tracking-wider">{label}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 sm:p-12 text-center text-gray-400">
            <p className="text-sm sm:text-base font-medium">Nenhum registo encontrado para esta categoria.</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-4 sm:mt-6 px-1 sm:px-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-[#dcfce7] border border-[#bbf7d0]"></div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-[#fee2e2] border border-[#fecaca]"></div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Bloqueado</span>
          </div>
          {temQuartos && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-[#fef3c7] border border-[#fde68a]"></div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Parcial</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-[#dbeafe] border border-[#bfdbfe]"></div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Reservado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gray-100 border border-gray-200"></div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Passado</span>
          </div>
        </div>

        {toast && (
          <div className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 z-[100] px-4 sm:px-5 py-3 rounded-xl shadow-2xl text-white text-xs sm:text-sm font-semibold text-center sm:text-left animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.tipo === 'sucesso' ? 'bg-emerald-600' : 'bg-red-600'
          }`}>
            {toast.msg}
          </div>
        )}

        <LegendaCoresModal
          isOpen={legendaModalAberto}
          onClose={() => setLegendaModalAberto(false)}
          temQuartos={temQuartos}
        />

        <ModalMotivoBloqueio
          isOpen={motivoModalAberto}
          onClose={() => setMotivoModalAberto(false)}
          onConfirm={(motivo) => executarAcao(motivo)}
          aGuardar={aGuardar}
          quantidadeDias={selecionados.size}
          nomeItem={isPorQuarto ? quartoAtivo?.nome : selectedItem?.titulo}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full text-[#0f172a] px-4 py-6 md:px-0">
      <h1 className="text-[22px] font-bold mb-6">Calendário de Disponibilidade</h1>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabsPermitidas.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 capitalize ${
              activeTab === tab ? 'text-blue-900 border-b-2 border-blue-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {getTipoIcone(tab)} {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => mudarMes(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-[16px] md:text-[18px] font-bold text-[#0f172a]">
            {meses[selectedMonth]} {selectedYear}
          </h2>
          <button
            onClick={() => { setSelectedMonth(new Date().getMonth()); setSelectedYear(new Date().getFullYear()); }}
            disabled={jaEstouNoMesAtual}
            className={`px-4 py-1.5 text-[13px] font-semibold text-[#475569] bg-white border border-gray-200 rounded-full shadow-sm ${
              jaEstouNoMesAtual ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
          >
            Hoje
          </button>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <div className="relative flex-1 md:flex-initial md:w-64" ref={dropdownRef}>
              <button
                onClick={() => setDropdownAberto(!dropdownAberto)}
                className="w-full flex items-center justify-between bg-white border border-gray-200 text-[#0f172a] text-[14px] font-medium rounded-xl px-4 py-2.5 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  {getTipoIcone(activeTab)}
                  <span className="truncate">{selectedItem?.titulo || 'Selecione um item...'}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownAberto ? 'rotate-180' : ''}`} />
              </button>

              {dropdownAberto && (
                <div className="absolute right-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar anúncio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none bg-gray-50/50"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {filteredItems.length > 0 ? (
                      filteredItems.map(item => {
                        const isSelected = selectedItem?.id === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setSelectedItem(item);
                              setDropdownAberto(false);
                              setSearchTerm('');
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                              isSelected ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <span className="truncate">{item.titulo}</span>
                            {isSelected && <Check size={14} className="text-blue-900" />}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-center py-3 text-xs text-gray-400">Nenhum anúncio encontrado</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isAlojamento && isPorQuarto && (
              <>
                <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-semibold">
                  <Bed size={14} />
                </div>
                <select
                  value={quartoAtivo?.tipo_quarto_id ?? ''}
                  onChange={handleTrocarQuarto}
                  className="shrink-0 max-w-[180px] px-3 py-2.5 text-sm font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  title={quartoAtivo?.nome || 'Quarto'}
                >
                  {tiposQuarto.map(tq => (
                    <option key={tq.tipo_quarto_id} value={tq.tipo_quarto_id}>
                      {tq.nome}
                    </option>
                  ))}
                </select>
              </>
            )}

            {renderLegenda()}
          </div>
        )}
      </div>

      {isAlojamento && !isPorQuarto && selectedItem && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold">
          <Building2 size={14} />
          <span>A bloquear o alojamento inteiro</span>
        </div>
      )}

      {isAlojamento && selecionados.size > 0 && (
        <div className="sticky top-2 z-40 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MousePointer2 size={16} className="text-blue-400" />
              <span>
                {selecionados.size} dia{selecionados.size > 1 ? 's' : ''} selecionado{selecionados.size > 1 ? 's' : ''}
              </span>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                modoSelecao === 'bloquear' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {modoSelecao === 'bloquear' ? 'Bloquear' : 'Desbloquear'}
              </span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10">
                {isPorQuarto ? (quartoAtivo?.nome || '—') : 'Alojamento inteiro'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={limparSelecao}
                className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={aplicarAcao}
                disabled={aGuardar}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
                  modoSelecao === 'bloquear'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                } disabled:opacity-50`}
              >
                {aGuardar ? (
                  <><Loader2 size={14} className="animate-spin" /> A guardar...</>
                ) : modoSelecao === 'bloquear' ? (
                  <><Lock size={14} /> Bloquear</>
                ) : (
                  <><Unlock size={14} /> Desbloquear</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
          <p className="text-slate-500 mt-2">Carregando calendário...</p>
        </div>
      )}

      {!loading && selectedItem && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
            {diasSemana.map((dia, idx) => (
              <div key={idx} className="py-3 text-center border-r border-gray-100 last:border-r-0">
                <span className="text-[13px] font-bold text-[#0f172a]">{dia}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {getDiasMes().map((dayObj, index) => {
              const selecionado = dayObj.dataStr && selecionados.has(dayObj.dataStr);
              const clicavel = isAlojamento;
              const label = getStatusLabelFromEstado(dayObj.estado);
              return (
                <div
                  key={index}
                  className={`border-b border-r border-gray-100 p-2 min-h-[95px] ${!dayObj.mesAtual ? 'bg-gray-50/40 text-gray-400' : ''}`}
                  onMouseEnter={() => handleMouseEnter(dayObj.dataStr)}
                >
                  <div
                    onMouseDown={() => clicavel && handleMouseDown(dayObj.dataStr)}
                    className={`w-full h-full min-h-[75px] rounded-lg flex flex-col items-center justify-center p-1 transition-all duration-150 select-none ${
                      clicavel ? 'cursor-pointer' : ''
                    } ${getStatusColorFromEstado(dayObj.estado, selecionado)} ${
                      dayObj.isHoje ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                    }`}
                  >
                    <span className="text-[14px] font-semibold">{dayObj.dia}</span>
                    {dayObj.estado && dayObj.mesAtual && (
                      <span className="text-[10px] mt-1 uppercase tracking-wider">{label}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-base font-medium">Nenhum registo encontrado para esta categoria.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-6 mt-6 px-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#dcfce7] border border-[#bbf7d0]"></div>
          <span className="text-xs font-semibold text-slate-600">Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#fee2e2] border border-[#fecaca]"></div>
          <span className="text-xs font-semibold text-slate-600">Bloqueado</span>
        </div>
        {temQuartos && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#fef3c7] border border-[#fde68a]"></div>
            <span className="text-xs font-semibold text-slate-600">Parcial</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#dbeafe] border border-[#bfdbfe]"></div>
          <span className="text-xs font-semibold text-slate-600">Reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>
          <span className="text-xs font-semibold text-slate-600">Passado</span>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toast.tipo === 'sucesso' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}

      <ModalMotivoBloqueio
        isOpen={motivoModalAberto}
        onClose={() => setMotivoModalAberto(false)}
        onConfirm={(motivo) => executarAcao(motivo)}
        aGuardar={aGuardar}
        quantidadeDias={selecionados.size}
        nomeItem={isPorQuarto ? quartoAtivo?.nome : selectedItem?.titulo}
      />
    </div>
  );
}