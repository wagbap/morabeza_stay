export const TIPOS_DOCUMENTOS_CONDUTOR = ['carta_frente', 'carta_verso', 'identificacao'];
export const FORMATOS_DOCUMENTOS_CONDUTOR = '.pdf,application/pdf';
export function validarDocumentoCondutor(file) {
  return Boolean(file && /\.pdf$/i.test(file.name) && file.size > 0 && file.size <= 10 * 1024 * 1024 && (!file.type || file.type === 'application/pdf'));
}
export function documentosCondutorCompletos(documentos) {
  return TIPOS_DOCUMENTOS_CONDUTOR.every(tipo => validarDocumentoCondutor(documentos?.[tipo]));
}
