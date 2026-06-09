// hooks/useDetalhes.js
import { useState, useEffect } from 'react';

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

    const fetchDetalhes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/get_detalhes.php?tipo=${tipo}&id=${id}`);
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Erro ao carregar dados');
        }
      } catch (err) {
        console.error('Erro:', err);
        setError('Erro de conexão com o servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchDetalhes();
  }, [tipo, id]);

  return { data, loading, error };
};

export default useDetalhes;