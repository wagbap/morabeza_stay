import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, ArrowUpRight, Home, Car, Compass, 
  Eye, MousePointer, Calendar, TrendingUp, 
  Loader2, LogOut, Bell,
  Wallet, Award, Clock
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
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
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userParsed = JSON.parse(savedUser);
        setUser(userParsed);
        fetchDashboardData(userParsed.id);
        fetchReservasRecentes(userParsed.id);
      } catch (e) {
        console.error('Erro ao carregar usuário:', e);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, []);

  const fetchDashboardData = async (userId) => {
    setLoading(true);
    try {
      // Usar a API unificada
      const response = await fetch(`https://welovepalop.com/api/dashboard/estatisticas.php?usuario_id=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setEstatisticas(data.data);
      } else {
        console.error('Erro ao buscar dados:', data.message);
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
      } else {
        // Dados mockados para exemplo
        setReservasRecentes([
          {
            id: 1,
            nome: 'Maria Fernandes',
            email: 'maria@example.com',
            imagem: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop',
            item: 'Apartamento Vista Mar',
            tipo: 'alojamento',
            data: '12 - 15 Mai 2026',
            status: 'Confirmada',
            valor: '16.500'
          },
          {
            id: 2,
            nome: 'Carlos Mendes',
            email: 'carlos@example.com',
            imagem: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=60&h=60&fit=crop',
            item: 'Toyota Hilux',
            tipo: 'carro',
            data: '10 - 12 Mai 2026',
            status: 'Pendente',
            valor: '8.000'
          },
          {
            id: 3,
            nome: 'Ana Costa',
            email: 'ana@example.com',
            imagem: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop',
            item: 'Mergulho com Tartarugas',
            tipo: 'experiencia',
            data: '08 Mai 2026',
            status: 'Confirmada',
            valor: '5.000'
          }
        ]);
      }
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Calcular totais
  const totalAnuncios = estatisticas.totais?.total_anuncios || 0;
  const totalVisualizacoes = estatisticas.totais?.total_visualizacoes || 0;
  const totalCliques = estatisticas.totais?.total_cliques_reserva || 0;
  const taxaConversao = estatisticas.totais?.taxa_conversao || 0;

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
        <div className="flex gap-2 mb-6 border-b border-gray-200">
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
          <button
            onClick={() => setActiveTab('alojamentos')}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'alojamentos'
                ? 'text-blue-900 border-b-2 border-blue-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Home size={16} /> Alojamentos ({estatisticas.alojamentos?.total_anuncios || 0})
          </button>
          <button
            onClick={() => setActiveTab('carros')}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'carros'
                ? 'text-blue-900 border-b-2 border-blue-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Car size={16} /> Carros ({estatisticas.carros?.total_anuncios || 0})
          </button>
          <button
            onClick={() => setActiveTab('experiencias')}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'experiencias'
                ? 'text-blue-900 border-b-2 border-blue-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Compass size={16} /> Experiências ({estatisticas.experiencias?.total_anuncios || 0})
          </button>
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
                    <span className="text-[28px] font-bold text-slate-900">{totalVisualizacoes}</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="text-[13px] font-medium text-slate-500 mb-4">Cliques em Reserva</h3>
                  <div className="flex items-end justify-between">
                    <span className="text-[28px] font-bold text-slate-900">{totalCliques}</span>
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
                      {/* Cliente */}
                      <div className="flex items-center gap-3 lg:w-[25%]">
                        <img 
                          src={reserva.imagem || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=60&h=60&fit=crop'} 
                          alt={reserva.nome} 
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        />
                        <div>
                          <p className="text-[13px] font-bold">{reserva.nome}</p>
                          <p className="text-[10px] text-slate-400">{reserva.email}</p>
                        </div>
                      </div>

                      {/* Item Reservado */}
                      <div className="lg:w-[30%]">
                        <div className="flex items-center gap-1">
                          {reserva.tipo === 'alojamento' && <Home size={12} className="text-blue-500" />}
                          {reserva.tipo === 'carro' && <Car size={12} className="text-green-500" />}
                          {reserva.tipo === 'experiencia' && <Compass size={12} className="text-purple-500" />}
                          <p className="text-[13px] font-medium text-slate-600">{reserva.item}</p>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{reserva.data}</p>
                      </div>

                      {/* Status */}
                      <div className="lg:w-[15%]">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-medium ${
                          reserva.status === 'Confirmada' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {reserva.status}
                        </span>
                      </div>

                      {/* Valor */}
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

        {/* Seção de Alojamentos */}
        {activeTab === 'alojamentos' && estatisticas.alojamentos && (
          <EstatisticasTipo 
            tipo="Alojamentos" 
            dados={estatisticas.alojamentos} 
            onVerTodos={() => navigate('/gest/alojamentos')}
          />
        )}

        {/* Seção de Carros */}
        {activeTab === 'carros' && estatisticas.carros && (
          <EstatisticasTipo 
            tipo="Carros" 
            dados={estatisticas.carros} 
            onVerTodos={() => navigate('/gest/carros')}
          />
        )}

        {/* Seção de Experiências */}
        {activeTab === 'experiencias' && estatisticas.experiencias && (
          <EstatisticasTipo 
            tipo="Experiências" 
            dados={estatisticas.experiencias} 
            onVerTodos={() => navigate('/gest/experiencias')}
          />
        )}
      </div>
    </div>
  );
}

// Componente para estatísticas por tipo
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