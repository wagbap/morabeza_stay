// src/features/alojamento/components/InfoAlojamento.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Users, Bed, Bath, Wifi, Wind, Coffee, MapPin, Star,
  ChevronRight, ChevronLeft, LayoutGrid, Camera,
  CheckCircle, ExternalLink, ChevronDown, X, Loader2,
  Droplet, Car, Eye, Shield, ChevronUp, Shirt,
  CalendarDays, Maximize2, Phone, Mail, AlertTriangle
} from 'lucide-react';
import AvaliacoesSeccaoAlojamento from './AvaliacoesSeccaoAlojamento';
import SeccaoEscolhaQuarto from './SeccaoEscolhaQuarto';
import useAlojamentoTracking from "../hooks/useAlojamentoTracking";
import BotaoDenuncia from '../../../components/BotaoDenuncia';
import CalendarioMorabeza from '../../../components/Calendario/CalendarioMorabeza';
import { useToast } from "../../../Toast";
import ChatSimples from '../../../components/gest/ChatSimples';
import { BannerDisponibilidade } from './BannerDisponibilidade';
import { useDisponibilidadeAlojamento } from '../hooks/useDisponibilidadeAlojamento';
import { alojamentoApi } from '../services/alojamentoApi';
import SidebarReserva from './SidebarReserva';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const API_BASE = 'https://welovepalop.com';

// ============================================================
// HELPER: obter utilizador do JWT
// ============================================================
function obterUsuario() {
  try {
    const token = localStorage.getItem('token')
      || localStorage.getItem('morabeza_token')
      || localStorage.getItem('access_token')
      || localStorage.getItem('jwt');

    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const parsed = JSON.parse(decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      ));
      const user = parsed?.data || parsed?.user || parsed?.usuario || parsed;
      const id = user?.id || user?.userId || user?.user_id || user?.usuario_id
        || parsed?.sub || parsed?.id;
      if (id) {
        return {
          id: Number(id),
          nome: user.nome || user.name || parsed.nome || 'Utilizador',
          email: user.email || parsed.email || '',
          foto: user.foto || user.picture || parsed.foto || null,
          tipo_conta: user.tipo_conta || parsed.tipo_conta || 'hospede'
        };
      }
    }

    const saved = localStorage.getItem('user') || localStorage.getItem('morabeza_user');
    if (saved) {
      const u = JSON.parse(saved);
      if (u.id) {
        return {
          id: Number(u.id),
          nome: u.nome || u.name || 'Utilizador',
          email: u.email || '',
          foto: u.foto || null,
          tipo_conta: u.tipo_conta || 'hospede'
        };
      }
    }
    return null;
  } catch (e) {
    console.error('Erro ao obter utilizador:', e);
    return null;
  }
}

// ============================================================
// HELPER: obter ID canónico do tipo de quarto
// ============================================================
const obterIdCanonicoQuarto = (tipo) => {
  if (!tipo) return null;

  const idTipo =
    tipo.tipo_quarto_id ??
    tipo.tipoQuartoId ??
    tipo.quarto_tipo_id ??
    tipo.tipo_id ??
    null;

  if (idTipo !== null && idTipo !== undefined) {
    return Number(idTipo);
  }

  const idFallback = tipo.id ?? tipo.quarto_id ?? null;

  if (idFallback !== null) {
    const numId = Number(idFallback);
    if (numId >= 9000) {
      console.error(
        `[InfoAlojamento] BUG: 'id'=${numId} parece ser ID físico. ` +
        `O backend deve enviar 'tipo_quarto_id'.`,
        tipo
      );
      return null;
    }
    return numId;
  }

  return null;
};

// ============================================================
// HELPER: string ISO → Date local
// ============================================================
const fromISODateLocal = (str) => {
  if (!str) return null;
  const [y, m, d] = String(str).split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
};

// ============================================================
// HELPER: Date → string ISO (sem bug UTC)
// ============================================================
const toISODateLocal = (d) => {
  if (!d) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

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
const HostInfo = ({
  proprietario,
  onContactClick,
  alojamentoTitulo,
  alojamento,
  usuarioLogado
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);
  const [mostrarChat, setMostrarChat] = useState(false);

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

  const abrirChatInterno = (e) => {
    e.stopPropagation();
    if (!usuarioLogado?.id) {
      showToast(t('login_para_mensagens') || 'Faça login para enviar mensagens', 'info');
      return;
    }
    if (Number(proprietario.id) === Number(usuarioLogado.id)) {
      showToast(t('nao_pode_contactar_se') || 'Não pode contactar-se a si mesmo', 'error');
      return;
    }
    setMostrarChat(true);
    setMostrarOpcoes(false);
    if (onContactClick) onContactClick();
  };

  const handleContactClick = (e) => {
    e.stopPropagation();
    if (proprietario.phone && !proprietario.email) { abrirWhatsApp(e); return; }
    if (proprietario.email && !proprietario.phone) { enviarEmail(e); return; }
    if (proprietario.phone || proprietario.email) { setMostrarOpcoes(!mostrarOpcoes); }
    else { showToast(t('nenhum_contato_disponivel') || "Nenhum contato disponível", 'error'); }
  };

  return (
    <>
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
          <button
            onClick={abrirChatInterno}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-[11px] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="shrink-0">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              <circle cx="8" cy="10" r="1.5"/>
              <circle cx="12" cy="10" r="1.5"/>
              <circle cx="16" cy="10" r="1.5"/>
            </svg>
            {t('enviar_mensagem') || 'Enviar mensagem'}
          </button>

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
            {t('mais_opcoes_contacto') || 'Mais opções de contacto'}
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

      {mostrarChat && (
        <div className="w-full sm:w-[380px] sm:max-w-[380px] h-[80vh] sm:h-[600px] sm:max-h-[85vh] bg-white sm:rounded-2xl overflow-hidden shadow-2xl">
          <ChatSimples
            anuncioId={alojamento.id}
            tipoAnuncio="alojamento"
            anuncioTitulo={alojamento.titulo}
            proprietarioId={alojamento.proprietario?.id}
            onClose={() => setMostrarChat(false)}
          />
        </div>
      )}
    </>
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
  const fim = formatarHora(alojamento.checkin_fim);
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
      : inicio ? `${t('checkin') || 'Check-in'}: ${t('a_partir_de') || 'a partir das'} ${inicio}`
        : fim ? `${t('checkin') || 'Check-in'}: ${t('ate') || 'até às'} ${fim}`
          : null;

  const textoCheckOut = limite
    ? `${t('checkout') || 'Check-out'}: ${t('ate') || 'até às'} ${limite}`
    : null;

  return (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
      <CalendarDays size={18} className="text-slate-600 mt-0.5 shrink-0" />
      <div className="space-y-1">
        {textoCheckIn && <p className="text-sm font-semibold text-slate-900">{textoCheckIn}</p>}
        {textoCheckOut && <p className="text-sm font-semibold text-slate-900">{textoCheckOut}</p>}
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
// ALERTA: CONFIGURAÇÃO INCOMPLETA (por_quarto sem quartos)
// ============================================================
const AlertaConfiguracaoIncompleta = ({ alojamentoId }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-left flex items-start gap-3">
      <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-bold text-amber-900">
          {t('alojamento_config_incompleta_titulo') || 'Alojamento indisponível para reserva'}
        </p>
        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
          {t('alojamento_config_incompleta_msg') ||
            'Este alojamento está configurado para venda por quarto, mas ainda não tem tipos de quarto definidos. O anfitrião precisa de adicionar os quartos (com preços e capacidades) antes que seja possível fazer reservas.'}
        </p>
        <p className="text-[10px] text-amber-700 mt-2 font-mono">
          ID: {alojamentoId} • {t('contacte_suporte') || 'Contacte o suporte se o problema persistir.'}
        </p>
      </div>
    </div>
  );
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export const InfoAlojamento = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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

  // 🔑 Estado para bloqueios normalizados da BD
  const [bloqueiosQuartoOcupacao, setBloqueiosQuartoOcupacao] = useState([]);
  const [datasReservadas, setDatasReservadas] = useState([]);

  const vendaPorQuarto = Array.isArray(tiposQuarto) && tiposQuarto.length > 0;
  const precoBase = Number(alojamento?.preco_noite || 0);
  const capacidadeBase = Number(alojamento?.capacidade || 2);

  // ⚠️ ALERTA: alojamento marcado como por_quarto MAS sem tipos de quarto definidos
  const configuracaoIncompleta = useMemo(() => {
    if (!alojamento) return false;
    const modeloVenda = alojamento.modelo_venda;
    const temTiposQuarto = Array.isArray(tiposQuarto) && tiposQuarto.length > 0;
    return modeloVenda === 'por_quarto' && !temTiposQuarto;
  }, [alojamento, tiposQuarto]);

  // ============================================================
  // LER PARÂMETROS DA PESQUISA DA URL
  // ============================================================
  const datasIniciais = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const entrada = params.get('entrada') || params.get('checkIn') || params.get('checkin');
    const saida = params.get('saida') || params.get('checkOut') || params.get('checkout');

    if (!entrada && !saida) return null;

    return {
      checkIn: entrada || null,
      checkOut: saida || null,
      adultos: Number(params.get('adultos')) || 2,
      criancas: Number(params.get('criancas')) || 0,
      quartos: Number(params.get('quartos')) || 1,
      pet: params.get('pet') === '1',
    };
  }, [location.search]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    setUsuarioLogado(obterUsuario());
  }, []);

  // ============================================================
  // FETCH ALOJAMENTO
  // ============================================================
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

  // ============================================================
  // 🔑 FETCH BLOQUEIOS DA BD (quarto_ocupacao)
  //    Vai buscar os bloqueios do mês atual + próximos 2 meses
  //    para alimentar o calendário no sidebar.
  // ============================================================
  useEffect(() => {
    if (!alojamento?.id) return;

    let cancelado = false;

    const fetchBloqueios = async () => {
      try {
        const hoje = new Date();
        const meses = [];
        for (let i = 0; i < 3; i++) {
          const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
          meses.push({ ano: d.getFullYear(), mes: d.getMonth() + 1 });
        }

        const todasLinhas = [];
        const todasReservadas = new Set();

        for (const { ano, mes } of meses) {
          const url = `${API_BASE}/api/alojamento_bloqueios.php?action=listar` +
            `&alojamento_id=${alojamento.id}&ano=${ano}&mes=${mes}`;
          try {
            const res = await fetch(url);
            const txt = await res.text();
            const i = txt.indexOf('{');
            const f = txt.lastIndexOf('}');
            if (i === -1 || f === -1) continue;
            const data = JSON.parse(txt.substring(i, f + 1));
            if (!data?.success) continue;

            (data.bloqueios || []).forEach(b => {
              todasLinhas.push({
                quarto_id: b.quarto_id,
                data: String(b.data).substring(0, 10),
              });
            });
            (data.dias_reservados || []).forEach(d => {
              todasReservadas.add(String(d).substring(0, 10));
            });
          } catch (e) {
            console.warn('[InfoAlojamento] Falha ao carregar bloqueios de', ano, mes, e);
          }
        }

        if (cancelado) return;
        setBloqueiosQuartoOcupacao(todasLinhas);
        setDatasReservadas(Array.from(todasReservadas));
      } catch (e) {
        if (cancelado) return;
        console.error('[InfoAlojamento] Erro ao carregar bloqueios:', e);
      }
    };

    fetchBloqueios();
    return () => { cancelado = true; };
  }, [alojamento?.id]);

  // ============================================================
  // FETCH STOCKS — usa datas iniciais como fallback
  // ============================================================
  useEffect(() => {
    if (!vendaPorQuarto) return;
    if (!tiposQuarto.length) return;
    if (!alojamento?.id) return;

    const checkin = carrinhoDatas.checkIn || datasIniciais?.checkIn;
    const checkout = carrinhoDatas.checkOut || datasIniciais?.checkOut;

    if (!checkin || !checkout) return;

    let cancelado = false;
    const fetchStocks = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/verificar_stock_multi.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alojamento_id: alojamento.id,
            quartos: tiposQuarto.map(tq => ({
              tipo_quarto_id: tq.tipo_quarto_id || tq.id,
              quantidade: 1,
            })),
            checkin,
            checkout,
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
  }, [vendaPorQuarto, tiposQuarto, carrinhoDatas.checkIn, carrinhoDatas.checkOut, alojamento?.id, datasIniciais]);

  const tracking = useAlojamentoTracking(alojamento?.id || null, usuarioLogado?.id || null);
  const registrarCliqueReserva = tracking?.registrarCliqueReserva || (() => {});
  const registrarCliqueContato = tracking?.registrarCliqueContato || (() => {});
  const registrarVisualizacaoMapa = tracking?.registrarVisualizacaoMapa || (() => {});

  const carrinhoQuartos = useMemo(() => {
    if (vendaPorQuarto) {
      return Object.entries(quantidades)
        .filter(([_, qtd]) => qtd > 0)
        .map(([tipoId, qtd]) => {
          const tipo = tiposQuarto.find(
            tq => String(obterIdCanonicoQuarto(tq)) === String(tipoId)
          );
          if (!tipo) return null;

          const idCanonico = obterIdCanonicoQuarto(tipo);
          if (idCanonico === null) return null;

          return {
            tipoQuartoId: idCanonico,
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

  // ============================================================
  // DATAS BLOQUEADAS — recalcula conforme carrinho
  // ============================================================
  const datasBloqueadasEfetivas = useMemo(() => {
    if (!alojamento) return [];

    if (!vendaPorQuarto) {
      return alojamento.datas_bloqueadas || [];
    }

    const gerais = alojamento.datas_bloqueadas || [];
    const porQuarto = alojamento.datas_bloqueadas_por_quarto || {};

    if (carrinhoQuartos.length === 1 && carrinhoQuartos[0].tipoQuartoId) {
      const tipoId = String(carrinhoQuartos[0].tipoQuartoId);
      const especificas = porQuarto[tipoId] || [];
      return [...new Set([...gerais, ...especificas])];
    }

    return gerais;
  }, [alojamento, vendaPorQuarto, carrinhoQuartos]);

  // ============================================================
  // HOOK DE DISPONIBILIDADE
  // ============================================================
  const {
    validando: validandoDisponibilidade,
    erroDisponibilidade,
    continuarParaCheckout,
    limparErro: limparErroDisponibilidade,
  } = useDisponibilidadeAlojamento({
    alojamento,
    carrinhoQuartos,
    capacidadeTotal,
    images,
    vendaPorQuarto,
    onError: ({ tipo, mensagem }) => {
      showToast(
        mensagem,
        tipo === 'erro_rede' || tipo === 'erro_validacao' ? 'info' : 'error'
      );
    },
  });

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
    if (tipoId === null || tipoId === undefined) return;

    setQuantidades(prev => {
      const novas = { ...prev };
      Object.keys(novas).forEach((chave) => {
        const tipo = tiposQuarto.find(
          tq => String(obterIdCanonicoQuarto(tq)) === String(chave)
        );
        if (
          String(chave) === String(tipoId) ||
          (tipo && String(obterIdCanonicoQuarto(tipo)) === String(tipoId))
        ) {
          novas[chave] = 0;
        }
      });
      return novas;
    });

    setQuartoSelecionado(prev =>
      String(prev) === String(tipoId) ? null : prev
    );
  }, [tiposQuarto]);

  const handleContinueToCheckout = useCallback(async (reservaInfo) => {
    if (configuracaoIncompleta) {
      showToast(
        t('alojamento_config_incompleta_msg') ||
          'Este alojamento ainda não tem quartos configurados. Não é possível reservar.',
        'error'
      );
      return;
    }

    registrarCliqueReserva();
    if (!alojamento) return;

    const rawStart = reservaInfo?.startDate 
                  ?? reservaInfo?.checkIn 
                  ?? reservaInfo?.checkin 
                  ?? null;
    const rawEnd   = reservaInfo?.endDate 
                  ?? reservaInfo?.checkOut 
                  ?? reservaInfo?.checkout 
                  ?? null;

    const converterParaISO = (val) => {
      if (!val) return null;
      if (val instanceof Date) {
        if (isNaN(val.getTime())) return null;
        return toISODateLocal(val);
      }
      if (typeof val === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
        const d = new Date(val);
        if (!isNaN(d.getTime())) return toISODateLocal(d);
      }
      return null;
    };

    const checkInStr = converterParaISO(rawStart);
    const checkOutStr = converterParaISO(rawEnd);

    console.log('[InfoAlojamento] Datas convertidas:', {
      rawStart,
      rawEnd,
      checkInStr,
      checkOutStr,
      reservaInfoCompleto: reservaInfo,
    });

    if (!checkInStr || !checkOutStr) {
      const msg = !checkInStr && !checkOutStr
        ? 'Seleciona as datas de check-in e check-out.'
        : !checkInStr
          ? 'Data de check-in inválida.'
          : 'Data de check-out inválida.';
      showToast(msg, 'error');
      console.error('[InfoAlojamento] ❌ Falha ao converter datas:', { rawStart, rawEnd });
      return;
    }

    await continuarParaCheckout({
      checkin: checkInStr,
      checkout: checkOutStr,
      numHospedes: reservaInfo?.numHospedes ?? reservaInfo?.hospedes ?? 1,
      noites: reservaInfo?.noites ?? 0,
      subtotal: reservaInfo?.subtotal ?? 0,
    });
  }, [alojamento, registrarCliqueReserva, continuarParaCheckout, configuracaoIncompleta, t, showToast]);

  const handleOpenLoginModal = useCallback(() => {
    showToast(
      t('login_para_avaliar') || 'Por favor, faça login para avaliar.',
      'info'
    );
  }, [t, showToast]);

  // ============================================================
  // Verificações de estado (evitam crash)
  // ============================================================
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-900 mx-auto mb-4" />
          <p className="text-slate-600">
            {t('carregando_alojamento') || 'Carregando informações do alojamento...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !alojamento) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {t('erro_carregar_titulo') || 'Erro ao carregar'}
          </h2>
          <p className="text-slate-600 mb-4">
            {error || (t('alojamento_nao_encontrado') || 'Alojamento não encontrado')}
          </p>
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

  if (!alojamento?.id) {
    return null;
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

      {erroDisponibilidade && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <BannerDisponibilidade
            erro={erroDisponibilidade}
            onClose={limparErroDisponibilidade}
            onVoltar={() => navigate(-1)}
            showVoltar={false}
          />
        </div>
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

            {configuracaoIncompleta && (
              <AlertaConfiguracaoIncompleta alojamentoId={alojamento.id} />
            )}

            {vendaPorQuarto ? (
              <SeccaoEscolhaQuarto
                quartoSelecionado={quartoSelecionado}
                onSelecaoQuarto={handleSelecaoQuarto}
                tiposQuarto={tiposQuarto}
                quantidadesProp={quantidades}
                onQuantidadeChange={handleQuantidadeChange}
                stocksPorTipo={stocksPorTipo}
                alojamentoId={alojamento.id}
                datasBloqueadas={alojamento.datas_bloqueadas || []}
                datasBloqueadasPorQuarto={alojamento.datas_bloqueadas_por_quarto || {}}
              />
            ) : !configuracaoIncompleta ? (
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
            ) : null}
          </div>

          <div className="lg:self-start">
            <div className="sticky top-24 z-30">
              {configuracaoIncompleta ? (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={18} className="text-amber-600" />
                    <p className="text-sm font-bold text-amber-900">
                      {t('reserva_indisponivel') || 'Reserva indisponível'}
                    </p>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {t('alojamento_sem_quartos') ||
                      'Este alojamento ainda não tem tipos de quarto configurados. O anfitrião precisa de adicionar os quartos antes que seja possível fazer reservas.'}
                  </p>
                </div>
              ) : (
                <SidebarReserva
                  carrinhoQuartos={carrinhoQuartos}
                  estrelas={alojamento.estrelas}
                  datasBloqueadas={datasBloqueadasEfetivas}
                  datasBloqueadasPorQuarto={alojamento.datas_bloqueadas_por_quarto || {}}
                  bloqueiosQuartoOcupacao={bloqueiosQuartoOcupacao}
                  datasReservadas={datasReservadas}
                  totalQuartos={tiposQuarto.length}
                  onContinueToCheckout={handleContinueToCheckout}
                  onRemoveQuarto={handleRemoverQuarto}
                  onDatasChange={setCarrinhoDatas}
                  vendaPorQuarto={vendaPorQuarto}
                  capacidadeBase={capacidadeBase}
                  validandoProp={validandoDisponibilidade}
                  datasIniciais={datasIniciais}
                  alojamentoId={alojamento.id}
                />
              )}
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
              alojamento={alojamento}
              usuarioLogado={usuarioLogado}
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