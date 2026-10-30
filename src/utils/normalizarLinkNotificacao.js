export function destinoRegistoNotificacao(notification) {
  const bases = { alojamento: '/alojamento-registro', carro: '/carro-registo', experiencia: '/experiencia-registo' };
  const tipo = notification.tipo_anuncio;
  if (notification.pedido_id) return `/gest/documentos-solicitados#pedido-${encodeURIComponent(notification.pedido_id)}`;
  if (!Object.hasOwn(bases, tipo)) return null;
  if (notification.reserva_id) return `/gest/reserva/${encodeURIComponent(notification.reserva_id)}/${tipo}`;
  if (notification.anuncio_id) return `${bases[tipo]}/editar/${encodeURIComponent(notification.anuncio_id)}`;
  return null;
}

// Mantém as notificações antigas compatíveis com as páginas de edição.
export function normalizarLinkNotificacao(url) {
  const bases = ['/alojamento-registro', '/carro-registo', '/experiencia-registo'];
  const base = bases.find(base => url.pathname === `${base}/fluxo`);
  const id = url.searchParams.get('edit');
  if (base && id) {
    const params = new URLSearchParams(url.search);
    params.delete('edit');
    params.delete('tipo');
    const search = params.toString();
    return `${base}/editar/${encodeURIComponent(id)}${search ? `?${search}` : ''}${url.hash}`;
  }
  return url.pathname + url.search + url.hash;
}
