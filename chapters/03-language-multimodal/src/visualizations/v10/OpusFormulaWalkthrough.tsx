import {LatexFormula} from './LatexFormula';
import React from 'react';
import {Arrow, C, Label, SceneProps, clamp, mix, progress, segment, softmax} from './primitives';
import {attentionEvidence as A} from './evidence';

/**
 * Deterministic formula lesson surfaces.  The parent supplies the 1300 × 650
 * SVG viewport and the subtitle/source safe areas; this component deliberately
 * leaves the bottom 80 px quiet.  Values are fixed teaching examples so the
 * animation can be scrubbed and re-rendered identically.
 */
const fmt=(v:number,d=2)=>Number(v.toFixed(d));
const vectorLabel=(v:number[])=>`[${v.map(n=>fmt(n)).join(', ')}]`;
const scaleFor=(v:number,min:number,max:number,a:number,b:number)=>mix(a,b,clamp((v-min)/Math.max(1e-6,max-min)));

function DotProduct({u}:{u:number}) {
  // Reuse the recorded attention example used by the surrounding matrix view;
  // the formula is therefore an explanation of the same values, not a second
  // invented toy example.
  const q=A.Q[3],k=A.K[1],mul=q.map((v,i)=>v*k[i]),sum=mul.reduce((a,b)=>a+b,0);
  const a=segment(u,.03,.43), b=segment(u,.28,.74), c=segment(u,.58,.94);
  const o:[number,number]=[215,360], sc=88;
  const tip=(v:number[]):[number,number]=>[o[0]+v[0]*sc,o[1]-v[1]*sc];
  const qTip=tip(q), kTip=tip(k);
  const qLen=Math.hypot(...q),kLen=Math.hypot(...k),cos=sum/(qLen*kLen),dimension=k.length,scaled=sum/Math.sqrt(dimension);
  return <g>
    <Label x={58} y={54} size={38} color={C.gold}>先把两个向量逐项相乘</Label>
    <path d={`M${o}h330M${o}v-250`} stroke={C.line} strokeWidth={2}/>
    <Arrow a={o} b={qTip} color={C.gold} width={5}/><Arrow a={o} b={kTip} color={C.cyan} width={5}/>
    <LatexFormula id="legacy-q-vector" x={qTip[0]+18} y={qTip[1]-18} size={28} anchor="start" maxWidth={300} color={C.gold}/>
    <LatexFormula id="legacy-k-vector" x={kTip[0]+18} y={kTip[1]+20} size={28} anchor="start" maxWidth={300} color={C.cyan}/>
    <path d={`M${o[0]+22} ${o[1]-18}A31 31 0 0 0 ${o[0]+31} ${o[1]-30}`} fill="none" stroke={C.ivory} strokeWidth={2}/>
    <Label x={o[0]+48} y={o[1]-40} size={27}>θ</Label>
    <g opacity={a}>
      <LatexFormula id="legacy-dot-term-1" x={490} y={135} size={29} anchor="start" maxWidth={160} color={C.gold}/><Label x={700} y={146} size={33} anchor="middle" color={C.gold}>{fmt(mul[0],1)}</Label>
      <LatexFormula id="legacy-dot-term-2" x={490} y={210} size={29} anchor="start" maxWidth={160} color={C.cyan}/><Label x={700} y={221} size={33} anchor="middle" color={C.cyan}>{fmt(mul[1],1)}</Label>
      <path d="M760 122v126" stroke={C.line} strokeDasharray="4 8"/>
      <Label x={870} y={196} size={33} color={C.gold}>逐项相乘</Label>
    </g>
    <g opacity={b}>
      {[mul[0],mul[1]].map((v,i)=><g key={i}><rect x={490} y={300+i*65} width={260} height={30} rx={15} fill={C.line} fillOpacity={.25}/><rect x={490} y={300+i*65} width={260*segment(b,.4,.9)*(v/mul[0])} height={30} rx={15} fill={i?C.cyan:C.gold}/><Label x={780} y={324+i*65} size={28} color={i?C.cyan:C.gold}>{fmt(v,1)}</Label></g>)}
      <LatexFormula id="legacy-dot-four" x={620} y={466} size={34} maxWidth={450}/>
    </g>
    <g opacity={c}>
      <Label x={890} y={146} size={29} color={C.muted}>几何关系</Label>
      <LatexFormula id="legacy-dot-geometric" x={890} y={181} size={29} anchor="start" maxWidth={360} color={C.gold}/>
      <Label x={890} y={238} size={26} color={C.muted}>投影长度乘上键的长度</Label>
      <Label x={890} y={322} size={31} color={C.cyan}>缩放注意力分数</Label>
      <LatexFormula id="legacy-dot-scale" x={890} y={362} size={30} anchor="start" maxWidth={360}/>
      <path d="M845 410h335" stroke={C.gold} strokeWidth={2} opacity={.5}/>
      <Label x={1010} y={456} size={26} anchor="middle" color={C.muted}>按键维数的平方根缩放</Label>
    </g>
    <LatexFormula id="legacy-attention" x={650} y={608} size={28} maxWidth={1120} opacity={c}/>
  </g>;
}

function Softmax({u,temperature=false}:{u:number;temperature?:boolean}) {
  const raw=temperature?mix(.7,1.5,segment(u,.06,.94)):1;
  const logits=A.scores[3],exp=logits.map(z=>Math.exp(z/raw)),sum=exp.reduce((a,b)=>a+b,0),show=exp.map(v=>v/sum);
  const maxLogit=Math.max(...logits),maxExp=Math.max(...exp);
  const labels=A.tokens, start=segment(u,.03,.42),expOn=segment(u,.24,.7),normOn=segment(u,.53,.96);
  return <g>
    <Label x={58} y={54} size={38} color={C.gold}>{temperature?'温度改变分布的集中程度':'把分数变成可读的权重'}</Label>
    <Label x={80} y={112} size={28} color={C.muted}>原始分数 z</Label><LatexFormula id={temperature?"legacy-exp-temperature":"legacy-exp"} x={500} y={103} size={26} anchor="start" maxWidth={300} color={C.muted}/><LatexFormula id={temperature?"legacy-softmax-temperature":"legacy-softmax"} x={900} y={103} size={26} anchor="start" maxWidth={310} color={C.muted}/>
    {labels.map((label,i)=>{const y=165+i*82,e=exp[i],w=show[i],col=[C.gold,C.cyan,'#cc98b7','#abc296'][i];return <g key={label}>
      <Label x={82} y={y+9} size={30} color={col}>{label}</Label><rect x={200} y={y-20} width={180} height={33} rx={8} fill={C.line} fillOpacity={.2}/><rect x={200} y={y-20} width={180*(logits[i]/maxLogit)*start} height={33} rx={8} fill={col} opacity={.72}/><Label x={397} y={y+7} size={26} color={col}>{fmt(logits[i],1)}</Label>
      <path d={`M455 ${y-4}C520 ${y-4} 545 ${y-4} 600 ${y-4}`} stroke={col} strokeWidth={2} strokeDasharray="5 8" opacity={expOn}/><rect x={600} y={y-20} width={210} height={33} rx={8} fill={C.line} fillOpacity={.2}/><rect x={600} y={y-20} width={210*(e/maxExp)*expOn} height={33} rx={8} fill={col} opacity={.8}/><Label x={826} y={y+7} size={25} color={col}>{fmt(e,1)}</Label>
      <path d={`M875 ${y-4}C895 ${y-4} 910 ${y-4} 930 ${y-4}`} stroke={col} strokeWidth={2} strokeDasharray="5 8" opacity={normOn}/><rect x={930} y={y-20} width={250} height={33} rx={8} fill={C.line} fillOpacity={.2}/><rect x={930} y={y-20} width={250*w*normOn} height={33} rx={8} fill={col} opacity={.85}/><Label x={1208} y={y+7} anchor="end" size={27} color={col}>{(w*100).toFixed(1)}%</Label>
    </g>})}
    <LatexFormula id={temperature?"legacy-softmax-sum-temperature":"legacy-softmax-sum"} x={1045} y={501} size={27} maxWidth={380} color={C.gold}/>
    <Label x={650} y={565} size={27} anchor="middle" color={C.muted}>{temperature?`T = ${raw.toFixed(2)}：排序保持，分布随温度变平或变尖`:'指数保持原有排序，再把正数归一化；差距不必然被放大'}</Label>
    <LatexFormula id="legacy-attention" x={650} y={612} size={27} maxWidth={1120} opacity={normOn}/>
  </g>;
}

function LayerNorm({u}:{u:number}) {
  const x=[1.4,2.2,1.1,2.9,2.4,1.7],mu=x.reduce((a,b)=>a+b,0)/x.length,variance=x.reduce((a,v)=>a+(v-mu)**2,0)/x.length,sd=Math.sqrt(variance),eps=1e-5,g=[1.1,.85,1.05,.92,1.15,.9],beta=[.1,-.2,.15,-.12,.16,.05];
  const z=x.map(v=>(v-mu)/Math.sqrt(sd*sd+eps)),y=z.map((v,i)=>v*g[i]+beta[i]);
  const a=segment(u,.03,.36),b=segment(u,.27,.7),c=segment(u,.58,.96),val=(i:number)=>mix(mix(x[i],x[i]-mu,a),mix(z[i],y[i],c),b);
  return <g>
    <Label x={58} y={54} size={38} color={C.gold}>LayerNorm：让一行数值处在共同尺度</Label>
    <Label x={80} y={115} size={28} color={C.muted}>原始 x</Label><Label x={430} y={115} size={28} color={C.muted}>减去 μ</Label><LatexFormula id="legacy-normalize" x={790} y={106} size={23} maxWidth={215} color={C.muted}/><LatexFormula id="legacy-affine" x={1080} y={106} size={25} anchor="start" maxWidth={210} color={C.muted}/>
    {x.map((_,i)=>{const yy=185+i*53,col=i%2?C.cyan:C.gold,v=val(i);return <g key={i}><circle cx={120} cy={yy} r={9} fill={col}/><Label x={147} y={yy+8} size={25} color={col}>{x[i].toFixed(1)}</Label><path d={`M200 ${yy}H${350+130*a}`} stroke={col} strokeWidth={4} opacity={.35+.5*a}/><circle cx={470} cy={yy} r={11} fill={col} opacity={a}/><path d={`M530 ${yy}H${650+110*b}`} stroke={col} strokeWidth={4} opacity={b}/><circle cx={790} cy={yy} r={11} fill={col} opacity={b}/><path d={`M850 ${yy}H${1000+80*c}`} stroke={col} strokeWidth={4} opacity={c}/><circle cx={1140} cy={yy} r={12} fill={col} opacity={c}/><Label x={1175} y={yy+8} size={25} color={col} opacity={c}>{fmt(y[i],2)}</Label></g>})}
    <path d="M84 501h1110" stroke={C.gold} strokeWidth={2} opacity={.5}/><LatexFormula id="legacy-layer-norm" x={640} y={544} size={26} maxWidth={920} color={C.gold}/><LatexFormula id="legacy-norm-statistics" x={640} y={597} size={23} maxWidth={780} color={C.muted}/><Label x={640} y={637} size={23} anchor="middle" color={C.muted}>小量用于避免除零</Label>
  </g>;
}

function LogLoss({u}:{u:number}) {
  const p=mix(.1,.9,segment(u,.05,.94)),loss=-Math.log(p),x0=185,y0=410,w=920,h=255,px=x0+p*w,py=y0-(loss/2.4)*y0*.53;
  const curve=Array.from({length:100},(_,i)=>{const q=.1+i*.008;return `${i?'L':'M'}${x0+q*w} ${y0-(-Math.log(q)/2.4)*y0*.53}`}).join(' ');
  return <g>
    <Label x={58} y={54} size={38} color={C.gold}>负对数损失：猜得越准，代价越小</Label>
    <path d={`M${x0} ${y0}V150M${x0} ${y0}H${x0+w}`} stroke={C.line} strokeWidth={2}/><path d={curve} fill="none" stroke={C.cyan} strokeWidth={4}/><circle cx={px} cy={py} r={13} fill={C.gold}/><path d={`M${px} ${py}V${y0}M${x0} ${py}H${px}`} stroke={C.gold} strokeDasharray="6 7"/>
    <Label x={x0+w+20} y={y0+8} size={26} color={C.muted}>目标概率 p</Label><Label x={x0-15} y={151} size={26} anchor="end" color={C.muted}>损失 L</Label><Label x={px} y={py-24} size={29} anchor="middle" color={C.gold}>p={p.toFixed(2)} · L={loss.toFixed(2)}</Label>
    <LatexFormula id="legacy-loss" x={650} y={515} size={32} maxWidth={440} color={C.gold}/><Label x={650} y={570} size={27} anchor="middle" color={C.muted}>这里的 p 是真实目标的预测概率；p 上升，L 连续下降</Label>
  </g>;
}

export const FormulaWalkthrough:React.FC<SceneProps>=(p)=>{
  const u=progress(p),phase=String(p.phase||'dot');
  if(phase==='softmax'||phase==='temperature')return <Softmax u={u} temperature={phase==='temperature'}/>;
  if(phase==='norm')return <LayerNorm u={u}/>;
  if(phase==='loss')return <LogLoss u={u}/>;
  return <DotProduct u={u}/>;
};
