import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Flag, CheckCircle, XCircle, Eye, 
  Loader2, RefreshCw, Search, Filter, Clock, User, 
  Home, Car, Compass, Trash2, Check, X, MessageCircle
} from 'lucide-react';

const Denuncias = () => {
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [selectedDenuncia, setSelectedDenuncia] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    pendentes: 0,
    analisadas: 0,
    rejeitadas: 0,
    total: 0
  });

  const carregarDenuncias = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/get_denuncias.php');
      const data = await response.json();
      if (data.status === 'success') {
        setDenuncias(data.data);
        calcularStats(data.data);
      }
    } catch (err) {
      console.error("Erro ao carregar denúncias:", err);
    }
    setLoading(false);
  };

  const calcularStats = (denunciasList) => {
    const pendentes = denunciasList.filter(d => d.status === 'pendente').length;
    const analisadas = denunciasList.filter(d => d.status === 'analisada').length;
    const rejeitadas = denunciasList.filter(d => d.status === 'rejeitada').length;
    
    setStats({
      pendentes,
      analisadas,
      rejeitadas,
      total: denunciasList.length
    });
  };

  const atualizarStatus = async (id, novoStatus) => {
    if (!window.confirm(`Tem a certeza de que deseja marcar esta denúncia como ${novoStatus === 'analisada' ? 'Aceite/Resolvida' : 'Rejeitada'}?`)) return;

    try {
      const response = await fetch('/api/admin/atualizar_denuncia.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: novoStatus })
      });
      const data = await response.json();
      if (data.success) {
        carregarDenuncias();
        setShowModal(false);
      } else {
        alert("Erro: " + data.message);
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  useEffect(() => { carregarDenuncias(); }, []);

  const formatarData = (data) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'alojamento': return <Home size={14} className="text-blue-500" />;
      case 'carro': return <Car size={14} className="text-green-500" />;
      case 'experiencia': return <Compass size={14} className="text-purple-500" />;
      case 'comentario': return <MessageCircle size={14} className="text-orange-500" />;
      default: return <Flag size={14} className="text-gray-500" />;
    }
  };

  const getTipoLabel = (tipo) => {
    switch(tipo) {
      case 'alojamento': return 'Alojamento';
      case 'carro': return 'Viatura';
      case 'experiencia': return 'Experiência';
      case 'comentario': return 'Comentário';
      default: return tipo;
    }
  };

  const renderBadgeStatus = (status) => {
    switch(status) {
      case 'pendente':
        return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> Pendente</span>;
      case 'analisada':
        return <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Analisada</span>;
      case 'rejeitada':
        return <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12} /> Rejeitada</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{status}</span>;
    }
  };

  // Filtragem
  const denunciasFiltradas = denuncias.filter(d => {
    const termo = pesquisa.toLowerCase();
    const buscaMatch = 
      (d.id && d.id.toString().includes(termo)) ||
      (d.denunciante_nome && d.denunciante_nome.toLowerCase().includes(termo)) ||
      (d.motivo && d.motivo.toLowerCase().includes(termo)) ||
      (d.item_titulo && d.item_titulo.toLowerCase().includes(termo));

    const statusMatch = filtroStatus === 'todos' || d.status === filtroStatus;
    const tipoMatch = filtroTipo === 'todos' || d.tipo_conteudo === filtroTipo;

    return buscaMatch && statusMatch && tipoMatch;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580]">Denúncias</h1>
          <p className="text-gray-600 mt-1">Moderação de conteúdo denunciado pelos utilizadores.</p>
        </div>
        <button onClick={carregarDenuncias} className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-xl border border-gray-200 transition shadow-sm">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Atualizar
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-white p-5 rounded-xl border border-yellow-100">
          <AlertTriangle className="text-yellow-500 mb-2" size={24} />
          <p className="text-2xl font-bold">{stats.pendentes}</p>
          <p className="text-xs text-gray-500">Denúncias Pendentes</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border border-green-100">
          <CheckCircle className="text-green-500 mb-2" size={24} />
          <p className="text-2xl font-bold">{stats.analisadas}</p>
          <p className="text-xs text-gray-500">Analisadas</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-white p-5 rounded-xl border border-red-100">
          <XCircle className="text-red-500 mb-2" size={24} />
          <p className="text-2xl font-bold">{stats.rejeitadas}</p>
          <p className="text-xs text-gray-500">Rejeitadas</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100">
          <Flag className="text-blue-500 mb-2" size={24} />
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-gray-500">Total de Denúncias</p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por ID, denunciante ou motivo..." 
            value={pesquisa} 
            onChange={(e) => setPesquisa(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 focus:outline-none text-sm" 
          />
        </div>
        <div>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none">
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendentes</option>
            <option value="analisada">Analisadas</option>
            <option value="rejeitada">Rejeitadas</option>
          </select>
        </div>
        <div>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none">
            <option value="todos">Todos os Tipos</option>
            <option value="alojamento">Alojamentos</option>
            <option value="carro">Viaturas</option>
            <option value="experiencia">Experiências</option>
            <option value="comentario">Comentários</option>
          </select>
        </div>
      </div>

      {/* Tabela de Denúncias */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 flex flex-col justify-center items-center gap-2 text-gray-500 text-sm">
            <Loader2 className="animate-spin text-[#003580]" size={32} />
            <span>A carregar denúncias...</span>
          </div>
        ) : denunciasFiltradas.length === 0 ? (
          <div className="py-24 flex flex-col justify-center items-center gap-3 text-gray-400">
            <Flag size={48} className="text-gray-300" />
            <p className="text-sm">Nenhuma denúncia encontrada com os filtros atuais.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Item Denunciado</th>
                  <th className="px-6 py-4">Denunciante</th>
                  <th className="px-6 py-4">Motivo</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white/40">
                {denunciasFiltradas.map((denuncia) => (
                  <tr key={denuncia.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-gray-900">
                      #{denuncia.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {getTipoIcon(denuncia.tipo_conteudo)}
                        <span className="text-xs font-medium">{getTipoLabel(denuncia.tipo_conteudo)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-gray-900">{denuncia.item_titulo || 'N/A'}</span>
                        <br />
                        <span className="text-[10px] text-gray-400">ID: {denuncia.conteudo_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-medium text-gray-800">{denuncia.denunciante_nome || 'N/A'}</span>
                        <br />
                        <span className="text-[10px] text-gray-400">{denuncia.denunciante_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-gray-700 max-w-[200px] truncate" title={denuncia.motivo}>
                        {denuncia.motivo}
                      </p>
                      {denuncia.descricao && (
                        <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] truncate" title={denuncia.descricao}>
                          {denuncia.descricao.substring(0, 50)}...
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {formatarData(denuncia.criada_em)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderBadgeStatus(denuncia.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedDenuncia(denuncia);
                            setShowModal(true);
                          }}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition" 
                          title="Ver Detalhes"
                        >
                          <Eye size={14} />
                        </button>
                        {denuncia.status === 'pendente' && (
                          <>
                            <button 
                              onClick={() => atualizarStatus(denuncia.id, 'analisada')}
                              className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg border border-green-200 transition" 
                              title="Aceitar / Resolver"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={() => atualizarStatus(denuncia.id, 'rejeitada')}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-200 transition" 
                              title="Rejeitar Denúncia"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Denúncia */}
      {showModal && selectedDenuncia && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                <h2 className="text-xl font-bold text-[#003580]">Detalhes da Denúncia #{selectedDenuncia.id}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status e Data */}
              <div className="flex justify-between items-center">
                {renderBadgeStatus(selectedDenuncia.status)}
                <span className="text-xs text-gray-400">{formatarData(selectedDenuncia.criada_em)}</span>
              </div>

              {/* Conteúdo Denunciado */}
              <div className="border rounded-xl p-4 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  {getTipoIcon(selectedDenuncia.tipo_conteudo)}
                  Conteúdo Denunciado - {getTipoLabel(selectedDenuncia.tipo_conteudo)}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">ID do Item:</span>
                    <span className="text-sm font-mono font-bold">#{selectedDenuncia.conteudo_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Título:</span>
                    <span className="text-sm font-medium text-gray-800">{selectedDenuncia.item_titulo || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Denunciante */}
              <div className="border rounded-xl p-4 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User size={16} />
                  Denunciante
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Nome:</span>
                    <span className="text-sm font-medium">{selectedDenuncia.denunciante_nome || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Email:</span>
                    <span className="text-sm font-medium">{selectedDenuncia.denunciante_email}</span>
                  </div>
                </div>
              </div>

              {/* Motivo e Descrição */}
              <div className="border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Motivo da Denúncia</h3>
                <p className="text-sm font-medium text-gray-800 mb-3">{selectedDenuncia.motivo}</p>
                {selectedDenuncia.descricao && (
                  <>
                    <div className="border-t pt-3 mt-2">
                      <h4 className="text-xs font-semibold text-gray-500 mb-2">Descrição Detalhada:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedDenuncia.descricao}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Ações */}
              {selectedDenuncia.status === 'pendente' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button 
                    onClick={() => atualizarStatus(selectedDenuncia.id, 'analisada')}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} /> Aceitar / Resolver
                  </button>
                  <button 
                    onClick={() => atualizarStatus(selectedDenuncia.id, 'rejeitada')}
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} /> Rejeitar Denúncia
                  </button>
                </div>
              )}

              <button 
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-300 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Denuncias;