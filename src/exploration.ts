import type {ComponentId} from './graph.ts';
export type Focus={position:[number,number,number];width:number;parent?:ComponentId;parts:ComponentId[]};
// Positions point into the existing world; navigation never replaces a scene.
export const focus:Record<ComponentId,Focus>={
laptop:{position:[-11,.6,0],width:11,parts:['display','keyboard','phone','network']},
display:{position:[-11.5,1.6,-1],width:5,parent:'laptop',parts:[]},
keyboard:{position:[-11.5,.3,.4],width:5,parent:'laptop',parts:[]},
phone:{position:[-14,.2,1.35],width:4,parent:'laptop',parts:[]},
network:{position:[-6,.7,4],width:16,parts:['radio','wifi','ont','fiber','isp','cellular']},
radio:{position:[-9.8,.8,-.2],width:6,parent:'network',parts:[]},
wifi:{position:[-8.35,.6,-.3],width:5,parent:'network',parts:[]},
ont:{position:[-7.5,.5,6],width:5,parent:'network',parts:[]},
fiber:{position:[-4.8,.4,6],width:6,parent:'network',parts:[]},
isp:{position:[-1.8,1,6],width:5,parent:'network',parts:[]},
cellular:{position:[-10.7,1.4,6.5],width:6,parent:'network',parts:[]},
datacenter:{position:[0,1,-1],width:14,parts:['rack','switch','storage-array','cdu','power','cooling']},
rack:{position:[-.328,2.1,.2],width:7.5,parent:'datacenter',parts:['tor','server','nvswitch','power-shelf','manifold']},
server:{position:[12,.7,0],width:12,parent:'rack',parts:['gpu','cpu','dram','nic','storage','psu','fans','motherboard']},
gpu:{position:[12.72,1.75,.765],width:4.5,parent:'server',parts:['die','cache','hbm','substrate','cold-plate']},
die:{position:[12.72,2.1,.765],width:2.4,parent:'gpu',parts:[]},
hbm:{position:[12.72,2.1,.765],width:3,parent:'gpu',parts:[]},
substrate:{position:[12.72,1.9,.765],width:3,parent:'gpu',parts:[]},
cpu:{position:[10.3,1,-1.665],width:4.5,parent:'server',parts:[]},
nic:{position:[13.08,1,-1.665],width:4.5,parent:'server',parts:[]},
storage:{position:[15.85,.9,.9],width:4,parent:'server',parts:[]},
psu:{position:[8.2,.9,.9],width:4,parent:'server',parts:[]},
fans:{position:[12,.5,1.845],width:7,parent:'server',parts:[]},
power:{position:[-4.5,1,-11],width:10,parts:['transformer','switchgear','ups','energy']},
transformer:{position:[-6.3,1,-11],width:4,parent:'power',parts:[]},
switchgear:{position:[-4.25,1,-11],width:4,parent:'power',parts:[]},
ups:{position:[-2.25,1,-11],width:4,parent:'power',parts:[]},
cooling:{position:[4.8,.8,-11],width:10,parts:['heat-exchanger','tank','pump']},
'heat-exchanger':{position:[3.8,1,-11],width:5,parent:'cooling',parts:[]},
tank:{position:[6.4,1,-11],width:4,parent:'cooling',parts:[]},
pump:{position:[7.5,.6,-11],width:4,parent:'cooling',parts:[]},
fab:{position:[13,.5,-10],width:8,parts:['wafer','package','materials']},
wafer:{position:[13,.2,-10],width:5,parent:'fab',parts:[]},
package:{position:[13,1,-8.25],width:3,parent:'fab',parts:[]},
materials:{position:[13,.4,-10],width:7,parent:'fab',parts:[]},
tor:{position:[-.328,2.706,.722],width:3,parent:'rack',parts:[]},
nvswitch:{position:[-.328,1.722,.722],width:3,parent:'rack',parts:[]},
'power-shelf':{position:[-.328,.656,.722],width:3,parent:'rack',parts:[]},
manifold:{position:[.164,1.64,.558],width:3.5,parent:'rack',parts:[]},
dram:{position:[10.4,.95,-1.665],width:4,parent:'server',parts:[]},
motherboard:{position:[14.9,.5,-1.2],width:8,parent:'server',parts:[]},
cache:{position:[12.72,2.15,.765],width:2.4,parent:'gpu',parts:[]},
'cold-plate':{position:[12.72,2.45,.765],width:3,parent:'gpu',parts:[]},
switch:{position:[-2.54,.8,1.2],width:7.5,parent:'datacenter',parts:['switch-asic','transceiver','retimer','cabling']},
'switch-asic':{position:[-2.542,1.066,1.747],width:3,parent:'switch',parts:[]},
transceiver:{position:[-1.23,.738,2.239],width:3,parent:'switch',parts:[]},
retimer:{position:[-3.69,.82,1.747],width:3,parent:'switch',parts:[]},
cabling:{position:[-.984,2.829,-1.041],width:7,parent:'switch',parts:[]},
'storage-array':{position:[1.066,.287,1.747],width:4,parent:'datacenter',parts:[]},
cdu:{position:[3.28,.656,.271],width:4,parent:'datacenter',parts:[]},
software:{position:[5,2.4,8],width:12,parts:['model','serving','cuda','kubernetes','os']},
os:{position:[5,1.1,8],width:5,parent:'software',parts:[]},
kubernetes:{position:[5,1.9,8],width:5,parent:'software',parts:[]},
cuda:{position:[5,2.7,8],width:5,parent:'software',parts:[]},
serving:{position:[5,3.5,8],width:5,parent:'software',parts:[]},
model:{position:[5,4.3,8],width:5,parent:'software',parts:[]},
energy:{position:[-13,1,-11],width:15,parent:'power',parts:['grid','nuclear','gas','solar','wind']},
grid:{position:[-7,1.3,-12.5],width:10,parent:'energy',parts:[]},
nuclear:{position:[-17.8,1.2,-13.5],width:5.5,parent:'energy',parts:[]},
gas:{position:[-12.2,.9,-13.5],width:5.5,parent:'energy',parts:[]},
solar:{position:[-17.8,.4,-8.5],width:5.5,parent:'energy',parts:[]},
wind:{position:[-12.2,1.4,-8.5],width:5.5,parent:'energy',parts:[]},
};
export function ancestry(id:ComponentId):ComponentId[]{const result:ComponentId[]=[];let current:ComponentId|undefined=id;while(current){result.unshift(current);current=focus[current].parent}return result}
export function inBranch(id:ComponentId,root:ComponentId){return ancestry(id).includes(root)}
// Station anchors. SPREAD pushes each station away from the origin by anchor*(SPREAD-1) without resizing it.
export const SPREAD=1.4;
type V=[number,number,number];
export const A={laptop:[-11,0,0],network:[-4.8,0,6],cellular:[-10.7,0,6.5],datacenter:[0,0,-1],server:[12,0,0],power:[-4.5,0,-11],cooling:[4.8,0,-11],fab:[13,0,-10],software:[5,0,8],energy:[-15,0,-11]} satisfies Record<string,V>;
// Shift a point with station a's offset. Pass az to take the z offset from a second station, which keeps bends in orthogonal connectors square.
export function at(a:V,p:V,az:V=a):V{const k=SPREAD-1;return [p[0]+a[0]*k,p[1],p[2]+az[2]*k]}
const station:Partial<Record<ComponentId,V>>={...A,radio:A.laptop,wifi:A.laptop};
export function spread(id:ComponentId,p:V=focus[id].position){return at(ancestry(id).reverse().map(a=>station[a]).find(Boolean)!,p)}
