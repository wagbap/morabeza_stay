// hooks/useAlojamentoTracking.js
import { useEffect, useRef, useCallback } from 'react';

const useAlojamentoTracking = (alojamentoId, usuarioId = null) => {
  const startTimeRef = useRef(Date.now());
  const hasRegisteredView = useRef(false);
  const intervalRef = useRef(null);

  // ✅ Manter alojamentoId e usuarioId em refs para acesso dentro dos callbacks
  const alojamentoIdRef = useRef(alojamentoId);
  const usuarioIdRef = useRef(usuarioId);

  useEffect(() => {
    alojamentoIdRef.current = alojamentoId;
  }, [alojamentoId]);

  useEffect(() => {
    usuarioIdRef.current = usuarioId;
  }, [usuarioId]);

  // ✅ Função interna instável — guardada numa ref
  const registrarEvento = useCallback(async (tipo, dadosAdicionais = {}) => {
    const id = alojamentoIdRef.current;
    if (!id) {
      console.log('⚠️ Sem alojamentoId, ignorando tracking');
      return;
    }

    const payload = {
      alojamento_id: id,
      tipo: tipo,
      usuario_id: usuarioIdRef.current,
      ...dadosAdicionais
    };

    try {
      const response = await fetch('https://welovepalop.com/api/tracking/registrar_alojamento.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!data.success) {
        console.error(`Erro ao registrar ${tipo}:`, data.message);
      } else {
        console.log(`✅ Evento registrado: ${tipo} para alojamento ${id}`);
      }
    } catch (error) {
      console.error(`Erro na requisição para ${tipo}:`, error);
    }
  }, []); // ✅ VAZIO — usa refs internamente

  // ✅ Manter a função numa ref para que os callbacks públicos sejam estáveis
  const registrarEventoRef = useRef(registrarEvento);
  useEffect(() => {
    registrarEventoRef.current = registrarEvento;
  }, [registrarEvento]);

  // ✅ Callbacks públicos com dependências VAZIAS — referências nunca mudam
  const registrarVisualizacao = useCallback(() => {
    if (!hasRegisteredView.current && alojamentoIdRef.current) {
      registrarEventoRef.current('view');
      hasRegisteredView.current = true;
    }
  }, []); // ✅ VAZIO

  const registrarCliqueReserva = useCallback(() => {
    registrarEventoRef.current('click_reserva');
  }, []);

  const registrarCliqueContato = useCallback(() => {
    registrarEventoRef.current('click_contato');
  }, []);

  const registrarVisualizacaoMapa = useCallback(() => {
    registrarEventoRef.current('view_mapa');
  }, []);

  const registrarTempoPermanencia = useCallback(() => {
    if (!hasRegisteredView.current) return;

    const tempoTotal = Math.floor((Date.now() - startTimeRef.current) / 1000);
    if (tempoTotal >= 5) {
      registrarEventoRef.current('tempo_permanencia', { tempo_segundos: tempoTotal });
    }
  }, []); // ✅ VAZIO

  const iniciarHeartbeat = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (hasRegisteredView.current && document.visibilityState === 'visible') {
        const tempoDecorrido = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (tempoDecorrido % 30 === 0 && tempoDecorrido > 0) {
          registrarEventoRef.current('tempo_permanencia', { tempo_segundos: tempoDecorrido });
        }
      }
    }, 30000);
  }, []); // ✅ VAZIO

  // ✅ useEffect principal: só depende de alojamentoId
  useEffect(() => {
    if (!alojamentoId) return;

    // Reset quando o alojamento muda
    hasRegisteredView.current = false;
    startTimeRef.current = Date.now();

    registrarVisualizacao();
    iniciarHeartbeat();

    const handleBeforeUnload = () => {
      registrarTempoPermanencia();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        registrarTempoPermanencia();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      registrarTempoPermanencia();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // ✅ Todas as funções usadas têm deps [] — estáveis
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alojamentoId]);

  return {
    registrarCliqueReserva,
    registrarCliqueContato,
    registrarVisualizacaoMapa,
    registrarVisualizacao
  };
};

export default useAlojamentoTracking;