import { readSidebarSession } from './managementSession.js';

export function obterUtilizadorRegisto(storage) {
  const session = readSidebarSession(storage);
  if (session?.user?.id) return session.user;
  // Administrative users are stored separately from public accounts.
  try {
    const admin = JSON.parse(storage.getItem('morabeza_admin') || 'null');
    const id = Number(admin?.id ?? admin?.user_id ?? admin?.sub);
    return Number.isSafeInteger(id) && id > 0 ? { ...admin, id } : null;
  } catch { return null; }
}
