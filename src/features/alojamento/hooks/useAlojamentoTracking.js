import { useEffect, useRef, useCallback } from 'react';
import { requestApiJson } from '../../../services/apiJson';

const useAlojamentoTracking = (alojamentoId, usuarioId = null) => {
  const sessionRef = useRef(null);
  const usuarioIdRef = useRef(usuarioId);
  const transportRef = useRef({ disabled: false, nextAttempt: 0, warned: false });

  useEffect(() => {
    usuarioIdRef.current = usuarioId;
  }, [usuarioId]);

  const registrarEvento = useCallback(async (session, tipo, dados = {}) => {
    const transport = transportRef.current;
    if (!session?.id || transport.disabled || Date.now() < transport.nextAttempt) return false;
    try {
      const result = await requestApiJson(
        import.meta.env.VITE_ALOJAMENTO_TRACKING_URL || '/tracking/registrar_alojamento.php',
        {
          baseURL: import.meta.env.VITE_API_URL || 'https://welovepalop.com/api',
          method: 'POST',
          retries: 0, // Repeating a POST could count an event twice.
          adapter: 'fetch',
          fetchOptions: { keepalive: true },
          data: {
            alojamento_id: session.id,
            usuario_id: usuarioIdRef.current,
            tipo,
            ...dados,
          },
        },
      );
      if (!result?.success) throw new Error('Tracking rejected by server');
      return true;
    } catch (error) {
      const status = error.response?.status;
      if (status === 404 || status === 410) transport.disabled = true;
      transport.nextAttempt = Date.now() + 60000;
      if (!transport.warned) {
        console.warn(
          status === 404 || status === 410
            ? 'Tracking de alojamentos indispon\u00edvel: endpoint n\u00e3o encontrado no servidor.'
            : 'Tracking de alojamentos indispon\u00edvel: verificar rede, CORS e resposta do servidor.',
        );
        transport.warned = true;
      }
      return false;
    }
  }, []);

  const registrarVisualizacao = useCallback(async () => {
    const session = sessionRef.current;
    if (!session || session.viewSent || session.viewPending) return;
    session.viewPending = true;
    try {
      session.viewSent = await registrarEvento(session, 'view');
    } finally {
      session.viewPending = false;
    }
  }, [registrarEvento]);

  const registrarCliqueReserva = useCallback(() => {
    return registrarEvento(sessionRef.current, 'click_reserva');
  }, [registrarEvento]);

  const registrarCliqueContato = useCallback(() => {
    return registrarEvento(sessionRef.current, 'click_contato');
  }, [registrarEvento]);

  const registrarVisualizacaoMapa = useCallback(() => {
    return registrarEvento(sessionRef.current, 'view_mapa');
  }, [registrarEvento]);

  useEffect(() => {
    if (!alojamentoId) return;
    // Capture the session so cleanup never sends the previous duration to a new ID.
    const session = {
      id: alojamentoId,
      startedAt: Date.now(),
      viewSent: false,
      viewPending: false,
      durationPending: false,
      lastDuration: 0,
    };
    sessionRef.current = session;

    const enviarTempo = async () => {
      if (!session.viewSent || session.durationPending) return;
      const seconds = Math.floor((Date.now() - session.startedAt) / 1000);
      if (seconds < 5 || seconds <= session.lastDuration) return;
      session.durationPending = true;
      try {
        if (await registrarEvento(session, 'tempo_permanencia', { tempo_segundos: seconds })) {
          session.lastDuration = seconds;
        }
      } finally {
        session.durationPending = false;
      }
    };

    // StrictMode cancels the first setup before any network request is sent.
    const viewTimer = setTimeout(() => { void registrarVisualizacao(); }, 0);
    const heartbeat = setInterval(() => {
      if (document.visibilityState === 'visible') {
        if (!session.viewSent) void registrarVisualizacao();
        else void enviarTempo();
      }
    }, 30000);
    const onHidden = () => {
      if (document.visibilityState === 'hidden') void enviarTempo();
    };
    window.addEventListener('pagehide', enviarTempo);
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      clearTimeout(viewTimer);
      clearInterval(heartbeat);
      void enviarTempo();
      window.removeEventListener('pagehide', enviarTempo);
      document.removeEventListener('visibilitychange', onHidden);
      if (sessionRef.current === session) sessionRef.current = null;
    };
  }, [alojamentoId, registrarEvento, registrarVisualizacao]);

  return {
    registrarCliqueReserva,
    registrarCliqueContato,
    registrarVisualizacaoMapa,
    registrarVisualizacao,
  };
};

export default useAlojamentoTracking;
