import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Check, ArrowLeft, Loader, AlertCircle, ChevronRight
} from 'lucide-react';
import DataModal from './DataModal';
import HorarioModal from './HorarioModal';
import ParticipantePrincipal from './ParticipantePrincipal';
import ParticipantesAdicionais from './ParticipantesAdicionais';
import ParticipantesAnterioresTabela from './ParticipantesAnterioresTabela';
import ResumoReserva from './ResumoReserva';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservaData, dataSelecionada, horarioSelecionado, periodoSelecionado } = location.state || {};
  
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
  
  const [reserva, setReserva] = useState({
    id: reservaData?.id || null,
    titulo: reservaData?.titulo || '',
    imagem: reservaData?.imagem || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200',
    localizacao: reservaData?.localizacao || '',
    data: dataSelecionada || reservaData?.entrada || 'Selecionar data',
    dataISO: reservaData?.dataISO || null,
    periodo: periodoSelecionado || reservaData?.periodo || 'Manhã',
    horario: horarioSelecionado || reservaData?.horario || '08:00',
    precoBase: reservaData?.precoTotal || 0,
    duracao: reservaData?.duracao || '3 - 4 horas',
    maxPessoas: reservaData?.maxPessoas || 15,
    precoPorPessoa: reservaData?.precoPorPessoa || 4500
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

  const handleSelectData = (dataObj) => {
    setReserva(prev => ({ ...prev, data: dataObj.full, dataISO: dataObj.iso }));
    setDataModalOpen(false);
  };

  const handleSelectHorario = (horario, periodo) => {
    setReserva(prev => ({ ...prev, horario, periodo }));
    setHorarioModalOpen(false);
  };

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
      setError('Nome completo do participante principal é obrigatório');
      return false;
    }
    if (!participantePrincipal.email.trim()) {
      setError('Email do participante principal é obrigatório');
      return false;
    }
    if (!participantePrincipal.phone.trim()) {
      setError('Telefone do participante principal é obrigatório');
      return false;
    }
    if (reserva.data === 'Selecionar data') {
      setError('Por favor, selecione uma data para o passeio');
      return false;
    }
    for (let i = 0; i < participantes.length; i++) {
      if (!participantes[i].nome_completo.trim()) {
        setError(`Nome do participante ${i + 2} é obrigatório`);
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
    
    const totalPessoas = participantes.length + 1;
    const precoTotal = reserva.precoPorPessoa * totalPessoas;
    
    // Salvar dados dos participantes no sessionStorage para serem usados no pagamento
    const dadosReserva = {
      reservaData: {
        ...reserva,
        participantes: totalPessoas,
        precoTotal: precoTotal
      },
      participantePrincipal,
      participantesAdicionais: participantes,
      usuario: user
    };
    
    sessionStorage.setItem('reservaPendente', JSON.stringify(dadosReserva));
    
    // Navegar para pagamento
    navigate('/pagamento', { 
      state: { 
        reservaData: { ...reserva, participantes: totalPessoas, precoTotal },
        dadosParticipantes: { participantePrincipal, participantes }
      } 
    });
  };

  const totalPessoas = participantes.length + 1;
  const precoTotal = reserva.precoPorPessoa * totalPessoas;

  return (
    <>
      <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* STEPPER */}
          <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4">
            {[{ n: 1, label: 'Dados dos participantes', active: true }, { n: 2, label: 'Pagamento', active: false }, { n: 3, label: 'Confirmação', active: false }].map((s, i, arr) => (
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
              <h1 className="text-2xl font-bold text-blue-900 mb-2">Dados dos participantes</h1>
              <p className="text-slate-500 text-sm mb-6">Preencha os dados para todos os participantes.</p>

              <div className="bg-[#F0F7FF] border border-blue-100 rounded-lg p-4 flex gap-3 mb-8">
                <div className="w-5 h-5 rounded-full border border-blue-600 flex items-center justify-center text-blue-600 text-[10px] font-bold italic shrink-0">i</div>
                <div>
                  <p className="text-sm font-bold text-blue-900">Informação importante</p>
                  <p className="text-xs text-blue-700">O nome informado deve ser igual ao documento de identificação.</p>
                </div>
              </div>

              <ParticipantePrincipal participantePrincipal={participantePrincipal} updateParticipantePrincipal={updateParticipantePrincipal} />
              <ParticipantesAdicionais participantes={participantes} addParticipante={addParticipante} removeParticipante={removeParticipante} updateParticipante={updateParticipante} />
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
                <button onClick={() => navigate(-1)} className="px-6 py-3 border border-slate-200 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50">
                  <ArrowLeft size={18}/> Voltar
                </button>
                <button onClick={handleSubmit} className="px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700">
                  Continuar para pagamento <ChevronRight size={18}/>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4">
              <ResumoReserva 
                reserva={reserva} 
                totalPessoas={totalPessoas} 
                precoTotal={precoTotal} 
                setDataModalOpen={setDataModalOpen} 
                setHorarioModalOpen={setHorarioModalOpen} 
              />
            </div>
          </div>
        </div>
      </div>

      {isDataModalOpen && <DataModal onClose={() => setDataModalOpen(false)} onSelectData={handleSelectData} experienciaTitulo={reserva.titulo} currentDate={reserva.dataISO || reserva.data} />}
      {isHorarioModalOpen && <HorarioModal onClose={() => setHorarioModalOpen(false)} onSelectHorario={handleSelectHorario} currentPeriodo={reserva.periodo} currentHorario={reserva.horario} />}
    </>
  );
};

export default Checkout;