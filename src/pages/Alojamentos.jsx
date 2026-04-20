import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Loader2, LayoutGrid, List, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

// Componentes
import CardAlojamento from '../components/CardAlojamento';
import FiltrosLaterais from '../components/FiltrosLateral'; 
import SearchBar from '../components/SearchBar';
import MapaInterativo from '../components/MapaInterativo'; // Importação do Mapa 🗺️


const Alojamentos = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Parâmetros extraídos da URL
  const filtroDestino = queryParams.get('destino') || 'Cabo Verde';
  const filtroHospedes = queryParams.get('hospedes') || '2';

  // --- Estados do Componente ---
  const [alojamentos, setAlojamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orcamento, setOrcamento] = useState(30000);
  const [tiposSelecionados, setTiposSelecionados] = useState([]);
  const [mapaAberto, setMapaAberto] = useState(false); // Estado para abrir/fechar o mapa 📍

  // --- Busca de Dados na BD ---
  useEffect(() => {
    const fetchDados = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://welovepalop.com/api/get_alojamentos.php');
        // Garante que os dados são um array antes de guardar
        setAlojamentos(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Erro na API Morabeza:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
  }, []);

  // --- Lógica de Filtragem ---
  const alojamentosFiltrados = alojamentos.filter(casa => {
    // 1. Filtro de Preço
    const atendePreco = Number(casa.preco_noite || 0) <= orcamento;
    
    // 2. Filtro de Tipo (Apartamento, Villa, etc)
    const atendeTipo = tiposSelecionados.length === 0 || tiposSelecionados.includes(casa.tipo);

    // 3. Filtro de Destino (Se for "Cabo Verde" mostra tudo)
    const isGeral = !filtroDestino || filtroDestino === 'Cabo Verde' || filtroDestino === '';
    const atendeDestino = isGeral || casa.localizacao?.toLowerCase().includes(filtroDestino.toLowerCase());

    return atendePreco && atendeTipo && atendeDestino;
  });

  return (
    <div className="min-h-screen bg-[#f1f5f9] pt-24 pb-16">
      <Helmet>
        <title>MorabezaStay | {filtroDestino}</title>
      </Helmet>

      {/* Barra de Pesquisa Superior */}
      <div className="bg-white shadow-sm py-4 border-b border-gray-100 mb-8 px-4">
        <SearchBar />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Breadcrumbs (Caminho) */}
        <div className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex gap-2">
          <span className="text-blue-600">Início</span> / <span>{filtroDestino}</span>
        </div>

        <div className="grid grid-cols-12 gap-8 items-start">
          
          {/* Coluna Lateral: Filtros */}
          <aside className="col-span-12 lg:col-span-3 sticky top-28">
            <FiltrosLaterais 
              orcamento={orcamento} 
              setOrcamento={setOrcamento} 
              tiposSelecionados={tiposSelecionados}
              setTiposSelecionados={setTiposSelecionados}
              totalEncontrados={alojamentosFiltrados.length}
              onAbrirMapa={() => setMapaAberto(true)} // Passa a função para o botão ⚡
            />
          </aside>

          {/* Coluna Principal: Lista de Alojamentos */}
          <main className="col-span-12 lg:col-span-9 text-left">
            
            {/* Cabeçalho da Lista */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-baseline gap-3">
                {filtroDestino}: <span className="text-blue-600 text-4xl">{alojamentosFiltrados.length}</span> opções
              </h1>
              
              <div className="flex items-center gap-2 bg-white p-1 rounded-full shadow-sm border border-gray-100">
                <button className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest active">
                  Sugestões
                </button>
                <div className="w-px h-6 bg-gray-100 mx-1"></div>
                <button className="p-3 rounded-full text-blue-600 bg-blue-50">
                  <LayoutGrid size={18} />
                </button>
                <button className="p-3 rounded-full text-gray-400 hover:bg-gray-50">
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Aviso de Taxas */}
            <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl mb-8 flex items-center gap-3 text-sm font-medium">
              <Loader2 size={18} className="animate-spin text-blue-600" />
              Preços finais com taxas incluídas para {filtroHospedes} hóspedes.
            </div>

            {/* Renderização Condicional: Loading ou Lista */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 opacity-20">
                <Loader2 size={40} className="animate-spin mb-4 text-blue-600" />
                <p className="font-black uppercase tracking-widest text-[10px]">A sincronizar dados...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {alojamentosFiltrados.length > 0 ? (
                  alojamentosFiltrados.map(casa => (
                    <CardAlojamento key={casa.id} {...casa} />
                  ))
                ) : (
                  /* Estado Vazio: Nenhum Resultado */
                  <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                    <Info size={40} className="text-gray-300" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs max-w-sm text-center">
                      Nenhum alojamento encontrado em {filtroDestino}.
                    </p>
                    <button 
                      onClick={() => { setOrcamento(30000); setTiposSelecionados([]); }} 
                      className="mt-4 text-blue-600 font-black uppercase text-[10px] tracking-widest underline"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* COMPONENTE DO MAPA 📍 (Controlado pelo estado mapaAberto) */}
      <MapaInterativo 
        isOpen={mapaAberto} 
        onClose={() => setMapaAberto(false)} 
        dadosAlojamentos={alojamentos} 
      />
    </div>
  );
};

export default Alojamentos;