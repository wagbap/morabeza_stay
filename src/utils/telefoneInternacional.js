export function telefoneInternacionalValido(value) {
  const numero = String(value || '').trim().replace(/[\s().-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(numero);
}

