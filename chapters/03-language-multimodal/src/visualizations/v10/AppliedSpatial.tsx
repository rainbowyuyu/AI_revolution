import {LatexFormula} from './LatexFormula';
import React from 'react';
import {C,Label,SceneProps,segment,spoken,progress,mix,palette,clamp} from './primitives';
import {nextTokenEvidence as E} from './evidence';

type V3=[number,number,number];
type Point=[number,number];
/** One perspective camera, shared by solids, ground projections and labels. */
function camera(t:number){
 const yaw=mix(-.16,.08,segment(t,0,1)),pitch=.36;
 return ([x,y,z]:V3):Point=>{
  const a=x*Math.cos(yaw)-z*Math.sin(yaw),b=x*Math.sin(yaw)+z*Math.cos(yaw);
  const v=y*Math.cos(pitch)-b*Math.sin(pitch),d=y*Math.sin(pitch)+b*Math.cos(pitch),s=1500/(1500+d);
  return [650+a*s,438-v*s];
 };
}
const poly=(points:Point[])=>points.map(p=>p.join(',')).join(' ');
function Solid({project,x,z,w,d,h,color}:{project:(v:V3)=>Point;x:number;z:number;w:number;d:number;h:number;color:string}){
 const a:V3=[x-w/2,0,z-d/2],b:V3=[x+w/2,0,z-d/2],c:V3=[x+w/2,0,z+d/2],e:V3=[x-w/2,0,z+d/2];
 const top=(v:V3):V3=>[v[0],h,v[2]];
 return <g>
  <polygon points={poly([a,b,c,e].map(project))} fill={color} opacity={.06}/>
  <polygon points={poly([b,c,top(c),top(b)].map(project))} fill={color} opacity={.26}/>
  <polygon points={poly([a,b,top(b),top(a)].map(project))} fill={color} opacity={.57}/>
  <polygon points={poly([top(a),top(b),top(c),top(e)].map(project))} fill={color} opacity={.8}/>
  <polyline points={poly([top(e),top(a),top(b),top(c)].map(project))} stroke={color} fill="none" strokeWidth={2}/>
 </g>;
}

export const CorpusSplit:React.FC<SceneProps>=p=>{
 const f=spoken(p),split=segment(f,.12,.80),read=segment(f,.08,.38);
 return <g>
  <Label x={50} y={50} size={38} color={C.gold}>64 句话，让它从“红伞”后面接下去</Label>
  <path d="M48 480Q285 530 598 480M720 480Q971 530 1236 480" fill="none" stroke={C.line} strokeWidth={2}/>
  {Array.from({length:64},(_,i)=>{
   const held=i>=51,n=held?i-51:i,cols=held?5:8;
   const x=mix(70+i%8*70,held?806+n%cols*78:50+n%cols*70,split);
   const y=mix(112+Math.floor(i/8)*57,held?180+Math.floor(n/cols)*100:112+Math.floor(n/cols)*57,split);
   const color=held?C.gold:C.cyan,delay=segment(f,.1+(i%16)*.018,.3+(i%16)*.018);
   return <g key={i} transform={`translate(${x} ${y})`}>
    <path d="M5 7h43v51H5Z" fill="#000" opacity={.4}/>
    <path d="M0 0h34l9 9v48H0Z" fill={C.ink} stroke={color} strokeOpacity={.4+.4*delay}/>
    <path d="M34 0v9h9" stroke={color} fill="none" opacity={.45}/>
    {[0,1,2].map(j=><path key={j} d={`M7 ${20+j*10}h${28-j*5}`} stroke={color} strokeOpacity={.32+.42*delay}/>)}
   </g>;
  })}
  <g opacity={read}>
   <Label x={318} y={573} anchor="middle" size={45} color={C.cyan}>51 句 · 学习接法</Label>
   <Label x={1020} y={573} anchor="middle" size={45} color={C.gold}>13 句 · 留下检查</Label>
  </g>
  <path d={`M679 150v${310*split}`} stroke={C.line} strokeWidth={2} opacity={.5}/>
 </g>;
};

export const EvaluationRoom:React.FC<SceneProps>=p=>{
 const t=progress(p),f=spoken(p),project=camera(t),values=[E.metrics.unigram.meanNLL,E.metrics.trigram.meanNLL];
 const enter=p.data?.unitId==='s12-05'?f:1;
 const sweep=segment(enter,0,.30)*13,raise=segment(enter,.08,.46);
 return <g>
  <Label x={50} y={50} size={37} color={C.gold}>同样的 13 句，谁给真实后续更高的概率？</Label>
  {Array.from({length:13},(_,i)=>{
   const a=clamp(sweep-i),x=69+i*89;
   return <g key={i} transform={`translate(${x} 96)`}>
    <path d="M0 0h49l9 9v43H0Z" fill={a>0?C.cyan:C.ink} fillOpacity={a>0?.15:1} stroke={C.line}/>
    <path d="M10 20h33M10 31h26" stroke={C.cyan} strokeOpacity={.4+.5*a}/>
    <path d={`M0 62H${58*a}`} stroke={C.gold} strokeWidth={3}/>
   </g>;
  })}
  {[-190,-95,0,95,190].map(z=><path key={z} d={`M${project([-560,0,z])}L${project([560,0,z])}`} stroke={C.line} strokeOpacity={.2} fill="none"/>)}
  {values.map((v,i)=>{
   // Reserve a clean upper band for the 13-document evidence strip.  The old
   // 71px scale let the tallest prism rise into those cards during the reveal;
   // a slightly lower, wider grounded prism keeps the value readable without
   // sacrificing the 3-D comparison.
   const x=i?280:-280,h=v*56*raise,top=project([x,h,0]),label=project([x,0,-130]);
   return <g key={i}>
    <Solid project={project} x={x} z={0} w={188} d={88} h={h} color={palette[i]}/>
    <Label x={top[0]} y={top[1]-35} anchor="middle" size={49} color={palette[i]}>{(v*raise).toFixed(3)}</Label>
    <Label x={label[0]} y={550} anchor="middle" size={37}>{i?'读前面两个字':'只看整体字频'}</Label>
   </g>;
  })}
  <Label x={650} y={600} anchor="middle" size={34} color={C.gold}>平均负对数概率 · 越低越好</Label>
 </g>;
};

/** Code and arithmetic use the same captured corpus as the displayed result. */
export const CountingExecution:React.FC<SceneProps>=p=>{
 const f=spoken(p),context=E.contexts[1],hit=context.distribution[0];
 const counts=context.distribution.reduce((a,b)=>a+b.count,0),vocab=context.distribution.length;
 const step=2.999*segment(f,.02,.86),a=segment(f,.18,.45),b=segment(f,.43,.72),c=segment(f,.68,.88);
 const scripts=['context = text[-2:]','counts = table[context]','p = (counts + 0.1) / total'];
 return <g>
  <Label x={48} y={50} size={39}>雨后的<tspan fill={C.gold}>红伞</tspan></Label>
  <path d="M165 72h79" stroke={C.gold} strokeWidth={3}/>
  {scripts.map((line,i)=>{
   const hot=clamp(1-Math.abs(step-i-.5));
   return <g key={line}>
    <rect x={42} y={127+i*105} width={566} height={77} rx={5} fill={C.cyan} fillOpacity={.025+.08*hot}/>
    <path d={`M41 ${127+i*105}v77`} stroke={C.gold} strokeWidth={3} strokeOpacity={.25+.75*hot}/>
    <Label x={63} y={175+i*105} size={30} color={hot>.3?C.ivory:C.muted}>{line}</Label>
   </g>;
  })}
  <Label x={65} y={517} size={33} color={C.gold}>“红伞” → “靠”</Label>
  <Label x={65} y={574} size={32} color={C.muted}>把一个上下文的计数，变成下一字的机会</Label>
  <path d="M649 110v452" stroke={C.line} strokeOpacity={.4}/>
  <Label x={924} y={105} anchor="middle" size={37} color={C.cyan}>“靠”出现了 {hit.count} 次</Label>
  {Array.from({length:hit.count},(_,i)=>{
   const go=segment(a,(i%8)*.03,.65+(i%8)*.03),start:[number,number]=[715+i%8*32,161+Math.floor(i/8)*34];
   const end:[number,number]=[737+i%8*32,348-Math.floor(i/8)*26];
   return <circle key={i} cx={mix(start[0],end[0],b)} cy={mix(start[1],end[1],b)} r={6.5} fill={C.gold} opacity={.13+.87*go}/>;
  })}
  <LatexFormula id="legacy-count-example" x={962} y={410} size={28} maxWidth={510} color={C.gold}/>
  <rect x={730} y={460} width={462} height={37} rx={3} fill={C.line} fillOpacity={.3}/>
  <rect x={730} y={460} width={462*hit.probability*c} height={37} rx={3} fill={C.gold}/>
  <Label x={961} y={559} anchor="middle" size={47} color={C.gold}>{(hit.probability*c*100).toFixed(1)}%</Label>
 </g>;
};
