import {useState,lazy,Suspense} from 'react';
import Card3D from './card-3d';
const Scene=lazy(()=>import('./monster-scene'));
export default function MonsterViewer(props:{image:string;name:string;rarity:string}){
 const supported=props.name.trim().toLowerCase()==='blue-eyes white dragon';
 const [mode,Mode]=useState('card');
 return <div>{mode==='monster'&&supported?<><button className="secondary monster-return" onClick={()=>Mode('card')}>← Vissza a kártyához</button><Suspense fallback={<p role="status">A szörny megidézése…</p>}><Scene/></Suspense></>:<><Card3D {...props}/>{supported&&<button className="primary monster-open" onClick={()=>Mode('monster')}>◇ Szörny megtekintése 3D-ben</button>}</>}</div>;
}
