// src/hooks/useCheckStock.js
import { useEffect, useRef, useState } from 'react';
import { checkStock } from '../services/checkoutApi';

/**
 * Devolve a disponibilidade real de um alojamento para um intervalo de datas.
 * - Debounce embutido (350ms) para não rebentar o backend.
 * - Cancela a chamada anterior quando datas mudam.
 */
export function useCheckStock({ alojamentoId, checkin, checkout, enabled = true }) {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null, // { modelo_venda, disponivel? , quartos?[] }
  });

  const abortRef = useRef(null);

  useEffect(() => {
    if (!enabled || !alojamentoId || !checkin || !checkout) {
      return;
    }

    const t = setTimeout(async () => {
      // Cancela pedido anterior
      if (abortRef.current) abortRef.current.cancelled = true;
      const myReq = { cancelled: false };
      abortRef.current = myReq;

      setState((s) => ({ ...s, loading: true, error: null }));

      const res = await checkStock({ alojamentoId, checkin, checkout });

      if (myReq.cancelled) return;

      if (res.ok) {
        setState({ loading: false, error: null, data: res.data });
      } else {
        setState({ loading: false, error: res.error, data: null });
      }
    }, 350);

    return () => clearTimeout(t);
  }, [alojamentoId, checkin, checkout, enabled]);

  return state;
}