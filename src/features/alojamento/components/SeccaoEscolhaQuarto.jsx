import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Bed } from 'lucide-react';

const SeccaoEscolhaQuarto = ({ quartoSelecionado, onSelecaoQuarto, tiposQuarto }) => {
  const { t } = useTranslation();
  const placeholder = "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=200";

  return (
    <div className="mt-6 mb-4 text-left">
      <h3 className="text-sm font-bold text-slate-900 mb-3">{t('escolha_quarto')}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tiposQuarto.map((q, idx) => {
          const isSelected = quartoSelecionado === q.id;
          const precoCalculado = Math.round(Number(q.preco_calculado || 0));
          const imagemQuarto = q.imagem_url || placeholder;

          return (
            <div 
              key={q.id || idx}
              onClick={() => onSelecaoQuarto(q.id, q.nome, precoCalculado)}
              className={`border rounded-xl overflow-hidden cursor-pointer transition-all flex flex-row bg-white items-center h-[96px] ${
                isSelected 
                  ? 'border-blue-600 bg-blue-50/10 ring-1 ring-blue-600' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              
              {/* Lado Esquerdo: Imagem Quadrada Reduzida */}
              <div className="relative w-[80px] h-[80px] shrink-0 overflow-hidden ml-2 rounded-lg bg-slate-50">
                <img 
                  src={imagemQuarto} 
                  alt={q.nome} 
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[7px] font-bold px-1 py-0.5 rounded-sm uppercase tracking-wide scale-90 origin-top-left">
                    {t('mais_escolhido')}
                  </div>
                )}
              </div>

              {/* Lado Direito: Info + Ícones minimalistas Gray */}
              <div className="p-2.5 flex-1 flex flex-col justify-between h-full relative">
                
                {/* Indicador de Check circular tipo Booking */}
                <div className="absolute top-2.5 right-2.5">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="pr-4">
                  <h4 className="text-[11px] font-bold text-slate-900 leading-tight truncate">{q.nome}</h4>
                  <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Users size={11} className="text-slate-400" /> {q.capacidade_quarto || 2} {t('hospedes')}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Bed size={11} className="text-slate-400" /> {q.camas || 1} {Number(q.camas) === 1 ? t('cama') : t('camas')}
                    </span>
                  </div>
                </div>

                {/* Preço Dinâmico CVE */}
                <div className="flex items-baseline gap-0.5 leading-none">
                  <span className="text-xs font-black text-slate-900">{precoCalculado.toLocaleString('pt-PT')} CVE</span>
                  <span className="text-[9px] font-semibold text-slate-400">{t('por_noite_curto')}</span>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeccaoEscolhaQuarto;