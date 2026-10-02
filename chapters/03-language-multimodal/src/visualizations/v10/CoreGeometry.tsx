import React from 'react';
import {C,Label,Arrow,mix,segment} from './primitives';
export type V3=[number,number,number];
export type XY=[number,number];
/** Orthographic orbit shared by geometry and labels. */
export function orbit(v:V3,angle:number,origin:XY=[650,345],scale=1):XY {
 const x=v[0]*Math.cos(angle)+v[2]*Math.sin(angle),z=-v[0]*Math.sin(angle)+v[2]*Math.cos(angle);
 return [origin[0]+x*scale,origin[1]+(v[1]+z*.34)*scale];
}
export function Space({angle,origin=[650,345],scale=1,extent=270}:{angle:number;origin?:XY;scale?:number;extent?:number}) {
 const p=(v:V3)=>orbit(v,angle,origin,scale);
 return <g>{Array.from({length:9},(_,i)=>{const a=(i-4)*extent/4;return <g key={i}><path d={`M${p([-extent,0,a])}L${p([extent,0,a])}`} stroke={C.line} opacity={i===4?.4:.18}/><path d={`M${p([a,0,-extent])}L${p([a,0,extent])}`} stroke={C.line} opacity={i===4?.4:.18}/></g>})}{([[extent+40,0,0],[0,-220,0],[0,0,extent+40]] as V3[]).map((v,i)=><Arrow key={i} a={origin} b={p(v)} color={C.line} width={1.6}/>)}<circle cx={origin[0]} cy={origin[1]} r={4} fill={C.muted}/></g>;
}
export function Facet({x,y,w,h,color=C.cyan,depth=15,children}:{x:number;y:number;w:number;h:number;color?:string;depth?:number;children?:React.ReactNode}) {
 return <g><path d={`M${x} ${y}l${depth} ${-depth*.6}h${w}l${-depth} ${depth*.6}Z`} fill={color} fillOpacity={.2}/><path d={`M${x+w} ${y}l${depth} ${-depth*.6}v${h}l${-depth} ${depth*.6}Z`} fill={color} fillOpacity={.1}/><rect x={x} y={y} width={w} height={h} fill={C.ink} fillOpacity={.8} stroke={color} strokeOpacity={.65}/>{children}</g>;
}
export function Trace({a,b,bend=0,t,color=C.cyan,width=2}:{a:XY;b:XY;bend?:number;t:number;color?:string;width?:number}) {
 const c:XY=[(a[0]+b[0])/2,(a[1]+b[1])/2+bend],q:XY=[(1-t)**2*a[0]+2*(1-t)*t*c[0]+t*t*b[0],(1-t)**2*a[1]+2*(1-t)*t*c[1]+t*t*b[1]];
 return <g><path d={`M${a}Q${c} ${b}`} fill="none" stroke={color} strokeWidth={width} strokeOpacity={.22}/><path d={`M${a}Q${c} ${b}`} fill="none" stroke={color} strokeWidth={width} pathLength={1} strokeDasharray={`${t} 1`} opacity={.7}/><circle cx={q[0]} cy={q[1]} r={7} fill={color} opacity={.8}/></g>;
}
export function FeatureBars({x,y,values,color=C.cyan,w=128,h=240,labels=true}:{x:number;y:number;values:number[];color?:string;w?:number;h?:number;labels?:boolean}) {
 const row=h/values.length,max=Math.max(1,...values.map(Math.abs));
 return <g><path d={`M${x-7} ${y}h-10v${h}h10M${x+w+7} ${y}h10v${h}h-10`} stroke={color} fill="none" strokeWidth={2}/>{values.map((v,i)=><g key={i}><path d={`M${x+w/2} ${y+i*row+3}v${row-6}`} stroke={C.line} opacity={.3}/><rect x={v>=0?x+w/2:x+w/2+v/max*w*.43} y={y+i*row+7} width={Math.abs(v)/max*w*.43} height={row-14} fill={v>=0?color:C.rose} fillOpacity={.43}/>{labels&&<Label x={x+w/2} y={y+(i+.5)*row+10} size={Math.min(29,row*.55)} anchor="middle">{v.toFixed(2)}</Label>}</g>)}</g>;
}
export function StageRule({t,label,left=70,right=1230,y=609}:{t:number;label?:string;left?:number;right?:number;y?:number}) {
 // The former full-width rule read as a player progress bar in the rendered
 // film.  Stage progress remains available to the mechanisms through `t`, but
 // the visual indicator is intentionally omitted so each scene can end on its
 // own composition.  Keep the optional label API for future, local annotations.
 return label ? <Label x={left} y={y-16} size={25} color={C.muted}>{label}</Label> : null;
}
