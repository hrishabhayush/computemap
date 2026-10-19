import {Component,useEffect,useState} from 'react';
import type {ReactNode} from 'react';
import {ArrowLeft,Expand,Layers,RotateCcw} from 'lucide-react';
import Scene from './Scene';
import {byId,type ComponentId} from './graph';
import {focus,inBranch} from './exploration';
class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?<div className="webgl-error">3D rendering is unavailable. Enable WebGL and reload to explore.</div>:this.props.children}}
// Just the world and its labels; small icon buttons are the only chrome.
export default function App(){
const [selected,setSelected]=useState<ComponentId>('laptop');const [overview,setOverview]=useState(true);const [exploded,setExploded]=useState(false);const [reset,setReset]=useState(0);
const select=(id:ComponentId)=>{setSelected(id);setOverview(false);setReset(r=>r+1);if(inBranch(id,'server'))setExploded(true)};
const showAll=()=>{setOverview(true);setReset(r=>r+1)};
const back=()=>{const parent=focus[selected].parent;parent?select(parent):showAll()};
useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!overview)back()};addEventListener('keydown',onKey);return()=>removeEventListener('keydown',onKey)});
return <main className="map-only" aria-label="Interactive 3D map of AI infrastructure"><div id="world-labels" className="world-labels"/><div className="scene-container"><SceneBoundary><Scene environment={byId[selected].environment} selected={selected} select={select} exploded={exploded} running={false} step={-1} reset={reset} layer="all" overview={overview}/></SceneBoundary></div>
<nav className="map-tools">{!overview&&<button title="Back (Esc)" aria-label="Back" onClick={back}><ArrowLeft size={17}/></button>}<button title="Show all" aria-label="Show all" onClick={showAll}><Layers size={17}/></button><button title="Reset view" aria-label="Reset view" onClick={()=>setReset(r=>r+1)}><RotateCcw size={17}/></button>{inBranch(selected,'server')&&!overview&&<button className={exploded?'tool-active':''} title={exploded?'Collapse components':'Explode components'} aria-label="Explode components" onClick={()=>setExploded(v=>!v)}><Expand size={17}/></button>}</nav></main>}
