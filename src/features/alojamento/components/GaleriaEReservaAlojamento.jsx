import React, { useState } from 'react';
import { 
  Heart, Share, Star, MapPin, ThumbsUp, ChevronDown 
} from 'lucide-react';

const GaleriaEReserva = ({ alojamento }) => {
  const [loading, setLoading] = useState(false);

  // Fallback para dados caso não venham da BD
  const hotel = {
    titulo: alojamento?.titulo || "Alojamento Maravilha",
    localizacao: alojamento?.localizacao || "Cabo Verde",
    estrelas: alojamento?.estrelas || 4.5,
    fotoPrincipal: alojamento?.imagem_url 
      ? `https://welovepalop.com/api/uploads/${alojamento.imagem_url}` 
      : "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000",
  };

  // Fotos de exemplo para preencher a galeria estilo Booking (enquanto não tens na BD)
  const fotosGaleria = [
    hotel.fotoPrincipal,
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600",
    "https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=600",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600",
    "https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=600"
  ];

  const handleReserva = () => {
    setLoading(true);
    alert('A redirecionar para o pagamento...');
    // Aqui viria a lógica para abrir o modal de pagamento ou ir para checkout
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans bg-white">
      
      {/* --- CABEÇALHO (Estilo Referência) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#003580] text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Genius</span>
            <div className="flex text-amber-400">
              {[...Array(4)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <span className="text-amber-400"><ThumbsUp size={14} fill="currentColor" /></span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            {hotel.titulo}
          </h1>
          
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600 mt-2">
            <MapPin size={16} className="text-[#006ce4]" />
            <span>{hotel.localizacao}</span>
            <span className="text-[#006ce4] font-bold cursor-pointer hover:text-blue-800">Excelente localização — mostrar mapa</span>
          </div>
        </div>

        {/* --- AÇÕES E BOTÃO RESERVAR (Estilo Referência) --- */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button className="text-[#006ce4] p-2 hover:bg-blue-50 rounded-full transition">
            <Heart size={22} />
          </button>
          <button className="text-[#006ce4] p-2 hover:bg-blue-50 rounded-full transition">
            <Share size={22} />
          </button>
          <button 
            onClick={handleReserva}
            disabled={loading}
            className="flex-1 md:flex-none bg-[#006ce4] text-white px-5 py-2.5 rounded-sm font-bold text-sm hover:bg-[#0056b3] transition duration-150 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'A processar...' : 'Reserve agora'}
          </button>
        </div>
      </div>

      {/* --- GALERIA DE FOTOS (Layout exato da referência) --- */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[350px] md:h-[420px] rounded-lg overflow-hidden shadow-md mb-8">
        
        {/* Foto Principal (Esquerda, Grande) */}
        <div className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden">
          <img 
            src={fotosGaleria[0]} 
            alt="Vista principal do quarto" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Fotos Secundárias (Direita, Quadradas) */}
        <div className="col-span-1 row-span-1 overflow-hidden">
          <img src={fotosGaleria[1]} alt="Piscina" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
        </div>
        <div className="col-span-1 row-span-1 overflow-hidden">
          <img src={fotosGaleria[2]} alt="Quarto Vista" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
        </div>
        <div className="col-span-1 row-span-1 overflow-hidden">
          <img src={fotosGaleria[3]} alt="Casa de banho" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
        </div>

        {/* Última Foto com Overlay (+ Fotos) */}
        <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
          <img src={fotosGaleria[4]} alt="Área comum" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-2">
            <span className="font-bold text-lg">+12</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-center">fotos</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GaleriaEReserva;