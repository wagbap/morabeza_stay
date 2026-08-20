import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Componente de Ícone Social para evitar repetição de código (DRY - Don't Repeat Yourself)
const SocialLink = ({ href, children, label }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    aria-label={label}
    className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-100 transition-all active:scale-95 flex items-center justify-center"
  >
    {children}
  </a>
);

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 px-6 mt-auto text-left">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="flex flex-col items-start">
            <h2 className="text-2xl font-black tracking-tighter italic uppercase mb-6">
              Morabeza<span className="text-blue-600">Stay</span>
            </h2>
            <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xs">
              {t('footer_description', 'A tua porta de entrada para experiências inesquecíveis em Cabo Verde.')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-start">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 mb-6">
              {t('footer_explore', 'Explorar')}
            </h4>
            <ul className="space-y-4">
              <li>
                <Link to="/alojamentos" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">
                  {t('menu_alojamentos', 'Alojamentos')}
                </Link>
              </li>
              <li>
                <Link to="/carros" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">
                  {t('menu_carros', 'Carros')}
                </Link>
              </li>
              <li>
                <Link to="/experiencias" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">
                  {t('menu_experiencias', 'Experiências')}
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">
                  {t('footer_admin', 'Administração')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal/Support Links */}
          <div className="flex flex-col items-start">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 mb-6">
              {t('footer_legal', 'Legal')}
            </h4>
            <ul className="space-y-4">
              <li>
                <Link to="/privacidade" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">
                  {t('footer_privacy', 'Política de privacidade')}
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">
                  {t('footer_terms', 'Termos e Condições')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">
                  {t('footer_faq', 'FAQ')}
                </Link>
              </li>
              <li>
                <Link to="/cancelamento" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">
                  {t('footer_cancellation', 'Política de Cancelamento')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts & Social Media */}
          <div className="flex flex-col items-start">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 mb-6">
              {t('footer_contact', 'Contacto')}
            </h4>
            <div className="space-y-5 mb-8">
              <div className="flex items-center gap-3.5 text-gray-400 text-sm font-bold">
                <MapPin size={18} className="text-blue-500 flex-shrink-0" />
                <span>{t('footer_address', 'Praia, Cabo Verde')}</span>
              </div>
              <div className="flex items-center gap-3.5 text-gray-400 text-sm font-bold">
                <Mail size={18} className="text-blue-500 flex-shrink-0" />
                <span>morabezastay@gmail.com</span>
              </div>
            </div>
            
            {/* Social Media */}
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 mb-6">
              {t('footer_follow', 'Siga-nos')}
            </h4>
            <div className="flex flex-wrap gap-4">
              {/* Instagram */}
              <SocialLink 
                href="https://instagram.com/morabezastay" 
                label="Instagram"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </SocialLink>

              {/* Facebook */}
              <SocialLink 
                href="https://facebook.com/morabezastay" 
                label="Facebook"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </SocialLink>

              {/* TikTok */}
              <SocialLink 
                href="https://tiktok.com/@morabezastay" 
                label="TikTok"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                </svg>
              </SocialLink>

              {/* YouTube */}
              <SocialLink 
                href="https://youtube.com/@morabezastay" 
                label="YouTube"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                </svg>
              </SocialLink>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            © {new Date().getFullYear()} Morabeza Stay. {t('footer_rights', 'Todos os direitos reservados.')}
          </p>  
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors">
            <Globe size={14} /> 
            <span>{t('footer_language', 'PT / EN')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);