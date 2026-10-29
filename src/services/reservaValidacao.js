import { obterTokenValidacao } from '../utils/tokenValidacaoReserva.js';
import api from '../api/api';


export async function validarReservaQR(codigo, contexto = 'admin') {
  const token = obterTokenValidacao(localStorage, contexto);
  if (!token) {
    const error = new Error('Authentication required');
    error.response = { status: 401, data: { code: 'AUTH_REQUIRED' } };
    throw error;
  }
  const body = contexto === 'host' ? { codigo, contexto: 'host' } : { codigo };
  const endpoint = contexto === 'host' ? '/reserva-validacao.php' : '/admin/validar-reserva.php';
  const enviar = credential => api.post(endpoint, body, {
    timeout: 15000, headers: { Authorization: `Bearer ${credential}` },
  });
  try {
    const { data } = await enviar(token);
    return data;
  } catch (error) {
    // The extra validation credential expires before the seven-day login JWT.
    // Retry authentication only; never retry a booking validation/write failure.
    const sessionToken = contexto === 'host' ? obterTokenValidacao(localStorage, contexto, true) : null;
    if (error.response?.data?.code !== 'AUTH_REQUIRED' || !sessionToken || sessionToken === token) throw error;
    const { data } = await enviar(sessionToken);
    return data;
  }
}
