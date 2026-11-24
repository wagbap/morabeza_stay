const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(path.join(process.env.TEMP,'morabeza-email-php-check/node_modules/playwright-core'));
const root=path.resolve('dist');
const server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'index.html');res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1280,height:950}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',route=>route.request().resourceType()==='script'?route.fulfill({contentType:'application/javascript',body:''}):route.fulfill({json:{success:true,data:[],alojamentos:[],carros:[],experiencias:[],notificacoes:[]}}));
 await page.addInitScript(()=>localStorage.setItem('i18nextLng','pt'));
 const base='http://127.0.0.1:'+server.address().port;
 for(const [url,selector] of [['/','[data-pesquisa-servicos]'],['/alojamentos','[data-aloj-search]'],['/carros','[data-car-search]'],['/experiencias','[data-exp-search]']]){
  await page.goto(base+url);const form=page.locator(selector);await form.waitFor();assert.equal(await form.locator('select').count(),0);
  const triggers=form.locator('button[aria-haspopup="listbox"]');
  for(let i=0;i<await triggers.count();i++){
    const trigger=triggers.nth(i);await trigger.click();const menu=form.getByRole('listbox');await menu.waitFor();
    assert.ok(await menu.getByRole('option').count()>0);
    const option=menu.getByRole('option').first();await option.focus();
    assert.equal(await option.evaluate(el=>getComputedStyle(el).outlineStyle),'none');
    await page.keyboard.press('End');await page.keyboard.press('Enter');await menu.waitFor({state:'hidden'});
    await trigger.focus();await page.keyboard.press('ArrowDown');await menu.waitFor();await page.keyboard.press('Escape');await menu.waitFor({state:'hidden'});
  }
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: four public searches, custom options, no blue outline, selection, keyboard and Escape.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exit(1)});
