import { equipamentoJetSki } from '../eExperienciaJetSki';
import api from '../../../api/api';
import { sessoesDisponiveis, opcoesDuracao, sessoesDaDuracao, vendaPorEquipamento } from '../sessoesCliente';
import CartaoReservaExperiencia from './CartaoReservaExperiencia';
import { precoDaSessao, totalExperiencia } from '../precoSessao';
import { IMAGEM_INDISPONIVEL, substituirImagemIndisponivel } from '../../../utils/imagemIndisponivel';
// src/features/experiencias/components/ExperienciaDetalhes.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CalendarioMorabeza from '../../../components/Calendario/CalendarioMorabeza';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Users, Star, MapPin, Clock, Calendar, ChevronRight, ChevronLeft,
  Camera, CheckCircle, ExternalLink, X,
  Loader2, ShieldCheck, Sun, Sunset, Maximize2, Send, Phone, Mail,
  Minus, Plus, Tag, Info, Baby, User,
  AlertCircle
} from 'lucide-react';
import BotaoDenuncia from '../../../components/BotaoDenuncia';
import ChatSimples from '../../../components/gest/ChatSimples';
import { useToast } from '../../../Toast';
import AvaliacoesSeccao from './AvaliacoesSeccaoExperiencia';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const API_URL = 'https://welovepalop.com';

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      cache: 'no-store',
      headers: { 'Accept': 'application/json', ...(options.headers || {}) }
    });
    const text = await res.text();
    if (!res.ok) {
      try { return JSON.parse(text); }
      catch { throw new Error(`HTTP ${res.status}`); }
    }
    if (text.trim().startsWith('<')) throw new Error('Resposta inválida');
    return JSON.parse(text);
  } catch (err) {
    console.warn('⚠️ fetchJSON:', url, err.message);
    throw err;
  }
}

function obterUsuarioJWT() {
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
      const id = user?.id || user?.userId || user?.user_id || user?.usuario_id || parsed?.sub;
      if (id) return {
        id: Number(id),
        nome: user.nome || user.name || 'Utilizador',
        foto: user.foto || user.picture || null,
        email: user.email || parsed.email || ''
      };
    }
    const savedUser = localStorage.getItem('user') || localStorage.getItem('morabeza_user');
    if (savedUser) return JSON.parse(savedUser);
    return null;
  } catch { return null; }
}

// 🔥 Normalizar data para início do dia local (evita bug UTC)
const toDateOnly = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// 🔥 Date → 'YYYY-MM-DD' SEM UTC
const dateToLocalStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// 🔥 Normalizar qualquer valor para 'YYYY-MM-DD'
const normalizarDataStr = (valor) => {
  if (!valor) return null;
  if (typeof valor === 'string') return valor.substring(0, 10);
  if (valor?.data) return String(valor.data).substring(0, 10);
  return null;
};

const ImageSliderModal = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  const { t } = useTranslation();
  const handleModalClick = (e) => e.stopPropagation();

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 z-10">
        <X size={24} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 z-10">
        <ChevronLeft size={24} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 z-10">
        <ChevronRight size={24} />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
        {Math.min(currentIndex + 1, Math.max(1, images.length))} / {Math.max(1, images.length)}
      </div>
      <img onError={substituirImagemIndisponivel} src={images[currentIndex] || IMAGEM_INDISPONIVEL}
        alt={`Imagem ${currentIndex + 1}`}
        className="max-w-[90vw] max-h-[90vh] object-contain cursor-pointer"
        onClick={handleModalClick}
      />
    </div>
  );
};

const TabsNavegacaoExperiencia = ({ activeTab = 0, onTabChange }) => {
  const { t } = useTranslation();
  const tabs = [
    { id: 0, label: t('visao_geral') || 'Visão Geral' },
    { id: 1, label: t('inclusoes') || 'Inclusões' },
    { id: 2, label: t('requisitos') || 'Requisitos' },
    { id: 3, label: t('localizacao') || 'Localização' },
  ];
  return (
    <div className="border-b border-slate-200 mb-6 text-left">
      <div className="flex gap-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => onTabChange?.(tab.id)}
            className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'text-blue-900 border-b-2 border-blue-900' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const GuiaInfo = ({ guia, onContactClick, experienciaTitulo, onContactar }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);

  if (!guia) return null;

  const abrirWhatsApp = (e) => {
    e.stopPropagation();
    if (!guia.phone) { showToast(t('telefone_nao_disponivel') || "Número indisponível", 'error'); return; }
    const numeroLimpo = guia.phone.replace(/\D/g, '');
    let numeroWhatsApp = numeroLimpo;
    if (!numeroWhatsApp.startsWith('238') && numeroWhatsApp.length <= 9) numeroWhatsApp = '238' + numeroWhatsApp;
    const mensagem = encodeURIComponent(`Olá! Interessei-me pela experiência "${experienciaTitulo || ''}".`);
    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, '_blank');
    setMostrarOpcoes(false);
  };

  const fazerLigacao = (e) => {
    e.stopPropagation();
    if (!guia.phone) return;
    window.open(`tel:+${guia.phone.replace(/\D/g, '')}`, '_blank');
    setMostrarOpcoes(false);
  };

  const enviarEmail = (e) => {
    e.stopPropagation();
    if (!guia.email) return;
    const assunto = encodeURIComponent(`Interesse: ${experienciaTitulo || ''}`);
    const corpo = encodeURIComponent(`Olá! Interessei-me pela experiência "${experienciaTitulo || ''}".`);
    window.open(`mailto:${guia.email}?subject=${assunto}&body=${corpo}`, '_blank');
    setMostrarOpcoes(false);
  };

  const handleContactClick = (e) => {
    e.stopPropagation();
    if (guia.phone && !guia.email) { abrirWhatsApp(e); return; }
    if (guia.email && !guia.phone) { enviarEmail(e); return; }
    if (guia.phone || guia.email) setMostrarOpcoes(!mostrarOpcoes);
    else showToast(t('nenhum_contato_disponivel') || "Sem contacto disponível", 'error');
    if (onContactClick) onContactClick();
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm text-left">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <img src={guia.foto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"}
            alt={guia.nome} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
          {guia.guia_certificado && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <CheckCircle className="text-green-500 fill-green-500" size={14} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-slate-900 truncate">
            {t('anfitriao') || 'Anfitrião'}: {guia.nome}
          </h4>
          <p className="text-[10px] text-slate-500 font-medium">
            {guia.guia_certificado ? (t('guia_certificado') || 'Guia Certificado') + ' • ' : ''}
            {guia.idiomas || 'Português/Inglês'}
          </p>
          {guia.phone && (
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Phone size={10} className="text-green-500" /> <span>{guia.phone}</span>
            </p>
          )}
          {guia.email && (
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Mail size={10} className="text-blue-500" /> <span className="truncate">{guia.email}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 relative">
        {onContactar && (
          <button onClick={(e) => { e.stopPropagation(); onContactar(); }}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm">
            <Send size={14} />
            {t('enviar_mensagem') || 'Enviar mensagem'}
          </button>
        )}

        {guia.phone && (
          <button onClick={abrirWhatsApp}
            className="w-full py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-2 shadow-sm">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t('enviar_whatsapp') || 'WhatsApp'}
          </button>
        )}

        <button onClick={handleContactClick}
          className="w-full py-2.5 border border-blue-900 text-blue-900 text-[11px] font-bold rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2">
          <Phone size={14} />
          {t('mais_opcoes_contacto') || 'Mais opções de contacto'}
        </button>

        {mostrarOpcoes && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
            {guia.phone && (
              <button onClick={fazerLigacao} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100">
                <Phone size={14} className="text-green-600" />
                <span>{t('ligar') || 'Ligar'}</span>
                <span className="text-xs text-slate-400 ml-auto">{guia.phone}</span>
              </button>
            )}
            {guia.email && (
              <button onClick={enviarEmail} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2">
                <Mail size={14} className="text-blue-500" />
                <span>{t('email') || 'Email'}</span>
                <span className="text-xs text-slate-400 ml-auto">{guia.email}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MapLocationExperiencia = ({ localizacao, ilha, pontosProximos, onMapClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const getCoordenadasPorIlha = (nomeIlha) => {
    const coordenadas = {
      'Santo Antão': { lat: 17.0667, lng: -25.1667 }, 'São Vicente': { lat: 16.8333, lng: -24.9833 },
      'Santa Luzia': { lat: 16.75, lng: -24.75 }, 'São Nicolau': { lat: 16.6167, lng: -24.2667 },
      'Sal': { lat: 16.7167, lng: -22.9167 }, 'Boa Vista': { lat: 16.1, lng: -22.8 },
      'Maio': { lat: 15.1333, lng: -23.2167 }, 'Santiago': { lat: 15.0667, lng: -23.5833 },
      'Fogo': { lat: 14.9167, lng: -24.3333 }, 'Brava': { lat: 14.8667, lng: -24.7 }
    };
    return coordenadas[nomeIlha] || { lat: 15.0667, lng: -23.5833 };
  };

  const coordenadas = getCoordenadasPorIlha(ilha);
  const temCoordenadas = coordenadas && coordenadas.lat && coordenadas.lng;
  const textoLocalizacao = `${ilha || 'Cabo Verde'}, ${localizacao || ''}`;
  const cidadeNome = ilha || 'Cabo Verde';

  const abrirPaginaMapa = () => { if (onMapClick) onMapClick(); navigate('/mapa-experiencias'); };
  const abrirMapaInterativo = () => { if (onMapClick) onMapClick(); navigate('/mapa-experiencias'); };

  useEffect(() => {
    if (!temCoordenadas || !mapContainer.current || map.current) return;
    if (!MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [coordenadas.lng, coordenadas.lat],
      zoom: 10,
      interactive: false,
      attributionControl: false
    });
    map.current.on('load', () => {
      setMapLoaded(true);
      new mapboxgl.Marker({ color: '#1e3a8a', scale: 1.2 })
        .setLngLat([coordenadas.lng, coordenadas.lat])
        .addTo(map.current);
    });
    return () => { if (map.current) { map.current.remove(); map.current = null; } };
  }, [temCoordenadas, coordenadas]);

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm text-left">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{t('localizacao') || 'Localização'}</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{textoLocalizacao}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={abrirMapaInterativo} className="flex items-center gap-1 text-blue-900 text-[10px] font-bold hover:underline">
            {t('mapa_ilhas') || 'Mapa Ilhas'} <ExternalLink size={10} />
          </button>
          <button onClick={abrirPaginaMapa} className="flex items-center gap-1 text-blue-900 text-[10px] font-bold hover:underline">
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
            <button onClick={abrirPaginaMapa} className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-10">
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
          <button onClick={abrirPaginaMapa} className="absolute bottom-2 right-2 bg-white hover:bg-gray-50 rounded-lg p-1.5 shadow-md">
            <Maximize2 size={14} className="text-slate-600" />
          </button>
        </div>
      ) : (
        <div onClick={abrirPaginaMapa} className="relative w-full h-[140px] rounded-xl overflow-hidden bg-slate-100 border border-slate-100 cursor-pointer group">
          <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=400&h=200&fit=crop" alt="Mapa" className="w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
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
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>{ponto}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const SidebarReservaExperiencia = ({
  precoBase, rating, dataPasseio, setDataPasseio, periodo, setPeriodo, horario, setHorario,
  periodosUI, loading, onReservar, experiencia, totalAvaliacoes,
  sessoes, bloqueios, configuracoes
}) => {
  const { t } = useTranslation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [quantidadeJetSkis, setQuantidadeJetSkis] = useState(1);
  const [sessaoIdSelecionada, setSessaoIdSelecionada] = useState(null);
  const [participantes, setParticipantes] = useState(1);
  const [duracaoEscolhida, setDuracaoEscolhida] = useState(null);
  const [mesCalendario, setMesCalendario] = useState(() => (dataPasseio || dateToLocalStr(new Date())).slice(0,7));

  // 🔥 REQ 129: Dias que têm sessões criadas
  const [diasDisponiveis, setDiasDisponiveis] = useState([]);
  const [loadingDias, setLoadingDias] = useState(false);

  const isGrupoPrivado = experiencia?.modelo_reserva === 'grupo_privado';
  const precoGrupo = Number(experiencia?.preco_grupo) || 0;
  const minPessoasGrupo = Number(experiencia?.min_pessoas_grupo) || 1;
  const maxPessoasGrupo = Number(experiencia?.max_pessoas_grupo) || 10;


  const configBloqueios = configuracoes;
  const datasBloqueadas = bloqueios || [];

  const isEpocaAlta = () => {
    if (!configBloqueios?.preco_epoca_alta) return false;
    if (!configBloqueios?.epoca_alta_inicio || !configBloqueios?.epoca_alta_fim) return false;
    if (!dataPasseio) return false;
    return dataPasseio >= configBloqueios.epoca_alta_inicio && dataPasseio <= configBloqueios.epoca_alta_fim;
  };

  const precoEpocaAlta = isEpocaAlta() ? Number(configBloqueios.preco_epoca_alta) : null;
  const precoBaseAtual = precoEpocaAlta ?? precoBase;
  const disponiveis = sessoesDisponiveis(sessoes || []);
  const duracoes = opcoesDuracao(disponiveis);
  const duracaoSelecionada = duracoes.includes(duracaoEscolhida) ? duracaoEscolhida : duracoes[0] ?? null;
  const sessoesDuracao = sessoesDaDuracao(disponiveis, duracaoSelecionada);
  const periodosDisponiveis = periodosUI.filter(p => sessoesDuracao.some(s => s.periodo === p.label)).map(p => {
    const starts=sessoesDuracao.filter(s=>s.periodo===p.label).map(s=>s.hora_inicio).sort();
    return {...p,timeRange:starts[0]===starts.at(-1) ? starts[0] : `${starts[0]} - ${starts.at(-1)}`};
  });
  const periodoEfetivo = periodosDisponiveis.some(p => p.label === periodo) ? periodo : periodosDisponiveis[0]?.label;
  const sessoesDoPeriodo = sessoesDuracao.filter(s => s.periodo === periodoEfetivo);
  const sessaoSelecionada = sessoesDoPeriodo.find(s => sessaoIdSelecionada !== null && String(s.id) === String(sessaoIdSelecionada));
  const referenciaSessao = sessaoSelecionada || sessoesDoPeriodo[0];
  const vendaPorUnidade = vendaPorEquipamento(experiencia, referenciaSessao);
  const pessoasPorUnidade = Number(referenciaSessao?.pessoas_por_unidade || experiencia?.pessoas_por_equipamento) || 2;
  const minutosSessao = duracaoSelecionada;
  const horasSessao = minutosSessao === null ? 0 : Math.floor(minutosSessao / 60);
  const restoMinutos = minutosSessao === null ? 0 : minutosSessao % 60;
  const duracao = minutosSessao === null ? '' : horasSessao === 0
    ? t('experiencia_sessao_minutos', '{{count}} min', { count: minutosSessao })
    : restoMinutos === 0 ? t('experiencia_sessao_horas', '{{count}} h', { count: horasSessao })
    : t('experiencia_sessao_horas_minutos', '{{horas}} h {{minutos}} min', { horas: horasSessao, minutos: restoMinutos });
  const precoUnitarioAtual = precoDaSessao(referenciaSessao, precoBaseAtual);
  const precoGrupoAtual = precoDaSessao(referenciaSessao, precoEpocaAlta ?? precoGrupo);

  const precoTotal = totalExperiencia(isGrupoPrivado ? precoGrupoAtual : precoUnitarioAtual, participantes, isGrupoPrivado ? 'grupo_privado' : vendaPorUnidade ? 'por_equipamento' : 'por_pessoa', quantidadeJetSkis);

  useEffect(() => {
    if (isGrupoPrivado) {
      if (participantes < minPessoasGrupo) setParticipantes(minPessoasGrupo);
      if (participantes > maxPessoasGrupo) setParticipantes(maxPessoasGrupo);
    }
  }, [isGrupoPrivado, minPessoasGrupo, maxPessoasGrupo]);

  // 🔥 REQ 129: Buscar dias que têm sessões criadas
  useEffect(() => {
    const controller = new AbortController();
    const fetchDias = async () => {
      if (!experiencia?.id) return;
      setLoadingDias(true);
      try {
        const mes = mesCalendario;

        const { data } = await api.get('/get_dias_com_sessoes.php', { params: { experiencia_id: experiencia.id, mes }, signal: controller.signal });
        if(controller.signal.aborted)return;

        if (data.success) {
          // 🔥 Normalizar tudo para YYYY-MM-DD (sem hora, sem UTC)
          const dias = (data.dias_disponiveis || []).map(d => normalizarDataStr(d)).filter(Boolean);
          setDiasDisponiveis(dias);
        } else {
          setDiasDisponiveis([]);
        }
      } catch (err) {
        console.warn('⚠️ Dias não carregados:', err.message);
        if(!controller.signal.aborted)setDiasDisponiveis([]);
      } finally {
        if(!controller.signal.aborted)setLoadingDias(false);
      }
    };
    fetchDias();
    return () => controller.abort();
  }, [experiencia?.id, mesCalendario]);

  const dataBloqueada = (bloqueios || []).some(b => {
    if (!b.data_inicio || !b.data_fim || !dataPasseio) return false;
    const ini = String(b.data_inicio).substring(0, 10);
    const fim = String(b.data_fim).substring(0, 10);
    return dataPasseio >= ini && dataPasseio <= fim;
  });

  const isDataBloqueadaCalendario = (date) => {
    const dateStr = dateToLocalStr(date);
    return (datasBloqueadas || []).some(b => {
      if (!b.data_inicio || !b.data_fim) return false;
      const ini = String(b.data_inicio).substring(0, 10);
      const fim = String(b.data_fim).substring(0, 10);
      return dateStr >= ini && dateStr <= fim;
    });
  };

  const temSessao = (date) => {
    const dateStr = dateToLocalStr(date);
    // 🔥 Se não há dias carregados, permite tudo (fallback)
    if (!diasDisponiveis || diasDisponiveis.length === 0) return true;
    return diasDisponiveis.includes(dateStr);
  };

  // 🔥 minDate / maxDate normalizados para início do dia
  const minDate = toDateOnly(new Date());
  if (configBloqueios?.antecedencia_minima_horas) {
    minDate.setHours(minDate.getHours() + Number(configBloqueios.antecedencia_minima_horas));
    minDate.setHours(0, 0, 0, 0);
  }

  const maxDate = toDateOnly(new Date());
  const maxDias = Number(configBloqueios?.antecedencia_maxima_dias) || 180;
  maxDate.setDate(maxDate.getDate() + maxDias);

  const minDateStr = dateToLocalStr(minDate);
  const maxDateStr = dateToLocalStr(maxDate);



  useEffect(() => {
    setSessaoIdSelecionada(null);
    setHorario('');
    setQuantidadeJetSkis(1);setParticipantes(1);
  }, [dataPasseio, duracaoSelecionada, periodoEfetivo, experiencia?.id]);
  useEffect(() => { if(dataPasseio)setMesCalendario(dataPasseio.slice(0,7)); }, [dataPasseio]);

  const maxParticipantesPermitidos = quantidadeJetSkis * pessoasPorUnidade;

  useEffect(() => {
    const available = Number(sessaoSelecionada?.vagas_disponiveis) || 0;
    if (vendaPorUnidade && available && quantidadeJetSkis > available) setQuantidadeJetSkis(available);
    const limit = vendaPorUnidade ? maxParticipantesPermitidos : available;
    if (limit > 0 && participantes > limit) setParticipantes(limit);
  }, [quantidadeJetSkis, maxParticipantesPermitidos, participantes, isGrupoPrivado, vendaPorUnidade, sessaoSelecionada?.vagas_disponiveis]);

  const formatarData = (date) => {
    if (!date) return '';
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };


  const vagasDisponiveisSessao = sessaoSelecionada?.vagas_disponiveis || 0;

  const semDiasDisponiveis = !loading && !disponiveis.length;

  const isJetski = vendaPorUnidade && equipamentoJetSki(experiencia, referenciaSessao);
  const maxPessoas = vendaPorUnidade ? quantidadeJetSkis * pessoasPorUnidade : Number(vagasDisponiveisSessao);
  return <div className="sticky top-24">
    <CartaoReservaExperiencia
      preco={isGrupoPrivado ? precoGrupoAtual : precoUnitarioAtual} total={precoTotal}
      rating={rating} avaliacoes={totalAvaliacoes || 0}
      especial={isEpocaAlta()}
      grupo={isGrupoPrivado} jetski={isJetski} vendaPorUnidade={vendaPorUnidade}
      data={formatarData(dataPasseio)} abrirCalendario={() => setShowCalendar(v => !v)}
      calendario={showCalendar && <div className="absolute right-0 top-full z-[100] mt-2 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl"><CalendarioMorabeza
        selected={dataPasseio ? new Date(dataPasseio + 'T00:00:00') : null}
        onChange={date => { if (!date) return; setSessaoIdSelecionada(null); setHorario(''); setDataPasseio(dateToLocalStr(date)); setShowCalendar(false); }}
        inline minDate={minDate} maxDate={maxDate} onMonthChange={date => setMesCalendario(dateToLocalStr(date).slice(0,7))}
        filterDate={date => { const value = dateToLocalStr(date); return value >= minDateStr && value <= maxDateStr && !isDataBloqueadaCalendario(date) && temSessao(date); }}
        calendarClassName="morabeza-calendar-inline" /></div>}
      periodos={isJetski || periodosDisponiveis.length > 1 ? periodosDisponiveis : []} periodo={periodoEfetivo} selecionarPeriodo={value => { setSessaoIdSelecionada(null); setHorario(''); setPeriodo(value); }}
      precosDuracoes={Object.fromEntries(duracoes.map(n => [n, Math.min(...sessoesDaDuracao(disponiveis,n).map(s => precoDaSessao(s,isGrupoPrivado ? precoGrupoAtual : precoBaseAtual)))]))} duracoes={duracoes} duracaoSelecionada={duracaoSelecionada} selecionarDuracao={value => {setSessaoIdSelecionada(null);setHorario('');setDuracaoEscolhida(value);}} minimoRealizacao={Number(sessaoSelecionada?.minimo_participantes ?? experiencia?.min_pessoas ?? 1)} duracao={duracao} sessoes={sessoesDoPeriodo} horario={horario} sessaoIdSelecionada={sessaoIdSelecionada}
      selecionarHorario={(value, sessaoId) => { setSessaoIdSelecionada(sessaoId); setHorario(value); }}
      nomeEquipamento={referenciaSessao?.equipamento_nome || experiencia?.equipamento_nome || (isJetski ? 'Jet ski' : undefined)} pessoasPorUnidade={pessoasPorUnidade} vagas={Number(vagasDisponiveisSessao)} unidades={quantidadeJetSkis} setUnidades={setQuantidadeJetSkis}
      participantes={participantes} setParticipantes={value => { setParticipantes(value); if (isJetski && !vendaPorUnidade) setQuantidadeJetSkis(Math.ceil(value / 2)); }} minParticipantes={isGrupoPrivado ? minPessoasGrupo : 1} maxParticipantes={maxPessoas}
      loading={loading || loadingDias} bloqueado={dataBloqueada || semDiasDisponiveis}
      reservar={() => { if(!sessaoSelecionada)return;setPeriodo(periodoEfetivo);onReservar({ periodo:periodoEfetivo, duracao, pessoasPorUnidade, quantidadeJetSkis, participantes, maxPessoas, unidadeVenda: vendaPorUnidade ? 'unidade' : 'participante',
        precoUnitarioAtual: isGrupoPrivado ? precoGrupoAtual : precoUnitarioAtual, precoTotal,
        precoNormal: isGrupoPrivado ? (precoEpocaAlta ?? precoGrupo) : precoBaseAtual,
        precoEspecialSessao: sessaoSelecionada?.preco_especial ?? null, sessaoId: sessaoSelecionada?.id,
        vagasDisponiveis: Number(vagasDisponiveisSessao), modelo: isGrupoPrivado ? 'grupo_privado' : vendaPorUnidade ? 'por_equipamento' : 'por_pessoa' });}}
    />
  </div>;

};

const ImageGallery = ({ images, onImageChange, onOpenModal, titulo }) => {
  const { t } = useTranslation();
  const placeholder = IMAGEM_INDISPONIVEL;
  const img1 = images[0] || placeholder;
  const img2 = images[1] || placeholder;
  const img3 = images[2] || placeholder;
  const img4 = images[3] || placeholder;

  return (
    <div className="flex flex-col md:flex-row gap-2.5 w-full text-left">
      <div className="w-full md:w-[62%] h-[240px] md:h-[390px] relative rounded-2xl overflow-hidden cursor-pointer shadow-sm" onClick={() => { onImageChange(0); onOpenModal(); }}>
        <img onError={substituirImagemIndisponivel} src={img1} className="w-full h-full object-cover transition-transform hover:scale-[1.01]" alt={titulo} />
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-xs backdrop-blur-sm pointer-events-none">
          1 / {images.length || 1}
        </div>
      </div>
      <div className="w-full md:w-[38%] flex flex-col gap-2.5 h-[240px] md:h-[390px]">
        <div className="h-1/2 rounded-2xl overflow-hidden cursor-pointer shadow-sm" onClick={() => { onImageChange(1); onOpenModal(); }}>
          <img onError={substituirImagemIndisponivel} src={img2} className="w-full h-full object-cover transition-transform hover:scale-[1.01]" alt={titulo} />
        </div>
        <div className="h-1/2 flex gap-2.5">
          <div className="flex-1 rounded-2xl overflow-hidden cursor-pointer shadow-sm" onClick={() => { onImageChange(2); onOpenModal(); }}>
            <img onError={substituirImagemIndisponivel} src={img3} className="w-full h-full object-cover transition-transform hover:scale-[1.01]" alt={titulo} />
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden relative cursor-pointer shadow-sm" onClick={() => { onImageChange(3); onOpenModal(); }}>
            <img onError={substituirImagemIndisponivel} src={img4} className="w-full h-full object-cover transition-transform hover:scale-[1.01]" alt={titulo} />
            <div onClick={(e) => { e.stopPropagation(); onImageChange(0); onOpenModal(); }}
              className="absolute bottom-2.5 right-2.5 bg-white hover:bg-slate-50 text-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold border border-slate-200 shadow-md z-20">
              <Camera size={12} /> {t('ver_todas_fotos') || 'Ver todas as fotos'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabContent = ({ activeTab, experiencia }) => {
  const { t } = useTranslation();
  if (!experiencia) return null;

  switch(activeTab) {
    case 0:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('sobre_experiencia') || 'Sobre esta experiência'}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {experiencia.descricao_longa || experiencia.descricao_completa || experiencia.descricao_curta ||
                `Viva uma experiência única em ${experiencia.ilha}, ${experiencia.localizacao}.`}
            </p>
          </div>
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('duracao_horarios') || 'Duração e horários'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-blue-500" />
                <span className="text-sm text-slate-600">Duração: {experiencia.duracao}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-blue-500" />
                <span className="text-sm text-slate-600">Máximo: {experiencia.max_pessoas} pessoas</span>
              </div>
            </div>
          </div>
          {experiencia.aceita_criancas && (
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">{t('precos_por_idade', 'Preços por Idade')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <User size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Adulto</p>
                    <p className="text-sm font-bold text-blue-900">{experiencia.preco_adulto || experiencia.preco} CVE</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Users size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">
                      {experiencia.label_crianca || `Criança (${experiencia.idade_min_crianca}-${experiencia.idade_max_crianca})`}
                    </p>
                    <p className="text-sm font-bold text-green-900">
                      {experiencia.preco_crianca === 0 ? 'Grátis' : `${experiencia.preco_crianca_formatado || experiencia.preco_crianca + ' CVE'}`}
                    </p>
                  </div>
                </div>
                {experiencia.aceita_bebes && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Baby size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                        {experiencia.label_bebe || `Bebé (0-${experiencia.idade_max_bebe})`}
                      </p>
                      <p className="text-sm font-bold text-purple-900">
                        {experiencia.preco_bebe === 0 || experiencia.preco_bebe === null ? 'Grátis' : `${experiencia.preco_bebe_formatado || experiencia.preco_bebe + ' CVE'}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    case 1:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">O que está incluído</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiencia.inclusoes?.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <CheckCircle size={16} className={item.incluido ? "text-green-500" : "text-slate-300"} />
                <span className={`text-sm ${item.incluido ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{item.item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 2:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Requisitos importantes</h3>
          <div className="space-y-4">
            {experiencia.requisitos?.map((req, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <ShieldCheck size={18} className="text-blue-500 mt-0.5" />
                <p className="text-sm text-slate-600">{req.requisito}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case 3:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Localização e ponto de encontro</h3>
          <div className="relative w-full h-[300px] rounded-xl overflow-hidden bg-slate-100">
            <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=800&h=400&fit=crop" alt="Mapa" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin size={32} className="text-blue-900 fill-blue-900" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-orange-500 mt-0.5" />
              <span className="text-sm text-slate-600">{experiencia.ilha}, {experiencia.localizacao}, Cabo Verde</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-slate-900 mb-2">Ponto de encontro:</p>
              <p className="text-sm text-slate-600">{experiencia.ponto_encontro || 'A ser informado após confirmação'}</p>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

const ExperienciaDetalhes = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [experiencia, setExperiencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [anfitriao, setAnfitriao] = useState(null);

  const [sessoes, setSessoes] = useState([]);
  const [bloqueios, setBloqueios] = useState([]);
  const [configuracoes, setConfiguracoes] = useState(null);

  const [dataPasseio, setDataPasseio] = useState(dateToLocalStr(new Date()));
  const [periodo, setPeriodo] = useState("Manhã");
  const [horario, setHorario] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [mostrarChat, setMostrarChat] = useState(false);

  useEffect(() => {
    const user = obterUsuarioJWT();
    if (user) setUsuarioLogado(user);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchDados = async () => {
      try {
        setLoading(true);
        setSessoes([]);
        setError(null);

        const usuarioId = usuarioLogado?.id ? `&usuario_id=${usuarioLogado.id}` : '';
        const result = await fetchJSON(
          `${API_URL}/api/experiencia_pagina_completa.php?slug=${slug}&data=${dataPasseio}${usuarioId}`, { signal: controller.signal }
        );
        if(controller.signal.aborted)return;

        if (!result.success || !result.experiencia) {
          throw new Error(result.error || 'Experiência não encontrada');
        }

        let dados = result.experiencia;
        // Older detail endpoints may omit the canonical equipment model.
        try {
          const { data: cadastro } = await api.get('/experiencia/buscar.php', {params: {id: dados.id}, signal: controller.signal});
          if (controller.signal.aborted) return;
          if (cadastro.success && Number(cadastro.data?.id) === Number(dados.id)) {
            const metadata = {};
            for (const key of ['modelo_reserva','equipamento_nome','quantidade_equipamentos','pessoas_por_equipamento']) {
              if (cadastro.data[key] !== undefined && cadastro.data[key] !== null) metadata[key] = cadastro.data[key];
            }
            dados = {...dados, ...metadata};
          }
        } catch { if (controller.signal.aborted) return; }


        setExperiencia(dados);

        if (dados.imagens && dados.imagens.length > 0) {
          setImages(dados.imagens.map(img => img.caminho_url));
        } else if (dados.imagem_principal) {
          setImages([dados.imagem_principal]);
        } else {
          setImages([IMAGEM_INDISPONIVEL]);
        }

        if (dados.anfitriao) setAnfitriao(dados.anfitriao);

        setSessoes((result.sessoes || []).map(sessao => ({
          ...sessao,
          hora_inicio: String(sessao.hora_inicio || '').slice(0, 5),
          hora_fim: String(sessao.hora_fim || '').slice(0, 5),
          vagas_disponiveis: Number(sessao.vagas_disponiveis ?? 0),
        })));
        setBloqueios(result.bloqueios || []);
        setConfiguracoes(result.configuracoes || null);

      } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
        if(!controller.signal.aborted)setError(error.message);
      } finally {
        if(!controller.signal.aborted)setLoading(false);
      }
    };
    fetchDados();
    return () => controller.abort();
  }, [slug, dataPasseio, usuarioLogado?.id]);

  const registrarCliqueReserva = () => {};
  const registrarCliqueGuia = () => {};
  const registrarVisualizacaoMapa = () => {};
  const registrarCliqueContato = () => {};

  const periodosUI = [
    { label: 'Manhã', range: [8, 12], timeRange: '08:00 - 12:00', temHorarios: true },
    { label: 'Meio dia', range: [12, 16], timeRange: '12:00 - 16:00', temHorarios: true },
    { label: 'Tarde', range: [16, 20], timeRange: '16:00 - 20:00', temHorarios: true }
  ].map(p => {
    const slots = sessoes.filter(s => s.periodo === p.label);
    if (!slots.length) return p;
    const starts = slots.map(s => s.hora_inicio).filter(Boolean).sort();
    const ends = slots.map(s => s.hora_fim).filter(Boolean).sort();
    return starts.length && ends.length ? { ...p, timeRange: `${starts[0]} - ${ends[ends.length - 1]}` } : p;
  });

  const handleReservarAgora = (dadosReserva) => {
    registrarCliqueReserva();
    const dataFormatada = new Date(dataPasseio + 'T00:00:00').toLocaleDateString('pt-PT', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    navigate('/checkout-experiancia', {
      state: {
        reservaData: {
          id: experiencia.id,
          titulo: experiencia.titulo,
          imagem: experiencia.imagem_principal || images[0],
          localizacao: experiencia.ilha,
          entrada: dataFormatada,
          dataISO: dataPasseio,
          duracao: dadosReserva.duracao,
          quantidadeJetSkis: dadosReserva.quantidadeJetSkis,
          pessoasPorUnidade: dadosReserva.pessoasPorUnidade,
          participantes: dadosReserva.participantes,
          maxPessoas: dadosReserva.maxPessoas || experiencia.max_pessoas,
          unidadeVenda: dadosReserva.unidadeVenda,
          precoPorPessoa: dadosReserva.precoUnitarioAtual,
          precoNormal: dadosReserva.precoNormal,
          precoTotal: dadosReserva.precoTotal,
          sessaoId: dadosReserva.sessaoId,
          precoEspecialSessao: dadosReserva.precoEspecialSessao,
          vagasDisponiveis: dadosReserva.vagasDisponiveis,
          modelo: dadosReserva.modelo,
          capacidadePorUnidade: dadosReserva.pessoasPorUnidade,
          preco_adulto: experiencia.preco_adulto || experiencia.preco,
          preco_crianca: experiencia.preco_crianca,
          preco_bebe: experiencia.preco_bebe,
          aceita_criancas: experiencia.aceita_criancas,
          aceita_bebes: experiencia.aceita_bebes,
          idade_min_crianca: experiencia.idade_min_crianca,
          idade_max_crianca: experiencia.idade_max_crianca,
          idade_max_bebe: experiencia.idade_max_bebe,
          label_crianca: experiencia.label_crianca,
          label_bebe: experiencia.label_bebe,
          modelo_reserva: experiencia.modelo_reserva,
          preco_grupo: experiencia.preco_grupo,
          max_pessoas_grupo: experiencia.max_pessoas_grupo,
          min_pessoas_grupo: experiencia.min_pessoas_grupo
        },
        dataSelecionada: dataFormatada,
        horarioSelecionado: horario,
        periodoSelecionado: dadosReserva.periodo || periodo
      }
    });
  };

  const handleContactar = () => {
    if (!usuarioLogado?.id) {
      showToast(t('login_para_mensagens') || 'Faça login para enviar mensagens', 'info');
      return;
    }
    const donoId = anfitriao?.id || experiencia?.usuario_id;
    if (Number(donoId) === Number(usuarioLogado.id)) {
      showToast(t('nao_pode_contactar_se') || 'Não pode contactar-se a si mesmo', 'error');
      return;
    }
    registrarCliqueContato();
    setMostrarChat(true);
  };

  const handlePrevImage = () => setCurrentImageIndex((prev) => ((prev - 1 + Math.max(1, images.length)) % Math.max(1, images.length)));
  const handleNextImage = () => setCurrentImageIndex((prev) => ((prev + 1) % Math.max(1, images.length)));
  const handleImageChange = (index) => setCurrentImageIndex(index);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-900 mx-auto mb-4" />
          <p className="text-slate-600">{t('carregando_experiencia') || 'Carregando detalhes...'}</p>
        </div>
      </div>
    );
  }

  if (error || !experiencia) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Erro ao carregar</h2>
          <p className="text-slate-600 mb-4">{error || 'Experiência não encontrada'}</p>
          <button onClick={() => navigate('/experiencias')} className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-950">
            Voltar para experiências
          </button>
        </div>
      </div>
    );
  }

  const guiaFinal = anfitriao || experiencia.guia || (experiencia.usuario_id ? {
    id: experiencia.usuario_id,
    nome: 'Anfitrião',
    foto: null, email: null, phone: null,
    guia_certificado: true, idiomas: 'Português/Inglês'
  } : null);

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
        <span onClick={() => navigate('/')} className="hover:text-blue-900 cursor-pointer">Início</span>
        <ChevronRight size={10} />
        <span onClick={() => navigate('/experiencias')} className="hover:text-blue-900 cursor-pointer">Experiências</span>
        <ChevronRight size={10} />
        <span className="text-slate-500 font-semibold truncate">{experiencia.titulo}</span>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ImageGallery
              images={images}
              onImageChange={handleImageChange}
              onOpenModal={handleOpenModal}
              titulo={experiencia.titulo}
            />

            <div className="mt-6 pt-6 border-t border-slate-100 text-left">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Informações principais</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-8">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-slate-400"><Clock size={18} /></span>
                  <div>
                    <p className="text-[11px] font-bold">{experiencia.duracao}</p>
                    <p className="text-[9px] text-slate-400">Duração</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-slate-400"><Users size={18} /></span>
                  <div>
                    <p className="text-[11px] font-bold">Máx. {experiencia.max_pessoas}</p>
                    <p className="text-[9px] text-slate-400">Participantes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-slate-400"><MapPin size={18} /></span>
                  <div>
                    <p className="text-[11px] font-bold">{experiencia.ilha || experiencia.localizacao}</p>
                    <p className="text-[9px] text-slate-400">Localização</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-slate-400"><Star size={18} /></span>
                  <div>
                    <p className="text-[11px] font-bold">{experiencia.rating_formatado || '5.0'}</p>
                    <p className="text-[9px] text-slate-400">Avaliação</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <SidebarReservaExperiencia
              precoBase={Number(experiencia?.preco) || 0}
              rating={experiencia?.rating_formatado || '5.0'}
              totalAvaliacoes={experiencia?.total_avaliacoes || 0}
              dataPasseio={dataPasseio}
              setDataPasseio={setDataPasseio}
              periodo={periodo}
              setPeriodo={setPeriodo}
              horario={horario}
              setHorario={setHorario}
              periodosUI={periodosUI}
              loading={loading}
              onReservar={handleReservarAgora}
              experiencia={experiencia}
              sessoes={sessoes}
              bloqueios={bloqueios}
              configuracoes={configuracoes}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 text-left">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">{experiencia.titulo}</h1>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
                {experiencia.categoria_nome || 'Experiência'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin size={14} className="text-orange-500" /> {experiencia.ilha || experiencia.localizacao}
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-orange-400 text-orange-400" />
                <span className="text-slate-900 font-bold">{experiencia.rating_formatado || '5.0'}</span>
                <span className="text-slate-400">({experiencia.total_avaliacoes || 0} avaliações)</span>
              </div>
            </div>
          </div>
          <BotaoDenuncia
            tipo="experiencia"
            itemId={experiencia.id}
            itemTitulo={experiencia.titulo}
            onDenunciaEnviada={() => console.log('Denúncia enviada')}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6 text-left">
        <TabsNavegacaoExperiencia activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TabContent activeTab={activeTab} experiencia={experiencia} />
          </div>

          <div className="space-y-4">
            <GuiaInfo
              guia={guiaFinal}
              onContactClick={registrarCliqueGuia}
              experienciaTitulo={experiencia.titulo}
              onContactar={handleContactar}
            />
            <MapLocationExperiencia
              localizacao={experiencia.localizacao}
              ilha={experiencia.ilha}
              pontosProximos={experiencia.pontos_proximos}
              onMapClick={registrarVisualizacaoMapa}
            />
          </div>
        </div>
      </div>

      <div className="w-full bg-white border-t border-slate-100 mt-12 pt-12 text-left">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Avaliações dos participantes
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({experiencia.total_avaliacoes || 0} avaliações)
              </span>
            </h2>
            <div className="flex items-center gap-2">
              <Star size={20} className="fill-orange-400 text-orange-400" />
              <span className="text-2xl font-bold text-slate-900">{experiencia.rating_formatado || '5.0'}</span>
            </div>
          </div>

          <AvaliacoesSeccao
            experienciaId={experiencia.id}
            usuarioLogado={usuarioLogado}
            onOpenLoginModal={() => showToast(t('login_para_avaliar') || 'Faça login para avaliar.', 'info')}
          />
        </div>
      </div>

      {mostrarChat && (
        <ChatSimples
          anuncioId={experiencia.id}
          tipoAnuncio="experiencia"
          anuncioTitulo={experiencia.titulo}
          proprietarioId={anfitriao?.id || experiencia.usuario_id}
          onClose={() => setMostrarChat(false)}
        />
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Dia selecionado */
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #1e3a8a !important;
          color: white !important;
          border-radius: 50% !important;
        }

        /* Dia bloqueado pelo anfitrião (vermelho) */
        .react-datepicker__day--disabled.bloqueado-dia,
        .bloqueado-dia {
          background-color: #fee2e2 !important;
          color: #b91c1c !important;
          text-decoration: line-through;
          cursor: not-allowed !important;
        }

        /* Dia sem sessão (cinza) */
        .react-datepicker__day--disabled.sem-sessao-dia,
        .sem-sessao-dia {
          background-color: #f1f5f9 !important;
          color: #cbd5e1 !important;
          cursor: not-allowed !important;
          opacity: 0.5;
        }
        .sem-sessao-dia:hover {
          background-color: #f1f5f9 !important;
        }

        /* 🔥 Dia com sessão (verde) */
        .dia-com-sessao {
          background-color: #dcfce7 !important;
          color: #166534 !important;
          font-weight: 700;
          border-radius: 50% !important;
        }
        .dia-com-sessao:hover {
          background-color: #bbf7d0 !important;
        }
        .dia-com-sessao.react-datepicker__day--selected {
          background-color: #1e3a8a !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default ExperienciaDetalhes;
