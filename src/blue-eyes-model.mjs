// Original procedural sculpt. Reference: Kotobukiya OSHI WORKS GP001 silhouette.
export function createBlueEyes(T){
 const dragon=new T.Group(),neck=new T.Group(),tail=new T.Group(),wings=[];
 const pearl=new T.MeshPhysicalMaterial({color:0xbacddc,metalness:.65,roughness:.32,clearcoat:.6});
 const edge=new T.MeshStandardMaterial({color:0x728ea4,metalness:.7,roughness:.36});
 const plate=new T.MeshPhysicalMaterial({color:0xd0deeb,metalness:.62,roughness:.27,clearcoat:.5});
 const membrane=new T.MeshStandardMaterial({color:0x68879e,metalness:.32,roughness:.52,side:T.DoubleSide});
 const inside=new T.MeshStandardMaterial({color:0x101c2a,roughness:.65,side:T.DoubleSide});
 const blue=new T.MeshStandardMaterial({color:0x29b7ff,emissive:0x0088ff,emissiveIntensity:1.8});
 const black=new T.MeshStandardMaterial({color:0x071420,roughness:.3});
 const V=a=>new T.Vector3(...a);
 function mesh(g,m,parent=dragon){const o=new T.Mesh(g,m);parent.add(o);return o;}
 function oval(p,s,m=pearl,parent=dragon){const o=mesh(new T.SphereGeometry(1,24,16),m,parent);o.position.set(...p);o.scale.set(...s);return o;}
 function tube(points,r1,r2,m=pearl,parent=dragon,segments=24,sides=14){const curve=new T.CatmullRomCurve3(points.map(V));const frames=curve.computeFrenetFrames(segments,false),pos=[],idx=[];for(let i=0;i<=segments;i++){const p=curve.getPointAt(i/segments),r=r1+(r2-r1)*i/segments;for(let j=0;j<sides;j++){const a=j/sides*Math.PI*2,q=p.clone().addScaledVector(frames.normals[i],Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r);pos.push(q.x,q.y,q.z);if(i<segments){const k=i*sides+j,n=i*sides+(j+1)%sides;idx.push(k,n,k+sides,n,n+sides,k+sides);}}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return mesh(g,m,parent);}
 function spike(a,b,r=.08,parent=dragon,m=plate){const av=V(a),bv=V(b),o=mesh(new T.ConeGeometry(r,av.distanceTo(bv),8),m,parent);o.position.copy(av).lerp(bv,.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return o;}
 function poly(points,faces,m=plate,parent=dragon){const p=[];for(const f of faces)for(let i=1;i<f.length-1;i++)for(const j of [f[0],f[i],f[i+1]])p.push(...points[j]);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.computeVertexNormals();return mesh(g,m,parent);}
 // Layered V-shaped breast armour, broad shoulders and lean abdomen.
 oval([0,1.8,0],[.59,.91,.47]);oval([0,2.35,.02],[.77,.6,.5]);
 for(let i=0;i<11;i++){const y=1.12+i*.17,w=.35+Math.sin(i/14*Math.PI)*.36,z=.32+Math.sin(i/14*Math.PI)*.13;const pts=[];for(const upper of [false,true])for(let j=0;j<=10;j++){const a=-Math.PI/2+j/10*Math.PI;pts.push([Math.sin(a)*w,y+(upper?.15:-.015)-Math.cos(a)*.07,Math.cos(a)*(z+(upper?-.025:.035))]);}const faces=[];for(let j=0;j<10;j++)faces.push([j,j+1,j+12,j+11]);poly(pts,faces,i%2?pearl:plate);} 
 dragon.add(neck);tube([[0,2.6,0],[0,3.15,-.14],[0,3.78,.03],[0,4.03,.53],[0,3.85,1.03]],.36,.24,pearl,neck,48,20);
 for(let i=0;i<8;i++){const a=i/7,y=2.66+a*1.27,z=-.13+Math.pow(a,3)*.4;const rib=mesh(new T.TorusGeometry(.325-a*.06,.027,6,24),edge,neck);rib.position.set(0,y,z);rib.rotation.x=Math.PI/2+a*.5;}
 // Distinct wedge-shaped skull, hooked snout and deep open jaw.
 const head=new T.Group();head.position.set(0,3.85,1.03);head.rotation.x=.12;neck.add(head);
 poly([[-.25,-.02,-.33],[.25,-.02,-.33],[-.34,.31,.02],[.34,.31,.02],[-.18,.07,.96],[.18,.07,.96],[-.095,-.17,1.13],[.095,-.17,1.13],[0,.40,-.15],[0,.20,.77]],[[0,2,8],[1,8,3],[2,4,9,8],[3,8,9,5],[4,6,7,5,9],[0,6,4,2],[1,3,5,7],[0,1,7,6]],plate,head);
 poly([[-.24,-.38,.03],[.24,-.38,.03],[-.11,-.54,.94],[.11,-.54,.94],[-.19,-.48,.0],[.19,-.48,.0],[-.07,-.6,.87],[.07,-.6,.87]],[[0,2,3,1],[0,4,6,2],[1,3,7,5],[2,6,7,3],[4,5,7,6]],pearl,head);
 poly([[-.20,-.4,.07],[.20,-.4,.07],[-.09,-.51,.91],[.09,-.51,.91]],[[0,1,3,2]],inside,head);
 for(const side of [-1,1]){
  oval([side*.28,.13,.21],[.06,.105,.17],black,head);oval([side*.322,.135,.235],[.019,.043,.09],blue,head);
  tube([[side*.16,.30,.59],[side*.32,.30,.21],[side*.31,.34,-.2]],.07,.05,plate,head,12,8);
  // Three swept cheek/crown blades, rather than generic round horns.
  for(let i=0;i<3;i++){const x=side*(.21+i*.055),y=.14+i*.10,z=-.12-i*.12;poly([[x-side*.09,y-.08,z+.18],[x+side*.09,y,z+.12],[x+side*(.16-i*.02),y+.48-i*.06,z-.55],[x,y+.14,z]],[[0,1,2],[0,2,3],[1,3,2],[0,3,1]],plate,head);}
  for(let i=0;i<9;i++){const z=.1+i*.1,x=side*(.23-i*.013);spike([x,-.07,z],[x,-.20,z+.035],.038,head);if(i<7)spike([x*.84,-.43,z],[x*.84,-.34,z+.035],.028,head);}
  oval([side*.105,-.02,.92],[.034,.025,.065],black,head);
  // Raised forearms with long spread claws; larger bent hind legs.
  const arm=new T.Group();dragon.add(arm);oval([side*.72,2.48,-.05],[.29,.29,.32],plate,arm);
  tube([[side*.72,2.45,0],[side*1.13,2.20,.1],[side*1.43,2.42,.5]],.19,.11,pearl,arm);
  oval([side*1.43,2.4,.53],[.20,.12,.21],plate,arm);
  for(let k=0;k<3;k++){const x=side*(1.27+k*.16),z=.6+k*.015;tube([[x,2.41,z],[x+side*.08,2.35,z+.19],[x+side*.11,2.17,z+.31]],.065,.006,plate,arm,12,8);}
  spike([side*1.30,2.39,.47],[side*1.12,2.12,.64],.065,arm);
  oval([side*.53,1.1,-.13],[.40,.60,.36],plate);tube([[side*.55,1.1,-.12],[side*.86,.72,.3],[side*.72,.3,.48]],.22,.13);
  oval([side*.74,.24,.61],[.23,.14,.31],plate);
  for(let k=0;k<3;k++){const x=side*.74+(k-1)*.17;tube([[x,.25,.76],[x,.18,.99],[x,.06,1.16]],.074,.003,plate,dragon,12,8);}
  for(let i=0;i<3;i++){const o=mesh(new T.TorusGeometry(.15,.035,6,16),plate);o.position.set(side*.75,.34+i*.105,.46);o.rotation.x=Math.PI/2;}
 }
 dragon.add(tail);const tailPoints=[[0,1.2,-.34],[.1,.7,-1.1],[.7,.32,-1.9],[1.7,.35,-2.5],[2.55,.68,-2.15],[2.85,1.12,-1.55],[2.60,1.38,-1.13]];
 tube(tailPoints,.30,.012,pearl,tail,85,16);
 const tc=new T.CatmullRomCurve3(tailPoints.map(V));for(let i=0;i<28;i++){const a=i/28,p=tc.getPointAt(a),t=tc.getTangentAt(a);const ring=mesh(new T.TorusGeometry(.29*(1-a)+.015,.018,6,16),edge,tail);ring.position.copy(p);ring.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),t);if(i%3===0)spike(p.toArray(),p.clone().add(new T.Vector3(0,.19*(1-a),-.1)).toArray(),.07*(1-a)+.01,tail);}
 // Curved wing fingers and scalloped membranes, with visible depth and veins.
 for(const side of [-1,1]){
  const wing=new T.Group();wing.position.set(side*.53,2.62,-.23);dragon.add(wing);wings.push(wing);
  const root=[0,0,0],elbow=[side*.9,1.25,-.1];tube([root,[side*.45,.72,.05],elbow],.17,.10,pearl,wing);
  const tips=[[side*3.9,.35,-.6],[side*3.1,-.35,-.65],[side*2.18,-.68,-.45],[side*1.2,-.74,-.26],[side*.25,-.68,-.15]];
  const curves=tips.map((tip,i)=>new T.QuadraticBezierCurve3(V(elbow),V([side*(1.7-i*.22),1.3-i*.28,-.25]),V(tip)));
  for(let i=0;i<curves.length;i++){const pts=curves[i].getPoints(20).map(p=>p.toArray());tube(pts,.075,.008,plate,wing,24,9);}
  for(let panel=0;panel<curves.length-1;panel++){
   const pos=[],idx=[],N=18,M=12;
   for(let u=0;u<=N;u++)for(let v=0;v<=M;v++){
    const a=u/N,b=v/M,left=curves[panel].getPoint(a),right=curves[panel+1].getPoint(a),p=left.lerp(right,b);
    const scallop=Math.sin(b*Math.PI)*a*a*.42;p.x-=side*scallop;p.y+=scallop*.9;p.z-=Math.sin(b*Math.PI)*Math.sin(a*Math.PI)*.13;pos.push(p.x,p.y,p.z);
    if(u<N&&v<M){const k=u*(M+1)+v;idx.push(k,k+1,k+M+1,k+1,k+M+2,k+M+1);}
   }
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();mesh(g,membrane,wing);
   for(const b of [.33,.66]){const pts=[];for(let u=0;u<=12;u++){const a=u/12,p=curves[panel].getPoint(a).lerp(curves[panel+1].getPoint(a),b);const scallop=Math.sin(b*Math.PI)*a*a*.42;p.x-=side*scallop;p.y+=scallop*.9;p.z-=Math.sin(b*Math.PI)*Math.sin(a*Math.PI)*.13;pts.push(p.toArray());}tube(pts,.014,.004,edge,wing,18,6);}
  }
  spike(elbow,[side*1.07,1.63,-.08],.095,wing);
 }
 dragon.userData={model:'blue-eyes-sculpt-v2',originalGeometry:true};return {dragon,neck,tail,wings};
}
