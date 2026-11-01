const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {Readable,Transform}=require('node:stream');
const {pipeline}=require('node:stream/promises');
const {verifyManifest,compareVersions}=require('./update-security.cjs');
class Updater{
 constructor({app,directory,channel,onChange}){this.app=app;this.directory=directory;this.channel=channel;this.onChange=onChange;this.busy=false;this.pending=null;this.state={status:channel.feedUrl&&channel.publicKey?'idle':'unconfigured',message:channel.feedUrl&&channel.publicKey?'A program automatikusan ellenőrzi az új verziókat.':'A frissítési kiszolgáló még nincs összekapcsolva.',version:app.getVersion()};}
 setState(status,message,extra={}){this.state={...this.state,status,message,...extra};this.onChange(this.state);}
 async check(){
  if(this.busy||this.pending)return this.state;
  if(!this.channel.feedUrl||!this.channel.publicKey)return this.state;
  this.busy=true;let partial;
  try{
   const feed=new URL(this.channel.feedUrl);if(feed.protocol!=='https:'||feed.username||feed.password)throw Error('Érvénytelen frissítési cím.');
   this.setState('checking','Új verzió keresése…');const response=await fetch(feed,{signal:AbortSignal.timeout(20000),cache:'no-store'});if(!response.ok)throw Error('A frissítési kiszolgáló nem érhető el.');if(Number(response.headers.get('content-length'))>65536)throw Error('Túl nagy csomagleírás.');const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>65536)throw Error('Túl nagy csomagleírás.');const manifest=verifyManifest(JSON.parse(bytes.toString('utf8')),this.channel.publicKey);
   if(compareVersions(manifest.version,this.app.getVersion())<=0){this.setState('current','A legfrissebb verziót használod.');return this.state;}
   if(process.platform!=='win32'){this.setState('error','Az automatikus telepítés a Windows-változatban működik.');return this.state;}
   fs.mkdirSync(this.directory,{recursive:true});partial=path.join(this.directory,`Duel-Vault-${manifest.version}.exe.part`);const destination=partial.slice(0,-5);this.setState('downloading','A frissítés letöltése folyamatban…',{progress:0});
   const download=await fetch(manifest.url,{signal:AbortSignal.timeout(300000)});if(!download.ok||!download.body)throw Error('Nem sikerült letölteni a telepítőt.');
   const hash=crypto.createHash('sha512');let size=0,last=0;
   const check=new Transform({transform:(chunk,encoding,callback)=>{size+=chunk.length;if(size>manifest.size)return callback(Error('A letöltött csomag mérete hibás.'));hash.update(chunk);const progress=Math.round(size/manifest.size*100);if(progress>=last+5){last=progress;this.setState('downloading',`Frissítés letöltése: ${progress}%`,{progress});}callback(null,chunk);}});
   await pipeline(Readable.fromWeb(download.body),check,fs.createWriteStream(partial));if(size!==manifest.size||hash.digest('hex')!==manifest.sha512)throw Error('A letöltött frissítés sérült.');fs.renameSync(partial,destination);this.pending={file:destination,sha512:manifest.sha512};this.setState('ready',`A ${manifest.version} verzió letöltve. Az alkalmazás bezárásakor települ.`,{progress:100});
  }catch(error){if(partial)fs.rmSync(partial,{force:true});this.setState('error','A frissítés most nem sikerült. Később automatikusan újrapróbáljuk.');fs.appendFileSync(path.join(this.app.getPath('userData'),'updater.log'),new Date().toISOString()+' '+error.message+'\n');}
  finally{this.busy=false;}return this.state;
 }
 verifyPending(){if(!this.pending)return null;const bytes=fs.readFileSync(this.pending.file);if(crypto.createHash('sha512').update(bytes).digest('hex')!==this.pending.sha512)throw Error('A telepítő ellenőrzése nem sikerült.');return this.pending.file;}
}
module.exports={Updater};
