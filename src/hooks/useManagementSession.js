import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/api';
import { EMPTY_ROLES, SESSION_KEYS, readSidebarSession, parseSidebarRoles, ROLES_UPDATED_EVENT, rolesFromUpdate } from '../utils/managementSession';

const REFRESH_MS = 30000;
// Only API-confirmed roles are cached, in memory and scoped to the session.
const rolesCache = new Map();
function currentSession() {
  try { return readSidebarSession(window.localStorage); } catch { return null; }
}
function initialState() {
  const session = currentSession();
  const cached = session && rolesCache.get(session.key);
  return { session, user: session?.user || null, userRoles: cached?.roles || EMPTY_ROLES, loading: !!session && !cached, error: false };
}

export default function useManagementSession() {
  const [state, setState] = useState(initialState);
  const refreshRef = useRef(null);
  const retry = useCallback(() => refreshRef.current?.(true), []);

  useEffect(() => {
    let disposed = false;
    let active = null;
    let sessionKey = state.session?.key;
    const refresh = async (force = false) => {
      if (disposed) return;
      const session = currentSession();
      if (session?.key !== sessionKey) {
        active?.controller.abort();
        active = null;
        rolesCache.clear();
        sessionKey = session?.key;
      }
      if (!session) {
        rolesCache.clear();
        setState({ session: null, user: null, userRoles: EMPTY_ROLES, loading: false, error: false });
        return;
      }
      const cached = rolesCache.get(session.key);
      setState(prev => ({
        ...prev, session, user: session.user,
        userRoles: prev.session?.key === session.key ? prev.userRoles : cached?.roles || EMPTY_ROLES,
        loading: prev.session?.key !== session.key ? !cached : prev.loading,
      }));
      if (active || (!force && cached && Date.now() - cached.time < REFRESH_MS)) return;
      if (document.visibilityState === 'hidden' && !force) return;
      const request = { controller: new AbortController(), key: session.key };
      active = request;
      try {
        const { data } = await api.get('/usuarios/listar_roles.php', {
          params: { usuario_id: session.user.id }, signal: request.controller.signal, timeout: 12000,
          headers: session.token ? { Authorization: `Bearer ${session.token}` } : undefined,
        });
        const roles = parseSidebarRoles(data);
        if (disposed || active !== request || request.controller.signal.aborted) return;
        rolesCache.set(session.key, { roles, time: Date.now() });
        setState(prev => ({ ...prev, userRoles: roles, loading: false, error: false }));
      } catch (error) {
        if (disposed || active !== request || request.controller.signal.aborted) return;
        const denied = [401, 403].includes(error.response?.status);
        if (denied) rolesCache.delete(session.key);
        setState(prev => ({ ...prev, userRoles: denied ? EMPTY_ROLES : prev.userRoles, loading: false, error: true }));
      } finally {
        if (active === request) active = null;
      }
    };
    refreshRef.current = refresh;
    const onRefresh = () => { void refresh(); };
    const onRolesUpdated = event => {
      const session = currentSession();
      if (!session || Number(event.detail?.usuarioId) !== session.user.id) return;
      active?.controller.abort();
      active = null;
      const roles = rolesFromUpdate(event.detail, session.user.id);
      if (roles) {
        sessionKey = session.key;
        rolesCache.set(session.key, { roles, time: Date.now() });
        setState({ session, user: session.user, userRoles: roles, loading: false, error: false });
      } else {
        rolesCache.delete(session.key);
        void refresh(true);
      }
    };
    const onStorage = event => { if (!event.key || SESSION_KEYS.includes(event.key)) onRefresh(); };
    const onVisible = () => { if (document.visibilityState === 'visible') onRefresh(); };
    const onOnline = () => { void refresh(true); };
    const timer = window.setInterval(onVisible, REFRESH_MS);
    window.addEventListener('storage', onStorage);
    window.addEventListener('userUpdated', onRefresh);
    window.addEventListener(ROLES_UPDATED_EVENT, onRolesUpdated);
    window.addEventListener('utilizadorAtualizado', onRefresh);
    window.addEventListener('focus', onVisible);
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    void refresh();
    return () => {
      disposed = true;
      active?.controller.abort();
      refreshRef.current = null;
      window.clearInterval(timer);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('userUpdated', onRefresh);
      window.removeEventListener(ROLES_UPDATED_EVENT, onRolesUpdated);
      window.removeEventListener('utilizadorAtualizado', onRefresh);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  // The subscription reads the current session for each event; state updates must not restart it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ...state, retry };
}
