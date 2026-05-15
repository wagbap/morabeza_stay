// PaginaDetalhes.jsx - Versão atualizada
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Star, MapPin, Clock, Users, ChevronLeft, ChevronRight, 
  Check, ShieldCheck, Info, Camera, Calendar, Minus, Plus, 
  Headphones, Heart, Sunset, Share2, Sun, Loader2
} from 'lucide-react';
import axios from 'axios';

const InfoAlojamento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados dinâmicos da API
  const [alojamento, setAlojamento] = useState(location.state?.alojamento || null);
  const [loading, setLoading] = useState(!alojamento);
  const [error, setError] = useState(null);
  
  // Estado para a imagem principal e galeria
  const [imagemPrincipal, setImagemPrincipal] = useState('');
  const [imagemIndex, setImagemIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Estados para o formulário de reserva
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState('');
  const [numHospedes, setNumHospedes] = useState(2);

  // Estado para o usuário logado
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Função para calcular número de noites
  const calcularNoites = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calcular total base
  const noites = calcularNoites();
  const totalBase = noites * Number(alojamento?.preco_noite || 0);

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
    const fetchDados = async () => {
      if (alojamento) {
        const imgInicial = alojamento.imagem_url || (alojamento.imagens_extra && alojamento.imagens_extra[0]?.caminho_url);
        setImagemPrincipal(imgInicial ? `https://welovepalop.com/api/uploads/${imgInicial}` : '');
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('https://welovepalop.com/api/get_alojamentos.php');
        const lista = Array.isArray(response.data) ? response.data : [];
        const encontrado = lista.find(item => String(item.id) === String(id));
        
        if (encontrado) {
          setAlojamento(encontrado);
          const imgInicial = encontrado.imagem_url || (encontrado.imagens_extra && encontrado.imagens_extra[0]?.caminho_url);
          setImagemPrincipal(imgInicial ? `https://welovepalop.com/api/uploads/${imgInicial}` : '');
        } else {
          setError('Alojamento não encontrado');
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
        setError("Erro ao carregar dados do alojamento");
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
    window.scrollTo(0, 0);
  }, [id, alojamento]);

  const handleIrParaCheckout = () => {
    const userLogado = localStorage.getItem('user');
    
    if (!userLogado) {
      alert("Por favor, faça login com o Google primeiro.");
      return;
    }

    if (!checkIn || !checkOut) {
      alert("Por favor, selecione as datas de Check-in e Check-out");
      return;
    }

    if (noites <= 0) {
      alert("A data de check-out deve ser posterior à data de check-in");
      return;
    }

    // Dados completos para o checkout
    const reservaData = {
      id: alojamento.id,
      titulo: alojamento.titulo,
      imagem: imagemPrincipal,
      localizacao: alojamento.localizacao,
      ilha: alojamento.ilha || 'Cabo Verde',
      precoNoite: Number(alojamento.preco_noite),
      checkIn: checkIn,
      checkOut: checkOut,
      hospedes: numHospedes,
      capacidade: alojamento.capacidade || numHospedes,
      noites: noites,
      totalBase: totalBase,
      taxaLimpeza: Number(alojamento.taxa_limpeza) || 2500,
      taxaServico: Number(alojamento.taxa_servico) || 1200,
      descricao: alojamento.descricao,
      comodidades: alojamento.comodidades || [],
      imagens_extra: alojamento.imagens_extra || []
    };

    navigate('/checkout-alojamento', { state: { reservaData } });
  };

  // Funções para navegação da galeria
  const BASE_URL_IMAGENS = "https://welovepalop.com/api/uploads/";
  const fotosExtras = (alojamento?.imagens_extra || []).map(img => `${BASE_URL_IMAGENS}${img.caminho_url}`);
  const todasAsFotos = alojamento?.imagem_url ? [`${BASE_URL_IMAGENS}${alojamento.imagem_url}`, ...fotosExtras] : fotosExtras;

  const nextImage = () => {
    if (todasAsFotos.length > 0) {
      const newIndex = (imagemIndex + 1) % todasAsFotos.length;
      setImagemIndex(newIndex);
      setImagemPrincipal(todasAsFotos[newIndex]);
      setImageLoading(true);
    }
  };

  const prevImage = () => {
    if (todasAsFotos.length > 0) {
      const newIndex = (imagemIndex - 1 + todasAsFotos.length) % todasAsFotos.length;
      setImagemIndex(newIndex);
      setImagemPrincipal(todasAsFotos[newIndex]);
      setImageLoading(true);
    }
  };

  const trocarImagemPrincipal = (novaImagem, index) => {
    setImagemPrincipal(novaImagem);
    setImagemIndex(index);
    setImageLoading(true);
  };

  if (loading) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="font-bold text-[#1a2b6d]">Carregando detalhes do alojamento...</p>
        </div>
      </div>
    );
  }
  
  if (error || !alojamento) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <p className="font-bold text-red-500 text-xl mb-4">{error || "Alojamento não encontrado."}</p>
          <button 
            onClick={() => navigate('/alojamentos')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Voltar para alojamentos
          </button>
        </div>
      </div>
    );
  }

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-20 font-sans text-[#1a2b6d]">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-[11px] font-medium text-slate-500">
        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/')}>Início</span> 
        <ChevronRight size={10} />
        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/alojamentos')}>Alojamentos</span> 
        <ChevronRight size={10} />
        <span className="text-slate-500 font-semibold truncate">{alojamento.titulo}</span>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
          {/* COLUNA ESQUERDA */}
          <div className="lg:col-span-2">
            <div className="space-y-3 mb-6">
              <div className="relative h-[300px] md:h-[380px] rounded-2xl overflow-hidden group bg-slate-100">
                {imageLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
                )}
                <img 
                  src={imagemPrincipal} 
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  alt={alojamento.titulo}
                  onLoad={() => setImageLoading(false)}
                />
                {todasAsFotos.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                    >
                      <ChevronLeft size={18}/>
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                    >
                      <ChevronRight size={18}/>
                    </button>
                  </>
                )}
                <div className="absolute bottom-4 left-4 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xl">
                  <ShieldCheck size={12}/> {alojamento.tipo_alojamento || 'Premium'}
                </div>
              </div>
              
              {todasAsFotos.length > 0 && (
                <div className="grid grid-cols-5 gap-2 h-20">
                  {todasAsFotos.slice(0, 4).map((img, i) => (
                    <div 
                      key={i} 
                      onClick={() => trocarImagemPrincipal(img, i)}
                      className={`rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        imagemIndex === i ? 'border-blue-600' : 'border-transparent hover:border-blue-600'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${i + 1}`} />
                    </div>
                  ))}
                  {todasAsFotos.length > 4 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-0.5 text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors">
                      <Camera size={16}/>
                      <span className="text-[9px] font-black uppercase tracking-tighter">+{todasAsFotos.length - 4}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">{alojamento.titulo}</h1>
              <div className="flex flex-wrap gap-5 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-orange-400 text-orange-400"/> 
                  {alojamento.estrelas || '4.5'} ({alojamento.avaliacoes_count || 12} avaliações)
                </div>
                <div className="flex items-center gap-1 text-slate-400">|</div>
                <div className="flex items-center gap-1"><MapPin size={14}/> {alojamento.ilha || 'Cabo Verde'}, {alojamento.localizacao}</div>
                <div className="flex items-center gap-1 text-slate-400">|</div>
                <div className="flex items-center gap-1"><Users size={14}/> Capacidade: {alojamento.capacidade || 2} hóspedes</div>
              </div>
            </div>

            <p className="text-slate-500 text-sm mb-8 leading-relaxed">{alojamento.descricao?.substring(0, 200)}...</p>

            {alojamento.comodidades && alojamento.comodidades.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 py-6 border-y border-slate-100">
                {alojamento.comodidades.slice(0, 4).map((com, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase tracking-tighter">
                    <Check size={18} className="text-blue-500"/> {com.nome}
                  </div>
                ))}
              </div>
            )}

            <div className="mb-12">
              <h3 className="font-black text-lg mb-4 text-[#1a2b6d]">Sobre o alojamento</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{alojamento.descricao}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-8">
              <div className="flex gap-4 p-4 bg-blue-50/30 rounded-2xl">
                <Calendar className="text-blue-600 shrink-0" size={24}/>
                <div><h4 className="font-bold text-xs">Confirmação imediata</h4><p className="text-[10px] text-slate-400">Sujeito a disponibilidade</p></div>
              </div>
              <div className="flex gap-4 p-4 bg-blue-50/30 rounded-2xl">
                <ShieldCheck className="text-blue-600 shrink-0" size={24}/>
                <div><h4 className="font-bold text-xs">Alojamento Seguro</h4><p className="text-[10px] text-slate-400">Verificado Morabeza</p></div>
              </div>
              <div className="flex gap-4 p-4 bg-blue-50/30 rounded-2xl">
                <Headphones className="text-blue-600 shrink-0" size={24}/>
                <div><h4 className="font-bold text-xs">Suporte 24/7</h4><p className="text-[10px] text-slate-400">Atendimento local</p></div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA - SIDEBAR DE RESERVA */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white border border-slate-100 shadow-2xl shadow-blue-900/5 rounded-[2rem] p-8">
              
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-2xl font-bold">{Number(alojamento.preco_noite).toLocaleString()} CVE</span>
                <span className="text-xs font-semibold text-slate-400">/ noite</span>
              </div>

              <div className="space-y-6">
                {/* CHECK-IN */}
                <div>
                  <label className="text-[10px] font-black tracking-[0.1em] text-[#1a2b6d] block mb-3 uppercase">Data de Check-in</label>
                  <input 
                    type="date" 
                    value={checkIn} 
                    min={minDate}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-[#1a2b6d]" 
                  />
                </div>

                {/* CHECK-OUT */}
                <div>
                  <label className="text-[10px] font-black tracking-[0.1em] text-[#1a2b6d] block mb-3 uppercase">Data de Check-out</label>
                  <input 
                    type="date" 
                    value={checkOut} 
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-[#1a2b6d]" 
                  />
                </div>

                {/* HÓSPEDES */}
                <div>
                  <label className="text-[10px] font-black tracking-[0.1em] text-[#1a2b6d] block mb-3 uppercase">Número de hóspedes</label>
                  <select 
                    value={numHospedes}
                    onChange={(e) => setNumHospedes(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-[#1a2b6d] appearance-none"
                  >
                    {[...Array(alojamento.capacidade || 4)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} {i + 1 === 1 ? 'Hóspede' : 'Hóspedes'}</option>
                    ))}
                  </select>
                </div>

                {/* INFO DISPONIBILIDADE */}
                <div className="w-full py-3 px-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-[11px] font-bold text-slate-500 tracking-tight">
                    {noites > 0 ? (
                      <span className="text-green-600">✓ {noites} {noites === 1 ? 'noite' : 'noites'} selecionada(s)</span>
                    ) : (
                      <span>⚠️ Selecione as datas</span>
                    )}
                  </p>
                </div>
              </div>

              {/* TOTAL */}
              <div className="pt-6 border-t border-slate-100 space-y-3 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">
                    Preço por noite ({noites} {noites === 1 ? 'noite' : 'noites'})
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {Number(alojamento.preco_noite).toLocaleString()} CVE × {noites} = {totalBase.toLocaleString()} CVE
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="text-sm font-bold text-slate-600">Total (sem taxas)</span>
                  <span className="text-xl font-bold text-blue-600">
                    {totalBase.toLocaleString()} CVE
                  </span>
                </div>

                <button 
                  onClick={handleIrParaCheckout}
                  className="w-full font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 cursor-pointer"
                >
                  <Calendar size={18}/> Continuar para Checkout
                </button>
                
                <p className="text-[9px] text-slate-400 text-center mt-3">
                  Taxa de limpeza e serviço serão calculadas no checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InfoAlojamento;