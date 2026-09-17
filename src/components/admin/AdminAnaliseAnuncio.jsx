// components/admin/AdminAnaliseAnuncio.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  Pause,
  AlertTriangle,
  Loader2,
  Home,
  MapPin,
  DollarSign,
  User,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  Car,
  Compass,
  Users,
  Clock,
  Fuel,
  Settings,
  Bed,
  Bath,
  Eye,
} from 'lucide-react';
import SolicitarDocumentoModal from './SolicitarDocumentoModal';

const API_URL = import.meta.env.VITE_API_URL || 'https://welovepalop.com/api';

const TIPO_INFO = {
  alojamento: {
    label: 'Alojamento',
    Icone: Home,
    cor: 'text-blue-600 bg-blue-50',
  },
  experiencia: {
    label: 'Experiência',
    Icone: Compass,
    cor: 'text-purple-600 bg-purple-50',
  },
  carro: {
    label: 'Viatura',
    Icone: Car,
    cor: 'text-green-600 bg-green-50',
  },
};

export default function AdminAnaliseAnuncio() {
  const { tipo, id } = useParams();
  const navigate = useNavigate();

  const [anuncio, setAnuncio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [showModalDocumento, setShowModalDocumento] = useState(false);
  const [showModalCorrecao, setShowModalCorrecao] = useState(false);
  const [showModalRejeicao, setShowModalRejeicao] = useState(false);
  const [motivoTexto, setMotivoTexto] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });

  // ✅ NOVO — documento mais recente enviado pelo prestador
  const [ultimoDocumento, setUltimoDocumento] = useState(null);

  const tipoValido = tipo && TIPO_INFO[tipo];
  const tipoInfo = TIPO_INFO[tipo] || TIPO_INFO.alojamento;
  const TipoIcone = tipoInfo.Icone;

  // ============================================================
  // CARREGAR ANÚNCIO
  // ============================================================
  const carregarAnuncio = async () => {
    if (!tipoValido) {
      setErro('Tipo de anúncio inválido.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro('');

    try {
      const res = await fetch(
        `${API_URL}/admin/anuncios/detalhe.php?tipo=${tipo}&id=${id}`
      );

      const texto = await res.text();

      if (!texto || texto.trim() === '') {
        setErro(`O servidor não devolveu resposta (HTTP ${res.status}).`);
        setLoading(false);
        return;
      }

      let data;
      try {
        data = JSON.parse(texto);
      } catch (parseErr) {
        console.error('Resposta não é JSON:', texto.substring(0, 300));
        setErro('Resposta inválida do servidor. Verifica a consola (F12).');
        setLoading(false);
        return;
      }

      if (data.success && data.data) {
        setAnuncio(data.data);
      } else {
        setErro(data.message || 'Anúncio não encontrado.');
      }
    } catch (err) {
      console.error('Erro de rede:', err);
      setErro('Erro de ligação ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CARREGAR ÚLTIMO DOCUMENTO ENVIADO
  // ============================================================
  const carregarUltimoDocumento = async () => {
    if (!tipo || !id) return;

    try {
      const res = await fetch(`${API_URL}/admin/solicitar_documento.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'listar_por_anuncio',
          anuncio_id: parseInt(id),
          anuncio_tipo: tipo,
        }),
      });
      const data = await res.json();

      if (data.status === 'success' && Array.isArray(data.data)) {
        // Filtrar os que têm documento enviado
        const comDocumento = data.data.filter((p) => p.documento_url);
        // Ordenar por enviado_em desc
        comDocumento.sort((a, b) => {
          const da = a.enviado_em ? new Date(a.enviado_em).getTime() : 0;
          const db = b.enviado_em ? new Date(b.enviado_em).getTime() : 0;
          return db - da;
        });
        setUltimoDocumento(comDocumento[0] || null);
      }
    } catch (err) {
      console.error('Erro ao carregar documento:', err);
    }
  };

  useEffect(() => {
    carregarAnuncio();
  }, [tipo, id]);

  useEffect(() => {
    if (tipo && id) carregarUltimoDocumento();
  }, [tipo, id]);

  // ============================================================
  // EXECUTAR AÇÃO
  // ============================================================
  const executarAcao = async (acao, payload = {}) => {
    setActionLoading(true);
    setMsg({ tipo: '', texto: '' });

    const admin = JSON.parse(localStorage.getItem('morabeza_admin') || '{}');

    if (!admin.id) {
      setMsg({ tipo: 'erro', texto: 'Sessão expirada. Inicia sessão novamente.' });
      setActionLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/anuncios/acao.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anuncio_id: parseInt(id),
          tipo,
          admin_id: admin.id,
          acao,
          ...payload,
        }),
      });

      const texto = await res.text();

      if (!texto || texto.trim() === '') {
        setMsg({ tipo: 'erro', texto: `Servidor sem resposta (HTTP ${res.status}).` });
        setActionLoading(false);
        return;
      }

      let data;
      try {
        data = JSON.parse(texto);
      } catch {
        setMsg({ tipo: 'erro', texto: 'Resposta inválida do servidor.' });
        setActionLoading(false);
        return;
      }

      if (data.status === 'success') {
        setMsg({ tipo: 'sucesso', texto: data.message || 'Ação executada com sucesso.' });
        carregarAnuncio();
      } else {
        setMsg({ tipo: 'erro', texto: data.message || 'Erro ao executar ação.' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ tipo: 'erro', texto: 'Erro de ligação ao servidor.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAprovar = () => {
    if (!window.confirm('Confirmas a aprovação e publicação deste anúncio?')) return;
    executarAcao('aprovar');
  };

  const handlePedirCorrecao = () => {
    if (!motivoTexto.trim()) {
      setMsg({ tipo: 'erro', texto: 'Escreve o motivo da correção.' });
      return;
    }
    executarAcao('pedir_correcao', { motivo: motivoTexto.trim() });
    setShowModalCorrecao(false);
    setMotivoTexto('');
  };

  const handleRejeitar = () => {
    if (!motivoTexto.trim()) {
      setMsg({ tipo: 'erro', texto: 'Escreve o motivo da rejeição.' });
      return;
    }
    executarAcao('rejeitar', { motivo: motivoTexto.trim() });
    setShowModalRejeicao(false);
    setMotivoTexto('');
  };

  const handlePausar = () => {
    if (!window.confirm('Confirmas que queres pausar este anúncio?')) return;
    executarAcao('pausar');
  };

  // ✅ NOVO — Abrir PDF mais recente
  const handleVerDocumento = () => {
    if (!ultimoDocumento || !ultimoDocumento.documento_url) {
      setMsg({
        tipo: 'erro',
        texto: 'Nenhum documento foi enviado pelo prestador ainda.',
      });
      return;
    }

    // Corrigir URL se tiver "https:///"
    let url = ultimoDocumento.documento_url;
    if (url.startsWith('https:///')) {
      url = url.replace('https:///', 'https://');
    } else if (url.startsWith('http:///')) {
      url = url.replace('http:///', 'http://');
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatarPreco = (valor) => {
    if (!valor && valor !== 0) return '-';
    return `${new Intl.NumberFormat('pt-CV', { maximumFractionDigits: 0 }).format(valor)} CVE`;
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
      rascunho: { cls: 'bg-gray-100 text-gray-700', txt: 'Rascunho' },
      pendente: { cls: 'bg-yellow-100 text-yellow-700', txt: 'Pendente' },
      em_analise: { cls: 'bg-yellow-100 text-yellow-700', txt: 'Em análise' },
      correcao_necessaria: { cls: 'bg-orange-100 text-orange-700', txt: 'Correção necessária' },
      documentacao_necessaria: { cls: 'bg-blue-100 text-blue-700', txt: 'Documentação necessária' },
      aprovado: { cls: 'bg-green-100 text-green-700', txt: 'Aprovado' },
      publicado: { cls: 'bg-green-100 text-green-700', txt: 'Publicado' },
      rejeitado: { cls: 'bg-red-100 text-red-700', txt: 'Rejeitado' },
      pausado: { cls: 'bg-gray-100 text-gray-700', txt: 'Pausado' },
      suspenso: { cls: 'bg-red-100 text-red-700', txt: 'Suspenso' },
    };
    const s = map[estado] || { cls: 'bg-gray-100 text-gray-700', txt: estado || '-' };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
        {s.txt}
      </span>
    );
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-[#003580]" size={32} />
      </div>
    );
  }

  // ============================================================
  // ERRO
  // ============================================================
  if (erro) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <p className="text-red-600 font-medium mb-4">{erro}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={carregarAnuncio}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#003580] text-white rounded-lg text-sm hover:bg-[#002860] transition"
          >
            <RefreshCw size={16} /> Tentar novamente
          </button>
          <button
            onClick={() => navigate('/admin/propriedades')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!anuncio) return null;

  const imagemPrincipal =
    anuncio.foto_principal ||
    anuncio.imagem_url ||
    anuncio.imagem_principal ||
    null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => navigate('/admin/propriedades')}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          title="Voltar"
        >
          <ArrowLeft size={20} />
        </button>

        <div className={`p-2.5 rounded-xl ${tipoInfo.cor}`}>
          <TipoIcone size={24} />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[#003580] truncate">
            Análise de {tipoInfo.label}
          </h1>
          <p className="text-sm text-gray-500 truncate">
            #{anuncio.id} — {anuncio.titulo}
          </p>
        </div>

        <StatusBadge estado={anuncio.estado || anuncio.status} />
      </div>

      {/* MENSAGEM */}
      {msg.texto && (
        <div
          className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
            msg.tipo === 'sucesso'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {msg.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          <span>{msg.texto}</span>
        </div>
      )}

      {/* DADOS DO ANÚNCIO */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {imagemPrincipal && (
          <img
            src={imagemPrincipal}
            alt={anuncio.titulo}
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}

        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">{anuncio.titulo}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={16} className="flex-shrink-0" />
              <span>{anuncio.localizacao || anuncio.ilha || 'Localização não informada'}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign size={16} className="flex-shrink-0" />
              {tipo === 'alojamento' && (
                <span>
                  <strong>{formatarPreco(anuncio.preco || anuncio.preco_noite)}</strong> / noite
                </span>
              )}
              {tipo === 'carro' && (
                <span>
                  <strong>{formatarPreco(anuncio.preco_dia)}</strong> / dia
                </span>
              )}
              {tipo === 'experiencia' && (
                <span>
                  <strong>{formatarPreco(anuncio.preco || anuncio.preco_pessoa)}</strong> / pessoa
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} className="flex-shrink-0" />
              <span>Submetido em {formatarData(anuncio.criado_em || anuncio.created_at)}</span>
            </div>

            {tipo === 'alojamento' && (
              <>
                {anuncio.capacidade && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} /> {anuncio.capacidade} hóspedes
                  </div>
                )}
                {anuncio.quartos && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Bed size={16} /> {anuncio.quartos} quartos
                  </div>
                )}
                {anuncio.casas_banho && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Bath size={16} /> {anuncio.casas_banho} casas de banho
                  </div>
                )}
              </>
            )}

            {tipo === 'carro' && (
              <>
                {anuncio.marca && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Car size={16} /> {anuncio.marca} {anuncio.modelo || ''}
                  </div>
                )}
                {anuncio.passageiros && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} /> {anuncio.passageiros} lugares
                  </div>
                )}
                {anuncio.transmissao && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Settings size={16} /> {anuncio.transmissao}
                  </div>
                )}
                {anuncio.combustivel && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Fuel size={16} /> {anuncio.combustivel}
                  </div>
                )}
              </>
            )}

            {tipo === 'experiencia' && (
              <>
                {anuncio.duracao && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} /> {anuncio.duracao}
                  </div>
                )}
                {anuncio.max_participantes && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} /> Máx. {anuncio.max_participantes} participantes
                  </div>
                )}
              </>
            )}
          </div>

          {anuncio.descricao && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{anuncio.descricao}</p>
            </div>
          )}
        </div>
      </div>

      {/* DADOS DO PRESTADOR */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User size={18} /> Prestador
        </h3>

        <div className="flex items-center gap-4">
          <img
            src={
              anuncio.prestador_foto ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                anuncio.prestador_nome || 'P'
              )}&background=003580&color=fff&size=80`
            }
            alt={anuncio.prestador_nome || 'Prestador'}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {anuncio.prestador_nome || 'Prestador não identificado'}
            </p>
            {anuncio.prestador_email && (
              <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
                <Mail size={12} /> {anuncio.prestador_email}
              </p>
            )}
            {anuncio.prestador_phone && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Phone size={12} /> {anuncio.prestador_phone}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BARRA DE AÇÕES */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Ações de análise</h3>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAprovar}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition disabled:opacity-50"
          >
            {actionLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            Aprovar / Publicar
          </button>

          <button
            onClick={() => setShowModalCorrecao(true)}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition disabled:opacity-50"
          >
            <AlertTriangle size={16} /> Pedir correção
          </button>

          {/* ✅ NOVO — Ver PDF enviado pelo prestador */}
          <button
            onClick={handleVerDocumento}
            disabled={actionLoading || !ultimoDocumento}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
              ultimoDocumento
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={
              ultimoDocumento
                ? `Ver ${ultimoDocumento.tipo_documento} enviado`
                : 'Nenhum documento enviado ainda'
            }
          >
            <Eye size={16} /> Ver documento
            {ultimoDocumento && (
              <span className="ml-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setShowModalDocumento(true)}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-blue-300 text-blue-700 hover:bg-blue-50 text-sm font-semibold transition disabled:opacity-50"
          >
            <FileText size={16} /> Solicitar documento
          </button>

          <button
            onClick={() => setShowModalRejeicao(true)}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-50"
          >
            <XCircle size={16} /> Rejeitar
          </button>

          <button
            onClick={handlePausar}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold transition disabled:opacity-50"
          >
            <Pause size={16} /> Pausar
          </button>
        </div>

        {/* Info do documento mais recente */}
        {ultimoDocumento && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3 text-xs text-indigo-900">
            <FileText size={16} className="flex-shrink-0" />
            <div className="flex-1">
              <strong>Documento mais recente:</strong> {ultimoDocumento.tipo_documento}
              {ultimoDocumento.enviado_em && ` • enviado em ${formatarData(ultimoDocumento.enviado_em)}`}
            </div>
          </div>
        )}
      </div>

      {/* MODAL — SOLICITAR DOCUMENTO */}
      {showModalDocumento && (
        <SolicitarDocumentoModal
          anuncioId={anuncio.id}
          anuncioTipo={tipo}
          prestadorId={anuncio.prestador_id || anuncio.user_id}
          onClose={() => setShowModalDocumento(false)}
          onSucesso={() => {
            carregarAnuncio();
            carregarUltimoDocumento();
            setMsg({
              tipo: 'sucesso',
              texto: 'Pedido de documento enviado ao prestador.',
            });
          }}
        />
      )}

      {/* MODAL — PEDIR CORREÇÃO */}
      {showModalCorrecao && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2 text-orange-600">Pedir correção</h3>
            <p className="text-sm text-gray-500 mb-4">
              Explica o que precisa ser corrigido. O prestador será notificado.
            </p>
            <textarea
              value={motivoTexto}
              onChange={(e) => setMotivoTexto(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Ex: A descrição está incompleta. Falta indicar o número de quartos."
              className="w-full border border-gray-200 rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm resize-none"
              autoFocus
            />
            <p className="text-xs text-gray-400 mb-4">{motivoTexto.length}/500</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModalCorrecao(false);
                  setMotivoTexto('');
                }}
                className="flex-1 bg-gray-200 py-2.5 rounded-xl hover:bg-gray-300 transition text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handlePedirCorrecao}
                disabled={!motivoTexto.trim() || actionLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl transition text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <AlertTriangle size={16} />
                )}
                Enviar pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — REJEITAR */}
      {showModalRejeicao && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2 text-red-600">Rejeitar anúncio</h3>
            <p className="text-sm text-gray-500 mb-4">
              Esta ação é definitiva para este anúncio. Explica o motivo.
            </p>
            <textarea
              value={motivoTexto}
              onChange={(e) => setMotivoTexto(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Ex: O anúncio viola as políticas da plataforma."
              className="w-full border border-gray-200 rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm resize-none"
              autoFocus
            />
            <p className="text-xs text-gray-400 mb-4">{motivoTexto.length}/500</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModalRejeicao(false);
                  setMotivoTexto('');
                }}
                className="flex-1 bg-gray-200 py-2.5 rounded-xl hover:bg-gray-300 transition text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejeitar}
                disabled={!motivoTexto.trim() || actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl transition text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                Confirmar rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}