export function criarReservadorVagas(enviar) {
  const pedidos = new Map();
  return payload => {
    const key = JSON.stringify(payload);
    if (!pedidos.has(key)) {
      const pedido = Promise.resolve().then(() => enviar(payload)).then(raw => {
        let data;
        try { data = JSON.parse(raw.replace(/^\uFEFF/, '')); }
        catch { throw Object.assign(new Error('INVALID_HOLD_RESPONSE'), { code: 'INVALID_HOLD_RESPONSE' }); }
        if (!data || typeof data !== 'object' || Array.isArray(data) || typeof data.success !== 'boolean' ||
            (data.success && (typeof data.token !== 'string' || !data.token.trim()))) {
          throw Object.assign(new Error('INVALID_HOLD_RESPONSE'), { code: 'INVALID_HOLD_RESPONSE' });
        }
        return data;
      }).finally(() => pedidos.delete(key));
      pedidos.set(key, pedido);
    }
    return pedidos.get(key);
  };
}
