import {LatexFormula} from './LatexFormula';
import React from 'react';
import {attentionEvidence as A} from './evidence';
import {C,Label,Arrow,SceneProps,spoken,progress,segment,mix,palette,softmax,clamp} from './primitives';
import {Facet,Trace,FeatureBars,StageRule,Space,XY} from './CoreGeometry';
import {OpusWeightedValues} from './OpusWeightedValues';
import {FormulaWalkthrough} from './OpusFormulaWalkthrough';
import {AttentionFormulaLessonV8} from './AttentionFormulaLessonV8';
import {SpatialQKV, QueryOrbit, AttentionCost, AttentionModeComparison, LongRangeAttention, ContinuousScores} from './SpatialAttention';
import {SpatialHeads,SpatialTransformerStack} from './SpatialTransformer';

function QKV(p:SceneProps) {
 const u=progress(p),input=[.34,.72,-.17,.84,.48,-.63],parts=[A.Q[3],A.K[3],A.V[3]],names=['Q 查询','K 匹配线索','V 传递内容'];
 return <g><Label x={64} y={62} size={38} color={C.gold}>同一个输入，三次投影</Label><Label x={158} y={173} size={37} anchor="middle" color={C.gold}>门边</Label><FeatureBars x={102} y={217} w={111} h={285} values={input}/>
  {parts.map((v,h)=>{const y=137+h*166,on=segment(u,.03+h*.12,.64+h*.12),color=palette[h];return <g key={h}><Trace a={[235,359]} b={[493,y+42]} bend={h===0?-60:h===2?65:0} t={on} color={color}/><Facet x={507} y={y} w={168} h={91} color={color} depth={30}/>{Array.from({length:18},(_,i)=><rect key={i} x={520+i%6*25} y={y+12+Math.floor(i/6)*23} width={17} height={15} fill={color} opacity={.08+on*.22}/>)}<Label x={590} y={y+60} size={32} anchor="middle" color={color}>W{['Q','K','V'][h]}</Label><Trace a={[711,y+42]} b={[899,y+42]} t={on} color={color}/><FeatureBars x={921} y={y-5} w={117} h={101} values={v} color={color}/><Label x={1072} y={y+50} size={31} color={color}>{names[h]}</Label></g>})}<StageRule t={u}/>
 </g>;
}
function Scores(p:SceneProps) {
 const u=progress(p),t=progress(p),cost=p.focus==='计算代价',n=4+Math.floor(segment(u,.03,.91)*8);
 if(cost)return <g><Label x={67} y={64} size={37} color={C.gold}>每个位置，比较所有位置</Label>{Array.from({length:n*n},(_,i)=>{const r=Math.floor(i/n),c=i%n,s=408/n;return <rect key={i} x={175+c*s} y={137+r*s} width={s-3} height={s-3} fill={r===n-1?C.gold:C.cyan} opacity={c<=r?.35:.09}/>})}<Label x={961} y={262} anchor="middle" size={60} color={C.gold}>{n} × {n}</Label><Label x={961} y={342} anchor="middle" size={44}>{n*n} 个分数</Label><path d="M801 414H1118" stroke={C.line}/><Label x={961} y={484} anchor="middle" size={38} color={C.cyan}>n²</Label><StageRule t={u}/></g>;
 const selected=Math.min(3,Math.floor(t*3.999)),q=A.Q[3],k=A.K[selected],dot=q[0]*k[0]+q[1]*k[1],norm=Math.hypot(...k),origin:XY=[255,365],scale=92,tip=(v:number[]):XY=>[origin[0]+v[0]*scale,origin[1]-v[1]*scale],projection=k.map(v=>v*dot/(norm*norm)),projectionCue=segment(u,.34,.82);
 return <g><Label x={64} y={63} size={37} color={C.gold}>把查询，投到匹配方向</Label><Space origin={origin} angle={0} extent={193}/><circle cx={origin[0]} cy={origin[1]} r={184} fill="none" stroke={C.line} opacity={.22}/><Arrow a={origin} b={tip(q)} color={C.gold} width={4}/><Arrow a={origin} b={tip(k)} color={C.cyan} width={4}/><path d={`M${tip(q)}L${tip(projection)}`} fill="none" stroke={C.gold} strokeDasharray="5 7" strokeWidth={2}/><path d={`M${origin}L${tip(projection)}`} stroke={C.ivory} strokeWidth={7} strokeOpacity={.3}/><circle cx={mix(tip(q)[0],tip(projection)[0],projectionCue)} cy={mix(tip(q)[1],tip(projection)[1],projectionCue)} r={7} fill={C.gold} opacity={projectionCue}/><Label x={tip(q)[0]+14} y={tip(q)[1]-11} size={31} color={C.gold}>Q</Label><Label x={tip(k)[0]+14} y={tip(k)[1]+26} size={31} color={C.cyan}>K</Label><Label x={285} y={520} anchor="middle" size={33} color={C.cyan}>{A.tokens[selected]}</Label>
  <Trace a={[488,343]} b={[694,343]} bend={-18} t={segment(t*4-selected,.06,.83)} color={C.gold}/><Label x={585} y={273} size={29} anchor="middle" color={C.gold}>÷ √2</Label>
  {A.tokens.map((w,i)=><g key={i}><Label x={794+i*100} y={139} size={28} anchor="middle" color={palette[i]}>{w}</Label><Label x={731} y={202+i*90} size={28} anchor="end" color={i===3?C.gold:C.muted}>{w}</Label></g>)}
  {A.scores.flatMap((r,i)=>r.map((v,j)=><g key={`${i}-${j}`}><rect x={750+j*100} y={161+i*90} width={90} height={78} fill={i===3?C.gold:C.cyan} fillOpacity={i===3?.16:.055} stroke={i===3&&j===selected?C.gold:C.line} strokeOpacity={i===3&&j===selected?1:.25}/><Label x={795+j*100} y={210+i*90} size={29} anchor="middle" color={i===3&&j===selected?C.gold:C.muted}>{v.toFixed(2)}</Label></g>))}
  <Label x={658} y={585} size={33} anchor="middle">{q[0]} × {k[0]} + {q[1]} × {k[1]} = {dot}　→　{A.scores[3][selected].toFixed(3)}</Label>
  <Label x={658} y={622} size={27} anchor="middle" color={C.muted} opacity={segment(u,.18,.46)}>方向越接近，点积越大；除以 √2 让尺度保持稳定</Label><Label x={1004} y={548} size={29} anchor="middle" color={C.gold} opacity={segment(u,.48,.86)}>投影长度，就是这次匹配的分数</Label>
 </g>;
}
function NormalizeAttention(p:SceneProps) {
 const u=progress(p),mask=p.phase==='mask',verify=mask&&(p.focus==='核对因果性'||p.data?.unitId==='s07-08'),active=mask?2:3,moving=/平滑/.test(p.focus||''),q=moving?[mix(2,1.1,segment(u,.04,.94)),mix(1,1.6,segment(u,.04,.94))]:A.Q[active],scores=A.K.map(k=>(q[0]*k[0]+q[1]*k[1])/Math.sqrt(2));
 const maskedWeights=A.scores.map((row,r)=>{const valid=softmax(row.slice(0,r+1));return row.map((_,c)=>c<=r?valid[c]:0)});
 const weights=mask?maskedWeights[active]:softmax(scores),convert=verify?1:segment(u,.15,.86),maskOn=segment(u,.035,.32),mx=221,my=161,cell=77;
 const rowCheck=segment(u,.05,.63)*3,zeroCheck=segment(u,.52,.91);
 return <g><Label x={66} y={63} size={37} color={C.gold}>{verify?'检查整张表：每行是一份完整配方':mask?'看得见过去，挡住未来':moving?'查询变动，权重平滑变化':'一行分数，变成一组权重'}</Label>
  {A.tokens.map((w,i)=><g key={i}><Label x={mx+cell*(i+.5)} y={132} size={27} anchor="middle" color={palette[i]}>{w}</Label><Label x={mx-20} y={my+cell*(i+.5)+10} size={27} anchor="end" color={i===active?C.gold:C.muted}>{w}</Label></g>)}
  {A.scores.flatMap((row,r)=>row.map((v,c)=>{const off=mask&&c>r,on=r===active,value=verify?maskedWeights[r][c]:r===active?scores[c]:v,check=verify?1-clamp(Math.abs(rowCheck-r)):0;return <g key={`${r}-${c}`} data-probability-row={verify?r:undefined} data-probability-col={verify?c:undefined} data-probability={verify?value:undefined}>
   <rect x={mx+c*cell+3} y={my+r*cell+3} width={cell-6} height={cell-6} fill={off?C.rose:on?C.gold:C.cyan} fillOpacity={verify?(off?.035+.025*zeroCheck:.06+value*.35+.045*check):off?.035:on?.19:.045} stroke={on?C.gold:C.line} strokeOpacity={on?.6:.2}/>
   <text x={mx+cell*(c+.5)} y={my+cell*(r+.5)+8} textAnchor="middle" fontSize={verify?24:27} fill={off?C.rose:on?C.ivory:C.muted} fontFamily="NotoSansSC" style={{fontVariantNumeric:'tabular-nums'}}>{verify?(off?'0':value.toFixed(3)):off&&maskOn>.65?'−∞':value.toFixed(2)}</text>
   {verify?<path d={`M${mx+c*cell+12} ${my+(r+1)*cell-12}h${(cell-24)*value}`} stroke={off?C.rose:palette[r]} strokeWidth={3} strokeOpacity={.6}/>:off&&<path d={`M${mx+c*cell+15} ${my+r*cell+15}l47 47`} stroke={C.rose} opacity={maskOn*.55}/>}
  </g>}))}
  {verify&&<g><Label x={583} y={132} anchor="middle" size={24} color={C.muted}>行和</Label>{maskedWeights.map((row,r)=>{const sum=row.reduce((a,b)=>a+b,0),check=1-clamp(Math.abs(rowCheck-r));return <g key={r} data-probability-sum={sum}>
   <rect x={546} y={my+r*cell+18} width={74} height={40} rx={7} fill={C.gold} fillOpacity={.03+.1*check}/><text x={583} y={my+cell*(r+.5)+8} textAnchor="middle" fontSize={25} fill={C.gold} fontFamily="NotoSansSC" style={{fontVariantNumeric:'tabular-nums'}}>{sum.toFixed(3)}</text>
  </g>})}</g>}
  <Label x={370} y={523} anchor="middle" size={27} color={C.muted}>{verify?'每行单独归一化 · 显示值已取近似':'Query 在行 · Key 在列'}</Label>
  <Trace a={[verify?637:554,my+cell*(active+.5)]} b={[715,326]} t={convert} color={C.gold}/><Label x={verify?678:650} y={266} anchor="middle" size={verify?25:28} color={C.gold}>{verify?'取这一行':'softmax'}</Label>
  {weights.map((w,i)=>{const y=143+i*105,color=palette[i];return <g key={i} data-selected-weight={w}><Label x={756} y={y+13} size={29} color={color}>{A.tokens[i]}</Label><rect x={853} y={y-12} width={295} height={36} fill={color} opacity={.075}/><rect x={853} y={y-12} width={295*w*convert} height={36} fill={color} opacity={.75}/><text x={1217} y={y+15} textAnchor="end" fontSize={30} fill={color} fontFamily="NotoSansSC" style={{fontVariantNumeric:'tabular-nums'}}>{(w*100).toFixed(1)}%</text>{mask&&i===3&&<path d={`M855 ${y+42}H1148`} stroke={C.rose} strokeDasharray="4 7"/>}</g>})}<LatexFormula id="legacy-weight-sum" x={992} y={555} size={31} maxWidth={390} color={C.gold}/><Label x={992} y={619} size={27} anchor="middle" color={C.muted} opacity={verify?1:segment(u,.28,.58)}>softmax 把分数变成总和为 1 的权重</Label>
 </g>;
}
function WeightedSum(p:SceneProps) {
 const u=progress(p),scale=315,origin:XY=[813,500],slide=segment(u,.12,.91),w=A.weights[3];let x=origin[0],y=origin[1];
 const routes=A.V.map((v,i)=>{const a:XY=[x,y];x+=v[0]*w[i]*scale;y-=v[1]*w[i]*scale;return {a,b:[x,y] as XY};});
 return <g><Label x={65} y={63} size={37} color={C.gold}>按权重缩放，再首尾相接</Label><Space origin={origin} angle={0} extent={226}/>
  {A.V.map((v,i)=>{const rowY=143+i*107,color=palette[i],scaled=v.map(x=>x*w[i]),a:XY=[mix(867,routes[i].a[0],slide),mix(173+i*102,routes[i].a[1],slide)],b:XY=[a[0]+scaled[0]*scale,a[1]-scaled[1]*scale];return <g key={i}><Label x={66} y={rowY+15} size={30} color={color}>{A.tokens[i]}</Label><Label x={201} y={rowY+15} size={31} color={color}>{(w[i]*100).toFixed(1)}%</Label><Label x={381} y={rowY+15} size={29} anchor="middle">[{v.join(', ')}]</Label><Arrow a={[454,rowY+5]} b={[525,rowY+5]} color={color} width={2}/><Label x={638} y={rowY+15} size={29} anchor="middle" color={color}>[{scaled.map(v=>v.toFixed(2)).join(', ')}]</Label><Arrow a={a} b={b} color={color} width={4}/><circle cx={b[0]} cy={b[1]} r={5} fill={color}/></g>})}
  <Arrow a={origin} b={[x,y]} color={C.ivory} width={2} opacity={segment(u,.73,.98)}/><Label x={988} y={572} anchor="middle" size={33} color={C.gold}>[{A.output[3].map(v=>v.toFixed(3)).join(', ')}]</Label><StageRule t={u} y={620}/>
 </g>;
}
function Multihead(p:SceneProps) {
 const u=progress(p),join=segment(u,.34,.95);
 return <g><Label x={65} y={63} size={37} color={C.gold}>不同投影，同时交换信息</Label>{[0,1,2].map(h=>{const y=132+h*157,color=palette[h],sx=mix(385+h*26,585,join*.25);return <g key={h}><Label x={70} y={y+60} size={31} color={color}>头 {h+1}</Label><Facet x={sx} y={y} w={191} h={100} color={color} depth={28}/>{Array.from({length:16},(_,i)=><rect key={i} x={sx+11+i%4*44} y={y+10+Math.floor(i/4)*21} width={35} height={14} fill={color} opacity={.1+((i+h)%4)*.08}/>)}{[0,1,2,3].map(i=><Trace key={i} a={[191,y+15+i*25]} b={[sx-6,y+15+i*25]} t={segment(u,h*.06,.68+h*.09)} color={color} width={1.2}/>)}<Trace a={[sx+231,y+48]} b={[1035+h*44,337]} bend={h===0?-20:h===2?20:0} t={join} color={color}/><rect x={1035+h*44} y={244} width={33} height={184} fill={color} opacity={.2+.6*join}/></g>})}<Label x={1094} y={493} size={33} anchor="middle" color={C.gold}>拼接 · 投影</Label><StageRule t={u}/></g>;
}
export const CoreAttention:React.FC<SceneProps>=(p)=>{
 const id=String(p.data?.unitId||'');
 // The V8 retake explicitly pulls back to the complete four-query matrix.
 if(id==='s07-05'&&typeof p.data?.unitProgress==='number')return <AttentionFormulaLessonV8 {...p} phase="full" data={{...p.data,unitId:'',stageProgress:.53+.47*Number(p.data.unitProgress)}}/>;
 if(id==='s07-04')return <AttentionModeComparison {...p}/>;
 if(id==='s08-06')return <LongRangeAttention {...p}/>;
 if(id==='s08-05'||id==='s08-08')return <SpatialTransformerStack {...p}/>;
 if(p.phase==='qkv')return <SpatialQKV {...p}/>;
 // Give the two numerical attention beats a full, readable derivation.  The
 // surrounding scenes still carry the spatial Q/K/V and matrix views; these
 // two beats are where the viewer can pause on the actual arithmetic without
 // replacing the rest of the chapter's visual language.
 if(p.focus==='真实数值样本')return <FormulaWalkthrough {...p} phase="dot"/>;
 // Continue from the completed dot product; this sentence introduces scaling.
 if(p.focus==='缩放分数')return <ContinuousScores {...p}/>;
 if(p.phase==='softmax'&&p.focus==='权重之和')return <FormulaWalkthrough {...p} phase="softmax"/>;
 if(p.focus==='计算代价')return <AttentionCost {...p}/>;
 if(/平滑/.test(p.focus||''))return <QueryOrbit {...p}/>;
 if(p.phase==='scores')return <ContinuousScores {...p}/>;
 if(p.phase==='weighted')return <OpusWeightedValues {...p}/>;
 if(p.phase==='multihead')return <SpatialHeads {...p}/>;
 return <NormalizeAttention {...p}/>;
};
