import CampoTelefoneInternacional from '../../../components/CampoTelefoneInternacional';
import { telefoneInternacionalValido } from '../../../utils/telefoneInternacional';
import { janelasCarro, horaNaJanela } from '../utils/horariosCarro';
import DocumentosCondutorUpload from './DocumentosCondutorUpload';
import { documentosCondutorCompletos, TIPOS_DOCUMENTOS_CONDUTOR } from '../utils/documentosCondutor';
import { extrairCondicoesCarro } from '../utils/condicoesCarro';
import CondicoesCarro from './CondicoesCarro';
import { normalizarCaucaoCarro } from '../utils/caucaoCarro';
import CaucaoCarro from './CaucaoCarro';
// CheckoutCarro.jsx - Com verificação OTP (design padrão do site)
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Check, ArrowLeft, Loader, AlertCircle, ChevronRight, Calendar, Users, Home, ShieldCheck, Lock, Gauge, Fuel, Info, MapPin, Clock, FileText, Upload, X
} from 'lucide-react';
import DataModalCarro from './DataModalCarro';
import { useToast } from '../../../Toast';
import { obterUtilizadorCheckout } from '../../../utils/utilizadorCheckout';
import api from '../../../api/api';

const API_BASE = 'https://welovepalop.com';

// ============================================================
// CONDUTOR PRINCIPAL
// ============================================================
const CondutorPrincipal = ({ condutor, updateCondutor, reserva, horariosEstado }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-sans">1</span>
        {t('condutor_principal', 'Condutor Principal')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">{t('nome_completo', 'Nome completo')} *</label>
          <input
            type="text"
            value={condutor.nome_completo}
            onChange={(e) => updateCondutor('nome_completo', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder={t('placeholder_nome_documento', 'Nome como consta no documento')}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">{t('email', 'E-mail')} *</label>
          <input
            type="email"
            value={condutor.email}
            onChange={(e) => updateCondutor('email', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">{t('telefone_whatsapp', 'Telefone / WhatsApp')} *</label>
          <CampoTelefoneInternacional value={condutor.phone} onChange={value => updateCondutor('phone', value)} />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">{t('pais_nacionalidade', 'País / Nacionalidade')} *</label>
          <select
            value={condutor.nacionalidade}
            onChange={(e) => updateCondutor('nacionalidade', e.target.value)}
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

      <div className="border-t border-slate-100 my-6"></div>

      <div className="space-y-5">
        {['levantamento', 'devolucao'].map(tipo => {
          const janela = janelasCarro(reserva)[tipo];
          return <div key={tipo}>
            <label htmlFor={`hora-${tipo}`} className="mb-1 block text-xs font-bold text-slate-700">{t(`carro_horas_${tipo}_escolhida`)} *</label>
            <input id={`hora-${tipo}`} type="time" step="60" disabled={horariosEstado !== 'ready'} min={janela[0]} max={janela[1]} value={condutor[`hora_${tipo}`] || ''} onChange={e => updateCondutor(`hora_${tipo}`, e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900" />
            <p className="mt-1 text-xs text-slate-500">{t('carro_horas_janela')}: {janela[0] && janela[1] ? janela.join(' – ') : t('carro_horas_carregando')}</p>
          </div>;
        })}

        <DocumentosCondutorUpload documentos={condutor.documentos} onChange={documentos => updateCondutor('documentos', documentos)} />

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
            <FileText size={12} /> {t('observacoes_pedidos', 'Observações')}
          </label>
          <textarea
            rows="3"
            value={condutor.observacoes || ''}
            onChange={(e) => updateCondutor('observacoes', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 resize-none"
            placeholder={t('placeholder_observacoes', 'Informações adicionais...')}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================
// RESUMO RESERVA CARRO
// ============================================================
const ResumoReservaCarro = ({ reserva, precoTotal, setDataModalOpen }) => {
  const { t } = useTranslation();

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    return Number(value).toLocaleString('pt-PT');
  };

  const formatarData = (data) => {
    if (!data) return t('nao_selecionada', 'Não selecionada');
    const d = new Date(data);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm sticky top-6 text-left">
      <h2 className="text-lg font-bold text-blue-900 mb-5">{t('resumo_reserva', 'Resumo da Reserva')}</h2>

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
            {t('alterar_datas', 'Alterar datas')}
          </button>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-5">
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">{t('carro_horas_levantamento_escolhida')}</span>
          <span className="text-xs font-bold text-blue-900">{formatarData(reserva?.checkIn)} - {reserva?.horaLevantamento || t('carro_horas_por_escolher')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">{t('carro_horas_devolucao_escolhida')}</span>
          <span className="text-xs font-bold text-blue-900">{formatarData(reserva?.checkOut)} - {reserva?.horaDevolucao || t('carro_horas_por_escolher')}</span>
        </div>
        <p className="text-xs text-slate-500">{t('carro_horas_levantamento_janela')}: {janelasCarro(reserva).levantamento.filter(Boolean).join(' – ') || t('carro_horas_carregando')}<br />{t('carro_horas_devolucao_janela')}: {janelasCarro(reserva).devolucao.filter(Boolean).join(' – ') || t('carro_horas_carregando')}</p>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">{t('dias', 'Dias')}</span>
          <span className="text-xs font-bold text-blue-900">{reserva?.dias || 0} {Number(reserva?.dias) === 1 ? 'dia' : 'dias'}</span>
        </div>

        <div className="pt-3 space-y-2 border-t border-slate-100">
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500">{t('preco_por_dia', 'Preço por dia')}</span>
            <span className="text-slate-800">{formatNumber(reserva?.precoDia)} CVE</span>
          </div>
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500">{t('subtotal_dias', { count: Number(reserva?.dias || 0), dias: reserva?.dias || 0, defaultValue: 'Subtotal' })}</span>
            <span className="text-slate-800">{formatNumber(reserva?.subtotal)} CVE</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <span className="text-base font-bold text-blue-900">{t('total', 'Total')}</span>
          <span className="text-xl font-bold text-blue-600">{formatNumber(precoTotal)} CVE</span>
        </div>
        <CondicoesCarro dados={reserva} />
        <CaucaoCarro dados={reserva} quantidade={reserva?.quantidade || 1} />
      </div>
    </div>
  );
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const CheckoutCarro = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { reservaData } = location.state || {};

  const [loading] = useState(false);
  const [error, setError] = useState('');
  const [isDataModalOpen, setDataModalOpen] = useState(false);

  // Estados OTP (padrão do site)
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [progressoDocumentos, setProgressoDocumentos] = useState(null);
  const [enviandoOtp, setEnviandoOtp] = useState(false);
  const inputRefs = useRef([]);

  const [condutor, setCondutor] = useState({
    nome_completo: '',
    email: '',
    phone: '',
    idade: 'adulto',
    nacionalidade: 'Cabo Verde',
    hora_levantamento: '',
    hora_devolucao: '',
    documentos: {},
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
    quantidade: reservaData?.quantidade || 1,
    ...(normalizarCaucaoCarro(reservaData) || {}),
    ...extrairCondicoesCarro(reservaData),
    precoDia: reservaData?.precoDia || 0,
    subtotal: reservaData?.subtotal || reservaData?.totalGeral || 0,
    totalGeral: reservaData?.totalGeral || 0,
    tipo: reservaData?.tipo || 'SUV',
    horaLevantamento: '',
    horaDevolucao: ''
  });

  const [horariosEstado, setHorariosEstado] = useState('loading');
  useEffect(() => {
    if (!reserva.id) return;
    const c = new AbortController();setHorariosEstado('loading');
    api.get('/horarios_carro.php', { params: { carro_id: reserva.id }, signal: c.signal }).then(({ data }) => {
      if (!data.success || !data.horarios) throw new Error('Missing hours');
      if (!c.signal.aborted) { setReserva(v => ({ ...v, ...data.horarios }));setHorariosEstado('ready'); }
    }).catch(() => { if (!c.signal.aborted) setHorariosEstado('error'); });
    return () => c.abort();
  }, [reserva.id]);

  const [caucaoEstado, setCaucaoEstado] = useState('loading');
  useEffect(() => {
    if (!reserva.id) return;
    const controller = new AbortController();
    api.get('/get_carro.php', { params: { id: reserva.id }, signal: controller.signal }).then(({ data }) => {
      if (controller.signal.aborted) return;
      const caucao = data.success && String(data.data?.id) === String(reserva.id) ? normalizarCaucaoCarro(data.data) : null;
      if (!caucao) throw new Error('Deposit unavailable');
      setReserva(prev => ({ ...prev, ...caucao, ...extrairCondicoesCarro(data.data) }));
      setCaucaoEstado('ready');
    }).catch(() => {
      if (!controller.signal.aborted) setCaucaoEstado('error');
    });
    return () => controller.abort();
  }, [reserva.id]);

  useEffect(() => {
    let ativo = true;
    const userData = obterUtilizadorCheckout();
    if (userData) {
      setCondutor(prev => ({
        ...prev,
        nome_completo: userData.nome || prev.nome_completo,
        email: userData.email || prev.email,
        phone: userData.phone || prev.phone,
      }));
      // O JWT do login Google pode nao incluir o telefone do perfil.
      const params = { email: userData.email, category: 'Carro' };
      if (userData.google_id) params.google_id = userData.google_id;
      api.get('/checkout_api.php', { params }).then(({ data }) => {
        if (!ativo || !data?.success || !data.usuario) return;
        const perfil = data.usuario;
        if ((perfil.email || '').trim().toLowerCase() !== userData.email.trim().toLowerCase()) return;
        setCondutor(prev => ({
          ...prev,
          phone: prev.phone || perfil.phone || perfil.telefone || '',
        }));
      }).catch(() => {
        // Os dados da sessao continuam disponiveis e o telefone pode ser preenchido.
      });
    }
    window.scrollTo(0, 0);
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (!reservaData) {
      navigate('/carros');
    }
  }, [reservaData, navigate]);

  const handleSelectData = (dataObj) => {
    const novosDias = dataObj.dias;
    const novoSubtotal = reserva.precoDia * novosDias * reserva.quantidade;
    setReserva(prev => ({
      ...prev,
      checkIn: dataObj.checkIn,
      checkOut: dataObj.checkOut,
      dias: novosDias,
      subtotal: novoSubtotal,
      totalGeral: novoSubtotal
    }));
    setDataModalOpen(false);
  };

  const updateCondutor = (field, value) => {
    setCondutor(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    setError('');
    if (caucaoEstado !== 'ready') {
      setError(t('carro_caucao_erro_consulta'));
      return false;
    }
    if (!condutor.nome_completo.trim()) {
      setError(t('erro_nome_obrigatorio', 'O nome completo é obrigatório.'));
      return false;
    }
    if (!condutor.email.trim()) {
      setError(t('erro_email_obrigatorio', 'O e-mail é obrigatório.'));
      return false;
    }
    if (!telefoneInternacionalValido(condutor.phone)) {
      setError(t('checkout_telefone_internacional_invalido', 'Introduza um telefone v?lido com indicativo internacional.'));
      return false;
    }
    if (!condutor.nacionalidade.trim()) {
      setError(t('erro_nacionalidade_obrigatoria', 'A nacionalidade é obrigatória.'));
      return false;
    }
    if (!reserva.checkIn || !reserva.checkOut) {
      setError(t('erro_datas_obrigatorias', 'As datas de levantamento e devolução são obrigatórias.'));
      return false;
    }
    const janelas = janelasCarro(reserva);
    if (horariosEstado !== 'ready' || !horaNaJanela(condutor.hora_levantamento, janelas.levantamento) || !horaNaJanela(condutor.hora_devolucao, janelas.devolucao)) {
      setError(t('carro_horas_invalidas'));return false;
    }
    if (!documentosCondutorCompletos(condutor.documentos)) { setError(t('carro_docs_obrigatorios'));return false; }
    return true;
  };

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
      const { data } = await api.get('/verificar_disponibilidade_carro.php', { params: { carro_id: reserva.id, checkin: reserva.checkIn, checkout: reserva.checkOut, quantidade: reserva.quantidade, hora_levantamento: condutor.hora_levantamento,
        hora_devolucao: condutor.hora_devolucao } });
      if (!data.success || !data.disponivel) { setError(t('carro_horas_sem_stock'));setEnviandoOtp(false);return; }
    } catch { setError(t('carro_horas_erro'));setEnviandoOtp(false);return; }
    try {
      const res = await fetch(`${API_BASE}/api/send_otp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', email: condutor.email })
      });
      const data = await res.json();
      if (data.status === 'otp_sent' || data.status === 'success') {
        setOtpValues(['', '', '', '', '', '']);
        setShowOtpModal(true);
      } else {
        showToast(data.message || t('erro_enviar_codigo', 'Não foi possível enviar o código.'), 'error');
      }
    } catch {
      showToast(t('erro_conexao', 'Erro de conexão ao enviar OTP.'), 'error');
    } finally {
      setEnviandoOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/send_otp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend_otp', email: condutor.email })
      });
      const data = await res.json();
      if (data.status === 'success' || data.status === 'otp_sent') {
        showToast(t('codigo_reenviado', 'Novo código enviado para o seu email'), 'success');
      } else {
        showToast(data.message || t('erro_reenviar', 'Erro ao reenviar código'), 'error');
      }
    } catch (err) {
      console.error('Erro ao reenviar OTP:', err);
    }
  };

  const handleOtpChange = (index, value) => {
    const apenasDigitos = value.replace(/\D/g, '');
    if (!apenasDigitos) {
      const next = [...otpValues];
      next[index] = '';
      setOtpValues(next);
      return;
    }

    if (apenasDigitos.length > 1) {
      const next = [...otpValues];
      const restante = apenasDigitos.slice(0, 6 - index).split('');
      restante.forEach((d, i) => {
        next[index + i] = d;
      });
      setOtpValues(next);

      const ultimo = Math.min(index + restante.length, 5);
      inputRefs.current[ultimo]?.focus();
      return;
    }

    const next = [...otpValues];
    next[index] = apenasDigitos;
    setOtpValues(next);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e, index) => {
    e.preventDefault();
    const colado = e.clipboardData.getData('text');
    if (colado.replace(/\D/g, '').length >= 6) index = 0;
    const apenasDigitos = colado.replace(/\D/g, '').slice(0, 6 - index);
    if (!apenasDigitos) return;

    const next = [...otpValues];
    apenasDigitos.split('').forEach((d, i) => {
      next[index + i] = d;
    });
    setOtpValues(next);

    const ultimo = Math.min(index + apenasDigitos.length, 5);
    inputRefs.current[ultimo]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpAndProceed = async () => {
    const codigoCompleto = otpValues.join('');
    if (codigoCompleto.length < 6) {
      showToast(t('erro_codigo_incompleto', 'Por favor, insira o código completo de 6 dígitos'), 'error');
      return;
    }

    setLoadingOtp(true);
    setProgressoDocumentos(0);
    try {
      if (!documentosCondutorCompletos(condutor.documentos)) throw new Error(t('carro_docs_obrigatorios'));
      const form = new FormData();form.append('email', condutor.email);form.append('otp', codigoCompleto);
      form.append('carro_id', reserva.id);form.append('inicio', reserva.checkIn);form.append('fim', reserva.checkOut);
      for (const tipo of TIPOS_DOCUMENTOS_CONDUTOR) form.append(tipo, condutor.documentos[tipo]);
      const { data } = await api.post('/documentos_condutor_upload.php', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000, onUploadProgress: event => { if (event.total) setProgressoDocumentos(Math.round(event.loaded * 100 / event.total)); } });
      if (data.success && data.documentos?.lote && data.documentos?.token) {
        setShowOtpModal(false);
        showToast(t('email_verificado_sucesso', 'Email verificado com sucesso!'), 'success');
        concluirReserva(data.documentos);
      } else {
        showToast(data.message || t('erro_codigo_invalido', 'Código inválido ou expirado.'), 'error');
      }
    } catch (err) {
      showToast(t(err.response?.data?.code === 'OTP_INVALID' ? 'erro_codigo_invalido' : 'carro_docs_envio_erro'), 'error');
    } finally {
      setLoadingOtp(false);
      setProgressoDocumentos(null);
    }
  };

  const concluirReserva = (documentos) => {
    const dadosReserva = {
      reservaData: {
        ...reserva,
        horaLevantamento: condutor.hora_levantamento, horaDevolucao: condutor.hora_devolucao,
        precoTotal: reserva.totalGeral,
        tipo: 'carro',
        documentos_condutor: documentos
      },
      participantePrincipal: {
        nome_completo: condutor.nome_completo,
        email: condutor.email,
        phone: condutor.phone,
        idade: condutor.idade,
        nacionalidade: condutor.nacionalidade,
        hora_levantamento: condutor.hora_levantamento,
        hora_devolucao: condutor.hora_devolucao,
        observacoes: condutor.observacoes
      },
      participantesAdicionais: [],
      usuario: obterUtilizadorCheckout() || { email: condutor.email, nome: condutor.nome_completo }
    };

    sessionStorage.setItem('reservaCarroPendente', JSON.stringify(dadosReserva));

    navigate('/pagamento', {
      state: {
        reservaData: {
          ...reserva,
          horaLevantamento: condutor.hora_levantamento, horaDevolucao: condutor.hora_devolucao,
          precoTotal: reserva.totalGeral,
          tipo: 'carro',
          documentos_condutor: documentos
        },
        dadosParticipantes: {
          participantePrincipal: dadosReserva.participantePrincipal,
          participantes: []
        },
        tipo: 'carro'
      }
    });
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    handleEnviarOtp();
  };

  const totalPreco = reserva.totalGeral;

  if (!reservaData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="font-bold text-gray-500 font-medium">{t('carregando_dados_reserva', 'A carregar...')}</p>
      </div>
    );
  }



  return (
    <>
      <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-10">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-left">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <h1 className="text-2xl font-bold text-blue-900 mb-2 text-left">{t('dados_condutor', 'Dados do Condutor')}</h1>
              <p className="text-slate-500 text-sm mb-6 text-left font-medium">{t('preencha_dados_condutor', 'Preencha os dados abaixo para continuar.')}</p>

              <CondutorPrincipal
                reserva={reserva} horariosEstado={horariosEstado}
                condutor={condutor}
                updateCondutor={updateCondutor}
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
                  disabled={enviandoOtp || loading || caucaoEstado !== 'ready'}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
                >
                  {(enviandoOtp || loading) ? <Loader size={18} className="animate-spin" /> : null}
                  {(enviandoOtp || loading) ? (t('processando', 'A processar...')) : (t('continuar_pagamento', 'Continuar para o pagamento'))} <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-4">
              <ResumoReservaCarro
                reserva={{ ...reserva, horaLevantamento: condutor.hora_levantamento, horaDevolucao: condutor.hora_devolucao }}
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

      {/* MODAL OTP — DESIGN PADRÃO DO SITE */}
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
              <strong className="text-slate-800">{mascararEmail(condutor.email)}</strong>
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
                  inputMode="numeric"
                  autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                  maxLength={6}
                  onPaste={(e) => handleOtpPaste(e, idx)}
                  onFocus={(e) => e.target.select()}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-12 text-center text-xl font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 shadow-sm transition-all"
                />
              ))}
            </div>

            <p className="text-[11px] text-slate-400 mb-6">O código é válido por 5 minutos.</p>

            {loadingOtp && progressoDocumentos !== null && <div role="status" aria-live="polite" className="mb-4 text-left">
              <div className="mb-2 flex justify-between gap-2 text-sm font-medium text-slate-700"><span>{t('carro_docs_enviando')}</span><span>{progressoDocumentos}%</span></div>
              <div role="progressbar" aria-label={t('carro_docs_enviando')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressoDocumentos} className="h-2 overflow-hidden rounded-full bg-blue-100"><div className="h-full rounded-full bg-blue-600 transition-[width] duration-300" style={{ width: `${progressoDocumentos}%` }} /></div>
            </div>}

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

export default CheckoutCarro;
