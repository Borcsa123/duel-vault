const {app,BrowserWindow,protocol,net,ipcMain,dialog,shell,session}=require('electron');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {spawn}=require('node:child_process');
const {Store}=require('./store.cjs');
const {Updater}=require('./updater.cjs');
const {createRouter}=require('./router.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'app',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true}}]);
app.setName('Duel Vault');
const APP_URL='app://duel-vault/';let window,store,updater,quitting=false;
function senderAllowed(event){if(!event.senderFrame||new URL(event.senderFrame.url).origin!==new URL(APP_URL).origin||!event.senderFrame.url.startsWith(APP_URL))throw Error('Érvénytelen alkalmazásablak.');}
function installIpc(){
 const handle=(name,action)=>ipcMain.handle(name,async(event,...args)=>{senderAllowed(event);return action(...args);});
 handle('desktop:info',()=>({version:app.getVersion(),dataPath:app.getPath('userData'),update:updater.state}));
 handle('desktop:check-updates',()=>updater.check());
 handle('desktop:open-data',()=>shell.openPath(app.getPath('userData')));
 handle('desktop:export',async()=>{const result=await dialog.showSaveDialog(window,{title:'Teljes gyűjtemény mentése',defaultPath:path.join(app.getPath('documents'),`Duel-Vault-mentes-${new Date().toISOString().slice(0,10)}.json`),filters:[{name:'Duel Vault mentés',extensions:['json']}]});if(result.canceled)return {canceled:true};fs.writeFileSync(result.filePath,JSON.stringify({...store.snapshot(),exportedAt:new Date().toISOString()},null,2));return {ok:true};});
 handle('desktop:import',async()=>{const result=await dialog.showOpenDialog(window,{title:'Duel Vault mentés betöltése',properties:['openFile'],filters:[{name:'Duel Vault mentés',extensions:['json']}]});if(result.canceled)return {canceled:true};const file=result.filePaths[0];if(fs.statSync(file).size>20*1024*1024)throw Error('A mentés túl nagy.');const imported=JSON.parse(fs.readFileSync(file,'utf8'));require('./store.cjs').validate(imported);const confirmation=await dialog.showMessageBox(window,{type:'question',title:'Gyűjtemény betöltése',message:`A mentés ${imported.sets.length} szettet és ${imported.singles.length} kiemelt lapot tartalmaz.`,detail:'A jelenlegi helyi gyűjteményt lecseréljük. Előtte automatikus biztonsági másolat készül.',buttons:['Mégse','Betöltés'],defaultId:0,cancelId:0});if(confirmation.response!==1)return {canceled:true};store.restore(imported);return {ok:true};});
}
function createWindow(){window=new BrowserWindow({width:1360,height:920,minWidth:900,minHeight:650,title:'Duel Vault',backgroundColor:'#101214',icon:path.join(app.getAppPath(),'dist/icons/icon-512.png'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true}});window.removeMenu();window.webContents.setWindowOpenHandler(({url})=>{if(url==='https://ygoprodeck.com/')shell.openExternal(url);return {action:'deny'};});window.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith(APP_URL))event.preventDefault();});window.loadURL(APP_URL);}
if(!app.requestSingleInstanceLock())app.quit();else{
 app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.show();window.focus();}});
 app.whenReady().then(()=>{store=new Store(app.getPath('userData'));updater=new Updater({app,directory:path.join(app.getPath('userData'),'updates'),channel:require('./release-channel.json'),onChange:state=>{if(window&&!window.isDestroyed())window.webContents.send('desktop:update-state',state);}});session.defaultSession.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));app.setAppUserModelId('hu.duelvault.desktop');protocol.handle('app',createRouter({root:path.join(app.getAppPath(),'dist'),store,userDirectory:app.getPath('userData'),fetchImage:(...args)=>net.fetch(...args)}));installIpc();createWindow();setTimeout(()=>updater.check(),10000).unref();setInterval(()=>updater.check(),6*60*60*1000).unref();}).catch(error=>{dialog.showErrorBox('A Duel Vault nem indítható',error.message+'\nA meglévő mentést nem írtuk felül.');app.quit();});
 app.on('window-all-closed',()=>app.quit());
 app.on('before-quit',()=>{if(quitting||!updater?.pending)return;quitting=true;try{store.backup('frissites-elott');const installer=updater.verifyPending();const child=spawn(installer,['/S','--force-run'],{detached:true,stdio:'ignore',shell:false});child.on('error',()=>{});child.unref();}catch(error){dialog.showErrorBox('A frissítés nem indítható',error.message);}});
}
