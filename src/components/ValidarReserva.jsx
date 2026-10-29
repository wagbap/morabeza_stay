import { extrairCodigoReservaQR } from '../utils/codigoReservaQR';
import { useTranslation } from 'react-i18next';
import { validarReservaQR } from '../services/reservaValidacao';
import React, { useState, useEffect, useRef } from 'react';
import { QrCode, CheckCircle2, XCircle, Loader2, Camera, Keyboard, Search } from 'lucide-react';

const ValidarReserva = ({ contexto = 'admin' }) => {
  const { t } = useTranslation();
  const [aIniciar, setAIniciar] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const validarRef = useRef(null);
  const validarPendenteRef = useRef(false);
  const [modo, setModo] = useState('manual');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erroCamera, setErroCamera] = useState('');

  const videoRef = useRef(null);
  useEffect(() => {
    if (modo !== 'camera') return;
    let cancelado = false;
    let stream;
    let timer;
    let detector;
    let jsQR;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const parar = () => {
      clearTimeout(timer);
      stream?.getTracks().forEach(track => track.stop());
      const video = videoRef.current;
      if (video?.srcObject === stream) video.srcObject = null;
    };
    async function ler() {
      if (cancelado) return;
      const video = videoRef.current;
      let valor;
      try {
        if (video?.readyState >= 2 && video.videoWidth) {
          if (detector) {
            try { valor = (await detector.detect(video))[0]?.rawValue; }
            catch { detector = null; }
          }
          if (!detector) {
            jsQR ??= (await import('jsqr')).default;
            if (cancelado) return;
            const scale = Math.min(1, 720 / video.videoWidth);
            canvas.width = Math.round(video.videoWidth * scale);
            canvas.height = Math.round(video.videoHeight * scale);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frame = context.getImageData(0, 0, canvas.width, canvas.height);
            valor = jsQR(frame.data, frame.width, frame.height)?.data;
          }
        }
      } catch {
        if (!cancelado) { setErroCamera(t('qr_leitor_erro')); parar(); }
        return;
      }
      if (cancelado) return;
      if (valor?.trim()) {
        parar();
        setModo('manual');
        setCodigo(valor.trim());
        void validarRef.current(valor.trim());
        return;
      }
      timer = setTimeout(ler, 250);
    }
    async function iniciar() {
      setAIniciar(true);
      setErroCamera('');
      setResultado(null);
      try {
        if (!window.isSecureContext) throw { name: 'InsecureContext' };
        if (!navigator.mediaDevices?.getUserMedia) throw { name: 'UnsupportedCamera' };
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (cancelado) { parar(); return; }
        const video = videoRef.current;
        if (!video) { parar(); return; }
        video.srcObject = stream;
        await video.play();
        if (cancelado) { parar(); return; }
        if ('BarcodeDetector' in window) {
          try { detector = new window.BarcodeDetector({ formats: ['qr_code'] }); } catch { /* Use jsQR. */ }
        }
        setAIniciar(false);
        void ler();
      } catch (error) {
        parar();
        if (!cancelado) {
          const keys = { NotAllowedError: 'qr_permissao', SecurityError: 'qr_permissao', NotFoundError: 'qr_sem_camera', NotReadableError: 'qr_ocupada', InsecureContext: 'qr_https', UnsupportedCamera: 'qr_nao_suportada' };
          setErroCamera(t(keys[error.name] || 'qr_camera_erro'));
          setAIniciar(false);
        }
      }
    }
    void iniciar();
    return () => { cancelado = true; parar(); };
  }, [modo, tentativa, t]);

  async function validar(valorCodigo) {
    const cod = extrairCodigoReservaQR(valorCodigo !== undefined ? valorCodigo : codigo);
    if (!cod) { setResultado({ ok: false, mensagem: t('qr_conteudo_invalido') }); return; }
    if (!cod || validarPendenteRef.current) return;
    validarPendenteRef.current = true;

    setLoading(true);
    setResultado(null);
    setErroCamera('');

    try {
      const data = await validarReservaQR(cod, contexto);

      if (data.success) {
        setResultado({
          ok: true,
          mensagem: data.mensagem || t('qr_sucesso'),
          reserva: data.reserva || null
        });
      } else {
        setResultado({
          ok: false,
          mensagem: data.mensagem || t('qr_codigo_invalido'),
          reserva: data.reserva || null
        });
      }
    } catch (err) {
      const data = err.response?.data;
      const recusas = {
        BOOKING_NOT_FOUND: 'qr_reserva_nao_encontrada',
        ALREADY_VALIDATED: 'qr_ja_validado',
        BOOKING_BLOCKED: 'qr_reserva_bloqueada',
        BOOKING_NOT_CONFIRMED: 'qr_reserva_nao_confirmada',
        PAYMENT_REQUIRED: 'qr_pagamento_pendente',
        OUTSIDE_BOOKING_DATES: 'qr_fora_datas',
        AMBIGUOUS_CODE: 'qr_codigo_duplicado',
      };
      const key = recusas[data?.code];
      const technical = {
        AUTH_REQUIRED: contexto === 'host' ? 'qr_sessao_anfitriao' : 'qr_sessao_expirada',
        HOST_AUTH_UNAVAILABLE: 'qr_auth_anfitriao_indisponivel',
        SCHEMA_MISSING: 'qr_instalar_sql',
        CONFIG_MISSING: 'qr_config_ausente',
      };
      setResultado({
        ok: false,
        erro: !key,
        encontrada: data?.found === true,
        reserva: data?.reserva || null,
        mensagem: t(key || technical[data?.code] || (err.response?.status === 404 ? 'qr_api_ausente' : 'qr_rede')),
      });
    } finally {
      validarPendenteRef.current = false;
      setLoading(false);
    }
  }

  useEffect(() => { validarRef.current = validar; });

  function handleAtivarCamera() {
    setModo('camera');
    setTentativa(value => value + 1);
  }

  function handleCancelarCamera() {
    setModo('manual');
    setErroCamera('');
  }

  function handleReset() {
    setResultado(null);
    setCodigo('');
  }

  return (
    <div className="w-full min-w-0 max-w-3xl mx-auto px-2 py-4 sm:px-4 sm:py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#003580] p-2.5 rounded-xl text-white">
            <QrCode size={22}  />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">{t('qr_titulo')}</h1>
        </div>
        <p className="text-sm text-gray-500">
          {t('qr_descricao')}
        </p>
      </div>

      <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={handleCancelarCamera}
          className={
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ' +
            (modo === 'manual' ? 'bg-white text-[#003580] shadow-sm' : 'text-gray-500 hover:text-gray-800')
          }
        >
          <Keyboard size={16} /> {t('qr_manual')}
        </button>
        <button
          onClick={handleAtivarCamera}
          className={
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ' +
            (modo === 'camera' ? 'bg-white text-[#003580] shadow-sm' : 'text-gray-500 hover:text-gray-800')
          }
        >
          <Camera size={16} /> {t('qr_camera')}
        </button>
      </div>

      {modo === 'manual' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
            {t('qr_codigo')}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={codigo}
              onChange={function (e) { setCodigo(e.target.value); }}
              onKeyDown={function (e) { if (e.key === 'Enter') validar(); }}
              placeholder={t('qr_placeholder')}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/30 focus:border-[#003580]"
              autoFocus
            />
            <button
              onClick={function () { validar(); }}
              disabled={loading || !codigo.trim()}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#003580] text-white rounded-xl text-sm font-semibold hover:bg-[#002a66] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? t('qr_validando') : t('qr_validar')}
            </button>
          </div>
        </div>
      )}

      {modo === 'camera' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-square max-w-sm mx-auto">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            {aIniciar && <div role="status" className="absolute inset-0 flex items-center justify-center bg-black/60 text-white"><Loader2 size={28} className="animate-spin" /><span className="sr-only">{t('qr_a_iniciar')}</span></div>}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[60%] aspect-square border-4 border-white/80 rounded-2xl shadow-lg" />
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-4">
            {t('qr_apontar')}
          </p>
          <button
            onClick={handleCancelarCamera}
            className="mt-4 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            {t('qr_cancelar')}
          </button>
        </div>
      )}

      {erroCamera && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          {erroCamera}
          {modo === 'camera' && <button type="button" onClick={handleAtivarCamera} className="mt-2 block min-h-11 font-semibold underline">{t('qr_tentar')}</button>}
        </div>
      )}

      {resultado && (
        <div className={
          'mt-6 rounded-2xl border p-5 ' +
          (resultado.ok ? 'bg-emerald-50 border-emerald-200' : resultado.encontrada ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200')
        }>
          <div className="flex items-start gap-3">
            {resultado.ok ? (
              <span className="shrink-0 text-emerald-600"><CheckCircle2 size={22} /></span>
            ) : (
              <span className="shrink-0 text-red-600"><XCircle size={22} /></span>
            )}
            <div className="flex-1">
              <h3 className={'font-bold ' + (resultado.ok ? 'text-emerald-700' : resultado.encontrada ? 'text-amber-800' : 'text-red-700')}>
                {resultado.ok ? t('qr_valida') : resultado.erro ? t('qr_validacao_indisponivel') : resultado.encontrada ? t('qr_checkin_indisponivel') : t('qr_invalida')}
              </h3>
              <p className="text-sm text-gray-700 mt-1">{resultado.mensagem}</p>

              {resultado.reserva && (
                <div className="mt-3 bg-white/70 rounded-lg p-3 text-xs text-gray-700 space-y-1">
                  {resultado.reserva.status && <p>{t('qr_estado_atual')}: {resultado.reserva.status}</p>}
                  {resultado.reserva.pagamento_status && <p>{t('qr_estado_pagamento')}: {resultado.reserva.pagamento_status}</p>}
                  {resultado.reserva.cliente && (
                    <p>{t('qr_cliente')} {resultado.reserva.cliente}</p>
                  )}
                  {resultado.reserva.tipo && (
                    <p>{t('qr_tipo')} {resultado.reserva.tipo}</p>
                  )}
                  {resultado.reserva.data && (
                    <p>{t('qr_data')} {resultado.reserva.data}</p>
                  )}
                  {resultado.reserva.codigo && (
                    <p>{t('qr_codigo_label')} {resultado.reserva.codigo}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="mt-4 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            {t('qr_outro')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ValidarReserva;