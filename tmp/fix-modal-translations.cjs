const fs = require('fs');
const fixes = {
  titulo: 'Reservas do an\u00fancio', anuncio: 'An\u00fancio', pesquisar_anuncio: 'Pesquisar pelo nome do an\u00fancio',
  periodo: 'Reservas no per\u00edodo', carregar: 'A carregar reservas\u2026', erro: 'N\u00e3o foi poss\u00edvel carregar as reservas.',
  acoes: 'A\u00e7\u00f5es', vazio: 'Sem reservas neste per\u00edodo.',
};
let text = fs.readFileSync('src/locales/pt.js', 'utf8');
for (const [key, value] of Object.entries(fixes)) text = text.replace(new RegExp(`gest_res_anuncio_${key}: "[^"]*"`), `gest_res_anuncio_${key}: ${JSON.stringify(value)}`);
fs.writeFileSync('src/locales/pt.js', text);
for (const lang of ['en','fr','es','de','ir','cv']) {
  const path = `src/locales/${lang}.js`;
  fs.writeFileSync(path, fs.readFileSync(path, 'utf8').replace('Loading reservations?', 'Loading reservations...'));
}
