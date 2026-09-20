// components/admin/RepassesAdmin.jsx
import React, { useState, useEffect } from 'react';
import {
  Loader2, RefreshCw, Wallet, User, Send, X,
  CheckCircle2, AlertCircle, History, FileText, AlertTriangle,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://welovepalop.com/api';

export default function RepassesAdmin() {
  const [saldos, setSaldos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pendentes');
  const [showModal, setShowModal] = useState(false);
  const [prestadorSel, setPrestadorSel] = useState(null);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const [enviando, setEnviando] = useState(false);

  const [valor, setValor] = useState('');
  const [metodo, setMetodo] = useState('transferencia');
  const [observacoes, setObservacoes] = useState('');
  const [comprovativo, setComprovativo] = useState(null);

  const carregar = async () => {
    setLoading(true);
    try {
      const res1 = await fetch(`${API_URL}/admin/repasses.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'listar_saldos' }),
      });
      const d1 = await res1.json();
      if (d1.status === 'success') setSaldos(d1.data || []);

      const res2 = await fetch(`${API_URL}/admin/repasses.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'historico' }),
      });
      const d2 = await res2.json();
      if (d2.status === 'success') setHistorico(d2.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirModal = (p) => {
    setPrestadorSel(p);
    setValor(p.disponivel.toFixed(2));
    setMetodo('transferencia');
    setObservacoes('');
    setComprovativo(null);
    setMsg({ tipo: '', texto: '' });
    setShowModal(true);
  };

  const registar = async (e) => {
    e.preventDefault();
    if (!valor || parseFloat(valor) <= 0) {
      setMsg({ tipo: 'erro', texto: 'Valor inválido.' });
      return;
    }

    setEnviando(true);
    setMsg({ tipo: '', texto: '' });

    const admin = JSON.parse(localStorage.getItem('morabeza_admin') || '{}');

    try {
      let comprovUrl = '';
      if (comprovativo) {
        const form = new FormData();
        form.append('documento', comprovativo);
        const rup = await fetch(`${API_URL}/usuarios/upload_documento.php`, {
          method: 'POST',
          body: form,
        });
        const dup = await rup.json();
        if (dup.success) comprovUrl = dup.documento_url;
      }

      const res = await fetch(`${API_URL}/admin/repasses.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'registar_repasse',
          prestador_id: prestadorSel.prestador_id,
          admin_id: admin.id,
          valor: parseFloat(valor),
          metodo,
          comprovativo_url: comprovUrl,
          observacoes,
        }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        setMsg({ tipo: 'sucesso', texto: data.message });
        await carregar();
        setTimeout(() => setShowModal(false), 1500);
      } else {
        setMsg({ tipo: 'erro', texto: data.message || 'Erro.' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ tipo: 'erro', texto: 'Erro de ligação.' });
    } finally {
      setEnviando(false);
    }
  };

  const formatarData = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const totalDisponivel = saldos.reduce((acc, s) => acc + s.disponivel, 0);
  const totalSemIban = saldos.filter(s => s.disponivel > 0 && !s.tem_iban).length;

  if (loading) {
    return (
      <div className="h-96 w-full flex flex-col justify-center items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin text-[#003580]" size={36} />
        <span className="text-sm font-medium">A carregar saldos dos prestadores...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580]">Financeiro Morabeza Stay</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Gestão de repasses aos prestadores.
          </p>
        </div>
        <button
          onClick={carregar}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
        >
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-br from-[#003580] to-[#002860] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Wallet size={24} />
          <span className="text-sm font-medium opacity-90">Total disponível para repasse</span>
        </div>
        <p className="text-3xl font-bold">
          CVE {Number(totalDisponivel).toLocaleString('pt-PT')}
        </p>
        <p className="text-xs opacity-75 mt-1">
          {saldos.filter(s => s.disponivel > 0).length} prestadores com saldo
        </p>
      </div>

      {/* Aviso de prestadores sem IBAN */}
      {totalSemIban > 0 && (
        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={22} />
          <div>
            <p className="text-sm font-bold text-yellow-900">
              {totalSemIban} {totalSemIban === 1 ? 'prestador ainda não tem IBAN' : 'prestadores ainda não têm IBAN'}
            </p>
            <p className="text-xs text-yellow-800 mt-1">
              Estes prestadores <strong>não podem receber repasses</strong> até configurarem os dados de recebimento no perfil.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab('pendentes')}
          className={`px-5 py-3 text-sm font-medium transition-all border-b-2 ${
            tab === 'pendentes'
              ? 'border-[#003580] text-[#003580]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          💰 Saldos pendentes
        </button>
        <button
          onClick={() => setTab('historico')}
          className={`px-5 py-3 text-sm font-medium transition-all border-b-2 ${
            tab === 'historico'
              ? 'border-[#003580] text-[#003580]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <History size={14} className="inline mr-1" /> Histórico
        </button>
      </div>

      {/* Conteúdo */}
      {tab === 'pendentes' ? (
        saldos.length === 0 ? (
          <div className="py-20 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
            <Wallet size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhum saldo disponível.</p>
            <p className="text-xs text-gray-400 mt-1">
              Aparecem aqui prestadores com reservas confirmadas/concluídas.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {saldos.filter(s => s.disponivel > 0).map((s) => (
              <div key={s.prestador_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <User size={16} className="text-gray-400" />
                      <p className="font-bold text-gray-900">{s.prestador_nome}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {s.total_reservas} {s.total_reservas == 1 ? 'reserva' : 'reservas'}
                      </span>
                      {s.tem_iban ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                          ✓ IBAN configurado
                        </span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                          ⚠ Sem IBAN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{s.prestador_email}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs">
                      <span className="text-gray-500">
                        Bruto: <strong>{s.valor_bruto_fmt}</strong>
                      </span>
                      <span className="text-gray-500">
                        Comissão (10%): <strong>{s.comissao_fmt}</strong>
                      </span>
                      <span className="text-gray-500">
                        Líquido: <strong>{s.liquido_fmt}</strong>
                      </span>
                      {s.ja_pago > 0 && (
                        <span className="text-green-600">
                          Já pago: <strong>{s.ja_pago_fmt}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Disponível</p>
                    <p className="text-2xl font-bold text-green-600">{s.disponivel_fmt}</p>
                  </div>
                  <button
                    onClick={() => abrirModal(s)}
                    disabled={!s.tem_iban}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${
                      s.tem_iban
                        ? 'bg-[#003580] hover:bg-[#002860] text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    title={!s.tem_iban ? 'Prestador sem IBAN configurado' : 'Registar repasse'}
                  >
                    <Send size={14} />
                    {s.tem_iban ? 'Registar repasse' : 'Sem IBAN'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        historico.length === 0 ? (
          <div className="py-20 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
            <History size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhum repasse registado.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Data</th>
                    <th className="px-4 py-3 text-left">Prestador</th>
                    <th className="px-4 py-3 text-left">Valor</th>
                    <th className="px-4 py-3 text-left">IBAN destino</th>
                    <th className="px-4 py-3 text-left">Método</th>
                    <th className="px-4 py-3 text-left">Comprovativo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historico.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatarData(h.registado_em)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {h.prestador_nome || '-'}
                      </td>
                      <td className="px-4 py-3 font-bold text-green-600 whitespace-nowrap">
                        {h.valor_fmt}
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                        {h.iban_destino || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{h.metodo}</td>
                      <td className="px-4 py-3">
                        {h.comprovativo_url ? (
                          <a
                            href={h.comprovativo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                          >
                            <FileText size={12} /> Ver
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Modal */}
      {showModal && prestadorSel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-[#003580]">Registar repasse</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={registar} className="p-5 space-y-4">
              {msg.texto && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                  msg.tipo === 'sucesso' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {msg.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{msg.texto}</span>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 text-sm">
                <p className="font-bold text-gray-800 mb-2">{prestadorSel.prestador_nome}</p>
                <p className="text-xs text-gray-500">{prestadorSel.prestador_email}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Disponível:</span>
                  <span className="font-bold text-green-600">{prestadorSel.disponivel_fmt}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Valor a repassar (CVE) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  max={prestadorSel.disponivel}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Método
                </label>
                <select
                  value={metodo}
                  onChange={(e) => setMetodo(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                >
                  <option value="transferencia">Transferência bancária</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="mbway">MB Way</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {prestadorSel.tem_iban && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    IBAN de destino (do prestador)
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-gray-800 truncate">
                        {prestadorSel.iban_numero || '—'}
                      </span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                        ✓ Confirmado
                      </span>
                    </div>
                    {prestadorSel.iban_titular && (
                      <p className="text-xs text-gray-500 mt-1">
                        Titular: <strong>{prestadorSel.iban_titular}</strong>
                        {prestadorSel.iban_banco && ` · ${prestadorSel.iban_banco}`}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Este IBAN vem do perfil do prestador. Não é editável aqui.
                  </p>
                </div>
              )}

              {!prestadorSel.tem_iban && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs text-red-700 font-semibold">
                    ⚠️ Este prestador ainda não configurou os dados de recebimento.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Comprovativo (PDF/JPG/PNG)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setComprovativo(e.target.files[0] || null)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#003580] file:text-white file:text-xs file:font-semibold cursor-pointer"
                />
                {comprovativo && (
                  <p className="text-xs text-gray-500 mt-2">
                    {comprovativo.name} ({(comprovativo.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Observações
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Ex: Repasse referente às reservas de setembro."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={enviando}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando || !valor || !prestadorSel.tem_iban}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#003580] hover:bg-[#002860] text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {enviando ? (
                    <><Loader2 size={16} className="animate-spin" /> A registar...</>
                  ) : (
                    <><Send size={16} /> Confirmar repasse</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}