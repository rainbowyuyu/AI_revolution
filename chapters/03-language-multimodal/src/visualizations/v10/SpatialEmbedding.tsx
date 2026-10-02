import React from 'react';
import {C,Label,Arrow,SceneProps,progress,segment,mix,palette,clamp} from './primitives';
import {Trace,StageRule,XY} from './CoreGeometry';
type V=[number,number,number];
const e=[.34,.72,-.17,.84,.48,-.63];
const points:{s:string;v:V;color:string}[]=[
 {s:'红伞',v:[-180,100,85],color:C.gold},{s:'雨伞',v:[-225,65,-70],color:C.gold},{s:'雨衣',v:[-250,-40,65],color:C.gold},
 {s:'门边',v:[174,60,92],color:C.cyan},{s:'窗边',v:[235,-35,-40],color:C.cyan},{s:'苹果',v:[10,-125,160],color:palette[2]}];
function project(v:V,yaw:number,flatten=0):[number,number,number]{
 const z=v[2]*(1-flatten),rx=v[0]*Math.cos(yaw)+z*Math.sin(yaw),rz=-v[0]*Math.sin(yaw)+z*Math.cos(yaw),scale=1.36*980/(980+rz);
 return [667+rx*scale,337-v[1]*scale+rz*.22*scale,rz];
}
const path=(p:number[][])=>p.map((v,i)=>`${i?'L':'M'}${v[0]},${v[1]}`).join(' ');

export const SpatialSemantic:React.FC<SceneProps>=p=>{
 const u=progress(p),flat=segment(u,.48,.96),yaw=mix(-.38,.27,segment(u,.06,.74)),reveal=segment(u,.05,.44),projecting=p.focus==='向量维度'||p.focus==='投影的局限',amount=projecting?flat:0;
 const origin=project([0,0,0],yaw),plane=([[-320,-150,0],[320,-150,0],[320,170,0],[-320,170,0]] as V[]).map(v=>project(v,yaw));
 const ordered=points.map((item,i)=>({...item,index:i,xy:project(item.v,yaw,amount),original:project(item.v,yaw)})).sort((a,b)=>b.xy[2]-a.xy[2]);
 return <g><Label x={66} y={63} size={37} color={C.gold}>{projecting?'换个视角，看看投影会丢掉什么':'一个词元，落成一个向量'}</Label>
  <path d={path(plane)+'Z'} fill={C.cyan} fillOpacity={.015+.035*amount} stroke={C.cyan} strokeOpacity={.11+.3*amount}/>
  {[-280,-140,0,140,280].map(x=><path key={x} d={path([project([x,-150,0],yaw),project([x,170,0],yaw)])} stroke={C.line} opacity={.18}/>)}
  {[-100,0,100].map(y=><path key={y} d={path([project([-320,y,0],yaw),project([320,y,0],yaw)])} stroke={C.line} opacity={.18}/>)}
  {([[315,0,0],[0,175,0],[0,0,-170]] as V[]).map((v,i)=><Arrow key={i} a={[origin[0],origin[1]]} b={project(v,yaw).slice(0,2) as XY} color={C.line} width={1.5} opacity={.6}/>)}
  {ordered.map(({s,v,color,index,xy,original})=>{const a=segment(reveal,index*.045,.65+index*.045),target:XY=[mix(origin[0],xy[0],a),mix(origin[1],xy[1],a)],offsets=[[0,-31],[-28,24],[-28,25],[14,-29],[20,24],[0,20]];return <g key={s}>
   {projecting&&<path d={`M${original[0]} ${original[1]}L${xy[0]} ${xy[1]}`} stroke={color} strokeOpacity={amount*.55} strokeDasharray="5 7"/>}
   {(index===0||index===3||index===5)&&<Arrow a={[origin[0],origin[1]]} b={target} color={color} width={index===0?3.5:1.8} opacity={index===0?.85:.36}/>}
   <ellipse cx={target[0]} cy={target[1]+12} rx={15} ry={5} fill={color} fillOpacity={.09}/><circle cx={target[0]} cy={target[1]} r={index===0?10:6} fill={color}/>
   <Label x={target[0]+offsets[index][0]} y={target[1]+offsets[index][1]} anchor="middle" size={30} color={color} opacity={a}>{s}</Label>
  </g>})}
  <g transform="translate(388 570)">{e.map((v,i)=><g key={i}><rect x={i*90} y={0} width={82} height={41} fill={v<0?C.rose:C.gold} fillOpacity={.1}/><Label x={i*90+41} y={29} anchor="middle" size={27} color={v<0?C.rose:C.gold}>{v.toFixed(2)}</Label></g>)}</g>
  <Label x={80} y={603} size={30} color={C.muted}>原向量</Label><Label x={1209} y={603} size={27} color={C.muted} anchor="end">投影后</Label><StageRule t={u} y={620}/>
 </g>;
};

const Apple=({x,y,scale=1,color=C.gold}:{x:number;y:number;scale?:number;color?:string})=><g transform={`translate(${x} ${y}) scale(${scale})`}><path d="M0-23C-27-44-49-7-25 24Q-13 41 0 30Q19 41 31 20C50-15 21-46 0-23Z" fill={color} fillOpacity={.5} stroke={color} strokeWidth={2}/><path d="M0-22Q-2-43 11-48" stroke={color} fill="none" strokeWidth={3}/><path d="M8-39Q26-56 34-42Q22-30 8-39" fill={C.cyan} fillOpacity={.65}/></g>;

export const SpatialContext:React.FC<SceneProps>=p=>{
 const u=progress(p),fork=segment(u,.15,.88),feature=segment(u,.05,.68),left:XY=[mix(650,322,fork),mix(376,289,fork)],right:XY=[mix(650,975,fork),mix(376,287,fork)],start:XY=[650,404];
 const cols=[C.gold,C.cyan],ends=[left,right];
 return <g><Label x={62} y={63} size={37} color={C.gold}>同一个“苹果”，读完两种语境</Label>
  <Label x={307} y={130} anchor="middle" size={32} color={C.gold}>苹果落在果盘里</Label><Label x={994} y={130} anchor="middle" size={32} color={C.cyan}>苹果发布了手机</Label>
  <g opacity={feature}><ellipse cx={305} cy={348} rx={137} ry={29} fill={C.gold} fillOpacity={.05}/><path d="M178 303Q305 380 432 303Q404 357 305 367Q206 357 178 303Z" fill={C.gold} fillOpacity={.16} stroke={C.gold} strokeWidth={2}/><Apple x={280} y={258} scale={.72}/><Apple x={346} y={280} scale={.61}/>
  <g transform={`translate(940 191) rotate(${mix(-9,-3,fork)} 44 86)`}><rect width={88} height={170} rx={16} fill={C.cyan} fillOpacity={.05} stroke={C.cyan} strokeWidth={3}/><rect x={10} y={21} width={68} height={128} rx={5} fill={C.cyan} fillOpacity={.16}/><path d="M31 12h26M30 158h28" stroke={C.cyan} strokeWidth={3}/></g></g>
  <path d="M325 394Q650 438 975 394" fill="none" stroke={C.line} opacity={.25}/>
  {ends.map((end,i)=><g key={i}><Trace a={start} b={end} bend={-94} t={fork} color={cols[i]} width={3}/><circle cx={end[0]} cy={end[1]} r={13} fill={cols[i]}/>
   {e.slice(0,4).map((v,j)=>{const length=mix(v,v+(i?-.19:.22)*(j%2?1:-1),fork),x=end[0]-54+j*34,y=end[1]+49;return <g key={j}><path d={`M${x} ${y}v75`} stroke={C.line} strokeOpacity={.22}/><path d={`M${x} ${y+37}v${-length*40}`} stroke={length<0?C.rose:cols[i]} strokeWidth={17} strokeOpacity={.6}/></g>})}</g>)}
  <circle cx={650} cy={404} r={8} fill={C.ivory}/><Label x={650} y={512} anchor="middle" size={31}>入口的表示相同</Label>
  {e.map((v,i)=><g key={i}><rect x={397+i*86} y={545} width={77} height={45} fill={v<0?C.rose:C.gold} fillOpacity={.1}/><Label x={436+i*86} y={576} anchor="middle" size={27}>{v.toFixed(2)}</Label></g>)}
  <StageRule t={u} y={620}/>
 </g>;
};
