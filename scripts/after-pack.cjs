const fs=require('node:fs'),path=require('node:path');
module.exports=async context=>{
 // OBJ extensions are excluded by electron-builder. Verify the actual installed archive.
 const asarPath=path.join(context.appOutDir,'resources','app.asar');
 const asar=require('@electron/asar');
 for(const asset of [path.join('dist','models','blue-eyes','model.txt'),path.join('dist','models','blue-eyes','color.png')]){
  let bytes;try{bytes=asar.extractFile(asarPath,asset);}catch(error){throw Error('Hiányzó 3D erőforrás a telepítőben: '+asset+' ('+error.message+')');}
  if(!bytes||bytes.length<1000)throw Error('Üres vagy sérült 3D erőforrás: '+asset);
 }

 const files=[],directories=[];
 function walk(dir,relative=''){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const rel=path.join(relative,entry.name);if(entry.isDirectory()){directories.push(rel);walk(path.join(dir,entry.name),rel);}else files.push(rel);}}
 walk(context.appOutDir);
 const quote=value=>value.replace(/\$/g,'$$').replace(/\//g,'\\');
 const commands=files.map(file=>`Delete "$INSTDIR\\${quote(file)}"`);
 commands.push(...directories.sort((a,b)=>b.length-a.length).map(dir=>`RMDir "$INSTDIR\\${quote(dir)}"`));
 fs.mkdirSync(path.join(context.packager.projectDir,'build'),{recursive:true});fs.writeFileSync(path.join(context.packager.projectDir,'build/uninstall-files.nsh'),commands.join('\n'));
};
