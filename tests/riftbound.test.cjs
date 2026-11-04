const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {Store}=require('../electron/store.cjs'),{createRouter}=require('../electron/router.cjs');
const catalog=require('../public/data/riftbound.json');
test('Riftbound catalog links distinct English printings to released sets',()=>{
 const ids=new Set(catalog.cards.map(c=>c.id));assert.equal(ids.size,catalog.cards.length);
 assert.ok(catalog.sets.some(s=>s.id==='VEN'));
 assert.equal(catalog.sets.reduce((sum,s)=>sum+s.count,0),ids.size);
 for(const c of catalog.cards){assert.ok(c.name&&c.code&&c.rarity);assert.ok(catalog.sets.some(s=>s.id===c.set));assert.match(c.image,/^(?:[0-9a-f-]{36})?$/);}
});
test('Riftbound quantities, tracked sets and favorites survive restart without changing Yu-Gi-Oh!',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'riftbound-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const store=new Store(dir);store.mutate('POST',{key:'ygo-card',quantity:3});
 const snapshot=store.snapshot(),config={root:dir,userDirectory:dir,store};let route=createRouter(config);
 const call=(method,body)=>route(new Request('app://duel-vault/api/riftbound/collection',{method,body:body?JSON.stringify(body):undefined}));
 const c=catalog.cards.find(c=>c.set==='VEN');
 for(const body of [{set:'VEN'},{key:c.id,quantity:2,wanted:true},{single:{key:c.id,name:c.name,code:c.code,rarity:c.rarity,image:''}}])assert.equal((await call('POST',body)).status,200);
 route=createRouter(config);
 const rb=await (await call('GET')).json();assert.equal(rb.cards[0].quantity,2);assert.equal(rb.cards[0].wanted,1);assert.equal(rb.singles[0].key,c.id);assert.equal(rb.sets[0].name,'VEN');
 assert.equal((await call('DELETE',{set:'VEN'})).status,200);assert.equal((await (await call('GET')).json()).cards[0].quantity,2);
 assert.deepEqual(new Store(dir).snapshot(),snapshot);
});
