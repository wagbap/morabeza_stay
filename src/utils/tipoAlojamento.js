// src/utils/tipoAlojamento.js

// ============================================================
// Tipos que vendem POR QUARTO (hotelaria)
// ============================================================
export const TIPOS_POR_QUARTO = [
  'Hotel',
  'Guesthouse',
  'Guest House',
  'Resort',
  'Pousada',
  'Hostel',
  'Bed and Breakfast',
  'B&B',
  'Albergue',
  'Motel',
];

// ============================================================
// Tipos que vendem INTEIRO (propriedade inteira)
// ============================================================
export const TIPOS_INTEIRO = [
  'Apartamento',
  'Villa',
  'Casa',
  'Casa de campo',
  'Loft',
  'Estúdio',
  'Bungalow',
  'Chalé',
];

// ============================================================
// Lista completa para dropdowns
// ============================================================
export const TIPOS_ALOJAMENTO = [
  // Inteiro
  { value: 'Apartamento',       label: 'Apartamento',       modelo: 'inteiro'    },
  { value: 'Villa',             label: 'Villa',             modelo: 'inteiro'    },
  { value: 'Casa',              label: 'Casa',              modelo: 'inteiro'    },
  { value: 'Bungalow',          label: 'Bungalow',          modelo: 'inteiro'    },
  { value: 'Chalé',             label: 'Chalé',             modelo: 'inteiro'    },
  { value: 'Loft',              label: 'Loft',              modelo: 'inteiro'    },
  { value: 'Estúdio',           label: 'Estúdio',           modelo: 'inteiro'    },
  // Por quarto
  { value: 'Hotel',             label: 'Hotel',             modelo: 'por_quarto' },
  { value: 'Guesthouse',        label: 'Guesthouse',        modelo: 'por_quarto' },
  { value: 'Resort',            label: 'Resort',            modelo: 'por_quarto' },
  { value: 'Pousada',           label: 'Pousada',           modelo: 'por_quarto' },
  { value: 'Hostel',            label: 'Hostel',            modelo: 'por_quarto' },
  { value: 'Bed and Breakfast', label: 'Bed and Breakfast', modelo: 'por_quarto' },
  { value: 'Albergue',          label: 'Albergue',          modelo: 'por_quarto' },
  { value: 'Motel',             label: 'Motel',             modelo: 'por_quarto' },
];

// ============================================================
// 🔑 FUNÇÃO PRINCIPAL
// Devolve 'inteiro' ou 'por_quarto' consoante o tipo
// ============================================================
export function modeloVendaPorTipo(tipoPropriedade) {
  if (!tipoPropriedade) return 'inteiro';

  const tipo = String(tipoPropriedade).trim();

  // Normalização (case-insensitive, sem acentos)
  const normalizado = tipo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const porQuartoNorm = TIPOS_POR_QUARTO.map((t) =>
    t.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  );

  if (porQuartoNorm.includes(normalizado)) return 'por_quarto';

  return 'inteiro';
}

// ============================================================
// Helper para saber se mostra o passo de quartos
// ============================================================
export function mostraQuartos(tipoPropriedade) {
  return modeloVendaPorTipo(tipoPropriedade) === 'por_quarto';
}

// ============================================================
// Helper para o rótulo do tipo
// ============================================================
export function getLabelTipo(tipoPropriedade) {
  const found = TIPOS_ALOJAMENTO.find(
    (t) => t.value.toLowerCase() === String(tipoPropriedade).toLowerCase()
  );
  return found ? found.label : tipoPropriedade;
}