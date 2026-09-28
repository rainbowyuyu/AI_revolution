import React from 'react';

const GOLD='#d9bb8e',CYAN='#91cdd1',IVORY='#f8efdb',MUTED='#b3babe',STOP='#d49d88';
const FONT="'NotoSansSC','PingFang SC',sans-serif";
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{v=clamp(v);return v*v*(3-2*v)};
const cubic=(a:number,b:number,c:number,d:number,t:number)=>(1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d;
const hash=(i:number)=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v)};
type Props={progress:number;frame:number;variant?:string;idPrefix?:string;imageSrc?:string;samplePoints?:number[][];nextSamplePoints?:number[][];referencePoints?:number[][];fieldValues?:number[]};

/** The Opus R3 spatial scene was locally split into four narrated operations.
 * All point/field arrays come from recorded data. Frozen combinations are explicitly
 * update-direction illustrations, not a replay of one saved optimizer step. */
export function GanLesson({progress,idPrefix='gan',variant='generator',samplePoints=[],nextSamplePoints=[],referencePoints=[],fieldValues=[]}:Props){
 const p=clamp(progress),pid=(s:string)=>`${idPrefix}-${s}`;
 const dUpdate=variant==='d-update',gUpdate=variant==='g-update',discriminator=variant==='discriminator';
 const zoom=dUpdate?1+.12*smooth(p):1;
 const center=dUpdate?[772,206]:gUpdate?[735,218]:[735,204];
 const project=(v:number[]):[number,number]=>[center[0]+v[0]*(dUpdate?63:gUpdate?58:75)*zoom,center[1]-v[1]*(gUpdate?24:43)*zoom+v[0]*6*zoom];
 const text=(x:number,y:number,value:string,color=IVORY,size=26,anchor:'middle'|'start'|'end'='middle')=><text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontSize={size} fontWeight={530} fill={color}>{value}</text>;
 const lock=(x:number,y:number)=><g transform={`translate(${x} ${y})`} fill="none" stroke={MUTED} strokeWidth={2.2}><path d="M -7 0 V -7 C -7 -17,7 -17,7 -7 V 0"/><rect x={-11} y={0} width={22} height={17} rx={3}/><circle cx={0} cy={8} r={1.2} fill={MUTED}/></g>;
 const network=(x:number,y:number,size:number,label:string,active:boolean)=>{
  const nodes=[[-1,-.9],[-1,-.3],[-1,.3],[-1,.9],[0,-.65],[0,0],[0,.65],[1,-.3],[1,.3]];
  return <g>{[0,1,2,3].flatMap(a=>[4,5,6].map(b=><line key={`a${a}-${b}`} x1={x+nodes[a][0]*size} y1={y+nodes[a][1]*size} x2={x+nodes[b][0]*size} y2={y+nodes[b][1]*size} stroke={CYAN} opacity={active?.25+.22*Math.sin(p*3+a+b):.24}/>))}{[4,5,6].flatMap(a=>[7,8].map(b=><line key={`b${a}-${b}`} x1={x+nodes[a][0]*size} y1={y+nodes[a][1]*size} x2={x+nodes[b][0]*size} y2={y+nodes[b][1]*size} stroke={GOLD} opacity={active?.33+.20*Math.sin(p*4+a+b):.25}/>))}{nodes.map((n,i)=><circle key={i} cx={x+n[0]*size} cy={y+n[1]*size} r={active?4.6+1.3*Math.sin(p*4+i):4.6} fill={i>6?GOLD:CYAN} opacity={active?.95:.54}/>)}{text(x,y-size-32,label,IVORY,33)}</g>
 };
 const cloud=(points:number[][],x:number,y:number,color:string,sx=24,sy=18)=><g>{points.slice(0,80).map((v,i)=><circle key={i} cx={x+v[0]*sx} cy={y-v[1]*sy} r={2.8} fill={color} opacity={.45+.42*(i%5)/4}/>)}</g>;
 const field=<g>{fieldValues.map((v,i)=>{const ix=Math.floor(i/25),iy=i%25,x=-3+ix/4,y=-3+iy/4,d=.25;const points=[[x-d/2,y-d/2],[x+d/2,y-d/2],[x+d/2,y+d/2],[x-d/2,y+d/2]].map(project).map(q=>q.join(',')).join(' ');return <polygon key={i} points={points} fill={CYAN} opacity={.04+clamp(v)*.39}/>;})}</g>;
 const plot=<g>{field}{referencePoints.map((pt,i)=>{const [x,y]=project(pt);return <circle key={`r${i}`} cx={x} cy={y} r={3.3} fill={CYAN} opacity={.50}/>;})}{samplePoints.map((pt,i)=>{const [x,y]=project(pt);return <g key={`s${i}`}><circle cx={x} cy={y} r={8.2} fill={`url(#${pid('glow')})`}/><circle cx={x} cy={y} r={3.6} fill={GOLD} opacity={.95}/></g>;})}</g>;
 const arrow=(path:string,color:string,opacity=.75)=><path d={path} fill="none" stroke={color} strokeWidth={2.1} opacity={opacity} markerEnd={`url(#${pid(color===CYAN?'cyan-arrow':'gold-arrow')})`}/>;
 const defs=<defs><radialGradient id={pid('glow')}><stop offset="0%" stopColor={GOLD} stopOpacity={.55}/><stop offset="100%" stopColor={GOLD} stopOpacity={0}/></radialGradient>{[['gold-arrow',GOLD],['cyan-arrow',CYAN]].map(([name,color])=><marker key={name} id={pid(name)} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={5} markerHeight={5} orient="auto"><path d="M 0 1 L 9 5 L 0 9" fill="none" stroke={color} strokeWidth={1.5}/></marker>)}</defs>;
 if(discriminator){
  const t=smooth(p),x=cubic(190,250,260,299,t),yA=cubic(105,105,204,204,t),yB=cubic(301,301,227,227,t);
  return <g>{defs}{text(115,28,'真实样本',CYAN)}{text(115,408,'生成候选',GOLD)}{cloud(referencePoints,112,109,CYAN)}{cloud(samplePoints,112,295,GOLD)}{arrow('M 190 105 C 250 105,260 204,299 204',CYAN)}{arrow('M 190 301 C 250 301,260 227,299 227',GOLD)}<circle cx={x} cy={yA} r={5.5} fill={CYAN}/><circle cx={x} cy={yB} r={5.5} fill={GOLD}/>{network(350,212,43,'D · 判断来源',true)}{arrow('M 408 212 L 495 212',CYAN)}{plot}{text(735,26,'同一判断场',CYAN)}{text(735,398,'青：真实样本    金：生成候选',MUTED,25)}{text(350,345,'两类样本，共用参数',MUTED,24)}</g>;
 }
 if(dUpdate){
  const t=smooth(p),backX=440-(440-309)*t;
  return <g>{defs}{network(85,208,35,'G',false)}{lock(85,97)}{text(85,356,'保持不变',MUTED,24)}{arrow('M 137 208 L 189 208',GOLD)}{cloud(samplePoints,236,208,GOLD,13,12)}{text(236,112,'固定候选',GOLD,24)}{arrow('M 277 208 L 366 208',GOLD)}{network(421,208,39,'D',true)}{text(421,92,'只更新检查者',CYAN,24)}{arrow('M 476 208 L 532 208',CYAN)}{plot}{text(772,28,'判别场随着更新改变',CYAN,25)}<path d="M 443 286 L 309 286" fill="none" stroke={GOLD} strokeWidth={2.4}/><path d="M 307 286 L 120 286" fill="none" stroke={MUTED} strokeDasharray="5 8" opacity={.27}/><circle cx={backX} cy={286} r={5.5} fill={GOLD}/><path d="M 307 266 L 307 306" stroke={STOP} strokeWidth={4}/>{text(308,343,'detach()',STOP,24)}{text(308,374,'梯度在这里停止',MUTED,22)}{text(772,398,'位置不动，颜色随判断变化',MUTED,24)}</g>;
 }
 if(gUpdate){
  const t=smooth(p),fx=cubic(950,966,305,219,t),fy=cubic(327,375,375,285,t);
  return <g>{defs}{network(174,208,57,'G · 更新参数',true)}{arrow('M 244 206 C 332 167,404 197,493 206',GOLD)}{plot}{lock(923,25)}{text(735,29,'D · 判断场固定',CYAN,26)}{samplePoints.filter((_,i)=>i%12===0).map((pt,i)=>{const other=nextSamplePoints[i*12];if(!other)return null;const [x,y]=project(pt),[nx,ny]=project(other),dx=nx-x,dy=ny-y,l=Math.hypot(dx,dy),s=l>0?Math.min(38/l,1):0;return l<.5?null:<path key={i} d={`M ${x} ${y} L ${x+dx*s} ${y+dy*s}`} stroke={GOLD} strokeWidth={1.3} opacity={.82} markerEnd={`url(#${pid('gold-arrow')})`}/>;})}<path d="M 950 327 C 966 375,305 375,219 285" fill="none" stroke={GOLD} strokeWidth={1.8} opacity={.64}/><circle cx={fx} cy={fy} r={6} fill={IVORY}/>{text(174,358,'顺着反馈改变输出',GOLD,24)}{text(690,402,'场保持不变，金色候选在移动',MUTED,24)}</g>;
 }
 const vecs=Array.from({length:12},(_,i)=>({x:39+i%3*79,y:89+Math.floor(i/3)*61,values:[0,1,2,3].map(j=>hash(i*7+j))}));
 const fx=cubic(941,966,399,366,p),fy=cubic(318,376,376,292,p);
 return <g>{defs}{text(142,28,'随机向量 z',GOLD)}{vecs.map((v,i)=><g key={i}>{v.values.map((n,j)=><rect key={j} x={v.x+j*15} y={v.y-9} width={10} height={13+n*23} rx={2} fill={GOLD} opacity={.34+n*.53}/>)}</g>)}{network(369,208,38,'G · 生成器',true)}{arrow('M 260 208 L 315 208',GOLD)}{arrow('M 421 208 L 493 208',GOLD)}{plot}{text(735,28,'早期生成候选',GOLD)}<path d="M 941 318 C 966 376,399 376,366 292" fill="none" stroke={GOLD} strokeWidth={1.5} strokeDasharray="5 8" opacity={.46}/><circle cx={fx} cy={fy} r={5.5} fill={IVORY}/>{text(735,398,'初始化 → 最初 150 次更新',MUTED,24)}</g>;
}
