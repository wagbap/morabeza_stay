import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CampoDataMorabeza from '../Calendario/CampoDataMorabeza';
import { pedirAgendaExperiencia } from '../../services/agendaExperiencias';

export default function CalendarioExperienciasAnfitriao({ experiencias }) {
  const { t } = useTranslation();
  const [id, setId] = useState('');
  const [mes, setMes] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [motivo, setMotivo] = useState('');
  const [panel, setPanel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const atual = id || String(experiencias[0]?.id || '');
  const dataLocal = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dias = Array.from({ length: new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate() }, (_, i) => dataLocal(new Date(mes.getFullYear(), mes.getMonth(), i + 1))); 
  useEffect(() => {
    if (!atual) return;
    const controller = new AbortController();
    setPanel(null); setError(''); setBusy(true);
    pedirAgendaExperiencia({ action: 'painel', experiencia_id: Number(atual) }, controller.signal)
      .then(setPanel).catch(e => { if (!controller.signal.aborted) setError(e.response?.data?.error || t('agenda_experiencia_erro', 'Não foi possível carregar a agenda.')); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [atual, t]);
  const guardar = async (action, dados) => {
    setBusy(true); setError('');
    try {
      const result = await pedirAgendaExperiencia({ action, dados, experiencia_id: Number(atual) });
      setPanel(result);
      if (action === 'guardar_excecao') { setInicio(''); setFim(''); setMotivo(''); }
    } catch (e) { setError(e.response?.data?.error || t('agenda_experiencia_erro_guardar', 'Não foi possível guardar.')); }
    finally { setBusy(false); }
  };
  return <div className="space-y-4">
    <label className="block text-sm">{t('carro_cal_anuncio')}<select value={atual} disabled={busy || !atual} onChange={e => setId(e.target.value)} className="mt-1 block max-w-full rounded-xl border border-gray-200 bg-white p-3">{experiencias.map(e => <option key={e.id} value={e.id}>{e.titulo}</option>)}</select></label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {busy && !panel && <p role="status">{t('calendario_a_carregar')}</p>}
    {panel && <>
      <div className="flex items-center gap-4"><button type="button" aria-label={t('carro_cal_anterior')} onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))} className="rounded-lg border border-gray-200 px-3 py-2">?</button><span className="font-semibold">{mes.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span><button type="button" aria-label={t('carro_cal_seguinte')} onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))} className="rounded-lg border border-gray-200 px-3 py-2">?</button></div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">{Array.from({ length: (mes.getDay() + 6) % 7 }, (_, i) => <div key={i} />)}{dias.map(d => { const bloqueado = (panel.excecoes || []).some(e => e.tipo === 'fechado' && e.inicio <= d && e.fim >= d); return <button type="button" key={d} disabled={busy} aria-pressed={Boolean(inicio && d >= inicio && d <= (fim || inicio))} onClick={() => { if (!inicio || fim) { setInicio(d); setFim(''); } else if (d < inicio) { setFim(inicio); setInicio(d); } else setFim(d); }} className={`min-h-12 rounded-lg border p-2 text-sm ${bloqueado ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200 bg-white'} ${inicio && d >= inicio && d <= (fim || inicio) ? 'ring-2 ring-blue-600' : ''}`}>{Number(d.slice(-2))}</button>; })}</div>
      <p className="text-sm text-gray-600">{t('agenda_experiencia_reservas_aviso' , 'Antes de aplicar alterações, reveja as saídas com reservas. As reservas confirmadas são preservadas.')}</p>
      <form className="flex flex-wrap items-end gap-3" onSubmit={e => { e.preventDefault(); if (inicio && fim >= inicio && motivo.trim()) guardar('guardar_excecao', { inicio, fim, motivo: motivo.trim(), tipo: 'fechado' }); }}>
        <label className="text-sm">{t('carro_cal_inicio')}<CampoDataMorabeza required value={inicio} onChange={e => setInicio(e.target.value)} className="block rounded-lg border border-gray-200 p-2" /></label>
        <label className="text-sm">{t('carro_cal_fim')}<CampoDataMorabeza required min={inicio} value={fim} onChange={e => setFim(e.target.value)} className="block rounded-lg border border-gray-200 p-2" /></label>
        <label className="text-sm">{t('carro_cal_motivo')}<input required maxLength={255} value={motivo} onChange={e => setMotivo(e.target.value)} className="block rounded-lg border border-gray-200 p-2" /></label>
        <button disabled={busy || !inicio || !fim || fim < inicio || !motivo.trim()} className="rounded-lg bg-blue-700 px-4 py-2 text-sm text-white disabled:opacity-50">{t('carro_cal_bloquear')}</button>
      </form>
      <div className="space-y-2">{(panel.excecoes || []).filter(e => e.tipo === 'fechado').map(e => <div key={e.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm"><span>{e.inicio} – {e.fim}</span><span className="flex-1">{e.motivo}</span><button type="button" disabled={busy} onClick={() => guardar('remover_excecao', { id: e.id })} className="rounded-lg border border-gray-200 px-3 py-2 disabled:opacity-50">{t('carro_cal_desbloquear')}</button></div>)}</div>
    </>}
  </div>;
}
