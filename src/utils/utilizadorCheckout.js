import { jwtDecode } from 'jwt-decode';

// Apenas preenche a interface; a identidade deve ser verificada na API.
export function obterUtilizadorCheckout(storage = localStorage, now = Date.now()) {
  const read = key => { try { return storage.getItem(key); } catch { return null; } };
  let profile = {};
  for (const key of ['user', 'morabeza_user']) {
    try {
      const parsed = JSON.parse(read(key) || 'null');
      if (parsed && typeof parsed === 'object') {
        profile = parsed.user || parsed.usuario || parsed.data || parsed;
        break;
      }
    } catch { /* Um perfil corrompido nao impede ler o JWT. */ }
  }
  for (const key of ['token', 'morabeza_token', 'access_token', 'jwt']) {
    try {
      const raw = read(key);
      if (!raw) continue;
      const payload = jwtDecode(raw);
      if (payload.exp && now >= Number(payload.exp) * 1000) continue;
      const claims = payload.data || payload.user || payload.usuario || payload;
      const email = claims.email || payload.email || '';
      const id = claims.id || claims.user_id || claims.usuario_id || claims.userId || payload.sub;
      if (!email || !id) continue;
      const sameProfile = (profile.email || '').toLowerCase() === email.toLowerCase();
      const extra = sameProfile ? profile : {};
      return {
        ...extra, ...claims, id, email,
        nome: claims.nome || claims.name || claims.full_name || extra.nome || extra.name || extra.full_name || '',
        phone: claims.phone || claims.telefone || extra.phone || extra.telefone || '',
        google_id: claims.google_id || extra.google_id || null,
      };
    } catch { /* Tentar outra chave de sessao. */ }
  }
  return null;
}
