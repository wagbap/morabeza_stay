import React from 'react';
import { User, LogOut, Heart, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 1. Importar o hook

const UserDropdown = ({ user, onLogout, isOpen, setIsOpen }) => {
  const { t } = useTranslation(); // 2. Inicializar a tradução

  if (!user) return null;

  return (
    <div className="relative">
      {/* BOTÃO DO PERFIL */}
        <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 p-1.5 pr-4 rounded-full transition-all z-50 shadow-sm"
      >
        <img 
          src={user.picture} // Alterado de user.foto para user.picture
          alt={user.name} 
          className="w-8 h-8 rounded-full border border-white/50 object-cover"
          referrerPolicy="no-referrer" // Necessário para imagens do Google
        />
        <span className="text-xs font-bold text-white uppercase tracking-wider hidden md:block">
          {user.name ? user.name.split(' ')[0] : 'User'}
        </span>
        <ChevronDown size={14} className={`text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 cursor-default" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-3 z-50 border border-gray-100 animate-in fade-in zoom-in duration-200 text-left">
            
            {/* Cabeçalho do Menu */}
            <div className="px-6 py-3 border-b border-gray-50 mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {t('minha_conta')}
              </p>
              <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
            </div>

            {/* Links do Menu */}
            <div className="px-2 space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm">
                <LayoutDashboard size={16} /> 
                {t('minhas_reservas')}
              </button>
              
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm">
                <Heart size={16} /> 
                {t('favoritos')}
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-blue-600 bg-blue-50/30 hover:bg-blue-50 transition-all font-semibold text-sm border-t border-gray-50 mt-2 pt-2">
                <User size={16} /> 
                {t('anuncie')}
              </button>
            </div>

            {/* Botão de Logout */}
            <div className="mt-2 pt-2 border-t border-gray-100 px-2">
              <button 
                onClick={onLogout} 
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