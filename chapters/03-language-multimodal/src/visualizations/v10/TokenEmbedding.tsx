import {LatexFormula} from './LatexFormula';
import React from 'react';
import {tokenEvidence as E} from './evidence';
import {C,Label,Arrow,SceneProps,progress,spoken,segment,mix,palette} from './primitives';
import {Space,orbit,Facet,Trace,FeatureBars,StageRule,V3,XY} from './CoreGeometry';
import {SpatialSemantic,SpatialContext} from './SpatialEmbedding';

type Span={token:string;x:number;w:number;start:number};
const spans=(list:string[],width=1120):Span[]=>{let at=0;const length=list.join('').length;return list.map(token=>{const x=90+at/length*width,w=token.length/length*width,start=at;at+=token.length;return {token,x,w,start};});};
const colorMix=(a:string,b:string,t:number)=>'#'+[1,3,5].map(i=>Math.round(mix(parseInt(a.slice(i,i+2),16),parseInt(b.slice(i,i+2),16),t)).toString(16).padStart(2,'0')).join('');

// The row identity ignores the explanatory phase. Characters, token boundaries
// and IDs are views of the same sentence, so Film must not layer two copies.
export function tokenRowIdentity(unit:{visual?:string;focus?:string;id?:string}) {
 if(unit.visual!=='token'||unit.focus==='编号没有距离')return null;
 return /换一句/.test(unit.focus||'')||['s03-06','s03-07','s03-08'].includes(unit.id||'')?'token-row-second':'token-row-first';
}

// Only boundaries move. Surviving boxes expand; disappearing boxes contract to
// their owning token's right edge. At t=1 this is exactly the next step's t=0.
// There is one path per character start, never two whole rows at once.
function morphSpans(from:Span[],to:Span[],t:number):Span[] {
 const starts=[...new Set([...from,...to].map(s=>s.start))].sort((a,b)=>a-b);
 return starts.map(start=>{
  const a=from.find(s=>s.start===start),b=to.find(s=>s.start===start);
  const source=a||from.find(s=>start>=s.start&&start<s.start+s.token.length)!;
  const target=b||to.find(s=>start>=s.start&&start<s.start+s.token.length)!;
  return {token:b?.token||a!.token,start,x:mix(a?a.x:source.x+source.w,b?b.x:target.x+target.w,t),w:mix(a?.w||0,b?.w||0,t)};
 });
}

export const TokenMechanism:React.FC<SceneProps>=(p)=>{
 const u=progress(p),phase=p.phase||'characters',focus=p.focus||'',unitId=String(p.data?.unitId||'');
 const ex=E.examples[tokenRowIdentity({visual:'token',focus,id:unitId})==='token-row-second'?1:0];
 const merges=E.merges.filter(r=>r.exampleBefore.join('|')!==r.exampleAfter.join('|'));
 const merging=phase==='merge',ids=phase==='ids'||phase==='roundtrip',roundtrip=phase==='roundtrip';
 const continuation=Boolean(p.data?.tokenContinuation);
 // Reserve a short opening movement to split the previously encoded sentence
// back into character cells. The merge sequence then runs once across the stage.
 const split=merging&&continuation?segment(u,0,.04):1;
 const mergeClock=segment(u,continuation?.045:0,1)*(merges.length-.001);
 const mergeIndex=Math.min(merges.length-1,Math.floor(mergeClock)),row=merges[mergeIndex];
 const local=segment(mergeClock-mergeIndex,.1,.82);
 const before=spans(merging?row.exampleBefore:ex.text.split('')),after=spans(merging?row.exampleAfter:ex.tokens);
 const text=merging?row.exampleBefore.join(''):ex.text;
 const firstCharacters=phase==='characters'&&(!unitId||['s02-01','s02-02'].includes(unitId));
 const drawn=merging
  ?split<1?morphSpans(spans(ex.tokens),spans(merges[0].exampleBefore),split):morphSpans(before,after,local)
  :firstCharacters?morphSpans(before,after,segment(u,.02,.25)):after;
 const previousHighlight=merging&&mergeIndex>0?merges[mergeIndex-1].pair.join(''):'';
 const targetHighlight=merging?row.pair.join(''):'';
 const lookup=ids?segment(u,.06,.56):0;
 if(focus==='编号没有距离') {
  const names=['红伞','红伞靠','蓝色','雨'];
  return <g><Label x={75} y={68} size={38} color={C.gold}>编号是一把查表钥匙</Label>{names.map((s,i)=>{const x=180+i*305;return <g key={s}><Label x={x} y={176} anchor="middle" size={39} color={palette[i]}>{s}</Label><Trace a={[x,198]} b={[x,390]} t={segment(u,i*.06,.68+i*.07)} color={palette[i]}/><circle cx={x} cy={437} r={57} stroke={palette[i]} strokeWidth={2} fill={palette[i]} fillOpacity={.1}/><Label x={x} y={450} anchor="middle" size={40}>{E.vocabulary.indexOf(s)}</Label></g>})}<path d="M198 521H468" stroke={C.gold} strokeWidth={3} strokeDasharray="5 8"/><Label x={332} y={564} anchor="middle" size={29} color={C.gold}>编号相邻</Label><Label x={935} y={564} anchor="middle" size={29} opacity={segment(u,.1,.88)}>语义关系要靠向量学习</Label><StageRule t={u}/></g>;
 }
 return <g>
  <Label x={76} y={65} size={38} color={C.gold}>{merging?'相邻片段，合成一个词元':ids?'片段 → 词表编号':'文字从哪里分开'}</Label>
  <Label x={1220} y={65} anchor="end" size={29} color={C.muted}><tspan style={{fontVariantNumeric:'tabular-nums'}}>{merging?`第 ${row.step+1} 轮 · 出现 ${row.count} 次`:ids?`${ex.tokens.length} 个词元`:`${text.length} 个字符`}</tspan></Label>
  {Array.from(text).map((char,i)=><Label key={`source-char-${i}`} x={90+(i+.5)*1120/text.length} y={140} size={36} anchor="middle" color={C.muted}>{char}</Label>)}
  {drawn.map(s=>{
   const visible=Math.max(0,Math.min(1,s.w/36)),gap=6*visible,color=palette[s.start%4];
   const x=s.x+gap,w=Math.max(0,s.w-gap*2),depth=14*visible;
   return <g key={`boundary-${s.start}`} opacity={visible}>
    <path d={`M${s.x+9*visible} 169v22H${s.x+s.w-9*visible}v-22`} fill="none" stroke={color} strokeOpacity={.65} strokeWidth={2}/>
    <path d={`M${s.x+s.w/2} 193V290`} stroke={color} strokeOpacity={.18} strokeDasharray="3 7"/>
    <Facet x={x} y={300} w={w} h={90} color={color} depth={depth}/>
   </g>;
  })}
  {Array.from(text).map((char,i)=>{
   const prev=before.find(s=>i>=s.start&&i<s.start+s.token.length)!,next=after.find(s=>i>=s.start&&i<s.start+s.token.length)!;
   const emphasis=merging&&split===1?mix(prev.token===previousHighlight?1:0,next.token===targetHighlight?1:0,local):0;
   return <Label key={`token-char-${i}`} x={90+(i+.5)*1120/text.length} y={356} anchor="middle" size={36} color={colorMix(C.ivory,C.gold,emphasis)}>{char}</Label>;
  })}
  {ids?after.map((s,i)=>{const color=palette[s.start%4],id=E.vocabulary.indexOf(s.token),cx=s.x+s.w/2;return <g key={s.start}><Trace a={[cx,399]} b={[cx,488]} t={segment(lookup,i*.025,.7+i*.025)} color={color}/><circle cx={cx} cy={520} r={35} fill={color} fillOpacity={.1} stroke={color} strokeOpacity={.7}/><Label x={cx} y={532} anchor="middle" size={34} color={color}>{id}</Label></g>}):merging?<g>
   <Label x={90} y={484} size={29} color={C.muted}>合并顺序</Label>
   {merges.map((m,i)=>{const x=307+i*112,active=i===mergeIndex,previous=i===mergeIndex-1,done=i<mergeIndex,r=active?mix(6,12,local):previous?mix(12,6,local):6;return <g key={i}><path d={`M${x-50} 480h104`} stroke={done||active?C.gold:C.line} strokeWidth={2}/><circle cx={x} cy={480} r={r} fill={done||active?C.gold:C.line}/><Label x={x} y={527} size={26} anchor="middle" color={C.muted}>{m.step+1}</Label></g>})}
   <Label x={650} y={578} size={32} anchor="middle" color={C.gold}><tspan style={{fontVariantNumeric:'tabular-nums'}}>{row.exampleBefore.length} 个位置 → {row.exampleAfter.length} 个位置</tspan></Label>
  </g>:<g>{after.map(s=><Label key={s.start} x={s.x+s.w/2} y={467} anchor="middle" size={28} color={palette[s.start%4]}>{s.token.length} 字</Label>)}<Label x={650} y={556} anchor="middle" size={33} color={C.gold}>{/取舍/.test(focus)?'常见组合合并 · 少见组合拆开':`${text.length} 个字符 → ${ex.tokens.length} 个词元`}</Label></g>}
  {roundtrip?<g opacity={segment(u,.63,.97)}><path d="M1219 520C1270 520 1270 612 1203 612H127" fill="none" stroke={C.gold} strokeWidth={2}/><Label x={650} y={608} anchor="middle" size={32} color={C.gold}>{ex.text}</Label></g>:<StageRule t={u} y={615}/>}
 </g>;
};

const embedding=[.34,.72,-.17,.84,.48,-.63];
const vectors=[[.51,.15,-.25,.49,.23,.17],embedding,[.16,-.65,.43,.27,.68,.29],[-.25,.35,.65,-.22,.27,.34],[.63,.19,-.48,.25,.33,-.54],[.17,.57,.42,.68,-.37,.21]];
const semantic:{s:string;v:V3}[]=[{s:'红伞',v:[-140,-95,50]},{s:'雨伞',v:[-200,-128,-80]},{s:'雨衣',v:[-235,15,110]},{s:'门边',v:[180,-60,80]},{s:'窗边',v:[245,30,-70]},{s:'苹果',v:[-35,112,70]}];

function EmbeddingLookup(p:SceneProps) {
 const u=progress(p),train=p.focus==='可训练参数',select=segment(u,.04,.36),pull=segment(u,.24,.82),update=train?segment(u,.12,.9):0;
 const vals=embedding.map((v,j)=>v+update*(j%2?-.06:.08));
 return <g><Label x={68} y={63} size={38} color={C.gold}>{train?'误差改变这一行':'编号选中一行'}</Label><Label x={92} y={228} size={43} color={C.gold}>红伞</Label><circle cx={133} cy={314} r={44} fill={C.gold} fillOpacity={.1} stroke={C.gold}/><Label x={133} y={327} anchor="middle" size={40}>21</Label><Trace a={[179,315]} b={[342,252]} bend={-48} t={select} color={C.gold}/>
  <Label x={615} y={122} anchor="middle" size={31} color={C.muted}>可训练的嵌入表</Label>
  <g transform="translate(355 163)">{vectors.map((r,i)=><g key={i} opacity={i===1?1:.55}><Label x={-20} y={i*58+35} size={25} anchor="end" color={i===1?C.gold:C.muted}>{20+i}</Label>{r.map((v,j)=><g key={j}><path d={`M${j*75} ${i*58}l12 -7h67l-12 7Z`} fill={i===1?C.gold:C.cyan} opacity={.1}/><rect x={j*75} y={i*58} width={68} height={47} fill={v<0?C.rose:i===1?C.gold:C.cyan} fillOpacity={i===1?.2:.06}/><Label x={j*75+34} y={i*58+32} size={25} anchor="middle" color={i===1?C.ivory:C.muted}>{(i===1?vals[j]:v).toFixed(2)}</Label></g>)}</g>)}<rect x={-8} y={51} width={460} height={60} fill="none" stroke={C.gold} strokeWidth={2.5} opacity={select}/></g>
  {vals.map((v,j)=>{const a:XY=[389+j*75,244],b:XY=[1078,176+j*60],q=segment(pull,j*.045,.66+j*.045);return <Trace key={j} a={a} b={b} bend={j<3?-60:60} t={q} color={j%2?C.gold:C.cyan} width={1.4}/>})}
  <FeatureBars x={1020} y={145} w={119} h={360} values={vals} color={C.gold}/><LatexFormula id="legacy-vector-space" x={1079} y={542} size={30} maxWidth={215} color={C.gold}/>
  {train&&<g opacity={segment(u,.15,.55)}><path d="M1110 566C850 650 584 620 543 527" stroke={C.rose} strokeWidth={2} fill="none"/><Label x={715} y={593} size={29} color={C.rose}>梯度返回</Label></g>}<StageRule t={u}/>
 </g>;
}

function SemanticSpace(p:SceneProps) {
 const u=progress(p),angle=mix(-.42,.6,u),origin:XY=[672,342],projection=p.focus==='向量维度'||p.focus==='投影的局限',flatten=projection?segment(u,.25,.92):0;
 return <g><Label x={66} y={63} size={37} color={C.gold}>{projection?'高维向量的一张投影':'向量有方向，也有长度'}</Label><Space angle={angle} origin={origin} scale={1.4} extent={240}/>
  {semantic.map((v,i)=>{const real=orbit(v.v,angle,origin,1.4),flat=orbit([v.v[0],v.v[1],0],angle,origin,1.4),xy:XY=[mix(real[0],flat[0],flatten),mix(real[1],flat[1],flatten)],foot=orbit([v.v[0],0,v.v[2]*(1-flatten)],angle,origin,1.4),color=i<3?C.gold:C.cyan;return <g key={v.s}>
   <path d={`M${xy}L${foot}`} stroke={color} opacity={.24} strokeDasharray="4 7"/><circle cx={foot[0]} cy={foot[1]} r={4} fill={color} opacity={.4}/><Arrow a={origin} b={xy} color={color} width={i===0?3.5:1.8} opacity={i===0?1:.53}/>
   {projection&&<path d={`M${real}L${flat}`} stroke={C.rose} strokeWidth={2} opacity={flatten*.6}/>}<circle cx={xy[0]} cy={xy[1]} r={i===0?10:6} fill={color}/><Label x={xy[0]+(i===0?-18:18)} y={xy[1]+(i===0?30:i===1?-15:10)} anchor={i===0?'end':'start'} size={30} color={color}>{v.s}</Label>
  </g>})}<Label x={1213} y={560} anchor="end" size={25} color={C.muted}>语义空间</Label><StageRule t={u}/>
 </g>;
}

function DirectionComparison(p:SceneProps) {
 const u=progress(p),normalize=segment(u,.1,.86),origin:XY=[448,384],a=.28,b=.88,lenA=mix(295,228,normalize),lenB=mix(160,228,normalize),tip=(a:number,l:number):XY=>[origin[0]+Math.cos(a)*l,origin[1]-Math.sin(a)*l],projection=228*Math.cos(b-a);
 return <g><Label x={68} y={63} size={38} color={C.gold}>把长度统一，再比较方向</Label><Space origin={origin} angle={0} extent={205}/><circle cx={origin[0]} cy={origin[1]} r={228} stroke={C.line} fill="none" opacity={.25+.4*normalize}/><Arrow a={origin} b={tip(a,lenA)} color={C.gold} width={5}/><Arrow a={origin} b={tip(b,lenB)} color={C.cyan} width={5}/><path d={`M${tip(a,88)}A88 88 0 0 0 ${tip(b,88)}`} fill="none" stroke={C.ivory} strokeWidth={2.5}/><Label x={origin[0]+105} y={origin[1]-61} size={32}>θ</Label><path d={`M${tip(b,lenB)}L${tip(a,projection)}`} stroke={C.cyan} strokeDasharray="5 7" opacity={normalize}/><Label x={965} y={234} size={42} anchor="middle" color={C.gold}>{(lenA/228).toFixed(2)}</Label><Label x={965} y={279} size={29} anchor="middle" color={C.muted}>向量长度</Label><Label x={965} y={374} size={41} anchor="middle" color={C.cyan}>{(lenB/228).toFixed(2)}</Label><Label x={965} y={419} size={29} anchor="middle" color={C.muted}>向量长度</Label><LatexFormula id="legacy-cosine" x={650} y={548} size={33} maxWidth={570}/><Label x={650} y={600} size={27} anchor="middle" color={C.muted} opacity={segment(u,.3,.94)}>单位化以后，点积就只剩“方向有多像”</Label><StageRule t={u}/></g>;
}

function PositionEncoding(p:SceneProps) {
 const u=progress(p),focus=p.focus||'',swap=/调换/.test(focus)?segment(u,.08,.9):0,add=segment(u,.16,.86);
 if(/旋转/.test(focus)) {
  const a=.22+u*.66,b=a+mix(.25,1.18,segment(u,.05,.87));
  return <g><Label x={66} y={63} size={37} color={C.gold}>相对位置变成夹角</Label>{[a,b].map((angle,i)=>{const cx=338+i*604,cy=318,r=190,end:XY=[cx+Math.cos(angle)*r,cy-Math.sin(angle)*r];return <g key={i}><circle cx={cx} cy={cy} r={r} stroke={C.line} fill="none"/><path d={`M${cx-r-25} ${cy}h${r*2+50}M${cx} ${cy-r-25}v${r*2+50}`} stroke={C.line} opacity={.45}/>{Array.from({length:24},(_,j)=>{const q=j*Math.PI/12;return <path key={j} d={`M${cx+Math.cos(q)*181} ${cy+Math.sin(q)*181}l${Math.cos(q)*9} ${Math.sin(q)*9}`} stroke={C.line}/>})}<path d={`M${cx+r*.45} ${cy}A${r*.45} ${r*.45} 0 0 0 ${cx+Math.cos(angle)*r*.45} ${cy-Math.sin(angle)*r*.45}`} stroke={palette[i]} fill="none" strokeWidth={3}/><Arrow a={[cx,cy]} b={end} color={palette[i]} width={5}/><circle cx={end[0]} cy={end[1]} r={8} fill={palette[i]}/><Label x={cx} y={566} size={32} anchor="middle" color={palette[i]}>{i?'位置 j · Rⱼk':'位置 i · Rᵢq'}</Label></g>})}<StageRule t={u}/></g>;
 }
 return <g><Label x={65} y={62} size={37} color={C.gold}>{swap>0?'词元相同，位置不同':'给每个位置一个波形组合'}</Label>{['狗','追','人'].map((word,i)=>{const to=i===1?1:2-i,x=mix(247+i*388,247+to*388,swap),arc=(i-1)*Math.sin(swap*Math.PI)*104;return <g key={word} transform={`translate(${x} ${arc})`}><Label x={0} y={152} anchor="middle" size={46} color={palette[i]}>{word}</Label><FeatureBars x={-64} y={180} w={128} h={164} values={vectors[i].slice(0,4)} color={palette[i]}/></g>})}
  {[0,1,2].map(i=><g key={i}><Label x={247+i*388} y={392} anchor="middle" size={34} color={C.gold}>{swap?'↓':'+'}</Label>{[0,1,2].map(j=><path key={j} d={Array.from({length:101},(_,k)=>`${k?'L':'M'}${140+i*388+k*2.15} ${433+j*35+Math.sin(k*(.05+j*.035)+i*1.1)*15}`).join(' ')} fill="none" stroke={j===1?C.gold:palette[i]} opacity={.25+add*.55} strokeWidth={2.2}/>)}<Label x={247+i*388} y={561} anchor="middle" size={31} color={C.gold}>位置 {i+1}</Label></g>)}<StageRule t={u}/></g>;
}

function ContextEmbedding(p:SceneProps) {
 const u=progress(p),focus=p.focus||'',relation=/颜色|位置|注意力/.test(focus),a=segment(u,.08,.9);
 if(relation) return <g><Label x={66} y={65} size={37} color={C.gold}>信息沿着关系流动</Label>{['红色','伞','蓝色','门'].map((w,i)=><g key={w}><Label x={170+i*318} y={261} size={43} anchor="middle" color={palette[Math.floor(i/2)]}>{w}</Label><FeatureBars x={114+i*318} y={308} w={112} h={218} values={vectors[i].slice(0,4).map((v,j)=>mix(v,v+(i%2===1?vectors[i-1][j]*.17:0),a))} color={palette[Math.floor(i/2)]}/></g>)}<Trace a={[170,216]} b={[488,216]} bend={-230} t={a} color={C.gold} width={3}/><Trace a={[806,216]} b={[1124,216]} bend={-230} t={a} color={C.cyan} width={3}/><Trace a={[488,550]} b={[1124,550]} bend={70} t={segment(u,.3,.96)} color={C.rose} width={1.5}/><StageRule t={u}/></g>;
 const o:XY=[650,355],angle=mix(-.2,.26,u),left:V3=[-230,-115,50],right:V3=[230,-95,-40],start:V3=[0,-80,5];
 const v=(target:V3)=>target.map((n,j)=>mix(start[j],n,a)) as V3,p1=orbit(v(left),angle,o,1.65),p2=orbit(v(right),angle,o,1.65);
 return <g><Label x={62} y={65} size={36} color={C.gold}>入口相同，读完语境后分开</Label><Label x={73} y={128} size={31} color={C.gold}>苹果落在果盘里</Label><Label x={1208} y={128} anchor="end" size={31} color={C.cyan}>苹果发布了手机</Label><Space angle={angle} origin={o} scale={1.55}/><Arrow a={o} b={p1} color={C.gold} width={4}/><Arrow a={o} b={p2} color={C.cyan} width={4}/><circle cx={p1[0]} cy={p1[1]} r={11} fill={C.gold}/><circle cx={p2[0]} cy={p2[1]} r={11} fill={C.cyan}/><Label x={p1[0]-18} y={p1[1]-22} anchor="end" size={32} color={C.gold}>苹果</Label><Label x={p2[0]+18} y={p2[1]-22} size={32} color={C.cyan}>苹果</Label><Label x={650} y={492} anchor="middle" size={31} color={C.muted}>同一行输入嵌入</Label>{embedding.map((v,i)=><g key={i}><rect x={454+i*65} y={520} width={59} height={45} fill={v<0?C.rose:C.gold} fillOpacity={.16}/><Label x={483+i*65} y={550} anchor="middle" size={24}>{v.toFixed(2)}</Label></g>)}<StageRule t={u}/></g>;
}

export const EmbeddingMechanism:React.FC<SceneProps>=(p)=>{
 const phase=p.phase||'lookup';
 if(phase==='lookup'&&p.focus!=='向量维度')return <EmbeddingLookup {...p}/>;
 if(phase==='distance'&&p.focus==='比较方向')return <DirectionComparison {...p}/>;
 if(phase==='position')return <PositionEncoding {...p}/>;
 if(phase==='context')return /颜色|位置|注意力/.test(p.focus||'')?<ContextEmbedding {...p}/>:<SpatialContext {...p}/>;
 return <SpatialSemantic {...p}/>;
};
