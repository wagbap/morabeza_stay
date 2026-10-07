// src/features/alojamento/hooks/useLibertarStock.js
// ============================================================
// 🧹 Hook — libertar stock (inteiro ou por quarto)
// ============================================================
import { useState, useCallback } from 'react';
import { alojamentoApi } from '../services/alojamentoApi';

export function useLibertarStock() {
  const [aLibertar, setALibertar] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  const libertarInteiro = useCallback(async (alojamentoId) => {
    if (!alojamentoId) {
      setErro('ID do alojamento em falta');
      return { success: false, error: 'ID em falta' };
    }

    setALibertar(true);
    setErro(null);
    setResultado(null);

    try {
      const data = await alojamentoApi.libertarAlojamentoInteiro(alojamentoId);
      if (!data.success) {
        setErro(data.error || 'Erro ao libertar');
      } else {
        setResultado(data);
      }
      return data;
    } catch (err) {
      setErro(err.message);
      return { success: false, error: err.message };
    } finally {
      setALibertar(false);
    }
  }, []);

  const limparEstado = useCallback(() => {
    setResultado(null);
    setErro(null);
  }, []);

  return {
    aLibertar,
    resultado,
    erro,
    libertarInteiro,
    limparEstado,
  };
}