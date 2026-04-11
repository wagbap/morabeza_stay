import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Car, Palmtree, Globe } from 'lucide-react';
import LoginGoogle from './LoginGoogle';
import UserDropdown from './UserDropdown';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setUserDropdownOpen(false);
    window.location.reload();
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const navLinks = [
    { name: t('menu_inicio'), icon: <Home size={18} />, path: '/' },
    { name: t('menu_alojamentos'), icon: <Globe size={18} />, path: '/alojamentos' },
    { name: t('menu_carros'), icon: <Car size={18} />, path: '/carros' },
    { name: t('menu_experiencias'), icon: <Palmtree size={18} />, path: '/experiencias' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[100] px-6 md:px-12 py-6 flex justify-between items-center transition-all duration-300 ${
        isHome 
          ? "bg-transparent border-b border-white/10 text-white" 
          : "bg-white shadow-md text-gray-900 border-b border-gray-100"
      }`}>
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-1">
          <span className="text-3xl font-bold italic text-[#a5d6a7]">M</span>
          <span className={`text-2xl font-bold uppercase tracking-widest ${isHome ? "text-white" : "text-gray-900"}`}>
            Morabeza<span className="font-light opacity-80 uppercase tracking-tighter">Stay</span>
          </span>
        </Link>

        {/* LINKS DESKTOP */}
        <div className={`hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] ${isHome ? "text-white" : "text-gray-600"}`}>
          {navLinks.map((link, idx) => (
            <Link key={idx} to={link.path} className="hover:text-blue-400 transition-all opacity-80 hover:opacity-100">
              {link.name}
            </Link>
          ))}
        </div>

        {/* LADO DIREITO */}
        <div className="flex items-center gap-6">
          
          {/* SELETOR DE LÍNGUAS (Desktop - Inclui EN) */}
          <div className={`hidden sm:flex gap-3 text-[10px] font-black uppercase tracking-widest ${isHome ? "text-white/60" : "text-gray-400"}`}>
            {['pt', 'en', 'fr', 'es', 'de'].map((lng) => (
              <button 
                key={lng}
                onClick={() => changeLanguage(lng)}
                className={`hover:text-blue-500 transition-colors ${i18n.language === lng ? (isHome ? "text-white underline underline-offset-4" : "text-blue-600 underline underline-offset-4") : ""}`}
              >
                {lng}
              </button>
            ))}
          </div>

    {!user ? (
  <LoginGoogle onLoginSuccess={(u) => setUser(u)} />
) : (
  <UserDropdown 
    user={user} 
    onLogout={handleLogout} 
    isOpen={userDropdownOpen} 
    setIsOpen={setUserDropdownOpen} 
  />
)}

          <button 
            onClick={() => setIsOpen(true)} 
            className={`flex items-center gap-2 border p-2 md:px-4 rounded-full transition-all ${
              isHome 
                ? "bg-white/10 border-white/30 text-white hover:bg-white/20" 
                : "bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200"
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">{t('explorar')}</span>
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* SIDEBAR MOBILE */}
      <div className={`fixed top-0 right-0 h-full w-[320px] md:w-[400px] bg-white z-[110] shadow-2xl transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 flex justify-between items-center border-b border-gray-50">
          <div className="flex items-center gap-1 text-blue-600 font-bold">
            <span className="text-3xl italic">M</span>
            <span className="text-xl uppercase text-gray-800 tracking-tighter">Morabeza</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <X size={28} />
          </button>
        </div>

        <div className="p-8 space-y-4">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-4">Idioma</p>
          <div className="grid grid-cols-5 gap-2 px-4 mb-8"> {/* Mudado para grid-cols-5 para caber o EN */}
            {['pt', 'en', 'fr', 'es', 'de'].map((lng) => (
              <button 
                key={lng}
                onClick={() => { changeLanguage(lng); setIsOpen(false); }}
                className={`py-2 text-[10px] font-bold rounded-lg border ${i18n.language === lng ? "bg-blue-600 text-white border-blue-600 shadow-lg" : "bg-gray-50 text-gray-400 border-gray-100"}`}
              >
                {lng.toUpperCase()}
              </button>
            ))}
          </div>

          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-4">Navegação</p>
          {navLinks.map((link, index) => (
            <Link key={index} to={link.path} onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 hover:bg-blue-50 text-gray-700 rounded-2xl transition-all group">
              <span className="Stext-gray-400 group-hover:text-blue-500 transition-colors">{link.icon}</span>
              <span className="font-bold">{link.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;