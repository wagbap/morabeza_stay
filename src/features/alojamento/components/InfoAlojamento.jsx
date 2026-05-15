import React from 'react';
import { 
  Users, Bed, Bath, Wifi, Wind, Coffee, MapPin, Star, 
  ChevronRight, ChevronLeft, LayoutGrid, Camera, Search 
} from 'lucide-react';
import { TabsNavegacao } from './TabsNavegacao'; // Importação do novo componente


export const InfoAlojamento = () => {
  return (
    <div className="flex-1 w-full bg-white font-sans pb-20">
      {/* BREADCRUMB */}
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-[11px] font-medium text-slate-500">
        <span className="hover:text-blue-900 cursor-pointer">Início</span>
        <ChevronRight size={10} />
        <span className="hover:text-blue-900 cursor-pointer">Experiências</span>
        <ChevronRight size={10} />
        <span className="text-slate-500 font-semibold truncate">Mergulho com Tartarugas</span>
      </nav>




      {/* GALERIA DE IMPACTO (SLIDER) */}
      <div className="relative mb-6">
        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10 group">
          {/* Imagem Principal */}
          <div className="aspect-[16/9] md:aspect-[21/9]">
            <img 
              src="https://images.unsplash.com/photo-1544551763-46a013bb70d5" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt="Mergulho" 
            />
          </div>

          {/* Controles de Navegação */}
          <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="w-11 h-11 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl text-[#003580] hover:bg-white">
              <ChevronLeft size={24} />
            </button>
            <button className="w-11 h-11 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl text-[#003580] hover:bg-white">
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Badge Azul de Categoria */}
          <div className="absolute bottom-6 left-6 bg-[#003580] text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-tighter shadow-lg">
            <LayoutGrid size={14} fill="white" />
            Aventura Premium
          </div>
        </div>

        {/* MINIATURAS (ESTILO DA ÚLTIMA IMAGEM) */}
        <div className="flex gap-4 mt-6 overflow-x-auto no-scrollbar">
          {/* Ativa/Selecionada */}
          <div className="w-24 h-16 md:w-32 md:h-20 rounded-2xl overflow-hidden border-2 border-[#003580] p-0.5 shrink-0">
            <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5" className="w-full h-full object-cover rounded-xl" />
          </div>
          {/* Secundária */}
          <div className="w-24 h-16 md:w-32 md:h-20 rounded-2xl overflow-hidden grayscale opacity-70 hover:opacity-100 transition-all cursor-pointer shrink-0">
            <img src="https://images.unsplash.com/photo-1682687220063-4742bd7fd538" className="w-full h-full object-cover rounded-xl" />
          </div>
          {/* Última com ícone de Câmera/Ver Mais */}
          <div className="w-24 h-16 md:w-32 md:h-20 rounded-2xl overflow-hidden relative grayscale opacity-70 hover:opacity-100 transition-all cursor-pointer shrink-0">
            <img src="https://images.unsplash.com/photo-1582967788606-a171c1080cb0" className="w-full h-full object-cover rounded-xl" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                <Camera size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* HEADER DA INFO */}
      <div className="mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Apartamento Morabeza</h1>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">Apartamento</span>
            </div>
          <div className="flex items-center gap-4 text-sm font-semibold text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-orange-500" /> Ilha do Sal, Santa Maria
            </div>
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-orange-400 text-orange-400" /> 
              <span className="text-slate-900 font-bold">4.9</span> 
              <span className="text-slate-400 font-medium">(85 avaliações)</span>
            </div>
          </div>
        </div>
      </div>




      {/* AMENITIES BAR (LAYOUT CARD HORIZONTAL) */}
      <div className="flex justify-between items-center py-6 border border-slate-100 rounded-2xl px-6 mb-10 overflow-x-auto no-scrollbar gap-8">
        {[
          { icon: Users, label: '4 Hóspedes', sub: 'Máximo 4 pessoas' },
          { icon: Bed, label: '2 Quartos', sub: '1 cama queen, 2 individuais' },
          { icon: Bath, label: '2 Casas de banho', sub: 'Água quente' },
          { icon: Wifi, label: 'Wi-Fi', sub: 'Rápido e gratuito' },
          { icon: Wind, label: 'Ar Condicionado', sub: 'Todos os quartos' },
          { icon: Coffee, label: 'Cozinha', sub: 'Totalmente equipada' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 min-w-fit">
            <div className="text-slate-400 shrink-0">
              <item.icon size={22} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-900 leading-tight whitespace-nowrap">{item.label}</span>
              <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">{item.sub}</span>
            </div>
          </div>
        ))}
      </div>
{/* TABS - AGORA COMO COMPONENTE ISOLADO */}
      <TabsNavegacao activeTab={0} />

      
    </div>
  );
};