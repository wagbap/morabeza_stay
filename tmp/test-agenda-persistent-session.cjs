const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
process.env.PLAYWRIGHT_BROWSERS_PATH=path.resolve('tmp/webkit-browsers');
const {chromium,webkit}=require(path.join(process.env.TEMP,'morabeza-email-php-check/node_modules/playwright-core'));
const root=path.resolve('dist');const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.woff2')?'font/woff2':'text/html');res.end(fs.readFileSync(f));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await (process.env.TEST_WEBKIT?webkit:chromium).launch(process.env.TEST_WEBKIT?{headless:true}:{executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const photo='https://example.invalid/photo.jpg';const car={id:24,usuario_id:7,titulo:'Toyota teste',slug:'toyota',marca:'Toyota',modelo:'Yaris',preco_dia:5000,status:'disponivel',status_carro:'aprovado',ilha:'Sal',localizacao:'Santa Maria',imagens:[photo]};
 const exp={id:31,titulo:'Passeio teste',slug:'passeio',status:'aprovado',ilha:'Sal',localizacao:'Santa Maria',imagem_principal:photo,preco:2500,duracao:'2h',max_pessoas:8,modelo_reserva:'por_pessoa'};
 const aloj={id:42,titulo:'Casa teste',slug:'casa',status:'aprovado',ilha:'Sal',localizacao:'Santa Maria',imagem_url:photo,preco_noite:8000};
 let deletes=0;let agendaCalls=0;let refused=0;
 await page.route('https://**/*',async route=>{const req=route.request(),u=new URL(req.url());let data={success:true,data:[]};if(req.method()==='DELETE'){deletes++;return route.fulfill({status:500,json:{success:false}});}if(req.resourceType()==='script')return route.fulfill({contentType:'application/javascript',body:''});if(req.resourceType()==='image')return route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="#82b8bf"/></svg>'});
 if(u.pathname.endsWith('listar_roles.php'))data={success:true,roles:[{name:'anfitrion',status:'approved'},{name:'guia',status:'approved'},{name:'proprietario_veiculos',status:'approved'}]};
 if(u.pathname.endsWith('/agenda_experiencias.php')) {
  agendaCalls++;if(!String(req.headers().authorization||'').endsWith('.fixture')) {refused++;return route.fulfill({status:403,json:{success:false,code:'AUTH_REQUIRED',mensagem:'Inicie sessao novamente.'},headers:{'Access-Control-Allow-Origin':'*'}});}
  data={success:true,experiencia:{...exp,id:20,modelo_reserva:'por_pessoa'},agenda:{dias_json:'[1,2,3,4,5,6,7]',inicio:'2026-11-08',fim:null,repeticao:'semanal',minima_horas:24,maxima_dias:180},configuracoes:[],recursos:[],sessoes:[],excecoes:[],historico:[]};
 }
 if(u.pathname.endsWith('/carro/listar.php'))data={success:true,data:[car]};
 if(u.pathname.endsWith('/carro/buscar.php'))data={success:true,data:car};
 if(u.pathname.endsWith('/carro/unidades_listar.php'))data={success:true,data:[{id:1,status:'disponivel'}]};
 if(u.pathname.endsWith('/get_experiencias.php'))data={success:true,data:[exp]};
 if(u.pathname.endsWith('/experiencia/buscar.php'))data={success:true,data:exp};
 if(u.pathname.endsWith('/alojamento/meus_alojamentos.php'))data={success:true,data:[aloj]};
 return route.fulfill({json:data,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}});
 });
 await page.addInitScript(()=>{localStorage.setItem('i18nextLng','pt');localStorage.setItem('reserva_validation_token','expired-eight-hour-token');localStorage.setItem('user',JSON.stringify({id:7,nome:'Anfitriao teste',email:'teste@example.invalid'}));if(!localStorage.getItem('token'))localStorage.setItem('token',btoa('{}')+'.'+btoa(JSON.stringify({data:{id:7},exp:4102444800}))+'.fixture');});
 const base='http://127.0.0.1:'+server.address().port;fs.mkdirSync('tmp/padrao-gestao',{recursive:true});const styles=[];

 await page.goto(base+'/gest/experiencia/20/sessoes');await page.waitForLoadState('networkidle');await page.getByRole('heading',{name:/Agenda de funcionamento/}).waitFor();await page.waitForLoadState('networkidle');assert.equal(refused,0);assert.ok(agendaCalls>0);assert.equal(await page.getByText('Inicie sessao novamente.',{exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:/Nova config/}).isEnabled(),true);
 const before=agendaCalls;await page.reload();await page.getByRole('button',{name:/Nova config/}).waitFor();await page.waitForLoadState('networkidle');assert.ok(agendaCalls>before);assert.equal(refused,0);assert.ok(new URL(page.url()).pathname.includes('/sessoes'));assert.equal(await page.evaluate(()=>!!localStorage.getItem('token')),true);
 await page.evaluate(()=>{const token=localStorage.getItem('token');localStorage.setItem('morabeza_token',token);if(!localStorage.getItem('token'))localStorage.setItem('token',btoa('{}')+'.'+btoa(JSON.stringify({exp:1,data:{id:7}}))+'.old');});await page.reload();await page.getByRole('button',{name:/Nova config/}).waitFor();await page.waitForLoadState('networkidle');assert.equal(refused,0);assert.ok(new URL(page.url()).pathname.includes('/sessoes'));assert.equal(await page.getByRole('button',{name:/Nova config/}).isEnabled(),true);assert.equal(deletes,0);assert.deepEqual(errors,[]);
 await browser.close();server.close();console.log('PASS: direct agenda entry, expired auxiliary credential, reload, stale JWT alias with valid saved login; panel loaded without re-login. Mocked API only.');
})().catch(e=>{console.error(e);server.close();process.exit(1)});
