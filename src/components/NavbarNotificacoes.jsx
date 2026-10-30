import React, { useState, useEffect, useRef, useId } from 'react';
import { Bell, FileText, CalendarCheck, House, Check, X, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { pedirNotificacoes } from '../services/notificacoesService';
import { destinoRegistoNotificacao, normalizarLinkNotificacao } from '../utils/normalizarLinkNotificacao';

export default function NavbarNotificacoes({ userId, hero }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [data, setData] = useState({ rows: [], unread: 0, loading: true, error: false });
  const [saving, setSaving] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const refresh = useRef(null);
  const lastIdentity = useRef('');
  const id = useId();
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const controller = new AbortController();
    let active = false;
    const load = async () => {
      if (active || controller.signal.aborted || document.visibilityState === 'hidden') return;
      active = true;
      try {
        const { data: body } = await pedirNotificacoes({ action: 'listar', limite: 30 }, { signal: controller.signal });
        if (body.status !== 'success') {
          const failure = new Error('NOTIFICATIONS_FAILED');
          failure.code = body.code || 'INVALID_API_RESPONSE';
          throw failure;
        }
        const rows = body.data || [];
        if (import.meta.env.DEV) {
          const identity = JSON.stringify({ perfil: userId, autenticado: body.usuario_id ?? null, recebidas: rows.length });
          if (lastIdentity.current !== identity) {
            console.info('Notificacoes - conta:', identity);
            lastIdentity.current = identity;
          }
        }
        if (!controller.signal.aborted) setData({ rows, unread: body.nao_lidas || 0, loading: false, error: false });
      } catch (error) {
        if (controller.signal.aborted || error.code === 'ERR_CANCELED' || error.name === 'AbortError') return;
        console.error('Notificacoes:', JSON.stringify({ status: error.response?.status ?? null, code: error.response?.data?.code || error.code || 'LOAD_FAILED' }));
        if (!controller.signal.aborted) setData(prev => ({ ...prev, loading: false, error: true }));
      } finally { active = false; }
    };
    refresh.current = load;
    void load();
    const timer = setInterval(load, 30000);
    document.addEventListener('visibilitychange', load);
    return () => { controller.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', load); refresh.current = null; };
  }, [userId]);
  useEffect(() => {
    if (!open) return;
    void refresh.current?.();
    const outside = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  const mark = async notification => {
    await pedirNotificacoes({ action: notification ? 'marcar_lida' : 'marcar_todas_lidas', ...(notification ? { id: notification.id } : {}) });
    setData(prev => ({ ...prev, rows: prev.rows.map(row => !notification || row.id === notification.id ? { ...row, lida: 1 } : row), unread: notification ? Math.max(0, prev.unread - (Number(notification.lida) === 0 ? 1 : 0)) : 0 }));
  };
  const destination = notification => {
    const recordDestination = destinoRegistoNotificacao(notification);
    if (recordDestination) return recordDestination;
    try {
      const link = notification.link || notification.url;
      if (link) {
        const url = new URL(link, window.location.origin);
        if ([window.location.origin, 'https://morabezastay.cv'].includes(url.origin)) return normalizarLinkNotificacao(url);
      }
    } catch { /* Use record references. */ }
    return '/gest/documentos-solicitados';
  };
  const activate = notification => {
    if (Number(notification.lida) === 0) void mark(notification).catch(() => setData(prev => ({ ...prev, error: true })));
    setOpen(false);
    navigate(destination(notification));
  };
  return <div ref={root} className="relative shrink-0">
    <button ref={trigger} type="button" aria-label={t('gest_notif_titulo')} aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)} className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${hero ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}>
      <Bell size={18} strokeWidth={1.8} aria-hidden="true" />
      {data.unread > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-500 px-1 text-center text-[9px] font-bold leading-4 text-white">{data.unread > 99 ? '99+' : data.unread}</span>}
    </button>
    {open && <section id={id} aria-label={t('gest_notif_titulo')} className="fixed left-3 right-3 top-20 z-[120] overflow-hidden rounded-2xl border border-gray-100 bg-white text-gray-900 shadow-xl shadow-slate-900/15 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[360px]">
      <div className="flex items-center justify-between px-4 pt-4 pb-2"><h2 className="text-lg font-bold tracking-tight">{t('gest_notif_titulo')}</h2><button type="button" onClick={() => { setOpen(false); trigger.current?.focus(); }} aria-label={t('navbar_notif_fechar')} className="rounded-full p-2 text-gray-400 hover:bg-gray-100"><X size={16} /></button></div>
      <div className="flex flex-wrap items-center gap-1 px-4 pb-3">
        {[false, true].map(value => <button type="button" key={String(value)} aria-pressed={unreadOnly === value} onClick={() => setUnreadOnly(value)} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${unreadOnly === value ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>{t(value ? 'gest_notif_nao_lidas' : 'gest_notif_todas')}</button>)}
        <button type="button" disabled={saving || !data.unread} onClick={async () => { setSaving(true); try { await mark(); } catch { setData(prev => ({ ...prev, error: true })); } finally { setSaving(false); } }} className="ml-auto flex items-center gap-1 py-1 text-[10px] font-medium text-blue-600 disabled:opacity-40"><Check size={12} />{t('gest_notif_marcar')}</button>
      </div>
      <div className="max-h-[min(65dvh,440px)] overflow-y-auto border-t border-gray-50 p-2">
        {data.loading && <div className="flex justify-center p-8 text-blue-600" role="status" aria-label={t('navbar_notif_carregar')}><Loader2 size={22} className="animate-spin" /></div>}
        {data.error && <p role="alert" className="px-3 py-4 text-xs text-gray-500">{t('navbar_notif_erro')}</p>}
        {!data.loading && !data.error && !data.rows.some(row => !unreadOnly || Number(row.lida) === 0) && <p className="px-3 py-8 text-center text-xs text-gray-500">{t('gest_notif_vazio')}</p>}
        {data.rows.filter(row => !unreadOnly || Number(row.lida) === 0).map(row => {
          const Icon = row.tipo === 'documento' ? FileText : row.tipo === 'reserva' ? CalendarCheck : House;
          const date = new Date(String(row.criado_em || '').replace(' ', 'T'));
          return <button key={row.id} type="button" onClick={() => activate(row)} className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-blue-50 ${Number(row.lida) === 0 ? 'bg-blue-50/40' : ''}`}>
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-600"><Icon size={19} strokeWidth={1.7} />{row.anuncio_imagem && <img src={row.anuncio_imagem} alt="" loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }} className="absolute inset-0 h-full w-full object-cover" />}</span>
            <span className="min-w-0 flex-1"><span className={`block break-words text-xs leading-relaxed ${Number(row.lida) === 0 ? 'font-semibold' : 'font-medium text-gray-600'}`}>{row.anuncio_titulo && <span className="font-bold">{row.anuncio_titulo} ? </span>}{row.titulo}</span><span className="mt-0.5 block break-words text-[11px] leading-relaxed text-gray-500">{row.mensagem}</span>{!Number.isNaN(date.getTime()) && <time dateTime={date.toISOString()} className="mt-1 block text-[10px] font-medium text-blue-600">{date.toLocaleString(i18n.resolvedLanguage || 'pt', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>}</span>
            {Number(row.lida) === 0 && <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
          </button>;
        })}
      </div>
    </section>}
  </div>;
}
