import NavbarNotificacoes from './NavbarNotificacoes';
import { idiomas, idiomaAtual } from '../utils/idiomas';
import useManagementSession from '../hooks/useManagementSession';
import { SESSION_KEYS } from '../utils/managementSession';
// src/components/Navbar.jsx
import React, { useState, useEffect, useRef, useId } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, HousePlus, Car, Palmtree, Globe, ChevronDown, Info } from 'lucide-react';
import UserDropdown from './UserDropdown';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userRoles } = useManagementSession();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const langRef = useRef(null);
  const registoTooltipId = useId();

  const paginasComHero = ['/', '/experiencias', '/alojamentos', '/carros', '/veiculos', '/sobre'];
  const isHeroPage = paginasComHero.includes(location.pathname);

  useEffect(() => {

    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    for (const key of SESSION_KEYS) {
      try { localStorage.removeItem(key); } catch { /* Continue logout. */ }
    }
    window.dispatchEvent(new Event('userUpdated'));
    setUserDropdownOpen(false);
    window.location.replace('/');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangDropdownOpen(false);
  };

  const navLinks = [
    { name: t('menu_inicio'), icon: <Home size={18} />, path: '/' },
    { name: t('menu_sobre', 'Sobre Nós'), icon: <Info size={18} />, path: '/sobre' },
    { name: t('menu_alojamentos'), icon: <Globe size={18} />, path: '/alojamentos' },
    { name: t('menu_carros'), icon: <Car size={18} />, path: '/carros' },
    { name: t('menu_experiencias'), icon: <Palmtree size={18} />, path: '/experiencias' },
  ];

  const languages = idiomas;
  const currentLanguage = idiomaAtual(i18n.resolvedLanguage || i18n.language);

  const getNavbarClasses = () => {
    if (isHeroPage) {
      return "absolute top-0 left-0 bg-transparent text-white";
    } else {
      return "relative bg-white shadow-md text-gray-900 border-b border-gray-100";
    }
  };

  return (
    <>
      <nav className={`w-full z-[100] px-4 md:px-12 py-3.5 md:py-5 flex justify-between items-center gap-3 lg:gap-0 transition-all duration-300 ${getNavbarClasses()}`}>
        
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Link to="/" className="flex items-center min-w-0 shrink-0 lg:min-w-[150px] lg:shrink">
          <img 
            src="https://res.cloudinary.com/dpsrmzvsl/image/upload/v1781877448/logo_morabeza_r1s2ne.png" 
            alt="Morabeza Stay Logo" 
            className="h-auto w-28 sm:w-36 lg:h-10 lg:w-auto object-contain"
          />
        </Link>
        </div>

        {/* MENU DESKTOP */}
        <div className={`hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] absolute left-1/2 -translate-x-1/2 transition-colors ${
          isHeroPage ? "text-white" : "text-gray-600"
        }`}>
          {navLinks.map((link, idx) => (
            <Link 
              key={idx} 
              to={link.path} 
              className="hover:text-blue-400 transition-all opacity-80 hover:opacity-100 relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-4">
          
          <div className="relative shrink-0" ref={langRef}>
            <button 
              type="button" aria-label={t('idioma_seletor')} aria-expanded={langDropdownOpen}
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className={`flex min-h-10 lg:min-h-0 items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest hover:opacity-100 opacity-80 transition-all ${
                isHeroPage ? "text-white" : "text-gray-700"
              }`}
            >
              <img src={`/images/flags/${currentLanguage.flag}.svg`} alt="" className="h-4 w-6 rounded-sm object-cover" />
              <span className="hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
              <ChevronDown size={12} className={`transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-3 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden z-50">
                {languages.map((lng) => (
                  <button
                    key={lng.code}
                    onClick={() => changeLanguage(lng.code)}
                    className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 transition-colors ${
                      i18n.language === lng.code ? "text-blue-600 bg-blue-50/50" : "text-gray-600"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2"><img src={`/images/flags/${lng.flag}.svg`} alt="" className="h-4 w-6 rounded-sm object-cover" />{lng.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        {user && <NavbarNotificacoes key={user.id || user.email} userId={user.id || user.email} hero={isHeroPage} />}

          {/* BOTÃO DE REGISTAR PROPRIEDADE OU USER DROPDOWN */}
          {!user ? (
            <div className="group relative shrink-0">
            <Link
              to="/login"
              aria-label={t('registe_sua_propriedade')}
              aria-describedby={registoTooltipId}
              className={`flex h-10 w-10 items-center justify-center lg:h-auto lg:w-auto lg:px-4 lg:py-2 text-[11px] lg:text-sm font-semibold lg:font-bold rounded-lg transition-all shadow-sm whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                isHeroPage 
                  ? "bg-white text-[#003580] hover:bg-gray-100" 
                  : "bg-[#003580] text-white hover:bg-[#002560]"
              }`}
            >
              <span className="lg:hidden"><HousePlus size={18} strokeWidth={1.75} aria-hidden="true" /></span>
              <span className="hidden lg:inline">{t('registe_sua_propriedade')}</span>
            </Link>
            <span
              id={registoTooltipId}
              role="tooltip"
              className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-44 rounded-lg bg-blue-500 px-3 py-2 text-center text-[10px] font-medium leading-relaxed text-white shadow-lg shadow-blue-900/15 opacity-0 invisible translate-y-1 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0"
            >
              <span className="absolute -top-1 right-4 h-2 w-2 rotate-45 bg-blue-500" aria-hidden="true" />
              {t('navbar_registo_dica', 'Registe a sua propriedade ou inicie sessão no sistema.')}
            </span>
            </div>
          ) : (
            <UserDropdown 
              user={user}
              userRoles={userRoles}
              onLogout={handleLogout} 
              isOpen={userDropdownOpen} 
              setIsOpen={setUserDropdownOpen} 
            />
          )}

          <button 
            onClick={() => setIsOpen(true)} 
            className={`flex items-center gap-2 border p-2 rounded-full transition-all ${
              isHeroPage 
                ? "bg-white/10 border-white/30 text-white hover:bg-white/20" 
                : "bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200"
            }`}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Sidebar de navegação móvel */}
      <div className={`fixed top-0 right-0 h-full w-[300px] bg-white z-[110] shadow-2xl transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 flex justify-between items-center border-b border-gray-50">
          <span className="text-xl font-bold uppercase text-gray-800 tracking-tighter">Menu</span>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-2 text-left">
          {navLinks.map((link, index) => (
            <Link 
              key={index} 
              to={link.path} 
              onClick={() => setIsOpen(false)} 
              className="flex items-center gap-4 p-4 hover:bg-blue-50 text-gray-700 rounded-2xl transition-all group"
            >
              <span className="text-gray-400 group-hover:text-blue-500 transition-colors">{link.icon}</span>
              <span className="font-bold text-sm uppercase tracking-wider">{link.name}</span>
            </Link>
          ))}
          
          <div className="pt-6 mt-6 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-4">{t('idioma_seletor')}</p>
            <div className="grid grid-cols-2 gap-2 px-2">
              {languages.map((lng) => (
                <button 
                  key={lng.code}
                  onClick={() => { changeLanguage(lng.code); setIsOpen(false); }}
                  className={`py-3 text-[10px] font-bold rounded-xl border transition-all ${
                    i18n.language === lng.code ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                  }`}
                >
                  <span className="inline-flex items-center gap-2"><img src={`/images/flags/${lng.flag}.svg`} alt="" className="h-4 w-6 rounded-sm object-cover" />{lng.label}</span>
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
