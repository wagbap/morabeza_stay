// CheckoutAlojamento.jsx - Versão atualizada
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Check, ArrowLeft, Loader, AlertCircle, ChevronRight, Calendar, Users, Home, CreditCard
} from 'lucide-react';



// AGORA O CAMINHO É DIRETO E LIMPO:
import DataModal from "../../experiencias/components/DataModalExperiencia";
import HorarioModal from "../../experiencias/components/HorarioModalExperiencia";
import ParticipantePrincipal from "../../experiencias/components/ParticipantePrincipalExperiencia";
import ParticipantesAnterioresTabela from "../../experiencias/components/ParticipanteAnteriorExperiencia";
import ResumoReservaExperiencia from "../../experiencias/components/ResumoReservaExperiencia";


const CheckoutAlojamento = () => {<a href=""></a>
  const location = useLocation();
  const navigate = useNavigate();
  const { reservaData } = location.state || {};
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDataModalOpen, setDataModalOpen] = useState(false);
  const [isHorarioModalOpen, setHorarioModalOpen] = useState(false);
  const [participantesAnteriores, setParticipantesAnteriores] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [deletandoParticipante, setDeletandoParticipante] = useState(null);
  const [editandoParticipante, setEditandoParticipante] = useState(null);
  const [editForm, setEditForm] = useState({ nome_completo: '', idade: '', nacionalidade: '' });
  
  // Calcular noites (caso não venha na reservaData)
  const calcularNoites = () => {
    if (reservaData?.noites) return reservaData.noites;
    if (!reservaData?.checkIn || !reservaData?.checkOut) return 1;
    const entrada = new Date(reservaData.checkIn);
    const saida = new Date(reservaData.checkOut);
    const diff = Math.ceil((saida - entrada) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const noites = calcularNoites();
  const precoNoite = Number(reservaData?.precoNoite || 0);
  const subtotal = precoNoite * noites;
  const taxaLimpeza = Number(reservaData?.taxaLimpeza || 2500);
  const taxaServico = Number(reservaData?.taxaServico || 1200);
  const totalGeral = subtotal + taxaLimpeza + taxaServico;
  
  const [reserva, setReserva] = useState({
    id: reservaData?.id || null,
    titulo: reservaData?.titulo || '',
    imagem: reservaData?.imagem || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
    localizacao: reservaData?.localizacao || '',
    ilha: reservaData?.ilha || 'Cabo Verde',
    checkIn: reservaData?.checkIn || '',
    checkOut: reservaData?.checkOut || '',
    noites: noites,
    precoNoite: precoNoite,
    subtotal: subtotal,
    taxaLimpeza: taxaLimpeza,
    taxaServico: taxaServico,
    totalGeral: totalGeral,
    hospedes: reservaData?.hospedes || 2,
    maxPessoas: reservaData?.capacidade || 10
  });
  
  const [participantePrincipal, setParticipantePrincipal] = useState({
    nome_completo: '',
    email: '',
    phone: '',
    idade: 'adulto',
    nacionalidade: 'Cabo Verde'
  });
  
  const [participantes, setParticipantes] = useState([]);

  const buscarDadosUsuario = async (email, googleId) => {
    setCarregandoDados(true);
    try {
      let url = `https://welovepalop.com/api/checkout_api.php?email=${encodeURIComponent(email)}`;
      const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      const result = await response.json();
      
      if (result.success) {
        if (result.usuario) {
          setParticipantePrincipal(prev => ({
            ...prev,
            nome_completo: result.usuario.full_name || prev.nome_completo,
            email: result.usuario.email || prev.email,
            phone: result.usuario.phone || prev.phone
          }));
        }
        setParticipantesAnteriores(result.participantes_anteriores || []);
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setCarregandoDados(false);
    }
  };

  const deletarParticipante = async (participante) => {
    if (!window.confirm(`Tem certeza que deseja remover "${participante.nome_completo}"?`)) return;
    
    setDeletandoParticipante(participante.nome_completo);
    try {
      const response = await fetch('https://welovepalop.com/api/checkout_api.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `nome_completo=${encodeURIComponent(participante.nome_completo)}&email=${encodeURIComponent(participantePrincipal.email)}`
      });
      const result = await response.json();
      if (result.success) {
        setParticipantesAnteriores(prev => prev.filter(p => p.nome_completo !== participante.nome_completo));
      }
    } catch (err) {
      console.error('Erro ao deletar:', err);
    } finally {
      setDeletandoParticipante(null);
    }
  };

  const iniciarEdicao = (participante) => {
    setEditandoParticipante(participante.nome_completo);
    setEditForm({
      nome_completo: participante.nome_completo,
      idade: participante.idade,
      nacionalidade: participante.nacionalidade
    });
  };

  const salvarEdicao = async (participanteOriginal) => {
    if (!editForm.nome_completo.trim()) {
      setError('O nome do participante não pode estar vazio');
      return;
    }
    
    setDeletandoParticipante(participanteOriginal.nome_completo);
    try {
      const response = await fetch('https://welovepalop.com/api/checkout_api.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_antigo: participanteOriginal.nome_completo,
          nome_novo: editForm.nome_completo,
          idade: editForm.idade,
          nacionalidade: editForm.nacionalidade,
          email: participantePrincipal.email
        })
      });
      const result = await response.json();
      if (result.success) {
        setParticipantesAnteriores(prev => prev.map(p => 
          p.nome_completo === participanteOriginal.nome_completo ? {
            ...p,
            nome_completo: editForm.nome_completo,
            idade: editForm.idade,
            nacionalidade: editForm.nacionalidade
          } : p
        ));
        setParticipantes(prev => prev.map(p => 
          p.nome_completo === participanteOriginal.nome_completo ? {
            ...p,
            nome_completo: editForm.nome_completo,
            idade: editForm.idade,
            nacionalidade: editForm.nacionalidade
          } : p
        ));
        setEditandoParticipante(null);
      }
    } catch (err) {
      console.error('Erro ao editar:', err);
    } finally {
      setDeletandoParticipante(null);
    }
  };

  const cancelarEdicao = () => {
    setEditandoParticipante(null);
    setEditForm({ nome_completo: '', idade: '', nacionalidade: '' });
  };

  const adicionarParticipanteAnterior = (participante) => {
    const jaExiste = participantes.some(p => p.nome_completo === participante.nome_completo);
    if (jaExiste) {
      setError(`"${participante.nome_completo}" já foi adicionado à reserva atual`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    setParticipantes([...participantes, { 
      id: Date.now(),
      nome_completo: participante.nome_completo,
      idade: participante.idade || 'adulto',
      nacionalidade: participante.nacionalidade || 'Cabo Verde'
    }]);
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
        setParticipantePrincipal(prev => ({
          ...prev,
          nome_completo: userData.name || userData.full_name || '',
          email: email,
          phone: userData.phone || ''
        }));
      } catch (e) {
        console.error('Erro ao parsear usuário:', e);
      }
    }
    window.scrollTo(0, 0);
  }, []);

  // Redirecionar se não houver dados
  useEffect(() => {
    if (!reservaData) {
      navigate('/alojamentos');
    }
  }, [reservaData, navigate]);

  const addParticipante = () => {
    setParticipantes([...participantes, { id: Date.now(), nome_completo: '', idade: 'adulto', nacionalidade: 'Cabo Verde' }]);
  };

  const removeParticipante = (id) => {
    setParticipantes(participantes.filter(p => p.id !== id));
  };

  const updateParticipantePrincipal = (field, value) => {
    setParticipantePrincipal(prev => ({ ...prev, [field]: value }));
  };

  const updateParticipante = (id, field, value) => {
    setParticipantes(participantes.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const validateForm = () => {
    if (!participantePrincipal.nome_completo.trim()) {
      setError('Nome completo do hóspede principal é obrigatório');
      return false;
    }
    if (!participantePrincipal.email.trim()) {
      setError('Email do hóspede principal é obrigatório');
      return false;
    }
    if (!participantePrincipal.phone.trim()) {
      setError('Telefone do hóspede principal é obrigatório');
      return false;
    }
    if (!reserva.checkIn || !reserva.checkOut) {
      setError('Por favor, selecione as datas de Check-in e Check-out');
      return false;
    }
    for (let i = 0; i < participantes.length; i++) {
      if (!participantes[i].nome_completo.trim()) {
        setError(`Nome do hóspede adicional ${i + 2} é obrigatório`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    if (!user || !user.email) {
      setError('Usuário não está logado.');
      return;
    }
    
    const totalHospedes = participantes.length + 1;
    
    // Salvar dados dos participantes no sessionStorage para serem usados no pagamento
    const dadosReserva = {
      reservaData: {
        ...reserva,
        totalHospedes: totalHospedes,
        precoTotal: totalGeral
      },
      participantePrincipal,
      participantesAdicionais: participantes,
      usuario: user
    };
    
    sessionStorage.setItem('reservaAlojamentoPendente', JSON.stringify(dadosReserva));
    
    // Navegar para pagamento
    navigate('/pagamento', { 
      state: { 
        reservaData: { ...reserva, totalHospedes: totalHospedes, precoTotal: totalGeral },
        dadosParticipantes: { participantePrincipal, participantes },
        tipo: 'alojamento'
      } 
    });
  };

  const totalHospedes = participantes.length + 1;
  const precoTotal = totalGeral;

  if (!reservaData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="font-bold text-gray-500">A carregar dados da reserva...</p>
      </div>
    );
  }

  // Formatar datas para exibição
  const formatarData = (data) => {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* STEPPER */}
          <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4">
            {[
              { n: 1, label: 'Dados dos hóspedes', active: true },
              { n: 2, label: 'Pagamento', active: false },
              { n: 3, label: 'Confirmação', active: false }
            ].map((s, i, arr) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center min-w-[120px]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${s.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'border border-slate-200 text-slate-400'}`}>
                    {s.n}
                  </div>
                  <span className={`text-[10px] whitespace-nowrap ${s.active ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className="flex-1 border-t border-dashed border-slate-200 mx-2 mb-6"></div>}
              </React.Fragment>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <h1 className="text-2xl font-bold text-blue-900 mb-2">Dados dos hóspedes</h1>
              <p className="text-slate-500 text-sm mb-6">Preencha os dados para todos os hóspedes.</p>

              <div className="bg-[#F0F7FF] border border-blue-100 rounded-lg p-4 flex gap-3 mb-8">
                <div className="w-5 h-5 rounded-full border border-blue-600 flex items-center justify-center text-blue-600 text-[10px] font-bold italic shrink-0">i</div>
                <div>
                  <p className="text-sm font-bold text-blue-900">Informação importante</p>
                  <p className="text-xs text-blue-700">O nome informado deve ser igual ao documento de identificação.</p>
                </div>
              </div>

              {/* Resumo rápido da reserva */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600"/>
                  <span className="font-medium">{formatarData(reserva.checkIn)} - {formatarData(reserva.checkOut)}</span>
                  <span className="text-slate-400">• {reserva.noites} noites</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-blue-600"/>
                  <span className="font-medium">{reserva.hospedes} hóspedes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home size={14} className="text-blue-600"/>
                  <span className="font-medium">{reserva.titulo}</span>
                </div>
              </div>

              <ParticipantePrincipal 
                participantePrincipal={participantePrincipal} 
                updateParticipantePrincipal={updateParticipantePrincipal} 
              />
              
              <ParticipantePrincipal 
                participantes={participantes} 
                addParticipante={addParticipante} 
                removeParticipante={removeParticipante} 
                updateParticipante={updateParticipante} 
              />
              
              <ParticipantesAnterioresTabela 
                participantesAnteriores={participantesAnteriores}
                carregandoDados={carregandoDados}
                editandoParticipante={editandoParticipante}
                editForm={editForm}
                setEditForm={setEditForm}
                deletandoParticipante={deletandoParticipante}
                user={user}
                buscarDadosUsuario={buscarDadosUsuario}
                iniciarEdicao={iniciarEdicao}
                salvarEdicao={salvarEdicao}
                cancelarEdicao={cancelarEdicao}
                adicionarParticipanteAnterior={adicionarParticipanteAnterior}
                deletarParticipante={deletarParticipante}
              />

              <div className="mt-10 flex flex-col sm:flex-row justify-between gap-3">
                <button 
                  onClick={() => navigate(-1)} 
                  className="px-6 py-3 border border-slate-200 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                >
                  <ArrowLeft size={18}/> Voltar
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md"
                >
                  Continuar para pagamento <ChevronRight size={18}/>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4">
              <ResumoReservaExperiencia 
                reserva={reserva} 
                totalHospedes={totalHospedes} 
                precoTotal={precoTotal}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutAlojamento;