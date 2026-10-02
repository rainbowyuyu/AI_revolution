import React from 'react';
import {Img,staticFile} from 'remotion';

export const C={ink:'#06121b',ivory:'#f5f0e8',gold:'#d9bb8e',cyan:'#91cdd1',muted:'#839aa4',rose:'#bd8586',line:'#456472'};
export type P=[number,number];
export type Curve=[P,P,P,P];
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const ease=(v:number)=>{const x=clamp(v);return x*x*(3-2*x);};
export const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export const softmax=(v:number[],temperature=1)=>{const z=v.map(x=>Math.exp((x-Math.max(...v))/Math.max(.01,temperature)));const sum=z.reduce((a,b)=>a+b,0);return z.map(x=>x/sum);};
export const normalize=(v:number[])=>{const sum=v.reduce((a,b)=>a+b,0);return v.map(x=>x/sum);};
export const bezier=(q:Curve,t:number):P=>{const a=1-clamp(t),b=1-a;return [a*a*a*q[0][0]+3*a*a*b*q[1][0]+3*a*b*b*q[2][0]+b*b*b*q[3][0],a*a*a*q[0][1]+3*a*a*b*q[1][1]+3*a*b*b*q[2][1]+b*b*b*q[3][1]];};
export const path=(q:Curve)=>`M${q[0].join(' ')}C${q.slice(1).map(v=>v.join(' ')).join(' ')}`;
export const periodic=(f:number,period=360,offset=0)=>((f+offset)%period+period)%period/period;
export const hash=(i:number)=>{const q=Math.sin(i*91.171+18.33)*41831.1;return q-Math.floor(q);};
export const tween=(f:number,values:number[],period=600)=>{const t=f/period,i=Math.floor(t)%values.length,j=(i+1)%values.length;return mix(values[i],values[j],ease(t%1));};
export const TextYScaleContext=React.createContext(1);
export const Label:React.FC<{x:number;y:number;children:React.ReactNode;size?:number;color?:string;anchor?:'start'|'middle'|'end';weight?:number;opacity?:number}>=({x,y,children,size=34,color=C.ivory,anchor='start',weight=500,opacity=1})=><text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight={weight} opacity={opacity} fontFamily="NotoSansSC,'Noto Sans SC',sans-serif">{children}</text>;
// The film owns titles and sources. Mechanisms only carry short object labels.
export const Caption:React.FC<{children:React.ReactNode;sub?:string}>=()=>null;
export function Picture({src,x,y,w,h,cover=false,position='center'}:{src:string;x:number;y:number;w:number;h:number;cover?:boolean;position?:string}){const sy=React.useContext(TextYScaleContext);return <g transform={`translate(${x} ${y}) scale(1 ${sy})`}><foreignObject width={w} height={h/sy}><Img src={staticFile(src)} style={{display:'block',width:w,height:h/sy,objectFit:cover?'cover':'contain',objectPosition:position}}/></foreignObject></g>;}
export function Flow({q,frame,offset=0,color=C.cyan,width=2,opacity=.45,period=260}:{q:Curve;frame:number;offset?:number;color?:string;width?:number;opacity?:number;period?:number}){
 const p=periodic(frame,period,offset),pos=bezier(q,p),alpha=ease(p/.09)*ease((1-p)/.09);
 return <g><path d={path(q)} fill="none" stroke={color} strokeWidth={width} strokeOpacity={opacity}/><g opacity={alpha}><circle cx={pos[0]} cy={pos[1]} r={9} fill={color} opacity={.13}/><circle cx={pos[0]} cy={pos[1]} r={3.5} fill={color}/></g></g>;
}
export function Ribbon({x,y,values,w=110,h=170,color=C.cyan,active=-1}:{x:number;y:number;values:number[];w?:number;h?:number;color?:string;active?:number}){
 return <g>{values.map((v,i)=><g key={i}><rect x={x} y={y+i*h/values.length} width={w} height={h/values.length-3} rx={3} fill={color} opacity={.1+Math.abs(v)*.68}/>{active===i&&<rect x={x-4} y={y+i*h/values.length-3} width={w+8} height={h/values.length+3} rx={4} stroke={C.gold} fill="none" strokeWidth={2}/>}</g>)}</g>;
}
export function Bar({x,y,w=340,value,label,color=C.cyan,percent=true}:{x:number;y:number;w?:number;value:number;label:string;color?:string;percent?:boolean}){
 return <g><Label x={x} y={y-14} size={27}>{label}</Label><rect x={x} y={y} width={w} height={19} rx={9} fill={C.line} fillOpacity={.24}/><rect x={x} y={y} width={Math.max(0,w*clamp(value))} height={19} rx={9} fill={color}/>{percent&&<Label x={x+w+16} y={y+17} size={25} color={color}>{(value*100).toFixed(1)}%</Label>}</g>;
}
export function Grid({x,y,size=260,n=8,frame=0,highlight=-1,mask=false}:{x:number;y:number;size?:number;n?:number;frame?:number;highlight?:number;mask?:boolean}){
 return <g>{Array.from({length:n*n},(_,i)=>{const r=Math.floor(i/n),c=i%n,on=highlight<0||r===highlight;const v=mask&&c>r?0:.1+.75*hash(i+31);return <rect key={i} x={x+c*size/n} y={y+r*size/n} width={size/n-4} height={size/n-4} rx={3} fill={mask&&c>r?C.ink:on?C.gold:C.cyan} opacity={v*(on?1:.4)}/>;})}</g>;
}
export function SceneArt({x,y,w=280,h=200,variant=0,frame=0}:{x:number;y:number;w?:number;h?:number;variant?:number;frame?:number}){
 // Original vector scenes give retrieval a concrete object, relation, and colour.
 const sky=['#173a49','#283a4b','#1a3c40'][variant%3],umbrella=variant===1?'#577d99':'#bd786e';
 return <g transform={`translate(${x} ${y})`}><rect width={w} height={h} rx={9} fill={sky}/><path d={`M0 ${h*.74}Q${w*.45} ${h*.71} ${w} ${h*.76}V${h}H0Z`} fill="#13292d"/>
 {variant===2?<><ellipse cx={w*.52} cy={h*.64} rx={w*.25} ry={h*.13} fill="#88b1b4" opacity={.3}/><path d={`M${w*.28} ${h*.56}Q${w*.5} ${h*.87} ${w*.74} ${h*.56}Z`} fill={C.gold}/><path d={`M${w*.5} ${h*.19}V${h*.62}M${w*.5} ${h*.22}L${w*.7} ${h*.51}H${w*.5}`} stroke={C.ivory} strokeWidth={2} fill="none"/></>:<>
 <rect x={w*.57} y={h*.1} width={w*.3} height={h*.67} fill="#44637b"/><rect x={w*.61} y={h*.16} width={w*.22} height={h*.61} fill="#23485c"/><circle cx={w*.8} cy={h*.46} r={2.5} fill={C.gold}/>
 <g transform={`translate(${w*(variant===3?.79:.37)} ${h*.57}) rotate(${variant===3?-17:12})`}><path d={`M${-w*.2} 0A${w*.2} ${h*.28} 0 0 1 ${w*.2} 0Q${w*.1} ${-h*.055} 0 0Q${-w*.1} ${-h*.055} ${-w*.2} 0`} fill={umbrella}/><path d={`M0 ${-h*.28}V${h*.27}Q${w*.065} ${h*.39} ${w*.1} ${h*.25}`} fill="none" stroke={C.gold} strokeWidth={2.8}/></g>
 {Array.from({length:12},(_,i)=>{const rain=periodic(frame,190,i*17);return <path key={i} d={`M${hash(i)*w} ${rain*h}l-3 12`} stroke={C.cyan} strokeWidth={1} opacity={.2}/>;})}</>}
 </g>;
}
export type SceneProps={frame:number;durationInFrames:number;phase?:string;phaseFrame?:number;focus?:string;cue?:string;data?:Record<string,unknown>};
export const hint=(p:SceneProps)=>`${p.phase||''} ${p.focus||''} ${p.cue||''}`;

export const progress=(p:SceneProps)=>clamp(Number(p.data?.stageProgress??p.data?.progress??(p.phaseFrame||0)/360));
// Text and annotation motion follows the current composition stage.  The
// previous per-sentence clock restarted at every caption boundary, making
// labels visibly blink or snap even while the same diagram was continuing.
// `timedProps` supplies stageProgress for each stable layout; it resets only
// when the visual composition actually changes.
export const spoken=(p:SceneProps)=>clamp(Number(p.data?.stageProgress??p.data?.progress??(p.phaseFrame||0)/360));
export const segment=(p:number,a=0,b=1)=>ease((p-a)/Math.max(.001,b-a));
export const lerpArray=(a:number[],b:number[],t:number)=>b.map((v,i)=>mix(a[i]??0,v,t));
export const palette=[C.gold,C.cyan,'#cc98b7','#abc296'];

/** A single drawn route and its moving packet share the exact same geometry. */
export function Transfer({points,t,color=C.cyan,weight=2,fade=false}:{points:Curve;t:number;color?:string;weight?:number;fade?:boolean}){
 const q=bezier(points,clamp(t)),a=fade?segment(t,0,.06)*(1-segment(t,.94,1)):1;
 return <g><path d={path(points)} fill="none" stroke={color} strokeWidth={weight} strokeOpacity={.3}/><path d={path(points)} fill="none" stroke={color} strokeWidth={weight+1} pathLength={1} strokeDasharray={`${clamp(t)} 1`} strokeOpacity={.5}/><circle cx={q[0]} cy={q[1]} r={6} fill={color} opacity={a}/></g>;
}
export function Arrow({a,b,color=C.cyan,width=3,opacity=1}:{a:P;b:P;color?:string;width?:number;opacity?:number}){
 const dx=b[0]-a[0],dy=b[1]-a[1],ang=Math.atan2(dy,dx),r=12;
 return <g opacity={opacity}><path d={`M${a}L${b}`} stroke={color} strokeWidth={width} fill="none"/><path d={`M${b[0]-r*Math.cos(ang-.43)} ${b[1]-r*Math.sin(ang-.43)}L${b}L${b[0]-r*Math.cos(ang+.43)} ${b[1]-r*Math.sin(ang+.43)}`} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round"/></g>;
}
export function Vector({x,y,values,color=C.cyan,w=95,h=220,label,showValues=true,opacity=1}:{x:number;y:number;values:number[];color?:string;w?:number;h?:number;label?:string;showValues?:boolean;opacity?:number}){
 const row=h/values.length;
 return <g opacity={opacity}>{label&&<Label x={x+w/2} y={y-22} anchor="middle" size={34} color={color}>{label}</Label>}<path d={`M${x+7} ${y}h-10v${h}h10M${x+w-7} ${y}h10v${h}h-10`} fill="none" stroke={color} strokeWidth={2.5}/>{values.map((v,i)=><g key={i}><rect x={x+7} y={y+i*row+3} width={w-14} height={row-6} rx={2} fill={v<0?C.rose:color} fillOpacity={.09+Math.min(1,Math.abs(v)/2)*.24}/>{showValues?<Label x={x+w/2} y={y+(i+.5)*row+12} size={Math.min(36,Math.max(28,row*.62))} anchor="middle">{Math.abs(v)<.0005?'0':Number(v.toFixed(2))}</Label>:<rect x={x+16} y={y+(i+.35)*row} height={row*.3} width={(w-32)*Math.min(1,Math.abs(v)/2+.12)} fill={color} fillOpacity={.65}/>}</g>)}</g>;
}
export function Matrix({x,y,values,cell=70,color=C.cyan,activeRow=-1,activeCol=-1,masked=false,maskProgress=1,display=true}:{x:number;y:number;values:number[][];cell?:number;color?:string;activeRow?:number;activeCol?:number;masked?:boolean;maskProgress?:number;display?:boolean}){
 return <g>{values.flatMap((r,i)=>r.map((v,j)=>{const off=masked&&j>i,on=(activeRow<0||i===activeRow)&&(activeCol<0||j===activeCol);return <g key={`${i}-${j}`}><rect x={x+j*cell+3} y={y+i*cell+3} width={cell-6} height={cell-6} rx={3} fill={off?C.ink:color} fillOpacity={off?.85:.05+(on?.44:.18)*Math.min(1,Math.abs(v)/2+.25)} stroke={on?color:C.line} strokeOpacity={on?.55:.18}/>{display&&<Label x={x+(j+.5)*cell} y={y+(i+.5)*cell+11} anchor="middle" size={Math.min(30,cell*.38)} color={off?C.muted:C.ivory}>{off&&maskProgress>.5?'−∞':Number(v.toFixed(2))}</Label>}{off&&<path d={`M${x+j*cell+10} ${y+i*cell+10}l${(cell-20)*maskProgress} ${(cell-20)*maskProgress}`} stroke={C.rose} strokeOpacity={.55} strokeWidth={3}/>}</g>;}))}</g>;
}
export function Axis({x,y,w,h,labels=false}:{x:number;y:number;w:number;h:number;labels?:boolean}){return <g><path d={`M${x} ${y-h}V${y}H${x+w}`} stroke={C.line} strokeWidth={2} fill="none"/>{labels&&<><Label x={x+w} y={y+38} size={26} anchor="end">特征 1</Label><Label x={x+12} y={y-h+20} size={26}>特征 2</Label></>}</g>;}
export function NumericBars({x,y,values,labels,w=400,gap=96,max=1,color=C.gold,digits=1}:{x:number;y:number;values:number[];labels:string[];w?:number;gap?:number;max?:number;color?:string;digits?:number}){
 return <g>{values.map((v,i)=><g key={i}><Label x={x} y={y+i*gap} size={33}>{labels[i]}</Label><rect x={x} y={y+i*gap+19} width={w} height={23} rx={3} fill={C.line} fillOpacity={.2}/><rect x={x} y={y+i*gap+19} width={Math.max(0,w*v/max)} height={23} rx={3} fill={i?C.cyan:color}/><Label x={x+w+24} y={y+i*gap+40} size={30} color={i?C.cyan:color}>{max===1?(v*100).toFixed(digits)+'%':v.toFixed(digits)}</Label></g>)}</g>;
}
