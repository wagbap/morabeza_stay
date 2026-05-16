import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  Users, Star, MapPin, Clock, Calendar, ChevronRight, ChevronLeft, 
  LayoutGrid, Camera, CheckCircle, ExternalLink, ChevronDown, X, 
  Loader2, ShieldCheck, Headphones, Sun, Sunset
} from 'lucide-react';
import AvaliacoesSeccao from './AvaliacoesSeccaoExperiencia';

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

// Componente TabsNavegacaoExperiencia
const TabsNavegacaoExperiencia = ({ activeTab = 0, onTabChange }) => {
  const tabs = [
    { id: 0, label: 'Visão Geral' },
    { id: 1, label: 'Inclusões' },
    { id: 2, label: 'Requisitos' },
    { id: 3, label: 'Localização' },
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

// Componente GuiaInfo
const GuiaInfo = ({ guia }) => {
  if (!guia) return null;
  
  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <img 
            src={guia.foto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"} 
            alt={guia.nome} 
            className="w-12 h-12 rounded-full object-cover border border-slate-100"
          />
          {guia.guia_certificado && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <CheckCircle className="text-green-500 fill-green-500" size={14} />
            </div>
          )}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">Guia: {guia.nome}</h4>
          <p className="text-[10px] text-slate-500 font-medium">
            {guia.guia_certificado ? 'Guia Certificado • ' : ''}{guia.idiomas || 'Português/Inglês'}
          </p>
        </div>
      </div>
      <button className="w-full py-2.5 border border-[#003580] text-[#003580] text-[11px] font-bold rounded-xl hover:bg-slate-50 transition-colors">
        Contactar guia
      </button>
    </div>
  );
};

// Componente MapLocation para Experiência
const MapLocationExperiencia = ({ localizacao, ilha, pontosProximos }) => {
  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">Localização</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{ilha}, {localizacao}</p>
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

// Componente SidebarReservaExperiencia
const SidebarReservaExperiencia = ({ 
  precoBase, 
  rating, 
  dataPasseio, 
  setDataPasseio, 
  periodo, 
  setPeriodo, 
  horario, 
  setHorario, 
  periodosUI, 
  horariosDisponiveis, 
  statusVagas, 
  precoVigente,
  onReservar 
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  
  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const formatarData = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="sticky top-24">
      <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-lg">
        <div className="flex justify-between items-end mb-5">
          <div className="text-2xl font-bold text-slate-900">
            {precoVigente.toLocaleString()} CVE 
            <span className="text-sm font-normal text-slate-500"> / pessoa</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
            <Star size={14} className="fill-orange-500 text-orange-500" /> {rating}
          </div>
        </div>

        {precoVigente !== precoBase && (
          <div className="mb-4 p-2 bg-orange-50 rounded-lg border border-orange-200 text-center">
            <span className="text-[10px] font-bold text-orange-600 uppercase">Preço Especial!</span>
          </div>
        )}

        <div className="border border-slate-300 rounded-xl mb-4 overflow-visible relative">
          <div 
            className="flex border-b border-slate-300 cursor-pointer hover:bg-slate-50 transition-all rounded-t-xl"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <div className="flex-1 p-2.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Data do passeio</label>
              <div className="text-xs font-bold text-slate-900">
                {dataPasseio ? formatarData(dataPasseio) : 'Selecionar data'}
              </div>
            </div>
          </div>

          {showCalendar && (
            <div className="absolute right-0 top-full mt-2 z-[100] shadow-2xl rounded-2xl bg-white border border-slate-200 p-2">
              <DatePicker
                selected={dataPasseio ? new Date(dataPasseio) : null}
                onChange={(date) => {
                  if (date) {
                    setDataPasseio(date.toISOString().split('T')[0]);
                  }
                  setTimeout(() => setShowCalendar(false), 300);
                }}
                inline
                minDate={new Date()}
                maxDate={new Date(maxDateStr)}
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
        </div>

        {/* PERÍODO */}
        <div className="space-y-3 mb-4">
          <label className="text-[10px] font-black tracking-[0.1em] text-[#1a2b6d] block mb-3 uppercase">Período</label>
          <div className="grid grid-cols-3 gap-3">
            {periodosUI.map((p) => {
              const isSelected = periodo === p.label;
              return (
                <button 
                  key={p.label}
                  disabled={!p.temHorarios}
                  onClick={() => setPeriodo(p.label)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-1 ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-sm' 
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  } ${!p.temHorarios ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                >
                  {p.label === 'Manhã' && <Sun size={16} className={isSelected ? 'text-yellow-500' : 'text-slate-300'} />}
                  {p.label === 'Meio dia' && <Sun size={16} className={isSelected ? 'text-orange-500' : 'text-slate-300'} />}
                  {p.label === 'Tarde' && <Sunset size={16} className={isSelected ? 'text-red-400' : 'text-slate-300'} />}
                  <span className={`text-[11px] font-bold mt-1 ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{p.label}</span>
                  <span className={`text-[8px] font-medium ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>{p.timeRange}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* HORÁRIOS ESPECÍFICOS */}
        <div className="mb-4">
          <label className="text-[10px] font-black tracking-[0.1em] text-[#1a2b6d] block mb-3 uppercase">Horário</label>
          <div className="grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-widest">
            {horariosDisponiveis.length > 0 ? (
              horariosDisponiveis.map(h => (
                <button 
                  key={h}
                  onClick={() => setHorario(h)}
                  className={`py-2 rounded-xl border transition-all ${
                    horario === h 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                      : 'bg-white border-slate-100 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {h}
                </button>
              ))
            ) : (
              <div className="col-span-3 text-[9px] text-slate-400 py-3 text-center bg-slate-50 rounded-xl border border-dashed">
                Indisponível
              </div>
            )}
          </div>
        </div>

        {/* STATUS DE DISPONIBILIDADE */}
        <div className="w-full py-3 px-4 bg-slate-50 border border-slate-100 rounded-xl mb-4">
          <p className="text-[11px] font-bold text-slate-500 tracking-tight flex items-center gap-2">
            <span className={statusVagas === "Disponível" ? "text-green-600" : "text-red-500"}>
              {statusVagas === "Disponível" ? "✓" : "⚠️"}
            </span>
            Disponibilidade: <span className={statusVagas === "Disponível" ? "text-green-600" : "text-red-500"}>{statusVagas}</span>
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-3 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-600">Preço por pessoa</span>
            <span className="text-lg font-bold text-blue-600">{precoVigente.toLocaleString()} CVE</span>
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <span className="text-sm font-bold text-slate-600">Total (por pessoa)</span>
            <span className="text-xl font-bold text-blue-600">{precoVigente.toLocaleString()} CVE</span>
          </div>

          <button 
            disabled={statusVagas !== "Disponível"}
            onClick={onReservar}
            className={`w-full font-black py-3 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg mt-4 text-sm ${
              statusVagas === "Disponível" 
                ? "bg-[#003580] hover:bg-blue-900 text-white shadow-blue-200 cursor-pointer" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            <Calendar size={16}/> {statusVagas === "Disponível" ? "Reservar agora" : statusVagas}
          </button>
          
          <p className="text-[9px] text-slate-400 text-center mt-3">
            O número de participantes será definido no próximo passo
          </p>
        </div>

        <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-100 mt-4">
          <CheckCircle className="text-green-600 mt-0.5" size={14} />
          <div>
            <h5 className="text-xs font-bold text-green-800 tracking-tight">Cancelamento gratuito</h5>
            <p className="text-[10px] text-green-700 leading-tight">Até 24 horas antes do passeio</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente ImageGallery
const ImageGallery = ({ images, mainImageIndex, onImageChange, onOpenModal, onPrev, onNext, titulo, categoria }) => {
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
            <LayoutGrid size={12} /> {categoria || 'Experiência'}
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

// Componente de conteúdo das tabs
const TabContent = ({ activeTab, experiencia }) => {
  if (!experiencia) return null;

  switch(activeTab) {
    case 0:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Sobre esta experiência</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {experiencia.descricao_longa || experiencia.descricao_curta || 
                `Viva uma experiência única em ${experiencia.ilha}, ${experiencia.localizacao}. 
                Uma aventura inesquecível que combina natureza, cultura e momentos especiais.`}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Duração e horários</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-blue-500" />
                <span className="text-sm text-slate-600">Duração: {experiencia.duracao}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-blue-500" />
                <span className="text-sm text-slate-600">Máximo: {experiencia.max_pessoas} pessoas</span>
              </div>
            </div>
          </div>
        </div>
      );
    case 1:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">O que está incluído</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiencia.inclusoes?.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm text-slate-700">{item.item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 2:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Requisitos importantes</h3>
          <div className="space-y-4">
            {experiencia.requisitos?.map((req, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <ShieldCheck size={18} className="text-blue-500 mt-0.5" />
                <p className="text-sm text-slate-600">{req.requisito}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case 3:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Localização e ponto de encontro</h3>
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
              <span className="text-sm text-slate-600">{experiencia.ilha}, {experiencia.localizacao}, Cabo Verde</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-slate-900 mb-2">Ponto de encontro:</p>
              <p className="text-sm text-slate-600">{experiencia.ponto_encontro || 'A ser informado após a confirmação da reserva'}</p>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

// Componente ExperienciaDetalhes principal
const ExperienciaDetalhes = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [experiencia, setExperiencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  
  // Estados para reserva
  const [dataPasseio, setDataPasseio] = useState(new Date().toISOString().split('T')[0]);
  const [periodo, setPeriodo] = useState("Manhã");
  const [horario, setHorario] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Buscar usuário logado
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

  // Buscar dados da experiência
  useEffect(() => {
    const fetchDados = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`https://welovepalop.com/api/get_experiencias.php?slug=${slug}`);
        
        if (!response.ok) {
          throw new Error('Erro ao carregar dados da experiência');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          const dados = Array.isArray(result.data) ? result.data[0] : result.data;
          
          if (dados) {
            setExperiencia(dados);
            
            // Processar imagens
            if (dados.imagens && dados.imagens.length > 0) {
              const imageUrls = dados.imagens.map(img => img.caminho_url);
              setImages(imageUrls);
            } else if (dados.imagem_principal) {
              setImages([dados.imagem_principal]);
            } else {
              setImages(["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop"]);
            }
          } else {
            setError('Experiência não encontrada');
          }
        } else {
          throw new Error(result.message || 'Erro ao carregar dados');
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
  }, [slug]);

  // Definição dos períodos visuais
  const periodosUI = [
    { label: 'Manhã', range: [8, 11], timeRange: '08:00 - 11:00', temHorarios: true },
    { label: 'Meio dia', range: [12, 14], timeRange: '12:00 - 14:00', temHorarios: true },
    { label: 'Tarde', range: [15, 17], timeRange: '15:00 - 17:00', temHorarios: true }
  ];

  const getHorariosFiltrados = () => {
    if (!experiencia || !experiencia.horarios_json) return [];
    
    try {
      const todosHorarios = JSON.parse(experiencia.horarios_json);
      const configPeriodo = periodosUI.find(p => p.label === periodo);
      
      if (!configPeriodo) return [];
      
      return todosHorarios.filter(h => {
        const horaNum = parseInt(h.split(':')[0], 10);
        return horaNum >= configPeriodo.range[0] && horaNum <= configPeriodo.range[1];
      });
    } catch (e) {
      console.error("Erro ao processar horários:", e);
      return [];
    }
  };

  const horariosDisponiveis = getHorariosFiltrados();

  useEffect(() => {
    if (horariosDisponiveis.length > 0) {
      setHorario(horariosDisponiveis[0]);
    } else {
      setHorario("");
    }
  }, [periodo, experiencia]);

  const precoBase = parseFloat(experiencia?.preco) || 0;

  const getPrecoAtual = () => {
    if (!experiencia?.regras_disponibilidade) return precoBase;
    const regra = experiencia.regras_disponibilidade.find(r => 
      r.data_especifica === dataPasseio && r.periodo === periodo
    );
    return regra && regra.preco_especial ? parseFloat(regra.preco_especial) : precoBase;
  };

  const verificarDisponibilidade = () => {
    if (horariosDisponiveis.length === 0) return "Indisponível neste período";
    const regra = experiencia?.regras_disponibilidade?.find(r => 
      r.data_especifica === dataPasseio && r.periodo === periodo
    );
    if (regra) {
      if (parseInt(regra.disponivel) === 0 || parseInt(regra.vagas_disponiveis) === 0) return "Esgotado";
    }
    return "Disponível";
  };

  const precoVigente = getPrecoAtual();
  const statusVagas = verificarDisponibilidade();

  const handleReservarAgora = () => {
    if (!usuarioLogado) {
      alert("Por favor, faça login com o Google primeiro.");
      return;
    }

    const dataFormatada = new Date(dataPasseio).toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    navigate('/checkout', { 
      state: { 
        reservaData: {
          id: experiencia.id,
          titulo: experiencia.titulo,
          imagem: experiencia.imagem_principal || images[0],
          localizacao: experiencia.ilha,
          entrada: dataFormatada,
          dataISO: dataPasseio,
          duracao: experiencia.duracao,
          maxPessoas: experiencia.max_pessoas,
          precoPorPessoa: precoVigente
        },
        dataSelecionada: dataFormatada,
        horarioSelecionado: horario,
        periodoSelecionado: periodo
      } 
    });
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
          <p className="text-slate-600">Carregando detalhes da experiência...</p>
        </div>
      </div>
    );
  }

  if (error || !experiencia) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Erro ao carregar</h2>
          <p className="text-slate-600 mb-4">{error || 'Experiência não encontrada'}</p>
          <button 
            onClick={() => navigate('/experiencias')}
            className="bg-[#003580] text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition"
          >
            Voltar para experiências
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
        <span onClick={() => navigate('/experiencias')} className="hover:text-blue-900 cursor-pointer">Experiências</span>
        <ChevronRight size={10} />
        <span className="text-slate-500 font-semibold truncate">{experiencia.titulo}</span>
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
              titulo={experiencia.titulo}
              categoria={experiencia.categoria_nome}
            />

            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Informações principais</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-slate-400" />
                  <div>
                    <p className="text-[11px] font-bold">{experiencia.duracao}</p>
                    <p className="text-[9px] text-slate-400">Duração</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-slate-400" />
                  <div>
                    <p className="text-[11px] font-bold">Máx. {experiencia.max_pessoas}</p>
                    <p className="text-[9px] text-slate-400">Participantes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-slate-400" />
                  <div>
                    <p className="text-[11px] font-bold">{experiencia.ilha}</p>
                    <p className="text-[9px] text-slate-400">Localização</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-slate-400" />
                  <div>
                    <p className="text-[11px] font-bold">{experiencia.rating_formatado || '5.0'}</p>
                    <p className="text-[9px] text-slate-400">Avaliação</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <SidebarReservaExperiencia 
              precoBase={precoBase}
              rating={experiencia.rating_formatado || '5.0'}
              dataPasseio={dataPasseio}
              setDataPasseio={setDataPasseio}
              periodo={periodo}
              setPeriodo={setPeriodo}
              horario={horario}
              setHorario={setHorario}
              periodosUI={periodosUI}
              horariosDisponiveis={horariosDisponiveis}
              statusVagas={statusVagas}
              precoVigente={precoVigente}
              onReservar={handleReservarAgora}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">{experiencia.titulo}</h1>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">{experiencia.categoria_nome || 'Experiência'}</span>
            </div>
            <div className="flex items-center gap-4 text-sm mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin size={14} className="text-orange-500" /> {experiencia.ilha}, {experiencia.localizacao}
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-orange-400 text-orange-400" /> 
                <span className="text-slate-900 font-bold">{experiencia.rating_formatado || '5.0'}</span> 
                <span className="text-slate-400">({experiencia.reviews_recentes?.length || 0} avaliações)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        <TabsNavegacaoExperiencia activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TabContent activeTab={activeTab} experiencia={experiencia} />
          </div>

          <div className="space-y-4">
            <GuiaInfo guia={experiencia.guia} />
            <MapLocationExperiencia 
              localizacao={experiencia.localizacao}
              ilha={experiencia.ilha}
              pontosProximos={experiencia.pontos_proximos}
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO DE AVALIAÇÕES - ROW SOZINHO W-FULL */}
      <div className="w-full bg-white border-t border-slate-100 mt-12 pt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Avaliações dos participantes
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({experiencia.reviews_recentes?.length || 0} avaliações)
              </span>
            </h2>
            <div className="flex items-center gap-2">
              <Star size={20} className="fill-orange-400 text-orange-400" />
              <span className="text-2xl font-bold text-slate-900">{experiencia.rating_formatado || '5.0'}</span>
            </div>
          </div>
          
          <AvaliacoesSeccao 
            experienciaId={experiencia.id} 
            usuarioLogado={usuarioLogado}
            onOpenLoginModal={() => alert("Por favor, faça login com o Google para avaliar.")}
          />
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .react-datepicker__day--selected {
          background-color: #003580 !important;
          color: white !important;
          border-radius: 50% !important;
        }
      `}</style>
    </div>
  );
};

export default ExperienciaDetalhes;