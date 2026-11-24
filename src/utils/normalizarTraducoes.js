export function normalizarTraducoes(data) {
  const { translation, ...chavesRaiz } = data;
  return { translation: { ...chavesRaiz, ...(translation || {}) } };
}
