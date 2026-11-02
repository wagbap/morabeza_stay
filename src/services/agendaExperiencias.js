import api from '../api/api';
import { obterTokenValidacao } from '../utils/tokenValidacaoReserva';

export async function pedirAgendaExperiencia(payload, signal) {
  const token = obterTokenValidacao(localStorage, 'host');
  const { data } = await api.post('/agenda_experiencias.php', payload, {
    signal, timeout: 60000,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!data.success) throw Object.assign(new Error(data.error || 'AGENDA_FAILED'), { response: { data }, code: data.code });
  return data;
}
