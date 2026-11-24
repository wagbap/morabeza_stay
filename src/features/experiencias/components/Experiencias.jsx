import BarraResultadosLista from '../../../components/BarraResultadosLista';
import PaginacaoAnuncios from '../../../components/PaginacaoAnuncios';
import usePaginacao from '../../../hooks/usePaginacao';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../../../api/api';
import { Helmet } from 'react-helmet-async';
import { Loader2, Info, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

// Componentes Importados
import ExperiencesHero from './ExperiencesHero';
import SearchBarExperiencias from './SearchBarExperiencias';
import FiltroLateralExperiencia from './FiltroLateralExperiencia';
import CardExperiencia from './CardExperiencia';

const Experiencias = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  // Estados de Dados
  const [resultado, setResultado] = useState(null);
  const [zonasPesquisa, setZonasPesquisa] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [ordenar, setOrdenar] = useState('recomendados');
  
  // Estados de Filtro
  const [orcamento, setOrcamento] = useState(50000);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const filtroNome = queryParams.get('nome') || '';
  const apiParams = new URLSearchParams(location.search);
  apiParams.delete('nome');
  const pesquisaApi = apiParams.toString();
  const loading = resultado?.key !== pesquisaApi;
  const experiencias = useMemo(() => resultado?.key === pesquisaApi ? resultado.data : [], [resultado,pesquisaApi]);
  const filtroIlha = 'Santiago';
  const filtroZona = queryParams.get('localizacao') || '';
  const filtroTipo = queryParams.get('tipo_experiencia') || '';
  const filtroDestino = filtroZona || filtroIlha;

  // Search options must come from the full island catalog, not filtered results.
  useEffect(() => {
    const controller = new AbortController();
    api.get('/get_experiencias.php?destino=Santiago', { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        const rows = Array.isArray(data) ? data : data.success && Array.isArray(data.data) ? data.data : [];
        setZonasPesquisa(rows.map(({ ilha, localizacao }) => ({ ilha, localizacao })));
      })
      .catch(() => { /* Current results remain available if the catalog fails. */ });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const legacyDates = params.has('data_inicio') || params.has('data_fim');
    if (params.get('destino') !== 'Santiago' || legacyDates) {
      if (!params.get('data') && params.get('data_inicio')) params.set('data',params.get('data_inicio'));
      params.delete('data_inicio'); params.delete('data_fim');
      params.set('destino', 'Santiago');
      navigate(`/experiencias?${params}`, { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (new URLSearchParams(pesquisaApi).get('destino') !== 'Santiago') return;
    const controller = new AbortController();
    api.get(`/get_experiencias.php?${pesquisaApi}`, {signal:controller.signal}).then(({data}) => {
      if(controller.signal.aborted) return;
      const rows = Array.isArray(data) ? data : data.success && Array.isArray(data.data) ? data.data : [];
      setResultado({key:pesquisaApi,data:rows});
    }).catch(() => { if(!controller.signal.aborted) setResultado({key:pesquisaApi,data:[]}); });
    return () => controller.abort();
  }, [pesquisaApi]);

  // Lógica de Filtragem Local
  const experienciasFiltradas = useMemo(() => {
    return experiencias.filter(exp => {
      const preco = parseFloat(exp.preco || 0);
      const atendePreco = preco <= orcamento;
      const atendeCategoria = categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(exp.categoria_nome);
      
      const normalizar = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const atendeIlha = !filtroIlha || normalizar(exp.ilha).includes(normalizar(filtroIlha));
      const atendeZona = !filtroZona || normalizar(exp.localizacao).includes(normalizar(filtroZona));
      const texto = normalizar([exp.titulo, exp.categoria_nome, exp.descricao, exp.equipamento_nome, exp.tipo].filter(Boolean).join(' '));
      const termos = { 'jet-ski': ['jet ski','jet-ski','jetski','mota de agua'], quad: ['quad','atv','moto4'], barco: ['barco','boat','catamara','veleiro'], 'visita-guiada': ['visita','guia','guided','tour'] };
      const atendeTipo = !filtroTipo || (termos[filtroTipo] || [filtroTipo]).some(termo => texto.includes(termo));
      return atendePreco && atendeCategoria && atendeIlha && atendeZona && atendeTipo && normalizar(exp.titulo || exp.nome).includes(normalizar(filtroNome));
    });
  }, [experiencias, orcamento, categoriasSelecionadas, filtroIlha, filtroZona, filtroTipo, filtroNome]);

  // Lógica de Ordenação
  const experienciasOrdenadas = [...experienciasFiltradas].sort((a, b) => {
    if (ordenar === 'preco_asc') {
      return Number(a.preco || 0) - Number(b.preco || 0);
    }
    if (ordenar === 'preco_desc') {
      return Number(b.preco || 0) - Number(a.preco || 0);
    }
    if (ordenar === 'avaliacao') {
      return Number(b.rating || 0) - Number(a.rating || 0);
    }
    // recomendados (default) — mantém ordem da API
    return 0;
  });

  const resultadosRef = useRef(null);
  const paginacao = usePaginacao(experienciasOrdenadas, JSON.stringify([location.search, orcamento, categoriasSelecionadas, filtroDestino, ordenar]), 9);
  const mudarPagina = pagina => {
    paginacao.onPage(pagina);
    resultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Handler para a SearchBar
  const handleSearchBar = (queryString) => {
    
    navigate(`/experiencias?${queryString}`, { replace: true });

  };

  const limparFiltros = () => {
    setOrcamento(50000);
    setCategoriasSelecionadas([]);
    setOrdenar('recomendados');
    navigate('/experiencias', { replace: true });

  };

  return (
    <div data-exp-page className="min-h-screen bg-white text-[#09082e]">
      <Helmet>
        <title>MorabezaStay | {t('experiencias')} {filtroDestino && `${t('em')} ${filtroDestino}`}</title>
      </Helmet>

      {/* SEÇÃO HERO + BUSCA INTEGRADA */}
      <ExperiencesHero />
      <div className="relative -mt-12 z-40 flex justify-center px-4 ">
        <div className="w-full max-w-7xl">
          <SearchBarExperiencias onBuscar={handleSearchBar} zonas={[...zonasPesquisa, ...experiencias]} />
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-16 sm:px-6">
        {/* BREADCRUMBS */}
        <div className="mb-6 flex flex-wrap gap-2 text-left text-xs font-semibold text-gray-500">
          <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/')}>{t('inicio')}</span> / <span>{t('experiencias')}</span> 

        </div>

        <div className="flex flex-col items-start gap-8 lg:grid lg:grid-cols-[minmax(230px,340px)_minmax(0,1fr)] xl:gap-12">
          
          {/* SIDEBAR DE FILTROS */}
          <aside className="z-10 w-full min-w-0 lg:sticky lg:top-28">
            <FiltroLateralExperiencia 
              pesquisa={filtroNome}
              onPesquisaChange={value => { const params = new URLSearchParams(location.search); if(value) params.set('nome',value); else params.delete('nome'); navigate({search:`?${params}`},{replace:true}); }}
              orcamento={orcamento} 
              setOrcamento={setOrcamento} 
              tiposSelecionados={categoriasSelecionadas}
              setTiposSelecionados={setCategoriasSelecionadas}
              totalEncontrados={experienciasOrdenadas.length}
            />
          </aside>

          {/* LISTAGEM DE RESULTADOS */}
          <div ref={resultadosRef} className="w-full min-w-0 scroll-mt-6">
            
            {/* HEADER DA LISTAGEM */}
            <BarraResultadosLista total={experienciasOrdenadas.length} ordenar={ordenar} onOrdenar={setOrdenar} viewMode={viewMode} onViewMode={setViewMode} />

            {/* GRID OU LISTA */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 size={40} className="animate-spin mb-4 text-blue-600 opacity-20" />
                <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">{t('carregando_aventuras')}</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 gap-10 text-left md:grid-cols-2" 
                : "flex flex-col gap-6 text-left"
              }>
                {experienciasOrdenadas.length > 0 ? (
                  paginacao.items.map(exp => (
                    <CardExperiencia key={exp.id} {...exp} isList={viewMode === 'list'} />
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                    <Info size={40} className="text-gray-300" />
                    <p className="text-gray-400 font-bold">{t('nenhuma_experiencia_encontrada')}</p>
                    <button onClick={limparFiltros} className="text-blue-600 font-black text-[10px] underline uppercase">
                      {t('limpar_todos_filtros')}
                    </button>
                  </div>
                )}
              </div>
            )}
            {!loading && <PaginacaoAnuncios total={paginacao.total} pagina={paginacao.page} porPagina={9} onChange={mudarPagina} />}
          </div>
        </div>

        {/* CTA FINAL (FOOTER PROMO) */}
        <div className="mt-24">
          <div className="relative rounded-[2.5rem] overflow-hidden h-[300px] flex items-center shadow-xl text-left">
            <img 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200" 
              className="absolute inset-0 w-full h-full object-cover" 
              alt={t('background_promocional')}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"></div>
            <div className="relative z-10 max-w-lg p-6 sm:p-12">
              <h2 className="text-3xl font-black text-gray-900 leading-tight mb-4 tracking-tighter uppercase italic">
                {t('encontre_lugar_perfeito')}
              </h2>
              <button 
                onClick={() => navigate('/alojamentos')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-4 rounded-2xl sm:px-8 transition-all flex items-center gap-2"
              >
                {t('buscar_alojamentos')} <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Experiencias;
