import { useState, useEffect } from 'react';
import { requestApiJson } from '../services/apiJson';

const SOURCES = {
  alojamentos: '/get_alojamentos.php',
  carros: '/get_carro.php',
  experiencias: '/get_experiencias.php',
};

export const useFetchHomeData = () => {
  const [data, setData] = useState({ alojamentos: [], carros: [], experiencias: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchAllData = async () => {
      const results = await Promise.allSettled(Object.values(SOURCES).map(url =>
        requestApiJson(url, { signal: controller.signal })
      ));
      if (controller.signal.aborted) return;
      const next = {};
      Object.keys(SOURCES).forEach((key, index) => {
        const result = results[index];
        if (result.status === 'fulfilled') {
          const list = Array.isArray(result.value) ? result.value : result.value?.data;
          next[key] = Array.isArray(list) ? list : [];
        } else {
          next[key] = [];
          console.warn(`API indisponivel: ${key}`, { status: result.reason?.response?.status || null });
        }
      });
      setData(next);
      setLoading(false);
    };
    void fetchAllData();
    return () => controller.abort();
  }, []);

  return { ...data, loading };
};
