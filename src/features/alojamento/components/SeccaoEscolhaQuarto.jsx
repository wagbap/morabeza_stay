import React from 'react';
import { Users, Bed } from 'lucide-react';

const SeccaoEscolhaQuarto = ({ quartoSelecionado, onSelecaoQuarto, precoNoiteBase }) => {
  const quartos = [
    {
      id: 'casal',
      titulo: 'Quarto casal',
      detalhe: '1 cama queen',
      capacidade: '2 hóspedes',
      imagem: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=200',
      badge: 'Mais escolhido',
      multiplicador: 2 
    },
    {
      id: 'twin',
      titulo: 'Quarto twin',
      detalhe: '2 camas individuais',
      capacidade: '2 hóspedes',
      imagem: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=200',
      badge: null,
      multiplicador: 1 
    },
    {
      id: 'solteiro',
      titulo: 'Quarto solteiro',
      detalhe: '1 cama individual',
      capacidade: '1 hóspede',
      imagem: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=200',
      badge: null,
      multiplicador: 0.82 
    }
  ];

  return (
    <div className="mt-6 mb-4 text-left">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Escolha o seu quarto</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {quartos.map((q) => {
          const isSelected = quartoSelecionado === q.id;
          const precoCalculado = Math.round(precoNoiteBase * q.multiplicador);

          return (
            <div 
              key={q.id}
              onClick={() => onSelecaoQuarto(q.id, q.titulo, precoCalculado)}
              className={`border rounded-xl overflow-hidden cursor-pointer transition-all flex flex-row bg-white items-center h-[96px] ${
                isSelected 
                  ? 'border-blue-600 bg-blue-50/10 ring-1 ring-blue-600' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              
              {/* Lado Esquerdo: Imagem Quadrada Compacta (80x80px) com cantos suaves */}
              <div className="relative w-[80px] h-[80px] shrink-0 overflow-hidden ml-2 rounded-lg bg-slate-50">
                <img 
                  src={q.imagem} 
                  alt={q.titulo} 
                  className="w-full h-full object-cover"
                />
                {q.badge && (
                  <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[7px] font-bold px-1 py-0.5 rounded-sm uppercase tracking-wide scale-90 origin-top-left">
                    {q.badge}
                  </div>
                )}
              </div>

              {/* Lado Direito: Info + Ícones minimalistas cinzentos */}
              <div className="p-2.5 flex-1 flex flex-col justify-between h-full relative">
                
                {/* Check Circle Premium estilo Booking */}
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

                {/* Conteúdo com os ícones Gray e Alinhamento Compacto */}
                <div className="pr-4">
                  <h4 className="text-[11px] font-bold text-slate-900 leading-tight truncate">{q.titulo}</h4>
                  <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Users size={11} className="text-slate-400" /> {q.capacidade}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Bed size={11} className="text-slate-400" /> {q.detalhe}
                    </span>
                  </div>
                </div>

                {/* Preço Dinâmico Otimizado */}
                <div className="flex items-baseline gap-0.5 leading-none">
                  <span className="text-xs font-black text-slate-900">{precoCalculado.toLocaleString('pt-PT')} CVE</span>
                  <span className="text-[9px] font-semibold text-slate-400">/noite</span>
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