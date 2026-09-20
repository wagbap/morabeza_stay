// components/admin/HistoricoDocumentos.jsx
import React, { useState, useEffect } from 'react';
import {
  FileText, CheckCircle, XCircle, Clock, Search,
  Loader2, User, Eye, Download,
  Check, X, RefreshCw, AlertTriangle, Send,
  Building2, Home, Car, Compass, Calendar,
  History, TrendingUp, Filter,
} from 'lucide-react';

const API_BASE = 'https://welovepalop.com/api';

const HistoricoDocumentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos'); // todos | pedido | user_role
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [agruparPorData, setAgruparPorData] = useState(true);

  // ---------------------------------------------------------
  // CARREGAR HISTÓRICO COMPLETO
  // ---------------------------------------------------------
  const carregarHistorico = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE}/admin/historico_documentos.php?action=listar&estado=${filterEstado}&tipo=${filterTipo}&search=${encodeURIComponent(search)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'success') {
        setDocumentos(data.data || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarHistorico();
  }, [filterEstado, filterTipo, search]);

  // ---------------------------------------------------------
  // APROVAR
  // ---------------------------------------------------------
  const aprovarDocumento = async (id, origem) => {
    if (!window.confirm('Confirmar aprovação deste documento?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/historico_documentos.php?action=aprovar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, origem }), // origem: 'pedido' | 'user_role'
      });
      const data = await response.json();
      if (data.status === 'success') {
        carregarHistorico();
        setShowModal(false);
        setSelectedDoc(null);
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro de conexão');
    }
    setActionLoading(false);
  };

  // ---------------------------------------------------------
  // REJEITAR
  // ---------------------------------------------------------
  const rejeitarDocumento = async (id, origem) => {
    if (!motivoRejeicao.trim()) {
      alert('Por favor, insira um motivo para a rejeição');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/historico_documentos.php?action=rejeitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, origem, motivo_rejeicao: motivoRejeicao }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        carregarHistorico();
        setShowRejectModal(false);
        setShowModal(false);
        setSelectedDoc(null);
        setMotivoRejeicao('');
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro de conexão');
    }
    setActionLoading(false);
  };

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------
  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatarDataCurta = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  const formatarMesAno = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-PT', {
      month: 'long', year: 'numeric',
    });
  };

  const iconAnuncioTipo = (tipo) => {
    switch ((tipo || '').toLowerCase()) {
      case 'alojamento': return <Home size={14} />;
      case 'carro': return <Car size={14} />;
      case 'experiencia': return <Compass size={14} />;
      default: return <Building2 size={14} />;
    }
  };

  const nomeTipoDocumento = (tipo) => {
    const map = {
      bi_passaporte: 'BI / Passaporte',
      carta_conducao: 'Carta de Condução',
      comprovativo_residencia: 'Comprovativo de Residência',
      nif: 'NIF',
      registo_comercial: 'Registo Comercial',
      licenca_actividade: 'Licença de Actividade',
      seguro: 'Seguro',
      anfitrion: 'Documento de Anfitrião',
      guia_experiencias: 'Documento de Guia',
      proprietario_veiculos: 'Documento de Proprietário',
      outro: 'Outro',
    };
    return map[tipo] || tipo || '-';
  };

  const EstadoBadge = ({ estado }) => {
    const e = (estado || '').toLowerCase();
    if (e === 'aprovado' || e === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
          <CheckCircle size={12} /> Aprovado
        </span>
      );
    }
    if (e === 'pendente' || e === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
          <Clock size={12} /> Pendente
        </span>
      );
    }
    if (e === 'enviado') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
          <Send size={12} /> Enviado
        </span>
      );
    }
    if (e === 'rejeitado' || e === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
          <XCircle size={12} /> Rejeitado
        </span>
      );
    }
    if (e === 'expirado') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
          <AlertTriangle size={12} /> Expirado
        </span>
      );
    }
    return <span className="text-xs text-gray-500">{estado || '-'}</span>;
  };

  // Agrupar por mês/ano
  const agruparDocumentos = () => {
    if (!agruparPorData) return { 'Todos': documentos };

    return documentos.reduce((acc, d) => {
      const chave = formatarMesAno(d.data_envio || d.criado_em);
      if (!acc[chave]) acc[chave] = [];
      acc[chave].push(d);
      return acc;
    }, {});
  };

  const documentosAgrupados = agruparDocumentos();

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580] flex items-center gap-3">
            <History size={32} />
            Histórico de Documentos
          </h1>
          <p className="text-gray-600 mt-1">
            Registo completo de todos os documentos enviados pelos prestadores.
          </p>
        </div>
        <button
          onClick={carregarHistorico}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white text-center">
            <FileText className="mx-auto text-blue-500 mb-2" size={32} />
            <p className="text-2xl font-bold text-gray-800">{stats.total ?? 0}</p>
            <p className="text-sm text-gray-500">Total de Documentos</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white text-center">
            <Clock className="mx-auto text-yellow-500 mb-2" size={32} />
            <p className="text-2xl font-bold text-gray-800">
              {(stats.pendentes ?? 0) + (stats.enviados ?? 0)}
            </p>
            <p className="text-sm text-gray-500">Aguarda Revisão</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white text-center">
            <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-2xl font-bold text-gray-800">{stats.aprovados ?? 0}</p>
            <p className="text-sm text-gray-500">Aprovados</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white text-center">
            <XCircle className="mx-auto text-red-500 mb-2" size={32} />
            <p className="text-2xl font-bold text-gray-800">{stats.rejeitados ?? 0}</p>
            <p className="text-sm text-gray-500">Rejeitados</p>
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white p-4 space-y-4">
        {/* Filtros de estado + tipo */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterEstado('todos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterEstado === 'todos'
                  ? 'bg-[#003580] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterEstado('enviado')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                filterEstado === 'enviado'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Send size={14} /> Enviados
            </button>
            <button
              onClick={() => setFilterEstado('aprovado')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                filterEstado === 'aprovado'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CheckCircle size={14} /> Aprovados
            </button>
            <button
              onClick={() => setFilterEstado('rejeitado')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                filterEstado === 'rejeitado'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <XCircle size={14} /> Rejeitados
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
            >
              <option value="todos">Todas as origens</option>
              <option value="pedido">Pedidos de documentos</option>
              <option value="user_role">Verificação de funções</option>
            </select>

            <button
              onClick={() => setAgruparPorData(v => !v)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition ${
                agruparPorData
                  ? 'bg-[#003580]/10 border-[#003580]/30 text-[#003580]'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              title="Agrupar cronologicamente"
            >
              <TrendingUp size={14} /> Agrupar por mês
            </button>
          </div>

          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Procurar por prestador, anúncio ou tipo de documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Lista / Timeline */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="animate-spin text-[#003580]" size={24} />
          <span className="text-gray-600">A carregar histórico de documentos...</span>
        </div>
      ) : documentos.length === 0 ? (
        <div className="py-20 text-center text-gray-500 bg-white/70 rounded-2xl border border-white">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Nenhum documento no histórico</p>
          <p className="text-xs text-gray-400 mt-1">
            Ajusta os filtros ou aguarda que os prestadores enviem documentos.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(documentosAgrupados).map(([mesAno, docs]) => (
            <div key={mesAno}>
              {agruparPorData && (
                <div className="flex items-center gap-3 mb-4">
                  <Calendar size={18} className="text-[#003580]" />
                  <h2 className="text-lg font-bold text-[#003580] capitalize">{mesAno}</h2>
                  <span className="text-xs bg-[#003580]/10 text-[#003580] px-2 py-0.5 rounded-full font-semibold">
                    {docs.length} {docs.length === 1 ? 'documento' : 'documentos'}
                  </span>
                  <div className="flex-1 h-px bg-gray-200 ml-2"></div>
                </div>
              )}

              <div className="space-y-3">
                {docs.map((d) => (
                  <div
                    key={`${d.origem}-${d.id}`}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4 flex-wrap">
                      {/* Ícone origem */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#f0f4f8] flex items-center justify-center">
                        {iconAnuncioTipo(d.anuncio_tipo) || <FileText size={20} className="text-[#003580]" />}
                      </div>

                      {/* Info principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <User size={14} className="text-gray-400" />
                          <span className="font-bold text-gray-900">
                            {d.prestador_nome || `#${d.prestador_id}`}
                          </span>
                          {d.prestador_email && (
                            <span className="text-xs text-gray-400">{d.prestador_email}</span>
                          )}
                          <EstadoBadge estado={d.estado} />
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {d.origem === 'pedido' ? '📄 Pedido' : '🎭 Verificação'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                          <FileText size={14} className="text-gray-400" />
                          <strong>{nomeTipoDocumento(d.tipo_documento)}</strong>
                        </div>

                        {d.anuncio_titulo && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            {iconAnuncioTipo(d.anuncio_tipo)}
                            <span>Relacionado com: </span>
                            <strong>{d.anuncio_titulo}</strong>
                            <span className="text-gray-400 capitalize">({d.anuncio_tipo})</span>
                          </div>
                        )}

                        {/* Datas */}
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                          <span>
                            Pedido: <strong>{formatarDataCurta(d.criado_em)}</strong>
                          </span>
                          {d.data_envio && (
                            <span className="text-blue-600">
                              Enviado: <strong>{formatarDataCurta(d.data_envio)}</strong>
                            </span>
                          )}
                          {d.aprovado_em && (
                            <span className="text-green-600">
                              Aprovado: <strong>{formatarDataCurta(d.aprovado_em)}</strong>
                            </span>
                          )}
                          {d.prazo && (
                            <span>
                              Prazo: <strong>{formatarDataCurta(d.prazo)}</strong>
                            </span>
                          )}
                        </div>

                        {/* Motivo de rejeição se houver */}
                        {d.motivo_rejeicao && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs">
                            <span className="text-red-700 font-semibold">Rejeitado: </span>
                            <span className="text-red-700">{d.motivo_rejeicao}</span>
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => { setSelectedDoc(d); setShowModal(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Ver detalhes"
                        >
                          <Eye size={18} />
                        </button>
                        {d.documento_url && (
                          <a
                            href={d.documento_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="Abrir documento"
                          >
                            <Download size={18} />
                          </a>
                        )}
                        {(d.estado === 'enviado' || d.estado === 'pendente') && d.documento_url && (
                          <>
                            <button
                              onClick={() => aprovarDocumento(d.id, d.origem)}
                              disabled={actionLoading}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Aprovar"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => { setSelectedDoc(d); setShowRejectModal(true); }}
                              disabled={actionLoading}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Rejeitar"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      {showModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-800">Detalhes do Documento</h3>
                <EstadoBadge estado={selectedDoc.estado} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500 text-sm">Prestador:</span>
                  <span className="font-medium text-sm">
                    {selectedDoc.prestador_nome || `#${selectedDoc.prestador_id}`}
                  </span>
                </div>
                {selectedDoc.prestador_email && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500 text-sm">Email:</span>
                    <span className="font-medium text-sm">{selectedDoc.prestador_email}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500 text-sm">Origem:</span>
                  <span className="font-medium text-sm">
                    {selectedDoc.origem === 'pedido' ? 'Pedido de documento' : 'Verificação de função'}
                  </span>
                </div>
                {selectedDoc.anuncio_titulo && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500 text-sm">Anúncio:</span>
                    <span className="font-medium text-sm">
                      {selectedDoc.anuncio_titulo}
                      <span className="text-gray-400 ml-1 capitalize">({selectedDoc.anuncio_tipo})</span>
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500 text-sm">Documento:</span>
                  <span className="font-medium text-sm">
                    {nomeTipoDocumento(selectedDoc.tipo_documento)}
                  </span>
                </div>
                {selectedDoc.prazo && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500 text-sm">Prazo:</span>
                    <span className="font-medium text-sm">{formatarDataCurta(selectedDoc.prazo)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500 text-sm">Criado em:</span>
                  <span className="font-medium text-sm">{formatarData(selectedDoc.criado_em)}</span>
                </div>
                {selectedDoc.data_envio && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500 text-sm">Enviado em:</span>
                    <span className="font-medium text-sm">{formatarData(selectedDoc.data_envio)}</span>
                  </div>
                )}
                {selectedDoc.aprovado_em && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500 text-sm">Aprovado em:</span>
                    <span className="font-medium text-sm">{formatarData(selectedDoc.aprovado_em)}</span>
                  </div>
                )}
              </div>

              {selectedDoc.motivo && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Motivo do pedido:</p>
                  <p className="text-sm bg-gray-50 rounded-lg p-3 text-gray-700">
                    {selectedDoc.motivo}
                  </p>
                </div>
              )}

              {selectedDoc.motivo_rejeicao && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-semibold text-red-700 mb-1">Motivo da rejeição:</p>
                  <p className="text-sm text-red-700">{selectedDoc.motivo_rejeicao}</p>
                </div>
              )}

              {selectedDoc.documento_url && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Documento enviado:</p>
                  <a
                    href={selectedDoc.documento_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 rounded-lg px-3 py-2"
                  >
                    <FileText size={16} />
                    Abrir documento
                  </a>
                </div>
              )}

              <div className="flex gap-3">
                {(selectedDoc.estado === 'enviado' || selectedDoc.estado === 'pendente') && selectedDoc.documento_url && (
                  <>
                    <button
                      onClick={() => aprovarDocumento(selectedDoc.id, selectedDoc.origem)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl"
                    >
                      {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                      Aprovar
                    </button>
                    <button
                      onClick={() => { setShowModal(false); setShowRejectModal(true); }}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl"
                    >
                      <X size={18} /> Rejeitar
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rejeição */}
      {showRejectModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Rejeitar Documento</h3>
              <p className="text-sm text-gray-500 mb-4">
                Motivo da rejeição do documento{' '}
                <strong>{nomeTipoDocumento(selectedDoc.tipo_documento)}</strong>:
              </p>
              <textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                rows={4}
                placeholder="Ex: Documento ilegível, fora da validade, dados não coincidem..."
                className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm mb-4 resize-none"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => rejeitarDocumento(selectedDoc.id, selectedDoc.origem)}
                  disabled={!motivoRejeicao.trim() || actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirmar Rejeição'}
                </button>
                <button
                  onClick={() => { setShowRejectModal(false); setMotivoRejeicao(''); setSelectedDoc(null); }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricoDocumentos;