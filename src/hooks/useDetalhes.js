// hooks/useDetalhes.js
import { useState, useEffect } from 'react';
import api from '../api/api';

const useDetalhes = (tipo, id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tipo || !id) {
      setError('Parâmetros inválidos');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchDetalhes = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: result } = await api.get('/admin/get_detalhes.php', {
          params: { tipo, id },
          signal: controller.signal,
        });
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Erro ao carregar dados');
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Erro:', err);
        setError('Erro de conexão com o servidor');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchDetalhes();
    return () => controller.abort();
  }, [tipo, id]);

  return { data, loading, error };
};

export default useDetalhes;
