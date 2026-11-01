const fs=require('node:fs'),path=require('node:path');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
function localImage(url){return typeof url==='string'?url.replace(/^https:\/\/images\.ygoprodeck\.com\/images\//,'/remote-images/'):url;}
function imagePaths(value){if(Array.isArray(value))return value.map(imagePaths);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,(key==='image_url_small'||key==='image')?localImage(item):imagePaths(item)]));return value;}
function json(value,status=200){return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});}
function createRouter({root,store,userDirectory,fetchImage=fetch}){return async function route(request){
 const url=new URL(request.url);if(url.hostname!=='duel-vault')return new Response('Not found',{status:404});
 try{
  if(url.pathname==='/api/collection'){
   if(request.method==='GET')return json(imagePaths(store.snapshot()));
   if(!['POST','DELETE'].includes(request.method))return json({error:'Érvénytelen művelet.'},405);
   const body=await request.text();if(body.length>20000)return json({error:'Túl nagy kérés.'},413);return json(store.mutate(request.method,JSON.parse(body)));
  }
  if(request.method!=='GET')return new Response('Method not allowed',{status:405});
  if(url.pathname==='/api/catalog'){
   const euName='Legend of Blue Eyes White Dragon — Európa (2002, LOB-E)';
   if(url.searchParams.get('set')===euName)return json(imagePaths(JSON.parse(fs.readFileSync(path.join(root,'data/lob-e.json'),'utf8'))));
   return json([{set_name:euName,set_code:'LOB-E',num_of_cards:103,tcg_date:'2002-12'},...JSON.parse(fs.readFileSync(path.join(root,'data/sets.json'),'utf8'))]);
  }
  const remote=url.pathname.match(/^\/remote-images\/(cards|cards_small)\/(\d+)\.jpg$/);
  if(remote){const cache=path.join(userDirectory,'card-images',remote[1],remote[2]+'.jpg');if(!fs.existsSync(cache)){const response=await fetchImage(`https://images.ygoprodeck.com/images/${remote[1]}/${remote[2]}.jpg`,{signal:AbortSignal.timeout(20000)});if(!response.ok)return new Response(null,{status:404});const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>8000000)throw Error('Túl nagy kép.');fs.mkdirSync(path.dirname(cache),{recursive:true});fs.writeFileSync(cache,bytes);}return new Response(fs.readFileSync(cache),{headers:{'Content-Type':'image/jpeg'}});}
  const relative=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname).replace(/^\//,'');const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return new Response('Not found',{status:404});
  if(url.pathname==='/data/catalog.json')return json(imagePaths(JSON.parse(fs.readFileSync(file,'utf8'))));
  return new Response(fs.readFileSync(file),{headers:{'Content-Type':types[path.extname(file)]||'application/octet-stream'}});
 }catch(error){return json({error:error.message||'Nem sikerült a helyi mentés.'},400);}
};}
module.exports={createRouter};
