import React, { useState, useEffect } from 'react';
import ExperiencesHero from '../components/ExperiencesHero';
import SearchBarExperiencias from '../components/SearchBarExperiencias';
import SidebarFiltros from '../components/SidebarFiltros';
import CardExperienciaRow from '../components/CardExperienciaRow';

const Experiencias = () => {
  const [experiencias, setExperiencias] = useState([]);
  const [experienciasFiltradas, setExperienciasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  
  const [filtros, setFiltros] = useState({
    precoMin: 0,
    precoMax: 10000,
    categorias: []
  });

  const buscarExperiencias = async (queryString = '') => {
    try {
      setLoading(true);
      let url = 'https://welovepalop.com/api/get_experiencias.php';
      if (queryString) {
        url += `?${queryString}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados da API');
      }

      const resultado = await response.json();

      if (resultado.success) {
        setExperiencias(resultado.data);
        aplicarFiltrosNosDados(resultado.data, filtros);
      } else {
        setExperiencias(resultado);
        aplicarFiltrosNosDados(resultado, filtros);
      }

    } catch (err) {
      setErro(err.message);
      console.error("Erro na busca:", err);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltrosNosDados = (dados, filtrosAtuais) => {
    let filtradas = [...dados];
    
    filtradas = filtradas.filter(exp => {
      const preco = parseFloat(exp.preco);
      return preco >= filtrosAtuais.precoMin && preco <= filtrosAtuais.precoMax;
    });
    
    if (filtrosAtuais.categorias.length > 0) {
      filtradas = filtradas.filter(exp => {
        return filtrosAtuais.categorias.includes(exp.categoria_nome);
      });
    }
    
    setExperienciasFiltradas(filtradas);
  };

  useEffect(() => {
    buscarExperiencias();
  }, []);

  const aplicarFiltros = (novosFiltros) => {
    setFiltros(novosFiltros);
    aplicarFiltrosNosDados(experiencias, novosFiltros);
  };

  const handleBuscarExperiencias = async (queryString) => {
    await buscarExperiencias(queryString);
  };

  const limparFiltros = () => {
    const filtrosLimpos = {
      precoMin: 0,
      precoMax: 10000,
      categorias: []
    };
    setFiltros(filtrosLimpos);
    aplicarFiltrosNosDados(experiencias, filtrosLimpos);
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen">
      <ExperiencesHero />

      <div className="relative -mt-12 z-40 px-4 flex justify-center">
        <div className="w-full max-w-6xl">
          <SearchBarExperiencias onBuscar={handleBuscarExperiencias} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-16 px-6">
        <div className="flex flex-col md:flex-row gap-12">
          
          <aside className="w-full md:w-1/4">
            <SidebarFiltros 
              onFiltrar={aplicarFiltros}
              onLimpar={limparFiltros}
              filtrosAtuais={filtros}
            />
          </aside>

          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-900 mb-8 italic uppercase tracking-tighter">
              Encontre aventuras incríveis para sua estadia
            </h2>
            
            <div className="flex flex-col gap-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-full h-64 bg-gray-200 animate-pulse rounded-[2rem]"></div>
                  ))}
                </div>
              ) : erro ? (
                <div className="p-8 bg-red-50 text-red-500 rounded-2xl border border-red-100">
                  <p className="font-bold">Ops! Algo correu mal:</p>
                  <p className="text-sm">{erro}</p>
                </div>
              ) : experienciasFiltradas.length > 0 ? (
                experienciasFiltradas.map(exp => (
                  <CardExperienciaRow 
                    key={exp.id} 
                    dados={exp} 
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 py-10">Nenhuma experiência encontrada com os filtros selecionados.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-24">
          <div className="relative rounded-[2.5rem] overflow-hidden h-[300px] flex items-center shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200" 
              className="absolute inset-0 w-full h-full object-cover" 
              alt="Footer Background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"></div>
            <div className="relative z-10 p-12 max-w-lg">
              <h2 className="text-3xl font-black text-gray-900 leading-tight mb-4 tracking-tighter uppercase italic">
                Encontre o lugar perfeito para se hospedar
              </h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl transition-all flex items-center gap-2">
                Buscar Alojamentos <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Experiencias;