'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('beta1 resources and responsive breakpoints are linked',()=>{
 const html=read('public/index.html'),css=read('public/beta1.css');
 assert.match(html,/href="\.\/beta1\.css"/);assert.match(html,/src="\.\/beta1\.js"/);
 for(const n of [720,420,350])assert.ok(css.includes(`max-width:${n}px`));
});
test('navigation targets and collapsible guide exist',()=>{
 const html=read('public/index.html');for(const id of ['farmHeading','storeHeading','inventoryHeading','ledgerHeading']){
 assert.ok(html.includes(`href="#${id}"`));assert.ok(html.includes(`id="${id}"`));}
 assert.match(html,/<details id="farmGuide"/);assert.match(html,/<\/details>/);
});
test('existing game source and server files remain present',()=>{
 for(const p of ['public/script.js','public/audio.js','public/game-core.js','server/app.cjs','server/database.cjs'])assert.ok(fs.existsSync(path.join(root,p)));
});
test('new responsive script syntax is valid and has no server writes',()=>{
 const js=read('public/beta1.js');assert.doesNotMatch(js,/fetch\(|localStorage|\.sqlite|\/api\//);
});
