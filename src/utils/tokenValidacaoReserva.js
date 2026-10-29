export function obterTokenValidacao(storage, contexto, apenasSessao = false) {
  const read = key => { try { return storage.getItem(key); } catch { return null; } };
  if (contexto === 'host') {
    const keys = apenasSessao ? ['token', 'morabeza_token', 'access_token', 'jwt'] : ['reserva_validation_token', 'token', 'morabeza_token', 'access_token', 'jwt'];
    return keys.map(read).find(value => typeof value === 'string' && value.trim()) || null;
  }
  if (contexto !== 'admin') throw new Error('Unknown validation context');
  let admin;
  try { admin = JSON.parse(read('morabeza_admin') || '{}'); } catch { admin = {}; }
  return admin?.token || read('admin_token') || null;
}

