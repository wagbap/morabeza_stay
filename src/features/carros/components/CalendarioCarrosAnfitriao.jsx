import PainelCalendario from '../../../components/Calendario/PainelCalendario';
import CampoDataMorabeza from '../../../components/Calendario/CampoDataMorabeza';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../api/api';
import { obterTokenValidacao } from '../../../utils/tokenValidacaoReserva';
import { dataLocalCarro } from '../utils/disponibilidadeCarro';

export default function CalendarioCarrosAnfitriao({ carros }) {
  const { t, i18n } = useTranslation();
  const [carro, setCarro] = useState('');const [unidade, setUnidade] = useState('');
  const [mes, setMes] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [dados, setDados] = useState(null);const [selecionados, setSelecionados] = useState([]);
  const [motivo, setMotivo] = useState('');const [erro, setErro] = useState('');const [carregando, setCarregando] = useState(false);
  const [guardando, setGuardando] = useState(false);const [revisao, setRevisao] = useState(0);
  const [periodoInicio, setPeriodoInicio] = useState('');const [periodoFim, setPeriodoFim] = useState('');
  const id = carro || String(carros[0]?.id || '');
  const inicio = dataLocalCarro(mes);const fim = dataLocalCarro(new Date(mes.getFullYear(), mes.getMonth() + 1, 1));
  const headers = () => ({ Authorization: `Bearer ${obterTokenValidacao(localStorage, 'host') || ''}` });
  const carregar = useCallback(async (signal) => {
    if (!id) return;
    setCarregando(true);setErro('');setDados(null);setSelecionados([]);
    try {
      const { data } = await api.post('/calendario_carro.php', { carro_id: Number(id), inicio, fim, acao: 'listar' }, { headers: headers(), signal, timeout: 15000 });
      if (!data.success || !Array.isArray(data.unidades) || !Array.isArray(data.bloqueios) || !Array.isArray(data.reservas)) throw new Error('Invalid response');
      if (!signal.aborted) setDados(data);
    } catch { if (!signal.aborted) setErro('carro_cal_erro'); }
    finally { if (!signal.aborted) setCarregando(false); }
  }, [id, inicio, fim]);
  useEffect(() => { const c = new AbortController();void carregar(c.signal);return () => c.abort(); }, [carregar, revisao]);
  useEffect(() => {
    if (guardando || selecionados.length) return;
    const atualizar = () => setRevisao(v => v + 1);
    const timer = setInterval(atualizar, 30000);window.addEventListener('focus', atualizar);
    return () => { clearInterval(timer);window.removeEventListener('focus', atualizar); };
  }, [guardando, selecionados.length]);
  const atual = dados?.unidades.find(u => String(u.id) === unidade) || dados?.unidades[0];
  const hoje = dataLocalCarro(new Date());
  const bloqueio = date => dados?.bloqueios.find(b => String(b.unidade_id) === String(atual?.id) && b.data === date);
  const estado = date => {
    if (dados?.reservas.some(r => String(r.unidade_id) === String(atual?.id) && r.data_levantamento <= date && (r.data_devolucao > date || (r.data_devolucao === date && (!r.hora_devolucao || r.hora_devolucao.slice(0,5) > '00:00'))))) return 'reservado';
    if (bloqueio(date)) return 'bloqueado';
    if (atual?.estado === 'manutencao') return 'manutencao';
    if (atual?.estado === 'indisponivel') return 'indisponivel';
    return 'livre';
  };
  const guardar = async acao => {
    if (!atual || !selecionados.length || guardando) return;
    setGuardando(true);setErro('');
    try {
      const { data } = await api.post('/calendario_carro.php', { carro_id: Number(id), unidade_id: Number(atual.id), inicio, fim, datas: selecionados, motivo, acao }, { headers: headers(), timeout: 15000 });
      if (!data.success) throw new Error('Save failed');
      setMotivo('');setRevisao(v => v + 1);
    } catch (e) { setErro(e.response?.status === 409 ? 'carro_cal_conflito' : 'carro_cal_erro'); }
    finally { setGuardando(false); }
  };
  const dias = Array.from({ length: new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate() }, (_, i) => dataLocalCarro(new Date(mes.getFullYear(), mes.getMonth(), i + 1)));
  const cores = { livre: 'bg-green-50 text-green-700 border-green-200', bloqueado: 'bg-red-50 text-red-700 border-red-200', reservado: 'bg-blue-50 text-blue-700 border-blue-200', manutencao: 'bg-orange-50 text-orange-700 border-orange-200', indisponivel: 'bg-gray-100 text-gray-600 border-gray-200' };
  return <PainelCalendario disabled={guardando} onLimpar={() => { setSelecionados([]); setPeriodoInicio(''); setPeriodoFim(''); setMotivo(''); setErro(''); }}><div className="space-y-4">
    <div className="flex flex-wrap gap-3">
      <select aria-label={t('carro_cal_anuncio')} value={id} disabled={guardando} onChange={e => { setCarro(e.target.value);setUnidade(''); }} className="max-w-full min-w-0 rounded-xl border border-gray-200 bg-white p-3">
        {carros.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
      </select>
      <select aria-label={t('carro_cal_unidade')} value={atual?.id || ''} disabled={carregando || guardando} onChange={e => { setUnidade(e.target.value);setSelecionados([]); }} className="max-w-full min-w-0 rounded-xl border border-gray-200 bg-white p-3">
        {dados?.unidades.map(u => <option key={u.id} value={u.id}>{u.matricula} · {t(`carro_cal_${u.estado}`, t('carro_cal_unidade'))}</option>)}
      </select>
      <button type="button" aria-label={t('carro_cal_anterior')} onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))} className="rounded-lg border border-gray-200 px-3">‹</button>
      <span className="self-center font-semibold">{mes.toLocaleDateString(i18n.language === 'cv' ? 'pt' : i18n.language, { month: 'long', year: 'numeric' })}</span>
      <button type="button" aria-label={t('carro_cal_seguinte')} onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))} className="rounded-lg border border-gray-200 px-3">›</button>
    </div>
    <p className="text-sm text-gray-600">{t('carro_cal_ajuda')}</p>
    <div className="flex flex-wrap items-end gap-3">
      <label className="text-xs text-gray-600">{t('carro_cal_inicio')}<CampoDataMorabeza min={hoje} value={periodoInicio} onChange={e => setPeriodoInicio(e.target.value)} className="block rounded-lg border border-gray-200 p-2" /></label>
      <label className="text-xs text-gray-600">{t('carro_cal_fim')}<CampoDataMorabeza min={periodoInicio || hoje} value={periodoFim} onChange={e => setPeriodoFim(e.target.value)} className="block rounded-lg border border-gray-200 p-2" /></label>
      <button type="button" disabled={!atual || carregando || guardando || !periodoInicio || periodoInicio < hoje || periodoFim < periodoInicio} className="rounded-lg border border-gray-200 p-2 text-sm disabled:opacity-50" onClick={() => {
        const dates = [];const cursor = new Date(`${periodoInicio}T12:00:00`);
        while (dataLocalCarro(cursor) <= periodoFim && dates.length < 367) { dates.push(dataLocalCarro(cursor));cursor.setDate(cursor.getDate() + 1); }
        if (dates.length > 366) { setErro('carro_cal_erro');return; }setSelecionados(dates);
      }}>{t('carro_cal_periodo')}</button>
    </div>
    {erro && <div role="alert" className="text-sm text-red-700">{t(erro)} <button type="button" onClick={() => setRevisao(v => v + 1)} className="underline">{t('calendario_tentar_novamente')}</button></div>}
    {carregando ? <p role="status">{t('calendario_a_carregar')}</p> : !atual ? <p>{t('carro_cal_sem_unidades')}</p> : <>
      {atual.estado === 'manutencao' && <p className="rounded-xl bg-orange-50 p-3 text-sm text-orange-800">{t('carro_cal_manutencao_nota')} {atual.motivo_bloqueio}</p>}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: 7 }, (_, i) => <div key={`semana-${i}`} className="text-center text-xs text-gray-500">{new Date(2026, 0, 5 + i).toLocaleDateString(i18n.language === 'cv' ? 'pt' : i18n.language, { weekday: 'short' })}</div>)}
        {Array.from({ length: (mes.getDay() + 6) % 7 }, (_, i) => <div key={`vazio-${i}`} />)}
        {dias.map(date => <button type="button" key={date} disabled={date < hoje || guardando || estado(date) === 'reservado'} aria-pressed={selecionados.includes(date)}
          title={`${t(`carro_cal_${estado(date)}`)}${bloqueio(date) ? ` · ${bloqueio(date).motivo}` : ''}`}
          onClick={() => setSelecionados(s => s.includes(date) ? s.filter(d => d !== date) : [...s, date])}
          className={`min-h-14 rounded-xl border p-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-20 ${cores[estado(date)]} ${selecionados.includes(date) ? 'ring-2 ring-blue-600' : ''}`}>
          <span className="font-bold">{Number(date.slice(-2))}</span><span className="hidden text-[10px] sm:block">{t(`carro_cal_${estado(date)}`)}</span>
        </button>)}
      </div>
      {selecionados.length > 0 && <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm">{t('carro_cal_selecionados', { count: selecionados.length })}</p>
        {selecionados.filter(d => bloqueio(d)).map(d => <p key={d} className="text-xs text-gray-600">{d}: {bloqueio(d).motivo}</p>)}
        <label className="block text-sm">{t('carro_cal_motivo')}<input maxLength={200} value={motivo} onChange={e => setMotivo(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-200 p-2" /></label>
        <div className="flex flex-wrap gap-3"><button type="button" disabled={guardando || motivo.trim().length < 3} onClick={() => guardar('bloquear')} className="rounded-lg bg-blue-700 px-4 py-2 text-sm text-white disabled:opacity-50">{t('carro_cal_bloquear')}</button>
          <button type="button" disabled={guardando || !selecionados.some(d => bloqueio(d))} onClick={() => guardar('desbloquear')} className="rounded-lg border border-gray-200 px-4 py-2 text-sm disabled:opacity-50">{t('carro_cal_desbloquear')}</button></div>
        <p className="text-xs text-gray-600">{t('carro_cal_desbloquear_nota')}</p>
      </div>}
    </>}
  </div></PainelCalendario>;
}
