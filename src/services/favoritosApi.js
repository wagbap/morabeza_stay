import { requestApiJson } from './apiJson.js';

// All cards for the same user share the list request, including its retries.
const pending = new Map();

export function carregarFavoritosApi(email, usuarioId) {
  const params = new URLSearchParams({ action: 'listar' });
  if (email) params.set('email', email);
  else params.set('usuario_id', String(usuarioId));
  const url = `/favoritos.php?${params}`;
  if (!pending.has(url)) {
    const request = requestApiJson(url).then(result => {
      if (!result?.success || !Array.isArray(result.data)) {
        throw new Error('Invalid favorites response');
      }
      return result;
    }).catch(error => {
      // Log once per shared request, rather than once per card.
      console.warn('Falha ao carregar favoritos.', { status: error.response?.status || null });
      throw error;
    }).finally(() => pending.delete(url));
    pending.set(url, request);
  }
  return pending.get(url);
}
