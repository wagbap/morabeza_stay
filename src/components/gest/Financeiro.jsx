import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ArrowUpRight, Loader2, Home, Car, Compass, Award, TrendingUp, MousePointer } from 'lucide-react';

export default function Financeiro() {
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState({
    anfitrion: false,
    guia: false,
    proprietarioVeiculos: false
  });
  const [dadosFinanceiros, setDadosFinanceiros] = useState({
    metricas: {
      cliques: 0,
      taxaReserva: 0,
      receitaTotal: 0
    },
    desempenhoPorTipo: {
      alojamentos: { total: 0, receita: 0 },
      carros: { total: 0, receita: 0 },
      experiencias: { total: 0, receita: 0 }
    }
  });

  // Buscar roles e dados do usuário
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
          setLoading(false);
          return;
        }
        
        const user = JSON.parse(savedUser);
        
        // Buscar roles
        const rolesResponse = await fetch(`https://welovepalop.com/api/usuarios/listar_roles.php?usuario_id=${user.id}`);
        const rolesData = await rolesResponse.json();
        
        let isAnfitrion = false;
        let isGuia = false;
        let isProprietarioVeiculos = false;
        
        if (rolesData.success && rolesData.roles) {
          isAnfitrion = rolesData.roles.some(r => r.name === 'anfitrion' && r.status === 'approved');
          isGuia = rolesData.roles.some(r => r.name === 'guia_experiencias' && r.status === 'approved');
          isProprietarioVeiculos = rolesData.roles.some(r => r.name === 'proprietario_veiculos' && r.status === 'approved');
          
          setUserRoles({
            anfitrion: isAnfitrion,
            guia: isGuia,
            proprietarioVeiculos: isProprietarioVeiculos
          });
        }
        
        // Buscar estatísticas
        const statsResponse = await fetch(`https://welovepalop.com/api/dashboard/estatisticas.php?usuario_id=${user.id}`);
        const statsData = await statsResponse.json();
        
        if (statsData.success && statsData.data) {
          const alojamentos = statsData.data.alojamentos || {};
          const carros = statsData.data.carros || {};
          const experiencias = statsData.data.experiencias || {};
          const totais = statsData.data.totais || {};
          
          // Calcular receita (apenas para tipos que o usuário tem role)
          let receitaAlojamentos = 0;
          let receitaCarros = 0;
          let receitaExperiencias = 0;
          let totalCliques = 0;
          let totalVisualizacoes = 0;
          
          if (isAnfitrion) {
            receitaAlojamentos = (alojamentos.total_anuncios || 0) * 5000;
            totalCliques += alojamentos.total_cliques_reserva || 0;
            totalVisualizacoes += alojamentos.total_visualizacoes || 0;
          }
          
          if (isProprietarioVeiculos) {
            receitaCarros = (carros.total_anuncios || 0) * 3000;
            totalCliques += carros.total_cliques_reserva || 0;
            totalVisualizacoes += carros.total_visualizacoes || 0;
          }
          
          if (isGuia) {
            receitaExperiencias = (experiencias.total_anuncios || 0) * 2000;
            totalCliques += experiencias.total_cliques_reserva || 0;
            totalVisualizacoes += experiencias.total_visualizacoes || 0;
          }
          
          const taxaReserva = totalVisualizacoes > 0 ? (totalCliques / totalVisualizacoes * 100) : 0;
          const receitaTotal = receitaAlojamentos + receitaCarros + receitaExperiencias;
          
          setDadosFinanceiros({
            metricas: {
              cliques: totalCliques,
              taxaReserva: Math.round(taxaReserva),
              receitaTotal: Math.round(receitaTotal)
            },
            desempenhoPorTipo: {
              alojamentos: { 
                total: alojamentos.total_anuncios || 0, 
                receita: receitaAlojamentos,
                cliques: alojamentos.total_cliques_reserva || 0,
                visualizacoes: alojamentos.total_visualizacoes || 0
              },
              carros: { 
                total: carros.total_anuncios || 0, 
                receita: receitaCarros,
                cliques: carros.total_cliques_reserva || 0,
                visualizacoes: carros.total_visualizacoes || 0
              },
              experiencias: { 
                total: experiencias.total_anuncios || 0, 
                receita: receitaExperiencias,
                cliques: experiencias.total_cliques_reserva || 0,
                visualizacoes: experiencias.total_visualizacoes || 0
              }
            }
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  // Verificar se tem pelo menos uma role aprovada
  const hasAnyRole = userRoles.anfitrion || userRoles.guia || userRoles.proprietarioVeiculos;

  if (loading) {
    return (
      <div className="max-w-6xl w-full text-[#1a1f36] px-4 py-6 md:px-0 flex justify-center items-center h-96">
        <Loader2 size={48} className="animate-spin text-blue-900" />
      </div>
    );
  }

  // Se não tem nenhuma role aprovada
  if (!hasAnyRole) {
    return (
      <div className="max-w-6xl w-full text-[#1a1f36] px-4 py-6 md:px-0">
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award size={40} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Você não tem permissão para aceder à área financeira.
            É necessário ter uma das seguintes funções aprovadas:
            Anfitrião, Guia de Experiências ou Proprietário de Veículos.
          </p>
        </div>
      </div>
    );
  }

  // Calcular totais para o gráfico
  const totalAnuncios = dadosFinanceiros.desempenhoPorTipo.alojamentos.total + 
                        dadosFinanceiros.desempenhoPorTipo.carros.total + 
                        dadosFinanceiros.desempenhoPorTipo.experiencias.total;
  
  const percAlojamentos = totalAnuncios > 0 ? (dadosFinanceiros.desempenhoPorTipo.alojamentos.total / totalAnuncios * 100) : 0;
  const percCarros = totalAnuncios > 0 ? (dadosFinanceiros.desempenhoPorTipo.carros.total / totalAnuncios * 100) : 0;
  const percExperiencias = totalAnuncios > 0 ? (dadosFinanceiros.desempenhoPorTipo.experiencias.total / totalAnuncios * 100) : 0;
  
  const getConicGradient = () => {
    let gradient = '';
    if (userRoles.anfitrion && dadosFinanceiros.desempenhoPorTipo.alojamentos.total > 0) {
      gradient += `#16a34a 0% ${percAlojamentos}%, `;
    }
    if (userRoles.proprietarioVeiculos && dadosFinanceiros.desempenhoPorTipo.carros.total > 0) {
      const startAloj = userRoles.anfitrion ? percAlojamentos : 0;
      gradient += `#2563eb ${startAloj}% ${startAloj + percCarros}%, `;
    }
    if (userRoles.guia && dadosFinanceiros.desempenhoPorTipo.experiencias.total > 0) {
      const startCarros = (userRoles.anfitrion ? percAlojamentos : 0) + (userRoles.proprietarioVeiculos ? percCarros : 0);
      gradient += `#fbbf24 ${startCarros}% 100%`;
    }
    return gradient || '#e5e7eb 0% 100%';
  };

  return (
    <div className="max-w-6xl w-full text-[#1a1f36] px-4 py-6 md:px-0">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <MetricCard 
          title="Cliques em Reserva" 
          value={dadosFinanceiros.metricas.cliques.toLocaleString()} 
          icon={<MousePointer size={20} className="text-blue-500" />}
        />
        <MetricCard 
          title="Taxa de Conversão" 
          value={`${dadosFinanceiros.metricas.taxaReserva}%`}
          icon={<TrendingUp size={20} className="text-green-500" />}
        />
        <MetricCard 
          title="Receita Total" 
          value={dadosFinanceiros.metricas.receitaTotal.toLocaleString()} 
          unit="CVE"
          icon={<Award size={20} className="text-yellow-500" />}
        />
      </div>

      {/* Desempenho por Tipo */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-[15px] font-bold mb-6">Desempenho por Tipo</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userRoles.anfitrion && (
            <TipoCard 
              titulo="Alojamentos"
              icone={<Home size={24} className="text-blue-600" />}
              cor="bg-blue-50"
              dados={dadosFinanceiros.desempenhoPorTipo.alojamentos}
            />
          )}
          
          {userRoles.proprietarioVeiculos && (
            <TipoCard 
              titulo="Carros"
              icone={<Car size={24} className="text-green-600" />}
              cor="bg-green-50"
              dados={dadosFinanceiros.desempenhoPorTipo.carros}
            />
          )}
          
          {userRoles.guia && (
            <TipoCard 
              titulo="Experiências"
              icone={<Compass size={24} className="text-purple-600" />}
              cor="bg-purple-50"
              dados={dadosFinanceiros.desempenhoPorTipo.experiencias}
            />
          )}
        </div>
      </div>

      {/* Gráfico de Pizza */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6">
        <h3 className="text-[15px] font-bold mb-6">Distribuição de Anúncios</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="relative w-40 h-40 rounded-full" 
               style={{ background: `conic-gradient(${getConicGradient()})` }}>
            <div className="absolute inset-0 bg-white rounded-full m-[1px] flex items-center justify-center">
              <span className="text-lg font-bold text-gray-700">{totalAnuncios}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {userRoles.anfitrion && dadosFinanceiros.desempenhoPorTipo.alojamentos.total > 0 && (
              <LegendItem color="bg-[#16a34a]" label="Alojamentos" value={dadosFinanceiros.desempenhoPorTipo.alojamentos.total} />
            )}
            {userRoles.proprietarioVeiculos && dadosFinanceiros.desempenhoPorTipo.carros.total > 0 && (
              <LegendItem color="bg-[#2563eb]" label="Carros" value={dadosFinanceiros.desempenhoPorTipo.carros.total} />
            )}
            {userRoles.guia && dadosFinanceiros.desempenhoPorTipo.experiencias.total > 0 && (
              <LegendItem color="bg-[#fbbf24]" label="Experiências" value={dadosFinanceiros.desempenhoPorTipo.experiencias.total} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, unit, icon }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-medium text-gray-500">{title}</h3>
        {icon}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[28px] font-bold text-gray-900">{value}</span>
        {unit && <span className="text-[13px] font-medium text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}

function TipoCard({ titulo, icone, cor, dados }) {
  return (
    <div className={`${cor} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-gray-800">{titulo}</h4>
        {icone}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">Anúncios</span>
          <span className="text-sm font-bold text-gray-700">{dados.total}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">Visualizações</span>
          <span className="text-sm font-bold text-gray-700">{dados.visualizacoes?.toLocaleString() || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">Cliques</span>
          <span className="text-sm font-bold text-gray-700">{dados.cliques?.toLocaleString() || 0}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">Receita Estimada</span>
          <span className="text-sm font-bold text-green-600">{dados.receita?.toLocaleString() || 0} CVE</span>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-800">{value}</span>
    </div>
  );
}