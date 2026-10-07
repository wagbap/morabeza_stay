// src/features/alojamento/services/alojamentoApi.js
const API_BASE = 'https://welovepalop.com';

function obterSessionId() {
  let sid = sessionStorage.getItem('morabeza_hold_session');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('morabeza_hold_session', sid);
  }
  return sid;
}

export const alojamentoApi = {
  // ----------------------------------------------------------
  // Disponibilidade
  // ----------------------------------------------------------
  verificarDisponibilidade: async ({ alojamentoId, checkin, checkout, modelo, quartos }) => {
    if (!alojamentoId) return { success: false, error: 'Alojamento inválido.' };
    if (!checkin || !checkout) return { success: false, error: 'Selecione as datas.' };

    try {
      const res = await fetch(`${API_BASE}/api/verificar_stock_multi.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alojamento_id: alojamentoId,
          checkin,
          checkout,
          modelo,
          quartos: Array.isArray(quartos) ? quartos : [],
        }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Erro de rede.', debug: { msg: err.message } };
    }
  },

  // ----------------------------------------------------------
  // Criar hold (bloqueio temporário)
  // ----------------------------------------------------------
  criarHold: async ({ quartoId, alojamentoId, checkin, checkout, quantidade = 1, minutos = 15 }) => {
    if (!alojamentoId) return { success: false, error: 'Alojamento inválido.' };
    if (!checkin || !checkout) return { success: false, error: 'Datas em falta.' };

    const sessionId = obterSessionId();

    try {
      const res = await fetch(`${API_BASE}/api/criar_hold.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alojamento_id: alojamentoId,
          quartos: quartoId ? [{ tipo_quarto_id: quartoId, quantidade }] : [],
          checkin,
          checkout,
          session_id: sessionId,
          minutos,
        }),
      });

      const data = await res.json();

      console.log('[alojamentoApi.criarHold] Resposta do PHP:', data);

      // ============================================================
      // ✅ CORREÇÃO CRÍTICA
      // O PHP devolve: { success, hold_id, session_id, expira_em, criados }
      // NÃO devolve "holds". Vamos aceitar ambos os formatos.
      // ============================================================

      // Formato A: PHP devolve hold_id no topo (formato atual do criar_hold.php)
      if (data.success && data.hold_id) {
        return {
          success: true,
          hold_id: data.hold_id,
          expira_em: data.expira_em,
          session_id: data.session_id,
          criados: data.criados || [],
          holds: [{
            id: data.hold_id,
            expira_em: data.expira_em,
            criados: data.criados || [],
          }],
        };
      }

      // Formato B: PHP devolve array "holds" (formato antigo, para compatibilidade)
      if (data.success && Array.isArray(data.holds) && data.holds.length > 0) {
        const primeiro = data.holds[0];
        return {
          success: true,
          hold_id: primeiro.id || primeiro.hold_id,
          expira_em: primeiro.expira_em,
          holds: data.holds,
          session_id: data.session_id,
        };
      }

      // Formato C: PHP devolve array "criados" (outro formato possível)
      if (data.success && Array.isArray(data.criados) && data.criados.length > 0) {
        return {
          success: true,
          hold_id: data.hold_id,
          expira_em: data.expira_em,
          criados: data.criados,
          holds: [{
            id: data.hold_id,
            expira_em: data.expira_em,
            criados: data.criados,
          }],
        };
      }

      // Se chegou aqui, algo falhou mesmo
      return {
        success: false,
        disponivel: data.disponivel,
        error: data.error || 'Sem disponibilidade.',
        debug: data.debug,
      };
    } catch (err) {
      return { success: false, error: 'Erro de rede ao criar hold.', debug: { msg: err.message } };
    }
  },

  // ----------------------------------------------------------
  // Libertar holds (por id)
  // ----------------------------------------------------------
  libertarHolds: async (holdIds) => {
    if (!Array.isArray(holdIds) || holdIds.length === 0) {
      return { success: true, apagados: 0 };
    }
    try {
      const res = await fetch(`${API_BASE}/api/libertar_holds.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hold_ids: holdIds }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Erro de rede.', debug: { msg: err.message } };
    }
  },

  // ----------------------------------------------------------
  // 🧹 Libertar TUDO (exceto reservas) — alojamento inteiro
  // ----------------------------------------------------------
  libertarAlojamentoInteiro: async (alojamentoId) => {
    if (!alojamentoId) return { success: false, error: 'Alojamento inválido.' };

    const sessionId = obterSessionId();

    try {
      const res = await fetch(`${API_BASE}/api/libertar_alojamento_inteiro.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alojamento_id: alojamentoId,
          session_id: sessionId,
        }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Erro de rede.', debug: { msg: err.message } };
    }
  },
};

export default alojamentoApi;