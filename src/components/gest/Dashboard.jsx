// src/components/gest/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, Home, Car, Compass, 
  Eye, MousePointer, Calendar, TrendingUp, 
  Loader2, Award, 
  Wallet, Clock
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // 🔓 Desbloqueio total: por predefinição assumimos todas as permissões ativas para utilizadores logados
  const [userRoles, setUserRoles] = useState({
    anfitrion: true,
    guia: true,
    proprietarioVeiculos: true
  });
  
  // Estatísticas dos diferentes tipos
  const [estatisticas, setEstatisticas] = useState({
    alojamentos: { total_anuncios: 0, total_visualizacoes: 0, total_cliques_reserva: 0, taxa_conversao: 0, itens: [] },
    carros: { total_anuncios: 0, total_visualizacoes: 0, total_cliques_reserva: 0, taxa_conversao: 0, itens: [] },
    experiencias: { total_anuncios: 0, total_visualizacoes: 0, total_cliques_reserva: 0, taxa_conversao: 0, itens: [] },
    totais: { total_visualizacoes: 0, total_cliques_reserva: 0, total_anuncios: 0, taxa_conversao: 0 }
  });

  // Reservas recentes
  const [reservasRecentes, setReservasRecentes] = useState([]);

  useEffect(() => {
    // 🔑 Extrair dados de forma segura do token JWT no localStorage
    const obterDadosDoToken = () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('morabeza_token');
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const parsed = JSON.parse(jsonPayload);
        return parsed.data || parsed || null;
      } catch (e) {
        return null;
      }
    };

    const userData = obterDadosDoToken();
    
    if (userData && userData.id) {
      setUser(userData);
      fetchDashboardData(userData.id);
      fetchReservasRecentes(userData.id);
      fetchUserRoles(userData.id);
    } else {
      // Tentar fallback para o 'user' antigo se existir
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userParsed = JSON.parse(savedUser);
          setUser(userParsed);
          fetchDashboardData(userParsed.id);
          fetchReservasRecentes(userParsed.id);
          fetchUserRoles(userParsed.id);
          return;
        } catch (e) {}
      }
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserRoles = async (userId) => {
    try {
      const response = await fetch(`https://welovepalop.com/api/usuarios/listar_roles.php?usuario_id=${userId}`);
      const data = await response.json();
      
      if (data.success && data.roles) {
        const isAnfitrion = data.roles.some(r => r.name === 'anfitrion' && r.status === 'approved');
        const isGuia = data.roles.some(r => r.name === 'guia_experiencias' && r.status === 'approved');
        const isProprietarioVeiculos = data.roles.some(r => r.name === 'proprietario_veiculos' && r.status === 'approved');
        
        // Se houver roles definidas na BD, aplica-as; caso contrário mantém o acesso livre
        if (isAnfitrion || isGuia || isProprietarioVeiculos) {
          setUserRoles({
            anfitrion: isAnfitrion,
            guia: isGuia,
            proprietarioVeiculos: isProprietarioVeiculos
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
    }
  };

  const fetchDashboardData = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`https://welovepalop.com/api/dashboard/estatisticas.php?usuario_id=${userId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setEstatisticas(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservasRecentes = async (userId) => {
    try {
      const response = await fetch(`https://welovepalop.com/api/dashboard/reservas_recentes.php?usuario_id=${userId}`);
      const data = await response.json();
      
      if (data.success && data.data?.reservas) {
        setReservasRecentes(data.data.reservas);
      }
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
    }
  };

  // Calcular totais
  const totalAnuncios = estatisticas.totais?.total_anuncios || 0;
  const totalVisualizacoes = estatisticas.totais?.total_visualizacoes || 0;
  const totalCliques = estatisticas.totais?.total_cliques_reserva || 0;
  const taxaConversao = estatisticas.totais?.taxa_conversao || 0;

  // Tabs disponíveis
  const tabsDisponiveis = [
    { id: 'alojamentos', label: 'Alojamentos', icon: Home, count: estatisticas.alojamentos?.total_anuncios || 0 },
    { id: 'carros', label: 'Carros', icon: Car, count: estatisticas.carros?.total_anuncios || 0 },
    { id: 'experiencias', label: 'Experiências', icon: Compass, count: estatisticas.experiencias?.total_anuncios || 0 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-900 mx-auto mb-4" />
          <p className="text-slate-600">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tabs de Navegação */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-900 border-b-2 border-blue-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Visão Geral
          </button>
          {tabsDisponiveis.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-blue-900 border-b-2 border-blue-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={16} /> {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Conteúdo do Dashboard */}
        {activeTab === 'overview' && (
          <>
            {/* Cards Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Home size={20} className="text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-[13px] font-medium text-slate-500 mb-1">Total de Anúncios</h3>
                  <span className="text-[28px] font-bold text-slate-900">{totalAnuncios}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Calendar size={20} className="text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-[13px] font-medium text-slate-500 mb-1">Reservas Confirmadas</h3>
                  <span className="text-[28px] font-bold text-slate-900">0</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Wallet size={20} className="text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-[13px] font-medium text-slate-500 mb-1">Ganhos (Este mês)</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[28px] font-bold text-slate-900">0</span>
                    <span className="text-[12px] font-bold text-slate-500">CVE</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Award size={20} className="text-yellow-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-[13px] font-medium text-slate-500 mb-1">Avaliação Média</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[28px] font-bold text-slate-900">4.8</span>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4].map(star => (
                        <Star key={star} size={14} className="fill-yellow-400 text-yellow-400" />
                      ))}
                      <Star size={14} className="fill-gray-200 text-gray-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desempenho */}
            <div className="mb-6">
              <h2 className="text-[14px] font-bold mb-3">Desempenho (Últimos 30 dias)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="text-[13px] font-medium text-slate-500 mb-4">Visualizações</h3>
                  <div className="flex items-end justify-between">
                    <span className="text-[28px] font-bold text-slate-900">{totalVisualizacoes.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="text-[13px] font-medium text-slate-500 mb-4">Cliques em Reserva</h3>
                  <div className="flex items-end justify-between">
                    <span className="text-[28px] font-bold text-slate-900">{totalCliques.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="text-[13px] font-medium text-slate-500 mb-4">Taxa de Conversão</h3>
                  <div className="flex items-end justify-between">
                    <span className="text-[28px] font-bold text-slate-900">{taxaConversao}%</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="text-[13px] font-medium text-slate-500 mb-4">Receita Total</h3>
                  <div className="flex items-end justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[28px] font-bold text-slate-900">0</span>
                      <span className="text-[11px] font-bold text-slate-500">CVE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reservas Recentes */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-slate-500" />
                  <h2 className="text-[14px] font-bold">Reservas Recentes</h2>
                </div>
                <button 
                  onClick={() => navigate('/gest/reservas')}
                  className="text-[12px] text-blue-600 font-medium hover:underline"
                >
                  Ver todas
                </button>
              </div>

              <div className="flex flex-col">
                {reservasRecentes.length > 0 ? (
                  reservasRecentes.map((reserva, index) => (
                    <div 
                      key={reserva.id} 
                      className={`flex flex-col lg:flex-row lg:items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors gap-3 ${
                        index !== reservasRecentes.length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 lg:w-[25%]">
                        <img 
                          src={reserva.cliente_foto || 'https://ui-avatars.com/api/?name=Cliente&background=0D8ABC&color=fff'} 
                          alt={reserva.cliente_nome} 
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <p className="text-[13px] font-bold">{reserva.cliente_nome}</p>
                          <p className="text-[10px] text-slate-400">{reserva.cliente_email}</p>
                        </div>
                      </div>

                      <div className="lg:w-[30%]">
                        <div className="flex items-center gap-1">
                          {reserva.tipo === 'alojamento' && <Home size={12} className="text-blue-500" />}
                          {reserva.tipo === 'carro' && <Car size={12} className="text-green-500" />}
                          {reserva.tipo === 'experiencia' && <Compass size={12} className="text-purple-500" />}
                          <p className="text-[13px] font-medium text-slate-600">{reserva.item_nome}</p>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{reserva.periodo}</p>
                      </div>

                      <div className="lg:w-[15%]">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-medium ${
                          reserva.status === 'Confirmada' 
                            ? 'bg-green-100 text-green-700' 
                            : reserva.status === 'Pendente'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {reserva.status}
                        </span>
                      </div>

                      <div className="lg:w-[20%] text-left lg:text-right">
                        <p className="text-[14px] font-bold text-blue-600">{reserva.valor} CVE</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock size={40} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-400 text-sm">Nenhuma reserva recente</p>
                    <p className="text-slate-300 text-xs mt-1">As suas reservas aparecerão aqui</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'alojamentos' && estatisticas.alojamentos && (
          <EstatisticasTipo 
            tipo="Alojamentos" 
            dados={estatisticas.alojamentos} 
            onVerTodos={() => navigate('/alojamento-registro/meus')}
          />
        )}

        {activeTab === 'carros' && estatisticas.carros && (
          <EstatisticasTipo 
            tipo="Carros" 
            dados={estatisticas.carros} 
            onVerTodos={() => navigate('/carro-registo/meus')}
          />
        )}

        {activeTab === 'experiencias' && estatisticas.experiencias && (
          <EstatisticasTipo 
            tipo="Experiências" 
            dados={estatisticas.experiencias} 
            onVerTodos={() => navigate('/experiencia-registo/meus')}
          />
        )}
      </div>
    </div>
  );
}

function EstatisticasTipo({ tipo, dados, onVerTodos }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900">Estatísticas de {tipo}</h2>
        <button 
          onClick={onVerTodos}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-900 text-blue-900 hover:bg-blue-50 transition-colors"
        >
          Gerenciar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={18} className="text-blue-500" />
            <h3 className="text-[12px] font-medium text-slate-500">Visualizações</h3>
          </div>
          <p className="text-[28px] font-bold text-slate-900">{dados.total_visualizacoes?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MousePointer size={18} className="text-green-500" />
            <h3 className="text-[12px] font-medium text-slate-500">Cliques em Reserva</h3>
          </div>
          <p className="text-[28px] font-bold text-slate-900">{dados.total_cliques_reserva?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-purple-500" />
            <h3 className="text-[12px] font-medium text-slate-500">Taxa de Conversão</h3>
          </div>
          <p className="text-[28px] font-bold text-slate-900">{parseFloat(dados.taxa_conversao || 0).toFixed(1)}%</p>
        </div>
      </div>

      {dados.itens && dados.itens.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="text-[13px] font-bold">Seus {tipo.toLowerCase()}</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {dados.itens.map((item, i) => (
              <div key={i} className="flex justify-between items-center px-5 py-3 hover:bg-gray-50">
                <div>
                  <p className="text-[13px] font-medium text-slate-900">{item.titulo}</p>
                  <p className="text-[11px] text-slate-400">{item.localizacao}</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-bold text-blue-600">{item.visualizacoes || 0} 👁️</p>
                  <p className="text-[10px] text-slate-400">{item.cliques_reserva || 0} 🖱️ reservas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}