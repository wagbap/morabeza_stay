// Build email-safe PNGs from the project's Lucide icon set (ISC).
// The runtime sends them as CID attachments; no public image hosting is needed.
const fs = require('fs');
const path = require('path');
const { Resvg } = require(path.join(process.env.TEMP, 'morabeza-email-php-check/node_modules/@resvg/resvg-js'));
const base = path.resolve(__dirname, '..');
const dir = path.join(base, 'api/email/assets');
fs.mkdirSync(dir, { recursive: true });
const icons = {
  bed:'bed-double', car:'car-front', experience:'compass', calendar:'calendar-days',
  payment:'credit-card', preparation:'notebook-text', support:'headset',
  guest:'user-round', people:'users-round', pin:'map-pin', map:'map-pinned',
  download:'download', arrow:'arrow-right', globe:'globe', check:'circle-check',
};
const assets = {};
function save(name, svg, width) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: true } }).render().asPng();
  fs.writeFileSync(path.join(dir, name+'.png'), png);
  assets[name] = Buffer.from(png).toString('base64');
}
for (const [name, file] of Object.entries(icons)) {
  const src = fs.readFileSync(path.resolve('node_modules/lucide-react/dist/esm/icons/'+file+'.js'),'utf8');
  const nodes = Function('return '+src.match(/const __iconNode = (\[[\s\S]*?\n\]);/)[1])();
  const color = name === 'check' ? '#0b8f4d' : '#0759ad';
  const shapes = nodes.map(([tag, attrs]) => '<'+tag+' '+Object.entries(attrs).filter(([key])=>key!=='key').map(([key,value])=>key+'="'+value+'"').join(' ')+'/>').join('');
  save(name, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+shapes+'</svg>', 80);
}
const sun = '<g fill="none" stroke="#ffb027" stroke-width="3.2" stroke-linecap="round"><path d="M22 43a17 17 0 0 1 34 0"/><path d="M40 7v11M16 17l8 8M5 35l12 2M64 17l-8 8M73 35l-12 2"/><path d="M4 50c12 4 16-10 31-3s20 13 38 0M15 60c15-6 22 10 43 2"/></g>';
save('sun','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 72">'+sun+'</svg>',180);
save('logo','<svg xmlns="http://www.w3.org/2000/svg" width="540" height="100" viewBox="0 0 540 100"><g transform="translate(12,4)">'+sun+'</g><text x="112" y="47" fill="#07176a" font-family="Georgia" font-size="32" font-weight="bold" letter-spacing="3">MORABEZA.</text><text x="346" y="47" fill="#07176a" font-family="Arial" font-size="31" letter-spacing="3">STAY</text><text x="134" y="75" fill="#294d83" font-family="Arial" font-size="10" letter-spacing="4">CABO VERDE SEMPRE CONSIGO</text></svg>',1080);
// Fixed, clearly labelled fallback, requested for PDFs without a live map.
const fallback = path.resolve('tmp/pdfs/mapa-praia.png');
if (fs.existsSync(fallback)) {
  const bytes = fs.readFileSync(fallback);
  fs.writeFileSync(path.join(dir, 'map-example.png'), bytes);
  assets['map-example'] = bytes.toString('base64');
} else {
  const existing = path.join(dir, 'map-example.png');
  if (!fs.existsSync(existing)) throw Error('Missing example map PNG');
  assets['map-example'] = fs.readFileSync(existing).toString('base64');
}
const php = "<?php\ndeclare(strict_types=1);\n// Generated PNG assets. Lucide icons: ISC license, see assets/LICENSE-lucide.\nfunction emailReservaAssets(): array {\n    static $assets = "+JSON.stringify(assets,null,2).replace(/^\{/,'[').replace(/\}$/ ,']').replace(/^  "([^"]+)": "/gm,"        '$1' => '").replace(/",?$/gm, m=>m.startsWith('",')?"',":"'") +";\n    return $assets;\n}\n";
fs.writeFileSync(path.join(base,'api/email/emailAssets.php'),php);
fs.copyFileSync('node_modules/lucide-react/LICENSE',path.join(dir,'LICENSE-lucide'));
console.log('Generated '+Object.keys(assets).length+' embedded PNG assets.');
