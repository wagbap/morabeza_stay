// components/admin/SolicitarDocumentoModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  XCircle,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Upload,
  Eye,
  Download,
  Check,
  Plus,
  RefreshCw,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://welovepalop.com/api';

const TIPOS_DOCUMENTO = [
  { value: 'alvara',            label: 'Alvará de funcionamento' },
  { value: 'licenca_turismo',   label: 'Licença de turismo' },
  { value: 'caderneta_predial', label: 'Caderneta predial' },
  { value: 'certidao',          label: 'Certidão permanente' },
  { value: 'bi_passaporte',     label: 'BI ou Passaporte' },
  { value: 'carta_conducao',    label: 'Carta de condução' },
  { value: 'livrete',           label: 'Livrete do veículo' },
  { value: 'seguro',            label: 'Apólice de seguro' },
  { value: 'licenca_guia',      label: 'Licença de guia turístico' },
  { value: 'outro',             label: 'Outro documento' },
];

const TIPOS_LABEL = TIPOS_DOCUMENTO.reduce((acc, t) => {
  acc[t.value] = t.label;
  return acc;
}, {});

export default function SolicitarDocumentoModal({
  anuncioId,
  anuncioTipo,
  prestadorId,
  onClose,
  onSucesso,
}) {
  // --- Estado do formulário (criar novo pedido)
  const [tipo, setTipo] = useState('');
  const [motivo, setMotivo] = useState('');
  const [prazo, setPrazo] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });

  // --- Estado da lista (pedidos existentes)
  const [pedidos, setPedidos] = useState([]);
  const [loadingLista, setLoadingLista] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showNovoPedido, setShowNovoPedido] = useState(false);

  // --- Modal de rejeição
  const [showRejeitar, setShowRejeitar] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');

  // ============================================================
  // CARREGAR PEDIDOS EXISTENTES
  // ============================================================
  const carregarPedidos = async () => {
    if (!anuncioId || !anuncioTipo) {
      setLoadingLista(false);
      return;
    }

    setLoadingLista(true);
    try {
      const res = await fetch(`${API_URL}/admin/solicitar_documento.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'listar_por_anuncio',
          anuncio_id: anuncioId,
          anuncio_tipo: anuncioTipo,
        }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        setPedidos(data.data || []);
        if ((data.data || []).length === 0) setShowNovoPedido(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLista(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, [anuncioId, anuncioTipo]);

  // ============================================================
  // CRIAR NOVO PEDIDO
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ tipo: '', texto: '' });

    if (!tipo) return setMsg({ tipo: 'erro', texto: 'Escolhe o tipo de documento.' });
    if (motivo.trim().length < 10)
      return setMsg({ tipo: 'erro', texto: 'O motivo deve ter pelo menos 10 caracteres.' });
    if (!prazo) return setMsg({ tipo: 'erro', texto: 'Escolhe um prazo.' });

    if (!anuncioId || !anuncioTipo || !prestadorId) {
      setMsg({
        tipo: 'erro',
        texto: `Dados incompletos (id: ${anuncioId}, tipo: ${anuncioTipo}, prestador: ${prestadorId}).`,
      });
      return;
    }

    setLoading(true);

    const admin = JSON.parse(localStorage.getItem('morabeza_admin') || '{}');
    if (!admin.id) {
      setMsg({ tipo: 'erro', texto: 'Sessão expirada. Inicia sessão novamente.' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/solicitar_documento.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'criar_pedido',
          anuncio_id: parseInt(anuncioId),
          anuncio_tipo: anuncioTipo,
          admin_id: parseInt(admin.id),
          prestador_id: parseInt(prestadorId),
          tipo_documento: tipo,
          motivo: motivo.trim(),
          prazo,
        }),
      });

      const texto = await res.text();
      let data;
      try { data = JSON.parse(texto); }
      catch { data = { status: 'error', message: 'Resposta inválida.' }; }

      if (data.status === 'success') {
        setMsg({ tipo: 'sucesso', texto: data.message });
        setTipo('');
        setMotivo('');
        setPrazo('');
        setShowNovoPedido(false);
        await carregarPedidos();
        onSucesso?.();
      } else {
        setMsg({ tipo: 'erro', texto: data.message || 'Erro ao enviar pedido.' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ tipo: 'erro', texto: 'Erro de ligação ao servidor.' });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // APROVAR DOCUMENTO
  // ============================================================
  const aprovar = async (pedidoId) => {
    if (!window.confirm('Confirmas a aprovação deste documento?')) return;

    setActionLoading(pedidoId);
    setMsg({ tipo: '', texto: '' });

    const admin = JSON.parse(localStorage.getItem('morabeza_admin') || '{}');

    try {
      const res = await fetch(`${API_URL}/admin/solicitar_documento.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'aprovar_documento',
          pedido_id: pedidoId,
          admin_id: admin.id,
        }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        setMsg({ tipo: 'sucesso', texto: data.message });
        await carregarPedidos();
        onSucesso?.();
      } else {
        setMsg({ tipo: 'erro', texto: data.message || 'Erro ao aprovar.' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ tipo: 'erro', texto: 'Erro de ligação.' });
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // REJEITAR DOCUMENTO
  // ============================================================
  const rejeitar = async () => {
    if (motivoRejeicao.trim().length < 5) {
      setMsg({ tipo: 'erro', texto: 'Escreve o motivo da rejeição.' });
      return;
    }

    setActionLoading(showRejeitar.id);
    setMsg({ tipo: '', texto: '' });

    const admin = JSON.parse(localStorage.getItem('morabeza_admin') || '{}');

    try {
      const res = await fetch(`${API_URL}/admin/solicitar_documento.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rejeitar_documento',
          pedido_id: showRejeitar.id,
          admin_id: admin.id,
          motivo: motivoRejeicao.trim(),
        }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        setMsg({ tipo: 'sucesso', texto: data.message });
        setShowRejeitar(null);
        setMotivoRejeicao('');
        await carregarPedidos();
        onSucesso?.();
      } else {
        setMsg({ tipo: 'erro', texto: data.message || 'Erro ao rejeitar.' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ tipo: 'erro', texto: 'Erro de ligação.' });
    } finally {
      setActionLoading(null);
    }
  };

  const formatarData = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const StatusBadge = ({ estado }) => {
    const map = {
      pendente:  { cls: 'bg-yellow-100 text-yellow-700', ic: <Clock size={12} />,        txt: 'Aguarda envio' },
      enviado:   { cls: 'bg-blue-100 text-blue-700',     ic: <Upload size={12} />,       txt: 'Aguarda análise' },
      aprovado:  { cls: 'bg-green-100 text-green-700',   ic: <CheckCircle2 size={12} />, txt: 'Aprovado' },
      rejeitado: { cls: 'bg-red-100 text-red-700',       ic: <XCircle size={12} />,      txt: 'Rejeitado' },
      expirado:  { cls: 'bg-gray-100 text-gray-700',     ic: <AlertCircle size={12} />,  txt: 'Expirado' },
    };
    const s = map[estado] || map.pendente;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${s.cls}`}>
        {s.ic} {s.txt}
      </span>
    );
  };

  const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const temPendente = pedidos.some((p) => p.estado === 'pendente' || p.estado === 'enviado');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 text-[#003580]">
            <FileText size={20} />
            <h2 className="text-lg font-bold">Documentos do anúncio</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">

          {/* Mensagem global */}
          {msg.texto && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                msg.tipo === 'sucesso'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {msg.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{msg.texto}</span>
            </div>
          )}

          {/* ============================================ */}
          {/* SECÇÃO 1 — PEDIDOS EXISTENTES */}
          {/* ============================================ */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Pedidos anteriores
              </h3>
              <button
                onClick={carregarPedidos}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                title="Atualizar"
              >
                <RefreshCw size={14} className="text-gray-500" />
              </button>
            </div>

            {loadingLista ? (
              <div className="py-6 flex justify-center">
                <Loader2 className="animate-spin text-[#003580]" size={20} />
              </div>
            ) : pedidos.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-400 bg-gray-50 rounded-xl">
                Ainda não foram solicitados documentos para este anúncio.
              </div>
            ) : (
              <div className="space-y-2">
                {pedidos.map((p) => (
                  <div
                    key={p.id}
                    className={`border rounded-xl p-3 transition-all ${
                      p.estado === 'enviado'
                        ? 'border-blue-200 bg-blue-50/40'
                        : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-gray-900 text-sm">
                            {TIPOS_LABEL[p.tipo_documento] || p.tipo_documento}
                          </span>
                          <StatusBadge estado={p.estado} />
                        </div>
                        <p className="text-xs text-gray-500">
                          <strong>Motivo:</strong> {p.motivo}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Prazo: {formatarData(p.prazo)}
                          {p.enviado_em && ` • Enviado: ${formatarData(p.enviado_em)}`}
                          {p.aprovado_em && ` • Aprovado: ${formatarData(p.aprovado_em)}`}
                        </p>
                        {p.motivo_rejeicao && (
                          <p className="text-xs text-red-600 mt-1">
                            <strong>Rejeição:</strong> {p.motivo_rejeicao}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {p.documento_url && (
                        <>
                          <a
                            href={p.documento_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                          >
                            <Eye size={12} /> Ver
                          </a>
                          <a
                            href={p.documento_url}
                            download
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                          >
                            <Download size={12} />
                          </a>
                        </>
                      )}

                      {p.estado === 'enviado' && (
                        <>
                          <button
                            onClick={() => aprovar(p.id)}
                            disabled={actionLoading === p.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50"
                          >
                            {actionLoading === p.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Check size={12} />
                            )}
                            Aprovar
                          </button>
                          <button
                            onClick={() => {
                              setShowRejeitar(p);
                              setMotivoRejeicao('');
                              setMsg({ tipo: '', texto: '' });
                            }}
                            disabled={actionLoading === p.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
                          >
                            <X size={12} /> Rejeitar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* SECÇÃO 2 — CRIAR NOVO PEDIDO */}
          {/* ============================================ */}
          <div className="pt-4 border-t border-gray-100">
            {!showNovoPedido ? (
              <button
                type="button"
                onClick={() => {
                  setShowNovoPedido(true);
                  setMsg({ tipo: '', texto: '' });
                }}
                disabled={temPendente}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                {temPendente
                  ? 'Já existe um pedido em curso'
                  : 'Solicitar novo documento'}
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Novo pedido de documento
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNovoPedido(false);
                      setMsg({ tipo: '', texto: '' });
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancelar
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  Este pedido será enviado ao prestador. O anúncio ficará em
                  <strong> "Documentação necessária"</strong> até o documento ser enviado.
                </p>

                {(!anuncioId || !anuncioTipo || !prestadorId) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                    ⚠️ Dados em falta — anúncio: {anuncioId || '?'} · tipo: {anuncioTipo || '?'} · prestador: {prestadorId || '?'}
                  </div>
                )}

                {/* Tipo */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Tipo de documento *
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm"
                    required
                  >
                    <option value="">Seleciona um tipo...</option>
                    {TIPOS_DOCUMENTO.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Motivo */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Motivo do pedido *
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Ex: Precisamos confirmar a licença do imóvel antes de publicar o anúncio."
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm resize-none"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">{motivo.length}/500</p>
                </div>

                {/* Prazo */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Prazo de envio *
                  </label>
                  <input
                    type="date"
                    value={prazo}
                    min={amanha}
                    onChange={(e) => setPrazo(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#003580] hover:bg-[#002860] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> A enviar...
                    </>
                  ) : (
                    <>
                      <FileText size={16} /> Enviar pedido
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-medium border border-gray-300 hover:bg-gray-50 transition"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* MODAL INTERNO — REJEITAR */}
      {/* ============================================ */}
      {showRejeitar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2 text-red-600">Rejeitar documento</h3>
            <p className="text-sm text-gray-500 mb-4">
              Explica porque o documento não é válido. O prestador poderá reenviar.
            </p>

            <textarea
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Ex: O documento está ilegível. Envia uma foto mais clara."
              className="w-full border border-gray-200 rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm resize-none"
              autoFocus
            />
            <p className="text-xs text-gray-400 mb-4">{motivoRejeicao.length}/500</p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejeitar(null);
                  setMotivoRejeicao('');
                }}
                className="flex-1 bg-gray-200 py-2.5 rounded-xl hover:bg-gray-300 transition text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={rejeitar}
                disabled={!motivoRejeicao.trim() || actionLoading === showRejeitar.id}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl transition text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === showRejeitar.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <X size={16} />
                )}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}