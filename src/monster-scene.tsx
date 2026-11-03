import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
export default function MonsterScene(){
 const host=useRef<HTMLDivElement>(null),reset=useRef<()=>void>(()=>{}),options=useRef({rotate:false});
 const [error,Error]=useState(''),[loading,Loading]=useState(true),[rotate,Rotate]=useState(false);options.current={rotate};
 useEffect(()=>{
  const el=host.current;if(!el)return;let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:true});}catch{Error('A 3D-megjelenítéshez WebGL szükséges. A kártyanézet továbbra is használható.');Loading(false);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;el.appendChild(renderer.domElement);
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.01,1000),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.autoRotateSpeed=.6;controls.maxPolarAngle=Math.PI*.87;controls.target.set(0,0,0);
  scene.add(new T.HemisphereLight(0xe6f4ff,0x253a52,2));const key=new T.DirectionalLight(0xffffff,1.35);key.position.set(4,6,8);scene.add(key);const rim=new T.DirectionalLight(0x78baff,1);rim.position.set(-5,3,-5);scene.add(rim);
  let alive=true,model:T.Group|undefined,texture:T.Texture|undefined;const materials=new Set<T.Material>();
  function disposeModel(group:T.Group){group.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});}
  const textureLoader=new T.TextureLoader();texture=textureLoader.load('/models/blue-eyes/color.png',t=>{t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();},undefined,()=>{if(alive){Error('A modell színes textúrája nem tölthető be.');Loading(false);}});texture.colorSpace=T.SRGBColorSpace;
  new OBJLoader().load('/models/blue-eyes/model.txt',group=>{
   if(!alive){disposeModel(group);for(const m of materials)m.dispose();return;}
   model=group;const mat=new T.MeshStandardMaterial({map:texture,color:0xffffff,metalness:.10,roughness:.57,side:T.DoubleSide});materials.add(mat);
   group.traverse(o=>{if(o instanceof T.Mesh){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();o.material=mat;}});
   const box=new T.Box3().setFromObject(group),center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());const scale=6/Math.max(size.x,size.y,size.z);group.scale.setScalar(scale);group.position.copy(center).multiplyScalar(-scale);scene.add(group);
   reset.current=()=>{camera.position.set(7,3.3,9);controls.target.set(0,0,0);controls.update();};reset.current();controls.minDistance=4;controls.maxDistance=18;Loading(false);
  },undefined,()=>{if(alive){Error('A szörnymodell nem tölthető be.');Loading(false);}});
  const resize=()=>{const w=Math.max(el.clientWidth,1),h=Math.max(el.clientHeight,1);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(el);resize();camera.position.set(7,3.3,9);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let frame=0;function draw(){frame=requestAnimationFrame(draw);controls.autoRotate=options.current.rotate&&!reduced;controls.update();renderer.render(scene,camera);}draw();
  return()=>{alive=false;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();if(model)disposeModel(model);for(const m of materials)m.dispose();texture?.dispose();renderer.dispose();renderer.domElement.remove();reset.current=()=>{};};
 },[]);
 return <div className="monster-viewer"><div className="monster-stage-wrap"><div ref={host} className="monster-stage" role="img" aria-label="Blue-Eyes White Dragon színes textúrázott 3D-modellje"/>{loading&&<p className="monster-loading" role="status">Színes 3D-modell betöltése…</p>}</div>{error&&<p role="alert">{error}</p>}<div className="viewerbuttons"><button className="secondary" aria-pressed={rotate} onClick={()=>Rotate(v=>!v)}>{rotate?'Forgatás leállítása':'Körbeforgatás'}</button><button className="secondary" onClick={()=>reset.current()}>Alaphelyzet</button></div><p className="viewerhint">Húzd a forgatáshoz · Görgess vagy csippents a nagyításhoz</p><p className="foildisclaimer">Modell: Nick / fetters_admin · UV: Zerox · Textúra: metaldodomon / The Falsebound Kingdom. Nem hivatalos modell; statikus póz.</p></div>;
}
