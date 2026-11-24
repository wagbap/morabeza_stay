const fs=require('fs'),path=require('path');
const root=path.join(process.env.TEMP,'morabeza-email-php-check/node_modules');
(async()=>{
 const {PHP}=require(path.join(root,'@php-wasm/universal'));
 const {loadNodeRuntime}=require(path.join(root,'@php-wasm/node'));
 const php=new PHP(await loadNodeRuntime('8.3',{emscriptenOptions:{processId:65421,wasmBinary:fs.readFileSync(path.join(root,'@php-wasm/node-8-3/asyncify/8_3_33/php_8_3.wasm'))}}));
 php.mkdir('/api');php.mkdir('/api/vendor');
 php.writeFile('/api/carroStock.php','<?php');
 php.writeFile('/api/carroStripeStock.php',fs.readFileSync('server/api/carroStripeStock.php','utf8'));
 php.writeFile('/test.php',`<?php
 require '/api/carroStripeStock.php';
 function check($v,$m){if(!$v)throw new Exception($m);}
 try {carroStripeCliente();throw new Exception('missing key accepted');}catch(StripeConfiguracaoException $e){check($e->codigo==='STRIPE_CONFIG_MISSING','missing key code');}
 define('CHECKOUT_STRIPE_SECRET_KEY','fixture-legacy');
 file_put_contents('/api/stripe-config.local.php',"<?php return ['secret_key'=>''];");
 check(carroStripeChave()==='fixture-legacy','empty config must preserve legacy key');
 try {carroStripeCliente();throw new Exception('missing SDK accepted');}catch(StripeConfiguracaoException $e){check($e->codigo==='STRIPE_SDK_MISSING','missing SDK code');}
 file_put_contents('/api/stripe-config.local.php',"<?php return ['secret_key'=>'fixture-local'];");
 file_put_contents('/api/vendor/autoload.php','<?php namespace Stripe; class StripeClient {public $key; public function __construct($key){$this->key=$key;}}');
 check(carroStripeCliente()->key==='fixture-local','local SDK path and local key');
 echo 'PASS: missing key, legacy fallback, missing SDK, api/vendor fallback; no Stripe network calls.';
 `);
 const r=await php.run({scriptPath:'/test.php'});process.stdout.write(r.text);process.exit(r.exitCode ? 1 : 0);
})().catch(e=>{console.error(e);process.exit(1)});
