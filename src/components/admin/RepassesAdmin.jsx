import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, House, Car, Map, Clock, CreditCard, CircleAlert, CircleCheck, Bell, ArrowRight, History, Search, RefreshCw, CalendarDays, Info } from 'lucide-react';
import { pedirRepasses } from '../../services/repassesService';
import RepassesLista from './RepassesLista';

const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const money = cents => `${new Intl.NumberFormat('de-DE', { minimumFractionDigits: Number(cents) % 100 ? 2 : 0, maximumFractionDigits: 2 }).format(Number(cents || 0) / 100)} CVE`;
const date = value => value ? String(value).slice(0, 10).split('-').reverse().join('/') : '—';
const sum = list => list.reduce((total, r) => total + Number(r.liquido_centavos || 0), 0);
const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100';
const Icon = ({ icon: Component, className = '' }) => <span className={`inline-flex shrink-0 ${className}`}><Component size={18} strokeWidth={1.8} /></span>;

export default function RepassesAdmin() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const tr = (key, fallback) => t(`admin_repasses_${key}`, fallback);
  const [data, setData] = useState({ reservas: [], historico: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(location.state?.month ?? today().slice(0, 7));
  const [service, setService] = useState('todos');
  const [tab, setTab] = useState(location.state?.tab || 'pendentes');
  const [search, setSearch] = useState('');
  const [state, setState] = useState('todos');
  const table = useRef(null);
  const reload = async signal => {
    setLoading(true); setError('');
    try { setData(await pedirRepasses({ action: 'painel' }, signal)); }
    catch (err) { if (!signal?.aborted) setError(err.response?.data?.message || tr('erro_carregar', 'Não foi possível carregar os repasses. Tente atualizar a página.')); }
    finally { if (!signal?.aborted) setLoading(false); }
  };
  useEffect(() => { const c = new AbortController(); void reload(c.signal); window.scrollTo(0, 0); return () => c.abort(); }, []);
  const months = useMemo(() => [...new Set([today().slice(0, 7), ...data.reservas.map(r => String(r.fim).slice(0, 7)), ...data.historico.map(h => String(h.data_transferencia || h.registado_em).slice(0, 7))])].sort().reverse(), [data]);
  const matchService = r => service === 'todos' || r.tipo === service;
  const monthEnd = month ? `${month}-${new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate()}` : '';
  const scoped = data.reservas.filter(r => matchService(r) && (!month || (r.inicio <= monthEnd && r.fim >= `${month}-01`)));
  const pending = scoped.filter(r => r.estado !== 'pago');
  const matchesSearch = r => `${r.prestador_nome || ''} ${r.codigo_reserva || ''} ${r.referencia || ''}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
  const rows = pending.filter(r => matchesSearch(r) && (state === 'todos' || (state === 'atrasado' ? r.atrasado : r.estado === state)));
  const histScope = data.historico.filter(h => matchService(h) && (!month || String(h.data_transferencia || h.registado_em).startsWith(month)));
  const historic = histScope.filter(h => matchesSearch(h) && (state === 'todos' || h.estado === state));
  const paid = histScope.filter(h => h.estado === 'pago');
  const waiting = pending.filter(r => r.estado === 'aguardar');
  const available = pending.filter(r => r.estado === 'disponivel');
  const verify = pending.filter(r => r.estado === 'verificar');
  const held = pending.filter(r => r.estado === 'retido');
  const late = pending.filter(r => r.atrasado);
  const labels = { aguardar: tr('aguardar', 'A aguardar conclusão'), disponivel: tr('disponivel', 'Disponível'), verificar: tr('verificar_estado', 'Por verificar'), retido: tr('retido', 'Retido'), pago: tr('pago', 'Pago'), pendente: tr('pendente', 'Pendente'), cancelado: tr('cancelado', 'Cancelado') };
  const services = { alojamento: tr('alojamentos', 'Alojamentos'), carro: tr('carros', 'Carros'), experiencia: tr('experiencias', 'Experiências') };
  const reasons = { revisao: tr('retido', 'Retido'), em_curso: tr('em_curso', 'Serviço em curso'), pagamento: tr('pagamento_pendente', 'Pagamento não confirmado'), cancelada: tr('cancelada', 'Reserva cancelada'), validacao: tr('validacao_falta', 'Validação em falta'), legado: tr('legado', 'Repasses antigos por reconciliar'), iban: tr('sem_iban', 'IBAN por confirmar'), pronto: tr('iban_confirmado', 'IBAN confirmado'), pago: labels.pago };
  const open = (mode, row) => {
    if (mode === 'verificar') { navigate(`/admin/repasses/${row.tipo}/${row.reserva_id}/verificar`); return; }
    if (mode === 'registar') { navigate(`/admin/repasses/${row.tipo}/${row.reserva_id}/registar`); return; }
    if (row.tipo && row.reserva_id) navigate(`/admin/repasses/${row.tipo}/${row.reserva_id}`);
  };
  useEffect(() => {
    if (loading || !location.state?.detalhes) return;
    const target = location.state.detalhes;
    const row = data.reservas.find(r => r.tipo === target.tipo && Number(r.reserva_id) === Number(target.id));
    if (row) { navigate(`/admin/repasses/${row.tipo}/${row.reserva_id}`, { replace: true }); return; }
    navigate(location.pathname, { replace: true, state: null });
  }, [loading, data, location.state, location.pathname, navigate]);
  const cards = [
    [Clock, labels.aguardar, sum(waiting), waiting.length, 'bg-slate-100 text-[#10164b]'],
    [CreditCard, tr('disponivel_titulo', 'Disponível para repasse'), sum(available), available.length, 'bg-emerald-50 text-emerald-950'],
    [CircleAlert, tr('verificar_retido', 'Por verificar / Retido'), sum(verify) + sum(held), null, 'bg-amber-50 text-amber-800'],
    [CircleCheck, tr('repassado_periodo', 'Repassado no período'), paid.reduce((n, h) => n + Math.round(Number(h.valor) * 100), 0), paid.length, 'bg-blue-50 text-[#11195b]'],
  ];

  return <div className="-m-4 min-h-full space-y-4 bg-gradient-to-br from-white to-blue-50/40 p-4 text-[#111849] sm:-m-6 sm:p-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tr('titulo', 'Repasses aos prestadores')}</h1><p className="mt-1 text-sm text-slate-500 sm:text-base">{tr('subtitulo', 'Acompanhe os valores por reserva e registe as transferências manuais.')}</p></div>
      <div className="flex w-full flex-wrap items-center gap-2 text-xs sm:w-auto sm:flex-nowrap"><span className="shrink-0 whitespace-nowrap">{tr('hoje', 'Hoje:')} <strong>{date(today())}</strong></span><label className="relative min-w-0 flex-1 sm:w-44 sm:flex-none"><Icon icon={CalendarDays} className="pointer-events-none absolute left-3 top-3" /><select aria-label={tr('periodo', 'Período')} value={month} onChange={e => setMonth(e.target.value)} className={`${inputClass} pl-10`}><option value="">{tr('todos_periodos', 'Todos os períodos')}</option>{months.map(m => <option key={m} value={m}>{new Intl.DateTimeFormat(['cv', 'ir'].includes(i18n.language) ? 'pt-PT' : i18n.language, { month: 'long', year: 'numeric' }).format(new Date(`${m}-15T12:00:00`))}</option>)}</select></label><button disabled={loading} onClick={() => reload()} className="inline-flex h-[42px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 text-xs font-medium hover:bg-slate-50 disabled:opacity-50"><Icon icon={RefreshCw} className={loading ? 'animate-spin' : ''} />{tr('atualizar', 'Atualizar')}</button></div>
    </header>
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([Component, title, value, count, style]) => <section key={title} className={`flex gap-4 rounded-xl p-5 ${style}`}><span className="mt-0.5"><Component size={28} strokeWidth={1.7} /></span><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-2xl font-bold tracking-tight xl:text-[28px]">{loading || error ? '—' : money(value)}</p><p className="mt-1 text-xs opacity-75">{count === null ? `${labels.verificar}: ${money(sum(verify))} · ${labels.retido}: ${money(sum(held))}` : `${count} ${count === 1 ? tr('reserva_singular', 'reserva') : tr('reservas', 'reservas')}`}</p></div></section>)}</div>
    {(late.length > 0 || verify.length > 0) && <div className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-3 text-amber-800"><Icon icon={Bell} /><p className="flex-1 text-sm font-semibold">{late.length} {late.length === 1 ? tr('atraso_singular', 'repasse em atraso') : tr('atraso_plural', 'repasses em atraso')} · {verify.length} {verify.length === 1 ? tr('verificar_singular', 'reserva por verificar') : tr('verificar_plural', 'reservas por verificar')}</p><button onClick={() => { setTab('pendentes'); setState(late.length ? 'atrasado' : 'verificar'); table.current?.scrollIntoView({ behavior: 'smooth' }); }} className="flex items-center gap-2 text-sm text-blue-900 underline">{tr('ver_pendencias', 'Ver pendências')}<Icon icon={ArrowRight} /></button></div>}
    <nav aria-label={tr('servicos', 'Serviços')} className="flex flex-wrap gap-3">{[['todos', LayoutGrid, tr('todos_servicos', 'Todos os serviços')], ['alojamento', House, services.alojamento], ['carro', Car, services.carro], ['experiencia', Map, services.experiencia]].map(([key, Component, label]) => <button key={key} onClick={() => setService(key)} aria-pressed={service === key} className={`flex min-h-12 items-center gap-3 rounded-lg px-6 text-sm font-medium transition ${service === key ? 'bg-[#00276b] text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200'}`}><Icon icon={Component} />{label}</button>)}</nav>
    <div className="flex gap-5 border-b border-slate-200">{[['pendentes', CreditCard, tr('pendentes', 'Pendentes')], ['historico', History, tr('historico_titulo', 'Histórico · comprovativos')]].map(([key, Component, title]) => <button key={key} onClick={() => { setTab(key); setState('todos'); }} className={`flex items-center gap-3 border-b-[3px] px-3 py-3 text-left text-sm ${tab === key ? 'border-[#10165b] font-bold' : 'border-transparent text-slate-500'}`}><Icon icon={Component} /><span>{title}{key === 'historico' && <span className="mt-0.5 hidden text-xs font-normal sm:block">{tr('historico_subtitulo', 'Transferências registadas e comprovativos bancários')}</span>}</span></button>)}</div>
    <div className="flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Icon icon={Search} className="absolute left-4 top-3 text-slate-500" /><input aria-label={tr('pesquisar', 'Pesquisar prestador ou código da reserva')} placeholder={tr('pesquisar', 'Pesquisar prestador ou código da reserva')} value={search} onChange={e => setSearch(e.target.value)} className={`${inputClass} pl-12`} /></label><select aria-label={tr('estado', 'Estado')} value={state} onChange={e => setState(e.target.value)} className={`${inputClass} sm:w-64`}><option value="todos">{tr('todos_estados', 'Todos os estados')}</option>{(tab === 'pendentes' ? ['aguardar','disponivel','verificar','retido','atrasado'] : ['pago','pendente','cancelado']).map(s => <option key={s} value={s}>{labels[s] || tr('atrasado', 'Em atraso')}</option>)}</select></div>
    <section ref={table} className="space-y-3">
      <RepassesLista rows={rows} historic={historic} tab={tab} loading={loading} labels={labels} services={services} reasons={reasons} tr={tr} money={money} date={date} onOpen={open} language={i18n.language} />
      <p className="flex items-center gap-2 px-1 text-[10px] text-slate-400"><Icon icon={Clock} />{tr('exclusao_saldo', 'Por verificar e retidos não integram o saldo disponível.')}</p>
    </section>
    <aside className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-900"><Icon icon={Info} /><p>{tr('regra', 'Repasse manual até 3 dias úteis após elegibilidade. Exige QR Code validado, fim do serviço e IBAN confirmado.')}{' '}{tr('dias_uteis', 'O prazo considera segunda a sexta-feira; feriados não estão configurados.')}</p></aside>

  </div>;
}
