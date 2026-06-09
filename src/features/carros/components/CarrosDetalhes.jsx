import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Users, Gauge, Fuel, MapPin, Star, ChevronRight, ChevronLeft, 
  Camera, CheckCircle, ExternalLink, ChevronDown, 
  X, Loader2, Calendar, Paintbrush, Info, CalendarDays,
  ShieldCheck, Infinity, ShieldAlert, Key, Maximize2, Navigation
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import AvaliacoesSeccaoCarro from './AvaliacoesSeccaoCarro';
import useCarroTracking from "../hooks/useCarroTracking";
import BotaoDenuncia from '../../../components/BotaoDenuncia';

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

const TabsNavegacaoCarros = ({ activeTab = 0, onTabChange }) => {
  const { t } = useTranslation();
  
  const tabs = [
    { id: 0, label: t('visao_geral') || 'Visão Geral' },
    { id: 1, label: t('especificacoes') || 'Especificações' }
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

const EspecificacoesBar = ({ caracteristicas }) => {
  const { t } = useTranslation();
  
  const specs = [
    { icon: Gauge, label: caracteristicas?.transmissao || t('manual') || 'Manual', sub: t('transmissao') || 'Transmissão' },
    { icon: Fuel, label: caracteristicas?.combustivel || t('gasolina') || 'Gasolina', sub: t('combustivel') || 'Combustível' },
    { icon: Users, label: `${caracteristicas?.passageiros || 5} ${t('passageiros') || 'passageiros'}`, sub: t('capacidade') || 'Capacidade' },
    { icon: Calendar, label: caracteristicas?.ano || '2024', sub: t('ano_fabrico') || 'Ano Fabrico' },
    { icon: Info, label: caracteristicas?.quilometragem || '0 km', sub: t('quilometragem') || 'Quilometragem' },
    { icon: Paintbrush, label: caracteristicas?.cor || t('nao_informada') || 'Não informada', sub: t('cor_exterior') || 'Cor Exterior' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {specs.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="text-slate-400 shrink-0">
            <item.icon size={18} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-900 leading-tight">{item.label}</span>
            <span className="text-[9px] text-slate-400 font-medium">{item.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const InclusoesCarroBar = ({ inclusoes, localizacao }) => {
  const { t } = useTranslation();
  
  const dadosExibicao = inclusoes && inclusoes.length > 0 ? inclusoes : [
    { titulo: t('cancelamento') || 'Cancelamento', valor: t('gratuito') || 'Gratuito', icone: 'CheckCircle', cor_classe: 'text-green-600' },
    { titulo: t('seguro_basico') || 'Seguro básico', valor: t('incluido') || 'Incluído', icone: 'ShieldCheck', cor_classe: 'text-green-600' },
    { titulo: t('quilometragem') || 'Quilometragem', valor: t('ilimitada') || 'Ilimitada', icone: 'Infinity', cor_classe: 'text-green-600' },
    { titulo: t('assistencia_24h') || 'Assistência 24/7', valor: t('incluida') || 'Incluída', icone: 'ShieldAlert', cor_classe: 'text-green-600' },
    { titulo: t('levantamento') || 'Levantamento', valor: localizacao || t('aeroporto_praia') || 'Aeroporto da Praia', icone: 'Key', cor_classe: 'text-slate-500' },
    { titulo: t('combustivel') || 'Combustível', valor: t('cheio_cheio') || 'Cheio a cheio', icone: 'Fuel', cor_classe: 'text-slate-500' }
  ];

  const iconesMapeados = {
    CheckCircle: CheckCircle,
    ShieldCheck: ShieldCheck,
    Infinity: Infinity,
    ShieldAlert: ShieldAlert,
    Key: Key,
    Fuel: Fuel
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
      {dadosExibicao.map((item, i) => {
        const IconComponent = iconesMapeados[item.icone] || CheckCircle;
        const corClasse = item.cor_classe || 'text-slate-500';

        return (
          <div key={i} className="flex items-center gap-2 border-r last:border-r-0 border-slate-100 pr-1 text-left">
            <div className="text-slate-400 shrink-0">
              <IconComponent size={18} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-semibold text-slate-500 leading-tight">{item.titulo}</span>
              <span className={`text-[10px] font-bold ${corClasse} mt-0.5`}>{item.valor}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ImageGallery = ({ images, onImageChange, onOpenModal, titulo }) => {
  const { t } = useTranslation();
  const placeholder = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=400&fit=crop";
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
          1 / {images.length || 10}
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
            alt={`${titulo} - Detalhe`} 
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
              alt={`${titulo} - Interior`} 
            />
          </div>
          
          <div 
            className="flex-1 rounded-2xl overflow-hidden relative cursor-pointer shadow-sm"
            onClick={() => { onImageChange(3); onOpenModal(); }}
          >
            <img 
              src={img4} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" 
              alt={`${titulo} - Traseira`} 
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

const MapLocationCarro = ({ localizacao, ilha, latitude, longitude, carroId, onMapClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMapaInterativoOpen, setIsMapaInterativoOpen] = useState(false);
  
  const temCoordenadas = latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude));
  
  const textoLocalizacao = `${ilha || t('cabo_verde') || 'Cabo Verde'}, ${localizacao || (t('localizacao_nao_informada') || 'Localização não informada')}`;
  const cidadeNome = localizacao || ilha || (t('cabo_verde') || 'Cabo Verde');
  
  const abrirPaginaMapa = () => {
    if (onMapClick) onMapClick();
    if (carroId) {
      navigate(`/mapa-carros?foco=${carroId}`);
    } else {
      navigate('/mapa-carros');
    }
  };
  
  const abrirMapaInterativo = () => {
    if (onMapClick) onMapClick();
    setIsMapaInterativoOpen(true);
  };
  
  const getPontosProximos = () => {
    const localLower = (localizacao || '').toLowerCase();
    const ilhaLower = (ilha || '').toLowerCase();
    
    const pontosMap = {
      'praia': [t('praia_santa_maria') || 'Praia de Santa Maria', t('mirage_beach') || 'Mirage Beach Club', t('aeroporto') || 'Aeroporto Internacional'],
      'santa maria': [t('praia_santa_maria') || 'Praia de Santa Maria', t('mirage_beach') || 'Mirage Beach Club', t('ponta_preta') || 'Ponta Preta'],
      'mindelo': [t('porto_grande') || 'Porto Grande', t('centro_cultural') || 'Centro Cultural', t('praca_estrela') || 'Praça Estrela'],
      'palmeira': [t('porto_palmeira') || 'Porto da Palmeira', t('farol') || 'Farol da Ponta do Sinó', t('praia_grande') || 'Praia Grande'],
      'tarrafal': [t('praia_tarrafal') || 'Praia de Tarrafal', t('cha_tanque') || 'Chã de Tanque', t('monte_graciosa') || 'Monte Graciosa'],
      'sal rei': [t('praia_sal_rei') || 'Praia de Sal Rei', t('deserto_viana') || 'Deserto de Viana', t('morro_areia') || 'Morro de Areia'],
    };
    
    for (const [key, pontos] of Object.entries(pontosMap)) {
      if (localLower.includes(key)) {
        return pontos;
      }
    }
    
    const pontosIlha = {
      'sal': [t('praia_santa_maria') || 'Praia de Santa Maria', t('salinas') || 'Salinas', t('palmeira') || 'Palmeira'],
      'santiago': [t('praia_tarrafal') || 'Praia de Tarrafal', t('cidade_velha') || 'Cidade Velha', t('serra_malagueta') || 'Serra Malagueta'],
      'são vicente': [t('porto_grande') || 'Porto Grande', t('centro_mindelo') || 'Centro de Mindelo', t('praia_laginha') || 'Praia Laginha'],
      'santo antão': [t('porto_novo') || 'Porto Novo', t('ribeira_grande') || 'Ribeira Grande', t('miradouro') || 'Miradouro'],
      'fogo': [t('cha_caldeiras') || 'Chã das Caldeiras', t('mosteiros') || 'Mosteiros', t('sao_filipe') || 'São Filipe'],
      'boa vista': [t('praia_santa_monica') || 'Praia de Santa Mónica', t('sal_rei') || 'Sal Rei', t('deserto_viana') || 'Deserto de Viana'],
    };
    
    if (ilhaLower && pontosIlha[ilhaLower]) {
      return pontosIlha[ilhaLower];
    }
    
    return [t('centro_cidade') || 'Centro da cidade', t('zona_hoteleira') || 'Zona Hoteleira', t('posto_combustivel') || 'Posto de combustível'];
  };
  
  const pontosProximos = getPontosProximos();
  
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
      zoom: 12,
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
    <>
      <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm text-left">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">{t('localizacao') || 'Localização'}</h4>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{textoLocalizacao}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={abrirMapaInterativo}
              className="flex items-center gap-1 text-blue-900 text-[10px] font-bold hover:underline transition-colors"
            >
              {t('mapa_ilhas') || 'Mapa Ilhas'} <ExternalLink size={10} />
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
                {t('ver_localizacao') || 'Ver localização'}
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
            onClick={abrirPaginaMapa}
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
    </>
  );
};

const SidebarReservaCarro = ({ precoDia, estrelas, totalReviews, onContinueToCheckout }) => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      setTimeout(() => setShowCalendar(false), 300);
    }
  };

  const dias = startDate && endDate 
    ? Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)))
    : 1;

  const subtotal = precoDia * dias;
  const taxaServico = Math.round(subtotal * 0.10);
  const totalGeral = subtotal + taxaServico;

  const handleContinue = () => {
    if (!startDate || !endDate) {
      alert(t('selecione_datas_carro') || "Por favor, selecione as datas de Levantamento e Devolução");
      return;
    }
    
    if (onContinueToCheckout) {
      onContinueToCheckout({
        startDate,
        endDate,
        dias,
        subtotal,
        taxaServico,
        totalGeral
      });
    }
  };

  const formatarData = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="lg:block text-left">
      <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-lg">
        <div className="flex justify-between items-end mb-5">
          <div className="text-2xl font-black text-slate-900">
            {precoDia.toLocaleString()} CVE 
            <span className="text-xs font-medium text-slate-400"> / {t('dia') || 'dia'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
            <Star size={14} className="fill-orange-500 text-orange-500" /> {Number(estrelas).toFixed(1)} <span className="text-slate-400 font-normal">({totalReviews})</span>
          </div>
        </div>

        <div className="border border-slate-300 rounded-xl mb-4 overflow-visible relative">
          <div 
            className="flex cursor-pointer hover:bg-slate-50 transition-all rounded-xl p-2.5"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <div className="flex-1 border-r border-slate-200 pr-2">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">{t('levantamento') || 'Levantamento'}</label>
              <div className="text-xs font-bold text-slate-800">
                {startDate ? formatarData(startDate) : (t('selecionar_data') || 'Selecionar data')}
              </div>
            </div>
            <div className="flex-1 pl-3">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">{t('devolucao') || 'Devolução'}</label>
              <div className="text-xs font-bold text-slate-800">
                {endDate ? formatarData(endDate) : (t('selecionar_data') || 'Selecionar data')}
              </div>
            </div>
          </div>

          {showCalendar && (
            <div className="absolute right-0 top-full mt-2 z-[100] shadow-2xl rounded-2xl bg-white border border-slate-200 p-3 max-w-[90vw]">
              <DatePicker
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                monthsShown={2}
                inline
                minDate={new Date()}
                calendarClassName="morabeza-calendar-inline"
              />
            </div>
          )}
        </div>

        {startDate && endDate && (
          <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-800">{t('periodo') || 'Período'}:</span>
              </div>
              <span className="text-sm font-black text-blue-600">
                {dias} {dias === 1 ? (t('dia') || 'dia') : (t('dias') || 'dias')}
              </span>
            </div>
            <p className="text-[10px] text-blue-600 mt-1">
              {formatarData(startDate)} → {formatarData(endDate)}
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs font-medium text-slate-600">
          <div className="flex justify-between">
            <span>{t('preco_por_dia') || 'Preço por dia'} ({dias} {dias === 1 ? (t('dia') || 'dia') : (t('dias') || 'dias')})</span>
            <span className="font-bold text-slate-900">{subtotal.toLocaleString()} CVE</span>
          </div>
          
          <div className="flex justify-between">
            <span className="flex items-center gap-1">{t('taxa_servico') || 'Taxa de serviço Morabeza Stay'} (10%) <Info size={11} className="text-slate-400" /></span>
            <span className="font-bold text-slate-900">{taxaServico.toLocaleString()} CVE</span>
          </div>
          
          <div className="flex justify-between pt-3 border-t border-slate-200 text-sm font-black text-slate-900">
            <span>{t('total_pago') || 'Total pago'}</span>
            <span className="text-blue-600 text-base font-black">
              {totalGeral.toLocaleString()} CVE
            </span>
          </div>
        </div>

        <button 
          onClick={handleContinue}
          disabled={!startDate || !endDate}
          className={`w-full font-black py-3 rounded-xl mb-4 mt-6 transition-all shadow-md text-xs uppercase tracking-wider ${
            startDate && endDate
              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {startDate && endDate 
            ? `${t('reservar_por') || 'Reservar por'} ${dias} ${dias === 1 ? (t('dia') || 'dia') : (t('dias') || 'dias')}`
            : (t('selecione_datas_continuar') || 'Selecione as datas para continuar')}
        </button>

        <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
          <CheckCircle className="text-green-600 mt-0.5" size={14} />
          <div>
            <h5 className="text-[11px] font-bold text-green-800">{t('cancelamento_gratis') || 'Cancelamento gratuito'}</h5>
            <p className="text-[10px] text-green-700 leading-tight">{t('cancelamento_prazo_carro') || 'Até 48 horas antes do levantamento'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabContent = ({ activeTab, carro }) => {
  const { t } = useTranslation();
  
  if (!carro) return null;

  switch(activeTab) {
    case 0:
      return (
        <div className="space-y-6 text-left">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('sobre_veiculo') || 'Sobre este veículo'}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {carro.descricao || carro.descricao_curta || 
                `${t('veiculo_disponivel') || 'Veículo'} ${carro.titulo} ${t('disponivel_aluguer') || 'disponível para aluguer em'} ${carro.localizacao}, ${carro.ilha}. 
                ${t('perfeito_explorar') || 'Perfeito para explorar a ilha com conforto e segurança.'}`}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('caracteristicas_principais') || 'Características principais'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /><span className="text-sm text-slate-600">{t('ar_condicionado') || 'Ar condicionado'}</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /><span className="text-sm text-slate-600">{t('direcao_assistida') || 'Direção assistida'}</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /><span className="text-sm text-slate-600">{t('vidros_eletricos') || 'Vidros elétricos'}</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /><span className="text-sm text-slate-600">{t('sistema_som') || 'Sistema de som'}</span></div>
            </div>
          </div>
        </div>
      );
    case 1:
      return (
        <div className="space-y-6 text-left">
          <h3 className="text-lg font-bold text-slate-900">{t('especificacoes_tecnicas') || 'Especificações técnicas'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-900 mb-3">{t('informacoes_gerais') || 'Informações gerais'}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t('tipo_veiculo') || 'Tipo de veículo'}</span>
                  <span className="font-medium text-slate-900">{carro.tipo || 'SUV'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t('ano_fabrico') || 'Ano de fabrico'}</span>
                  <span className="font-medium text-slate-900">{carro.ano || '2024'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t('transmissao') || 'Transmissão'}</span>
                  <span className="font-medium text-slate-900">{carro.transmissao || t('manual') || 'Manual'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t('combustivel') || 'Combustível'}</span>
                  <span className="font-medium text-slate-900">{carro.combustivel || t('gasolina') || 'Gasolina'}</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-900 mb-3">{t('capacidade_dimensoes') || 'Capacidade e dimensões'}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t('passageiros') || 'Passageiros'}</span>
                  <span className="font-medium text-slate-900">{carro.passageiros || 5} {t('pessoas') || 'pessoas'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t('quilometragem') || 'Quilometragem'}</span>
                  <span className="font-medium text-slate-900">{carro.quilometragem ? Number(carro.quilometragem).toLocaleString() : '0'} km</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t('cor_exterior') || 'Cor exterior'}</span>
                  <span className="font-medium text-slate-900">{carro.cor || t('nao_informada') || 'Não informada'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    
    default:
      return null;
  }
};

export const CarrosDetalhes = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carro, setCarro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Inicializar tracking
  const tracking = useCarroTracking(carro?.id, usuarioLogado?.id);
  
  const registrarCliqueReserva = tracking?.registrarCliqueReserva || (() => {});
  const registrarVisualizacaoMapa = tracking?.registrarVisualizacaoMapa || (() => {});

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
    const fetchCarro = async () => {
      if (!slug) {
        setError(t('slug_nao_fornecido') || 'Slug do veículo não fornecido');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://welovepalop.com/api/get_carro_detalhes.php?slug=${slug}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (data.success && data.data) {
          setCarro(data.data);
          
          if (data.data.imagens && data.data.imagens.length > 0) {
            setImages(data.data.imagens);
          } else if (data.data.imagem_url) {
            setImages([data.data.imagem_url]);
          } else {
            setImages([
              "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&h=800&fit=crop",
              "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=800&fit=crop",
            ]);
          }
        } else {
          throw new Error(data.error || (t('erro_carregar_veiculo') || 'Erro ao carregar dados do veículo'));
        }
      } catch (err) {
        console.error('Erro ao buscar veículo:', err);
        setError(err.message || (t('erro_carregar_veiculo') || 'Erro ao carregar dados do veículo'));
      } finally {
        setLoading(false);
      }
    };

    fetchCarro();
  }, [slug, t]);

  const handleContinueToCheckout = (reservaInfo) => {
    // Registrar clique em reserva
    registrarCliqueReserva();
    
    const userLogado = localStorage.getItem('user');
    
    if (!userLogado) {
      alert(t('login_necessario') || "Por favor, faça login com o Google primeiro.");
      return;
    }

    if (!carro) {
      alert(t('erro_veiculo') || "Erro ao carregar dados do veículo. Tente novamente.");
      return;
    }

    const dadosParaCheckout = {
      id: carro.id,
      titulo: carro.titulo,
      imagem: images[0] || carro.imagem_url,
      localizacao: carro.localizacao,
      ilha: carro.ilha || 'Cabo Verde',
      precoDia: Number(carro.preco_dia),
      checkIn: reservaInfo.startDate.toISOString().split('T')[0],
      checkOut: reservaInfo.endDate.toISOString().split('T')[0],
      dias: reservaInfo.dias,
      subtotal: reservaInfo.subtotal,
      taxaServico: reservaInfo.taxaServico,
      totalGeral: reservaInfo.totalGeral,
      tipo: carro.tipo,
      ano: carro.ano,
      transmissao: carro.transmissao,
      descricao: carro.descricao
    };

    navigate('/checkout-carro', { state: { reservaData: dadosParaCheckout } });
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
          <p className="text-slate-600">{t('carregando_veiculo') || 'Carregando informações do veículo...'}</p>
        </div>
      </div>
    );
  }

  if (error || !carro) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center text-center">
        <div>
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{t('erro_carregar_titulo') || 'Erro ao carregar'}</h2>
          <p className="text-slate-600 mb-4">{error || (t('veiculo_nao_encontrado') || 'Veículo não encontrado')}</p>
          <button 
            onClick={() => navigate('/carros')} 
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-950 transition"
          >
            {t('voltar_veiculos') || 'Voltar para veículos'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white font-sans pb-20">
      <Helmet>
        <title>MorabezaStay | {carro.titulo}</title>
      </Helmet>

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
        <span onClick={() => navigate('/carros')} className="hover:text-blue-900 cursor-pointer">{t('veiculos') || 'Veículos'}</span>
        <ChevronRight size={10} />
        <span className="text-slate-500 font-semibold truncate">{carro.titulo}</span>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery 
              images={images}
              onImageChange={handleImageChange}
              onOpenModal={handleOpenModal}
              titulo={carro.titulo}
            />
            
            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4">{t('especificacoes_veiculo') || 'Especificações do veículo'}</h3>
                <EspecificacoesBar caracteristicas={carro.caracteristicas} />
              </div>
              
              <InclusoesCarroBar 
                inclusoes={carro.inclusoes} 
                localizacao={carro.localizacao} 
              />
            </div>
          </div>

          <div className="lg:self-start">
            <div className="sticky top-24 z-30">
              <SidebarReservaCarro 
                precoDia={Number(carro.preco_dia)} 
                estrelas={carro.estrelas} 
                totalReviews={carro.total_avaliacoes} 
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
              <h1 className="text-2xl md:text-3xl font-bold">{carro.titulo}</h1>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
                {carro.tipo || 'SUV'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin size={14} className="text-orange-500" /> {carro.ilha}, {carro.localizacao}
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-orange-400 text-orange-400" /> 
                <span className="text-slate-900 font-bold">{Number(carro.estrelas).toFixed(1)}</span> 
                <span className="text-slate-400">({carro.total_avaliacoes || 0} {t('avaliacoes') || 'avaliações'})</span>
              </div>
            </div>
          </div>
           <BotaoDenuncia 
            tipo="carro"
            itemId={carro.id}
            itemTitulo={carro.titulo}
            onDenunciaEnviada={() => {
              console.log('Denúncia de carro enviada com sucesso');
              // Opcional: mostrar toast de sucesso
            }}
          />
  
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6 text-left">
        <TabsNavegacaoCarros activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TabContent activeTab={activeTab} carro={carro} />
          </div>
          
          <div className="space-y-4">
            <MapLocationCarro 
              localizacao={carro.localizacao}
              ilha={carro.ilha}
              latitude={carro.latitude}
              longitude={carro.longitude}
              carroId={carro.id}
              onMapClick={registrarVisualizacaoMapa}
            />
          </div>
        </div>
      </div>

      <div className="w-full bg-white border-t border-slate-100 mt-12 pt-12">
        <div className="max-w-7xl mx-auto px-6">
          <AvaliacoesSeccaoCarro 
            carroId={carro.id} 
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
          background-color: #1e3a8a !important;
          color: white !important;
          border-radius: 50% !important;
        }
        .react-datepicker__day--disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default CarrosDetalhes;