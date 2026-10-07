// src/features/alojamento/hooks/useHoldsAlojamento.js
// ============================================================
// 🎣 Hook — gestão de holds (criar, libertar)
// ============================================================
import { useRef, useCallback } from 'react';
import { alojamentoApi } from '../services/alojamentoApi';

const HOLD_MINUTOS_DEFAULT = 15;
const STORAGE_KEY = 'holdAlojamento';

/**
 * Normaliza um item do carrinho para garantir que `tipoQuartoId`
 * contém SEMPRE o ID do TIPO de quarto (1, 2, 3, 4...),
 * e NUNCA o ID do quarto físico (9162, 9163...).
 */
function normalizarQuarto(q) {
  if (!q) return null;

  // Aceita vários nomes possíveis vindos do carrinho
  const tipoId =
    q.tipoQuartoId ??
    q.tipo_quarto_id ??
    q.tipoId ??
    q.tipo_id ??
    null;

  const quantidade = Math.max(1, Number(q.quantidade ?? 1));

  return {
    tipoQuartoId: tipoId !== null ? Number(tipoId) : null,
    nome: q.nome ?? q.titulo ?? 'Quarto',
    precoNoite: Number(q.precoNoite ?? q.preco ?? 0),
    capacidade: Number(q.capacidade ?? 2),
    quantidade,
    imagem: q.imagem ?? q.imagem_url ?? null,
    modoInteiro: !!q.modoInteiro,
  };
}

export function useHoldsAlojamento() {
  const holdsRef = useRef([]);
  const expiraRef = useRef(null);

  // ------------------------------------------------------------
  // Criar holds
  // ------------------------------------------------------------
  const criarHolds = useCallback(async ({
    alojamentoId,
    quartos,
    checkin,
    checkout,
    minutos = HOLD_MINUTOS_DEFAULT,
  }) => {
    // Reutiliza holds já criados nesta sessão
    if (holdsRef.current.length > 0) {
      return { success: true, holds: holdsRef.current };
    }

    // ---------- Normalizar entradas ----------
    const listaBruta =
      Array.isArray(quartos) && quartos.length > 0
        ? quartos
        : [{ tipoQuartoId: null, nome: 'Alojamento inteiro', quantidade: 1 }];

    const lista = listaBruta
      .map(normalizarQuarto)
      .filter(Boolean);

    console.log('[useHoldsAlojamento] Lista normalizada:', lista);

    // ---------- Validação ----------
    const invalidos = lista.filter(
      (q) => !q.modoInteiro && (q.tipoQuartoId === null || q.tipoQuartoId <= 0)
    );
    if (invalidos.length > 0) {
      console.error('[useHoldsAlojamento] Quartos sem tipoQuartoId válido:', invalidos);
      return {
        success: false,
        disponivel: false,
        error:
          'Configuração de quarto inválida (tipoQuartoId em falta). ' +
          'Contacta o suporte ou recarrega a página.',
        quartoFalhado: invalidos[0]?.nome,
      };
    }

    const criados = [];
    try {
      for (const q of lista) {
        // Log detalhado do que vai ser enviado ao servidor
        console.log('[useHoldsAlojamento] criarHold →', {
          alojamentoId,
          tipoQuartoId: q.tipoQuartoId,
          quantidade: q.quantidade,
          checkin,
          checkout,
          minutos,
        });

        const resp = await alojamentoApi.criarHold({
          quartoId: q.tipoQuartoId,
          alojamentoId,
          checkin,
          checkout,
          quantidade: q.quantidade,
          minutos,
        });

        if (!resp.success || !resp.hold_id) {
          // Falhou → libertar tudo o que já foi criado
          await alojamentoApi.libertarHolds(criados.map((h) => h.hold_id));
          return {
            success: false,
            disponivel: resp.disponivel === false,
            error: resp.error || 'Sem disponibilidade',
            quartoFalhado: q.nome,
            debug: resp.debug,
          };
        }

        criados.push({
          hold_id: resp.hold_id,
          expira_em: resp.expira_em,
          tipo_quarto_id: q.tipoQuartoId,
          nome: q.nome,
          quantidade: q.quantidade,
        });
      }

      // Guardar estado local
      holdsRef.current = criados;

      const menor = criados.reduce((min, h) => {
        const t = new Date(h.expira_em).getTime();
        return !min || t < min ? t : min;
      }, null);
      expiraRef.current = menor;

      // Persistir em sessionStorage
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            holds: criados,
            expira_em: new Date(menor).toISOString(),
            alojamento_id: alojamentoId,
            checkin,
            checkout,
            criado_em: new Date().toISOString(),
          })
        );
      } catch (e) {
        console.warn('[useHoldsAlojamento] sessionStorage indisponível:', e);
      }

      return { success: true, holds: criados, expira_em: menor };
    } catch (err) {
      // Erro de rede / exceção → libertar tudo
      await alojamentoApi.libertarHolds(criados.map((h) => h.hold_id));
      return {
        success: false,
        error: err?.message || 'Erro de rede ao criar holds',
      };
    }
  }, []);

  // ------------------------------------------------------------
  // Libertar todos (holds da sessão)
  // ------------------------------------------------------------
  const libertarTodos = useCallback(async () => {
    const sessionId = sessionStorage.getItem('morabeza_hold_session') || '';

    // 1) libertar por id (se tiver)
    if (holdsRef.current.length > 0) {
      try {
        await alojamentoApi.libertarHolds(holdsRef.current.map((h) => h.hold_id));
      } catch (e) {
        /* silencioso */
      }
    }

    // 2) libertar por session_id (garante que limpa tudo desta sessão)
    if (sessionId) {
      try {
        await fetch(
          `${import.meta.env.VITE_API_BASE || 'https://welovepalop.com'}/api/libertar_holds.php`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId }),
          }
        );
      } catch (e) {
        /* silencioso */
      }
    }

    holdsRef.current = [];
    expiraRef.current = null;
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* silencioso */
    }
  }, []);

  // ------------------------------------------------------------
  // Ler holds existentes
  // ------------------------------------------------------------
  const lerHoldsExistentes = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.holds || !Array.isArray(parsed.holds)) return null;

      const expira = new Date(parsed.expira_em).getTime();
      if (Date.now() >= expira) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }

      holdsRef.current = parsed.holds;
      expiraRef.current = expira;
      return parsed;
    } catch {
      return null;
    }
  }, []);

  return {
    holdsRef,
    expiraRef,
    criarHolds,
    libertarTodos,
    lerHoldsExistentes,
  };
}