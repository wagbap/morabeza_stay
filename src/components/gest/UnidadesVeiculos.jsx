// src/components/gest/UnidadesVeiculos.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, Car, Plus, Pencil, Wrench, History, X, Save,
  CheckCircle, AlertCircle, FileText, Key, Search, ChevronDown, Check,
  Upload, Eye, Trash2, Lock, Unlock, Truck, CircleDot, Shield
} from 'lucide-react';

const API = 'https://welovepalop.com/api';

const ESTADOS = [
  { valor: 'disponivel',   label: 'Disponível',   cor: 'bg-green-100 text-green-700',   dot: 'bg-green-500',   icone: '🟢' },
  { valor: 'reservada',    label: 'Reservada',    cor: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500',    icone: '🔵' },
  { valor: 'entregue',     label: 'Entregue',     cor: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500',  icone: '🟣' },
  { valor: 'manutencao',   label: 'Manutenção',   cor: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500',  icone: '🟠' },
  { valor: 'indisponivel', label: 'Indisponível', cor: 'bg-gray-200 text-gray-700',     dot: 'bg-gray-500',    icone: '⚫' }
];

export default function UnidadesVeiculos() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [carros, setCarros] = useState([]);
  const [carroSelecionado, setCarroSelecionado] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  // LOV (dropdown com search)
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Modais
  const [modalForm, setModalForm] = useState(false);
  const [modalHistorico, setModalHistorico] = useState(false);
  const [unidadeEditando, setUnidadeEditando] = useState(null);
  const [historico, setHistorico] = useState(null);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  // Upload documentos
  const [tipoDoc, setTipoDoc] = useState('seguro');
  const [ficheiro, setFicheiro] = useState(null);
  const [uploadando, setUploadando] = useState(false);

  // Menu de estados (dropdown por linha)
  const [estadoMenuAberto, setEstadoMenuAberto] = useState(null);
  const estadoMenuRef = useRef(null);

  // Modal de motivo (obrigatório para manutencao/indisponivel)
  const [modalMotivo, setModalMotivo] = useState(null); // { unidade, estado }
  const [motivoTexto, setMotivoTexto] = useState('');

  const [toast, setToast] = useState({ show: false, tipo: 'ok', msg: '' });

  // Form
  const [form, setForm] = useState({
    matricula: '', ano: '', cor: '', quilometragem: ''
  });

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAberto(false);
      }
      if (estadoMenuRef.current && !estadoMenuRef.current.contains(e.target)) {
        setEstadoMenuAberto(null);
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
      const savedUser = localStorage.getItem('user') || localStorage.getItem('morabeza_user');
      if (savedUser) return JSON.parse(savedUser).id;
    } catch (e) { console.error('Erro ao obter ID:', e); }
    return null;
  };

  const showToast = (tipo, msg) => {
    setToast({ show: true, tipo, msg });
    setTimeout(() => setToast({ show: false, tipo: 'ok', msg: '' }), 3500);
  };

  // ============ CARREGAR CARROS ============
  useEffect(() => { fetchCarros(); }, []);

  const fetchCarros = async () => {
    setLoading(true);
    try {
      const userId = obterUserId();
      if (!userId) { setLoading(false); return; }

      const res = await fetch(`${API}/carro/listar.php?usuario_id=${userId}`);
      const data = await res.json();

      let lista = [];
      if (data.success && data.data?.items && Array.isArray(data.data.items)) {
        lista = data.data.items;
      } else if (data.success && Array.isArray(data.data)) {
        lista = data.data;
      } else if (data.success && data.data?.carros) {
        lista = data.data.carros;
      }

      setCarros(lista);
      if (lista.length > 0) setCarroSelecionado(lista[0]);
    } catch (e) {
      console.error(e);
      showToast('erro', 'Erro ao carregar carros');
    } finally {
      setLoading(false);
    }
  };

  // ============ CARREGAR UNIDADES ============
  useEffect(() => {
    if (carroSelecionado?.id) {
      fetchUnidades(carroSelecionado.id);
    } else {
      setUnidades([]);
    }
  }, [carroSelecionado?.id]);

  const fetchUnidades = async (carroId) => {
    if (!carroId) { setUnidades([]); return; }
    setLoadingUnidades(true);
    try {
      const userId = obterUserId();
      if (!userId) { setLoadingUnidades(false); return; }

      const url = `${API}/carro/unidades_listar.php?carro_id=${carroId}&usuario_id=${userId}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setUnidades(Array.isArray(data.data) ? data.data : []);
      } else {
        setUnidades([]);
      }
    } catch (e) {
      console.error(e);
      showToast('erro', 'Erro ao carregar unidades');
      setUnidades([]);
    } finally {
      setLoadingUnidades(false);
    }
  };

  // ============ FORM ============
  const abrirNovaUnidade = () => {
    setUnidadeEditando(null);
    setForm({ matricula: '', ano: '', cor: '', quilometragem: '' });
    setFicheiro(null);
    setTipoDoc('seguro');
    setModalForm(true);
  };

  const abrirEditarUnidade = (u) => {
    setUnidadeEditando(u);
    setForm({
      matricula: u.matricula || '',
      ano: u.ano || '',
      cor: u.cor || '',
      quilometragem: u.quilometragem || ''
    });
    setFicheiro(null);
    setTipoDoc('seguro');
    setModalForm(true);
  };

  const guardarUnidade = async () => {
    if (!form.matricula.trim()) {
      showToast('erro', 'Matrícula é obrigatória');
      return;
    }

    const userId = obterUserId();
    if (!userId) { showToast('erro', 'Sessão expirada'); return; }

    const payload = {
      usuario_id: userId,
      carro_id: carroSelecionado.id,
      matricula: form.matricula.trim(),
      ano: form.ano ? parseInt(form.ano) : null,
      cor: form.cor.trim() || null,
      quilometragem: form.quilometragem ? parseInt(form.quilometragem) : 0
    };
    if (unidadeEditando) payload.id = unidadeEditando.id;

    try {
      const url = unidadeEditando
        ? `${API}/carro/unidades_editar.php`
        : `${API}/carro/unidades_criar.php`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showToast('ok', unidadeEditando ? 'Unidade atualizada' : 'Unidade criada');

        if (!unidadeEditando && data.data?.id) {
          await fetchUnidades(carroSelecionado.id);
          setUnidadeEditando({
            id: data.data.id,
            matricula: data.data.matricula,
            ano: data.data.ano,
            cor: data.data.cor,
            quilometragem: data.data.quilometragem,
            documentos: [],
            estado: 'disponivel'
          });
        } else {
          setModalForm(false);
          fetchUnidades(carroSelecionado.id);
        }
      } else {
        showToast('erro', data.message || 'Erro ao guardar');
      }
    } catch (e) {
      console.error(e);
      showToast('erro', 'Erro de rede');
    }
  };

  // ============ UPLOAD / REMOÇÃO DE DOCUMENTOS ============
  const enviarDocumento = async () => {
    if (!ficheiro) { showToast('erro', 'Escolhe um ficheiro'); return; }
    if (!unidadeEditando?.id) { showToast('erro', 'Unidade inválida'); return; }

    const userId = obterUserId();
    if (!userId) { showToast('erro', 'Sessão expirada'); return; }

    setUploadando(true);
    try {
      const fd = new FormData();
      fd.append('usuario_id', userId);
      fd.append('unidade_id', unidadeEditando.id);
      fd.append('tipo', tipoDoc);
      fd.append('ficheiro', ficheiro);

      const res = await fetch(`${API}/carro/unidade_documento_upload.php`, {
        method: 'POST',
        body: fd
      });
      const data = await res.json();

      if (data.success) {
        showToast('ok', 'Documento enviado');
        setFicheiro(null);
        const input = document.getElementById('input-ficheiro-unidade');
        if (input) input.value = '';

        setUnidadeEditando(prev => ({
          ...prev,
          documentos: [...(prev.documentos || []), data.data.documento]
        }));
        fetchUnidades(carroSelecionado.id);
      } else {
        showToast('erro', data.message || 'Erro no upload');
      }
    } catch (e) {
      console.error(e);
      showToast('erro', 'Erro de rede');
    } finally {
      setUploadando(false);
    }
  };

  const removerDocumento = async (docId) => {
    if (!confirm('Remover este documento?')) return;

    const userId = obterUserId();
    if (!userId) { showToast('erro', 'Sessão expirada'); return; }

    try {
      const res = await fetch(`${API}/carro/unidade_documento_remover.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: userId,
          unidade_id: unidadeEditando.id,
          documento_id: docId
        })
      });
      const data = await res.json();

      if (data.success) {
        showToast('ok', 'Documento removido');
        setUnidadeEditando(prev => ({
          ...prev,
          documentos: (prev.documentos || []).filter(d => d.id !== docId)
        }));
        fetchUnidades(carroSelecionado.id);
      } else {
        showToast('erro', data.message || 'Erro ao remover');
      }
    } catch (e) {
      console.error(e);
      showToast('erro', 'Erro de rede');
    }
  };

  // ============ ESTADOS ============
  const ESTADOS_MANUAIS = ['disponivel', 'manutencao', 'indisponivel'];

  const mudarEstadoManual = (unidade, novoEstado) => {
    if (novoEstado === 'manutencao' || novoEstado === 'indisponivel') {
      setModalMotivo({ unidade, estado: novoEstado });
      setMotivoTexto(unidade.motivo_bloqueio || '');
      return;
    }
    executarMudancaEstado(unidade, novoEstado, null);
  };

  const executarMudancaEstado = async (unidade, novoEstado, motivo) => {
    const userId = obterUserId();
    if (!userId) { showToast('erro', 'Sessão expirada'); return; }

    try {
      const res = await fetch(`${API}/carro/unidades_estado.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: userId,
          id: unidade.id,
          estado: novoEstado,
          motivo: motivo || null
        })
      });
      const data = await res.json();

      if (data.success) {
        const label = ESTADOS.find(e => e.valor === novoEstado)?.label || novoEstado;
        showToast('ok', `Estado: ${label}`);
        setEstadoMenuAberto(null);
        setModalMotivo(null);
        setMotivoTexto('');
        fetchUnidades(carroSelecionado.id);
      } else {
        showToast('erro', data.message || 'Erro ao alterar estado');
      }
    } catch (e) {
      console.error(e);
      showToast('erro', 'Erro de rede');
    }
  };

  // ============ HISTÓRICO ============
  const verHistorico = async (unidade) => {
    setModalHistorico(true);
    setLoadingHistorico(true);
    setHistorico(null);

    const userId = obterUserId();
    if (!userId) { showToast('erro', 'Sessão expirada'); setLoadingHistorico(false); return; }

    try {
      const res = await fetch(`${API}/carro/unidades_historico.php?unidade_id=${unidade.id}&usuario_id=${userId}`);
      const data = await res.json();
      if (data.success) setHistorico(data.data);
      else showToast('erro', data.message || 'Erro ao carregar histórico');
    } catch (e) {
      console.error(e);
      showToast('erro', 'Erro de rede');
    } finally {
      setLoadingHistorico(false);
    }
  };

  const estadoBadge = (estado) => {
    const e = ESTADOS.find(x => x.valor === estado);
    if (!e) return (
      <span className="px-3 py-1 rounded-md text-[11px] font-bold bg-gray-100 text-gray-700">
        {estado}
      </span>
    );
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold ${e.cor}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${e.dot}`} />
        {e.label}
      </span>
    );
  };

  // ============ LOV: filtro ============
  const carrosFiltrados = carros.filter(c => {
    const t = (c.titulo || '').toLowerCase();
    const m = (c.marca || '').toLowerCase();
    const mo = (c.modelo || '').toLowerCase();
    const s = searchTerm.toLowerCase();
    return t.includes(s) || m.includes(s) || mo.includes(s);
  });

  if (loading) {
    return (
      <div className="max-w-6xl w-full text-[#1a1f36] px-4 py-6 md:px-0 flex justify-center items-center h-96">
        <Loader2 size={48} className="animate-spin text-blue-900" />
      </div>
    );
  }

  if (carros.length === 0) {
    return (
      <div className="max-w-6xl w-full text-[#1a1f36] px-4 py-6 md:px-0">
        <h1 className="text-[24px] font-bold mb-6">Unidades dos Meus Veículos</h1>
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
      <h1 className="text-[24px] font-bold mb-6">Unidades dos Meus Veículos</h1>

      {/* LOV — Dropdown com search bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-[18px] font-bold">
          Unidades {carroSelecionado && `— ${carroSelecionado.titulo || carroSelecionado.modelo}`}
        </h2>

        <div className="relative w-full md:w-80" ref={dropdownRef}>
          <button
            onClick={() => setDropdownAberto(!dropdownAberto)}
            className="w-full flex items-center justify-between bg-white border border-gray-200 text-[#0f172a] text-[14px] font-medium rounded-xl px-4 py-2.5 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <Car size={18} className="text-green-600 flex-shrink-0" />
              <span className="truncate">{carroSelecionado?.titulo || 'Selecione um veículo...'}</span>
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

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 mb-4">
        <button
          onClick={() => navigate('/gest/condicoes-veiculos')}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg text-[13px] font-bold transition-colors"
        >
          <Shield size={16} /> Condições dos Veículos
        </button>
        <button
          onClick={abrirNovaUnidade}
          className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-[13px] font-bold transition-colors"
        >
          <Plus size={16} /> Adicionar Unidade
        </button>
      </div>

      {/* Legenda de estados */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-[11px] font-bold text-gray-400 uppercase">Estados:</span>
        {ESTADOS.map(e => (
          <span key={e.valor} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${e.cor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${e.dot}`} />
            {e.label}
          </span>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
        {loadingUnidades ? (
          <div className="text-center py-12">
            <Loader2 size={32} className="animate-spin text-blue-900 mx-auto" />
          </div>
        ) : unidades.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Key size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500">Nenhuma unidade registada para este veículo</p>
            <p className="text-xs text-gray-400 mt-1">
              Adicione pelo menos uma unidade para poder aprovar reservas
            </p>
          </div>
        ) : (
          <div className="overflow-visible">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Matrícula</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Ano</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Cor</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">KM</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Documentos</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {unidades.map(u => {
                  const bloqueado = u.estado === 'reservada' || u.estado === 'entregue';
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <span className="text-[14px] font-bold tracking-wide">{u.matricula}</span>
                        {u.motivo_bloqueio && (
                          <p className="text-[10px] text-gray-500 mt-0.5 italic truncate max-w-[180px]">
                            {u.motivo_bloqueio}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-5 text-[13px]">{u.ano || '—'}</td>
                      <td className="px-6 py-5 text-[13px]">{u.cor || '—'}</td>
                      <td className="px-6 py-5 text-[13px]">
                        {u.quilometragem ? `${u.quilometragem.toLocaleString()} km` : '—'}
                      </td>
                      <td className="px-6 py-5">
                        {u.documentos && u.documentos.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[12px] text-blue-600 font-bold">
                            <FileText size={12} /> {u.documentos.length}
                          </span>
                        ) : (
                          <span className="text-[12px] text-gray-400">Sem docs</span>
                        )}
                      </td>
                      <td className="px-6 py-5">{estadoBadge(u.estado)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirEditarUnidade(u)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            title="Editar"
                          >
                            <Pencil size={14} className="text-gray-600" />
                          </button>

                          <div className="relative" ref={estadoMenuAberto === u.id ? estadoMenuRef : null}>
                            <button
                              onClick={() => setEstadoMenuAberto(estadoMenuAberto === u.id ? null : u.id)}
                              disabled={bloqueado}
                              className={`p-2 rounded-lg transition-colors ${
                                u.estado === 'manutencao'   ? 'bg-orange-100 hover:bg-orange-200' :
                                u.estado === 'indisponivel' ? 'bg-gray-200 hover:bg-gray-300' :
                                u.estado === 'reservada'    ? 'bg-blue-100' :
                                u.estado === 'entregue'     ? 'bg-purple-100' :
                                'bg-green-100 hover:bg-green-200'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              title={bloqueado ? 'Estado gerido por reserva' : 'Alterar estado'}
                            >
                              <Wrench size={14} className={
                                u.estado === 'manutencao'   ? 'text-orange-700' :
                                u.estado === 'indisponivel' ? 'text-gray-700' :
                                u.estado === 'reservada'    ? 'text-blue-700' :
                                u.estado === 'entregue'     ? 'text-purple-700' :
                                'text-green-700'
                              } />
                            </button>

                            {estadoMenuAberto === u.id && !bloqueado && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-[999] py-1">
                                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-100">
                                  Alterar estado
                                </div>
                                {ESTADOS.filter(e => ESTADOS_MANUAIS.includes(e.valor)).map(e => (
                                  <button
                                    key={e.valor}
                                    onClick={() => mudarEstadoManual(u, e.valor)}
                                    disabled={u.estado === e.valor}
                                    className="w-full flex items-center gap-2 text-left px-3 py-2 text-[12px] font-medium hover:bg-gray-50 disabled:opacity-40"
                                  >
                                    <span className={`w-2 h-2 rounded-full ${e.dot}`} />
                                    {e.label}
                                    {u.estado === e.valor && <Check size={12} className="ml-auto text-blue-900" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => verHistorico(u)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            title="Histórico"
                          >
                            <History size={14} className="text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nota */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle size={16} className="text-blue-600" />
          </div>
          <div className="text-[12px] text-gray-600 space-y-1">
            <p>
              <span className="font-bold">Nota:</span> A matrícula e os documentos são <span className="font-bold">privados</span> —
              o cliente final nunca os vê.
            </p>
            <p>
              <span className="font-bold">Bloqueio:</span> Marcar como <em>Manutenção</em> ou <em>Indisponível</em> retira a unidade
              das reservas sem criar reserva.
            </p>
            <p>
              <span className="font-bold">Estados automáticos:</span> <em>Reservada</em> e <em>Entregue</em> são geridos pelo sistema
              ao aprovar/entregar reservas.
            </p>
          </div>
        </div>
      </div>

      {/* ============ MODAL: Criar/Editar ============ */}
      {modalForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h3 className="text-[18px] font-bold">
                {unidadeEditando ? 'Editar Unidade' : 'Nova Unidade'}
              </h3>
              <button onClick={() => setModalForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Matrícula *
                  </label>
                  <input
                    type="text"
                    value={form.matricula}
                    onChange={(e) => setForm({ ...form, matricula: e.target.value })}
                    placeholder="CV-12345"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Ano</label>
                  <input
                    type="number"
                    value={form.ano}
                    onChange={(e) => setForm({ ...form, ano: e.target.value })}
                    placeholder="2023"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Cor</label>
                  <input
                    type="text"
                    value={form.cor}
                    onChange={(e) => setForm({ ...form, cor: e.target.value })}
                    placeholder="Preto"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Quilometragem (km)
                </label>
                <input
                  type="number"
                  value={form.quilometragem}
                  onChange={(e) => setForm({ ...form, quilometragem: e.target.value })}
                  placeholder="25000"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-2">
                  Documentos
                </label>

                {unidadeEditando ? (
                  <>
                    {(unidadeEditando.documentos || []).length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {unidadeEditando.documentos.map(doc => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText size={16} className="text-blue-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[12px] font-bold truncate">{doc.nome}</p>
                                <p className="text-[10px] text-gray-500 capitalize">
                                  {doc.tipo}
                                  {doc.enviado_em && ` · ${new Date(doc.enviado_em).toLocaleDateString('pt-PT')}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded hover:bg-blue-100 text-blue-600"
                                title="Ver"
                              >
                                <Eye size={14} />
                              </a>
                              <button
                                type="button"
                                onClick={() => removerDocumento(doc.id)}
                                className="p-1.5 rounded hover:bg-red-100 text-red-600"
                                title="Remover"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12px] text-gray-400 mb-3">Sem documentos anexados</p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                      <select
                        value={tipoDoc}
                        onChange={(e) => setTipoDoc(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                      >
                        <option value="seguro">Seguro</option>
                        <option value="inspecao">Inspeção</option>
                        <option value="licenca">Licença</option>
                        <option value="fatura">Fatura</option>
                        <option value="outro">Outro</option>
                      </select>

                      <input
                        id="input-ficheiro-unidade"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => setFicheiro(e.target.files[0] || null)}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[12px] file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-900 file:text-white file:text-[11px] file:font-bold file:cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={enviarDocumento}
                        disabled={!ficheiro || uploadando}
                        className="flex items-center justify-center gap-1 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-[12px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadando ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Upload size={14} />
                        )}
                        {uploadando ? 'A enviar...' : 'Enviar'}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">
                      Aceita PDF, JPG, PNG ou WEBP (máx 8 MB).
                    </p>
                  </>
                ) : (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                    <p className="text-[12px] text-blue-700">
                      Guarda a unidade primeiro para poderes anexar documentos.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => setModalForm(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-gray-100"
              >
                Fechar
              </button>
              <button
                onClick={guardarUnidade}
                className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-[13px] font-bold transition-colors"
              >
                <Save size={16} /> {unidadeEditando ? 'Guardar alterações' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL: Motivo ============ */}
      {modalMotivo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-[16px] font-bold flex items-center gap-2">
                {modalMotivo.estado === 'manutencao' ? (
                  <><Wrench size={18} className="text-orange-600" /> Marcar em Manutenção</>
                ) : (
                  <><Lock size={18} className="text-gray-600" /> Marcar Indisponível</>
                )}
              </h3>
              <button onClick={() => setModalMotivo(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <p className="text-[12px] text-gray-500 mb-4">
                Unidade <span className="font-bold text-gray-700">{modalMotivo.unidade.matricula}</span> vai
                ficar <span className="font-bold">bloqueada</span> e não poderá ser atribuída a novas reservas.
              </p>

              <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                Motivo *
              </label>
              <textarea
                value={motivoTexto}
                onChange={(e) => setMotivoTexto(e.target.value)}
                rows={3}
                placeholder={
                  modalMotivo.estado === 'manutencao'
                    ? 'Ex: Troca de óleo, revisão dos travões, pneus novos...'
                    : 'Ex: Viatura reservada para uso interno, sinistro, etc.'
                }
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                O motivo só é visível para ti e para o administrador.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100">
              <button
                onClick={() => setModalMotivo(null)}
                className="px-4 py-2 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => executarMudancaEstado(modalMotivo.unidade, modalMotivo.estado, motivoTexto)}
                disabled={!motivoTexto.trim()}
                className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-[13px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {modalMotivo.estado === 'manutencao' ? <Wrench size={16} /> : <Lock size={16} />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL: Histórico ============ */}
      {modalHistorico && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-[16px] font-bold">
                Histórico — {historico?.unidade?.matricula || '...'}
              </h3>
              <button onClick={() => setModalHistorico(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {loadingHistorico ? (
                <div className="text-center py-8">
                  <Loader2 size={28} className="animate-spin text-blue-900 mx-auto" />
                </div>
              ) : !historico || !historico.reservas || historico.reservas.length === 0 ? (
                <div className="text-center py-8">
                  <History size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-[13px]">Sem reservas registadas para esta unidade</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Reserva</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Levantamento</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Devolução</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {historico.reservas.map(r => (
                        <tr key={r.id}>
                          <td className="px-4 py-3 text-[12px] font-bold text-[#2563eb]">
                            {r.codigo_reserva}
                          </td>
                          <td className="px-4 py-3 text-[12px]">{r.data_levantamento}</td>
                          <td className="px-4 py-3 text-[12px]">{r.data_devolucao}</td>
                          <td className="px-4 py-3 text-[12px] font-bold">
                            {parseFloat(r.preco_total).toLocaleString()} CVE
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                              r.status === 'confirmada' ? 'bg-green-100 text-green-700' :
                              r.status === 'cancelada'  ? 'bg-red-100 text-red-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-[13px] font-bold flex items-center gap-2 z-[10000] ${
          toast.tipo === 'ok' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.tipo === 'ok' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}