export function localizacaoObrigatoriaCompleta(dados = {}, campoEndereco = 'endereco') {
  return [dados[campoEndereco], dados.cidade, dados.ilha]
    .every(value => typeof value === 'string' && value.trim().length > 0);
}
