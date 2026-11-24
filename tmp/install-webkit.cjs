const path=require('path');
process.env.PLAYWRIGHT_BROWSERS_PATH=path.resolve('tmp/webkit-browsers');
const {registry}=require(path.join(process.env.TEMP,'morabeza-email-php-check/node_modules/playwright-core/lib/coreBundle.js')).registry;
registry.install([registry.findExecutable('webkit')],{force:false}).then(()=>console.log('WebKit ready')).catch(e=>{console.error(e.message);process.exit(1)});
