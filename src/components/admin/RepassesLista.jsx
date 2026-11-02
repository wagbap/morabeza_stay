import React from 'react';
import { CalendarDays, UserRound, FileText, Eye, House, Car, Map as MapIcon, CircleCheck, Clock, CircleAlert, Loader2, ExternalLink, MoreHorizontal } from 'lucide-react';

const SmallIcon = ({ icon: Component, size = 12 }) => <Component size={size} strokeWidth={1.7} aria-hidden="true" />;
const tones = { pago: 'bg-emerald-100 text-emerald-700', disponivel: 'bg-emerald-100 text-emerald-700', verificar: 'bg-amber-100 text-amber-800', retido: 'bg-amber-100 text-amber-800', cancelado: 'bg-red-50 text-red-700', aguardar: 'bg-slate-100 text-slate-600', pendente: 'bg-slate-100 text-slate-600' };

function validationText(row, tr) {
  if (!row.validado_em) return tr('em_falta', 'Em falta');
  if (row.tipo === 'alojamento') return tr('checkin_validado', 'Check-in validado');
  if (row.tipo === 'carro') return tr('entrega_validada', 'Entrega validada');
  return tr('presenca_validada', 'Presença validada');
}

function completionText(row, tr) {
  if (!row.concluido) return tr('em_curso_curto', 'Em curso');
  if (row.estado === 'verificar') return tr('por_confirmar', 'Por confirmar');
  // Uma data passada, por si so, nao confirma a devolucao nem a prestacao.
  const confirmed = row.confirmado_em || ['concluida', 'concluída', 'finalizada', 'completed'].includes(String(row.status).toLowerCase());
  if (!confirmed) return tr('fim_atingido', 'Fim do serviço atingido');
  if (row.tipo === 'carro') return tr('devolucao_confirmada', 'Devolução confirmada');
  if (row.tipo === 'experiencia') return tr('sessao_concluida', 'Sessão concluída');
  return tr('estadia_concluida', 'Estadia concluída');
}

function serviceText(row, tr) {
  return row.tipo === 'alojamento' ? tr('alojamento_singular', 'Alojamento') : row.tipo === 'carro' ? tr('carro_singular', 'Carro') : tr('experiencia_singular', 'Experiência');
}

export default function RepassesLista(props) {
  const { rows, historic, tab, loading, labels, services, reasons, tr, money, date, onOpen } = props;
  const history = tab === 'historico';
  const items = history ? historic : rows;
  if (loading || !items.length) return <CompactCards {...props} />;
  const headers = history
    ? [tr('data', 'Data'), tr('prestador', 'Prestador'), tr('reserva', 'Reserva'), tr('valor', 'Valor'), tr('referencia', 'Referência'), tr('estado', 'Estado'), tr('comprovativo', 'Comprovativo')]
    : [tr('reserva_servico', 'Reserva / Serviço'), tr('prestador', 'Prestador'), tr('bruto_comissao', 'Bruto / Comissão 10%'), tr('liquido', 'Líquido'), tr('validacao', 'Validação'), tr('conclusao', 'Conclusão'), tr('estado_prazo', 'Estado / Prazo'), tr('acoes', 'Ações')];
  return <>
    <div className="lg:hidden"><CompactCards {...props} /></div>
    <div className="hidden overflow-hidden rounded-xl border border-[#dbe3ef] bg-white lg:block">
      <div className="overflow-x-auto"><table className="w-full min-w-[1000px] table-auto text-left text-[11px] leading-[1.45] text-[#10164b]">
        <thead className="border-b border-[#e2e8f2] bg-[#f3f6fa] text-[10px] text-[#52618b]"><tr>{headers.map(header => <th key={header} className="px-3 py-2.5 font-semibold">{header}</th>)}</tr></thead>
        <tbody className="divide-y divide-[#e8edf5]">{items.map(row => history
          ? <tr key={row.id} className="hover:bg-[#f8faff]"><td className="whitespace-nowrap px-3 py-3 text-[10px] text-slate-500">{date(row.data_transferencia || row.registado_em)}</td><td className="px-3 py-3 font-semibold">{row.prestador_nome}</td><td className="px-3 py-3 text-slate-500">{row.tipo ? `${services[row.tipo]} #${row.reserva_id}` : tr('sem_vinculo', 'Sem reserva associada')}</td><td className="whitespace-nowrap px-3 py-3 font-bold">{money(Math.round(Number(row.valor) * 100))}</td><td className="px-3 py-3 text-slate-500">{row.referencia || '—'}</td><td className="px-3 py-3"><span className={`inline-block rounded-md px-2 py-1 text-[10px] font-medium ${tones[row.estado] || tones.pendente}`}>{labels[row.estado] || row.estado}</span></td><td className="px-3 py-3">{row.comprovativo_url ? <a href={row.comprovativo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"><SmallIcon icon={Eye} />{tr('ver', 'Ver')}</a> : <span className="text-[10px] text-slate-400">{tr('sem_comprovativo', 'Sem comprovativo')}</span>}</td></tr>
          : <tr key={`${row.tipo}-${row.reserva_id}`} className="align-middle hover:bg-[#f8faff]">
            <td className="max-w-52 px-3 py-3"><button onClick={() => onOpen('detalhes', row)} className="inline-flex items-center gap-1.5 font-bold text-[#001b67] underline underline-offset-2">{row.codigo_reserva}<span className="text-blue-600"><SmallIcon icon={ExternalLink} size={11} /></span></button><p className="mt-0.5 text-[10px] text-[#5d6b96]">{serviceText(row, tr)} · {row.anuncio_titulo}</p><div className="mt-1.5 flex flex-wrap gap-1.5"><button onClick={() => onOpen('detalhes', row)} className="cursor-pointer rounded bg-blue-50 px-1.5 py-0.5 text-[9px] text-blue-600 transition-colors hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1">{tr('ver_detalhes', 'Ver detalhes')}</button><span className={`rounded px-1.5 py-0.5 text-[9px] ${row.cliente_pago ? 'bg-emerald-100/75 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{row.cliente_pago ? tr('cliente_pago', 'Cliente: pago') : tr('cliente_pendente', 'Cliente: por pagar')}</span></div></td>
            <td className="px-3 py-4 font-medium">{row.prestador_nome}</td>
            <td className="whitespace-nowrap px-3 py-4"><strong>{money(row.bruto_centavos)}</strong><p className="mt-0.5 text-[10px] text-[#6072a3]">−{money(row.comissao_centavos)}</p></td>
            <td className="whitespace-nowrap px-3 py-4 font-bold">{money(row.liquido_centavos)}</td>
            <td className="px-3 py-4"><span className="inline-flex items-center gap-1.5 text-[10px]"><span className={row.validado_em ? 'text-emerald-600' : 'text-amber-600'}><SmallIcon icon={row.validado_em ? CircleCheck : CircleAlert} size={13} /></span><span className={!row.validado_em ? 'text-amber-600' : ''}>{validationText(row, tr)}</span></span></td>
            <td className="px-3 py-4"><span className="inline-flex items-center gap-1.5 text-[10px]"><span className={row.concluido && row.estado !== 'verificar' ? 'text-emerald-600' : 'text-[#10164b]'}><SmallIcon icon={row.concluido && row.estado !== 'verificar' ? CircleCheck : Clock} size={13} /></span><span className={!row.concluido ? 'font-semibold' : ''}>{completionText(row, tr)}</span></span><p className="mt-1 text-[9px] text-[#6072a3]">{row.estado === 'verificar' ? tr('fim_previsto', 'Fim previsto:') : row.tipo === 'alojamento' ? tr('checkout', 'Check-out:') : ''} {date(row.fim)}</p></td>
            <td className="px-3 py-3"><span className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px] font-medium ${row.estado === 'disponivel' ? 'text-emerald-600' : row.estado === 'verificar' ? 'text-amber-600' : tones[row.estado] || tones.pendente}`}>{['disponivel', 'verificar'].includes(row.estado) ? <span className={`h-2 w-2 rounded-full ${row.estado === 'disponivel' ? 'bg-emerald-600' : 'bg-amber-500'}`} /> : <SmallIcon icon={row.estado === 'aguardar' ? Clock : CircleAlert} size={12} />}{labels[row.estado]}</span>{row.prazo && <p className="mt-1 text-[9px] text-[#6072a3]">{tr('prazo', 'Prazo:')} {date(row.prazo)}</p>}{(row.atrasado || row.vence_hoje) && <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-medium ${row.atrasado ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{row.atrasado ? tr('atrasado', 'Em atraso') : tr('vence_hoje', 'Vence hoje')}</span>}</td>
            <td className="min-w-40 px-3 py-3"><div className="flex items-center gap-2"><div className="min-w-0 flex-1">{(['verificar', 'retido'].includes(row.estado)) && <button onClick={() => onOpen('verificar', row)} className="mb-1 w-full rounded-md border border-blue-900 px-2 py-1.5 text-[10px] font-medium text-blue-900 hover:bg-blue-50">{tr('verificar', 'Verificar')}</button>}<button disabled={!row.pode_registar} onClick={() => onOpen('registar', row)} className="w-full rounded-md bg-[#00276b] px-2 py-2 text-[10px] font-medium text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-[#eef0f5] disabled:text-[#929bb2] disabled:shadow-none">{tr('registar', 'Registar repasse')}</button><p className="mt-1 text-[9px] text-[#6072a3]">{reasons[row.motivo]}</p></div><button onClick={() => onOpen('detalhes', row)} aria-label={tr('ver_detalhes', 'Ver detalhes')} className="rounded p-1 text-blue-950 hover:bg-blue-50"><SmallIcon icon={MoreHorizontal} size={16} /></button></div></td>
          </tr>)}</tbody>
      </table></div>
      <footer className="flex justify-between gap-3 border-t border-[#e8edf5] px-3 py-2 text-[10px] text-[#6072a3]"><span>{items.length} {history ? tr('registos', 'registos') : tr('reservas_pendentes', 'reservas pendentes')}</span><span>{tr('exclusao_saldo', 'Por verificar e retidos não integram o saldo disponível.')}</span></footer>
    </div>
  </>;
}

function CompactCards({ rows, historic, tab, loading, labels, services, reasons, tr, money, date, onOpen, language }) {
  const history = tab === 'historico';
  const items = history ? historic : rows;
  const groups = new Map();
  items.forEach(row => {
    const key = String(history ? row.data_transferencia || row.registado_em : row.fim).slice(0, 7);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });
  if (loading) return <div role="status" className="flex items-center justify-center gap-2 py-12 text-xs text-slate-500"><span className="animate-spin"><SmallIcon icon={Loader2} size={16} /></span>{tr('carregar', 'A carregar repasses…')}</div>;
  if (!items.length) return <div className="rounded-2xl border border-slate-100 bg-white py-12 text-center text-xs text-slate-500">{tr('sem_resultados', 'Nenhum registo para os filtros selecionados.')}</div>;
  return <div className="space-y-5">{[...groups].sort(([a], [b]) => b.localeCompare(a)).map(([month, group]) => <section key={month} className="space-y-2">
    <header className="flex items-center gap-2 px-1 text-blue-950"><SmallIcon icon={CalendarDays} size={14} /><h3 className="text-xs font-bold capitalize">{new Intl.DateTimeFormat(['cv', 'ir'].includes(language) ? 'pt-PT' : language, { month: 'long', year: 'numeric' }).format(new Date(`${month}-15T12:00:00`))}</h3><span className="rounded-full bg-slate-200/75 px-2 py-0.5 text-[9px] font-medium">{group.length} {tr('registos', 'registos')}</span><span className="ml-2 h-px flex-1 bg-slate-200" /></header>
    {group.map(row => {
      const TypeIcon = { alojamento: House, carro: Car, experiencia: MapIcon }[row.tipo] || FileText;
      const estado = row.estado;
      return <article key={history ? row.id : `${row.tipo}-${row.reserva_id}`} className="flex flex-wrap items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_2px_2px_0_rgba(15,23,42,0.07)] transition-shadow hover:shadow-sm sm:flex-nowrap sm:items-center">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 sm:mt-0"><SmallIcon icon={TypeIcon} size={15} /></span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="text-slate-400"><SmallIcon icon={UserRound} /></span><h4 className="text-xs font-bold text-slate-900">{row.prestador_nome}</h4>{row.prestador_email && <span className="max-w-56 truncate text-[9px] text-slate-400">{row.prestador_email}</span>}<span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${tones[estado] || tones.pendente}`}><SmallIcon icon={['pago', 'disponivel'].includes(estado) ? CircleCheck : estado === 'aguardar' ? Clock : CircleAlert} size={10} />{labels[estado] || estado}</span>{row.tipo && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-600">{services[row.tipo]}</span>}</div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-600"><span className="text-slate-400"><SmallIcon icon={FileText} /></span>{history ? <span>{row.referencia || (row.reserva_id ? `#${row.reserva_id}` : tr('sem_vinculo', 'Sem reserva associada'))}</span> : <><button onClick={() => onOpen('detalhes', row)} className="text-left hover:text-blue-700">{row.codigo_reserva}</button><span className="font-normal text-slate-400">·</span><span className="font-normal">{row.anuncio_titulo}</span></>}</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] leading-4 text-slate-500">{history ? <><span>{tr('data', 'Data')}: <strong className="font-semibold">{date(row.data_transferencia || row.registado_em)}</strong></span><span>{tr('valor', 'Valor')}: <strong className="font-semibold text-slate-700">{money(Math.round(Number(row.valor) * 100))}</strong></span>{!row.comprovativo_url && <span className="text-slate-400">{tr('sem_comprovativo', 'Sem comprovativo')}</span>}</> : <><span>{tr('valor', 'Valor')}: <strong className="font-semibold text-slate-600">{money(row.bruto_centavos)}</strong></span><span>{tr('comissao', 'Comissão 10%')}: <strong className="font-semibold">−{money(row.comissao_centavos)}</strong></span><span className="text-emerald-700">{tr('liquido', 'Líquido')}: <strong className="font-semibold">{money(row.liquido_centavos)}</strong></span><span>{tr('fim', 'Fim:')} <strong className="font-semibold">{date(row.fim)}</strong></span>{row.prazo && <span className={row.atrasado ? 'text-red-600' : 'text-blue-600'}>{tr('prazo', 'Prazo:')} <strong className="font-semibold">{date(row.prazo)}</strong>{row.atrasado ? ` · ${tr('atrasado', 'Em atraso')}` : row.vence_hoje ? ` · ${tr('vence_hoje', 'Vence hoje')}` : ''}</span>}</>}</div>
          {!history && <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px]"><span className={row.cliente_pago ? 'text-emerald-600' : 'text-amber-600'}>{row.cliente_pago ? tr('cliente_pago', 'Cliente: pago') : tr('cliente_pendente', 'Cliente: por pagar')}</span><span className={row.validado_em ? 'text-emerald-600' : 'text-slate-400'}>{validationText(row, tr)}</span><span className="text-slate-400">{reasons[row.motivo]}</span></div>}
        </div>
        <div className="flex w-full shrink-0 items-center justify-end gap-2 pl-[52px] sm:w-auto sm:gap-3 sm:pl-0">{!history && <div className="flex flex-col gap-1.5 sm:flex-row">{(['verificar', 'retido'].includes(row.estado)) && <button onClick={() => onOpen('verificar', row)} className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-blue-900 hover:bg-slate-50">{tr('verificar', 'Verificar')}</button>}<button disabled={!row.pode_registar} onClick={() => onOpen('registar', row)} className="rounded-lg bg-[#003580] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">{tr('registar', 'Registar repasse')}</button></div>}{history ? row.comprovativo_url && <a href={row.comprovativo_url} target="_blank" rel="noopener noreferrer" aria-label={tr('comprovativo', 'Comprovativo')} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><SmallIcon icon={Eye} size={15} /></a> : <button onClick={() => onOpen('detalhes', row)} aria-label={tr('ver_detalhes', 'Ver detalhes')} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><SmallIcon icon={Eye} size={15} /></button>}</div>
      </article>;
    })}
  </section>)}</div>;
}
