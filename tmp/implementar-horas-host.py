from pathlib import Path
def edit(name,old,new,count=1):
 p=Path(name);s=p.read_text(encoding='utf-8');assert old in s,(name,old[:100]);p.write_text(s.replace(old,new,count),encoding='utf-8')
p='src/components/gest/LevantamentoCaucaoCondicoes.jsx'
edit(p,"import { useTranslation }", "import HorariosDevolucaoCarro from '../../features/carros/components/HorariosDevolucaoCarro';\nimport { obterTokenValidacao } from '../../utils/tokenValidacaoReserva';\nimport { useTranslation }")
edit(p,"  const [loading, setLoading]", "  const [horariosProntos, setHorariosProntos] = useState(false);\n  const [loading, setLoading]")
edit(p,"    levantamento_hora_inicio: '08:00',","    devolucao_mesmo_horario: 1, devolucao_hora_inicio: '', devolucao_hora_fim: '',\n    levantamento_hora_inicio: '08:00',")
edit(p,"      levantamento_hora_inicio: carroSelecionado", "      devolucao_mesmo_horario: 1, devolucao_hora_inicio: '', devolucao_hora_fim: '',\n      levantamento_hora_inicio: carroSelecionado")
edit(p,"    });\n  }, [carroSelecionado]);",'''    });
    const c = new AbortController();setHorariosProntos(false);
    api.post('/horarios_carro.php', { carro_id: carroSelecionado.id, acao: 'listar' }, { signal: c.signal, headers: { Authorization: `Bearer ${obterTokenValidacao(localStorage, 'host') || ''}` } }).then(({ data }) => {
      if (!data.success || !data.horarios) throw new Error('Missing schedules');
      if (!c.signal.aborted) { setForm(v => ({ ...v, ...data.horarios }));setHorariosProntos(true); }
    }).catch(() => { if (!c.signal.aborted) showToast('erro', t('carro_horas_erro')); });
    return () => c.abort();
  }, [carroSelecionado]);''')
# Existing effect already uses t/showToast; do not introduce their unstable references as dependencies.
edit(p,'    setGuardando(true);\n    try {','''    if (!horariosProntos) { showToast('erro', t('carro_horas_erro'));return; }
    const hh = /^([01]\\d|2[0-3]):[0-5]\\d$/;
    if (!hh.test(form.levantamento_hora_inicio) || !hh.test(form.levantamento_hora_fim) || form.levantamento_hora_inicio > form.levantamento_hora_fim || (Number(form.devolucao_mesmo_horario) === 0 && (!hh.test(form.devolucao_hora_inicio) || !hh.test(form.devolucao_hora_fim) || form.devolucao_hora_inicio > form.devolucao_hora_fim))) { showToast('erro', t('carro_horas_intervalo_invalido'));return; }
    setGuardando(true);
    try {''')
edit(p,'      if (res.ok && data.success) {','''      if (res.ok && data.success) {
        const { data: horariosGuardados } = await api.post('/horarios_carro.php', { carro_id: carroSelecionado.id, acao: 'guardar', levantamento_hora_inicio: form.levantamento_hora_inicio, levantamento_hora_fim: form.levantamento_hora_fim, devolucao_mesmo_horario: form.devolucao_mesmo_horario, devolucao_hora_inicio: form.devolucao_hora_inicio, devolucao_hora_fim: form.devolucao_hora_fim }, { headers: { Authorization: `Bearer ${obterTokenValidacao(localStorage, 'host') || ''}` } });
        if (!horariosGuardados.success) throw new Error('Schedule save failed');''')
edit(p,'            {/* Devolu', '            <HorariosDevolucaoCarro form={form} setForm={setForm} disabled={!horariosProntos || guardando} />\n            {/* Devolu')
p='server/api/checkout_api.php'
edit(p,"                $stock = carroStockLer($conn, (int)$carro_id, $data_levantamento, $data_devolucao, true, $retencao['token']);",'''                $hora_levantamento=carroHora((string)($input['participante_principal']['hora_levantamento']??''));
                $hora_devolucao=carroHora((string)($input['participante_principal']['hora_devolucao']??''));
                if(substr((string)($retencao['hora_levantamento']??''),0,5)!==$hora_levantamento || substr((string)($retencao['hora_devolucao']??''),0,5)!==$hora_devolucao)throw new Exception('As horas não correspondem ao pagamento.');
                $stock = carroStockLer($conn, (int)$carro_id, $data_levantamento, $data_devolucao, true, $retencao['token'],false,$hora_levantamento,$hora_devolucao);''')
edit(p,"                $hora_levantamento = $input['participante_principal']['hora_levantamento'] ?? '10:00';", "                carroHorariosValidar($condicoes['horarios']??carroHorariosLer($conn,(int)$carro_id),$hora_levantamento,$hora_devolucao);")
edit(p,'num_documento, hora_levantamento,','num_documento, hora_levantamento, hora_devolucao,')
edit(p,':pagamento, :doc, :hora,',':pagamento, :doc, :hora, :hora_fim,')
edit(p,"':doc'=>$num_documento, ':hora'=>$hora_levantamento,", "':doc'=>$num_documento, ':hora'=>$hora_levantamento, ':hora_fim'=>$hora_devolucao,")
edit(p,"carroGuardarCaucaoReserva($conn, (int)$reservaId, $condicoes['caucao']);", "carroGuardarCaucaoReserva($conn, (int)$reservaId, $condicoes['caucao'], $condicoes['horarios']);")
# The details API explicitly selects columns, unlike get_carro.php (SELECT *).
edit('server/api/get_carro_detalhes.php','c.devolucao_mesmo_local,','c.devolucao_mesmo_horario,c.devolucao_hora_inicio,c.devolucao_hora_fim,c.devolucao_mesmo_local,')
