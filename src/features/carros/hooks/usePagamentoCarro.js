import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../../../api/api';
import { obterPedidoStockCarro } from '../utils/pedidoStockCarro';
import { prazoPagamentoCarro, segundosPagamentoCarro, erroPagamentoCarro, pagamentoCarroEmCurso } from '../utils/pagamentoCarro';

export default function usePagamentoCarro(reserva, ativo) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [segundos, setSegundos] = useState(0);
  const atual = useRef(0);
  const payload = useMemo(() => {
    if (!ativo || !reserva.id || !reserva.checkIn || !reserva.checkOut) return null;
    return {
      documentos_condutor: reserva.documentos_condutor,
      tipo: 'carro', pedido_stock: obterPedidoStockCarro({ id: reserva.id, checkIn: reserva.checkIn, checkOut: reserva.checkOut,
        quantidade: reserva.quantidade, horaLevantamento: reserva.horaLevantamento, horaDevolucao: reserva.horaDevolucao, precoTotal: reserva.precoTotal, totalGeral: reserva.totalGeral }),
      amount: Math.round(Number(reserva.precoTotal ?? reserva.totalGeral) / 110.265 * 100), currency: 'eur',
      stripe_mode: import.meta.env.VITE_STRIPE_PUBLIC_KEY?.startsWith('pk_test_') ? 'test' : 'live',
      reserva: { carro_id: reserva.id, checkIn: reserva.checkIn, checkOut: reserva.checkOut, quantidade: reserva.quantidade,
        hora_levantamento: reserva.horaLevantamento, hora_devolucao: reserva.horaDevolucao, exige_caucao: reserva.exige_caucao, caucao_valor: reserva.caucao_valor },
    };
  }, [ativo, reserva.horaLevantamento, reserva.horaDevolucao, reserva.documentos_condutor, reserva.id, reserva.checkIn, reserva.checkOut, reserva.quantidade, reserva.precoTotal, reserva.totalGeral, reserva.exige_caucao, reserva.caucao_valor]);

  const pedir = useCallback(async (acao = 'estado') => {
    if (!payload) throw new Error('Missing booking data');
    const versao = atual.current;
    try {
      const { data } = await api.post('/create-payment-intent.php', { ...payload, acao }, { timeout: 20000 });
      const normalizado = prazoPagamentoCarro(data);
      if (versao === atual.current) {
        setDados(normalizado); setSegundos(segundosPagamentoCarro(normalizado.prazoLocal)); setErro(null);
      }
      return normalizado;
    } catch (e) {
      const code = e.response?.data?.code;
      if (versao === atual.current) setErro({ chave: erroPagamentoCarro(code), code, terminal: e.response?.status === 409 });
      throw e;
    }
  }, [payload]);

  useEffect(() => {
    atual.current += 1;
    setDados(null); setErro(null); setSegundos(0);
    if (payload) void pedir('iniciar').catch(() => {});
    return () => { atual.current += 1; };
  }, [payload, pedir]);

  useEffect(() => {
    if (!payload || erro?.terminal) return;
    let pendente = false;
    const consultar = async () => {
      if (pendente) return;
      pendente = true;
      try { await pedir('iniciar'); } catch { /* Keep payment disabled on uncertainty. */ }
      finally { pendente = false; }
    };
    const timer = setInterval(consultar, 10000);
    window.addEventListener('focus', consultar);
    return () => { clearInterval(timer); window.removeEventListener('focus', consultar); };
  }, [payload, pedir, erro?.terminal]);

  useEffect(() => {
    if (!dados) return;
    let verificado = pagamentoCarroEmCurso(dados.paymentStatus);
    const atualizar = () => {
      const restante = segundosPagamentoCarro(dados.prazoLocal);
      setSegundos(restante);
      if (!restante && !verificado) { verificado = true; void pedir('estado').catch(() => {}); }
    };
    const timer = setInterval(atualizar, 1000);
    return () => clearInterval(timer);
  }, [dados, pedir]);

  return { dados, erro, segundos, verificar: () => pedir('validar'), confirmarFalha: () => pedir('falha') };
}
