import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Globe } from 'lucide-react'; // Mantemos apenas os ícones seguros do Lucide

// SVGs Inline para garantir compatibilidade e design fiel à foto
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const IconTwitter = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
);

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 px-6 mt-auto text-left">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Logo e Descrição - Estilo Premium */}
          <div className="flex flex-col items-start">
            <h2 className="text-2xl font-black tracking-tighter italic uppercase mb-6">
              Morabeza<span className="text-blue-600">Stay</span>
            </h2>
            <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xs">
              A tua porta de entrada para experiências inesquecíveis em Cabo Verde. Conforto, aventura e a hospitalidade que nos define.
            </p>
          </div>

          {/* Links Rápidos */}
          <div className="flex flex-col items-start">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Explorar</h4>
            <ul className="space-y-4">
              <li><Link to="/alojamentos" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">Alojamentos</Link></li>
              <li><Link to="/carros" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">Carros</Link></li>
              <li><Link to="/experiencias" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">Experiências</Link></li>
              <li><Link to="/mapa" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">Mapa Interativo</Link></li>
            </ul>
          </div>

          {/* Contactos com Ícone de Mapa Incluído */}
          <div className="flex flex-col items-start">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Contacto</h4>
            <div className="space-y-5 mb-8">
              <div className="flex items-center gap-3.5 text-gray-400 text-sm font-bold">
                <MapPin size={18} className="text-blue-500 flex-shrink-0" /> {/* Ícone de Mapa fiel à foto */}
                <span>Praia, Cabo Verde</span>
              </div>
              <div className="flex items-center gap-3.5 text-gray-400 text-sm font-bold">
                <Mail size={18} className="text-blue-500 flex-shrink-0" />
                <span>info@morabezastay.cv</span>
              </div>
            </div>
          </div>

          {/* Siga-nos - Com SVGs Inline */}
          <div className="flex flex-col items-start">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Siga-nos</h4>
            <div className="flex gap-4">
              {/* Link do Instagram com SVG e Hover Arredondado */}
              <a href="#" className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-100 transition-all active:scale-95 flex items-center justify-center">
                <IconInstagram />
              </a>
              {/* Link do Facebook com SVG Solucionado */}
              <a href="#" className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-100 transition-all active:scale-95 flex items-center justify-center">
                <IconFacebook />
              </a>
              {/* Link do Twitter/X com SVG */}
              <a href="#" className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-100 transition-all active:scale-95 flex items-center justify-center">
                <IconTwitter />
              </a>
            </div>
          </div>

        </div>

        {/* Linha Final de Copyright com Ícone de Globo */}
        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            © 2026 Morabeza Stay. Todos os direitos reservados.
          </p>  
          <div className="flex gap-8">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors">
              <Globe size={14} /> <span>PT / EN</span> {/* Ícone de Globo fiel à foto */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;