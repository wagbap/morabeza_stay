// components/prestador/DadosRecebimento.jsx
import React, { useState, useEffect } from 'react';
import {
  Wallet, CheckCircle2, AlertCircle, Loader2, Save,
  Shield, Edit3, X, Building2, CreditCard, User, Globe,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://welovepalop.com/api';

export default function DadosRecebimento() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });

  const [form, setForm] = useState({
    titular: '',
    iban: '',
    banco: '',
    pais: 'Cabo Verde',
    nif: '',
  });

  const sessao = JSON.parse(localStorage.getItem('user') || '{}');

  // ============================================================
  // CARREGAR DADOS
  // ============================================================
  const carregar = async () => {
    if (!sessao.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/dados_recebimento.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'obter',
          usuario_id: sessao.id,
        }),
      });
      const data = await res.json();

      if (data.status === 'success' && data.data) {
        setDados(data.data);
        setForm({
          titular: data.data.titular || '',
          iban: data.data.iban || '',
          banco: data.data.banco || '',
          pais: data.data.pais || 'Cabo Verde',
          nif: data.data.nif || '',
        });
      } else {
        setDados(null);
        // Preencher titular com nome do utilizador
        setForm((f) => ({
          ...f,
          titular: sessao.nome || '',
        }));
        setEditando(true);
      }
    } catch (err) {
      console.error(err);
      setMsg({ tipo: 'erro', texto: 'Erro de ligação.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  // ============================================================
  // GUARDAR
  // ============================================================
  const guardar = async (e) => {
    e.preventDefault();
    setMsg({ tipo: '', texto: '' });

    if (!form.titular || form.titular.trim().length < 3) {
      setMsg({ tipo: 'erro', texto: 'Indica o nome do titular.' });
      return;
    }

    const ibanLimpo = form.iban.replace(/\s+/g, '');
    if (!ibanLimpo || ibanLimpo.length < 15) {
      setMsg({ tipo: 'erro', texto: 'IBAN inválido. Verifica o número.' });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/usuarios/dados_recebimento.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'guardar',
          usuario_id: sessao.id,
          titular: form.titular.trim(),
          iban: form.iban,
          banco: form.banco.trim(),
          pais: form.pais,
          nif: form.nif.trim(),
        }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        setMsg({ tipo: 'sucesso', texto: data.message });
        setEditando(false);
        await carregar();
        setTimeout(() => setMsg({ tipo: '', texto: '' }), 3000);
      } else {
        setMsg({ tipo: 'erro', texto: data.message || 'Erro ao guardar.' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ tipo: 'erro', texto: 'Erro de ligação.' });
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="h-64 w-full flex flex-col justify-center items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin text-[#003580]" size={32} />
        <span className="text-sm">A carregar dados...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-[#003580] flex items-center gap-2">
          <Wallet size={24} /> Dados de recebimento
        </h1>
        <p className="text-gray-600 mt-1 text-sm">
          Onde queres receber os pagamentos das tuas reservas.
        </p>
      </div>

      {/* Mensagem */}
      {msg.texto && (
        <div
          className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
            msg.tipo === 'sucesso'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {msg.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{msg.texto}</span>
        </div>
      )}

      {/* Aviso se não tem dados */}
      {!dados && !editando && (
        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={22} />
          <div>
            <p className="text-sm font-bold text-yellow-900">
              Ainda não tens dados de recebimento
            </p>
            <p className="text-xs text-yellow-800 mt-1">
              Sem estes dados, a Morabeza Stay <strong>não pode fazer repasses</strong> dos teus
              80% de cada reserva. Adiciona o teu IBAN abaixo.
            </p>
            <button
              onClick={() => setEditando(true)}
              className="mt-3 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold transition"
            >
              Adicionar dados agora
            </button>
          </div>
        </div>
      )}

      {/* Card principal */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CreditCard className="text-[#003580]" size={20} />
            <h2 className="font-bold text-gray-900">Conta bancária</h2>
          </div>

          {dados && !editando && (
            <button
              onClick={() => setEditando(true)}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#2563eb] hover:text-[#003580] transition"
            >
              <Edit3 size={14} /> Editar
            </button>
          )}
        </div>

        <div className="p-5">
          {/* ============================================ */}
          {/* MODO VISUALIZAÇÃO */}
          {/* ============================================ */}
          {dados && !editando && (
            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <User size={14} /> Titular
                </span>
                <span className="font-semibold text-sm text-gray-900">{dados.titular}</span>
              </div>

              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <CreditCard size={14} /> IBAN
                </span>
                <span className="font-mono font-semibold text-sm text-gray-900">
                  {dados.iban_mascarado || dados.iban}
                </span>
              </div>

              {dados.banco && (
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm flex items-center gap-1">
                    <Building2 size={14} /> Banco
                  </span>
                  <span className="font-semibold text-sm text-gray-900">{dados.banco}</span>
                </div>
              )}

              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <Globe size={14} /> País
                </span>
                <span className="font-semibold text-sm text-gray-900">{dados.pais}</span>
              </div>

              {dados.nif && (
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">NIF</span>
                  <span className="font-semibold text-sm text-gray-900">{dados.nif}</span>
                </div>
              )}

              <div className="pt-3">
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold">
                  <CheckCircle2 size={14} /> Configurado
                </span>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* MODO EDIÇÃO */}
          {/* ============================================ */}
          {(!dados || editando) && (
            <form onSubmit={guardar} className="space-y-4">
              {/* Titular */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Nome do titular *
                </label>
                <input
                  type="text"
                  value={form.titular}
                  onChange={(e) => setForm({ ...form, titular: e.target.value })}
                  placeholder="Nome completo como aparece no banco"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm"
                  required
                />
              </div>

              {/* IBAN */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  IBAN *
                </label>
                <input
                  type="text"
                  value={form.iban}
                  onChange={(e) => setForm({ ...form, iban: e.target.value })}
                  placeholder="CV64 0000 0000 0000 0000 0000 0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm font-mono"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Podes escrever com ou sem espaços.
                </p>
              </div>

              {/* Banco + NIF */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Banco
                  </label>
                  <input
                    type="text"
                    value={form.banco}
                    onChange={(e) => setForm({ ...form, banco: e.target.value })}
                    placeholder="Ex: BCA, BAI, Caixa"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    NIF
                  </label>
                  <input
                    type="text"
                    value={form.nif}
                    onChange={(e) => setForm({ ...form, nif: e.target.value })}
                    placeholder="Opcional"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm"
                  />
                </div>
              </div>

              {/* País */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  País
                </label>
                <select
                  value={form.pais}
                  onChange={(e) => setForm({ ...form, pais: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm"
                >
                  <option value="Cabo Verde">Cabo Verde</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Brasil">Brasil</option>
                  <option value="Angola">Angola</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-2">
                {dados && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditando(false);
                      carregar();
                      setMsg({ tipo: '', texto: '' });
                    }}
                    disabled={saving}
                    className="flex-1 md:flex-initial md:px-6 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-300 hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <X size={16} /> Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 md:flex-initial md:px-6 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#003580] text-white hover:bg-[#002860] transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> A guardar...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Guardar dados
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Info de segurança */}
      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
        <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
          <Shield size={16} /> Porque pedimos isto?
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• É para onde enviamos os teus <strong>80%</strong> de cada reserva confirmada.</li>
          <li>• O IBAN fica guardado de forma protegida.</li>
          <li>• Só a Morabeza Stay e tu têm acesso.</li>
          <li>• Nunca partilhamos com terceiros.</li>
        </ul>
      </div>
    </div>
  );
}