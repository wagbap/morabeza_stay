import { useEffect, useRef, useCallback } from 'react';

const useCarroTracking = (carroId, usuarioId = null) => {
  const startTimeRef = useRef(Date.now());
  const hasRegisteredView = useRef(false);
  const intervalRef = useRef(null);
  
  const registrarEvento = useCallback(async (tipo, dadosAdicionais = {}) => {
    if (!carroId) {
      console.log(`⚠️ Tracking ignorado: carroId é ${carroId}`);
      return;
    }
    
    const payload = {
      carro_id: carroId,
      tipo: tipo,
      usuario_id: usuarioId,
      ...dadosAdicionais
    };
    
    console.log(`📤 Enviando evento: ${tipo} para carro ${carroId}`, payload);
    
    // Usar API de teste primeiro
    const apiUrl = 'https://welovepalop.com/api/tracking/registrar_carro.php';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log(`✅ Resposta da API:`, data);
      
      if (!data.success) {
        console.error(`❌ Erro ao registrar ${tipo}:`, data.message);
      }
    } catch (error) {
      console.error(`❌ Erro na requisição para ${tipo}:`, error);
    }
  }, [carroId, usuarioId]);
  
  const registrarVisualizacao = useCallback(() => {
    console.log(`👁️ Registrar visualização chamado, carroId: ${carroId}, hasRegisteredView: ${hasRegisteredView.current}`);
    if (!hasRegisteredView.current && carroId) {
      registrarEvento('view');
      hasRegisteredView.current = true;
    } else {
      console.log(`⏭️ Visualização ignorada: ${!carroId ? 'sem carroId' : 'já registrada'}`);
    }
  }, [registrarEvento, carroId]);
  
  const registrarCliqueReserva = useCallback(() => {
    console.log(`🖱️ Clique reserva para carro ${carroId}`);
    registrarEvento('click_reserva');
  }, [registrarEvento]);
  
  const registrarVisualizacaoMapa = useCallback(() => {
    console.log(`🗺️ Visualização mapa para carro ${carroId}`);
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
    console.log(`🔄 useEffect do tracking executado, carroId: ${carroId}`);
    if (carroId) {
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
  }, [carroId]); // ADICIONAR carroId como dependência
  
  return {
    registrarCliqueReserva,
    registrarVisualizacaoMapa,
    registrarVisualizacao
  };
};

export default useCarroTracking;