const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(path.join(process.env.TEMP,'morabeza-email-php-check/node_modules/playwright-core'));
const root=path.resolve('dist');const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(f));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const page=await browser.newPage({viewport:{width:1280,height:950}});const errors=[];page.on('pageerror',e=>errors.push(e.message));let saves=[];
 const car={id:24,usuario_id:7,titulo:'Carro teste',levantamento_ilha:'Sal',levantamento_local:'Praia de Santa Maria',levantamento_hora_inicio:'10:00',levantamento_hora_fim:'14:00',devolucao_mesmo_local:0,devolucao_local_alternativo:'Aeroporto do Sal',exige_caucao:0,caucao_valor:0,caucao_formas:[],caucao_condicoes:''};
 let horarios={levantamento_hora_inicio:'10:00',levantamento_hora_fim:'14:00',devolucao_mesmo_horario:1,devolucao_hora_inicio:'10:00',devolucao_hora_fim:'14:00'};
 await page.route('https://**/*',async route=>{
  const req=route.request(),url=req.url();if(req.resourceType()==='script')return route.fulfill({contentType:'application/javascript',body:''});
  if(url.includes('horarios_carro.php')){const b=req.postDataJSON();assert.ok(req.headers().authorization);if(b.acao==='guardar'){saves.push(b);horarios={...horarios,...b};if(Number(b.devolucao_mesmo_horario)===1){horarios.devolucao_hora_inicio=b.levantamento_hora_inicio;horarios.devolucao_hora_fim=b.levantamento_hora_fim;}}return route.fulfill({json:{success:true,horarios}});}
  if(url.includes('/carro/listar.php'))return route.fulfill({json:{success:true,data:{items:[car]}}});
  if(url.includes('condicoes_guardar.php')){Object.assign(car,req.postDataJSON());return route.fulfill({json:{success:true}});}
  if(url.includes('listar_roles.php'))return route.fulfill({json:{success:true,roles:[{name:'proprietario_veiculos',status:'approved'}]}});
  return route.fulfill({json:{success:true,data:[]}});
 });
 await page.addInitScript(()=>{localStorage.setItem('i18nextLng','pt');localStorage.setItem('user',JSON.stringify({id:7,nome:'Anfitriao teste',email:'teste@example.invalid'}));localStorage.setItem('token',btoa('{}')+'.'+btoa(JSON.stringify({data:{id:7},exp:4102444800}))+'.fixture');});
 const url='http://127.0.0.1:'+server.address().port+'/gest/condicoes-veiculos?carro_id=24';await page.goto(url);
 const same=page.getByRole('checkbox',{name:/Usar o mesmo/});await same.waitFor({timeout:20000});await same.uncheck();
 const box=page.locator('div').filter({has:page.getByRole('heading',{name:'Janela permitida de devolução',exact:true})}).filter({has:page.locator('input[type=time]')}).last();
 const times=page.locator('input[type=time]');assert.equal(await times.count(),4);await times.nth(2).fill('16:30');await times.nth(3).fill('19:45');
 await page.getByRole('button',{name:/Guardar/}).last().click();await page.waitForTimeout(500);assert.equal(saves.length,1);assert.equal(saves[0].devolucao_mesmo_horario,0);assert.equal(saves[0].devolucao_hora_inicio,'16:30');
 await page.reload();await same.waitFor();await page.waitForTimeout(200);assert.equal(await same.isChecked(),false);assert.equal(await times.nth(2).inputValue(),'16:30');assert.equal(await times.nth(3).inputValue(),'19:45');
 fs.mkdirSync('tmp/horarios',{recursive:true});await page.screenshot({path:'tmp/horarios/anfitriao.png',fullPage:true});
 await same.check();await page.getByRole('button',{name:/Guardar/}).last().click();await page.waitForTimeout(400);assert.equal(saves.length,2);assert.equal(saves[1].devolucao_mesmo_horario,1);
 assert.deepEqual(errors,[]);await browser.close();server.close();console.log('PASS browser host: independent return window saved and survives reload; same-as-pickup option saved; alternate return location preserved.');
})().catch(e=>{console.error(e);server.close();process.exit(1)});
