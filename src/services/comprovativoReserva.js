import api from '../api/api';
import { obterTokenValidacao } from '../utils/tokenValidacaoReserva';

export async function descarregarComprovativo({ tipo, codigo, id, url }) {
  const token = obterTokenValidacao(localStorage, 'host', true);
  const response = await api.get(url || '/comprovativo-reserva.php', {
    params: url ? undefined : { tipo, codigo: codigo || undefined, reserva_id: id },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    responseType: 'blob', timeout: 30000,
  });
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
