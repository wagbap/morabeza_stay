import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  Users, Bed, Bath, Wifi, Wind, Coffee, MapPin, Star, 
  ChevronRight, ChevronLeft, LayoutGrid, Camera,
  CheckCircle, ExternalLink, ChevronDown, X
} from 'lucide-react';

// Componente SliderModal para visualização em tela cheia
const ImageSliderModal = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
      >
        <X size={24} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
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

// Componente TabsNavegacaoAlojamentos
const TabsNavegacaoAlojamentos = ({ activeTab = 0, onTabChange }) => {
  const tabs = [
    { id: 0, label: 'Visão Geral' },
    { id: 1, label: 'Comodidades' },
    { id: 2, label: 'Regras da Casa' },
    { id: 3, label: 'Avaliações' },
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

// Componente HostInfo
const HostInfo = () => {
  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" 
            alt="Anfitrião" 
            className="w-12 h-12 rounded-full object-cover border border-slate-100"
          />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
            <CheckCircle className="text-orange-500 fill-orange-500" size={14} />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">Anfitrião: João Silva</h4>
          <p className="text-[10px] text-slate-500 font-medium">Superhost • Responde rápido</p>
        </div>
      </div>
      <button className="w-full py-2.5 border border-[#003580] text-[#003580] text-[11px] font-bold rounded-xl hover:bg-slate-50 transition-colors">
        Contactar anfitrião
      </button>
    </div>
  );
};

// Componente MapLocation
const MapLocation = () => {
  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">Localização</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Santa Maria, Ilha do Sal</p>
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

// Componente SidebarReserva
const SidebarReserva = () => {
  const [startDate, setStartDate] = useState(new Date());
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

  return (
    <div className="sticky top-24">
      <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-lg">
        <div className="flex justify-between items-end mb-5">
          <div className="text-2xl font-bold text-slate-900">85€ <span className="text-sm font-normal text-slate-500">/ noite</span></div>
          <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
            <Star size={14} className="fill-orange-500 text-orange-500" /> 4.9
          </div>
        </div>

        <div className="border border-slate-300 rounded-xl mb-4 overflow-visible relative">
          <div 
            className="flex border-b border-slate-300 cursor-pointer hover:bg-slate-50 transition-all rounded-t-xl"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <div className="flex-1 p-2.5 border-r border-slate-300">
              <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Check-in</label>
              <div className="text-xs font-bold text-slate-900">{startDate ? startDate.toLocaleDateString('pt-PT') : 'Data'}</div>
            </div>
            <div className="flex-1 p-2.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Check-out</label>
              <div className="text-xs font-bold text-slate-900">{endDate ? endDate.toLocaleDateString('pt-PT') : 'Data'}</div>
            </div>
          </div>

          {showCalendar && (
            <div className="absolute right-0 top-full mt-2 z-[100] shadow-2xl rounded-2xl bg-white border border-slate-200 p-2">
              <DatePicker
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                monthsShown={window.innerWidth > 768 ? 2 : 1}
                inline
                minDate={new Date()}
                calendarClassName="morabeza-calendar-inline"
              />
              <div className="p-2 border-t border-slate-100 flex justify-end">
                <button onClick={() => setShowCalendar(false)} className="text-[#003580] font-bold text-[10px] uppercase">
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
              </select>
            </div>
            <ChevronDown size={14} className="text-slate-400 pointer-events-none" />
          </div>
        </div>

        <button className="w-full bg-[#003580] text-white font-bold py-3 rounded-xl mb-4 hover:bg-blue-900 transition-all shadow-lg text-sm">
          Ver disponibilidade
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

// Componente AmenitiesBar
const AmenitiesBar = () => {
  const amenities = [
    { icon: Users, label: '4 Hóspedes', sub: 'Máximo 4 pessoas' },
    { icon: Bed, label: '2 Quartos', sub: '1 cama queen, 2 ind.' },
    { icon: Bath, label: '2 Casas de banho', sub: 'Água quente' },
    { icon: Wifi, label: 'Wi-Fi', sub: 'Rápido e gratuito' },
    { icon: Wind, label: 'Ar Condicionado', sub: 'Todos os quartos' },
    { icon: Coffee, label: 'Cozinha', sub: 'Totalmente equipada' },
  ];

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

// Componente ImageGallery com setas de navegação
const ImageGallery = ({ images, mainImageIndex, onImageChange, onOpenModal, onPrev, onNext }) => {
  return (
    <div className="relative">
      {/* Container da imagem principal com setas */}
      <div className="relative group">
        <div 
          className="relative rounded-2xl overflow-hidden shadow-xl shadow-blue-900/10 cursor-pointer"
          onClick={onOpenModal}
        >
          <div className="h-[320px] md:h-[420px]">
            <img 
              src={images[mainImageIndex]} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt="Apartamento Morabeza" 
            />
          </div>
          <div className="absolute bottom-4 left-4 bg-[#003580] text-white px-4 py-2 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase shadow-lg z-10">
            <LayoutGrid size={12} /> Apartamento Premium
          </div>
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium backdrop-blur-sm z-10">
            <Camera size={14} /> Ver fotos
          </div>
        </div>

        {/* SETA ESQUERDA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
        >
          <ChevronLeft size={24} />
        </button>

        {/* SETA DIREITA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
        >
          <ChevronRight size={24} />
        </button>

        {/* Indicador de posição */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm z-10">
          {mainImageIndex + 1} / {images.length}
        </div>
      </div>

      {/* Miniaturas */}
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

// Componente de conteúdo das tabs
const TabContent = ({ activeTab }) => {
  switch(activeTab) {
    case 0:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Sobre este espaço</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Este espaçoso apartamento em Santa Maria oferece uma experiência única de conforto e tranquilidade. 
              Com vista para o mar e localização privilegiada, você estará a poucos passos das melhores praias da Ilha do Sal.
              Totalmente remodelado, dispõe de todos os equipamentos necessários para uma estadia inesquecível.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed mt-3">
              O apartamento conta com uma varanda privativa onde pode desfrutar do pequeno-almoço com vista para o oceano. 
              A cozinha está totalmente equipada com eletrodomésticos modernos e utensílios de qualidade.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">O que este espaço oferece</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Wi-Fi rápido', 'Cozinha equipada', 'Ar condicionado', 'TV Smart',
                'Toalhas e lençóis', 'Secador de cabelo', 'Ferro de engomar', 'Estacionamento gratuito'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-sm text-slate-600">{item}</span>
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
              <h4 className="font-semibold text-slate-900 mb-3">Quartos</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• 1 cama queen-size</li>
                <li>• 2 camas individuais</li>
                <li>• Roupa de cama incluída</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Banheiros</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• 2 casas de banho completas</li>
                <li>• Toalhas incluídas</li>
                <li>• Secador de cabelo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Cozinha</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Geladeira e freezer</li>
                <li>• Microondas</li>
                <li>• Cafeteira</li>
                <li>• Utensílios básicos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Entretenimento</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Wi-Fi rápido (100 Mbps)</li>
                <li>• TV Smart</li>
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
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
              <CheckCircle size={18} className="text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Check-in: 15:00 - 22:00</p>
                <p className="text-sm text-slate-500">Check-out: até às 11:00</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
              <CheckCircle size={18} className="text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Não é permitido</p>
                <p className="text-sm text-slate-500">Fumar • Festas • Animais de estimação</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
              <CheckCircle size={18} className="text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Silêncio após as 22:00</p>
                <p className="text-sm text-slate-500">Respeitar os vizinhos</p>
              </div>
            </div>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Avaliações dos hóspedes</h3>
            <div className="flex items-center gap-2">
              <Star size={20} className="fill-orange-400 text-orange-400" />
              <span className="text-2xl font-bold text-slate-900">4.9</span>
              <span className="text-slate-500">· 85 avaliações</span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { nome: "Maria Santos", data: "Outubro 2024", texto: "Excelente estadia! O apartamento é muito confortável e bem localizado. Vista linda para o mar!" },
              { nome: "Carlos Mendes", data: "Setembro 2024", texto: "Apartamento impecável, moderno e muito bem equipado. O anfitrião foi super atencioso." },
              { nome: "Ana Rodrigues", data: "Agosto 2024", texto: "Localização perfeita, perto de tudo. Limpeza impecável. Voltarei com certeza." }
            ].map((review, i) => (
              <div key={i} className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#003580] to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {review.nome.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{review.nome}</p>
                    <div className="flex items-center gap-1">
                      <Star size={10} className="fill-orange-400 text-orange-400" />
                      <span className="text-[10px] text-slate-500">5.0 • {review.data}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{review.texto}</p>
              </div>
            ))}
          </div>
          <button className="w-full py-3 border border-[#003580] text-[#003580] font-bold rounded-xl hover:bg-slate-50 transition-colors">
            Ver todas as 85 avaliações
          </button>
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
              <span className="text-sm text-slate-600">Santa Maria, Ilha do Sal, Cabo Verde</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-slate-900 mb-2">Próximo de:</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>🏖️ Praia de Santa Maria - 2 min a pé</li>
                <li>🛒 Mercado Municipal - 5 min a pé</li>
                <li>✈️ Aeroporto Internacional - 20 min de carro</li>
              </ul>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

// Componente InfoAlojamento principal
export const InfoAlojamento = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const images = [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop"
  ];

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
        <span className="hover:text-blue-900 cursor-pointer">Início</span>
        <ChevronRight size={10} />
        <span className="hover:text-blue-900 cursor-pointer">Cabo Verde</span>
        <ChevronRight size={10} />
        <span className="hover:text-blue-900 cursor-pointer">Ilha do Sal</span>
        <ChevronRight size={10} />
        <span className="text-slate-500 font-semibold truncate">Apartamento Morabeza</span>
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
            />

            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Comodidades principais</h3>
              <AmenitiesBar />
            </div>
          </div>

          <div>
            <SidebarReserva />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">Apartamento Morabeza</h1>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">Apartamento</span>
            </div>
            <div className="flex items-center gap-4 text-sm mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin size={14} className="text-orange-500" /> Santa Maria, Ilha do Sal
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-orange-400 text-orange-400" /> 
                <span className="text-slate-900 font-bold">4.9</span> 
                <span className="text-slate-400">(85 avaliações)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        <TabsNavegacaoAlojamentos activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TabContent activeTab={activeTab} />
          </div>

          <div className="space-y-4">
            <HostInfo />
            <MapLocation />
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .react-datepicker__day--in-range { background-color: #f1f5f9 !important; }
        .react-datepicker__day--range-start, .react-datepicker__day--range-end {
          background-color: #003580 !important; color: white !important; border-radius: 50% !important;
        }
      `}</style>
    </div>
  );
};

export default InfoAlojamento;