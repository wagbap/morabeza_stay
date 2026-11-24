const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(path.join(process.env.TEMP,'morabeza-email-php-check/node_modules/playwright-core'));
const root=path.resolve('dist');const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.woff2')?'font/woff2':'text/html');res.end(fs.readFileSync(f));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const page=await browser.newPage({viewport:{width:1366,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const photo='https://example.invalid/photo.jpg';const car={id:24,usuario_id:7,titulo:'Toyota teste',slug:'toyota',marca:'Toyota',modelo:'Yaris',preco_dia:5000,status:'disponivel',status_carro:'aprovado',ilha:'Sal',localizacao:'Santa Maria',imagens:[photo]};
 const exp={id:31,titulo:'Passeio teste',slug:'passeio',status:'aprovado',ilha:'Sal',localizacao:'Santa Maria',imagem_principal:photo,preco:2500,duracao:'2h',max_pessoas:8,modelo_reserva:'por_pessoa'};
 const aloj={id:42,titulo:'Casa teste',slug:'casa',status:'aprovado',ilha:'Sal',localizacao:'Santa Maria',imagem_url:photo,preco_noite:8000};
 let deletes=0;
 await page.route('https://**/*',async route=>{const req=route.request(),u=new URL(req.url());let data={success:true,data:[]};if(req.method()==='DELETE'){deletes++;return route.fulfill({status:500,json:{success:false}});}if(req.resourceType()==='script')return route.fulfill({contentType:'application/javascript',body:''});if(req.resourceType()==='image')return route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="#82b8bf"/></svg>'});
 if(u.pathname.endsWith('listar_roles.php'))data={success:true,roles:[{name:'anfitrion',status:'approved'},{name:'guia',status:'approved'},{name:'proprietario_veiculos',status:'approved'}]};
 if(u.pathname.endsWith('/carro/listar.php'))data={success:true,data:[car]};
 if(u.pathname.endsWith('/carro/buscar.php'))data={success:true,data:car};
 if(u.pathname.endsWith('/carro/unidades_listar.php'))data={success:true,data:[{id:1,status:'disponivel'}]};
 if(u.pathname.endsWith('/get_experiencias.php'))data={success:true,data:[exp]};
 if(u.pathname.endsWith('/experiencia/buscar.php'))data={success:true,data:exp};
 if(u.pathname.endsWith('/alojamento/meus_alojamentos.php'))data={success:true,data:[aloj]};
 return route.fulfill({json:data,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}});
 });
 await page.addInitScript(()=>{localStorage.setItem('i18nextLng','pt');localStorage.setItem('user',JSON.stringify({id:7,nome:'Anfitriao teste',email:'teste@example.invalid'}));localStorage.setItem('token',btoa('{}')+'.'+btoa(JSON.stringify({data:{id:7},exp:4102444800}))+'.fixture');});
 const base='http://127.0.0.1:'+server.address().port;fs.mkdirSync('tmp/padrao-gestao',{recursive:true});const styles=[];
 for(const [legacy,target,title] of [['/carro-registo/meus','/gest/unidades-veiculos',car.titulo],['/experiencia-registo/meus','/gest/minhas-experiencias',exp.titulo],['/alojamento-registro/meus','/gest/meus-alojamentos',aloj.titulo]]){
  await page.goto(base+legacy);await page.waitForURL('**'+target);const list=page.locator('[data-gest-list]');const card=page.locator('[data-gest-card]');await card.waitFor();assert.equal(await card.getAttribute('aria-label'),title);assert.equal(await card.getByRole('img').count(),1);
  styles.push(await card.evaluate(el=>({radius:getComputedStyle(el).borderRadius,padding:getComputedStyle(el).padding,background:getComputedStyle(el).backgroundColor})));
  await list.getByRole('searchbox').fill('inexistente');assert.equal(await card.count(),0);await list.getByRole('searchbox').fill('teste');await card.waitFor();
  await list.getByRole('combobox').selectOption(target.includes('veiculos')?'manutencao':'inativo');assert.equal(await card.count(),0);await list.getByRole('combobox').selectOption('todos');await card.waitFor();
  await card.getByRole('button',{name:'Eliminar',exact:true}).click();await page.getByRole('dialog').waitFor();await page.getByRole('button',{name:/Cancelar/}).click();assert.equal(await page.getByRole('dialog').count(),0);
  await page.screenshot({path:'tmp/padrao-gestao/'+target.split('/').pop()+'-desktop.png',fullPage:true});
  await page.setViewportSize({width:375,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no mobile horizontal overflow');assert.ok(await card.evaluate(el=>el.getBoundingClientRect().right<=innerWidth),'card fits mobile');await page.screenshot({path:'tmp/padrao-gestao/'+target.split('/').pop()+'-mobile.png',fullPage:true});await page.setViewportSize({width:1366,height:1000});
 }
 assert.deepEqual(styles[0],styles[1]);assert.deepEqual(styles[1],styles[2]);assert.equal(deletes,0);assert.deepEqual(errors,[]);await browser.close();server.close();console.log('PASS: all three legacy routes redirect to unified management; matching card styles, images, search, status filters, delete confirmation/cancel and mobile widths; no external mutations.');
})().catch(e=>{console.error(e);server.close();process.exit(1)});
