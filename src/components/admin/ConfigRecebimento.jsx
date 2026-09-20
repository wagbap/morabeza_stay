
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle, AlertTriangle, RefreshCw, Server, CreditCard, Building } from 'lucide-react';

const API_BASE = 'https://welovepalop.com';

export default function ConfigRecebimento() {
  const [config, setConfig] = useState({
    operador_nome: 'Vinti4 Gateway',
    modo_ambiente: 'sandbox',
    merchant_id: '',
    api_key: '',
    api_key_mascarada: '',
    banco_nome: '',
    iban: '',
    iban_mascarado: '',
    status_conexao: 'Desconectado',
    ultima_sincronizacao: null
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3500);
  };

  useEffect(() => {
    carregarConfiguracao();
  }, []);

  const carregarConfiguracao = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/config_recebimento.php`);
      const data = await response.json();
      if (data.success && data.data) {
        setConfig(prev => ({
          ...prev,
          ...data.data,
          api_key: '', // Nunca devolvemos a chave real por segurança
          iban: ''     // Nunca devolvemos o IBAN completo por segurança
        }));
      }
    } catch (error) {
      showToast('Erro ao carregar configurações de recebimento.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e, testar = false) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/api/admin/config_recebimento.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          testar_conexao: testar
        })
      });
      const data = await response.json();

      if (data.success) {
        showToast(data.message, 'success');
        carregarConfiguracao();
      } else {
        showToast(data.message || 'Erro ao guardar', 'error');
      }
    } catch (error) {
      showToast('Erro de conexão com o servidor.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-white font-medium text-sm flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          <CheckCircle size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recebimento e Liquidação da Empresa</h1>
          <p className="text-sm text-slate-500">Gestão de portais de pagamento e contas bancárias oficiais da Morabeza Stay.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm bg-white">
          {config.status_conexao === 'Conectado' ? (
            <span className="flex items-center gap-1 text-emerald-600"><CheckCircle size={14} /> Operador Conectado</span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600"><AlertTriangle size={14} /> Desconectado</span>
          )}
        </div>
      </div>

      <form onSubmit={(e) => handleSave(e, false)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Credenciais do Operador */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <CreditCard className="text-blue-600" size={20} />
            <h2 className="text-base font-bold text-slate-900">Credenciais do Operador de Pagamento</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nome do Operador</label>
              <input
                type="text"
                value={config.operador_nome}
                onChange={(e) => setConfig({ ...config, operador_nome: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Modo / Ambiente</label>
              <select
                value={config.modo_ambiente}
                onChange={(e) => setConfig({ ...config, modo_ambiente: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
              >
                <option value="sandbox">Sandbox (Testes)</option>
                <option value="producao">Produção (Real)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Merchant ID / Conta Comercial</label>
            <input
              type="text"
              value={config.merchant_id}
              onChange={(e) => setConfig({ ...config, merchant_id: e.target.value })}
              placeholder="Ex: MERCH-948593-CV"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase">Chave Secreta de API (Secret Key)</label>
              <span className="text-[11px] text-slate-400 font-mono">Registo atual: {config.api_key_mascarada}</span>
            </div>
            <input
              type="password"
              value={config.api_key}
              onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
              placeholder="Deixe em branco para manter a atual ou insira nova chave"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Coluna Direita: Conta de Liquidação */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Building className="text-emerald-600" size={20} />
              <h2 className="text-base font-bold text-slate-900">Conta de Liquidação</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Banco Oficial</label>
              <input
                type="text"
                value={config.banco_nome}
                onChange={(e) => setConfig({ ...config, banco_nome: e.target.value })}
                placeholder="Ex: Banco Comercial do Atlântico (BCA)"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">IBAN de Liquidação</label>
                <span className="text-[11px] text-slate-400 font-mono">{config.iban_mascarado}</span>
              </div>
              <input
                type="text"
                value={config.iban}
                onChange={(e) => setConfig({ ...config, iban: e.target.value })}
                placeholder="CV35 0001 0000 0000 0000 1"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-800 flex items-start gap-2">
              <Lock size={16} className="shrink-0 mt-0.5" />
              <span>Por motivos de conformidade e segurança, os dados sensíveis aparecem mascarados e apenas os últimos dígitos são visíveis.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={(e) => handleSave(e, true)}
              disabled={saving}
              className="w-full py-2.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Server size={14} /> Testar Ligação & Transação Real
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md"
            >
              {saving ? 'A guardar...' : 'Guardar Configuração'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}