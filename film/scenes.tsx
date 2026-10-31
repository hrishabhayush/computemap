import type {ReactNode} from 'react';
import {interpolate} from 'remotion';
import {ANSWER,PROMPT,scenes as script} from './script';
import {FPS,ISO,flow,mix,norm,pos,sample,timeline,typing,zf,type Packet,type SceneDef,type Shot,type V} from './kit';
import type {ComponentId} from '../src/graph';

// ---- places in the world (same coordinates the playground uses) ----
const SCREEN:V=[-15.9,1.18,-.95],SCREEN_OUT:V=[-15.9,1.2,-.55],ROUTER:V=[-12.75,.75,-.3],ONT:V=[-9.42,.5,8.4],ISP:V=[-3.72,.6,8.4];
const OV:V=[-3,0,-4.4],OVZ=29;
const FRONT=norm([.22,.32,1]),SIDE=norm([.5,.55,1]);
const COPPER:V[]=[[-12.75,.45,-.3],[-11.4,.45,-.3],[-11.4,.45,6.9],[-9.42,.45,6.9],ONT];
const FIBER:V[]=[ONT,[-6.72,.5,8.4],ISP];
const TO_DC:V[]=[ISP,[-3.72,.5,2.6],[-2.5,.5,2.6],[-2.5,.6,1.35]];
const DC_IN:V[]=[[-2.5,.6,1.35],[-2.54,.95,.85],[-.6,1.7,-.1]];
const TO_SERVER:V[]=[[2,.25,1.6],[2,.25,4.1],[11.8,.25,4.1],[11.8,.25,1],[12.8,.25,1],[16.8,.9,0]];
const LAPTOP_OUT:V[]=[SCREEN_OUT,[-14.3,1.9,-.4],ROUTER];
const GRID_FEED:V[]=[[-21.5,.3,-15.4],[-11.95,2.5,-15.4],[-8.1,1.9,-15.4]];
const TO_RACK:V[]=[[-6.3,.2,-12.9],[-6.3,.2,-6.4],[3.3,.2,-6.4],[3.3,.2,-3.4],[3.28,.2,-3.04],[2.13,.2,-3.04],[2.13,.2,.32],[-.33,.66,.32]];
const DC_COOL:V[]=[[3.28,.2,-.17],[2.38,.2,-.17],[2.38,.2,.73],[-3.28,.2,.73]];
const TO_PLANT:V[]=[[3.3,.2,.6],[7.92,.2,.6],[7.92,.2,-12.9],[6.72,.2,-12.9],[6.72,.6,-15.4]];
const rev=(p:V[])=>[...p].reverse() as V[];
const DATA='#0A9B6E',LIGHT='#7FE0B0',POWER='#E7A93B',COOL='#4FA3E0',HOT='#F29E8E';

const T=Object.fromEntries(script.map(s=>[s.id,timeline(s.id)]));
const n=(id:string)=>script.findIndex(s=>s.id===id)+1,title=(id:string)=>script.find(s=>s.id===id)!.title;
const chip=(text:ReactNode,key:string|number,o=1,sub?:ReactNode)=><div key={key} style={{opacity:o,transform:`translateY(${(1-o)*10}px)`,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}><div style={{background:'#fff',borderRadius:14,padding:'12px 18px',font:'600 30px -apple-system,"SF Pro Display",Arial,sans-serif',color:'#1F2B25',boxShadow:'0 2px 4px #0000000f,0 14px 30px -10px #2a241833',whiteSpace:'pre'}}>{text}</div>{sub}</div>;
const card=(children:ReactNode)=><div style={{position:'absolute',bottom:70,left:0,right:0,display:'flex',flexDirection:'column',alignItems:'center',gap:18}}>{children}</div>;
const on=(t:number,a:number,dur=.35)=>interpolate(t,[a,a+dur],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});

// ---------------------------------------------------------------- 1. The prompt
const s1=T.s01,typeAt=typing(PROMPT,s1.start(1)+.25,s1.at(1,'enter')-.15);
const scene1:SceneDef={id:'s01',n:1,title:'The prompt',
 shots:[{t:0,target:OV,zoom:OVZ,dist:60},{t:s1.at(0,'comes'),target:OV,zoom:34,dir:norm([19,25,35]),dist:60},{t:s1.start(1)+.2,target:SCREEN,zoom:370,dir:FRONT,dist:6},{t:s1.at(1,'enter'),target:SCREEN,zoom:395,dir:FRONT,dist:6},{t:s1.at(1,'router')+.5,target:mix(SCREEN,ROUTER,.5),zoom:215,dir:SIDE,dist:6}],
 world:t=>({selected:'laptop',wifiFrom:s1.at(1,'router'),screen:{t,typed:typeAt(t),sent:t>=s1.at(1,'enter'),thinking:true}}),
 packets:[{path:LAPTOP_OUT,from:s1.at(1,'sent'),to:s1.at(1,'router')+.2}],
 captions:[{from:s1.at(1,'wi-fi'),to:s1.duration,text:'Wi‑Fi router'}],
 sfx:[{src:'scene1/typing.mp3',from:s1.start(1)+.15,duration:s1.at(1,'enter')-s1.start(1)-.1,volume:.5},{src:'scene1/send.mp3',from:s1.at(1,'enter'),volume:.6}]};

// Labelled views: like clicking a system in the playground — every part labelled, the one being talked about grows.
type Cue=[number,ComponentId|undefined,ComponentId,boolean?];   // [time, view, selected, stations?]
const cue=(cs:Cue[],t:number)=>{const c=[...cs].reverse().find(c=>t>=c[0])??cs[0];return {view:c[1],selected:c[2],stations:c[3]}};
const look=(t:number,view:ComponentId,mul=1,extra:Partial<Shot>={}):Shot=>({t,target:pos(view),zoom:zf(view,mul),...extra});

// ---------------------------------------------------------------- 2. Radio
const s2=T.s02,NET:ComponentId='network';
const scene2:SceneDef={id:'s02',n:2,title:'Radio',
 shots:[{t:0,target:mix(SCREEN,ROUTER,.5),zoom:215,dir:SIDE,dist:6},{t:s2.at(0,'scrambles'),target:mix(SCREEN,ROUTER,.5),zoom:200,dir:SIDE,dist:7},look(s2.at(0,'radio')-.3,NET,1.15)],
 world:t=>({...cue([[0,undefined,'laptop'],[s2.at(0,'radio')-.6,NET,'radio'],[s2.at(0,'router',1),NET,'wifi'],[s2.at(0,'cable'),NET,'ont']],t),wifiFrom:-2,screen:{t,sent:true,thinking:true}}),
 packets:[0,.3,.6].map(d=>({path:LAPTOP_OUT,from:s2.at(0,'radio')+d,to:s2.at(0,'waves')+.6+d,size:.07}) as Packet).concat([{path:COPPER,from:s2.at(0,'sends',1),to:s2.duration-.3}]),
 captions:[{from:s2.at(0,'pieces')-.3,to:s2.at(0,'scrambles'),text:'Small pieces · packets'},{from:s2.at(0,'scrambles'),to:s2.at(0,'radio')-.6,text:'Encrypted'}]};

// ---------------------------------------------------------------- 3. Light in glass
const s3=T.s03;
const scene3:SceneDef={id:'s03',n:3,title:'Light in glass',
 shots:[look(0,NET,1.15),look(s3.at(0,'travel'),NET,1.25),look(s3.duration,NET,1.2)],
 world:t=>cue([[0,NET,'ont'],[s3.at(0,'travel'),NET,'fiber'],[s3.at(0,'routers'),NET,'isp']],t),
 packets:[{path:[COPPER.at(-2)!,ONT],from:0,to:s3.at(0,'connection')},{path:FIBER,from:s3.at(0,'light'),to:s3.at(0,'vacuum'),color:LIGHT,trail:true,size:.12},{path:TO_DC,from:s3.at(0,'send'),to:s3.duration-.2,color:LIGHT,trail:true,size:.12}],
 captions:[{from:s3.at(0,'two-thirds')-.3,to:s3.at(0,'routers')-.2,text:'~200,000 km per second',tone:LIGHT}]};

// ---------------------------------------------------------------- 4. Arrival
const s4=T.s04,DCV:ComponentId='datacenter';
const scene4:SceneDef={id:'s04',n:4,title:'Arrival',
 shots:[look(0,NET,1.2),{t:s4.at(0,'see'),target:OV,zoom:OVZ+3,dist:60},look(s4.at(0,'center'),DCV),look(s4.at(0,'heat'),DCV,1.05),look(s4.at(0,'receiver'),'switch'),look(s4.at(0,'switches'),DCV),look(s4.duration,DCV,1.05)],
 world:t=>cue([[0,NET,'isp'],[s4.at(0,'then'),undefined,DCV,true],[s4.at(0,'data'),DCV,DCV],[s4.at(0,'racks'),DCV,'rack'],[s4.at(0,'cooling'),DCV,'cdu'],[s4.at(0,'receiver')-.4,'switch','transceiver'],[s4.at(0,'network'),DCV,'switch'],[s4.at(0,'question'),DCV,'rack']],t),
 packets:[{path:TO_DC,from:0,to:s4.at(0,'see')-.5,color:LIGHT,trail:true,size:.12},{path:DC_IN,from:s4.at(0,'direct'),to:s4.at(0,'model')+.3}],
 captions:[{from:s4.at(0,'drawing'),to:s4.at(0,'at'),text:'Power in · heat out',tone:POWER}]};

// ---------------------------------------------------------------- 5. Into the rack
const s5=T.s05;
const scene5:SceneDef={id:'s05',n:5,title:'Into the rack',
 shots:[look(0,DCV,1.05),look(s5.at(0,'rack'),'rack'),look(s5.at(0,'inside',1)+.6,'server'),look(s5.duration,'server',1.05)],
 world:t=>({...cue([[0,DCV,'rack'],[s5.at(0,'rack')-.3,'rack','server'],[s5.at(0,'gpus')-.3,'server','gpu'],[s5.at(0,'cpu'),'server','cpu'],[s5.at(0,'memory'),'server','dram'],[s5.at(0,'network'),'server','nic']],t),exploded:interpolate(t,[s5.at(0,'gpus'),s5.at(0,'gpus')+1.4],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}),
 packets:[...flow(TO_SERVER,s5.at(0,'inside',1),s5.at(0,'gpus')+1,.5,1.6,DATA)]};

// ---------------------------------------------------------------- 6. Software takes over
const s6=T.s06,SW=pos('software');
const tokens=['How',' does',' a',' prompt',' travel',' through',' the',' AI',' phys','ical',' stack','?'],ids=[4438,1587,264,10137,5944,1555,279,15592,4950,950,5729,30];
const batch=['Write a haiku about rain','Summarise this email for me','Translate “good morning” to Spanish'];
const scene6:SceneDef={id:'s06',n:6,title:'Software takes over',
 shots:[{t:0,target:SW,zoom:zf('software',1.05)},{t:s6.at(0,'tokens'),target:[SW[0]+1.6,SW[1]-1.6,SW[2]-1.6],zoom:zf('software',.95)},{t:s6.duration,target:[SW[0]+1.6,SW[1]-1.6,SW[2]-1.6],zoom:zf('software',.98)}],
 world:t=>({...cue([[0,'software','serving'],[s6.at(0,'model'),'software','model'],[s6.at(0,'server'),'software','serving']],t),exploded:1}),
 overlay:t=>{if(t<s6.at(0,'breaks'))return null;const k0=s6.at(0,'breaks'),num=s6.at(0,'number'),grp=s6.at(0,'groups');
  return card(<><div style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',maxWidth:1500}}>{tokens.map((tk,i)=>chip(tk,i,on(t,k0+i*.14),<div style={{opacity:on(t,num+i*.08),font:'500 22px "SF Mono",Menlo,monospace',color:'#0A7D5C'}}>{ids[i]}</div>))}</div>
   {batch.map((b,i)=><div key={b} style={{opacity:on(t,grp+i*.35)*.85}}>{chip(b,b)}</div>)}</>)}};

// ---------------------------------------------------------------- 7. The GPU thinks
const s7=T.s07,DIE:V=[17.52,1.96,.765];
const answerWords=ANSWER.split(' ');
const hbmFlow=(x:number,z:number)=>flow([[17.52+x,1.94,.765+z],DIE],s7.at(0,'weights'),s7.duration,.45,.4,COOL,.035);
const scene7:SceneDef={id:'s07',n:7,title:'The GPU thinks',
 shots:[look(0,'server',1.05),look(s7.at(0,'processes')-.5,'gpu',1.75),look(s7.duration,'gpu',1.85)],
 world:t=>({...cue([[0,'server','gpu'],[s7.at(0,'processes')-.5,'gpu','die'],[s7.at(0,'stored'),'gpu','hbm'],[s7.at(0,'chip'),'gpu','die'],[s7.at(0,'waiting'),'gpu','hbm']],t),exploded:1}),
 packets:[...hbmFlow(-.25,-.18),...hbmFlow(.25,.18),...hbmFlow(-.25,.18),...hbmFlow(.25,-.18)],
 overlay:t=>{const t0=s7.at(0,'one');if(t<t0)return null;const shown=Math.min(answerWords.length,Math.floor((t-t0)/.42)+1);return card(<div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',maxWidth:1500}}>{answerWords.slice(0,shown).map((w,i)=>chip(w,i,on(t,t0+i*.42,.2)))}</div>)},
 captions:[{from:s7.at(0,'waiting'),to:s7.duration,text:'Often waiting on memory, not maths',tone:COOL}]};

// ---------------------------------------------------------------- 8. Power
const s8=T.s08;
const scene8:SceneDef={id:'s08',n:8,title:'Power',
 shots:[look(0,'gpu',1.85),look(s8.at(0,'grid')-.6,'energy',.9),look(s8.at(0,'electrical')-.6,'power'),look(s8.at(0,'reaches')+.2,'rack'),look(s8.at(0,'batteries')-.3,'power'),look(s8.at(0,'sources'),'energy'),look(s8.at(0,'twenty')-.2,'energy',1.02),{t:s8.at(0,'data')+.3,target:OV,zoom:OVZ,dist:60},{t:s8.duration,target:OV,zoom:OVZ+2,dist:60}],
 world:t=>({...cue([[0,'gpu','die'],[s8.at(0,'grid')-.6,'energy','grid'],[s8.at(0,'passes'),'power','transformer'],[s8.at(0,'equipment'),'power','switchgear'],[s8.at(0,'reaches'),'rack','power-shelf'],[s8.at(0,'batteries')-.3,'power','ups'],[s8.at(0,'generators'),'power','generator'],[s8.at(0,'beyond'),'energy','energy'],[s8.at(0,'gas'),'energy','gas'],[s8.at(0,'nuclear'),'energy','nuclear'],[s8.at(0,'wind'),'energy','wind'],[s8.at(0,'solar'),'energy','solar'],[s8.at(0,'data')+.3,undefined,DCV,true]],t),exploded:1}),
 packets:[...flow(GRID_FEED,0,s8.duration,.9,2.6,POWER),...flow(TO_RACK,0,s8.duration,.9,4.5,POWER)],
 captions:[{from:s8.at(0,'seventeen')-.3,to:s8.at(0,'ai')-.1,text:'+17% data-center electricity use in 2025',tone:POWER,big:true},{from:s8.at(0,'fifty')-.4,to:s8.duration,text:'+50% at AI-focused data centers',tone:POWER,big:true}]};

// ---------------------------------------------------------------- 9. Heat
const s9=T.s09;
const fans:V[]=[[4.82,1.3,-15.4],[6.62,1.3,-15.4]];
const scene9:SceneDef={id:'s09',n:9,title:'Heat',
 shots:[look(1.8,'gpu',1.75),look(s9.at(0,'cooling')-.2,DCV),look(s9.at(0,'outside')-.2,'cooling'),look(s9.duration,'cooling',1.08)],
 world:t=>({...cue([[0,'gpu','die'],[s9.at(0,'liquid'),'gpu','cold-plate'],[s9.at(0,'cooling')-.2,DCV,'cdu'],[s9.at(0,'outside')-.2,'cooling','heat-exchanger'],[s9.at(0,'released'),'cooling','heat-exchanger']],t),exploded:1}),
 packets:[...flow([[17.34,2.42,.77],[17.34,2.95,.77]],s9.at(0,'liquid'),s9.at(0,'away')+.4,.35,.7,HOT,.05),...flow([[17.7,2.95,.77],[17.7,2.42,.77]],s9.at(0,'liquid'),s9.at(0,'away')+.4,.35,.7,COOL,.05),
  ...flow(DC_COOL,s9.at(0,'away'),s9.duration,.6,2,HOT),...flow(TO_PLANT,s9.at(0,'system'),s9.duration,.6,3.2,HOT),
  ...fans.flatMap(f=>flow([f,[f[0],f[1]+2.2,f[2]]],s9.at(0,'outside'),s9.duration,.4,1.4,HOT,.08))],
 captions:[{from:s9.at(0,'heat')-.2,to:s9.at(0,'liquid'),text:'Almost every watt becomes heat',tone:HOT}]};

// ---------------------------------------------------------------- 10. Where chips come from
const s10=T.s10;
const scene10:SceneDef={id:'s10',n:10,title:'Where chips come from',
 shots:[look(1.8,'fab',1),look(s10.at(0,'layer'),'fab',1.1,{dir:norm([30,24,26])}),look(s10.duration,'fab',1.12,{dir:norm([34,24,20])})],
 world:t=>cue([[0,'fab','wafer'],[s10.at(0,'factories'),'fab','wafer'],[s10.at(0,'cut'),'fab','package']],t),
 captions:[{from:s10.at(0,'hundreds')-.2,to:s10.at(0,'finished'),text:'Hundreds of steps · layer by layer'}]};

// ---------------------------------------------------------------- 11. The answer returns
const s11=T.s11,answerAt=typing(ANSWER,s11.at(0,'your',2)-.1,s11.at(0,'device')+.4);
const back:V[]=[...rev(DC_IN),...rev(TO_DC),...rev(FIBER),...rev(COPPER),...rev(LAPTOP_OUT)];
const scene11:SceneDef={id:'s11',n:11,title:'The answer returns',
 shots:[look(1.6,DCV),look(s11.at(0,'along')-.3,NET,1.15),look(s11.at(0,'wi-fi'),NET,1.2),{t:s11.at(0,'laptop')+.4,target:SCREEN,zoom:370,dir:FRONT,dist:6},{t:s11.duration,target:SCREEN,zoom:390,dir:FRONT,dist:6}],
 world:t=>({...cue([[0,DCV,'rack'],[s11.at(0,'network'),DCV,'switch'],[s11.at(0,'along')-.3,NET,'fiber'],[s11.at(0,'wi-fi'),NET,'wifi'],[s11.at(0,'laptop'),undefined,'laptop']],t),screen:{t,sent:true,thinking:true,answer:answerAt(t)||undefined}}),
 packets:[{path:back,from:.4,to:s11.at(0,'laptop')+.2,trail:true},{path:back,from:1.0,to:s11.at(0,'laptop')+.6,trail:true,size:.08}]};

// ---------------------------------------------------------------- 12. Closing
const s12=T.s12,TITLE_AT=s12.at(0,'thats');
const all:V[]=[SCREEN_OUT,ROUTER,...COPPER,...FIBER.slice(1),...TO_DC.slice(1),...DC_IN.slice(1)];
const scene12:SceneDef={id:'s12',n:12,title:'Closing',extra:3,
 shots:[{t:0,target:SCREEN,zoom:370,dir:FRONT,dist:6},{t:s12.at(0,'carried'),target:OV,zoom:OVZ,dist:60},{t:s12.duration+3,target:OV,zoom:OVZ-3,dir:norm([20,25,35]),dist:60}],
 world:t=>({selected:'datacenter',stations:t>=s12.at(0,'carried'),screen:{t,sent:true,answer:ANSWER}}),
 packets:[...flow(all,s12.at(0,'carried'),s12.duration+3,.7,6,DATA),...flow(GRID_FEED,s12.at(0,'electricity'),s12.duration+3,.8,2.6,POWER),...flow(TO_RACK,s12.at(0,'electricity'),s12.duration+3,.8,4.5,POWER),...flow(TO_PLANT,s12.at(0,'water'),s12.duration+3,.7,3.2,COOL),...flow(LAPTOP_OUT,s12.at(0,'radio'),s12.duration+3,.6,1.2,COOL,.07)],
 captions:[]};

const ordered:SceneDef[]=[scene1,scene2,scene3,scene4,scene5,scene6,scene7,scene8,scene9,scene10,scene11,scene12];
// Smooth hand-offs: every scene opens on the exact camera the previous one ended on, then glides to its own first shot.
export const sceneDefs:SceneDef[]=ordered.map((d,i)=>{if(!i)return d;const p=ordered[i-1];const last=sample(p.shots,T[p.id].duration+(p.extra??0));
 const [first,...rest]=d.shots;const t1=Math.max(first.t,1.6);return {...d,shots:[{...last,t:0},{...first,t:t1},...rest.map((r,j)=>({...r,t:Math.max(r.t,t1+.8*(j+1))}))]}});
export const frames=(d:SceneDef)=>Math.ceil((T[d.id].duration+(d.extra??0))*FPS);
export {n,title};
