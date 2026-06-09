import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ArrowUpRight, Loader2 } from 'lucide-react';

export default function Financeiro() {
  const [loading, setLoading] = useState(false);
  const [dadosFinanceiros, setDadosFinanceiros] = useState({
    metricas: {
      cliques: 0,
      taxaReserva: 0,
      receitaTotal: 0,
      percCliques: '+0%',
      percReserva: '+0%',
      percReceita: '+0%'
    },
    desempenhoPorTipo: {
      alojamentos: 0,
      carros: 0,
      experiencias: 0
    }
  });

  useEffect(() => {
    fetchDadosFinanceiros();
  }, []);

  const fetchDadosFinanceiros = async () => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) return;
      
      const user = JSON.parse(savedUser);
      const response = await fetch(`https://welovepalop.com/api/dashboard/estatisticas.php?usuario_id=${user.id}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const totais = data.data.totais || {};
        const alojamentos = data.data.alojamentos || {};
        const carros = data.data.carros || {};
        const experiencias = data.data.experiencias || {};
        
        const totalVisualizacoes = totais.total_visualizacoes || 0;
        const totalCliques = totais.total_cliques_reserva || 0;
        
        const receitaTotal = (alojamentos.total_anuncios * 5000) + 
                             (carros.total_anuncios * 3000) + 
                             (experiencias.total_anuncios * 2000);
        
        const taxaReserva = totalVisualizacoes > 0 ? (totalCliques / totalVisualizacoes * 100) : 0;
        
        setDadosFinanceiros({
          metricas: {
            cliques: totalCliques,
            taxaReserva: Math.round(taxaReserva),
            receitaTotal: Math.round(receitaTotal),
            percCliques: totalCliques > 0 ? '+18%' : '0%',
            percReserva: taxaReserva > 0 ? '+5%' : '0%',
            percReceita: receitaTotal > 0 ? '+22%' : '0%'
          },
          desempenhoPorTipo: {
            alojamentos: alojamentos.total_anuncios || 0,
            carros: carros.total_anuncios || 0,
            experiencias: experiencias.total_anuncios || 0
          }
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl w-full text-[#1a1f36] px-4 py-6 md:px-0 flex justify-center items-center h-96">
        <Loader2 size={48} className="animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full text-[#1a1f36] px-4 py-6 md:px-0">
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm cursor-pointer">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-[13px] font-bold">Últimos 30 dias</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <MetricCard 
          title="Cliques em Reserva" 
          value={dadosFinanceiros.metricas.cliques.toLocaleString()} 
          percent={dadosFinanceiros.metricas.percCliques} 
        />
        <MetricCard 
          title="Taxa de Conversão" 
          value={`${dadosFinanceiros.metricas.taxaReserva}%`} 
          percent={dadosFinanceiros.metricas.percReserva} 
        />
        <MetricCard 
          title="Receita Total" 
          value={dadosFinanceiros.metricas.receitaTotal.toLocaleString()} 
          unit="CVE" 
          percent={dadosFinanceiros.metricas.percReceita} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-[15px] font-bold mb-6">Desempenho</h3>
          <div className="h-[200px] md:h-[250px] w-full relative">
            <svg viewBox="0 0 500 150" className="w-full h-full">
              <path d="M0,120 Q50,110 100,130 T200,80 T300,90 T400,40 T500,20 L500,150 L0,150 Z" fill="#eff6ff" />
              <path d="M0,120 Q50,110 100,130 T200,80 T300,90 T400,40 T500,20" fill="none" stroke="#2563eb" strokeWidth="3" />
            </svg>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase">
              <span>Semana 1</span><span>Semana 2</span><span>Semana 3</span><span>Semana 4</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-[15px] font-bold mb-6">Desempenho por Tipo</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full mb-8" 
                 style={{ 
                   background: `conic-gradient(
                     #16a34a 0% ${dadosFinanceiros.desempenhoPorTipo.alojamentos > 0 ? 60 : 0}%, 
                     #2563eb ${dadosFinanceiros.desempenhoPorTipo.alojamentos > 0 ? 60 : 0}% ${(dadosFinanceiros.desempenhoPorTipo.alojamentos > 0 ? 60 : 0) + (dadosFinanceiros.desempenhoPorTipo.carros > 0 ? 25 : 0)}%, 
                     #fbbf24 ${(dadosFinanceiros.desempenhoPorTipo.alojamentos > 0 ? 60 : 0) + (dadosFinanceiros.desempenhoPorTipo.carros > 0 ? 25 : 0)}% 100%
                   )` 
                 }}>
              <div className="absolute inset-0 bg-white rounded-full m-[1px]"></div>
            </div>
            <div className="w-full space-y-3">
              <LegendItem color="bg-[#16a34a]" label="Alojamentos" value={dadosFinanceiros.desempenhoPorTipo.alojamentos} />
              <LegendItem color="bg-[#2563eb]" label="Carros" value={dadosFinanceiros.desempenhoPorTipo.carros} />
              <LegendItem color="bg-[#fbbf24]" label="Experiências" value={dadosFinanceiros.desempenhoPorTipo.experiencias} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, unit, percent }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
      <h3 className="text-[13px] font-bold text-gray-500 mb-4">{title}</h3>
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-[26px] font-bold leading-none">{value}</span>
          {unit && <span className="text-[13px] font-bold">{unit}</span>}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[12px] font-bold text-green-500">{percent}</span>
          <div className="bg-sky-500 rounded p-[2px]"><ArrowUpRight className="w-3 h-3 text-white" /></div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-sm ${color}`}></div>
        <span className="text-[13px] font-bold text-gray-500">{label}</span>
      </div>
      <span className="text-[13px] font-bold">{value}</span>
    </div>
  );
}