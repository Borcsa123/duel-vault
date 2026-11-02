'use client';
import {useEffect,useRef,useState} from 'react';
const vertex=`attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const fragment=`precision highp float;
varying vec2 uv;uniform vec2 light;uniform vec2 view;uniform float time;uniform float strength;uniform int kind;uniform bool fullArt;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float box(vec2 p,vec2 lo,vec2 hi){vec2 a=smoothstep(lo,lo+.004,p);vec2 b=1.-smoothstep(hi-.004,hi,p);return a.x*a.y*b.x*b.y;}
vec3 spectrum(float t){return .52+.48*cos(6.2831853*(vec3(.03,.36,.69)+t));}
float line(float x,float width){return 1.-smoothstep(width,width+.02,abs(x));}
void main(){vec2 p=vec2(uv.x,1.-uv.y);float art=box(p,vec2(.125,.195),vec2(.875,.705));float frame=box(p,vec2(.035,.025),vec2(.965,.975));float text=box(p,vec2(.055,.735),vec2(.945,.945));float mask=art;
if(kind==3||kind==4||kind==5||kind==9)mask=frame*(1.-text*.62);if(kind==7)mask=max(art,frame*(1.-box(p,vec2(.12,.17),vec2(.88,.95)))*.72);if(fullArt)mask=box(p,vec2(.008,.008),vec2(.992,.992))*(1.-text*.82);if(kind==0){gl_FragColor=vec4(0.);return;}
vec2 l=light+vec2(sin(time*.43)*.14,cos(time*.31)*.10);vec2 v=view;vec2 point=p-l;
float beamCoord=dot(p-vec2(.5),normalize(vec2(.82,.57)))+v.x*.37+v.y*.28+sin(time*.37)*.27;
float beam=exp(-pow(beamCoord*6.,2.));float tight=exp(-pow(beamCoord*22.,2.));float spot=exp(-dot(point*vec2(1.,1.35),point*vec2(1.,1.35))*8.);
float grain=hash(floor(p*vec2(750.,1100.)));float spectral=dot(p,vec2(.75,-.47))+v.x*.8+v.y*.6+time*.018;
vec3 rainbow=spectrum(spectral);float intensity=0.;vec3 colour=vec3(0.);float sparkle=0.;
// Smooth rainbow foil follows a narrow moving reflection rather than tinting the whole card.
if(kind==1||kind==2){float ripples=.90+.1*sin(p.y*680.+p.x*85.);intensity=(beam*.33+spot*.22+tight*.25)*ripples;colour=mix(rainbow,vec3(.93,.97,1.),tight*.65);}
// Secret Rare: stable diagonal etched strokes, with independent reflective facets.
if(kind==6){vec2 q=vec2((p.x+p.y*.69)*108.,(p.y-p.x*.69)*158.);vec2 cell=floor(q);vec2 f=fract(q)-.5;float h=hash(cell);float strokes=(1.-smoothstep(.055,.13,abs(f.x+f.y*.24)))*(1.-smoothstep(.25,.45,abs(f.y)));float facet=pow(max(0.,cos((h-.5)*5.+v.x*3.+v.y*2.+beamCoord*8.)),18.);sparkle=strokes*(.22+facet*.78)*(.38+beam*.92);intensity=beam*.34+spot*.18+sparkle*1.45;colour=mix(rainbow,spectrum(h+spectral),.55);colour=mix(colour,vec3(1.),sparkle*.62);}
// Starlight uses isolated transparent facets, never a full-face white reflection.
// Returning before the shared sheen prevents additive light from washing out the artwork.
if(kind==3){
 vec2 q=p*vec2(108.,158.);vec2 cell=floor(q);vec2 f=fract(q)-.5;
 float h=hash(cell);float phase=h*6.2831853+v.x*4.5+v.y*3.6+(light.x-.5)*2.+time*.32;
 float facetLight=pow(max(0.,cos(phase)),22.);
 float core=exp(-dot(f,f)*190.);
 float rays=exp(-abs(f.x)*95.-abs(f.y)*15.)+exp(-abs(f.y)*95.-abs(f.x)*15.);
 float track=exp(-pow((f.x+f.y*.68)*34.,2.))*(1.-smoothstep(.13,.38,abs(f.y)));
 float glint=(core*.85+rays*.24+track*.15)*facetLight;
 float alpha=clamp(glint*(.32+beam*.68)*strength,0.,.58)*mask;
 vec3 tint=spectrum(h+spectral*.65)*.80+.08;
 gl_FragColor=vec4(tint,alpha);return;
}
// Starlight / QCSR: dense micro-etched lattice and tiny specular facets.
if(kind==4||kind==5){float density=kind==4?114.:140.;vec2 q=p*vec2(density,density*1.46);vec2 cell=floor(q);vec2 f=fract(q)-.5;float h=hash(cell);float grid=pow(max(0.,1.-abs(f.x)*2.),24.)+pow(max(0.,1.-abs(f.y)*2.),24.);float facet=pow(max(0.,cos(h*6.283+v.x*3.2+v.y*2.8+beamCoord*11.)),kind==3?20.:32.);float dotlight=exp(-dot(f,f)*140.);float cross=(exp(-abs(f.x)*70.)*exp(-abs(f.y)*7.)+exp(-abs(f.y)*70.)*exp(-abs(f.x)*7.));sparkle=(dotlight*1.3+cross*.45)*facet*((kind==3?.32:.12)+beam*.88);float lattice=grid*(kind==3?.035:.10)*(.35+beam*.8);intensity=kind==3?beam*.065+spot*.025+sparkle*.95+lattice:beam*.24+spot*.08+sparkle*1.2+lattice;colour=mix(rainbow,spectrum(h+spectral),.35);if(kind==4)colour=mix(colour,vec3(1.,.87,.52),.24);colour=mix(colour,vec3(1.),min(kind==3?.22:.85,sparkle));}
// Fine engraved contours on Ultimate / Collector's foil.
if(kind==7||kind==8){float contours=sin((length((p-vec2(.5,.45))*vec2(1.,1.3))+.024*sin(p.x*68.))*1000.);float grooves=pow(max(0.,contours),12.);float anisotropic=pow(max(0.,cos(p.x*41.+p.y*27.+v.x*4.+v.y*3.)),10.);intensity=beam*.28+spot*.12+grooves*anisotropic*beam*.7;colour=kind==7?mix(rainbow,vec3(.95,.78,.40),.5):mix(rainbow,vec3(.82,.95,1.),.25);}
if(kind==9){float lattice=pow(max(0.,cos((p.x+p.y)*500.)),40.);intensity=beam*.28+lattice*beam*.45+spot*.15;colour=rainbow;}
if(kind==10){intensity=beam*.48+tight*.25+spot*.15;colour=mix(vec3(.8,.89,1.),spectrum(spectral)*.65+.35,.17);}
intensity=clamp(intensity*strength,0.,.94)*mask;colour=clamp(colour*(.68+grain*.16)+vec3(tight*.18),0.,1.);gl_FragColor=vec4(colour,intensity);
}`;
const ids:Record<string,number>={common:0,rare:0,super:1,ultra:2,starlight:3,quarter:4,prismatic:5,secret:6,ultimate:7,collector:8,parallel:9,ghost:10};
export default function FoilSurface({kind,rotation,tilt,light,intensity,fullArt=false}:{fullArt?:boolean;kind:string;rotation:number;tilt:{x:number;y:number};light:{x:number;y:number};intensity:number}){
const canvas=useRef<HTMLCanvasElement>(null);const values=useRef({rotation,tilt,light,intensity});values.current={rotation,tilt,light,intensity};const [fallback,Fallback]=useState(false);
useEffect(()=>{const el=canvas.current;if(!el)return;const gl=el.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,preserveDrawingBuffer:false});if(!gl){el.dataset.foilError='webgl-unavailable';Fallback(true);return;}function compile(type:number,source:string){const shader=gl!.createShader(type)!;gl!.shaderSource(shader,source);gl!.compileShader(shader);if(!gl!.getShaderParameter(shader,gl!.COMPILE_STATUS)){el!.dataset.foilError=gl!.getShaderInfoLog(shader)||'shader-compile';gl!.deleteShader(shader);return null;}return shader;}
const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);if(!vs||!fs){Fallback(true);return;}const program=gl.createProgram()!;gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){el.dataset.foilError=gl.getProgramInfoLog(program)||'shader-link';Fallback(true);return;}gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);const locations={light:gl.getUniformLocation(program,'light'),view:gl.getUniformLocation(program,'view'),time:gl.getUniformLocation(program,'time'),strength:gl.getUniformLocation(program,'strength'),kind:gl.getUniformLocation(program,'kind'),fullArt:gl.getUniformLocation(program,'fullArt')};gl.uniform1i(locations.kind,ids[kind]||0);gl.uniform1i(locations.fullArt,fullArt?1:0);const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;let frame:number;const start=performance.now();function draw(now:number){if(!gl||!el)return;const data=values.current;const dpr=Math.min(window.devicePixelRatio||1,2);const width=Math.round(el.clientWidth*dpr),height=Math.round(el.clientHeight*dpr);if(el.width!==width||el.height!==height){el.width=width;el.height=height;gl.viewport(0,0,width,height);}const rad=(data.rotation+data.tilt.y)*Math.PI/180;gl.uniform2f(locations.light,data.light.x/100,data.light.y/100);gl.uniform2f(locations.view,Math.sin(rad),data.tilt.x/40);gl.uniform1f(locations.time,reduced?0:(now-start)/1000);gl.uniform1f(locations.strength,data.intensity/100);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);frame=requestAnimationFrame(draw);}frame=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(frame);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs)};
},[kind,fullArt]);
return <><canvas ref={canvas} className={'foil-render '+(fallback?'is-fallback':'')} aria-hidden="true"/>{fallback&&<CanvasFoil fullArt={fullArt} kind={kind} rotation={rotation} tilt={tilt} light={light} intensity={intensity}/>}</>;
}

function CanvasFoil({kind,rotation,tilt,light,intensity,fullArt=false}:{fullArt?:boolean;kind:string;rotation:number;tilt:{x:number;y:number};light:{x:number;y:number};intensity:number}){
 const ref=useRef<HTMLCanvasElement>(null);const state=useRef({rotation,tilt,light,intensity});state.current={rotation,tilt,light,intensity};
 useEffect(()=>{const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;let seed=94321;function random(){seed=(seed*16807)%2147483647;return seed/2147483647}const facets=Array.from({length:kind==='starlight'?3200:kind==='quarter'?5200:kind==='secret'?6200:3000},()=>({x:random(),y:random(),normal:random()*Math.PI*2,hue:random()*360,size:.5+random()*.8}));const full=fullArt||['starlight','quarter','prismatic','parallel','collector'].includes(kind);const rare=['common','rare'].includes(kind);const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;let frame:number;let last=0;const started=performance.now();
 function draw(now:number){frame=requestAnimationFrame(draw);if(now-last<32)return;last=now;if(!canvas||!ctx)return;const w=Math.max(1,Math.round(canvas.clientWidth*Math.min(window.devicePixelRatio||1,2))),h=Math.max(1,Math.round(canvas.clientHeight*Math.min(window.devicePixelRatio||1,2)));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}ctx.clearRect(0,0,w,h);if(rare)return;const d=state.current;const t=reduce?0:(now-started)/1000;const vx=Math.sin((d.rotation+d.tilt.y)*Math.PI/180),vy=d.tilt.x/40;const lx=d.light.x/100,ly=d.light.y/100;const power=d.intensity/100;const sweep=.5+Math.sin(t*.42)*.28+vx*.4+(lx-.5)*.24;ctx.save();if(full){ctx.beginPath();ctx.roundRect(w*(fullArt?.008:.025),h*(fullArt?.008:.015),w*(fullArt?.984:.95),h*(fullArt?.984:.97),6);ctx.clip();}else{ctx.beginPath();ctx.rect(w*.125,h*.195,w*.75,h*.51);ctx.clip();}
 // Sparse coloured Starlight facets; transparent space preserves printed detail.
 if(kind==='starlight'){
  for(const f of facets){
   const phase=f.normal+vx*4.5+vy*3.6+(lx-.5)*2+t*.32;
   const reflect=Math.pow(Math.max(0,Math.cos(phase)),22);
   const distance=f.x+f.y*.3-sweep-.08;
   const beam=Math.exp(-distance*distance*15);
   const alpha=Math.min(.58,reflect*(.22+beam*.58)*power);
   if(alpha<.045)continue;
   const x=f.x*w,y=f.y*h,size=Math.max(.5,w*.0025*f.size);
   ctx.globalAlpha=alpha;ctx.strokeStyle=`hsl(${(f.hue+vx*95+t*3)%360},88%,57%)`;
   ctx.lineWidth=Math.max(.55,w/650);ctx.beginPath();ctx.moveTo(x-size,y);ctx.lineTo(x+size,y);ctx.moveTo(x,y-size);ctx.lineTo(x,y+size);ctx.stroke();
   ctx.globalAlpha=alpha*.65;ctx.fillStyle=ctx.strokeStyle;ctx.fillRect(x-.45,y-.45,.9,.9);
  }
  ctx.restore();
  if(full){ctx.save();ctx.globalCompositeOperation='destination-out';ctx.fillStyle=fullArt?'rgba(0,0,0,.82)':'rgba(0,0,0,.65)';ctx.fillRect(w*.055,h*.735,w*.89,h*.21);ctx.restore();}
  return;
 }
 // Angle-dependent diffraction band: colours have a narrow illuminated region.
 const centre=sweep*w;const band=ctx.createLinearGradient(centre-w*.43,0,centre+w*.43,h*.38);band.addColorStop(0,'rgba(80,130,255,0)');band.addColorStop(.14,'rgba(80,145,255,.10)');band.addColorStop(.28,'rgba(148,100,255,.28)');band.addColorStop(.40,'rgba(245,100,187,.34)');band.addColorStop(.51,'rgba(255,216,115,.39)');band.addColorStop(.62,'rgba(139,243,173,.35)');band.addColorStop(.73,'rgba(113,210,255,.28)');band.addColorStop(.88,'rgba(150,160,255,.09)');band.addColorStop(1,'rgba(120,150,255,0)');ctx.globalAlpha=Math.min(1,power*(kind==='ghost'?.25:kind==='starlight'?.28:1));ctx.fillStyle=band;ctx.fillRect(0,0,w,h);
 const micro=['starlight','quarter','prismatic','secret','parallel'].includes(kind);if(micro){const cell=kind==='starlight'?w/95:w/65;ctx.lineWidth=kind==='starlight'?.7:.55;ctx.strokeStyle=kind==='starlight'?'rgba(158,200,255,.16)':'rgba(214,235,255,.22)';ctx.globalAlpha=power*(kind==='starlight'?.24:.55);ctx.beginPath();if(kind!=='secret')for(let x=0;x<w;x+=cell){ctx.moveTo(x,0);ctx.lineTo(x,h)}if(kind!=='secret')for(let y=0;y<h;y+=cell){ctx.moveTo(0,y);ctx.lineTo(w,y)}ctx.stroke();
 for(const f of facets){const x=f.x*w,y=f.y*h;const reflect=Math.pow(Math.max(0,Math.cos(f.normal+vx*3.5+vy*2.8+(lx-.5)*2.7+t*.37)),kind==='starlight'?18:12);const distance=(f.x+f.y*.3-sweep-.08);const beam=Math.exp(-distance*distance*15);const alpha=Math.min(.98,(kind==='secret'?(.18+reflect*.82):reflect)*(.28+beam*.85)*power*(kind==='secret'?1.55:kind==='starlight'?.95:1.18));if(alpha<.07)continue;ctx.globalAlpha=kind==='starlight'?Math.min(.65,alpha):alpha;const hue=(f.hue+vx*90+t*3)%360;ctx.strokeStyle=kind==='quarter'?`hsla(${35+(hue%45)},85%,${68+reflect*25}%,1)`:`hsla(${hue},90%,${(kind==='starlight'?48:67)+reflect*(kind==='starlight'?18:28)}%,1)`;ctx.lineWidth=Math.max(kind==='secret'?.85:.65,w/600*f.size);ctx.beginPath();if(kind==='secret'){const length=w*.009;ctx.moveTo(x-length,y+length*1.4);ctx.lineTo(x+length,y-length*1.4);}else{const size=w*(kind==='starlight'?.0032:.0028)*f.size;ctx.moveTo(x-size,y);ctx.lineTo(x+size,y);ctx.moveTo(x,y-size);ctx.lineTo(x,y+size);}ctx.stroke();if(reflect>.84&&beam>.5&&kind!=='secret'&&kind!=='starlight'){ctx.globalAlpha=alpha*.52;ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(x-.6,y-.6,1.5,1.5);}}
 }
 if(kind==='ultimate'||kind==='collector'){ctx.globalAlpha=power*.26;ctx.strokeStyle='rgba(240,223,176,.8)';ctx.lineWidth=.45;for(let i=0;i<90;i++){ctx.beginPath();ctx.ellipse(w*.5,h*.45,w*(.10+i*.004),h*(.04+i*.006),vx*.3,0,Math.PI*2);ctx.stroke();}}
 // A second, near-white reflection has a much smaller footprint than the rainbow.
 const sheen=ctx.createRadialGradient(lx*w,ly*h,0,lx*w,ly*h,w*.67);sheen.addColorStop(0,kind==='ghost'?'rgba(225,237,255,.68)':'rgba(243,250,255,.25)');sheen.addColorStop(.12,'rgba(245,250,255,.11)');sheen.addColorStop(.5,'rgba(220,240,255,.025)');sheen.addColorStop(1,'rgba(255,255,255,0)');ctx.globalAlpha=power*(kind==='starlight'?.22:1);ctx.fillStyle=sheen;ctx.fillRect(0,0,w,h);ctx.restore();if(full){ctx.save();ctx.globalCompositeOperation='destination-out';ctx.fillStyle=fullArt?'rgba(0,0,0,.82)':'rgba(0,0,0,.65)';ctx.fillRect(w*.055,h*.735,w*.89,h*.21);ctx.restore();}}
 frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);
 },[kind,fullArt]);return <canvas ref={ref} className="foil-render foil-canvas2d" aria-hidden="true"/>;
}
