const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('duelVaultDesktop',{
 setPriceKey:key=>ipcRenderer.invoke('desktop:set-price-key',key),
 info:()=>ipcRenderer.invoke('desktop:info'),
 exportBackup:()=>ipcRenderer.invoke('desktop:export'),
 importBackup:()=>ipcRenderer.invoke('desktop:import'),
 checkUpdates:()=>ipcRenderer.invoke('desktop:check-updates'),
 openDataFolder:()=>ipcRenderer.invoke('desktop:open-data'),
 onUpdate:callback=>{const handler=(_event,state)=>callback(state);ipcRenderer.on('desktop:update-state',handler);return()=>ipcRenderer.removeListener('desktop:update-state',handler);}
});
