import React from 'react';
import {attentionEvidence as A} from './evidence';
import {OpusAttentionMatrixV8} from './OpusAttentionMatrixV8';
import {LatexFormula} from './LatexFormula';
import {C,SceneProps,clamp,mix,segment,softmax,palette} from './primitives';

// Core lessons are local adaptations of the successful OpusWeightedValues plane.
// The full formula imports a real Claude partial response completed by Codex;
// precise provenance is in research/v8/claude-formula/completion-adaptation.md.
type P=[number,number];
type Phase='qkv'|'dot'|'scale'|'softmax'|'weighted'|'full'|'norm'|'loss';
const q=A.Q[3],keys=A.K,values=A.V;
const dots=keys.map(k=>k.reduce((s,v,i)=>s+v*q[i],0));
const scores=dots.map(v=>v/Math.sqrt(q.length));
const exps=scores.map(Math.exp),denominator=exps.reduce((s,v)=>s+v,0);
const weights=exps.map(v=>v/denominator);
const weighted=values.map((v,i)=>v.map(x=>x*weights[i]));
const output=[0,1].map(d=>weighted.reduce((s,v)=>s+v[d],0));
const f=(n:number,d=2)=>Number(n.toFixed(d)).toString();
const vec=(v:number[],d=2)=>`[${v.map(x=>f(x,d)).join(', ')}]`;
const chain:P[]=[[0,0]];
weighted.forEach(v=>{const a=chain[chain.length-1];chain.push([a[0]+v[0],a[1]+v[1]])});

function Txt({x,y,children,size=29,color=C.ivory,anchor='start',opacity=1,weight=500}:{x:number;y:number;children:React.ReactNode;size?:number;color?:string;anchor?:'start'|'middle'|'end';opacity?:number;weight?:number}){
 return <text x={x} y={y} fontSize={size} fill={color} textAnchor={anchor} opacity={opacity} fontWeight={weight} fontFamily="NotoSansSC,'Noto Sans SC',sans-serif" style={{fontVariantNumeric:'tabular-nums'}}>{children}</text>;
}
function Arrow({a,b,color=C.gold,width=4,opacity=1}:{a:P;b:P;color?:string;width?:number;opacity?:number}){
 const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<.5)return <circle cx={a[0]} cy={a[1]} r={2} fill={color} opacity={opacity}/>;
 const ux=dx/len,uy=dy/len,h=Math.min(12,len*.25),bx=b[0]-ux*h,by=b[1]-uy*h;
 return <g opacity={opacity}><path d={`M${a}L${b}`} stroke={color} strokeWidth={width} strokeLinecap="round"/><path d={`M${b}L${bx-uy*h*.45},${by+ux*h*.45}L${bx+uy*h*.45},${by-ux*h*.45}Z`} fill={color}/></g>;
}
function Plane({project,opacity=.18}:{project:(x:number,y:number)=>P;opacity?:number}){
 return <g opacity={opacity}>{[-1,0,1,2,3].map(i=><g key={i}><path d={`M${project(i,-.7)}L${project(i,2.6)}`} stroke={C.line}/><path d={`M${project(-1.3,i)}L${project(2.5,i)}`} stroke={C.line}/></g>)}</g>;
}
function PrismBar({x,base,h,w=96,color=C.gold,depth=14}:{x:number;base:number;h:number;w?:number;color?:string;depth?:number}){
 const y=base-h;return <g><path d={`M${x+w},${base}L${x+w+depth},${base-depth*.65}V${y-depth*.65}L${x+w},${y}Z`} fill={color} opacity={.18}/><path d={`M${x},${y}L${x+depth},${y-depth*.65}H${x+w+depth}L${x+w},${y}Z`} fill={color} opacity={.52}/><rect x={x} y={Math.min(y,base)} width={w} height={Math.max(.5,Math.abs(h))} rx={3} fill={color} opacity={.62}/></g>;
}
function Route({a,b,t,color}:{a:P;b:P;t:number;color:string}){
 const bend=Math.min(75,Math.abs(b[1]-a[1])*.45),c:P=[a[0]+(b[0]-a[0])*.5,a[1]],d:P=[b[0]-(b[0]-a[0])*.5,b[1]];
 const p=clamp(t),z=1-p,pt:P=[z*z*z*a[0]+3*z*z*p*c[0]+3*z*p*p*d[0]+p*p*p*b[0],z*z*z*a[1]+3*z*z*p*c[1]+3*z*p*p*d[1]+p*p*p*b[1]];
 return <g><path d={`M${a}C${c} ${d} ${b}`} stroke={color} strokeWidth={2} fill="none" opacity={.28}/><circle cx={pt[0]} cy={pt[1]} r={5.5} fill={color} opacity={segment(t,0,.08)}/></g>;
}
const titles:Record<Phase,string>={qkv:'同一份输入，分成三种用途',dot:'把一次匹配，算给你看',scale:'控制分数的尺度',softmax:'从匹配分数，到一份信息配方',weighted:'让权重真正改变内容',full:'把整条计算连起来',norm:'让特征先回到共同尺度',loss:'正确答案的概率，决定代价'};

// Pair/triple clocks are anchored by sentence IDs. End of 01 and start of 02
// have identical geometry even when the wrapper's stage progress resets.
function clock(p:SceneProps,phase:Phase){
 const id=String(p.data?.unitId||''),match=id.match(/v8-[a-z]+-(\d+)$/),count=phase==='softmax'?3:2;
 const unit=clamp(Number(p.data?.unitProgress??p.data?.progress??((p.phaseFrame??p.frame)/Math.max(1,p.durationInFrames-1))));
 const index=match?Math.max(0,Math.min(count-1,Number(match[1])-1)):Math.min(count-1,Math.floor(clamp(Number(p.data?.stageProgress??unit))*(count-.00001)));
 const stage=match?(index+unit)/count:clamp(Number(p.data?.stageProgress??unit));
 return {u:stage,l:match?unit:clamp(stage*count-index),index};
}
function Qkv({u}:{u:number}){
 const split=segment(u,.04,.39),join=segment(u,.52,.75),train=segment(u,.69,.94);
 const matrix=[A.Q,A.K,A.V],names=['Q · 查询','K · 匹配线索','V · 传递内容'],colors=[C.gold,C.cyan,palette[2]];
 return <g>
  <g><Txt x={172} y={177} size={29} color={C.gold} anchor="middle">门边 · 输入 X</Txt>{[.5,.84,.34,.66].map((v,i)=><PrismBar key={i} x={114+i*33} base={358} h={150*v} w={23} depth={8} color={C.ivory}/>)}<Txt x={172} y={415} size={27} anchor="middle">同一份材料</Txt></g>
  {matrix.map((m,h)=>{const y=148+h*156,col=colors[h];return <g key={h}>
   <Route a={[259,292]} b={[474,y+29]} color={col} t={segment(split,h*.12,.68+h*.12)}/>
   <g transform={`translate(479 ${y-28})`}><path d="M0 0L112 -12L139 10L27 22Z" fill={col} opacity={.2}/><path d="M27 22L139 10V95L27 107Z" fill={col} opacity={.075} stroke={col} strokeOpacity={.4}/>{Array.from({length:9},(_,i)=><rect key={i} x={40+i%3*29} y={28+Math.floor(i/3)*23} width={18} height={15} fill={col} opacity={.14+.18*split+.14*Math.sin(train*Math.PI+i*.7)}/>)}</g>
   <LatexFormula id={['wq','wk','wv'][h]} x={551} y={y+109} size={32} color={col} maxWidth={125}/>
   <Route a={[632,y+27]} b={[756,y+27]} color={col} t={segment(split,.22+h*.08,.7+h*.08)}/>
   <Txt x={861} y={y-42} size={29} color={col} anchor="middle">{names[h]}</Txt>
   {m[3].map((v,c)=><g key={c}><path d={`M${778+c*69} ${y-8}l9 -7h59l-9 7Z`} fill={col} opacity={.17}/><rect x={778+c*69} y={y-8} width={59} height={60} fill={col} fillOpacity={.13} stroke={col} strokeOpacity={.4}/><Txt x={807+c*69} y={y+33} size={31} color={C.ivory} anchor="middle">{v}</Txt></g>)}
   <Route a={[911,y+26]} b={[1120,h===2?490:258]} color={col} t={join}/>
  </g>})}
  <Txt x={1120} y={222} anchor="middle" color={C.gold} size={29} opacity={join}>比较</Txt><Txt x={1120} y={538} anchor="middle" color={palette[2]} size={29} opacity={join}>内容</Txt>
 </g>;
}
function Dot({u}:{u:number}){
 // Finish before the measured “二乘二是四” cue at local frame 270/388.
 const mul=segment(u,.31,.347),add=segment(u,.5,.555),proj=segment(u,.625,.805),origin:P=[208,405],pr=(x:number,y:number):P=>[origin[0]+x*123,origin[1]-y*123];
 const qt=pr(q[0],q[1]),kt=pr(keys[1][0],keys[1][1]),foot=pr(q[0],0);
 const qDraw=segment(u,.035,.15),kDraw=segment(u,.16,.27),draw=(v:P,k:number):P=>[mix(origin[0],v[0],k),mix(origin[1],v[1],k)];
 return <g>
  <Plane project={pr}/><path d={`M${pr(-.2,0)}L${pr(2.65,0)}M${pr(0,-.2)}L${pr(0,1.85)}`} stroke={C.line} strokeWidth={2}/>
  <Arrow a={origin} b={draw(qt,qDraw)} color={C.gold} width={5}/><Arrow a={origin} b={draw(kt,kDraw)} color={C.cyan} width={5}/>
  <Txt x={200} y={171} color={C.gold}>门边的 Q = {vec(q)}</Txt><Txt x={200} y={496} color={C.cyan}>靠在的 K = {vec(keys[1])}</Txt>
  <path d={`M${qt}L${[qt[0],mix(qt[1],foot[1],proj)]}`} stroke={C.gold} strokeWidth={2} strokeDasharray="6 7" opacity={proj}/><path d={`M${origin}L${foot}`} stroke={C.gold} strokeWidth={12} strokeOpacity={proj*.23}/>
  <circle cx={qt[0]} cy={mix(qt[1],foot[1],proj)} r={6} fill={C.gold} opacity={proj}/><path d={`M${foot[0]-17},${foot[1]}v-17h17`} stroke={C.gold} fill="none" opacity={proj}/>
  <g><Txt x={671} y={160} size={31} color={C.muted}>相同位置相乘</Txt>
   {[0,1].map(i=><g key={i}><LatexFormula id={`dot-product-${i}`} x={671} y={215+i*99} size={34} color={i?C.cyan:C.gold} anchor="start" maxWidth={145}/><rect x={832} y={200+i*99} width={250} height={32} rx={4} fill={C.line} opacity={.18}/><rect x={832} y={200+i*99} width={250*(q[i]*keys[1][i]/4)*mul} height={32} rx={4} fill={i?C.cyan:C.gold}/><Txt x={1130} y={226+i*99} color={i?C.cyan:C.gold} size={34} anchor="middle">{f(q[i]*keys[1][i]*mul)}</Txt></g>)}
   <path d="M711 384H1150" stroke={C.line}/><LatexFormula id="four-add" x={911} y={440} size={44} color={C.gold} opacity={add} maxWidth={440}/>
  </g><Txt x={660} y={548} size={28} anchor="middle" opacity={proj}>投影长度 2 × 键的长度 2 = 4</Txt>
 </g>;
}
function Scale({u,l,index}:{u:number;l:number;index:number}){
 const shrink=segment(u,.1,.28),open=segment(u,.5,.61),magnify=index===1?segment(l,.03,.3)*(1-segment(l,.48,.69)):0;
 const factor=mix(1,1/Math.sqrt(2),shrink)*(1+2*magnify),actual=dots.map(d=>d*factor),ww=softmax(actual),base=467,sc=73/(1+1.6*magnify);
 return <g>
  <Txt x={73} y={118} size={28} color={C.cyan}>每个键 2 个坐标</Txt><LatexFormula id="scale-dim" x={1135} y={107} anchor="end" color={C.cyan} size={31} maxWidth={170}/>
  {dots.map((v,i)=>{const x=mix(150+i*260,115+i*167,open),height=actual[i]*sc;return <g key={i}><PrismBar x={x} base={base} h={height} w={mix(114,83,open)} color={palette[i]}/><Txt x={x+mix(57,41,open)} y={507} anchor="middle" size={28} color={palette[i]}>{A.tokens[i]}</Txt><Txt x={x+mix(57,41,open)} y={base-height-27} anchor="middle" size={32} color={palette[i]}>{actual[i].toFixed(3)}</Txt></g>})}
  <g opacity={open}><Txt x={1020} y={172} size={28} anchor="middle" color={C.muted}>对应的权重</Txt>{ww.map((w,i)=><g key={i}><Txt x={835} y={233+i*70} size={25} color={palette[i]}>{A.tokens[i]}</Txt><rect x={909} y={211+i*70} width={w*242} height={28} rx={3} fill={palette[i]}/><Txt x={1231} y={233+i*70} size={26} anchor="end" color={palette[i]}>{(w*100).toFixed(1)}%</Txt></g>)}</g>
  {index===0?<LatexFormula id="four-scale" x={650} y={543} size={34} color={C.gold}/>:<Txt x={650} y={550} size={30} anchor="middle" color={C.gold}>尺度放大，分配更集中；缩放后，更多位置参与</Txt>}
 </g>;
}
function Softmax({u}:{u:number}){
 const exponent=segment(u,.018,.15),normalize=segment(u,(1+.34)/3,(1+.61)/3),spread=segment(u,.75,.88);
 let cum=0;const starts=weights.map(v=>{const x=cum;cum+=v;return x});
 return <g>
  <Txt x={650} y={118} anchor="middle" size={31} color={C.gold}>{u<1/3?'先取指数，得到正数':`总和 = ${denominator.toFixed(2)}，每项除以这个总数`}</Txt>
  {scores.map((s,i)=>{const value=mix(s,exps[i],exponent),barHeight=value/mix(4,Math.max(...exps),exponent)*280,x=mix(158+i*280,121+starts[i]*1058,normalize),w=mix(110,weights[i]*1058,normalize),y=mix(456-barHeight,263,normalize),h=mix(barHeight,111,normalize);return <g key={i}>
   <path d={`M${x+w} ${y+h}l10 -7V${y-7}l-10 7Z`} fill={palette[i]} opacity={.22*(1-normalize)}/><rect x={x} y={y} width={w} height={h} fill={palette[i]} opacity={.66}/>
   <Txt x={mix(213+i*280,122+1058*(starts[i]+weights[i]/2),normalize)} y={483} anchor="middle" size={27} color={palette[i]}>{A.tokens[i]}</Txt>
   <Txt x={mix(213+i*280,122+1058*(starts[i]+weights[i]/2),normalize)} y={528} anchor="middle" size={27} color={palette[i]}>{normalize>.98?`${(weights[i]*100).toFixed(1)}%`:value.toFixed(2)}</Txt>
  </g>})}
  <g opacity={spread}><path d="M122 389v13M122 402H1180M1180 389v13" stroke={C.ivory} strokeOpacity={.7} strokeWidth={2}/><Txt x={650} y={436} size={28} color={C.gold} anchor="middle">完整的一份 · 权重相加等于 1</Txt></g>
 </g>;
}
function Weighted({u,l,index}:{u:number;l:number;index:number}){
 const chosen=segment(u,.21,.295),others=segment(u,.5,.555),join=segment(u,.555,.655),zoom=1+.34*join;
 const pr=(x:number,y:number):P=>[770+x*188*zoom,463-y*152*zoom-x*8];
 return <g>
  <Plane project={pr} opacity={.25}/>
  {values.map((v,i)=>{const shrink=i===1?chosen:others,a:P=[chain[i][0]*join,chain[i][1]*join],wv:P=[mix(v[0],weighted[i][0],shrink),mix(v[1],weighted[i][1],shrink)],b:P=[a[0]+wv[0],a[1]+wv[1]],color=palette[i],y=174+i*88;return <g key={i}>
   <Txt x={68} y={y} color={color} size={29}>{A.tokens[i]}</Txt><Txt x={195} y={y} size={27} color={color}>{vec(v)} × {weights[i].toFixed(3)}</Txt><Txt x={200} y={y+35} size={25} color={C.muted}>{vec(wv,3)}</Txt>
   <Arrow a={pr(0,0)} b={pr(v[0],v[1])} color={color} opacity={.09} width={2}/>
   <Arrow a={pr(a[0],a[1])} b={pr(b[0],b[1])} color={color} opacity={i===1?1:mix(.24,1,others)} width={5}/>
   <circle cx={pr(a[0],a[1])[0]} cy={pr(a[0],a[1])[1]} r={4} fill={color}/>
  </g>})}
  <Arrow a={pr(0,0)} b={pr(output[0],output[1])} color={C.ivory} width={3} opacity={segment(join,.76,1)}/>
  <Txt x={935} y={169} anchor="middle" color={C.gold} size={35} opacity={segment(join,.65,1)}>{vec(output,3)}</Txt>
  <Txt x={935} y={530} anchor="middle" size={29} color={C.cyan}>{index===0?'先缩短「靠在」这支箭头':'其余内容缩放后，首尾相接'}</Txt>
 </g>;
}
const nx=[1.4,2.2,1.1,2.9,2.4,1.7],mu=nx.reduce((s,v)=>s+v,0)/nx.length,variance=nx.reduce((s,v)=>s+(v-mu)**2,0)/nx.length,epsilon=1e-5;
const gamma=[1.1,.85,1.05,.92,1.15,.9],beta=[.1,-.2,.15,-.12,.16,.05];
function Norm({u}:{u:number}){
 const center=segment(u,.19,.34),divide=segment(u,.505,.61),affine=segment(u,.79,.92),base=357,scale=70,meanY=base-(mu*(1-center))*scale;
 return <g>
  <Txt x={650} y={126} size={29} anchor="middle" color={C.cyan}>同一个位置的 6 个特征</Txt>
  <path d="M85 357H1210" stroke={C.ivory} strokeOpacity={.3}/><Txt x={65} y={366} anchor="end" color={C.muted} size={24}>0</Txt>
  <path d={`M85 ${meanY}H1210`} stroke={C.gold} strokeWidth={2} strokeDasharray="7 7" opacity={1-divide}/><Txt x={1180} y={meanY-18} anchor="end" color={C.gold} size={27} opacity={1-divide}>当前均值 = {(mu*(1-center)).toFixed(2)}</Txt>
  {nx.map((x,i)=>{const centered=x-mu,normalized=centered/Math.sqrt(variance+epsilon),val=mix(mix(x,x-mu,center),normalized,divide),result=mix(val,normalized*gamma[i]+beta[i],affine),xx=138+i*179;return <g key={i}><PrismBar x={xx} base={base} h={result*scale} w={79} depth={12} color={palette[i%4]}/><Txt x={xx+40} y={508} anchor="middle" size={27} color={palette[i%4]}>{result.toFixed(2)}</Txt></g>})}
  {u<.5?<Txt x={650} y={550} size={28} anchor="middle" color={C.muted}>整排减去原均值 1.95，零成为新的中心</Txt>:u<.79?<g><LatexFormula id="norm-stats" x={520} y={542} size={28} color={C.muted} maxWidth={440}/><Txt x={797} y={551} size={27} color={C.muted}>保证分母大于零</Txt></g>:<Txt x={650} y={550} size={28} anchor="middle" color={C.muted}>最后学习每个特征的拉伸与平移</Txt>}
 </g>;
}
function Loss({u,l,index}:{u:number;l:number;index:number}){
 const moved=segment(u,.22,.28),compare=segment(u,.595,.715),average=segment(u,.83,.91),p=mix(.1,.8,moved),prob=mix(p,.04,compare),loss=-Math.log(prob),origin:P=[155,441],w=573,h=260;
 const map=(x:number):P=>[origin[0]+x*w,origin[1]-(-Math.log(x)/3.4)*h];
 const curve=Array.from({length:151},(_,i)=>{const t=.035+i*.965/150;return `${i?'L':'M'}${map(t)}`}).join(' '),pt=map(prob);
 const candidates=[mix(.8,.04,compare),mix(.12,.91,compare),mix(.08,.05,compare)];
 return <g>
  <path d={`M${origin[0]},150V${origin[1]}H758`} fill="none" stroke={C.line} strokeWidth={2}/><path d={curve} fill="none" stroke={C.cyan} strokeWidth={4}/>
  <path d={`M${pt}V${origin[1]}M${origin[0]},${pt[1]}H${pt[0]}`} stroke={C.gold} strokeDasharray="5 7" opacity={.5}/><circle cx={pt[0]} cy={pt[1]} r={11} fill={C.gold}/><circle cx={pt[0]} cy={pt[1]} r={23} fill="none" stroke={C.gold} strokeOpacity={.25}/>
  <Txt x={128} y={166} size={25} color={C.muted} anchor="end">L</Txt><Txt x={755} y={481} size={25} color={C.muted} anchor="end">正确词的概率 p</Txt>
  <Txt x={400} y={522} size={33} color={C.gold} anchor="middle">p = {prob.toFixed(2)} · L = {loss.toFixed(2)}</Txt>
  <g opacity={compare}><Txt x={1023} y={168} size={29} anchor="middle">很自信，也可能猜错</Txt>{candidates.map((v,i)=><g key={i}><Txt x={850} y={237+i*81} color={i===0?C.gold:i===1?C.rose:C.muted} size={26}>{['正确词','错误词','其他'][i]}</Txt><rect x={952} y={211+i*81} width={230*v} height={31} rx={3} fill={i===0?C.gold:i===1?C.rose:C.muted}/><Txt x={1212} y={237+i*81} anchor="end" color={i===0?C.gold:i===1?C.rose:C.muted} size={27}>{(v*100).toFixed(0)}%</Txt></g>)}</g>
  <g opacity={average}>{[.1,.8,.3,.6,.04].map((v,i)=><rect key={i} x={875+i*68} y={512-(-Math.log(v))*21} width={31} height={-Math.log(v)*21} fill={palette[i%4]} opacity={.5}/>)}<path d={`M862 ${512-[.1,.8,.3,.6,.04].reduce((s,v)=>s-Math.log(v),0)/5*21}H1210`} stroke={C.gold} strokeWidth={2}/><Txt x={1035} y={552} size={26} anchor="middle" color={C.gold}>各位置的损失 → 求平均</Txt></g>
 </g>;
}
export const AttentionFormulaLessonV8:React.FC<SceneProps>=p=>{
 const raw=String(p.phase||p.data?.formulaMode||'full'),phase:Phase=(raw==='overview'?'full':raw) as Phase,mode=titles[phase]?phase:'full',t=clock(p,mode);
 const body=mode==='qkv'?<Qkv {...t}/>:mode==='dot'?<Dot {...t}/>:mode==='scale'?<Scale {...t}/>:mode==='softmax'?<Softmax {...t}/>:mode==='weighted'?<Weighted {...t}/>:mode==='full'?<OpusAttentionMatrixV8 {...p}/>:mode==='norm'?<Norm {...t}/>:<Loss {...t}/>;
 const formulaId=mode!=='full'?mode:t.u<.13?'full':t.u<.205?'full-qk':t.u<.28?'full-scale':t.u<.385?'full-softmax':t.u<.5?'full-value':t.u<.87?'full-qk':t.u<.97?'full-softmax':'full';
 // Each full-* SVG has the identical TeX viewBox and glyph positions. Only
 // the colour of the current operation changes; the formula never reflows.
 const formulaSize:Record<Phase,number>={qkv:36,dot:32,scale:31,softmax:28,weighted:33,full:30,norm:32,loss:38};
 const focus=segment(t.u,.08,.2)*(1-segment(t.u,.84,.96));
 const color=mode==='full'?C.ivory:`rgb(${Math.round(mix(245,217,focus))},${Math.round(mix(240,187,focus))},${Math.round(mix(232,142,focus))})`;
 return <g><Txt x={54} y={52} size={37} color={C.gold}>{titles[mode]}</Txt>{body}<LatexFormula id={formulaId} x={650} y={610} size={formulaSize[mode]} maxWidth={1120} color={color}/></g>;
};
