import React from 'react';
import {nextTokenEvidence as E} from './evidence';
import {samplingEvidence as S} from './samplingEvidence';
import {C,Label,SceneProps,progress,spoken,segment,mix,palette,softmax,clamp} from './primitives';
import {TokenBlock,ProbabilityColumn} from './AppliedObjects';

export const TemperatureDial:React.FC<SceneProps>=p=>{
 const t=progress(p),temp=mix(.5,1.5,segment(t,.06,.91)),d=E.contexts[1].distribution;
 const ps=softmax(d.map(x=>Math.log(x.probability)),temp),needle=mix(-2.5,-.65,(temp-.5));
 const focus=[{token:d[0].token,probability:ps[0]},{token:'其余 39 个',probability:1-ps[0]}];
 return <g>
  <Label x={48} y={49} size={39}>保持前文：雨后的<tspan fill={C.gold}>红伞</tspan></Label>
  <g transform="translate(290 303)">
   <circle r={152} fill={C.ink} fillOpacity={.6} stroke={C.line} strokeWidth={1.5}/>
   <path d="M-122 91A152 152 0 1 1 122 91" fill="none" stroke={C.cyan} strokeOpacity={.25} strokeWidth={8}/>
   {Array.from({length:11},(_,i)=>{const a=-2.5+i*.185;return <path key={i} d={`M${123*Math.cos(a)} ${123*Math.sin(a)}L${139*Math.cos(a)} ${139*Math.sin(a)}`} stroke={C.cyan} strokeWidth={i%5===0?3:1.4} strokeOpacity={.65}/>;})}
   <path d={`M0 0L${121*Math.cos(needle)} ${121*Math.sin(needle)}`} stroke={C.gold} strokeWidth={5} strokeLinecap="round"/>
   <circle r={10} fill={C.gold}/><Label x={0} y={85} anchor="middle" size={49} color={C.gold}>T = {temp.toFixed(2)}</Label>
  </g>
  <Label x={290} y={545} anchor="middle" size={35}>同一模型，只调采样分布</Label>
  {focus.map((v,i)=><ProbabilityColumn key={v.token} x={703+i*285} base={446} value={v.probability} width={165} scale={300} label={v.token} color={palette[i]} highlight={1}/>)}
  <path d="M679 464H1200" stroke={C.line} strokeWidth={2}/>
  <Label x={965} y={589} anchor="middle" size={33} color={C.muted}>总概率始终为 100%</Label>
 </g>;
};

/** A saved draw chooses a low-probability character; greedy is its exact argmax. */
export const GreedyComparison:React.FC<SceneProps>=p=>{
 const f=spoken(p),row=S.traces[1].steps[1],best=row.distribution[0],other=1-best.probability;
 const pick=segment(f,.36,.9),pos=mix(0,row.u,pick),hit=segment(f,.79,.93);
 return <g>
  <Label x={48} y={49} size={39}>同一个位置：雨后的红伞靠……</Label>
  <Label x={285} y={146} anchor="middle" size={38} color={C.gold}>贪心：取最高概率</Label>
  <ProbabilityColumn x={180} base={457} value={best.probability} label={best.token} width={166} scale={230} color={C.gold} highlight={1}/>
  <ProbabilityColumn x={406} base={457} value={other} label="其余" width={106} scale={230} color={C.cyan}/>
  <Label x={948} y={146} anchor="middle" size={38} color={C.cyan}>采样：按概率抽签</Label>
  <rect x={677} y={301} width={best.probability*549} height={63} fill={C.gold} opacity={.7}/>
  <rect x={677+best.probability*549} y={301} width={other*549} height={63} fill={C.cyan} opacity={.7}/>
  <Label x={927} y={344} anchor="middle" size={37} color={C.ink}>{best.token}</Label>
  <path d={`M${677+pos*549} 274v113`} stroke={C.ivory} strokeWidth={3}/>
  <Label x={948} y={236} anchor="middle" size={31}>u = {row.u.toFixed(4)} · 种子 12</Label>
  <g opacity={hit}>
   <TokenBlock x={906} y={423} word={row.chosen} width={82} height={72} color={C.cyan} active={1}/>
   <Label x={948} y={552} anchor="middle" size={32} color={C.cyan}>这次落入低概率候选</Label>
  </g>
  <Label x={650} y={627} anchor="middle" size={33} color={C.muted}>同一分布，两种选择办法</Label>
 </g>;
};

export const MemoryWindow:React.FC<SceneProps>=p=>{
 const f=spoken(p),focus=segment(f,.12,.84),sentence=Array.from('小林带着红伞出门雨停以后那把伞靠在'),cell=64;
 const total=sentence.length*cell,offset=mix(0,Math.max(0,total-1110),focus),last=sentence.length-2;
 return <g>
  <Label x={48} y={49} size={39}>故事还在继续，窗口里却只剩两个字</Label>
  <svg x={49} y={160} width={1201} height={188} viewBox="0 0 1201 188" style={{overflow:'hidden'}}>
   <g transform={`translate(${-offset} 0)`}>
    {sentence.map((ch,i)=><g key={i} opacity={i>=last?1:mix(1,.15,focus)}><Label x={i*cell+28} y={89} anchor="middle" size={43} color={i<2?C.rose:i>=last?C.gold:C.ivory}>{ch}</Label></g>)}
    <rect x={last*cell-1} y={24} width={2*cell} height={100} rx={6} fill="none" stroke={C.gold} strokeWidth={3}/>
    <path d={`M${last*cell+64} 130v42`} stroke={C.gold} strokeWidth={2}/>
   </g>
  </svg>
  <Label x={154} y={421} anchor="middle" size={37} color={C.rose}>人物：小林</Label>
  <Label x={154} y={479} anchor="middle" size={32} color={C.muted}>已经在窗口外</Label>
  <Label x={1046} y={421} anchor="middle" size={39} color={C.gold}>靠在</Label>
  <Label x={1046} y={479} anchor="middle" size={32} color={C.muted}>当前仍可读取</Label>
  <path d={`M283 411Q620 ${mix(400,541,focus)} 838 411`} stroke={C.line} fill="none" strokeWidth={2} strokeDasharray="5 9" strokeOpacity={1-focus*.7}/>
  <Label x={650} y={604} anchor="middle" size={37} color={C.gold}>要利用更远的线索，就要扩大可用的上下文</Label>
 </g>;
};
