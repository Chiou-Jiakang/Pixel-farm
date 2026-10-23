'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const js = fs.readFileSync(path.join(root, 'public/mobile-tabs.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public/mobile-tabs.css'), 'utf8');
const element = () => ({ hidden: false, attributes: {}, classList: {set: new Set(), toggle(x,on){on?this.set.add(x):this.set.delete(x)}}, handlers: {}, setAttribute(k,v){this.attributes[k]=v},removeAttribute(k){delete this.attributes[k]},getAttribute(k){return this.attributes[k]},addEventListener(k,f){this.handlers[k]=f},scrollIntoView(){this.scrolled=true} });
function rig() {
 const [selector,farm,guide,economy,store,inventory,ledger]=Array.from({length:7},element);
 const links=['#farmHeading','#storeHeading','#inventoryHeading','#ledgerHeading'].map(href=>{const e=element();e.setAttribute('href',href);return e});
 const nav=element();nav.querySelectorAll=()=>links;
 const nodes={'.mobile-jump':nav,'.content > .farm-panel':farm,'.content > .side-panel':guide,'.economy':economy,'.farm-panel.ledger':ledger};
 const ids={seedSelection:selector,storeHeading:{closest:()=>store},inventoryHeading:{closest:()=>inventory}};
 const mq={matches:true,addEventListener(k,f){this.changed=f}};
 const context={document:{querySelector:q=>nodes[q],getElementById:q=>ids[q]},window:{matchMedia:()=>mq}};
 vm.runInNewContext(js,context);
 return {selector,farm,guide,economy,store,inventory,ledger,links,mq};
}
test('mobile tab shows farm and hides store, bag and history',()=>{
 const x=rig();assert.equal(x.selector.hidden,false);assert.equal(x.farm.hidden,false);assert.equal(x.guide.hidden,true);
 assert.equal(x.economy.hidden,true);assert.equal(x.ledger.hidden,true);assert.equal(x.links[0].attributes['aria-current'],'page');
});
test('store and bag tabs switch without changing document structure',()=>{
 const x=rig();let prevented=false;x.links[1].handlers.click({preventDefault(){prevented=true}});
 assert.ok(prevented);assert.equal(x.economy.hidden,false);assert.equal(x.store.hidden,false);assert.equal(x.inventory.hidden,true);
 x.links[2].handlers.click({preventDefault(){}});assert.equal(x.store.hidden,true);assert.equal(x.inventory.hidden,false);
 x.links[3].handlers.click({preventDefault(){}});assert.equal(x.ledger.hidden,false);assert.equal(x.guide.hidden,false);assert.equal(x.economy.hidden,true);
});
test('desktop breakpoint restores all original panels',()=>{
 const x=rig();x.links[2].handlers.click({preventDefault(){}});x.mq.matches=false;x.mq.changed();
 for(const name of ['selector','farm','guide','economy','store','inventory','ledger'])assert.equal(x[name].hidden,false);
 for(const a of x.links)assert.equal(a.attributes['aria-current'],undefined);
});
test('module does not write game state or call network',()=>{
 assert.doesNotMatch(js, /fetch\s*\(|localStorage|indexedDB|\.sqlite|\/api\/|\.innerHTML\s*=/);
 assert.match(css,/prefers-reduced-motion/);assert.match(css,/\[hidden\]/);
});

test('mobile information stays accessible in history and status stays near farm',()=>{
 assert.match(js, /ledger\.appendChild\(guide\)/);
 assert.match(js, /farm\.appendChild\(status\)/);
 assert.match(js, /guideMarker\.parentNode\.insertBefore\(guide, guideMarker\)/);
});