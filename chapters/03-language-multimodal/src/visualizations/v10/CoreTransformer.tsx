import {LatexFormula} from './LatexFormula';
import {SpatialMLP,SpatialTransformerStack} from './SpatialTransformer';
import React from 'react';
import {C,Label,Arrow,SceneProps,spoken,progress,segment,mix,palette,softmax} from './primitives';
import {Facet,Trace,FeatureBars,StageRule,Space,XY} from './CoreGeometry';
import {attentionEvidence as A} from './evidence';

const normInput=[1.4,2.2,1.1,2.9,2.4,1.7];
function Normalization(p:SceneProps) {
 const u=progress(p),mean=normInput.reduce((a,b)=>a+b,0)/6,sd=Math.sqrt(normInput.reduce((s,v)=>s+(v-mean)**2,0)/6),eps=1e-5,normal=normInput.map(v=>(v-mean)/Math.sqrt(sd*sd+eps)),gamma=[1.1,.85,1.05,.92,1.15,.9],beta=[.1,-.2,.15,-.12,.16,.05];
 const center=segment(u,.04,.37),scale=segment(u,.33,.69),affine=segment(u,.67,.96),values=normInput.map((v,i)=>mix(mix(v-mean*center,normal[i],scale),normal[i]*gamma[i]+beta[i],affine));
 const cy=399,unit=82,meanY=cy-mix(mean,0,center)*unit;
 const cue=affine>.05?'乘以 γ，再加上 β':scale>.05?'除以波动尺度 σ':'先减去平均值 μ';
 return <g><Label x={68} y={63} size={38} color={C.gold}>{affine>.05?'学习得到的拉伸与平移':scale>.05?'统一波动尺度':'先移到共同中心'}</Label>
  {[0,1,2,3].map(i=><path key={i} d={`M93 ${cy-i*unit}H1200`} stroke={C.line} opacity={i?.13:.65}/>)}
  <path d={`M85 ${meanY}H1210`} stroke={C.gold} strokeWidth={2} strokeDasharray="8 9" opacity={1-affine*.7}/><Label x={1200} y={meanY-14} size={25} anchor="end" color={C.gold}>μ → 0</Label>
  {values.map((v,i)=>{const x=155+i*190,color=v>=0?C.gold:C.cyan,top=cy-v*unit;return <g key={i}><path d={`M${x} ${cy}V${top}`} stroke={color} strokeWidth={38} strokeOpacity={.12}/><path d={`M${x} ${cy}V${top}`} stroke={color} strokeWidth={5}/><circle cx={x} cy={top} r={11} fill={color}/><Label x={x} y={v>=0?top-22:top+39} anchor="middle" size={31} color={color}>{v.toFixed(2)}</Label><Label x={x} y={569} anchor="middle" size={28} color={C.muted}>特征 {i+1}</Label></g>})}
  <Label x={650} y={112} size={30} anchor="middle" color={C.gold} opacity={segment(u,.08,.96)}>{cue}</Label><path d={`M${affine>.05?895:scale>.05?650:405} 124H${affine>.05?1035:scale>.05?790:545}`} stroke={C.gold} strokeWidth={3} strokeLinecap="round" opacity={segment(u,.1,.9)}/><LatexFormula id="legacy-layer-norm" x={650} y={615} size={25} maxWidth={680} color={C.gold}/>
 </g>;
}
function Residual(p:SceneProps) {
 const u=progress(p),slide=segment(u,.08,.8),origin:XY=[530,455],scale=238,x=[.34,.72],d=A.output[3],xTip:XY=[origin[0]+x[0]*scale,origin[1]-x[1]*scale],deltaStart:XY=[mix(origin[0],xTip[0],slide),mix(origin[1],xTip[1],slide)],deltaTip:XY=[deltaStart[0]+d[0]*scale,deltaStart[1]-d[1]*scale],sum:XY=[origin[0]+(x[0]+d[0])*scale,origin[1]-(x[1]+d[1])*scale];
 return <g><Label x={67} y={62} size={38} color={C.gold}>把更新量加回原表示</Label><Space origin={origin} angle={0} extent={230}/><Arrow a={origin} b={xTip} color={C.cyan} width={5}/><Arrow a={deltaStart} b={deltaTip} color={C.gold} width={5}/><Arrow a={origin} b={sum} color={C.ivory} width={2.5} opacity={segment(u,.65,.93)}/><path d={`M${xTip}L${sum}`} stroke={C.gold} strokeDasharray="5 8" opacity={.2}/>
  <Label x={origin[0]-16} y={origin[1]+38} anchor="end" size={29} color={C.cyan}>x</Label><Label x={xTip[0]-18} y={xTip[1]-13} anchor="end" size={30} color={C.cyan}>原表示</Label><Label x={deltaTip[0]+19} y={deltaTip[1]+5} size={30} color={C.gold}>Δx</Label>
  <FeatureBars x={91} y={247} values={x} w={123} h={149} color={C.cyan}/><Label x={152} y={211} size={31} anchor="middle" color={C.cyan}>保留</Label><FeatureBars x={1026} y={237} values={x.map((v,i)=>v+d[i]*slide)} w={135} h={160} color={C.ivory}/><Label x={1094} y={202} size={31} anchor="middle">相加</Label>
  <Trace a={[234,406]} b={[1010,406]} bend={290} t={slide} color={C.cyan}/><Label x={650} y={583} anchor="middle" size={30} color={C.cyan}>残差主干</Label><StageRule t={u}/>
 </g>;
}
function FeedForward(p:SceneProps) {
 const u=progress(p),input=[.3,-.6,.7,-.2],w1=Array.from({length:8},(_,r)=>input.map((_,c)=>Math.sin((r+1)*(c+2)*1.7)*.8)),hidden=w1.map(row=>row.reduce((s,v,i)=>s+v*input[i],0)),act=hidden.map(v=>Math.max(0,v)),w2=Array.from({length:4},(_,r)=>hidden.map((_,c)=>Math.cos((r+2)*(c+1)*.73)*.42)),out=w2.map(row=>row.reduce((s,v,i)=>s+v*act[i],0));
 const expand=segment(u,.02,.43),activate=segment(u,.33,.7),compress=segment(u,.65,.95),xs=[190,650,1100],ys=[input.map((_,i)=>223+i*70),hidden.map((_,i)=>133+i*52),out.map((_,i)=>223+i*70)];
 return <g><Label x={66} y={62} size={38} color={C.gold}>展开 → 非线性 → 压回</Label>
  {w1.flatMap((row,r)=>row.map((w,c)=><path key={`a${r}-${c}`} d={`M${xs[0]} ${ys[0][c]}C350 ${ys[0][c]} 475 ${ys[1][r]} ${xs[1]} ${ys[1][r]}`} stroke={w>=0?C.cyan:C.rose} strokeWidth={Math.abs(w)*1.8+.3} opacity={.05+.16*expand}/>))}
  {w2.flatMap((row,r)=>row.map((w,c)=><path key={`b${r}-${c}`} d={`M${xs[1]} ${ys[1][c]}C780 ${ys[1][c]} 928 ${ys[2][r]} ${xs[2]} ${ys[2][r]}`} stroke={w>=0?C.gold:C.rose} strokeWidth={Math.abs(w)*2+.3} opacity={.04+.16*compress}/>))}
  {[input,hidden.map((v,i)=>mix(v,act[i],activate)),out.map(v=>v*compress)].map((values,k)=><g key={k}>{values.map((v,i)=>{const color=v<0?C.rose:palette[k],on=k===0?1:k===1?expand:compress;return <g key={i}><circle cx={xs[k]} cy={ys[k][i]} r={23} fill={C.ink} stroke={color} strokeWidth={2} strokeOpacity={.45+on*.55}/><circle cx={xs[k]} cy={ys[k][i]} r={Math.abs(v)*17+2} fill={color} opacity={.18+on*.45}/><Label x={xs[k]+(k===2?49:-47)} y={ys[k][i]+9} anchor={k===2?'start':'end'} size={26} color={color}>{v.toFixed(2)}</Label></g>})}</g>)}
  <Label x={190} y={560} size={31} anchor="middle" color={C.cyan}>4 维</Label><Label x={650} y={560} size={31} anchor="middle" color={C.gold}>8 维 · ReLU 示意</Label><Label x={1100} y={560} size={31} anchor="middle" color={palette[2]}>4 维</Label><StageRule t={u}/>
 </g>;
}
function FinalProjection(p:SceneProps) {
 const u=progress(p),q=segment(u,.05,.9),input=[.34,.72,-.17,.84],words=['靠','放','落','在','。'],matrix=words.map((_,j)=>input.map((_,i)=>Math.sin((i+1)*(j+1)*.57))),scores=matrix.map(r=>r.reduce((s,v,i)=>s+v*input[i],0)),weights=softmax(scores),cell=55;
 return <g><Label x={66} y={62} size={38} color={C.gold}>最后一行，投影到词表</Label><FeatureBars x={110} y={219} w={112} h={240} values={input}/><Trace a={[244,339]} b={[421,339]} t={q} color={C.cyan}/>
  {matrix.map((row,j)=><g key={j}>{row.map((v,i)=><rect key={i} x={449+j*cell} y={220+i*cell} width={cell-5} height={cell-5} fill={v<0?C.rose:C.gold} fillOpacity={.12+Math.abs(v)*.25}/>)}<Label x={477+j*cell} y={476} anchor="middle" size={27} color={palette[j%4]}>{words[j]}</Label></g>)}
  {words.map((w,i)=><g key={w}><Trace a={[477+i*cell,200]} b={[904,159+i*89]} bend={-35} t={segment(q,i*.03,.75+i*.03)} color={palette[i%4]} width={1}/><Label x={885} y={174+i*89} size={28} anchor="end">{w}</Label><rect x={925} y={147+i*89} width={weights[i]*620*q} height={37} fill={palette[i%4]} fillOpacity={.65}/><Label x={1206} y={174+i*89} anchor="end" size={29} color={palette[i%4]}>{(weights[i]*100).toFixed(1)}%</Label></g>)}<Label x={606} y={555} anchor="middle" size={26} color={C.muted}>投影与 softmax</Label><StageRule t={u}/>
 </g>;
}
function TransformerStack(p:SceneProps) {
 const u=progress(p),scan=u*3.6,focus=Math.min(3,Math.floor(scan)),angle=mix(-.08,.06,u);
 return <g><Label x={64} y={64} size={37} color={C.gold}>同一串表示，逐层交换与加工</Label><g transform={`translate(650 350) rotate(${angle*20}) translate(-650 -350)`}>
  {[0,1,2,3].map(i=>{const x=110+i*291,y=184-i*19,on=segment(scan-i,0,.86),color=palette[i],active=i===focus;return <g key={i}>
   <Facet x={x} y={y} w={191} h={286} color={color} depth={35}/>{Array.from({length:6},(_,r)=>Array.from({length:4},(_,c)=><rect key={`${r}-${c}`} x={x+19+c*41} y={y+24+r*39} width={33} height={29} fill={color} fillOpacity={.055+(.12+on*.3)*(Math.sin((r+2)*(c+1)+i)**2)}/>))}
   <path d={`M${x+12} ${y+122}h167M${x+12} ${y+224}h167`} stroke={color} strokeOpacity={.4}/>
   {active&&<rect x={x+13} y={y+19+Math.floor((scan-i)*5.99)*39} width={170} height={36} stroke={C.gold} strokeWidth={2} fill={C.gold} fillOpacity={.09}/>}
   <Label x={x+94} y={y+342} anchor="middle" size={31} color={color}>第 {i+1} 层</Label>
   {i<3&&[0,1,2,3].map(r=><Trace key={r} a={[x+226,y+52+r*60]} b={[x+282,y+33+r*60]} t={on} color={color} width={1.4}/>)}
   <path d={`M${x-10} ${y+140}C${x-30} ${y-45} ${x+216} ${y-45} ${x+213} ${y+141}`} fill="none" stroke={color} opacity={.28}/>
  </g>})}</g><StageRule t={u}/></g>;
}
export const CoreTransformer:React.FC<SceneProps>=(p)=>{
 if(p.phase==='norm')return <Normalization {...p}/>;
 if(p.phase==='residual')return <Residual {...p}/>;
 if(p.phase==='mlp')return <SpatialMLP {...p}/>;
 if(p.focus==='最后投影')return <FinalProjection {...p}/>;
 return <SpatialTransformerStack {...p}/>;
};
