import { useEffect, useState } from 'react';
import { requestApiJson } from '../services/apiJson';

import { filtrarCarrosAprovados } from '../features/carros/utils/publicacaoCarro';
import { completarDadosCardAlojamento } from '../features/alojamento/utils/quartosAlojamento';

const vazio = { alojamentos: [], carros: [], experiencias: [] };

export default function useDestaques() {
  const [data, setData] = useState(vazio);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function carregar() {
      setLoading(true);
      setError(false);
      try {
        const [destaques, catalogo] = await Promise.allSettled([
          requestApiJson('/alojamento/destaques.php', { signal: controller.signal }),
          requestApiJson('/get_alojamentos.php', { signal: controller.signal }),
        ]);
        if (destaques.status !== 'fulfilled') throw destaques.reason;
        const response = destaques.value;
        if (response?.success !== true || !response.data ||
            !Object.keys(vazio).every(key => Array.isArray(response.data[key]))) {
          throw new Error('Invalid featured listings response');
        }
        if (!controller.signal.aborted) {
          const next = Object.fromEntries(Object.keys(vazio).map(key => [key, (key === 'carros' ? filtrarCarrosAprovados(response.data[key]) : response.data[key]).slice(0, 3)]));
          if (catalogo.status === 'fulfilled') next.alojamentos = completarDadosCardAlojamento(next.alojamentos, catalogo.value);
          setData(next);
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void carregar();
    return () => controller.abort();
  }, [attempt]);

  return { ...data, loading, error, retry: () => setAttempt(value => value + 1) };
}
