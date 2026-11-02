import api from '../api/api';
import { obterTokenValidacao } from '../utils/tokenValidacaoReserva';
import { normalizarComprovativoRepasseUrl } from '../utils/comprovativoRepasseUrl';
export async function pedirRepasses(payload, signal) {
  const token = obterTokenValidacao(localStorage, 'admin');
  const { data } = await api.post('/admin/repasses.php', payload, { headers: token ? { Authorization: `Bearer ${token}` } : {}, signal, timeout: 20000 });
  if (data.status !== 'success') throw new Error(data.message || 'REPASSES_FAILED');
  return data;
}
export async function enviarComprovativoRepasse(file) {
  const form = new FormData(); form.append('documento', file);
  const token = obterTokenValidacao(localStorage, 'admin');
  const { data } = await api.post('/usuarios/upload_documento.php', form, { headers: { 'Content-Type': 'multipart/form-data', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, timeout: 30000 });
  if (!data.success || !data.documento_url) throw new Error('UPLOAD_FAILED');
  return normalizarComprovativoRepasseUrl(data.documento_url);
}
