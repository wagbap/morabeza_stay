const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
process.env.PLAYWRIGHT_BROWSERS_PATH=path.resolve('tmp/webkit-browsers');
const {chromium,webkit}=require(path.join(process.env.TEMP,'morabeza-email-php-check/node_modules/playwright-core'));
const root=path.resolve('dist');const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.jpg':'image/jpeg'})[path.extname(f)]||'text/html');fs.createReadStream(f).pipe(res);});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await (process.env.TEST_WEBKIT?webkit:chromium).launch(process.env.TEST_WEBKIT?{headless:true}:{headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});const page=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));
 const house={id:41,titulo:'Casa Tarrafal',slug:'casa-tarrafal',ilha:'Santiago',localizacao:'Tarrafal',cidade:'Tarrafal',preco_noite:5000,preco_mostrar:5000,capacidade:8,capacidade_efetiva:8,quartos:3,tipo_propriedade:'Casa',status:'aprovado',imagem_url:'https://fixture.invalid/house.jpg'};
 const rows=[house,{...house,id:42,titulo:'Casa Praia',slug:'casa-praia',localizacao:'Praia',cidade:'Praia'},{...house,id:43,titulo:'Casa Sal',slug:'casa-sal',ilha:'Sal',localizacao:'Tarrafal',cidade:'Tarrafal'}];
 await page.route('https://**/*',async route=>{const req=route.request(),u=new URL(req.url());if(req.resourceType()==='script')return route.fulfill({contentType:'application/javascript',body:''});if(req.resourceType()==='image'){const f=u.hostname==='res.cloudinary.com'?'logo.png':'mapa.jpg';return route.fulfill({contentType:f.endsWith('png')?'image/png':'image/jpeg',body:fs.readFileSync('tmp/referencia-experiencias/'+f)});}let data={success:true,data:[]};if(u.pathname.endsWith('/get_alojamentos.php')){requests.push(u);data=rows;}if(u.pathname.endsWith('/alojamento/buscar.php'))data={success:true,data:house};return route.fulfill({json:data,headers:{'Access-Control-Allow-Origin':req.headers()['origin']||'*','Access-Control-Allow-Credentials':'true','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}});});
 await page.addInitScript(()=>localStorage.setItem('i18nextLng','pt'));const base='http://127.0.0.1:'+server.address().port;fs.mkdirSync('tmp/alojamento-mobile',{recursive:true});
 for (const [url,selector] of [['/alojamentos?destino=Santiago','[data-aloj-search]'],['/carros?destino=Santiago','[data-car-search]'],['/experiencias?destino=Santiago','[data-exp-search]']]) {
  await page.goto(base+url); const f=page.locator(selector);await f.waitFor();
  const trigger=f.locator('button').filter({has:f.locator('svg')});
  await f.locator('button').filter({hasText:/Escolher data/}).first().click();
  const cal=f.locator('.react-datepicker');await cal.waitFor();
  await cal.locator('.react-datepicker__day--012:not(.react-datepicker__day--outside-month)').click();
  await cal.getByRole('button',{name:'Fechar',exact:true}).click();await cal.waitFor({state:'hidden'});
  assert.ok(await f.locator('button').filter({hasText:/12/}).count(),url+' retains incomplete date');
  await f.locator('button').filter({hasText:/12/}).first().click();await cal.waitFor();
  await cal.getByRole('button',{name:'Limpar',exact:true}).click();
  assert.equal(await cal.locator('.react-datepicker__day--selected,.react-datepicker__day--range-start').count(),0);
  await cal.getByRole('button',{name:'Fechar',exact:true}).click();await cal.waitFor({state:'hidden'});
  assert.ok(await f.locator('button').filter({hasText:/Escolher data/}).count());
 }
 await b.close();server.close();console.log('PASS: three services clear selected date; close retains selection; reopen and clear; mobile.');
})().catch(e=>{console.error(e);server.close();process.exit(1)});
