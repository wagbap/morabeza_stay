import React from 'react';
import CardExperiencia from './CardExperiencia';

const ExperiencesSection = () => {
  const experiencias = [
    {
      id: 1,
      titulo: "Aluguel de Carros",
      local: "Passeios Náuticos - 3 lugares",
      duracao: "Flexível",
      preco: "8000",
      rating: "4.9",
      reviews: "118",
      imagem: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=500"
    },
    {
      id: 2,
      titulo: "Tour Cidade Velha",
      local: "Cidade Velha",
      duracao: "4 horas",
      preco: "5000",
      rating: "4.8",
      reviews: "57",
      imagem: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=500"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto py-16 px-6">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">
          Adicione ainda mais conforto à sua estadia
        </h2>
        <div className="h-1.5 w-20 bg-blue-600 mt-2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Grid de Experiências */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiencias.map((exp) => (
            <CardExperiencia key={exp.id} {...exp} />
          ))}
        </div>

        {/* Lado Direito: Card de Destaque */}
        <div className="relative rounded-3xl overflow-hidden group h-full min-h-[450px] shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt="Passeios Populares"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 flex flex-col justify-end">
            <h3 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">Passeios Populares</h3>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-3 py-1 rounded-full w-fit mb-4 uppercase">
              Passeios Náuticos
            </span>
            <p className="text-gray-200 text-sm mb-8 font-medium">
              Caminhada pela deslumbrante Serra Malagueta com vistas espetaculares.
            </p>
            <button className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-green-500/20">
              Reservar Passeios <span>&gt;</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperiencesSection;