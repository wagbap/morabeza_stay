import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Globe, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6 mt-auto text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* Layout idêntico de 5 Colunas */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-16 items-start">
          
          {/* Coluna 1: Logo Completo + Slogan + Descrição */}
          <div className="flex flex-col items-start pr-4">
            <img 
              src="https://res.cloudinary.com/dpsrmzvsl/image/upload/v1789483856/1786367190_6a79ccd660afb_0-removebg-preview_z4ql0r.png" 
              alt="MorabezaStay Logo" 
              className="h-28 w-auto object-contain -ml-3 mb-2"
            />

            <p className="text-xs font-semibold text-gray-500 mb-4 flex items-center gap-1">
              <span className="text-gray-300">—</span> 
              {t('footer_slogan', 'Sinta-se em casa, em qualquer ilha.')} 
              <span className="text-gray-300">—</span>
            </p>

            <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
              {t('A tua porta de entrada para experiências inesquecíveis em Cabo Verde. Conforto aventura e a hospitalidade que nos define.', 'A tua porta de entrada para experiências inesquecíveis em Cabo Verde. Conforto, aventura e a hospitalidade que nos define.')}
            </p>
          </div>

          {/* Coluna 2: EXPLORAR */}
          <div className="lg:border-l lg:border-gray-100 lg:pl-8 flex flex-col items-start">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-2">
              {t('footer_explore', 'EXPLORAR')}
            </h4>
            <div className="w-6 h-0.5 bg-emerald-500 mb-6"></div>

            <ul className="space-y-3 text-xs text-gray-600 font-medium">
              <li><Link to="/alojamentos" className="hover:text-blue-600 transition-colors">{t('menu_alojamentos', 'Alojamentos')}</Link></li>
              <li><Link to="/carros" className="hover:text-blue-600 transition-colors">{t('menu_carros', 'Carros')}</Link></li>
              <li><Link to="/experiencias" className="hover:text-blue-600 transition-colors">{t('menu_experiencias', 'Experiências')}</Link></li>
              <li><Link to="/como-funciona" className="hover:text-blue-600 transition-colors">{t('footer_how_it_works', 'Como Funciona')}</Link></li>
              <li><Link to="/seja-anfitriao" className="hover:text-blue-600 transition-colors">{t('footer_become_host', 'Seja um Anfitrião')}</Link></li>
               <li><Link to="/admin/login" className="hover:text-blue-600 transition-colors">{t('Administração', 'Administração')}</Link></li>
        
            </ul>
          </div>

          {/* Coluna 3: EMPRESA */}
          <div className="lg:border-l lg:border-gray-100 lg:pl-8 flex flex-col items-start">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-2">
              {t('footer_company', 'EMPRESA')}
            </h4>
            <div className="w-6 h-0.5 bg-emerald-500 mb-6"></div>

            <ul className="space-y-3 text-xs text-gray-600 font-medium">
              <li><Link to="/sobre-nos" className="hover:text-blue-600 transition-colors">{t('sobre_titulo', 'Sobre Nós')}</Link></li>
              <li><Link to="/contactos" className="hover:text-blue-600 transition-colors">{t('footer_contacts', 'Contactos')}</Link></li>
              <li><Link to="/privacidade" className="hover:text-blue-600 transition-colors">{t('footer_privacy', 'Política de Privacidade')}</Link></li>
              <li><Link to="/termos" className="hover:text-blue-600 transition-colors">{t('footer_terms', 'Termos e Condições')}</Link></li>
              <li><Link to="/cancelamento" className="hover:text-blue-600 transition-colors">{t('footer_cancellation', 'Política de Cancelamento')}</Link></li>
            </ul>
          </div>

          {/* Coluna 4: CONTACTO */}
          <div className="lg:border-l lg:border-gray-100 lg:pl-8 flex flex-col items-start">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-2">
              {t('footer_contact', 'CONTACTO')}
            </h4>
            <div className="w-6 h-0.5 bg-blue-600 mb-6"></div>

            <div className="space-y-4 text-xs font-medium text-gray-600">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                <span>{t('footer_address', 'Praia, Cabo Verde')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-blue-500 flex-shrink-0" />
                <a href="mailto:info@morabezastay.cv" className="hover:underline">
                  info@morabezastay.cv
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-emerald-500 flex-shrink-0" />
                <span>+238 590 00 00</span>
              </div>
            </div>
          </div>

          {/* Coluna 5: SIGA-NOS */}
          <div className="lg:border-l lg:border-gray-100 lg:pl-8 flex flex-col items-start">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-2">
              {t('footer_follow', 'SIGA-NOS')}
            </h4>
            <div className="w-6 h-0.5 bg-emerald-500 mb-6"></div>

            <div className="flex items-center gap-2">
              <a href="https://instagram.com/morabezastay" target="_blank" rel="noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-100 transition-colors">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://facebook.com/morabezastay" target="_blank" rel="noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="https://tiktok.com/@morabezastay" target="_blank" rel="noreferrer" aria-label="TikTok" className="w-8 h-8 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.67a6.34 6.34 0 0 0 10.86 4.46A6.29 6.29 0 0 0 15.86 16V9.1a8.16 8.16 0 0 0 4.73 1.5V7.14a4.85 4.85 0 0 1-1-.45z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Barra Inferior */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-500">
          
          {/* Copyright */}
          <p>© {new Date().getFullYear()} Morabeza Stay. Todos os direitos reservados.</p>

          {/* Reservas Seguras com Pagamentos em baixo */}
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
              <Lock size={12} className="text-emerald-500" />
              <span>Reservas seguras e pagamentos protegidos</span>
            </div>
            
            <div className="flex items-center gap-3 mt-0.5">
              <span className="font-bold text-blue-900 text-xs italic">VISA</span>
              <div className="flex -space-x-1">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 opacity-90"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 opacity-90"></div>
              </div>
              <span className="font-bold text-indigo-600 text-xs tracking-tight">stripe</span>
              <span className="font-bold text-blue-700 text-xs italic">PayPal</span>
            </div>
          </div>

          {/* Idioma */}
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900 transition-colors">
            <Globe size={14} className="text-gray-400" />
            <span>PT | EN</span>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);