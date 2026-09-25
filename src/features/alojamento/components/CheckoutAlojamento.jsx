// src/features/alojamento/components/CheckoutAlojamento.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Check, ArrowLeft, Loader, AlertCircle, ChevronRight, Calendar, Users, Home, ShieldCheck, Lock, X
} from 'lucide-react';
import DataModalAlojamento from './DataModalAlojamento';
import { useToast } from '../../../Toast';
import ResumoReservaAlojamento from './ResumoReservaAlojamento';

const API_BASE = 'https://welovepalop.com';
const TAXA_COMISSAO = 0.10;

const plural = (n, singular, pluralForm) => `${n} ${n === 1 ? singular : pluralForm}`;

const calcularNoites = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 1;
  const entrada = new Date(checkIn);
  const saida = new Date(checkOut);
  const diff = Math.ceil((saida - entrada) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};

const getSessionId = () => {
  let sid = sessionStorage.getItem('morabeza_sid');
  if (!sid) {
    sid = (crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`).toString();
    sessionStorage.setItem('morabeza_sid', sid);
  }
  return sid;
};

// ============================================================
// HÓSPEDE PRINCIPAL
// ============================================================
const ParticipantePrincipal = ({ participantePrincipal, updateParticipantePrincipal }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-sans">1</span>
        {t('hospede_principal', 'Hóspede Principal')}
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
          <label className="text-xs font-bold text-slate-700 block mb-1">{t('email', 'Email')} *</label>
          <input
            type="email"
            value={participantePrincipal.email}
            onChange={(e) => updateParticipantePrincipal('email', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">{t('telefone', 'Telefone')} *</label>
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
// HÓSPEDES ADICIONAIS
// ============================================================
const ParticipantesAdicionais = ({ participantes, addParticipante, removeParticipante, updateParticipante, maxPessoas }) => {
  const { t } = useTranslation();
  const podeAdicionarMais = participantes.length + 1 < maxPessoas;

  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-sans">2</span>
          {t('hospedes_adicionais', 'Hóspedes Adicionais')}
        </h3>
        <button
          onClick={addParticipante}
          disabled={!podeAdicionarMais}
          className={`text-sm font-bold flex items-center gap-1 ${
            podeAdicionarMais ? 'text-blue-600 hover:underline' : 'text-slate-300 cursor-not-allowed'
          }`}
          title={!podeAdicionarMais ? t('limite_hospedes_atingido', 'Limite de hóspedes atingido') : ''}
        >
          + {t('adicionar_hospede', 'Adicionar hóspede')}
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-4 font-medium">
        {t('capacidade_maxima', 'Capacidade máxima')}: {plural(maxPessoas, t('pessoa', 'pessoa'), t('pessoas', 'pessoas'))}
      </p>

      {participantes.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">{t('nenhum_hospede_adicional', 'Nenhum hóspede adicional adicionado')}</p>
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
              <h4 className="font-bold text-sm text-slate-700 mb-3">{t('hospede', 'Hóspede')} {idx + 2}</h4>
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
// PARTICIPANTES DE RESERVAS ANTERIORES
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
        {t('hospedes_reservas_anteriores', 'Hóspedes de Reservas Anteriores')}
      </h3>
      <p className="text-xs text-slate-500 mb-4 font-medium">{t('clique_hospede_adicionar', 'Clique para adicionar um hóspede frequente')}</p>

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
                  <button
                    onClick={() => iniciarEdicao(p)}
                    className="text-slate-400 hover:text-blue-600 text-sm p-1"
                    title={t('editar', 'Editar')}
                  >
                    ✏️
                  </button>
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
// COMPONENTE PRINCIPAL
// ============================================================
const CheckoutAlojamento = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
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

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const inputRefs = useRef([]);

  const [participantePrincipal, setParticipantePrincipal] = useState({
    nome_completo: '',
    email: '',
    phone: '',
    idade: 'adulto',
    nacionalidade: 'Cabo Verde',
  });

  const [participantes, setParticipantes] = useState([]);

  const noitesInicial = calcularNoites(reservaData?.checkIn, reservaData?.checkOut);
  const taxaLimpezaInicial = Number(reservaData?.taxaLimpeza || 0);

  const capacidadeMaxima = useMemo(() => {
    const quartos = reservaData?.quartos || [];
    if (quartos.length > 0) {
      return quartos.reduce(
        (acc, q) => acc + Number(q.capacidade || 0) * Number(q.quantidade || 1),
        0
      ) || 2;
    }
    return Number(reservaData?.capacidade || reservaData?.maxPessoas || 2);
  }, [reservaData]);

  const modeloVendaInicial = useMemo(() => {
    if (reservaData?.quartos && reservaData.quartos.length > 0) return 'por_quarto';
    return reservaData?.modelo_venda || reservaData?.tipo_venda || 'inteiro';
  }, [reservaData]);

  const [reserva, setReserva] = useState({
    id: reservaData?.id || null,
    alojamento_id: reservaData?.id || reservaData?.alojamento_id || null,
    titulo: reservaData?.titulo || '',
    imagem: reservaData?.imagem || '',
    localizacao: reservaData?.localizacao || '',
    checkIn: reservaData?.checkIn || '',
    checkOut: reservaData?.checkOut || '',
    noites: noitesInicial,
    taxaLimpeza: taxaLimpezaInicial,
    maxPessoas: capacidadeMaxima,
    capacidade: capacidadeMaxima,
    quartos: reservaData?.quartos || [],
    modelo_venda: modeloVendaInicial,
    tipo_venda: modeloVendaInicial,
  });

  const financeiro = useMemo(() => {
    const quartos = reserva.quartos || [];
    const noites = reserva.noites || 1;

    const subtotal = quartos.reduce(
      (acc, q) => acc + Number(q.precoNoite || 0) * Number(q.quantidade || 1) * noites,
      0
    );
    const comissaoPlataforma = subtotal * TAXA_COMISSAO;
    const totalGeralCliente = subtotal + Number(reserva.taxaLimpeza || 0);
    const valorAnfitriaoLiquido = subtotal - comissaoPlataforma + Number(reserva.taxaLimpeza || 0);

    return { subtotal, comissaoPlataforma, totalGeralCliente, valorAnfitriaoLiquido };
  }, [reserva.quartos, reserva.noites, reserva.taxaLimpeza]);

  const buscarDadosUsuario = async (email, googleId) => {
    setCarregandoDados(true);
    try {
      let url = `${API_BASE}/api/checkout_api.php?email=${encodeURIComponent(email)}&category=Alojamento`;
      if (googleId) {
        url += `&google_id=${encodeURIComponent(googleId)}`;
      }
      const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      const result = await response.json();
      if (result.success) {
        if (result.usuario) {
          setParticipantePrincipal(prev => ({
            ...prev,
            nome_completo: result.usuario.nome || prev.nome_completo,
            email: result.usuario.email || prev.email,
            phone: result.usuario.phone || prev.phone,
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
    if (!window.confirm(t('confirmar_remover_hospede', { nome: participante.nome_completo }))) return;
    setDeletandoParticipante(participante.nome_completo);
    try {
      const response = await fetch(`${API_BASE}/api/checkout_api.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `nome_completo=${encodeURIComponent(participante.nome_completo)}&email=${encodeURIComponent(participantePrincipal.email)}&category=Alojamento`,
      });
      const result = await response.json();
      if (result.success) {
        setParticipantesAnteriores(prev => prev.filter(p => p.nome_completo !== participante.nome_completo));
        showToast(t('hospede_removido', 'Hóspede removido com sucesso'), 'success');
      }
    } catch (err) {
      console.error('Erro ao deletar:', err);
      showToast(t('erro_remover', 'Erro ao remover hóspede'), 'error');
    } finally {
      setDeletandoParticipante(null);
    }
  };

  const iniciarEdicao = (participante) => {
    setEditandoParticipante(participante.nome_completo);
    setEditForm({
      nome_completo: participante.nome_completo,
      idade: participante.idade,
      nacionalidade: participante.nacionalidade,
    });
  };

  const salvarEdicao = async (participanteOriginal) => {
    if (!editForm.nome_completo.trim()) {
      showToast(t('erro_nome_vazio', 'O nome não pode estar vazio'), 'error');
      return;
    }
    setDeletandoParticipante(participanteOriginal.nome_completo);
    try {
      const response = await fetch(`${API_BASE}/api/checkout_api.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_antigo: participanteOriginal.nome_completo,
          nome_novo: editForm.nome_completo,
          idade: editForm.idade,
          nacionalidade: editForm.nacionalidade,
          email: participantePrincipal.email,
          category: 'Alojamento',
        }),
      });
      const result = await response.json();
      if (result.success) {
        setParticipantesAnteriores(prev => prev.map(p =>
          p.nome_completo === participanteOriginal.nome_completo ? {
            ...p,
            nome_completo: editForm.nome_completo,
            idade: editForm.idade,
            nacionalidade: editForm.nacionalidade,
          } : p
        ));
        setParticipantes(prev => prev.map(p =>
          p.nome_completo === participanteOriginal.nome_completo ? {
            ...p,
            nome_completo: editForm.nome_completo,
            idade: editForm.idade,
            nacionalidade: editForm.nacionalidade,
          } : p
        ));
        setEditandoParticipante(null);
        showToast(t('hospede_atualizado', 'Hóspede atualizado'), 'success');
      }
    } catch (err) {
      console.error('Erro ao editar:', err);
      showToast(t('erro_atualizar', 'Erro ao atualizar hóspede'), 'error');
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
      showToast(t('erro_hospede_ja_adicionado', { nome: participante.nome_completo }), 'error');
      return;
    }
    if (participantes.length + 1 >= reserva.maxPessoas) {
      showToast(t('erro_max_hospedes', { max: reserva.maxPessoas }), 'error');
      return;
    }
    setParticipantes(prev => [...prev, {
      id: Date.now(),
      nome_completo: participante.nome_completo,
      idade: participante.idade || 'adulto',
      nacionalidade: participante.nacionalidade || 'Cabo Verde',
    }]);
    showToast(t('hospede_adicionado', 'Hóspede adicionado'), 'success');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const email = userData.email;
        const googleId = userData.sub || userData.google_id || null;
        setUser({ ...userData, google_id: googleId, email });
        if (email) {
          buscarDadosUsuario(email, googleId);
        }
        setParticipantePrincipal(prev => ({
          ...prev,
          nome_completo: userData.name || userData.full_name || prev.nome_completo,
          email: email || prev.email,
          phone: userData.phone || prev.phone,
        }));
      } catch (e) {
        console.error('Erro ao parsear usuário:', e);
      }
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!reservaData) {
      navigate('/alojamentos');
    }
  }, [reservaData, navigate]);

  const handleSelectData = (dataObj) => {
    const novasNoites = dataObj.noites || calcularNoites(dataObj.checkIn, dataObj.checkOut);
    setReserva(prev => ({
      ...prev,
      checkIn: dataObj.checkIn,
      checkOut: dataObj.checkOut,
      noites: novasNoites,
    }));
    setDataModalOpen(false);
  };

  const addParticipante = () => {
    if (participantes.length + 1 >= reserva.maxPessoas) {
      showToast(t('erro_max_hospedes', { max: reserva.maxPessoas }), 'error');
      return;
    }
    setParticipantes(prev => [...prev, {
      id: Date.now(),
      nome_completo: '',
      idade: 'adulto',
      nacionalidade: 'Cabo Verde',
    }]);
  };

  const removeParticipante = (id) => {
    setParticipantes(prev => prev.filter(p => p.id !== id));
  };

  const updateParticipantePrincipal = (field, value) => {
    setParticipantePrincipal(prev => ({ ...prev, [field]: value }));
  };

  const updateParticipante = (id, field, value) => {
    setParticipantes(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const validateForm = () => {
    setError('');
    const totalHospedes = participantes.length + 1;

    if (!participantePrincipal.nome_completo.trim()) {
      setError(t('erro_nome_obrigatorio', 'O nome completo do hóspede principal é obrigatório'));
      return false;
    }
    if (!participantePrincipal.email.trim()) {
      setError(t('erro_email_obrigatorio', 'O email do hóspede principal é obrigatório'));
      return false;
    }
    if (!participantePrincipal.phone.trim()) {
      setError(t('erro_telefone_obrigatorio', 'O telefone do hóspede principal é obrigatório'));
      return false;
    }
    if (!participantePrincipal.nacionalidade.trim()) {
      setError(t('erro_nacionalidade_obrigatoria', 'A nacionalidade é obrigatória'));
      return false;
    }
    if (!reserva.checkIn || !reserva.checkOut) {
      setError(t('erro_datas_obrigatorias', 'As datas da reserva são obrigatórias'));
      return false;
    }
    if (totalHospedes > reserva.maxPessoas) {
      setError(t('erro_max_hospedes', { max: reserva.maxPessoas }));
      return false;
    }
    for (let i = 0; i < participantes.length; i++) {
      if (!participantes[i].nome_completo.trim()) {
        setError(t('erro_nome_hospede_adicional', { numero: i + 2 }));
        return false;
      }
    }
    return true;
  };

  const registrarUsuarioCheckout = async () => {
    if (user && user.email) {
      return null;
    }

    try {
      const res = await fetch(`${API_BASE}/api/registrar_usuario_checkout.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: participantePrincipal.nome_completo,
          email: participantePrincipal.email,
          phone: participantePrincipal.phone,
          nacionalidade: participantePrincipal.nacionalidade,
          otp_verified: true,
        }),
      });

      const raw = await res.text();
      let result;
      try {
        result = JSON.parse(raw);
      } catch (e) {
        return null;
      }

      if (result.success && result.user) {
        try {
          const sessao = {
            id: result.user.id,
            name: result.user.nome,
            email: result.user.email,
            phone: participantePrincipal.phone,
            origem: 'checkout_alojamento',
            registado_em: new Date().toISOString(),
          };
          localStorage.setItem('user', JSON.stringify(sessao));
          setUser(sessao);
        } catch (e) {
          console.warn('Não foi possível guardar sessão leve:', e);
        }
        return result.user;
      }
    } catch (err) {
      console.error('Erro ao registar utilizador:', err);
    }
    return null;
  };

  const processarSubmissaoFinal = async () => {
    const totalHospedes = participantes.length + 1;
    let holdIds = [];
    
    const tipoVendaFinal = reserva.quartos && reserva.quartos.length > 0 ? 'por_quarto' : (reserva.modelo_venda || 'inteiro');

    if ((tipoVendaFinal === 'por_quarto') && reserva.quartos.length > 0) {
      try {
        const holdRes = await fetch(`${API_BASE}/api/checkout_api.php?action=create_hold`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alojamento_id: reserva.alojamento_id,
            sessao_id: getSessionId(),
            data_checkin: reserva.checkIn,
            data_checkout: reserva.checkOut,
            quartos: reserva.quartos.map(q => ({
              tipo_quarto_id: q.tipoQuartoId,
              quantidade: q.quantidade || 1,
            })),
            minutos: 20,
          }),
        });
        const holdData = await holdRes.json();
        if (holdData.success && Array.isArray(holdData.hold_ids)) {
          holdIds = holdData.hold_ids;
        }
      } catch (err) {
        console.warn('Hold não criado (opcional):', err);
      }
    }

    const dadosReserva = {
      reservaData: {
        ...reserva,
        totalHospedes,
        precoTotal: financeiro.totalGeralCliente,
        tipo_venda: tipoVendaFinal,
        modelo_venda: tipoVendaFinal,
        hold_ids: holdIds,
        financeiro: {
          valorTotalCliente: financeiro.totalGeralCliente,
          subtotalNoites: financeiro.subtotal,
          taxaLimpeza: reserva.taxaLimpeza,
          comissaoMorabeza: financeiro.comissaoPlataforma,
          valorLiquidoAnfitriao: financeiro.valorAnfitriaoLiquido,
        },
      },
      participantePrincipal,
      participantesAdicionais: participantes,
      usuario: user,
    };

    sessionStorage.setItem('reservaAlojamentoPendente', JSON.stringify(dadosReserva));

    navigate('/pagamento', {
      state: {
        reservaData: {
          ...reserva,
          totalHospedes,
          precoTotal: financeiro.totalGeralCliente,
          tipo: 'alojamento',
          tipo_venda: tipoVendaFinal,
          modelo_venda: tipoVendaFinal,
          alojamento_id: reserva.alojamento_id,
          hold_ids: holdIds,
          financeiro: dadosReserva.reservaData.financeiro,
        },
        dadosParticipantes: { participantePrincipal, participantes },
        tipo: 'alojamento',
      },
    });
  };

  const emailJaRegistado = async (email) => {
    const url = `${API_BASE}/api/checkout_api.php?email=${encodeURIComponent(email)}&category=Alojamento`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Não foi possível verificar o email.');
    }

    const result = await response.json();
    if (result?.success && result?.usuario && result?.usuario.id) {
      return true;
    }
    if (result?.existe === true || result?.exists === true) {
      return true;
    }
    return false;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const email = participantePrincipal.email.trim().toLowerCase();
    const utilizadorAtual = user?.email?.trim().toLowerCase();

    try {
      const contaDoUtilizadorAtual = utilizadorAtual === email;
      if (!contaDoUtilizadorAtual) {
        const existe = await emailJaRegistado(email);
        if (existe) {
          showToast(
            t('checkout_email_conta_existente', 'Este email já está registado como utilizador. Inicie sessão para continuar.'),
            'error'
          );
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Erro ao verificar email:', err);
      showToast(t('erro_verificar_email', 'Não foi possível verificar o email. Tente novamente.'), 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/send_otp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', email }),
      });
      const result = await response.json();

      if (result.status !== 'otp_sent' && result.status !== 'success') {
        showToast(result.message || t('erro_enviar_codigo', 'Não foi possível enviar o código. Tente novamente.'), 'error');
        setLoading(false);
        return;
      }

      setOtpValues(['', '', '', '', '', '']);
      setShowOtpModal(true);
    } catch (e) {
      console.error('Erro ao enviar OTP:', e);
      showToast(t('erro_enviar_codigo', 'Não foi possível enviar o código. Tente novamente.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const val = value.replace(/\D/g, '');
    if (!val) {
      const newValues = [...otpValues];
      newValues[index] = '';
      setOtpValues(newValues);
      return;
    }

    const newValues = [...otpValues];
    newValues[index] = val[val.length - 1];
    setOtpValues(newValues);

    if (index < 5 && val) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const mascararEmail = (email) => {
    if (!email || !email.includes('@')) return 'seu***@gmail.com';
    const [nome, dominio] = email.split('@');
    if (nome.length <= 3) return `${nome[0]}***@${dominio}`;
    return `${nome.substring(0, 3)}***@${dominio}`;
  };

  const handleVerifyOtpAndProceed = async () => {
    const codigoCompleto = otpValues.join('');
    if (codigoCompleto.length < 6) {
      showToast(t('erro_codigo_incompleto', 'Por favor, insira o código completo de 6 dígitos'), 'error');
      return;
    }

    setLoadingOtp(true);
    try {
      const response = await fetch(`${API_BASE}/api/send_otp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_otp',
          email: participantePrincipal.email,
          otp: codigoCompleto,
        }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        setShowOtpModal(false);
        showToast(t('email_verificado_sucesso', 'Email verificado com sucesso!'), 'success');

        await registrarUsuarioCheckout();
        await processarSubmissaoFinal();
      } else {
        showToast(result.message || t('erro_codigo_invalido', 'Código inválido'), 'error');
      }
    } catch (err) {
      console.error('Erro ao verificar OTP:', err);
      showToast(t('erro_conexao', 'Erro de conexão ao verificar código'), 'error');
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/send_otp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend_otp',
          email: participantePrincipal.email,
        }),
      });
      const result = await response.json();
      if (result.status === 'success' || result.status === 'otp_sent') {
        showToast(t('codigo_reenviado', 'Novo código enviado para o seu email'), 'success');
      } else {
        showToast(result.message || t('erro_reenviar', 'Erro ao reenviar código'), 'error');
      }
    } catch (err) {
      console.error('Erro ao reenviar OTP:', err);
    }
  };

  const totalHospedes = participantes.length + 1;

  if (!reservaData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="font-bold text-gray-500 font-medium">{t('carregando_dados_reserva', 'Carregando dados da reserva...')}</p>
      </div>
    );
  }

  const formatarData = (data) => {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const steps = [
    { n: 1, label: t('step_dados_hospedes', 'Hóspedes'), active: true },
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <h1 className="text-2xl font-bold text-blue-900 mb-2 text-left">{t('dados_hospedes', 'Dados dos Hóspedes')}</h1>
              <p className="text-slate-500 text-sm mb-6 text-left font-medium">{t('preencha_dados_hospedes', 'Por favor, preencha a informação de quem irá usufruir da estadia.')}</p>

              <div className="bg-[#F0F7FF] border border-blue-100 rounded-lg p-4 flex gap-3 mb-8 text-left">
                <div className="w-5 h-5 rounded-full border border-blue-600 flex items-center justify-center text-blue-600 text-[10px] font-bold italic shrink-0 font-sans">i</div>
                <div>
                  <p className="text-sm font-bold text-blue-900">{t('informacao_importante', 'Informação Importante')}</p>
                  <p className="text-xs text-blue-700 font-medium">{t('info_nome_documento', 'Certifique-se de introduzir o nome exatamente como consta no documento oficial de identificação.')}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-6 flex flex-wrap gap-4 text-xs text-left">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600" />
                  <span className="font-medium text-slate-700">{formatarData(reserva.checkIn)} - {formatarData(reserva.checkOut)}</span>
                  <span className="text-slate-400 font-medium">• {plural(reserva.noites, t('noite', 'noite'), t('noites', 'noites'))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-blue-600" />
                  <span className="font-medium text-slate-700">
                    {t('max_pessoas', 'Máx.')} {plural(reserva.maxPessoas, t('pessoa', 'pessoa'), t('pessoas', 'pessoas'))}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Home size={14} className="text-blue-600" />
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
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader className="animate-spin" size={18} /> {t('a_processar', 'A processar...')}</>
                  ) : (
                    <>{t('continuar_pagamento', 'Continuar para pagamento')} <ChevronRight size={18} /></>
                  )}
                </button>
              </div>
            </div>

            <div className="lg:col-span-4">
              <ResumoReservaAlojamento
                reserva={reserva}
                totalHospedes={totalHospedes}
                precoTotal={financeiro.totalGeralCliente}
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

      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-3xl max-w-[420px] w-full p-8 shadow-2xl relative border border-slate-100 text-center animate-in fade-in zoom-in duration-200">
            
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

            <h3 className="text-xl font-bold text-slate-900 mb-2">Confirmar email</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Enviámos um código de 6 dígitos para<br />
              <strong className="text-slate-800">{mascararEmail(participantePrincipal.email)}</strong>
            </p>

            <div className="text-left mb-2">
              <label className="text-xs font-bold text-slate-700">Código de confirmação</label>
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

            <p className="text-[11px] text-slate-400 mb-6">O código é válido por 5 minutos.</p>

            <button
              type="button"
              onClick={handleVerifyOtpAndProceed}
              disabled={loadingOtp || otpValues.some(v => !v)}
              className="w-full bg-[#003580] hover:bg-[#002560] text-white font-semibold py-3.5 rounded-xl text-sm transition shadow-lg shadow-blue-900/10 disabled:opacity-50"
            >
              {loadingOtp ? 'A verificar...' : 'Confirmar email'}
            </button>

            <div className="flex justify-between items-center text-xs mt-6 px-1">
              <button 
                type="button" 
                onClick={handleResendOtp}
                className="text-blue-600 font-medium hover:underline"
              >
                Reenviar código
              </button>
              <button 
                type="button" 
                onClick={() => setShowOtpModal(false)}
                className="text-slate-500 font-medium hover:underline"
              >
                Alterar email
              </button> 
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutAlojamento;