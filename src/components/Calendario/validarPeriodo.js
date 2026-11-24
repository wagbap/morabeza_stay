// Dates use local calendar days; checkout may coincide with the first blocked night.
export function periodoSemBloqueios(inicio, fim, bloqueadas, permitirCheckout = true) {
  if (!inicio || !fim) return true;
  const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const primeiro = iso(inicio), ultimo = iso(fim);
  if (ultimo <= primeiro) return false;
  return !bloqueadas.some(dia => dia >= primeiro && (permitirCheckout ? dia < ultimo : dia <= ultimo));
}
