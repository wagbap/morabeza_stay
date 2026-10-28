// src/pages/Favoritos.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFavoritos } from '../hooks/useFavoritos';
import { Link } from 'react-router-dom';
import { Home, Car, Palmtree } from 'lucide-react';

import CardAlojamento from '../features/alojamento/components/CardAlojamento';
import CardCarro from '../features/carros/components/CardCarro';
import CardExperiencia from '../features/experiencias/components/CardExperiencia';

const Favoritos = () => {
  const { t } = useTranslation();
  const { favoritos, recarregar, loading, isLoggedIn, user } = useFavoritos();
  const [activeTab, setActiveTab] = useState('alojamentos');
  const tabs = [
    { id: 'alojamentos', label: t('alojamentos'), icon: <Home size={14} />, count: favoritos.alojamentos?.length || 0 },
    { id: 'carros', label: t('carros'), icon: <Car size={14} />, count: favoritos.carros?.length || 0 },
    { id: 'experiencias', label: t('experiencias'), icon: <Palmtree size={14} />, count: favoritos.experiencias?.length || 0 }
  ];

  const currentItems = favoritos[activeTab] || [];

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
            {t('olá')}, <span className="font-bold text-blue-600">{user?.name || user?.nome || user?.full_name || 'Utilizador'}</span>! 
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
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentItems.map(item => activeTab === 'alojamentos'
              ? <CardAlojamento key={item.id} {...item} onFavoritoChange={recarregar} />
              : activeTab === 'carros'
                ? <CardCarro key={item.id} carro={item} onFavoritoChange={recarregar} />
                : <CardExperiencia key={item.id} {...item} onFavoritoChange={recarregar} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoritos;