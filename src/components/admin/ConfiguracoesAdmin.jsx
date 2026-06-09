import React, { useState } from 'react';
import { Lock, Save, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

const ConfiguracoesAdmin = () => {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);

  const alterarSenha = async (e) => {
    e.preventDefault();
    setMsg({ tipo: '', texto: '' });
    setLoading(true);

    const adminSession = JSON.parse(localStorage.getItem('morabeza_admin') || '{}');
    if (!adminSession.id) {
      setMsg({ tipo: 'erro', texto: 'Sessão expirada. Faça login novamente.' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin_settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_password', user_id: adminSession.id, senha_atual: senhaAtual, nova_senha: novaSenha })
      });
      const data = await response.json();

      if (data.status === 'success') {
        setMsg({ tipo: 'sucesso', texto: data.message });
        setSenhaAtual(''); setNovaSenha('');
      } else {
        setMsg({ tipo: 'erro', texto: data.message });
      }
    } catch {
      setMsg({ tipo: 'erro', texto: 'Erro de ligação ao servidor.' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold text-[#003580]">Configurações do Sistema</h1>
        <p className="text-gray-600 mt-1">Faça a manutenção de segurança e credenciais da plataforma.</p>
      </div>

      {msg.texto && (
        <div className={`p-4 rounded-xl flex items-center gap-2 text-sm backdrop-blur-md ${msg.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {msg.tipo === 'sucesso' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{msg.texto}</span>
        </div>
      )}

      {/* Card de Segurança */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-[#003580] font-semibold border-b border-gray-100 pb-3">
          <KeyRound size={20} />
          <h2>Segurança da Conta do Administrador</h2>
        </div>

        <form onSubmit={alterarSenha} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Palavra-passe Atual</label>
            <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm" required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nova Palavra-passe</label>
            <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm" required />
          </div>

          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-[#003580] hover:bg-[#002860] text-white px-5 py-2.5 rounded-xl font-medium transition-all text-sm disabled:opacity-50 shadow-sm">
            <Save size={16} />
            {loading ? 'A guardar...' : 'Atualizar Credenciais'}
          </button>
        </form>
      </div>

      {/* Regras de Negócio Globais */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white shadow-sm space-y-3 opacity-80">
        <div className="flex items-center gap-2 text-gray-700 font-semibold border-b border-gray-100 pb-3">
          <Lock size={20} />
          <h2>Parâmetros e Regras de Negócio</h2>
        </div>
        <p className="text-sm text-gray-500">As comissões transacionais do ecossistema estão travadas no modelo contratual padrão de **20% de comissão** por reserva, aplicando-se de forma direta em alojamentos, viaturas e experiências.</p>
      </div>
    </div>
  );
};

export default ConfiguracoesAdmin;