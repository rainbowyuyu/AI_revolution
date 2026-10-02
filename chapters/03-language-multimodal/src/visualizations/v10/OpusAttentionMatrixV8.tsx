import * as React from 'react';
import {attentionEvidence as A} from './evidence';
import {C, palette} from './primitives';
import type {SceneProps} from './primitives';
import {LatexFormula} from './LatexFormula';

// Claude Opus partial generation + Codex completion and numerical adaptation.
// The upstream response ended inside the Q-row map; the preserved original is
// research/v8/claude-formula/direct-full-matrix-02/response.partial.md.
// Retained ideas/code: shared quadratic route/packet geometry, continuous K-row
// transposition, q3-to-Q unfolding, evidence-derived attention, two-unit clock.
type Pt = {x:number;y:number};
const cl=(x:number)=>Math.max(0,Math.min(1,x));
const ss=(a:number,b:number,x:number)=>{const t=cl((x-a)/(b-a||1e-6));return t*t*(3-2*t);};
const mx=(a:number,b:number,t:number)=>a+(b-a)*t;

/** A quadratic curve and its moving packet always share the same geometry. */
const route=(a:Pt,b:Pt,bend:number)=>{
 const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
 const cx=len<1e-3?a.x:(a.x+b.x)/2-dy/len*bend;
 const cy=len<1e-3?a.y:(a.y+b.y)/2+dx/len*bend;
 return {len,d:`M${a.x} ${a.y}Q${cx} ${cy} ${b.x} ${b.y}`,
  at:(t:number):Pt=>{const m=1-t;return {x:m*m*a.x+2*m*t*cx+t*t*b.x,y:m*m*a.y+2*m*t*cy+t*t*b.y};},
  tan:(t:number):Pt=>({x:2*(1-t)*(cx-a.x)+2*t*(b.x-cx),y:2*(1-t)*(cy-a.y)+2*t*(b.y-cy)})};
};
const NUM:React.CSSProperties={fontFamily:"NotoSansSC,'Noto Sans SC',sans-serif",fontVariantNumeric:'tabular-nums'};
const Text=({x,y,children,size=27,color=C.ivory,opacity=1,anchor='middle'}:{x:number;y:number;children:React.ReactNode;size?:number;color?:string;opacity?:number;anchor?:'start'|'middle'|'end'})=><text x={x} y={y} fontSize={size} fill={color} opacity={opacity} textAnchor={anchor} style={NUM}>{children}</text>;
function Arrow({a,b,color=C.gold,opacity=1,width=3}:{a:Pt;b:Pt;color?:string;opacity?:number;width?:number}){
 const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy);if(l<.01)return null;
 const ux=dx/l,uy=dy/l,s=Math.min(9,l*.3),x=b.x-ux*s,y=b.y-uy*s;
 return <g opacity={opacity}><path d={`M${a.x} ${a.y}L${b.x} ${b.y}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round"/><path d={`M${b.x} ${b.y}L${x-uy*s*.45} ${y+ux*s*.45}L${x+uy*s*.45} ${y-ux*s*.45}Z`} fill={color}/></g>;
}
function Plate({x,y,w,h,color,opacity=1,depth=9}:{x:number;y:number;w:number;h:number;color:string;opacity?:number;depth?:number}){
 return <g opacity={opacity}><path d={`M${x} ${y}l${depth} ${-depth*.6}h${w}l${-depth} ${depth*.6}Z`} fill={color} opacity={.19}/><path d={`M${x+w} ${y}l${depth} ${-depth*.6}v${h}l${-depth} ${depth*.6}Z`} fill={color} opacity={.1}/><rect x={x} y={y} width={w} height={h} rx={5} fill={color} fillOpacity={.055} stroke={color} strokeOpacity={.24}/></g>;
}
const softmax=(r:number[])=>{const m=Math.max(...r),e=r.map(v=>Math.exp(v-m)),s=e.reduce((a,b)=>a+b,0);return e.map(v=>v/s);};
const raw=A.Q.map(q=>A.K.map(k=>q.reduce((s,v,d)=>s+v*k[d],0)));
const scaled=raw.map(r=>r.map(v=>v/Math.sqrt(A.Q[0].length)));
const weight=scaled.map(softmax);
const weighted=A.V.map((v,j)=>v.map(x=>x*weight[3][j]));
const chain:number[][]=[[0,0]];
weighted.forEach(v=>{const a=chain[chain.length-1];chain.push([a[0]+v[0],a[1]+v[1]]);});
const out=chain[4];
const lanes=[0,1,2,3];
const rowY=(i:number)=>205+i*78;
const gx=(j:number)=>740+j*88;
const kx=(j:number)=>360+j*72;
const qx=(c:number)=>180+c*58;

export function OpusAttentionMatrixV8({frame,durationInFrames,data}:SceneProps):React.ReactElement{
 const unitId=String(data?.unitId||''),fallbackP=cl(frame/Math.max(1,durationInFrames-1));
 const unitP=typeof data?.unitProgress==='number'?cl(data.unitProgress):fallbackP;
 const stageP=typeof data?.stageProgress==='number'?cl(data.stageProgress):fallbackP;
 const u=unitId==='v8-full-01'?unitP*.5:unitId==='v8-full-02'?.5+unitP*.5:stageP;
 const completeReading=!unitId;
 const appear=ss(0,.035,u),old=1-ss(.5,.525,u);
 const match=ss(.13,.205,u),scale=ss(.205,.28,u),soft=ss(.28,.385,u),value=ss(.397,.45,u),sum=ss(.44,.485,u);
 // First separate K rows into their future columns, then rotate within each
 // column. Simultaneous x/y interpolation crossed different keys' numerals.
 const keySpread=ss(.58,.635,u),transpose=ss(.635,.71,u);
 const qMove=ss(.635,.735,u),scoreMoveX=ss(.525,.58,u),scoreMoveY=ss(.58,.65,u);
 const matrixReveal=ss(.73,.855,u),norm=ss(.87,.965,u);
 const tableTitle=ss(.715,.765,u);
 const graph=(v:number[]):Pt=>({x:1095+v[0]*88,y:434-v[1]*113-v[0]*8});
 return <g>
  {/* Stable stage labels; no cyclic opacity or frame-local reset. */}
  <g opacity={old*appear}>
   <Text x={118} y={145} color={C.gold}>查询 Q</Text><Text x={262} y={145} color={C.cyan}>键 K</Text>
   <Text x={430} y={145} color={C.gold}>匹配</Text><LatexFormula id="divide-sqrt2" x={588} y={136} size={31} color={C.cyan} maxWidth={105}/>
   <Text x={750} y={145} color={palette[2]}>权重</Text><Text x={918} y={145} color={palette[3]}>内容 V</Text><Text x={1120} y={145}>相加</Text>
   <Text x={118} y={424} size={25} color={C.gold}>门边</Text>
  </g>

  {/* Q meets each Key. Packets stop at card edges, never pass over numerals. */}
  <g opacity={old*appear}>
   {lanes.map(j=>{
    const r1=route({x:152,y:322},{x:207,y:rowY(j)},-8+j*5);
    const r2=route({x:316,y:rowY(j)},{x:384,y:rowY(j)},j%2===0?-8:8);
    const t=ss(.13+j*.009,.174+j*.009,u),t2=ss(.15+j*.009,.178+j*.009,u);
    return <g key={`route-${j}`}><path d={r1.d} stroke={C.gold} strokeOpacity={.18} fill="none"/><path d={r2.d} stroke={C.cyan} strokeOpacity={.25} fill="none"/>
     <circle cx={r1.at(t).x} cy={r1.at(t).y} r={4} fill={C.gold} opacity={ss(0,.08,t)*(1-ss(.9,1,t))}/><circle cx={r2.at(t2).x} cy={r2.at(t2).y} r={4} fill={C.cyan} opacity={ss(0,.08,t2)*(1-ss(.9,1,t2))}/></g>;
   })}
  </g>

  {/* K retains its eight original values through the full transposition. */}
  {lanes.map(j=>{
   const x=mx(262,kx(j),keySpread),y=mx(rowY(j),322,transpose),w=mx(100,58,transpose),h=mx(48,128,transpose),col=palette[j];
   return <g key={`k-${j}`} opacity={appear}>
    <Plate x={x-w/2} y={y-h/2} w={w} h={h} color={col} depth={6}/>
    {A.K[j].map((v,c)=><Text key={c} x={x+(c?24:-24)*(1-transpose)} y={y+(c?32:-32)*transpose+9} color={col} size={26}>{v}</Text>)}
    <line x1={x-29} x2={x+29} y1={322} y2={322} stroke={col} strokeOpacity={transpose*.2}/>
   </g>;
  })}

  {/* One q3 instance moves from a vertical pair to Q's last row. */}
  <g opacity={appear}>
   <Plate x={mx(88,153,qMove)} y={mx(266,rowY(3)-32,qMove)} w={mx(60,114,qMove)} h={mx(112,64,qMove)} color={C.gold}/>
   {A.Q[3].map((v,c)=><Text key={c} x={mx(118,qx(c),qMove)} y={mx(c?362:300,rowY(3)+9,qMove)} color={C.gold}>{v}</Text>)}
  </g>
  {[0,1,2].map(i=>{
   const t=ss(.69+i*.013,.81+i*.013,u),y=mx(rowY(3),rowY(i),t),op=ss(.68,.88,t);
   return <g key={`q-${i}`} opacity={op}><Plate x={153} y={y-32} w={114} h={64} color={C.gold}/>{A.Q[i].map((v,c)=><Text key={c} x={qx(c)} y={y+9} color={C.gold}>{v}</Text>)}</g>;
  })}

  {/* The four original match scores travel into the final table's last row. */}
  {lanes.map(j=>{
   const x=mx(430,gx(j),scoreMoveX),y=mx(rowY(j),rowY(3),scoreMoveY);
   const current=mx(raw[3][j],weight[3][j],norm);
   return <g key={`score-${j}`} opacity={appear*ss(0,.18,match)}>
    <rect x={x-38} y={y-27} width={76} height={55} rx={4} fill={palette[j]} fillOpacity={mx(.11,.12+weight[3][j]*.35,norm)}/>
    <rect x={x-35} y={y+19} width={70*mx(raw[3][j]/4,weight[3][j],norm)} height={3} fill={palette[j]} opacity={.72}/>
    <Text x={x} y={y+9} color={C.gold} size={27}>{norm>.001?current.toFixed(3):raw[3][j]}</Text>
   </g>;
  })}

  <g opacity={old*appear}>
   {lanes.map(j=><g key={`pipeline-${j}`}>
    <Arrow a={{x:478,y:rowY(j)}} b={{x:534,y:rowY(j)}} color={C.cyan} opacity={.16+.38*scale} width={1.5}/>
    <rect x={546} y={rowY(j)-25} width={84} height={50} rx={3} fill={C.cyan} fillOpacity={.06+.08*scale}/>
    <Text x={588} y={rowY(j)+9} size={26} color={C.cyan} opacity={scale}>{scaled[3][j].toFixed(3)}</Text>
    <Arrow a={{x:638,y:rowY(j)}} b={{x:690,y:rowY(j)}} color={palette[2]} opacity={.16+.38*soft} width={1.5}/>
    <rect x={702} y={rowY(j)-25} width={96} height={50} rx={3} fill={palette[j]} fillOpacity={.06}/><rect x={702} y={rowY(j)+23} width={96*weight[3][j]*soft} height={4} rx={2} fill={palette[j]}/>
    <Text x={750} y={rowY(j)+9} size={26} color={palette[j]} opacity={soft}>{weight[3][j].toFixed(3)}</Text>
    <Text x={842} y={rowY(j)+9} size={24} color={C.muted} opacity={value}>×</Text>
    <Text x={918} y={rowY(j)+9} size={26} color={palette[j]} opacity={value}>[{A.V[j].join(', ')}]</Text>
   </g>)}
   <g opacity={value}>
    {[-.6,0,.6,1.2].map((v,i)=><g key={i}><path d={`M${graph([v,-.15]).x} ${graph([v,-.15]).y}L${graph([v,1.5]).x} ${graph([v,1.5]).y}`} stroke={C.line} strokeOpacity={.16}/><path d={`M${graph([-.6,v]).x} ${graph([-.6,v]).y}L${graph([1.2,v]).x} ${graph([1.2,v]).y}`} stroke={C.line} strokeOpacity={.16}/></g>)}
    {lanes.map(j=>{const move=sum,a=chain[j].map(v=>v*move),b=weighted[j].map((v,d)=>a[d]+v);return <Arrow key={j} a={graph(a)} b={graph(b)} color={palette[j]} width={4}/>;})}
    <Arrow a={graph([0,0])} b={graph(out)} color={C.ivory} width={2} opacity={ss(.75,1,sum)}/>
    <Text x={1120} y={517} color={C.gold} size={25} opacity={sum}>[{out.map(v=>v.toFixed(3)).join(', ')}]</Text>
   </g>
  </g>

  {/* Other queries expand into the genuine, unmasked 4×4 table. */}
  {[0,1,2].map(i=>lanes.map(j=>{
   const t=ss(.735+i*.018+j*.005,.82+i*.018+j*.005,u),y=mx(rowY(3),rowY(i),t),op=ss(.65,.92,t),v=mx(raw[i][j],weight[i][j],norm);
   return <g key={`cell-${i}-${j}`} opacity={op}><Plate x={gx(j)-38} y={y-27} w={76} h={55} color={C.cyan} depth={6}/><rect x={gx(j)-35} y={y+19} width={70*mx(Math.max(0,raw[i][j])/4,weight[i][j],norm)} height={3} fill={C.cyan} opacity={.35}/><Text x={gx(j)} y={y+9} color={C.cyan} size={27}>{norm>.001?v.toFixed(3):raw[i][j]}</Text></g>;
  }))}
  <g opacity={ss(.71,.765,u)}>
   <LatexFormula id="q-dims" x={210} y={133} color={C.gold} size={31} maxWidth={180}/><LatexFormula id="kt-dims" x={468} y={133} color={C.cyan} size={31} maxWidth={195}/>
   <Text x={309} y={333} size={32}>×</Text><Text x={658} y={333} size={32}>→</Text>
  </g>
  <LatexFormula id={norm>.5?'w-dims':'qkt-dims'} x={872} y={132} color={C.gold} opacity={tableTitle} size={norm>.5?25:30} maxWidth={355}/>
  <g opacity={matrixReveal}>
   {lanes.map(i=><Text key={i} x={1115} y={rowY(i)+9} color={i===3?C.gold:C.muted} size={26} anchor="start">{A.tokens[i]}</Text>)}
  </g>
  <Text x={650} y={548} color={C.muted} size={28} opacity={completeReading?1:matrixReveal}>{completeReading?'完整阅读 · 所有位置一起计算':'每一行是一个查询 · 每一列是一个键'}</Text>
 </g>;
}
