// src/utils/idempotency.js

/**
 * Gera uma chave única (UUID v4 simplificado) para idempotência.
 * Guarda no sessionStorage para reutilizar em caso de retry.
 */
export function gerarIdempotencyKey(chave) {
  try {
    const storageKey = `idem_${chave}`;
    const existente = sessionStorage.getItem(storageKey);
    if (existente) return existente;

    // UUID v4
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    sessionStorage.setItem(storageKey, uuid);
    return uuid;
  } catch {
    // Fallback se sessionStorage falhar
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

/**
 * Limpa a chave após sucesso (para não bloquear futuras reservas).
 */
export function limparIdempotencyKey(chave) {
  try {
    sessionStorage.removeItem(`idem_${chave}`);
  } catch {}
}