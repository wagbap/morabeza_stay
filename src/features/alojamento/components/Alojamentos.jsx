import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Loader2, LayoutGrid, List, Info, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

// Componentes Importados
import CardAlojamento from './CardAlojamento';
import FiltrosLateralAlojamento from './FiltrosLateralAlojamento'; 
import SearchBar from './SearchBarAlojamento';
import AlojamentoHero from './AlojamentoHero';

const Alojamentos = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  // Estados de Dados
  const [alojamentos, setAlojamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  // Estados de Filtro
  const [orcamento, setOrcamento] = useState(30000);
  const [tiposSelecionados, setTiposSelecionados] = useState([]);
  const [mapaAberto, setMapaAberto] = useState(false);
  const filtroDestino = queryParams.get('destino') || '';

  // Função de carregamento da API
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

  // Lógica de Filtragem Local
  const alojamentosFiltrados = alojamentos.filter(casa => {
    const atendePreco = Number(casa.preco_noite || 0) <= orcamento;
    const atendeTipo = tiposSelecionados.length === 0 || tiposSelecionados.includes(casa.tipo);
    const isGeral = !filtroDestino || filtroDestino === 'Cabo Verde' || filtroDestino === '';
    const atendeDestino = isGeral || casa.localizacao?.toLowerCase().includes(filtroDestino.toLowerCase());
    return atendePreco && atendeTipo && atendeDestino;
  });

  const limparFiltros = () => {
    setOrcamento(30000);
    setTiposSelecionados([]);
    navigate('/alojamentos', { replace: true });
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen">
      <Helmet>
        <title>MorabezaStay | {t('alojamentos')} {filtroDestino && `${t('em')} ${filtroDestino}`}</title>
      </Helmet>

      <AlojamentoHero />

      <div className="relative -mt-12 z-40 px-4 flex justify-center">
        <div className="w-full max-w-6xl">
          <SearchBar />
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto py-16 px-4 md:px-6">
        {/* BREADCRUMBS */}
        <div className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 flex gap-2">
          <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/')}>{t('inicio')}</span> / <span>{t('alojamentos')}</span>
          {filtroDestino && <> / <span className="text-gray-900">{filtroDestino}</span></>}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 items-start">
          
          {/* SIDEBAR DE FILTROS */}
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

          {/* LISTAGEM DE RESULTADOS */}
          <div className="w-full lg:col-span-9">
            
            {/* HEADER DA LISTAGEM */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <h1 className="text-2xl md:text-3xl font-black text-[#1a2b6d] leading-tight italic uppercase tracking-tighter text-left">
                {filtroDestino || t('explorar')}: <span className="text-blue-600 text-4xl">{alojamentosFiltrados.length}</span> {t('opcoes')}
              </h1>
              
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-100 self-end md:self-auto">
                <button className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {t('sugestoes')}
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

            {/* AVISO DE PREÇO FINAL */}
            <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl mb-8 flex items-center gap-3 text-sm font-medium text-left">
              <Info size={18} className="text-blue-600" />
              {t('precos_finais_com_taxas')}
            </div>

            {/* GRID OU LISTA COM CARREGAMENTO PADRONIZADO */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <Loader2 size={40} className="animate-spin mb-4 text-blue-600 opacity-20" />
                <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">{t('sincronizar_espacos')}</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 text-left" 
                : "flex flex-col gap-6 text-left"
              }>
                {alojamentosFiltrados.length > 0 ? (
                  alojamentosFiltrados.map(casa => (
                    <CardAlojamento key={casa.id} {...casa} isList={viewMode === 'list'} />
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                    <Info size={40} className="text-gray-300" />
                    <p className="text-gray-400 font-bold uppercase text-xs">{t('nenhum_alojamento_encontrado')}</p>
                    <button onClick={limparFiltros} className="text-blue-600 font-black text-[10px] underline uppercase">
                      {t('limpar_filtros')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA FINAL INTERLIGADO */}
        <div className="mt-24">
          <div className="relative rounded-[2.5rem] overflow-hidden h-[300px] flex items-center shadow-xl text-left">
            <img 
              src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&q=80&w=1200" 
              className="absolute inset-0 w-full h-full object-cover" 
              alt={t('aventuras_cabo_verde')}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"></div>
            <div className="relative z-10 p-12 max-w-lg">
              <h2 className="text-3xl font-black text-gray-900 leading-tight mb-4 tracking-tighter uppercase italic">
                {t('viva_aventuras_inesqueciveis')}
              </h2>
              <button 
                onClick={() => navigate('/experiencias')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl transition-all flex items-center gap-2"
              >
                {t('buscar_experiencias')} <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Alojamentos;