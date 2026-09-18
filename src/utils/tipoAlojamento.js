// src/utils/tipoAlojamento.js

// 🏠 Alojamento inteiro — um preço, uma capacidade, sem secção de quartos
export const TIPOS_INTEIRO = [
  'Apartamento',
  'Casa',
  'Villa',
  'Moradia',
];

// 🛏️ Venda por quartos — aparece a secção de quartos
export const TIPOS_POR_QUARTO = [
  'Hotel',
  'Guesthouse',
  'Resort',
  'Pousada',
  'Hostel',
  'Estúdio',
];

/**
 * Devolve 'inteiro' ou 'por_quarto' com base no tipo_propriedade.
 * Se não reconhecer, assume 'inteiro' (mais seguro).
 */
export function modeloVendaPorTipo(tipo) {
  const t = (tipo || '').trim();
  if (TIPOS_POR_QUARTO.includes(t)) return 'por_quarto';
  if (TIPOS_INTEIRO.includes(t)) return 'inteiro';
  console.warn(`⚠️ Tipo "${t}" não está em nenhuma lista — a assumir "inteiro"`);
  return 'inteiro';
}

/** true se o tipo aceita quartos */
export function aceitaQuartos(tipo) {
  return modeloVendaPorTipo(tipo) === 'por_quarto';
}