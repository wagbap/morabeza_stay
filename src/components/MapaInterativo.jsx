import React from 'react';
import { X, Monitor, Landmark } from 'lucide-react';

const MapaInterativo = ({ isOpen, onClose, dadosAlojamentos }) => {
  if (!isOpen) return null;

  // 1. Definição das 10 ilhas com posições geográficas aproximadas 🗺️
  const ilhas = [
    // Barlavento (Norte)
    { id: 'santo_antao', nome: 'Santo Antão', top: '15%', left: '10%' },
    { id: 'sao_vicente', nome: 'São Vicente', top: '22%', left: '22%' },
    { id: 'santa_luzia', nome: 'Santa Luzia', top: '25%', left: '32%' },
    { id: 'sao_nicolau', nome: 'São Nicolau', top: '30%', left: '45%' },
    { id: 'sal', nome: 'Sal', top: '22%', left: '78%' },
    { id: 'boa_vista', nome: 'Boa Vista', top: '42%', left: '82%' },
    
    // Sotavento (Sul)
    { id: 'maio', nome: 'Maio', top: '68%', left: '75%' },
    { id: 'santiago', nome: 'Santiago', top: '78%', left: '60%' },
    { id: 'fogo', nome: 'Fogo', top: '82%', left: '35%' },
    { id: 'brava', nome: 'Brava', top: '85%', left: '20%' },
  ];

  const contarPorIlha = (nomeIlha) => {
    return dadosAlojamentos.filter(a => 
      a.localizacao?.toLowerCase().includes(nomeIlha.toLowerCase())
    ).length;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Fundo Branco/Cinza Claro conforme pedido ⚪ */}
      <div className="relative w-full max-w-6xl aspect-video bg-[#f8fafc] rounded-[40px] border border-gray-200 overflow-hidden shadow-2xl">
        
        {/* Botão de Fechar */}
        <button onClick={onClose} className="absolute top-8 right-8 z-50 p-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-all">
          <X size={24} />
        </button>

        {/* Textura suave de fundo */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/ocean-texture.png')]"></div>

        <div className="relative w-full h-full p-12">
          {ilhas.map((ilha) => {
            const total = contarPorIlha(ilha.nome);
            return (
              <div 
                key={ilha.id}
                className="absolute flex flex-col items-center group transition-all"
                style={{ top: ilha.top, left: ilha.left }}
              >
                {/* 🔵 Círculo azul com o número de opções */}
                <div className="mb-2 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center justify-center shadow-lg min-w-[24px]">
                  {total}
                </div>
                
                {/* Ícone Estilo "Monitor" da imagem 🖥️ */}
                <div className="bg-white p-2 rounded-lg border-2 border-gray-800 shadow-md group-hover:bg-gray-800 group-hover:text-white transition-all duration-300">
                  <Monitor size={24} strokeWidth={2.5} />
                </div>
                
                <span className="mt-2 text-[10px] font-black text-gray-800 uppercase tracking-tighter opacity-80 group-hover:opacity-100">
                  {ilha.nome}
                </span>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-10 left-12 border-l-4 border-blue-600 pl-4">
          <h2 className="text-gray-900 font-black uppercase tracking-[0.2em] text-sm">Arquipélago de Cabo Verde</h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Mapa Interativo | MorabezaStay</p>
        </div>
      </div>
    </div>
  );
};

export default MapaInterativo;