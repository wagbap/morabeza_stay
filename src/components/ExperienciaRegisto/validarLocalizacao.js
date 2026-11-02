export function localizacaoExperienciaCompleta(dados = {}) {
  const preenchido = value => typeof value === 'string' && value.trim().length > 0;
  return preenchido(dados.endereco || dados.morada) && preenchido(dados.cidade) && preenchido(dados.ilha);
}
