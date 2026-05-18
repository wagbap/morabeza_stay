import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Loader2, LayoutGrid, List, Info, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

// Componentes Importados
import CarrosHero from './CarrosHero';
import SearchBarCarros from './SearchBarCarros';
import CardCarro from './CardCarro';
import FiltrosLateralCarros from './FiltrosLateralCarros';

const Carros = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  // Estados de Dados
  const [carros, setCarros] = useState([]);
  const [carrosFiltradas, setCarrosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  // Estados de Filtro
  const [orcamento, setOrcamento] = useState(30000); 
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [filtroBusca, setFiltroBusca] = useState(queryParams.get('localizacao') || '');

  // Busca na API - Envolvida em useCallback para evitar loops de renderização
  const buscarDados = useCallback(async (queryString = '') => {
    try {
      setLoading(true);
      let url = 'https://welovepalop.com/api/get_carro.php'; 
      if (queryString) url += `?${queryString}`;
      
      const response = await axios.get(url);
      if (response.data.success) {
        setCarros(response.data.data);
      } else {
        setCarros(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
      setCarros([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito Inicial sincronizado com os parâmetros da URL atual
  useEffect(() => {
    const currentQuery = location.search.replace('?', '');
    buscarDados(currentQuery);
  }, [location.search, buscarDados]);

  // Lógica de Filtragem Local
  useEffect(() => {
    const filtrados = carros.filter(carro => {
      // 1. Filtro de Preço
      const preco = Number(carro.preco_dia || carro.preco_diaria || 0);
      const atendePreco = preco <= orcamento;
      
      // 2. Filtro por Categoria/Tipo
      const atendeCategoria = categoriasSelecionadas.length === 0 || 
                             categoriasSelecionadas.includes(carro.tipo) ||
                             categoriasSelecionadas.includes(carro.combustivel);
      
      // 3. Filtro de Busca Texto
      const busca = filtroBusca.toLowerCase();
      const atendeBusca = !filtroBusca || 
                          carro.titulo?.toLowerCase().includes(busca) ||
                          carro.marca?.toLowerCase().includes(busca) ||
                          carro.localizacao?.toLowerCase().includes(busca);

      return atendePreco && atendeCategoria && atendeBusca;
    });
    setCarrosFiltrados(filtrados);
  }, [carros, orcamento, categoriasSelecionadas, filtroBusca]);

  // Handler para a SearchBar unificada
  const handleSearchBar = (queryString) => {
    const params = new URLSearchParams(queryString);
    setFiltroBusca(params.get('localizacao') || '');
    
    // Sincroniza o histórico de navegação com os novos critérios de datas e local
    navigate(`/carros?${queryString}`, { replace: true });
    buscarDados(queryString);
  };

  const limparFiltros = () => {
    setOrcamento(30000);
    setCategoriasSelecionadas([]);
    setFiltroBusca('');
    navigate('/carros', { replace: true });
    buscarDados();
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen text-left">
      <Helmet>
        <title>MorabezaStay | Veículos {filtroBusca && `em ${filtroBusca}`}</title>
      </Helmet>

      {/* SEÇÃO HERO + BUSCA INTEGRADA */}
      <CarrosHero />
      <div className="relative -mt-12 z-40 px-4 flex justify-center">
        <div className="w-full max-w-6xl">
          <SearchBarCarros onBuscar={handleSearchBar} />
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto py-16 px-6">
        {/* BREADCRUMBS */}
        <div className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 flex gap-2">
          <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/')}>Início</span> / <span>Veículos</span> 
          {filtroBusca && <> / <span className="text-gray-900">{filtroBusca}</span></>}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 items-start">
          
          {/* SIDEBAR DE FILTROS */}
          <aside className="w-full lg:col-span-3 lg:sticky lg:top-28 z-10">
            <FiltrosLateralCarros 
              orcamento={orcamento} 
              setOrcamento={setOrcamento} 
              tiposSelecionados={categoriasSelecionadas}
              setTiposSelecionados={setCategoriasSelecionadas}
              totalEncontrados={carrosFiltradas.length}
            />
          </aside>

          {/* LISTAGEM DE RESULTADOS */}
          <div className="w-full lg:col-span-9">
            
            {/* HEADER DA LISTAGEM */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <h1 className="text-2xl md:text-3xl font-black text-[#1a2b6d] leading-tight italic uppercase tracking-tighter">
                {filtroBusca || "Explorar"}: <span className="text-blue-600 text-4xl">{carrosFiltradas.length}</span> disponíveis
              </h1>
              
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
                <button className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Mais Relevantes
                </button>
                <div className="w-px h-6 bg-gray-100 mx-1"></div>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-full transition-all ${viewMode === 'grid' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-full transition-all ${viewMode === 'list' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* GRID OU LISTA COM ANIMAÇÕES SIMÉTRICAS */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 size={40} className="animate-spin mb-4 text-blue-600 opacity-20" />
                <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">A sincronizar frota...</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 text-left" 
                : "flex flex-col gap-6 text-left"
              }>
                {carrosFiltradas.length > 0 ? (
                  carrosFiltradas.map(carro => (
                    <CardCarro key={carro.id} carro={carro} isList={viewMode === 'list'} />
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                    <Info size={40} className="text-gray-300" />
                    <p className="text-gray-400 font-bold">Nenhum veículo encontrado para esta busca.</p>
                    <button onClick={limparFiltros} className="text-blue-600 font-black text-[10px] underline uppercase">
                      Ver todos os carros
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA FINAL INTERLIGADO (PROMOÇÃO DE EXPERIÊNCIAS) */}
        <div className="mt-24">
          <div className="relative rounded-[2.5rem] overflow-hidden h-[300px] flex items-center shadow-xl text-left">
            <img 
              src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&q=80&w=1200" 
              className="absolute inset-0 w-full h-full object-cover" 
              alt="Atividades Morabeza"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"></div>
            <div className="relative z-10 p-12 max-w-lg">
              <h2 className="text-3xl font-black text-gray-900 leading-tight mb-4 tracking-tighter uppercase italic">
                Descubra as melhores atividades nas ilhas
              </h2>
              <button 
                onClick={() => navigate('/experiencias')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl transition-all flex items-center gap-2"
              >
                Buscar Experiências <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Carros;