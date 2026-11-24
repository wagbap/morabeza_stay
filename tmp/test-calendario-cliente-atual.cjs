const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(path.join(process.env.TEMP,'morabeza-email-php-check/node_modules/playwright-core'));
const root=path.resolve('dist');
const server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'index.html');res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:950}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let blocks=[],actions=[],mode='free',calendarGets=0;
 const car={id:24,titulo:'Carro calendario teste',slug:'teste',preco_dia:5000,status_carro:'aprovado',status:'disponivel',exige_caucao:0,caucao_valor:0,levantamento_local:'Praia',imagens:[],caracteristicas:[],inclusoes:[],usuario_id:7};
 const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const target=new Date();target.setDate(target.getDate()+1);const date=iso(target);
 const plus=new Date(target);plus.setDate(plus.getDate()+1);const next=iso(plus);
 const invalid=new Date(target);invalid.setDate(invalid.getDate()+2);const bad=iso(invalid);
 await page.route('https://**/*',async route=>{
  const req=route.request(),u=new URL(req.url());
  if(req.resourceType()==='script')return route.fulfill({contentType:'application/javascript',body:''});
  if(u.pathname.endsWith('listar_roles.php'))return route.fulfill({json:{success:true,roles:[{name:'proprietario_veiculos',status:'approved'}]}});
  if(u.pathname.includes('get_carros_by_proprietario'))return route.fulfill({json:{success:true,data:[car]}});
  if(u.pathname.endsWith('calendario_carro.php')){
   if(req.method()==='POST'){
    assert.ok(req.headers().authorization);const b=req.postDataJSON();
    if(b.acao==='bloquear'){assert.equal(b.unidade_id,1);assert.ok(b.motivo.length>=3);blocks=b.datas.map(data=>({data,unidade_id:1,motivo:b.motivo}));actions.push('bloquear');}
    if(b.acao==='desbloquear'){blocks=blocks.filter(x=>!b.datas.includes(x.data));actions.push('desbloquear');}
    return route.fulfill({json:{success:true,unidades:[{id:1,matricula:'AA-01',estado:'disponivel'},{id:2,matricula:'BB-02',estado:'manutencao',motivo_bloqueio:'Oficina'}],bloqueios:blocks,reservas:[]}});
   }
   calendarGets++;if(mode==='error') return route.fulfill({status:500,json:{success:false}});const dias={};for(let d=new Date(u.searchParams.get('inicio')+'T12:00:00');iso(d)<u.searchParams.get('fim');d.setDate(d.getDate()+1))dias[iso(d)]={levantamento:mode!=='maintenance',devolucao:mode!=='maintenance'&&!!u.searchParams.get('levantamento')&&iso(d)>u.searchParams.get('levantamento')&&iso(d)!==bad};
   return route.fulfill({json:{success:true,dias}});
  }
  if(u.pathname.endsWith('get_carro_detalhes.php')||u.pathname.endsWith('get_carro.php'))return route.fulfill({json:{success:true,data:car}});
  if(u.pathname.endsWith('verificar_disponibilidade_carro.php'))return route.fulfill({json:{success:true,disponivel:mode!=='maintenance',vagas_restantes:mode==='maintenance'?0:1}});
  return route.fulfill({json:{success:true,data:[],notificacoes:[],avaliacoes:[]}});
 });
 await page.addInitScript(()=>{localStorage.setItem('i18nextLng','pt');localStorage.setItem('user',JSON.stringify({id:7,nome:'Anfitriao teste',email:'teste@example.invalid'}));localStorage.setItem('token',btoa('{}')+'.'+btoa(JSON.stringify({data:{id:7},exp:4102444800}))+'.fixture');});
 fs.mkdirSync('tmp/calendarios',{recursive:true});
 await page.goto(base+'/carros/teste');await page.getByText('__/__/____',{exact:true}).first().waitFor({timeout:20000});await page.locator('button[aria-controls^="carro-calendario-"][aria-label]').click();
 await page.waitForFunction(()=>document.querySelector('.react-datepicker__day:not(.react-datepicker__day--disabled)'));
 const day=d=>page.locator(`.react-datepicker__day--0${String(d.getDate()).padStart(2,'0')}:not(.react-datepicker__day--outside-month)`);
 await day(target).click();await page.waitForTimeout(300);
 assert.equal(await day(invalid).getAttribute('aria-disabled'),'true');assert.equal(await day(plus).getAttribute('aria-disabled'),'false');
 await day(plus).click();await page.waitForTimeout(400);
 assert.ok(calendarGets>=2);mode='maintenance';await page.reload();await page.locator('button[aria-controls^="carro-calendario-"][aria-label]').click();
 await page.getByText(/As datas riscadas/).waitFor();assert.equal(await day(target).getAttribute('aria-disabled'),'true');
 await page.screenshot({path:'tmp/calendarios/cliente-manutencao.png',fullPage:true});
 mode='error';await page.reload();await page.locator('button[aria-controls^="carro-calendario-"][aria-label]').click();
 await page.getByRole('button',{name:'Tentar novamente',exact:true}).waitFor();
 assert.equal(await day(target).getAttribute('aria-disabled'),'true');
 mode='free';await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();
 await page.getByRole('button',{name:'Tentar novamente',exact:true}).waitFor({state:'hidden'});
 await page.waitForFunction(()=>document.querySelector('.react-datepicker__day:not(.react-datepicker__day--disabled)'));
 assert.equal(await day(target).getAttribute('aria-disabled'),'false');
 assert.deepEqual(errors,[]);
 await browser.close();server.close();console.log('PASS: client free dates, continuous returns, unavailable dates, failed load blocked, retry recovery; remote calls mocked.');
})().catch(e=>{console.error(e);server.close();process.exit(1)});
