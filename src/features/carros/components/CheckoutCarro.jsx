// CheckoutCarro.jsx - Versão corrigida (sem duplicação)
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Check, ArrowLeft, Loader, AlertCircle, ChevronRight, Calendar, Users, Home, ShieldCheck, Lock, Gauge, Fuel, Info, MapPin, Clock, FileText, Upload
} from 'lucide-react';
import DataModalCarro from './DataModalCarro';

const CondutorPrincipal = ({ condutor, updateCondutor }) => {
  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-sans">1</span>
        Condutor Principal
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Nome completo *</label>
          <input 
            type="text"
            value={condutor.nome_completo}
            onChange={(e) => updateCondutor('nome_completo', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder="Como na carta de condução"
          />
        </div>
        
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Email *</label>
          <input 
            type="email"
            value={condutor.email}
            onChange={(e) => updateCondutor('email', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder="seu@email.com"
          />
        </div>
        
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Telefone / WhatsApp *</label>
          <input 
            type="tel"
            value={condutor.phone}
            onChange={(e) => updateCondutor('phone', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder="+238 991 23 45"
          />
        </div>
        
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">País / Nacionalidade *</label>
          <select 
            value={condutor.nacionalidade}
            onChange={(e) => updateCondutor('nacionalidade', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 bg-white"
          >
            <option value="Cabo Verde">Cabo Verde</option>
            <option value="Portugal">Portugal</option>
            <option value="Brasil">Brasil</option>
            <option value="Angola">Angola</option>
            <option value="Moçambique">Moçambique</option>
            <option value="Estados Unidos">Estados Unidos</option>
            <option value="França">França</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
      </div>
      
      {/* Linha separadora */}
      <div className="border-t border-slate-100 my-6"></div>
      
      {/* Informações adicionais */}
      <div className="space-y-5">
        {/* Hora de Levantamento */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
            <Clock size={12} /> Hora de Levantamento *
          </label>
          <select 
            value={condutor.hora_levantamento || '10:00'}
            onChange={(e) => updateCondutor('hora_levantamento', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 bg-white"
          >
            <option value="08:00">08:00</option>
            <option value="09:00">09:00</option>
            <option value="10:00">10:00</option>
            <option value="11:00">11:00</option>
            <option value="12:00">12:00</option>
            <option value="13:00">13:00</option>
            <option value="14:00">14:00</option>
            <option value="15:00">15:00</option>
            <option value="16:00">16:00</option>
            <option value="17:00">17:00</option>
          </select>
        </div>
        
        {/* Carta de Condução - Upload */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
            <Upload size={12} /> Carta de Condução (PDF/Word) *
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors cursor-pointer bg-slate-50/30">
            <input
              type="file"
              id="carta-conducao"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  updateCondutor('carta_conducao_file', file);
                  updateCondutor('carta_conducao_nome', file.name);
                }
              }}
              className="hidden"
            />
            <label htmlFor="carta-conducao" className="cursor-pointer block">
              <Upload size={24} className="mx-auto text-slate-400 mb-2" />
              {condutor.carta_conducao_nome ? (
                <div className="text-green-600 text-sm font-medium flex items-center justify-center gap-2">
                  <Check size={16} /> {condutor.carta_conducao_nome}
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-600">Clique para fazer upload</p>
                  <p className="text-[10px] text-slate-400 mt-1">PDF ou Word até 5MB</p>
                </>
              )}
            </label>
          </div>
        </div>
        
        {/* Observações */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
            <FileText size={12} /> Observações / Pedidos Especiais
          </label>
          <textarea 
            rows="3"
            value={condutor.observacoes || ''}
            onChange={(e) => updateCondutor('observacoes', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 resize-none"
            placeholder="Ex: Cadeirinha de bebé, GPS, assento elevatório, etc."
          />
        </div>
      </div>
      
      {/* Aviso legal */}
      <div className="mt-6 p-3 bg-amber-50 rounded-xl border border-amber-200">
        <p className="text-[10px] text-amber-700 font-medium flex items-start gap-2">
          <span className="text-amber-500">⚠️</span>
          A carta de condução deve estar válida e em nome do condutor principal.
        </p>
      </div>
    </div>
  );
};

const ResumoReservaCarro = ({ reserva, precoTotal, setDataModalOpen }) => {
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    return Number(value).toLocaleString('pt-PT');
  };
  
  const formatarData = (data) => {
    if (!data) return 'Não selecionada';
    const d = new Date(data);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm sticky top-6 text-left">
      <h2 className="text-lg font-bold text-blue-900 mb-5">Resumo da reserva</h2>
      
      <div className="flex gap-4 mb-6">
        <img 
          src={reserva?.imagem || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200'} 
          className="w-20 h-20 rounded-xl object-cover shrink-0" 
          alt={reserva?.titulo || 'Veículo'}
          onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200'}
        />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-blue-900 leading-tight">{reserva?.titulo || 'Morabeza Rent'}</h4>
          <p className="text-[10px] text-slate-500 mt-1 font-medium flex items-center gap-1">
            <MapPin size={10} className="text-orange-500" /> {reserva?.localizacao || 'Cabo Verde'}
          </p>
          <button 
            onClick={() => setDataModalOpen && setDataModalOpen(true)}
            className="text-[10px] text-blue-600 underline mt-2 font-bold block"
          >
            Alterar datas
          </button>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-5">
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">Levantamento</span>
          <span className="text-xs font-bold text-blue-900">{formatarData(reserva?.checkIn)} - {reserva?.horaLevantamento || '10:00'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">Devolução</span>
          <span className="text-xs font-bold text-blue-900">{formatarData(reserva?.checkOut)} - {reserva?.horaLevantamento || '10:00'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">Dias</span>
          <span className="text-xs font-bold text-blue-900">{reserva?.dias || 0} {Number(reserva?.dias) === 1 ? 'dia' : 'dias'}</span>
        </div>
        
        <div className="pt-3 space-y-2 border-t border-slate-100">
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500">Preço por dia</span>
            <span className="text-slate-800">{formatNumber(reserva?.precoDia)} CVE</span>
          </div>
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500">Subtotal ({reserva?.dias || 0} dias)</span>
            <span className="text-slate-800">{formatNumber(reserva?.subtotal)} CVE</span>
          </div>
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500 flex items-center gap-1">Taxa de serviço (10%) <Info size={11} className="text-slate-400" /></span>
            <span className="text-slate-800">{formatNumber(reserva?.taxaServico)} CVE</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <span className="text-base font-bold text-blue-900">Total</span>
          <span className="text-xl font-bold text-blue-600">{formatNumber(precoTotal)} CVE</span>
        </div>

        <div className="bg-green-50 p-3 rounded-xl flex gap-2 mt-3 border border-green-100">
          <ShieldCheck className="text-green-600 shrink-0" size={18} />
          <div>
            <p className="text-[9px] font-bold text-green-800">Cancelamento gratuito</p>
            <p className="text-[8px] text-green-700 font-medium">Até 48 horas antes do levantamento</p>
          </div>
        </div>

        <div className="bg-[#F0F7FF] p-3 rounded-xl flex gap-2 border border-blue-50">
          <Lock className="text-blue-600 shrink-0" size={16} />
          <p className="text-[8px] text-blue-700 font-medium">Seus dados estão protegidos e seguros através de encriptação segura de ponta a ponta.</p>
        </div>
      </div>
    </div>
  );
};

// Componente principal CheckoutCarro
const CheckoutCarro = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservaData } = location.state || {};
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDataModalOpen, setDataModalOpen] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(false);
  
  const [condutor, setCondutor] = useState({
    nome_completo: '',
    email: '',
    phone: '',
    idade: 'adulto',
    nacionalidade: 'Cabo Verde',
    hora_levantamento: '10:00',
    carta_conducao_file: null,
    carta_conducao_nome: '',
    observacoes: ''
  });

  const [reserva, setReserva] = useState({
    id: reservaData?.carroId || reservaData?.id || null,
    titulo: reservaData?.titulo || '',
    imagem: reservaData?.imagem || '',
    localizacao: reservaData?.localizacao || '',
    checkIn: reservaData?.checkIn || '',
    checkOut: reservaData?.checkOut || '',
    dias: reservaData?.dias || 1,
    precoDia: reservaData?.precoDia || 0,
    subtotal: reservaData?.subtotal || 0,
    taxaServico: reservaData?.taxaServico || 0,
    totalGeral: reservaData?.totalGeral || 0,
    tipo: reservaData?.tipo || 'SUV',
    horaLevantamento: reservaData?.horaLevantamento || '10:00'
  });

  const buscarDadosUsuario = async (email, googleId) => {
    setCarregandoDados(true);
    try {
      let url = `https://welovepalop.com/api/checkout_api.php?email=${encodeURIComponent(email)}&category=Carro`;
      if (googleId) {
        url += `&google_id=${encodeURIComponent(googleId)}`;
      }
      const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      const result = await response.json();
      if (result.success && result.usuario) {
        setCondutor(prev => ({
          ...prev,
          nome_completo: result.usuario.full_name || prev.nome_completo,
          email: result.usuario.email || prev.email,
          phone: result.usuario.phone || prev.phone
        }));
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setCarregandoDados(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const email = userData.email;
        const googleId = userData.sub || userData.google_id || null;
        setUser({ ...userData, google_id: googleId, email });
        buscarDadosUsuario(email, googleId);
        setCondutor(prev => ({
          ...prev,
          nome_completo: userData.name || userData.full_name || '',
          email: email,
          phone: userData.phone || ''
        }));
      } catch (e) {
        console.error('Erro ao parsear usuário:', e);
      }
    } else {
      alert('Por favor, faça login para continuar');
      navigate('/carros');
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!reservaData) {
      navigate('/carros');
    }
  }, [reservaData, navigate]);

  const handleSelectData = (dataObj) => {
    const novosDias = dataObj.dias;
    const novoSubtotal = reserva.precoDia * novosDias;
    const novaTaxaServico = Math.round(novoSubtotal * 0.10);
    const novoTotal = novoSubtotal + novaTaxaServico;
    
    setReserva(prev => ({
      ...prev,
      checkIn: dataObj.checkIn,
      checkOut: dataObj.checkOut,
      dias: novosDias,
      subtotal: novoSubtotal,
      taxaServico: novaTaxaServico,
      totalGeral: novoTotal
    }));
    setDataModalOpen(false);
  };

  const updateCondutor = (field, value) => {
    setCondutor(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    setError('');
    if (!condutor.nome_completo.trim()) {
      setError('Nome completo do condutor principal é obrigatório');
      return false;
    }
    if (!condutor.email.trim()) {
      setError('Email do condutor principal é obrigatório');
      return false;
    }
    if (!condutor.phone.trim()) {
      setError('Telefone do condutor principal é obrigatório');
      return false;
    }
    if (!condutor.nacionalidade.trim()) {
      setError('Nacionalidade do condutor principal é obrigatória');
      return false;
    }
    if (!condutor.carta_conducao_file && !condutor.carta_conducao_nome) {
      setError('Por favor, faça upload da carta de condução');
      return false;
    }
    if (!reserva.checkIn || !reserva.checkOut) {
      setError('Por favor, selecione as datas de Levantamento e Devolução');
      return false;
    }
    return true;
  };

  // ✅ FUNÇÃO HANDLESUBMIT CORRIGIDA (apenas uma versão)
  const handleSubmit = () => {
    if (!validateForm()) return;
    if (!user || !user.email) {
      setError('Usuário não está logado.');
      return;
    }

    setLoading(true);

    // Preparar dados para o sessionStorage
    const dadosReserva = {
      reservaData: {
        ...reserva,
        precoTotal: reserva.totalGeral,
        tipo: 'carro'
      },
      participantePrincipal: {
        nome_completo: condutor.nome_completo,
        email: condutor.email,
        phone: condutor.phone,
        idade: condutor.idade,
        nacionalidade: condutor.nacionalidade,
        hora_levantamento: condutor.hora_levantamento,
        carta_conducao_nome: condutor.carta_conducao_nome,
        observacoes: condutor.observacoes
      },
      participantesAdicionais: [],
      usuario: user
    };

    console.log('💾 Salvando reservaCarroPendente:', dadosReserva);
    sessionStorage.setItem('reservaCarroPendente', JSON.stringify(dadosReserva));

    // Navegar para o pagamento
    navigate('/pagamento', { 
      state: { 
        reservaData: { 
          ...reserva, 
          precoTotal: reserva.totalGeral,
          tipo: 'carro'
        },
        dadosParticipantes: { 
          participantePrincipal: condutor, 
          participantes: [] 
        },
        tipo: 'carro'
      } 
    });
  };

  const totalPreco = reserva.totalGeral;

  if (!reservaData || carregandoDados) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="font-bold text-gray-500 font-medium">A carregar dados da reserva...</p>
      </div>
    );
  }

  const formatarData = (data) => {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4">
            {[
              { n: 1, label: 'Dados do condutor', active: true },
              { n: 2, label: 'Pagamento', active: false },
              { n: 3, label: 'Confirmação', active: false }
            ].map((s, i, arr) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center min-w-[120px]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${s.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'border border-slate-200 text-slate-400'}`}>
                    {s.n}
                  </div>
                  <span className={`text-[10px] font-medium whitespace-nowrap ${s.active ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className="flex-1 border-t border-dashed border-slate-200 mx-2 mb-6"></div>}
              </React.Fragment>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-left">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <h1 className="text-2xl font-bold text-blue-900 mb-2 text-left">Dados do condutor</h1>
              <p className="text-slate-500 text-sm mb-6 text-left font-medium">Preencha os dados para o condutor principal.</p>

              <div className="bg-[#F0F7FF] border border-blue-100 rounded-lg p-4 flex gap-3 mb-8 text-left">
                <div className="w-5 h-5 rounded-full border border-blue-600 flex items-center justify-center text-blue-600 text-[10px] font-bold italic shrink-0 font-sans">i</div>
                <div>
                  <p className="text-sm font-bold text-blue-900">Informação importante</p>
                  <p className="text-xs text-blue-700 font-medium">O condutor deve apresentar carta de condução válida e documento de identificação no momento do levantamento.</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-6 flex flex-wrap gap-4 text-xs text-left">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600"/>
                  <span className="font-medium text-slate-700">{formatarData(reserva.checkIn)} - {formatarData(reserva.checkOut)}</span>
                  <span className="text-slate-400 font-medium">• {reserva.dias} {Number(reserva.dias) === 1 ? 'dia' : 'dias'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge size={14} className="text-blue-600"/>
                  <span className="font-medium text-slate-700">Categoria: {reserva.tipo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home size={14} className="text-blue-600"/>
                  <span className="font-medium text-slate-700">{reserva.titulo}</span>
                </div>
              </div>

              <CondutorPrincipal 
                condutor={condutor} 
                updateCondutor={updateCondutor} 
              />

              <div className="mt-10 flex flex-col sm:flex-row justify-between gap-3">
                <button 
                  onClick={() => navigate(-1)} 
                  className="px-6 py-3 border border-slate-200 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-slate-700 shadow-sm"
                >
                  <ArrowLeft size={18}/> Voltar
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
                >
                  {loading ? <Loader size={18} className="animate-spin" /> : null}
                  {loading ? 'Processando...' : 'Continuar para pagamento'} <ChevronRight size={18}/>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4">
              <ResumoReservaCarro 
                reserva={reserva} 
                precoTotal={totalPreco}
                setDataModalOpen={setDataModalOpen}
              />
            </div>
          </div>
        </div>
      </div>

      {isDataModalOpen && (
        <DataModalCarro 
          onClose={() => setDataModalOpen(false)} 
          onSelectData={handleSelectData} 
          carroTitulo={reserva.titulo} 
          currentCheckIn={reserva.checkIn}
          currentCheckOut={reserva.checkOut}
        />
      )}
    </>
  );
};

export default CheckoutCarro;