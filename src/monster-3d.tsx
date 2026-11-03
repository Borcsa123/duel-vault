import {useState,lazy,Suspense} from 'react';
import Card3D from './card-3d';
const Scene=lazy(()=>import('./monster-scene'));
export default function MonsterViewer(props:{image:string;name:string;rarity:string}){
 const supported=props.name.trim().toLowerCase()==='blue-eyes white dragon';
 const [mode,Mode]=useState(supported?'monster':'card');
 return <div><div className="monster-tabs" role="group" aria-label="Megjelenítés"><button className="secondary" aria-pressed={mode==='card'} onClick={()=>Mode('card')}>Kártya</button>{supported&&<button className="secondary" aria-pressed={mode==='monster'} onClick={()=>Mode('monster')}>Szörny · 3D</button>}</div>{mode==='monster'&&supported?<Suspense fallback={<p role="status">A szörny megidézése…</p>}><Scene/></Suspense>:<Card3D {...props}/>}</div>
}
