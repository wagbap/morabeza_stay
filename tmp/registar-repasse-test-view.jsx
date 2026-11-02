import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Info, Landmark, ReceiptText, LockKeyhole, CloudUpload, CircleCheck, CircleAlert, FileText, X, Loader2, ExternalLink } from 'lucide-react';
const pedirRepasses = async () => { throw Error("Unexpected request in SSR"); }; const enviarComprovativoRepasse = pedirRepasses;

const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const money = value => `${new Intl.NumberFormat('de-DE', { minimumFractionDigits: Number(value) % 100 ? 2 : 0, maximumFractionDigits: 2 }).format(Number(value || 0) / 100)} CVE`;
const Icon = ({ icon: Component, size = 20, className = '' }) => <span className={`inline-flex shrink-0 ${className}`}><Component size={size} strokeWidth={1.8} aria-hidden="true" /></span>;
const input = 'mt-1.5 w-full rounded-md border border-[#ccd7eb] bg-white px-3 py-2.5 text-xs text-[#10164b] outline-none placeholder:text-[#8b94b6] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400';

export default function RegistarRepasse() {
  const { tipo, id } = useParams();
  const { t } = useTranslation();
  const tr = (key, fallback) => t(`admin_repasses_${key}`, fallback);
  const navigate = useNavigate();
  const [row, setRow] = useState({"reserva_id":1,"codigo_reserva":"MS-EXEMPLO-002","status":"concluida","pagamento_status":"pago","preco_total":10000,"fim":"2026-10-26","inicio":"2026-10-25","anuncio_id":1,"anuncio_titulo":"Toyota Yaris","prestador_id":2,"prestador_nome":"Santiago Rent","prestador_email":"seed-repasses-rent@example.invalid","iban_numero":"TESTE-NAO-TRANSFERIR-02","iban_titular":"Santiago Rent","validado_em":"2026-10-26 09:00:00","confirmado_em":null,"confirmacao_motivo":null,"repasse_id":null,"legado_total":0,"tipo":"carro","bruto_centavos":1000000,"comissao_centavos":100000,"liquido_centavos":900000,"legado_centavos":0,"tem_iban":true,"estado":"disponivel","motivo":"pronto","cliente_pago":true,"concluido":true,"prazo":"2026-10-29","atrasado":true,"vence_hoje":false,"pode_registar":true,"pode_confirmar":false,"iban_banco":"Banco de teste","iban_pais":"Cabo Verde"});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [form, setForm] = useState({ data_transferencia: '', referencia: '', observacoes: '', confirmada: false });
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef(null);
  const key = useRef('');
  useEffect(() => {
    const controller = new AbortController();
    key.current = crypto.randomUUID(); setRow(null); setLoading(true); setError(''); setSaved(false); setReveal(false);
    setForm({ data_transferencia: '', referencia: '', observacoes: '', confirmada: false }); setFile(null); setUploaded(null);
    window.scrollTo(0, 0);
    (async () => {
      try {
        if (!['alojamento', 'carro', 'experiencia'].includes(tipo) || !/^[1-9]\d*$/.test(id || '')) throw new Error('INVALID_BOOKING');
        const data = await pedirRepasses({ action: 'painel' }, controller.signal);
        const booking = data.reservas.find(r => r.tipo === tipo && String(r.reserva_id) === id);
        if (!booking) throw new Error('BOOKING_NOT_FOUND');
        if (!controller.signal.aborted) setRow(booking);
      } catch (err) { if (!controller.signal.aborted) setError(err.response?.data?.message || tr('registo_carregar_erro', 'Não foi possível carregar esta reserva. Volte aos repasses e tente novamente.')); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [tipo, id]);

  const chooseFile = async selected => {
    if (!selected || busy || saved) return;
    const extension = selected.name.split('.').pop().toLowerCase();
    const bytes = new Uint8Array(await selected.slice(0, 8).arrayBuffer());
    const pdf = extension === 'pdf' && String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-';
    const jpg = ['jpg', 'jpeg'].includes(extension) && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const png = extension === 'png' && [137,80,78,71,13,10,26,10].every((value, i) => bytes[i] === value);
    setUploaded(null);
    if ((!pdf && !jpg && !png) || !selected.size || selected.size > 10 * 1024 * 1024) {
      setFile(null); if (fileInput.current) fileInput.current.value = '';
      setError(tr('comprovativo_invalido', 'Selecione um PDF, JPG ou PNG válido, até 10 MB.')); return;
    }
    setFile(selected); setError('');
  };
  const canSave = row?.pode_registar && row.validado_em && !saved && !busy && form.confirmada && form.data_transferencia && form.data_transferencia <= today() && form.referencia.trim().length >= 3 && file;
  const submit = async event => {
    event.preventDefault(); if (!canSave) return;
    setBusy(true); setError('');
    try {
      const url = uploaded?.file === file ? uploaded.url : await enviarComprovativoRepasse(file);
      setUploaded({ file, url });
      await pedirRepasses({ action: 'registar_repasse', tipo, reserva_id: Number(id), valor: row.liquido_centavos / 100,
        data_transferencia: form.data_transferencia, referencia: form.referencia.trim(), observacoes: form.observacoes.trim(),
        comprovativo_url: url, pedido_chave: key.current, transferencia_confirmada: form.confirmada });
      setSaved(true); setRow(current => ({ ...current, estado: 'pago', pode_registar: false }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { setError(err.response?.data?.message || tr('registo_guardar_erro', 'Não foi possível guardar o registo. Verifique os dados e tente novamente.')); }
    finally { setBusy(false); }
  };
  const services = { alojamento: tr('alojamento_singular', 'Alojamento'), carro: tr('carro_singular', 'Carro'), experiencia: tr('experiencia_singular', 'Experiência') };
  const maskedIban = row?.iban_numero ? `${row.iban_numero.slice(0, 2)}•• ••••• ••••• ••••• ${row.iban_numero.slice(-4)}` : '—';
  const locked = busy || saved || !row?.pode_registar;
  const conditions = row ? [
    [tr('servico_concluido', 'Serviço concluído'), row.concluido],
    [tr('qr_registado', 'Validação QR registada'), Boolean(row.validado_em)],
    [tr('iban_confirmado', 'IBAN confirmado'), row.tem_iban],
    [tr('sem_retencao', 'Sem retenção ativa'), row.estado === 'disponivel' || row.estado === 'pago'],
  ] : [];
  const blockTitle = (Component, title) => <h2 className="mb-3 flex items-center gap-3 border-b border-[#e5ebf5] pb-3 text-base font-bold tracking-tight text-[#0c1554]"><Icon icon={Component} size={24} />{title}</h2>;
  const section = 'rounded-lg border border-[#dce8fa] bg-white/90 p-4 lg:p-5';
  const backDetails = () => navigate('/admin/repasses', { state: { detalhes: { tipo, id: Number(id) } } });
  return <div className="-m-4 min-h-full space-y-3 bg-gradient-to-br from-white to-blue-50/50 p-4 text-[#111849] sm:-m-6 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#52659a]"><nav aria-label={tr('navegacao', 'Navegação')} className="flex items-center gap-2"><Link className="hover:underline" to="/admin/repasses">{tr('repasses', 'Repasses')}</Link><span>/</span><button onClick={backDetails} className="hover:underline">{row?.codigo_reserva || `#${id}`}</button><span>/</span><span>{tr('registar', 'Registar repasse')}</span></nav><span>{tr('hoje', 'Hoje:')} <strong className="font-medium text-[#10164b]">{today().split('-').reverse().join('/')}</strong></span></div>
    <button onClick={backDetails} disabled={busy} className="inline-flex items-center gap-2 text-xs text-blue-600 hover:underline"><Icon icon={ArrowLeft} size={16} />{tr('voltar_detalhes', 'Voltar aos detalhes')}</button>
    <header><h1 className="text-2xl font-bold tracking-tight text-[#0c1554] sm:text-3xl">{tr('registar', 'Registar repasse')}</h1><p className="mt-1 text-sm text-[#596b9b]">{tr('registo_subtitulo', 'Associe à reserva uma transferência bancária já realizada.')}</p></header>
    <aside className="flex items-center gap-3 rounded-lg border border-blue-200/70 bg-blue-50 px-4 py-3 text-xs text-blue-700"><Icon icon={Info} />{tr('registo_aviso', 'Este registo não envia dinheiro. Confirme a transferência no banco antes de guardar.')}</aside>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}
    {saved && <div role="status" className="flex flex-wrap items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><Icon icon={CircleCheck} /><span className="flex-1">{tr('registo_sucesso', 'Repasse registado com sucesso. O saldo foi atualizado.')}</span><Link to="/admin/repasses" state={{ tab: 'historico', month: form.data_transferencia.slice(0, 7) }} className="font-semibold underline">{tr('ver_historico', 'Ver histórico')}</Link></div>}
    {loading ? <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500"><Icon icon={Loader2} className="animate-spin" />{tr('carregar', 'A carregar repasses…')}</div> : row && <>
      {!row.pode_registar && !saved && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{tr('registo_bloqueado', 'Esta reserva não está disponível para um novo repasse. Verifique o QR, a conclusão, o pagamento, o IBAN e os registos anteriores.')}</p>}
      <div className="grid items-start gap-3 xl:grid-cols-[1.42fr_1fr]">
        <form onSubmit={submit} className={`${section} space-y-3.5`}>
          {blockTitle(Landmark, tr('dados_transferencia', 'Dados da transferência'))}
          <label className="block text-xs">{tr('reserva', 'Reserva')}<input readOnly value={`${row.codigo_reserva} — ${services[tipo]} · ${row.anuncio_titulo}`} className={`${input} bg-[#f3f6fa]`} /></label>
          <div className="grid gap-3 sm:grid-cols-2"><div><p className="text-xs">{tr('valor_repasse', 'Valor do repasse')}</p><div className="mt-1.5 flex items-center gap-3 rounded-md border border-[#dce5f4] bg-[#f1f4f8] px-3 py-2 text-lg font-bold"><Icon icon={LockKeyhole} className="text-[#65729d]" />{money(row.liquido_centavos)}</div><p className="mt-1 text-[11px] text-[#7b89ad]">{tr('liquido_reserva', 'Valor líquido desta reserva.')}</p></div><label className="block text-xs">{tr('data_transferencia', 'Data da transferência')} <span className="text-red-500">*</span><input required disabled={locked} type="date" max={today()} value={form.data_transferencia} onChange={e => setForm({ ...form, data_transferencia: e.target.value })} className={input} /></label></div>
          <label className="block text-xs">{tr('referencia_bancaria', 'Referência bancária')} <span className="text-red-500">*</span><input required disabled={locked} minLength={3} maxLength={150} placeholder={tr('referencia_placeholder', 'Introduzir a referência da transferência')} value={form.referencia} onChange={e => setForm({ ...form, referencia: e.target.value })} className={input} /></label>
          <div><p className="mb-1.5 text-xs">{tr('comprovativo_bancario', 'Comprovativo bancário')} <span className="text-red-500">*</span></p><input ref={fileInput} type="file" id="comprovativo-repasse" className="peer sr-only" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" disabled={locked} aria-required="true" aria-describedby="comprovativo-ajuda" onChange={e => void chooseFile(e.target.files[0])} /><label htmlFor="comprovativo-repasse" onDragOver={e => { e.preventDefault(); if (!locked) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); if (!locked) void chooseFile(e.dataTransfer.files[0]); }} className={`flex min-h-28 flex-col items-center justify-center gap-1 rounded-md border border-dashed p-4 text-center transition peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 ${locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${dragging ? 'border-blue-500 bg-blue-50' : 'border-[#b9c9e4] bg-[#f7f9fc] hover:bg-blue-50/50'}`}><Icon icon={file ? FileText : CloudUpload} size={30} className="mb-1 text-[#6676a4]" /><span className="text-xs font-medium">{file ? tr('substituir_comprovativo', 'Substituir comprovativo') : tr('anexar_comprovativo', 'Anexar comprovativo')}</span><span className="text-[11px] text-[#7b89ad]">{tr('formatos_comprovativo', 'PDF, JPG ou PNG · máximo 10 MB')}</span></label><p id="comprovativo-ajuda" className="mt-1 text-[10px] text-[#7b89ad]">{tr('comprovativo_associado', 'O comprovativo ficará associado a este repasse.')}</p>{file && <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 p-2 text-xs"><Icon icon={FileText} className="text-blue-600" /><span className="min-w-0 flex-1 truncate">{file.name}<small className="ml-2 text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</small></span><button disabled={locked} type="button" aria-label={tr('remover_pdf', 'Remover ficheiro')} onClick={() => { setFile(null); setUploaded(null); if (fileInput.current) fileInput.current.value = ''; }} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"><Icon icon={X} size={16} /></button></div>}</div>
          <label className="block text-xs">{tr('observacoes_internas', 'Observações internas (opcional)')}<textarea disabled={locked} maxLength={500} rows={3} placeholder={tr('observacoes_placeholder', 'Adicionar uma nota para a administração')} value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} className={input} /></label>
          <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed"><input required disabled={locked} type="checkbox" checked={form.confirmada} onChange={e => setForm({ ...form, confirmada: e.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-[#003580]" />{tr('confirmar_transferencia', 'Confirmo que a transferência foi concluída para os dados de recebimento indicados.')}</label>
          <div className="border-t border-[#e5ebf5] pt-3"><div className="flex gap-3"><button type="button" disabled={busy} onClick={() => navigate('/admin/repasses')} className="w-1/3 rounded-md border border-blue-900 bg-white px-3 py-2.5 text-xs text-blue-950 hover:bg-blue-50 disabled:opacity-50">{tr('cancelar', 'Cancelar')}</button><button disabled={!canSave} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#00276b] px-3 py-2.5 text-xs font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-[#c4ccda]">{busy && <Icon icon={Loader2} size={16} className="animate-spin" />}{busy ? tr('registar_progresso', 'A registar…') : tr('guardar_repasse', 'Guardar registo do repasse')}</button></div><p className="mt-1.5 text-right text-[10px] text-[#7b89ad]">{tr('preencher_obrigatorios', 'Preencha os campos obrigatórios e confirme a transferência.')}</p></div>
        </form>
        <div className="space-y-3">
          <section className={section}>{blockTitle(ReceiptText, tr('resumo_reserva', 'Resumo da reserva'))}<dl className="space-y-2 text-xs">{[[tr('prestador', 'Prestador'), row.prestador_nome], [tr('servico', 'Serviço'), `${services[tipo]} · ${row.anuncio_titulo}`], [tr('pago_cliente', 'Pago pelo cliente'), money(row.bruto_centavos)], [tr('comissao', 'Comissão 10%'), `− ${money(row.comissao_centavos)}`]].map(([label, value]) => <div key={label} className="grid grid-cols-[0.85fr_1.3fr] gap-3"><dt className="text-[#6b7ba5]">{label}</dt><dd>{value}</dd></div>)}</dl><div className="my-3 flex items-center justify-between gap-3 border-y border-[#e5ebf5] py-3"><strong className="text-sm">{tr('liquido_repassar', 'Líquido a repassar')}</strong><strong className="text-xl tracking-tight">{money(saved || row.estado === 'pago' ? 0 : row.liquido_centavos)}</strong></div><div className="flex justify-between text-xs"><span className="text-[#6b7ba5]">{tr('ja_repassado', 'Já repassado')}</span><strong className="text-base">{money(saved || row.estado === 'pago' ? row.liquido_centavos : 0)}</strong></div></section>
          <section className={section}><div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5ebf5] pb-3"><h2 className="flex items-center gap-3 text-base font-bold tracking-tight"><Icon icon={Landmark} size={24} />{tr('destino_repasse', 'Destino do repasse')}</h2><span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] ${row.tem_iban ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}><Icon icon={row.tem_iban ? CircleCheck : CircleAlert} size={15} />{row.tem_iban ? tr('iban_confirmado', 'IBAN confirmado') : tr('sem_iban', 'IBAN por confirmar')}</span></div><dl className="mt-3 space-y-2 text-xs">{[[tr('titular', 'Titular'), row.iban_titular || '—'], [tr('banco', 'Banco'), row.iban_banco || '—'], [tr('pais', 'País'), row.iban_pais || '—'], [tr('iban_label', 'IBAN'), reveal ? row.iban_numero : maskedIban]].map(([label, value]) => <div key={label} className="grid grid-cols-[0.85fr_1.3fr] gap-3"><dt className="text-[#6b7ba5]">{label}</dt><dd className="break-all">{value}</dd></div>)}</dl>{row.tem_iban && <button type="button" onClick={() => setReveal(!reveal)} className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-600 underline">{reveal ? tr('ocultar_dados', 'Ocultar dados autorizados') : tr('consultar_dados', 'Consultar dados autorizados')}<Icon icon={ExternalLink} size={14} /></button>}</section>
          <section className={`rounded-lg border p-4 lg:p-5 ${conditions.every(([, valid]) => valid) ? 'border-emerald-100 bg-emerald-50 text-emerald-950' : 'border-amber-100 bg-amber-50 text-amber-950'}`}><h2 className="mb-3 flex items-center gap-3 text-sm font-bold"><Icon icon={conditions.every(([, valid]) => valid) ? CircleCheck : CircleAlert} size={24} />{tr('condicoes_verificadas', 'Condições verificadas')}</h2><ul className="space-y-2.5 pl-1 text-xs">{conditions.map(([label, valid]) => <li key={label} className="flex items-center gap-3"><Icon icon={valid ? CircleCheck : CircleAlert} size={18} className={valid ? 'text-emerald-700' : 'text-amber-600'} />{label}</li>)}</ul></section>
        </div>
      </div>
      <aside className="flex items-start gap-3 rounded-lg border border-blue-200/70 bg-blue-50 px-4 py-3 text-[11px] text-blue-700"><Icon icon={Info} /><div><p>{tr('apos_guardar', 'Após guardar: o repasse ficará como Repassado e o saldo será atualizado.')}</p><p className="mt-0.5 text-[10px] text-[#7b89ad]">{tr('registo_auditoria', 'O registo guarda administrador, data, hora, referência e comprovativo e impede duplicações.')}</p></div></aside>
    </>}
  </div>;
}
