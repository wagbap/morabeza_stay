import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Loader2, LayoutGrid, List, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import CardAlojamento from '../components/CardAlojamento';
import FiltrosLateralAlojamento from '../components/FiltrosLateralAlojamento'; 
import SearchBar from '../components/SearchBar';
import MapaInterativo from '../components/MapaInterativo';

const Alojamentos = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const filtroDestino = queryParams.get('destino') || 'Cabo Verde';
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [alojamentos, setAlojamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orcamento, setOrcamento] = useState(30000);
  const [tiposSelecionados, setTiposSelecionados] = useState([]);
  const [mapaAberto, setMapaAberto] = useState(false);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://welovepalop.com/api/get_alojamentos.php');
        setAlojamentos(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Erro na API Morabeza:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
  }, []);

  const alojamentosFiltrados = alojamentos.filter(casa => {
    const atendePreco = Number(casa.preco_noite || 0) <= orcamento;
    const atendeTipo = tiposSelecionados.length === 0 || tiposSelecionados.includes(casa.tipo);
    const isGeral = !filtroDestino || filtroDestino === 'Cabo Verde' || filtroDestino === '';
    const atendeDestino = isGeral || casa.localizacao?.toLowerCase().includes(filtroDestino.toLowerCase());
    return atendePreco && atendeTipo && atendeDestino;
  });

  return (
    <div className="min-h-screen bg-[#f1f5f9] pt-24 pb-16">
      <Helmet>
        <title>MorabezaStay | {filtroDestino}</title>
      </Helmet>

      <div className="bg-white shadow-sm py-4 border-b border-gray-100 mb-8 px-4">
        <SearchBar />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex gap-2">
          <span className="text-blue-600">Início</span> / <span>{filtroDestino}</span>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
          <aside className="w-full lg:col-span-3 lg:sticky lg:top-28 z-10">
            <FiltrosLateralAlojamento 
              orcamento={orcamento} 
              setOrcamento={setOrcamento} 
              tiposSelecionados={tiposSelecionados}
              setTiposSelecionados={setTiposSelecionados}
              totalEncontrados={alojamentosFiltrados.length}
              onAbrirMapa={() => setMapaAberto(true)}
            />
          </aside>

          <main className="w-full lg:col-span-9 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-baseline gap-3">
                {filtroDestino}: <span className="text-blue-600 text-4xl">{alojamentosFiltrados.length}</span> opções
              </h1>
              
              <div className="flex items-center gap-2 bg-white p-1 rounded-full shadow-sm border border-gray-100 self-end md:self-auto">
                <button className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest active">
                  Sugestões
                </button>
                <div className="w-px h-6 bg-gray-100 mx-1"></div>
                
                {/* Botões de Alternância Funcionais */}
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

            <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl mb-8 flex items-center gap-3 text-sm font-medium">
              <Loader2 size={18} className="animate-spin text-blue-600" />
              Preços finais com taxas incluídas.
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 opacity-20">
                <Loader2 size={40} className="animate-spin mb-4 text-blue-600" />
                <p className="font-black uppercase tracking-widest text-[10px]">A sincronizar...</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" 
                : "flex flex-col gap-6"
              }>
                {alojamentosFiltrados.length > 0 ? (
                  alojamentosFiltrados.map(casa => (
                    <CardAlojamento key={casa.id} {...casa} isList={viewMode === 'list'} />
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                    <Info size={40} className="text-gray-300" />
                    <p className="text-gray-400 font-bold uppercase text-xs">Nenhum alojamento encontrado.</p>
                    <button onClick={() => { setOrcamento(30000); setTiposSelecionados([]); }} className="text-blue-600 font-black text-[10px] underline">Limpar Filtros</button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <MapaInterativo 
        isOpen={mapaAberto} 
        onClose={() => setMapaAberto(false)} 
        dadosAlojamentos={alojamentos} 
      />
    </div>
  );
};

export default Alojamentos;