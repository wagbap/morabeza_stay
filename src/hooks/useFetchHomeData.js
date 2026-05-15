import { useState, useEffect } from 'react';
import api from '../api/api';

export const useFetchHomeData = () => {
  const [data, setData] = useState({ alojamentos: [], carros: [], experiencias: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [alojRes, carrosRes, expRes] = await Promise.all([
          api.get('/get_alojamentos.php'),
          api.get('/get_carro.php'),
          api.get('/get_experiencias.php')
        ]);

        setData({
          alojamentos: Array.isArray(alojRes.data) ? alojRes.data : alojRes.data?.data || [],
          carros: Array.isArray(carrosRes.data) ? carrosRes.data : carrosRes.data?.data || [],
          experiencias: Array.isArray(expRes.data) ? expRes.data : expRes.data?.data || []
        });
      } catch (err) {
        console.error("Erro na API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  return { ...data, loading };
};