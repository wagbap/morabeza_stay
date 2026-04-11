import React from 'react';
import { MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CardAlojamento = ({ id, imagem_url, titulo, localizacao, preco_noite, tipo, estrelas, comodidades, imagens_extra }) => {
  const { t } = useTranslation();
  const BASE_URL_IMAGENS = "https://welovepalop.com/api/uploads/"; 
  const imagemCompleta = imagem_url ? `${BASE_URL_IMAGENS}${imagem_url}` : "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400";

  return (
    <div className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
      <div className="relative h-64 overflow-hidden">
        <img src={imagemCompleta} alt={titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <button className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition-all shadow-lg">
          <Heart size={18} />
        </button>
        <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
          {t(tipo?.toLowerCase() || 'alojamento')}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 text-left">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors uppercase">{titulo}</h3>
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl">
            <span className="text-amber-600 font-black text-xs">{estrelas || '4.8'}</span>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6 text-left">
          <MapPin size={14} className="text-blue-500" /> {localizacao}
        </p>

        <div className="mt-auto pt-5 border-t border-gray-50 flex justify-between items-end">
          <div className="text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('por_noite')}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-900">{Number(preco_noite).toLocaleString('pt-PT')}</span>
              <span className="text-xs font-black text-blue-600 uppercase">CVE</span>
            </div>
          </div>
          {/* O LINK QUE PASSA OS DADOS PARA A PÁGINA DE DETALHES */}
          <Link 
            to={`/alojamento/${id}`} 
            state={{ alojamento: { id, imagem_url, titulo, localizacao, preco_noite, tipo, estrelas, comodidades, imagens_extra } }}
            className="bg-gray-900 hover:bg-blue-600 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
          >
            {t('ver_estadia')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CardAlojamento;