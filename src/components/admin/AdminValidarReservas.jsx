import React, { useState, useEffect, useRef } from 'react';
import { QrCode, CheckCircle2, XCircle, Loader2, Camera, Keyboard, Search } from 'lucide-react';

const AdminValidarReservas = () => {
  const [modo, setModo] = useState('manual');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erroCamera, setErroCamera] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      pararCamera();
    };
  }, []);

  function pararCamera() {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].stop();
      }
      streamRef.current = null;
    }
  }

  async function iniciarCamera() {
    setErroCamera('');
    setResultado(null);

    if (!('BarcodeDetector' in window)) {
      setErroCamera('O teu navegador nao suporta leitura automatica de QR. Usa o modo manual.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });

      scanIntervalRef.current = setInterval(async function () {
        if (!videoRef.current || !detectorRef.current) return;
        try {
          const codes = await detectorRef.current.detect(videoRef.current);
          if (codes && codes.length > 0) {
            const valor = codes[0].rawValue;
            pararCamera();
            setModo('manual');
            setCodigo(valor);
            validar(valor);
          }
        } catch (errLeitura) {
          // ignora frames vazios
        }
      }, 500);
    } catch (err) {
      setErroCamera('Nao foi possivel aceder a camara. Verifica as permissoes.');
    }
  }

  async function validar(valorCodigo) {
    const cod = (valorCodigo !== undefined ? valorCodigo : codigo).trim();
    if (!cod) return;

    setLoading(true);
    setResultado(null);
    setErroCamera('');

    try {
      const res = await fetch('/api/admin/validar-reserva.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: cod })
      });
      const data = await res.json();

      if (data.success) {
        setResultado({
          ok: true,
          mensagem: data.mensagem || 'Reserva valida!',
          reserva: data.reserva || null
        });
      } else {
        setResultado({
          ok: false,
          mensagem: data.mensagem || 'Codigo invalido ou ja utilizado.',
          reserva: data.reserva || null
        });
      }
    } catch (err) {
      setResultado({
        ok: false,
        mensagem: 'Erro ao comunicar com o servidor. Tenta novamente.'
      });
    } finally {
      setLoading(false);
    }
  }

  function handleAtivarCamera() {
    setModo('camera');
    setTimeout(function () {
      iniciarCamera();
    }, 100);
  }

  function handleCancelarCamera() {
    pararCamera();
    setModo('manual');
    setErroCamera('');
  }

  function handleReset() {
    setResultado(null);
    setCodigo('');
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#003580] p-2.5 rounded-xl">
            <QrCode size={22} className="text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Validar Reserva</h1>
        </div>
        <p className="text-sm text-gray-500">
          Le o QR Code do cliente ou introduz o codigo manualmente para validar a reserva.
        </p>
      </div>

      <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={function () { pararCamera(); setModo('manual'); }}
          className={
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ' +
            (modo === 'manual' ? 'bg-white text-[#003580] shadow-sm' : 'text-gray-500 hover:text-gray-800')
          }
        >
          <Keyboard size={16} /> Manual
        </button>
        <button
          onClick={handleAtivarCamera}
          className={
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ' +
            (modo === 'camera' ? 'bg-white text-[#003580] shadow-sm' : 'text-gray-500 hover:text-gray-800')
          }
        >
          <Camera size={16} /> Camara
        </button>
      </div>

      {modo === 'manual' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
            Codigo da Reserva
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={codigo}
              onChange={function (e) { setCodigo(e.target.value); }}
              onKeyDown={function (e) { if (e.key === 'Enter') validar(); }}
              placeholder="Ex: MOR-2026-XXXXXX"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/30 focus:border-[#003580]"
              autoFocus
            />
            <button
              onClick={function () { validar(); }}
              disabled={loading || !codigo.trim()}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#003580] text-white rounded-xl text-sm font-semibold hover:bg-[#002a66] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? 'A validar...' : 'Validar'}
            </button>
          </div>
        </div>
      )}

      {modo === 'camera' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-square max-w-sm mx-auto">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-4 border-white/80 rounded-2xl shadow-lg" />
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-4">
            Aponta a camara para o QR Code do cliente.
          </p>
          <button
            onClick={handleCancelarCamera}
            className="mt-4 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      )}

      {erroCamera && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          {erroCamera}
        </div>
      )}

      {resultado && (
        <div className={
          'mt-6 rounded-2xl border p-5 ' +
          (resultado.ok ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200')
        }>
          <div className="flex items-start gap-3">
            {resultado.ok ? (
              <CheckCircle2 size={22} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle size={22} className="text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className={'font-bold ' + (resultado.ok ? 'text-emerald-700' : 'text-red-700')}>
                {resultado.ok ? 'Reserva valida' : 'Reserva invalida'}
              </h3>
              <p className="text-sm text-gray-700 mt-1">{resultado.mensagem}</p>

              {resultado.reserva && (
                <div className="mt-3 bg-white/70 rounded-lg p-3 text-xs text-gray-700 space-y-1">
                  {resultado.reserva.cliente && (
                    <p>Cliente: {resultado.reserva.cliente}</p>
                  )}
                  {resultado.reserva.tipo && (
                    <p>Tipo: {resultado.reserva.tipo}</p>
                  )}
                  {resultado.reserva.data && (
                    <p>Data: {resultado.reserva.data}</p>
                  )}
                  {resultado.reserva.codigo && (
                    <p>Codigo: {resultado.reserva.codigo}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="mt-4 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Validar outro codigo
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminValidarReservas;