// src/features/alojamento/components/SeccaoEscolhaQuarto.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users, Bed, Camera, Plus, Minus, X, ChevronLeft, ChevronRight, Check,
  LayoutGrid, ChevronDown,
  Wifi, Wind, Coffee, Tv, Bath, Droplet, Car, Eye, Lock,
  ChevronUp, Shirt, CheckCircle, Snowflake, Flame, Sun,
  Refrigerator, Mic, Briefcase
} from 'lucide-react';
import { useFotosDoQuarto } from '../../../hooks/useFotosDoQuarto';
import { useToast } from '../../../Toast';

// ------------------------------------------------------------
// Mapeamento de ícones para comodidades
// ------------------------------------------------------------
const getIconeComodidade = (nome) => {
  const n = (nome || '').toLowerCase();
  if (n.includes('wifi') || n.includes('wi-fi')) return Wifi;
  if (n.includes('ar condicionado') || n.includes('ar-condicionado')) return Snowflake;
  if (n.includes('cozinha')) return Coffee;
  if (n.includes('tv') || n.includes('televis')) return Tv;
  if (n.includes('banheira')) return Bath;
  if (n.includes('wc') || n.includes('casa de banho') || n.includes('banheiro')) return Bath;
  if (n.includes('piscina')) return Droplet;
  if (n.includes('estacionamento')) return Car;
  if (n.includes('vista')) return Eye;
  if (n.includes('segurança') || n.includes('cofre')) return Lock;
  if (n.includes('elevador')) return ChevronUp;
  if (n.includes('máquina de lavar') || n.includes('lavar roupa')) return Shirt;
  if (n.includes('aquecimento')) return Flame;
  if (n.includes('varanda') || n.includes('terraço')) return Sun;
  if (n.includes('frigorífico') || n.includes('geladeira')) return Refrigerator;
  if (n.includes('micro-ondas') || n.includes('microondas')) return Mic;
  if (n.includes('ventilador')) return Wind;
  if (n.includes('secador')) return Wind;
  if (n.includes('cama')) return Bed;
  if (n.includes('roupa') || n.includes('toalha')) return Briefcase;
  return CheckCircle;
};

// ------------------------------------------------------------
// Utilitário: obter ID canónico + stock efetivo do quarto
// ------------------------------------------------------------
const obterStockEfetivo = (q, stocksPorTipo) => {
  const possiveisChaves = [
    q.tipo_quarto_id,
    q.quarto_id,
    q.alojamento_quarto_id,
    q.id,
  ].filter((k) => k !== undefined && k !== null);

  let stockApi = null;
  for (const k of possiveisChaves) {
    if (stocksPorTipo && stocksPorTipo[k] !== undefined && stocksPorTipo[k] !== null) {
      stockApi = Number(stocksPorTipo[k]);
      break;
    }
  }

  const stockDoQuarto = [
    q.quantidade_disponivel,
    q.quantidade_total,
    q.quantidade,
  ]
    .map((v) => (v === undefined || v === null ? null : Number(v)))
    .filter((v) => v !== null && !isNaN(v));

  const candidatos = [stockApi, ...stockDoQuarto].filter(
    (v) => v !== null && !isNaN(v)
  );
  if (candidatos.length === 0) return null;
  return Math.min(...candidatos);
};

// ------------------------------------------------------------
// Sub-componente: Chip de comodidade individual
// ------------------------------------------------------------
const ChipComodidade = ({ comodidade }) => {
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

// ------------------------------------------------------------
// Sub-componente: Painel de comodidades com animação suave
// ------------------------------------------------------------
const PainelComodidades = ({ comodidades = [], aberto }) => {
  const { t } = useTranslation();
  const conteudoRef = useRef(null);
  const [altura, setAltura] = useState(0);

  useEffect(() => {
    if (conteudoRef.current) {
      setAltura(conteudoRef.current.scrollHeight);
    }
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
      <div
        ref={conteudoRef}
        className="mt-2.5 p-3 bg-blue-50/60 border border-blue-100 rounded-xl"
      >
        <p className="text-[10px] font-bold text-slate-700 mb-2 uppercase tracking-wide">
          {t('comodidades_deste_quarto') || 'Comodidades deste quarto'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {comodidades.map((c, i) => (
            <ChipComodidade key={c.id || i} comodidade={c} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------
// Cartão de Quarto — UI com painel expansível
// ------------------------------------------------------------
const CartaoQuartoVisual = ({
  q, idx, isSelected, qtd, stockEfetivo, onToggle, onAlterarQtd, onAbrirModal, alojamentoId,
}) => {
  const { t } = useTranslation();
  const { fotos, fotoCapa, carregando } = useFotosDoQuarto(q, alojamentoId);

  const [mostrarComodidades, setMostrarComodidades] = useState(false);

  const qId = q.id || q.quarto_id || q.alojamento_quarto_id || q.tipo_quarto_id;
  const preco = Math.round(
    Number(q.preco_calculado || q.preco_personalizado || q.preco_noite || 0)
  );

  const comodidades = q.comodidades || [];
  const temComodidades = comodidades.length > 0;

  const formatarCamas = (camas) => {
    if (!camas) return `1 ${t('cama') || 'cama'}`;
    return String(camas).trim().replace(/\s+camas$/i, '').replace(/\s+cama$/i, '');
  };

  const temStockConhecido = stockEfetivo !== null && stockEfetivo !== undefined;
  const esgotado = temStockConhecido && stockEfetivo === 0;

  const handleCardClick = () => {
    if (esgotado) return;
    onToggle(qId, q.nome || q.tipo_nome, preco);
  };

  return (
    <div
      className={[
        'group border rounded-2xl overflow-hidden flex flex-col relative p-2',
        'transition-all duration-300 ease-out select-none',
        esgotado
          ? 'border-slate-200 bg-slate-50/70 opacity-90'
          : isSelected
          ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/30 shadow-md shadow-blue-500/10'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
      ].join(' ')}
    >
      {/* ========== LINHA SUPERIOR: IMAGEM + INFO ========== */}
      <div
        onClick={handleCardClick}
        role="button"
        aria-pressed={isSelected}
        aria-disabled={esgotado}
        className={[
          'flex flex-row items-center min-h-[110px]',
          esgotado ? 'cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        {/* Imagem */}
        <div className="relative w-[85px] h-[90px] shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
          {carregando ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : fotoCapa ? (
            <img
              src={fotoCapa}
              alt={q.nome || q.tipo_nome}
              className={[
                'w-full h-full object-cover transition-transform duration-500 ease-out',
                !esgotado && 'group-hover:scale-[1.04]',
              ].join(' ')}
              loading="eager"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : null}

          {fotos.length > 1 && (
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[7px] font-bold px-1 py-0.5 rounded">
              {fotos.length}
            </div>
          )}

          {idx === 0 && fotoCapa && !esgotado && (
            <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[7px] font-bold px-1 py-0.5 rounded-sm uppercase tracking-wide scale-90 origin-top-left">
              {t('mais_escolhido') || 'Mais Escolhido'}
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="pl-3 flex-1 flex flex-col justify-between min-h-[90px] relative">
          {/* Checkbox visual */}
          <div className="absolute top-0.5 right-0.5">
            <div
              className={[
                'w-4 h-4 rounded-full border flex items-center justify-center',
                'transition-all duration-300 ease-out',
                esgotado
                  ? 'bg-slate-100 border-slate-200'
                  : isSelected
                  ? 'bg-blue-600 border-blue-600 scale-100'
                  : 'bg-white border-slate-300 scale-100 group-hover:border-slate-400',
              ].join(' ')}
            >
              {!esgotado && (
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
                  esgotado ? 'text-slate-400' : 'text-slate-900',
                ].join(' ')}
              >
                {q.nome || q.tipo_nome || 'Quarto'}
              </h4>

              {esgotado && (
                <span className="bg-red-100 text-red-600 text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                  {t('esgotado_para_datas') || 'Esgotado para estas datas'}
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
                  esgotado ? 'text-slate-400' : 'text-slate-900',
                ].join(' ')}
              >
                {preco.toLocaleString('pt-PT')} CVE
              </span>
              <span className="text-[9px] font-semibold text-slate-400">
                / {t('noite') || 'noite'}
              </span>
            </div>

            {/* ========== VER FOTOS + BOTÕES +/- ========== */}
            <div className="flex items-center justify-between">
              {fotos.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onAbrirModal(fotos, q.nome || q.tipo_nome); }}
                  className="text-[9px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                >
                  <Camera size={10} />
                  <span>{t('ver_fotos') || 'Ver Fotos'} ({fotos.length})</span>
                </button>
              )}

              {!esgotado && (
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

      {/* ========== BOTÃO "Ver comodidades" ========== */}
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

      {/* ========== PAINEL EXPANSÍVEL DE COMODIDADES ========== */}
      {temComodidades && (
        <PainelComodidades
          comodidades={comodidades}
          aberto={mostrarComodidades}
        />
      )}
    </div>
  );
};

// ------------------------------------------------------------
// Secção Principal
// ------------------------------------------------------------
const SeccaoEscolhaQuarto = ({
  quartoSelecionado,
  onSelecaoQuarto,
  tiposQuarto = [],
  quantidadesProp = null,
  onQuantidadeChange = null,
  stocksPorTipo = {},
  alojamentoId = null,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [quantidadesLocais, setQuantidadesLocais] = useState({});
  const [modalFotos, setModalFotos] = useState({ aberta: false, fotos: [], titulo: '', indiceAtual: 0 });

  const quantidades = quantidadesProp || quantidadesLocais;

  const stocksPorQuarto = useMemo(() => {
    const mapa = {};
    tiposQuarto.forEach((q) => {
      const qId = q.id || q.quarto_id || q.alojamento_quarto_id || q.tipo_quarto_id;
      mapa[qId] = obterStockEfetivo(q, stocksPorTipo);
    });
    return mapa;
  }, [tiposQuarto, stocksPorTipo]);

  const handleToggle = useCallback((quartoId, nome, preco) => {
    if (onSelecaoQuarto) {
      onSelecaoQuarto(quartoId, nome, preco);
    }
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
        {tiposQuarto.map((q, idx) => {
          const qId = q.id || q.quarto_id || q.alojamento_quarto_id || q.tipo_quarto_id;
          const qtd = quantidades[qId] !== undefined ? quantidades[qId] : 0;
          const stockEfetivo = stocksPorQuarto[qId];
          const temStockConhecido = stockEfetivo !== null && stockEfetivo !== undefined;
          const esgotado = temStockConhecido && stockEfetivo === 0;
          const isSelected = !esgotado && qtd > 0;

          return (
            <CartaoQuartoVisual
              key={qId || idx}
              q={q}
              idx={idx}
              isSelected={isSelected}
              qtd={qtd}
              stockEfetivo={stockEfetivo}
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