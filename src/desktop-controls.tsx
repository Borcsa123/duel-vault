import {useEffect,useState} from 'react';
import {Download,Upload,RefreshCw,Folder,ChevronRight,LoaderCircle} from 'lucide-react';
type Update={status:string;message:string;version:string;progress?:number};
type Result={ok?:boolean;canceled?:boolean};
declare global{interface Window{duelVaultDesktop?:{setPriceKey:(key:string)=>Promise<{ok:boolean}>;info:()=>Promise<{version:string;dataPath:string;update:Update}>;exportBackup:()=>Promise<Result>;importBackup:()=>Promise<Result>;checkUpdates:()=>Promise<Update>;openDataFolder:()=>Promise<string>;onUpdate:(callback:(state:Update)=>void)=>()=>void}}}
export default function DesktopControls({onRestored,updatesOnly=false}:{onRestored?:()=>void;updatesOnly?:boolean}){
 const [state,State]=useState<Update|null>(null),[message,Message]=useState(''),[busy,Busy]=useState(false),[active,Active]=useState('');
 useEffect(()=>{const api=window.duelVaultDesktop;if(!api)return;api.info().then(info=>State(info.update)).catch(()=>Message('Az alkalmazás adatai most nem érhetők el.'));return api.onUpdate(State);},[]);
 async function run(action:'exportBackup'|'importBackup'|'checkUpdates'|'openDataFolder'){
  const api=window.duelVaultDesktop;if(!api){Message('Ez a funkció az asztali alkalmazásban érhető el.');return;}
  Busy(true);Active(action);Message('');try{const result=await api[action]();if(action==='importBackup'&&(result as Result).ok){onRestored?.();Message('A gyűjtemény betöltve.');}else if(action==='exportBackup'&&(result as Result).ok)Message('A biztonsági mentés elkészült.');else if(action==='checkUpdates')State(result as Update);}catch(error){Message(error instanceof Error?error.message:'A művelet nem sikerült.');}finally{Busy(false);Active('');}
 }
 const actions=[
  {id:'exportBackup' as const,label:'Biztonsági mentés',hint:'Gyűjtemény mentése fájlba',Icon:Download},
  {id:'importBackup' as const,label:'Mentés betöltése',hint:'Korábbi gyűjtemény visszaállítása',Icon:Upload},
  {id:'openDataFolder' as const,label:'Mentések mappája',hint:'Helyi fájlok megnyitása',Icon:Folder},
  {id:'checkUpdates' as const,label:'Frissítések keresése',hint:'Új verzió ellenőrzése',Icon:RefreshCw}
 ];
 return <div className="desktop-controls"><div className="desktop-control-label">{updatesOnly?'ALKALMAZÁS':'HELYI ADATOK'}</div>{actions.filter(({id})=>!updatesOnly||id==='checkUpdates').map(({id,label,hint,Icon})=>{
 const working=active===id||(id==='checkUpdates'&&(state?.status==='downloading'||state?.status==='checking'));
 return <button key={id} className={`desktop-action ${id==='exportBackup'?'desktop-action-featured':''}`} disabled={busy||(id==='checkUpdates'&&(state?.status==='downloading'||state?.status==='checking'))} aria-busy={working} onClick={()=>run(id)}><span className="desktop-action-icon">{working?<LoaderCircle size={18} className="button-spinner"/>:<Icon size={18}/>}</span><span className="desktop-action-copy"><strong>{label}</strong><span>{working?'Folyamatban…':hint}</span></span><ChevronRight size={14} className="desktop-action-arrow"/></button>;
 })}{state&&<small role="status">v{state.version} · {state.message}</small>}{message&&<p role="status">{message}</p>}</div>;
}
