import React, { useState } from 'react';
import { 
  MapPin, Star, Share, Heart, Wifi, Snowflake, 
  Tv, Coffee, Utensils, CigaretteOff, ShieldCheck 
} from 'lucide-react';

const DetalhesAlojamento = ({ alojamento }) => {
  const [selectedDates, setSelectedDates] = useState({ checkIn: '', checkOut: '' });

  // Exemplo de dados (substituir pelos dados da tua API/DB)
  const hotel = {
    titulo: alojamento?.titulo || "Vincci Baixa Suites Apartments",
    localizacao: alojamento?.localizacao || "Rua do Comércio, Lisboa",
    preco: alojamento?.preco_noite || 150,
    estrelas: alojamento?.estrelas || 4.5,
    descricao: alojamento?.descricao || "Localização excelente no coração da cidade...",
    imagens: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000", // Principal
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=500",
      "https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=500",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=500",
      "https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=500"
    ]
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 bg-white font-sans">
      {/* CABEÇALHO */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">Genius</span>
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{hotel.titulo}</h1>
          <div className="flex items-center gap-1 text-blue-600 mt-2 text-sm">
            <MapPin size={16} />
            <span className="underline cursor-pointer">{hotel.localizacao} — mostrar mapa</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="text-blue-600 p-2 hover:bg-gray-100 rounded-full"><Heart size={24} /></button>
          <button className="text-blue-600 p-2 hover:bg-gray-100 rounded-full"><Share size={24} /></button>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700">Reserve agora</button>
        </div>
      </div>

      {/* GALERIA DE IMAGENS (5 IMAGENS) */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[450px] mb-8 overflow-hidden rounded-xl">
        <div className="col-span-2 row-span-2 relative group cursor-pointer">
          <img src={hotel.imagens[0]} className="w-full h-full object-cover group-hover:brightness-90 transition" alt="Principal" />
        </div>
        <div className="col-span-1 row-span-1">
          <img src={hotel.imagens[1]} className="w-full h-full object-cover" alt="Extra 1" />
        </div>
        <div className="col-span-1 row-span-1">
          <img src={hotel.imagens[2]} className="w-full h-full object-cover" alt="Extra 2" />
        </div>
        <div className="col-span-1 row-span-1">
          <img src={hotel.imagens[3]} className="w-full h-full object-cover" alt="Extra 3" />
        </div>
        <div className="col-span-1 row-span-1 relative">
          <img src={hotel.imagens[4]} className="w-full h-full object-cover" alt="Extra 4" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold cursor-pointer">
            mais 15 fotografias
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* DESCRIÇÃO E COMODIDADES */}
        <div className="lg:col-span-2">
          <p className="text-gray-700 leading-relaxed mb-8">
            {hotel.descricao}
          </p>

          <h3 className="text-xl font-bold mb-4">Comodidades mais populares</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Feature icon={<Wifi size={20}/>} text="Acesso Wi-Fi gratuito" />
            <Feature icon={<Snowflake size={20}/>} text="Ar condicionado" />
            <Feature icon={<Utensils size={20}/>} text="Cozinha" />
            <Feature icon={<Coffee size={20}/>} text="Muito bom pequeno-almoço" />
            <Feature icon={<CigaretteOff size={20}/>} text="Quartos para não fumadores" />
            <Feature icon={<Tv size={20}/>} text="Televisão de ecrã plano" />
          </div>
        </div>

        {/* CARD DE RESERVA (O que "cria mais campos") */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 h-fit">
          <h3 className="text-lg font-bold mb-4">Destaques da propriedade</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <MapPin className="text-blue-600" />
              <p className="text-sm font-semibold text-gray-800">Localização excelente (9,8)</p>
            </div>
            <div className="flex gap-3">
              <Coffee className="text-blue-600" />
              <p className="text-sm text-gray-700 font-semibold">Pequeno-almoço muito bom!</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Preço por noite</p>
              <p className="text-2xl font-bold text-gray-900">{hotel.preco} CVE</p>
              
              <div className="mt-4 space-y-2">
                <input type="date" className="w-full p-2 border rounded text-sm" placeholder="Check-in" />
                <input type="date" className="w-full p-2 border rounded text-sm" placeholder="Check-out" />
                <select className="w-full p-2 border rounded text-sm">
                  <option>1 Adulto</option>
                  <option selected>2 Adultos</option>
                </select>
              </div>

              <button className="w-full bg-blue-600 text-white mt-4 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                Vou reservar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-componente para as Comodidades
const Feature = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-gray-700 text-sm">
    <div className="text-green-600">{icon}</div>
    <span>{text}</span>
  </div>
);

export default DetalhesAlojamento;