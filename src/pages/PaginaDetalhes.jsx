import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  MapPin, Star, Heart, Share, ThumbsUp, X,
  Wifi, Snowflake, Tv, Coffee, Utensils, ChevronLeft, ChevronRight, Info, Loader2, ShieldCheck, Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const PaginaDetalhes = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [alojamento, setAlojamento] = useState(location.state?.alojamento || null);
  const [loading, setLoading] = useState(!alojamento);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (!alojamento && id) {
      const fetchAlojamento = async () => {
        try {
          setLoading(true);
          const response = await axios.get('https://welovepalop.com/api/get_alojamentos.php');
          const lista = Array.isArray(response.data) ? response.data : [];
          const encontrado = lista.find(item => String(item.id) === String(id));
          if (encontrado) setAlojamento(encontrado);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
      };
      fetchAlojamento();
    }
    window.scrollTo(0, 0); // Garante que a página abre no topo
  }, [id, alojamento]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Morabeza Stay</span>
    </div>
  );

  const BASE_URL_IMAGENS = "https://welovepalop.com/api/uploads/";
  const imgPrincipal = alojamento?.imagem_url ? `${BASE_URL_IMAGENS}${alojamento.imagem_url}` : "https://images.unsplash.com/photo-1566073771259-6a8506099945";
  const fotosExtras = (alojamento?.imagens_extra || []).map(img => `${BASE_URL_IMAGENS}${img.caminho_url}`);
  const todasAsFotos = [imgPrincipal, ...fotosExtras];
  const fotosGrelha = [...todasAsFotos];
  while (fotosGrelha.length < 5) fotosGrelha.push("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600");

  const iconMap = {
    wifi: <Wifi size={18} className="text-[#006ce4]" />,
    snowflake: <Snowflake size={18} className="text-[#006ce4]" />,
    tv: <Tv size={18} className="text-[#006ce4]" />,
    coffee: <Coffee size={18} className="text-[#006ce4]" />,
    utensils: <Utensils size={18} className="text-[#006ce4]" />
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 md:px-6 font-sans animate-in fade-in duration-500">
      
      {/* --- MODAL DA GALERIA (Navega por TODAS as fotos) --- */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <button onClick={() => setIsGalleryOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest z-50">
            Fechar <X size={24} />
          </button>

          <div className="relative w-full max-w-5xl px-4 flex items-center justify-center">
            <button onClick={() => setPhotoIndex((photoIndex - 1 + todasAsFotos.length) % todasAsFotos.length)} className="absolute left-0 p-4 text-white/50 hover:text-white transition z-50">
              <ChevronLeft size={48} />
            </button>
            <img src={todasAsFotos[photoIndex]} className="max-h-[80vh] w-auto object-contain shadow-2xl rounded-lg select-none transition-all duration-500" alt="Preview" />
            <button onClick={() => setPhotoIndex((photoIndex + 1) % todasAsFotos.length)} className="absolute right-0 p-4 text-white/50 hover:text-white transition z-50">
              <ChevronRight size={48} />
            </button>
          </div>

          <div className="mt-8 text-white/60 font-bold text-sm tracking-widest uppercase">
            {photoIndex + 1} / {todasAsFotos.length}
          </div>
        </div>
      )}

      {/* NAVEGAÇÃO / CABEÇALHO (Mantido original) */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-[#006ce4] font-bold text-[11px] uppercase mb-6 transition-all">
        <ChevronLeft size={16} /> {t('voltar_busca', 'Voltar para os resultados')}
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 text-left">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#003580] text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Genius</span>
            <div className="flex text-amber-400">
              {[...Array(Math.floor(Number(alojamento.estrelas || 4)))].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <span className="text-amber-400"><ThumbsUp size={14} fill="currentColor" /></span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight uppercase">{alojamento.titulo}</h1>
          <div className="flex items-center gap-1 text-[#006ce4] mt-2 font-bold text-sm">
            <MapPin size={16} /> <span className="underline cursor-pointer">{alojamento.localizacao}</span>
          </div>
        </div>
        <div className="flex gap-3">
            <button className="p-2.5 text-[#006ce4] hover:bg-blue-50 rounded-full transition"><Heart size={24} /></button>
            <button className="p-2.5 text-[#006ce4] hover:bg-blue-50 rounded-full transition"><Share size={24} /></button>
            <button className="bg-[#006ce4] hover:bg-[#0056b3] text-white px-8 py-3 rounded-md font-bold text-sm transition-all shadow-md">Reserve agora</button>
        </div>
      </div>

      {/* --- GRELHA DE FOTOS DINÂMICA --- */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[350px] md:h-[500px] mb-12 rounded-xl overflow-hidden shadow-lg cursor-pointer">
        {/* Foto 1 (Esquerda, Grande) */}
        <div className="col-span-2 row-span-2 group overflow-hidden" onClick={() => abrirGaleria(0)}>
          <img src={fotosGrelha[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="1" />
        </div>
        
        {/* Fotos 2, 3 e 4 (Pequenas Direita) */}
        <div className="col-span-1 row-span-1 overflow-hidden" onClick={() => abrirGaleria(1)}>
          <img src={fotosGrelha[1]} className="w-full h-full object-cover hover:brightness-110 transition" alt="2" />
        </div>
        <div className="col-span-1 row-span-1 overflow-hidden" onClick={() => abrirGaleria(2)}>
          <img src={fotosGrelha[2]} className="w-full h-full object-cover hover:brightness-110 transition" alt="3" />
        </div>
        <div className="col-span-1 row-span-1 overflow-hidden" onClick={() => abrirGaleria(3)}>
          <img src={fotosGrelha[3]} className="w-full h-full object-cover hover:brightness-110 transition" alt="4" />
        </div>

        {/* Foto 5 (Com Contador se houver mais de 5) */}
        <div className="col-span-1 row-span-1 relative group overflow-hidden" onClick={() => abrirGaleria(4)}>
          <img src={fotosGrelha[4]} className="w-full h-full object-cover" alt="5" />
          {todasAsFotos.length > 5 && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white font-bold opacity-100 group-hover:bg-black/30 transition">
              <span className="text-xl">+{todasAsFotos.length - 5}</span>
              <span className="text-[10px] uppercase tracking-widest">fotos</span>
            </div>
          )}
        </div>
      </div>

      {/* CONTEÚDO INFERIOR (Mantido original) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">O que este lugar oferece</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
            {alojamento.comodidades?.map((com, index) => (
                <div key={index} className="flex items-center gap-3 text-gray-700 font-medium text-sm">
                  {iconMap[com.icone] || <Info size={18}/>}
                  <span>{com.nome}</span>
                </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-[#006ce4]/10 h-fit shadow-xl">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Preço por noite</p>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-extrabold text-gray-900">{Number(alojamento.preco_noite).toLocaleString('pt-PT')}</span>
            <span className="text-sm font-bold text-[#006ce4]">CVE</span>
          </div>
          <button className="w-full bg-[#006ce4] text-white py-4 rounded-md font-bold uppercase text-xs tracking-widest">Confirmar Reserva</button>
        </div>
      </div>
    </div>
  );
};

export default PaginaDetalhes;