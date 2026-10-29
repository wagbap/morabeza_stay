import { useEffect, useState } from 'react';
import { requestApiJson } from '../services/apiJson';

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
        const response = await requestApiJson('/alojamento/destaques.php', { signal: controller.signal });
        if (response?.success !== true || !response.data ||
            !Object.keys(vazio).every(key => Array.isArray(response.data[key]))) {
          throw new Error('Invalid featured listings response');
        }
        if (!controller.signal.aborted) {
          setData(Object.fromEntries(Object.keys(vazio).map(key => [key, response.data[key].slice(0, 3)])));
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
