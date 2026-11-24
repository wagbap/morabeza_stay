import { useEffect, useState } from 'react';
import api from '../../../api/api';
import { dataLocalCarro } from '../utils/disponibilidadeCarro';

export default function useDisponibilidadeCarro(carroId, inicio, fim) {
  const checkin = inicio ? dataLocalCarro(inicio) : '';
  const checkout = fim ? dataLocalCarro(fim) : '';
  const key = JSON.stringify([carroId, checkin, checkout]);
  const [resultado, setResultado] = useState(null);
  useEffect(() => {
    let request;
    let fechado = false;
    const atualizar = async () => {
      request?.abort();
      const controller = new AbortController();
      request = controller;
      if (!carroId || Boolean(checkin) !== Boolean(checkout)) return;
      setResultado({ key, estado: 'loading', total: 0 });
      try {
        const { data } = await api.get('/verificar_disponibilidade_carro.php', {
          params: { carro_id: carroId, ...(checkin && checkout ? { checkin, checkout } : {}), quantidade: 1 },
          signal: controller.signal,
          timeout: 10000,
        });
        const total = data.vagas_restantes;
        if (data.success !== true || !Number.isInteger(total) || total < 0 || typeof data.disponivel !== 'boolean') throw new Error('Invalid stock response');
        if (!fechado && !controller.signal.aborted) setResultado({ key, estado: 'ready', total });
      } catch {
        if (!fechado && !controller.signal.aborted) setResultado({ key, estado: 'error', total: 0 });
      }
    };
    void atualizar();
    const timer = setInterval(atualizar, 30000);
    window.addEventListener('focus', atualizar);
    return () => { fechado = true; request?.abort(); clearInterval(timer); window.removeEventListener('focus', atualizar); };
  }, [carroId, checkin, checkout, key]);
  return resultado?.key === key ? resultado : { estado: 'loading', total: 0 };
}
