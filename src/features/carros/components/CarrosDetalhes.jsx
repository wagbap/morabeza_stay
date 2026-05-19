import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  Users, Gauge, Fuel, MapPin, Star, ChevronRight, ChevronLeft, 
  Camera, CheckCircle, ExternalLink, ChevronDown, 
  X, Loader2, Calendar, Paintbrush, Info, CalendarDays,
  ShieldCheck, Infinity, ShieldAlert, Key
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import AvaliacoesSeccaoCarro from './AvaliacoesSeccaoCarro';

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

// Componente TabsNavegacaoCarros
const TabsNavegacaoCarros = ({ activeTab = 0, onTabChange }) => {
  const tabs = [
    { id: 0, label: 'Visão Geral' },
    { id: 1, label: 'Especificações' },
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
                ? 'text-blue-900 border-b-2 border-blue-900'
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

// Componente EspecificacoesBar
const EspecificacoesBar = ({ caracteristicas }) => {
  const specs = [
    { icon: Gauge, label: caracteristicas?.transmissao || 'Manual', sub: 'Transmissão' },
    { icon: Fuel, label: caracteristicas?.combustivel || 'Gasolina', sub: 'Combustível' },
    { icon: Users, label: `${caracteristicas?.passageiros || 5} passageiros`, sub: 'Capacidade' },
    { icon: Calendar, label: caracteristicas?.ano || '2024', sub: 'Ano Fabrico' },
    { icon: Info, label: caracteristicas?.quilometragem || '0 km', sub: 'Quilometragem' },
    { icon: Paintbrush, label: caracteristicas?.cor || 'Não informada', sub: 'Cor Exterior' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {specs.map((item, i) => (
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

// Barra horizontal de vantagens adicionais idêntica ao design enviado
const InclusoesCarroBar = ({ localizacao }) => {
  const inclusoes = [
    { icon: CheckCircle, titulo: 'Cancelamento', valor: 'Gratuito', colorClass: 'text-green-600' },
    { icon: ShieldCheck, titulo: 'Seguro básico', valor: 'Incluído', colorClass: 'text-green-600' },
    { icon: Infinity, titulo: 'Quilometragem', valor: 'Ilimitada', colorClass: 'text-green-600' },
    { icon: ShieldAlert, titulo: 'Assistência 24/7', valor: 'Incluída', colorClass: 'text-green-600' },
    { icon: Key, titulo: 'Levantamento', valor: localizacao || 'Aeroporto da Praia', colorClass: 'text-slate-500' },
    { icon: Fuel, titulo: 'Combustível', valor: 'Cheio a cheio', colorClass: 'text-slate-500' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
      {inclusoes.map((item, i) => (
        <div key={i} className="flex items-center gap-2 border-r last:border-r-0 border-slate-100 pr-1 text-left">
          <div className="text-slate-400 shrink-0">
            <item.icon size={18} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-semibold text-slate-500 leading-tight">{item.titulo}</span>
            <span className={`text-[10px] font-bold ${item.colorClass} mt-0.5`}>{item.valor}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente ImageGallery
const ImageGallery = ({ images, onImageChange, onOpenModal, titulo }) => {
  const placeholder = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=400&fit=crop";
  const img1 = images[0] || placeholder;
  const img2 = images[1] || placeholder;
  const img3 = images[2] || placeholder;
  const img4 = images[3] || placeholder;

  return (
    <div className="flex flex-col md:flex-row gap-2.5 w-full text-left">
      <div 
        className="w-full md:w-[62%] h-[240px] md:h-[390px] relative rounded-2xl overflow-hidden cursor-pointer shadow-sm"
        onClick={() => { onImageChange(0); onOpenModal(); }}
      >
        <img 
          src={img1} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" 
          alt={`${titulo} - Principal`} 
        />
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-xs text-xs backdrop-blur-sm pointer-events-none tracking-wide font-sans">
          1 / {images.length || 10}
        </div>
      </div>

      <div className="w-full md:w-[38%] flex flex-col gap-2.5 h-[240px] md:h-[390px]">
        <div 
          className="h-1/2 rounded-2xl overflow-hidden relative cursor-pointer shadow-sm"
          onClick={() => { onImageChange(1); onOpenModal(); }}
        >
          <img 
            src={img2} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" 
            alt={`${titulo} - Detalhe`} 
          />
        </div>

        <div className="h-1/2 flex gap-2.5">
          <div 
            className="flex-1 rounded-2xl overflow-hidden relative cursor-pointer shadow-sm"
            onClick={() => { onImageChange(2); onOpenModal(); }}
          >
            <img 
              src={img3} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" 
              alt={`${titulo} - Interior`} 
            />
          </div>
          
          <div 
            className="flex-1 rounded-2xl overflow-hidden relative cursor-pointer shadow-sm"
            onClick={() => { onImageChange(3); onOpenModal(); }}
          >
            <img 
              src={img4} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]" 
              alt={`${titulo} - Traseira`} 
            />

            <div 
              onClick={(e) => { e.stopPropagation(); onImageChange(0); onOpenModal(); }}
              className="absolute bottom-2.5 right-2.5 bg-white hover:bg-slate-50 text-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold border border-slate-200 shadow-md cursor-pointer z-20 transition-all active:scale-95 whitespace-nowrap"
            >
              <Camera size={12} className="text-slate-700" /> Ver todas as fotos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente SidebarReservaCarro
const SidebarReservaCarro = ({ precoDia, estrelas, totalReviews, onContinueToCheckout }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      setTimeout(() => setShowCalendar(false), 300);
    }
  };

  const dias = startDate && endDate 
    ? Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)))
    : 1;

  const subtotal = precoDia * dias;
  const taxaServico = Math.round(subtotal * 0.10);
  const totalGeral = subtotal + taxaServico;

  const handleContinue = () => {
    if (!startDate || !endDate) {
      alert("Por favor, selecione as datas de Levantamento e Devolução");
      return;
    }
    
    if (onContinueToCheckout) {
      onContinueToCheckout({
        startDate,
        endDate,
        dias,
        subtotal,
        taxaServico,
        totalGeral
      });
    }
  };

  const formatarData = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="lg:block text-left">
      <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-lg">
        <div className="flex justify-between items-end mb-5">
          <div className="text-2xl font-black text-slate-900">
            {precoDia.toLocaleString()} CVE 
            <span className="text-xs font-medium text-slate-400"> / dia</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
            <Star size={14} className="fill-orange-500 text-orange-500" /> {Number(estrelas).toFixed(1)} <span className="text-slate-400 font-normal">({totalReviews})</span>
          </div>
        </div>

        <div className="border border-slate-300 rounded-xl mb-4 overflow-visible relative">
          <div 
            className="flex cursor-pointer hover:bg-slate-50 transition-all rounded-xl p-2.5"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <div className="flex-1 border-r border-slate-200 pr-2">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Levantamento</label>
              <div className="text-xs font-bold text-slate-800">
                {startDate ? formatarData(startDate) : 'Selecionar data'}
              </div>
            </div>
            <div className="flex-1 pl-3">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Devolução</label>
              <div className="text-xs font-bold text-slate-800">
                {endDate ? formatarData(endDate) : 'Selecionar data'}
              </div>
            </div>
          </div>

          {showCalendar && (
            <div className="absolute right-0 top-full mt-2 z-[100] shadow-2xl rounded-2xl bg-white border border-slate-200 p-3 max-w-[90vw]">
              <DatePicker
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                monthsShown={2}
                inline
                minDate={new Date()}
                calendarClassName="morabeza-calendar-inline"
              />
            </div>
          )}
        </div>

        {startDate && endDate && (
          <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-800">Período:</span>
              </div>
              <span className="text-sm font-black text-blue-600">
                {dias} {dias === 1 ? 'dia' : 'dias'}
              </span>
            </div>
            <p className="text-[10px] text-blue-600 mt-1">
              {formatarData(startDate)} → {formatarData(endDate)}
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs font-medium text-slate-600">
          <div className="flex justify-between">
            <span>Preço por dia ({dias} {dias === 1 ? 'dia' : 'dias'})</span>
            <span className="font-bold text-slate-900">{subtotal.toLocaleString()} CVE</span>
          </div>
          
          <div className="flex justify-between">
            <span className="flex items-center gap-1">Taxa de serviço Morabeza Stay (10%) <Info size={11} className="text-slate-400" /></span>
            <span className="font-bold text-slate-900">{taxaServico.toLocaleString()} CVE</span>
          </div>
          
          <div className="flex justify-between pt-3 border-t border-slate-200 text-sm font-black text-slate-900">
            <span>Total pago</span>
            <span className="text-blue-600 text-base font-black">
              {totalGeral.toLocaleString()} CVE
            </span>
          </div>
        </div>

        <button 
          onClick={handleContinue}
          disabled={!startDate || !endDate}
          className={`w-full font-black py-3 rounded-xl mb-4 mt-6 transition-all shadow-md text-xs uppercase tracking-wider ${
            startDate && endDate
              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {startDate && endDate 
            ? `Reservar por ${dias} ${dias === 1 ? 'dia' : 'dias'}`
            : 'Selecione as datas para continuar'}
        </button>

        <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
          <CheckCircle className="text-green-600 mt-0.5" size={14} />
          <div>
            <h5 className="text-[11px] font-bold text-green-800">Cancelamento gratuito</h5>
            <p className="text-[10px] text-green-700 leading-tight">Até 48 horas antes do levantamento</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente MapLocationCarro
const MapLocationCarro = ({ localizacao, ilha }) => {
  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm text-left">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">Localização</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{ilha}, {localizacao}</p>
        </div>
        <button className="flex items-center gap-1 text-blue-900 text-[10px] font-bold hover:underline">
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
            <MapPin size={24} className="text-blue-900 fill-blue-900" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-1 bg-black/20 blur-sm rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de conteúdo das tabs
const TabContent = ({ activeTab, carro }) => {
  if (!carro) return null;

  switch(activeTab) {
    case 0:
      return (
        <div className="space-y-6 text-left">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Sobre este veículo</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {carro.descricao || carro.descricao_curta || 
                `Veículo ${carro.titulo} disponível para aluguer em ${carro.localizacao}, ${carro.ilha}. 
                Perfeito para explorar a ilha com conforto e segurança.`}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Características principais</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-sm text-slate-600">Ar condicionado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-sm text-slate-600">Direção assistida</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-sm text-slate-600">Vidros elétricos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-sm text-slate-600">Sistema de som</span>
              </div>
            </div>
          </div>
        </div>
      );
    case 1:
      return (
        <div className="space-y-6 text-left">
          <h3 className="text-lg font-bold text-slate-900">Especificações técnicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Informações gerais</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Tipo de veículo</span>
                  <span className="font-medium text-slate-900">{carro.tipo || 'SUV'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Ano de fabrico</span>
                  <span className="font-medium text-slate-900">{carro.ano || '2024'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Transmissão</span>
                  <span className="font-medium text-slate-900">{carro.transmissao || 'Manual'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Combustível</span>
                  <span className="font-medium text-slate-900">{carro.combustivel || 'Gasolina'}</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Capacidade e dimensões</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Passageiros</span>
                  <span className="font-medium text-slate-900">{carro.passageiros || 5} pessoas</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Quilometragem</span>
                  <span className="font-medium text-slate-900">{carro.quilometragem ? Number(carro.quilometragem).toLocaleString() : '0'} km</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Cor exterior</span>
                  <span className="font-medium text-slate-900">{carro.cor || 'Não informada'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    case 4:
      return (
        <div className="space-y-6 text-left">
          <h3 className="text-lg font-bold text-slate-900">Localização para levantamento</h3>
          <div className="relative w-full h-[300px] rounded-xl overflow-hidden bg-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=800&h=400&fit=crop" 
              alt="Mapa" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin size={32} className="text-blue-900 fill-blue-900" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-orange-500 mt-0.5" />
              <span className="text-sm text-slate-600">{carro.ilha}, {carro.localizacao}, Cabo Verde</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-slate-900 mb-2">Como funciona o levantamento:</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>📍 Ponto de encontro será informado após a reserva</li>
                <li>🆔 Documento de identificação obrigatório</li>
                <li>🚗 Carta de condução válida</li>
              </ul>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

// Componente principal CarrosDetalhes
export const CarrosDetalhes = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carro, setCarro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

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
    const fetchCarro = async () => {
      if (!slug) {
        setError('Slug do veículo não fornecido');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://welovepalop.com/api/get_carro_detalhes.php?slug=${slug}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (data.success && data.data) {
          setCarro(data.data);
          
          if (data.data.imagens && data.data.imagens.length > 0) {
            setImages(data.data.imagens);
          } else if (data.data.imagem_url) {
            setImages([data.data.imagem_url]);
          } else {
            setImages([
              "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&h=800&fit=crop",
              "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=800&fit=crop",
            ]);
          }
        } else {
          throw new Error(data.error || 'Erro ao carregar dados do veículo');
        }
      } catch (err) {
        console.error('Erro ao buscar veículo:', err);
        setError(err.message || 'Erro ao carregar dados do veículo');
      } finally {
        setLoading(false);
      }
    };

    fetchCarro();
  }, [slug]);

  const handleContinueToCheckout = (reservaInfo) => {
    const userLogado = localStorage.getItem('user');
    
    if (!userLogado) {
      alert("Por favor, faça login com o Google primeiro.");
      return;
    }

    if (!carro) {
      alert("Erro ao carregar dados do veículo. Tente novamente.");
      return;
    }

    const dadosParaCheckout = {
      id: carro.id,
      titulo: carro.titulo,
      imagem: images[0] || carro.imagem_url,
      localizacao: carro.localizacao,
      ilha: carro.ilha || 'Cabo Verde',
      precoDia: Number(carro.preco_dia),
      checkIn: reservaInfo.startDate.toISOString().split('T')[0],
      checkOut: reservaInfo.endDate.toISOString().split('T')[0],
      dias: reservaInfo.dias,
      subtotal: reservaInfo.subtotal,
      taxaServico: reservaInfo.taxaServico,
      totalGeral: reservaInfo.totalGeral,
      tipo: carro.tipo,
      ano: carro.ano,
      transmissao: carro.transmissao,
      descricao: carro.descricao
    };

    navigate('/checkout-carro', { state: { reservaData: dadosParaCheckout } });
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
          <Loader2 size={48} className="animate-spin text-blue-900 mx-auto mb-4" />
          <p className="text-slate-600">Carregando informações do veículo...</p>
        </div>
      </div>
    );
  }

  if (error || !carro) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center text-center">
        <div>
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Erro ao carregar</h2>
          <p className="text-slate-600 mb-4">{error || 'Veículo não encontrado'}</p>
          <button 
            onClick={() => navigate('/carros')}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-950 transition"
          >
            Voltar para veículos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white font-sans pb-20">
      <Helmet>
        <title>MorabezaStay | {carro.titulo}</title>
      </Helmet>

      {isModalOpen && (
        <ImageSliderModal 
          images={images}
          currentIndex={currentImageIndex}
          onClose={handleCloseModal}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
        />
      )}

      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-[11px] font-medium text-slate-500 text-left">
        <span onClick={() => navigate('/')} className="hover:text-blue-900 cursor-pointer">Início</span>
        <ChevronRight size={10} />
        <span onClick={() => navigate('/carros')} className="hover:text-blue-900 cursor-pointer">Veículos</span>
        <ChevronRight size={10} />
        <span className="text-slate-500 font-semibold truncate">{carro.titulo}</span>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery 
              images={images}
              onImageChange={handleImageChange}
              onOpenModal={handleOpenModal}
              titulo={carro.titulo}
            />

            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4">Especificações do veículo</h3>
                <EspecificacoesBar caracteristicas={carro.caracteristicas} />
              </div>
              
              <InclusoesCarroBar localizacao={carro.localizacao} />
            </div>
          </div>

          <div className="lg:self-start">
            <div className="sticky top-24 z-30">
              <SidebarReservaCarro 
                precoDia={Number(carro.preco_dia)}
                estrelas={carro.estrelas}
                totalReviews={carro.total_avaliacoes}
                onContinueToCheckout={handleContinueToCheckout}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 text-left">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">{carro.titulo}</h1>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">{carro.tipo || 'SUV'}</span>
            </div>
            <div className="flex items-center gap-4 text-sm mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin size={14} className="text-orange-500" /> {carro.ilha}, {carro.localizacao}
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-orange-400 text-orange-400" /> 
                <span className="text-slate-900 font-bold">{Number(carro.estrelas).toFixed(1)}</span> 
                <span className="text-slate-400">({carro.total_avaliacoes || 0} avaliações)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6 text-left">
        <TabsNavegacaoCarros activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TabContent activeTab={activeTab} carro={carro} />
          </div>

          <div className="space-y-4">
            <MapLocationCarro 
              localizacao={carro.localizacao}
              ilha={carro.ilha}
            />
          </div>
        </div>
      </div>

      <div className="w-full bg-white border-t border-slate-100 mt-12 pt-12">
        <div className="max-w-7xl mx-auto px-6">
          <AvaliacoesSeccaoCarro 
            carroId={carro.id}
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
          background-color: #1e3a8a !important; color: white !important; border-radius: 50% !important;
        }
        .react-datepicker__day--disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default CarrosDetalhes;