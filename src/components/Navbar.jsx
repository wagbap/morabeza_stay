import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Car, Palmtree, Globe, ChevronDown } from 'lucide-react';
import LoginGoogle from './LoginGoogle';
import UserDropdown from './UserDropdown';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false); // Dropdown de línguas
  
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const langRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

    // Fechar dropdown de línguas ao clicar fora
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setUserDropdownOpen(false);
    window.location.reload();
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangDropdownOpen(false);
  };

  const navLinks = [
    { name: t('menu_inicio'), icon: <Home size={18} />, path: '/' },
    { name: t('menu_alojamentos'), icon: <Globe size={18} />, path: '/alojamentos' },
    { name: t('menu_carros'), icon: <Car size={18} />, path: '/carros' },
    { name: t('menu_experiencias'), icon: <Palmtree size={18} />, path: '/experiencias' },
  ];

  const languages = [
    { code: 'pt', label: 'Português' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'de', label: 'Deutsch' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[100] px-6 md:px-12 py-5 flex justify-between items-center transition-all duration-300 ${
        isHome 
          ? "bg-transparent border-b border-white/10 text-white" 
          : "bg-white shadow-md text-gray-900 border-b border-gray-100"
      }`}>
        
        {/* LOGO (Lado Esquerdo) */}
        <Link to="/" className="flex items-center gap-1 min-w-[150px]">
          <span className="text-3xl font-bold italic text-[#a5d6a7]">M</span>
          <span className={`text-xl font-bold uppercase tracking-widest ${isHome ? "text-white" : "text-gray-900"}`}>
            Morabeza<span className="font-light opacity-80 uppercase tracking-tighter">Stay</span>
          </span>
        </Link>

        {/* LINKS NO CENTRO 🎯 */}
        <div className={`hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] absolute left-1/2 -translate-x-1/2 ${isHome ? "text-white" : "text-gray-600"}`}>
          {navLinks.map((link, idx) => (
            <Link key={idx} to={link.path} className="hover:text-blue-400 transition-all opacity-80 hover:opacity-100 relative group">
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* LADO DIREITO (Ações) */}
        <div className="flex items-center gap-4 min-w-[150px] justify-end">
          
          {/* DROPDOWN DE LÍNGUAS 🌍 */}
          <div className="relative hidden sm:block" ref={langRef}>
            <button 
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest hover:opacity-100 opacity-80 transition-all ${isHome ? "text-white" : "text-gray-700"}`}
            >
              {i18n.language.substring(0, 2)}
              <ChevronDown size={12} className={`transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-3 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {languages.map((lng) => (
                  <button
                    key={lng.code}
                    onClick={() => changeLanguage(lng.code)}
                    className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 transition-colors ${i18n.language === lng.code ? "text-blue-600 bg-blue-50/50" : "text-gray-600"}`}
                  >
                    {lng.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* LOGIN / USER */}
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

          {/* BOTÃO MENU (Sidebar) */}
          <button 
            onClick={() => setIsOpen(true)} 
            className={`flex items-center gap-2 border p-2 rounded-full transition-all ${
              isHome 
                ? "bg-white/10 border-white/30 text-white hover:bg-white/20" 
                : "bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200"
            }`}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* SIDEBAR MOBILE */}
      <div className={`fixed top-0 right-0 h-full w-[300px] bg-white z-[110] shadow-2xl transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 flex justify-between items-center border-b border-gray-50">
          <span className="text-xl font-bold uppercase text-gray-800 tracking-tighter">Menu</span>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-2">
          {navLinks.map((link, index) => (
            <Link key={index} to={link.path} onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 hover:bg-blue-50 text-gray-700 rounded-2xl transition-all group">
              <span className="text-gray-400 group-hover:text-blue-500 transition-colors">{link.icon}</span>
              <span className="font-bold text-sm uppercase tracking-wider">{link.name}</span>
            </Link>
          ))}
          
          <div className="pt-6 mt-6 border-t border-gray-100">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-4">Idioma</p>
             <div className="grid grid-cols-2 gap-2 px-2">
                {languages.map((lng) => (
                  <button 
                    key={lng.code}
                    onClick={() => { changeLanguage(lng.code); setIsOpen(false); }}
                    className={`py-3 text-[10px] font-bold rounded-xl border transition-all ${i18n.language === lng.code ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"}`}
                  >
                    {lng.label}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;