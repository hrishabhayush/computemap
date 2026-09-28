import {focus} from './exploration.ts';
import {nodes,edges,journey} from './graph.ts';
const ids=new Set(nodes.map(n=>n.id));
if(ids.size!==nodes.length) throw new Error('Duplicate node');
for(const e of edges) if(!ids.has(e.from)||!ids.has(e.to)) throw new Error('Broken graph edge');
for(const s of journey) if(!ids.has(s.node)||s.duration<=0) throw new Error('Broken journey');
if(journey[0].environment!=='laptop'||journey.at(-1)?.environment!=='laptop') throw new Error('Journey must return to device');
console.log(`Verified ${nodes.length} components, ${edges.length} physical relationships, ${journey.length} journey steps.`);

for(const node of nodes){const view=focus[node.id];if(!view||view.width<=0||!view.position.every(Number.isFinite))throw new Error('Missing focus target: '+node.id);let id:typeof node.id|undefined=node.id;const visited=new Set();while(id){if(visited.has(id))throw new Error('Navigation cycle');visited.add(id);id=focus[id].parent}for(const child of view.parts)if(!ids.has(child))throw new Error('Unknown child');}
console.log('Verified spatial targets and acyclic breadcrumb paths for all components.');
