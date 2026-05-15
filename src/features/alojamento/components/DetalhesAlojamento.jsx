import React from 'react';
import { 
  Users, Bed, Bath, Wifi, Wind, Coffee, 
  ChevronRight, Star, Heart, Share2, MapPin, 
  Calendar, CheckCircle, Search 
} from 'lucide-react';

const DetalheAlojamento = () => {
  return (
    <div className="bg-white min-h-screen font-sans text-slate-900">
      {/* --- HEADER / NAV --- */}
      <nav className="flex items-center justify-between px-12 py-4 border-b border-slate-100">
        <div className="flex items-center gap-1">
          <div className="text-orange-500 text-2xl font-bold">Morabeza<span className="text-blue-900">Stay</span></div>
        </div>
        <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#" className="text-blue-900 border-b-2 border-blue-900 pb-1">Alojamentos</a>
          <a href="#">Carros</a>
          <a href="#">Experiências</a>
        </div>
        <div className="flex items-center gap-4">
          <Heart size={20} className="text-slate-600" />
          <div className="flex items-center gap-1 text-sm uppercase">
            <span>PT</span> <ChevronRight size={14} className="rotate-90" />
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
            <Users size={20} className="text-slate-400" />
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-8">
        {/* --- TÍTULO E TOPO --- */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button className="text-blue-700 text-sm flex items-center gap-2 mb-4">
              <span>← Voltar para resultados</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Apartamento Morabeza</h1>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">Apartamento</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-1 font-semibold">
                <MapPin size={14} className="text-orange-500" /> Praia, Cidade da Praia, Ilha de Santiago
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-orange-500 text-orange-500" /> 
                <span className="font-bold">4.8</span> (120 avaliações)
              </div>
              <span className="text-slate-400">|</span>
              <div className="flex items-center gap-1 italic text-slate-500">
                <CheckCircle size={14} /> Superhost
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-lg text-sm">
              <Share2 size={16} /> Compartilhar
            </button>
            <button className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-lg text-sm">
              <Heart size={16} /> Salvar
            </button>
          </div>
        </div>

        {/* --- GALERIA --- */}
        <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px] rounded-2xl overflow-hidden mb-12">
          <div className="col-span-2 row-span-2 relative group">
            <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" className="w-full h-full object-cover" alt="Sala" />
          </div>
          <div className="col-span-1 row-span-1">
            <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688" className="w-full h-full object-cover" alt="Quarto" />
          </div>
          <div className="col-span-1 row-span-1">
            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750" className="w-full h-full object-cover" alt="Vista" />
          </div>
          <div className="col-span-1 row-span-1">
            <img src="https://images.unsplash.com/photo-1556911220-e15224bbafb0" className="w-full h-full object-cover" alt="Cozinha" />
          </div>
          <div className="col-span-1 row-span-1 relative">
            <img src="https://images.unsplash.com/photo-1493809842364-78817add7ffb" className="w-full h-full object-cover" alt="Varanda" />
            <button className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow text-xs font-bold flex items-center gap-2">
              <Search size={14} /> Ver todas as fotos
            </button>
          </div>
        </div>

        {/* --- CONTEÚDO PRINCIPAL --- */}
        <div className="flex gap-12">
          {/* LADO ESQUERDO: INFO */}
          <div className="flex-1">
            {/* AMENITIES QUICK BAR */}
            <div className="flex justify-between py-6 border-b border-t border-slate-100 mb-8">
              <div className="flex flex-col gap-1 items-center">
                <Users className="text-slate-400" />
                <span className="text-xs font-bold">4 Hóspedes</span>
                <span className="text-[10px] text-slate-400 uppercase">Máximo 4 pessoas</span>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <Bed className="text-slate-400" />
                <span className="text-xs font-bold">2 Quartos</span>
                <span className="text-[10px] text-slate-400 uppercase">1 cama queen, 2 individuais</span>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <Bath className="text-slate-400" />
                <span className="text-xs font-bold">2 Casas de banho</span>
                <span className="text-[10px] text-slate-400 uppercase">Água quente</span>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <Wifi className="text-slate-400" />
                <span className="text-xs font-bold">Wi-Fi</span>
                <span className="text-[10px] text-slate-400 uppercase">Rápido e gratuito</span>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <Wind className="text-slate-400" />
                <span className="text-xs font-bold">Ar Condicionado</span>
                <span className="text-[10px] text-slate-400 uppercase">Todos os quartos</span>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <Coffee className="text-slate-400" />
                <span className="text-xs font-bold">Cozinha</span>
                <span className="text-[10px] text-slate-400 uppercase">Totalmente equipada</span>
              </div>
            </div>

            {/* SELEÇÃO DE QUARTO */}
            <h3 className="font-bold text-lg mb-6">Escolha o seu quarto</h3>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* Card Selecionado */}
              <div className="border-2 border-blue-600 rounded-xl overflow-hidden relative p-2">
                <span className="absolute top-2 left-2 bg-green-700 text-white text-[10px] px-2 py-1 rounded">Mais escolhido</span>
                <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457" className="w-full h-32 object-cover rounded-lg mb-4" />
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm">Quarto casal</h4>
                    <p className="text-[10px] text-slate-500">2 hóspedes</p>
                    <p className="text-[10px] text-slate-500">1 cama queen</p>
                    <div className="mt-2 font-bold text-sm">85€ <span className="font-normal text-xs">/ noite</span></div>
                  </div>
                  <div className="bg-blue-600 rounded-full p-1"><CheckCircle size={14} className="text-white" /></div>
                </div>
              </div>
              {/* Outros cards seguem o mesmo padrão cinza */}
            </div>

            {/* TABBAR */}
            <div className="flex gap-8 border-b border-slate-100 mb-8 text-sm text-slate-500">
              <button className="pb-4 border-b-2 border-blue-900 font-bold text-slate-900">Descrição</button>
              <button className="pb-4">Comodidades</button>
              <button className="pb-4">Avaliações (120)</button>
              <button className="pb-4">Localização</button>
              <button className="pb-4">Regras da casa</button>
            </div>
            
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              Apartamento moderno e acolhedor com vista deslumbrante para o mar, localizado na melhor zona da Praia. 
              Perfeito para famílias, casais ou viajantes a negócios... <span className="text-blue-900 font-bold underline cursor-pointer">Ler mais</span>
            </p>
          </div>

          {/* LADO DIREITO: BOOKING CARD */}
          <div className="w-[400px]">
            <div className="border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-8">
              <div className="flex justify-between items-end mb-6">
                <div className="text-3xl font-bold">85€ <span className="text-base font-normal text-slate-500">/ noite</span></div>
                <div className="flex items-center gap-1 text-sm font-bold">
                  <Star size={14} className="fill-orange-500 text-orange-500" /> 4.8 <span className="font-normal text-slate-400">(120 avaliações)</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                <div className="flex border-b border-slate-200">
                  <div className="flex-1 p-3 border-r border-slate-200">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Check-in</label>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} /> 12 Dez, 2024
                    </div>
                  </div>
                  <div className="flex-1 p-3">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Check-out</label>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} /> 16 Dez, 2024
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Hóspedes</label>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2"><Users size={14} /> 2 hóspedes</div>
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              </div>

              <button className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl mb-4 hover:bg-blue-800 transition-colors">
                Ver disponibilidade
              </button>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle className="text-green-600 mt-1" size={18} />
                <div>
                  <h5 className="text-sm font-bold text-green-800">Cancelamento gratuito</h5>
                  <p className="text-xs text-green-700">Até 48 horas antes do check-in</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetalheAlojamento;