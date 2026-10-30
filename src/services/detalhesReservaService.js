import api from '../api/api';
import { obterTokenValidacao } from '../utils/tokenValidacaoReserva';
import { readSidebarSession } from '../utils/managementSession';

export async function carregarDetalhesReserva(id, tipo, signal) {
  const token = obterTokenValidacao(localStorage, 'host');
  const session = obterTokenValidacao(localStorage, 'host', true);
  const usuarioId = readSidebarSession(localStorage)?.user.id;
  const request = credential => api.get('/dashboard/detalhes_reserva.php', {
    // Compatibilidade com a API publicada; o endpoint novo autoriza pelo token.
    params: { reserva_id: id, usuario_id: usuarioId, tipo },
    headers: credential ? { Authorization: `Bearer ${credential}` } : {},
    signal, timeout: 15000,
  });
  try {
    return (await request(token)).data;
  } catch (error) {
    if (error.response?.data?.code === 'AUTH_REQUIRED' && session && session !== token) {
      return (await request(session)).data;
    }
    throw error;
  }
}
