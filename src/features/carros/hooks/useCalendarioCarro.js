import { useEffect, useState } from 'react';
import api from '../../../api/api';
import { dataLocalCarro } from '../utils/disponibilidadeCarro';

export default function useCalendarioCarro(carroId, mes, levantamento, quantidade = 1) {
  const inicio = dataLocalCarro(new Date(mes.getFullYear(), mes.getMonth(), 1));
  const fim = dataLocalCarro(new Date(mes.getFullYear(), mes.getMonth() + 1, 1));
  const partida = levantamento ? dataLocalCarro(levantamento) : '';
  const key = JSON.stringify([carroId, inicio, partida, quantidade]);
  const [resultado, setResultado] = useState(null);
  const [tentativa, setTentativa] = useState(0);
  const recarregar = () => { setResultado(null); setTentativa(n => n + 1); };
  useEffect(() => {
    let request;
    let fechado = false;
    const atualizar = async () => {
      request?.abort(); request = new AbortController(); const signal = request.signal;
      try {
        const { data } = await api.get('/calendario_carro.php', { params: { carro_id: carroId, inicio, fim,
          ...(partida ? { levantamento: partida } : {}), quantidade }, signal, timeout: 15000 });
        if (data.success !== true || !data.dias || Object.values(data.dias).some(d => typeof d.levantamento !== 'boolean' || typeof d.devolucao !== 'boolean')) throw new Error('Invalid calendar');
        if (!fechado && !signal.aborted) setResultado({ key, estado: 'ready', dias: data.dias });
      } catch { if (!fechado && !signal.aborted) setResultado({ key, estado: 'error', dias: {} }); }
    };
    if (carroId) void atualizar();
    const timer = setInterval(atualizar, 30000);window.addEventListener('focus', atualizar);
    return () => { fechado = true; request?.abort();clearInterval(timer);window.removeEventListener('focus', atualizar); };
  }, [carroId, inicio, fim, partida, quantidade, key, tentativa]);
  return { ...(resultado?.key === key ? resultado : { estado: 'loading', dias: {} }), recarregar };
}
