import { jwtDecode } from 'jwt-decode';

export const EMPTY_ROLES = Object.freeze({ anfitrion: false, guia: false, proprietarioVeiculos: false });
export const SESSION_KEYS = ['token', 'morabeza_token', 'access_token', 'jwt', 'user', 'morabeza_user', 'reserva_validation_token'];
const idOf = user => {
  const id = Number(user?.id ?? user?.userId ?? user?.user_id ?? user?.usuario_id ?? user?.sub);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};
const object = value => value && typeof value === 'object' && !Array.isArray(value);

export function readSidebarSession(storage) {
  const read = key => { try { return storage.getItem(key); } catch { return null; } };
  const saved = ['user', 'morabeza_user'].map(key => {
    try {
      const parsed = JSON.parse(read(key));
      return object(parsed) ? parsed : null;
    } catch { return null; }
  }).filter(Boolean);
  for (const key of SESSION_KEYS.slice(0, 4)) {
    const token = read(key);
    if (!token) continue;
    try {
      const payload = jwtDecode(token);
      if (payload.exp && Date.now() >= payload.exp * 1000) return null;
      const decoded = payload.data || payload.user || payload.usuario || payload;
      const id = idOf(decoded) || idOf({ sub: payload.sub });
      if (!id) continue;
      const profile = saved.find(user => idOf(user) === id);
      // Profile edits update localStorage; the token remains unchanged.
      return { user: { ...decoded, ...profile, nome: profile?.nome || profile?.name || decoded.nome || decoded.name, id }, token, key: `${id}:${token}` };
    } catch { /* A broken legacy token must not prevent reading the stored profile. */ }
  }
  const profile = saved.find(user => idOf(user));
  return profile ? { user: { ...profile, id: idOf(profile) }, token: null, key: String(idOf(profile)) } : null;
}

export function parseSidebarRoles(data) {
  if (data?.success !== true || !Array.isArray(data.roles) || data.error) throw new Error('Invalid roles response');
  const approved = name => data.roles.some(role => role?.name === name && role.status === 'approved');
  return { anfitrion: approved('anfitrion'), guia: approved('guia_experiencias'), proprietarioVeiculos: approved('proprietario_veiculos') };
}

export const ROLES_UPDATED_EVENT = 'funcoesAtualizadas';
export function rolesFromUpdate(detail, userId) {
  if (!userId || Number(detail?.usuarioId) !== Number(userId)) return null;
  try { return parseSidebarRoles({ success: true, roles: detail.roles }); } catch { return null; }
}
