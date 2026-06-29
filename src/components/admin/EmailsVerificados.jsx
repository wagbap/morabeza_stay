import React, { useState, useEffect } from 'react';
import { 
  MailCheck, CheckCircle, XCircle, Clock, Search, 
  Loader2, User, Mail, Phone, Calendar, Eye, 
  Trash2, Check, X, AlertCircle, RefreshCw, Filter,
  FileText, Shield, Users, Building, Car, Compass,
  Download, AlertTriangle
} from 'lucide-react';

const Verificacoes = () => {
  // Estado para Emails Verificados (original)
  const [usuarios, setUsuarios] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Estado para Documentos Aprovados
  const [documentosAprovados, setDocumentosAprovados] = useState([]);
  const [loadingDocsAprovados, setLoadingDocsAprovados] = useState(false);

  // Estado para Documentos Não Aprovados
  const [documentosNaoAprovados, setDocumentosNaoAprovados] = useState([]);
  const [loadingDocsNaoAprovados, setLoadingDocsNaoAprovados] = useState(false);

  // Estado para o tab ativo
  const [activeTab, setActiveTab] = useState('emails');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);

  // Carregar verificações de email
  const carregarVerificacoes = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/verificacoes_email.php?action=listar&status=${filterStatus}&search=${encodeURIComponent(search)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'success') {
        setUsuarios(data.data);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
    setLoading(false);
  };

  // Carregar documentos aprovados
  const carregarDocumentosAprovados = async () => {
    setLoadingDocsAprovados(true);
    try {
      const url = `/api/admin/verificacoes_email.php?action=listar_documentos_aprovados&search=${encodeURIComponent(search)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'success') {
        setDocumentosAprovados(data.data);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
    setLoadingDocsAprovados(false);
  };

  // Carregar documentos não aprovados
  const carregarDocumentosNaoAprovados = async () => {
    setLoadingDocsNaoAprovados(true);
    try {
      const url = `/api/admin/verificacoes_email.php?action=listar_documentos_nao_aprovados&search=${encodeURIComponent(search)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'success') {
        setDocumentosNaoAprovados(data.data);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
    setLoadingDocsNaoAprovados(false);
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    carregarVerificacoes();
    carregarDocumentosAprovados();
    carregarDocumentosNaoAprovados();
  }, []);

  // Efeito para recarregar quando search ou activeTab mudar
  useEffect(() => {
    if (activeTab === 'emails') {
      carregarVerificacoes();
    } else if (activeTab === 'documentos-aprovados') {
      carregarDocumentosAprovados();
    } else if (activeTab === 'documentos-nao-aprovados') {
      carregarDocumentosNaoAprovados();
    }
  }, [search, activeTab]);

  // Verificar email
  const verificarEmail = async (id) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/verificacoes_email.php?action=verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.status === 'success') {
        carregarVerificacoes();
        setShowModal(false);
        setSelectedUser(null);
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro de conexão');
    }
    setActionLoading(false);
  };

  // Rejeitar verificação
  const rejeitarVerificacao = async (id) => {
    if (!motivoRejeicao.trim()) {
      alert('Por favor, insira um motivo para a rejeição');
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/verificacoes_email.php?action=rejeitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, motivo: motivoRejeicao })
      });
      const data = await response.json();
      if (data.status === 'success') {
        carregarVerificacoes();
        setShowRejectModal(false);
        setShowModal(false);
        setSelectedUser(null);
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

  // Remover utilizador
  const removerUtilizador = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este utilizador? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/verificacoes_email.php?action=remover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.status === 'success') {
        carregarVerificacoes();
        setShowModal(false);
        setSelectedUser(null);
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro de conexão');
    }
    setActionLoading(false);
  };

  // Aprovar documento
  const aprovarDocumento = async (documentoId) => {
    if (!window.confirm('Tem certeza que deseja aprovar este documento?')) {
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/verificacoes_email.php?action=aprovar_documento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documento_id: documentoId })
      });
      const data = await response.json();
      if (data.status === 'success') {
        carregarDocumentosNaoAprovados();
        carregarDocumentosAprovados();
        setShowDocModal(false);
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

  // Rejeitar documento
  const rejeitarDocumento = async (documentoId) => {
    const motivo = prompt('Digite o motivo da rejeição:');
    if (motivo === null) return;
    if (!motivo.trim()) {
      alert('Por favor, insira um motivo para a rejeição');
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/verificacoes_email.php?action=rejeitar_documento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documento_id: documentoId, motivo: motivo })
      });
      const data = await response.json();
      if (data.status === 'success') {
        carregarDocumentosNaoAprovados();
        setShowDocModal(false);
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

  // Formatar data
  const formatarData = (data) => {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Nome do role em português
  const getRoleName = (roleName) => {
    const nomes = {
      'anfitrion': 'Anfitrião',
      'guia_experiencias': 'Guia de Experiências',
      'proprietario_veiculos': 'Proprietário de Veículos',
      'admin': 'Administrador',
      'hospede': 'Hóspede',
      'parceiro_comercial': 'Parceiro Comercial'
    };
    return nomes[roleName] || roleName;
  };

  // Ícone do role
  const getRoleIcon = (roleName) => {
    switch(roleName) {
      case 'anfitrion': return <Building size={14} />;
      case 'guia_experiencias': return <Compass size={14} />;
      case 'proprietario_veiculos': return <Car size={14} />;
      default: return <User size={14} />;
    }
  };

  // Status badge para email
  const StatusBadge = ({ usuario }) => {
    if (usuario.email_verificado === 1) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
          <CheckCircle size={12} /> Verificado
        </span>
      );
    }
    const criadoEm = new Date(usuario.criado_em);
    const diasDesdeCriacao = (new Date() - criadoEm) / (1000 * 60 * 60 * 24);
    if (diasDesdeCriacao < 7) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-semibold">
          <Clock size={12} /> Pendente
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold">
        <XCircle size={12} /> Rejeitado
      </span>
    );
  };

  // Status badge para documentos
  const StatusDocBadge = ({ status }) => {
    switch(status) {
      case 'aprovado':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
            <CheckCircle size={12} /> Aprovado
          </span>
        );
      case 'pendente':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-semibold">
            <Clock size={12} /> Pendente
          </span>
        );
      case 'rejeitado':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold">
            <XCircle size={12} /> Rejeitado
          </span>
        );
      default:
        return null;
    }
  };

  // Função para recarregar todos os dados
  const recarregarTodos = () => {
    carregarVerificacoes();
    carregarDocumentosAprovados();
    carregarDocumentosNaoAprovados();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580]">Verificações</h1>
          <p className="text-gray-600 mt-1">Gestão de verificações de email e documentos dos utilizadores.</p>
        </div>
        <button 
          onClick={recarregarTodos} 
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      {/* Estatísticas - apenas para emails */}
      {stats && activeTab === 'emails' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white text-center">
            <MailCheck className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-2xl font-bold text-gray-800">{stats.verificados}</p>
            <p className="text-sm text-gray-500">Emails Verificados</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white text-center">
            <Clock className="mx-auto text-yellow-500 mb-2" size={32} />
            <p className="text-2xl font-bold text-gray-800">{stats.pendentes}</p>
            <p className="text-sm text-gray-500">Pendentes</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white text-center">
            <XCircle className="mx-auto text-red-500 mb-2" size={32} />
            <p className="text-2xl font-bold text-gray-800">{stats.rejeitados}</p>
            <p className="text-sm text-gray-500">Rejeitados</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white text-center">
            <Users size={32} className="mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Utilizadores</p>
          </div>
        </div>
      )}

      {/* Estatísticas de Documentos */}
      {(activeTab === 'documentos-aprovados' || activeTab === 'documentos-nao-aprovados') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white text-center">
            <FileText className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-2xl font-bold text-gray-800">{documentosAprovados.length}</p>
            <p className="text-sm text-gray-500">Documentos Aprovados</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white text-center">
            <AlertTriangle className="mx-auto text-yellow-500 mb-2" size={32} />
            <p className="text-2xl font-bold text-gray-800">{documentosNaoAprovados.length}</p>
            <p className="text-sm text-gray-500">Documentos Não Aprovados</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('emails')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'emails'
              ? 'border-b-2 border-[#003580] text-[#003580]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Mail size={16} />
          Emails ({usuarios.length})
        </button>
        <button
          onClick={() => setActiveTab('documentos-aprovados')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'documentos-aprovados'
              ? 'border-b-2 border-[#003580] text-[#003580]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle size={16} />
          Documentos Aprovados ({documentosAprovados.length})
        </button>
        <button
          onClick={() => setActiveTab('documentos-nao-aprovados')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'documentos-nao-aprovados'
              ? 'border-b-2 border-[#003580] text-[#003580]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <AlertTriangle size={16} />
          Documentos Não Aprovados ({documentosNaoAprovados.length})
        </button>
      </div>

      {/* Busca */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Procurar por nome ou email..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003580]/20" 
        />
      </div>

      {/* TAB 1: Emails */}
      {activeTab === 'emails' && (
        <>
          {/* Filtros de Status para Emails */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('todos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === 'todos' 
                  ? 'bg-[#003580] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('verificados')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                filterStatus === 'verificados' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CheckCircle size={14} /> Verificados
            </button>
            <button
              onClick={() => setFilterStatus('pendentes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                filterStatus === 'pendentes' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock size={14} /> Pendentes
            </button>
            <button
              onClick={() => setFilterStatus('rejeitados')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                filterStatus === 'rejeitados' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <XCircle size={14} /> Rejeitados
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center items-center gap-2">
              <Loader2 className="animate-spin text-[#003580]" size={24} />
              <span className="text-gray-600">A carregar verificações...</span>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <MailCheck size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nenhum utilizador encontrado</p>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">Utilizador</th>
                      <th className="px-6 py-4">Contacto</th>
                      <th className="px-6 py-4">Data Registo</th>
                      <th className="px-6 py-4">Verificação</th>
                      <th className="px-6 py-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={usuario.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nome)}&background=003580&color=fff`} 
                              alt={usuario.nome}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{usuario.nome}</div>
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <Mail size={10} /> {usuario.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {usuario.phone ? (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Phone size={14} />
                              <span className="text-sm">{usuario.phone}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Sem telefone</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">{formatarData(usuario.criado_em)}</div>
                          {usuario.email_verificado_em && (
                            <div className="text-xs text-gray-400">Verificado: {formatarData(usuario.email_verificado_em)}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge usuario={usuario} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => { setSelectedUser(usuario); setShowModal(true); }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Ver detalhes"
                            >
                              <Eye size={18} />
                            </button>
                            {usuario.email_verificado !== 1 && (
                              <>
                                <button
                                  onClick={() => verificarEmail(usuario.id)}
                                  disabled={actionLoading}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                                  title="Verificar email"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => { setSelectedUser(usuario); setShowRejectModal(true); }}
                                  disabled={actionLoading}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Rejeitar"
                                >
                                  <X size={18} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => removerUtilizador(usuario.id)}
                              disabled={actionLoading}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                              title="Remover"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: Documentos Aprovados */}
      {activeTab === 'documentos-aprovados' && (
        loadingDocsAprovados ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-[#003580]" size={32} />
            <p className="mt-2 text-gray-500">A carregar documentos aprovados...</p>
          </div>
        ) : documentosAprovados.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhum documento aprovado encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {documentosAprovados.map((doc) => (
              <div key={doc.documento_id} className="bg-white/80 backdrop-blur-md rounded-xl border border-green-100 p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <img 
                    src={doc.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.nome)}&background=003580&color=fff`} 
                    alt={doc.nome}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">{doc.nome}</h3>
                      <StatusDocBadge status="aprovado" />
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Mail size={12} /> {doc.email}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        {getRoleIcon(doc.role_name)} {getRoleName(doc.role_name)}
                      </span>
                      <span className="text-xs text-gray-400">
                        Aprovado: {formatarData(doc.data_aprovacao)}
                      </span>
                    </div>
                    {doc.document_url && (
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <a 
                          href={doc.document_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FileText size={14} /> Ver documento
                        </a>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { setSelectedDoc(doc); setShowDocModal(true); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Ver detalhes"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* TAB 3: Documentos Não Aprovados */}
      {activeTab === 'documentos-nao-aprovados' && (
        loadingDocsNaoAprovados ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-[#003580]" size={32} />
            <p className="mt-2 text-gray-500">A carregar documentos não aprovados...</p>
          </div>
        ) : documentosNaoAprovados.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhum documento pendente encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {documentosNaoAprovados.map((doc) => (
              <div key={doc.documento_id} className="bg-white/80 backdrop-blur-md rounded-xl border border-yellow-100 p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <img 
                    src={doc.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.nome)}&background=003580&color=fff`} 
                    alt={doc.nome}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">{doc.nome}</h3>
                      <StatusDocBadge status={doc.status || 'pendente'} />
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Mail size={12} /> {doc.email}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        {getRoleIcon(doc.role_name)} {getRoleName(doc.role_name)}
                      </span>
                      <span className="text-xs text-gray-400">
                        Solicitado: {formatarData(doc.data_solicitacao)}
                      </span>
                    </div>
                    {doc.motivo_rejeicao && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                        <strong>Motivo da rejeição:</strong> {doc.motivo_rejeicao}
                      </div>
                    )}
                    {doc.document_url && (
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <a 
                          href={doc.document_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FileText size={14} /> Ver documento
                        </a>
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => aprovarDocumento(doc.documento_id)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg transition disabled:opacity-50"
                      >
                        <Check size={16} /> Aprovar
                      </button>
                      <button
                        onClick={() => rejeitarDocumento(doc.documento_id)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 rounded-lg transition disabled:opacity-50"
                      >
                        <X size={16} /> Rejeitar
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedDoc(doc); setShowDocModal(true); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Ver detalhes"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal de Detalhes do Utilizador (Email) */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={selectedUser.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.nome)}&background=003580&color=fff&size=80`} 
                  alt={selectedUser.nome}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{selectedUser.nome}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail size={14} /> {selectedUser.email}
                  </p>
                  {selectedUser.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone size={14} /> {selectedUser.phone}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Data de Registo:</span>
                  <span className="font-medium">{formatarData(selectedUser.criado_em)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Status:</span>
                  <StatusBadge usuario={selectedUser} />
                </div>
                {selectedUser.email_verificado_em && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Verificado em:</span>
                    <span className="font-medium">{formatarData(selectedUser.email_verificado_em)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Tipo de Conta:</span>
                  <span className="font-medium capitalize">{selectedUser.tipo_conta || 'Hóspede'}</span>
                </div>
              </div>

              <div className="flex gap-3">
                {selectedUser.email_verificado !== 1 && (
                  <>
                    <button 
                      onClick={() => verificarEmail(selectedUser.id)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl"
                    >
                      {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                      Verificar
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

      {/* Modal de Rejeição de Email */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Rejeitar Verificação</h3>
              <p className="text-sm text-gray-500 mb-4">
                Motivo da rejeição para <strong>{selectedUser.email}</strong>:
              </p>
              <textarea 
                value={motivoRejeicao} 
                onChange={(e) => setMotivoRejeicao(e.target.value)} 
                rows={4} 
                placeholder="Ex: Email inválido, não respondeu ao email de verificação..."
                className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm mb-4 resize-none" 
                autoFocus
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => rejeitarVerificacao(selectedUser.id)} 
                  disabled={!motivoRejeicao.trim() || actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirmar Rejeição'}
                </button>
                <button 
                  onClick={() => { setShowRejectModal(false); setMotivoRejeicao(''); setSelectedUser(null); }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Documento */}
      {showDocModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#003580]">Detalhes do Documento</h2>
              <button onClick={() => setShowDocModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <img 
                  src={selectedDoc.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoc.nome)}&background=003580&color=fff&size=80`} 
                  alt={selectedDoc.nome}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{selectedDoc.nome}</h3>
                  <p className="text-gray-500">{selectedDoc.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      {getRoleIcon(selectedDoc.role_name)} {getRoleName(selectedDoc.role_name)}
                    </span>
                    <StatusDocBadge status={selectedDoc.status || 'pendente'} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">Data da Solicitação</p>
                  <p className="font-medium">{formatarData(selectedDoc.data_solicitacao)}</p>
                </div>
                {selectedDoc.data_aprovacao && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-500">Data da Aprovação</p>
                    <p className="font-medium text-green-600">{formatarData(selectedDoc.data_aprovacao)}</p>
                  </div>
                )}
                {selectedDoc.motivo_rejeicao && (
                  <div className="col-span-2 bg-red-50 p-3 rounded-lg">
                    <p className="text-gray-500">Motivo da Rejeição</p>
                    <p className="font-medium text-red-600">{selectedDoc.motivo_rejeicao}</p>
                  </div>
                )}
              </div>

              {selectedDoc.document_url && (
                <div className="border rounded-xl p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">Documento anexado:</p>
                  <a 
                    href={selectedDoc.document_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all text-sm"
                  >
                    {selectedDoc.document_url}
                  </a>
                </div>
              )}

              {/* Ações para documentos não aprovados */}
              {activeTab === 'documentos-nao-aprovados' && selectedDoc.status !== 'aprovado' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button 
                    onClick={() => aprovarDocumento(selectedDoc.documento_id)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    Aprovar Documento
                  </button>
                  <button 
                    onClick={() => rejeitarDocumento(selectedDoc.documento_id)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                    Rejeitar
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowDocModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verificacoes;