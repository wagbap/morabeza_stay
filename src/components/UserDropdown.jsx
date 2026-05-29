// src/components/UserDropdown.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Car, Compass, Heart, User,LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFavoritos } from '../hooks/useFavoritos';


const UserDropdown = ({ user, onLogout, isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { totalFavoritos: totalFromHook, recarregar } = useFavoritos();
  const [totalFavoritos, setTotalFavoritos] = useState(0);

  // Sincronizar com o hook
  useEffect(() => {
    setTotalFavoritos(totalFromHook);
  }, [totalFromHook]);

  // Ouvir eventos de atualização
  useEffect(() => {
    const handleUpdate = (event) => {
      if (event.detail?.total !== undefined) {
        setTotalFavoritos(event.detail.total);
      } else {
        recarregar();
      }
    };
    
    window.addEventListener('favoritosAtualizados', handleUpdate);
    
    return () => {
      window.removeEventListener('favoritosAtualizados', handleUpdate);
    };
  }, [recarregar]);

  if (!user) return null;

  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="relative">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 p-1.5 pr-4 rounded-full transition-all z-50 shadow-sm"
      >
        <img 
          src={user.picture} 
          alt={user.name} 
          className="w-8 h-8 rounded-full border border-white/50 object-cover"
          referrerPolicy="no-referrer"
        />
        <span className="text-xs font-bold text-white uppercase tracking-wider hidden md:block">
          {user.name ? user.name.split(' ')[0] : 'User'}
        </span>
        <ChevronDown size={14} className={`text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 cursor-default" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-3 z-50 border border-gray-100 animate-in fade-in zoom-in duration-200 text-left">
            
            <div className="px-6 py-3 border-b border-gray-50 mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {t('minha_conta')}
              </p>
              <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
            </div>
              <div className="px-2 space-y-1">
                <button 
                  onClick={() => handleNavigation('/alojamento-registro/meus')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
                >
                  <Home size={16} /> 
                  Anuncie Alojamento
                </button>

                <button 
                  onClick={() => handleNavigation('/carro-registo/meus')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
                >
                  <Car size={16} /> 
                  Anuncie Carros
                </button>

                <button 
                  onClick={() => handleNavigation('/experiencia-registo/meus')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
                >
                  <Compass size={16} /> 
                  Anuncie Experiência
                </button>

                <button 
                  onClick={() => handleNavigation('/favoritos')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
                >
                  <Heart size={16} /> 
                  {t('favoritos')}
                  {totalFavoritos > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {totalFavoritos}
                    </span>
                  )}
                </button>

                <button 
                  onClick={() => handleNavigation('/perfil')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
                >                
                  <User size={16} /> 
                  Perfil
                </button>

                <button 
                  onClick={() => handleNavigation('/gest/dashboard')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
                >                
                  <LayoutDashboard size={16} /> 
                  Dashboard
                </button>
              </div>

            <div className="mt-2 pt-2 border-t border-gray-100 px-2">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }} 
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest"
              >
                <LogOut size={16} /> 
                {t('terminar_sessao')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDropdown;