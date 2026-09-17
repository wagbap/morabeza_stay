import React, { useState, useEffect, useMemo, useCallback, useDeferredValue, memo } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Loader2, LayoutGrid, List, Info, ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

// Componentes Importados
import CardAlojamento from './CardAlojamento';
import FiltrosLateralAlojamento from './FiltrosLateralAlojamento';
import SearchBar from './SearchBarAlojamento';
import AlojamentoHero from './AlojamentoHero';

// ============================================================
// COMPONENTES MEMOIZADOS (evitam re-render em scroll/filtros)
// ============================================================
const Breadcrumbs = memo(({ navigate, t, filtroDestino }) => (
  <div className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 flex gap-2">
    <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/')}>{t('inicio')}</span> / <span>{t('alojamentos')}</span>
    {filtroDestino && <> / <span className="text-gray-900">{filtroDestino}</span></>}
  </div>
));
Breadcrumbs.displayName = 'Breadcrumbs';

const AvisoPreco = memo(({ t }) => (
  <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl mb-8 flex items-center gap-3 text-sm font-medium text-left">
    <Info size={18} className="text-blue-600" />
    {t('precos_finais_com_taxas')}
  </div>
));
AvisoPreco.displayName = 'AvisoPreco';

const LoadingState = memo(({ t }) => (
  <div className="flex flex-col items-center justify-center py-32 text-center">
    <Loader2 size={40} className="animate-spin mb-4 text-blue-600 opacity-20" />
    <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">{t('sincronizar_espacos')}</p>
  </div>
));
LoadingState.displayName = 'LoadingState';

const EmptyState = memo(({ t, onLimpar }) => (
  <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
    <Info size={40} className="text-gray-300" />
    <p className="text-gray-400 font-bold uppercase text-xs">{t('nenhum_alojamento_encontrado')}</p>
    <button onClick={onLimpar} className="text-blue-600 font-black text-[10px] underline uppercase">
      {t('limpar_filtros')}
    </button>
  </div>
));
EmptyState.displayName = 'EmptyState';

const CTAFinal = memo(({ navigate, t }) => (
  <div className="mt-24">
    <div className="relative rounded-[2.5rem] overflow-hidden h-[300px] flex items-center shadow-xl text-left">
      <img
        src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&q=80&w=1200"
        className="absolute inset-0 w-full h-full object-cover transform-gpu"
        loading="lazy"
        decoding="async"
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
));
CTAFinal.displayName = 'CTAFinal';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const Alojamentos = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Ler destino apenas uma vez por mudança de URL
  const filtroDestino = useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get('destino') || '';
  }, [location.search]);

  // Estados de Dados
  const [alojamentos, setAlojamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [ordenar, setOrdenar] = useState('recomendados');
  const [dropdownAberto, setDropdownAberto] = useState(false);

  // Estados de Filtro
  const [orcamento, setOrcamento] = useState(30000);
  const [tiposSelecionados, setTiposSelecionados] = useState([]);
  const [mapaAberto, setMapaAberto] = useState(false);

  // 🔥 Deferred values — filtros respondem instantaneamente, a lista atualiza de forma suave
  const orcamentoDeferido = useDeferredValue(orcamento);
  const tiposDeferidos = useDeferredValue(tiposSelecionados);

  // Opções de ordenação — estáticas, sem necessidade de recriar
  const opcoesOrdenar = useMemo(() => [
    { value: 'recomendados', label: 'Recomendados' },
    { value: 'preco_asc', label: 'Preço mais baixo' },
    { value: 'preco_desc', label: 'Preço mais alto' },
    { value: 'avaliacao', label: 'Melhor avaliação' },
  ], []);

  const labelOrdenarAtual = useMemo(
    () => opcoesOrdenar.find(o => o.value === ordenar)?.label || 'Recomendados',
    [opcoesOrdenar, ordenar]
  );

  // ============================================================
  // FETCH
  // ============================================================
  useEffect(() => {
    const controller = new AbortController();

    const fetchDados = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://welovepalop.com/api/get_alojamentos.php', {
          signal: controller.signal,
        });
        setAlojamentos(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          console.error("Erro na API Morabeza:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
    return () => controller.abort();
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const fechar = (e) => {
      if (!e.target.closest('[data-dropdown-ordernar]')) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener('mousedown', fechar);
    return () => document.removeEventListener('mousedown', fechar);
  }, []);

  // ============================================================
  // FILTRAGEM (com useMemo — só recalcula quando muda algo)
  // ============================================================
  const alojamentosFiltrados = useMemo(() => {
    const destinoLower = filtroDestino.toLowerCase();
    const isGeral = !filtroDestino || filtroDestino === 'Cabo Verde' || filtroDestino === '';
    const tiposSet = new Set(tiposDeferidos);

    return alojamentos.filter(casa => {
      if (Number(casa.preco_noite || 0) > orcamentoDeferido) return false;
      if (tiposSet.size > 0 && !tiposSet.has(casa.tipo)) return false;
      if (!isGeral) {
        const local = (casa.localizacao || '').toLowerCase();
        if (!local.includes(destinoLower)) return false;
      }
      return true;
    });
  }, [alojamentos, orcamentoDeferido, tiposDeferidos, filtroDestino]);

  // ============================================================
  // ORDENAÇÃO (com useMemo)
  // ============================================================
  const alojamentosOrdenados = useMemo(() => {
    if (ordenar === 'recomendados') return alojamentosFiltrados;

    const copia = [...alojamentosFiltrados];
    if (ordenar === 'preco_asc') {
      copia.sort((a, b) => Number(a.preco_noite || 0) - Number(b.preco_noite || 0));
    } else if (ordenar === 'preco_desc') {
      copia.sort((a, b) => Number(b.preco_noite || 0) - Number(a.preco_noite || 0));
    } else if (ordenar === 'avaliacao') {
      copia.sort((a, b) => Number(b.estrelas || 0) - Number(a.estrelas || 0));
    }
    return copia;
  }, [alojamentosFiltrados, ordenar]);

  // ============================================================
  // CALLBACKS ESTÁVEIS
  // ============================================================
  const limparFiltros = useCallback(() => {
    setOrcamento(30000);
    setTiposSelecionados([]);
    setOrdenar('recomendados');
    navigate('/alojamentos', { replace: true });
  }, [navigate]);

  const toggleDropdown = useCallback(() => setDropdownAberto(v => !v), []);
  const abrirMapa = useCallback(() => setMapaAberto(true), []);
  const setGridMode = useCallback(() => setViewMode('grid'), []);
  const setListMode = useCallback(() => setViewMode('list'), []);
  const irParaExperiencias = useCallback(() => navigate('/experiencias'), [navigate]);
  const irParaInicio = useCallback(() => navigate('/'), [navigate]);

  const selecionarOrdem = useCallback((value) => {
    setOrdenar(value);
    setDropdownAberto(false);
  }, []);

  // Classname da grid — memoizado
  const gridClassName = useMemo(() => (
    viewMode === 'grid'
      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 text-left"
      : "flex flex-col gap-6 text-left"
  ), [viewMode]);

  const isListMode = viewMode === 'list';

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
        <Breadcrumbs navigate={irParaInicio} t={t} filtroDestino={filtroDestino} />

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 items-start">

          <aside className="w-full lg:col-span-3 lg:sticky lg:top-28 z-10">
            <FiltrosLateralAlojamento
              orcamento={orcamento}
              setOrcamento={setOrcamento}
              tiposSelecionados={tiposSelecionados}
              setTiposSelecionados={setTiposSelecionados}
              totalEncontrados={alojamentosFiltrados.length}
              onAbrirMapa={abrirMapa}
            />
          </aside>

          <div className="w-full lg:col-span-9">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <h1 className="text-2xl md:text-3xl font-black text-[#1a2b6d] leading-tight italic uppercase tracking-tighter text-left">
                {filtroDestino || t('explorar')}: <span className="text-blue-600 text-4xl">{alojamentosOrdenados.length}</span> {t('opcoes')}
              </h1>

              <div className="flex items-center gap-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-100 self-end md:self-auto">
                <div className="relative" data-dropdown-ordernar>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
                  >
                    <span className="whitespace-nowrap">Ordenar por: {labelOrdenarAtual}</span>
                    <ChevronDown size={14} className={`transition-transform duration-150 ${dropdownAberto ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownAberto && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                      {opcoesOrdenar.map((opcao) => (
                        <button
                          key={opcao.value}
                          onClick={() => selecionarOrdem(opcao.value)}
                          className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                            ordenar === opcao.value
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {opcao.label}
                          {ordenar === opcao.value && (
                            <span className="float-right text-blue-600">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-px h-6 bg-gray-100 mx-1"></div>
                <button
                  onClick={setGridMode}
                  aria-label="Vista em grelha"
                  className={`p-3 rounded-full transition-colors ${viewMode === 'grid' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={setListMode}
                  aria-label="Vista em lista"
                  className={`p-3 rounded-full transition-colors ${viewMode === 'list' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            <AvisoPreco t={t} />

            {loading ? (
              <LoadingState t={t} />
            ) : (
              <div className={gridClassName}>
                {alojamentosOrdenados.length > 0 ? (
                  alojamentosOrdenados.map(casa => (
                    <CardAlojamento key={casa.id} {...casa} isList={isListMode} />
                  ))
                ) : (
                  <EmptyState t={t} onLimpar={limparFiltros} />
                )}
              </div>
            )}
          </div>
        </div>

        <CTAFinal navigate={irParaExperiencias} t={t} />
      </main>
    </div>
  );
};

export default Alojamentos;