// src/components/AlojamentoRegisto/Comodidades.jsx
import React, { useState, useEffect } from 'react';
import { Check, Wifi, Coffee, Tv, Utensils, Snowflake, Wind, Dumbbell, Car, Waves, Volume2, Fan, Flame, Refrigerator, Mic, Bath, Shirt, Baby, DoorOpen, Lock, ShoppingBag, Sun } from 'lucide-react';

// Lista completa de comodidades disponíveis
export const COMODIDADES_PADRAO = [
  { id: 1, nome: 'Wi-Fi gratuito', icone: 'wifi', categoria: 'Internet e tecnologia' },
  { id: 2, nome: 'Ar condicionado', icone: 'snowflake', categoria: 'Climatização' },
  { id: 3, nome: 'TV ecrã plano', icone: 'tv', categoria: 'Entretenimento' },
  { id: 4, nome: 'Pequeno-almoço', icone: 'coffee', categoria: 'Alimentação' },
  { id: 5, nome: 'Cozinha equipada', icone: 'utensils', categoria: 'Cozinha' },
  { id: 6, nome: 'Piscina', icone: 'waves', categoria: 'Lazer' },
  { id: 7, nome: 'Estacionamento grátis', icone: 'car', categoria: 'Estacionamento' },
  { id: 8, nome: 'Vista para o mar', icone: 'sun', categoria: 'Vistas' },
  { id: 9, nome: 'Animais permitidos', icone: 'baby', categoria: 'Políticas' },
  { id: 10, nome: 'Ginásio', icone: 'dumbbell', categoria: 'Lazer' },
  { id: 11, nome: 'Máquina de café', icone: 'coffee', categoria: 'Cozinha' },
  { id: 12, nome: 'Frigorífico', icone: 'refrigerator', categoria: 'Cozinha' },
  { id: 13, nome: 'Micro-ondas', icone: 'mic', categoria: 'Cozinha' },
  { id: 14, nome: 'Máquina de lavar roupa', icone: 'shirt', categoria: 'Utilidades' },
  { id: 15, nome: 'Berço', icone: 'baby', categoria: 'Família' },
  { id: 16, nome: 'Ventilador', icone: 'wind', categoria: 'Climatização' },
  { id: 17, nome: 'Aquecimento', icone: 'flame', categoria: 'Climatização' },
  { id: 18, nome: 'Secador de cabelo', icone: 'wind', categoria: 'Casa de banho' },
  { id: 19, nome: 'Ferro de engomar', icone: 'shirt', categoria: 'Utilidades' },
  { id: 20, nome: 'Cofre', icone: 'lock', categoria: 'Segurança' },
  { id: 21, nome: 'Churrasqueira', icone: 'flame', categoria: 'Lazer' },
  { id: 22, nome: 'Varanda', icone: 'doorOpen', categoria: 'Espaço exterior' },
  { id: 23, nome: 'Jardim', icone: 'sun', categoria: 'Espaço exterior' },
  { id: 24, nome: 'Elevador', icone: 'doorOpen', categoria: 'Acessibilidade' },
  { id: 25, nome: 'Toalhas e roupa de cama', icone: 'shirt', categoria: 'Utilidades' },
  { id: 26, nome: 'Smart TV', icone: 'tv', categoria: 'Entretenimento' },
  { id: 27, nome: 'Música ambiente', icone: 'volume2', categoria: 'Entretenimento' },
  { id: 28, nome: 'Spa', icone: 'waves', categoria: 'Lazer' },
  { id: 29, nome: 'Campo de ténis', icone: 'dumbbell', categoria: 'Desporto' },
  { id: 30, nome: 'Serviço de quarto', icone: 'shoppingBag', categoria: 'Serviços' },
];

const getIcone = (iconeNome) => {
  const icons = {
    wifi: <Wifi size={20} />,
    snowflake: <Snowflake size={20} />,
    tv: <Tv size={20} />,
    coffee: <Coffee size={20} />,
    utensils: <Utensils size={20} />,
    waves: <Waves size={20} />,
    car: <Car size={20} />,
    sun: <Sun size={20} />,
    baby: <Baby size={20} />,
    dumbbell: <Dumbbell size={20} />,
    wind: <Wind size={20} />,
    flame: <Flame size={20} />,
    refrigerator: <Refrigerator size={20} />,
    mic: <Mic size={20} />,
    shirt: <Shirt size={20} />,
    lock: <Lock size={20} />,
    doorOpen: <DoorOpen size={20} />,
    volume2: <Volume2 size={20} />,
    fan: <Fan size={20} />,
    shoppingBag: <ShoppingBag size={20} />,
  };
  return icons[iconeNome] || <Check size={20} />;
};

const Comodidades = ({ comodidadesSelecionadas, onComodidadeToggle, readOnly = false }) => {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');
  const [busca, setBusca] = useState('');
  
  // Agrupar comodidades por categoria
  const categorias = ['todas', ...new Set(COMODIDADES_PADRAO.map(c => c.categoria))];
  
  const comodidadesFiltradas = COMODIDADES_PADRAO.filter(com => {
    if (categoriaAtiva !== 'todas' && com.categoria !== categoriaAtiva) return false;
    if (busca && !com.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });
  
  const isSelecionada = (id) => comodidadesSelecionadas.some(c => c.id === id);
  
  return (
    <div className="space-y-6">
      {/* Barra de pesquisa */}
      <div className="relative">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar comodidades..."
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ce4] focus:border-transparent"
          disabled={readOnly}
        />
        <Wifi size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      
      {/* Categorias */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
        {categorias.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoriaAtiva(cat)}
            disabled={readOnly}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              categoriaAtiva === cat 
                ? 'bg-[#006ce4] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat === 'todas' ? 'Todas' : cat}
            {cat !== 'todas' && (
              <span className="ml-2 text-xs opacity-70">
                ({COMODIDADES_PADRAO.filter(c => c.categoria === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Grade de comodidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {comodidadesFiltradas.map(com => (
          <button
            key={com.id}
            type="button"
            onClick={() => !readOnly && onComodidadeToggle(com)}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isSelecionada(com.id)
                ? 'border-[#006ce4] bg-blue-50 text-[#006ce4]'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <div className={`${isSelecionada(com.id) ? 'text-[#006ce4]' : 'text-gray-500'}`}>
              {getIcone(com.icone)}
            </div>
            <span className="text-sm flex-1 text-left">{com.nome}</span>
            {isSelecionada(com.id) && <Check size={16} className="text-[#006ce4]" />}
          </button>
        ))}
      </div>
      
      {/* Contagem e resumo */}
      {comodidadesSelecionadas.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Check size={16} /> Comodidades selecionadas ({comodidadesSelecionadas.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {comodidadesSelecionadas.map(com => (
              <span key={com.id} className="px-3 py-1 bg-white border rounded-full text-sm flex items-center gap-1">
                {getIcone(com.icone)}
                {com.nome}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {comodidadesSelecionadas.length === 0 && !readOnly && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-700 text-sm">Nenhuma comodidade selecionada. Selecione as comodidades disponíveis na sua propriedade.</p>
        </div>
      )}
    </div>
  );
};

export default Comodidades;