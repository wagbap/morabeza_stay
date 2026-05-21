import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Check, ArrowLeft, Loader, AlertCircle, ChevronRight, Calendar, Users, Home, ShieldCheck, Lock
} from 'lucide-react';
import DataModal from './DataModalExperiencia';
import HorarioModal from './HorarioModalExperiencia';

const ParticipantePrincipal = ({ participantePrincipal, updateParticipantePrincipal }) => {
  const { t } = useTranslation();
  
  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-sans">1</span>
        {t('participante_principal')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">{t('nome_completo')} *</label>
          <input 
            type="text"
            value={participantePrincipal.nome_completo}
            onChange={(e) => updateParticipantePrincipal('nome_completo', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder={t('placeholder_nome_documento')}
          />
        </div>
        
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">{t('email')} *</label>
          <input 
            type="email"
            value={participantePrincipal.email}
            onChange={(e) => updateParticipantePrincipal('email', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder="seu@email.com"
          />
        </div>
        
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">{t('telefone')} *</label>
          <input 
            type="tel"
            value={participantePrincipal.phone}
            onChange={(e) => updateParticipantePrincipal('phone', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder="+238 991 23 45"
          />
        </div>
        
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">{t('pais_nacionalidade')} *</label>
          <select 
            value={participantePrincipal.nacionalidade}
            onChange={(e) => updateParticipantePrincipal('nacionalidade', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 bg-white"
          >
            <option value="Cabo Verde">{t('cabo_verde')}</option>
            <option value="Portugal">{t('portugal')}</option>
            <option value="Brasil">{t('brasil')}</option>
            <option value="Angola">{t('angola')}</option>
            <option value="Moçambique">{t('mocambique')}</option>
            <option value="Estados Unidos">{t('estados_unidos')}</option>
            <option value="França">{t('franca')}</option>
            <option value="Outro">{t('outro')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const ParticipantesAdicionais = ({ participantes, addParticipante, removeParticipante, updateParticipante, maxPessoas }) => {
  const { t } = useTranslation();
  
  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-sans">2</span>
          {t('participantes_adicionais')}
        </h3>
        <button 
          onClick={addParticipante}
          className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
        >
          + {t('adicionar_participante')}
        </button>
      </div>
      
      {participantes.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">{t('nenhum_participante_adicional')}</p>
      ) : (
        <div className="space-y-4">
          {participantes.map((p, idx) => (
            <div key={p.id} className="border border-slate-100 rounded-xl p-4 relative bg-slate-50/30">
              <button 
                onClick={() => removeParticipante(p.id)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-xs font-bold"
              >
                {t('remover')}
              </button>
              <h4 className="font-bold text-sm text-slate-700 mb-3">{t('participante')} {idx + 2}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <input 
                    type="text"
                    placeholder={t('nome_completo')}
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
                    <option value="adulto">{t('adulto')}</option>
                    <option value="crianca">{t('crianca_0_12')}</option>
                  </select>
                </div>
                <div>
                  <select 
                    value={p.nacionalidade}
                    onChange={(e) => updateParticipante(p.id, 'nacionalidade', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 bg-white"
                  >
                    <option value="Cabo Verde">{t('cabo_verde')}</option>
                    <option value="Portugal">{t('portugal')}</option>
                    <option value="Brasil">{t('brasil')}</option>
                    <option value="Angola">{t('angola')}</option>
                    <option value="Moçambique">{t('mocambique')}</option>
                    <option value="Estados Unidos">{t('estados_unidos')}</option>
                    <option value="França">{t('franca')}</option>
                    <option value="Outro">{t('outro')}</option>
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
  const { t } = useTranslation();
  
  if (carregandoDados) {
    return (
      <div className="flex justify-center items-center py-8 bg-white border border-slate-200 rounded-2xl shadow-sm mb-8">
        <Loader size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-500 font-medium">{t('carregando_dados')}</span>
      </div>
    );
  }

  if (participantesAnteriores.length === 0) return null;

  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
      <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-sans">3</span>
        {t('participantes_reservas_anteriores')}
      </h3>
      <p className="text-xs text-slate-500 mb-4 font-medium">{t('clique_participante_adicionar')}</p>
      
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
                  placeholder={t('nome_completo')}
                />
                <div className="flex flex-wrap gap-2">
                  <select 
                    value={editForm.idade}
                    onChange={(e) => setEditForm(prev => ({ ...prev, idade: e.target.value }))}
                    className="border border-slate-200 rounded-lg p-2 text-sm text-slate-900 bg-white"
                  >
                    <option value="adulto">{t('adulto')}</option>
                    <option value="crianca">{t('crianca')}</option>
                  </select>
                  <select 
                    value={editForm.nacionalidade}
                    onChange={(e) => setEditForm(prev => ({ ...prev, nacionalidade: e.target.value }))}
                    className="border border-slate-200 rounded-lg p-2 text-sm text-slate-900 bg-white flex-1 min-w-[120px]"
                  >
                    <option value="Cabo Verde">{t('cabo_verde')}</option>
                    <option value="Portugal">{t('portugal')}</option>
                    <option value="Brasil">{t('brasil')}</option>
                    <option value="Angola">{t('angola')}</option>
                    <option value="Moçambique">{t('mocambique')}</option>
                    <option value="Estados Unidos">{t('estados_unidos')}</option>
                    <option value="França">{t('franca')}</option>
                    <option value="Outro">{t('outro')}</option>
                  </select>
                  <div className="flex gap-1 ml-auto">
                    <button onClick={() => salvarEdicao(p)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">{t('salvar')}</button>
                    <button onClick={cancelarEdicao} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-300">{t('cancelar')}</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{p.nome_completo}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-400 mt-0.5 font-medium">
                    <span>{p.idade === 'adulto' ? `👤 ${t('adulto')}` : `👶 ${t('crianca')}`}</span>
                    <span>📍 {p.nacionalidade || t('cabo_verde')}</span>
                    <span>📊 {t('usado')} {p.vezes_utilizado || 1}x</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => adicionarParticipanteAnterior(p)}
                    className="text-blue-600 text-xs font-bold px-3 py-1.5 border border-blue-200 rounded-lg bg-white hover:bg-blue-50 transition-colors"
                  >
                    + {t('adicionar')}
                  </button>
                  <button 
                    onClick={() => iniciarEdicao(p)}
                    className="text-slate-400 hover:text-blue-600 text-sm p-1"
                    title={t('editar')}
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => deletarParticipante(p)}
                    disabled={deletandoParticipante === p.nome_completo}
                    className="text-slate-400 hover:text-red-600 text-sm p-1 disabled:opacity-50"
                    title={t('remover_permanentemente')}
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

const ResumoReservaExperiencia = ({ reserva, totalPessoas, precoTotal, setDataModalOpen, setHorarioModalOpen }) => {
  const { t } = useTranslation();
  
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    return Number(value).toLocaleString('pt-PT');
  };

  const formatarData = (data) => {
    if (!data || data === 'Selecionar data') return t('nao_selecionada');
    const d = new Date(data);
    if (isNaN(d.getTime())) return data;
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm sticky top-6 text-left">
      <h2 className="text-lg font-bold text-blue-900 mb-5">{t('resumo_reserva')}</h2>
      
      <div className="flex gap-4 mb-6">
        <img 
          src={reserva?.imagem || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200'} 
          className="w-20 h-20 rounded-xl object-cover shrink-0" 
          alt={reserva?.titulo || t('experiencia')}
          onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200'}
        />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-blue-900 leading-tight">{reserva?.titulo || t('experiencia_morabeza')}</h4>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">{reserva?.localizacao || t('cabo_verde')}</p>
          <div className="flex gap-3 mt-2">
            <button 
              onClick={() => setDataModalOpen && setDataModalOpen(true)}
              className="text-[10px] text-blue-600 underline font-bold"
            >
              {t('alterar_data')}
            </button>
            <button 
              onClick={() => setHorarioModalOpen && setHorarioModalOpen(true)}
              className="text-[10px] text-blue-600 underline font-bold"
            >
              {t('alterar_horario')}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-5">
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">{t('data_passeio')}</span>
          <span className="text-xs font-bold text-blue-900">{formatarData(reserva?.data)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">{t('horario')}</span>
          <span className="text-xs font-bold text-blue-900">{reserva?.horario || t('nao_selecionado')} ({reserva?.periodo})</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">{t('duracao')}</span>
          <span className="text-xs font-bold text-blue-900">{reserva?.duracao}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">{t('participantes')}</span>
          <span className="text-xs font-bold text-blue-900">{totalPessoas || 1} {t('pessoas')}</span>
        </div>
        
        <div className="pt-3 space-y-2 border-t border-slate-100">
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500">{t('preco_por_pessoa')}</span>
            <span className="text-slate-800">{formatNumber(reserva?.precoPorPessoa)} CVE</span>
          </div>
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500">{t('subtotal_participantes', { total: totalPessoas })}</span>
            <span className="text-slate-800">{formatNumber(reserva?.precoPorPessoa * totalPessoas)} CVE</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <span className="text-base font-bold text-blue-900">{t('total')}</span>
          <span className="text-xl font-bold text-blue-600">{formatNumber(precoTotal)} CVE</span>
        </div>

        <div className="bg-green-50 p-3 rounded-xl flex gap-2 mt-3 border border-green-100">
          <ShieldCheck className="text-green-600 shrink-0" size={18} />
          <div>
            <p className="text-[9px] font-bold text-green-800">{t('cancelamento_gratis')}</p>
            <p className="text-[8px] text-green-700 font-medium">{t('cancelamento_prazo_experiencia_curto')}</p>
          </div>
        </div>

        <div className="bg-[#F0F7FF] p-3 rounded-xl flex gap-2 border border-blue-50">
          <Lock className="text-blue-600 shrink-0" size={16} />
          <p className="text-[8px] text-blue-700 font-medium">{t('dados_protegidos')}</p>
        </div>
      </div>
    </div>
  );
};

const CheckoutExperiencia = () => {
  const { t } = useTranslation();
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
    data: dataSelecionada || reservaData?.entrada || t('selecionar_data'),
    dataISO: reservaData?.dataISO || null,
    periodo: periodoSelecionado || reservaData?.periodo || t('manha'),
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
      let url = `https://welovepalop.com/api/checkout_api.php?email=${encodeURIComponent(email)}&category=Experiencia`;
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
    if (!window.confirm(t('confirmar_remover_participante', { nome: participante.nome_completo }))) return;
    setDeletandoParticipante(participante.nome_completo);
    try {
      const response = await fetch('https://welovepalop.com/api/checkout_api.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `nome_completo=${encodeURIComponent(participante.nome_completo)}&email=${encodeURIComponent(participantePrincipal.email)}&category=Experiencia`
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
      setError(t('erro_nome_vazio'));
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
          category: 'Experiencia'
        })
      });
      const result = await response.json();
      if (result.success) {
        setParticipantesAnteriores(prev => prev.map(p => 
          p.nome_completo === participanteOriginal.nome_completo ? {
            ...p,
            nome_completo: editForm.nome_completo,
            type: editForm.idade,
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
      setError(t('erro_participante_ja_adicionado', { nome: participante.nome_completo }));
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
      alert(t('login_necessario_continuar'));
      navigate('/');
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!reservaData && !dataSelecionada) {
      navigate('/experiencias');
    }
  }, [reservaData, dataSelecionada, navigate]);

  const handleSelectData = (dataObj) => {
    setReserva(prev => ({ ...prev, data: dataObj.full, dataISO: dataObj.iso }));
    setDataModalOpen(false);
  };

  const handleSelectHorario = (horario, periodo) => {
    setReserva(prev => ({ ...prev, horario, periodo }));
    setHorarioModalOpen(false);
  };

  const addParticipante = () => {
    if (participantes.length + 1 >= reserva.maxPessoas) {
      setError(t('erro_max_participantes', { max: reserva.maxPessoas }));
      setTimeout(() => setError(''), 3000);
      return;
    }
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
    setError('');
    if (!participantePrincipal.nome_completo.trim()) {
      setError(t('erro_nome_obrigatorio'));
      return false;
    }
    if (!participantePrincipal.email.trim()) {
      setError(t('erro_email_obrigatorio'));
      return false;
    }
    if (!participantePrincipal.phone.trim()) {
      setError(t('erro_telefone_obrigatorio'));
      return false;
    }
    if (!participantePrincipal.nacionalidade.trim()) {
      setError(t('erro_nacionalidade_obrigatoria'));
      return false;
    }
    if (reserva.data === t('selecionar_data') || !reserva.dataISO) {
      setError(t('erro_data_obrigatoria'));
      return false;
    }
    if (!reserva.horario || reserva.horario === '') {
      setError(t('erro_horario_obrigatorio'));
      return false;
    }
    for (let i = 0; i < participantes.length; i++) {
      if (!participantes[i].nome_completo.trim()) {
        setError(t('erro_nome_participante_adicional', { numero: i + 2 }));
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    if (!user || !user.email) {
      setError(t('erro_usuario_nao_logado'));
      return;
    }

    const totalPessoas = participantes.length + 1;
    const precoTotal = reserva.precoPorPessoa * totalPessoas;

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

    navigate('/pagamento', { 
      state: { 
        reservaData: { 
          ...reserva, 
          participantes: totalPessoas, 
          precoTotal,
          tipo: 'experiencia'
        },
        dadosParticipantes: { participantePrincipal, participantes: participantes },
        tipo: 'experiencia'
      } 
    });
  };

  const totalPessoas = participantes.length + 1;
  const precoTotal = reserva.precoPorPessoa * totalPessoas;

  if (!reservaData && !dataSelecionada) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">{t('carregando_dados_reserva')}</p>
        </div>
      </div>
    );
  }

  const steps = [
    { n: 1, label: t('step_dados_participantes'), active: true },
    { n: 2, label: t('step_pagamento'), active: false },
    { n: 3, label: t('step_confirmacao'), active: false }
  ];

  return (
    <>
      <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4">
            {steps.map((s, i, arr) => (
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
              <h1 className="text-2xl font-bold text-blue-900 mb-2 text-left">{t('dados_participantes')}</h1>
              <p className="text-slate-500 text-sm mb-6 text-left font-medium">{t('preencha_dados_participantes')}</p>

              <div className="bg-[#F0F7FF] border border-blue-100 rounded-lg p-4 flex gap-3 mb-8 text-left">
                <div className="w-5 h-5 rounded-full border border-blue-600 flex items-center justify-center text-blue-600 text-[10px] font-bold italic shrink-0 font-sans">i</div>
                <div>
                  <p className="text-sm font-bold text-blue-900">{t('informacao_importante')}</p>
                  <p className="text-xs text-blue-700 font-medium">{t('info_nome_documento')}</p>
                </div>
              </div>

              <ParticipantePrincipal 
                participantePrincipal={participantePrincipal} 
                updateParticipantePrincipal={updateParticipantePrincipal} 
              />
              
              <ParticipantesAdicionais 
                participantes={participantes} 
                addParticipante={addParticipante} 
                removeParticipante={removeParticipante} 
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
                  <ArrowLeft size={18}/> {t('voltar')}
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
                >
                  {t('continuar_pagamento')} <ChevronRight size={18}/>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4">
              <ResumoReservaExperiencia 
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

      {isDataModalOpen && (
        <DataModal 
          onClose={() => setDataModalOpen(false)} 
          onSelectData={handleSelectData} 
          experienciaTitulo={reserva.titulo} 
          currentDate={reserva.dataISO || reserva.data} 
        />
      )}
      
      {isHorarioModalOpen && (
        <HorarioModal 
          onClose={() => setHorarioModalOpen(false)} 
          onSelectHorario={handleSelectHorario} 
          currentPeriodo={reserva.periodo} 
          currentHorario={reserva.horario}
          experienciaId={reserva.id}
          dataSelecionada={reserva.dataISO}
        />
      )}
    </>
  );
};

export default CheckoutExperiencia;