/** Save the initial working agenda before its first departure configuration. */
export async function guardarAlteracaoAgenda(request, action, dados, agendaInicial, onAgendaSaved) {
  if (action === 'guardar_configuracao' && agendaInicial) {
    const initial = dados.ligar_sessoes_legadas ? { ...agendaInicial, ligar_sessoes_legadas: dados.ligar_sessoes_legadas } : agendaInicial;
    const saved = await request('guardar_agenda', initial);
    onAgendaSaved(saved);
  }
  return request(action, dados);
}
