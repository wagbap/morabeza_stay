// src/components/gest/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  CalendarCheck,
  Calendar,
  MessageCircle,
  CircleDollarSign,
  Star,
  BarChart3,
  History,
  LogOut,
  X,
  Heart,
  User,
  Car,
  Compass
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [userRoles, setUserRoles] = useState({
    anfitrion: false,
    guia: false,
    proprietarioVeiculos: false
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
          setLoading(false);
          return;
        }
        
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        const response = await fetch(`https://welovepalop.com/api/usuarios/listar_roles.php?usuario_id=${userData.id}`);
        const data = await response.json();
        
        if (data.success && data.roles) {
          const isAnfitrion = data.roles.some(r => r.name === 'anfitrion' && r.status === 'approved');
          const isGuia = data.roles.some(r => r.name === 'guia_experiencias' && r.status === 'approved');
          const isProprietarioVeiculos = data.roles.some(r => r.name === 'proprietario_veiculos' && r.status === 'approved');
          
          setUserRoles({
            anfitrion: isAnfitrion,
            guia: isGuia,
            proprietarioVeiculos: isProprietarioVeiculos
          });
        }
      } catch (error) {
        console.error('Erro ao buscar roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, []);

  const isActive = (path) => location.pathname.includes(path);

  const linkClass = (path) => `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-colors ${
    isActive(path) 
      ? "bg-[#e8f6ed] text-[#064e3b]" 
      : "text-[#4b5563] hover:bg-gray-50"
  }`;

  const iconClass = (path) => `w-[22px] h-[22px] flex-shrink-0 ${
    isActive(path) ? "text-[#16a34a]" : "text-[#1e3a8a]"
  }`;

  // Verificar se tem pelo menos uma role de gestão
  const hasManagementRole = userRoles.anfitrion || userRoles.guia || userRoles.proprietarioVeiculos;

  if (loading) {
    return (
      <div className={`w-[260px] h-full bg-white border-r border-gray-100 flex flex-col flex-shrink-0
        fixed inset-y-0 left-0 z-40 lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      w-[260px] h-full bg-white border-r border-gray-100 flex flex-col flex-shrink-0
      fixed inset-y-0 left-0 z-40 lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}>
      
      {/* Botão de Fechar no Mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-50">
        <span className="font-bold text-[#0f172a]">Menu</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md text-gray-500">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Header com informações do usuário */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#003580] to-[#6b82c6] flex items-center justify-center text-white font-bold">
            {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{user?.nome || 'Utilizador'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
          </div>
        </div>
        
        {/* Badge de roles */}
        <div className="flex flex-wrap gap-1 mt-3">
          {userRoles.anfitrion && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded-full">
              <Home size={10} /> Anfitrião
            </span>
          )}
          {userRoles.proprietarioVeiculos && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">
              <Car size={10} /> Veículos
            </span>
          )}
          {userRoles.guia && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-medium rounded-full">
              <Compass size={10} /> Guia
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4">
        <nav className="space-y-1.5">
          {/* ============================================
              SEÇÃO: GESTÃO (apenas se tiver role de gestão)
          ============================================ */}
          {hasManagementRole && (
            <>
              <div className="px-4 py-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gestão</p>
              </div>
              
              <Link to="/gest/dashboard" onClick={onClose} className={linkClass('/gest/dashboard')}>
                <Home className={iconClass('/gest/dashboard')} strokeWidth={2} />
                <span className="text-[15px] truncate">Dashboard</span>
              </Link>

              <Link to="/gest/reservas" onClick={onClose} className={linkClass('/gest/reservas')}>
                <CalendarCheck className={iconClass('/gest/reservas')} strokeWidth={2} />
                <span className="text-[15px] truncate">Reservas</span>
              </Link>

              <Link to="/gest/calendario" onClick={onClose} className={linkClass('/gest/calendario')}>
                <Calendar className={iconClass('/gest/calendario')} strokeWidth={2} />
                <span className="text-[15px] truncate">Calendário</span>
              </Link>

              <Link to="/gest/mensagens" onClick={onClose} className={linkClass('/gest/mensagens')}>
                <MessageCircle className={iconClass('/gest/mensagens')} strokeWidth={2} />
                <span className="text-[15px] truncate">Mensagens</span>
                <span className="ml-auto flex-shrink-0 bg-[#e0e7ff] text-[#3730a3] text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                  5
                </span>
              </Link>

              <Link to="/gest/financeiro" onClick={onClose} className={linkClass('/gest/financeiro')}>
                <CircleDollarSign className={iconClass('/gest/financeiro')} strokeWidth={2} />
                <span className="text-[15px] truncate">Financeiro</span>
              </Link>

              <Link to="/gest/relatorios" onClick={onClose} className={linkClass('/gest/relatorios')}>
                <BarChart3 className={iconClass('/gest/relatorios')} strokeWidth={2} />
                <span className="text-[15px] truncate">Relatórios</span>
              </Link>

              <Link to="/gest/historico" onClick={onClose} className={linkClass('/gest/historico')}>
                <History className={iconClass('/gest/historico')} strokeWidth={2} />
                <span className="text-[15px] truncate">Histórico</span>
              </Link>

              <Link to="/gest/avaliacoes" onClick={onClose} className={linkClass('/gest/avaliacoes')}>
                <Star className={iconClass('/gest/avaliacoes')} strokeWidth={2} />
                <span className="text-[15px] truncate">Avaliações</span>
              </Link>
            </>
          )}

          {/* ============================================
              SEÇÃO: CONTA (SEMPRE DISPONÍVEL)
          ============================================ */}
          <div className="pt-2">
            <div className="px-4 py-2 mt-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Conta</p>
            </div>

            {/* Perfil - Principal (substitui Configurações) */}
            <Link to="/gest/configuracoes" onClick={onClose} className={linkClass('/perfil')}>
              <User className={iconClass('/perfil')} strokeWidth={2} />
              <span className="text-[15px] truncate">Perfil</span>
            </Link>

            {/* Minhas Reservas */}
            <Link to="/gest/minhas-reservas" onClick={onClose} className={linkClass('/gest/minhas-reservas')}>
              <CalendarCheck className={iconClass('/gest/minhas-reservas')} strokeWidth={2} />
              <span className="text-[15px] truncate">Minhas Reservas</span>
            </Link>

            {/* Favoritos */}
            <Link to="/favoritos" onClick={onClose} className={linkClass('/favoritos')}>
              <Heart className={iconClass('/favoritos')} strokeWidth={2} />
              <span className="text-[15px] truncate">Favoritos</span>
            </Link>
          </div>

          {/* Separador e Logout */}
          <div className="pt-4 mt-2 border-t border-gray-100">
            <button 
              onClick={() => {
                localStorage.removeItem('user');
                localStorage.removeItem('morabeza_user');
                window.location.href = '/login';
              }} 
              className="w-full flex items-center gap-3.5 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors"
            >
              <LogOut className="w-[22px] h-[22px] text-red-500 flex-shrink-0" strokeWidth={2} />
              <span className="text-[15px] truncate">Sair</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}