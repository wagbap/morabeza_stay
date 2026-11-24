import '@fontsource-variable/inter';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarCheck, Check, ChevronDown, Eye, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import { readSidebarSession } from '../../../utils/managementSession';
import { IconeGestao } from '../../../components/gest/ListaAnunciosGestao';

const hoje = () => new Date().toLocaleDateString('en-CA');
const normalizar = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function Pesquisa({ label, placeholder, value, options, onChange, hint }) {
  const [open, setOpen] = useState(false), [query, setQuery] = useState('');
  const root = useRef(null), input = useRef(null);
  const id = useId();
  useEffect(() => {
    const close = e => { if (!root.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  const selected = options.find(o => o.value === value);
  return <div ref={root} className="relative min-w-0">
    <label htmlFor={id} className="mb-1 block text-[15px] font-bold tracking-[-.6px] sm:text-[16px]">{label}</label>
    <div className={`flex h-11 items-center gap-3 rounded-[12px] border bg-white px-5 ${open ? 'border-[#4d16ff] ring-1 ring-[#4d16ff]' : 'border-[#b9bedb]'}`}>
      <IconeGestao icon={Search} size={20} className="text-[#6b6b9e]" />
      <input id={id} ref={input} role="combobox" aria-expanded={open} aria-controls={`${id}-options`} autoComplete="off" value={open ? query : selected?.value ? selected.label : ''} placeholder={placeholder} onFocus={() => { setOpen(true); setQuery(''); }} onChange={e => { setQuery(e.target.value); setOpen(true); }} onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } if (e.key === 'ArrowDown') { e.preventDefault(); root.current.querySelector('[role=option]')?.focus(); } }} className="w-full min-w-0 bg-transparent text-[14px] outline-none focus-visible:outline-none focus-visible:ring-0 placeholder:text-[#646199] sm:text-[14px]" />
      <button type="button" aria-label={label} onClick={() => { if (open) setOpen(false); else input.current?.focus(); }}><IconeGestao icon={ChevronDown} size={20} /></button>
    </div>
    {hint && <p className="mt-1 text-[14px] text-[#59558d] sm:text-[14px]">{hint}</p>}
    {open && <div id={`${id}-options`} role="listbox" aria-label={label} className="absolute left-0 right-0 top-[68px] z-20 rounded-[13px] border border-[#e2e4ef] bg-white px-4 py-2 shadow-[0_8px_14px_#151d4c40]" onKeyDown={e => { const items = [...e.currentTarget.querySelectorAll('[role=option]')], i = items.indexOf(document.activeElement); if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus(); } }}>
      {options.filter(o => normalizar(o.label).includes(normalizar(query))).map(o => <button key={o.value} type="button" role="option" aria-selected={o.value === value} onClick={() => { onChange(o.value); setOpen(false); input.current?.focus(); setOpen(false); }} className="flex min-h-9 w-full items-center justify-between border-b border-[#e0e3ef] px-3 text-left text-[14px] last:border-0 hover:bg-blue-50 sm:text-[15px]">{o.label}{o.value === value && <IconeGestao icon={Check} size={19} className="text-[#164aff]" />}</button>)}
    </div>}
  </div>;
}

export default function ReservasAnuncioModal({ anuncio, anuncios, proprietarioId, onClose }) {
  const { t, i18n } = useTranslation(), navigate = useNavigate();
  const dialog = useRef(null), titleId = useId();
  const [anuncioId, setAnuncioId] = useState(String(anuncio.id));
  const [cliente, setCliente] = useState(''), [modo, setModo] = useState('semana');
  const [inicio, setInicio] = useState(hoje), [fim, setFim] = useState(hoje);
  const [rows, setRows] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(false);
  const ativo = anuncios.find(a => String(a.id) === anuncioId) || anuncio;
  useEffect(() => {
    const previous = document.activeElement, overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; dialog.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const session = readSidebarSession(localStorage);
    if (!session?.user?.id || Number(session.user.id) !== Number(proprietarioId)) {
      setError(true); setLoading(false);
      return () => controller.abort();
    }
    const token = session.token;
    api.get('/dashboard/reservas_recentes.php', { params: { usuario_id: proprietarioId }, signal: controller.signal, headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then(({ data }) => { const items = data.data?.reservas ?? data.data; if (!data.success || !Array.isArray(items)) throw new Error('invalid'); setRows(items); })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [proprietarioId]);
  const reservas = useMemo(() => rows.filter(r => {
    const id = r.alojamento_id ?? r.propriedade_id ?? r.item_id;
    return (!r.tipo || r.tipo === 'alojamento') && (id != null ? String(id) === anuncioId : r.item_nome === ativo.titulo);
  }), [rows, anuncioId, ativo.titulo]);
  const clientes = [...new Set(reservas.map(r => r.cliente_nome).filter(Boolean))];
  const filtradas = reservas.filter(r => {
    if (cliente && r.cliente_nome !== cliente) return false;
    const data = String(r.data_reserva || r.created_at || r.data_criacao || '').slice(0, 10);
    if (!data) return false;
    const end = new Date(`${inicio}T12:00:00`), start = new Date(end);
    if (modo === 'semana') { start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); end.setTime(start.getTime()); end.setDate(end.getDate() + 6); }
    if (modo === 'intervalo') return data >= inicio && data <= fim;
    const iso = d => d.toLocaleDateString('en-CA');
    return data >= iso(start) && data <= iso(end);
  });
  const dinheiro = n => `${new Intl.NumberFormat(i18n.language === 'cv' ? 'pt-PT' : i18n.language, { maximumFractionDigits: 2 }).formatToParts(n).map(part => part.type === 'group' ? ' ' : part.type === 'integer' ? part.value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : part.value).join('')} CVE`;
  const valor = r => Number(r.valor_pago ?? r.valor ?? 0) || 0;
  return createPortal(<div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-[#111b38]/60 p-3 backdrop-blur-[2px] sm:p-6" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} data-reservas-anuncio className="my-auto max-h-[calc(100dvh-24px)] w-full max-w-[760px] overflow-y-auto rounded-[20px] border border-white bg-white px-5 pb-5 pt-5 text-left text-[#0c093b] shadow-[0_20px_55px_#00000045] outline-none [font-family:'Inter_Variable',Arial,sans-serif] sm:px-7 sm:pt-7" onKeyDown={e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') { const nodes = [...dialog.current.querySelectorAll('button:not(:disabled),input,select,[tabindex="0"]')].filter(el => el.getClientRects().length); const first = nodes[0], last = nodes.at(-1); if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } }
    }}>
      <header className="mb-5 flex items-start gap-4"><IconeGestao icon={CalendarCheck} size={34} className="mt-3 text-[#6500ff]" /><div className="min-w-0 flex-1"><h2 id={titleId} className="text-[22px] font-bold leading-tight tracking-[-1px] sm:text-[28px]">{t('gest_res_anuncio_titulo')}</h2><p className="mt-1 text-[14px] font-medium tracking-[-.7px] text-[#69649b] sm:text-[14px]">{ativo.titulo}</p></div><button type="button" onClick={onClose} aria-label={t('gest_res_anuncio_fechar')} className="-mr-1 flex min-h-11 min-w-11 items-center justify-center"><IconeGestao icon={X} size={20} /></button></header>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <Pesquisa label={t('gest_res_anuncio_anuncio')} placeholder={t('gest_res_anuncio_pesquisar_anuncio')} value={anuncioId} options={anuncios.map(a => ({ value: String(a.id), label: a.titulo }))} onChange={v => { setAnuncioId(v); setCliente(''); }} hint={t('gest_res_anuncio_pesquisar_anuncio')} />
        <Pesquisa label={t('gest_res_anuncio_cliente')} placeholder={t('gest_res_anuncio_pesquisar_cliente')} value={cliente} options={[{ value: '', label: t('gest_res_anuncio_todos') }, ...clientes.map(c => ({ value: c, label: c }))]} onChange={setCliente} />
        <div><div className="flex h-11 rounded-[12px] border border-[#b9bedb] bg-[#fafaff] p-px">{['dia','semana','intervalo'].map(m => <button type="button" key={m} aria-pressed={modo === m} onClick={() => setModo(m)} className={`flex-1 rounded-[11px] px-3 text-[15px] ${modo === m ? 'bg-[#1046ff] text-white' : 'text-[#11111d] hover:bg-blue-50'}`}>{t(`gest_res_anuncio_${m}`)}</button>)}</div><p className="mt-1.5 text-[14px] text-[#59558d]">{t('gest_res_anuncio_filtrar_data')}</p></div>
        <div className="flex items-start gap-2 pt-1"><input aria-label={t('gest_res_anuncio_data')} type="date" value={inicio} onChange={e => { if(e.target.value) setInicio(e.target.value); }} className="h-11 min-w-0 flex-1 rounded-lg border border-[#dce0ed] px-2 text-[#59558d]" />{modo === 'intervalo' && <input aria-label={t('gest_res_anuncio_fim')} type="date" min={inicio} value={fim} onChange={e => { if(e.target.value) setFim(e.target.value); }} className="h-11 min-w-0 flex-1 rounded-lg border border-[#dce0ed] px-2 text-[#59558d]" />}</div>
      </div>
      <div aria-live="polite" className="mb-4 mt-5 flex flex-wrap items-center gap-4 rounded-[18px] bg-[#d5e6ff] px-3 py-2.5 sm:gap-5"><strong className="text-[44px] font-bold leading-[1.12] text-[#1046ff] sm:text-[52px]">{filtradas.length}</strong><p className="flex-1 text-[14px] font-medium tracking-[-.6px] sm:text-[15px]">{t('gest_res_anuncio_periodo')}</p><div className="min-w-[210px] border-l border-[#8a94c0] pl-7 sm:min-w-[240px] sm:pl-7"><p className="text-[14px] leading-tight text-[#656295]">{t('gest_res_anuncio_total')}</p><strong className="text-[24px] font-bold leading-tight tracking-[-1px] sm:text-[28px]">{dinheiro(filtradas.reduce((n,r) => n + valor(r),0))}</strong></div></div>
      {loading ? <p role="status">{t('gest_res_anuncio_carregar')}</p> : error ? <p role="alert">{t('gest_res_anuncio_erro')}</p> : <div className="overflow-x-auto"><table className="w-full min-w-[590px] border-collapse text-[14px] tracking-[-.3px] sm:text-[16px]"><thead className="bg-[#f6f7fd]"><tr>{['cliente','data_reserva','estadia','valor','acoes'].map(k => <th key={k} className="border-b border-[#e2e7f5] px-3 py-3 text-left text-[14px] font-bold first:rounded-tl-xl last:rounded-tr-xl sm:text-[14px]">{t(`gest_res_anuncio_${k}`)}</th>)}</tr></thead><tbody>{filtradas.map(r => <tr key={r.id} className="border-b border-[#e2e7f5]"><td className="px-3 py-2.5">{r.cliente_nome}</td><td className="px-3 py-2.5">{new Date(`${String(r.data_reserva || r.created_at || r.data_criacao).slice(0,10)}T12:00:00`).toLocaleDateString(i18n.language === 'cv' ? 'pt-PT' : i18n.language)}</td><td className="whitespace-nowrap px-3 py-2.5">{r.periodo || '—'}</td><td className="whitespace-nowrap px-3 py-2.5 text-right font-bold">{dinheiro(valor(r))}</td><td className="px-4 py-2 text-center"><button type="button" aria-label={t('gest_res_anuncio_ver', { nome: r.cliente_nome })} onClick={() => navigate(`/gest/reserva/${encodeURIComponent(r.id)}/alojamento`)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-blue-50 disabled:opacity-50"><IconeGestao icon={Eye} size={22} /></button></td></tr>)}</tbody></table>{!filtradas.length && <p className="py-8 text-center text-base text-[#69649b]">{t('gest_res_anuncio_vazio')}</p>}</div>}
      <footer className="mt-5 flex items-center justify-end gap-4"><button type="button" onClick={onClose} className="min-h-11 rounded-[12px] border border-[#4b12ff] px-6 text-[14px] font-bold shadow-[inset_0_0_0_3px_#f4f1ff] hover:bg-violet-50">{t('gest_res_anuncio_fechar')}</button></footer>
    </section>
  </div>, document.body);
}
