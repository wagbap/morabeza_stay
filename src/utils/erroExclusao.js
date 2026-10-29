// Translate backend failures without exposing SQL, schema names or internal paths.
export function chaveErroExclusao(data, status) {
  const message = [data?.message, data?.error, typeof data === 'string' ? data : ''].filter(value => typeof value === 'string').join(' ');
  if (/1451|foreign[ _]key|integrity constraint|SQLSTATE\[23000\]|reservas? associad/i.test(message)) return 'exclusao_associados';
  if ([401, 403].includes(status)) return 'exclusao_sem_permissao';
  return 'exclusao_erro';
}
