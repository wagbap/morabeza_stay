// MapaExperiencias.jsx - UI IDÊNTICO ao PaginaMapa e MapaCarros
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Map, Marker, NavigationControl } from 'react-map-gl';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, ChevronRight, Clock, X } from 'lucide-react';
import axios from 'axios';

// Importar o CSS do Mapbox
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// ============================================================
// DICIONÁRIO DE COORDENADAS (ilhas + cidades + zonas)
// ============================================================
const COORDENADAS_ILHAS = {
  // ILHAS
  'Santo Antão': { lat: 17.0667, lng: -25.1667 },
  'São Vicente': { lat: 16.8333, lng: -24.9833 },
  'Santa Luzia': { lat: 16.75, lng: -24.75 },
  'São Nicolau': { lat: 16.6167, lng: -24.2667 },
  'Sal': { lat: 16.7167, lng: -22.9167 },
  'Ilha do Sal': { lat: 16.7167, lng: -22.9167 },
  'Boa Vista': { lat: 16.1, lng: -22.8 },
  'Maio': { lat: 15.1333, lng: -23.2167 },
  'Santiago': { lat: 15.0667, lng: -23.5833 },
  'Fogo': { lat: 14.9167, lng: -24.3333 },
  'Ilha do Fogo': { lat: 14.9167, lng: -24.3333 },
  'Brava': { lat: 14.8667, lng: -24.7 },

  // CIDADES / LOCALIZAÇÕES
  'Praia': { lat: 14.9315, lng: -23.5125 },
  'Mindelo': { lat: 16.8884, lng: -24.9896 },
  'Santa Maria': { lat: 16.5999, lng: -22.9086 },
  'Espargos': { lat: 16.7551, lng: -22.9454 },
  'Sal Rei': { lat: 16.1761, lng: -22.9172 },
  'Porto Novo': { lat: 17.0194, lng: -25.0647 },
  'Cidade Velha': { lat: 14.9153, lng: -23.6053 },
  'Tarrafal': { lat: 15.2781, lng: -23.7517 },
  'Assomada': { lat: 15.1, lng: -23.6833 },
  'São Domingos': { lat: 15.0253, lng: -23.4994 },
  'São Salvador do Mundo': { lat: 15.0667, lng: -23.6333 },
  'Achada Santo António': { lat: 14.9213, lng: -23.5065 },
  'Platô': { lat: 14.9176, lng: -23.5091 },
  'Palmarejo': { lat: 14.925, lng: -23.518 },
  'Prainha': { lat: 14.91, lng: -23.515 },
  'Quebra Canela': { lat: 14.905, lng: -23.518 },
  'Terra Branca': { lat: 14.929, lng: -23.503 },
  'Achada Grande': { lat: 14.938, lng: -23.487 },
  'Cidadela': { lat: 14.923, lng: -23.508 },
};

const MapaExperiencias = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // ============================================================
  // REF DO MAPA
  // ============================================================
  const mapRef = useRef(null);

  const [experiencias, setExperiencias] = useState([]);
  const [selectedExperiencia, setSelectedExperiencia] = useState(null);
  const [modalExperiencia, setModalExperiencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [focoId, setFocoId] = useState(null);
  const [isModalClosing, setIsModalClosing] = useState(false);

  // ============================================================
  // VISTA INICIAL — CABO VERDE INTEIRO (zoom 7)
  // ============================================================
  const [viewState, setViewState] = useState({
    latitude: 15.3,
    longitude: -23.8,
    zoom: 7,
    pitch: 0,
    bearing: 0,
  });

  // ============================================================
  // LÊ O PARÂMETRO ?foco=ID DA URL
  // ============================================================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const foco = params.get('foco');
    if (foco) setFocoId(parseInt(foco, 10));
  }, [location.search]);

  // ============================================================
  // OBTÉM COORDENADAS VÁLIDAS (com fallback inteligente)
  // ============================================================
  const obterCoordenadasValidas = (exp) => {
    const lat = parseFloat(exp?.latitude);
    const lng = parseFloat(exp?.longitude);

    // 1. Se tem coordenadas reais na DB, usa-as
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return { lat, lng, zoom: 15 };
    }

    // 2. Tenta encontrar a localização no dicionário
    const candidatos = [
      exp?.ilha,
      exp?.cidade,
      exp?.localizacao,
      exp?.levantamento_local,
      exp?.levantamento_ilha,
    ].filter(Boolean);

    for (const nome of candidatos) {
      if (!nome) continue;

      // Procura exata
      if (COORDENADAS_ILHAS[nome]) {
        return {
          lat: COORDENADAS_ILHAS[nome].lat,
          lng: COORDENADAS_ILHAS[nome].lng,
          zoom: 12,
        };
      }

      // Procura parcial (ex: "Praia de Santa Maria" contém "Santa Maria")
      for (const chave of Object.keys(COORDENADAS_ILHAS)) {
        if (nome.toLowerCase().includes(chave.toLowerCase())) {
          return {
            lat: COORDENADAS_ILHAS[chave].lat,
            lng: COORDENADAS_ILHAS[chave].lng,
            zoom: 12,
          };
        }
      }
    }

    // 3. Fallback final: centro de Cabo Verde
    return { lat: 15.5, lng: -24.0, zoom: 8 };
  };

  // ============================================================
  // PROCESSA COORDENADAS ÚNICAS (espiral de Fibonacci)
  // ============================================================
  const processarCoordenadasUnicas = (lista) => {
    const contagem = {};
    const ANGULO_AUREO = Math.PI * (3 - Math.sqrt(5)); // ~2.39996 rad

    return lista.map((exp) => {
      const ponto = obterCoordenadasValidas(exp);
      const chave = `${ponto.lat.toFixed(5)}-${ponto.lng.toFixed(5)}`;

      if (contagem[chave] === undefined) contagem[chave] = 0;
      const index = contagem[chave];
      contagem[chave]++;

      let latFinal = ponto.lat;
      let lngFinal = ponto.lng;

      if (index > 0) {
        const raioBase = 0.0012; // ~130m por anel
        const raio = raioBase * Math.sqrt(index);
        const angulo = index * ANGULO_AUREO;
        const ajusteLng = 1 / Math.cos((ponto.lat * Math.PI) / 180);

        latFinal += raio * Math.cos(angulo);
        lngFinal += raio * Math.sin(angulo) * ajusteLng;
      }

      return { ...exp, latFinal, lngFinal, zoomFinal: ponto.zoom };
    });
  };

  // ============================================================
  // CARREGA DADOS DA API
  // ============================================================
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          'https://welovepalop.com/api/get_experiencias.php'
        );

        let dados = [];
        if (res.data && res.data.success && res.data.data) {
          dados = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        } else if (res.data && res.data.data) {
          dados = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        } else {
          dados = Array.isArray(res.data) ? res.data : [];
        }

        console.log('Experiências recebidas:', dados.length, dados);

        const dadosProcessados = processarCoordenadasUnicas(dados);
        setExperiencias(dadosProcessados);

        // Só faz zoom automático se vier ?foco=ID na URL
        if (focoId) {
          const focoExp = dadosProcessados.find(
            (e) => parseInt(e.id, 10) === focoId
          );
          if (focoExp) {
            setViewState((prev) => ({
              ...prev,
              latitude: focoExp.latFinal,
              longitude: focoExp.lngFinal,
              zoom: focoExp.zoomFinal || 15,
            }));
            setSelectedExperiencia(focoExp);
            setModalExperiencia(focoExp);
          }
        }
        // Se NÃO houver foco, mantém a vista inicial (Cabo Verde inteiro)
      } catch (err) {
        console.error('Erro ao carregar mapa de experiências:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [focoId]);

  // ============================================================
  // FORÇA RESIZE QUANDO OS DADOS CHEGAM
  // ============================================================
  useEffect(() => {
    if (!mapRef.current) return;

    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [experiencias, loading]);

  // ============================================================
  // ABRE O MODAL
  // ============================================================
  const handleAbrirModal = (exp) => {
    setSelectedExperiencia(exp);
    setViewState((prev) => ({
      ...prev,
      latitude: exp.latFinal,
      longitude: exp.lngFinal,
      zoom: exp.zoomFinal || 15,
    }));
    setModalExperiencia(exp);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  // ============================================================
  // FECHA O MODAL
  // ============================================================
  const handleFecharModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setModalExperiencia(null);
      setIsModalClosing(false);
    }, 200);
  };

  // ============================================================
  // MARCADORES (memoizados)
  // ============================================================
  const marcadores = useMemo(
    () =>
      experiencias.map((exp) => {
        const isSelected = selectedExperiencia?.id === exp.id;
        const preco = Number(exp.preco || 0);

        return (
          <Marker
            key={exp.id}
            latitude={exp.latFinal}
            longitude={exp.lngFinal}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleAbrirModal(exp);
            }}
          >
            <div
              className={`
                px-3 py-1.5 rounded-full border-2 border-white shadow-xl font-black text-[11px] transition-all cursor-pointer whitespace-nowrap
                ${
                  isSelected
                    ? 'bg-black text-white scale-110 z-50 relative ring-4 ring-blue-400/50'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 z-10'
                }
              `}
            >
              {preco.toLocaleString()} {t('cve')}
            </div>
          </Marker>
        );
      }),
    [experiencias, selectedExperiencia, t]
  );

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="w-screen h-screen relative bg-slate-100 overflow-hidden">
      {/* Botão Voltar */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => navigate(-1)}
          className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest border border-gray-100 transition-all cursor-pointer"
        >
          <ArrowLeft size={18} /> {t('voltar')}
        </button>
      </div>

      {/* Loading — sempre no DOM, escondido com opacity */}
      <div
        className={`absolute inset-0 z-40 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center transition-opacity duration-300 ${
          loading
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-600">
          {t('carregando_mapa')}
        </p>
      </div>

      {/* Mapa em Tela Cheia */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onLoad={() => {
          if (!mapRef.current) return;
          mapRef.current.resize();
          setTimeout(() => mapRef.current?.resize(), 200);
          setTimeout(() => mapRef.current?.resize(), 600);
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        onClick={() => setSelectedExperiencia(null)}
      >
        <NavigationControl position="bottom-right" />
        {marcadores}
      </Map>

      {/* ===== MODAL CENTRAL DIRETO COM FLASH ===== */}
      {modalExperiencia && (
        <>
          {/* Overlay escuro com blur */}
          <div
            className={`fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
              isModalClosing ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={handleFecharModal}
          />

          {/* Flash effect */}
          <div
            className={`fixed inset-0 z-[9999] pointer-events-none ${
              isModalClosing ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              background:
                'radial-gradient(circle at center, rgba(59,130,246,0.25) 0%, transparent 65%)',
              animation: isModalClosing ? 'none' : 'flashPulse 0.5s ease-out',
            }}
          />

          {/* Modal — sempre centrado */}
          <div
            className="fixed top-1/2 left-1/2 z-[10000] w-[92%] max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            style={{
              transform: 'translate(-50%, -50%)',
              animation: isModalClosing
                ? 'modalClose 0.2s ease-in forwards'
                : 'modalPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          >
            {/* Imagem de capa */}
            <div className="relative w-full h-48 overflow-hidden">
              <img
                src={
                  modalExperiencia.imagem_principal ||
                  (modalExperiencia.imagens &&
                    modalExperiencia.imagens[0]?.caminho_url) ||
                  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600'
                }
                alt={modalExperiencia.titulo}
                className="w-full h-full object-cover"
                onError={(e) =>
                  (e.target.src =
                    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600')
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <button
                onClick={handleFecharModal}
                className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all backdrop-blur-sm cursor-pointer hover:scale-110 active:scale-95"
              >
                <X size={18} />
              </button>

              <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 shadow-lg">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                {modalExperiencia.rating_formatado ||
                  Number(modalExperiencia.estrelas || 5).toFixed(1)}
              </div>

              <div className="absolute top-3 right-14 bg-blue-600/90 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase">
                {modalExperiencia.categoria_nome || t('experiencia')}
              </div>

              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="font-black text-lg text-white drop-shadow-lg leading-tight">
                  {modalExperiencia.titulo}
                </h3>
                <p className="text-xs text-white/80 font-medium flex items-center gap-1 mt-1">
                  <MapPin size={12} className="text-orange-400 shrink-0" />
                  {modalExperiencia.ilha}
                  {modalExperiencia.localizacao
                    ? `, ${modalExperiencia.localizacao}`
                    : ''}
                </p>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {t('preco') || 'Preço'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-blue-600">
                      {Number(modalExperiencia.preco).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {t('cve')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {t('duracao') || 'Duração'}
                  </span>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <Clock size={14} className="text-slate-500" />
                    <span className="text-sm font-black text-gray-900">
                      {modalExperiencia.duracao || t('flexivel')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info extra: categoria / avaliação */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {modalExperiencia.categoria_nome && (
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <span className="text-[8px] font-black uppercase text-slate-400 block">
                      {t('categoria') || 'Categoria'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 line-clamp-1">
                      {modalExperiencia.categoria_nome}
                    </span>
                  </div>
                )}
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <span className="text-[8px] font-black uppercase text-slate-400 block">
                    {t('avaliacao') || 'Avaliação'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1">
                    <Star
                      size={10}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    {modalExperiencia.rating_formatado ||
                      Number(modalExperiencia.estrelas || 5).toFixed(1)}
                  </span>
                </div>
              </div>

              {modalExperiencia.descricao_curta && (
                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                  {modalExperiencia.descricao_curta}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleFecharModal}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer active:scale-95"
                >
                  {t('fechar') || 'Fechar'}
                </button>
                <button
                  onClick={() =>
                    navigate(
                      `/experiencia/${
                        modalExperiencia.slug || modalExperiencia.id
                      }`
                    )
                  }
                  className="flex-[2] py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  {t('ver_detalhes') || 'Ver Detalhes'}{' '}
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Keyframes CSS */}
          <style>{`
            @keyframes modalPop {
              0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.7);
              }
              60% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.03);
              }
              100% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
              }
            }
            @keyframes modalClose {
              0% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
              }
              100% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.9);
              }
            }
            @keyframes flashPulse {
              0% {
                opacity: 0;
                transform: scale(0.5);
              }
              35% {
                opacity: 1;
              }
              100% {
                opacity: 0;
                transform: scale(1.6);
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default MapaExperiencias;