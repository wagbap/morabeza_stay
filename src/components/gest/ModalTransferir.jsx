// src/components/gest/ModalTransferir.jsx
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { X, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const API_BASE = 'https://welovepalop.com';

const ModalTransferir = memo(function ModalTransferir({
  experienciaId,
  onClose,
  onSuccess
}) {
  // data local calculada 1x
  const hoje = useRef(new Date().toISOString().split('T')[0]).current;

  const [de, setDe] = useState(hoje);
  const [para, setPara] = useState(hoje);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const abortRef = useRef(null);

  // cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleClose = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    onClose?.();
  }, [onClose]);

  const transferir = useCallback(async () => {
    if (!de || !para) { setErro('Preencha as duas datas'); return; }
    if (de === para) { setErro('As datas têm de ser diferentes'); return; }

    setEnviando(true);
    setErro('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/api/transferir_sessoes.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experiencia_id: Number(experienciaId),
          data_origem: de,
          data_destino: para
        }),
        signal: controller.signal
      });
      const data = await res.json();
      if (data.success) {
        onSuccess?.();
      } else {
        setErro(data.error || 'Erro ao transferir');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setErro('Erro de conexão');
      }
    } finally {
      setEnviando(false);
      abortRef.current = null;
    }
  }, [de, para, experienciaId, onSuccess]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0,0,0,0.45)',
        // sem backdrop-blur → muito mais rápido
        willChange: 'opacity'
      }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-left"
        style={{ willChange: 'transform' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ArrowRight size={18} className="text-blue-600" />
            Transferir dia
          </h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Move todas as sessões (e reservas associadas) de uma data para outra.
        </p>

        {erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 font-medium">{erro}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Data de origem
            </label>
            <input
              type="date"
              value={de}
              onChange={(e) => setDe(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Data de destino
            </label>
            <input
              type="date"
              value={para}
              onChange={(e) => setPara(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-slate-100">
          <button
            onClick={handleClose}
            disabled={enviando}
            type="button"
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={transferir}
            disabled={enviando}
            type="button"
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {enviando ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                A transferir...
              </>
            ) : (
              <>
                <ArrowRight size={12} />
                Transferir
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default ModalTransferir;