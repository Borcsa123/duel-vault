const fs=require('node:fs'),path=require('node:path');
class PriceKey{
 constructor(directory,safeStorage){this.file=path.join(directory,'market','api-key.bin');this.safe=safeStorage;}
 get(){if(!this.safe.isEncryptionAvailable())return null;try{return this.safe.decryptString(fs.readFileSync(this.file));}catch{return null;}}
 set(key){if(typeof key!=='string'||!/^tcg_live_[A-Za-z0-9_-]{10,200}$/.test(key.trim()))throw Error('Érvénytelen TCG API-kulcs.');if(!this.safe.isEncryptionAvailable())throw Error('A titkosított kulcstárolás nem érhető el.');fs.mkdirSync(path.dirname(this.file),{recursive:true});fs.writeFileSync(this.file+'.tmp',this.safe.encryptString(key.trim()),{mode:0o600});fs.renameSync(this.file+'.tmp',this.file);return {ok:true};}
}
module.exports={PriceKey};
