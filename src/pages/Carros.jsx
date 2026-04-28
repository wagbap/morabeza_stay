import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Loader2, LayoutGrid, List, Info } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import CarrosHero from '../components/CarrosHero';
import SearchBarCarros from '../components/SearchBarCarros';
import FiltrosCarros from '../components/FiltrosLateralCarros'; 
import CardCarro from '../components/CardCarro';

const Carros = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Estados de Dados
  const [carros, setCarros] = useState([]);
  const [carrosFiltrados, setCarrosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  // Estados de Filtro
  const [orcamento, setOrcamento] = useState(30000); 
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [filtroBusca, setFiltroBusca] = useState(queryParams.get('search') || '');

  // Busca na API
  const buscarDados = async (queryString = '') => {
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
  };

  useEffect(() => {
    buscarDados();
  }, []);

  // Lógica de Filtragem Local corrigida
  useEffect(() => {
    const filtrados = carros.filter(carro => {
      // 1. Filtro de Preço (Garante que compara números)
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

  const handleSearchBar = (queryString) => {
    const params = new URLSearchParams(queryString);
    setFiltroBusca(params.get('localizacao') || '');
    buscarDados(queryString);
  };

  const limparFiltros = () => {
    setOrcamento(30000);
    setCategoriasSelecionadas([]);
    setFiltroBusca('');
    buscarDados();
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen pb-20 text-left">
      <Helmet>
        <title>MorabezaStay | Aluguer de Carros</title>
      </Helmet>

      <CarrosHero />
      
      <div className="relative -mt-12 z-40 px-4 flex justify-center">
        <div className="w-full max-w-6xl">
          <SearchBarCarros onBuscar={handleSearchBar} />
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto py-16 px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 items-start">
          
          <aside className="w-full lg:col-span-3 lg:sticky lg:top-28 z-10">
            <FiltrosCarros 
              orcamento={orcamento} 
              setOrcamento={setOrcamento} 
              tiposSelecionados={categoriasSelecionadas}
              setTiposSelecionados={setCategoriasSelecionadas}
              totalEncontrados={carrosFiltrados.length}
            />
          </aside>

          <div className="w-full lg:col-span-9">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <h1 className="text-2xl md:text-3xl font-black text-[#1a2b6d] leading-tight italic uppercase tracking-tighter">
                {filtroBusca || "Veículos"}: <span className="text-blue-600 text-4xl">{carrosFiltrados.length}</span> disponíveis
              </h1>
              
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
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

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 size={40} className="animate-spin mb-4 text-blue-600 opacity-20" />
                <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">A procurar veículos...</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" 
                : "flex flex-col gap-6"
              }>
                {carrosFiltrados.length > 0 ? (
                  carrosFiltrados.map(carro => (
                    <CardCarro key={carro.id} carro={carro} />
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
      </main>
    </div>
  );
};

export default Carros;