import React from 'react';
import timeline from '../../v10/timeline.json';
import {C,Label,Picture,SceneProps,clamp,mix} from './primitives';

/** Keep shared objects continuous across narration sentences. */
export function appliedClock(p:SceneProps,first:string,last:string){
 const activeUnits=(p.data?.timelineUnits??timeline.units) as {id:string;from:number;to:number;section:string}[];
 const activeSections=(p.data?.timelineSections??timeline.sections) as {id:string;from:number}[];
 const a=activeUnits.find(u=>u.id===first),b=activeUnits.find(u=>u.id===last),u=activeUnits.find(u=>u.id===p.data?.unitId);
 if(!a||!b||!u)return Number(p.data?.stageProgress??p.data?.progress??0);
 const s=activeSections.find(s=>s.id===u.section)!;
 return clamp((s.from+p.frame-a.from)/Math.max(1,b.to-a.from-15));
}
export const TokenBlock:React.FC<{x:number;y:number;word:string;width?:number;height?:number;color?:string;active?:number;sub?:string}>=({x,y,word,width=94,height=72,color=C.cyan,active=.5,sub})=><g transform={`translate(${x} ${y})`}>
 <path d={`M0 0l9-8h${width}v${height}l-9 8Z`} fill={color} fillOpacity={.06+.09*active}/>
 <rect width={width} height={height} rx={5} fill={C.ink} fillOpacity={.8} stroke={color} strokeOpacity={.22+.65*active} strokeWidth={1.5}/>
 <path d={`M8 ${height-6}H${width-8}`} stroke={color} strokeWidth={3} strokeOpacity={active}/>
 <Label x={width/2} y={height*.5+13} size={word.length>3?30:36} anchor="middle" color={active>.5?color:C.ivory}>{word}</Label>
 {sub&&<Label x={width/2} y={height+42} size={30} anchor="middle" color={C.muted}>{sub}</Label>}
 </g>;
/** A visible parameter tensor, not an unlabelled neural-network diagram. */
export const WeightTensor:React.FC<{x:number;y:number;w?:number;h?:number;t:number;color?:string;label?:string}>=({x,y,w=210,h=150,t,color=C.cyan,label})=><g transform={`translate(${x} ${y})`}>
 {[2,1,0].map(layer=><g key={layer} transform={`translate(${layer*9} ${-layer*8})`}>
 <rect width={w} height={h} rx={4} fill={C.ink} stroke={color} strokeOpacity={.25}/>
 {Array.from({length:24},(_,i)=>{const base=.5+.4*Math.sin(i*1.7+layer),v=mix(base,.5+.4*Math.sin(i*1.7+layer+.9),t);return <rect key={i} x={8+i%6*(w-12)/6} y={8+Math.floor(i/6)*(h-12)/4} width={(w-12)/6-5} height={(h-12)/4-5} rx={2} fill={v>.5?color:C.rose} fillOpacity={.12+Math.abs(v-.5)*1.2}/>;})}
 </g>)}{label&&<Label x={w/2+9} y={h+48} anchor="middle" size={32} color={color}>{label}</Label>}
 </g>;
export const PhotoPatch:React.FC<{src:string;x:number;y:number;w:number;h:number;col:number;row:number;cols?:number;rows?:number;color?:string;outline?:number}>=({src,x,y,w,h,col,row,cols=4,rows=4,color=C.cyan,outline=.35})=><g>
 <svg x={x} y={y} width={w} height={h} viewBox={`${col*120} ${row*80} 120 80`} preserveAspectRatio="none"><Picture src={src} x={0} y={0} w={120*cols} h={80*rows} cover position="right center"/></svg>
 <rect x={x} y={y} width={w} height={h} fill="none" stroke={color} strokeOpacity={outline} strokeWidth={1.5}/>
 </g>;
export const ProbabilityColumn:React.FC<{x:number;base:number;value:number;label:string;color?:string;width?:number;scale?:number;digits?:number;highlight?:number}>=({x,base,value,label,color=C.cyan,width=88,scale=300,digits=1,highlight=0})=>{
 const h=value*scale;
 return <g><path d={`M${x} ${base-h}l12-9h${width}v${h}l-12 9Z`} fill={color} fillOpacity={.15}/><rect x={x} y={base-h} width={width} height={Math.max(1,h)} fill={color} fillOpacity={.38+.35*highlight}/><path d={`M${x} ${base-h}h${width}`} stroke={color} strokeWidth={3}/><Label x={x+width/2} y={base-h-20} anchor="middle" size={31} color={color}>{(value*100).toFixed(digits)}%</Label><Label x={x+width/2} y={base+48} anchor="middle" size={35}>{label}</Label></g>;
};
export const MechanismNote:React.FC<{x?:number;y?:number;children?:React.ReactNode}>=()=>null;
