import {LatexFormula} from './LatexFormula';
import React from 'react';
import {attentionEvidence as A} from './evidence';
import {C,Label,Arrow,SceneProps,progress,spoken,segment,mix,palette,softmax,clamp} from './primitives';
import {FeatureBars,StageRule,Trace,XY} from './CoreGeometry';

/** Row-vector convention: x (1×6) times W (6×2) gives one two-value projection. */
export const SpatialQKV:React.FC<SceneProps>=p=>{
 const u=progress(p),input=[.34,.72,-.17,.84,.48,-.63],norm=input.reduce((s,v)=>s+v*v,0),targets=[A.Q[3],A.K[3],A.V[3]];
 const titles=['Q · 我要找什么','K · 我能被怎样找到','V · 我能带去什么'];
 return <g><Label x={62} y={62} size={37} color={C.gold}>同一份表示，分出三种用途</Label>
  <Label x={155} y={162} size={37} anchor="middle" color={C.gold}>门边</Label><Label x={155} y={201} size={25} anchor="middle" color={C.muted}>6 个输入特征</Label><FeatureBars x={98} y={224} w={118} h={287} values={input}/>
  {targets.map((target,h)=>{const y=130+h*166,color=palette[h],a=segment(u,.02+h*.1,.62+h*.12),rowClock=a*6;
   // W[r][c] consumes feature r and contributes to output coordinate c.
   // Sum_r x[r] W[r][c] reproduces the saved Q/K/V example exactly.
   const matrix=input.map(x=>target.map(v=>v*x/norm));
   const products=matrix.map((row,r)=>row.map(v=>input[r]*v));
   const accumulated=target.map((_,c)=>products.reduce((sum,row,r)=>sum+row[c]*segment(rowClock-r,0,1),0));
   const lit=(r:number)=>a>=1?.35:1-clamp(Math.abs(rowClock-(r+.5)));
   return <g key={h} data-projection={['Q','K','V'][h]} data-weight-rows={6} data-weight-columns={2}>
    <Trace a={[239,354]} b={[470,y+49]} bend={h===0?-52:h===2?50:0} t={a} color={color} width={1.8}/>
    <g transform={`translate(487 ${y})`}>
     {matrix.map((row,r)=>row.map((v,c)=><g key={`${r}-${c}`} data-weight-row={r} data-weight-col={c} data-weight-value={v}>
      <path d={`M${c*54} ${r*17}l7 -4h45v13l-7 4Z`} fill={v<0?C.rose:color} fillOpacity={.07}/>
      <rect x={c*54} y={r*17} width={45} height={13} rx={1.5} fill={v<0?C.rose:color} fillOpacity={.13+Math.min(1,Math.abs(v))*.3+.34*lit(r)}/>
      <path d={`M${c*54+4} ${r*17+9}h${Math.min(1,Math.abs(v))*36}`} stroke={v<0?C.rose:color} strokeWidth={2} strokeOpacity={.45+.45*lit(r)}/>
     </g>))}
     <path d="M-9 -5h-5v107h5M111 -5h5v107h-5" fill="none" stroke={color} strokeOpacity={.5}/>
    </g>
    <LatexFormula id={['wq','wk','wv'][h]} x={505} y={y+123} size={29} color={color} maxWidth={70}/><Label x={599} y={y+133} size={25} color={color} anchor="middle">6 行 2 列</Label>
    <Trace a={[610,y+48]} b={[772,y+48]} t={a} color={color}/>
    {accumulated.map((v,c)=>{const x=798+c*83,base=y+65,high=Math.abs(v)*20;return <g key={c} data-output-col={c} data-output-value={v}>
     <path d={`M${x} ${y+11}l7 -5h70v88l-7 5Z`} fill={color} fillOpacity={.05}/><rect x={x} y={y+11} width={70} height={88} rx={3} fill={C.ink} fillOpacity={.8} stroke={color} strokeOpacity={.38}/>
     <rect x={x+12} y={v>=0?base-high:base} width={46} height={Math.max(.1,high)} fill={v<0?C.rose:color} fillOpacity={.26}/>
     <text x={x+35} y={y+53} textAnchor="middle" fontSize={29} fill={color} fontFamily="NotoSansSC" style={{fontVariantNumeric:'tabular-nums'}}>{Math.abs(v)<.0005?'0.00':v.toFixed(2)}</text>
    </g>})}
    <Label x={877} y={y+134} size={25} color={C.muted} anchor="middle">逐项乘积相加</Label>
    <Label x={1000} y={y+54} size={28} color={color}>{titles[h]}</Label>
   </g>;
  })}<StageRule t={u} y={620}/>
 </g>;
};

/** The query arrow, dot products, and softmax bars share one continuously updated Q. */
export const QueryOrbit:React.FC<SceneProps>=p=>{
 const u=progress(p),a=segment(u,.04,.94),angle=mix(Math.atan2(1,2),Math.atan2(1.6,1.1),a),q=[Math.sqrt(5)*Math.cos(angle),Math.sqrt(5)*Math.sin(angle)],origin:XY=[240,378],scale=94,
 tip=(v:number[]):XY=>[origin[0]+v[0]*scale,origin[1]-v[1]*scale],scores=A.K.map(k=>(q[0]*k[0]+q[1]*k[1])/Math.sqrt(2)),weights=softmax(scores);
 return <g><Label x={64} y={63} size={37} color={C.gold}>只动查询，信息分配跟着变</Label>
  <path d="M74 378H488M240 495V125" stroke={C.line} strokeOpacity={.55}/>
  {[1,2].map(r=><circle key={r} cx={240} cy={378} r={r*94} fill="none" stroke={C.line} strokeOpacity={.2}/>)}
  {A.K.map((k,i)=>{const b=tip(k);return <g key={i}><Arrow a={origin} b={b} color={palette[i]} width={1.8} opacity={.45}/><Label x={b[0]+[8,-20,14,-14][i]} y={b[1]+[-19,29,28,-17][i]} size={27} anchor={i%2?'end':'start'} color={palette[i]}>{A.tokens[i]}</Label></g>})}
  <Arrow a={origin} b={tip(q)} color={C.ivory} width={5}/><circle cx={tip(q)[0]} cy={tip(q)[1]} r={8} fill={C.ivory}/><Label x={tip(q)[0]+16} y={tip(q)[1]-19} size={31}>Q</Label>
  <Label x={240} y={554} anchor="middle" size={30}>[{q.map(v=>v.toFixed(2)).join(', ')}]</Label>
  {weights.map((v,i)=>{const y=170+i*102;return <g key={i}>
   <Label x={572} y={y+12} size={29} color={palette[i]}>{A.tokens[i]}</Label>
   <Label x={714} y={y+12} anchor="middle" size={30} color={palette[i]}>{scores[i].toFixed(2)}</Label>
   <path d={`M758 ${y+1}h51`} stroke={palette[i]} strokeOpacity={.4}/>
   <rect x={836} y={y-16} width={303} height={38} fill={palette[i]} fillOpacity={.07}/>
   <rect x={836} y={y-16} width={303*v} height={38} fill={palette[i]} fillOpacity={.73}/>
   <Label x={1215} y={y+13} anchor="end" size={30} color={palette[i]}>{(v*100).toFixed(1)}%</Label>
  </g>})}<LatexFormula id="legacy-scaled-dot" x={714} y={91} size={23} maxWidth={165} color={C.muted}/><Label x={1000} y={107} anchor="middle" size={28} color={C.muted}>softmax 后的权重</Label><Label x={968} y={574} anchor="middle" size={32} color={C.gold}>权重之和始终为 1</Label><StageRule t={u} y={621}/>
 </g>;
};

/** Rows and columns expand together: doubling sequence length quadruples pairs. */
export const AttentionCost:React.FC<SceneProps>=p=>{
 const u=progress(p),grow=segment(u,.08,.92),n=mix(4,16,grow),s=412/16,x=111,y=119;
 return <g><Label x={64} y={63} size={37} color={C.gold}>长度翻倍，要比较的格子变成四倍</Label>
  {Array.from({length:256},(_,i)=>{const r=Math.floor(i/16),c=i%16,on=clamp(n-Math.max(r,c)),existing=r<4&&c<4;return <rect key={i} x={x+c*s} y={y+r*s} width={s-3} height={s-3} fill={existing?C.gold:C.cyan} fillOpacity={on*(existing?.62:.3)}/>})}
  <path d={`M${x-17} ${y}V${y+n*s}H${x-9}M${x} ${y+429}H${x+n*s}v-8`} stroke={C.gold} strokeWidth={2.5} fill="none"/>
  <Label x={318} y={587} anchor="middle" size={29} color={C.gold}>每一行，遍历同一串位置</Label>
  {[4,8,16].map((v,i)=>{const active=segment(n,v-.7,v+.4),base=489,top=base-v*v*1.18;return <g key={v}><rect x={714+i*167} y={top} width={96} height={base-top} fill={i?C.cyan:C.gold} fillOpacity={.08+.42*active}/><path d={`M714 ${base+1}H1196`} stroke={C.line} strokeOpacity={.4}/><Label x={762+i*167} y={top-21} anchor="middle" size={35} color={i?C.cyan:C.gold}>{v*v}</Label><Label x={762+i*167} y={550} anchor="middle" size={31}>{v} 个词元</Label></g>})}<Label x={960} y={82} anchor="middle" size={29} color={C.muted}>完整注意力的比较次数</Label><LatexFormula id="legacy-cost" x={960} y={119} size={29} maxWidth={340} color={C.gold}/><StageRule t={u} y={621}/>
 </g>;
};


export const AttentionModeComparison:React.FC<SceneProps>=p=>{
 const u=progress(p),q=segment(u,.04,.94),cell=83;
 return <g><Label x={63} y={63} size={37} color={C.gold}>续写守住顺序，阅读可以看左右</Label>
  {[0,1].map(mode=>{const x=146+mode*663,y=174;return <g key={mode}>
   <Label x={x+cell*2} y={121} anchor="middle" size={34} color={palette[mode]}>{mode?'完整阅读':'逐步续写'}</Label>
   {A.scores.map((row,r)=>{const causal=softmax(row.slice(0,r+1)),full=softmax(row);return row.map((_,c)=>{const v=mode?full[c]:(causal[c]||0),on=mode||c<=r;return <g key={`${r}-${c}`}><rect x={x+c*cell} y={y+r*cell} width={cell-6} height={cell-6} fill={on?palette[mode]:C.rose} fillOpacity={on?.06+v*.57:.035}/><path d={`M${x+c*cell+8} ${y+(r+1)*cell-14}h${(cell-22)*v*q}`} stroke={on?palette[mode]:C.rose} strokeWidth={6}/>{!on&&<path d={`M${x+c*cell+27} ${y+r*cell+27}l22 22m0-22l-22 22`} stroke={C.rose} strokeWidth={2} opacity={.52}/>}</g>;});})}
   <Label x={x+cell*2} y={561} anchor="middle" size={29} color={palette[mode]}>{mode?'当前词元可汇集整句信息':'上三角的未来位置被挡住'}</Label>
  </g>})}<StageRule t={u} y={620}/>
 </g>;
};

export const LongRangeAttention:React.FC<SceneProps>=p=>{
 const u=progress(p),receive=segment(u,.32,.92),words=['红伞','在','雨停后','被','路过的','小孩','轻轻','放到','那扇','蓝色','门','边'],x=(i:number)=>91+i*102,from:XY=[x(0),338],to:XY=[x(11),338],camera=mix(1.06,1,segment(u,.02,.7));
 return <g><Label x={63} y={63} size={37} color={C.gold}>远处的信息，也能一步到达</Label>
  <g transform={`translate(650 353) scale(${camera}) translate(-650 -353)`}>
   <path d="M78 438L1193 438L1234 467H119Z" fill={C.cyan} fillOpacity={.03} stroke={C.line} strokeOpacity={.32}/>
   {words.map((word,i)=>{const endpoint=i===0||i===11,color=endpoint?C.gold:C.cyan;return <g key={i}><Label x={x(i)} y={406} anchor="middle" size={word.length>2?26:29} color={color}>{word}</Label>{[0,1,2,3].map(j=><rect key={j} x={x(i)-28+j*15} y={338-(.2+.55*Math.sin(i*.7+j*.9)**2+(i===11?.18*receive:0))*80} width={10} height={(.2+.55*Math.sin(i*.7+j*.9)**2+(i===11?.18*receive:0))*80} fill={color} fillOpacity={endpoint?.64:.28}/>)}{i<11&&<path d={`M${x(i)+34} 438h34`} stroke={C.line} strokeOpacity={.2}/>}</g>})}
   <Trace a={from} b={to} bend={-420} t={segment(u,.06,.91)} color={C.gold} width={3}/>
   <circle cx={to[0]} cy={to[1]} r={mix(12,24,receive)} fill={C.gold} fillOpacity={.07+.1*receive}/>
   <Label x={654} y={215} anchor="middle" size={32} color={C.gold}>直接汇集线索</Label>
  </g><Label x={653} y={564} anchor="middle" size={30} color={C.muted}>距离可以很远，关系仍可直接计算</Label><StageRule t={u} y={620}/>
 </g>;
};

export const ContinuousScores:React.FC<SceneProps>=p=>{
 const u=progress(p),f=spoken(p),scaled=p.focus==='缩放分数',amount=scaled?segment(f,.07,.87):0,scan=segment(u,.03,.94)*3,q=A.Q[3],o:XY=[258,359],scale=88,tip=(v:number[]):XY=>[o[0]+v[0]*scale,o[1]-v[1]*scale];
 return <g><Label x={63} y={63} size={37} color={C.gold}>{scaled?'把分数放到更合适的尺度':'同一个查询，逐一比较四个键'}</Label>
  <path d="M92 359H476M258 500V149" stroke={C.line} strokeOpacity={.45}/><circle cx={258} cy={359} r={178} fill="none" stroke={C.line} strokeOpacity={.15}/>
  {A.K.map((k,i)=>{const b=tip(k),on=1-clamp(Math.abs(scan-i));return <g key={i}><Arrow a={o} b={b} color={palette[i]} width={1.5+on*2.2} opacity={.23+.65*on}/><Label x={b[0]+[11,-22,12,-12][i]} y={b[1]+[-19,32,31,-16][i]} anchor={i%2?'end':'start'} size={28} color={palette[i]}>{A.tokens[i]}</Label></g>})}
  <Arrow a={o} b={tip(q)} color={C.ivory} width={4.5}/><Label x={tip(q)[0]+13} y={tip(q)[1]-20} size={31}>Q</Label>
  {A.K.map((k,i)=>{const dot=q[0]*k[0]+q[1]*k[1],value=mix(dot,dot/Math.sqrt(2),amount),on=1-clamp(Math.abs(scan-i)),y=176+i*99;return <g key={i}>
   <Label x={576} y={y+12} size={30} color={palette[i]}>{A.tokens[i]}</Label>
   <rect x={690} y={y-19} width={dot/4*389} height={39} fill={palette[i]} fillOpacity={.055}/><rect x={690} y={y-19} width={Math.max(0,value)/4*389} height={39} fill={palette[i]} fillOpacity={.2+.5*on}/>
   <path d={`M${690+dot/4*389} ${y-29}v58`} stroke={palette[i]} strokeOpacity={scaled?.28:0} strokeDasharray="4 6"/>
   <Label x={1206} y={y+12} anchor="end" size={34} color={palette[i]}>{value.toFixed(3)}</Label>
  </g>})}<LatexFormula id={scaled?"legacy-scaled-dot":"legacy-general-dot"} x={878} y={97} size={26} maxWidth={560} color={C.gold}/>
  <LatexFormula id="legacy-q-vector" x={258} y={549} size={27} maxWidth={350}/><Label x={878} y={574} anchor="middle" size={30} color={C.muted}>{scaled?'缩放后的结果，接着送入 softmax':'同一组键保持不动，逐一计算匹配分数'}</Label><StageRule t={u} y={620}/>
 </g>;
};
