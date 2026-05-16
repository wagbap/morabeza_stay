import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  Users, Bed, Bath, Wifi, Wind, Coffee, MapPin, Star, 
  ChevronRight, ChevronLeft, LayoutGrid, Camera,
  CheckCircle, ExternalLink, ChevronDown, X, Loader2
} from 'lucide-react';
import AvaliacoesSeccaoAlojamento from './AvaliacoesSeccaoAlojamento';

const ImageSliderModal = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
        aria-label="Fechar"
      >
        <X size={24} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
        aria-label="Imagem anterior"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
        aria-label="Próxima imagem"
      >
        <ChevronRight size={24} />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} / {images.length}
      </div>
      <img 
        src={images[currentIndex]} 
        alt={`Imagem ${currentIndex + 1}`}
        className="max-w-[90vw] max-h-[90vh] object-contain cursor-pointer"
        onClick={handleModalClick}
      />
    </div>
  );
};

const TabsNavegacaoAlojamentos = ({ activeTab = 0, onTabChange }) => {
  const tabs = [
    { id: 0, label: 'Visão Geral' },
    { id: 1, label: 'Comodidades' },
    { id: 2, label: 'Regras da Casa' },
    { id: 4, label: 'Localização' },
  ];

  return (
    <div className="border-b border-slate-200 mb-6">
      <div className="flex gap-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-[#003580] border-b-2 border-[#003580]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const HostInfo = ({ proprietario }) => {
  if (!proprietario) return null;
  
  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <img 
            src={proprietario.foto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"} 
            alt={proprietario.nome} 
            className="w-12 h-12 rounded-full object-cover border border-slate-100"
          />
          {proprietario.superhost && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <CheckCircle className="text-orange-500 fill-orange-500" size={14} />
            </div>
          )}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">Anfitrião: {proprietario.nome}</h4>
          <p className="text-[10px] text-slate-500 font-medium">
            {proprietario.superhost ? 'Superhost • ' : ''}{proprietario.tempo_resposta || 'Responde rápido'}
          </p>
        </div>
      </div>
      <button className="w-full py-2.5 border border-[#003580] text-[#003580] text-[11px] font-bold rounded-xl hover:bg-slate-50 transition-colors">
        Contactar anfitrião
      </button>
    </div>
  );
};

const MapLocation = ({ localizacao, pontosProximos, endereco }) => {
  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">Localização</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{localizacao}</p>
        </div>
        <button className="flex items-center gap-1 text-[#003580] text-[10px] font-bold hover:underline">
          Ver no mapa <ExternalLink size={10} />
        </button>
      </div>
      <div className="relative w-full h-[140px] rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
        <img 
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=400&h=200&fit=crop" 
          alt="Mapa" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <MapPin size={24} className="text-[#003580] fill-[#003580]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-1 bg-black/20 blur-sm rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarReserva = ({ precoPorNoite, estrelas, datasBloqueadas = [], onContinueToCheckout }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [numHospedes, setNumHospedes] = useState(2);
  const [showCalendar, setShowCalendar] = useState(false);

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      setTimeout(() => setShowCalendar(false), 300);
    }
  };

  const noites = startDate && endDate 
    ? Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)))
    : 1;

  const totalBase = precoPorNoite * noites;

  const handleContinue = () => {
    if (!startDate || !endDate) {
      alert("Por favor, selecione as datas de Check-in e Check-out");
      return;
    }
    
    if (onContinueToCheckout) {
      onContinueToCheckout({
        startDate,
        endDate,
        numHospedes,
        noites,
        totalBase
      });
    }
  };

  return (
    <div className="lg:block">
      <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-lg">
        <div className="flex justify-between items-end mb-5">
          <div className="text-2xl font-bold text-slate-900">
            {precoPorNoite.toLocaleString()} CVE 
            <span className="text-sm font-normal text-slate-500"> / noite</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
            <Star size={14} className="fill-orange-500 text-orange-500" /> {estrelas}
          </div>
        </div>

        <div className="border border-slate-300 rounded-xl mb-4 overflow-visible relative">
          <div 
            className="flex border-b border-slate-300 cursor-pointer hover:bg-slate-50 transition-all rounded-t-xl"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <div className="flex-1 p-2.5 border-r border-slate-300">
              <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Check-in</label>
              <div className="text-xs font-bold text-slate-900">
                {startDate ? startDate.toLocaleDateString('pt-PT') : 'Data'}
              </div>
            </div>
            <div className="flex-1 p-2.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Check-out</label>
              <div className="text-xs font-bold text-slate-900">
                {endDate ? endDate.toLocaleDateString('pt-PT') : 'Data'}
              </div>
            </div>
          </div>

          {showCalendar && (
            <div className="absolute right-0 md:-right-40 top-full mt-2 z-[100] shadow-2xl rounded-2xl bg-white border border-slate-200 p-3 max-w-[95vw] md:max-w-none overflow-x-auto">
              <DatePicker
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                monthsShown={2}
                inline
                minDate={new Date()}
                excludeDates={datasBloqueadas.map(d => new Date(d))}
                calendarClassName="morabeza-calendar-inline"
              />
              <div className="p-2 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setShowCalendar(false)} 
                  className="text-[#003580] font-bold text-[10px] uppercase"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          <div className="p-2.5 flex justify-between items-center relative">
            <div className="flex-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Hóspedes</label>
              <select 
                value={numHospedes}
                onChange={(e) => setNumHospedes(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-slate-900 outline-none w-full cursor-pointer appearance-none"
              >
                <option value="1">1 hóspede</option>
                <option value="2">2 hóspedes</option>
                <option value="3">3 hóspedes</option>
                <option value="4">4 hóspedes</option>
                <option value="5">5 hóspedes</option>
                <option value="6">6 hóspedes</option>
              </select>
            </div>
            <ChevronDown size={14} className="text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-3 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600">
              Preço por noite ({noites} {noites === 1 ? 'noite' : 'noites'})
            </span>
            <span className="text-xs font-bold text-blue-600">
              {precoPorNoite.toLocaleString()} CVE × {noites} = {totalBase.toLocaleString()} CVE
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <span className="text-sm font-bold text-slate-600">Total (sem taxas)</span>
            <span className="text-base font-bold text-blue-600">
              {totalBase.toLocaleString()} CVE
            </span>
          </div>
        </div>

        <button 
          onClick={handleContinue}
          className="w-full bg-[#003580] text-white font-bold py-3 rounded-xl mb-4 mt-8 hover:bg-blue-900 transition-all shadow-lg text-sm"
        >
          Continuar para reserva
        </button>

        <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
          <CheckCircle className="text-green-600 mt-0.5" size={14} />
          <div>
            <h5 className="text-xs font-bold text-green-800 tracking-tight">Cancelamento gratuito</h5>
            <p className="text-[10px] text-green-700 leading-tight">Até 48 horas antes do check-in</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AmenitiesBar = ({ infoBasica, comodidades }) => {
  const amenities = [
    { icon: Users, label: `${infoBasica?.capacidade || 4} Hóspedes`, sub: 'Máximo de pessoas', show: true },
    { icon: Bed, label: `${infoBasica?.quartos || 2} Quartos`, sub: 'Camas confortáveis', show: true },
    { icon: Bath, label: `${infoBasica?.casas_banho || 2} Casas de banho`, sub: 'Água quente', show: true },
    { icon: Wifi, label: 'Wi-Fi', sub: infoBasica?.wifi ? 'Rápido e gratuito' : 'Disponível', show: true },
    { icon: Wind, label: 'Ar Condicionado', sub: infoBasica?.ar_condicionado ? 'Todos os quartos' : 'Disponível', show: true },
    { icon: Coffee, label: 'Cozinha', sub: infoBasica?.cozinha ? 'Totalmente equipada' : 'Básica', show: true },
  ].filter(a => a.show);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {amenities.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="text-slate-400 shrink-0">
            <item.icon size={18} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-900 leading-tight">{item.label}</span>
            <span className="text-[9px] text-slate-400 font-medium">{item.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const ImageGallery = ({ images, mainImageIndex, onImageChange, onOpenModal, onPrev, onNext, titulo, tipo }) => {
  return (
    <div className="relative">
      <div className="relative group">
        <div 
          className="relative rounded-2xl overflow-hidden shadow-xl shadow-blue-900/10 cursor-pointer"
          onClick={onOpenModal}
        >
          <div className="h-[320px] md:h-[420px]">
            <img 
              src={images[mainImageIndex]} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt={titulo} 
            />
          </div>
          <div className="absolute bottom-4 left-4 bg-[#003580] text-white px-4 py-2 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase shadow-lg z-10">
            <LayoutGrid size={12} /> {tipo || 'Apartamento'} Premium
          </div>
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium backdrop-blur-sm z-10">
            <Camera size={14} /> Ver fotos
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
          aria-label="Imagem anterior"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
          aria-label="Próxima imagem"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm z-10">
          {mainImageIndex + 1} / {images.length}
        </div>
      </div>

      <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className={`relative w-20 h-14 md:w-24 md:h-16 rounded-xl overflow-hidden transition-all duration-200 ${
              idx === mainImageIndex 
                ? 'ring-2 ring-[#003580] ring-offset-2 scale-105' 
                : 'opacity-70 hover:opacity-100'
            } shrink-0 cursor-pointer`}
            onClick={() => onImageChange(idx)}
          >
            <img src={img} className="w-full h-full object-cover" alt={`Miniatura ${idx + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

const TabContent = ({ activeTab, alojamento }) => {
  if (!alojamento) return null;

  switch(activeTab) {
    case 0:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Sobre este espaço</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {alojamento.descricao_detalhada || alojamento.descricao || 
                `Este espaçoso ${alojamento.tipo_propriedade?.toLowerCase() || 'apartamento'} em ${alojamento.localizacao} oferece uma experiência única de conforto e tranquilidade.`}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">O que este espaço oferece</h3>
            <div className="grid grid-cols-2 gap-3">
              {alojamento.comodidades?.slice(0, 8).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-sm text-slate-600">{item.nome}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case 1:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Todas as comodidades</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Comodidades Gerais</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                {alojamento.comodidades?.map((item, i) => (
                  <li key={i}>• {item.nome}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Regras da Casa</h3>
          <div className="space-y-4">
            {alojamento.regras_casa?.map((regra, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle size={18} className="text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">{regra.titulo}</p>
                  <p className="text-sm text-slate-500">{regra.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 4:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Localização e arredores</h3>
          <div className="relative w-full h-[300px] rounded-xl overflow-hidden bg-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=800&h=400&fit=crop" 
              alt="Mapa" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin size={32} className="text-[#003580] fill-[#003580]" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-orange-500 mt-0.5" />
              <span className="text-sm text-slate-600">{alojamento.endereco_completo || alojamento.localizacao}, Cabo Verde</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-slate-900 mb-2">Próximo de:</p>
              <ul className="space-y-2 text-sm text-slate-600">
                {alojamento.pontos_proximos?.map((ponto, i) => (
                  <li key={i}>{ponto}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export const InfoAlojamento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alojamento, setAlojamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Buscar usuário logado do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUsuarioLogado(user);
      } catch (e) {
        console.error('Erro ao carregar usuário:', e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchAlojamento = async () => {
      if (!id) {
        setError('ID do alojamento não fornecido');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://welovepalop.com/api/get_alojamento_detalhes.php?id=${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setAlojamento(data);
        
        if (data.imagens && data.imagens.length > 0) {
          const imageUrls = data.imagens.map(img => img.caminho_url);
          setImages(imageUrls);
        } else if (data.imagem_url) {
          setImages([data.imagem_url]);
        } else {
          setImages([
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=1200&h=800&fit=crop",
          ]);
        }
      } catch (err) {
        console.error('Erro ao buscar alojamento:', err);
        setError(err.message || 'Erro ao carregar dados do alojamento');
      } finally {
        setLoading(false);
      }
    };

    fetchAlojamento();
  }, [id]);

  const handleContinueToCheckout = (reservaInfo) => {
    const userLogado = localStorage.getItem('user');
    
    if (!userLogado) {
      alert("Por favor, faça login com o Google primeiro.");
      return;
    }

    if (!alojamento) {
      alert("Erro ao carregar dados do alojamento. Tente novamente.");
      return;
    }

    const dadosParaCheckout = {
      id: alojamento.id,
      titulo: alojamento.titulo,
      imagem: images[0] || alojamento.imagem_url,
      localizacao: alojamento.localizacao,
      ilha: alojamento.ilha || 'Cabo Verde',
      precoNoite: Number(alojamento.preco_noite),
      checkIn: reservaInfo.startDate.toISOString().split('T')[0],
      checkOut: reservaInfo.endDate.toISOString().split('T')[0],
      hospedes: reservaInfo.numHospedes,
        capacidade: alojamento.capacidade || reservaInfo.numHospedes,
      noites: reservaInfo.noites,
      totalBase: reservaInfo.totalBase,
      taxaLimpeza: 2500,
      taxaServico: 1200,
      descricao: alojamento.descricao,
      comodidades: alojamento.comodidades || [],
      imagens_extra: alojamento.imagens_extra || []
    };

    navigate('/checkout-alojamento', { state: { reservaData: dadosParaCheckout } });
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#003580] mx-auto mb-4" />
          <p className="text-slate-600">Carregando informações do alojamento...</p>
        </div>
      </div>
    );
  }

  if (error || !alojamento) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Erro ao carregar</h2>
          <p className="text-slate-600 mb-4">{error || 'Alojamento não encontrado'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#003580] text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white font-sans pb-20">
      {isModalOpen && (
        <ImageSliderModal 
          images={images}
          currentIndex={currentImageIndex}
          onClose={handleCloseModal}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
        />
      )}

      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-[11px] font-medium text-slate-500">
        <span onClick={() => navigate('/')} className="hover:text-blue-900 cursor-pointer">Início</span>
        <ChevronRight size={10} />
        <span onClick={() => navigate('/alojamentos')} className="hover:text-blue-900 cursor-pointer">Alojamentos</span>
        <ChevronRight size={10} />
        <span className="text-slate-500 font-semibold truncate">{alojamento.titulo}</span>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ImageGallery 
              images={images}
              mainImageIndex={currentImageIndex}
              onImageChange={handleImageChange}
              onOpenModal={handleOpenModal}
              onPrev={handlePrevImage}
              onNext={handleNextImage}
              titulo={alojamento.titulo}
              tipo={alojamento.tipo}
            />

            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Comodidades principais</h3>
              <AmenitiesBar 
                infoBasica={alojamento.info_basica} 
                comodidades={alojamento.comodidades} 
              />
            </div>
          </div>

          <div className="lg:self-start">
            <div className="sticky top-24 z-30">
              <SidebarReserva 
                precoPorNoite={alojamento.preco_noite}
                estrelas={alojamento.estrelas}
                datasBloqueadas={alojamento.datas_bloqueadas || []}
                onContinueToCheckout={handleContinueToCheckout}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">{alojamento.titulo}</h1>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">{alojamento.tipo}</span>
            </div>
            <div className="flex items-center gap-4 text-sm mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin size={14} className="text-orange-500" /> {alojamento.localizacao}
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-orange-400 text-orange-400" /> 
                <span className="text-slate-900 font-bold">{alojamento.estrelas}</span> 
                <span className="text-slate-400">({alojamento.total_avaliacoes || 0} avaliações)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        <TabsNavegacaoAlojamentos activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TabContent activeTab={activeTab} alojamento={alojamento} />
          </div>

          <div className="space-y-4">
            <HostInfo proprietario={alojamento.proprietario} />
            <MapLocation 
              localizacao={alojamento.localizacao}
              pontosProximos={alojamento.pontos_proximos}
              endereco={alojamento.endereco_completo}
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO DE AVALIAÇÕES - ROW SOZINHO W-FULL */}
      <div className="w-full bg-white border-t border-slate-100 mt-12 pt-12">
        <div className="max-w-7xl mx-auto px-6">
          <AvaliacoesSeccaoAlojamento 
            alojamentoId={alojamento.id}
            usuarioLogado={usuarioLogado}
            onOpenLoginModal={() => alert("Por favor, faça login com o Google para avaliar.")}
          />
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .react-datepicker__day--in-range { background-color: #f1f5f9 !important; }
        .react-datepicker__day--range-start, .react-datepicker__day--range-end {
          background-color: #003580 !important; color: white !important; border-radius: 50% !important;
        }
        .react-datepicker__day--disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default InfoAlojamento;