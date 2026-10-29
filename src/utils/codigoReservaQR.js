export function extrairCodigoReservaQR(valor) {
  const texto = typeof valor === 'string' ? valor.trim() : '';
  if (!texto || texto.length > 4096) return '';
  if (texto.startsWith('{')) {
    try {
      const dados = JSON.parse(texto);
      const codigo = dados.codigo_reserva ?? dados.codigo ?? dados.code;
      return typeof codigo === 'string' ? codigo.trim() : '';
    } catch { return ''; }
  }
  if (/^https?:\/\//i.test(texto)) {
    try {
      const url = new URL(texto);
      return (url.searchParams.get('codigo_reserva') || url.searchParams.get('codigo') || url.searchParams.get('code') || '').trim();
    } catch { return ''; }
  }
  return texto;
}
