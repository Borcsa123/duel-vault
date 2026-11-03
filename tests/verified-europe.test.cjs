const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {Market}=require('../electron/market.cjs');
const card={key:'Legend of Blue Eyes White Dragon — Európa (2002, LOB-E)|LOB-E001|Ultra Rare',code:'LOB-E001',name:'Blue-Eyes White Dragon',rarity:'Ultra Rare'};
test('verified EU Blue Eyes bypasses API V2 and retains aggregate edition scope',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'verified-eu-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));let requests=0;
 const m=new Market(dir,async url=>{requests++;assert.ok(url.startsWith('https://downloads.s3.cardmarket.com/'));return new Response(JSON.stringify(url.includes('products_singles')?{createdAt:'2026-11-02',products:[{idProduct:577919,idExpansion:1064,idCategory:5,name:card.name}]}:{createdAt:'2026-11-02',priceGuides:[{idProduct:102241,trend:999},{idProduct:577919,trend:118.02,avg1:54.94,avg7:42.1,avg30:92.22}]}));});
 const r=await m.verifiedEuropean(card,'1st Edition');assert.equal(r.product,577919);assert.equal(r.trend,118.02);assert.equal(r.avg30,92.22);assert.equal(r.priceScope,'all-editions');assert.equal(r.history.length,1);await m.verifiedEuropean(card,'Unlimited');assert.equal(requests,2);
 assert.equal(await m.verifiedEuropean({...card,code:'LOB-001'}),null);assert.equal(await m.verifiedEuropean({...card,rarity:'Secret Rare'}),null);
});
