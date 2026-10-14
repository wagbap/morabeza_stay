// src/features/alojamento/components/SeccaoEscolhaQuarto.jsx
// ============================================================
// Secção de escolha de quartos — VERSÃO BLINDADA
// - Comodidades reais do endpoint get_comodidades_quartos.php
// - Fallback múltiplo para fotos (fotoCapa, imagem_url, imagens[], fotos[])
// - Matching robusto por TODAS as chaves possíveis do quarto
// ============================================================

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users, Bed, Camera, Plus, Minus, X, ChevronLeft, ChevronRight, Check,
  LayoutGrid, ChevronDown,
  Wifi, Wind, Coffee, Tv, Bath, Droplet, Car, Eye, Lock,
  ChevronUp, Shirt, CheckCircle, Snowflake, Flame, Sun,
  Refrigerator, Mic, Briefcase, Sparkles, Droplets, Scroll, ShowerHead,
  Mountain, Building, Package, BookOpen, Moon, Shield, Baby, Zap,
  DoorOpen, Wine, Fan
} from 'lucide-react';
import { useFotosDoQuarto } from '../../../hooks/useFotosDoQuarto';
import { useToast } from '../../../Toast';
import comodidadesService from '../../../services/comodidadesQuartoService';

// ============================================================
// ÍCONES
// ============================================================
const getIconeComodidade = (nome) => {
  const n = (nome || '').toLowerCase();
  if (n.includes('wifi') || n.includes('wi-fi')) return Wifi;
  if (n.includes('tv por cabo')) return Tv;
  if (n.includes('tv') || n.includes('televis')) return Tv;
  if (n.includes('tomada')) return Zap;
  if (n.includes('ar condicionado') || n.includes('ar-condicionado')) return Snowflake;
  if (n.includes('aquecimento')) return Flame;
  if (n.includes('ventilador')) return Fan;
  if (n.includes('banheira')) return Bath;
  if (n.includes('duche') || n.includes('chuveiro')) return ShowerHead;
  if (n.includes('água quente') || n.includes('agua quente')) return Droplets;
  if (n.includes('produtos de higiene')) return Sparkles;
  if (n.includes('papel higiénico') || n.includes('papel higienico')) return Scroll;
  if (n.includes('casa de banho partilhada')) return Users;
  if (n.includes('casa de banho')) return Bath;
  if (n.includes('cozinha')) return Coffee;
  if (n.includes('frigorífico') || n.includes('geladeira')) return Refrigerator;
  if (n.includes('micro-ondas') || n.includes('microondas')) return Mic;
  if (n.includes('máquina de café') || n.includes('maquina de cafe')) return Coffee;
  if (n.includes('chaleira')) return Coffee;
  if (n.includes('mini-bar') || n.includes('minibar')) return Wine;
  if (n.includes('ferro de engomar')) return Flame;
  if (n.includes('máquina de lavar') || n.includes('lavar roupa')) return Shirt;
  if (n.includes('secador')) return Wind;
  if (n.includes('tábua de engomar') || n.includes('tabua de engomar')) return Shirt;
  if (n.includes('roupa') || n.includes('toalha')) return Bed;
  if (n.includes('armário') || n.includes('armario')) return Package;
  if (n.includes('cabide')) return Shirt;
  if (n.includes('secretária') || n.includes('secretaria')) return BookOpen;
  if (n.includes('cortina') || n.includes('blackout')) return Moon;
  if (n.includes('mosquiteiro')) return Shield;
  if (n.includes('cama')) return Bed;
  if (n.includes('berço') || n.includes('berco')) return Baby;
  if (n.includes('varanda')) return Sun;
  if (n.includes('terraço') || n.includes('terraco')) return Sun;
  if (n.includes('entrada privada')) return DoorOpen;
  if (n.includes('jardim')) return Sun;
  if (n.includes('churrasqueira')) return Flame;
  if (n.includes('vista para o mar')) return Droplet;
  if (n.includes('vista para a montanha')) return Mountain;
  if (n.includes('vista para a cidade')) return Building;
  if (n.includes('vista')) return Eye;
  if (n.includes('cofre') || n.includes('segurança') || n.includes('seguranca')) return Lock;
  if (n.includes('elevador')) return ChevronUp;
  if (n.includes('piscina')) return Droplet;
  if (n.includes('estacionamento')) return Car;
  if (n.includes('ginásio') || n.includes('ginasio')) return Briefcase;
  return CheckCircle;
};

// ============================================================
// STOCK EFETIVO
// ============================================================
const obterStockEfetivo = (q, stocksPorTipo) => {
  const possiveisChaves = [q.tipo_quarto_id, q.quarto_id, q.alojamento_quarto_id, q.id].filter(
    (k) => k !== undefined && k !== null
  );

  let stockApi = null;
  for (const k of possiveisChaves) {
    if (stocksPorTipo && stocksPorTipo[k] !== undefined && stocksPorTipo[k] !== null) {
      stockApi = Number(stocksPorTipo[k]);
      break;
    }
  }

  const stockDoQuarto = [q.quantidade_disponivel, q.quantidade_total, q.quantidade]
    .map((v) => (v === undefined || v === null ? null : Number(v)))
    .filter((v) => v !== null && !isNaN(v));

  const candidatos = [stockApi, ...stockDoQuarto].filter((v) => v !== null && !isNaN(v));
  if (candidatos.length === 0) return null;
  return Math.min(...candidatos);
};

// ============================================================
// BLOQUEIO POR PERÍODO
// ============================================================
const tipoBloqueadoNoPeriodo = (tipoQuartoId, datasBloqueadasPorQuarto, datasSelecionadas, datasBloqueadasGerais) => {
  if (!datasSelecionadas?.checkIn || !datasSelecionadas?.checkOut) return false;
  if (tipoQuartoId === null || tipoQuartoId === undefined) return false;

  const noites = [];
  const [y1, m1, d1] = String(datasSelecionadas.checkIn).split('-').map(Number);
  const [y2, m2, d2] = String(datasSelecionadas.checkOut).split('-').map(Number);
  const start = new Date(y1, m1 - 1, d1);
  const end = new Date(y2, m2 - 1, d2);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return false;

  for (let dt = new Date(start); dt < end; dt.setDate(dt.getDate() + 1)) {
    const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    noites.push(iso);
  }

  const chave = String(tipoQuartoId);
  const especificas = (datasBloqueadasPorQuarto || {})[chave] || [];
  for (const noite of noites) {
    if (especificas.includes(noite)) return true;
    if ((datasBloqueadasGerais || []).includes(noite)) return true;
  }
  return false;
};

// ============================================================
// ✅ BLINDAGEM: resolver fotoCapa a partir de N fontes
// ============================================================
const resolverFotoCapa = (q, fotosDoHook) => {
  // 1. Hook (prioritário)
  if (fotosDoHook && fotosDoHook.length > 0) return fotosDoHook[0];

  // 2. Fotos próprias do objeto
  if (Array.isArray(q?.fotos) && q.fotos.length > 0) {
    const f = q.fotos[0];
    return typeof f === 'string' ? f : (f?.url || f?.caminho_url || null);
  }

  // 3. Array imagens
  if (Array.isArray(q?.imagens) && q.imagens.length > 0) {
    const f = q.imagens[0];
    return typeof f === 'string' ? f : (f?.url || f?.caminho_url || f?.imagem_url || null);
  }

  // 4. Campo direto
  if (q?.imagem_url) return q.imagem_url;
  if (q?.imagem_principal) return q.imagem_principal;
  if (q?.foto) return q.foto;
  if (q?.foto_url) return q.foto_url;
  if (q?.fotoCapa) return q.fotoCapa;
  if (q?.imagem) return q.imagem;
  if (q?.capa) return q.capa;

  return null;
};

// ============================================================
// CHIP DE COMODIDADE
// ============================================================
const ChipComodidade = ({ comodidade }) => {
  if (typeof comodidade === 'number' || typeof comodidade === 'string') {
    return (
      <div className="inline-flex items-center gap-1.5 bg-white border border-blue-200 rounded-full px-2.5 py-1.5 shadow-sm">
        <CheckCircle size={13} className="text-blue-600 shrink-0" strokeWidth={2} />
        <span className="text-[10px] font-semibold text-slate-700 whitespace-nowrap">
          Comodidade #{comodidade}
        </span>
      </div>
    );
  }

  const Icone = getIconeComodidade(comodidade.nome);
  return (
    <div
      className="inline-flex items-center gap-1.5 bg-white border border-blue-200 rounded-full px-2.5 py-1.5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200"
      title={comodidade.descricao || comodidade.nome}
    >
      <Icone size={13} className="text-blue-600 shrink-0" strokeWidth={2} />
      <span className="text-[10px] font-semibold text-slate-700 whitespace-nowrap">
        {comodidade.nome}
      </span>
    </div>
  );
};

// ============================================================
// PAINEL DE COMODIDADES
// ============================================================
const PainelComodidades = ({ comodidades = [], aberto }) => {
  const { t } = useTranslation();
  const conteudoRef = useRef(null);
  const [altura, setAltura] = useState(0);

  useEffect(() => {
    if (conteudoRef.current) setAltura(conteudoRef.current.scrollHeight);
  }, [comodidades, aberto]);

  if (!comodidades || comodidades.length === 0) return null;

  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{
        maxHeight: aberto ? `${altura + 30}px` : '0px',
        opacity: aberto ? 1 : 0,
        transform: aberto ? 'translateY(0)' : 'translateY(-8px)',
      }}
    >
      <div ref={conteudoRef} className="mt-2.5 p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
        <p className="text-[10px] font-bold text-slate-700 mb-2 uppercase tracking-wide">
          {t('comodidades_deste_quarto') || 'Comodidades deste quarto'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {comodidades.map((c, i) => (
            <ChipComodidade key={(c && c.id) || i} comodidade={c} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// CARTAO DE QUARTO — BLINDADO
// ============================================================
const CartaoQuartoVisual = ({
  q, idx, isSelected, qtd, stockEfetivo, bloqueado = false,
  onToggle, onAlterarQtd, onAbrirModal, alojamentoId,
}) => {
  const { t } = useTranslation();

  // ✅ Hook de fotos (mas com fallback depois)
  let fotosHook = [];
  let carregandoHook = false;
  let fotoCapaHook = null;

  try {
    const r = useFotosDoQuarto(q, alojamentoId);
    fotosHook = r?.fotos || [];
    carregandoHook = r?.carregando || false;
    fotoCapaHook = r?.fotoCapa || null;
  } catch (e) {
    // Silencioso — fallback abaixo
  }

  // ✅ BLINDAGEM: se o hook não devolveu nada, monta a lista de fotos do próprio objeto
  const fotosLocais = useMemo(() => {
    const lista = [];
    if (Array.isArray(q?.fotos)) {
      q.fotos.forEach((f) => {
        if (typeof f === 'string') lista.push(f);
        else if (f?.url) lista.push(f.url);
        else if (f?.caminho_url) lista.push(f.caminho_url);
      });
    }
    if (Array.isArray(q?.imagens)) {
      q.imagens.forEach((f) => {
        if (typeof f === 'string') lista.push(f);
        else if (f?.url) lista.push(f.url);
        else if (f?.caminho_url) lista.push(f.caminho_url);
        else if (f?.imagem_url) lista.push(f.imagem_url);
      });
    }
    if (q?.imagem_url) lista.push(q.imagem_url);
    if (q?.imagem_principal) lista.push(q.imagem_principal);
    if (q?.foto) lista.push(q.foto);
    if (q?.foto_url) lista.push(q.foto_url);
    return [...new Set(lista.filter(Boolean))]; // remove duplicados
  }, [q]);

  // ✅ Lista final: hook > local > []
  const fotos = fotosHook.length > 0 ? fotosHook : fotosLocais;

  // ✅ Foto capa final
  const fotoCapa = fotoCapaHook || resolverFotoCapa(q, fotos);

  const carregando = carregandoHook && fotos.length === 0;

  const [mostrarComodidades, setMostrarComodidades] = useState(false);
  const [imgErro, setImgErro] = useState(false);

  const qId = q.id || q.quarto_id || q.alojamento_quarto_id || q.tipo_quarto_id;
  const preco = Math.round(Number(q.preco_calculado || q.preco_personalizado || q.preco_noite || 0));

  const comodidades = Array.isArray(q.comodidades) ? q.comodidades : [];
  const temComodidades = comodidades.length > 0;

  const formatarCamas = (camas) => {
    if (!camas) return `1 ${t('cama') || 'cama'}`;
    return String(camas).trim().replace(/\s+camas$/i, '').replace(/\s+cama$/i, '');
  };

  const temStockConhecido = stockEfetivo !== null && stockEfetivo !== undefined;
  const esgotado = temStockConhecido && stockEfetivo === 0;
  const indisponivel = esgotado || bloqueado;

  const handleCardClick = () => {
    if (indisponivel) return;
    onToggle(qId, q.nome || q.tipo_nome, preco);
  };

  // ✅ Foto placeholder SVG (nunca fica vazio)
  const placeholderSvg =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#f1f5f9" width="200" height="200"/><path d="M60 120 L90 80 L120 110 L140 90 L160 120 L160 160 L60 160 Z" fill="#cbd5e1"/><circle cx="80" cy="70" r="12" fill="#cbd5e1"/></svg>`
    );

  return (
    <div
      className={[
        'group border rounded-2xl overflow-hidden flex flex-col relative p-2',
        'transition-all duration-300 ease-out select-none',
        indisponivel
          ? 'border-slate-200 bg-slate-50/70 opacity-90'
          : isSelected
          ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/30 shadow-md shadow-blue-500/10'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
      ].join(' ')}
    >
      <div
        onClick={handleCardClick}
        role="button"
        aria-pressed={isSelected}
        aria-disabled={indisponivel}
        className={[
          'flex flex-row items-center min-h-[110px]',
          indisponivel ? 'cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        {/* Imagem */}
        <div className="relative w-[85px] h-[90px] shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
          {carregando ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <img
              src={imgErro || !fotoCapa ? placeholderSvg : fotoCapa}
              alt={q.nome || q.tipo_nome}
              className={[
                'w-full h-full object-cover transition-transform duration-500 ease-out',
                !indisponivel && 'group-hover:scale-[1.04]',
              ].join(' ')}
              loading="eager"
              onError={() => setImgErro(true)}
            />
          )}

          {fotos.length > 1 && (
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[7px] font-bold px-1 py-0.5 rounded">
              {fotos.length}
            </div>
          )}

          {idx === 0 && fotoCapa && !indisponivel && (
            <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[7px] font-bold px-1 py-0.5 rounded-sm uppercase tracking-wide scale-90 origin-top-left">
              {t('mais_escolhido') || 'Mais Escolhido'}
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="pl-3 flex-1 flex flex-col justify-between min-h-[90px] relative">
          <div className="absolute top-0.5 right-0.5">
            <div
              className={[
                'w-4 h-4 rounded-full border flex items-center justify-center',
                'transition-all duration-300 ease-out',
                indisponivel
                  ? 'bg-slate-100 border-slate-200'
                  : isSelected
                  ? 'bg-blue-600 border-blue-600 scale-100'
                  : 'bg-white border-slate-300 scale-100 group-hover:border-slate-400',
              ].join(' ')}
            >
              {!indisponivel && (
                <Check
                  size={10}
                  strokeWidth={4}
                  className={[
                    'text-white transition-all duration-200',
                    isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
                  ].join(' ')}
                />
              )}
            </div>
          </div>

          <div className="pr-5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4
                className={[
                  'text-[11px] font-bold leading-tight truncate transition-colors',
                  indisponivel ? 'text-slate-400' : 'text-slate-900',
                ].join(' ')}
              >
                {q.nome || q.tipo_nome || 'Quarto'}
              </h4>

              {esgotado && (
                <span className="bg-red-100 text-red-600 text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                  {t('esgotado_para_datas') || 'Esgotado para estas datas'}
                </span>
              )}

              {bloqueado && !esgotado && (
                <span className="bg-orange-100 text-orange-700 text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                  {t('indisponivel_para_datas') || 'Indisponível para estas datas'}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-0.5 mt-0.5 text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Users size={11} className="text-slate-400" />{' '}
                {q.capacidade || q.capacidade_quarto || 2} {t('hospedes') || 'hóspedes'}
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <Bed size={11} className="text-slate-400" /> {formatarCamas(q.camas)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-auto">
            <div className="flex items-baseline gap-0.5 leading-none">
              <span
                className={[
                  'text-xs font-black transition-colors',
                  indisponivel ? 'text-slate-400' : 'text-slate-900',
                ].join(' ')}
              >
                {preco.toLocaleString('pt-PT')} CVE
              </span>
              <span className="text-[9px] font-semibold text-slate-400">
                / {t('noite') || 'noite'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              {fotos.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAbrirModal(fotos, q.nome || q.tipo_nome);
                  }}
                  className="text-[9px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                >
                  <Camera size={10} />
                  <span>{t('ver_fotos') || 'Ver Fotos'} ({fotos.length})</span>
                </button>
              )}

              {!indisponivel && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={[
                    'flex items-center gap-1 rounded-md px-1.5 py-0.5 border ml-auto',
                    'transition-all duration-300 ease-out',
                    isSelected
                      ? 'bg-white border-blue-200 shadow-sm'
                      : 'bg-slate-100 border-slate-200',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    onClick={(e) => onAlterarQtd(qId, -1, e)}
                    disabled={qtd === 0}
                    className="text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    <Minus size={10} />
                  </button>
                  <span className="text-[9px] font-bold text-slate-800 min-w-[10px] text-center select-none">
                    {qtd}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => onAlterarQtd(qId, 1, e)}
                    className="text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                  >
                    <Plus size={10} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {temComodidades && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMostrarComodidades((v) => !v);
          }}
          className="mt-2 ml-[97px] flex items-center gap-1.5 text-[10px] font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer group/btn w-fit"
        >
          <LayoutGrid size={12} className="group-hover/btn:scale-110 transition-transform" />
          <span>
            {mostrarComodidades
              ? (t('ocultar_comodidades') || 'Ocultar comodidades')
              : (t('ver_comodidades') || 'Ver comodidades')}
          </span>
          <ChevronDown
            size={12}
            className={`transition-transform duration-300 ${mostrarComodidades ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>
      )}

      {temComodidades && (
        <PainelComodidades comodidades={comodidades} aberto={mostrarComodidades} />
      )}
    </div>
  );
};

// ============================================================
// SECÇÃO PRINCIPAL — BLINDADA
// ============================================================
const SeccaoEscolhaQuarto = ({
  quartoSelecionado,
  onSelecaoQuarto,
  tiposQuarto = [],
  quantidadesProp = null,
  onQuantidadeChange = null,
  stocksPorTipo = {},
  alojamentoId = null,
  datasBloqueadas = [],
  datasBloqueadasPorQuarto = {},
  datasSelecionadas = { checkIn: null, checkOut: null },
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [quantidadesLocais, setQuantidadesLocais] = useState({});
  const [modalFotos, setModalFotos] = useState({ aberta: false, fotos: [], titulo: '', indiceAtual: 0 });

  const [comodidadesPorQuarto, setComodidadesPorQuarto] = useState({});
  const [carregandoComodidades, setCarregandoComodidades] = useState(false);

  const quantidades = quantidadesProp || quantidadesLocais;

  // ============================================================
  // BUSCAR COMODIDADES REAIS
  // ============================================================
  useEffect(() => {
    if (!alojamentoId) return;
    let cancelado = false;
    setCarregandoComodidades(true);

    comodidadesService
      .buscarComodidadesDosQuartos(alojamentoId)
      .then((res) => {
        if (cancelado) return;
        if (res.success && res.data) {
          const normalizado = {};
          Object.entries(res.data).forEach(([qId, lista]) => {
            normalizado[String(qId)] = Array.isArray(lista) ? lista : [];
          });
          setComodidadesPorQuarto(normalizado);
        }
      })
      .catch((err) => {
        if (!cancelado) console.error('❌ Erro comodidades:', err);
      })
      .finally(() => {
        if (!cancelado) setCarregandoComodidades(false);
      });

    return () => {
      cancelado = true;
    };
  }, [alojamentoId]);

  // ============================================================
  // ✅ ENRIQUECER — matching por TODAS as chaves possíveis
  // ============================================================
  const tiposQuartoEnriquecidos = useMemo(() => {
    return tiposQuarto.map((q) => {
      // Todas as chaves possíveis para procurar no mapa
      const possiveisIds = [
        q.id,
        q.quarto_id,
        q.alojamento_quarto_id,
        q.tipo_quarto_id,
        q.tipoQuartoId,
        q.alojamentoQuartoId,
      ]
        .filter((k) => k !== undefined && k !== null && k !== '')
        .map(String);

      let comods = [];

      // 1. Tentar match direto por cada chave
      for (const id of possiveisIds) {
        if (comodidadesPorQuarto[id] && comodidadesPorQuarto[id].length > 0) {
          comods = comodidadesPorQuarto[id];
          break;
        }
      }

      // 2. Fallback: se não encontrou, ver se o próprio q tem comodidades
      if (comods.length === 0 && Array.isArray(q.comodidades) && q.comodidades.length > 0) {
        comods = q.comodidades;
      }

      // 3. Fallback final: se nada, deixa vazio (a UI mostra "sem comodidades")
      return { ...q, comodidades: comods };
    });
  }, [tiposQuarto, comodidadesPorQuarto]);

  // ============================================================
  // STOCKS
  // ============================================================
  const stocksPorQuarto = useMemo(() => {
    const mapa = {};
    tiposQuartoEnriquecidos.forEach((q) => {
      const qId = q.id || q.quarto_id || q.alojamento_quarto_id || q.tipo_quarto_id;
      mapa[qId] = obterStockEfetivo(q, stocksPorTipo);
    });
    return mapa;
  }, [tiposQuartoEnriquecidos, stocksPorTipo]);

  // ============================================================
  // BLOQUEIOS
  // ============================================================
  const quartosBloqueadosNoPeriodo = useMemo(() => {
    const mapa = {};
    tiposQuartoEnriquecidos.forEach((q) => {
      const qId = q.id || q.quarto_id || q.alojamento_quarto_id || q.tipo_quarto_id;
      const tipoId = q.tipo_quarto_id || q.id;
      mapa[qId] = tipoBloqueadoNoPeriodo(
        tipoId,
        datasBloqueadasPorQuarto,
        datasSelecionadas,
        datasBloqueadas
      );
    });
    return mapa;
  }, [tiposQuartoEnriquecidos, datasBloqueadasPorQuarto, datasSelecionadas, datasBloqueadas]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleToggle = useCallback((quartoId, nome, preco) => {
    if (onSelecaoQuarto) onSelecaoQuarto(quartoId, nome, preco);
  }, [onSelecaoQuarto]);

  const handleAlterarQuantidade = useCallback((quartoId, delta, e) => {
    e.stopPropagation();
    const qtdAtual = quantidades[quartoId] || 0;
    const novaQtd = Math.max(0, qtdAtual + delta);
    const stockMax = stocksPorQuarto[quartoId];

    if (delta > 0 && stockMax !== null && stockMax !== undefined && novaQtd > stockMax) {
      showToast(
        t('stock_maximo_atingido', 'Só existem {{n}} disponíveis para este quarto.', { n: stockMax }),
        'error'
      );
      return;
    }

    if (onQuantidadeChange) onQuantidadeChange(quartoId, novaQtd);
    else setQuantidadesLocais((prev) => ({ ...prev, [quartoId]: novaQtd }));
  }, [quantidades, stocksPorQuarto, onQuantidadeChange, showToast, t]);

  const abrirModal = useCallback((fotos, nome) => {
    setModalFotos({
      aberta: true,
      fotos: fotos || [],
      titulo: `${nome} (${(fotos || []).length} ${(fotos || []).length === 1 ? 'foto' : 'fotos'})`,
      indiceAtual: 0,
    });
  }, []);

  const navegarFoto = useCallback((direcao) => {
    setModalFotos((prev) => {
      if (prev.fotos.length === 0) return prev;
      return {
        ...prev,
        indiceAtual:
          direcao === 'prox'
            ? (prev.indiceAtual + 1) % prev.fotos.length
            : prev.indiceAtual === 0
            ? prev.fotos.length - 1
            : prev.indiceAtual - 1,
      };
    });
  }, []);

  useEffect(() => {
    if (!modalFotos.aberta) return;
    const keyHandler = (e) => {
      if (e.key === 'ArrowRight') navegarFoto('prox');
      if (e.key === 'ArrowLeft') navegarFoto('ant');
      if (e.key === 'Escape') setModalFotos((p) => ({ ...p, aberta: false }));
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [modalFotos.aberta, navegarFoto]);

  if (!tiposQuarto || tiposQuarto.length === 0) return null;

  return (
    <div className="mt-6 mb-4 text-left">
      <h3 className="text-sm font-bold text-slate-900 mb-1">
        {t('escolha_quarto') || 'Escolha o seu quarto'}
      </h3>
      <p className="text-[11px] text-slate-500 font-medium mb-3">
        {t('pode_combinar_quartos', 'Pode combinar vários tipos de quarto. Clique no cartão para escolher ou remover.')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
        {tiposQuartoEnriquecidos.map((q, idx) => {
          const qId = q.id || q.quarto_id || q.alojamento_quarto_id || q.tipo_quarto_id;
          const qtd = quantidades[qId] !== undefined ? quantidades[qId] : 0;
          const stockEfetivo = stocksPorQuarto[qId];
          const temStockConhecido = stockEfetivo !== null && stockEfetivo !== undefined;
          const esgotado = temStockConhecido && stockEfetivo === 0;
          const bloqueado = quartosBloqueadosNoPeriodo[qId] === true;
          const indisponivel = esgotado || bloqueado;
          const isSelected = !indisponivel && qtd > 0;

          return (
            <CartaoQuartoVisual
              key={qId || idx}
              q={q}
              idx={idx}
              isSelected={isSelected}
              qtd={qtd}
              stockEfetivo={stockEfetivo}
              bloqueado={bloqueado}
              onToggle={handleToggle}
              onAlterarQtd={handleAlterarQuantidade}
              onAbrirModal={abrirModal}
              alojamentoId={alojamentoId}
            />
          );
        })}
      </div>

      {modalFotos.aberta && modalFotos.fotos.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm font-bold">{modalFotos.titulo}</h3>
              <button
                onClick={() => setModalFotos((p) => ({ ...p, aberta: false }))}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative bg-black rounded-2xl overflow-hidden">
              <img
                src={modalFotos.fotos[modalFotos.indiceAtual]}
                className="w-full h-[60vh] object-contain"
                alt="Quarto"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {modalFotos.fotos.length > 1 && (
                <>
                  <button
                    onClick={() => navegarFoto('ant')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 rounded-full text-white transition"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => navegarFoto('prox')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 rounded-full text-white transition"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                {modalFotos.indiceAtual + 1} / {modalFotos.fotos.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeccaoEscolhaQuarto;