const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
process.env.PLAYWRIGHT_BROWSERS_PATH=path.resolve('tmp/webkit-browsers');
const {webkit}=require(path.join(process.env.TEMP,'morabeza-email-php-check/node_modules/playwright-core'));
const root=path.resolve('dist');const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(f));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await webkit.launch({headless:true});const page=await browser.newPage({viewport:{width:375,height:812},isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));let count=2,failed=false;
 const raw=JSON.parse(fs.readFileSync('tmp/ponto9/toyota-galerias.json')).find(r=>r.id===24)['carro/buscar.php?id=24'];
 const actual=raw.imagens.slice(0,2),shot=raw.imagens[2].caminho_url;
 const car={...raw,slug:'teste-toyota-2',usuario_id:7,preco_dia:5000,status:'disponivel',status_carro:'aprovado',levantamento_local:'Praia',exige_caucao:0,caucao_valor:0,caracteristicas:{},inclusoes:[],imagem_url:shot,imagens_extra:[shot]};
 await page.route('https://**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.pathname.includes('/tracking/'))return route.fulfill({headers:{'access-control-allow-origin':'*','access-control-allow-headers':'Content-Type, Authorization','access-control-allow-methods':'GET, POST, OPTIONS'},json:{success:true}});
  if(req.resourceType()==='script')return route.fulfill({contentType:'application/javascript',body:''});
  if(req.resourceType()==='image')return route.fulfill({contentType:'image/jpeg',body:fs.readFileSync(u.pathname.includes('6ae9b4a2d4fb4')?'tmp/ponto9/toyota-24-2.jpeg':'tmp/ponto9/toyota-24-1.jpeg')});
  if(u.pathname.endsWith('get_carro_fotos.php'))return failed?route.fulfill({status:503,json:{success:false}}):route.fulfill({json:{success:true,data:{id:24,galeria_fonte:'carro_imagens',imagens:Array.from({length:count},(_,i)=>i<2?actual[i]:{caminho_url:`/uploads/carros/foto-real-${i}.jpg`,ordem:i})}}});
  if(u.pathname.endsWith('get_carro_detalhes.php')||u.pathname.endsWith('get_carro.php'))return route.fulfill({json:{success:true,data:car}});
  if(u.pathname.endsWith('verificar_disponibilidade_carro.php'))return route.fulfill({json:{success:true,disponivel:true,vagas_restantes:1}});
  return route.fulfill({json:{success:true,data:[]}});
 });
 await page.addInitScript(()=>localStorage.setItem('i18nextLng','pt'));const base='http://127.0.0.1:'+server.address().port;
 const check=async()=>{assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const urls=await page.locator('[data-carro-galeria] img').evaluateAll(es=>es.map(e=>e.src));assert.ok(!urls.some(u=>u.includes('carro_6ae9bf8a1dc89')));assert.ok(!urls.some(u=>u.includes('unsplash')));};
 for(const width of [320,375,1280]){
  await page.setViewportSize({width,height:900});await page.goto(base+'/carros/teste-toyota-2');const all=page.getByRole('button',{name:/Ver todas as fotos.*2/});await all.waitFor({timeout:20000});await page.waitForTimeout(200);await check();assert.equal(await page.locator('[data-carro-galeria] img').count(),2);
  await page.getByRole('button',{name:'Ver fotografia 2',exact:true}).click();await page.getByRole('dialog').waitFor();assert.equal(await page.getByRole('dialog').locator('img').getAttribute('src'),actual[1].caminho_url);await page.getByRole('button',{name:'Fotografia seguinte',exact:true}).click();assert.equal(await page.getByRole('dialog').locator('img').getAttribute('src'),actual[0].caminho_url);await page.getByRole('button',{name:'Fechar',exact:true}).last().click();
  await all.click();await page.getByRole('dialog').waitFor();await page.getByRole('button',{name:'Fechar',exact:true}).last().click();
 }
 fs.mkdirSync('tmp/ponto9',{recursive:true});await page.locator('[data-carro-galeria]').screenshot({path:'tmp/ponto9/galeria-desktop.png'});
 for(const n of [0,1,5]){count=n;await page.goto(base+'/carros/teste-toyota-2');if(n===0){await page.getByText('Fotografias do veículo indisponíveis.',{exact:true}).waitFor();assert.equal(await page.locator('[data-carro-galeria] img').count(),0);}else{await page.getByRole('button',{name:new RegExp(`Ver todas as fotos.*${n}`)}).waitFor();assert.equal(await page.locator('[data-carro-galeria] img').count(),Math.min(n,4));}await check();}
 failed=true;await page.reload();await page.getByText('Fotografias do veículo indisponíveis.',{exact:true}).waitFor();assert.equal(await page.locator('[data-carro-galeria] img').count(),0);assert.deepEqual(errors,[]);await browser.close();server.close();console.log('PASS WebKit gallery: real source overrides screenshot/cover aliases; 2 actual Toyota photos; modal and all-photos work; no fake missing thumbnails; empty/error/1/5-photo cases handled; no overflow at 320/375/1280.');
})().catch(e=>{console.error(e);server.close();process.exit(1)});
