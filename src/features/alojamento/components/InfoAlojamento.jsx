// src/features/alojamento/components/InfoAlojamento.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Users, Bed, Bath, Wifi, Wind, Coffee, MapPin, Star,
  ChevronRight, ChevronLeft, LayoutGrid, Camera,
  CheckCircle, ExternalLink, ChevronDown, X, Loader2,
  Droplet, Car, Eye, Shield, ChevronUp, Shirt,
  CalendarDays, Maximize2, Phone, Mail
} from 'lucide-react';
import AvaliacoesSeccaoAlojamento from './AvaliacoesSeccaoAlojamento';
import SeccaoEscolhaQuarto from './SeccaoEscolhaQuarto';
import useAlojamentoTracking from "../hooks/useAlojamentoTracking";
import BotaoDenuncia from '../../../components/BotaoDenuncia';
import CalendarioMorabeza from '../../../components/Calendario/CalendarioMorabeza';
import { useToast } from "../../../Toast";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const API_BASE = 'https://welovepalop.com';

// ============================================================
// IMAGE SLIDER MODAL
// ============================================================
const ImageSliderModal = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  const handleModalClick = (e) => e.stopPropagation();

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
      >
        <X size={24} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
      >
        <ChevronRight size={24} />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} / {images.length}
      </div>
      <img
        src={images[currentIndex]}
        alt={`Imagem ${currentIndex + 1}`}
        className="max-w-[90vw] max-h-[90vh] object-contain cursor-pointer"
        onClick={handleModalClick}
      />
    </div>
  );
};

// ============================================================
// TABS DE NAVEGAÇÃO
// ============================================================
const TabsNavegacaoAlojamentos = ({ activeTab = 0, onTabChange }) => {
  const { t } = useTranslation();
  const tabs = [
    { id: 0, label: t('visao_geral') || 'Visão Geral' },
    { id: 1, label: t('comodidades') || 'Comodidades' },
    { id: 2, label: t('regras_casa') || 'Regras da Casa' },
  ];
  return (
    <div className="border-b border-slate-200 mb-6">
      <div className="flex gap-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-blue-900 border-b-2 border-blue-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// HOST INFO
// ============================================================
const HostInfo = ({ proprietario, onContactClick, alojamentoTitulo }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);
  if (!proprietario) return null;

  const abrirWhatsApp = (e) => {
    e.stopPropagation();
    if (!proprietario.phone) {
      showToast(t('telefone_nao_disponivel') || "Número de telefone não disponível", 'error');
      return;
    }
    const numeroLimpo = proprietario.phone.replace(/\D/g, '');
    let numeroWhatsApp = numeroLimpo;
    if (!numeroWhatsApp.startsWith('238') && numeroWhatsApp.length <= 9) {
      numeroWhatsApp = '238' + numeroWhatsApp;
    }
    const mensagem = encodeURIComponent(
      `Olá! Estou interessado no alojamento "${alojamentoTitulo || ''}". Gostaria de mais informações.`
    );
    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, '_blank');
    setMostrarOpcoes(false);
  };

  const fazerLigacao = (e) => {
    e.stopPropagation();
    if (!proprietario.phone) return;
    const numeroLimpo = proprietario.phone.replace(/\D/g, '');
    window.open(`tel:+${numeroLimpo}`, '_blank');
    setMostrarOpcoes(false);
  };

  const enviarEmail = (e) => {
    e.stopPropagation();
    if (!proprietario.email) return;
    const assunto = encodeURIComponent(`Interesse no alojamento: ${alojamentoTitulo || ''}`);
    const corpo = encodeURIComponent(`Olá! Estou interessado no alojamento "${alojamentoTitulo || ''}". Gostaria de mais informações.`);
    window.open(`mailto:${proprietario.email}?subject=${assunto}&body=${corpo}`, '_blank');
    setMostrarOpcoes(false);
  };

  const handleContactClick = (e) => {
    e.stopPropagation();
    if (proprietario.phone && !proprietario.email) { abrirWhatsApp(e); return; }
    if (proprietario.email && !proprietario.phone) { enviarEmail(e); return; }
    if (proprietario.phone || proprietario.email) { setMostrarOpcoes(!mostrarOpcoes); }
    else { showToast(t('nenhum_contato_disponivel') || "Nenhum contato disponível", 'error'); }
    if (onContactClick) onContactClick();
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <img
            src={proprietario.foto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"}
            alt={proprietario.nome}
            className="w-12 h-12 rounded-full object-cover border border-slate-100"
          />
          {proprietario.superhost && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <CheckCircle className="text-orange-500 fill-orange-500" size={14} />
            </div>
          )}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">
            {t('anfitriao') || 'Anfitrião'}: {proprietario.nome}
          </h4>
          <p className="text-[10px] text-slate-500 font-medium">
            {proprietario.superhost ? (t('superhost') || 'Superhost') + ' • ' : ''}
            {proprietario.tempo_resposta || (t('responde_rapido') || 'Responde rápido')}
          </p>
          {proprietario.phone && (
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Phone size={10} className="text-green-500" /> <span>{proprietario.phone}</span>
            </p>
          )}
          {proprietario.email && (
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Mail size={10} className="text-blue-500" /> <span>{proprietario.email}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 relative">
        {proprietario.phone && (
          <button
            onClick={abrirWhatsApp}
            className="w-full py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold text-[11px] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t('enviar_whatsapp') || 'Enviar mensagem no WhatsApp'}
          </button>
        )}

        <button
          onClick={handleContactClick}
          className="w-full py-2.5 border border-blue-900 text-blue-900 text-[11px] font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
        >
          <Phone size={14} />
          {t('contactar_anfitriao') || 'Contactar anfitrião'}
        </button>

        {mostrarOpcoes && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
            {proprietario.phone && (
              <button
                onClick={fazerLigacao}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100"
              >
                <Phone size={14} className="text-green-600" />
                <span>{t('ligar') || 'Ligar'}</span>
                <span className="text-xs text-slate-400 ml-auto">{proprietario.phone}</span>
              </button>
            )}
            {proprietario.email && (
              <button
                onClick={enviarEmail}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <Mail size={14} className="text-blue-500" />
                <span>{t('email') || 'Email'}</span>
                <span className="text-xs text-slate-400 ml-auto">{proprietario.email}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// MAPA
// ============================================================
const MapLocation = ({ localizacao, pontosProximos, endereco, latitude, longitude, alojamentoId, onMapClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const temCoordenadas = latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude));
  const textoLocalizacao = endereco || localizacao || (t('localizacao_nao_informada') || 'Localização não informada');
  const cidadeNome = textoLocalizacao.split(',').shift();

  const abrirPaginaMapa = () => {
    if (onMapClick) onMapClick();
    if (alojamentoId) navigate(`/mapa?foco=${alojamentoId}`);
    else navigate('/mapa');
  };

  useEffect(() => {
    if (!temCoordenadas || !mapContainer.current || map.current) return;
    if (!MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 14,
      interactive: false,
      attributionControl: false
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      new mapboxgl.Marker({ color: '#1e3a8a', scale: 1.2 }).setLngLat([lng, lat]).addTo(map.current);
    });

    return () => {
      if (map.current) { map.current.remove(); map.current = null; }
    };
  }, [temCoordenadas, latitude, longitude]);

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">{t('localizacao') || 'Localização'}</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{textoLocalizacao}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (temCoordenadas) window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
              else window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(textoLocalizacao)}`, '_blank');
            }}
            className="flex items-center gap-1 text-blue-900 text-[10px] font-bold hover:underline transition-colors"
          >
            Google Maps <ExternalLink size={10} />
          </button>
          <button onClick={abrirPaginaMapa} className="flex items-center gap-1 text-blue-900 text-[10px] font-bold hover:underline transition-colors">
            {t('ver_mapa') || 'Ver Mapa'} <ExternalLink size={10} />
          </button>
        </div>
      </div>

      {temCoordenadas && MAPBOX_TOKEN ? (
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div ref={mapContainer} className="relative w-full h-[160px] bg-slate-100" style={{ cursor: 'pointer' }} onClick={abrirPaginaMapa} />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={abrirPaginaMapa}
              className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 z-10 cursor-pointer"
            >
              <MapPin size={14} className="fill-white" />
              {t('ver_mapa') || 'Ver mapa'}
            </button>
          </div>
          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-md pointer-events-none">
            <div className="flex items-center gap-1">
              <MapPin size={10} className="text-red-500" />
              <span className="text-[9px] font-bold text-slate-700">{cidadeNome}</span>
            </div>
          </div>
          <button
            onClick={abrirPaginaMapa}
            className="absolute bottom-2 right-2 bg-white hover:bg-gray-50 rounded-lg p-1.5 shadow-md transition-all pointer-events-auto"
          >
            <Maximize2 size={14} className="text-slate-600" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => {
            if (onMapClick) onMapClick();
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(textoLocalizacao)}`, '_blank');
          }}
          className="relative w-full h-[140px] rounded-xl overflow-hidden bg-slate-100 border border-slate-100 cursor-pointer group"
        >
          <img
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=400&h=200&fit=crop"
            alt="Mapa ilustrativo"
            className="w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300">
            <div className="relative bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg transition-transform group-hover:scale-110">
              <MapPin size={24} className="text-blue-900 fill-blue-900" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-[9px] font-bold text-blue-900 shadow-sm">
            📍 {textoLocalizacao}
          </div>
        </div>
      )}

      {pontosProximos && pontosProximos.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-[10px] font-semibold text-slate-600 mb-2">📍 {t('proximo_de') || 'Próximo de'}:</p>
          <ul className="space-y-1">
            {pontosProximos.slice(0, 3).map((ponto, i) => (
              <li key={i} className="text-[9px] text-slate-500 flex items-center gap-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                {ponto}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ============================================================
// HORÁRIOS CHECK-IN / CHECK-OUT
// ============================================================
const HorariosCheckInOut = ({ alojamento }) => {
  const { t } = useTranslation();
  if (!alojamento) return null;

  const formatarHora = (h) => {
    if (!h || typeof h !== 'string') return null;
    const m = h.match(/^(\d{2}):(\d{2})/);
    if (!m) return null;
    if (m[1] === '00' && m[2] === '00') return null;
    return `${m[1]}:${m[2]}`;
  };

  const inicio = formatarHora(alojamento.checkin_inicio);
  const fim    = formatarHora(alojamento.checkin_fim);
  const limite = formatarHora(alojamento.checkout_limite);

  const flexivel = Number(alojamento.checkin_flexivel) === 1;
  const nota = (alojamento.checkin_flexivel_nota || '').trim();

  if (flexivel) {
    return (
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <CalendarDays size={18} className="text-blue-900 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-slate-900">
            {t('checkin_flexivel') || 'Check-in flexível'}
          </p>
          <p className="text-sm text-slate-600">
            {nota || (t('contacte_anfitriao_horario') ||
              'Contacte o anfitrião para combinar o horário de chegada.')}
          </p>
        </div>
      </div>
    );
  }

  if (!inicio && !fim && !limite) return null;

  const textoCheckIn =
    inicio && fim ? `${t('checkin') || 'Check-in'}: ${inicio} – ${fim}`
    : inicio     ? `${t('checkin') || 'Check-in'}: ${t('a_partir_de') || 'a partir das'} ${inicio}`
    : fim         ? `${t('checkin') || 'Check-in'}: ${t('ate') || 'até às'} ${fim}`
    : null;

  const textoCheckOut = limite
    ? `${t('checkout') || 'Check-out'}: ${t('ate') || 'até às'} ${limite}`
    : null;

  return (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
      <CalendarDays size={18} className="text-slate-600 mt-0.5 shrink-0" />
      <div className="space-y-1">
        {textoCheckIn  && <p className="text-sm font-semibold text-slate-900">{textoCheckIn}</p>}
        {textoCheckOut && <p className="text-sm font-semibold text-slate-900">{textoCheckOut}</p>}
      </div>
    </div>
  );
};

// ============================================================
// SIDEBAR DE RESERVA (multi-quarto + modo inteiro)
// ============================================================
const SidebarReserva = ({
  carrinhoQuartos = [],
  estrelas,
  datasBloqueadas = [],
  onContinueToCheckout,
  onRemoveQuarto,
  onDatasChange,
  vendaPorQuarto = true,
  capacidadeBase = 2,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [numHospedes, setNumHospedes] = useState(2);
  const [showCalendar, setShowCalendar] = useState(false);
  const [validandoStock, setValidandoStock] = useState(false);

  const capacidadeTotal = vendaPorQuarto
    ? Math.max(
        1,
        carrinhoQuartos.reduce(
          (acc, q) => acc + Number(q.capacidade || 1) * Number(q.quantidade || 1),
          0
        ) || 2
      )
    : Math.max(1, Number(capacidadeBase) || 2);

  const listaHospedes = Array.from({ length: capacidadeTotal }, (_, i) => i + 1);

  useEffect(() => {
    if (numHospedes > capacidadeTotal) setNumHospedes(capacidadeTotal);
  }, [capacidadeTotal]);

  useEffect(() => {
    if (onDatasChange) {
      onDatasChange({
        checkIn: startDate ? startDate.toISOString().split('T')[0] : null,
        checkOut: endDate ? endDate.toISOString().split('T')[0] : null,
      });
    }
  }, [startDate, endDate, onDatasChange]);

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (start && end) setTimeout(() => setShowCalendar(false), 300);
  };

  const noites =
    startDate && endDate
      ? Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)))
      : 1;

  const subtotal = carrinhoQuartos.reduce(
    (acc, q) => acc + Number(q.precoNoite || 0) * Number(q.quantidade || 1) * noites,
    0
  );

  const precoMedioNoite = carrinhoQuartos.length
    ? carrinhoQuartos.reduce(
        (acc, q) => acc + Number(q.precoNoite || 0) * Number(q.quantidade || 1),
        0
      )
    : 0;

  const handleContinue = async () => {
    if (vendaPorQuarto && !carrinhoQuartos.length) {
      showToast(t('selecione_quarto', 'Escolha pelo menos um tipo de quarto'), 'error');
      return;
    }
    if (!startDate || !endDate) {
      showToast(t('selecione_datas') || "Por favor, selecione as datas de Check-in e Check-out", 'error');
      setShowCalendar(true);
      return;
    }

    setValidandoStock(true);
    if (onContinueToCheckout) {
      await onContinueToCheckout({ startDate, endDate, numHospedes, noites, subtotal });
    }
    setValidandoStock(false);
  };

  const podeContinuar = vendaPorQuarto ? carrinhoQuartos.length > 0 : true;

  return (
    <div className="lg:block">
      <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-lg">
        <div className="flex justify-between items-end mb-5">
          <div className="text-2xl font-bold text-slate-900">
            {precoMedioNoite.toLocaleString('pt-PT')} CVE
            <span className="text-sm font-normal text-slate-500"> / {t('noite') || 'noite'}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
            <Star size={14} className="fill-orange-500 text-orange-500" /> {estrelas}
          </div>
        </div>

        <div className="border border-slate-300 rounded-xl mb-4 overflow-visible relative">
          <div
            className="flex border-b border-slate-300 cursor-pointer hover:bg-slate-50 transition-all rounded-t-xl"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <div className="flex-1 p-2.5 border-r border-slate-300">
              <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{t('checkin') || 'Check-in'}</label>
              <div className="text-xs font-bold text-slate-900">
                {startDate ? startDate.toLocaleDateString('pt-PT') : (t('data') || 'Data')}
              </div>
            </div>
            <div className="flex-1 p-2.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{t('checkout') || 'Check-out'}</label>
              <div className="text-xs font-bold text-slate-900">
                {endDate ? endDate.toLocaleDateString('pt-PT') : (t('data') || 'Data')}
              </div>
            </div>
          </div>

          {showCalendar && (
            <div className="absolute right-0 top-full mt-2 z-[100] shadow-2xl rounded-2xl bg-white border border-slate-200 p-3 max-w-[95vw] overflow-x-auto">
              <CalendarioMorabeza
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={onChange}
                excludeDates={datasBloqueadas.map(d => new Date(d))}
              />
              <div className="p-2 border-t border-slate-100 flex justify-end">
                <button onClick={() => setShowCalendar(false)} className="text-blue-900 font-bold text-[10px] uppercase">
                  {t('fechar') || 'Fechar'}
                </button>
              </div>
            </div>
          )}

          <div className="p-2.5 flex justify-between items-center relative">
            <div className="flex-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{t('hospedes') || 'Hóspedes'}</label>
              <select
                value={numHospedes}
                onChange={(e) => setNumHospedes(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-slate-900 outline-none w-full cursor-pointer appearance-none"
              >
                {listaHospedes.map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? (t('hospede') || 'hóspede') : (t('hospedes') || 'hóspedes')}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown size={14} className="text-slate-400 pointer-events-none" />
          </div>
        </div>

        {carrinhoQuartos.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2 mb-3">
            <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider">
              {vendaPorQuarto
                ? t('quartos_escolhidos', 'Quartos escolhidos')
                : t('alojamento', 'Alojamento')}
            </p>
            {carrinhoQuartos.map((q) => (
              <div
                key={q.tipoQuartoId || 'inteiro'}
                className="flex items-start justify-between gap-2 text-xs bg-slate-50 rounded-lg p-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">
                    {q.modoInteiro ? q.nome : `${q.quantidade}× ${q.nome}`}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {q.capacidade * q.quantidade}{' '}
                    {q.capacidade * q.quantidade === 1
                      ? t('pessoa', 'pessoa')
                      : t('pessoas', 'pessoas')}
                  </p>
                </div>
                {!q.modoInteiro && (
                  <button
                    type="button"
                    onClick={() => onRemoveQuarto && onRemoveQuarto(q.tipoQuartoId)}
                    className="text-slate-400 hover:text-red-500 text-[10px] font-bold px-2"
                  >
                    {t('remover', 'remover')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 space-y-3 mt-4">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
            <span>
              {t('subtotal', 'Subtotal')} ({noites} {noites === 1 ? (t('noite') || 'noite') : (t('noites') || 'noites')})
            </span>
            <span className="font-bold text-slate-900">{subtotal.toLocaleString('pt-PT')} CVE</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <span className="text-sm font-bold text-slate-900">{t('total') || 'Total'}</span>
            <span className="text-lg font-bold text-blue-900">{subtotal.toLocaleString('pt-PT')} CVE</span>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!podeContinuar || validandoStock}
          className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl mb-4 mt-6 hover:bg-blue-950 transition-all shadow-lg text-sm active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {validandoStock ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              {t('verificando_disponibilidade', 'A verificar disponibilidade...')}
            </>
          ) : (
            t('continuar_para_reserva') || 'Continuar para reserva'
          )}
        </button>

        <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
          <CheckCircle className="text-green-600 mt-0.5 shrink-0" size={14} />
          <div>
            <h5 className="text-xs font-bold text-green-800 tracking-tight">{t('cancelamento_gratis') || 'Cancelamento gratuito'}</h5>
            <p className="text-[10px] text-green-700 leading-tight">{t('cancelamento_prazo') || 'Até 48 horas antes do check-in'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// AMENITIES BAR
// ============================================================
const AmenitiesBar = ({ infoBasica, comodidades }) => {
  const { t } = useTranslation();

  const getIconForComodidade = (nome) => {
    const nomeLower = nome.toLowerCase();
    if (nomeLower.includes('wifi') || nomeLower.includes('wi-fi')) return Wifi;
    if (nomeLower.includes('ar condicionado')) return Wind;
    if (nomeLower.includes('cozinha')) return Coffee;
    if (nomeLower.includes('tv')) return LayoutGrid;
    if (nomeLower.includes('quarto') || nomeLower.includes('suite')) return Bed;
    if (nomeLower.includes('banheira')) return Bath;
    if (nomeLower.includes('piscina')) return Droplet;
    if (nomeLower.includes('estacionamento')) return Car;
    if (nomeLower.includes('vista mar')) return Eye;
    if (nomeLower.includes('segurança')) return Shield;
    if (nomeLower.includes('elevador')) return ChevronUp;
    if (nomeLower.includes('máquina de lavar')) return Shirt;
    return CheckCircle;
  };

  const comodidadesReais = comodidades || [];

  if (comodidadesReais.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-slate-500 text-sm">{t('nenhuma_comodidade') || 'Nenhuma comodidade cadastrada'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {comodidadesReais.map((item, i) => {
        const IconComponent = getIconForComodidade(item.nome);
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="text-slate-400 shrink-0">
              <IconComponent size={18} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-900 leading-tight">
                {item.nome.length > 25 ? item.nome.substring(0, 25) + '...' : item.nome}
              </span>
              <span className="text-[9px] text-slate-400 font-medium">
                {item.descricao || (t('incluido') || 'Incluído')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// IMAGE GALLERY
// ============================================================
const ImageGallery = ({ images, onImageChange, onOpenModal, titulo }) => {
  const { t } = useTranslation();
  const placeholder = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop";
  const img1 = images[0] || placeholder;
  const img2 = images[1] || placeholder;
  const img3 = images[2] || placeholder;
  const img4 = images[3] || placeholder;

  return (
    <div className="flex flex-col md:flex-row gap-2.5 w-full text-left">
      <div
        className="w-full md:w-[62%] h-[240px] md:h-[390px] relative rounded-2xl overflow-hidden cursor-pointer shadow-sm"
        onClick={() => { onImageChange(0); onOpenModal(); }}
      >
        <img src={img1} className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" alt={`${titulo} - Principal`} />
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-xs text-xs backdrop-blur-sm pointer-events-none font-sans">
          1 / {images.length || 1}
        </div>
      </div>

      <div className="w-full md:w-[38%] flex flex-col gap-2.5 h-[240px] md:h-[390px]">
        <div className="h-1/2 rounded-2xl overflow-hidden relative cursor-pointer shadow-sm" onClick={() => { onImageChange(1); onOpenModal(); }}>
          <img src={img2} className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" alt={`${titulo} - Imagem 2`} />
        </div>

        <div className="h-1/2 flex gap-2.5">
          <div className="flex-1 rounded-2xl overflow-hidden relative cursor-pointer shadow-sm" onClick={() => { onImageChange(2); onOpenModal(); }}>
            <img src={img3} className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" alt={`${titulo} - Imagem 3`} />
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden relative cursor-pointer shadow-sm" onClick={() => { onImageChange(3); onOpenModal(); }}>
            <img src={img4} className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" alt={`${titulo} - Imagem 4`} />
            <div
              onClick={(e) => { e.stopPropagation(); onImageChange(0); onOpenModal(); }}
              className="absolute bottom-2.5 right-2.5 bg-white hover:bg-slate-50 text-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold border border-slate-200 shadow-md cursor-pointer z-20 transition-all active:scale-95 whitespace-nowrap"
            >
              <Camera size={12} className="text-slate-700" /> {t('ver_todas_fotos') || 'Ver todas as fotos'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// TAB CONTENT
// ============================================================
const TabContent = ({ activeTab, alojamento }) => {
  const { t } = useTranslation();
  if (!alojamento) return null;

  switch (activeTab) {
    case 0:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('sobre_este_espaco') || 'Sobre este espaço'}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {alojamento.descricao_detalhada || alojamento.descricao ||
                `${t('este_espacoso') || 'Este espaçoso'} ${alojamento.tipo_propriedade?.toLowerCase() || 'alojamento'} ${t('em') || 'em'} ${alojamento.localizacao} oferece conforto e tranquilidade.`}
            </p>
          </div>
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('o_que_oferece') || 'O que este espaço oferece'}</h3>
            <div className="grid grid-cols-2 gap-3">
              {alojamento.comodidades?.slice(0, 8).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-sm text-slate-600">{item.nome}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case 1:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">{t('todas_comodidades') || 'Todas as comodidades'}</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
            {alojamento.comodidades?.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle size={14} className="text-blue-900" /> {item.nome}
              </li>
            ))}
          </ul>
        </div>
      );
    case 2:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">{t('regras_casa_titulo') || 'Regras da Casa'}</h3>
          <HorariosCheckInOut alojamento={alojamento} />
          <div className="space-y-4">
            {alojamento.regras_casa?.map((regra, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle size={18} className="text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">{regra.titulo}</p>
                  <p className="text-sm text-slate-500">{regra.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export const InfoAlojamento = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alojamento, setAlojamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [tiposQuarto, setTiposQuarto] = useState([]);

  const [quantidades, setQuantidades] = useState({});
  const [quartoSelecionado, setQuartoSelecionado] = useState(null);
  const [carrinhoDatas, setCarrinhoDatas] = useState({ checkIn: null, checkOut: null });
  const [stocksPorTipo, setStocksPorTipo] = useState({});

  const vendaPorQuarto = Array.isArray(tiposQuarto) && tiposQuarto.length > 0;
  const precoBase = Number(alojamento?.preco_noite || 0);
  const capacidadeBase = Number(alojamento?.capacidade || 2);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try { setUsuarioLogado(JSON.parse(savedUser)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    const fetchAlojamento = async () => {
      if (!slug) {
        setError(t('slug_nao_fornecido') || 'Slug do alojamento não fornecido');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const resolverUrlImagem = (url) => {
        if (!url || typeof url !== 'string') return null;
        const limpa = url.trim();
        if (!limpa) return null;
        if (limpa.startsWith('http://') || limpa.startsWith('https://')) return limpa;
        if (limpa.startsWith('/')) return `${API_BASE}${limpa}`;
        return `${API_BASE}/${limpa}`;
      };

      try {
        const response = await fetch(`${API_BASE}/api/get_alojamento_detalhes.php?slug=${slug}&t=${Date.now()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        setAlojamento(data);

        if (data.tipos_quarto && data.tipos_quarto.length > 0) {
          setTiposQuarto(data.tipos_quarto);
        } else {
          setTiposQuarto([]);
        }

        let fotosUrls = [];
        if (Array.isArray(data.imagens) && data.imagens.length > 0) {
          fotosUrls = data.imagens
            .map(img => resolverUrlImagem(img.caminho_url || img.url || img.imagem_url))
            .filter(Boolean);
        }

        if (fotosUrls.length === 0 && data.imagem_url) {
          const principal = resolverUrlImagem(data.imagem_url);
          if (principal) fotosUrls.push(principal);
        }

        if (fotosUrls.length === 0) {
          fotosUrls.push("https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop");
        }

        setImages(fotosUrls);
      } catch (err) {
        console.error('Erro ao buscar alojamento:', err);
        setError(err.message || (t('erro_carregar') || 'Erro ao carregar dados do alojamento'));
      } finally {
        setLoading(false);
      }
    };

    fetchAlojamento();
  }, [slug, t]);

  useEffect(() => {
    if (!vendaPorQuarto) return;
    if (!tiposQuarto.length || !carrinhoDatas.checkIn || !carrinhoDatas.checkOut) return;

    let cancelado = false;
    const fetchStocks = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/verificar_stock_multi.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quartos: tiposQuarto.map(tq => ({
              tipo_quarto_id: tq.id,
              quantidade: 1,
            })),
            checkin: carrinhoDatas.checkIn,
            checkout: carrinhoDatas.checkOut,
          }),
        });
        const data = await res.json();
        if (cancelado) return;

        const mapa = {};
        (data.detalhes || []).forEach(d => {
          mapa[d.tipo_quarto_id] = d.disponivel;
        });
        setStocksPorTipo(mapa);
      } catch (e) {
        if (cancelado) return;
        console.error('Erro ao buscar stocks:', e);
      }
    };
    fetchStocks();

    return () => { cancelado = true; };
  }, [vendaPorQuarto, tiposQuarto, carrinhoDatas.checkIn, carrinhoDatas.checkOut]);

  const tracking = useAlojamentoTracking(alojamento?.id || null, usuarioLogado?.id || null);
  const registrarCliqueReserva = tracking?.registrarCliqueReserva || (() => {});
  const registrarCliqueContato = tracking?.registrarCliqueContato || (() => {});
  const registrarVisualizacaoMapa = tracking?.registrarVisualizacaoMapa || (() => {});

  const carrinhoQuartos = useMemo(() => {
    if (vendaPorQuarto) {
      return Object.entries(quantidades)
        .filter(([_, qtd]) => qtd > 0)
        .map(([tipoId, qtd]) => {
          const tipo = tiposQuarto.find(tq => String(tq.id) === String(tipoId));
          if (!tipo) return null;
          return {
            tipoQuartoId: tipo.id,
            nome: tipo.nome || tipo.tipo_nome || 'Quarto',
            precoNoite: Math.round(
              Number(tipo.preco_calculado || tipo.preco_personalizado || tipo.preco_noite || 0)
            ),
            capacidade: Number(tipo.capacidade || tipo.capacidade_quarto || 2),
            quantidade: qtd,
            imagem: tipo.imagem || tipo.foto_capa || null,
            modoInteiro: false,
          };
        })
        .filter(Boolean);
    }

    if (!alojamento) return [];
    return [{
      tipoQuartoId: null,
      nome: alojamento.titulo || 'Alojamento inteiro',
      precoNoite: Math.round(precoBase),
      capacidade: capacidadeBase,
      quantidade: 1,
      imagem: images[0] || alojamento.imagem_url || null,
      modoInteiro: true,
    }];
  }, [vendaPorQuarto, quantidades, tiposQuarto, alojamento, images, precoBase, capacidadeBase]);

  const capacidadeTotal = useMemo(() => {
    if (!vendaPorQuarto) return capacidadeBase;
    return carrinhoQuartos.reduce(
      (acc, q) => acc + Number(q.capacidade) * Number(q.quantidade),
      0
    );
  }, [vendaPorQuarto, carrinhoQuartos, capacidadeBase]);

  const handleQuantidadeChange = useCallback((tipoId, novaQtd) => {
    setQuantidades(prev => ({ ...prev, [tipoId]: novaQtd }));
  }, []);

  const handleSelecaoQuarto = useCallback((idQuarto, titulo, novoPreco) => {
    setQuantidades(prev => {
      const atual = prev[idQuarto] || 0;
      if (atual > 0) {
        return { ...prev, [idQuarto]: 0 };
      }
      return { ...prev, [idQuarto]: 1 };
    });
    setQuartoSelecionado(prev => (prev === idQuarto ? null : idQuarto));
  }, []);

  const handleRemoverQuarto = useCallback((tipoId) => {
    setQuantidades(prev => ({ ...prev, [tipoId]: 0 }));
  }, []);

  // 🔥 VALIDAÇÃO PROFISSIONAL DE DISPONIBILIDADE ANTES DE ENTRAR NO CHECKOUT
const handleContinueToCheckout = async (reservaInfo) => {
    registrarCliqueReserva();
    if (!alojamento) return;

    const checkInStr = reservaInfo.startDate.toISOString().split('T')[0];
    const checkOutStr = reservaInfo.endDate.toISOString().split('T')[0];

    try {
      // Chama a nova API dedicada de verificação de disponibilidade
const url = `${API_BASE}/api/verificar_disponibilidade.php?alojamento_id=${encodeURIComponent(alojamento.id)}&checkin=${encodeURIComponent(checkInStr)}&checkout=${encodeURIComponent(checkOutStr)}`;
const res = await fetch(url, { method: 'GET' });
      const data = await res.json();

      if (data.success && data.disponivel === false) {
        showToast(t('sem_stock_disponivel', 'Este alojamento não está disponível ou não tem registo para as datas selecionadas.'), 'error');
        return; // Interrompe o fluxo e impede de avançar para o checkout!
      }
    } catch (err) {
      console.error('Erro ao verificar disponibilidade:', err);
      showToast(t('erro_verificar_disponibilidade', 'Erro ao verificar disponibilidade. Tente novamente.'), 'error');
      return;
    }

    const taxaLimpeza = Number(alojamento.taxa_limpeza || alojamento.limpeza || 0);

    const dadosParaCheckout = {
      id: alojamento.id,
      titulo: alojamento.titulo,
      imagem: images[0] || alojamento.imagem_url,
      localizacao: alojamento.localizacao,
      ilha: alojamento.ilha || 'Cabo Verde',
      checkIn: checkInStr,
      checkOut: checkOutStr,
      hospedes: reservaInfo.numHospedes,
      capacidade: capacidadeTotal,
      noites: reservaInfo.noites,
      taxaLimpeza,
      descricao: alojamento.descricao,
      comodidades: alojamento.comodidades || [],
      quartos: carrinhoQuartos,
      tipoVenda: vendaPorQuarto ? 'quartos' : 'inteiro',
    };

    navigate('/checkout-alojamento', { state: { reservaData: dadosParaCheckout } });
  };  

  const handleOpenLoginModal = () => {
    showToast(t('login_para_avaliar') || "Por favor, faça login para avaliar.", 'info');
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-900 mx-auto mb-4" />
          <p className="text-slate-600">{t('carregando_alojamento') || 'Carregando informações do alojamento...'}</p>
        </div>
      </div>
    );
  }

  if (error || !alojamento) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{t('erro_carregar_titulo') || 'Erro ao carregar'}</h2>
          <p className="text-slate-600 mb-4">{error || (t('alojamento_nao_encontrado') || 'Alojamento não encontrado')}</p>
          <button onClick={() => navigate(-1)} className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-950 transition">
            {t('voltar') || 'Voltar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white font-sans pb-20">
      {isModalOpen && (
        <ImageSliderModal
          images={images}
          currentIndex={currentImageIndex}
          onClose={() => setIsModalOpen(false)}
          onPrev={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
          onNext={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
        />
      )}

      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-[11px] font-medium text-slate-500 text-left">
        <span onClick={() => navigate('/')} className="hover:text-blue-900 cursor-pointer">{t('inicio') || 'Início'}</span>
        <ChevronRight size={10} />
        <span onClick={() => navigate('/alojamentos')} className="hover:text-blue-900 cursor-pointer">{t('alojamentos') || 'Alojamentos'}</span>
        <ChevronRight size={10} />
        <span className="text-slate-500 font-semibold truncate">{alojamento.titulo}</span>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ImageGallery
              images={images}
              onImageChange={setCurrentImageIndex}
              onOpenModal={() => setIsModalOpen(true)}
              titulo={alojamento.titulo}
            />

            <div className="mt-6 pt-6 border-t border-slate-100 text-left">
              <h3 className="text-sm font-bold text-slate-900 mb-4">{t('comodidades_principais') || 'Comodidades principais'}</h3>
              <AmenitiesBar infoBasica={alojamento.info_basica} comodidades={alojamento.comodidades} />
            </div>

            {vendaPorQuarto ? (
              <SeccaoEscolhaQuarto
                quartoSelecionado={quartoSelecionado}
                onSelecaoQuarto={handleSelecaoQuarto}
                tiposQuarto={tiposQuarto}
                quantidadesProp={quantidades}
                onQuantidadeChange={handleQuantidadeChange}
                stocksPorTipo={stocksPorTipo}
                alojamentoId={alojamento.id}
              />
            ) : (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-left">
                <p className="text-xs font-bold text-blue-900">
                  {t('alojamento_inteiro', 'Este alojamento é reservado na totalidade')}
                </p>
                <p className="text-[11px] text-blue-700 mt-1 font-medium">
                  {t('capacidade_total', 'Capacidade total')}: {capacidadeBase}{' '}
                  {capacidadeBase === 1
                    ? t('pessoa', 'pessoa')
                    : t('pessoas', 'pessoas')}
                </p>
              </div>
            )}
          </div>

          <div className="lg:self-start">
            <div className="sticky top-24 z-30">
              <SidebarReserva
                carrinhoQuartos={carrinhoQuartos}
                estrelas={alojamento.estrelas}
                datasBloqueadas={alojamento.datas_bloqueadas || []}
                onContinueToCheckout={handleContinueToCheckout}
                onRemoveQuarto={handleRemoverQuarto}
                onDatasChange={setCarrinhoDatas}
                vendaPorQuarto={vendaPorQuarto}
                capacidadeBase={capacidadeBase}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 text-left">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">{alojamento.titulo}</h1>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">{alojamento.tipo}</span>
            </div>
            <div className="flex items-center gap-4 text-sm mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin size={14} className="text-orange-500" /> {alojamento.localizacao}
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-orange-400 text-orange-400" />
                <span className="text-slate-900 font-bold">{alojamento.estrelas}</span>
                <span className="text-slate-400">({alojamento.total_avaliacoes || 0} {t('avaliacoes') || 'avaliações'})</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BotaoDenuncia tipo="alojamento" itemId={alojamento.id} itemTitulo={alojamento.titulo} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6 text-left">
        <TabsNavegacaoAlojamentos activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TabContent activeTab={activeTab} alojamento={alojamento} />
          </div>
          <div className="space-y-4">
            <HostInfo
              proprietario={alojamento.proprietario}
              onContactClick={registrarCliqueContato}
              alojamentoTitulo={alojamento.titulo}
            />
            <MapLocation
              localizacao={alojamento.localizacao}
              pontosProximos={alojamento.pontos_proximos}
              endereco={alojamento.endereco_completo}
              latitude={alojamento.latitude}
              longitude={alojamento.longitude}
              alojamentoId={alojamento.id}
              onMapClick={registrarVisualizacaoMapa}
            />
          </div>
        </div>
      </div>

      <div className="w-full bg-white border-t border-slate-100 mt-12 pt-12">
        <div className="max-w-7xl mx-auto px-6">
          <AvaliacoesSeccaoAlojamento
            alojamentoId={alojamento.id}
            usuarioLogado={usuarioLogado}
            onOpenLoginModal={handleOpenLoginModal}
          />
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default InfoAlojamento;