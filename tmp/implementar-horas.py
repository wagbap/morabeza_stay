from pathlib import Path
def edit(name,old,new,count=1):
 p=Path(name);s=p.read_text(encoding='utf-8');assert old in s,(name,old[:100]);p.write_text(s.replace(old,new,count),encoding='utf-8')
edit('src/features/carros/utils/condicoesCarro.js',"['levantamento_ilha'","['devolucao_mesmo_horario', 'devolucao_hora_inicio', 'devolucao_hora_fim', 'levantamento_ilha'")
p='src/features/carros/components/CheckoutCarro.jsx'
edit(p,"import DocumentosCondutorUpload", "import { janelasCarro, horaNaJanela } from '../utils/horariosCarro';\nimport DocumentosCondutorUpload")
edit(p,'({ condutor, updateCondutor })','({ condutor, updateCondutor, reserva, horariosEstado })')
a=Path(p).read_text(encoding='utf-8');start=a.index('        <div>\n          <label',a.index('<div className="space-y-5">'));end=a.index('        <DocumentosCondutorUpload',start)
a=a[:start]+'''        {['levantamento', 'devolucao'].map(tipo => {
          const janela = janelasCarro(reserva)[tipo];
          return <div key={tipo}>
            <label htmlFor={`hora-${tipo}`} className="mb-1 block text-xs font-bold text-slate-700">{t(`carro_horas_${tipo}_escolhida`)} *</label>
            <input id={`hora-${tipo}`} type="time" step="60" disabled={horariosEstado !== 'ready'} min={janela[0]} max={janela[1]} value={condutor[`hora_${tipo}`] || ''} onChange={e => updateCondutor(`hora_${tipo}`, e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900" />
            <p className="mt-1 text-xs text-slate-500">{t('carro_horas_janela')}: {janela[0] && janela[1] ? janela.join(' – ') : t('carro_horas_carregando')}</p>
          </div>;
        })}

'''+a[end:];Path(p).write_text(a,encoding='utf-8')
edit(p,"hora_levantamento: '10:00',","hora_levantamento: '',\n    hora_devolucao: '',")
edit(p,"horaLevantamento: reservaData?.horaLevantamento || '10:00'","horaLevantamento: '',\n    horaDevolucao: ''")
edit(p,"  const [caucaoEstado",'''  const [horariosEstado, setHorariosEstado] = useState('loading');
  useEffect(() => {
    if (!reserva.id) return;
    const c = new AbortController();setHorariosEstado('loading');
    api.get('/horarios_carro.php', { params: { carro_id: reserva.id }, signal: c.signal }).then(({ data }) => {
      if (!data.success || !data.horarios) throw new Error('Missing hours');
      if (!c.signal.aborted) { setReserva(v => ({ ...v, ...data.horarios }));setHorariosEstado('ready'); }
    }).catch(() => { if (!c.signal.aborted) setHorariosEstado('error'); });
    return () => c.abort();
  }, [reserva.id]);

  const [caucaoEstado''')
edit(p,"reserva?.horaLevantamento || '10:00'","reserva?.horaLevantamento || t('carro_horas_por_escolher')")
edit(p,"reserva?.horaLevantamento || '10:00'","reserva?.horaDevolucao || t('carro_horas_por_escolher')")
edit(p,"    if (!documentosCondutorCompletos",'''    const janelas = janelasCarro(reserva);
    if (horariosEstado !== 'ready' || !horaNaJanela(condutor.hora_levantamento, janelas.levantamento) || !horaNaJanela(condutor.hora_devolucao, janelas.devolucao)) {
      setError(t('carro_horas_invalidas'));return false;
    }
    if (!documentosCondutorCompletos''')
edit(p,'    setEnviandoOtp(true);','''    setEnviandoOtp(true);
    try {
      const { data } = await api.get('/verificar_disponibilidade_carro.php', { params: { carro_id: reserva.id, checkin: reserva.checkIn, checkout: reserva.checkOut, quantidade: reserva.quantidade, hora_levantamento: condutor.hora_levantamento, hora_devolucao: condutor.hora_devolucao } });
      if (!data.success || !data.disponivel) { setError(t('carro_horas_sem_stock'));setEnviandoOtp(false);return; }
    } catch { setError(t('carro_horas_erro'));setEnviandoOtp(false);return; }''')
edit(p,'        ...reserva,\n        precoTotal:', '        ...reserva,\n        horaLevantamento: condutor.hora_levantamento, horaDevolucao: condutor.hora_devolucao,\n        precoTotal:')
edit(p,'          ...reserva,\n          precoTotal:', '          ...reserva,\n          horaLevantamento: condutor.hora_levantamento, horaDevolucao: condutor.hora_devolucao,\n          precoTotal:')
edit(p,'hora_levantamento: condutor.hora_levantamento,','hora_levantamento: condutor.hora_levantamento,\n        hora_devolucao: condutor.hora_devolucao,')
edit(p,'                condutor={condutor}','                reserva={reserva} horariosEstado={horariosEstado}\n                condutor={condutor}')
edit(p,'                reserva={reserva}\n','                reserva={{ ...reserva, horaLevantamento: condutor.hora_levantamento, horaDevolucao: condutor.hora_devolucao }}\n')
# Visible summary labels distinguish selections from permitted windows.
edit(p,"{t('levantamento', 'Levantamento')}","{t('carro_horas_levantamento_escolhida')}")
edit(p,"{t('devolucao', 'Devolu\\u00e7\\u00e3o')}","{t('carro_horas_devolucao_escolhida')}") if False else None
# Add windows underneath the two selected timestamps without altering layout.
needle='        <div className="flex justify-between">\n          <span className="text-xs text-slate-600 font-medium">{t(\'dias\''
edit(p,needle,'''        <p className="text-xs text-slate-500">{t('carro_horas_levantamento_janela')}: {janelasCarro(reserva).levantamento.filter(Boolean).join(' – ') || t('carro_horas_carregando')}<br />{t('carro_horas_devolucao_janela')}: {janelasCarro(reserva).devolucao.filter(Boolean).join(' – ') || t('carro_horas_carregando')}</p>
'''+needle)
p='src/features/carros/hooks/usePagamentoCarro.js'
edit(p,'quantidade: reserva.quantidade, precoTotal:', 'quantidade: reserva.quantidade, horaLevantamento: reserva.horaLevantamento, horaDevolucao: reserva.horaDevolucao, precoTotal:')
edit(p,'exige_caucao: reserva.exige_caucao,','hora_levantamento: reserva.horaLevantamento, hora_devolucao: reserva.horaDevolucao, exige_caucao: reserva.exige_caucao,')
edit(p,'reserva.documentos_condutor, reserva.id','reserva.horaLevantamento, reserva.horaDevolucao, reserva.documentos_condutor, reserva.id')
edit('src/features/carros/utils/pedidoStockCarro.js','reserva.quantidade, reserva.precoTotal','reserva.quantidade, reserva.horaLevantamento, reserva.horaDevolucao, reserva.precoTotal')
edit('src/features/carros/utils/pagamentoCarro.js',"  if (code === 'CARRO_DOCUMENTOS_INVALIDOS')", "  if (code === 'CARRO_HORARIOS_INVALIDOS') return 'carro_horas_invalidas';\n  if (code === 'CARRO_DOCUMENTOS_INVALIDOS')")
edit('src/pages/Pagamento.jsx',"hora_levantamento: participantePrincipal.hora_levantamento || '10:00',","hora_levantamento: reserva.horaLevantamento || participantePrincipal.hora_levantamento,\n          hora_devolucao: reserva.horaDevolucao || participantePrincipal.hora_devolucao,")
