// CheckoutExperiencia.jsx - Padrão do site (igual ao carro): sem login obrigatório + OTP + disponibilidade
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Check, ArrowLeft, Loader, AlertCircle, ChevronRight, Calendar, Users, Home,
  ShieldCheck, Lock, MapPin, Clock, FileText, X
} from 'lucide-react';
import DataModal from './DataModalExperiencia';
import HorarioModal from './HorarioModalExperiencia';
import { useToast } from '../../../Toast';

const API_BASE = 'https://welovepalop.com';

// ============================================================
// PARTICIPANTE PRINCIPAL
// ============================================================
const ParticipantePrincipal = ({ participantePrincipal, updateParticipantePrincipal }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-sans">1</span>
        {t('participante_principal', 'Participante Principal')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">{t('nome_completo', 'Nome completo')} *</label>
          <input
            type="text"
            value={participantePrincipal.nome_completo}
            onChange={(e) => updateParticipantePrincipal('nome_completo', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder={t('placeholder_nome_documento', 'Nome como consta no documento')}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">{t('email', 'E-mail')} *</label>
          <input
            type="email"
            value={participantePrincipal.email}
            onChange={(e) => updateParticipantePrincipal('email', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">{t('telefone', 'Telefone / WhatsApp')} *</label>
          <input
            type="tel"
            value={participantePrincipal.phone}
            onChange={(e) => updateParticipantePrincipal('phone', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder="+238 991 23 45"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">{t('pais_nacionalidade', 'País / Nacionalidade')} *</label>
          <select
            value={participantePrincipal.nacionalidade}
            onChange={(e) => updateParticipantePrincipal('nacionalidade', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 bg-white"
          >
            <option value="Cabo Verde">{t('cabo_verde', 'Cabo Verde')}</option>
            <option value="Portugal">{t('portugal', 'Portugal')}</option>
            <option value="Brasil">{t('brasil', 'Brasil')}</option>
            <option value="Angola">{t('angola', 'Angola')}</option>
            <option value="Moçambique">{t('mocambique', 'Moçambique')}</option>
            <option value="Estados Unidos">{t('estados_unidos', 'Estados Unidos')}</option>
            <option value="França">{t('franca', 'França')}</option>
            <option value="Outro">{t('outro', 'Outro')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PARTICIPANTES ADICIONAIS
// ============================================================
const ParticipantesAdicionais = ({ participantes, addParticipante, removeParticipante, updateParticipante, maxPessoas }) => {
  const { t } = useTranslation();
  const podeAdicionarMais = participantes.length + 1 < maxPessoas;

  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-sans">2</span>
          {t('participantes_adicionais', 'Participantes Adicionais')}
        </h3>
        <button
          onClick={addParticipante}
          disabled={!podeAdicionarMais}
          className={`text-sm font-bold flex items-center gap-1 ${
            podeAdicionarMais ? 'text-blue-600 hover:underline' : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          + {t('adicionar_participante', 'Adicionar participante')}
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-4 font-medium">
        {t('capacidade_maxima', 'Capacidade máxima')}: {maxPessoas} {t('pessoas', 'pessoas')}
      </p>

      {participantes.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">{t('nenhum_participante_adicional', 'Nenhum participante adicional adicionado')}</p>
      ) : (
        <div className="space-y-4">
          {participantes.map((p, idx) => (
            <div key={p.id} className="border border-slate-100 rounded-xl p-4 relative bg-slate-50/30">
              <button
                onClick={() => removeParticipante(p.id)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-xs font-bold"
              >
                {t('remover', 'Remover')}
              </button>
              <h4 className="font-bold text-sm text-slate-700 mb-3">{t('participante', 'Participante')} {idx + 2}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <input
                    type="text"
                    placeholder={t('nome_completo', 'Nome completo')}
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
                    <option value="adulto">{t('adulto', 'Adulto')}</option>
                    <option value="crianca">{t('crianca_0_12', 'Criança (0-12)')}</option>
                  </select>
                </div>
                <div>
                  <select
                    value={p.nacionalidade}
                    onChange={(e) => updateParticipante(p.id, 'nacionalidade', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 bg-white"
                  >
                    <option value="Cabo Verde">{t('cabo_verde', 'Cabo Verde')}</option>
                    <option value="Portugal">{t('portugal', 'Portugal')}</option>
                    <option value="Brasil">{t('brasil', 'Brasil')}</option>
                    <option value="Angola">{t('angola', 'Angola')}</option>
                    <option value="Moçambique">{t('mocambique', 'Moçambique')}</option>
                    <option value="Estados Unidos">{t('estados_unidos', 'Estados Unidos')}</option>
                    <option value="França">{t('franca', 'França')}</option>
                    <option value="Outro">{t('outro', 'Outro')}</option>
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

// ============================================================
// PARTICIPANTES ANTERIORES
// ============================================================
const ParticipantesAnterioresTabela = ({
  participantesAnteriores, carregandoDados, editandoParticipante, editForm, setEditForm,
  deletandoParticipante, iniciarEdicao, salvarEdicao, cancelarEdicao,
  adicionarParticipanteAnterior, deletarParticipante,
}) => {
  const { t } = useTranslation();

  if (carregandoDados) {
    return (
      <div className="flex justify-center items-center py-8 bg-white border border-slate-200 rounded-2xl shadow-sm mb-8">
        <Loader size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-500 font-medium">{t('carregando_dados', 'Carregando dados...')}</span>
      </div>
    );
  }

  if (participantesAnteriores.length === 0) return null;

  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-sans">3</span>
        {t('participantes_reservas_anteriores', 'Participantes de Reservas Anteriores')}
      </h3>
      <p className="text-xs text-slate-500 mb-4 font-medium">{t('clique_participante_adicionar', 'Clique para adicionar um participante frequente')}</p>

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
                  placeholder={t('nome_completo', 'Nome completo')}
                />
                <div className="flex flex-wrap gap-2">
                  <select
                    value={editForm.idade}
                    onChange={(e) => setEditForm(prev => ({ ...prev, idade: e.target.value }))}
                    className="border border-slate-200 rounded-lg p-2 text-sm text-slate-900 bg-white"
                  >
                    <option value="adulto">{t('adulto', 'Adulto')}</option>
                    <option value="crianca">{t('crianca', 'Criança')}</option>
                  </select>
                  <select
                    value={editForm.nacionalidade}
                    onChange={(e) => setEditForm(prev => ({ ...prev, nacionalidade: e.target.value }))}
                    className="border border-slate-200 rounded-lg p-2 text-sm text-slate-900 bg-white flex-1 min-w-[120px]"
                  >
                    <option value="Cabo Verde">{t('cabo_verde', 'Cabo Verde')}</option>
                    <option value="Portugal">{t('portugal', 'Portugal')}</option>
                    <option value="Brasil">{t('brasil', 'Brasil')}</option>
                    <option value="Angola">{t('angola', 'Angola')}</option>
                    <option value="Moçambique">{t('mocambique', 'Moçambique')}</option>
                    <option value="Estados Unidos">{t('estados_unidos', 'Estados Unidos')}</option>
                    <option value="França">{t('franca', 'França')}</option>
                    <option value="Outro">{t('outro', 'Outro')}</option>
                  </select>
                  <div className="flex gap-1 ml-auto">
                    <button onClick={() => salvarEdicao(p)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">{t('salvar', 'Salvar')}</button>
                    <button onClick={cancelarEdicao} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-300">{t('cancelar', 'Cancelar')}</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{p.nome_completo}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-400 mt-0.5 font-medium">
                    <span>{p.idade === 'adulto' ? '👤 ' + t('adulto', 'Adulto') : '👶 ' + t('crianca', 'Criança')}</span>
                    <span>📍 {p.nacionalidade || t('cabo_verde', 'Cabo Verde')}</span>
                    <span>📊 {t('usado', 'Usado')} {p.vezes_utilizado || 1}x</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => adicionarParticipanteAnterior(p)}
                    className="text-blue-600 text-xs font-bold px-3 py-1.5 border border-blue-200 rounded-lg bg-white hover:bg-blue-50 transition-colors"
                  >
                    + {t('adicionar', 'Adicionar')}
                  </button>
                  <button onClick={() => iniciarEdicao(p)} className="text-slate-400 hover:text-blue-600 text-sm p-1" title={t('editar', 'Editar')}>✏️</button>
                  <button
                    onClick={() => deletarParticipante(p)}
                    disabled={deletandoParticipante === p.nome_completo}
                    className="text-slate-400 hover:text-red-600 text-sm p-1 disabled:opacity-50"
                    title={t('remover_permanentemente', 'Remover permanentemente')}
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

// ============================================================
// RESUMO
// ============================================================
const ResumoReservaExperiencia = ({ reserva, totalPessoas, precoTotal, setDataModalOpen, setHorarioModalOpen }) => {
  const { t } = useTranslation();

  const formatNumber = (v) => (v == null ? '0' : Number(v).toLocaleString('pt-PT'));
  const formatarData = (data) => {
    if (!data || data === 'Selecionar data') return t('nao_selecionada', 'Não selecionada');
    const d = new Date(data);
    if (isNaN(d.getTime())) return data;
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm sticky top-6 text-left">
      <h2 className="text-lg font-bold text-blue-900 mb-5">{t('resumo_reserva', 'Resumo da Reserva')}</h2>

      <div className="flex gap-4 mb-6">
        <img
          src={reserva?.imagem || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200'}
          className="w-20 h-20 rounded-xl object-cover shrink-0"
          alt={reserva?.titulo || t('experiencia', 'Experiência')}
          onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200'}
        />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-blue-900 leading-tight">{reserva?.titulo || t('experiencia_morabeza', 'Experiência Morabeza')}</h4>
          <p className="text-[10px] text-slate-500 mt-1 font-medium flex items-center gap-1">
            <MapPin size={10} className="text-orange-500" /> {reserva?.localizacao || t('cabo_verde', 'Cabo Verde')}
          </p>
          <div className="flex gap-3 mt-2">
            <button onClick={() => setDataModalOpen && setDataModalOpen(true)} className="text-[10px] text-blue-600 underline font-bold">
              {t('alterar_data', 'Alterar data')}
            </button>
            <button onClick={() => setHorarioModalOpen && setHorarioModalOpen(true)} className="text-[10px] text-blue-600 underline font-bold">
              {t('alterar_horario', 'Alterar horário')}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-5">
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">{t('data_passeio', 'Data do passeio')}</span>
          <span className="text-xs font-bold text-blue-900">{formatarData(reserva?.data)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">{t('horario', 'Horário')}</span>
          <span className="text-xs font-bold text-blue-900">{reserva?.horario || t('nao_selecionado', 'Não selecionado')} ({reserva?.periodo})</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">{t('duracao', 'Duração')}</span>
          <span className="text-xs font-bold text-blue-900">{reserva?.duracao}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">{t('participantes', 'Participantes')}</span>
          <span className="text-xs font-bold text-blue-900">{totalPessoas || 1} {t('pessoas', 'pessoas')}</span>
        </div>

        <div className="pt-3 space-y-2 border-t border-slate-100">
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500">{t('preco_por_pessoa', 'Preço por pessoa')}</span>
            <span className="text-slate-800">{formatNumber(reserva?.precoPorPessoa)} CVE</span>
          </div>
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500">{t('subtotal_participantes', { total: totalPessoas, defaultValue: 'Subtotal' })}</span>
            <span className="text-slate-800">{formatNumber(reserva?.precoPorPessoa * totalPessoas)} CVE</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <span className="text-base font-bold text-blue-900">{t('total', 'Total')}</span>
          <span className="text-xl font-bold text-blue-600">{formatNumber(precoTotal)} CVE</span>
        </div>

        <div className="bg-green-50 p-3 rounded-xl flex gap-2 mt-3 border border-green-100">
          <ShieldCheck className="text-green-600 shrink-0" size={18} />
          <div>
            <p className="text-[9px] font-bold text-green-800">{t('cancelamento_gratis', 'Cancelamento gratuito')}</p>
            <p className="text-[8px] text-green-700 font-medium">{t('cancelamento_prazo_experiencia_curto', 'Até 24h antes')}</p>
          </div>
        </div>

        <div className="bg-[#F0F7FF] p-3 rounded-xl flex gap-2 border border-blue-50">
          <Lock className="text-blue-600 shrink-0" size={16} />
          <p className="text-[8px] text-blue-700 font-medium">{t('dados_protegidos', 'Os seus dados estão protegidos')}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const CheckoutExperiencia = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { reservaData, dataSelecionada, horarioSelecionado, periodoSelecionado } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDataModalOpen, setDataModalOpen] = useState(false);
  const [isHorarioModalOpen, setHorarioModalOpen] = useState(false);
  const [participantesAnteriores, setParticipantesAnteriores] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [deletandoParticipante, setDeletandoParticipante] = useState(null);
  const [editandoParticipante, setEditandoParticipante] = useState(null);
  const [editForm, setEditForm] = useState({ nome_completo: '', idade: '', nacionalidade: '' });

  // OTP
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [enviandoOtp, setEnviandoOtp] = useState(false);
  const inputRefs = useRef([]);

  // Disponibilidade
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [verificandoDisp, setVerificandoDisp] = useState(false);

  const [reserva, setReserva] = useState({
    id: reservaData?.id || null,
    titulo: reservaData?.titulo || '',
    imagem: reservaData?.imagem || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200',
    localizacao: reservaData?.localizacao || '',
    data: dataSelecionada || reservaData?.entrada || t('selecionar_data', 'Selecionar data'),
    dataISO: reservaData?.dataISO || null,
    periodo: periodoSelecionado || reservaData?.periodo || t('manha', 'Manhã'),
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

  // ============================================================
  // DISPONIBILIDADE
  // ============================================================
  const verificarDisponibilidade = async (dataISO, horario, qtdPessoas) => {
    if (!reserva.id || !dataISO || !horario) return;
    setVerificandoDisp(true);
    try {
      const params = new URLSearchParams({
        experiencia_id: reserva.id,
        data: dataISO,
        horario: horario,
        quantidade: qtdPessoas,
      });
      const res = await fetch(`${API_BASE}/api/verificar_disponibilidade_experiencia.php?${params.toString()}`);
      const data = await res.json();
      setDisponibilidade(data);
    } catch (err) {
      console.error('Erro ao verificar disponibilidade:', err);
      setDisponibilidade(null);
    } finally {
      setVerificandoDisp(false);
    }
  };

  useEffect(() => {
    if (reserva.dataISO && reserva.horario) {
      verificarDisponibilidade(reserva.dataISO, reserva.horario, participantes.length + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reserva.dataISO, reserva.horario, participantes.length]);

  // ============================================================
  // BUSCAR DADOS DO UTILIZADOR (se existir — NÃO obrigatório)
  // ============================================================
  const buscarDadosUsuario = async (email, googleId) => {
    setCarregandoDados(true);
    try {
      let url = `${API_BASE}/api/checkout_api.php?email=${encodeURIComponent(email)}&category=Experiencia`;
      if (googleId) url += `&google_id=${encodeURIComponent(googleId)}`;
      const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      const result = await response.json();
      if (result.success) {
        if (result.usuario) {
          setParticipantePrincipal(prev => ({
            ...prev,
            nome_completo: result.usuario.nome || prev.nome_completo,
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

  // ⚠️ AQUI: sem login obrigatório. Se houver user, pré-preenche; se não, deixa em branco.
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const email = userData.email;
        const googleId = userData.sub || userData.google_id || null;
        if (email) buscarDadosUsuario(email, googleId);
        setParticipantePrincipal(prev => ({
          ...prev,
          nome_completo: userData.name || userData.nome || prev.nome_completo,
          email: email || prev.email,
          phone: userData.phone || prev.phone
        }));
      } catch (e) {
        console.error('Erro ao parsear usuário:', e);
      }
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!reservaData && !dataSelecionada) {
      navigate('/experiencias');
    }
  }, [reservaData, dataSelecionada, navigate]);

  // ============================================================
  // HANDLERS
  // ============================================================
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
      showToast(t('erro_max_participantes', { max: reserva.maxPessoas, defaultValue: `Máximo ${reserva.maxPessoas} pessoas` }), 'error');
      return;
    }
    setParticipantes([...participantes, { id: Date.now(), nome_completo: '', idade: 'adulto', nacionalidade: 'Cabo Verde' }]);
  };

  const removeParticipante = (id) => setParticipantes(participantes.filter(p => p.id !== id));
  const updateParticipantePrincipal = (field, value) => setParticipantePrincipal(prev => ({ ...prev, [field]: value }));
  const updateParticipante = (id, field, value) =>
    setParticipantes(participantes.map(p => p.id === id ? { ...p, [field]: value } : p));

  const adicionarParticipanteAnterior = (p) => {
    if (participantes.some(x => x.nome_completo === p.nome_completo)) {
      showToast(t('erro_participante_ja_adicionado', { nome: p.nome_completo, defaultValue: 'Já adicionado' }), 'error');
      return;
    }
    if (participantes.length + 1 >= reserva.maxPessoas) {
      showToast(t('erro_max_participantes', { max: reserva.maxPessoas }), 'error');
      return;
    }
    setParticipantes([...participantes, {
      id: Date.now(),
      nome_completo: p.nome_completo,
      idade: p.idade || 'adulto',
      nacionalidade: p.nacionalidade || 'Cabo Verde'
    }]);
    showToast(t('participante_adicionado', 'Participante adicionado'), 'success');
  };

  const iniciarEdicao = (p) => {
    setEditandoParticipante(p.nome_completo);
    setEditForm({ nome_completo: p.nome_completo, idade: p.idade, nacionalidade: p.nacionalidade });
  };
  const cancelarEdicao = () => {
    setEditandoParticipante(null);
    setEditForm({ nome_completo: '', idade: '', nacionalidade: '' });
  };
  const salvarEdicao = async (orig) => {
    if (!editForm.nome_completo.trim()) return showToast(t('erro_nome_vazio', 'Nome vazio'), 'error');
    setDeletandoParticipante(orig.nome_completo);
    try {
      const r = await fetch(`${API_BASE}/api/checkout_api.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_antigo: orig.nome_completo,
          nome_novo: editForm.nome_completo,
          idade: editForm.idade,
          nacionalidade: editForm.nacionalidade,
          email: participantePrincipal.email,
          category: 'Experiencia',
        }),
      });
      const result = await r.json();
      if (result.success) {
        setParticipantesAnteriores(prev => prev.map(p => p.nome_completo === orig.nome_completo ? { ...p, ...editForm } : p));
        setParticipantes(prev => prev.map(p => p.nome_completo === orig.nome_completo ? { ...p, ...editForm } : p));
        setEditandoParticipante(null);
        showToast(t('participante_atualizado', 'Atualizado'), 'success');
      }
    } catch (e) { console.error(e); }
    finally { setDeletandoParticipante(null); }
  };
  const deletarParticipante = async (p) => {
    if (!window.confirm(t('confirmar_remover_participante', { nome: p.nome_completo, defaultValue: 'Remover?' }))) return;
    setDeletandoParticipante(p.nome_completo);
    try {
      const r = await fetch(`${API_BASE}/api/checkout_api.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `nome_completo=${encodeURIComponent(p.nome_completo)}&email=${encodeURIComponent(participantePrincipal.email)}&category=Experiencia`,
      });
      const result = await r.json();
      if (result.success) {
        setParticipantesAnteriores(prev => prev.filter(x => x.nome_completo !== p.nome_completo));
      }
    } catch (e) { console.error(e); }
    finally { setDeletandoParticipante(null); }
  };

  // ============================================================
  // VALIDAÇÃO
  // ============================================================
  const validateForm = () => {
    setError('');
    if (!participantePrincipal.nome_completo.trim()) { setError(t('erro_nome_obrigatorio', 'Nome obrigatório')); return false; }
    if (!participantePrincipal.email.trim()) { setError(t('erro_email_obrigatorio', 'Email obrigatório')); return false; }
    if (!participantePrincipal.phone.trim()) { setError(t('erro_telefone_obrigatorio', 'Telefone obrigatório')); return false; }
    if (!participantePrincipal.nacionalidade.trim()) { setError(t('erro_nacionalidade_obrigatoria', 'Nacionalidade obrigatória')); return false; }
    if (!reserva.dataISO) { setError(t('erro_data_obrigatoria', 'Data obrigatória')); return false; }
    if (!reserva.horario) { setError(t('erro_horario_obrigatorio', 'Horário obrigatório')); return false; }
    for (let i = 0; i < participantes.length; i++) {
      if (!participantes[i].nome_completo.trim()) { setError(t('erro_nome_participante_adicional', { numero: i + 2 })); return false; }
    }
    if (disponibilidade && disponibilidade.success && disponibilidade.disponivel === false) {
      setError(disponibilidade.mensagem || t('erro_sem_vagas', 'Sem vagas suficientes.'));
      return false;
    }
    return true;
  };

  // ============================================================
  // OTP
  // ============================================================
  const mascararEmail = (email) => {
    if (!email || !email.includes('@')) return 'seu***@gmail.com';
    const [nome, dominio] = email.split('@');
    if (nome.length <= 3) return `${nome[0]}***@${dominio}`;
    return `${nome.substring(0, 3)}***@${dominio}`;
  };

  const handleEnviarOtp = async () => {
    if (!validateForm()) return;
    setEnviandoOtp(true);
    try {
      const res = await fetch(`${API_BASE}/api/send_otp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', email: participantePrincipal.email })
      });
      const data = await res.json();
      if (data.status === 'otp_sent' || data.status === 'success') {
        setOtpValues(['', '', '', '', '', '']);
        setShowOtpModal(true);
      } else {
        showToast(data.message || t('erro_enviar_codigo', 'Erro ao enviar código.'), 'error');
      }
    } catch (e) {
      showToast(t('erro_conexao', 'Erro de conexão.'), 'error');
    } finally {
      setEnviandoOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/send_otp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend_otp', email: participantePrincipal.email })
      });
      const data = await res.json();
      if (data.status === 'success' || data.status === 'otp_sent') {
        showToast(t('codigo_reenviado', 'Novo código enviado'), 'success');
      } else {
        showToast(data.message || t('erro_reenviar', 'Erro ao reenviar'), 'error');
      }
    } catch (err) { console.error(err); }
  };

  const handleOtpChange = (index, value) => {
    const val = value.replace(/\D/g, '');
    if (!val) {
      const nv = [...otpValues]; nv[index] = ''; setOtpValues(nv); return;
    }
    const nv = [...otpValues];
    nv[index] = val[val.length - 1];
    setOtpValues(nv);
    if (index < 5 && val) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpAndProceed = async () => {
    const codigo = otpValues.join('');
    if (codigo.length < 6) { showToast(t('erro_codigo_incompleto', 'Código incompleto'), 'error'); return; }

    setLoadingOtp(true);
    try {
      const res = await fetch(`${API_BASE}/api/send_otp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_otp', email: participantePrincipal.email, otp: codigo })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowOtpModal(false);
        showToast(t('email_verificado_sucesso', 'Email verificado!'), 'success');
        concluirReserva();
      } else {
        showToast(data.message || t('erro_codigo_invalido', 'Código inválido'), 'error');
      }
    } catch (e) {
      showToast(t('erro_conexao', 'Erro de conexão'), 'error');
    } finally {
      setLoadingOtp(false);
    }
  };

  // ============================================================
  // CONCLUIR RESERVA
  // ============================================================
  const concluirReserva = () => {
    const totalPessoas = participantes.length + 1;
    const precoTotalFinal = reserva.precoPorPessoa * totalPessoas;

    const dadosReserva = {
      reservaData: { ...reserva, participantes: totalPessoas, precoTotal: precoTotalFinal, tipo: 'experiencia' },
      participantePrincipal,
      participantesAdicionais: participantes,
      usuario: JSON.parse(localStorage.getItem('user') || 'null') || { email: participantePrincipal.email, nome: participantePrincipal.nome_completo }
    };

    sessionStorage.setItem('reservaPendente', JSON.stringify(dadosReserva));

    navigate('/pagamento', {
      state: {
        reservaData: { ...reserva, participantes: totalPessoas, precoTotal: precoTotalFinal, tipo: 'experiencia' },
        dadosParticipantes: { participantePrincipal, participantes },
        tipo: 'experiencia'
      }
    });
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    handleEnviarOtp();
  };

  const totalPessoas = participantes.length + 1;
  const precoTotal = reserva.precoPorPessoa * totalPessoas;

  if (!reservaData && !dataSelecionada) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">{t('carregando_dados_reserva', 'A carregar...')}</p>
        </div>
      </div>
    );
  }

  const steps = [
    { n: 1, label: t('step_dados_participantes', 'Participantes'), active: true },
    { n: 2, label: t('step_pagamento', 'Pagamento'), active: false },
    { n: 3, label: t('step_confirmacao', 'Confirmação'), active: false },
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

          {disponibilidade && disponibilidade.success && (
            <div className={`mb-6 p-3 rounded-lg border text-sm flex items-center gap-2 ${
              disponibilidade.disponivel
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {disponibilidade.disponivel ? <Check size={16} /> : <AlertCircle size={16} />}
              <span className="font-medium">
                {disponibilidade.disponivel
                  ? `${t('disponivel', 'Disponível')} — ${disponibilidade.vagas_restantes} ${t('vagas_restantes', 'vagas restantes')}`
                  : disponibilidade.mensagem}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <h1 className="text-2xl font-bold text-blue-900 mb-2 text-left">{t('dados_participantes', 'Dados dos Participantes')}</h1>
              <p className="text-slate-500 text-sm mb-6 text-left font-medium">{t('preencha_dados_participantes', 'Preencha os dados abaixo para continuar.')}</p>

              <div className="bg-[#F0F7FF] border border-blue-100 rounded-lg p-4 flex gap-3 mb-8 text-left">
                <div className="w-5 h-5 rounded-full border border-blue-600 flex items-center justify-center text-blue-600 text-[10px] font-bold italic shrink-0 font-sans">i</div>
                <div>
                  <p className="text-sm font-bold text-blue-900">{t('informacao_importante', 'Informação Importante')}</p>
                  <p className="text-xs text-blue-700 font-medium">{t('info_nome_documento', 'Introduza o nome exatamente como consta no documento oficial.')}</p>
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
                  <ArrowLeft size={18} /> {t('voltar', 'Voltar')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={enviandoOtp || loading || verificandoDisp || (disponibilidade && disponibilidade.success && disponibilidade.disponivel === false)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
                >
                  {(enviandoOtp || loading) ? <Loader size={18} className="animate-spin" /> : null}
                  {(enviandoOtp || loading) ? t('processando', 'A processar...') : t('continuar_pagamento', 'Continuar para o pagamento')} <ChevronRight size={18} />
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

      {/* MODAL OTP — PADRÃO DO SITE */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-3xl max-w-[420px] w-full p-8 shadow-2xl relative border border-slate-100 text-center">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('confirmar_email', 'Confirmar email')}</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {t('codigo_enviado_para', 'Enviámos um código de 6 dígitos para')}<br />
              <strong className="text-slate-800">{mascararEmail(participantePrincipal.email)}</strong>
            </p>

            <div className="text-left mb-2">
              <label className="text-xs font-bold text-slate-700">{t('codigo_confirmacao', 'Código de confirmação')}</label>
            </div>

            <div className="flex justify-between gap-2 mb-4">
              {otpValues.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-12 text-center text-xl font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 shadow-sm transition-all"
                />
              ))}
            </div>

            <p className="text-[11px] text-slate-400 mb-6">{t('codigo_valido_5min', 'O código é válido por 5 minutos.')}</p>

            <button
              type="button"
              onClick={handleVerifyOtpAndProceed}
              disabled={loadingOtp || otpValues.some(v => !v)}
              className="w-full bg-[#003580] hover:bg-[#002560] text-white font-semibold py-3.5 rounded-xl text-sm transition shadow-lg shadow-blue-900/10 disabled:opacity-50"
            >
              {loadingOtp ? t('a_verificar', 'A verificar...') : t('confirmar_email', 'Confirmar email')}
            </button>

            <div className="flex justify-between items-center text-xs mt-6 px-1">
              <button type="button" onClick={handleResendOtp} className="text-blue-600 font-medium hover:underline">
                {t('reenviar_codigo', 'Reenviar código')}
              </button>
              <button type="button" onClick={() => setShowOtpModal(false)} className="text-slate-500 font-medium hover:underline">
                {t('alterar_email', 'Alterar email')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutExperiencia;