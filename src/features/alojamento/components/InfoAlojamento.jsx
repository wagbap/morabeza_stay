import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Users, Bed, Bath, Wifi, Wind, Coffee, MapPin, Star, 
  ChevronRight, ChevronLeft, LayoutGrid, Camera,
  CheckCircle, ExternalLink, ChevronDown, X, Loader2,
  Droplet, Car, Eye, Shield, ChevronUp, Shirt, WashingMachine, 
  CalendarDays, Calendar, Maximize2, Navigation
} from 'lucide-react';
import AvaliacoesSeccaoAlojamento from './AvaliacoesSeccaoAlojamento';
import SeccaoEscolhaQuarto from './SeccaoEscolhaQuarto';
import useAlojamentoTracking from "../hooks/useAlojamentoTracking";

// Token do Mapbox
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const ImageSliderModal = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  const { t } = useTranslation();
  
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
        aria-label={t('fechar') || "Fechar"}
      >
        <X size={24} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
        aria-label={t('imagem_anterior') || "Imagem anterior"}
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
        aria-label={t('proxima_imagem') || "Próxima imagem"}
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

const HostInfo = ({ proprietario, onContactClick }) => {
  const { t } = useTranslation();
  
  if (!proprietario) return null;
  
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
            {proprietario.superhost ? (t('superhost') || 'Superhost') + ' • ' : ''}{proprietario.tempo_resposta || (t('responde_rapido') || 'Responde rápido')}
          </p>
        </div>
      </div>
      <button 
        onClick={onContactClick}
        className="w-full py-2.5 border border-blue-900 text-blue-900 text-[11px] font-bold rounded-xl hover:bg-slate-50 transition-colors"
      >
        {t('contactar_anfitriao') || 'Contactar anfitrião'}
      </button>
    </div>
  );
};

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
    
    if (alojamentoId) {
      navigate(`/mapa?foco=${alojamentoId}`);
    } else {
      navigate('/mapa');
    }
  };
  
  useEffect(() => {
    if (!temCoordenadas || !mapContainer.current || map.current) return;
    if (!MAPBOX_TOKEN) {
      console.error('Mapbox token não configurado');
      return;
    }
    
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
      
      new mapboxgl.Marker({
        color: '#1e3a8a',
        scale: 1.2
      })
        .setLngLat([lng, lat])
        .addTo(map.current);
    });
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
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
              if (temCoordenadas) {
                window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
              } else {
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(textoLocalizacao)}`, '_blank');
              }
            }}
            className="flex items-center gap-1 text-blue-900 text-[10px] font-bold hover:underline transition-colors"
          >
            Google Maps <ExternalLink size={10} />
          </button>
          <button 
            onClick={abrirPaginaMapa}
            className="flex items-center gap-1 text-blue-900 text-[10px] font-bold hover:underline transition-colors"
          >
            {t('ver_mapa') || 'Ver Mapa'} <ExternalLink size={10} />
          </button>
        </div>
      </div>
      
      {temCoordenadas && MAPBOX_TOKEN ? (
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div 
            ref={mapContainer} 
            className="relative w-full h-[160px] bg-slate-100"
            style={{ cursor: 'pointer' }}
            onClick={abrirPaginaMapa}
          />
          
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
            title={t('expandir_mapa') || "Expandir mapa"}
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

const SidebarReserva = ({ precoPorNoite, estrelas, datasBloqueadas = [], onContinueToCheckout }) => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [numHospedes, setNumHospedes] = useState(2);
  const [showCalendar, setShowCalendar] = useState(false);

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      setTimeout(() => setShowCalendar(false), 300);
    }
  };

  const noites = startDate && endDate 
    ? Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)))
    : 1;

  const totalBase = precoPorNoite * noites;

  const handleContinue = () => {
    if (!startDate || !endDate) {
      alert(t('selecione_datas') || "Por favor, selecione as datas de Check-in e Check-out");
      return;
    }
    
    if (onContinueToCheckout) {
      onContinueToCheckout({
        startDate,
        endDate,
        numHospedes,
        noites,
        totalBase
      });
    }
  };

  return (
    <div className="lg:block">
      <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-lg">
        <div className="flex justify-between items-end mb-5">
          <div className="text-2xl font-bold text-slate-900">
            {precoPorNoite.toLocaleString()} CVE 
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
            <div className="absolute right-0 md:-right-40 top-full mt-2 z-[100] shadow-2xl rounded-2xl bg-white border border-slate-200 p-3 max-w-[95vw] md:max-w-none overflow-x-auto">
              <DatePicker
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                monthsShown={2}
                inline
                minDate={new Date()}
                excludeDates={datasBloqueadas.map(d => new Date(d))}
                calendarClassName="morabeza-calendar-inline"
              />
              <div className="p-2 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setShowCalendar(false)} 
                  className="text-blue-900 font-bold text-[10px] uppercase"
                >
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
                <option value="1">1 {t('hospede') || 'hóspede'}</option>
                <option value="2">2 {t('hospedes') || 'hóspedes'}</option>
                <option value="3">3 {t('hospedes') || 'hóspedes'}</option>
                <option value="4">4 {t('hospedes') || 'hóspedes'}</option>
                <option value="5">5 {t('hospedes') || 'hóspedes'}</option>
                <option value="6">6 {t('hospedes') || 'hóspedes'}</option>
              </select>
            </div>
            <ChevronDown size={14} className="text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-3 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600">
              {t('preco_por_noite') || 'Preço por noite'} ({noites} {noites === 1 ? (t('noite') || 'noite') : (t('noites') || 'noites')})
            </span>
            <span className="text-xs font-bold text-blue-600">
              {precoPorNoite.toLocaleString()} CVE × {noites} = {totalBase.toLocaleString()} CVE
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <span className="text-sm font-bold text-slate-600">{t('total_sem_taxas') || 'Total (sem taxas)'}</span>
            <span className="text-base font-bold text-blue-600">
              {totalBase.toLocaleString()} CVE
            </span>
          </div>
        </div>

        <button 
          onClick={handleContinue}
          className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl mb-4 mt-8 hover:bg-blue-950 transition-all shadow-lg text-sm"
        >
          {t('continuar_para_reserva') || 'Continuar para reserva'}
        </button>

        <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
          <CheckCircle className="text-green-600 mt-0.5" size={14} />
          <div>
            <h5 className="text-xs font-bold text-green-800 tracking-tight">{t('cancelamento_gratis') || 'Cancelamento gratuito'}</h5>
            <p className="text-[10px] text-green-700 leading-tight">{t('cancelamento_prazo') || 'Até 48 horas antes do check-in'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AmenitiesBar = ({ infoBasica, comodidades }) => {
  const { t } = useTranslation();
  
  const getIconForComodidade = (nome) => {
    const nomeLower = nome.toLowerCase();
    
    if (nomeLower.includes('wifi') || nomeLower.includes('wi-fi')) return Wifi;
    if (nomeLower.includes('ar condicionado')) return Wind;
    if (nomeLower.includes('cozinha')) return Coffee;
    if (nomeLower.includes('tv') || nomeLower.includes('televisão')) return LayoutGrid;
    if (nomeLower.includes('pequeno-almoço') || nomeLower.includes('café da manhã')) return Coffee;
    if (nomeLower.includes('quarto') || nomeLower.includes('suite')) return Bed;
    if (nomeLower.includes('banheira') || nomeLower.includes('jacuzzi')) return Bath;
    if (nomeLower.includes('piscina')) return Droplet;
    if (nomeLower.includes('estacionamento') || nomeLower.includes('garagem')) return Car;
    if (nomeLower.includes('vista mar') || nomeLower.includes('vista')) return Eye;
    if (nomeLower.includes('segurança')) return Shield;
    if (nomeLower.includes('elevador')) return ChevronUp;
    if (nomeLower.includes('máquina de lavar') || nomeLower.includes('lavanderia')) return Shirt;
    if (nomeLower.includes('calendário') || nomeLower.includes('calendario')) return CalendarDays;
    
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
        let IconComponent = getIconForComodidade(item.nome);
        
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

const ImageGallery = ({ images, onImageChange, onOpenModal, titulo, tipo }) => {
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
        <img 
          src={img1} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" 
          alt={`${titulo} - Principal`} 
        />
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-xs text-xs backdrop-blur-sm pointer-events-none tracking-wide font-sans">
          1 / {images.length || 18}
        </div>
      </div>

      <div className="w-full md:w-[38%] flex flex-col gap-2.5 h-[240px] md:h-[390px]">
        <div 
          className="h-1/2 rounded-2xl overflow-hidden relative cursor-pointer shadow-sm"
          onClick={() => { onImageChange(1); onOpenModal(); }}
        >
          <img 
            src={img2} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" 
            alt={`${titulo} - Quarto`} 
          />
        </div>

        <div className="h-1/2 flex gap-2.5">
          <div 
            className="flex-1 rounded-2xl overflow-hidden relative cursor-pointer shadow-sm"
            onClick={() => { onImageChange(2); onOpenModal(); }}
          >
            <img 
              src={img3} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" 
              alt={`${titulo} - Piscina`} 
            />
          </div>
          
          <div 
            className="flex-1 rounded-2xl overflow-hidden relative cursor-pointer shadow-sm"
            onClick={() => { onImageChange(3); onOpenModal(); }}
          >
            <img 
              src={img4} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" 
              alt={`${titulo} - Cozinha`} 
            />

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

const TabContent = ({ activeTab, alojamento }) => {
  const { t } = useTranslation();
  
  if (!alojamento) return null;

  switch(activeTab) {
    case 0:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('sobre_este_espaco') || 'Sobre este espaço'}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {alojamento.descricao_detalhada || alojamento.descricao || 
                `${t('este_espacoso') || 'Este espaçoso'} ${alojamento.tipo_propriedade?.toLowerCase() || (t('apartamento') || 'apartamento')} ${t('em') || 'em'} ${alojamento.localizacao} ${t('oferece_experiencia') || 'oferece uma experiência única de conforto e tranquilidade.'}`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">{t('comodidades_gerais') || 'Comodidades Gerais'}</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                {alojamento.comodidades?.map((item, i) => (
                  <li key={i}>• {item.nome}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">{t('regras_casa_titulo') || 'Regras da Casa'}</h3>
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

export const InfoAlojamento = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alojamento, setAlojamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [tiposQuarto, setTiposQuarto] = useState([]);
  const [quartoSelecionado, setQuartoSelecionado] = useState(null);
  const [precoNoiteDinamico, setPrecoNoiteDinamico] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUsuarioLogado(user);
      } catch (e) {
        console.error('Erro ao carregar usuário:', e);
      }
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

      try {
        const response = await fetch(`https://welovepalop.com/api/get_alojamento_detalhes.php?slug=${slug}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setAlojamento(data);
        setPrecoNoiteDinamico(Number(data.preco_noite));
        
        if (data.tipos_quarto && data.tipos_quarto.length > 0) {
          setTiposQuarto(data.tipos_quarto);
          const primeiroQuarto = data.tipos_quarto[0];
          setQuartoSelecionado(primeiroQuarto.id);
          setPrecoNoiteDinamico(primeiroQuarto.preco_calculado);
        }
        
        if (data.imagens && data.imagens.length > 0) {
          const imageUrls = data.imagens.map(img => img.caminho_url);
          setImages(imageUrls);
        } else if (data.imagem_url) {
          setImages([data.imagem_url]);
        } else {
          setImages([
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=1200&h=800&fit=crop",
          ]);
        }
      } catch (err) {
        console.error('Erro ao buscar alojamento:', err);
        setError(err.message || (t('erro_carregar') || 'Erro ao carregar dados do alojamento'));
      } finally {
        setLoading(false);
      }
    };

    fetchAlojamento();
  }, [slug, t]);

  // Tracking - Só inicializar quando o alojamento estiver carregado
  const tracking = useAlojamentoTracking(alojamento?.id || null, usuarioLogado?.id || null);
  
  const registrarCliqueReserva = tracking?.registrarCliqueReserva || (() => {});
  const registrarCliqueContato = tracking?.registrarCliqueContato || (() => {});
  const registrarVisualizacaoMapa = tracking?.registrarVisualizacaoMapa || (() => {});

  const handleSelecaoQuarto = (idQuarto, titulo, novoPreco) => {
    setQuartoSelecionado(idQuarto);
    setPrecoNoiteDinamico(novoPreco);
  };

  const handleContinueToCheckout = (reservaInfo) => {
    registrarCliqueReserva();
    
    const userLogado = localStorage.getItem('user');
    
    if (!userLogado) {
      alert(t('login_necessario') || "Por favor, faça login com o Google primeiro.");
      return;
    }

    if (!alojamento) {
      alert(t('erro_alojamento') || "Erro ao carregar dados do alojamento. Tente novamente.");
      return;
    }

    const dadosParaCheckout = {
      id: alojamento.id,
      titulo: alojamento.titulo,
      imagem: images[0] || alojamento.imagem_url,
      localizacao: alojamento.localizacao,
      ilha: alojamento.ilha || 'Cabo Verde',
      precoNoite: precoNoiteDinamico,
      checkIn: reservaInfo.startDate.toISOString().split('T')[0],
      checkOut: reservaInfo.endDate.toISOString().split('T')[0],
      hospedes: reservaInfo.numHospedes,
      capacidade: alojamento.capacidade || reservaInfo.numHospedes,
      noites: reservaInfo.noites,
      totalBase: precoNoiteDinamico * reservaInfo.noites,
      taxaLimpeza: 2500,
      taxaServico: 1200,
      descricao: alojamento.descricao,
      comodidades: alojamento.comodidades || [],
      imagens_extra: alojamento.imagens_extra || [],
      tipoQuartoId: quartoSelecionado
    };

    navigate('/checkout-alojamento', { state: { reservaData: dadosParaCheckout } });
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-950 transition"
          >
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
          onClose={handleCloseModal}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
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
              onImageChange={handleImageChange}
              onOpenModal={handleOpenModal}
              titulo={alojamento.titulo}
              tipo={alojamento.tipo}
            />

            <div className="mt-6 pt-6 border-t border-slate-100 text-left">
              <h3 className="text-sm font-bold text-slate-900 mb-4">{t('comodidades_principais') || 'Comodidades principais'}</h3>
              <AmenitiesBar 
                infoBasica={alojamento.info_basica} 
                comodidades={alojamento.comodidades} 
              />
            </div>

            {tiposQuarto.length > 0 && (
              <SeccaoEscolhaQuarto 
                quartoSelecionado={quartoSelecionado}
                onSelecaoQuarto={handleSelecaoQuarto}
                tiposQuarto={tiposQuarto}
                precoNoiteBase={Number(alojamento.preco_noite)}
              />
            )}
          </div>

          <div className="lg:self-start">
            <div className="sticky top-24 z-30">
              <SidebarReserva 
                precoPorNoite={precoNoiteDinamico || Number(alojamento.preco_noite)}
                estrelas={alojamento.estrelas}
                datasBloqueadas={alojamento.datas_bloqueadas || []}
                onContinueToCheckout={handleContinueToCheckout}
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
            onOpenLoginModal={() => alert(t('login_para_avaliar') || "Por favor, faça login com o Google para avaliar.")}
          />
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .react-datepicker__day--in-range { background-color: #f1f5f9 !important; }
        .react-datepicker__day--range-start, .react-datepicker__day--range-end {
          background-color: #1e3a8a !important; color: white !important; border-radius: 50% !important;
        }
        .react-datepicker__day--disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default InfoAlojamento;