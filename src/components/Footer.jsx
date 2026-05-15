import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Componente de Ícone Social para evitar repetição de código (DRY - Don't Repeat Yourself)
const SocialLink = ({ href, children }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
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
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 mb-6">{t('footer_explore', 'Explorar')}</h4>
            <ul className="space-y-4">
              <li><Link to="/alojamentos" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">{t('menu_alojamentos')}</Link></li>
              <li><Link to="/carros" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">{t('menu_carros')}</Link></li>
              <li><Link to="/experiencias" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">{t('menu_experiencias')}</Link></li>
            </ul>
          </div>

          {/* Contacts */}
          <div className="flex flex-col items-start">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 mb-6">{t('footer_contact', 'Contacto')}</h4>
            <div className="space-y-5 mb-8">
              <div className="flex items-center gap-3.5 text-gray-400 text-sm font-bold">
                <MapPin size={18} className="text-blue-500 flex-shrink-0" />
                <span>Praia, Cabo Verde</span>
              </div>
              <div className="flex items-center gap-3.5 text-gray-400 text-sm font-bold">
                <Mail size={18} className="text-blue-500 flex-shrink-0" />
                <span>info@morabezastay.cv</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex flex-col items-start">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 mb-6">{t('footer_follow', 'Siga-nos')}</h4>
            <div className="flex gap-4">
              <SocialLink href="https://instagram.com/morabezastay">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </SocialLink>
              {/* Outros ícones aqui... */}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            © {new Date().getFullYear()} Morabeza Stay. {t('footer_rights', 'Todos os direitos reservados.')}
          </p>  
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors">
            <Globe size={14} /> <span>PT / EN</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);