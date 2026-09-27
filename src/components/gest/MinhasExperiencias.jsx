// src/components/gest/MinhasExperiencias.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Loader2, Compass, Plus, Edit2, Trash2, Settings2, Eye, MapPin,
  Star, Users, Clock, AlertCircle, RefreshCw, CheckCircle,
  XCircle, Search, User, Shield, Ban
} from 'lucide-react';

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

export default function MinhasExperiencias() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [experiencias, setExperiencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState('');
  const [deletandoId, setDeletandoId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // ============================================================
  // CARREGAR EXPERIÊNCIAS DO ANFITRIÃO
  // ============================================================
  const fetchExperiencias = async () => {
    setLoading(true);
    setError(null);
    try {
      const usuarioId = obterUsuarioId();
      console.log('👤 Usuario ID:', usuarioId);

      if (!usuarioId) {
        setError('Utilizador não autenticado');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/get_experiencias.php?usuario_id=${usuarioId}`);
      const data = await res.json();

      console.log('📦 Resposta API:', data);

      let lista = [];
      if (data.success && data.data) {
        lista = Array.isArray(data.data) ? data.data : [data.data];
      } else if (Array.isArray(data)) {
        lista = data;
      }

      // Validar que cada experiência tem id
      const listaValida = lista.filter(exp => exp && exp.id);
      console.log(`✅ ${listaValida.length} experiências carregadas`);

      setExperiencias(listaValida);
    } catch (err) {
      console.error('❌ Erro ao buscar experiências:', err);
      setError('Erro ao carregar experiências');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // DELETAR EXPERIÊNCIA
  // ============================================================
  const deletarExperiencia = async (exp) => {
    if (!window.confirm(`Tem certeza que deseja eliminar "${exp.titulo}"?\nEsta ação não pode ser desfeita.`)) return;

    setDeletandoId(exp.id);
    try {
      const res = await fetch(`${API_BASE}/api/experiencias.php?id=${exp.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast('Experiência eliminada!', 'success');
        fetchExperiencias();
      } else {
        showToast(data.error || 'Erro ao eliminar', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro de conexão', 'error');
    } finally {
      setDeletandoId(null);
    }
  };

  // ============================================================
  // FILTRAR
  // ============================================================
  const experienciasFiltradas = experiencias.filter(exp => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase();
    return (
      (exp.titulo || '').toLowerCase().includes(termo) ||
      (exp.ilha || '').toLowerCase().includes(termo) ||
      (exp.localizacao || '').toLowerCase().includes(termo)
    );
  });

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="text-left">
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
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="text-blue-600" size={24} />
            Minhas Experiências
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerir as suas experiências, horários e sessões
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchExperiencias}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
          <button
            onClick={() => navigate('/experiencia-registo')}
            className="flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-md"
          >
            <Plus size={16} />
            Nova Experiência
          </button>
        </div>
      </div>

      {/* BUSCA */}
      {experiencias.length > 0 && (
        <div className="mb-5">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por título, ilha ou localização..."
              className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            />
          </div>
        </div>
      )}

      {/* ESTADOS */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">A carregar experiências...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center">
          <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={fetchExperiencias}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition"
          >
            Tentar novamente
          </button>
        </div>
      ) : experiencias.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Compass size={28} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhuma experiência criada</h3>
          <p className="text-sm text-slate-500 mb-6">
            Comece por criar a sua primeira experiência para começar a receber reservas
          </p>
          <button
            onClick={() => navigate('/experiencia-registo')}
            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm px-5 py-3 rounded-xl transition"
          >
            <Plus size={16} />
            Criar primeira experiência
          </button>
        </div>
      ) : experienciasFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Search size={32} className="text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Nenhuma experiência encontrada para "{busca}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {experienciasFiltradas.map((exp) => (
            <div
              key={exp.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              {/* IMAGEM */}
              <div className="relative h-44 bg-slate-100">
                <img
                  src={exp.imagem_principal || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop'}
                  alt={exp.titulo}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop';
                  }}
                />

                {/* BADGE STATUS */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {exp.ativo === 1 || exp.status === 'aprovado' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/95 backdrop-blur text-white text-[10px] font-bold rounded-full">
                      <CheckCircle size={10} />
                      Ativo
                    </span>
                  ) : exp.status === 'pendente' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/95 backdrop-blur text-white text-[10px] font-bold rounded-full">
                      <Clock size={10} />
                      Pendente
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-500/95 backdrop-blur text-white text-[10px] font-bold rounded-full">
                      <XCircle size={10} />
                      Inativo
                    </span>
                  )}

                  {/* BADGE MODELO */}
                  {exp.modelo_reserva === 'grupo_privado' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/95 backdrop-blur text-white text-[10px] font-bold rounded-full">
                      <Users size={10} />
                      Grupo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/95 backdrop-blur text-white text-[10px] font-bold rounded-full">
                      <User size={10} />
                      Por Pessoa
                    </span>
                  )}
                </div>

                {/* RATING */}
                {exp.rating_formatado && (
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                    <Star size={10} className="fill-orange-400 text-orange-400" />
                    <span className="text-[10px] font-bold text-slate-900">{exp.rating_formatado}</span>
                  </div>
                )}
              </div>

              {/* CONTEÚDO */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2 mb-2">
                  {exp.titulo}
                </h3>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-3">
                  <MapPin size={11} className="text-orange-500" />
                  <span className="truncate">{exp.ilha}{exp.localizacao ? `, ${exp.localizacao}` : ''}</span>
                </div>

                {/* MÉTRICAS */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <Clock size={12} className="text-blue-600 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-slate-900 truncate">{exp.duracao || '—'}</p>
                    <p className="text-[9px] text-slate-400">Duração</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <Users size={12} className="text-green-600 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-slate-900">
                      {exp.modelo_reserva === 'grupo_privado'
                        ? (exp.max_pessoas_grupo || '—')
                        : (exp.max_pessoas || '—')}
                    </p>
                    <p className="text-[9px] text-slate-400">Máx.</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <Star size={12} className="text-orange-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-slate-900">{exp.total_avaliacoes || 0}</p>
                    <p className="text-[9px] text-slate-400">Aval.</p>
                  </div>
                </div>

                {/* PREÇO */}
                {(exp.preco || exp.preco_grupo) && (
                  <div className="mb-4 flex items-baseline gap-1">
                    <span className="text-lg font-bold text-blue-600">
                      {exp.modelo_reserva === 'grupo_privado'
                        ? Number(exp.preco_grupo || 0).toLocaleString('pt-PT')
                        : Number(exp.preco || 0).toLocaleString('pt-PT')}
                    </span>
                    <span className="text-xs text-slate-500">
                      CVE {exp.modelo_reserva === 'grupo_privado' ? '/ grupo' : '/ pessoa'}
                    </span>
                  </div>
                )}

                {/* AÇÕES */}
               <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
                        {/* 🔥 Botão principal: Configurar Sessões */}
                        <button
                            onClick={() => navigate(`/gest/experiencia/${exp.id}/sessoes`)}
                            className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm"
                        >
                            <Settings2 size={14} />
                            Configurar Sessões
                        </button>

                        {/* 🔥 Botão secundário: Bloqueios */}
                        <button
                            onClick={() => navigate(`/gest/experiencia/${exp.id}/bloqueios`)}
                            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm"
                        >
                            <Shield size={14} />
                            Bloqueios e Regras
                        </button>

                          {/* 🔥 NOVO Botão: Políticas de Reserva */}
                          <button
                            onClick={() => navigate(`/gest/experiencia/${exp.id}/politicas`)}
                            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm"
                          >
                            <Ban size={14} />
                            Políticas de Reserva
                          </button>

                        {/* 🔥 Ações rápidas */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                            onClick={() => navigate(`/experiencia/${exp.slug || exp.id}`)}
                            className="flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                            title="Ver página pública"
                            >
                            <Eye size={12} />
                            Ver
                            </button>

                            <button
                            onClick={() => navigate(`/experiencia-registo/editar/${exp.id}`)}
                            className="flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                            title="Editar experiência"
                            >
                            <Edit2 size={12} />
                            Editar
                            </button>

                            <button
                            onClick={() => deletarExperiencia(exp)}
                            disabled={deletandoId === exp.id}
                            className="flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                            title="Eliminar experiência"
                            >
                            {deletandoId === exp.id ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : (
                                <Trash2 size={12} />
                            )}
                            Eliminar
                            </button>
                        </div>
                        </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RESUMO */}
      {!loading && experiencias.length > 0 && (
        <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Total experiências</p>
              <p className="text-2xl font-bold text-slate-900">{experiencias.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Ativas</p>
              <p className="text-2xl font-bold text-green-600">
                {experiencias.filter(e => e.ativo === 1 || e.status === 'aprovado').length}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Pendentes</p>
              <p className="text-2xl font-bold text-amber-600">
                {experiencias.filter(e => e.status === 'pendente').length}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Total avaliações</p>
              <p className="text-2xl font-bold text-blue-600">
                {experiencias.reduce((acc, e) => acc + (parseInt(e.total_avaliacoes) || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}