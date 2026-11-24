import { jwtDecode } from 'jwt-decode';

export function obterTokenValidacao(storage, contexto, apenasSessao = false) {
  const read = key => { try { return storage.getItem(key); } catch { return null; } };
  if (contexto === 'host') {
    const keys = apenasSessao ? ['token', 'morabeza_token', 'access_token', 'jwt'] : ['reserva_validation_token', 'token', 'morabeza_token', 'access_token', 'jwt'];
    return keys.map(read).map(value => typeof value === 'string' ? value.trim() : '').find(value => {
      if (!value) return false;
      if (value.split('.').length !== 3) return true;
      // Selection only: the API still verifies signature, expiry and ownership.
      // Skip stale aliases instead of allowing one to hide another valid session.
      try {
        const claims = jwtDecode(value);
        return typeof claims.exp === 'number' && claims.exp > Date.now() / 1000;
      } catch { return false; }
    }) || null;
  }
  if (contexto !== 'admin') throw new Error('Unknown validation context');
  let admin;
  try { admin = JSON.parse(read('morabeza_admin') || '{}'); } catch { admin = {}; }
  return admin?.token || read('admin_token') || null;
}

