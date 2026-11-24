const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(path.join(process.env.TEMP,'morabeza-email-php-check/node_modules/playwright-core'));
const root=path.resolve('dist');const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(f));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const page=await browser.newPage({viewport:{width:1280,height:950}});const errors=[];page.on('pageerror',e=>errors.push(e.message));let saves=0;
 const car={id:24,usuario_id:7,titulo:'Carro ponto 6',slug:'ponto6',marca:'Toyota',modelo:'Yaris',categoria_id:1,preco_dia:5000,status:'disponivel',status_carro:'aprovado',quilometragem:0,ano:2024,passageiros:5,portas:4,transmissao:'Manual',combustivel:'Gasolina',localizacao:'Santa Maria',cidade:'Santa Maria',ilha:'Sal',levantamento_local:'Santa Maria',exige_caucao:0,caucao_valor:0,imagens:['https://example.invalid/car.jpg'],caracteristicas:[],inclusoes:[]};
 await page.route('https://**/*',async route=>{
  const req=route.request(),url=req.url();if(req.resourceType()==='script')return route.fulfill({contentType:'application/javascript',body:''});
  if(url.includes('/carro/atualizar.php')){const b=req.postDataJSON();assert.equal(b.quilometragem,45231);Object.assign(car,b);saves++;return route.fulfill({json:{success:true,data:{carro_id:24}}});}
  if(url.includes('/carro/buscar_tipos.php'))return route.fulfill({json:{success:true,data:[{id:1,nome:'Compacto'}]}});
  if(url.includes('/carro/buscar.php'))return route.fulfill({json:{success:true,data:car}});
  if(url.includes('get_carro_detalhes.php'))return route.fulfill({json:{success:true,data:{...car,caracteristicas:{quilometragem:Number(car.quilometragem).toLocaleString('pt-PT')+' km',transmissao:'Manual',combustivel:'Gasolina',ano:2024,passageiros:5}}}});
  if(url.includes('get_carro.php'))return route.fulfill({json:{success:true,data:car}});
  if(url.includes('horarios_carro.php'))return route.fulfill({json:{success:true,horarios:{levantamento_hora_inicio:'10:00',levantamento_hora_fim:'14:00',devolucao_mesmo_horario:1,devolucao_hora_inicio:'10:00',devolucao_hora_fim:'14:00'}}});
  return route.fulfill({json:{success:true,data:[],disponivel:true,vagas_restantes:1}});
 });
 await page.addInitScript(()=>{localStorage.setItem('i18nextLng','pt');localStorage.setItem('user',JSON.stringify({id:7,nome:'Anfitriao teste',email:'teste@example.invalid'}));localStorage.setItem('token',btoa('{}')+'.'+btoa(JSON.stringify({data:{id:7},exp:4102444800}))+'.fixture');
 if(location.pathname==='/checkout-carro'){const dias=Number(new URL(location.href).searchParams.get('dias'));history.replaceState({usr:{reservaData:{id:24,titulo:'Carro ponto 6',checkIn:'2026-11-10',checkOut:'2026-11-12',dias,quantidade:1,precoDia:5000,totalGeral:5000*dias}},key:'fixture',idx:0},'');}});
 const base='http://127.0.0.1:'+server.address().port;await page.goto(base+'/carro-registo/editar/24');
 const title=page.getByPlaceholder('Ex: Toyota Hilux 2023 4x4');await title.waitFor();
 const checkSpacing=async()=>assert.ok(await title.evaluate(el=>{const icon=el.parentElement.querySelector('svg').getBoundingClientRect(),r=el.getBoundingClientRect();return r.left+parseFloat(getComputedStyle(el).paddingLeft)>=icon.right+8;}),'title text clears tag icon');
 await checkSpacing();await page.setViewportSize({width:390,height:844});await checkSpacing();await page.setViewportSize({width:1280,height:950});
 await page.getByRole('button',{name:'Especificações',exact:true}).click();const km=page.getByPlaceholder('Ex: 25000');assert.equal(await km.inputValue(),'0');await km.fill('');await km.blur();assert.equal(await km.inputValue(),'');await km.fill('45231');
 await page.getByRole('button',{name:'Fotos',exact:true}).click();await page.getByRole('button',{name:/Guardar/}).last().click();await page.waitForURL('**/carro-registo/meus');assert.equal(saves,1);
 await page.goto(base+'/carro-registo/editar/24');await title.waitFor();await page.getByRole('button',{name:'Especificações',exact:true}).click();assert.equal(await km.inputValue(),'45231');
 fs.mkdirSync('tmp/ponto6',{recursive:true});await page.screenshot({path:'tmp/ponto6/quilometragem.png',fullPage:true});
 await page.goto(base+'/carros/ponto6');await page.getByText(/45[.\s]?231 km/).first().waitFor({timeout:20000});
 for(const dias of [1,2]){await page.goto(base+'/checkout-carro?dias='+dias);await page.getByText(`Subtotal (${dias} ${dias===1?'dia':'dias'})`,{exact:true}).waitFor();}
 assert.deepEqual(errors,[]);await browser.close();server.close();console.log('PASS ponto 6: zero cleared and stays empty; 45231 sent on save, reopened and shown on public detail (mock API); icon/text separated desktop/mobile; 1 dia and 2 dias rendered.');
})().catch(e=>{console.error(e);server.close();process.exit(1)});
