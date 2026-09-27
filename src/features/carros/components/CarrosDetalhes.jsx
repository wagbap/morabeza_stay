// src/features/carros/CarrosDetalhes.jsx
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
  ShieldCheck, Infinity, ShieldAlert, Key, Maximize2, Navigation,
  AlertTriangle, Minus, Plus, Send, Phone, Mail
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import AvaliacoesSeccaoCarro from './AvaliacoesSeccaoCarro';
import useCarroTracking from "../hooks/useCarroTracking";
import BotaoDenuncia from '../../../components/BotaoDenuncia';
import { useToast } from '../../../Toast';
import ChatSimples from '../../../components/gest/ChatSimples';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const API_URL = 'https://welovepalop.com';

// ============================================================
// HELPERS DE IMAGEM
// ============================================================
const normalizarUrlImagem = (item) => {
  if (!item) return null;
  let raw = typeof item === 'string' ? item : (item.caminho_url || item.url || item.path || null);
  if (!raw) return null;
  if (raw.startsWith('http') || raw.startsWith('data:')) return raw;
  if (!raw.startsWith('/')) raw = '/' + raw;
  return `${API_URL}${raw}`;
};

const extrairImagens = (data) => {
  if (Array.isArray(data?.imagens) && data.imagens.length > 0) {
    return data.imagens.slice().sort((a, b) => {
      if (a.principal && !b.principal) return -1;
      if (!a.principal && b.principal) return 1;
      return (a.ordem || 0) - (b.ordem || 0);
    }).map(normalizarUrlImagem).filter(Boolean);
  }
  if (data?.imagem_url) return [normalizarUrlImagem(data.imagem_url)].filter(Boolean);
  if (data?.imagens_extra) {
    try {
      const extra = typeof data.imagens_extra === 'string' ? JSON.parse(data.imagens_extra) : data.imagens_extra;
      if (Array.isArray(extra)) return extra.map(normalizarUrlImagem).filter(Boolean);
    } catch {}
  }
  return [];
};

// ============================================================
// MODAL DE IMAGENS
// ============================================================
const ImageSliderModal = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"><X size={24} /></button>
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"><ChevronLeft size={24} /></button>
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"><ChevronRight size={24} /></button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">{currentIndex + 1} / {images.length}</div>
      <img
        src={images[currentIndex]}
        alt={`Imagem ${currentIndex + 1}`}
        className="max-w-[90vw] max-h-[90vh] object-contain cursor-pointer"
        onClick={(e) => e.stopPropagation()}
        onError={(e) => e.target.src = 'https://via.placeholder.com/1200x800?text=Imagem+indispon%C3%ADvel'}
      />
    </div>
  );
};

// ============================================================
// TABS
// ============================================================
const TabsNavegacaoCarros = ({ activeTab = 0, onTabChange }) => {
  const { t } = useTranslation();
  const tabs = [
    { id: 0, label: t('visao_geral') || 'Visão Geral' },
    { id: 1, label: t('especificacoes') || 'Especificações' },
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
// ESPECIFICAÇÕES
// ============================================================
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
          <div className="text-slate-400 shrink-0"><item.icon size={18} strokeWidth={1.5} /></div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-900 leading-tight">{item.label}</span>
            <span className="text-[9px] text-slate-400 font-medium">{item.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// INCLUSÕES
// ============================================================
const InclusoesCarroBar = ({ inclusoes, localizacao }) => {
  const { t } = useTranslation();
  const dadosExibicao = inclusoes && inclusoes.length > 0 ? inclusoes : [
    { titulo: t('cancelamento') || 'Cancelamento', valor: t('gratuito') || 'Gratuito', icone: 'CheckCircle', cor_classe: 'text-green-600' },
    { titulo: t('seguro_basico') || 'Seguro básico', valor: t('incluido') || 'Incluído', icone: 'ShieldCheck', cor_classe: 'text-green-600' },
    { titulo: t('quilometragem') || 'Quilometragem', valor: t('ilimitada') || 'Ilimitada', icone: 'Infinity', cor_classe: 'text-green-600' },
    { titulo: t('levantamento') || 'Levantamento', valor: localizacao || t('aeroporto_praia') || 'Espargos - Centro', icone: 'Key', cor_classe: 'text-slate-500' }
  ];
  const iconesMapeados = { CheckCircle, ShieldCheck, Infinity, ShieldAlert, Key, Fuel };
  return (
    <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      {dadosExibicao.map((item, i) => {
        const IconComponent = iconesMapeados[item.icone] || CheckCircle;
        const corClasse = item.cor_classe || 'text-slate-500';
        return (
          <div key={i} className="flex items-center gap-3 border-slate-100 text-left">
            <div className="text-slate-400 shrink-0"><IconComponent size={20} strokeWidth={1.5} /></div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-medium text-slate-500 leading-tight">{item.titulo}</span>
              <span className={`text-xs font-bold ${corClasse} mt-0.5`}>{item.valor}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// GALERIA ADAPTATIVA
// ============================================================
const ImageGallery = ({ images, onImageChange, onOpenModal, titulo }) => {
  const { t } = useTranslation();
  const placeholder = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=400&fit=crop";

  const total = Array.isArray(images) ? images.length : 0;
  const lista = total > 0 ? images : [placeholder];
  const imagensEscondidas = Math.max(0, total - 4);

  const abrir = (idx) => {
    onImageChange(Math.min(idx, lista.length - 1));
    onOpenModal();
  };

  if (lista.length === 1) {
    return (
      <div className="w-full h-[240px] md:h-[390px] relative rounded-2xl overflow-hidden cursor-pointer shadow-sm" onClick={() => abrir(0)}>
        <img src={lista[0]} className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" alt={`${titulo} - Principal`} onError={(e) => e.target.src = placeholder} />
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-xs text-xs backdrop-blur-sm pointer-events-none font-sans">1 / 1</div>
      </div>
    );
  }

  if (lista.length === 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 w-full">
        {[0, 1].map((i) => (
          <div key={i} className="h-[240px] md:h-[390px] relative rounded-2xl overflow-hidden cursor-pointer shadow-sm" onClick={() => abrir(i)}>
            <img src={lista[i]} className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" alt={`${titulo} - ${i + 1}`} onError={(e) => e.target.src = placeholder} />
            {i === 0 && <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-xs text-xs backdrop-blur-sm pointer-events-none font-sans">1 / 2</div>}
          </div>
        ))}
      </div>
    );
  }

  if (lista.length === 3) {
    return (
      <div className="flex flex-col md:flex-row gap-2.5 w-full text-left">
        <div className="w-full md:w-[62%] h-[240px] md:h-[390px] relative rounded-2xl overflow-hidden cursor-pointer shadow-sm" onClick={() => abrir(0)}>
          <img src={lista[0]} className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" alt={`${titulo} - Principal`} onError={(e) => e.target.src = placeholder} />
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-xs text-xs backdrop-blur-sm pointer-events-none font-sans">1 / 3</div>
        </div>
        <div className="w-full md:w-[38%] flex flex-col gap-2.5 h-[240px] md:h-[390px]">
          {[1, 2].map((i) => (
            <div key={i} className="h-1/2 rounded-2xl overflow-hidden relative cursor-pointer shadow-sm" onClick={() => abrir(i)}>
              <img src={lista[i]} className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" alt={`${titulo} - ${i + 1}`} onError={(e) => e.target.src = placeholder} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-2.5 w-full text-left">
      <div className="w-full md:w-[62%] h-[240px] md:h-[390px] relative rounded-2xl overflow-hidden cursor-pointer shadow-sm" onClick={() => abrir(0)}>
        <img src={lista[0]} className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" alt={`${titulo} - Principal`} onError={(e) => e.target.src = placeholder} />
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-xs text-xs backdrop-blur-sm pointer-events-none font-sans">1 / {lista.length}</div>
      </div>

      <div className="w-full md:w-[38%] flex flex-col gap-2.5 h-[240px] md:h-[390px]">
        <div className="h-1/2 rounded-2xl overflow-hidden relative cursor-pointer shadow-sm" onClick={() => abrir(1)}>
          <img src={lista[1]} className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" alt={`${titulo} - 2`} onError={(e) => e.target.src = placeholder} />
        </div>
        <div className="h-1/2 flex gap-2.5">
          <div className="flex-1 rounded-2xl overflow-hidden relative cursor-pointer shadow-sm" onClick={() => abrir(2)}>
            <img src={lista[2]} className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" alt={`${titulo} - 3`} onError={(e) => e.target.src = placeholder} />
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden relative cursor-pointer shadow-sm" onClick={() => abrir(3)}>
            <img src={lista[3]} className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" alt={`${titulo} - 4`} onError={(e) => e.target.src = placeholder} />
            {imagensEscondidas > 0 && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center pointer-events-none">
                <span className="text-white font-bold text-sm">+{imagensEscondidas} {t('fotos') || 'fotos'}</span>
              </div>
            )}
            <div
              onClick={(e) => { e.stopPropagation(); abrir(0); }}
              className="absolute bottom-2.5 right-2.5 bg-white hover:bg-slate-50 text-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold border border-slate-200 shadow-md cursor-pointer z-20 transition-all active:scale-95 whitespace-nowrap"
            >
              <Camera size={12} className="text-slate-700" />
              {t('ver_todas_fotos') || 'Ver todas as fotos'} ({lista.length})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// DONO INFO — igual ao HostInfo do alojamento
// ============================================================
const DonoCarroInfo = ({ proprietario, onContactClick, carroTitulo, onContactar, usuarioLogado }) => {
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
      `Olá! Estou interessado no carro "${carroTitulo || ''}". Gostaria de mais informações.`
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
    const assunto = encodeURIComponent(`Interesse no carro: ${carroTitulo || ''}`);
    const corpo = encodeURIComponent(`Olá! Estou interessado no carro "${carroTitulo || ''}". Gostaria de mais informações.`);
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
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm text-left">
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
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">
            {t('proprietario') || 'Proprietário'}: {proprietario.nome}
          </h4>
          <p className="text-[10px] text-slate-500 font-medium">
            {proprietario.tempo_resposta || (t('responde_rapido') || 'Responde rápido')}
          </p>
          {proprietario.phone && (
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Phone size={10} className="text-green-500" /> <span>{proprietario.phone}</span>
            </p>
          )}
          {proprietario.email && (
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Mail size={10} className="text-blue-500" /> <span className="truncate">{proprietario.email}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 relative">
        {/* ⭐ BOTÃO ENVIAR MENSAGEM ⭐ */}
        {onContactar && (
          <button
            onClick={(e) => { e.stopPropagation(); onContactar(); }}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-[11px] font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Send size={14} />
            {t('enviar_mensagem') || 'Enviar mensagem'}
          </button>
        )}

        {proprietario.phone && (
          <button
            onClick={abrirWhatsApp}
            className="w-full py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold text-[11px] rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t('enviar_whatsapp') || 'WhatsApp'}
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
              <button onClick={fazerLigacao} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100">
                <Phone size={14} className="text-green-600" />
                <span>{t('ligar') || 'Ligar'}</span>
                <span className="text-xs text-slate-400 ml-auto">{proprietario.phone}</span>
              </button>
            )}
            {proprietario.email && (
              <button onClick={enviarEmail} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2">
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
// SIDEBAR DE RESERVA DO CARRO
// ============================================================
const SidebarReservaCarro = ({
  precoDia,
  estrelas,
  totalReviews,
  quantidadeDisponivel = 5,
  valorCaucao = 20000,
  onContinueToCheckout,
  validando = false,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [quantidade, setQuantidade] = useState(1);
  const [aviso, setAviso] = useState('');
  const avisoTimer = useRef(null);

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (start && end) setTimeout(() => setShowCalendar(false), 300);
  };

  const incrementar = () => {
    if (quantidade >= quantidadeDisponivel) {
      const msg = t('limite_carros_atingido', 'Já atingiu o máximo de {{n}} carros disponíveis.', { n: quantidadeDisponivel });
      showToast(msg, 'error');
      setAviso(msg);
      clearTimeout(avisoTimer.current);
      avisoTimer.current = setTimeout(() => setAviso(''), 3000);
      return;
    }
    setQuantidade(q => Math.min(q + 1, quantidadeDisponivel));
  };

  const decrementar = () => setQuantidade(q => Math.max(q - 1, 1));

  const dias = startDate && endDate ? Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))) : 1;
  const totalGeral = precoDia * quantidade * dias;

  const handleContinue = async () => {
    if (!startDate || !endDate) {
      showToast(t('selecione_datas_carro') || "Por favor, selecione as datas de Levantamento e Devolução", 'error');
      setShowCalendar(true);
      return;
    }
    if (onContinueToCheckout) {
      await onContinueToCheckout({ startDate, endDate, dias, quantidade, totalGeral, caucao: valorCaucao });
    }
  };

  const formatarData = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="lg:block text-left">
      <div className="border border-slate-200 rounded-3xl p-6 bg-white shadow-xl shadow-slate-200/50">

        {/* Cabeçalho de Preço */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
            {precoDia.toLocaleString('pt-PT')} CVE <span className="text-sm font-medium text-slate-400">/ dia</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <Star size={16} className="fill-orange-500 text-orange-500" />
            {Number(estrelas || 0).toFixed(1)} <span className="text-slate-400 font-normal">({totalReviews || 0})</span>
          </div>
        </div>

        {/* Seleção de Datas */}
        <div className="border border-slate-300 rounded-2xl mb-4 overflow-visible relative">
          <div className="flex cursor-pointer transition-all rounded-2xl p-3" onClick={() => setShowCalendar(!showCalendar)}>
            <div className="flex-1 border-r border-slate-200 pr-3">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{t('levantamento') || 'Levantamento'}</label>
              <div className="text-sm font-bold text-slate-900">{startDate ? formatarData(startDate) : '__/__/____'}</div>
            </div>
            <div className="flex-1 pl-4">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{t('devolucao') || 'Devolução'}</label>
              <div className="text-sm font-bold text-slate-900">{endDate ? formatarData(endDate) : '__/__/____'}</div>
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
                monthsShown={1}
                inline
                minDate={new Date()}
              />
            </div>
          )}
        </div>

        {/* Info Período */}
        {startDate && endDate && (
          <div className="mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-blue-600" />
                <span className="text-sm font-bold text-blue-700">{t('periodo') || 'Período'}:</span>
              </div>
              <span className="text-sm font-bold text-blue-700">{dias} {dias === 1 ? 'dia' : 'dias'}</span>
            </div>
            <p className="text-xs font-medium text-blue-500 mt-1 pl-6">{formatarData(startDate)} → {formatarData(endDate)}</p>
          </div>
        )}

        {/* Disponibilidade */}
        <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 mb-6">
          <CheckCircle className="text-emerald-500" size={16} />
          <span className="text-xs font-bold text-emerald-700">Disponibilidade: {quantidadeDisponivel} carros disponíveis</span>
        </div>

        {/* Quantidade e Cálculos */}
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Quantidade de carros</span>
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
              <button onClick={decrementar} className="text-blue-600 p-1 disabled:opacity-30 cursor-pointer" disabled={quantidade <= 1}><Minus size={16} /></button>
              <span className="font-bold text-blue-700 min-w-[50px] text-center">{quantidade} {quantidade === 1 ? 'carro' : 'carros'}</span>
              <button onClick={incrementar} className="text-blue-600 p-1 cursor-pointer"><Plus size={16} /></button>
            </div>
          </div>

          {startDate && endDate && (
            <div className="flex justify-between text-slate-600 font-medium pt-2">
              <span>{precoDia.toLocaleString('pt-PT')} CVE × {quantidade} {quantidade === 1 ? 'carro' : 'carros'} × {dias} {dias === 1 ? 'dia' : 'dias'}</span>
              <span className="font-bold text-slate-900">{totalGeral.toLocaleString('pt-PT')} CVE</span>
            </div>
          )}

          <div className="flex justify-between pt-4 pb-2 border-t border-slate-100 text-lg font-black text-slate-900">
            <span>Total pago agora</span>
            <span className="text-blue-700">{startDate && endDate ? totalGeral.toLocaleString('pt-PT') : '0'} CVE</span>
          </div>
        </div>

        {/* Aviso de limite atingido */}
        {aviso && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{aviso}</span>
          </div>
        )}

        {/* Caução Box */}
        <div className="mt-4 p-4 bg-orange-50/70 border border-orange-200 rounded-2xl">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-bold text-slate-900 mb-1">Caução: {valorCaucao.toLocaleString('pt-PT')} CVE</h5>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">Paga diretamente ao proprietário no levantamento. Não está incluída no total da reserva.</p>
            </div>
          </div>
        </div>

        {/* Botão Reservar */}
        <button
          onClick={handleContinue}
          disabled={!startDate || !endDate || validando}
          className={`w-full font-bold py-4 rounded-2xl mt-6 transition-all shadow-md text-sm uppercase tracking-widest flex items-center justify-center gap-2 ${
            startDate && endDate && !validando
              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {validando ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              {t('verificando_disponibilidade', 'A verificar disponibilidade...')}
            </>
          ) : startDate && endDate ? (
            `Reservar ${quantidade} ${quantidade === 1 ? 'carro' : 'carros'}`
          ) : (
            'Selecione as datas'
          )}
        </button>

        {/* Footer info */}
        <div className="flex items-start gap-2 mt-5 justify-center text-center">
          <CheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={16} />
          <div className="text-left">
            <h5 className="text-xs font-bold text-emerald-700">Cancelamento gratuito disponível</h5>
            <p className="text-[10px] text-emerald-600/80 font-medium mt-0.5">Até 48 horas antes do levantamento</p>
          </div>
        </div>

      </div>
    </div>
  );
};

// ============================================================
// MAPA
// ============================================================
const MapLocationCarro = ({ localizacao, ilha, latitude, longitude, carroId, onMapClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const temCoordenadas = latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude));
  const textoLocalizacao = `${ilha || 'Cabo Verde'}, ${localizacao || 'Localização não informada'}`;

  const abrirPaginaMapa = () => {
    if (onMapClick) onMapClick();
    navigate(carroId ? `/mapa-carros?foco=${carroId}` : '/mapa-carros');
  };

  useEffect(() => {
    if (!temCoordenadas || !mapContainer.current || map.current) return;
    if (!MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const lat = parseFloat(latitude), lng = parseFloat(longitude);
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
      new mapboxgl.Marker({ color: '#1e3a8a', scale: 1.2 }).setLngLat([lng, lat]).addTo(map.current);
    });
    return () => { if (map.current) { map.current.remove(); map.current = null; } };
  }, [temCoordenadas, latitude, longitude]);

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm text-left">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">{t('localizacao') || 'Localização'}</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{textoLocalizacao}</p>
        </div>
      </div>
      {temCoordenadas && MAPBOX_TOKEN ? (
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div ref={mapContainer} className="relative w-full h-[160px] bg-slate-100 cursor-pointer" onClick={abrirPaginaMapa} />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      ) : (
        <div onClick={abrirPaginaMapa} className="relative w-full h-[140px] rounded-xl overflow-hidden bg-slate-100 border border-slate-100 cursor-pointer group">
          <div className="absolute inset-0 flex items-center justify-center"><MapPin size={24} className="text-blue-900" /></div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// CONTEÚDO DAS TABS
// ============================================================
const TabContent = ({ activeTab, carro }) => {
  const { t } = useTranslation();
  if (!carro) return null;
  switch (activeTab) {
    case 0:
      return (
        <div className="space-y-6 text-left">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('sobre_veiculo') || 'Sobre este veículo'}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {carro.descricao || carro.descricao_curta || `${t('veiculo_disponivel') || 'Veículo'} ${carro.titulo} disponível em ${carro.localizacao}.`}
            </p>
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
                <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-500">{t('tipo_veiculo') || 'Tipo'}</span><span className="font-medium text-slate-900">{carro.tipo || 'SUV'}</span></div>
                <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-500">{t('ano_fabrico') || 'Ano'}</span><span className="font-medium text-slate-900">{carro.ano || '2024'}</span></div>
              </div>
            </div>
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
export const CarrosDetalhes = ({ slugOverride, onClose, embedded = false }) => {
  const { t } = useTranslation();
  const params = useParams();
  const slug = slugOverride || params?.slug;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carro, setCarro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [validandoDisponibilidade, setValidandoDisponibilidade] = useState(false);
  const [mostrarChat, setMostrarChat] = useState(false);

  const tracking = useCarroTracking(carro?.id, usuarioLogado?.id);
  const registrarCliqueReserva = tracking?.registrarCliqueReserva || (() => {});
  const registrarVisualizacaoMapa = tracking?.registrarVisualizacaoMapa || (() => {});
  const registrarCliqueContato = tracking?.registrarCliqueContato || (() => {});

  // Bloqueia scroll do body em modo embedded
  useEffect(() => {
    if (!embedded) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, [embedded]);

  // Fecha com ESC em modo embedded
  useEffect(() => {
    if (!embedded || !onClose) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [embedded, onClose]);

  // Carrega utilizador (JWT robusto)
  useEffect(() => {
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
        if (id) {
          setUsuarioLogado({
            id: Number(id),
            nome: user.nome || user.name || 'Utilizador',
            foto: user.foto || user.picture || null
          });
          return;
        }
      }
      const savedUser = localStorage.getItem('user') || localStorage.getItem('morabeza_user');
      if (savedUser) {
        setUsuarioLogado(JSON.parse(savedUser));
      }
    } catch (e) { console.error(e); }
  }, []);

  // Fetch do carro
  useEffect(() => {
    const fetchCarro = async () => {
      if (!slug) { setError(t('slug_nao_fornecido') || 'Slug não fornecido'); setLoading(false); return; }
      setLoading(true); setError(null);
      try {
        const response = await fetch(`${API_URL}/api/get_carro_detalhes.php?slug=${encodeURIComponent(slug)}&t=${Date.now()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        if (data.success && data.data) {
          setCarro(data.data);
          const imagensExtraidas = extrairImagens(data.data);
          if (imagensExtraidas.length > 0) {
            setImages(imagensExtraidas);
          } else {
            setImages(["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&h=800&fit=crop"]);
          }
        } else {
          throw new Error(data.error || 'Erro ao carregar dados');
        }
      } catch (err) {
        setError(err.message || 'Erro ao carregar dados do veículo');
      } finally {
        setLoading(false);
      }
    };
    fetchCarro();
  }, [slug, t]);

  // Verificação de disponibilidade + navegação para checkout
  const handleContinueToCheckout = async (reservaInfo) => {
    registrarCliqueReserva();

    if (!carro) {
      showToast(t('erro_veiculo') || "Erro ao carregar dados do veículo.", 'error');
      return;
    }

    const checkInStr = reservaInfo.startDate.toISOString().split('T')[0];
    const checkOutStr = reservaInfo.endDate.toISOString().split('T')[0];

    setValidandoDisponibilidade(true);

    try {
      const url = `${API_URL}/api/verificar_disponibilidade_carro.php?carro_id=${encodeURIComponent(carro.id)}&checkin=${encodeURIComponent(checkInStr)}&checkout=${encodeURIComponent(checkOutStr)}&quantidade=${encodeURIComponent(reservaInfo.quantidade)}`;
      const res = await fetch(url, { method: 'GET' });
      const data = await res.json();

      if (data.success && data.disponivel === false) {
        showToast(
          data.mensagem || t('sem_stock_carro', 'Não há carros suficientes disponíveis para as datas selecionadas.'),
          'error'
        );
        setValidandoDisponibilidade(false);
        return;
      }

      if (data.success === false && data.error) {
        console.warn('Aviso da API de disponibilidade:', data.error);
      }
    } catch (err) {
      console.error('Erro ao verificar disponibilidade:', err);
      showToast(
        t('erro_verificar_disponibilidade', 'Erro ao verificar disponibilidade. Tente novamente.'),
        'error'
      );
      setValidandoDisponibilidade(false);
      return;
    }

    setValidandoDisponibilidade(false);

    const dadosParaCheckout = {
      id: carro.id,
      titulo: carro.titulo,
      imagem: images[0] || carro.imagem_url,
      localizacao: carro.localizacao,
      ilha: carro.ilha || 'Cabo Verde',
      precoDia: Number(carro.preco_dia),
      checkIn: checkInStr,
      checkOut: checkOutStr,
      dias: reservaInfo.dias,
      quantidade: reservaInfo.quantidade,
      totalGeral: reservaInfo.totalGeral,
      caucao: reservaInfo.caucao,
      tipo: carro.tipo,
      ano: carro.ano,
      transmissao: carro.transmissao,
    };

    if (onClose) onClose();
    navigate('/checkout-carro', { state: { reservaData: dadosParaCheckout } });
  };

  const irPara = (rota) => {
    if (onClose) onClose();
    navigate(rota);
  };

  // Abre o chat
  const handleContactar = () => {
    if (!usuarioLogado?.id) {
      showToast(t('login_para_mensagens') || 'Faça login para enviar mensagens', 'info');
      return;
    }
    const donoId = carro?.usuario_id || carro?.proprietario?.id;
    if (Number(donoId) === Number(usuarioLogado.id)) {
      showToast(t('nao_pode_contactar_se') || 'Não pode contactar-se a si mesmo', 'error');
      return;
    }
    registrarCliqueContato();
    setMostrarChat(true);
  };

  // Estados de loading/erro
  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-blue-900" />
      </div>
    );
  }

  if (error || !carro) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="text-red-500 text-xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{t('erro_carregar_titulo') || 'Erro ao carregar'}</h2>
        <p className="text-slate-600 mb-4">{error || (t('carro_nao_encontrado') || 'Veículo não encontrado')}</p>
        <button onClick={() => irPara(-1)} className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-950 transition">
          {t('voltar') || 'Voltar'}
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full bg-white font-sans pb-20 relative ${embedded ? 'rounded-3xl' : ''}`}>
      {!embedded && <Helmet><title>MorabezaStay | {carro.titulo}</title></Helmet>}

      {/* Botão fechar em modo embedded */}
      {embedded && onClose && (
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="fixed top-4 right-4 z-[400] bg-white hover:bg-slate-100 text-slate-800 rounded-full p-3 shadow-2xl border border-slate-200 transition-all active:scale-95"
        >
          <X size={22} />
        </button>
      )}

      {isModalOpen && (
        <ImageSliderModal
          images={images}
          currentIndex={currentImageIndex}
          onClose={() => setIsModalOpen(false)}
          onPrev={() => setCurrentImageIndex(p => p === 0 ? images.length - 1 : p - 1)}
          onNext={() => setCurrentImageIndex(p => p === images.length - 1 ? 0 : p + 1)}
        />
      )}

      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-[11px] font-medium text-slate-500 text-left">
        <span onClick={() => irPara('/')} className="hover:text-blue-900 cursor-pointer">{t('inicio') || 'Início'}</span>
        <ChevronRight size={10} />
        <span onClick={() => irPara('/carros')} className="hover:text-blue-900 cursor-pointer">{t('veiculos') || 'Veículos'}</span>
        <ChevronRight size={10} />
        <span className="text-slate-500 font-semibold truncate">{carro.titulo}</span>
      </nav>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery
              images={images}
              onImageChange={setCurrentImageIndex}
              onOpenModal={() => setIsModalOpen(true)}
              titulo={carro.titulo}
            />
            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-6">
              <EspecificacoesBar caracteristicas={carro.caracteristicas} />
              <InclusoesCarroBar inclusoes={carro.inclusoes} localizacao={carro.localizacao} />
            </div>
          </div>

          <div className="lg:self-start">
            <div className="sticky top-24 z-30">
              <SidebarReservaCarro
                precoDia={Number(carro.preco_dia)}
                estrelas={carro.estrelas}
                totalReviews={carro.total_avaliacoes}
                quantidadeDisponivel={carro.quantidade_disponivel || 5}
                valorCaucao={carro.valor_caucao || 20000}
                onContinueToCheckout={handleContinueToCheckout}
                validando={validandoDisponibilidade}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Título + Denúncia */}
      <div className="max-w-7xl mx-auto px-6 mt-8 text-left">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">{carro.titulo}</h1>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">{carro.tipo || 'SUV'}</span>
            </div>
          </div>
          <BotaoDenuncia tipo="carro" itemId={carro.id} itemTitulo={carro.titulo} />
        </div>
      </div>

      {/* Tabs + Mapa + Dono */}
      <div className="max-w-7xl mx-auto px-6 mt-6 text-left">
        <TabsNavegacaoCarros activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TabContent activeTab={activeTab} carro={carro} />
          </div>
          <div className="space-y-4">
            {/* ⭐ DONO DO CARRO ⭐ */}
            {carro.proprietario && (
              <DonoCarroInfo
                proprietario={carro.proprietario}
                carroTitulo={carro.titulo}
                onContactClick={registrarCliqueContato}
                onContactar={handleContactar}
                usuarioLogado={usuarioLogado}
              />
            )}

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

      {/* Avaliações */}
      <div className="w-full bg-white border-t border-slate-100 mt-12 pt-12">
        <div className="max-w-7xl mx-auto px-6">
          <AvaliacoesSeccaoCarro
            carroId={carro.id}
            usuarioLogado={usuarioLogado}
            onOpenLoginModal={() => showToast(t('login_para_avaliar') || "Por favor, faça login para avaliar.", 'info')}
          />
        </div>
      </div>

      {/* ⭐ MODAL DO CHAT ⭐ */}
      {mostrarChat && (
        <ChatSimples
          anuncioId={carro.id}
          tipoAnuncio="carro"
          anuncioTitulo={carro.titulo}
          proprietarioId={carro.usuario_id || carro.proprietario?.id}
          onClose={() => setMostrarChat(false)}
        />
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .react-datepicker__day--in-range { background-color: #f1f5f9 !important; }
        .react-datepicker__day--range-start, .react-datepicker__day--range-end { background-color: #2563eb !important; color: white !important; border-radius: 50% !important; }
      `}</style>
    </div>
  );
};

export default CarrosDetalhes;