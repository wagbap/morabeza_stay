import React, { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const SidebarFiltros = ({ onFiltrar, onLimpar, filtrosAtuais }) => {
  const [priceRange, setPriceRange] = useState([filtrosAtuais.precoMin, filtrosAtuais.precoMax]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState(filtrosAtuais.categorias);

  // Categorias reais da API
  const categorias = ['Aventura', 'Cultural', 'Gastronomia', 'Natureza', 'Relax'];

  useEffect(() => {
    setPriceRange([filtrosAtuais.precoMin, filtrosAtuais.precoMax]);
    setCategoriasSelecionadas(filtrosAtuais.categorias);
  }, [filtrosAtuais]);

  const handlePriceChange = (val) => {
    console.log('Preço alterado:', val); // Debug
    setPriceRange(val);
    const novosFiltros = {
      precoMin: val[0],
      precoMax: val[1],
      categorias: categoriasSelecionadas
    };
    onFiltrar(novosFiltros);
  };

  const handleCategoriaChange = (categoria) => {
    console.log('Categoria clicada:', categoria); // Debug
    let novasCategorias;
    if (categoriasSelecionadas.includes(categoria)) {
      novasCategorias = categoriasSelecionadas.filter(c => c !== categoria);
    } else {
      novasCategorias = [...categoriasSelecionadas, categoria];
    }
    
    console.log('Categorias selecionadas:', novasCategorias); // Debug
    setCategoriasSelecionadas(novasCategorias);
    
    const novosFiltros = {
      precoMin: priceRange[0],
      precoMax: priceRange[1],
      categorias: novasCategorias
    };
    onFiltrar(novosFiltros);
  };

  const handleLimparFiltros = () => {
    console.log('Limpar filtros clicado'); // Debug
    setPriceRange([0, 10000]);
    setCategoriasSelecionadas([]);
    onLimpar();
  };

  return (
    <div className="w-full md:w-64 space-y-10 pr-6">
      <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Filtrar</h3>

      {/* PREÇO POR DIA */}
      <div>
        <h4 className="text-sm font-black text-gray-900 mb-6 italic uppercase tracking-tighter">Preço por dia</h4>
        <div className="px-2">
          <Slider
            range
            min={0}
            max={10000}
            value={priceRange}
            onChange={handlePriceChange}
            trackStyle={[{ backgroundColor: '#2563eb', height: 4 }]}
            handleStyle={[
              { borderColor: '#2563eb', height: 18, width: 18, marginTop: -7, backgroundColor: '#fff', opacity: 1 },
              { borderColor: '#2563eb', height: 18, width: 18, marginTop: -7, backgroundColor: '#fff', opacity: 1 }
            ]}
            railStyle={{ backgroundColor: '#e5e7eb', height: 4 }}
          />
          <div className="flex justify-between mt-4 text-[10px] font-black text-gray-500 uppercase">
            <span>{priceRange[0]} CVE</span>
            <span>{priceRange[1]} CVE</span>
          </div>
        </div>
      </div>

      {/* CATEGORIAS */}
      <div>
        <h4 className="text-sm font-black text-gray-900 mb-4 italic uppercase tracking-tighter">Categoria</h4>
        <div className="space-y-3">
          {categorias.map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={categoriasSelecionadas.includes(cat)}
                onChange={() => handleCategoriaChange(cat)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
              />
              <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <button 
        onClick={handleLimparFiltros}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-colors"
      >
        Limpar filtros
      </button>
    </div>
  );
};

export default SidebarFiltros;