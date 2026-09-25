// CheckoutCarro.jsx - Com verificação OTP (design padrão do site)
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Check, ArrowLeft, Loader, AlertCircle, ChevronRight, Calendar, Users, Home, ShieldCheck, Lock, Gauge, Fuel, Info, MapPin, Clock, FileText, Upload, X
} from 'lucide-react';
import DataModalCarro from './DataModalCarro';
import { useToast } from '../../../Toast';

const API_BASE = 'https://welovepalop.com';

// ============================================================
// CONDUTOR PRINCIPAL
// ============================================================
const CondutorPrincipal = ({ condutor, updateCondutor }) => {
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
          <input
            type="tel"
            value={condutor.phone}
            onChange={(e) => updateCondutor('phone', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            placeholder="+238 991 23 45"
          />
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
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
            <Clock size={12} /> {t('hora_levantamento', 'Hora de levantamento')} *
          </label>
          <select
            value={condutor.hora_levantamento || '10:00'}
            onChange={(e) => updateCondutor('hora_levantamento', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 bg-white"
          >
            {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'].map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
            <Upload size={12} /> {t('carta_conducao_upload', 'Carta de condução')} *
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors cursor-pointer bg-slate-50/30">
            <input
              type="file"
              id="carta-conducao"
              accept=".pdf,.doc,.docx,image/*"
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
                  <p className="text-sm font-medium text-slate-600">{t('clique_upload', 'Clique para carregar o documento')}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{t('upload_limite', 'PDF ou Imagem')}</p>
                </>
              )}
            </label>
          </div>
        </div>

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
          <span className="text-xs text-slate-600 font-medium">{t('levantamento', 'Levantamento')}</span>
          <span className="text-xs font-bold text-blue-900">{formatarData(reserva?.checkIn)} - {reserva?.horaLevantamento || '10:00'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">{t('devolucao', 'Devolução')}</span>
          <span className="text-xs font-bold text-blue-900">{formatarData(reserva?.checkOut)} - {reserva?.horaLevantamento || '10:00'}</span>
        </div>
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
            <span className="text-slate-500">{t('subtotal_dias', { dias: reserva?.dias || 0, defaultValue: 'Subtotal' })}</span>
            <span className="text-slate-800">{formatNumber(reserva?.subtotal)} CVE</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <span className="text-base font-bold text-blue-900">{t('total', 'Total')}</span>
          <span className="text-xl font-bold text-blue-600">{formatNumber(precoTotal)} CVE</span>
        </div>
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDataModalOpen, setDataModalOpen] = useState(false);

  // Estados OTP (padrão do site)
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [enviandoOtp, setEnviandoOtp] = useState(false);
  const inputRefs = useRef([]);

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
    subtotal: reservaData?.subtotal || reservaData?.totalGeral || 0,
    totalGeral: reservaData?.totalGeral || 0,
    tipo: reservaData?.tipo || 'SUV',
    horaLevantamento: reservaData?.horaLevantamento || '10:00'
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setCondutor(prev => ({
          ...prev,
          nome_completo: userData.name || userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone || ''
        }));
      } catch (e) {
        console.error('Erro ao parsear utilizador:', e);
      }
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
  };

  const validateForm = () => {
    setError('');
    if (!condutor.nome_completo.trim()) {
      setError(t('erro_nome_obrigatorio', 'O nome completo é obrigatório.'));
      return false;
    }
    if (!condutor.email.trim()) {
      setError(t('erro_email_obrigatorio', 'O e-mail é obrigatório.'));
      return false;
    }
    if (!condutor.phone.trim()) {
      setError(t('erro_telefone_obrigatorio', 'O telefone é obrigatório.'));
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
    } catch (e) {
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

  const handleVerifyOtpAndProceed = async () => {
    const codigoCompleto = otpValues.join('');
    if (codigoCompleto.length < 6) {
      showToast(t('erro_codigo_incompleto', 'Por favor, insira o código completo de 6 dígitos'), 'error');
      return;
    }

    setLoadingOtp(true);
    try {
      const res = await fetch(`${API_BASE}/api/send_otp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_otp',
          email: condutor.email,
          otp: codigoCompleto
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowOtpModal(false);
        showToast(t('email_verificado_sucesso', 'Email verificado com sucesso!'), 'success');
        concluirReserva();
      } else {
        showToast(data.message || t('erro_codigo_invalido', 'Código inválido ou expirado.'), 'error');
      }
    } catch (e) {
      showToast(t('erro_conexao', 'Erro de conexão ao verificar código'), 'error');
    } finally {
      setLoadingOtp(false);
    }
  };

  const concluirReserva = () => {
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
      usuario: JSON.parse(localStorage.getItem('user') || 'null') || { email: condutor.email, nome: condutor.nome_completo }
    };

    sessionStorage.setItem('reservaCarroPendente', JSON.stringify(dadosReserva));

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

  const formatarData = (data) => {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

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
                  disabled={enviandoOtp || loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
                >
                  {(enviandoOtp || loading) ? <Loader size={18} className="animate-spin" /> : null}
                  {(enviandoOtp || loading) ? (t('processando', 'A processar...')) : (t('continuar_pagamento', 'Continuar para o pagamento'))} <ChevronRight size={18} />
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

export default CheckoutCarro;