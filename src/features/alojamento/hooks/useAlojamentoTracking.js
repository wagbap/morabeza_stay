// hooks/useAlojamentoTracking.js
import { useEffect, useRef, useCallback } from 'react';

const useAlojamentoTracking = (alojamentoId, usuarioId = null) => {
  const startTimeRef = useRef(Date.now());
  const hasRegisteredView = useRef(false);
  const intervalRef = useRef(null);
  
  const registrarEvento = useCallback(async (tipo, dadosAdicionais = {}) => {
    if (!alojamentoId) {
      console.log('⚠️ Sem alojamentoId, ignorando tracking');
      return;
    }
    
    // Usar a API CORRETA para alojamentos
    const payload = {
      alojamento_id: alojamentoId,  // Mudado de experiencia_id para alojamento_id
      tipo: tipo,
      usuario_id: usuarioId,
      ...dadosAdicionais
    };
    
    try {
      const response = await fetch('https://welovepalop.com/api/tracking/registrar.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!data.success) {
        console.error(`Erro ao registrar ${tipo}:`, data.message);
      } else {
        console.log(`✅ Evento registrado: ${tipo} para alojamento ${alojamentoId}`);
      }
    } catch (error) {
      console.error(`Erro na requisição para ${tipo}:`, error);
    }
  }, [alojamentoId, usuarioId]);
  
  const registrarVisualizacao = useCallback(() => {
    if (!hasRegisteredView.current && alojamentoId) {
      registrarEvento('view');
      hasRegisteredView.current = true;
    }
  }, [registrarEvento, alojamentoId]);
  
  const registrarCliqueReserva = useCallback(() => {
    registrarEvento('click_reserva');
  }, [registrarEvento]);
  
  const registrarCliqueContato = useCallback(() => {
    registrarEvento('click_contato');
  }, [registrarEvento]);
  
  const registrarVisualizacaoMapa = useCallback(() => {
    registrarEvento('view_mapa');
  }, [registrarEvento]);
  
  const registrarTempoPermanencia = useCallback(() => {
    if (!hasRegisteredView.current) return;
    
    const tempoTotal = Math.floor((Date.now() - startTimeRef.current) / 1000);
    if (tempoTotal >= 5) {
      registrarEvento('tempo_permanencia', { tempo_segundos: tempoTotal });
    }
  }, [registrarEvento]);
  
  const iniciarHeartbeat = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      if (hasRegisteredView.current && document.visibilityState === 'visible') {
        const tempoDecorrido = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (tempoDecorrido % 30 === 0 && tempoDecorrido > 0) {
          registrarEvento('tempo_permanencia', { tempo_segundos: tempoDecorrido });
        }
      }
    }, 30000);
  }, [registrarEvento]);
  
  useEffect(() => {
    if (alojamentoId) {
      registrarVisualizacao();
      iniciarHeartbeat();
    }
    
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
      if (intervalRef.current) clearInterval(intervalRef.current);
      registrarTempoPermanencia();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [alojamentoId]);
  
  return {
    registrarCliqueReserva,
    registrarCliqueContato,
    registrarVisualizacaoMapa,
    registrarVisualizacao
  };
};

export default useAlojamentoTracking;