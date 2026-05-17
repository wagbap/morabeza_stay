import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Check, ArrowLeft, Loader, AlertCircle, ChevronRight, Calendar, Users, Home, ShieldCheck, Lock
} from 'lucide-react';
import DataModalAlojamento from './DataModalAlojamento';

const ParticipantePrincipal = ({ participantePrincipal, updateParticipantePrincipal }) => {
  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-sans">1</span>
        Hóspede Principal
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Nome completo *</label>
          <input 
            type="text"
            value={participantePrincipal.nome_completo}
            onChange={(e) => updateParticipantePrincipal('nome_completo', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder="Como no documento de identificação"
          />
        </div>
        
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Email *</label>
          <input 
            type="email"
            value={participantePrincipal.email}
            onChange={(e) => updateParticipantePrincipal('email', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder="seu@email.com"
          />
        </div>
        
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Telefone *</label>
          <input 
            type="tel"
            value={participantePrincipal.phone}
            onChange={(e) => updateParticipantePrincipal('phone', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder="+238 991 23 45"
          />
        </div>
        
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">País / Nacionalidade *</label>
          <select 
            value={participantePrincipal.nacionalidade}
            onChange={(e) => updateParticipantePrincipal('nacionalidade', e.target.value)}
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
    </div>
  );
};

const ParticipantesAdicionais = ({ participantes, addParticipante, removeParticipante, updateParticipante, maxPessoas }) => {
  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-sans">2</span>
          Hóspedes Adicionais
        </h3>
        <button 
          onClick={addParticipante}
          className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
        >
          + Adicionar hóspede
        </button>
      </div>
      
      {participantes.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">Nenhum hóspede adicional adicionado</p>
      ) : (
        <div className="space-y-4">
          {participantes.map((p, idx) => (
            <div key={p.id} className="border border-slate-100 rounded-xl p-4 relative bg-slate-50/30">
              <button 
                onClick={() => removeParticipante(p.id)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-xs font-bold"
              >
                Remover
              </button>
              <h4 className="font-bold text-sm text-slate-700 mb-3">Hóspede {idx + 2}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <input 
                    type="text"
                    placeholder="Nome completo"
                    value={p.nome_completo}
                    onChange={(e) => updateParticipante(p.id, 'nome_completo', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <select 
                    value={p.idade}
                    onChange={(e) => updateParticipante(p.id, 'idade', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 bg-white"
                  >
                    <option value="adulto">Adulto</option>
                    <option value="crianca">Criança (0-12 anos)</option>
                  </select>
                </div>
                <div>
                  <select 
                    value={p.nacionalidade}
                    onChange={(e) => updateParticipante(p.id, 'nacionalidade', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 bg-white"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ParticipantesAnterioresTabela = ({ 
  participantesAnteriores, carregandoDados, editandoParticipante, editForm, setEditForm,
  deletandoParticipante, user, buscarDadosUsuario, iniciarEdicao, salvarEdicao,
  cancelarEdicao, adicionarParticipanteAnterior, deletarParticipante 
}) => {
  if (carregandoDados) {
    return (
      <div className="flex justify-center items-center py-8 bg-white border border-slate-200 rounded-2xl shadow-sm mb-8">
        <Loader size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-500 font-medium">A carregar os seus dados...</span>
      </div>
    );
  }

  if (participantesAnteriores.length === 0) return null;

  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-sans">3</span>
        Hóspedes de reservas anteriores
      </h3>
      <p className="text-xs text-slate-500 mb-4 font-medium">Clique em um hóspede para adicioná-lo rapidamente à reserva atual</p>
      
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {participantesAnteriores.map((p) => (
          <div key={p.id || p.nome_completo} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            {editandoParticipante === p.nome_completo ? (
              <div className="space-y-2">
                <input 
                  type="text"
                  value={editForm.nome_completo}
                  onChange={(e) => setEditForm(prev => ({ ...prev, nome_completo: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  placeholder="Nome completo"
                />
                <div className="flex flex-wrap gap-2">
                  <select 
                    value={editForm.idade}
                    onChange={(e) => setEditForm(prev => ({ ...prev, idade: e.target.value }))}
                    className="border border-slate-200 rounded-lg p-2 text-sm text-slate-900 bg-white"
                  >
                    <option value="adulto">Adulto</option>
                    <option value="crianca">Criança</option>
                  </select>
                  <select 
                    value={editForm.nacionalidade}
                    onChange={(e) => setEditForm(prev => ({ ...prev, nacionalidade: e.target.value }))}
                    className="border border-slate-200 rounded-lg p-2 text-sm text-slate-900 bg-white flex-1 min-w-[120px]"
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
                  <div className="flex gap-1 ml-auto">
                    <button onClick={() => salvarEdicao(p)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">Salvar</button>
                    <button onClick={cancelarEdicao} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-300">Cancelar</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{p.nome_completo}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-400 mt-0.5 font-medium">
                    <span>{p.idade === 'adulto' ? '👤 Adulto' : '👶 Criança'}</span>
                    <span>📍 {p.nacionalidade || 'Cabo Verde'}</span>
                    <span>📊 Usado {p.vezes_utilizado || 1}x</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => adicionarParticipanteAnterior(p)}
                    className="text-blue-600 text-xs font-bold px-3 py-1.5 border border-blue-200 rounded-lg bg-white hover:bg-blue-50 transition-colors"
                  >
                    + Adicionar
                  </button>
                  <button 
                    onClick={() => iniciarEdicao(p)}
                    className="text-slate-400 hover:text-blue-600 text-sm p-1"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => deletarParticipante(p)}
                    disabled={deletandoParticipante === p.nome_completo}
                    className="text-slate-400 hover:text-red-600 text-sm p-1 disabled:opacity-50"
                    title="Remover permanentemente"
                  >
                    {deletandoParticipante === p.nome_completo ? '⌛' : '🗑️'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ResumoReservaAlojamento = ({ reserva, totalHospedes, precoTotal, setDataModalOpen }) => {
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
          src={reserva?.imagem || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'} 
          className="w-20 h-20 rounded-xl object-cover shrink-0" 
          alt={reserva?.titulo || 'Alojamento'}
          onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
        />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-blue-900 leading-tight">{reserva?.titulo || 'Morabeza Stay'}</h4>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">{reserva?.localizacao || 'Cabo Verde'}</p>
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
          <span className="text-xs text-slate-600 font-medium">Check-in</span>
          <span className="text-xs font-bold text-blue-900">{formatarData(reserva?.checkIn)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">Check-out</span>
          <span className="text-xs font-bold text-blue-900">{formatarData(reserva?.checkOut)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">Noites</span>
          <span className="text-xs font-bold text-blue-900">{reserva?.noites || 0} noites</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">Hóspedes</span>
          <span className="text-xs font-bold text-blue-900">{totalHospedes || 1} pessoas</span>
        </div>
        
        <div className="pt-3 space-y-2 border-t border-slate-100">
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500">Preço por noite</span>
            <span className="text-slate-800">{formatNumber(reserva?.precoNoite)} CVE</span>
          </div>
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500">Subtotal ({reserva?.noites || 0} noites)</span>
            <span className="text-slate-800">{formatNumber(reserva?.subtotal)} CVE</span>
          </div>
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500">Taxa de limpeza</span>
            <span className="text-slate-800">{formatNumber(reserva?.taxaLimpeza)} CVE</span>
          </div>
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500">Taxa de serviço</span>
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
            <p className="text-[8px] text-green-700 font-medium">Até 48 hours antes do check-in</p>
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

const CheckoutAlojamento = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservaData } = location.state || {};
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDataModalOpen, setDataModalOpen] = useState(false);
  const [participantesAnteriores, setParticipantesAnteriores] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [deletandoParticipante, setDeletandoParticipante] = useState(null);
  const [editandoParticipante, setEditandoParticipante] = useState(null);
  const [editForm, setEditForm] = useState({ nome_completo: '', idade: '', nacionalidade: '' });
  
  const [participantePrincipal, setParticipantePrincipal] = useState({
    nome_completo: '',
    email: '',
    phone: '',
    idade: 'adulto',
    nacionalidade: 'Cabo Verde'
  });
  
  const [participantes, setParticipantes] = useState([]);

  const calcularNoites = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 1;
    const entrada = new Date(checkIn);
    const saida = new Date(checkOut);
    const diff = Math.ceil((saida - entrada) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const precoNoite = Number(reservaData?.precoNoite || 0);
  const noitesInicial = calcularNoites(reservaData?.checkIn, reservaData?.checkOut);
  const subtotal = precoNoite * noitesInicial;
  const taxaLimpeza = Number(reservaData?.taxaLimpeza || 2500);
  const taxaServico = Number(reservaData?.taxaServico || 1200);
  const totalGeral = subtotal + taxaLimpeza + taxaServico;
  
  const [reserva, setReserva] = useState({
    id: reservaData?.id || null,
    titulo: reservaData?.titulo || '',
    imagem: reservaData?.imagem || '',
    localizacao: reservaData?.localizacao || '',
    checkIn: reservaData?.checkIn || '',
    checkOut: reservaData?.checkOut || '',
    noites: noitesInicial,
    precoNoite: precoNoite,
    subtotal: subtotal,
    taxaLimpeza: taxaLimpeza,
    taxaServico: taxaServico,
    totalGeral: totalGeral,
    maxPessoas: reservaData?.capacidade || 10
  });

  const buscarDadosUsuario = async (email, googleId) => {
    setCarregandoDados(true);
    try {
      let url = `https://welovepalop.com/api/checkout_api.php?email=${encodeURIComponent(email)}&category=Alojamento`;
      if (googleId) {
        url += `&google_id=${encodeURIComponent(googleId)}`;
      }
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
        body: `nome_completo=${encodeURIComponent(participante.nome_completo)}&email=${encodeURIComponent(participantePrincipal.email)}&category=Alojamento`
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
      setError('O nome do hóspede não pode estar vazio');
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
          email: participantePrincipal.email,
          category: 'Alojamento'
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
    } else {
      alert('Por favor, faça login para continuar');
      navigate('/');
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!reservaData) {
      navigate('/alojamentos');
    }
  }, [reservaData, navigate]);

  const handleSelectData = (dataObj) => {
    const novasNoites = dataObj.noites;
    const novoSubtotal = reserva.precoNoite * novasNoites;
    const novoTotal = novoSubtotal + reserva.taxaLimpeza + reserva.taxaServico;
    setReserva(prev => ({
      ...prev,
      checkIn: dataObj.checkIn,
      checkOut: dataObj.checkOut,
      noites: novasNoites,
      subtotal: novoSubtotal,
      totalGeral: novoTotal
    }));
    setDataModalOpen(false);
  };

  const addParticipante = () => {
    if (participantes.length + 1 >= reserva.maxPessoas) {
      setError(`Máximo de ${reserva.maxPessoas} hóspedes permitidos`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    setParticipantes([...participantes, { 
      id: Date.now(), 
      nome_completo: '', 
      idade: 'adulto', 
      nacionalidade: 'Cabo Verde' 
    }]);
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
    setError('');
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
    if (!participantePrincipal.nacionalidade.trim()) {
      setError('Nacionalidade do hóspede principal é obrigatória');
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

    // 🔥 FLUXO CORRIGIDO: Apenas joga o payload no cache e redireciona. Nenhum registo na BD ainda!
    const dadosReserva = {
      reservaData: {
        ...reserva,
        totalHospedes: totalHospedes,
        precoTotal: reserva.totalGeral
      },
      participantePrincipal,
      participantesAdicionais: participantes,
      usuario: user
    };

    sessionStorage.setItem('reservaAlojamentoPendente', JSON.stringify(dadosReserva));

    navigate('/pagamento', { 
      state: { 
        reservaData: { 
          ...reserva, 
          totalHospedes: totalHospedes, 
          precoTotal: reserva.totalGeral,
          tipo: 'alojamento'
        },
        dadosParticipantes: { participantePrincipal, participantes: participantes },
        tipo: 'alojamento'
      } 
    });
  };

  const totalHospedes = participantes.length + 1;
  const precoTotal = reserva.totalGeral;

  if (!reservaData) {
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
              { n: 1, label: 'Dados dos hóspedes', active: true },
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
              <h1 className="text-2xl font-bold text-blue-900 mb-2 text-left">Dados dos hóspedes</h1>
              <p className="text-slate-500 text-sm mb-6 text-left font-medium">Preencha os dados para todos os hóspedes.</p>

              <div className="bg-[#F0F7FF] border border-blue-100 rounded-lg p-4 flex gap-3 mb-8 text-left">
                <div className="w-5 h-5 rounded-full border border-blue-600 flex items-center justify-center text-blue-600 text-[10px] font-bold italic shrink-0 font-sans">i</div>
                <div>
                  <p className="text-sm font-bold text-blue-900">Informação importante</p>
                  <p className="text-xs text-blue-700 font-medium">O nome informado deve ser exatamente igual ao documento oficial de identificação.</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-6 flex flex-wrap gap-4 text-xs text-left">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600"/>
                  <span className="font-medium text-slate-700">{formatarData(reserva.checkIn)} - {formatarData(reserva.checkOut)}</span>
                  <span className="text-slate-400 font-medium">• {reserva.noites} noites</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-blue-600"/>
                  <span className="font-medium text-slate-700">Máx. {reserva.maxPessoas} pessoas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home size={14} className="text-blue-600"/>
                  <span className="font-medium text-slate-700">{reserva.titulo}</span>
                </div>
              </div>

              <ParticipantePrincipal 
                participantePrincipal={participantePrincipal} 
                updateParticipantePrincipal={updateParticipantePrincipal} 
              />
              
              <ParticipantesAdicionais 
                participantes={participantes} 
                addParticipante={addParticipante} 
                removeParticipante= {removeParticipante} 
                updateParticipante={updateParticipante}
                maxPessoas={reserva.maxPessoas}
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
                  className="px-6 py-3 border border-slate-200 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-slate-700 shadow-sm"
                >
                  <ArrowLeft size={18}/> Voltar
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
                >
                  Continuar para pagamento <ChevronRight size={18}/>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4">
              <ResumoReservaAlojamento 
                reserva={reserva} 
                totalHospedes={totalHospedes} 
                precoTotal={precoTotal}
                setDataModalOpen={setDataModalOpen}
              />
            </div>
          </div>
        </div>
      </div>

      {isDataModalOpen && (
        <DataModalAlojamento 
          onClose={() => setDataModalOpen(false)} 
          onSelectData={handleSelectData} 
          alojamentoTitulo={reserva.titulo} 
          currentCheckIn={reserva.checkIn}
          currentCheckOut={reserva.checkOut}
        />
      )}
    </>
  );
};

export default CheckoutAlojamento;