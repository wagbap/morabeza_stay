// src/components/ExperienciaRegisto/MeusExperiencias.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit, Trash2, Eye, MapPin, Users, Clock, 
  DollarSign, CheckCircle, XCircle, Loader, AlertCircle, Calendar
} from 'lucide-react';
import { listarExperiencias, excluirExperiencia } from '../../services/experienciaApiService';

const API_URL = 'https://welovepalop.com';
const USUARIO_ID = 1;

const MeusExperiencias = () => {
  const navigate = useNavigate();
  const [experiencias, setExperiencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const carregarExperiencias = async () => {
    try {
      setLoading(true);
      const result = await listarExperiencias(USUARIO_ID);
      
      if (result.success) {
        setExperiencias(result.data.items || []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarExperiencias();
  }, []);

  const handleEditar = (id) => {
    navigate(`/experiencia-registo/editar/${id}`);
  };

  const handleVer = (id) => {
    navigate(`/experiencia-registo/detalhes/${id}`);
  };

  const handleExcluir = async (id, titulo) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${titulo}"?`)) return;
    
    try {
      const result = await excluirExperiencia(id);
      if (result.success) {
        setExperiencias(prev => prev.filter(e => e.id !== id));
        alert('Experiência excluída com sucesso!');
      } else {
        alert(result.message || 'Erro ao excluir');
      }
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      aprovado: { label: 'Aprovado', icon: <CheckCircle size={14} />, class: 'bg-green-100 text-green-800' },
      pendente: { label: 'Pendente', icon: <Clock size={14} />, class: 'bg-yellow-100 text-yellow-800' },
      rejeitado: { label: 'Rejeitado', icon: <XCircle size={14} />, class: 'bg-red-100 text-red-800' }
    };
    const { label, icon, class: className } = config[status] || config.pendente;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {icon} {label}
      </span>
    );
  };

  const experienciasFiltradas = experiencias.filter(e => {
    const matchSearch = (e.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (e.localizacao || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || e.status === filtroStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader className="animate-spin text-[#006ce4]" size={48} />
        <p className="mt-4 text-gray-600">Carregando suas experiências...</p>
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
          <button onClick={carregarExperiencias} className="px-4 py-2 bg-[#006ce4] text-white rounded-lg">
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
              <h1 className="text-2xl font-bold text-gray-900">Minhas Experiências</h1>
              <p className="text-gray-500 text-sm mt-1">Gerencie todas as suas experiências cadastradas</p>
            </div>
            <button
              onClick={() => navigate('/experiencia-registo/fluxo')}
              className="flex items-center gap-2 px-4 py-2 bg-[#006ce4] text-white rounded-lg hover:bg-[#0053b3] transition-colors"
            >
              <Plus size={18} />
              Nova Experiência
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
                <p className="text-2xl font-bold text-gray-900">{experiencias.length}</p>
              </div>
              <Calendar size={32} className="text-[#006ce4] opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {experiencias.filter(e => e.status === 'aprovado').length}
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
                  {experiencias.filter(e => e.status === 'pendente').length}
                </p>
              </div>
              <Clock size={32} className="text-yellow-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejeitadas</p>
                <p className="text-2xl font-bold text-red-600">
                  {experiencias.filter(e => e.status === 'rejeitado').length}
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
            {['todos', 'aprovado', 'pendente', 'rejeitado'].map(status => (
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
                 status === 'aprovado' ? 'Aprovadas' : 
                 status === 'pendente' ? 'Pendentes' : 'Rejeitadas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Experiências */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {experienciasFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma experiência encontrada</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filtroStatus !== 'todos' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece cadastrando sua primeira experiência'}
            </p>
            <button
              onClick={() => navigate('/experiencia-registo/fluxo')}
              className="px-4 py-2 bg-[#006ce4] text-white rounded-lg hover:bg-[#0053b3]"
            >
              Cadastrar Experiência
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {experienciasFiltradas.map(exp => (
              <div key={exp.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {exp.imagem_principal ? (
                    <img 
                      src={exp.imagem_principal.startsWith('http') ? exp.imagem_principal : `${API_URL}${exp.imagem_principal}`}
                      alt={exp.titulo}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Sem+Imagem'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar size={48} className="text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(exp.status)}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                    {exp.categoria}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{exp.titulo}</h3>
                    <p className="text-lg font-bold text-[#006ce4]">{exp.preco} CVE</p>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {exp.localizacao || exp.ilha}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {exp.duracao}</span>
                    <span className="flex items-center gap-1"><Users size={14} /> até {exp.max_pessoas} pessoas</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exp.descricao_curta}</p>
                  
                  <div className="flex gap-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleVer(exp.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Eye size={16} /> Ver
                    </button>
                    <button
                      onClick={() => handleEditar(exp.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#006ce4] text-white rounded-lg text-sm font-medium hover:bg-[#0053b3]"
                    >
                      <Edit size={16} /> Editar
                    </button>
                    <button
                      onClick={() => handleExcluir(exp.id, exp.titulo)}
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

export default MeusExperiencias;