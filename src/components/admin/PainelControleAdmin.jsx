import React, { useState, useEffect } from 'react';
import { Calendar, Home, DollarSign, AlertTriangle, TrendingUp, PieChart, Loader2 } from 'lucide-react';
import Chart from 'react-apexcharts'; // <- Nova biblioteca importada aqui

const PainelControleAdmin = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/get_dashboard_data.php')
      .then(res => res.json())
      .then(resData => {
        if (resData.status === 'success') {
          setData(resData);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao puxar dados do Dashboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-96 w-full flex flex-col justify-center items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin text-[#003580]" size={36} />
        <span className="text-sm font-medium">A carregar métricas consolidadas da BD...</span>
      </div>
    );
  }

  const statsServer = data?.stats || { 
    reservas_ativas: '0', 
    propriedades_ativas: '0', 
    ganhos_totais: 'CVE 0', 
    ganhos_morabeza: 'CVE 0', 
    ganhos_morabeza_puro: 0, 
    aprovacoes_pendentes: 0 
  };
  const listasRecentes = data?.reservas_recentes || [];
  const dadosGrafico = data?.dados_grafico || [];

  const stats = [
    { title: 'Reservas Ativas', value: statsServer.reservas_ativas, icon: <Calendar className="text-[#6b82c6]" size={24} /> },
    { title: 'Propriedades Ativas', value: statsServer.propriedades_ativas, icon: <Home className="text-[#6b82c6]" size={24} /> },
    { title: 'Ganhos Totais', value: statsServer.ganhos_totais, icon: <DollarSign className="text-[#4b7a69]" size={24} /> },
    { title: 'Ganhos Morabeza', value: statsServer.ganhos_morabeza, icon: <PieChart className="text-green-500" size={24} /> },
  ];

  // =========================================================
  // CONFIGURAÇÃO DO APEXCHARTS (MISTO DE LINHA E ÁREA)
  // =========================================================
  const meses = dadosGrafico.map(d => d.mes);
  const valoresTotais = dadosGrafico.map(d => d.total);
  const valoresComissao = dadosGrafico.map(d => d.comissao);

  const chartOptions = {
    chart: {
      id: 'ganhos-mensais-chart',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit'
    },
    stroke: {
      curve: 'smooth',
      width: [4, 3], // Linha mais grossa para o total, ligeiramente mais fina para a área
    },
    colors: ['#6b82c6', '#4b7a69'], // Teus tons exatos do projeto
    fill: {
      type: ['solid', 'gradient'], // O total será linha pura, a comissão terá o efeito gradiente por baixo
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    labels: meses.length > 0 ? meses : ['Sem Dados'],
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#9ca3af', fontSize: '12px' } }
    },
    yaxis: {
      labels: {
        style: { colors: '#9ca3af', fontSize: '12px' },
        formatter: (val) => {
          if (val >= 1000000) return `CVE ${(val / 1000000).toFixed(1)}M`;
          if (val >= 1000) return `CVE ${val / 1000}K`;
          return `CVE ${val}`;
        }
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => `CVE ${Number(val).toLocaleString('pt-PT')}`
      }
    },
    legend: { show: false } // Customizada manualmente no teu HTML abaixo
  };

  const chartSeries = [
    {
      name: 'Ganhos Totais',
      type: 'line', // Tipo Linha pura
      data: valoresTotais
    },
    {
      name: 'Comissão Morabeza (20%)',
      type: 'area', // Tipo Área com preenchimento gradiente
      data: valoresComissao
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#003580]">Bem-vindo, Administrador!</h1>
        <p className="text-gray-600 mt-1">Gerencie suas propriedades, reservas, clientes e ganhos</p>
      </div>

      {/* Cartões de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white flex items-center gap-4 hover:shadow-md transition-all">
            <div className="bg-[#f0f4f8] p-4 rounded-xl">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <p className="text-xl font-bold text-[#003580]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gráfico Inabalável do ApexCharts */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#003580] mb-3">Ganhos Mensais</h3>
                <div className="flex gap-8">
                  <div>
                    <p className="text-2xl font-bold text-[#6b82c6]">{statsServer.ganhos_totais}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Ganhos <span className="text-gray-400">80%</span></p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-[#4b7a69]">{statsServer.ganhos_morabeza}</p>
                      <span className="text-sm text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium flex items-center">
                        <TrendingUp size={14} className="mr-1" /> Ativo
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Morabeza Stay <span className="text-gray-400">Comissão</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Renderização Forçada de Segurança do ApexCharts */}
            <div className="w-full mix-blend-multiply">
              {dadosGrafico.length > 0 ? (
                <Chart 
                  options={chartOptions} 
                  series={chartSeries} 
                  type="line" 
                  height={290} 
                />
              ) : (
                <div className="h-72 w-full flex items-center justify-center text-sm text-gray-400 italic">
                  Nenhum faturamento registado nos últimos meses.
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-6 mt-4 justify-start sm:justify-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#6b82c6]"></span>
                <span className="text-sm text-gray-600 font-medium">Total Ganhos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#4b7a69]"></span>
                <span className="text-sm text-gray-600 font-medium">Comissão Morabeza Stay (20%)</span>
              </div>
            </div>
          </div>

          {/* Tabela de Reservas Recentes */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#003580]">Reservas Recentes</h3>
              <button onClick={() => window.location.href = '/admin/reservas'} className="text-sm font-medium text-[#6b82c6] hover:text-[#003580] transition-colors">Ver Todas &gt;</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 font-medium">Cliente</th>
                    <th className="pb-3 font-medium">Item / Recurso</th>
                    <th className="pb-3 font-medium">Data Pedido</th>
                    <th className="pb-3 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {listasRecentes.map((reserva, idx) => (
                    <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-medium text-gray-700">{reserva.cliente}</td>
                      <td className="py-3 max-w-[180px] truncate">{reserva.propriedade}</td>
                      <td className="py-3 text-gray-500 text-xs">{reserva.data}</td>
                      <td className="py-3 font-semibold text-gray-800 text-right">{reserva.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white">
            <h3 className="text-lg font-semibold text-[#003580] mb-6">Distribuição de Ganhos</h3>
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 drop-shadow-md">
                <path className="text-[#6b82c6]" strokeWidth="8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-[#4b7a69]" strokeWidth="8" strokeDasharray="20, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-[#003580]">20%</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Comissão</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#6b82c6]"></span>
                  <span className="text-gray-600">Proprietários</span>
                </div>
                <span className="font-semibold text-gray-800">80%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#4b7a69]"></span>
                  <span className="text-gray-600">Morabeza Stay</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold text-gray-800">20%</span>
                  <span className="block text-xs font-bold text-gray-500">
                    CVE {Number(statsServer.ganhos_morabeza_puro).toLocaleString('pt-PT')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#fdfaec] border border-yellow-200 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 text-yellow-600 mb-2">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Aprovação Pendente</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {statsServer.aprovacoes_pendentes} {statsServer.aprovacoes_pendentes === 1 ? 'item aguarda' : 'itens aguardam'} verificação na plataforma.
            </p>
            <button 
              onClick={() => window.location.href = '/admin/anfitrioes'} 
              className="w-full bg-[#4b7a69] hover:bg-[#3d6355] text-white py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm"
            >
              Verificar Agora
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PainelControleAdmin;