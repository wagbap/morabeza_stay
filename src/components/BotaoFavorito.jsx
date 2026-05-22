// src/components/BotaoFavorito.jsx
import React from 'react';
import { Heart, Loader } from 'lucide-react';
import { useFavoritos } from '../hooks/useFavoritos';

const BotaoFavorito = ({ tipo, item, size = 18, className = '' }) => {
  const { isFavorito, toggleFavorito, loading } = useFavoritos();
  
  const tipoCorreto = tipo === 'alojamentos' ? 'alojamento' : 
                       tipo === 'carros' ? 'carro' : 
                       tipo === 'experiencias' ? 'experiencia' : tipo;
  
  const favoritado = isFavorito(tipoCorreto, item.id);

  const imagemUrl = item.imagem_url || item.imagem_principal || item.imagem || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200';
  
  const itemParaFavorito = {
    id: item.id,
    titulo: item.titulo,
    localizacao: item.localizacao || item.ilha,
    imagem_url: imagemUrl,
    preco_noite: item.preco_noite,
    preco_dia: item.preco_dia,
    preco: item.preco,
    estrelas: item.estrelas || item.rating || 4.5,
    slug: item.slug,
    tipo_item: tipoCorreto
  };

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorito(tipoCorreto, itemParaFavorito);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-md z-20 hover:scale-110 transition-transform active:scale-95 disabled:opacity-50 ${className}`}
      aria-label={favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      {loading ? (
        <Loader size={size} className="animate-spin text-gray-500" />
      ) : (
        <Heart
          size={size}
          strokeWidth={2.5}
          className={`transition-colors ${
            favoritado 
              ? 'fill-red-500 text-red-500' 
              : 'text-gray-900'
          }`}
        />
      )}
    </button>
  );
};

export default BotaoFavorito;