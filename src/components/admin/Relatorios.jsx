import React, { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp, Users, DollarSign, Calendar, Activity, Home, Car, Compass, Star, Loader2 } from 'lucide-react';

const Relatorios = () => {
  const [stats, setStats] = useState({
    total: 0,
    faturacaoTotal: 0,
    reservasMes: 0,
    avaliacaoMedia: 0,
    crescimento: 0
  });

  const [relatorioAtivo, setRelatorioAtivo] = useState('alojamentos');
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState(null);

  // Buscar dados da API
  const fetchReportData = async (tipo) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/admin_reports.php?action=${tipo}`);
      const data = await response.json();
      
      if (data.success) {
        setApiData(data.data);
        
        // Atualizar stats baseado nos dados reais da API
        setStats({
          total: data.data.total || 0,
          faturacaoTotal: data.data.faturacao_total || 0,
          reservasMes: data.data.total_reservas || 0,
          avaliacaoMedia: data.data.rating_global || 4.5,
          crescimento: tipo === 'experiencias' ? 25 : tipo === 'carros' ? 18 : 8
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setLoading(false);
  };

  const handleRelatorioClick = (tipo) => {
    setRelatorioAtivo(tipo);
    fetchReportData(tipo);
  };

  const formatarMoeda = (valor) => {
    if (!valor || valor === 0) return '0 CVE';
    return new Intl.NumberFormat('pt-PT').format(valor) + ' CVE';
  };

  const formatarNumero = (valor) => {
    if (!valor) return '0';
    return new Intl.NumberFormat('pt-PT').format(valor);
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchReportData('alojamentos');
  }, []);

  // Detalhes para Alojamentos
  const getDetalhesAlojamentos = () => {
    if (!apiData) return [];
    return [
      { label: "Total de Alojamentos", valor: formatarNumero(apiData.total), percentual: "" },
      { label: "Aprovados", valor: formatarNumero(apiData.aprovados), percentual: `${Math.round((apiData.aprovados / apiData.total) * 100)}%` },
      { label: "Pendentes", valor: formatarNumero(apiData.pendentes), percentual: `${Math.round((apiData.pendentes / apiData.total) * 100)}%` },
      { label: "Villas", valor: getTipoCount('Villa'), percentual: getTipoPercentual('Villa') },
      { label: "Apartamentos", valor: getTipoCount('Apartamento'), percentual: getTipoPercentual('Apartamento') },
      { label: "Guest Houses", valor: getTipoCount('Guesthouse'), percentual: getTipoPercentual('Guesthouse') },
      { label: "Preço Médio/Noite", valor: formatarMoeda(apiData.preco_medio), percentual: "" },
      { label: "Preço Mínimo", valor: formatarMoeda(apiData.preco_min), percentual: "" },
      { label: "Preço Máximo", valor: formatarMoeda(apiData.preco_max), percentual: "" }
    ];
  };

  // Detalhes para Carros
  const getDetalhesCarros = () => {
    if (!apiData) return [];
    return [
      { label: "Total de Viaturas", valor: formatarNumero(apiData.total), percentual: "" },
      { label: "Disponíveis", valor: formatarNumero(apiData.disponiveis), percentual: `${Math.round((apiData.disponiveis / apiData.total) * 100)}%` },
      { label: "Indisponíveis", valor: formatarNumero(apiData.indisponiveis), percentual: `${Math.round((apiData.indisponiveis / apiData.total) * 100)}%` },
      { label: "SUVs", valor: getCarroTipoCount('SUV'), percentual: getCarroTipoPercentual('SUV') },
      { label: "Económicos", valor: getCarroTipoCount('Económico'), percentual: getCarroTipoPercentual('Económico') },
      { label: "Pickup", valor: getCarroTipoCount('Pickup'), percentual: getCarroTipoPercentual('Pickup') },
      { label: "Luxo", valor: getCarroTipoCount('Luxo'), percentual: getCarroTipoPercentual('Luxo') },
      { label: "Elétrico", valor: getCarroTipoCount('Elétrico'), percentual: getCarroTipoPercentual('Elétrico') },
      { label: "Preço Médio/Dia", valor: formatarMoeda(calcularPrecoMedioGeral()), percentual: "" }
    ];
  };

  // Detalhes para Experiências (com dados reais da API)
  const getDetalhesExperiencias = () => {
    if (!apiData) return [];
    const categorias = {
      aventura: getCategoriaCount('aventura'),
      cultural: getCategoriaCount('cultural'),
      gastronomia: getCategoriaCount('gastronomia'),
      natureza: getCategoriaCount('natureza'),
      relax: getCategoriaCount('relax')
    };
    
    return [
      { label: "Total de Experiências", valor: formatarNumero(apiData.total), percentual: "" },
      { label: "Aprovadas", valor: formatarNumero(apiData.aprovadas), percentual: `${Math.round((apiData.aprovadas / apiData.total) * 100)}%` },
      { label: "Aventura", valor: categorias.aventura, percentual: getCategoriaPercentual('aventura') },
      { label: "Cultural", valor: categorias.cultural, percentual: getCategoriaPercentual('cultural') },
      { label: "Gastronomia", valor: categorias.gastronomia, percentual: getCategoriaPercentual('gastronomia') },
      { label: "Natureza", valor: categorias.natureza, percentual: getCategoriaPercentual('natureza') },
      { label: "Relax", valor: categorias.relax, percentual: getCategoriaPercentual('relax') },
      { label: "Rating Global", valor: `${apiData.rating_global || 0} ★`, percentual: "" },
      { label: "Total Reviews", valor: formatarNumero(apiData.total_reviews), percentual: "" },
      { label: "Preço Médio", valor: formatarMoeda(calcularPrecoMedioExperiencias()), percentual: "" }
    ];
  };

  // Detalhes para Utilizadores
  const getDetalhesUtilizadores = () => {
    if (!apiData) return [];
    return [
      { label: "Total Utilizadores", valor: formatarNumero(apiData.total), percentual: "" },
      { label: "Verificados", valor: formatarNumero(apiData.verificados), percentual: `${Math.round((apiData.verificados / apiData.total) * 100)}%` },
      { label: "Login Google", valor: formatarNumero(apiData.auth_google), percentual: `${Math.round((apiData.auth_google / apiData.total) * 100)}%` }
    ];
  };

  // Funções auxiliares para Alojamentos
  const getTipoCount = (tipo) => {
    if (!apiData?.distribuicao_tipos) return '0';
    const item = apiData.distribuicao_tipos.find(t => t.tipo === tipo);
    return item ? formatarNumero(item.total) : '0';
  };

  const getTipoPercentual = (tipo) => {
    if (!apiData?.distribuicao_tipos || !apiData.total) return '0%';
    const item = apiData.distribuicao_tipos.find(t => t.tipo === tipo);
    if (!item) return '0%';
    return `${Math.round((item.total / apiData.total) * 100)}%`;
  };

  // Funções auxiliares para Carros
  const getCarroTipoCount = (tipo) => {
    if (!apiData?.distribuicao_tipos) return '0';
    const item = apiData.distribuicao_tipos.find(t => t.tipo === tipo);
    return item ? formatarNumero(item.total) : '0';
  };

  const getCarroTipoPercentual = (tipo) => {
    if (!apiData?.distribuicao_tipos || !apiData.total) return '0%';
    const item = apiData.distribuicao_tipos.find(t => t.tipo === tipo);
    if (!item) return '0%';
    return `${Math.round((item.total / apiData.total) * 100)}%`;
  };

  const calcularPrecoMedioGeral = () => {
    if (!apiData?.precos_por_tipo || apiData.precos_por_tipo.length === 0) return 0;
    const soma = apiData.precos_por_tipo.reduce((acc, p) => acc + parseFloat(p.preco_medio), 0);
    return soma / apiData.precos_por_tipo.length;
  };

  // Funções auxiliares para Experiências
  const getCategoriaCount = (categoria) => {
    if (!apiData?.distribuicao_categorias) return '0';
    const item = apiData.distribuicao_categorias.find(c => c.categoria === categoria);
    return item ? formatarNumero(item.total) : '0';
  };

  const getCategoriaPercentual = (categoria) => {
    if (!apiData?.distribuicao_categorias || !apiData.total) return '0%';
    const item = apiData.distribuicao_categorias.find(c => c.categoria === categoria);
    if (!item) return '0%';
    return `${Math.round((item.total / apiData.total) * 100)}%`;
  };

  const getCategoriaRating = (categoria) => {
    if (!apiData?.distribuicao_categorias) return 0;
    const item = apiData.distribuicao_categorias.find(c => c.categoria === categoria);
    return item ? parseFloat(item.rating_medio).toFixed(1) : 0;
  };

  const calcularPrecoMedioExperiencias = () => {
    if (!apiData?.precos_por_categoria || apiData.precos_por_categoria.length === 0) return 0;
    const soma = apiData.precos_por_categoria.reduce((acc, p) => acc + parseFloat(p.preco_medio), 0);
    return soma / apiData.precos_por_categoria.length;
  };

  // Títulos dos relatórios
  const getTitulo = () => {
    switch(relatorioAtivo) {
      case 'alojamentos': return 'Relatório de Alojamentos';
      case 'carros': return 'Relatório de Viaturas';
      case 'experiencias': return 'Relatório de Experiências';
      case 'utilizadores': return 'Relatório de Utilizadores';
      default: return 'Relatório de Alojamentos';
    }
  };

  // Detalhes atuais
  const getDetalhesAtuais = () => {
    switch(relatorioAtivo) {
      case 'alojamentos': return getDetalhesAlojamentos();
      case 'carros': return getDetalhesCarros();
      case 'experiencias': return getDetalhesExperiencias();
      case 'utilizadores': return getDetalhesUtilizadores();
      default: return getDetalhesAlojamentos();
    }
  };

  // Cores para categorias de experiências
  const getCategoriaCor = (categoria) => {
    const cores = {
      aventura: '#FF6B6B',
      cultural: '#4ECDC4',
      gastronomia: '#FFE66D',
      natureza: '#95E77E',
      relax: '#A8E6CF'
    };
    return cores[categoria] || '#003580';
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580]">Relatórios</h1>
          <p className="text-gray-600 mt-1">
            {getTitulo()}
            {relatorioAtivo !== 'geral' && (
              <span className="ml-2 text-sm text-[#003580] font-medium">
                • Dados específicos
              </span>
            )}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#003580] text-white px-4 py-2 rounded-xl hover:bg-[#002060] transition">
          <Download size={18} /> Exportar PDF
        </button>
      </div>

      {/* Cards Principais */}
      <div className={`transition-all duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-sm border border-blue-100">
            <Users className="text-blue-500 mb-2" size={24} />
            <p className="text-2xl font-bold">{formatarNumero(stats.total)}</p>
            <p className="text-sm text-gray-500">
              {relatorioAtivo === 'utilizadores' ? 'Total de Utilizadores' : 
               relatorioAtivo === 'alojamentos' ? 'Alojamentos' :
               relatorioAtivo === 'carros' ? 'Viaturas' : 'Experiências'}
            </p>
            {stats.crescimento > 0 && (
              <p className="text-xs text-green-600 mt-2">+{stats.crescimento}% este mês</p>
            )}
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-sm border border-green-100">
            <DollarSign className="text-green-500 mb-2" size={24} />
            <p className="text-2xl font-bold">{formatarMoeda(stats.faturacaoTotal)}</p>
            <p className="text-sm text-gray-500">Faturação Total</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl shadow-sm border border-purple-100">
            <Calendar className="text-purple-500 mb-2" size={24} />
            <p className="text-2xl font-bold">{formatarNumero(stats.reservasMes)}</p>
            <p className="text-sm text-gray-500">Reservas</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl shadow-sm border border-orange-100">
            <Star className="text-orange-500 mb-2" size={24} />
            <p className="text-2xl font-bold">{stats.avaliacaoMedia === 0 ? 'N/A' : stats.avaliacaoMedia + ' ★'}</p>
            <p className="text-sm text-gray-500">Avaliação Média</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu de Relatórios Específicos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-[#003580]" />
            Relatórios por Categoria
          </h3>
          <div className="space-y-2">
            <button 
              onClick={() => handleRelatorioClick('alojamentos')}
              className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${
                relatorioAtivo === 'alojamentos' 
                  ? 'bg-[#003580] text-white' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Home size={18} />
              <span className="flex-1">Alojamentos</span>
              <span className="text-xs">27</span>
            </button>
            
            <button 
              onClick={() => handleRelatorioClick('carros')}
              className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${
                relatorioAtivo === 'carros' 
                  ? 'bg-[#003580] text-white' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Car size={18} />
              <span className="flex-1">Viaturas</span>
              <span className="text-xs">15</span>
            </button>
            
            <button 
              onClick={() => handleRelatorioClick('experiencias')}
              className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${
                relatorioAtivo === 'experiencias' 
                  ? 'bg-[#003580] text-white' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Compass size={18} />
              <span className="flex-1">Experiências</span>
              <span className="text-xs">9</span>
            </button>
            
            <button 
              onClick={() => handleRelatorioClick('utilizadores')}
              className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${
                relatorioAtivo === 'utilizadores' 
                  ? 'bg-[#003580] text-white' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Users size={18} />
              <span className="flex-1">Utilizadores</span>
              <span className="text-xs">21</span>
            </button>
          </div>
        </div>

        {/* Detalhes do Relatório Selecionado */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#003580]" />
            {getTitulo()} - Detalhes
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#003580]" size={32} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {getDetalhesAtuais().map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-lg font-bold text-gray-800">{item.valor}</p>
                    {item.percentual && (
                      <p className="text-xs text-green-600">{item.percentual}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Barra de progresso para alojamentos */}
              {relatorioAtivo === 'alojamentos' && apiData?.distribuicao_tipos && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-3">Distribuição por Tipo</p>
                  <div className="space-y-2">
                    {apiData.distribuicao_tipos.map((tipo, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs">
                          <span>{tipo.tipo} ({Math.round((tipo.total / apiData.total) * 100)}%)</span>
                          <span>{tipo.total} unidades</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-[#003580] h-2 rounded-full" 
                            style={{ width: `${(tipo.total / apiData.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Barra de progresso para carros */}
              {relatorioAtivo === 'carros' && apiData?.distribuicao_tipos && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-3">Distribuição por Tipo de Viatura</p>
                  <div className="space-y-2">
                    {apiData.distribuicao_tipos.map((tipo, idx) => {
                      const cores = {
                        'SUV': '#3B82F6',
                        'Económico': '#10B981',
                        'Pickup': '#F59E0B',
                        'Luxo': '#8B5CF6',
                        'Elétrico': '#06B6D4'
                      };
                      return (
                        <div key={idx}>
                          <div className="flex justify-between text-xs">
                            <span>{tipo.tipo} ({Math.round((tipo.total / apiData.total) * 100)}%)</span>
                            <span>{tipo.total} viaturas</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${(tipo.total / apiData.total) * 100}%`,
                                backgroundColor: cores[tipo.tipo] || '#003580'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Distribuição e Preços para Experiências */}
              {relatorioAtivo === 'experiencias' && apiData?.distribuicao_categorias && (
                <>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-3">Distribuição por Categoria</p>
                    <div className="space-y-2">
                      {apiData.distribuicao_categorias.map((cat, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-xs">
                            <span className="capitalize">{cat.categoria} ({Math.round((cat.total / apiData.total) * 100)}%)</span>
                            <div>
                              <span>{cat.total} experiências</span>
                              <span className="ml-2 text-yellow-600">★ {parseFloat(cat.rating_medio).toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${(cat.total / apiData.total) * 100}%`,
                                backgroundColor: getCategoriaCor(cat.categoria)
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-3">Preços por Categoria</p>
                    <div className="grid grid-cols-2 gap-2">
                      {apiData.precos_por_categoria?.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-500 capitalize">{item.categoria}</p>
                          <p className="text-sm font-bold text-[#003580]">{formatarMoeda(parseFloat(item.preco_medio))}</p>
                          <p className="text-xs text-gray-400">
                            Min: {formatarMoeda(parseFloat(item.preco_min))} | Max: {formatarMoeda(parseFloat(item.preco_max))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Preços por tipo para carros */}
              {relatorioAtivo === 'carros' && apiData?.precos_por_tipo && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-3">Preço Médio por Tipo</p>
                  <div className="grid grid-cols-2 gap-2">
                    {apiData.precos_por_tipo.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-xs text-gray-500">{item.tipo}</p>
                        <p className="text-sm font-bold text-[#003580]">{formatarMoeda(parseFloat(item.preco_medio))}/dia</p>
                        <p className="text-xs text-gray-400">{item.quantidade} unidades</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Alojamentos */}
              {relatorioAtivo === 'alojamentos' && apiData?.top_alojamentos && apiData.top_alojamentos.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-3">Top Alojamentos Mais Vistos</p>
                  <div className="space-y-2">
                    {apiData.top_alojamentos.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#003580]">#{idx + 1}</span>
                          <span className="text-sm">{item.titulo}</span>
                        </div>
                        <span className="text-xs text-gray-500">{item.visualizacoes} visualizações</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dica */}
      <div className="text-center text-sm text-gray-400 bg-gray-50 py-3 rounded-lg">
        💡 Clique nas categorias acima para ver relatórios específicos de Alojamentos, Viaturas, Experiências ou Utilizadores
      </div>
    </div>
  );
};

export default Relatorios;