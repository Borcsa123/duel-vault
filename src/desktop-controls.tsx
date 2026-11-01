import {useEffect,useState} from 'react';
import {Download,Upload,RefreshCw,Folder} from 'lucide-react';
type Update={status:string;message:string;version:string;progress?:number};
type Result={ok?:boolean;canceled?:boolean};
declare global{interface Window{duelVaultDesktop?:{info:()=>Promise<{version:string;dataPath:string;update:Update}>;exportBackup:()=>Promise<Result>;importBackup:()=>Promise<Result>;checkUpdates:()=>Promise<Update>;openDataFolder:()=>Promise<string>;onUpdate:(callback:(state:Update)=>void)=>()=>void}}}
export default function DesktopControls({onRestored}:{onRestored:()=>void}){
 const [state,State]=useState<Update|null>(null),[message,Message]=useState(''),[busy,Busy]=useState(false);
 useEffect(()=>{const api=window.duelVaultDesktop;if(!api)return;api.info().then(info=>State(info.update)).catch(()=>Message('Az alkalmazás adatai most nem érhetők el.'));return api.onUpdate(State);},[]);
 async function run(action:'exportBackup'|'importBackup'|'checkUpdates'|'openDataFolder'){
  const api=window.duelVaultDesktop;if(!api){Message('Ez a funkció az asztali alkalmazásban érhető el.');return;}
  Busy(true);Message('');try{const result=await api[action]();if(action==='importBackup'&&(result as Result).ok){onRestored();Message('A gyűjtemény betöltve.');}else if(action==='exportBackup'&&(result as Result).ok)Message('A biztonsági mentés elkészült.');else if(action==='checkUpdates')State(result as Update);}catch(error){Message(error instanceof Error?error.message:'A művelet nem sikerült.');}finally{Busy(false);}
 }
 return <div className="desktop-controls"><div className="desktop-control-label">HELYI ADATOK</div><button disabled={busy} onClick={()=>run('exportBackup')}><Download size={15}/> Biztonsági mentés</button><button disabled={busy} onClick={()=>run('importBackup')}><Upload size={15}/> Mentés betöltése</button><button disabled={busy} onClick={()=>run('openDataFolder')}><Folder size={15}/> Mentések mappája</button><button disabled={busy||state?.status==='downloading'||state?.status==='checking'} onClick={()=>run('checkUpdates')}><RefreshCw size={15}/> Frissítések keresése</button>{state&&<small>v{state.version} · {state.message}</small>}{message&&<p role="status">{message}</p>}</div>;
}
