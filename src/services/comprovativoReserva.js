import api from '../api/api';
import { obterTokenValidacao } from '../utils/tokenValidacaoReserva';

export async function descarregarComprovativo({ tipo, codigo, id, url }) {
  const token = obterTokenValidacao(localStorage, 'host');
  const sessionToken = obterTokenValidacao(localStorage, 'host', true);
  const request = credential => api.get(url || '/send_email.php', {
    params: url ? undefined : { action: 'comprovativo', tipo, codigo: codigo || undefined, reserva_id: id },
    headers: credential ? { Authorization: `Bearer ${credential}` } : {},
    responseType: 'blob', timeout: 30000,
  });
  let response;
  try {
    try {
      response = await request(token);
    } catch (error) {
      const body = await lerErroComprovativo(error);
      // The extra validation credential can expire before the login JWT.
      if (body.code !== 'AUTH_REQUIRED' || !sessionToken || sessionToken === token) throw error;
      response = await request(sessionToken);
    }
  } catch (error) {
    const body = await lerErroComprovativo(error);
    if (body.code === 'AUTH_REQUIRED') error.translationKey = 'comprovativo_sessao_expirada';
    console.error('Comprovativo:', { status: error.response?.status, code: body.code || 'DOWNLOAD_FAILED' });
    throw error;
  }
  if (!String(response.headers['content-type']).includes('application/pdf')) throw new Error('INVALID_RECEIPT');
  const objectUrl = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `reserva-${String(codigo || id || '').replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}

async function lerErroComprovativo(error) {
  try {
    const data = error.response?.data;
    return data instanceof Blob ? JSON.parse(await data.text()) : data || {};
  } catch { return {}; }
}
