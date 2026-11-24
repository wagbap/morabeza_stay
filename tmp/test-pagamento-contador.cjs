const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(path.join(process.env.TEMP,'morabeza-email-php-check/node_modules/playwright-core'));
const root=path.resolve('dist');
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 let file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'index.html');
 res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1200,height:950}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let now=Date.now(),expires=now+300000,firstToken=null,phase='normal',requests=0,confirmed=0;
 await page.route('https://**/*',async route=>{
  const url=route.request().url();
  if(route.request().resourceType()==='script')return route.fulfill({contentType:'application/javascript',body:''});
  if(url.includes('create-payment-intent.php')){
   requests++;const body=route.request().postDataJSON();
   if(!firstToken)firstToken=body.pedido_stock;else assert.equal(body.pedido_stock,firstToken);
   if(phase==='expired')return route.fulfill({status:409,json:{code:'CARRO_RETENCAO_EXPIRADA'}});
   if(body.acao==='falha')return route.fulfill({status:409,json:{code:'CARRO_PAGAMENTO_FALHOU'}});
   return route.fulfill({json:{clientSecret:'pi_fixture_secret',alreadyPaid:false,paymentStatus:'requires_payment_method',serverNow:new Date(now).toISOString(),expiresAt:new Date(expires).toISOString()}});
  }
  return route.fulfill({json:{success:true,data:[],notificacoes:[]}});
 });
 await page.exposeFunction('contarConfirmacao',()=>{confirmed++;});
 await page.addInitScript(()=>{
  localStorage.setItem('i18nextLng','pt');
  if(!sessionStorage.getItem('reservaCarroPendente'))sessionStorage.setItem('reservaCarroPendente',JSON.stringify({
   reservaData:{id:24,titulo:'Carro de teste',checkIn:'2026-11-10',checkOut:'2026-11-12',quantidade:1,dias:2,precoDia:5000,precoTotal:10000,totalGeral:10000,exige_caucao:0,caucao_valor:0},
   participantePrincipal:{nome_completo:'Teste',email:'teste@example.invalid'},participantesAdicionais:[]
  }));
  window.Stripe=()=>{
   const cache={};
   return {_registerWrapper(){},createToken(){},createPaymentMethod(){},
    elements(){return {create(type){return cache[type]={on(){},off(){},update(){},destroy(){},mount(node){node.textContent='Cartao de teste';}};},getElement(){return cache.cardNumber;}};},
    async confirmCardPayment(){await window.contarConfirmacao();return {error:{message:'Cartao recusado'}};},
    async retrievePaymentIntent(){return {};}
   };
  };
 });
 const url='http://127.0.0.1:'+server.address().port+'/pagamento';
 await page.goto(url);await page.getByText(/Tempo para pagar: 05:00/).waitFor({timeout:20000});
 assert.ok(requests>0,'hold requested without clicking Pay');
 assert.equal(confirmed,0);
 await page.getByText('Pagamento com cart\u00e3o',{exact:true}).waitFor();
 now+=180000;await page.reload();await page.getByText(/Tempo para pagar: 02:00/).waitFor({timeout:15000});
 const pay=page.getByRole('button',{name:/Pagar CVE/});assert.equal(await pay.isEnabled(),true);
 await pay.click();await page.getByText(/O pagamento falhou e a unidade foi libertada/).waitFor({timeout:10000});
 assert.equal(confirmed,1);assert.equal(await pay.isDisabled(),true);
 phase='expired';await page.reload();await page.getByText(/O prazo de 5 minutos terminou/).waitFor({timeout:15000});
 assert.equal(await page.getByRole('button',{name:/Pagar CVE/}).isDisabled(),true);
 assert.deepEqual(errors,[]);
 fs.mkdirSync('tmp/pagamento',{recursive:true});await page.screenshot({path:'tmp/pagamento/expirado.png',fullPage:true});
 await browser.close();server.close();console.log('PASS: entry hold, translated label, refresh 02:00, card decline release, expired Pay disabled; no production API requests.');
})().catch(e=>{console.error(e);server.close();process.exit(1)});
