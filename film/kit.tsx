import {useLayoutEffect,useMemo} from 'react';
import type {ReactNode} from 'react';
import {AbsoluteFill,Audio,Easing,Sequence,interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {World,FilmClock,FilmEmphasis,partLabelLayout} from '../src/Scene';
import {focus,spread} from '../src/exploration';
import {byId,type ComponentId} from '../src/graph';
import narration from './public/narration/index.json';
import {PROMPT} from './script';

export type V=[number,number,number];
export const FPS=30;
const LEAD=.4,GAP=.45,TAIL=1.2;
type Words={duration:number;words:{t:number;end:number;w:string}[]};
const clips=narration as Record<string,Words>;

// ---- timing: everything is cued to the narration's word timestamps ----
export function timeline(id:string){
 const names=Object.keys(clips).filter(k=>k.startsWith(id+'-')).sort();
 const starts:number[]=[];let t=LEAD;for(const n of names){starts.push(t);t+=clips[n].duration+GAP}
 const duration=t-GAP+TAIL;
 /** Scene time of a word in line `line` (first word starting with `word`, case-insensitive; `nth` for repeats). */
 const at=(line:number,word:string,nth=0)=>{const w=clips[names[line]].words.filter(x=>x.w.toLowerCase().replace(/[^a-z0-9-]/g,'').startsWith(word.toLowerCase()))[nth];if(!w)throw new Error(`cue "${word}" not in ${names[line]}`);return starts[line]+w.t};
 const end=(line:number)=>starts[line]+clips[names[line]].duration;
 return {names,starts,duration,frames:Math.ceil(duration*FPS),at,end,start:(line:number)=>starts[line]};
}

// ---- math helpers ----
export const ease=Easing.inOut(Easing.cubic);
export const mix=(a:V,b:V,k:number):V=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
export const norm=(v:V):V=>{const l=Math.hypot(...v);return [v[0]/l,v[1]/l,v[2]/l]};
export const pos=(id:ComponentId)=>spread(id) as V;
/** Ortho zoom that frames a system of the playground's focus width (mul > 1 = closer). */
export const zf=(id:ComponentId,mul=1)=>{const w=focus[id].width;return mul*Math.min(1920/(w+5),1080/(w*.8+4))};
export const ISO=norm([24,25,32]);

// ---- camera: keyframes, eased, zooming toward/away from points so the subject stays on screen ----
export type Shot={t:number;target:V;zoom:number;dir?:V;dist?:number};
export function sample(shots:Shot[],t:number):Shot{
 const s=shots;if(t<=s[0].t)return s[0];if(t>=s.at(-1)!.t)return s.at(-1)!;
 const i=s.findIndex((x,j)=>t>=x.t&&t<s[j+1].t);const a=s[i],b=s[i+1];const k=ease((t-a.t)/(b.t-a.t));
 const zoom=Math.exp(interpolate(k,[0,1],[Math.log(a.zoom),Math.log(b.zoom)]));
 // Zooming in: B's screen offset shrinks smoothly; zooming out: A's offset grows smoothly.
 const target:V=b.zoom>=a.zoom?mix(b.target,a.target,a.zoom*(1-k)/zoom):mix(a.target,b.target,b.zoom*k/zoom);
 return {t,target,zoom,dir:norm(mix(a.dir??ISO,b.dir??ISO,k)),dist:Math.exp(interpolate(k,[0,1],[Math.log(a.dist??40),Math.log(b.dist??40)]))}; // log: close in early so nearby stations don't block the view
}
function place(c:THREE.OrthographicCamera,{target,zoom,dir,dist}:Shot){const d=dist??40,r=dir??ISO;c.position.set(target[0]+r[0]*d,target[1]+r[1]*d,target[2]+r[2]*d);c.lookAt(...target);c.zoom=zoom;c.updateProjectionMatrix();c.updateMatrixWorld()}
function FilmCamera({shots,t}:{shots:Shot[];t:number}){const {camera}=useThree();useLayoutEffect(()=>place(camera as THREE.OrthographicCamera,sample(shots,t)),[t,camera,shots]);return null}
/** A plain camera matching the rendered one, so labels can be projected to pixels without the 3D renderer. */
function projector(shot:Shot,w:number,h:number){const c=new THREE.OrthographicCamera(-w/2,w/2,h/2,-h/2,.1,250);place(c,shot);const v=new THREE.Vector3();return (p:V)=>{v.set(...p).project(c);return [(v.x+1)/2*w,(1-v.y)/2*h] as const}}
// The playground's part labels (anchor dot, leader line, pill), drawn as an overlay.
function PartLabelOverlay({w,shot,width,height}:{w:WorldState;shot:Shot;width:number;height:number}){
 if(!w.view)return null;const px=projector(shot,width,height);const spots=partLabelLayout(w.selected??w.view,w.view);
 return <AbsoluteFill style={{pointerEvents:'none'}}>
  <svg width={width} height={height} style={{position:'absolute',inset:0}}>{spots.map(s=>{const [ax,ay]=px(s.anchor),[lx,ly]=px(s.label);return <line key={s.id} x1={ax} y1={ay} x2={lx} y2={ly} stroke="#2B3A33" strokeOpacity={.4} strokeWidth={2}/>})}</svg>
  {spots.map(s=>{const [ax,ay]=px(s.anchor),[lx,ly]=px(s.label);const tone={'--dot':s.tone} as React.CSSProperties;return <div key={s.id}>
   <span className="anchor-dot" style={{...tone,position:'absolute',left:ax,top:ay,transform:'translate(-50%,-50%)'}}/>
   <div style={{position:'absolute',left:lx,top:ly,transform:'translate(-50%,-50%)'}}><div className={'object-label'+(s.active?' active':'')} style={tone}>{byId[s.id].name}</div></div></div>})}
 </AbsoluteFill>}

// ---- packets: glowing dots walking a polyline at constant speed ----
export type Packet={path:V[];from:number;to:number;color?:string;trail?:boolean;size?:number};
function along(path:V[],k:number):V{const seg=path.slice(1).map((p,i)=>Math.hypot(p[0]-path[i][0],p[1]-path[i][1],p[2]-path[i][2]));const total=seg.reduce((a,b)=>a+b,0);let d=k*total;for(let i=0;i<seg.length;i++){if(d<=seg[i]||i===seg.length-1)return mix(path[i],path[i+1],Math.min(d/seg[i],1));d-=seg[i]}return path.at(-1)!}
function Dot({p,color,size,opacity=1}:{p:V;color:string;size:number;opacity?:number}){return <group position={p}><mesh><sphereGeometry args={[size,20,20]}/><meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false}/></mesh><mesh><sphereGeometry args={[size*2.2,20,20]}/><meshBasicMaterial color={color} transparent opacity={.28*opacity} depthWrite={false} toneMapped={false}/></mesh></group>}
function PacketView({pk,t}:{pk:Packet;t:number}){
 const fade=.25;if(t<pk.from-fade||t>pk.to+fade)return null;
 const k=Easing.inOut(Easing.quad)(Math.min(Math.max((t-pk.from)/(pk.to-pk.from),0),1));
 const o=interpolate(t,[pk.from-fade,pk.from,pk.to,pk.to+fade],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const color=pk.color??'#0A9B6E',size=pk.size??.11;
 return <>{(pk.trail?[0,.025,.05,.075,.1]:[0]).map((lag,i)=><Dot key={i} p={along(pk.path,Math.max(k-lag,0))} color={color} size={size*(1-i*.15)} opacity={o*(1-i*.18)}/>)}</>;
}
/** Repeating packets for "flow" along a line between t0 and t1. */
export const flow=(path:V[],t0:number,t1:number,every:number,travel:number,color:string,size=.09):Packet[]=>{const out:Packet[]=[];for(let s=t0;s+travel<=t1;s+=every)out.push({path,from:s,to:s+travel,color,size});return out};

// ---- the laptop's chat screen, drawn to a canvas texture ----
export type Chat={typed?:string;sent?:boolean;thinking?:boolean;answer?:string;t:number};
const W=1280,H=780,FONT='-apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
function wrap(g:CanvasRenderingContext2D,text:string,max:number){const out:string[]=[];let line='';for(const w of text.split(' ')){const tr=line?line+' '+w:w;if(g.measureText(tr).width>max&&line){out.push(line);line=w}else line=tr}if(line)out.push(line);return out}
function draw(c:HTMLCanvasElement,s:Chat){
 const g=c.getContext('2d')!;g.fillStyle='#fff';g.fillRect(0,0,W,H);g.textBaseline='middle';g.textAlign='left';
 g.fillStyle='#2f2f2f';g.font=`600 30px ${FONT}`;g.fillText('Assistant  ▾',40,48);g.fillStyle='#ececec';g.beginPath();g.arc(W-60,48,22,0,Math.PI*2);g.fill();
 let iy=H/2-10;
 if(!s.sent){g.fillStyle='#1f1f1f';g.font=`600 54px ${FONT}`;g.textAlign='center';g.fillText('What can I help with?',W/2,H/2-95);g.textAlign='left'}
 else{
  iy=H-150;g.font=`500 34px ${FONT}`;const lines=wrap(g,PROMPT,640);const bw=Math.max(...lines.map(l=>g.measureText(l).width))+56,bh=lines.length*46+30;const bx=W-80-bw;
  g.fillStyle='#f0f0f0';g.beginPath();g.roundRect(bx,110,bw,bh,28);g.fill();g.fillStyle='#1f1f1f';lines.forEach((l,i)=>g.fillText(l,bx+28,110+15+23+i*46));
  const ay=110+bh+55;
  if(s.answer){g.font=`400 34px ${FONT}`;g.fillStyle='#1f1f1f';wrap(g,s.answer,W-200).forEach((l,i)=>g.fillText(l,90,ay+i*48))}
  else if(s.thinking)for(let i=0;i<3;i++){const a=.35+.65*Math.max(0,Math.sin(s.t*6-i*.9));g.fillStyle=`rgba(40,40,40,${a})`;g.beginPath();g.arc(100+i*30,ay,9,0,Math.PI*2);g.fill()}
 }
 g.fillStyle='#fff';g.strokeStyle='#e3e3e3';g.lineWidth=3;g.shadowColor='rgba(0,0,0,.08)';g.shadowBlur=24;g.shadowOffsetY=6;g.beginPath();g.roundRect(120,iy,W-240,110,55);g.fill();g.shadowColor='transparent';g.stroke();
 const text=s.sent?'':s.typed??'';let size=38;g.font=`400 ${size}px ${FONT}`;while(text&&g.measureText(text).width>W-420&&size>26){size-=2;g.font=`400 ${size}px ${FONT}`}
 if(text){g.fillStyle='#1f1f1f';g.fillText(text,170,iy+55)}else{g.fillStyle='#9a9a9a';g.fillText('Ask anything',170,iy+55)}
 if(!s.sent&&(text||Math.floor(s.t*2.2)%2===0)){const x=170+(text?g.measureText(text).width+4:0);g.fillStyle='#1f1f1f';g.fillRect(x,iy+30,3,50)}
 g.fillStyle=text?'#0d0d0d':'#d7d7d7';g.beginPath();g.arc(W-180,iy+55,32,0,Math.PI*2);g.fill();
 g.strokeStyle='#fff';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(W-180,iy+70);g.lineTo(W-180,iy+40);g.moveTo(W-193,iy+53);g.lineTo(W-180,iy+40);g.lineTo(W-167,iy+53);g.stroke();
}
export function ChatScreen({state}:{state:Chat}){
 const tex=useMemo(()=>{const c=document.createElement('canvas');c.width=W;c.height=H;const x=new THREE.CanvasTexture(c);x.colorSpace=THREE.SRGBColorSpace;x.anisotropy=8;return x},[]);
 useLayoutEffect(()=>{draw(tex.image as HTMLCanvasElement,state);tex.needsUpdate=true},[state,tex]);
 return <mesh position={[0,0,.09]}><planeGeometry args={[3.17,1.93]}/><meshBasicMaterial map={tex} toneMapped={false}/></mesh>;
}
/** Human-ish typing: deterministic jitter, longer pause after spaces. Returns the typed prefix at time t. */
export function typing(text:string,t0:number,t1:number){const gaps=[...text].map((ch,i)=>(.6+.8*(((Math.sin(i*12.9898)*43758.5453)%1+1)%1))*(ch===' '?1.6:1));const sum=gaps.reduce((a,b)=>a+b);const times=gaps.reduce<number[]>((acc,g)=>[...acc,(acc.at(-1)??0)+g],[]).map(v=>t0+v/sum*(t1-t0));return (t:number)=>text.slice(0,times.filter(k=>k<=t).length)}

// ---- 2D overlays: captions (lower-third pills), the scene title, and anything scene-specific ----
export type Caption={from:number;to:number;text:string;tone?:string;big?:boolean};
const fadeIn=(t:number,a:number,b:number)=>interpolate(t,[a,a+.3,b-.3,b],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
function Captions({items,t}:{items:Caption[];t:number}){const live=items.filter(c=>t>=c.from&&t<=c.to);return <div style={{position:'absolute',left:0,right:0,bottom:90,display:'flex',flexDirection:'column',alignItems:'center',gap:14}}>{live.map(c=>{const o=fadeIn(t,c.from,c.to);return <div key={c.text} style={{opacity:o,transform:`translateY(${(1-o)*12}px)`,display:'flex',alignItems:'center',gap:14,background:'#fff',borderRadius:999,padding:c.big?'20px 34px 20px 28px':'14px 28px 14px 22px',boxShadow:'0 2px 4px #0000000f,0 18px 40px -10px #2a241833',font:`600 ${c.big?40:30}px -apple-system,"SF Pro Display","Helvetica Neue",Arial,sans-serif`,color:'#2B3A33'}}><span style={{width:14,height:14,borderRadius:'50%',background:c.tone??'#0A9B6E',boxShadow:`0 0 0 5px ${(c.tone??'#0A9B6E')}2e`}}/>{c.text}</div>})}</div>}
function Title({n,title,t,duration}:{n:number;title:string;t:number;duration:number}){const o=fadeIn(t,.2,Math.min(duration-.2,5));return <div style={{position:'absolute',left:64,top:56,opacity:o,font:'600 22px "SF Mono",ui-monospace,Menlo,monospace',letterSpacing:'.16em',color:'#0A7D5C'}}>{String(n).padStart(2,'0')} · {title.toUpperCase()}</div>}

// ---- a scene: world state + camera + packets + overlays + narration, all functions of scene time ----
/** view: the system whose parts are labelled (like clicking it in the playground); selected: the part being talked about. */
export type WorldState={view?:ComponentId;stations?:boolean;selected?:ComponentId;exploded?:number;wifiFrom?:number;screen?:Chat};
export type SceneDef={extra?:number;id:string;n:number;title:string;shots:Shot[];world?:(t:number)=>WorldState;packets?:Packet[];captions?:Caption[];overlay?:(t:number)=>ReactNode;sfx?:{src:string;from:number;duration?:number;volume?:number}[]};
const noop=()=>{};
export function FilmScene({def}:{def:SceneDef}){
 const frame=useCurrentFrame();const {fps,width,height}=useVideoConfig();const t=frame/fps;const tl=timeline(def.id);
 const state=(at:number)=>({selected:'laptop' as ComponentId,exploded:0,wifiFrom:0,...def.world?.(at)});const w=state(t);
 // The talked-about part eases up to 1 over .45 s after it is first selected.
 let since=0;while(since<.45&&state(t-since-1/fps).selected===w.selected&&t-since>0)since+=1/fps;
 const emph=(id:ComponentId)=>w.view&&id===w.selected&&focus[w.view].parts.includes(id)?ease(Math.min(since/.45,1)):0;
 return <AbsoluteFill style={{background:'radial-gradient(120% 90% at 50% 0%,#fcf8f1 0%,#f3eadc 60%,#eadfcd 100%)'}}>
  <ThreeCanvas width={width} height={height} orthographic flat shadows="soft" camera={{position:[24,25,32],zoom:29,near:.1,far:250}} gl={{antialias:true,alpha:true}}>
   <FilmClock.Provider value={t}><FilmEmphasis.Provider value={emph}>
    <World environment={byId[w.selected].environment} selected={w.selected} view={w.view} partLabels={false} select={noop} exploded={w.exploded} running={false} step={-1} reset={0} layer="all" overview={!w.view&&!!w.stations} wifiFrom={w.wifiFrom} screen={w.screen?<ChatScreen state={w.screen}/>:undefined}/>
    {def.packets?.map((pk,i)=><PacketView key={i} pk={pk} t={t}/>)}
    <FilmCamera shots={def.shots} t={t}/>
   </FilmEmphasis.Provider></FilmClock.Provider>
  </ThreeCanvas>
  <div id="world-labels" className="world-labels" style={{display:'none'}}/>
  <PartLabelOverlay w={w} shot={sample(def.shots,t)} width={width} height={height}/>
  {def.overlay?.(t)}
  <Captions items={def.captions??[]} t={t}/>
  <Title n={def.n} title={def.title} t={t} duration={tl.duration+(def.extra??0)}/>
  {tl.names.map((n,i)=><Sequence key={n} from={Math.round(tl.starts[i]*fps)}><Audio src={staticFile(`narration/${n}.mp3`)}/></Sequence>)}
  {def.sfx?.map((s,i)=><Sequence key={i} from={Math.round(s.from*fps)} durationInFrames={s.duration?Math.round(s.duration*fps):undefined}><Audio src={staticFile(s.src)} volume={s.volume??.6}/></Sequence>)}
 </AbsoluteFill>;
}
