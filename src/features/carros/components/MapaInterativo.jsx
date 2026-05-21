// MapaInterativo.jsx
import React from 'react';
import { X } from 'lucide-react';

const MapaInterativo = ({ isOpen, onClose, dadosAlojamentos }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
      >
        <X size={24} />
      </button>
      <div className="text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Mapa Interativo das Ilhas</h2>
        <p className="text-slate-400">Mapa completo em desenvolvimento...</p>
      </div>
    </div>
  );
};

export default MapaInterativo;