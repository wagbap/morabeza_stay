// src/components/gest/LevantamentoCaucaoCondicoes.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Car, Loader2, Search, ChevronDown, Check,
  MapPin, Shield, UserCheck, Save, AlertCircle, CheckCircle,
  Clock, Plane, Hotel, Fuel, Gauge, Calendar, CreditCard,
  FileText, Users, AlertTriangle, Info
} from 'lucide-react';

const API = 'https://welovepalop.com/api';

// Tabs
const TABS = [
  { key: 'levantamento', label: 'Levantamento & Devolução', icone: MapPin },
  { key: 'caucao',       label: 'Caução',                    icone: Shield },
  { key: 'condutor',     label: 'Políticas do Condutor',     icone: UserCheck }
];

// Ilhas de Cabo Verde
const ILHAS = [
  'Santiago', 'São Vicente', 'Sal', 'Boa Vista', 'Fogo',
  'Santo Antão', 'São Nicolau', 'Maio', 'Brava', 'Santa Luzia'
];

// Formas de pagamento de caução
const FORMAS_CAUCAO = [
  { valor: 'dinheiro', label: 'Dinheiro' },
  { valor: 'transferencia', label: 'Transferência Bancária' },
  { valor: 'multibanco', label: 'Multibanco/Vinti4' },
  { valor: 'cheque', label: 'Cheque' }
];

// Políticas de combustível
const POLITICAS_COMBUSTIVEL = [
  { valor: 'cheio_cheio', label: 'Cheio → Cheio (devolver com o mesmo nível)' },
  { valor: 'cheio_vazio', label: 'Cheio → Vazio (cliente paga o combustível)' },
  { valor: 'mesmo_nivel', label: 'Mesmo nível (devolver como recebeu)' }
];

export default function LevantamentoCaucaoCondicoes() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [carros, setCarros] = useState([]);
  const [carroSelecionado, setCarroSelecionado] = useState(null);
  const [tabAtiva, setTabAtiva] = useState('levantamento');
  const [guardando, setGuardando] = useState(false);

  // LOV dropdown
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado do formulário
  const [form, setForm] = useState({
    // #14 — Levantamento e Devolução
    levantamento_ilha: '',
    levantamento_local: '',
    levantamento_hora_inicio: '08:00',
    levantamento_hora_fim: '20:00',
    devolucao_mesmo_local: 1,
    devolucao_local_alternativo: '',
    entrega_aeroporto: 0,
    entrega_hotel: 0,
    entrega_custo_aeroporto: 0,
    entrega_custo_hotel: 0,
    levantamento_notas: '',

    // #15 — Caução
    exige_caucao: 0,
    caucao_valor: 0,
    caucao_formas: [],
    caucao_condicoes: '',

    // #17 — Políticas do Condutor
    idade_minima: 21,
    carta_minima_anos: 2,
    franquia: 0,
    politica_combustivel: 'cheio_cheio',
    limite_km: 0,
    custo_km_extra: 0,
    politica_atraso: '',
    segundo_condutor: 0
  });

  const [toast, setToast] = useState({ show: false, tipo: 'ok', msg: '' });

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
      const savedUser = localStorage.getItem('user') || localStorage.getItem('morabeza_user');
      if (savedUser) return JSON.parse(savedUser).id;
    } catch (e) { console.error(e); }
    return null;
  };

  const showToast = (tipo, msg) => {
    setToast({ show: true, tipo, msg });
    setTimeout(() => setToast({ show: false, tipo: 'ok', msg: '' }), 3500);
  };

  // Carregar carros do dono
  useEffect(() => {
    const fetchCarros = async () => {
      setLoading(true);
      try {
        const userId = obterUserId();
        if (!userId) { setLoading(false); return; }

        const res = await fetch(`${API}/carro/listar.php?usuario_id=${userId}`);
        const data = await res.json();

        let lista = [];
        if (data.success && data.data?.items) lista = data.data.items;
        else if (data.success && Array.isArray(data.data)) lista = data.data;
        else if (data.success && data.data?.carros) lista = data.data.carros;

        setCarros(lista);
        if (lista.length > 0) setCarroSelecionado(lista[0]);
      } catch (e) {
        console.error(e);
        showToast('erro', 'Erro ao carregar carros');
      } finally {
        setLoading(false);
      }
    };
    fetchCarros();
  }, []);

  // Carregar condições do carro selecionado
  useEffect(() => {
    if (!carroSelecionado) return;

    // Preencher form com dados existentes do carro
    setForm({
      levantamento_ilha: carroSelecionado.levantamento_ilha || '',
      levantamento_local: carroSelecionado.levantamento_local || '',
      levantamento_hora_inicio: carroSelecionado.levantamento_hora_inicio?.slice(0, 5) || '08:00',
      levantamento_hora_fim: carroSelecionado.levantamento_hora_fim?.slice(0, 5) || '20:00',
      devolucao_mesmo_local: carroSelecionado.devolucao_mesmo_local ?? 1,
      devolucao_local_alternativo: carroSelecionado.devolucao_local_alternativo || '',
      entrega_aeroporto: carroSelecionado.entrega_aeroporto ?? 0,
      entrega_hotel: carroSelecionado.entrega_hotel ?? 0,
      entrega_custo_aeroporto: parseFloat(carroSelecionado.entrega_custo_aeroporto) || 0,
      entrega_custo_hotel: parseFloat(carroSelecionado.entrega_custo_hotel) || 0,
      levantamento_notas: carroSelecionado.levantamento_notas || '',

      exige_caucao: carroSelecionado.exige_caucao ?? 0,
      caucao_valor: parseFloat(carroSelecionado.caucao_valor) || 0,
      caucao_formas: carroSelecionado.caucao_formas
        ? carroSelecionado.caucao_formas.split(',')
        : [],
      caucao_condicoes: carroSelecionado.caucao_condicoes || '',

      idade_minima: parseInt(carroSelecionado.idade_minima) || 21,
      carta_minima_anos: parseInt(carroSelecionado.carta_minima_anos) || 2,
      franquia: parseFloat(carroSelecionado.franquia) || 0,
      politica_combustivel: carroSelecionado.politica_combustivel || 'cheio_cheio',
      limite_km: parseInt(carroSelecionado.limite_km) || 0,
      custo_km_extra: parseFloat(carroSelecionado.custo_km_extra) || 0,
      politica_atraso: carroSelecionado.politica_atraso || '',
      segundo_condutor: carroSelecionado.segundo_condutor ?? 0
    });
  }, [carroSelecionado]);

  // Guardar configuração
  const guardar = async () => {
    if (!carroSelecionado?.id) {
      showToast('erro', 'Nenhum veículo selecionado');
      return;
    }

    // Validações
    if (!form.levantamento_ilha.trim()) {
      showToast('erro', 'Seleciona a ilha de levantamento');
      setTabAtiva('levantamento');
      return;
    }
    if (!form.levantamento_local.trim()) {
      showToast('erro', 'Indica o local de levantamento');
      setTabAtiva('levantamento');
      return;
    }
    if (form.exige_caucao && form.caucao_valor <= 0) {
      showToast('erro', 'Indica o valor da caução');
      setTabAtiva('caucao');
      return;
    }
    if (form.exige_caucao && form.caucao_formas.length === 0) {
      showToast('erro', 'Seleciona pelo menos uma forma de pagamento da caução');
      setTabAtiva('caucao');
      return;
    }

    const userId = obterUserId();
    if (!userId) { showToast('erro', 'Sessão expirada'); return; }

    setGuardando(true);
    try {
      const payload = {
        usuario_id: userId,
        carro_id: carroSelecionado.id,
        levantamento_ilha: form.levantamento_ilha,
        levantamento_local: form.levantamento_local,
        levantamento_hora_inicio: form.levantamento_hora_inicio,
        levantamento_hora_fim: form.levantamento_hora_fim,
        devolucao_mesmo_local: form.devolucao_mesmo_local ? 1 : 0,
        devolucao_local_alternativo: form.devolucao_local_alternativo || null,
        entrega_aeroporto: form.entrega_aeroporto ? 1 : 0,
        entrega_hotel: form.entrega_hotel ? 1 : 0,
        entrega_custo_aeroporto: parseFloat(form.entrega_custo_aeroporto) || 0,
        entrega_custo_hotel: parseFloat(form.entrega_custo_hotel) || 0,
        levantamento_notas: form.levantamento_notas || null,

        exige_caucao: form.exige_caucao ? 1 : 0,
        caucao_valor: parseFloat(form.caucao_valor) || 0,
        caucao_formas: form.caucao_formas.join(','),
        caucao_condicoes: form.caucao_condicoes || null,

        idade_minima: parseInt(form.idade_minima) || 21,
        carta_minima_anos: parseInt(form.carta_minima_anos) || 2,
        franquia: parseFloat(form.franquia) || 0,
        politica_combustivel: form.politica_combustivel,
        limite_km: parseInt(form.limite_km) || 0,
        custo_km_extra: parseFloat(form.custo_km_extra) || 0,
        politica_atraso: form.politica_atraso || null,
        segundo_condutor: form.segundo_condutor ? 1 : 0
      };

      const res = await fetch(`${API}/carro/condicoes_guardar.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showToast('ok', 'Condições guardadas com sucesso');
        // Atualizar carro selecionado localmente
        setCarroSelecionado(prev => ({ ...prev, ...payload }));
      } else {
        showToast('erro', data.message || 'Erro ao guardar');
      }
    } catch (e) {
      console.error(e);
      showToast('erro', 'Erro de rede');
    } finally {
      setGuardando(false);
    }
  };

  const toggleFormaCaucao = (valor) => {
    setForm(prev => ({
      ...prev,
      caucao_formas: prev.caucao_formas.includes(valor)
        ? prev.caucao_formas.filter(f => f !== valor)
        : [...prev.caucao_formas, valor]
    }));
  };

  const carrosFiltrados = carros.filter(c => {
    const t = (c.titulo || '').toLowerCase();
    const m = (c.marca || '').toLowerCase();
    const s = searchTerm.toLowerCase();
    return t.includes(s) || m.includes(s);
  });

  if (loading) {
    return (
      <div className="max-w-7xl w-full px-4 py-6 md:px-0 flex justify-center items-center h-96">
        <Loader2 size={48} className="animate-spin text-blue-900" />
      </div>
    );
  }

  if (carros.length === 0) {
    return (
      <div className="max-w-7xl w-full px-4 py-6 md:px-0">
        <button
          onClick={() => navigate('/gest/unidades-veiculos')}
          className="flex items-center gap-2 text-[13px] font-bold text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} /> Voltar às Unidades
        </button>
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car size={40} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sem veículos</h2>
          <p className="text-gray-500">Ainda não tem viaturas registadas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full text-[#1a1f36] px-4 py-6 md:px-0">

      {/* Botão voltar */}
      <button
        onClick={() => navigate('/gest/unidades-veiculos')}
        className="flex items-center gap-2 text-[13px] font-bold text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={16} /> Voltar às Unidades
      </button>

      {/* Cabeçalho + LOV de carro */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-bold">Levantamento, Caução e Condições</h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Configura o local de entrega, caução e políticas do condutor para cada veículo.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <button
            onClick={() => setDropdownAberto(!dropdownAberto)}
            className="w-full flex items-center justify-between bg-white border border-gray-200 text-[#0f172a] text-[14px] font-medium rounded-xl px-4 py-2.5 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <Car size={18} className="text-green-600 flex-shrink-0" />
              <span className="truncate">{carroSelecionado?.titulo || 'Selecione...'}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownAberto ? 'rotate-180' : ''}`} />
          </button>

          {dropdownAberto && (
            <div className="absolute right-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-2">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar veículo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none bg-gray-50/50"
                  autoFocus
                />
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1">
                {carrosFiltrados.length > 0 ? (
                  carrosFiltrados.map(c => {
                    const isSelected = carroSelecionado?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setCarroSelecionado(c);
                          setDropdownAberto(false);
                          setSearchTerm('');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                          isSelected ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="truncate">
                          {c.titulo || `${c.marca} ${c.modelo}`} {c.ano ? `(${c.ano})` : ''}
                        </span>
                        {isSelected && <Check size={14} className="text-blue-900" />}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-center py-3 text-xs text-gray-400">Nenhum veículo encontrado</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-4 md:px-6 overflow-x-auto">
          <div className="flex gap-2 md:gap-6">
            {TABS.map(tab => {
              const Icone = tab.icone;
              const activa = tabAtiva === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setTabAtiva(tab.key)}
                  className={`py-4 px-2 md:px-3 text-[13px] md:text-[14px] font-bold transition-colors relative flex items-center gap-2 flex-shrink-0 ${
                    activa ? 'text-blue-900' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Icone size={16} />
                  {tab.label}
                  {activa && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-900 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============ TAB: LEVANTAMENTO ============ */}
        {tabAtiva === 'levantamento' && (
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-blue-800">
                Define onde e quando o cliente pode levantar e devolver o veículo. O cliente verá estas
                informações antes de pagar.
              </p>
            </div>

            {/* Ilha + Local */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Ilha de Levantamento *
                </label>
                <select
                  value={form.levantamento_ilha}
                  onChange={(e) => setForm({ ...form, levantamento_ilha: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                >
                  <option value="">Seleciona a ilha...</option>
                  {ILHAS.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Local de Levantamento *
                </label>
                <input
                  type="text"
                  value={form.levantamento_local}
                  onChange={(e) => setForm({ ...form, levantamento_local: e.target.value })}
                  placeholder="Ex: Aeroporto da Praia, Hotel X..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            {/* Horas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Hora de Levantamento — Início
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    value={form.levantamento_hora_inicio}
                    onChange={(e) => setForm({ ...form, levantamento_hora_inicio: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Hora de Levantamento — Fim
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    value={form.levantamento_hora_fim}
                    onChange={(e) => setForm({ ...form, levantamento_hora_fim: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>
            </div>

            {/* Devolução */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-[14px] font-bold mb-4">Devolução</h3>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={form.devolucao_mesmo_local === 1}
                    onChange={() => setForm({ ...form, devolucao_mesmo_local: 1 })}
                    className="mt-1 w-4 h-4 accent-blue-900"
                  />
                  <div>
                    <p className="text-[13px] font-bold">Devolução no mesmo local</p>
                    <p className="text-[11px] text-gray-500">O cliente devolve onde levantou.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={form.devolucao_mesmo_local === 0}
                    onChange={() => setForm({ ...form, devolucao_mesmo_local: 0 })}
                    className="mt-1 w-4 h-4 accent-blue-900"
                  />
                  <div className="flex-1">
                    <p className="text-[13px] font-bold">Devolução noutro local</p>
                    <p className="text-[11px] text-gray-500 mb-2">O cliente devolve noutro local.</p>
                    {form.devolucao_mesmo_local === 0 && (
                      <input
                        type="text"
                        value={form.devolucao_local_alternativo}
                        onChange={(e) => setForm({ ...form, devolucao_local_alternativo: e.target.value })}
                        placeholder="Ex: Aeroporto da Praia"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                      />
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Entrega aeroporto/hotel */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-[14px] font-bold mb-4">Entrega ao Cliente (opcional)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={form.entrega_aeroporto === 1}
                      onChange={(e) => setForm({ ...form, entrega_aeroporto: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 accent-blue-900"
                    />
                    <div className="flex items-center gap-2">
                      <Plane size={16} className="text-blue-600" />
                      <span className="text-[13px] font-bold">Entrega no Aeroporto</span>
                    </div>
                  </label>
                  {form.entrega_aeroporto === 1 && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                        Custo adicional (CVE)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.entrega_custo_aeroporto}
                        onChange={(e) => setForm({ ...form, entrega_custo_aeroporto: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={form.entrega_hotel === 1}
                      onChange={(e) => setForm({ ...form, entrega_hotel: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 accent-blue-900"
                    />
                    <div className="flex items-center gap-2">
                      <Hotel size={16} className="text-blue-600" />
                      <span className="text-[13px] font-bold">Entrega no Hotel</span>
                    </div>
                  </label>
                  {form.entrega_hotel === 1 && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                        Custo adicional (CVE)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.entrega_custo_hotel}
                        onChange={(e) => setForm({ ...form, entrega_custo_hotel: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="border-t border-gray-100 pt-5">
              <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                Notas sobre o Levantamento (opcional)
              </label>
              <textarea
                value={form.levantamento_notas}
                onChange={(e) => setForm({ ...form, levantamento_notas: e.target.value })}
                rows={3}
                placeholder="Ex: O cliente deve contactar 30 min antes da chegada..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>
        )}

        {/* ============ TAB: CAUÇÃO ============ */}
        {tabAtiva === 'caucao' && (
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-[12px] text-amber-800">
                <p className="font-bold mb-1">Importante sobre a caução</p>
                <p>
                  A caução é paga <strong>diretamente ao proprietário no levantamento</strong>.
                  Nunca é somada ao pagamento online nem recebe comissão Morabeza Stay.
                </p>
              </div>
            </div>

            {/* Exige caução */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-blue-600" />
                <div>
                  <p className="text-[14px] font-bold">Exige caução?</p>
                  <p className="text-[11px] text-gray-500">O cliente paga uma caução no levantamento.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, exige_caucao: form.exige_caucao ? 0 : 1 })}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  form.exige_caucao ? 'bg-blue-900' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  form.exige_caucao ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {form.exige_caucao === 1 && (
              <>
                {/* Valor */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Valor da Caução (CVE) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.caucao_valor}
                    onChange={(e) => setForm({ ...form, caucao_valor: e.target.value })}
                    placeholder="Ex: 50000"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                {/* Formas */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-2">
                    Formas de Pagamento Aceites *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {FORMAS_CAUCAO.map(f => {
                      const activo = form.caucao_formas.includes(f.valor);
                      return (
                        <button
                          key={f.valor}
                          type="button"
                          onClick={() => toggleFormaCaucao(f.valor)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-bold transition-colors ${
                            activo
                              ? 'bg-blue-900 text-white border-blue-900'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {activo && <Check size={14} />}
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Condições */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Condições de Devolução / Retenção da Caução
                  </label>
                  <textarea
                    value={form.caucao_condicoes}
                    onChange={(e) => setForm({ ...form, caucao_condicoes: e.target.value })}
                    rows={4}
                    placeholder="Ex: A caução é devolvida integralmente se o veículo for devolvido sem danos e com o depósito cheio. Em caso de multas, o valor é retido..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </>
            )}

            {form.exige_caucao === 0 && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
                <Shield size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-[13px] text-gray-500">
                  Este veículo não exige caução.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============ TAB: CONDUTOR ============ */}
        {tabAtiva === 'condutor' && (
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <UserCheck size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-blue-800">
                Define os requisitos e políticas que o condutor deve cumprir. Estas condições
                aparecem ao cliente antes do pagamento e ficam guardadas na reserva.
              </p>
            </div>

            {/* Idade e Carta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Idade Mínima do Condutor (anos)
                </label>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="18"
                    max="80"
                    value={form.idade_minima}
                    onChange={(e) => setForm({ ...form, idade_minima: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Recomendado: 21 anos</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Tempo Mínimo de Carta (anos)
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={form.carta_minima_anos}
                    onChange={(e) => setForm({ ...form, carta_minima_anos: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Recomendado: 2 anos</p>
              </div>
            </div>

            {/* Combustível e KM */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-[14px] font-bold mb-4">Combustível e Quilometragem</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Política de Combustível
                  </label>
                  <select
                    value={form.politica_combustivel}
                    onChange={(e) => setForm({ ...form, politica_combustivel: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                  >
                    {POLITICAS_COMBUSTIVEL.map(p => (
                      <option key={p.valor} value={p.valor}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Limite de KM (0 = ilimitado)
                  </label>
                  <div className="relative">
                    <Gauge size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      value={form.limite_km}
                      onChange={(e) => setForm({ ...form, limite_km: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>
              </div>

              {parseInt(form.limite_km) > 0 && (
                <div className="mt-4">
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Custo por KM Extra (CVE)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.custo_km_extra}
                    onChange={(e) => setForm({ ...form, custo_km_extra: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              )}
            </div>

            {/* Franquia e Segundo Condutor */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-[14px] font-bold mb-4">Seguro e Condições</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Franquia do Seguro (CVE)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.franquia}
                    onChange={(e) => setForm({ ...form, franquia: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Valor que o cliente paga em caso de danos
                  </p>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                  <div>
                    <p className="text-[13px] font-bold">Permite Segundo Condutor?</p>
                    <p className="text-[11px] text-gray-500">O cliente pode adicionar outro condutor.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, segundo_condutor: form.segundo_condutor ? 0 : 1 })}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      form.segundo_condutor ? 'bg-blue-900' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      form.segundo_condutor ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Política de Atraso */}
            <div className="border-t border-gray-100 pt-5">
              <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                Política de Atraso na Devolução
              </label>
              <textarea
                value={form.politica_atraso}
                onChange={(e) => setForm({ ...form, politica_atraso: e.target.value })}
                rows={3}
                placeholder="Ex: Atrasos superiores a 1 hora são cobrados como dia adicional. Atrasos até 30 min são tolerados..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>
        )}

        {/* Footer guardar */}
        <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => navigate('/gest/unidades-veiculos')}
            className="px-4 py-2 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={guardando}
            className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-[13px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {guardando ? 'A guardar...' : 'Guardar alterações'}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-[13px] font-bold flex items-center gap-2 z-[60] ${
          toast.tipo === 'ok' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.tipo === 'ok' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}