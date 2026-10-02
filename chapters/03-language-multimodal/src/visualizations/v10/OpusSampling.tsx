import React from 'react';
import {samplingEvidence as S} from './samplingEvidence';
import {C,Label,SceneProps,progress,segment,mix,bezier} from './primitives';
import {TokenBlock,ProbabilityColumn} from './AppliedObjects';

/** V2 Opus inverse-CDF / append choreography, rebuilt as continuous V4 objects.
 * Every probability, draw and generated character is an exact saved trace value. */
export const OpusSamplingMechanism:React.FC<SceneProps>=p=>{
 const trace=S.traces[String(p.data?.unitId||'').startsWith('s12')?1:0],t=progress(p),clock=Math.min(5.99999,t*6),idx=Math.floor(clock),step=clock-idx,row=trace.steps[idx],prev=trace.steps[Math.max(0,idx-1)],settle=segment(step,0,.18),draw=segment(step,.2,.59),append=segment(step,.66,.92);
 const full=row.distribution.map(d=>({...d,probability:mix(prev.distribution.find(z=>z.token===d.token)?.probability??0,d.probability,settle)}));
 let oldRun=0,newRun=0;const oldStarts=new Map(prev.distribution.map(d=>{const start=oldRun;oldRun+=d.probability;return [d.token,start] as const;}));
 const bands=full.map((d,i)=>{const targetStart=newRun;newRun+=row.distribution[i].probability;const start=mix(oldStarts.get(d.token)??targetStart,targetStart,settle);return {...d,index:i,start,end:start+d.probability};});
 const chosen=bands[row.chosenIndex],cursor=mix(idx?prev.u:0,row.u,draw),chosenX=66+(chosen.start+chosen.probability/2)*1160,hit=segment(step,.55,.65);
 const words=Array.from(row.prefix),last=words.length-2,cell=76,start=55;
 // One fixed set of labelled columns spans all six draws. Changing context never
 // replaces a tall candidate column with an unrelated token or resets its height.
 const visibleTokens=[...new Set([...trace.steps.slice(0,6).map(s=>s.chosen),'在'])],selected=visibleTokens.map(token=>full.find(d=>d.token===token)!),other=1-selected.reduce((s,d)=>s+d.probability,0),columns=[...selected,{token:'其余',probability:other}],n=columns.length;
 // Carry the selected glyph around the outside of the probability columns.
 // Its route preserves a readable value/label region while visibly reusing it.
 const destination=start+words.length*cell+31;
 const flying=append<.23?[mix(chosenX,1253,segment(append,0,.23)),548]:append<.6?[1253,mix(548,177,segment(append,.23,.6))]:append<.88?[mix(1253,destination,segment(append,.6,.88)),177]:[destination,mix(177,128,segment(append,.88,1))];
 return <g>
  <Label x={55} y={48} size={33} color={C.muted}>第 {idx+1} 次查询 · 随机种子 {trace.seed} · T = {trace.temperature.toFixed(1)}</Label>
  <Label x={1220} y={48} anchor="end" size={35} color={C.gold}>u = {row.u.toFixed(4)}</Label>
  {words.map((w,i)=><TokenBlock key={`prefix-${i}`} x={start+i*cell} y={91} word={w} width={63} height={68} color={i>=last?C.gold:C.cyan} active={i>=last?1:.2}/>)}
  <path d={`M${start+last*cell-5} 183v12h${2*cell-6}v-12`} fill="none" stroke={C.gold} strokeWidth={2.5}/>
  <Label x={start+(last+1)*cell-8} y={240} anchor="middle" size={32} color={C.gold}>读取「{row.context}」</Label>
  {columns.map((d,i)=><ProbabilityColumn key={d.token} x={65+i*(1160/n)} base={443} value={d.probability} label={d.token==='<EOS>'?'结束':d.token} color={d.token===row.chosen&&hit>.05?C.gold:C.cyan} width={88} scale={140} digits={d.probability<.01?2:1} highlight={d.token===row.chosen?hit:.15}/>)}
  {bands.map(d=><g key={`mass-${d.token}`}><rect x={66+d.start*1160} y={528} width={Math.max(.05,d.probability*1160)} height={45} fill={d.token===row.chosen&&hit>.05?C.gold:C.cyan} fillOpacity={d.token===row.chosen?.35+.51*hit:.25+(d.index%3)*.1}/>{d.probability>.07&&<Label x={66+(d.start+d.probability/2)*1160} y={560} anchor="middle" size={31} color={C.ink}>{d.token}</Label>}</g>)}
  <path d={`M${66+cursor*1160} 503v88`} stroke={C.gold} strokeWidth={3.5}/><path d={`M${66+cursor*1160-9} 496l9 10 9-10`} fill={C.gold}/>
  <Label x={66} y={625} size={31} color={C.muted}>0</Label><Label x={1226} y={625} size={31} anchor="end" color={C.muted}>1</Label>
  <Label x={645} y={625} size={33} anchor="middle" color={C.gold}>{draw<.99?'把全部概率排成 0 到 1 的连续区间':`选中「${row.chosen==='<EOS>'?'结束':row.chosen}」 · p = ${(row.distribution[row.chosenIndex].probability*100).toFixed(2)}%`}</Label>
  {append>0&&<g transform={`translate(${flying[0]-31} ${flying[1]-37})`}><TokenBlock x={0} y={0} word={row.chosen==='<EOS>'?'终':row.chosen} width={63} height={68} color={C.gold} active={1}/></g>}
 </g>;
};
