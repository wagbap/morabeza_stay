import React, { useState, useEffect } from 'react';
import { 
  MailCheck, CheckCircle, XCircle, Clock, Search, 
  Loader2, User, Mail, Phone, Calendar, Eye, 
  Trash2, Check, X, AlertCircle, RefreshCw, Filter
} from 'lucide-react';

const Verificacoes = () => {
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

  // Carregar verificações
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

  useEffect(() => {
    carregarVerificacoes();
  }, [filterStatus, search]);

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

  // Formatar data
  const formatarData = (data) => {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Status badge
  const StatusBadge = ({ usuario }) => {
    if (usuario.email_verificado === 1) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
          <CheckCircle size={12} /> Verificado
        </span>
      );
    }
    // Considerar como pendente se criado há menos de 7 dias
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

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580]">Verificações de Email</h1>
          <p className="text-gray-600 mt-1">Gestão de verificações de email dos utilizadores.</p>
        </div>
        <button 
          onClick={carregarVerificacoes} 
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      {/* Estatísticas */}
      {stats && (
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

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
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
      </div>

      {/* Tabela de Utilizadores */}
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

      {/* Modal de Detalhes */}
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

      {/* Modal de Rejeição */}
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
    </div>
  );
};

export default Verificacoes;