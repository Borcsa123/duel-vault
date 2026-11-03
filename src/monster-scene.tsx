import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export default function MonsterScene(){
 const host=useRef<HTMLDivElement>(null),reset=useRef<()=>void>(()=>{}),options=useRef({rotate:false,animate:true});
 const [error,Error]=useState(''),[rotate,Rotate]=useState(false),[animate,Animate]=useState(true);
 options.current={rotate,animate};
 useEffect(()=>{
  const el=host.current;if(!el)return;
  let renderer:T.WebGLRenderer;try{renderer=new T.WebGLRenderer({antialias:true,alpha:true});}catch{Error('A 3D-megjelenítéshez WebGL szükséges. A Kártya fül továbbra is használható.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;el.appendChild(renderer.domElement);
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.1,100);camera.position.set(7,4.5,9);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.5,0);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=5;controls.maxDistance=18;controls.maxPolarAngle=Math.PI*.83;controls.autoRotateSpeed=.7;
  reset.current=()=>{camera.position.set(7,4.5,9);controls.target.set(0,1.5,0);controls.update();};
  scene.add(new T.HemisphereLight(0xd5edff,0x142b39,2.2));
  for(const [color,power,x,y,z] of [[0xffffff,4,3,7,5],[0x50caff,5,-5,3,-4],[0xe5ce99,2,4,2,-5]]){const light=new T.DirectionalLight(color,power);light.position.set(x,y,z);scene.add(light);}
  const pearl=new T.MeshPhysicalMaterial({color:0xc4dce9,metalness:.48,roughness:.29,clearcoat:.8,clearcoatRoughness:.2});
  const dark=new T.MeshStandardMaterial({color:0x668ba2,metalness:.65,roughness:.35});
  const membrane=new T.MeshPhysicalMaterial({color:0x73a6bd,metalness:.3,roughness:.4,side:T.DoubleSide});
  const eye=new T.MeshStandardMaterial({color:0x21baff,emissive:0x008cff,emissiveIntensity:3});
  const mouth=new T.MeshStandardMaterial({color:0x12374b,roughness:.6});
  const dragon=new T.Group();scene.add(dragon);
  function ellipsoid(parent:T.Object3D,pos:number[],scale:number[],material:T.Material=pearl){const mesh=new T.Mesh(new T.SphereGeometry(1,24,16),material);mesh.position.set(...pos as [number,number,number]);mesh.scale.set(...scale as [number,number,number]);parent.add(mesh);return mesh;}
  function bone(parent:T.Object3D,a:number[],b:number[],radius:number,material:T.Material=pearl,end=radius*.7){const from=new T.Vector3(...a as [number,number,number]),to=new T.Vector3(...b as [number,number,number]);const m=new T.Mesh(new T.CylinderGeometry(end,radius,from.distanceTo(to),12),material);m.position.copy(from).lerp(to,.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),to.sub(from).normalize());parent.add(m);return m;}
  function horn(parent:T.Object3D,a:number[],b:number[],r=.1){bone(parent,a,b,r,pearl,.005);}
  ellipsoid(dragon,[0,1.4,0],[.65,.83,1.15]);ellipsoid(dragon,[0,1.6,.65],[.56,.66,.67]);
  for(let i=0;i<8;i++){const z=-.8+i*.23;ellipsoid(dragon,[0,1.12,z],[.56,.44,.14],i%2?dark:pearl);horn(dragon,[0,2.1,z],[0,2.43,z-.15],.11);}
  // Long segmented neck, armoured head and projecting jaw are volume meshes.
  const neck=new T.Group();dragon.add(neck);
  const points=[[0,1.8,.75],[0,2.25,1.1],[0,2.8,1.05],[0,3.2,1.35]];
  for(let i=0;i<3;i++){bone(neck,points[i],points[i+1],.33-i*.045);ellipsoid(neck,points[i+1],[.31-i*.04,.23,.29]);}
  const head=new T.Group();head.position.set(0,3.2,1.4);neck.add(head);
  ellipsoid(head,[0,.08,.15],[.39,.33,.61]);ellipsoid(head,[0,-.12,.62],[.30,.12,.56]);ellipsoid(head,[0,-.26,.57],[.28,.095,.48]);ellipsoid(head,[0,-.19,.72],[.27,.028,.43],mouth);
  for(const side of [-1,1]){
   ellipsoid(head,[side*.32,.15,.36],[.065,.105,.16],eye);
   bone(head,[side*.17,.29,.6],[side*.37,.32,.12],.08);
   horn(head,[side*.25,.27,-.1],[side*.57,.72,-.8],.15);
   horn(head,[side*.3,-.03,-.12],[side*.65,.08,-.65],.12);
   for(let i=0;i<4;i++)horn(head,[side*.22,-.12,.44+i*.15],[side*.22,-.24,.44+i*.15],.035);
   // Hind legs, raised forearms, individually modelled toes and claws.
   for(const z of [-.65,.65]){
    const hind=z<0;const x=side*(hind?.55:.47);
    ellipsoid(dragon,[x,1.1,z],[hind?.35:.2,hind?.53:.35,.31]);
    bone(dragon,[x,1.13,z],[side*.83,.5,z+.2],hind?.22:.14);
    bone(dragon,[side*.83,.5,z+.2],[side*.75,.18,z+.56],.14);
    ellipsoid(dragon,[side*.75,.17,z+.62],[.26,.13,.36]);
    for(let toe=-1;toe<=1;toe++)horn(dragon,[side*.75+toe*.16,.15,z+.81],[side*.75+toe*.19,.08,z+1.06],.065);
   }
  }
  const tail=new T.Group();dragon.add(tail);let prev=[0,1.35,-.9];
  for(let i=0;i<18;i++){const a=i/17,next=[Math.sin(a*2.9)*1.6,1.3-a*.75,-1-a*3.6];bone(tail,prev,next,.33*(1-a)+.025);if(i%2===0)horn(tail,next,[next[0],next[1]+.22*(1-a),next[2]-.15],.08*(1-a)+.015);prev=next;}
  const wings:T.Group[]=[];
  for(const side of [-1,1]){
   const wing=new T.Group();wing.position.set(side*.43,1.96,-.15);dragon.add(wing);wings.push(wing);
   const joint=[side*1.15,1.02,-.1],tips=[[side*3.25,1.58,-.65],[side*3.1,.67,-1.3],[side*2.5,-.05,-1.7],[side*1.5,-.48,-1.5]];
   bone(wing,[0,0,0],joint,.16);for(const tip of tips)bone(wing,joint,tip,.075,pearl,.025);
   for(let i=0;i<tips.length-1;i++){
    const v=[...joint,...tips[i],...tips[i+1]];const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.computeVertexNormals();wing.add(new T.Mesh(geo,membrane));
   }
   bone(wing,tips[3],[0,0,-.65],.055);horn(wing,joint,[side*1.25,1.42,-.05],.09);
  }
  const pedestal=new T.Mesh(new T.CylinderGeometry(2.1,2.3,.18,64),new T.MeshStandardMaterial({color:0x172b35,metalness:.7,roughness:.4}));pedestal.position.y=-.12;scene.add(pedestal);
  const ring=new T.Mesh(new T.TorusGeometry(2.12,.022,8,100),new T.MeshBasicMaterial({color:0x65cfff}));ring.rotation.x=Math.PI/2;ring.position.y=-.01;scene.add(ring);
  const resize=()=>{const w=Math.max(el.clientWidth,1),h=Math.max(el.clientHeight,1);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(el);resize();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let frame=0;const start=performance.now();
  function draw(now:number){frame=requestAnimationFrame(draw);const t=(now-start)/1000,motion=options.current.animate&&!reduced;dragon.position.y=motion?Math.sin(t*1.6)*.035:0;neck.rotation.x=motion?Math.sin(t*.9)*.025:0;tail.rotation.y=motion?Math.sin(t*.7)*.07:0;wings.forEach((w,i)=>w.rotation.z=motion?Math.sin(t*1.1)*.10*(i===0?1:-1):0);controls.autoRotate=options.current.rotate&&!reduced;controls.update();renderer.render(scene,camera);}
  frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});renderer.dispose();renderer.domElement.remove();reset.current=()=>{};};
 },[]);
 return <div className="monster-viewer"><div ref={host} className="monster-stage" role="img" aria-label="Blue-Eyes White Dragon valódi, körbeforgatható, stilizált 3D-modellje"/>{error&&<p role="alert">{error}</p>}<div className="viewerbuttons"><button className="secondary" aria-pressed={rotate} onClick={()=>Rotate(v=>!v)}>Körbeforgatás</button><button className="secondary" aria-pressed={animate} onClick={()=>Animate(v=>!v)}>{animate?'Animáció leállítása':'Animáció indítása'}</button><button className="secondary" onClick={()=>reset.current()}>Alaphelyzet</button></div><p className="viewerhint">Húzd a forgatáshoz · Görgess vagy csippents a nagyításhoz</p><p className="foildisclaimer">Saját, stilizált 3D-változat · Blue-Eyes White Dragon</p></div>;
}
