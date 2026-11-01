const fs=require('node:fs'),path=require('node:path');
module.exports=async context=>{
 const files=[],directories=[];
 function walk(dir,relative=''){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const rel=path.join(relative,entry.name);if(entry.isDirectory()){directories.push(rel);walk(path.join(dir,entry.name),rel);}else files.push(rel);}}
 walk(context.appOutDir);
 const quote=value=>value.replace(/\$/g,'$$').replace(/\//g,'\\');
 const commands=files.map(file=>`Delete "$INSTDIR\\${quote(file)}"`);
 commands.push(...directories.sort((a,b)=>b.length-a.length).map(dir=>`RMDir "$INSTDIR\\${quote(dir)}"`));
 fs.mkdirSync(path.join(context.packager.projectDir,'build'),{recursive:true});fs.writeFileSync(path.join(context.packager.projectDir,'build/uninstall-files.nsh'),commands.join('\n'));
};
