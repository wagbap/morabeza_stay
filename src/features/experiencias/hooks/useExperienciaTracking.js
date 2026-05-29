import { useEffect, useRef, useCallback } from 'react';

const useExperienciaTracking = (experienciaId, usuarioId = null) => {
  const startTimeRef = useRef(Date.now());
  const hasRegisteredView = useRef(false);
  const intervalRef = useRef(null);
  
  const registrarEvento = useCallback(async (tipo, dadosAdicionais = {}) => {
    if (!experienciaId) return;
    
    const payload = {
      experiencia_id: experienciaId,
      tipo: tipo,
      usuario_id: usuarioId,
      ...dadosAdicionais
    };
    
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiUrl = isDevelopment 
      ? '/api/tracking/registrar_experiencia.php'
      : 'https://welovepalop.com/api/tracking/registrar_experiencia.php';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!data.success) {
        console.error(`Erro ao registrar ${tipo}:`, data.message);
      }
    } catch (error) {
      console.error(`Erro na requisição para ${tipo}:`, error);
    }
  }, [experienciaId, usuarioId]);
  
  const registrarVisualizacao = useCallback(() => {
    if (!hasRegisteredView.current && experienciaId) {
      registrarEvento('view');
      hasRegisteredView.current = true;
    }
  }, [registrarEvento, experienciaId]);
  
  const registrarCliqueReserva = useCallback(() => {
    registrarEvento('click_reserva');
  }, [registrarEvento]);
  
  const registrarCliqueGuia = useCallback(() => {
    registrarEvento('click_contato_guia');
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
    if (experienciaId) {
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
  }, [experienciaId]);
  
  return {
    registrarCliqueReserva,
    registrarCliqueGuia,
    registrarVisualizacaoMapa,
    registrarVisualizacao
  };
};

export default useExperienciaTracking;