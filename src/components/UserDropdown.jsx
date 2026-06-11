// src/components/UserDropdown.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Car, Compass, Heart, User, LogOut, ChevronDown, LayoutDashboard, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFavoritos } from '../hooks/useFavoritos';

const UserDropdown = ({ user, onLogout, isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { totalFavoritos: totalFromHook, recarregar } = useFavoritos();
  const [totalFavoritos, setTotalFavoritos] = useState(0);
  
  // Estados das roles
  const [canManageAlojamento, setCanManageAlojamento] = useState(false);
  const [canManageCarros, setCanManageCarros] = useState(false);
  const [canManageExperiencias, setCanManageExperiencias] = useState(false);
  const [canAccessDashboard, setCanAccessDashboard] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [temQualquerRole, setTemQualquerRole] = useState(false);

  // Buscar roles do usuário
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user?.id) {
        setLoadingRoles(false);
        return;
      }
      
      try {
        const response = await fetch(`https://welovepalop.com/api/usuarios/listar_roles.php?usuario_id=${user.id}`);
        const data = await response.json();
        
        if (data.success && data.roles) {
          const isAnfitrionApproved = data.roles.some(r => r.name === 'anfitrion' && r.status === 'approved');
          const isGuiaApproved = data.roles.some(r => r.name === 'guia_experiencias' && r.status === 'approved');
          const isProprietarioVeiculosApproved = data.roles.some(r => r.name === 'proprietario_veiculos' && r.status === 'approved');
          
          const hasAnyRole = isAnfitrionApproved || isGuiaApproved || isProprietarioVeiculosApproved;
          
          setCanManageAlojamento(isAnfitrionApproved);
          setCanManageCarros(isProprietarioVeiculosApproved);
          setCanManageExperiencias(isGuiaApproved);
          setCanAccessDashboard(hasAnyRole);
          setTemQualquerRole(hasAnyRole);
        } else {
          setTemQualquerRole(false);
        }
      } catch (error) {
        console.error('Erro ao buscar roles do usuário:', error);
        setTemQualquerRole(false);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchUserRoles();
  }, [user?.id]);

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

  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  // Se NÃO ESTIVER LOGADO, mostra o botão "Registar sua propriedade" que vai para o /login
  if (!user) {
    return (
      <button 
        onClick={() => navigate('/login')}
        className="flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-lg transition-all shadow-sm text-white font-medium text-sm"
      >
        Registar sua propriedade
      </button>
    );
  }

  return (
    <div className="relative">
      {/* Botão do usuário - Apenas ícone, sem nome */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 p-1.5 rounded-full transition-all z-50 shadow-sm"
      >
        <img 
          src={user.picture} 
          alt={user.name} 
          className="w-8 h-8 rounded-full border border-white/50 object-cover"
          referrerPolicy="no-referrer"
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 cursor-default" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-3 z-50 border border-gray-100 animate-in fade-in zoom-in duration-200 text-left">
            
            {/* Header do dropdown - apenas email do usuário */}
            <div className="px-6 py-3 border-b border-gray-50 mb-2 bg-gradient-to-r from-[#003580] to-[#1a4d8c] mx-2 rounded-xl">
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                {t('minha_conta')}
              </p>
              <p className="text-sm font-bold text-white truncate">{user.email}</p>
            </div>
            
            <div className="px-2 space-y-1">
              {/* Seções de anúncio - apenas com role aprovada */}
              {canManageAlojamento && (
                <button 
                  onClick={() => handleNavigation('/alojamento-registro/meus')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
                >
                  <Home size={16} /> 
                  Anuncie Alojamento
                </button>
              )}

              {canManageCarros && (
                <button 
                  onClick={() => handleNavigation('/carro-registo/meus')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
                >
                  <Car size={16} /> 
                  Anuncie Carros
                </button>
              )}

              {canManageExperiencias && (
                <button 
                  onClick={() => handleNavigation('/experiencia-registo/meus')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
                >
                  <Compass size={16} /> 
                  Anuncie Experiência
                </button>
              )}

              {(canManageAlojamento || canManageCarros || canManageExperiencias) && (
                <div className="border-t border-gray-100 my-2"></div>
              )}

              {/* Seções comuns */}
              <button 
                onClick={() => handleNavigation('/favoritos')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
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
                onClick={() => handleNavigation('/gest/minhas-reservas')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
              >
                <Calendar size={16} /> 
                Minhas Reservas
              </button>

              <button 
                onClick={() => handleNavigation('/gest/configuracoes')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
              >                
                <User size={16} /> 
                Perfil
              </button>

              {canAccessDashboard && (
                <div className="border-t border-gray-100 my-2"></div>
              )}

              {canAccessDashboard && (
                <button 
                  onClick={() => handleNavigation('/gest/dashboard')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
                >                
                  <LayoutDashboard size={16} /> 
                  Dashboard de Gestão
                </button>
              )}
            </div>

            {/* Logout */}
            <div className="mt-2 pt-2 border-t border-gray-100 px-2">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }} 
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest"
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