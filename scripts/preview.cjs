const http=require('node:http'),path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {Store}=require('../electron/store.cjs'),{createRouter}=require('../electron/router.cjs');
const root=path.join(__dirname,'../dist'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'vault-preview-'));
const route=createRouter({root,userDirectory:dir,store:new Store(dir)});
http.createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const method=req.method;const request=new Request('app://duel-vault'+req.url,{method,...(!['GET','HEAD'].includes(method)?{body:Buffer.concat(chunks)}:{})});const response=await route(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(500);res.end('Preview error');}}).listen(Number(process.env.PORT||4173),'0.0.0.0');
