'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const {openDatabase}=require('../server/database.cjs');
const {makeApp}=require('../server/app.cjs');
async function withServer(fn){const db=openDatabase(':memory:');const server=makeApp(db,{now:()=>40000}).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));try{await fn(`http://127.0.0.1:${server.address().port}`);}finally{await new Promise(resolve=>server.close(resolve));db.close();}}
async function post(url,route,data){const res=await fetch(url+'/api/game/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data||{})});return {status:res.status,body:await res.json()};}
test('API persists across GETs and handles rejected trades',async()=>withServer(async url=>{
 let x=await fetch(url+'/api/game').then(r=>r.json());assert.equal(x.state.coins,120);
 x=await post(url,'buy',{cropId:'potato',quantity:1});assert.equal(x.status,200);assert.equal(x.body.state.coins,106);
 x=await post(url,'buy',{cropId:'tomato',quantity:99});assert.equal(x.status,400);
 x=await fetch(url+'/api/game').then(r=>r.json());assert.equal(x.state.coins,106);
}));
test('API harvest maturity enforced by server time',async()=>withServer(async url=>{
 let x=await post(url,'plant',{index:0,cropId:'carrot'});assert.equal(x.status,200);
 x=await post(url,'harvest',{index:0});assert.equal(x.status,400);
 x=await post(url,'reset');assert.equal(x.status,200);assert.equal(x.body.state.coins,120);
}));
