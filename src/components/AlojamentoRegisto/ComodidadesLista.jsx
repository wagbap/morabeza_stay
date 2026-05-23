// src/components/AlojamentoRegisto/ComodidadesLista.jsx
import React, { useState } from 'react';
import { 
  Wifi, Coffee, Tv, Utensils, Snowflake, Waves, Car, Sun, 
  Baby, Dumbbell, Wind, Flame, Refrigerator, Mic, Shirt, 
  Lock, DoorOpen, Volume2, Fan, ShoppingBag, Check, ChevronDown, 
  ChevronUp, Grid, List, Search
} from 'lucide-react';

// Mapeamento de ícones
const getIcone = (iconeNome) => {
  const icons = {
    wifi: <Wifi size={18} />,
    snowflake: <Snowflake size={18} />,
    tv: <Tv size={18} />,
    coffee: <Coffee size={18} />,
    utensils: <Utensils size={18} />,
    waves: <Waves size={18} />,
    car: <Car size={18} />,
    sun: <Sun size={18} />,
    baby: <Baby size={18} />,
    dumbbell: <Dumbbell size={18} />,
    wind: <Wind size={18} />,
    flame: <Flame size={18} />,
    refrigerator: <Refrigerator size={18} />,
    mic: <Mic size={18} />,
    shirt: <Shirt size={18} />,
    lock: <Lock size={18} />,
    doorOpen: <DoorOpen size={18} />,
    volume2: <Volume2 size={18} />,
    fan: <Fan size={18} />,
    shoppingBag: <ShoppingBag size={18} />,
  };
  return icons[iconeNome] || <Check size={18} />;
};

// Categorias padrão
const CATEGORIAS = {
  'Internet e tecnologia': { icone: <Wifi size={16} />, cor: 'blue' },
  'Climatização': { icone: <Snowflake size={16} />, cor: 'cyan' },
  'Entretenimento': { icone: <Tv size={16} />, cor: 'purple' },
  'Alimentação': { icone: <Coffee size={16} />, cor: 'orange' },
  'Cozinha': { icone: <Utensils size={16} />, cor: 'amber' },
  'Lazer': { icone: <Waves size={16} />, cor: 'teal' },
  'Estacionamento': { icone: <Car size={16} />, cor: 'gray' },
  'Vistas': { icone: <Sun size={16} />, cor: 'yellow' },
  'Políticas': { icone: <Baby size={16} />, cor: 'pink' },
  'Utilidades': { icone: <Shirt size={16} />, cor: 'indigo' },
  'Casa de banho': { icone: <Wind size={16} />, cor: 'cyan' },
  'Segurança': { icone: <Lock size={16} />, cor: 'red' },
  'Espaço exterior': { icone: <Sun size={16} />, cor: 'green' },
  'Acessibilidade': { icone: <DoorOpen size={16} />, cor: 'purple' },
  'Desporto': { icone: <Dumbbell size={16} />, cor: 'orange' },
  'Serviços': { icone: <ShoppingBag size={16} />, cor: 'blue' },
};

const ComodidadesLista = ({ 
  comodidades, 
  className = "", 
  showEmpty = true,
  compact = false,
  showSearch = true,
  showCategories = true,
  maxItems = 0,
  onVerMais
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, compact

  // Filtrar comodidades por busca
  const comodidadesFiltradas = comodidades.filter(com => 
    com.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar por categoria
  const comodidadesPorCategoria = comodidadesFiltradas.reduce((acc, com) => {
    const categoria = com.categoria || 'Outras';
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(com);
    return acc;
  }, {});

  // Ordenar categorias
  const categoriasOrdenadas = Object.keys(comodidadesPorCategoria).sort();

  // Limitar itens se necessário
  const totalItens = comodidadesFiltradas.length;
  const shouldTruncate = maxItems > 0 && totalItens > maxItems && !expanded;
  const itensToShow = shouldTruncate ? maxItems : totalItens;

  if (!comodidades || comodidades.length === 0) {
    if (!showEmpty) return null;
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
          <Wifi size={24} className="text-gray-400" />
        </div>
        <p className="text-gray-400 text-sm">Nenhuma comodidade adicionada</p>
        <p className="text-gray-300 text-xs mt-1">Adicione comodidades para atrair mais hóspedes</p>
      </div>
    );
  }

  // Renderização compacta (linha única)
  if (compact) {
    return (
      <div className={`flex flex-wrap gap-1.5 ${className}`}>
        {comodidades.slice(0, 8).map(com => (
          <span key={com.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
            {getIcone(com.icone)}
            {com.nome}
          </span>
        ))}
        {comodidades.length > 8 && (
          <span className="text-xs text-gray-400">
            +{comodidades.length - 8}
          </span>
        )}
      </div>
    );
  }

  // Renderização em lista
  if (viewMode === 'list') {
    return (
      <div className={`space-y-2 ${className}`}>
        {showSearch && comodidades.length > 6 && (
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar comodidades..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#006ce4]"
            />
          </div>
        )}
        
        <div className="divide-y divide-gray-100">
          {comodidadesFiltradas.slice(0, itensToShow).map(com => (
            <div key={com.id} className="flex items-center gap-3 py-2">
              <div className="w-7 text-gray-400">{getIcone(com.icone)}</div>
              <span className="text-sm text-gray-700 flex-1">{com.nome}</span>
              <span className="text-xs text-gray-400">{com.categoria}</span>
            </div>
          ))}
        </div>
        
        {shouldTruncate && (
          <button
            onClick={() => setExpanded(true)}
            className="text-sm text-[#006ce4] hover:underline mt-2 flex items-center gap-1"
          >
            Ver mais {totalItens - maxItems} comodidades <ChevronDown size={14} />
          </button>
        )}
      </div>
    );
  }

  // Renderização em grid (padrão)
  return (
    <div className={className}>
      {/* Barra de ferramentas */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {comodidades.length} {comodidades.length === 1 ? 'comodidade' : 'comodidades'}
          </span>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Visualização em grade"
          >
            <Grid size={16} className="text-gray-500" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Visualização em lista"
          >
            <List size={16} className="text-gray-500" />
          </button>
        </div>
        
        {showSearch && comodidades.length > 6 && (
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar..."
              className="pl-7 pr-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#006ce4] w-36"
            />
          </div>
        )}
      </div>

      {/* Por categoria */}
      {showCategories ? (
        <div className="space-y-5">
          {categoriasOrdenadas.map(categoria => {
            const coms = comodidadesPorCategoria[categoria];
            const catInfo = CATEGORIAS[categoria] || { icone: <Check size={14} />, cor: 'gray' };
            
            return (
              <div key={categoria}>
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100">
                  <span className={`text-${catInfo.cor}-500`}>{catInfo.icone}</span>
                  <h4 className="font-medium text-gray-700 text-sm">{categoria}</h4>
                  <span className="text-xs text-gray-400">({coms.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {coms.map(com => (
                    <span
                      key={com.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 rounded-md text-xs text-gray-700 transition-colors"
                      title={com.nome}
                    >
                      {getIcone(com.icone)}
                      <span className="max-w-[150px] truncate">{com.nome}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Sem categorias - apenas tags
        <div className="flex flex-wrap gap-2">
          {comodidadesFiltradas.slice(0, itensToShow).map(com => (
            <span
              key={com.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
            >
              {getIcone(com.icone)}
              {com.nome}
            </span>
          ))}
        </div>
      )}

      {/* Botão ver mais */}
      {shouldTruncate && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-4 text-sm text-[#006ce4] hover:underline flex items-center gap-1"
        >
          Ver mais {totalItens - maxItems} comodidades <ChevronDown size={14} />
        </button>
      )}

      {/* Resultado da busca vazia */}
      {searchTerm && comodidadesFiltradas.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-400 text-sm">Nenhuma comodidade encontrada para "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

// Versão simplificada para uso em cards/resumos
export const ComodidadesResumo = ({ comodidades, limit = 4, className = "" }) => {
  if (!comodidades || comodidades.length === 0) {
    return <p className="text-gray-400 text-xs">Nenhuma comodidade</p>;
  }

  const mostrar = comodidades.slice(0, limit);
  const resto = comodidades.length - limit;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {mostrar.map(com => (
        <span key={com.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
          {getIcone(com.icone)}
          <span className="max-w-[80px] truncate">{com.nome}</span>
        </span>
      ))}
      {resto > 0 && (
        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500">
          +{resto}
        </span>
      )}
    </div>
  );
};

// Versão para grid de ícones (visual compacto)
export const ComodidadesIcones = ({ comodidades, className = "" }) => {
  if (!comodidades || comodidades.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {comodidades.map(com => (
        <div
          key={com.id}
          className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#006ce4] transition-colors group relative"
          title={com.nome}
        >
          {getIcone(com.icone)}
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-0.5 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
            {com.nome}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ComodidadesLista;