import React from 'react';
import {C,Label,Arrow,SceneProps,progress,segment,mix,palette,softmax,clamp} from './primitives';
import {Trace,StageRule,XY} from './CoreGeometry';
const initial=[[.34,.72,-.17,.84],[-.11,.62,.78,-.3],[.66,-.26,.34,.53],[.18,.74,-.32,.61]];
const attention=(vectors:number[][],head=0)=>vectors.map((x,i)=>{const scores=vectors.map((y,j)=>x.reduce((a,v,k)=>a+v*y[(k+head)%4]*(head?1.3:.7),0)+(i===j?.2:0)),w=softmax(scores);return x.map((_,k)=>vectors.reduce((a,y,j)=>a+w[j]*y[(k+head)%4],0));});
const vAdd=(a:number[][],b:number[][])=>a.map((v,i)=>v.map((x,j)=>x+b[i][j]*.32));
const processed=(a:number[][])=>a.map(v=>v.map((x,j)=>x+.12*Math.tanh(x*.8+v[(j+1)%4]*.6)));
const layers=[initial];for(let k=0;k<3;k++)layers.push(processed(vAdd(layers[k],attention(layers[k]))));
function Bank({x,y,values,color,w=95,h=86,depth=12}:{x:number;y:number;values:number[];color:string;w?:number;h?:number;depth?:number}){
 return <g><path d={`M${x-w/2-11} ${y+5}l${depth} ${-depth*.6}h${w+22}l${-depth} ${depth*.6}Z`} fill={color} fillOpacity={.08}/>{values.map((v,j)=>{const bx=x-w/2+j*w/values.length,bh=v*h*.7,by=y-bh;return <g key={j}><path d={`M${bx} ${by}l${depth*.6} ${-depth*.4}h${w/values.length-6}l${-depth*.6} ${depth*.4}Z`} fill={v<0?C.rose:color} fillOpacity={.48}/><path d={`M${bx} ${by}h${w/values.length-6}v${bh}h${-(w/values.length-6)}Z`} fill={v<0?C.rose:color} fillOpacity={.36}/><path d={`M${bx+w/values.length-6} ${by}l${depth*.6} ${-depth*.4}v${bh}l${-depth*.6} ${depth*.4}Z`} fill={v<0?C.rose:color} fillOpacity={.19}/></g>})}</g>;
}
export const SpatialHeads:React.FC<SceneProps>=p=>{
 const u=progress(p),split=segment(u,.03,.33),calculate=segment(u,.16,.67),join=segment(u,.55,.95),tokens=['红色','伞','蓝色','门'],heads=[attention(initial,0),attention(initial,1)];
 const rows=[heads[0][3],heads[1][3]],concat=[...rows[0],...rows[1]],projection=Array.from({length:4},(_,r)=>concat.map((v,j)=>v*Math.cos((r+1)*(j+1)*.39)*.3).reduce((a,b)=>a+b,0));
 return <g><Label x={63} y={63} size={37} color={C.gold}>同时换两套投影，再把结果合起来</Label>
  {tokens.map((word,i)=>{const x=143+i*279;return <g key={word}><Label x={x} y={130} anchor="middle" size={33} color={palette[i]}>{word}</Label><Bank x={x} y={201} values={initial[i]} color={palette[i]} w={111} h={66}/></g>})}
  {[0,1].map(h=>{const y=306+h*138,color=palette[h],weights=softmax(initial.map(v=>initial[3].reduce((s,x,j)=>s+x*v[(j+h)%4]*(h?1.3:.7),0))),a=segment(calculate,h*.1,.78+h*.1);return <g key={h}>
   <path d={`M78 ${y-45}L810 ${y-45}L847 ${y+53}H110Z`} fill={color} fillOpacity={.025} stroke={color} strokeOpacity={.15}/>
   <Label x={75} y={y-62} size={29} color={color}>头 {h+1}</Label>
   {tokens.map((_,i)=>{const x=151+i*182;return <g key={i}><Trace a={[143+i*279,211]} b={[x,y-18]} t={split} color={color} width={1}/><Bank x={x} y={y+24} values={initial[i].map((v,j)=>mix(v,heads[h][i][j],a))} color={color} w={86} h={59}/>{i<3&&<path d={`M${x+40} ${y-13}Q${x+100} ${y-60} ${697} ${y-13}`} fill="none" stroke={color} strokeWidth={1+weights[i]*5} strokeOpacity={.1+.36*a}/>}</g>})}
   <Trace a={[778,y+11]} b={[977,354+h*51]} bend={h?-30:25} t={join} color={color} width={2}/>
  </g>})}
  <g transform="translate(985 327)">{concat.map((v,i)=><rect key={i} x={i%4*25} y={Math.floor(i/4)*52} width={18} height={Math.max(3,Math.abs(v)*44)} fill={i<4?C.gold:C.cyan} fillOpacity={.2+.55*join}/>)}<Label x={43} y={124} anchor="middle" size={29}>拼接</Label></g>
  <Trace a={[1100,369]} b={[1161,369]} t={segment(join,.2,.98)} color={C.ivory}/><Bank x={1208} y={398} w={71} h={130} values={projection.map(v=>v*join)} color={C.ivory}/><Label x={1197} y={454} anchor="middle" size={29}>投影</Label>
  <Label x={647} y={573} anchor="middle" size={29} color={C.muted}>两套参数 · 各头独立计算</Label><StageRule t={u} y={620}/>
 </g>;
};

export const SpatialTransformerStack:React.FC<SceneProps>=p=>{
 const u=progress(p),id=String(p.data?.unitId||''),maxLayer=id==='s08-05'?1:3,flow=segment(u,.03,.94)*maxLayer,labels=['红色','伞','蓝色','门'],camera=segment(u,.05,.9);
 const xy=(i:number,layer:number):XY=>[184+i*280+layer*15*(1-camera),524-layer*112];
 return <g><Label x={63} y={63} size={37} color={C.gold}>同一串表示，一层层交换与加工</Label>
  {Array.from({length:maxLayer+1},(_,n)=>maxLayer-n).map(layer=>{const a=clamp(flow-layer+1),base=524-layer*112,color=layer===0?C.cyan:C.gold;return <g key={layer}>
   {layer>0&&<path d={`M98 ${base+19}L1119 ${base+19}L1197 ${base+60}H146Z`} fill={color} fillOpacity={.024} stroke={C.line} strokeOpacity={.25}/>}
   {[0,1,2,3].map(i=>{const [x,y]=xy(i,layer),prev=layers[Math.max(0,layer-1)][i],now=layers[layer][i],values=now.map((v,j)=>mix(prev[j],v,a)),tokenColor=i===1?C.gold:C.cyan;return <g key={i}>
    {layer>0&&<><Trace a={xy(i,layer-1)} b={[x,y+17]} t={segment(flow,layer-.95,layer-.09)} color={tokenColor} width={i===1?2.5:1.1}/><path d={`M${x+63} ${y+112}Q${x+109} ${y+59} ${x+63} ${y+10}`} fill="none" stroke={tokenColor} strokeOpacity={.17}/></>}
    <Bank x={x} y={y} values={values} color={tokenColor} w={104} h={67}/>
    {layer===0&&<Label x={x} y={579} anchor="middle" size={31} color={tokenColor}>{labels[i]}</Label>}
    {layer>0&&i<3&&<path d={`M${x+47} ${y-25}Q${x+149} ${y-67} ${xy(i+1,layer)[0]-50} ${y-25}`} fill="none" stroke={C.gold} strokeWidth={1.7} strokeOpacity={.1+.38*segment(flow,layer-.92,layer-.52)*(1-.5*segment(flow,layer-.5,layer))}/>}
   </g>;})}
   {layer>0&&<Label x={1225} y={base+8} anchor="end" size={26} color={C.muted}>第 {layer} 层</Label>}
  </g>;})}
  <Label x={64} y={606} size={28} color={C.gold}>横向交换信息</Label><Label x={485} y={606} size={28} color={C.cyan}>各位置独立加工</Label><Label x={968} y={606} size={28} color={C.muted}>保留残差主干</Label>
 </g>;
};

export const SpatialMLP:React.FC<SceneProps>=p=>{
 const u=progress(p),input=[.3,-.6,.7,-.2],w1=Array.from({length:8},(_,r)=>input.map((_,c)=>Math.sin((r+1)*(c+2)*1.7)*.8)),hidden=w1.map(row=>row.reduce((s,v,i)=>s+v*input[i],0)),act=hidden.map(v=>Math.max(0,v)),w2=Array.from({length:4},(_,r)=>hidden.map((_,c)=>Math.cos((r+2)*(c+1)*.73)*.42)),out=w2.map(row=>row.reduce((s,v,i)=>s+v*act[i],0));
 const expand=segment(u,.02,.38),activate=segment(u,.32,.68),compress=segment(u,.63,.95),bankY=389,feature=(x:number,y:number,value:number,color:string,key:string)=>{const h=value*110;return <g key={key}><path d={`M${x-22} ${y-h}l11-8h40v${h}l-11 8Z`} fill={value<0?C.rose:color} fillOpacity={.19}/><rect x={x-22} y={Math.min(y,y-h)} width={40} height={Math.max(1,Math.abs(h))} fill={value<0?C.rose:color} fillOpacity={.53}/><Label x={x} y={value<0?y-h+35:y-h-17} anchor="middle" size={25} color={value<0?C.rose:color}>{value.toFixed(2)}</Label></g>};
 return <g><Label x={63} y={63} size={37} color={C.gold}>先展开，再加工，最后压回去</Label>
  {[[[68,bankY+35],[313,bankY+35],[339,bankY+75],[93,bankY+75]],[[429,bankY+35],[876,bankY+35],[902,bankY+75],[454,bankY+75]],[[998,bankY+35],[1239,bankY+35],[1262,bankY+75],[1023,bankY+75]]].map((vs,i)=><path key={i} d={vs.map((v,j)=>`${j?'L':'M'}${v}`).join(' ')+'Z'} fill={palette[i]} fillOpacity={.035} stroke={palette[i]} strokeOpacity={.2}/>)}
  {input.map((v,i)=>feature(105+i*62,bankY,v,C.cyan,'in'+i))}
  {hidden.map((v,i)=>feature(463+i*56,bankY,mix(v*expand,act[i],activate),C.gold,'hid'+i))}
  {out.map((v,i)=>feature(1034+i*62,bankY,v*compress,palette[2],'out'+i))}
  <Trace a={[334,275]} b={[419,275]} t={expand} color={C.cyan}/><Trace a={[907,275]} b={[988,275]} t={compress} color={C.gold}/>
  <Label x={196} y={175} anchor="middle" size={36} color={C.cyan}>4 维输入</Label><Label x={661} y={175} anchor="middle" size={36} color={C.gold}>8 维 · ReLU</Label><Label x={1130} y={175} anchor="middle" size={36} color={palette[2]}>4 维输出</Label>
  <path d={`M442 ${bankY}H882`} stroke={C.ivory} strokeWidth={1.6} strokeOpacity={.6}/>
  <Label x={656} y={525} anchor="middle" size={31} color={C.gold}>{activate<.1?'矩阵乘法，把特征组合展开':activate<.99?'负值收回到 0，正值保留':'第二次矩阵乘法，回到原来的维度'}</Label>
  <Label x={648} y={585} anchor="middle" size={27} color={C.muted}>小型 ReLU 网络</Label><StageRule t={u} y={620}/>
 </g>;
};
