import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Home as House,
  Users, 
  CircleDollarSign, 
  Settings, 
  Sun,
  LogOut,
  MailCheck,
  MessageSquare,
  CreditCard,
  AlertTriangle,
  FileText,
  UserCheck,
  CheckCircle,
  Car,
  Compass,
  User,
  Menu,
  X,
  BookDashed,
  BookDashedIcon,
  PaintRoller,
  LayoutDashboardIcon
} from 'lucide-react';

const AdminSidebar = () => {
  const [adminUser, setAdminUser] = useState({
    nome: 'A carregar...',
    email: '',
    foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfaqoYwiNos1vbmSU14WG190Uh2DnX7v-epw&s',
    id: null
  });
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  // Fechar menu ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Buscar dados do admin logado
  useEffect(() => {
    const buscarAdminLogado = async () => {
      try {
        const userData = localStorage.getItem('morabeza_admin');
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setAdminUser({
            nome: parsedUser.nome || parsedUser.full_name || 'Administrador',
            email: parsedUser.email || 'admin@morabeza.stay',
            foto: parsedUser.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(parsedUser.nome || 'Admin')}&background=003580&color=fff`,
            id: parsedUser.id
          });
          setLoading(false);
        } else {
          const response = await fetch('/api/admin/me.php');
          const data = await response.json();
          
          if (data.success && data.user) {
            setAdminUser({
              nome: data.user.nome || data.user.full_name || 'Administrador',
              email: data.user.email,
              foto: data.user.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.nome || 'Admin')}&background=003580&color=fff`,
              id: data.user.id
            });
            localStorage.setItem('morabeza_admin', JSON.stringify(data.user));
          } else {
            setAdminUser({
              nome: 'Administrador',
              email: 'admin@morabeza.stay',
              foto: 'https://ui-avatars.com/api/?name=Admin&background=003580&color=fff',
              id: null
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar admin:', error);
        setAdminUser({
          nome: 'Administrador',
          email: 'admin@morabeza.stay',
          foto: 'https://ui-avatars.com/api/?name=Admin&background=003580&color=fff',
          id: null
        });
      } finally {
        setLoading(false);
      }
    };

    buscarAdminLogado();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout.php', { method: 'POST' });
    } catch (error) {
      console.error('Erro no logout:', error);
    }
    
    localStorage.removeItem('morabeza_admin');
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Painel de Controlo', icon: <LayoutDashboardIcon size={20} />, path: '/admin/dashboard' },
    { name: 'Propriedades', icon: <House size={20} />, path: '/admin/propriedades' },
    { name: 'Anfitriões', icon: <UserCheck size={20} />, path: '/admin/anfitrioes' },
    { name: 'Verificações', icon: <MailCheck size={20} />, path: '/admin/verificacoes' },
    { name: 'Reservas', icon: <Calendar size={20} />, path: '/admin/reservas', badge: 5 },
    { name: 'Mensagens', icon: <MessageSquare size={20} />, path: '/admin/mensagens', badge: 3 },
    { name: 'Pagamentos', icon: <CreditCard size={20} />, path: '/admin/pagamentos' },
    { name: 'Denúncias', icon: <AlertTriangle size={20} />, path: '/admin/denuncias', badge: 2 },
    { name: 'Relatórios', icon: <FileText size={20} />, path: '/admin/relatorios' },
    { name: 'Clientes', icon: <Users size={20} />, path: '/admin/clientes' },
    { name: 'Ganhos', icon: <CircleDollarSign size={20} />, path: '/admin/ganhos' },
    { name: 'Configurações', icon: <Settings size={20} />, path: '/admin/configuracoes' },
  ];

  // Conteúdo da sidebar (usado tanto para desktop quanto mobile)
  const SidebarContent = () => (
    <>
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-2 sticky top-0 bg-[#003580]">
        <Sun className="text-yellow-400" size={28} />
        <h1 className="text-xl font-semibold tracking-wide text-white">
          MORABEZA<span className="font-light">.STAY</span>
        </h1>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-[#1a2c5e] text-white shadow-md' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="font-medium text-sm">{item.name}</span>
            </div>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Perfil do Administrador & Botão de Sair */}
      <div className="p-4 border-t border-white/20 sticky bottom-0 bg-[#003580]">
        <div className="flex items-center justify-between hover:bg-white/10 p-2 rounded-lg transition-all group">
          
          <div className="flex items-center gap-3 overflow-hidden">
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse"></div>
            ) : (
              <img 
                src={adminUser.foto} 
                alt={adminUser.nome}
                className="w-10 h-10 rounded-full border-2 border-white/50 object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminUser.nome)}&background=ffffff&color=003580`;
                }}
              />
            )}
            <div className="overflow-hidden">
              {loading ? (
                <>
                  <div className="h-4 w-24 bg-white/20 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-20 bg-white/20 rounded animate-pulse"></div>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-white truncate w-full" title={adminUser.nome}>
                    {adminUser.nome}
                  </p>
                  <p className="text-xs text-white/60 truncate w-full" title={adminUser.email}>
                    {adminUser.email}
                  </p>
                </>
              )}
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2 rounded-md text-white/70 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Terminar Sessão"
          >
            <LogOut size={18} />
          </button>

        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Overlay para mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Botão Hambúrguer - Mobile */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#003580] text-white p-2 rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Desktop */}
      <div className="hidden md:block w-64 h-screen bg-[#003580] flex flex-col justify-between text-white shadow-xl flex-shrink-0 overflow-y-auto">
        <SidebarContent />
      </div>

      {/* Sidebar Mobile - Slide In */}
      <div
        className={`
          fixed top-0 left-0 h-full w-72 bg-[#003580] z-50 transform transition-transform duration-300 ease-in-out md:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col shadow-2xl
        `}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default AdminSidebar;