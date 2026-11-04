import Card3D from './card-3d';
import {useEffect,useMemo,useState} from 'react';
type Card={id:string;name:string;set:string;code:string;rarity:string;finish:string;art:string;signed:boolean;image:string};
type SetInfo={id:string;name:string;date:string;count:number};
type Catalog={sets:SetInfo[];cards:Card[]};
type Collection={cards:{cardKey:string;quantity:number;wanted:number}[];sets:{name:string}[];singles:{key:string}[]};
const endpoint='/api/riftbound/collection';
const empty:Collection={cards:[],sets:[],singles:[]};
const picture=(c:Card,size='240w')=>c.image?`https://openrift.app/media/cards/${c.image}-${size}.webp`:undefined;
const variant=(c:Card)=>[c.rarity,c.finish,c.art,c.signed?'Aláírt':''].filter(Boolean).join(' · ');
async function json<T>(url:string,init?:RequestInit):Promise<T>{
 const r=await fetch(url,init);if(!r.ok){const d=await r.json().catch(()=>null);throw Error(d?.error||'Nem sikerült betölteni az adatokat.');}return r.json();
}
function CardImage({card,large=false}:{card:Card;large?:boolean}){
 const [failed,Fail]=useState(false);
 return !card.image||failed?<div className="rb-placeholder">Nincs elérhető lapkép</div>:<img src={picture(card,large?'full':'240w')} alt={card.name} loading={large?'eager':'lazy'} onError={()=>Fail(true)}/>;
}
function RiftboundCardViewer({card}:{card:Card}){
 const [failed,Fail]=useState(false);
 const image=picture(card,'full');
 return image&&!failed?<Card3D image={image} name={card.name} rarity={card.rarity} riftboundFinish={card.finish} onImageError={()=>Fail(true)}/>:<div className="rb-placeholder">Nincs elérhető lapkép</div>;
}
export default function Riftbound(){
 const [catalog,Catalog]=useState<Catalog>(),[collection,Collection]=useState(empty),[selected,Select]=useState(''),[mode,Mode]=useState('all'),[query,Query]=useState(''),[rarity,Rarity]=useState(''),[owned,Owned]=useState('all'),[detail,Detail]=useState<Card>(),[limit,Limit]=useState(60),[busy,Busy]=useState(false),[error,ErrorText]=useState('');
 useEffect(()=>{let live=true;Promise.all([json<Catalog>('/data/riftbound.json'),json<Collection>(endpoint)]).then(([c,s])=>{if(live){Catalog(c);Collection(s);}}).catch(e=>{if(live)ErrorText(e.message);});return()=>{live=false;};},[]);
 useEffect(()=>{if(!detail)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')Detail(undefined);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[detail]);
 const records=useMemo(()=>new Map(collection.cards.map(r=>[r.cardKey,r])),[collection]);
 const favorites=useMemo(()=>new Set(collection.singles.map(r=>r.key)),[collection]);
 const tracked=useMemo(()=>new Set(collection.sets.map(r=>r.name)),[collection]);
 const scope=(catalog?.cards||[]).filter(c=>mode==='favorites'?favorites.has(c.id):mode==='tracked'?(selected?c.set===selected&&tracked.has(c.set):tracked.has(c.set)):!selected||c.set===selected);
 const have=scope.filter(c=>(records.get(c.id)?.quantity||0)>0).length;
 const total=scope.reduce((sum,c)=>sum+(records.get(c.id)?.quantity||0),0);
 const visible=scope.filter(c=>(!rarity||c.rarity===rarity)&&(!query||[c.name,c.code].some(v=>v.toLowerCase().includes(query.trim().toLowerCase())))&&(owned==='all'||(owned==='have'?(records.get(c.id)?.quantity||0)>0:owned==='wanted'?records.get(c.id)?.wanted:!(records.get(c.id)?.quantity||0))));
 const set=catalog?.sets.find(s=>s.id===selected);
 async function save(body:unknown,method='POST'){
  if(busy)return;Busy(true);ErrorText('');try{await json(endpoint,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});Collection(await json<Collection>(endpoint));}catch(e){ErrorText(e instanceof Error?e.message:'Nem sikerült menteni.');}finally{Busy(false);}
 }
 function quantity(c:Card,delta:number){const row=records.get(c.id);void save({key:c.id,quantity:Math.max(0,Math.min(999,(row?.quantity||0)+delta)),wanted:row?.wanted||0});}
 function favorite(c:Card){void(favorites.has(c.id)?save({singleKey:c.id},'DELETE'):save({single:{key:c.id,name:c.name,code:c.code,rarity:c.rarity,image:''}}));}
 function controls(c:Card){const row=records.get(c.id);return <div className="rb-actions"><button disabled={busy||!row?.quantity} onClick={()=>quantity(c,-1)} aria-label={c.name+' – egy példány levonása'}>−</button><strong aria-label="Darabszám">{row?.quantity||0}</strong><button disabled={busy||row?.quantity===999} onClick={()=>quantity(c,1)} aria-label={c.name+' – egy példány hozzáadása'}>+</button><button disabled={busy} aria-label="Kiemelt lap" aria-pressed={favorites.has(c.id)} onClick={()=>favorite(c)}>{favorites.has(c.id)?'★':'☆'}</button><button disabled={busy} aria-label="Kívánságlista" aria-pressed={Boolean(row?.wanted)} onClick={()=>save({key:c.id,quantity:row?.quantity||0,wanted:!row?.wanted})}>{row?.wanted?'✓ Keresem':'Keresem'}</button></div>;}
 return <main className="rb">
 <div className="rb-heading"><div className="eyebrow">DUEL VAULT · GYŰJTEMÉNY</div><h1>Riftbound</h1><p>Angol lapok, külön nyilvántartva kiadásonként és fóliaváltozatonként.</p></div>
 {error&&<p className="rb-error" role="alert">{error}</p>}
 {!catalog&&!error&&<p role="status">Katalógus betöltése…</p>}
 {catalog&&<>
 <div className="rb-toolbar"><label>Nézet<select value={mode} onChange={e=>{Mode(e.target.value);Select('');Limit(60);}}><option value="all">Teljes katalógus</option><option value="tracked">Követett szettek ({tracked.size})</option><option value="favorites">Kiemelt lapok ({favorites.size})</option></select></label>
 {mode!=='favorites'&&<label>Szett<select value={selected} onChange={e=>{Select(e.target.value);Limit(60);}}><option value="">Minden szett</option>{catalog.sets.filter(s=>mode!=='tracked'||tracked.has(s.id)).map(s=><option key={s.id} value={s.id}>{s.name} ({s.id}) · {s.count}</option>)}</select></label>}
 {set&&<button className="secondary" disabled={busy} onClick={()=>{if(tracked.has(set.id)){void save({set:set.id},'DELETE');if(mode==='tracked')Select('');}else void save({set:set.id});}}>{tracked.has(set.id)?'Követés megszüntetése':'Szett követése'}</button>}</div>
 {set&&<p>{set.name} · Angol megjelenés: {set.date}</p>}
 <div className="rb-stats"><span><b>{have}</b> meglévő változat</span><span><b>{scope.length-have}</b> hiányzó változat</span><span><b>{total}</b> példány</span></div>
 <div className="rb-toolbar"><label>Keresés<input type="search" value={query} placeholder="Lap neve vagy száma" onChange={e=>{Query(e.target.value);Limit(60);}}/></label><label>Ritkaság<select value={rarity} onChange={e=>{Rarity(e.target.value);Limit(60);}}><option value="">Minden ritkaság</option>{[...new Set(catalog.cards.map(c=>c.rarity))].sort().map(r=><option key={r}>{r}</option>)}</select></label><label>Állapot<select value={owned} onChange={e=>{Owned(e.target.value);Limit(60);}}><option value="all">Minden lap</option><option value="have">Megvan</option><option value="missing">Hiányzik</option><option value="wanted">Keresem</option></select></label></div>
 <p className="rb-result" role="status">{visible.length} találat</p>
 <div className="rb-grid">{visible.slice(0,limit).map(c=><article key={c.id}><button className="rb-card" onClick={()=>Detail(c)}><CardImage card={c}/><b>{c.name}</b><small>{c.code}</small><small>{variant(c)}</small></button>{controls(c)}</article>)}</div>
 {!visible.length&&<p>Nincs lap ebben a nézetben. Válassz másik szettet vagy szűrőt.</p>}
 {visible.length>limit&&<button className="secondary rb-more" onClick={()=>Limit(n=>n+60)}>További lapok betöltése</button>}
 <footer>Adatok: OpenRift · Kártyaképek: Riot Games · Nem hivatalos gyűjteménykezelő</footer>
 </>}
 {detail&&<div className="overlay" onClick={()=>Detail(undefined)}><section className="dialog rb-detail" role="dialog" aria-modal="true" aria-label={detail.name} onClick={e=>e.stopPropagation()}><button className="close" autoFocus aria-label="Bezárás" onClick={()=>Detail(undefined)}>×</button><RiftboundCardViewer key={detail.id} card={detail}/><div><h2>{detail.name}</h2><p>{detail.code} · {variant(detail)}</p>{controls(detail)}{error&&<p role="alert">{error}</p>}</div></section></div>}
 </main>;
}
