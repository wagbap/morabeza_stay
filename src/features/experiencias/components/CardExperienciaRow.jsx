import React from 'react';
import { Star, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const CardExperienciaRow = ({ dados }) => {
   const navigate = useNavigate();


  if (!dados) return null;

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-md border border-gray-100 flex flex-col md:flex-row w-full transition-all hover:shadow-lg">
      
      {/* Área da Imagem */}
      <div className="relative w-full md:w-[40%] h-64 md:h-auto overflow-hidden">
        <img 
          src={dados.imagem_principal} 
          alt={dados.titulo}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        {/* Badge da Categoria */}
        <div className="absolute top-4 left-4">
          <span className="bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
            {dados.categoria_nome}
          </span>
        </div>
      </div>

      {/* Conteúdo à Direita */}
      <div className="p-8 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter leading-tight">
              {dados.titulo}
            </h3>
          </div>

          <p className="text-gray-500 text-sm line-clamp-2 mb-6 font-medium">
            {dados.descricao_curta}
          </p>

          <div className="flex flex-wrap items-center gap-6 mb-6">
            {/* Preço */}
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none">
                {dados.preco} CVE <span className="text-xs text-gray-400 font-bold">/pessoa</span>
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-xl">
              <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
              <span className="text-orange-600 font-black text-sm">{dados.rating_formatado}</span>
              <span className="text-gray-400 text-xs font-bold">({dados.total_reviews})</span>
            </div>
          </div>
        </div>

        {/* Rodapé do Card */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
          <div className="flex items-center gap-2 text-gray-400">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{dados.localizacao}</span>
          </div>
          
         <button 
            onClick={() => navigate(`/experiencia/${dados.slug}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3 rounded-2xl transition-all flex items-center gap-2 group text-sm uppercase italic"
          >
            Ver detalhes
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
        </div>
      </div>
    </div>
  );
};

export default CardExperienciaRow;