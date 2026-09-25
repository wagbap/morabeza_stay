// src/components/UserDropdown.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Car, Compass, Heart, User, LogOut, LayoutDashboard, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFavoritos } from '../hooks/useFavoritos';

const UserDropdown = ({ user, onLogout, isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { totalFavoritos: totalFromHook, recarregar } = useFavoritos();
  const [totalFavoritos, setTotalFavoritos] = useState(0);
  const [sessionUser, setSessionUser] = useState(user);

  // 🔑 Função ultra-abrangente para extrair dados e procurar a foto em qualquer lugar possível
  const obterDadosSessao = useCallback(() => {
    try {
      // 1. Verificar se foi passado via props diretamente e tem foto
      if (user) {
        const f = user.foto || user.picture || user.avatar || user.image || user.user_metadata?.avatar_url || user.data?.picture;
        if (f) return user;
      }

      // 2. Tenta extrair do token JWT no localStorage
      const token = localStorage.getItem('token') || localStorage.getItem('morabeza_token');
      let tokenData = null;
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const parsed = JSON.parse(jsonPayload);
        tokenData = parsed.data || parsed;
      }

      // 3. Procura nas chaves de utilizador do localStorage
      let localData = null;
      const chaves = ['user', 'morabeza_user', 'morabeza_admin', 'usuario', 'dados_utilizador'];
      for (const chave of chaves) {
        const raw = localStorage.getItem(chave);
        if (raw) {
          try {
            const parsedUser = JSON.parse(raw);
            if (parsedUser) {
              localData = parsedUser.data || parsedUser;
              break;
            }
          } catch (err) {
            // Ignorar erros de parse se não for JSON válido
          }
        }
      }

      // Funde tudo priorizando quem tem uma foto válida guardada
      const merged = { ...(tokenData || {}), ...(localData || {}), ...(user || {}) };
      return merged;
    } catch (e) {
      console.error('Erro ao ler dados da sessão:', e);
    }
    return user || null;
  }, [user]);

  // Sincronizar sessão em tempo real
  useEffect(() => {
    setSessionUser(obterDadosSessao());

    const atualizarSessaoEmTempoReal = () => {
      setSessionUser(obterDadosSessao());
    };

    window.addEventListener('storage', atualizarSessaoEmTempoReal);
    window.addEventListener('userUpdated', atualizarSessaoEmTempoReal);
    window.addEventListener('utilizadorAtualizado', atualizarSessaoEmTempoReal);

    return () => {
      window.removeEventListener('storage', atualizarSessaoEmTempoReal);
      window.removeEventListener('userUpdated', atualizarSessaoEmTempoReal);
      window.removeEventListener('utilizadorAtualizado', atualizarSessaoEmTempoReal);
    };
  }, [user, obterDadosSessao]);

  const usuarioAtual = sessionUser || obterDadosSessao();

  // Estados das roles
  const [canManageAlojamento, setCanManageAlojamento] = useState(false);
  const [canManageCarros, setCanManageCarros] = useState(false);
  const [canManageExperiencias, setCanManageExperiencias] = useState(false);
  const [canAccessDashboard, setCanAccessDashboard] = useState(false);

  // Buscar roles do utilizador de forma segura
  useEffect(() => {
    const fetchUserRoles = async () => {
      const userId = usuarioAtual?.id;
      if (!userId) return;
      
      try {
        const response = await fetch(`https://welovepalop.com/api/usuarios/listar_roles.php?usuario_id=${userId}`);
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
        }
      } catch (error) {
        console.error('Erro ao buscar roles do usuário:', error);
      }
    };

    fetchUserRoles();
  }, [usuarioAtual?.id]);

  useEffect(() => {
    setTotalFavoritos(totalFromHook);
  }, [totalFromHook]);

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

  // Se NÃO HOUVER UTILIZADOR nem TOKEN VÁLIDO
  if (!usuarioAtual || (!usuarioAtual.id && !usuarioAtual.email)) {
    return (
      <button 
        onClick={() => navigate('/login')}
        className="flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-lg transition-all shadow-sm text-white font-medium text-sm"
      >
        Regista a sua Propriedade
      </button>
    );
  }

  const emailExibicao = usuarioAtual.email || usuarioAtual.correo || 'utilizador@morabezastay.com';
  
  // 🌟 Captação exaustiva da foto em qualquer nivel ou chave possível (Google, Gmail, Local, etc.)
  const fotoPerfil = 
    usuarioAtual.foto || 
    usuarioAtual.picture || 
    usuarioAtual.avatar || 
    usuarioAtual.image || 
    usuarioAtual.user_metadata?.avatar_url || 
    usuarioAtual.data?.picture || 
    usuarioAtual.data?.foto ||
    null;

  return (
    <div className="relative">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 p-1.5 rounded-full transition-all z-50 shadow-sm"
      >
        {fotoPerfil ? (
          <img 
            src={fotoPerfil} 
            alt="Perfil" 
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              // Se a imagem falhar ao carregar por algum motivo de CORS ou URL expirada, esconde e mostra a letra
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            {emailExibicao ? emailExibicao.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 cursor-default" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-3 z-50 border border-gray-100 animate-in fade-in zoom-in duration-200 text-left">
            
            <div className="px-6 py-3 border-b border-gray-50 mb-2 bg-gradient-to-r from-[#003580] to-[#1a4d8c] mx-2 rounded-xl">
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                {t('minha_conta')}
              </p>
              <p className="text-sm font-bold text-white truncate">{emailExibicao}</p>
            </div>
            
            <div className="px-2 space-y-1">
              {canManageAlojamento && (
                <button 
                  onClick={() => handleNavigation('/alojamento-registro/meus')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
                >
                  <Home size={16} /> Anuncie Alojamento
                </button>
              )}

              {canManageCarros && (
                <button 
                  onClick={() => handleNavigation('/carro-registo/meus')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
                >
                  <Car size={16} /> Anuncie Carros
                </button>
              )}

              {canManageExperiencias && (
                <button 
                  onClick={() => handleNavigation('/experiencia-registo/meus')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
                >
                  <Compass size={16} /> Anuncie Experiência
                </button>
              )}

              {(canManageAlojamento || canManageCarros || canManageExperiencias) && (
                <div className="border-t border-gray-100 my-2"></div>
              )}

              <button 
                onClick={() => handleNavigation('/favoritos')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
              >
                <Heart size={16} /> {t('favoritos')}
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
                <Calendar size={16} /> Minhas Reservas
              </button>

              <button 
                onClick={() => handleNavigation('/gest/configuracoes')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
              >
                <User size={16} /> Perfil
              </button>

              {!canManageAlojamento && (
                <button 
                  onClick={() => handleNavigation('/gest/configuracoes?tab=funcoes')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
                >
                  <Home size={16} /> Solicitar Anfitrião
                </button>
              )}

              {canAccessDashboard && (
                <div className="border-t border-gray-100 my-2"></div>
              )}

              {canAccessDashboard && (
                <button 
                  onClick={() => handleNavigation('/gest/dashboard')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold text-sm"
                >
                  <LayoutDashboard size={16} /> Gerir anúncios e reservas
                </button>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-gray-100 px-2">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }} 
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest"
              >
                <LogOut size={16} /> {t('terminar_sessao')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDropdown;