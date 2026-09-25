// src/utils/financeiro.js
export const COMISSAO_MORABEZA = 0.10; // 10%

/**
 * Calcula a decomposição financeira de uma reserva.
 * @param {number} bruto           - valor total pago pelo cliente
 * @param {number} [taxas=0]       - soma de taxas identificadas (ex.: limpeza)
 * @returns {{bruto:number, comissao:number, taxas:number, liquido:number}}
 */
export function decomporFinanceiro(bruto, taxas = 0) {
  const b = Number(bruto) || 0;
  const t = Number(taxas) || 0;
  const comissao = +(b * COMISSAO_MORABEZA).toFixed(2);
  const liquido  = +(b - comissao - t).toFixed(2);
  return {
    bruto:    +b.toFixed(2),
    comissao,
    taxas:    +t.toFixed(2),
    liquido,
  };
}

/** Formata em CVE (pt-PT) */
export function fmtCVE(v) {
  const n = Number(v) || 0;
  return new Intl.NumberFormat('pt-PT').format(n) + ' CVE';
}