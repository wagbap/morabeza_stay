import api from '../api/api';
import { obterTokenValidacao } from '../utils/tokenValidacaoReserva';

export async function pedirNotificacoes(payload, options = {}) {
  const token = obterTokenValidacao(localStorage, 'host');
  const session = obterTokenValidacao(localStorage, 'host', true);
  const request = credential => api.post('/usuarios/notificacoes.php', payload, {
    ...options, timeout: 15000,
    headers: credential ? { Authorization: `Bearer ${credential}` } : {},
  });
  try {
    return await request(token);
  } catch (error) {
    if (error.response?.status === 403 && error.response?.data?.code === 'AUTH_REQUIRED' && session && session !== token) {
      return request(session);
    }
    throw error;
  }
}
