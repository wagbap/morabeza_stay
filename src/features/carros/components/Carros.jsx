import BarraResultadosLista from '../../../components/BarraResultadosLista';
import { useTranslation } from 'react-i18next';
import PaginacaoAnuncios from '../../../components/PaginacaoAnuncios';
import usePaginacao from '../../../hooks/usePaginacao';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../../../api/api';
import { filtrarCarrosAprovados } from '../utils/publicacaoCarro';
import { correspondePesquisaCarro } from '../utils/pesquisaCarros';
import { Helmet } from 'react-helmet-async';
import { Loader2, Info } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import CarrosHero from './CarrosHero';
import SearchBarCarros from './SearchBarCarros';
import CardCarro from './CardCarro';
import FiltrosLateralCarros from './FiltrosLateralCarros';

const Carros = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const apiParams = new URLSearchParams(location.search);
  apiParams.delete('search'); apiParams.delete('campo');
  const pesquisaApi = `?${apiParams}`;

  // Estados de Dados
  const [resultado, setResultado] = useState(null);
  const loading = resultado?.key !== pesquisaApi;
  const carros = useMemo(() => resultado?.key === pesquisaApi ? resultado.carros : [], [resultado, pesquisaApi]);
  const [viewMode, setViewMode] = useState('grid');
  const [ordenar, setOrdenar] = useState('recomendados');

  // Estados de Filtro
  const [orcamento, setOrcamento] = useState(30000); 
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const filtroBusca = queryParams.get('search') || '';
  const filtroCampo = queryParams.get('campo') || '';
  const filtroLocal = queryParams.get('localizacao') || '';

  useEffect(() => {
    const c = new AbortController();
    api.get(`/get_carro.php${pesquisaApi}`, { signal: c.signal }).then(({ data }) => {
      if (!c.signal.aborted) setResultado({ key: pesquisaApi, carros: filtrarCarrosAprovados(data.success ? data.data : data) });
    }).catch(() => { if (!c.signal.aborted) setResultado({ key: pesquisaApi, carros: [] }); });
    return () => c.abort();
  }, [pesquisaApi]);

  // Lógica de Filtragem Local corrigida
  const carrosFiltrados = useMemo(() => carros.filter(carro => {
      // 1. Filtro de Preço (Garante que compara números)
      const preco = Number(carro.preco_dia || carro.preco_diaria || 0);
      const atendePreco = preco <= orcamento;
      
      // 2. Filtro por Categoria/Tipo
      const atendeCategoria = categoriasSelecionadas.length === 0 || 
                               categoriasSelecionadas.includes(carro.tipo) ||
                               categoriasSelecionadas.includes(carro.combustivel);
      
      // 3. Filtro de Busca Texto
      const atendeBusca = correspondePesquisaCarro(carro, filtroBusca, filtroCampo);
      const atendeLocal = !filtroLocal || String(carro.localizacao || '').toLocaleLowerCase().includes(filtroLocal.toLocaleLowerCase());
      return atendePreco && atendeCategoria && atendeBusca && atendeLocal;
    }), [carros, orcamento, categoriasSelecionadas, filtroBusca, filtroCampo, filtroLocal]);

  const carrosOrdenados = useMemo(() => {
    const lista = [...carrosFiltrados];
    const preco = carro => Number(carro.preco_dia || carro.preco_diaria || 0);
    if(ordenar === 'preco_asc') lista.sort((a,b) => preco(a)-preco(b));
    if(ordenar === 'preco_desc') lista.sort((a,b) => preco(b)-preco(a));
    if(ordenar === 'avaliacao') lista.sort((a,b) => Number(b.rating || b.media_rating || 0)-Number(a.rating || a.media_rating || 0));
    return lista;
  }, [carrosFiltrados,ordenar]);

  const resultadosRef = useRef(null);
  const paginacao = usePaginacao(carrosOrdenados, JSON.stringify([location.search, orcamento, categoriasSelecionadas, filtroBusca, ordenar]), 9);
  const mudarPagina = pagina => {
    paginacao.onPage(pagina);
    resultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSearchBar = (queryString) => {
    navigate({ pathname: '/carros', search: queryString ? `?${queryString}` : '' });
  };

  const limparFiltros = () => {
    setOrcamento(30000);
    setCategoriasSelecionadas([]);
    navigate('/carros');
  };

  return (
    <div className="bg-white min-h-screen pb-20 text-left">
      <Helmet>
        <title>MorabezaStay | Aluguer de Carros</title>
      </Helmet>

      <CarrosHero />
      
      <div className="relative -mt-12 z-40 px-4 flex justify-center">
        <div className="w-full max-w-7xl">
          <SearchBarCarros onBuscar={handleSearchBar} />
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto py-16 px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2 text-left text-xs font-semibold text-gray-500"><span className="cursor-pointer text-blue-600" onClick={() => navigate('/')}>{t('inicio')}</span> / <span>{t('carros')}</span></div>
        <div className="flex flex-col items-start gap-8 lg:grid lg:grid-cols-[minmax(230px,340px)_minmax(0,1fr)] xl:gap-12">
          
          <aside className="z-10 w-full min-w-0 lg:sticky lg:top-28">
            <FiltrosLateralCarros 
              pesquisa={filtroBusca}
              onPesquisaChange={value => { const params = new URLSearchParams(location.search); if(value) { params.set('search', value); params.set('campo','marca_modelo'); } else { params.delete('search'); params.delete('campo'); } navigate({search:`?${params}`},{replace:true}); }}
              orcamento={orcamento} 
              setOrcamento={setOrcamento} 
              tiposSelecionados={categoriasSelecionadas}
              setTiposSelecionados={setCategoriasSelecionadas}
              totalEncontrados={carrosFiltrados.length}
            />
          </aside>

          <div ref={resultadosRef} className="w-full min-w-0 scroll-mt-6">
            <BarraResultadosLista total={carrosFiltrados.length} ordenar={ordenar} onOrdenar={setOrdenar} viewMode={viewMode} onViewMode={setViewMode} />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 size={40} className="animate-spin mb-4 text-blue-600 opacity-20" />
                <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">A procurar veículos...</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 gap-8" 
                : "flex flex-col gap-6"
              }>
                {carrosFiltrados.length > 0 ? (
                  paginacao.items.map(carro => (
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
            {!loading && <PaginacaoAnuncios total={paginacao.total} pagina={paginacao.page} porPagina={9} onChange={mudarPagina} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Carros;
