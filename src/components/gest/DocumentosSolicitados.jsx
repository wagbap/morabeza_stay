// components/prestador/DocumentosSolicitados.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Clock, CheckCircle2, XCircle, Upload,
  Loader2, AlertCircle, RefreshCw, X, Send, ArrowLeft,
  AlertTriangle, Edit3, Bell, Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://welovepalop.com/api';

const TIPOS_LABEL = {
  alvara:            'Alvará de funcionamento',
  licenca_turismo:   'Licença de turismo',
  caderneta_predial: 'Caderneta predial',
  certidao:          'Certidão permanente',
  bi_passaporte:     'BI ou Passaporte',
  carta_conducao:    'Carta de condução',
  livrete:           'Livrete do veículo',
  seguro:            'Apólice de seguro',
  licenca_guia:      'Licença de guia turístico',
  outro:             'Outro documento',
};

const TIPO_ANUNCIO = {
  alojamento:  { label: 'Alojamento',  base: '/alojamento-registro' },
  carro:       { label: 'Viatura',     base: '/carro-registo' },
  experiencia: { label: 'Experiência', base: '/experiencia-registro' },
};

export default function DocumentosSolicitados() {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [correcoes, setCorrecoes] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [ficheiro, setFicheiro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);

  const sessao = JSON.parse(localStorage.getItem('user') || '{}');
  const pollingRef = useRef(null);

  const carregarNotificacoes = async () => {
    if (!sessao.id) return;

    try {
      const res = await fetch(`${API_URL}/usuarios/notificacoes.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'listar',
          usuario_id: sessao.id,
          limite: 20,
        }),
      });
      const texto = await res.text();
      let data;
      try { data = JSON.parse(texto); }
      catch { data = { status: 'error' }; }

      if (data.status === 'success') {
        setNotificacoes(data.data || []);
        setNaoLidas(data.nao_lidas || 0);
      }
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    }
  };

  const carregarTudo = async () => {
    if (!sessao.id) {
      setLoading(false);
      return;
    }

    try {
      const resPedidos = await fetch(`${API_URL}/admin/solicitar_documento.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'listar_pedidos_prestador',
          prestador_id: sessao.id,
        }),
      });
      const textoPedidos = await resPedidos.text();
      let dataPedidos;
      try { dataPedidos = JSON.parse(textoPedidos); }
      catch { dataPedidos = { status: 'error' }; }

      if (dataPedidos.status === 'success') {
        setPedidos(dataPedidos.data || []);
      }

      const resCorr = await fetch(`${API_URL}/admin/solicitar_documento.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'listar_correcoes_prestador',
          prestador_id: sessao.id,
        }),
      });
      const textoCorr = await resCorr.text();
      let dataCorr;
      try { dataCorr = JSON.parse(textoCorr); }
      catch { dataCorr = { status: 'error' }; }

      if (dataCorr.status === 'success') {
        setCorrecoes(dataCorr.data || []);
      }

      await carregarNotificacoes();
    } catch (err) {
      console.error(err);
      setMsg({ tipo: 'erro', texto: 'Erro de ligação.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTudo();

    pollingRef.current = setInterval(() => {
      carregarNotificacoes();
    }, 15000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const marcarTodasLidas = async () => {
    if (!sessao.id) return;
    try {
      await fetch(`${API_URL}/admin/anuncios/notificacoes.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'marcar_todas_lidas',
          usuario_id: sessao.id,
        }),
      });
      carregarNotificacoes();
    } catch (err) {
      console.error(err);
    }
  };

  const marcarLida = async (id) => {
    if (!sessao.id) return;
    try {
      await fetch(`${API_URL}/admin/anuncios/notificacoes.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'marcar_lida',
          notificacao_id: id,
          usuario_id: sessao.id,
        }),
      });
      carregarNotificacoes();
    } catch (err) {
      console.error(err);
    }
  };

  const abrirEnvio = (pedido) => {
    setPedidoSelecionado(pedido);
    setFicheiro(null);
    setMsg({ tipo: '', texto: '' });
    setShowModal(true);
  };

  const handleUploadEnviar = async (e) => {
    e.preventDefault();
    if (!ficheiro) {
      setMsg({ tipo: 'erro', texto: 'Escolhe um ficheiro.' });
      return;
    }

    setEnviando(true);
    setMsg({ tipo: '', texto: '' });

    try {
      const form = new FormData();
      form.append('documento', ficheiro);

      const resUp = await fetch(`${API_URL}/usuarios/upload_documento.php`, {
        method: 'POST',
        body: form,
      });
      const dataUp = await resUp.json();

      if (!dataUp.success) {
        setMsg({ tipo: 'erro', texto: dataUp.message || 'Falha no upload.' });
        setEnviando(false);
        return;
      }

      const resEnv = await fetch(`${API_URL}/admin/solicitar_documento.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enviar_documento',
          pedido_id: pedidoSelecionado.id,
          prestador_id: sessao.id,
          documento_url: dataUp.documento_url,
        }),
      });
      const dataEnv = await resEnv.json();

      if (dataEnv.status === 'success') {
        setMsg({ tipo: 'sucesso', texto: dataEnv.message });
        await carregarTudo();
        setTimeout(() => {
          setShowModal(false);
          setPedidoSelecionado(null);
          setFicheiro(null);
        }, 1500);
      } else {
        setMsg({ tipo: 'erro', texto: dataEnv.message || 'Erro ao enviar.' });
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
    });
  };

  const formatarRelativo = (d) => {
    if (!d) return '';
    const data = new Date(d);
    const agora = new Date();
    const diff = (agora - data) / 1000 / 60;

    if (diff < 1) return 'Agora';
    if (diff < 60) return `${Math.floor(diff)}m atrás`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`;
    return data.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  };

  const urlDocumentoComCache = (url, enviadoEm) => {
    if (!url) return '';
    let u = url;
    if (u.startsWith('https:///')) u = u.replace('https:///', 'https://');
    if (u.startsWith('http:///'))  u = u.replace('http:///', 'http://');
    const sep = u.includes('?') ? '&' : '?';
    const ts = enviadoEm ? new Date(enviadoEm).getTime() : Date.now();
    return `${u}${sep}v=${ts}`;
  };

  const StatusBadge = ({ estado }) => {
    const map = {
      pendente:  { cls: 'bg-yellow-100 text-yellow-700', ic: <Clock size={12} />,        txt: 'Pendente' },
      enviado:   { cls: 'bg-blue-100 text-blue-700',     ic: <Upload size={12} />,       txt: 'Enviado' },
      aprovado:  { cls: 'bg-green-100 text-green-700',   ic: <CheckCircle2 size={12} />, txt: 'Aprovado' },
      rejeitado: { cls: 'bg-red-100 text-red-700',       ic: <XCircle size={12} />,      txt: 'Rejeitado' },
      expirado:  { cls: 'bg-gray-100 text-gray-700',     ic: <AlertCircle size={12} />,  txt: 'Expirado' },
    };
    const s = map[estado] || map.pendente;
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${s.cls}`}>
        {s.ic} {s.txt}
      </span>
    );
  };

  const getIconeNotif = (tipo) => {
    switch (tipo) {
      case 'documento': return <FileText size={16} className="text-blue-600" />;
      case 'anuncio':   return <AlertTriangle size={16} className="text-orange-600" />;
      default:          return <Bell size={16} className="text-gray-600" />;
    }
  };

  const totalPendencias = correcoes.length + pedidos.filter(p => p.estado === 'pendente' || p.estado === 'rejeitado').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          title="Voltar"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[#003580]">
            Pendências dos meus anúncios
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Correções pedidas e documentos solicitados pela administração.
          </p>
        </div>

        {totalPendencias > 0 && (
          <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
            <AlertCircle size={14} /> {totalPendencias} {totalPendencias === 1 ? 'pendência' : 'pendências'}
          </span>
        )}

        <button
          onClick={carregarTudo}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
        >
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      {msg.texto && !showModal && (
        <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
          msg.tipo === 'sucesso' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {msg.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{msg.texto}</span>
        </div>
      )}

      {naoLidas > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <Bell size={22} className="text-blue-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                {naoLidas > 9 ? '9+' : naoLidas}
              </span>
            </div>
            <h3 className="font-bold text-blue-900 text-base">
              Tens {naoLidas} {naoLidas === 1 ? 'notificação nova' : 'notificações novas'}
            </h3>
            <button
              onClick={marcarTodasLidas}
              className="ml-auto text-xs text-blue-700 hover:underline font-semibold flex items-center gap-1"
            >
              <CheckCircle2 size={12} /> Marcar todas como lidas
            </button>
          </div>

          <div className="space-y-2">
            {notificacoes.filter(n => n.lida == 0).slice(0, 3).map((n) => (
              <div
                key={n.id}
                className="bg-white rounded-xl p-3 flex items-start gap-3 cursor-pointer hover:bg-blue-50/50 transition"
                onClick={() => {
                  marcarLida(n.id);
                  if (n.tipo === 'documento' || n.tipo === 'anuncio') {
                    setMostrarNotificacoes(false);
                  }
                }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getIconeNotif(n.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{n.titulo}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{n.mensagem}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatarRelativo(n.criado_em)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {notificacoes.length > 0 && (
        <div>
          <button
            onClick={() => setMostrarNotificacoes(!mostrarNotificacoes)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition text-sm font-semibold text-gray-700"
          >
            <span className="flex items-center gap-2">
              <Info size={16} /> Ver histórico de notificações ({notificacoes.length})
            </span>
            <span className={`transform transition-transform ${mostrarNotificacoes ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {mostrarNotificacoes && (
            <div className="mt-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                {notificacoes.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 flex items-start gap-3 hover:bg-gray-50 transition cursor-pointer ${
                      n.lida == 0 ? 'bg-blue-50/30' : ''
                    }`}
                    onClick={() => {
                      if (n.lida == 0) marcarLida(n.id);
                    }}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getIconeNotif(n.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${n.lida == 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {n.titulo}
                        </p>
                        {n.lida == 0 && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{n.mensagem}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{formatarRelativo(n.criado_em)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-[#003580]" size={32} />
        </div>
      ) : (
        <>
          {correcoes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-orange-600 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={16} /> Anúncios que precisam de correção
              </h2>

              {correcoes.map((c) => {
                const info = TIPO_ANUNCIO[c.tipo] || { label: c.tipo, base: '/' };

                return (
                  <div
                    key={`${c.tipo}-${c.id}`}
                    className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="px-2 py-0.5 bg-orange-200 text-orange-900 rounded-md text-xs font-bold">
                            {info.label}
                          </span>
                          <span className="px-2 py-0.5 bg-orange-600 text-white rounded-md text-xs font-semibold flex items-center gap-1">
                            <AlertTriangle size={10} /> Correção necessária
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 text-base">
                          {c.titulo || `Anúncio #${c.id}`}
                        </h3>

                        {c.motivo && (
                          <div className="mt-3 p-3 bg-white border border-orange-100 rounded-xl">
                            <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-1">
                              O que precisa ser corrigido:
                            </p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {c.motivo.replace(/^O teu anúncio precisa de correções\. Motivo: /i, '')}
                            </p>
                          </div>
                        )}

                        {!c.motivo && (
                          <p className="text-sm text-gray-500 mt-2">
                            A administração pediu correções neste anúncio. Verifica os dados e volta a enviar.
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          const url = `${info.base}/fluxo?edit=${c.id}&tipo=${c.tipo}`;
                          console.log('🔧 A abrir anúncio para correção:', url);
                          navigate(url);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition flex-shrink-0"
                      >
                        <Edit3 size={14} /> Corrigir anúncio
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} /> Documentos solicitados
            </h2>

            {pedidos.length === 0 ? (
              <div className="py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Nenhum documento solicitado.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Quando a administração pedir algo, aparece aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pedidos.map((p) => {
                  const expirado = p.estado === 'pendente' && new Date(p.prazo) < new Date();
                  const podeEnviar =
                    p.estado === 'pendente' ||
                    p.estado === 'rejeitado' ||
                    p.estado === 'enviado';

                  return (
                    <div
                      key={p.id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">
                            {TIPOS_LABEL[p.tipo_documento] || p.tipo_documento}
                          </h3>
                          <StatusBadge estado={expirado ? 'expirado' : p.estado} />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Anúncio: <strong>{p.anuncio_titulo || `#${p.anuncio_id}`}</strong>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          <strong>Motivo:</strong> {p.motivo}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Prazo: <strong>{formatarData(p.prazo)}</strong>
                          {p.enviado_em && ` • Enviado em: ${formatarData(p.enviado_em)}`}
                        </p>
                        {p.estado === 'rejeitado' && p.motivo_rejeicao && (
                          <div className="mt-2 text-xs bg-red-50 text-red-700 p-2 rounded-lg">
                            <strong>Motivo da rejeição:</strong> {p.motivo_rejeicao}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {p.documento_url && (
                          <a
                            href={urlDocumentoComCache(p.documento_url, p.enviado_em)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Ver enviado
                          </a>
                        )}
                        {podeEnviar && (
                          <button
                            onClick={() => abrirEnvio(p)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition ${
                              p.estado === 'enviado'
                                ? 'bg-gray-600 hover:bg-gray-700'
                                : 'bg-[#003580] hover:bg-[#002860]'
                            }`}
                          >
                            <Upload size={14} />
                            {p.estado === 'enviado'
                              ? 'Substituir documento'
                              : p.estado === 'rejeitado'
                              ? 'Reenviar'
                              : 'Enviar documento'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {showModal && pedidoSelecionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-[#003580]">
                {pedidoSelecionado.estado === 'enviado' ? 'Substituir documento' : 'Enviar documento'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadEnviar} className="p-5 space-y-4">
              {msg.texto && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                  msg.tipo === 'sucesso' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {msg.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{msg.texto}</span>
                </div>
              )}

              {pedidoSelecionado.estado === 'enviado' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800">
                  ⚠️ Já enviaste um documento. Se enviares outro, o anterior será <strong>substituído</strong>.
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-3 text-sm">
                <p className="text-gray-500">Documento solicitado:</p>
                <p className="font-bold text-gray-800">
                  {TIPOS_LABEL[pedidoSelecionado.tipo_documento]}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Prazo: {formatarData(pedidoSelecionado.prazo)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Ficheiro (PDF, JPG ou PNG · máx. 10MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFicheiro(e.target.files[0] || null)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#003580] file:text-white file:text-xs file:font-semibold hover:file:bg-[#002860] cursor-pointer"
                  required
                />
                {ficheiro && (
                  <p className="text-xs text-gray-500 mt-2">
                    {ficheiro.name} ({(ficheiro.size / 1024).toFixed(0)} KB)
                  </p>
                )}
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
                  disabled={enviando || !ficheiro}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#003580] hover:bg-[#002860] text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {enviando ? (
                    <><Loader2 size={16} className="animate-spin" /> A enviar...</>
                  ) : (
                    <><Send size={16} /> Enviar</>
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