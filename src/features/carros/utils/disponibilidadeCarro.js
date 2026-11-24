// Só uma confirmação explícita do servidor permite avançar. Um erro de API
// ou uma resposta incompleta nunca equivale a stock disponível.
export function disponibilidadeCarroConfirmada(resposta) {
  return resposta?.success === true && resposta.disponivel === true;
}

export function dataLocalCarro(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
