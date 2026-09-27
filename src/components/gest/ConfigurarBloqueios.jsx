// src/components/gest/ConfigurarBloqueios.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2, ArrowLeft, Plus, Trash2, Calendar, AlertCircle,
  Shield, X, Info, Clock, Save
} from 'lucide-react';

const API_BASE = 'https://welovepalop.com';

const TIPOS_BLOQUEIO = [
  { value: 'ferias', label: '🏖️ Férias', cor: 'blue' },
  { value: 'manutencao', label: '🔧 Manutenção', cor: 'orange' },
  { value: 'lotado', label: '📅 Lotado', cor: 'purple' },
  { value: 'outro', label: '📌 Outro', cor: 'slate' }
];

export default function ConfigurarBloqueios() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [experiencia, setExperiencia] = useState(null);
  const [bloqueios, setBloqueios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [deletandoId, setDeletandoId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Configurações
  const [config, setConfig] = useState({
    antecedencia_minima_horas: 24,
    antecedencia_maxima_dias: 180,
    max_reservas_por_cliente: '',
    preco_epoca_alta: '',
    epoca_alta_inicio: '',
    epoca_alta_fim: ''
  });
  const [salvandoConfig, setSalvandoConfig] = useState(false);

  // Form de bloqueio
  const [formBloqueio, setFormBloqueio] = useState({
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: new Date().toISOString().split('T')[0],
    motivo: '',
    tipo: 'ferias'
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Carregar dados
  useEffect(() => {
    const fetchDados = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [resExp, resBloq] = await Promise.all([
          fetch(`${API_BASE}/api/get_experiencias.php?id=${id}`),
          fetch(`${API_BASE}/api/bloqueios_experiencia.php?experiencia_id=${id}`)
        ]);

        const dataExp = await resExp.json();
        const exp = Array.isArray(dataExp.data) ? dataExp.data[0] : dataExp.data;
        setExperiencia(exp);

        if (exp) {
          setConfig({
            antecedencia_minima_horas: exp.antecedencia_minima_horas ?? 24,
            antecedencia_maxima_dias: exp.antecedencia_maxima_dias ?? 180,
            max_reservas_por_cliente: exp.max_reservas_por_cliente ?? '',
            preco_epoca_alta: exp.preco_epoca_alta ?? '',
            epoca_alta_inicio: exp.epoca_alta_inicio ?? '',
            epoca_alta_fim: exp.epoca_alta_fim ?? ''
          });
        }

        const dataBloq = await resBloq.json();
        if (dataBloq.success) {
          setBloqueios(dataBloq.bloqueios || []);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        showToast('Erro ao carregar dados', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Criar bloqueio
  const criarBloqueio = async () => {
    if (!formBloqueio.data_inicio || !formBloqueio.data_fim) {
      showToast('Preencha as datas', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/bloqueios_experiencia.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formBloqueio, experiencia_id: parseInt(id) })
      });
      const data = await res.json();

      if (data.success) {
        showToast('Bloqueio criado!', 'success');
        setMostrarModal(false);
        setFormBloqueio({
          data_inicio: new Date().toISOString().split('T')[0],
          data_fim: new Date().toISOString().split('T')[0],
          motivo: '',
          tipo: 'ferias'
        });
        // Recarregar
        const resBloq = await fetch(`${API_BASE}/api/bloqueios_experiencia.php?experiencia_id=${id}`);
        const dataBloq = await resBloq.json();
        if (dataBloq.success) setBloqueios(dataBloq.bloqueios || []);
      } else {
        showToast(data.error || 'Erro ao criar', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro de conexão', 'error');
    }
  };

  // Deletar bloqueio
  const deletarBloqueio = async (bloqueioId) => {
    if (!window.confirm('Remover este bloqueio?')) return;
    setDeletandoId(bloqueioId);
    try {
      const res = await fetch(`${API_BASE}/api/bloqueios_experiencia.php?id=${bloqueioId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast('Bloqueio removido', 'success');
        setBloqueios(prev => prev.filter(b => b.id !== bloqueioId));
      } else {
        showToast(data.error || 'Erro ao remover', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletandoId(null);
    }
  };

  // Guardar configurações
  const guardarConfig = async () => {
    setSalvandoConfig(true);
    try {
      const res = await fetch(`${API_BASE}/api/experiencias.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: parseInt(id),
          antecedencia_minima_horas: parseInt(config.antecedencia_minima_horas) || 24,
          antecedencia_maxima_dias: parseInt(config.antecedencia_maxima_dias) || 180,
          max_reservas_por_cliente: config.max_reservas_por_cliente ? parseInt(config.max_reservas_por_cliente) : null,
          preco_epoca_alta: config.preco_epoca_alta ? parseFloat(config.preco_epoca_alta) : null,
          epoca_alta_inicio: config.epoca_alta_inicio || null,
          epoca_alta_fim: config.epoca_alta_fim || null
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Configurações guardadas!', 'success');
      } else {
        showToast(data.error || 'Erro ao guardar', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro de conexão', 'error');
    } finally {
      setSalvandoConfig(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return '—';
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-PT', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

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
              onClick={() => navigate('/gest/minhas-experiencias')}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={16} className="text-slate-600" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="text-blue-600" size={24} />
              Bloqueios e Regras de Venda
            </h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">
            {experiencia?.titulo || 'Experiência'}
          </p>
        </div>

        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm px-5 py-3 rounded-xl transition shadow-md"
        >
          <Plus size={16} />
          Bloquear Datas
        </button>
      </div>

      {/* SEÇÃO 1: CONFIGURAÇÕES DE ANTECEDÊNCIA */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-blue-600" size={18} />
          <h2 className="text-base font-bold text-slate-900">Regras de Antecedência</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Antecedência mínima (horas)
            </label>
            <input
              type="number"
              min="0"
              value={config.antecedencia_minima_horas}
              onChange={(e) => setConfig(prev => ({ ...prev, antecedencia_minima_horas: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            <p className="text-[10px] text-slate-400 mt-1">Cliente deve reservar pelo menos X horas antes</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Antecedência máxima (dias)
            </label>
            <input
              type="number"
              min="1"
              value={config.antecedencia_maxima_dias}
              onChange={(e) => setConfig(prev => ({ ...prev, antecedencia_maxima_dias: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            <p className="text-[10px] text-slate-400 mt-1">Cliente só pode reservar até X dias no futuro</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Máx. reservas por cliente (opcional)
            </label>
            <input
              type="number"
              min="1"
              value={config.max_reservas_por_cliente}
              onChange={(e) => setConfig(prev => ({ ...prev, max_reservas_por_cliente: e.target.value }))}
              placeholder="Sem limite"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            <p className="text-[10px] text-slate-400 mt-1">Limite de reservas do mesmo cliente nesta experiência</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Preço época alta (CVE)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={config.preco_epoca_alta}
              onChange={(e) => setConfig(prev => ({ ...prev, preco_epoca_alta: e.target.value }))}
              placeholder="Sem preço dinâmico"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Época alta — início
            </label>
            <input
              type="date"
              value={config.epoca_alta_inicio}
              onChange={(e) => setConfig(prev => ({ ...prev, epoca_alta_inicio: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Época alta — fim
            </label>
            <input
              type="date"
              value={config.epoca_alta_fim}
              onChange={(e) => setConfig(prev => ({ ...prev, epoca_alta_fim: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        <button
          onClick={guardarConfig}
          disabled={salvandoConfig}
          className="mt-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition disabled:opacity-50"
        >
          {salvandoConfig ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {salvandoConfig ? 'A guardar...' : 'Guardar Configurações'}
        </button>
      </div>

      {/* SEÇÃO 2: DATAS BLOQUEADAS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-orange-500" size={18} />
            <h2 className="text-base font-bold text-slate-900">
              Datas Bloqueadas
              <span className="text-xs font-normal text-slate-400 ml-2">
                ({bloqueios.length})
              </span>
            </h2>
          </div>
        </div>

        {bloqueios.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl">
            <Calendar size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Nenhuma data bloqueada</p>
            <p className="text-xs text-slate-400 mt-1">Bloqueie datas para férias, manutenção ou outros motivos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {bloqueios.map((b) => {
              const tipoInfo = TIPOS_BLOQUEIO.find(t => t.value === b.tipo) || TIPOS_BLOQUEIO[3];
              return (
                <div key={b.id} className="border border-slate-200 rounded-xl p-4 bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-full ${
                      b.tipo === 'ferias' ? 'bg-blue-100 text-blue-700' :
                      b.tipo === 'manutencao' ? 'bg-orange-100 text-orange-700' :
                      b.tipo === 'lotado' ? 'bg-purple-100 text-purple-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {tipoInfo.label}
                    </span>
                    <button
                      onClick={() => deletarBloqueio(b.id)}
                      disabled={deletandoId === b.id}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      {deletandoId === b.id
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Trash2 size={12} />}
                    </button>
                  </div>

                  <p className="text-xs font-bold text-slate-900">
                    {formatarData(b.data_inicio)} → {formatarData(b.data_fim)}
                  </p>

                  {b.motivo && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{b.motivo}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE CRIAR BLOQUEIO */}
      {mostrarModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                Bloquear Datas
              </h3>
              <button onClick={() => setMostrarModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Data início *</label>
                  <input
                    type="date"
                    value={formBloqueio.data_inicio}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormBloqueio(prev => ({ ...prev, data_inicio: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Data fim *</label>
                  <input
                    type="date"
                    value={formBloqueio.data_fim}
                    min={formBloqueio.data_inicio}
                    onChange={(e) => setFormBloqueio(prev => ({ ...prev, data_fim: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  {TIPOS_BLOQUEIO.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setFormBloqueio(prev => ({ ...prev, tipo: t.value }))}
                      className={`p-2 rounded-lg border text-xs font-bold transition ${
                        formBloqueio.tipo === t.value
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Motivo (opcional)</label>
                <textarea
                  value={formBloqueio.motivo}
                  onChange={(e) => setFormBloqueio(prev => ({ ...prev, motivo: e.target.value }))}
                  rows={3}
                  placeholder="Ex: Férias de verão, manutenção do equipamento..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-slate-100">
              <button
                onClick={() => setMostrarModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={criarBloqueio}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md flex items-center gap-2"
              >
                <Plus size={12} />
                Criar Bloqueio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}