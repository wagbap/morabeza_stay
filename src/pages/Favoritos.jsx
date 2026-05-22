// src/pages/Favoritos.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFavoritos } from '../hooks/useFavoritos';
import { Link } from 'react-router-dom';
import { Home, Car, Palmtree, Trash2, MapPin, Star } from 'lucide-react';

const Favoritos = () => {
  const { t } = useTranslation();
  const { favoritos, isLoggedIn, user, removeFavorito, recarregar, loading } = useFavoritos();
  const [activeTab, setActiveTab] = useState('alojamentos');
  const [removendoId, setRemovendoId] = useState(null);

  const tabs = [
    { id: 'alojamentos', label: t('alojamentos'), icon: <Home size={14} />, count: favoritos.alojamentos?.length || 0 },
    { id: 'carros', label: t('carros'), icon: <Car size={14} />, count: favoritos.carros?.length || 0 },
    { id: 'experiencias', label: t('experiencias'), icon: <Palmtree size={14} />, count: favoritos.experiencias?.length || 0 }
  ];

  const getLinkTo = (tipo, item) => {
    if (tipo === 'alojamentos') return `/alojamentos/${item.slug || item.id}`;
    if (tipo === 'carros') return `/carros/${item.slug || item.id}`;
    return `/experiencia/${item.slug || item.id}`;
  };

  const getPreco = (tipo, item) => {
    if (tipo === 'alojamentos') return item.preco_noite;
    if (tipo === 'carros') return item.preco_dia;
    return item.preco;
  };

  const getPrecoLabel = (tipo) => {
    if (tipo === 'alojamentos') return t('por_noite_curto');
    if (tipo === 'carros') return t('por_dia');
    return t('por_pessoa');
  };

  const handleRemover = async (e, tipo, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    setRemovendoId(itemId);
    await removeFavorito(tipo.slice(0, -1), itemId);
    setRemovendoId(null);
  };

  const currentItems = favoritos[activeTab] || [];

  useEffect(() => {
    recarregar();
  }, [activeTab, recarregar]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white font-sans pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-[#1a2b6d] mb-2">{t('login_para_favoritos')}</h2>
            <p className="text-slate-500 mb-6">{t('faça_login_para_ver_favoritos')}</p>
            <Link 
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              {t('voltar_inicio')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-[#1a2b6d] tracking-tighter italic uppercase">
            {t('meus_favoritos')}
          </h1>
          <div className="h-1.5 w-20 bg-blue-600 mt-2"></div>
          <p className="text-sm text-slate-500 mt-3">
            {t('olá')}, <span className="font-bold text-blue-600">{user?.name || user?.nome || user?.full_name}</span>! 
            {t('estes_sao_seus_favoritos')}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Lista de Favoritos */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-5xl mb-3">❤️</div>
            <p className="text-slate-500 font-medium text-sm">{t('sem_favoritos', { categoria: tabs.find(t => t.id === activeTab)?.label })}</p>
            <Link 
              to={`/${activeTab}`}
              className="inline-block mt-3 text-blue-600 font-bold text-[11px] hover:underline"
            >
              {t('explorar')} {tabs.find(t => t.id === activeTab)?.label}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {currentItems.map((item) => (
              <div key={item.id} className="relative group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                <Link to={getLinkTo(activeTab, item)} className="block">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img 
                      src={item.imagem_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
                      alt={item.titulo}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
                    />
                    <button
                      onClick={(e) => handleRemover(e, activeTab, item.id)}
                      disabled={removendoId === item.id}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md z-20 hover:scale-110 transition-transform disabled:opacity-50"
                    >
                      {removendoId === item.id ? (
                        <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 size={12} className="text-red-500" />
                      )}
                    </button>
                    {item.estrelas && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                        <Star size={10} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-[9px] font-bold text-white">
                          {typeof item.estrelas === 'number' ? item.estrelas.toFixed(1) : (Number(item.estrelas) || 4.5).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 text-left">
                    <h3 className="text-xs font-bold text-[#1a2b6d] line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {item.titulo}
                    </h3>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <MapPin size={10} className="text-blue-500" />
                      <span className="text-[9px] text-slate-500 truncate">
                        {item.localizacao || t('cabo_verde')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-gray-50">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-xs font-black text-[#1a2b6d]">
                          {Number(getPreco(activeTab, item)).toLocaleString('pt-PT')}
                        </span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">{t('cve')}</span>
                      </div>
                      <span className="text-[8px] text-gray-400">{getPrecoLabel(activeTab)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoritos;