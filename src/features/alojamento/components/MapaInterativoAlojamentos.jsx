// PaginaMapa.jsx - Mesmo efeito do mapa de carros
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Map, Marker, NavigationControl } from 'react-map-gl';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, ChevronRight, MapPin, X } from 'lucide-react';
import axios from 'axios';

import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// ============================================================
// DICIONÁRIO DE COORDENADAS
// ============================================================
const COORDENADAS_ILHAS = {
  // ILHAS
  'Santiago': { lat: 15.0667, lng: -23.5833 },
  'São Vicente': { lat: 16.8333, lng: -24.9833 },
  'Sal': { lat: 16.7167, lng: -22.9167 },
  'Ilha do Sal': { lat: 16.7167, lng: -22.9167 },
  'Boa Vista': { lat: 16.1000, lng: -22.8000 },
  'Fogo': { lat: 14.9167, lng: -24.3333 },
  'Ilha do Fogo': { lat: 14.9167, lng: -24.3333 },
  'Santo Antão': { lat: 17.0667, lng: -25.1667 },
  'Maio': { lat: 15.1333, lng: -23.2167 },
  'São Nicolau': { lat: 16.6167, lng: -24.2667 },
  'Brava': { lat: 14.8667, lng: -24.7000 },

  // CIDADES / LOCALIZAÇÕES
  'Praia': { lat: 14.9315, lng: -23.5125 },
  'Mindelo': { lat: 16.8884, lng: -24.9896 },
  'Santa Maria': { lat: 16.5999, lng: -22.9086 },
  'Espargos': { lat: 16.7551, lng: -22.9454 },
  'Sal Rei': { lat: 16.1761, lng: -22.9172 },
  'Porto Novo': { lat: 17.0194, lng: -25.0647 },
  'Cidade Velha': { lat: 14.9153, lng: -23.6053 },
  'Tarrafal': { lat: 15.2781, lng: -23.7517 },
  'Assomada': { lat: 15.1000, lng: -23.6833 },
  'São Domingos': { lat: 15.0253, lng: -23.4994 },
  'São Salvador do Mundo': { lat: 15.0667, lng: -23.6333 },
  'Achada Santo António': { lat: 14.9213, lng: -23.5065 },
  'Platô': { lat: 14.9176, lng: -23.5091 },
  'Palmarejo': { lat: 14.9250, lng: -23.5180 },
  'Prainha': { lat: 14.9100, lng: -23.5150 },
  'Quebra Canela': { lat: 14.9050, lng: -23.5180 },
  'Terra Branca': { lat: 14.9290, lng: -23.5030 },
  'Achada Grande': { lat: 14.9380, lng: -23.4870 },
  'Cidadela': { lat: 14.9230, lng: -23.5080 },
};

const PaginaMapa = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // ============================================================
  // REF DO MAPA
  // ============================================================
  const mapRef = useRef(null);

  const [alojamentos, setAlojamentos] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [modalHotel, setModalHotel] = useState(null);
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
  // OBTÉM COORDENADAS VÁLIDAS
  // ============================================================
  const obterCoordenadasValidas = (hotel) => {
    const lat = parseFloat(hotel?.latitude);
    const lng = parseFloat(hotel?.longitude);

    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return { lat, lng, zoom: 15 };
    }

    const candidatos = [
      hotel?.ilha,
      hotel?.cidade,
      hotel?.localizacao,
      hotel?.levantamento_local,
    ].filter(Boolean);

    for (const nome of candidatos) {
      if (!nome) continue;

      if (COORDENADAS_ILHAS[nome]) {
        return {
          lat: COORDENADAS_ILHAS[nome].lat,
          lng: COORDENADAS_ILHAS[nome].lng,
          zoom: 12,
        };
      }

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

    return { lat: 15.5, lng: -24.0, zoom: 8 };
  };

  // ============================================================
  // PROCESSA COORDENADAS ÚNICAS (espiral de Fibonacci)
  // ============================================================
  const processarCoordenadasUnicas = (lista) => {
    const contagem = {};
    const ANGULO_AUREO = Math.PI * (3 - Math.sqrt(5));

    return lista.map((hotel) => {
      const ponto = obterCoordenadasValidas(hotel);
      const chave = `${ponto.lat.toFixed(5)}-${ponto.lng.toFixed(5)}`;

      if (contagem[chave] === undefined) contagem[chave] = 0;
      const index = contagem[chave];
      contagem[chave]++;

      let latFinal = ponto.lat;
      let lngFinal = ponto.lng;

      if (index > 0) {
        const raioBase = 0.0012;
        const raio = raioBase * Math.sqrt(index);
        const angulo = index * ANGULO_AUREO;
        const ajusteLng = 1 / Math.cos((ponto.lat * Math.PI) / 180);

        latFinal += raio * Math.cos(angulo);
        lngFinal += raio * Math.sin(angulo) * ajusteLng;
      }

      return { ...hotel, latFinal, lngFinal, zoomFinal: ponto.zoom };
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
          'https://welovepalop.com/api/get_alojamentos.php'
        );

        let dadosRaw = Array.isArray(res.data)
          ? res.data
          : res.data?.data
          ? [res.data.data]
          : [];

        console.log('Alojamentos recebidos:', dadosRaw.length, dadosRaw);

        const dadosProcessados = processarCoordenadasUnicas(dadosRaw);
        setAlojamentos(dadosProcessados);

        // Só faz zoom automático se vier ?foco=ID na URL
        if (focoId) {
          const focoHotel = dadosProcessados.find(
            (h) => parseInt(h.id, 10) === focoId
          );
          if (focoHotel) {
            setViewState((prev) => ({
              ...prev,
              latitude: focoHotel.latFinal,
              longitude: focoHotel.lngFinal,
              zoom: focoHotel.zoomFinal || 15,
            }));
            setSelectedHotel(focoHotel);
            setModalHotel(focoHotel);
          }
        }
        // Se NÃO houver foco, mantém a vista inicial (Cabo Verde inteiro)
      } catch (err) {
        console.error('Erro ao carregar mapa de alojamentos:', err);
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
  }, [alojamentos, loading]);

  // ============================================================
  // ABRE O MODAL
  // ============================================================
  const handleAbrirModal = (hotel) => {
    setSelectedHotel(hotel);
    setViewState((prev) => ({
      ...prev,
      latitude: hotel.latFinal,
      longitude: hotel.lngFinal,
      zoom: hotel.zoomFinal || 15,
    }));
    setModalHotel(hotel);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  // ============================================================
  // FECHA O MODAL
  // ============================================================
  const handleFecharModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setModalHotel(null);
      setIsModalClosing(false);
    }, 200);
  };

  // ============================================================
  // MARCADORES
  // ============================================================
  const marcadores = useMemo(
    () =>
      alojamentos.map((hotel) => {
        const isSelected = selectedHotel?.id === hotel.id;
        const preco = Number(hotel.preco_noite || 0);

        return (
          <Marker
            key={hotel.id}
            latitude={hotel.latFinal}
            longitude={hotel.lngFinal}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleAbrirModal(hotel);
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
              {preco.toLocaleString()} CVE
            </div>
          </Marker>
        );
      }),
    [alojamentos, selectedHotel]
  );

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="w-screen h-screen relative bg-slate-100 overflow-hidden">
      {/* Botão Voltar */}
      <div className="absolute top-6 left-6 z-40">
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
          {t('carregando_coordenadas')}
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
        onClick={() => setSelectedHotel(null)}
      >
        <NavigationControl position="bottom-right" />
        {marcadores}
      </Map>

      {/* ===== MODAL CENTRAL DIRETO COM FLASH ===== */}
      {modalHotel && (
        <>
          <div
            className={`fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
              isModalClosing ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={handleFecharModal}
          />

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

          <div
            className="fixed top-1/2 left-1/2 z-[10000] w-[92%] max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            style={{
              transform: 'translate(-50%, -50%)',
              animation: isModalClosing
                ? 'modalClose 0.2s ease-in forwards'
                : 'modalPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          >
            <div className="relative w-full h-48 overflow-hidden">
              <img
                src={
                  modalHotel.imagem_url ||
                  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'
                }
                alt={modalHotel.titulo}
                className="w-full h-full object-cover"
                onError={(e) =>
                  (e.target.src =
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600')
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
                {Number(modalHotel.estrelas || 4.5).toFixed(1)}
              </div>

              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="font-black text-lg text-white drop-shadow-lg leading-tight">
                  {modalHotel.titulo}
                </h3>
                <p className="text-xs text-white/80 font-medium flex items-center gap-1 mt-1">
                  <MapPin size={12} className="text-orange-400 shrink-0" />
                  {modalHotel.cidade || modalHotel.localizacao}
                </p>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {t('preco_noite') || 'Preço por noite'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-blue-600">
                      {Number(modalHotel.preco_noite).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      CVE
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {t('avaliacao') || 'Avaliação'}
                  </span>
                  <div className="flex items-center gap-1 justify-end">
                    <Star
                      size={14}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span className="text-sm font-black text-gray-900">
                      {Number(modalHotel.estrelas || 4.5).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {modalHotel.descricao && (
                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                  {modalHotel.descricao}
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
                      `/alojamento/${modalHotel.slug || modalHotel.id}`
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

export default PaginaMapa;