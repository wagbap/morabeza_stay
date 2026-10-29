import FotoAnuncioAdmin from './FotoAnuncioAdmin';
// components/admin/PropriedadesAdmin.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/api';
import {
  MapPin, Eye, Check, X, Loader2, Search, AlertCircle, Home,
  Building, Hotel, User, Mail, Users, Car, Compass, Clock, Star, FileText,
} from 'lucide-react';

const PropriedadesAdmin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [aGravarDestaque, setAGravarDestaque] = useState(null);
  const [avisoDestaque, setAvisoDestaque] = useState(null);
  const gravacaoRef = useRef(false);
  const emDestaque = item => item.destaque === true || Number(item.destaque) === 1;

  const alternarDestaque = async item => {
    if (gravacaoRef.current) return;
    const categoria = activeTab;
    const ativo = emDestaque(item);
    gravacaoRef.current = true;
    setAGravarDestaque(`${categoria}:${item.id}`);
    setAvisoDestaque(null);
    try {
      const admin = JSON.parse(localStorage.getItem('morabeza_admin') || '{}');
      const token = admin.token || localStorage.getItem('admin_token');
      if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) {
        setAvisoDestaque({ erro: true, key: 'admin_destaque_sessao' });
        return;
      }
      const { data } = await api.post('/admin/alternar_destaque.php', {
        categoria, id: item.id, destaque: ativo ? 0 : 1,
      }, { timeout: 15000, headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (data?.success !== true) {
        const error = new Error('Save failed');
        error.response = { data };
        throw error;
      }
      const atualizar = categoria === 'alojamentos' ? setAlojamentos : categoria === 'carros' ? setCarros : setExperiencias;
      atualizar(items => items.map(current => String(current.id) === String(item.id)
        ? { ...current, destaque: data.data?.destaque ?? (ativo ? 0 : 1), ordem_destaque: data.data?.ordem_destaque ?? current.ordem_destaque }
        : current));
      setAvisoDestaque({ erro: false, key: ativo ? 'admin_destaque_removido' : 'admin_destaque_guardado' });
    } catch (err) {
      const codes = {
        AUTH_REQUIRED: 'admin_destaque_sessao',
        AUTH_SCHEMA_MISSING: 'admin_destaque_tabelas_auth',
        FEATURE_SCHEMA_MISSING: 'admin_destaque_colunas',
        CONFIG_MISSING: 'admin_destaque_config',
        CONFIG_ERROR: 'admin_destaque_config',
      };
      const key = codes[err.response?.data?.code] ||
        ([401, 403].includes(err.response?.status) ? 'admin_destaque_sessao' :
          err.response?.status === 404 ? 'admin_destaque_api_ausente' : 'admin_destaque_erro');
      setAvisoDestaque({ erro: true, key });
    } finally {
      gravacaoRef.current = false;
      setAGravarDestaque(null);
    }
  };

  const [pagina, setPagina] = useState(1);
  const porPagina = 9;
  const [activeTab, setActiveTab] = useState('alojamentos');
  const [alojamentos, setAlojamentos] = useState([]);
  const [experiencias, setExperiencias] = useState([]);
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [stats, setStats] = useState(null);

  const carregarStats = async () => {
    try {
      const { data } = await api.get('/admin/admin_all_content.php', { params: { action: 'dashboard' } });
      if (data.status === 'success') {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const carregarConteudo = useCallback(async (signal) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/admin_all_content.php', { params: { action: activeTab, status: filterStatus, search }, signal });

      if (!signal.aborted && data.status === 'success') {
        if (activeTab === 'alojamentos') setAlojamentos(data.data);
        if (activeTab === 'experiencias') setExperiencias(data.data);
        if (activeTab === 'carros') setCarros(data.data);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
    if (!signal.aborted) setLoading(false);
  }, [activeTab, filterStatus, search]);

  useEffect(() => {
    carregarStats();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void carregarConteudo(controller.signal);
    return () => controller.abort();
  }, [carregarConteudo]);

  const StatusBadge = ({ status }) => {
    const config = {
      aprovado: { bg: 'bg-green-100', text: 'text-green-700', label: '✓ Aprovado', icon: <Check size={12} /> },
      publicado: { bg: 'bg-green-100', text: 'text-green-700', label: '✓ Publicado', icon: <Check size={12} /> },
      pendente: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '⏳ Pendente', icon: <Clock size={12} /> },
      em_analise: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '⏳ Em análise', icon: <Clock size={12} /> },
      rejeitado: { bg: 'bg-red-100', text: 'text-red-700', label: '✗ Rejeitado', icon: <X size={12} /> },
      correcao_necessaria: { bg: 'bg-orange-100', text: 'text-orange-700', label: '⚠ Correção necessária', icon: <AlertCircle size={12} /> },
      documentacao_necessaria: { bg: 'bg-blue-100', text: 'text-blue-700', label: '📄 Documentação necessária', icon: <FileText size={12} /> },
      pausado: { bg: 'bg-gray-100', text: 'text-gray-700', label: '⏸ Pausado', icon: <Clock size={12} /> },
      suspenso: { bg: 'bg-red-100', text: 'text-red-700', label: '⛔ Suspenso', icon: <X size={12} /> },
    };
    const style = config[status?.toLowerCase()] || config.pendente;
    return (
      <span className={`inline-flex items-center gap-1 ${style.bg} ${style.text} px-2 py-1 rounded-md text-xs font-semibold`}>
        {style.icon} {style.label}
      </span>
    );
  };

  const formatarPreco = (preco) => `${Number(preco || 0).toLocaleString()} CVE`;

  const getTipoIcon = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'villa': return <Building size={18} />;
      case 'guesthouse': return <Hotel size={18} />;
      default: return <Home size={18} />;
    }
  };

  const getCurrentItems = () => {
    if (activeTab === 'alojamentos') return alojamentos;
    if (activeTab === 'experiencias') return experiencias;
    return carros;
  };

  const currentItems = getCurrentItems();
  const totalPaginas = Math.max(1, Math.ceil(currentItems.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * porPagina;
  const itensPagina = currentItems.slice(inicio, inicio + porPagina);

  const totalPendentes = currentItems.filter((i) => {
    const st = (i.status || i.estado || '').toLowerCase();
    return st === 'pendente' || st === 'em_analise' || st === 'documentacao_necessaria';
  }).length;

  const getTipoSlug = () => {
    if (activeTab === 'alojamentos') return 'alojamento';
    if (activeTab === 'experiencias') return 'experiencia';
    return 'carro';
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580]">Gestão de Conteúdo</h1>
          <p className="text-gray-600 mt-1">
            Analise alojamentos, experiências e viaturas antes de os publicar.
            {totalPendentes > 0 && (
              <span className="ml-2 text-yellow-600 font-medium">
                ({totalPendentes} aguardam análise)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => { setPagina(1); setActiveTab('alojamentos'); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all rounded-t-lg ${
            activeTab === 'alojamentos' ? 'bg-[#003580] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Home size={18} /> Alojamentos
          {stats?.alojamentos?.pendentes > 0 && (
            <span className="ml-1 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs">
              {stats.alojamentos.pendentes}
            </span>
          )}
        </button>
        <button
          onClick={() => { setPagina(1); setActiveTab('experiencias'); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all rounded-t-lg ${
            activeTab === 'experiencias' ? 'bg-[#003580] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Compass size={18} /> Experiências
          {stats?.experiencias?.pendentes > 0 && (
            <span className="ml-1 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs">
              {stats.experiencias.pendentes}
            </span>
          )}
        </button>
        <button
          onClick={() => { setPagina(1); setActiveTab('carros'); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all rounded-t-lg ${
            activeTab === 'carros' ? 'bg-[#003580] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Car size={18} /> Viaturas
          {stats?.carros?.pendentes > 0 && (
            <span className="ml-1 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs">
              {stats.carros.pendentes}
            </span>
          )}
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-wrap">
          {['todos', 'pendente', 'aprovado', 'rejeitado'].map((status) => (
            <button
              key={status}
              onClick={() => { setPagina(1); setFilterStatus(status); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === status
                  ? status === 'pendente'
                    ? 'bg-yellow-500 text-white'
                    : status === 'aprovado'
                    ? 'bg-green-600 text-white'
                    : status === 'rejeitado'
                    ? 'bg-red-600 text-white'
                    : 'bg-[#003580] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === 'todos' ? 'Todos' : status === 'pendente' ? '⏳ Pendentes' : status === 'aprovado' ? '✓ Aprovados' : '✗ Rejeitados'}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Procurar por título ou localização..."
            value={search}
            onChange={(e) => { setPagina(1); setSearch(e.target.value); }}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
          />
        </div>
      </div>

      {avisoDestaque && <p role={avisoDestaque.erro ? 'alert' : 'status'} className={`rounded-xl border p-3 text-sm ${avisoDestaque.erro ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-green-200 bg-green-50 text-green-800'}`}>{t(avisoDestaque.key)}</p>}

      {/* Lista de Conteúdo */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="animate-spin text-[#003580]" size={24} />
          <span>A carregar...</span>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          {activeTab === 'alojamentos' && <Home size={48} className="mx-auto mb-4 text-gray-300" />}
          {activeTab === 'experiencias' && <Compass size={48} className="mx-auto mb-4 text-gray-300" />}
          {activeTab === 'carros' && <Car size={48} className="mx-auto mb-4 text-gray-300" />}
          <p>
            Nenhum {activeTab === 'alojamentos' ? 'alojamento' : activeTab === 'experiencias' ? 'experiência' : 'veículo'} encontrado
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {itensPagina.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition">
              {/* Imagem */}
              <div className="h-48 overflow-hidden relative">
                <FotoAnuncioAdmin key={`${activeTab}:${item.id}`} item={item} categoria={activeTab} />
                <button type="button" onClick={() => alternarDestaque(item)} disabled={aGravarDestaque !== null}
                  aria-pressed={emDestaque(item)}
                  aria-label={t(emDestaque(item) ? 'admin_destaque_retirar' : 'admin_destaque_aplicar', { nome: item.titulo })}
                  title={t(emDestaque(item) ? 'admin_destaque_retirar' : 'admin_destaque_aplicar', { nome: item.titulo })}
                  className={`absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full shadow-md transition hover:scale-105 disabled:cursor-wait disabled:opacity-60 ${emDestaque(item) ? 'bg-amber-100 text-amber-600' : 'bg-white/95 text-slate-500 hover:text-amber-500'}`}>
                  {aGravarDestaque === `${activeTab}:${item.id}` ? <Loader2 size={21} className="animate-spin" /> : <Star size={22} fill={emDestaque(item) ? 'currentColor' : 'none'} />}
                </button>
                <div className="absolute top-3 right-3">
                  <StatusBadge status={item.status || item.estado} />
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs flex items-center gap-1">
                  {activeTab === 'carros' ? <Car size={14} /> : activeTab === 'experiencias' ? <Compass size={14} /> : getTipoIcon(item.tipo)}
                  <span>{activeTab === 'carros' ? 'Viatura' : activeTab === 'experiencias' ? 'Experiência' : item.tipo || 'Apartamento'}</span>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{item.titulo}</h3>
                <div className="flex items-center text-gray-500 mt-1 text-sm">
                  <MapPin size={14} className="mr-1" />
                  <span className="line-clamp-1">{item.localizacao || item.ilha || 'Localização não informada'}</span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="text-[#003580] font-bold">
                    {activeTab === 'carros' ? formatarPreco(item.preco_dia) + '/dia' : formatarPreco(item.preco_noite || item.preco)}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    {activeTab === 'alojamentos' && <><Users size={14} /> {item.capacidade || 2} hóspedes</>}
                    {activeTab === 'carros' && <><Users size={14} /> {item.passageiros || 5} lugares</>}
                    {activeTab === 'experiencias' && <><Clock size={14} /> {item.duracao || '2h'}</>}
                  </div>
                </div>

                {(item.proprietario_nome || item.proprietario_email) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                    <User size={12} /> <span className="truncate">{item.proprietario_nome || 'Anónimo'}</span>
                    <Mail size={12} /> <span className="truncate">{item.proprietario_email || 'Email não disponível'}</span>
                  </div>
                )}

                {/* Ações — só Detalhes e Analisar */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/propriedades/${activeTab}/${item.id}`)}
                    className="flex-1 flex items-center justify-center gap-1 text-sm font-medium text-[#6b82c6] hover:text-[#003580] bg-gray-50 hover:bg-gray-100 py-2.5 rounded-lg transition"
                  >
                    <Eye size={16} /> Detalhes
                  </button>

                  <button
                    onClick={() => navigate(`/admin/analise-anuncio/${getTipoSlug()}/${item.id}`)}
                    className="flex-1 flex items-center justify-center gap-1 text-sm font-semibold text-white bg-[#003580] hover:bg-[#002860] py-2.5 rounded-lg transition shadow-sm"
                    title="Abrir análise completa do anúncio"
                  >
                    <FileText size={16} /> Analisar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && currentItems.length > 0 && <nav aria-label={t('admin_paginacao')} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4">
        <p role="status" className="text-sm text-gray-500">{t('admin_pagina_resumo', { inicio: inicio + 1, fim: Math.min(inicio + porPagina, currentItems.length), total: currentItems.length })}</p>
        <div className="flex items-center gap-3">
          <button type="button" disabled={paginaAtual === 1} onClick={() => setPagina(paginaAtual - 1)} className="min-h-11 rounded-lg border border-gray-200 px-3 text-sm text-blue-700 disabled:opacity-40">{t('admin_pagina_anterior')}</button>
          <span className="text-sm text-gray-600">{t('admin_pagina_numero', { pagina: paginaAtual, total: totalPaginas })}</span>
          <button type="button" disabled={paginaAtual === totalPaginas} onClick={() => setPagina(paginaAtual + 1)} className="min-h-11 rounded-lg border border-gray-200 px-3 text-sm text-blue-700 disabled:opacity-40">{t('admin_pagina_seguinte')}</button>
        </div>
      </nav>}
    </div>
  );
};

export default PropriedadesAdmin;