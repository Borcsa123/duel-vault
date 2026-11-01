const fs=require('node:fs');
const path=require('node:path');
function cleanText(value,max=500){if(typeof value!=='string'||!value||value.length>max)throw Error('Érvénytelen szöveges adat.');return value;}
function validate(raw){
 if(!raw||!Array.isArray(raw.cards)||!Array.isArray(raw.sets)||!Array.isArray(raw.singles))throw Error('Ez nem Duel Vault biztonsági mentés.');
 if(raw.cards.length>100000||raw.sets.length>5000||raw.singles.length>50000)throw Error('A mentés túl sok adatot tartalmaz.');
 const cards=raw.cards.map(row=>{const cardKey=cleanText(row.cardKey);if(!Number.isInteger(row.quantity)||row.quantity<0||row.quantity>999||![0,1,false,true].includes(row.wanted))throw Error('Érvénytelen darabszám vagy kívánságjelölés.');return {cardKey,quantity:row.quantity,wanted:row.wanted?1:0};});
 const sets=raw.sets.map(row=>({name:cleanText(row.name,250)}));
 const singles=raw.singles.map(row=>{const result={};for(const key of ['key','name','code','rarity'])result[key]=cleanText(row[key]);if(typeof row.image!=='string'||row.image.length>500||row.image&&!/^https:\/\/images\.ygoprodeck\.com\/images\/(?:cards|cards_small)\/\d+\.jpg$/.test(row.image)&&!/^\/(?:images\/full-art\/\d+\.jpg|remote-images\/(?:cards|cards_small)\/\d+\.jpg)$/.test(row.image))throw Error('Érvénytelen lapkép.');result.image=row.image;return result;});
 for(const [rows,key] of [[cards,'cardKey'],[sets,'name'],[singles,'key']])if(new Set(rows.map(row=>row[key])).size!==rows.length)throw Error('A mentés ismétlődő azonosítókat tartalmaz.');
 return {schemaVersion:1,cards,sets,singles};
}
class Store{
 constructor(directory){this.directory=directory;this.file=path.join(directory,'collection.json');fs.mkdirSync(directory,{recursive:true});this.data=fs.existsSync(this.file)?validate(JSON.parse(fs.readFileSync(this.file,'utf8'))):{schemaVersion:1,cards:[],sets:[],singles:[]};}
 snapshot(){return structuredClone(this.data);}
 backup(label='auto'){if(!fs.existsSync(this.file))return;const dir=path.join(this.directory,'backups');fs.mkdirSync(dir,{recursive:true});const date=new Date().toISOString().slice(0,10);const name=label==='auto'?`${date}.json`:`${Date.now()}-${label}.json`;if(!fs.existsSync(path.join(dir,name)))fs.copyFileSync(this.file,path.join(dir,name));const files=fs.readdirSync(dir).filter(n=>n.endsWith('.json')).sort((a,b)=>fs.statSync(path.join(dir,b)).mtimeMs-fs.statSync(path.join(dir,a)).mtimeMs);for(const file of files.slice(30))fs.unlinkSync(path.join(dir,file));}
 commit(data,label='auto'){const next=validate(data);this.backup(label);const temp=this.file+'.tmp';const handle=fs.openSync(temp,'w',0o600);try{fs.writeFileSync(handle,JSON.stringify(next,null,2));fs.fsyncSync(handle);}finally{fs.closeSync(handle);}fs.renameSync(temp,this.file);this.data=next;return {ok:true};}
 restore(data){return this.commit(validate(data),'import-elott');}
 mutate(method,body){const next=this.snapshot();if(method==='POST'){
  if(body.single){const c=body.single;validate({cards:[],sets:[],singles:[c]});if(!next.singles.some(row=>row.key===c.key))next.singles.push(c);}
  else if(body.set){cleanText(body.set,250);if(!next.sets.some(row=>row.name===body.set))next.sets.push({name:body.set});}
  else{const row={cardKey:body.key,quantity:body.quantity,wanted:body.wanted?1:0};validate({cards:[row],sets:[],singles:[]});const index=next.cards.findIndex(item=>item.cardKey===row.cardKey);if(index===-1)next.cards.push(row);else next.cards[index]=row;}
 }else if(method==='DELETE'){
  if(body.singleKey)next.singles=next.singles.filter(row=>row.key!==cleanText(body.singleKey));else next.sets=next.sets.filter(row=>row.name!==cleanText(body.set,250));
 }else throw Error('Nem támogatott művelet.');return this.commit(next);}
}
module.exports={Store,validate};
