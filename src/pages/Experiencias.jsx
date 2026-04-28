import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Loader2, LayoutGrid, List, Info, ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Componentes Importados
import ExperiencesHero from '../components/ExperiencesHero';
import SearchBarExperiencias from '../components/SearchBarExperiencias';
import FiltroLateralExperiencia from '../components/FiltroLateralExperiencia';
import CardExperiencia from '../components/CardExperiencia';

const Experiencias = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Estados de Dados
  const [experiencias, setExperiencias] = useState([]);
  const [experienciasFiltradas, setExperienciasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  // Estados de Filtro
  const [orcamento, setOrcamento] = useState(50000);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [filtroDestino, setFiltroDestino] = useState(queryParams.get('localizacao') || '');

  // Função principal de busca (API)
  const buscarDados = async (queryString = '') => {
    try {
      setLoading(true);
      let url = 'https://welovepalop.com/api/get_experiencias.php';
      if (queryString) url += `?${queryString}`;
      
      const response = await axios.get(url);
      if (response.data.success) {
        setExperiencias(response.data.data);
      } else {
        // Fallback caso a estrutura mude
        setExperiencias(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar experiências:", error);
    } finally {
      setLoading(false);
    }
  };

  // Efeito Inicial
  useEffect(() => {
    buscarDados();
  }, []);

  // Lógica de Filtragem Local (Preço, Categoria e Localização do Hero)
  useEffect(() => {
    const filtradas = experiencias.filter(exp => {
      const preco = parseFloat(exp.preco || 0);
      const atendePreco = preco <= orcamento;
      const atendeCategoria = categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(exp.categoria_nome);
      
      const buscaSimples = filtroDestino.toLowerCase();
      const atendeDestino = !filtroDestino || 
                           exp.localizacao?.toLowerCase().includes(buscaSimples) ||
                           exp.ilha?.toLowerCase().includes(buscaSimples) ||
                           exp.categoria_nome?.toLowerCase().includes(buscaSimples);

      return atendePreco && atendeCategoria && atendeDestino;
    });
    setExperienciasFiltradas(filtradas);
  }, [experiencias, orcamento, categoriasSelecionadas, filtroDestino]);

  // Handler para a SearchBar do Hero
  const handleSearchBar = (queryString) => {
    // Extrai o termo de busca para filtrar localmente também
    const params = new URLSearchParams(queryString);
    setFiltroDestino(params.get('search') || '');
    buscarDados(queryString);
  };

  const limparFiltros = () => {
    setOrcamento(50000);
    setCategoriasSelecionadas([]);
    setFiltroDestino('');
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen">
      <Helmet>
        <title>MorabezaStay | Experiências {filtroDestino && `em ${filtroDestino}`}</title>
      </Helmet>

      {/* SEÇÃO HERO + BUSCA INTEGRADA */}
      <ExperiencesHero />
      <div className="relative -mt-12 z-40 px-4 flex justify-center">
        <div className="w-full max-w-6xl">
          <SearchBarExperiencias onBuscar={handleSearchBar} />
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto py-16 px-6">
        {/* BREADCRUMBS */}
        <div className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 flex gap-2">
          <span className="text-blue-600">Início</span> / <span>Experiências</span> 
          {filtroDestino && <> / <span className="text-gray-900">{filtroDestino}</span></>}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 items-start">
          
          {/* SIDEBAR DE FILTROS */}
          <aside className="w-full lg:col-span-3 lg:sticky lg:top-28 z-10">
            <FiltroLateralExperiencia 
              orcamento={orcamento} 
              setOrcamento={setOrcamento} 
              tiposSelecionados={categoriasSelecionadas}
              setTiposSelecionados={setCategoriasSelecionadas}
              totalEncontrados={experienciasFiltradas.length}
            />
          </aside>

          {/* LISTAGEM DE RESULTADOS */}
          <div className="w-full lg:col-span-9">
            
            {/* HEADER DA LISTAGEM */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <h1 className="text-2xl md:text-3xl font-black text-[#1a2b6d] leading-tight italic uppercase tracking-tighter">
                {filtroDestino || "Explorar"}: <span className="text-blue-600 text-4xl">{experienciasFiltradas.length}</span> resultados
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

            {/* GRID OU LISTA */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 size={40} className="animate-spin mb-4 text-blue-600 opacity-20" />
                <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">A carregar aventuras...</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" 
                : "flex flex-col gap-6"
              }>
                {experienciasFiltradas.length > 0 ? (
                  experienciasFiltradas.map(exp => (
                    <CardExperiencia key={exp.id} {...exp} isList={viewMode === 'list'} />
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                    <Info size={40} className="text-gray-300" />
                    <p className="text-gray-400 font-bold">Não encontramos o que procura.</p>
                    <button onClick={limparFiltros} className="text-blue-600 font-black text-[10px] underline uppercase">
                      Limpar todos os filtros
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA FINAL (FOOTER PROMO) */}
        <div className="mt-24">
          <div className="relative rounded-[2.5rem] overflow-hidden h-[300px] flex items-center shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200" 
              className="absolute inset-0 w-full h-full object-cover" 
              alt="Background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"></div>
            <div className="relative z-10 p-12 max-w-lg">
              <h2 className="text-3xl font-black text-gray-900 leading-tight mb-4 tracking-tighter uppercase italic">
                Encontre o lugar perfeito para se hospedar
              </h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl transition-all flex items-center gap-2">
                Buscar Alojamentos <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Experiencias;