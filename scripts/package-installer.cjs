const path=require('node:path'),fs=require('node:fs');
const {spawn}=require('node:child_process');
(async()=>{
 const {NSIS_PATH,NsisTargetOptions}=require('app-builder-lib/out/targets/nsis/nsisUtil');NsisTargetOptions.resolve({});const directory=await NSIS_PATH();const compiler=path.join(directory,process.platform==='win32'?'Bin/makensis.exe':process.platform==='darwin'?'mac/makensis':'linux/makensis');
 const root=path.resolve(__dirname,'..'),version=require('../package.json').version,output=path.join(root,'release',`Duel-Vault-Setup-${version}-x64.exe`);
 if(!fs.existsSync(path.join(root,'release/win-unpacked/Duel Vault.exe'))||!fs.existsSync(path.join(root,'build/uninstall-files.nsh')))throw Error('Build the Windows app directory first.');
 const args=[`-DPROJECT_DIR=${root}`,`-DVERSION=${version}`,`-DMUI_ICON=${path.join(root,'assets/icon.ico')}`,`-DMUI_UNICON=${path.join(root,'assets/icon.ico')}`,`-XOutFile "${output}"`,`-XVIProductVersion ${version}.0`,'build/installer.nsi'];
 const child=spawn(compiler,args,{cwd:root,stdio:'inherit',shell:false,env:{...process.env,NSISDIR:directory}});child.on('error',error=>{console.error(error);process.exitCode=1;});child.on('exit',code=>{process.exitCode=code||0;if(code===0)console.log(output);});
})().catch(error=>{console.error(error);process.exitCode=1;});
