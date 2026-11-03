const fs=require('node:fs'),path=require('node:path');
const BASE='https://downloads.s3.cardmarket.com/productCatalog/';
const euro=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0?v:null;
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/full art|extended art/g,'').replace(/[^a-z0-9]/g,'');
class Market{
 constructor(directory,fetcher=fetch){this.directory=path.join(directory,'market');this.fetcher=fetcher;this.pending=null;this.search=new (require('./market-search.cjs').MarketSearch)(fetcher);this.results=new Map();fs.mkdirSync(this.directory,{recursive:true});this.state=this.read('history.json',{links:{},history:{}});}
 read(file,fallback){try{return JSON.parse(fs.readFileSync(path.join(this.directory,file),'utf8'));}catch{return fallback;}}
 write(file,value){const target=path.join(this.directory,file);fs.writeFileSync(target+'.tmp',JSON.stringify(value));fs.renameSync(target+'.tmp',target);}
 async download(file,url,field,force=false){let cached=this.read(file,null);if(!force&&cached&&Date.now()-cached.fetchedAt<(field==='priceGuides'?3600000:86400000)&&(field!=='priceGuides'||cached.data.createdAt.slice(0,10)===new Date().toISOString().slice(0,10)))return {data:cached.data,offline:false};try{const response=await this.fetcher(force?url+'?refresh='+Date.now():url,{signal:AbortSignal.timeout(30000),cache:'no-store'});if(!response.ok)throw Error('A Cardmarket árforrás jelenleg nem érhető el.');const bytes=await response.text();if(bytes.length>40000000)throw Error('Túl nagy árlista.');const data=JSON.parse(bytes);if(!Array.isArray(data[field])||!data.createdAt||!Number.isFinite(Date.parse(data.createdAt)))throw Error('Érvénytelen Cardmarket adat.');this.write(file,{fetchedAt:Date.now(),data});return {data,offline:false};}catch(e){if(cached)return {data:cached.data,offline:true};throw e;}}
 async refresh(force=false){if(this.pending)return this.pending;this.pending=this.loadPrices(force).finally(()=>this.pending=null);return this.pending;}
 async loadPrices(force=false){const result=await this.download('prices.json',BASE+'priceGuide/price_guide_3.json','priceGuides',force);this.prices=new Map(result.data.priceGuides.map(p=>[p.idProduct,p]));const day=result.data.createdAt.slice(0,10);this.offline=result.offline;for(const link of Object.values(this.state.links))this.record(link.id,day);this.day=day;this.write('history.json',this.state);}
 record(id,day){const p=this.prices?.get(id);if(!p)return;const h=this.state.history[id]||[];const point={date:day,trend:euro(p.trend),avg1:euro(p.avg1)};const i=h.findIndex(v=>v.date===day);if(i<0)h.push(point);else h[i]=point;this.state.history[id]=h.sort((a,b)=>a.date.localeCompare(b.date)).slice(-1100);}
 async link(card,source){if(!card||typeof card.key!=='string'||card.key.length>500||!card.name||typeof source!=='string')throw Error('Érvénytelen lap vagy termék.');source=source.trim();let id;if(/^\d{1,9}$/.test(source))id=Number(source);else{let url;try{url=new URL(source);}catch{throw Error('Másold be a pontos kiadás Cardmarket-linkjét vagy termékazonosítóját.');}if(url.protocol!=='https:'||!['www.cardmarket.com','cardmarket.com'].includes(url.hostname)||!url.pathname.startsWith('/en/YuGiOh/Products/'))throw Error('Angol nyelvű Yu-Gi-Oh! Cardmarket-terméklink szükséges.');id=Number(url.searchParams.get('idProduct'));if(!id){const r=await this.fetcher(url.href,{signal:AbortSignal.timeout(20000),redirect:'error'});if(!r.ok)throw Error('A Cardmarket nem engedte a link azonosítását. Add meg a termék számszerű azonosítóját.');const html=await r.text();const ids=[...html.matchAll(/(?:data-idproduct|data-product-id|"idProduct")\s*[:=]\s*["']?(\d+)/gi)].map(m=>Number(m[1]));const unique=[...new Set(ids)];if(unique.length!==1)throw Error('A link nem azonosítható biztosan. Add meg a Cardmarket-termék számszerű azonosítóját.');id=unique[0];}}
 const {data}=await this.download('products.json',BASE+'productList/products_singles_3.json','products');const product=data.products.find(p=>p.idProduct===id);if(!product||norm(product.name)!==norm(card.name))throw Error('Ez a termék nem a kiválasztott laphoz tartozik.');await this.refresh();this.state.links[card.key]={id,name:product.name};this.record(id,this.day);this.write('history.json',this.state);return this.get(card.key);}
 async verifiedEuropean(card,edition='Nem jelölt',force=false){
  // Explicit verified printing, never infer region from product order or price.
  const identity='Legend of Blue Eyes White Dragon — Európa (2002, LOB-E)|LOB-E001|Ultra Rare';
  if(card?.key!==identity||card.code!=='LOB-E001'||norm(card.name)!==norm('Blue-Eyes White Dragon')||card.rarity!=='Ultra Rare')return null;
  if(!require('./market-search.cjs').editions.includes(edition))throw Error('Érvénytelen kiadás.');
  const {data}=await this.download('products.json',BASE+'productList/products_singles_3.json','products');
  const product=data.products.find(p=>p.idProduct===577919);
  if(!product||product.idExpansion!==1064||product.idCategory!==5||norm(product.name)!==norm(card.name))throw Error('A hitelesített európai Cardmarket-termék adatai megváltoztak.');
  await this.refresh(force);const key=card.key+'|'+edition;
  this.state.links[key]={id:577919,name:product.name,edition,verifiedRegion:'LOB-E V.1'};
  this.record(577919,this.day);this.write('history.json',this.state);
  return {...await this.get(key),edition,priceScope:'all-editions',source:'Cardmarket · hivatalos árlista'};
 }
 async automatic(card,edition='Nem jelölt',chosen){
 const {editions}=require('./market-search.cjs');if(!editions.includes(edition))throw Error('Érvénytelen kiadás.');
 const key=card.key+'|'+edition;
 if(!this.state.links[key]&&this.state.links[card.key]){this.state.links[key]={...this.state.links[card.key],edition};this.write('history.json',this.state);}
 const previous=this.state.links[key];
 if(previous)return {...await this.get(key),edition,priceScope:'all-editions'};
 let found=this.results.get(key);if(!found){found=await this.search.find(card,edition);this.results.set(key,found);}
 let candidate=chosen?found.candidates.find(p=>p.id===Number(chosen)):found.automatic?found.candidates[0]:null;
 if(chosen&&!candidate)throw Error('A kiválasztott találat nem tartozik ehhez a kereséshez.');
 if(!candidate)return {linked:false,edition,candidates:found.candidates,priceScope:'all-editions'};
 // Choices were already limited to the requested card, expansion, rarity and edition.
 await this.refresh();this.state.links[key]={id:candidate.id,name:candidate.name,edition,url:candidate.url,automatic:!chosen};this.record(candidate.id,this.day);this.write('history.json',this.state);
 return {...await this.get(key),edition,priceScope:'all-editions'};
 }
 async get(key){const link=this.state.links[key];if(!link)return {linked:false};await this.refresh();const p=this.prices.get(link.id);if(!p)return {linked:true,unavailable:true,product:link.id,history:this.state.history[link.id]||[]};return {linked:true,product:link.id,offline:this.offline,trend:euro(p.trend),avg1:euro(p.avg1),avg7:euro(p.avg7),avg30:euro(p.avg30),history:this.state.history[link.id]||[]};}
 unlink(key){delete this.state.links[key];this.write('history.json',this.state);return {linked:false};}
}
module.exports={Market};
