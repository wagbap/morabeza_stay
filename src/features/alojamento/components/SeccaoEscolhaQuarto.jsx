// src/features/alojamento/components/SeccaoEscolhaQuarto.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Bed, Camera, Plus, Minus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFotosDoQuarto } from '../../../hooks/useFotosDoQuarto';

const CartaoQuartoVisual = ({ q, idx, isSelected, qtd, onSelecao, onAlterarQtd, onAbrirModal, alojamentoId }) => {
  const { t } = useTranslation();
  const { fotos, fotoCapa, carregando } = useFotosDoQuarto(q, alojamentoId);

  const qId = q.id || q.quarto_id || q.alojamento_quarto_id || q.tipo_quarto_id;
  const preco = Math.round(
    Number(q.preco_calculado || q.preco_personalizado || q.preco_noite || 0)
  );

  const formatarCamas = (camas) => {
    if (!camas) return `1 ${t('cama') || 'cama'}`;
    return String(camas).trim().replace(/\s+camas$/i, '').replace(/\s+cama$/i, '');
  };

  return (
    <div
      onClick={() => onSelecao(qId, q.nome || q.tipo_nome, preco)}
      className={`border rounded-xl overflow-hidden cursor-pointer transition-all flex flex-row bg-white items-center h-[110px] relative p-2 ${
        isSelected
          ? 'border-blue-600 bg-blue-50/10 ring-1 ring-blue-600'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="relative w-[85px] h-[90px] shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
        {carregando ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : fotoCapa ? (
          <img
            src={fotoCapa}
            alt={q.nome || q.tipo_nome}
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : null}
        {fotos.length > 1 && (
          <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[7px] font-bold px-1 py-0.5 rounded">
            {fotos.length}
          </div>
        )}
        {idx === 0 && fotoCapa && (
          <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[7px] font-bold px-1 py-0.5 rounded-sm uppercase tracking-wide scale-90 origin-top-left">
            {t('mais_escolhido') || 'Mais Escolhido'}
          </div>
        )}
      </div>

      <div className="pl-3 flex-1 flex flex-col justify-between h-full relative">
        <div className="absolute top-0.5 right-0.5">
          <div
            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
              isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
            }`}
          >
            {isSelected && (
              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>

        <div className="pr-4">
          <h4 className="text-[11px] font-bold text-slate-900 leading-tight truncate">
            {q.nome || q.tipo_nome || 'Quarto'}
          </h4>
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
            <span className="text-xs font-black text-slate-900">
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
                onClick={(e) => { e.stopPropagation(); onAbrirModal(fotos, q.nome || q.tipo_nome); }}
                className="text-[9px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
              >
                <Camera size={10} />
                <span>{t('ver_fotos') || 'Ver Fotos'} ({fotos.length})</span>
              </button>
            )}

            <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-slate-100 rounded-md px-1.5 py-0.5 border border-slate-200 ml-auto">
              <button type="button" onClick={(e) => onAlterarQtd(qId, -1, e)} disabled={qtd === 0} className="text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer">
                <Minus size={10} />
              </button>
              <span className="text-[9px] font-bold text-slate-800 min-w-[10px] text-center select-none">{qtd}</span>
              <button type="button" onClick={(e) => onAlterarQtd(qId, 1, e)} className="text-slate-500 hover:text-slate-900 cursor-pointer">
                <Plus size={10} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SeccaoEscolhaQuarto = ({
  quartoSelecionado,
  onSelecaoQuarto,
  tiposQuarto = [],
  quantidadesProp = null,
  onQuantidadeChange = null,
  alojamentoId = null,
}) => {
  const { t } = useTranslation();
  const [quantidadesLocais, setQuantidadesLocais] = useState({});
  const [modalFotos, setModalFotos] = useState({ aberta: false, fotos: [], titulo: '', indiceAtual: 0 });

  const quantidades = quantidadesProp || quantidadesLocais;

  const handleAlterarQuantidade = (quartoId, delta, e) => {
    e.stopPropagation();
    const qtdAtual = quantidades[quartoId] || (quartoSelecionado === quartoId ? 1 : 0);
    const novaQtd = Math.max(0, qtdAtual + delta);

    if (onQuantidadeChange) onQuantidadeChange(quartoId, novaQtd);
    else setQuantidadesLocais((prev) => ({ ...prev, [quartoId]: novaQtd }));

    if (onSelecaoQuarto) {
      const q = tiposQuarto.find(
        (item) => String(item.id || item.quarto_id || item.tipo_quarto_id) === String(quartoId)
      );
      const preco = Math.round(
        Number(q?.preco_calculado || q?.preco_personalizado || q?.preco_noite || 0)
      );
      onSelecaoQuarto(quartoId, q?.nome || q?.tipo_nome, preco, novaQtd);
    }
  };

  const abrirModal = (fotos, nome) => {
    setModalFotos({
      aberta: true,
      fotos: fotos || [],
      titulo: `${nome} (${(fotos || []).length} ${(fotos || []).length === 1 ? 'foto' : 'fotos'})`,
      indiceAtual: 0,
    });
  };

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
      <h3 className="text-sm font-bold text-slate-900 mb-3">
        {t('escolha_quarto') || 'Escolha o seu quarto'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tiposQuarto.map((q, idx) => {
          const qId = q.id || q.quarto_id || q.alojamento_quarto_id || q.tipo_quarto_id;
          const qtd =
            quantidades[qId] !== undefined
              ? quantidades[qId]
              : quartoSelecionado === qId
              ? 1
              : 0;
          const isSelected = qtd > 0 || quartoSelecionado === qId;

          return (
            <CartaoQuartoVisual
              key={qId || idx}
              q={q}
              idx={idx}
              isSelected={isSelected}
              qtd={qtd}
              onSelecao={onSelecaoQuarto}
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