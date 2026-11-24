const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(path.join(process.env.TEMP,'morabeza-email-php-check/node_modules/playwright-core'));
const root=path.resolve('dist');const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(f));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const page=await browser.newPage({viewport:{width:1280,height:950}});const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
 const start=new Date();start.setMonth(start.getMonth()+1,10);const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const date=n=>new Date(start.getFullYear(),start.getMonth(),n),a=iso(date(10)),b=iso(date(12)),c=iso(date(13)),d=iso(date(16));
 const format=n=>date(n).toLocaleDateString('pt-PT'),query=`?data_levantamento=${a}&data_devolucao=${b}`;
 const cars=[24,25].map(id=>({id,slug:'ponto7-'+id,titulo:'Carro ponto7 '+id,usuario_id:7,preco_dia:id===24?7000:9000,status:'disponivel',status_carro:'aprovado',levantamento_local:'Praia',exige_caucao:0,caucao_valor:0,imagens:['https://example.invalid/car.jpg'],caracteristicas:{},inclusoes:[],localizacao:'Sal',quantidade_disponivel:1}));
 await page.route('https://**/*',async route=>{
  const req=route.request(),u=new URL(req.url());if(req.resourceType()==='script')return route.fulfill({contentType:'application/javascript',body:''});
  if(u.pathname.endsWith('get_carro_fotos.php')){const car=cars.find(c=>String(c.id)===u.searchParams.get('id'));return route.fulfill({json:{success:true,data:{id:car.id,galeria_fonte:'carro_imagens',imagens:car.imagens}}});}
  if(u.pathname.endsWith('get_carro_detalhes.php')||u.pathname.endsWith('/carro/buscar.php')){const id=u.searchParams.get('id')||u.searchParams.get('slug')?.split('-').pop();return route.fulfill({json:{success:true,data:cars.find(c=>String(c.id)===id)}});}
  if(u.pathname.endsWith('get_carro.php')){const id=u.searchParams.get('id');return route.fulfill({json:{success:true,data:id?cars.find(c=>String(c.id)===id):cars}});}
  if(u.pathname.endsWith('verificar_disponibilidade_carro.php')){checks.push(Object.fromEntries(u.searchParams));const free=u.searchParams.get('carro_id')==='24';return route.fulfill({json:{success:true,disponivel:free,vagas_restantes:free?1:0}});}
  if(u.pathname.endsWith('calendario_carro.php')){const dias={};for(let dt=new Date(u.searchParams.get('inicio')+'T12:00:00');iso(dt)<u.searchParams.get('fim');dt.setDate(dt.getDate()+1))dias[iso(dt)]={levantamento:true,devolucao:!!u.searchParams.get('levantamento')&&iso(dt)>u.searchParams.get('levantamento')};return route.fulfill({json:{success:true,dias}});}
  if(u.pathname.endsWith('horarios_carro.php'))return route.fulfill({json:{success:true,horarios:{levantamento_hora_inicio:'10:00',levantamento_hora_fim:'14:00',devolucao_mesmo_horario:1,devolucao_hora_inicio:'10:00',devolucao_hora_fim:'14:00'}}});
  return route.fulfill({json:{success:true,data:[]}});
 });
 await page.addInitScript(()=>localStorage.setItem('i18nextLng','pt'));
 const base='http://127.0.0.1:'+server.address().port;
 await page.goto(base+'/carros'+query);const link=page.locator('a[href^="/carros/ponto7-24"]').first();await link.waitFor({timeout:20000});assert.ok((await link.getAttribute('href')).includes(query));await link.click();
 const reserve=page.getByRole('button',{name:'Reservar 1 carro',exact:true});await reserve.waitFor();await page.getByText(format(10),{exact:true}).first().waitFor();await page.getByText(format(12),{exact:true}).first().waitFor();await page.waitForFunction(()=>Array.from(document.querySelectorAll('button')).some(b=>b.textContent.includes('Reservar 1 carro')&&!b.disabled));
 assert.ok(checks.some(q=>q.carro_id==='24'&&q.checkin===a&&q.checkout===b));assert.match(await page.locator('body').innerText(),/14[.\s]?000 CVE/);
 await reserve.click();await page.waitForURL('**/checkout-carro');let state=await page.evaluate(()=>history.state.usr.reservaData);assert.equal(state.checkIn,a);assert.equal(state.checkOut,b);assert.equal(state.totalGeral,14000);
 await page.goto(base+'/carros/ponto7-24'+query);await reserve.waitFor();await page.getByText(format(10),{exact:true}).first().click();await page.getByText(/As datas riscadas/).waitFor();
 const day=n=>page.locator(`.react-datepicker__day--0${String(n).padStart(2,'0')}:not(.react-datepicker__day--outside-month)`);await day(13).click();await page.waitForTimeout(300);await day(16).click();await page.waitForTimeout(500);
 assert.equal(new URL(page.url()).searchParams.get('data_levantamento'),c);assert.equal(new URL(page.url()).searchParams.get('data_devolucao'),d);assert.ok(checks.some(q=>q.checkin===c&&q.checkout===d));assert.match(await page.locator('body').innerText(),/21[.\s]?000 CVE/);
 await page.reload();await reserve.waitFor();await page.getByText(format(13),{exact:true}).first().waitFor();await page.getByText(format(16),{exact:true}).first().waitFor();await reserve.click();await page.waitForURL('**/checkout-carro');state=await page.evaluate(()=>history.state.usr.reservaData);assert.equal(state.checkIn,c);assert.equal(state.checkOut,d);assert.equal(state.dias,3);assert.equal(state.totalGeral,21000);
 await page.goto(base+'/carros/ponto7-25'+query);await page.getByText(format(10),{exact:true}).first().waitFor();await page.getByRole('button',{name:/Sem carros/}).waitFor();assert.ok(checks.some(q=>q.carro_id==='25'&&q.checkin===a&&q.checkout===b));assert.equal(page.url().includes('checkout'),false);
 assert.deepEqual(errors,[]);await browser.close();server.close();console.log('PASS ponto 7: search links carry dates; selected-car availability and price recomputed; original dates reach checkout; edited dates replace URL, survive reload and reach checkout with new price; another car with no stock cannot proceed.');
})().catch(e=>{console.error(e);server.close();process.exit(1)});
