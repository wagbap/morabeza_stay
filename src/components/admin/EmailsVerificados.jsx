import React, { useState, useEffect } from 'react';
import { 
  MailCheck, CheckCircle, XCircle, Clock, Search, 
  Loader2, User, Mail, Phone, Calendar, Eye, 
  FileText, Shield, Users, RefreshCw,
  Check, X, AlertCircle, Building, Car, Compass,
  Download, Filter
} from 'lucide-react';

const Verificacoes = () => {
  const [stats, setStats] = useState(null);
  const [emailsVerificados, setEmailsVerificados] = useState([]);
  const [documentosVerificados, setDocumentosVerificados] = useState([]);
  const [loading, setLoading] = useState({ emails: true, documentos: true });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('emails');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Carregar dashboard
  const carregarDashboard = async () => {
    try {
      const response = await fetch('/api/admin/verificacoes_email.php?action=dashboard');
      const data = await response.json();
      if (data.status === 'success') {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  // Carregar emails já verificados
  const carregarEmailsVerificados = async () => {
    setLoading(prev => ({ ...prev, emails: true }));
    try {
      const url = `/api/admin/verificacoes_email.php?action=listar_emails_verificados&search=${encodeURIComponent(search)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'success') {
        setEmailsVerificados(data.data);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
    setLoading(prev => ({ ...prev, emails: false }));
  };

  // Carregar documentos já verificados (aprovados)
  const carregarDocumentosVerificados = async () => {
    setLoading(prev => ({ ...prev, documentos: true }));
    try {
      const url = `/api/admin/verificacoes_email.php?action=listar_documentos_verificados&search=${encodeURIComponent(search)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'success') {
        setDocumentosVerificados(data.data);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
    setLoading(prev => ({ ...prev, documentos: false }));
  };

  useEffect(() => {
    carregarDashboard();
    carregarEmailsVerificados();
    carregarDocumentosVerificados();
  }, []);

  useEffect(() => {
    if (activeTab === 'emails') {
      carregarEmailsVerificados();
    } else {
      carregarDocumentosVerificados();
    }
  }, [search, activeTab]);

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

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580]">Verificações Realizadas</h1>
          <p className="text-gray-600 mt-1">
            Utilizadores com email verificado e documentos aprovados.
          </p>
        </div>
        <button 
          onClick={() => { carregarDashboard(); carregarEmailsVerificados(); carregarDocumentosVerificados(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white text-center">
            <MailCheck className="mx-auto text-green-500 mb-1" size={24} />
            <p className="text-2xl font-bold text-gray-800">{stats.email_verificados}</p>
            <p className="text-xs text-gray-500">Emails Verificados</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white text-center">
            <FileText className="mx-auto text-blue-500 mb-1" size={24} />
            <p className="text-2xl font-bold text-gray-800">{stats.documentos_aprovados || stats.documentos_verificados}</p>
            <p className="text-xs text-gray-500">Documentos Aprovados</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white text-center">
            <Users className="mx-auto text-purple-500 mb-1" size={24} />
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Utilizadores</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white text-center">
            <Clock className="mx-auto text-yellow-500 mb-1" size={24} />
            <p className="text-2xl font-bold text-gray-800">{stats.documentos_pendentes || 0}</p>
            <p className="text-xs text-gray-500">Pendentes</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('emails')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'emails'
              ? 'border-b-2 border-[#003580] text-[#003580]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Mail size={16} />
          Emails Verificados ({emailsVerificados.length})
        </button>
        <button
          onClick={() => setActiveTab('documentos')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'documentos'
              ? 'border-b-2 border-[#003580] text-[#003580]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={16} />
          Documentos Aprovados ({documentosVerificados.length})
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

      {/* TAB 1: Emails Verificados */}
      {activeTab === 'emails' && (
        loading.emails ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-[#003580]" size={32} />
            <p className="mt-2 text-gray-500">A carregar emails verificados...</p>
          </div>
        ) : emailsVerificados.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <MailCheck size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhum email verificado encontrado</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Utilizador</th>
                    <th className="px-6 py-4">Contacto</th>
                    <th className="px-6 py-4">Verificado em</th>
                    <th className="px-6 py-4">Documentos Aprovados</th>
                    <th className="px-6 py-4">Funções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {emailsVerificados.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=003580&color=fff`} 
                            alt={user.nome}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{user.nome}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <Mail size={10} /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.phone || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {formatarData(user.email_verificado_em)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {user.documentos_aprovados || 0} documento(s)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.roles_aprovados ? (
                          <div className="flex flex-wrap gap-1">
                            {user.roles_aprovados.split(', ').map((role, idx) => {
                              const [name] = role.split(':');
                              return (
                                <span key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                  {getRoleIcon(name)} {getRoleName(name)}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Nenhuma</span>
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

      {/* TAB 2: Documentos Aprovados */}
      {activeTab === 'documentos' && (
        loading.documentos ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-[#003580]" size={32} />
            <p className="mt-2 text-gray-500">A carregar documentos aprovados...</p>
          </div>
        ) : documentosVerificados.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhum documento aprovado encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {documentosVerificados.map((doc) => (
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
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                        <CheckCircle size={10} /> Aprovado
                      </span>
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
                          <FileText size={14} /> Ver documento aprovado
                        </a>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { setSelectedDoc(doc); setShowModal(true); }}
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

      {/* Modal de Detalhes do Documento */}
      {showModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#003580]">Detalhes do Documento</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
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
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                      <CheckCircle size={10} /> Aprovado
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">Data da Solicitação</p>
                  <p className="font-medium">{formatarData(selectedDoc.data_solicitacao)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">Data da Aprovação</p>
                  <p className="font-medium text-green-600">{formatarData(selectedDoc.data_aprovacao)}</p>
                </div>
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

              <div className="flex gap-3 pt-4 border-t">
                <button 
                  onClick={() => setShowModal(false)}
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