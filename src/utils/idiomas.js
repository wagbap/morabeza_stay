export const idiomas = [
  { code: 'pt', label: 'Portugu\u00eas', flag: 'pt' },
  { code: 'en', label: 'English', flag: 'gb' },
  { code: 'fr', label: 'Fran\u00e7ais', flag: 'fr' },
  { code: 'es', label: 'Espa\u00f1ol', flag: 'es' },
  { code: 'de', label: 'Deutsch', flag: 'de' },
  { code: 'ir', label: 'Italiano', flag: 'it' },
  { code: 'cv', label: 'Cabo-verdiano', flag: 'cv' },
];
export const idiomaAtual = language => idiomas.find(item => item.code === (language || 'pt').split('-')[0]) || idiomas[0];
