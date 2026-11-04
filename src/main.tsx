import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import Vault from './vault';
import Riftbound from './riftbound';
import './globals.css';
function App(){
 const [game,Game]=useState('ygo');
 return <><nav className="dv-game-switch" aria-label="Játék választása"><button aria-pressed={game==='ygo'} onClick={()=>Game('ygo')}>Yu-Gi-Oh!</button><button aria-pressed={game==='riftbound'} onClick={()=>Game('riftbound')}>Riftbound</button></nav>{game==='ygo'?<Vault/>:<Riftbound/>}</>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
