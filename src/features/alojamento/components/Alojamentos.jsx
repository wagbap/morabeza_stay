// src/features/alojamento/components/Alojamentos.jsx
import React, {
  useState, useEffect, useMemo, useCallback, useDeferredValue, memo,
} from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Loader2, LayoutGrid, List, Info, ArrowRight, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import CardAlojamento from './CardAlojamento';
import FiltrosLateralAlojamento from './FiltrosLateralAlojamento';
import SearchBar from './SearchBarAlojamento';
import AlojamentoHero from './AlojamentoHero';

// ============================================================
// Constantes
// ============================================================
const ORCAMENTO_MAX_DEFAULT = 100000;
const ORCAMENTO_MIN_DEFAULT = 1000;

// ============================================================
// Helpers
// ============================================================
const normalizarTexto = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const calcularNoites = (entrada, saida) => {
  if (!entrada || !saida) return 0;
  const d1 = new Date(entrada);
  const d2 = new Date(saida);
  if (isNaN(d1) || isNaN(d2)) return 0;
  return Math.max(0, Math.round((d2 - d1) / 86400000));
};

// ============================================================
// Componentes memoizados
// ============================================================
const Breadcrumbs = memo(({ navigate, t, filtroDestino }) => (
  <div className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 flex gap-2">
    <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/')}>
      {t('inicio', 'Início')}
    </span>
    {' / '}
    <span>{t('alojamentos', 'Alojamentos')}</span>
    {filtroDestino && <> / <span className="text-gray-900">{filtroDestino}</span></>}
  </div>
));
Breadcrumbs.displayName = 'Breadcrumbs';

const AvisoPreco = memo(({ t }) => (
  <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl mb-8 flex items-center gap-3 text-sm font-medium text-left">
    <Info size={18} className="text-blue-600 shrink-0" />
    <span>{t('precos_finais_com_taxas', 'Preços em CVE. Taxas incluídas.')}</span>
  </div>
));
AvisoPreco.displayName = 'AvisoPreco';

const LoadingState = memo(({ t }) => (
  <div className="flex flex-col items-center justify-center py-32 text-center">
    <Loader2 size={40} className="animate-spin mb-4 text-blue-600 opacity-20" />
    <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">
      {t('sincronizar_espacos', 'A sincronizar espaços...')}
    </p>
  </div>
));
LoadingState.displayName = 'LoadingState';

const EmptyState = memo(({ t, onLimpar, filtroDestino }) => (
  <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
    <Info size={40} className="text-gray-300" />
    <p className="text-gray-400 font-bold uppercase text-xs">
      {t('nenhum_alojamento_encontrado', 'Nenhum alojamento encontrado')}
      {filtroDestino && (
        <>
          {' '}
          {t('em', 'em')} <span className="text-gray-700">{filtroDestino}</span>
        </>
      )}
    </p>
    <button
      onClick={onLimpar}
      className="text-blue-600 font-black text-[10px] underline uppercase"
    >
      {t('limpar_filtros', 'Limpar filtros')}
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
        alt="Cabo Verde"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
      <div className="relative z-10 p-8 md:p-12 max-w-lg">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4 tracking-tighter uppercase italic">
          {t('viva_aventuras_inesqueciveis', 'Viva aventuras inesquecíveis')}
        </h2>
        <button
          onClick={() => navigate('/experiencias')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl transition-all flex items-center gap-2"
        >
          {t('buscar_experiencias', 'Buscar experiências')} <ArrowRight size={20} />
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

  // ----------------------------------------------------------
  // URL como fonte de verdade
  // ----------------------------------------------------------
  const searchParams = useMemo(() => {
    const p = new URLSearchParams(location.search);
    return {
      destino:  p.get('destino')  || '',
      entrada:  p.get('entrada')  || '',
      saida:    p.get('saida')    || '',
      hospedes: parseInt(p.get('hospedes') || '1', 10) || 1,
      adultos:  parseInt(p.get('adultos')  || '2', 10) || 2,
      criancas: parseInt(p.get('criancas') || '0', 10) || 0,
      quartos:  parseInt(p.get('quartos')  || '1', 10) || 1,
      pet:      p.get('pet') === '1',
    };
  }, [location.search]);

  const filtroDestino = searchParams.destino;

  const noites = useMemo(
    () => calcularNoites(searchParams.entrada, searchParams.saida),
    [searchParams.entrada, searchParams.saida]
  );

  // ----------------------------------------------------------
  // Estados
  // ----------------------------------------------------------
  const [alojamentos, setAlojamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [viewMode, setViewMode] = useState('grid');
  const [ordenar, setOrdenar] = useState('recomendados');
  const [dropdownAberto, setDropdownAberto] = useState(false);

  // Filtros locais (client-side)
  const [orcamento, setOrcamento] = useState(ORCAMENTO_MAX_DEFAULT);
  const [tiposSelecionados, setTiposSelecionados] = useState([]);
  const [mapaAberto, setMapaAberto] = useState(false);

  const orcamentoDeferido = useDeferredValue(orcamento);
  const tiposDeferidos = useDeferredValue(tiposSelecionados);

  // ----------------------------------------------------------
  // Opções de ordenação
  // ----------------------------------------------------------
  const opcoesOrdenar = useMemo(
    () => [
      { value: 'recomendados', label: t('ordenar_recomendados', 'Recomendados') },
      { value: 'preco_asc',    label: t('ordenar_preco_asc',    'Preço mais baixo') },
      { value: 'preco_desc',   label: t('ordenar_preco_desc',   'Preço mais alto') },
      { value: 'avaliacao',    label: t('ordenar_avaliacao',    'Melhor avaliação') },
    ],
    [t]
  );

  const labelOrdenarAtual = useMemo(
    () => opcoesOrdenar.find((o) => o.value === ordenar)?.label || 'Recomendados',
    [opcoesOrdenar, ordenar]
  );

  // ----------------------------------------------------------
  // Atualizar URL (fonte de verdade para pesquisa)
  // ----------------------------------------------------------
  const updateSearchParams = useCallback(
    (patch) => {
      const params = new URLSearchParams(location.search);

      Object.entries(patch).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '' || v === false) {
          params.delete(k);
        } else {
          params.set(k, String(v));
        }
      });

      // Recalcula "hospedes" = adultos + criancas
      const adultos  = parseInt(params.get('adultos')  || '0', 10) || 0;
      const criancas = parseInt(params.get('criancas') || '0', 10) || 0;
      if (adultos + criancas > 0) {
        params.set('hospedes', String(adultos + criancas));
      }

      navigate({ search: params.toString() }, { replace: true });
    },
    [location.search, navigate]
  );

  // ----------------------------------------------------------
  // FETCH
  // ----------------------------------------------------------
  useEffect(() => {
    const controller = new AbortController();

    const fetchDados = async () => {
      try {
        setLoading(true);
        setErro(null);

        const apiParams = {
          destino:  searchParams.destino,
          entrada:  searchParams.entrada,
          saida:    searchParams.saida,
          hospedes: searchParams.hospedes,
          quartos:  searchParams.quartos,
          pet:      searchParams.pet ? 1 : 0,
        };

        console.log('📡 GET get_alojamentos.php', apiParams);

        const response = await axios.get(
          'https://welovepalop.com/api/get_alojamentos.php',
          { params: apiParams, signal: controller.signal }
        );

        const lista = Array.isArray(response.data) ? response.data : [];

        console.log(`📦 API devolveu ${lista.length} alojamentos`);

        setAlojamentos(lista);
      } catch (error) {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          console.error('❌ Erro na API Morabeza:', error);
          setErro(error.message || 'Erro ao carregar alojamentos');
          setAlojamentos([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
    return () => controller.abort();
  }, [
    searchParams.destino,
    searchParams.entrada,
    searchParams.saida,
    searchParams.hospedes,
    searchParams.quartos,
    searchParams.pet,
  ]);

  // Fechar dropdown
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
  // FILTRAGEM LOCAL
  // ============================================================
  const alojamentosFiltrados = useMemo(() => {
    const destinoNorm = normalizarTexto(filtroDestino);
    const isGeral =
      !destinoNorm ||
      destinoNorm === 'cabo verde' ||
      destinoNorm === 'todas';

    const tiposSetLower = new Set(
      [...tiposDeferidos].map((t) => String(t).toLowerCase().trim())
    );

    // Total de pessoas = adultos + crianças (fallback: hospedes)
    const totalPessoas = Math.max(
      searchParams.hospedes || 1,
      (searchParams.adultos || 0) + (searchParams.criancas || 0)
    );

    return alojamentos.filter((casa) => {
      // 1) Orçamento
      const preco = Number(casa.preco_mostrar ?? casa.preco_noite ?? 0);
      if (preco > orcamentoDeferido) return false;

      // 2) Tipo de propriedade
      if (tiposSetLower.size > 0) {
        const tipoCasa = String(casa.tipo_propriedade || '').toLowerCase().trim();
        if (!tiposSetLower.has(tipoCasa)) return false;
      }

      // 3) Capacidade (usa capacidade_efetiva do backend)
      const capacidade = Number(casa.capacidade_efetiva ?? casa.capacidade ?? 0);
      if (capacidade < totalPessoas) return false;

      // 4) Destino — procura em ilha, localizacao, cidade, titulo
      if (!isGeral) {
        const campos = [
          casa.ilha,
          casa.localizacao,
          casa.cidade,
          casa.titulo,
        ].map(normalizarTexto);

        if (!campos.some((c) => c.includes(destinoNorm))) return false;
      }

      // 5) Pet-friendly (usa flag do backend)
      if (searchParams.pet && !casa.pet_friendly) return false;

      return true;
    });
  }, [
    alojamentos,
    orcamentoDeferido,
    tiposDeferidos,
    filtroDestino,
    searchParams.hospedes,
    searchParams.adultos,
    searchParams.criancas,
    searchParams.pet,
  ]);

  // ----------------------------------------------------------
  // Ordenação
  // ----------------------------------------------------------
  const alojamentosOrdenados = useMemo(() => {
    if (ordenar === 'recomendados') return alojamentosFiltrados;

    const copia = [...alojamentosFiltrados];
    const precoDe = (c) => Number(c.preco_mostrar ?? c.preco_noite ?? 0);

    if (ordenar === 'preco_asc') copia.sort((a, b) => precoDe(a) - precoDe(b));
    else if (ordenar === 'preco_desc') copia.sort((a, b) => precoDe(b) - precoDe(a));
    else if (ordenar === 'avaliacao')
      copia.sort((a, b) => Number(b.estrelas || 0) - Number(a.estrelas || 0));

    return copia;
  }, [alojamentosFiltrados, ordenar]);

  // ----------------------------------------------------------
  // Callbacks
  // ----------------------------------------------------------
  const limparFiltros = useCallback(() => {
    setOrcamento(ORCAMENTO_MAX_DEFAULT);
    setTiposSelecionados([]);
    setOrdenar('recomendados');
    navigate('/alojamentos', { replace: true });
  }, [navigate]);

  const toggleDropdown = useCallback(() => setDropdownAberto((v) => !v), []);
  const abrirMapa = useCallback(() => setMapaAberto(true), []);
  const setGridMode = useCallback(() => setViewMode('grid'), []);
  const setListMode = useCallback(() => setViewMode('list'), []);
  const irParaExperiencias = useCallback(() => navigate('/experiencias'), [navigate]);
  const irParaInicio = useCallback(() => navigate('/'), [navigate]);

  const selecionarOrdem = useCallback((value) => {
    setOrdenar(value);
    setDropdownAberto(false);
  }, []);

  const gridClassName = useMemo(
    () =>
      viewMode === 'grid'
        ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 text-left'
        : 'flex flex-col gap-6 text-left',
    [viewMode]
  );

  const isListMode = viewMode === 'list';

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="bg-[#f8f9fc] min-h-screen">
      <Helmet>
        <title>
          MorabezaStay | {t('alojamentos', 'Alojamentos')}
          {filtroDestino && ` ${t('em', 'em')} ${filtroDestino}`}
        </title>
      </Helmet>

      <AlojamentoHero />

      <div className="relative -mt-12 z-40 px-4 flex justify-center">
        <div className="w-full max-w-6xl">
          <SearchBar />
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto py-12 md:py-16 px-4 md:px-6">
        <Breadcrumbs navigate={irParaInicio} t={t} filtroDestino={filtroDestino} />

        {/* Chips da pesquisa activa */}
        {(searchParams.hospedes > 1 ||
          searchParams.entrada ||
          searchParams.saida ||
          searchParams.pet ||
          searchParams.criancas > 0) && (
          <div className="mb-6 text-left text-xs text-gray-500 font-semibold flex flex-wrap gap-2">
            {searchParams.entrada && searchParams.saida && (
              <span className="inline-flex items-center gap-1 bg-white border border-gray-100 rounded-full px-3 py-1">
                📅 {searchParams.entrada} → {searchParams.saida}
                {noites > 0 && (
                  <span className="ml-1 text-blue-600 font-black">
                    ({noites} {noites === 1 ? 'noite' : 'noites'})
                  </span>
                )}
              </span>
            )}
            <span className="inline-flex items-center gap-1 bg-white border border-gray-100 rounded-full px-3 py-1">
              👥 {searchParams.hospedes}{' '}
              {searchParams.hospedes === 1 ? 'hóspede' : 'hóspedes'}
              {searchParams.criancas > 0 && (
                <span className="text-gray-400">
                  ({searchParams.adultos}A + {searchParams.criancas}C)
                </span>
              )}
            </span>
            {searchParams.quartos > 1 && (
              <span className="inline-flex items-center gap-1 bg-white border border-gray-100 rounded-full px-3 py-1">
                🛏️ {searchParams.quartos} quartos
              </span>
            )}
            {searchParams.pet && (
              <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full px-3 py-1">
                🐾 Com animal
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* FILTROS LATERAIS */}
          <aside className="w-full lg:col-span-3 lg:sticky lg:top-28 z-10">
            <FiltrosLateralAlojamento
              orcamento={orcamento}
              setOrcamento={setOrcamento}
              orcamentoMaximo={ORCAMENTO_MAX_DEFAULT}
              orcamentoMinimo={ORCAMENTO_MIN_DEFAULT}
              tiposSelecionados={tiposSelecionados}
              setTiposSelecionados={setTiposSelecionados}
              totalEncontrados={alojamentosFiltrados.length}
              onAbrirMapa={abrirMapa}
              searchParams={searchParams}
              onUpdateSearchParams={updateSearchParams}
            />
          </aside>

          {/* LISTA */}
          <div className="w-full lg:col-span-9">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h1 className="text-xl md:text-3xl font-black text-[#1a2b6d] leading-tight italic uppercase tracking-tighter text-left">
                {filtroDestino || t('explorar', 'Explorar')}:{' '}
                <span className="text-blue-600 text-3xl md:text-4xl">
                  {alojamentosOrdenados.length}
                </span>{' '}
                {t('opcoes', 'opções')}
              </h1>

              <div className="flex items-center gap-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-100 self-stretch md:self-auto">
                <div className="relative" data-dropdown-ordernar>
                  <button
                    type="button"
                    onClick={toggleDropdown}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
                  >
                    <span className="whitespace-nowrap">
                      {t('ordenar_por', 'Ordenar por')}: {labelOrdenarAtual}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-150 ${
                        dropdownAberto ? 'rotate-180' : ''
                      }`}
                    />
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

                <div className="w-px h-6 bg-gray-100 mx-1" />

                <button
                  type="button"
                  onClick={setGridMode}
                  aria-label="Vista em grelha"
                  className={`p-3 rounded-full transition-colors ${
                    viewMode === 'grid'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  type="button"
                  onClick={setListMode}
                  aria-label="Vista em lista"
                  className={`p-3 rounded-full transition-colors ${
                    viewMode === 'list'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            <AvisoPreco t={t} />

            {erro && !loading && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-800 p-4 rounded-xl flex items-start gap-3 text-sm text-left">
                <X size={18} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{t('erro_carregar', 'Erro ao carregar')}</p>
                  <p className="text-xs mt-1 opacity-80">{erro}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-[10px] font-black uppercase underline"
                  >
                    {t('tentar_novamente', 'Tentar novamente')}
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <LoadingState t={t} />
            ) : (
              <div className={gridClassName}>
                {alojamentosOrdenados.length > 0 ? (
                  alojamentosOrdenados.map((casa) => (
                    <CardAlojamento key={casa.id} {...casa} isList={isListMode} />
                  ))
                ) : (
                  <EmptyState
                    t={t}
                    onLimpar={limparFiltros}
                    filtroDestino={filtroDestino}
                  />
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