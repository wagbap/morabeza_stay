import React from 'react';

export default function MeusImoveis() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Meus Anúncios</h1>
        <button className="bg-[#006ce4] text-white px-4 py-2 rounded-lg font-medium">+ Novo Anúncio</button>
      </div>
      {/* Tabela ou Lista de Imóveis aqui */}
    </div>
  );
}