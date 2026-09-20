// src/services/checkoutApi.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://welovepalop.com/api';
const ENDPOINT = `${API_BASE}/checkout_api.php`;

const client = axios.create({
  baseURL: ENDPOINT,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

/* ------------------------------------------------------------------ */
/*  Erro normalizado (o backend devolve { success, error })            */
/* ------------------------------------------------------------------ */
function normalizeError(err) {
  const msg =
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    'Erro inesperado. Tenta novamente.';
  const details = err?.response?.data?.detalhes || null;
  return { message: msg, details, status: err?.response?.status };
}

/* ------------------------------------------------------------------ */
/*  1. Disponibilidade em runtime                                      */
/* ------------------------------------------------------------------ */
export async function checkStock({ alojamentoId, checkin, checkout }) {
  try {
    const { data } = await client.get('', {
      params: {
        action: 'check_stock',
        alojamento_id: alojamentoId,
        data_checkin: checkin,
        data_checkout: checkout,
      },
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: normalizeError(err) };
  }
}

/* ------------------------------------------------------------------ */
/*  2. Criar hold (bloquear quartos 20 min durante checkout)           */
/* ------------------------------------------------------------------ */
export async function createHold({
  alojamentoId,
  sessaoId,
  checkin,
  checkout,
  quartos, // [{ tipo_quarto_id, quantidade }]
  minutos = 20,
}) {
  try {
    const { data } = await client.post('?action=create_hold', {
      alojamento_id: alojamentoId,
      sessao_id: sessaoId,
      data_checkin: checkin,
      data_checkout: checkout,
      quartos,
      minutos,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: normalizeError(err) };
  }
}

/* ------------------------------------------------------------------ */
/*  3. Criar reserva (fica pendente/aguardando)                        */
/* ------------------------------------------------------------------ */
export async function createReservation(payload) {
  try {
    const { data } = await client.post('', payload);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: normalizeError(err) };
  }
}

/* ------------------------------------------------------------------ */
/*  4. Cancelar reserva (devolve stock)                                */
/* ------------------------------------------------------------------ */
export async function cancelReservation({ reservaId, category = 'Alojamento', motivo = '' }) {
  try {
    const { data } = await client.post('?action=cancel_reservation', {
      reserva_id: reservaId,
      category,
      motivo,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: normalizeError(err) };
  }
}

/* ------------------------------------------------------------------ */
/*  5. confirm_payment — ⚠️ SÓ no backend                              */
/*     Nunca chames isto do browser. Aqui fica como referência.        */
/* ------------------------------------------------------------------ */
export async function confirmPaymentInternal({ /* ... */ }) {
  throw new Error(
    'confirm_payment não pode ser chamado do cliente. ' +
    'Deve ser chamado pelo webhook do gateway, no servidor.'
  );
}

export default {
  checkStock,
  createHold,
  createReservation,
  cancelReservation,
  confirmPaymentInternal,
};