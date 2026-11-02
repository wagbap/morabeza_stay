const fs = require('fs'), path = require('path');
const root = path.join(process.env.TEMP, 'morabeza-email-php-check/node_modules');
(async () => {
  const { PHP } = require(path.join(root, '@php-wasm/universal'));
  const { loadNodeRuntime } = require(path.join(root, '@php-wasm/node'));
  const php = new PHP(await loadNodeRuntime('8.3', { emscriptenOptions: { processId: 65319, wasmBinary: fs.readFileSync(path.join(root, '@php-wasm/node-8-3/asyncify/8_3_33/php_8_3.wasm')) } }));
  php.mkdir('/api'); php.mkdir('/api/usuarios');
  php.writeFile('/api/usuarios/upload_documento.php', fs.readFileSync('server/api/usuarios/upload_documento.php'));
  const boundary = 'test-upload-boundary';
  const body = `--${boundary}\r\nContent-Disposition: form-data; name="documento"; filename="comprovativo.pdf"\r\nContent-Type: application/pdf\r\n\r\n%PDF-1.4\nTEST-UPLOAD-ONLY\r\n--${boundary}--\r\n`;
  const response = await php.run({ scriptPath: '/api/usuarios/upload_documento.php', method: 'POST', headers: { 'Content-Type': 'multipart/form-data; boundary=' + boundary }, body: new TextEncoder().encode(body) });
  if (response.errors) throw Error(response.errors);
  const data = JSON.parse(response.text);
  if (!data.success || !/^https:\/\/welovepalop\.com\/uploads\/documentos\/doc_[a-f0-9]+\.pdf$/.test(data.documento_url)) throw Error(response.text);
  if (!php.fileExists(new URL(data.documento_url).pathname)) throw Error('Returned URL does not match saved file');
  console.log('PASS: multipart upload saves the file and returns the correct HTTPS URL, without triple slashes. PHP 8.3/WASM.');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
