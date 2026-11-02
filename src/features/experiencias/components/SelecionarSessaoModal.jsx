import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Clock } from 'lucide-react';
import api from '../../../api/api';
import { sessoesDisponiveis, opcoesDuracao, sessoesDaDuracao } from '../sessoesCliente';

export default function SelecionarSessaoModal({ onClose, onSelectHorario, currentPeriodo, currentHorario, experienciaId, dataSelecionada, tokenRetencao }) {
  const { t } = useTranslation();
  const [sessoes, setSessoes] = useState([]), [selected, setSelected] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [duration, setDuration] = useState(null), [limit, setLimit] = useState(8);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError(''); setSelected(null); setSessoes([]);
    if (!experienciaId || !/^\d{4}-\d{2}-\d{2}$/.test(dataSelecionada || '')) {
      setError(t('experiencia_modal_sessoes_erro')); setLoading(false); return () => controller.abort();
    }
    api.post('/agenda_disponibilidade.php', { experiencia_id: experienciaId, data: dataSelecionada, token: tokenRetencao }, { signal: controller.signal }).then(({ data }) => {
      if (!data.success || !Array.isArray(data.sessoes)) throw new Error('INVALID_SESSIONS');
      if (!controller.signal.aborted) setSessoes(sessoesDisponiveis(data.sessoes.map(s => ({ ...s, hora_inicio: String(s.hora_inicio || '').slice(0, 5), hora_fim: String(s.hora_fim || '').slice(0, 5) }))));
    }).catch(() => { if (!controller.signal.aborted) setError(t('experiencia_modal_sessoes_erro')); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [experienciaId, dataSelecionada, tokenRetencao, t]);
  const durations=opcoesDuracao(sessoes), activeDuration=durations.includes(duration)?duration:durations[0];
  const filtered=sessoesDaDuracao(sessoes,activeDuration);
  const chosen = filtered.find(s => String(s.id) === String(selected));
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="sessao-modal-title" className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7">
    <header className="flex items-center justify-between gap-3"><h2 id="sessao-modal-title" className="text-lg font-bold text-blue-950">{t('escolher_horario_passeio', 'Escolher horário do passeio')}</h2><button type="button" onClick={onClose} aria-label={t('fechar', 'Fechar')} className="cursor-pointer rounded-full p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button></header>
    <p className="mt-2 text-xs text-slate-500">{dataSelecionada}</p>
    {durations.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{durations.map(n => durations.length===1 ? <p key={n} className="text-sm font-semibold text-blue-800">{t('experiencia_cartao_duracao_minutos',{count:n,defaultValue:'{{count}} min'})}</p> : <button type="button" key={n} aria-pressed={activeDuration===n} onClick={()=>{setDuration(n);setSelected(null);setLimit(8);}} className={`min-h-10 rounded-lg border px-3 py-2 text-sm ${activeDuration===n?'border-blue-600 bg-blue-50 text-blue-700':'border-slate-200'}`}>{t('experiencia_cartao_duracao_minutos',{count:n,defaultValue:'{{count}} min'})}</button>)}</div>}
    {loading ? <p role="status" className="py-8 text-center text-sm">{t('carregando_horarios', 'A carregar horários...')}</p> : error ? <p role="alert" className="my-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p> : !sessoes.length ? <p className="py-8 text-center text-sm text-slate-500">{t('experiencia_modal_sem_sessoes')}</p> : <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{filtered.slice(0,limit).map(s => { const count = Number(s.vagas_disponiveis) || 0; const active = selected === s.id; return <button type="button" key={s.id} disabled={!count} aria-pressed={active} onClick={() => setSelected(s.id)} className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-3 text-xs disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-400'}`}><span className="text-blue-600"><Clock size={18} /></span><strong>{s.hora_inicio} – {s.hora_fim}</strong><span>{s.periodo}</span><span className="text-green-700">{t('experiencia_cartao_vagas', { count, defaultValue: '{{count}} disponíveis' })}</span></button>; })}</div>}
    {filtered.length>limit && <button type="button" onClick={()=>setLimit(n=>n+8)} className="mt-3 w-full rounded-lg border border-blue-200 p-2 text-sm text-blue-700">{t('experiencia_cartao_ver_mais_horarios','Ver mais horários')}</button>}
    <button type="button" disabled={!chosen || loading} onClick={() => { if (chosen) onSelectHorario(chosen.hora_inicio, chosen.periodo, chosen); }} className="mt-5 w-full cursor-pointer rounded-lg bg-blue-600 p-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">{t('experiencia_modal_confirmar_sessao')}</button>
  </section></div>;
}
