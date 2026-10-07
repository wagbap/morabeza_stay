// src/features/alojamento/hooks/useDisponibilidadeAlojamento.js
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { alojamentoApi } from '../services/alojamentoApi';
import { useHoldsAlojamento } from './useHoldsAlojamento';

export function useDisponibilidadeAlojamento({
  alojamento,
  carrinhoQuartos,
  capacidadeTotal,
  images,
  vendaPorQuarto,
  onSuccess,
  onError,
}) {
  const navigate = useNavigate();
  const { criarHolds, libertarTodos } = useHoldsAlojamento();

  const [validando, setValidando] = useState(false);
  const [erroDisponibilidade, setErroDisponibilidade] = useState(null);

  const extrairMensagemErro = useCallback((data) => {
    if (!data) return 'Datas indisponíveis.';
    if (data.motivo === 'bloqueio_manual' && data.datas?.length) {
      return `Datas bloqueadas: ${data.datas.join(', ')}.`;
    }
    if (data.motivo === 'stock_insuficiente' && data.conflitos?.length) {
      return 'Alguns quartos já não têm stock suficiente para as datas escolhidas.';
    }
    if (data.motivo === 'reserva_existente') {
      return 'Este alojamento já está reservado nestas datas.';
    }
    if (data.motivo === 'nenhum_quarto_configurado') {
      return data.mensagem || 'Este alojamento não tem quartos configurados para reserva.';
    }
    return data.mensagem || data.error || 'Datas indisponíveis.';
  }, []);

  const continuarParaCheckout = useCallback(async ({
    checkin,
    checkout,
    numHospedes,
    noites,
    subtotal,
  }) => {
    // ============================================================
    // DEBUG: log do que recebemos
    // ============================================================
    console.log('[useDisponibilidade] continuarParaCheckout chamado com:', {
      checkin,
      checkout,
      numHospedes,
      noites,
      subtotal,
      alojamentoId: alojamento?.id,
      modeloVenda: alojamento?.modelo_venda,
      carrinhoQuartos: carrinhoQuartos,
    });

    // ===== VALIDAÇÕES =====
    if (!alojamento?.id) {
      const msg = 'Alojamento não carregado. Recarrega a página.';
      console.error('[useDisponibilidade] ❌ alojamento.id em falta:', alojamento);
      setErroDisponibilidade({ tipo: 'erro_validacao', mensagem: msg });
      onError?.({ tipo: 'erro_validacao', mensagem: msg });
      return;
    }

    if (!checkin || !checkout) {
      const msg = 'Seleciona as datas de check-in e check-out.';
      console.error('[useDisponibilidade] ❌ Datas em falta:', { checkin, checkout });
      setErroDisponibilidade({ tipo: 'erro_validacao', mensagem: msg });
      onError?.({ tipo: 'erro_validacao', mensagem: msg });
      return;
    }

    if (new Date(checkout) <= new Date(checkin)) {
      const msg = 'A data de check-out tem de ser posterior ao check-in.';
      console.error('[useDisponibilidade] ❌ Datas inválidas:', { checkin, checkout });
      setErroDisponibilidade({ tipo: 'erro_validacao', mensagem: msg });
      onError?.({ tipo: 'erro_validacao', mensagem: msg });
      return;
    }

    // ===== MODO REAL =====
    const modoRealPorQuarto = alojamento.modelo_venda === 'por_quarto';

    if (modoRealPorQuarto) {
      if (!carrinhoQuartos || carrinhoQuartos.length === 0) {
        const msg = 'Seleciona pelo menos um quarto antes de continuar.';
        console.error('[useDisponibilidade] ❌ carrinhoQuartos vazio');
        setErroDisponibilidade({ tipo: 'erro_validacao', mensagem: msg });
        onError?.({ tipo: 'erro_validacao', mensagem: msg });
        return;
      }

      // 🔥 BLINDAGEM: aceita 'tipoQuartoId' (camelCase) OU 'tipo_quarto_id' (snake_case)
      const itemInvalido = carrinhoQuartos.find(q => {
        const id = q.tipoQuartoId ?? q.tipo_quarto_id ?? q.tipoQuartoID ?? null;
        return !id || Number(id) <= 0 || Number(id) >= 9000; // rejeita IDs físicos
      });

      if (itemInvalido) {
        const msg = 'Este alojamento está configurado por quarto, mas os tipos ainda não foram definidos.';
        console.error('[useDisponibilidade] ❌ Item inválido no carrinho:', itemInvalido);
        setErroDisponibilidade({ tipo: 'erro_validacao', mensagem: msg });
        onError?.({ tipo: 'erro_validacao', mensagem: msg });
        return;
      }
    }

    // Normalizar carrinho para o formato esperado pelo backend
    const carrinhoNormalizado = (carrinhoQuartos || []).map(q => ({
      tipoQuartoId: q.tipoQuartoId ?? q.tipo_quarto_id ?? null,
      tipo_quarto_id: q.tipoQuartoId ?? q.tipo_quarto_id ?? null,
      nome: q.nome || 'Quarto',
      precoNoite: q.precoNoite ?? q.preco_noite ?? 0,
      capacidade: q.capacidade ?? 2,
      quantidade: Number(q.quantidade || 1),
      imagem: q.imagem || null,
      modoInteiro: q.modoInteiro === true,
    }));

    let carrinhoEfetivo = carrinhoNormalizado;
    if (!modoRealPorQuarto && (!carrinhoEfetivo || carrinhoEfetivo.length === 0)) {
      carrinhoEfetivo = [{
        tipoQuartoId: null,
        tipo_quarto_id: null,
        nome: alojamento.titulo || 'Alojamento inteiro',
        precoNoite: Math.round(Number(alojamento.preco_noite || 0)),
        capacidade: Number(alojamento.capacidade || 2),
        quantidade: 1,
        imagem: images?.[0] || alojamento.imagem_url || null,
        modoInteiro: true,
      }];
    }

    setValidando(true);
    setErroDisponibilidade(null);

    // ===== PASSO 1 — VERIFICAR DISPONIBILIDADE =====
    let dataVerif;
    try {
      console.log('[useDisponibilidade] 📡 A chamar verificarDisponibilidade com:', {
        alojamentoId: alojamento.id,
        checkin,
        checkout,
        modelo: modoRealPorQuarto ? 'por_quarto' : 'inteiro',
        quartos: modoRealPorQuarto ? carrinhoEfetivo : [],
      });

      dataVerif = await alojamentoApi.verificarDisponibilidade({
        alojamentoId: alojamento.id,
        checkin,
        checkout,
        modelo: modoRealPorQuarto ? 'por_quarto' : 'inteiro',
        quartos: modoRealPorQuarto ? carrinhoEfetivo : [],
      });

      console.log('[useDisponibilidade] ✅ Resposta de verificarDisponibilidade:', dataVerif);
    } catch (err) {
      setValidando(false);
      console.error('[useDisponibilidade] ❌ Erro de rede:', err);
      const msg = 'Erro de rede ao verificar disponibilidade. Tenta novamente.';
      setErroDisponibilidade({ tipo: 'erro_rede', mensagem: msg });
      onError?.({ tipo: 'erro_rede', mensagem: msg });
      return;
    }

    if (!dataVerif?.success) {
      setValidando(false);
      console.error('[useDisponibilidade] ❌ Resposta sem success:', dataVerif);
      const msg = dataVerif?.error || dataVerif?.mensagem || 'Erro ao verificar disponibilidade.';
      setErroDisponibilidade({ tipo: 'erro_validacao', mensagem: msg });
      onError?.({ tipo: 'erro_validacao', mensagem: msg });
      return;
    }

    if (dataVerif.disponivel === false) {
      setValidando(false);
      console.warn('[useDisponibilidade] ⚠️ Sem stock:', dataVerif);
      const msg = extrairMensagemErro(dataVerif);
      setErroDisponibilidade({ tipo: 'sem_stock', mensagem: msg });
      onError?.({ tipo: 'sem_stock', mensagem: msg });
      return;
    }

    // ============================================================
    // 🔑 PASSO 2 — CRIAR HOLDS **SÓ** SE FOR POR QUARTO
    // ============================================================
    // Alojamento INTEIRO → não criamos hold nenhum.
    // Basta a verificação de reservas que já fizemos acima.
    // O bloqueio real é criado quando a reserva é submetida.

    let holdsCriados = null;

    if (modoRealPorQuarto) {
      console.log('[useDisponibilidade] 📡 A criar holds para', carrinhoEfetivo.length, 'quartos');

      const resultadoHold = await criarHolds({
        alojamentoId: alojamento.id,
        quartos: carrinhoEfetivo,
        checkin,
        checkout,
        minutos: 15,
      });

      console.log('[useDisponibilidade] Resposta de criarHolds:', resultadoHold);

      if (!resultadoHold?.success) {
        setValidando(false);
        const msg = resultadoHold?.disponivel
          ? `Sem disponibilidade para "${resultadoHold.quartoFalhado || 'o quarto'}".`
          : resultadoHold?.error || 'Erro ao reservar stock.';
        console.error('[useDisponibilidade] ❌ Hold falhou:', resultadoHold);
        setErroDisponibilidade({ tipo: 'hold_falhou', mensagem: msg });
        onError?.({ tipo: 'hold_falhou', mensagem: msg });
        return;
      }

      holdsCriados = resultadoHold.holds;
    }

    // ===== PASSO 3 — NAVEGAR PARA O CHECKOUT =====
    setValidando(false);

    const taxaLimpeza = Number(alojamento.taxa_limpeza || alojamento.limpeza || 0);

    const dadosParaCheckout = {
      id: alojamento.id,
      titulo: alojamento.titulo,
      imagem: images?.[0] || alojamento.imagem_url,
      localizacao: alojamento.localizacao,
      ilha: alojamento.ilha || 'Cabo Verde',
      checkIn: checkin,
      checkOut: checkout,
      hospedes: numHospedes,
      capacidade: capacidadeTotal,
      noites,
      taxaLimpeza,
      descricao: alojamento.descricao,
      comodidades: alojamento.comodidades || [],
      quartos: carrinhoEfetivo,
      tipoVenda: modoRealPorQuarto ? 'quartos' : 'inteiro',
      holds: holdsCriados,   // null para inteiro
    };

    console.log('[useDisponibilidade] ✅ A navegar para checkout com:', dadosParaCheckout);

    onSuccess?.(dadosParaCheckout);
    navigate('/checkout-alojamento', { state: { reservaData: dadosParaCheckout } });
  }, [
    alojamento,
    carrinhoQuartos,
    capacidadeTotal,
    images,
    criarHolds,
    navigate,
    extrairMensagemErro,
    onSuccess,
    onError,
  ]);

  return {
    validando,
    erroDisponibilidade,
    continuarParaCheckout,
    limparErro: () => setErroDisponibilidade(null),
    libertarTodos,
  };
}

export default useDisponibilidadeAlojamento;