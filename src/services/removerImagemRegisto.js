import api from '../api/api.js';

export async function removerImagemRegisto(dominio, imagem) {
  // Local previews have no persisted server record to delete.
  if (imagem.pendingUpload || imagem.persistida === false || !Number.isSafeInteger(Number(imagem.id))) return;
  const token = localStorage.getItem('token') || localStorage.getItem('morabeza_token');
  const { data, status } = await api.delete(`/${dominio}/remover_imagem.php`, {
    params: { id: imagem.id }, timeout: 15000,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (status !== 204 && data?.success !== true && data?.success !== 1 && data?.status !== 'success') throw new Error('Image deletion was not confirmed');
}
