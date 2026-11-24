const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(path.join(process.env.TEMP,'morabeza-email-php-check/node_modules/playwright-core'));
const root=path.resolve('dist');const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(f));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1200,height:950}});const errors=[];page.on('pageerror',e=>errors.push(e.message));let sends=0,uploads=0,verifies=0,holds=0;
 await page.route('https://**/*',async route=>{
  const req=route.request(),url=req.url();if(req.resourceType()==='script')return route.fulfill({contentType:'application/javascript',body:''});
  if(url.includes('get_carro.php'))return route.fulfill({json:{success:true,data:{id:24,exige_caucao:1,caucao_valor:500,caucao_formas:['dinheiro','transferencia','multibanco','cheque'],caucao_condicoes:'Retencao por danos; devolucao apos inspecao.',levantamento_local:'Praia'}}});
  if(url.includes('send_otp.php')){const b=req.postDataJSON();if(b.action==='send_otp')sends++;if(b.action==='verify_otp')verifies++;return route.fulfill({json:{status:'otp_sent'}});}
  if(url.includes('documentos_condutor_upload.php')){uploads++;const body=req.postData();for(const name of ['carta_frente','carta_verso','identificacao','otp','email'])assert.ok(body.includes(`name="${name}"`));assert.match(req.headers()['content-type'],/multipart\/form-data; boundary=/);return route.fulfill({json:{success:true,documentos:{lote:'a'.repeat(32),token:'b'.repeat(64),email:'driver@example.invalid'}}});}
  if(url.includes('create-payment-intent.php')){holds++;assert.equal(req.postDataJSON().documentos_condutor.lote,'a'.repeat(32));return route.fulfill({status:503,json:{code:'STRIPE_CONFIG_MISSING'}});}
  return route.fulfill({json:{success:true,data:[]}});
 });
 await page.addInitScript(()=>{localStorage.setItem('i18nextLng','pt');if(location.pathname==='/checkout-carro')history.replaceState({usr:{reservaData:{id:24,titulo:'Carro teste',checkIn:'2026-11-10',checkOut:'2026-11-12',quantidade:1,dias:2,precoDia:5000,totalGeral:10000}},key:'fixture',idx:0},'');window.Stripe=()=>({elements:()=>({create:()=>({on(){},off(){},destroy(){},update(){},mount(node){node.textContent='Card fixture';}}),getElement(){return {};}}),createToken(){},createPaymentMethod(){},confirmCardPayment(){},_registerWrapper(){}});});
 await page.goto('http://127.0.0.1:'+server.address().port+'/checkout-carro');await page.locator('#condutor-carta_frente').waitFor({timeout:20000});
 await page.getByText(/Dinheiro.*Transfer/).waitFor();assert.match(await page.locator('body').innerText(),/Multibanco\/Vinti4.*Cheque/);
 await page.locator('input[type="text"]').first().fill('Condutor teste');await page.locator('input[type="email"]').fill('driver@example.invalid');await page.locator('input[type="tel"]').fill('+2389912345');
 await page.getByRole('button',{name:/Continuar para (o )?pagamento/}).click();assert.equal(sends,0);await page.getByText(/Envie a frente e o verso/).waitFor();
 await page.locator('#condutor-carta_frente').setInputFiles({name:'front.docx',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:Buffer.from('word')});await page.getByText(/Ficheiro inválido/).waitFor();
 const pdf=Buffer.from('%PDF-1.4\n%%EOF');
 for(const kind of ['carta_frente','carta_verso','identificacao']){assert.equal(await page.locator('#condutor-'+kind).getAttribute('accept'),'.jpg,.jpeg,.png,.pdf');await page.locator('#condutor-'+kind).setInputFiles({name:kind+'.pdf',mimeType:'application/pdf',buffer:pdf});}
 fs.mkdirSync('tmp/documentos',{recursive:true});await page.screenshot({path:'tmp/documentos/formulario.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'tmp/documentos/formulario-mobile.png',fullPage:true});await page.setViewportSize({width:1200,height:950});
 await page.getByRole('button',{name:/Continuar para (o )?pagamento/}).click();await page.locator('input[inputmode="numeric"]').first().waitFor();assert.equal(sends,1);
 for(let i=0;i<6;i++)await page.locator('input[inputmode="numeric"]').nth(i).fill(String(i+1));
 await page.getByRole('button',{name:'Confirmar email',exact:true}).click();await page.waitForURL('**/pagamento');await page.waitForTimeout(300);
 assert.equal(uploads,1);assert.equal(verifies,0);assert.ok(holds>=1);
 const cache=JSON.parse(await page.evaluate(()=>sessionStorage.getItem('reservaCarroPendente')));assert.equal(cache.reservaData.documentos_condutor.lote,'a'.repeat(32));assert.equal(JSON.stringify(cache).includes('carta_conducao_file'),false);assert.equal(JSON.stringify(cache).includes('documento_url'),false);assert.deepEqual(errors,[]);
 await browser.close();server.close();console.log('PASS browser: 3 required fields, Word blocked, multipart uploads all 3 after OTP, payment receives private proof, no public URLs or binary files cached. All external calls mocked.');
})().catch(e=>{console.error(e);server.close();process.exit(1)});
