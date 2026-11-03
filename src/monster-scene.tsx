import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {createBlueEyes} from './blue-eyes-model.mjs';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export default function MonsterScene(){
 const host=useRef<HTMLDivElement>(null),reset=useRef<()=>void>(()=>{}),options=useRef({rotate:false,animate:true});
 const [error,Error]=useState(''),[rotate,Rotate]=useState(false),[animate,Animate]=useState(true);
 options.current={rotate,animate};
 useEffect(()=>{
  const el=host.current;if(!el)return;
  let renderer:T.WebGLRenderer;try{renderer=new T.WebGLRenderer({antialias:true,alpha:true});}catch{Error('A 3D-megjelenítéshez WebGL szükséges. A Kártya fül továbbra is használható.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;el.appendChild(renderer.domElement);
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.1,100);camera.position.set(8,5,12);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,2.2,0);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=5;controls.maxDistance=18;controls.maxPolarAngle=Math.PI*.83;controls.autoRotateSpeed=.7;
  reset.current=()=>{camera.position.set(8,5,12);controls.target.set(0,2.2,0);controls.update();};
  scene.add(new T.HemisphereLight(0xd5edff,0x142b39,2.2));
  for(const [color,power,x,y,z] of [[0xffffff,4,3,7,5],[0x50caff,5,-5,3,-4],[0xe5ce99,2,4,2,-5]]){const light=new T.DirectionalLight(color,power);light.position.set(x,y,z);scene.add(light);}
  const {dragon,neck,tail,wings}=createBlueEyes(T);scene.add(dragon);
  const pedestal=new T.Mesh(new T.CylinderGeometry(2.1,2.3,.18,64),new T.MeshStandardMaterial({color:0x172b35,metalness:.7,roughness:.4}));pedestal.position.y=-.12;scene.add(pedestal);
  const ring=new T.Mesh(new T.TorusGeometry(2.12,.022,8,100),new T.MeshBasicMaterial({color:0x65cfff}));ring.rotation.x=Math.PI/2;ring.position.y=-.01;scene.add(ring);
  const resize=()=>{const w=Math.max(el.clientWidth,1),h=Math.max(el.clientHeight,1);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(el);resize();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let frame=0;const start=performance.now();
  function draw(now:number){frame=requestAnimationFrame(draw);const t=(now-start)/1000,motion=options.current.animate&&!reduced;dragon.position.y=motion?Math.sin(t*1.6)*.035:0;neck.rotation.x=motion?Math.sin(t*.9)*.025:0;tail.rotation.y=motion?Math.sin(t*.7)*.07:0;wings.forEach((w,i)=>w.rotation.z=motion?Math.sin(t*1.1)*.10*(i===0?1:-1):0);controls.autoRotate=options.current.rotate&&!reduced;controls.update();renderer.render(scene,camera);}
  frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});renderer.dispose();renderer.domElement.remove();reset.current=()=>{};};
 },[]);
 return <div className="monster-viewer"><div ref={host} className="monster-stage" role="img" aria-label="Blue-Eyes White Dragon valódi, körbeforgatható, stilizált 3D-modellje"/>{error&&<p role="alert">{error}</p>}<div className="viewerbuttons"><button className="secondary" aria-pressed={rotate} onClick={()=>Rotate(v=>!v)}>Körbeforgatás</button><button className="secondary" aria-pressed={animate} onClick={()=>Animate(v=>!v)}>{animate?'Animáció leállítása':'Animáció indítása'}</button><button className="secondary" onClick={()=>reset.current()}>Alaphelyzet</button></div><p className="viewerhint">Húzd a forgatáshoz · Görgess vagy csippents a nagyításhoz</p><p className="foildisclaimer">Saját 3D-modell · Referenciák alapján átdolgozva · Blue-Eyes White Dragon</p></div>;
}
