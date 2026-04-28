import React from 'react';

const CarrosHero = () => {
  return (
    <div className="relative h-[450px] w-full overflow-hidden">
      {/* Imagem focada em estrada/viagem para o contexto de carros */}
      <img 
        src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2000" 
        className="absolute inset-0 w-full h-full object-cover"
        alt="Aluguer de Carros Cabo Verde"
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 to-blue-900/20 backdrop-blur-[1px]"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase italic">
          Aluguer de Carros em Santiago
        </h1>
        <p className="text-white/90 text-lg md:text-xl max-w-2xl font-medium">
          Encontre o carro ideial para explorar a ilha em conforto
        </p>
      </div>
    </div>
  );
};

export default CarrosHero;