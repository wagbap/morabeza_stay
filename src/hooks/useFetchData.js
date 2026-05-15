import { useState, useEffect } from 'react';
import { getAlojamentos, getCarros, getExperiencias } from '../api/api';

export const useFetchData = () => {
  const [data, setData] = useState({ alojamentos: [], carros: [], experiencias: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [aloj, car, exp] = await Promise.all([
          getAlojamentos(), getCarros(), getExperiencias()
        ]);
        setData({
          alojamentos: aloj.data,
          carros: car.data,
          experiencias: exp.data
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  return { ...data, loading };
};