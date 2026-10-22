const test=require('node:test');
const assert=require('node:assert/strict');
const rules=require('../public/sound-core.js');
test('audio event mapping only signals known successful actions',()=>{
 for(const a of ['plant','harvest','buy','sell','reset'])assert.equal(rules.soundForAction(a,true),a);
 assert.equal(rules.soundForAction('unknown',true),null);
 assert.equal(rules.soundForAction('buy',false),'error');
});
test('maturity sounds only on transition',()=>{
 assert.equal(rules.newlyMature(undefined,'mature'),false);
 assert.equal(rules.newlyMature('growing','mature'),true);
 assert.equal(rules.newlyMature('mature','mature'),false);
 assert.equal(rules.newlyMature('seed','sprout'),false);
});
test('volume is bounded',()=>{
 assert.equal(rules.clampVolume(-4),0);
 assert.equal(rules.clampVolume(3),1);
 assert.equal(rules.clampVolume(.65),.65);
 assert.equal(rules.clampVolume('invalid'),rules.DEFAULT_VOLUME);
});
test('corrupt or blocked storage falls back to safe defaults',()=>{
 assert.deepEqual(rules.readSettings({getItem(){throw Error('denied')}}),{muted:false,volume:.35});
 assert.deepEqual(rules.readSettings({getItem(){return '{bad'}}),{muted:false,volume:.35});
});
test('audio preferences serialization round trip',()=>{
 const str=rules.serializeSettings({muted:true,volume:.55});
 assert.deepEqual(rules.readSettings({getItem(){return str}}),{muted:true,volume:.55});
});
