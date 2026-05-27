// src/components/AlojamentoRegisto/MeusAlojamentos.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Edit, Trash2, Eye, Star, MapPin, Users, DollarSign, 
  Image, Plus, Search, Loader, Bed, Bath, CheckCircle, 
  XCircle, Clock, Calendar, AlertCircle
} from 'lucide-react';

const API_URL = 'https://welovepalop.com';

const MeusAlojamentos = ({ proprietarioId = 1 }) => {
  const navigate = useNavigate();
  const [alojamentos, setAlojamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const buscarAlojamentos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/alojamento/meus_alojamentos.php?proprietario_id=${proprietarioId}`);
      
      if (!response.ok) throw new Error('Erro ao carregar alojamentos');
      
      const data = await response.json();
      
      if (data.success) {
        setAlojamentos(data.data || []);
      } else {
        setError(data.message || 'Erro ao carregar dados');
      }
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarAlojamentos();
  }, [proprietarioId]);

  const handleEditar = (id) => {
    navigate(`/alojamento-registro/editar/${id}`);
  };

  const handleVer = (id) => {
    navigate(`/alojamento-registro/detalhes/${id}`);
  };

  const handleExcluir = async (id, titulo) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${titulo}"?`)) return;
    
    try {
      const response = await fetch(`${API_URL}/api/alojamento/excluir.php?id=${id}`, { 
        method: 'DELETE' 
      });
      const data = await response.json();
      
      if (data.success) {
        setAlojamentos(prev => prev.filter(a => a.id !== id));
        alert('Alojamento excluído com sucesso!');
      } else {
        alert(data.message || 'Erro ao excluir');
      }
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const formatarPreco = (preco) => {
    if (!preco) return '0 CVE';
    return new Intl.NumberFormat('pt-PT').format(preco) + ' CVE';
  };

  const StatusBadge = ({ status }) => {
    const config = {
      aprovado: { label: 'Aprovado', icon: <CheckCircle size={14} />, class: 'bg-green-100 text-green-800' },
      pendente: { label: 'Pendente', icon: <Clock size={14} />, class: 'bg-yellow-100 text-yellow-800' },
      inativo: { label: 'Inativo', icon: <XCircle size={14} />, class: 'bg-red-100 text-red-800' }
    };
    const { label, icon, class: className } = config[status] || config.pendente;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {icon} {label}
      </span>
    );
  };

  const alojamentosFiltrados = alojamentos.filter(a => {
    const matchSearch = (a.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (a.localizacao || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || a.status === filtroStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader className="animate-spin text-[#006ce4]" size={48} />
        <p className="mt-4 text-gray-600">Carregando seus alojamentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold mb-2">Erro ao carregar</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button onClick={buscarAlojamentos} className="px-4 py-2 bg-[#006ce4] text-white rounded-lg">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meus Alojamentos</h1>
              <p className="text-gray-500 text-sm mt-1">Gerencie todos os seus imóveis cadastrados</p>
            </div>
            <button
              onClick={() => navigate('/alojamento-registro/fluxo')}
              className="flex items-center gap-2 px-4 py-2 bg-[#006ce4] text-white rounded-lg hover:bg-[#0053b3] transition-colors"
            >
              <Plus size={18} />
              Novo Alojamento
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{alojamentos.length}</p>
              </div>
              <Home size={32} className="text-[#006ce4] opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {alojamentos.filter(a => a.status === 'aprovado').length}
                </p>
              </div>
              <CheckCircle size={32} className="text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {alojamentos.filter(a => a.status === 'pendente').length}
                </p>
              </div>
              <Clock size={32} className="text-yellow-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inativos</p>
                <p className="text-2xl font-bold text-red-600">
                  {alojamentos.filter(a => a.status === 'inativo').length}
                </p>
              </div>
              <XCircle size={32} className="text-red-500 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título ou localização..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['todos', 'aprovado', 'pendente', 'inativo'].map(status => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroStatus === status
                    ? 'bg-[#006ce4] text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status === 'todos' ? 'Todos' : 
                 status === 'aprovado' ? 'Aprovados' : 
                 status === 'pendente' ? 'Pendentes' : 'Inativos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Alojamentos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {alojamentosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Home size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum alojamento encontrado</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filtroStatus !== 'todos' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece cadastrando seu primeiro alojamento'}
            </p>
            <button
              onClick={() => navigate('/alojamento-registro/fluxo')}
              className="px-4 py-2 bg-[#006ce4] text-white rounded-lg hover:bg-[#0053b3]"
            >
              Cadastrar Alojamento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {alojamentosFiltrados.map(alojamento => (
              <div key={alojamento.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {alojamento.imagem_url ? (
                    <img 
                      src={alojamento.imagem_url} 
                      alt={alojamento.titulo}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Sem+Imagem'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={48} className="text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={alojamento.status} />
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{alojamento.titulo}</h3>
                    <p className="text-lg font-bold text-[#006ce4]">{formatarPreco(alojamento.preco_noite)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPin size={14} />
                    <span>{alojamento.localizacao || alojamento.cidade || 'Localização não definida'}</span>
                  </div>
                  
                  <div className="flex gap-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleVer(alojamento.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Eye size={16} /> Ver
                    </button>
                    <button
                      onClick={() => handleEditar(alojamento.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#006ce4] text-white rounded-lg text-sm font-medium hover:bg-[#0053b3]"
                    >
                      <Edit size={16} /> Editar
                    </button>
                    <button                      onClick={() => handleExcluir(alojamento.id, alojamento.titulo)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeusAlojamentos;