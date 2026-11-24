export function normalizarCaucaoCarro(dados) {
  if (!dados || ![0, 1, '0', '1', false, true].includes(dados.exige_caucao)) return null;
  const exige = Number(dados.exige_caucao) === 1;
  const valor = Number(dados.caucao_valor);
  if (exige && (dados.caucao_valor == null || String(dados.caucao_valor).trim() === '' || !Number.isFinite(valor) || valor <= 0)) return null;
  let formas = dados.caucao_formas || [];
  if (typeof formas === 'string') {
    try { formas = JSON.parse(formas); } catch { formas = formas.split(','); }
  }
  return {
    exige_caucao: exige ? 1 : 0,
    caucao_valor: exige ? Math.round(valor * 100) / 100 : 0,
    caucao_formas: exige && Array.isArray(formas) ? formas.filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean) : [],
    caucao_condicoes: exige && typeof dados.caucao_condicoes === 'string' ? dados.caucao_condicoes.trim() : '',
  };
}

export function totalCaucaoCarro(dados, quantidade) {
  const caucao = normalizarCaucaoCarro(dados);
  const qtd = Number(quantidade);
  return caucao && Number.isInteger(qtd) && qtd > 0 ? Math.round(caucao.caucao_valor * qtd * 100) / 100 : null;
}
