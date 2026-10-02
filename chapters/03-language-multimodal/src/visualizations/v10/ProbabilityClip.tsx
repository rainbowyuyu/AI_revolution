import {LatexFormula} from './LatexFormula';
import React from 'react';
import {nextTokenEvidence as E} from './evidence';
import {C,Label,Arrow,Picture,SceneProps,progress,spoken,segment,mix,palette,softmax,clamp} from './primitives';
import {TokenBlock,WeightTensor,ProbabilityColumn,MechanismNote,PhotoPatch} from './AppliedObjects';
import {OpusSamplingMechanism} from './OpusSampling';
import {CorpusSplit,EvaluationRoom,CountingExecution} from './AppliedSpatial';
import {TemperatureDial,GreedyComparison,MemoryWindow} from './PredictionChoices';

export const Sampling=OpusSamplingMechanism;
export const ProbabilityMechanism:React.FC<SceneProps>=p=>{
 const t=progress(p),f=spoken(p),phase=p.phase||'probability',focus=p.focus||'';
 if(p.data?.unitId==='s12-01')return <GreedyComparison {...p}/>;
 if(p.data?.unitId==='s12-07')return <MemoryWindow {...p}/>;
 if(phase==='temperature')return <TemperatureDial {...p}/>;
 if(phase==='sample')return <Sampling {...p}/>;
 if(focus==='实验语料')return <CorpusSplit {...p}/>;
 if(phase==='evaluation')return <EvaluationRoom {...p}/>;
 if(focus==='看代码运行')return <CountingExecution {...p}/>;
 if(phase==='shift'){
  if(focus==='训练和生成不同')return <g>
   <Label x={50} y={54} size={35} color={C.cyan}>训练：正确前文来自语料</Label>
   {Array.from('雨后的红伞靠在门').map((w,i)=><TokenBlock key={`teacher-${i}`} x={165+i*126} y={107} word={w} width={85} active={.75}/>)}
   <Label x={50} y={302} size={35} color={C.gold}>生成：模型选出的字接回输入</Label>
   {Array.from('雨后的红伞').map((w,i)=><TokenBlock key={`prompt-${i}`} x={165+i*126} y={356} word={w} width={85} active={.45}/>)}
   {['靠','在','墙'].map((w,i)=>{const a=segment(f,.08+i*.23,.35+i*.23),x=mix(766+i*161,165+(i+5)*126,a),y=mix(532,356,a);return <TokenBlock key={`generated-${w}`} x={x} y={y} word={w} width={85} height={72} color={C.gold} active={1}/>})}
   <path d="M798 449H1189" stroke={C.gold} strokeWidth={2}/>
   <Label x={52} y={543} size={33} color={C.muted}>新字符改变后续可见的上下文</Label><Label x={52} y={607} size={31} color={C.muted}>下方片段来自已保存的 T = 0.5 生成轨迹</Label>
  </g>;
  const words=Array.from('雨后的红伞靠在门边'),shift=segment(t,0,.3),at=mix(0,7,segment(t,.18,.9));
  return <g><Label x={47} y={53} size={35} color={C.gold}>{focus==='训练和生成不同'?'训练：正确前文来自语料':'同一句话 · 每个位置预测下一个字'}</Label>
   <Label x={47} y={136} size={33} color={C.muted}>输入</Label><Label x={47} y={464} size={33} color={C.gold}>目标</Label>
   {words.map((w,i)=><g key={`word-${i}`}><TokenBlock x={160+i*117} y={85} word={w} width={86} active={i<8?1:.1}/>{i<8&&<g><path d={`M${203+i*117} 172v210`} stroke={C.cyan} strokeWidth={2} strokeOpacity={.15}/><rect x={172+i*117} y={208} width={62} height={141} rx={6} fill={C.cyan} fillOpacity={.045+.14*(1-clamp(Math.abs(at-i)))}/><Label x={203+i*117} y={294} size={32} anchor="middle" color={C.cyan}>预测</Label></g>}{i>0&&<TokenBlock x={160+i*117-117*shift} y={412} word={w} width={86} color={C.gold} active={.4+.6*(1-clamp(Math.abs(at-(i-1))))}/>}</g>)}
   <path d={`M${160+117*at} 183h86M${160+117*at} 502h86`} stroke={C.gold} strokeWidth={4}/>
   <Label x={650} y={596} anchor="middle" size={34}>{focus==='训练和生成不同'?'生成：选出的新字接回输入，继续预测':'同一批文字，提供多个受因果遮罩约束的目标'}</Label>
  </g>;
 }
 if(phase==='loss'){
  const prob=mix(.07,.9,segment(t,.03,.95)),loss=-Math.log(prob),back=focus==='反向传播',z=segment(f,.05,.94),gx=768,gy=455,gw=423;
  return <g><Label x={50} y={50} size={37}>红伞的下一个字：<tspan fill={C.gold}>靠</tspan></Label>
   {['靠','放','落','在'].map((w,i)=><ProbabilityColumn key={w} x={67+i*147} base={423} value={i===0?prob:(1-prob)*[0,.5,.3,.2][i]} label={w} width={92} scale={300} color={i===0?C.gold:C.cyan} highlight={i===0?1:0}/>)}
   <path d={`M${gx} 140V${gy}H1220`} fill="none" stroke={C.line} strokeWidth={2}/>
   {[1,2,3].map(v=><g key={v}><path d={`M${gx} ${gy-v*93}H1220`} stroke={C.line} strokeOpacity={.2}/><Label x={gx-17} y={gy-v*93+10} size={30} anchor="end" color={C.muted}>{v}</Label></g>)}
   <path d={Array.from({length:98},(_,i)=>{const q=(i+3)/100;return `${i?'L':'M'}${gx+q*gw} ${gy+Math.log(q)*93}`;}).join(' ')} fill="none" stroke={C.cyan} strokeWidth={3}/>
   <path d={`M${gx+prob*gw} ${gy}V${gy-loss*93}H${gx}`} stroke={C.gold} strokeDasharray="6 7" fill="none"/>
   <circle cx={gx+prob*gw} cy={gy-loss*93} r={11} fill={C.gold}/>
   <LatexFormula id="legacy-loss" x={999} y={69} size={35} maxWidth={430} color={C.gold}/><Label x={999} y={530} anchor="middle" size={38}>损失 {loss.toFixed(2)}</Label>
   {back?<g><WeightTensor x={250} y={537} w={215} h={48} t={z} color={C.gold}/><Arrow a={[1030,556]} b={[512,571]} color={C.gold} opacity={.7}/><Label x={51} y={588} size={33} color={C.gold}>更新参数</Label><Label x={768} y={603} size={31} color={C.muted}>梯度沿计算图反向传回</Label></g>:<Label x={50} y={577} size={34} color={C.gold}>目标概率上升，负对数损失下降</Label>}
   <MechanismNote/>
  </g>;
 }
 const location=/地点|窗口|靠在/.test(focus)||phase==='temperature',ci=location?3:1,ctx=E.contexts[ci],temp=phase==='temperature'?mix(.5,1.5,segment(t,.03,.96)):1,dist=phase==='temperature'?softmax(ctx.distribution.map(v=>Math.log(v.probability)),temp):ctx.distribution.map(v=>v.probability);
 const n=location?4:1,rows=[...ctx.distribution.slice(0,n).map((d,i)=>({...d,probability:dist[i]})),{token:'其余',count:0,probability:1-dist.slice(0,n).reduce((a,b)=>a+b,0)}],code=focus==='看代码运行',corpus=focus==='实验语料',window=focus==='历史窗口限制';
 return <g><Label x={50} y={58} size={39}>{window&&f>.5?'雨后的蓝伞靠在':ctx.prefix}</Label><path d={`M${50+(ctx.prefix.length-2)*39} 81h78`} stroke={C.gold} strokeWidth={4}/><Label x={1220} y={56} anchor="end" size={34} color={C.gold}>{phase==='temperature'?`只调温度  T = ${temp.toFixed(2)}`:`只读取「${ctx.context}」`}</Label>
  {code?<g>{['context = text[-2:]','counts = table[context]','p = (counts + 0.1) / total'].map((s,i)=><g key={s}><rect x={45} y={149+i*98} width={568} height={66} fill={C.gold} fillOpacity={.13*clamp(1-Math.abs(f*2-i))}/><Label x={55} y={194+i*98} size={30} color={clamp(1-Math.abs(f*2-i))>.3?C.gold:C.muted}>{s}</Label></g>)}<WeightTensor x={196} y={493} w={218} h={55} t={f} color={C.cyan}/></g>:<g>
  <Label x={54} y={143} size={33} color={C.muted}>{phase==='temperature'?'同一套计数，重新分配概率':'训练文本里，后面出现了什么？'}</Label>
  {rows.slice(0,n).map((d,i)=><g key={d.token}><TokenBlock x={54} y={177+i*(location?93:0)} word={d.token} width={70} height={64} color={palette[i]} active={1}/>{Array.from({length:d.count},(_,j)=>{const go=phase==='counts'?segment(t,.15,.91):1;return <circle key={j} cx={154+j%13*27} cy={201+i*(location?93:0)+Math.floor(j/13)*26} r={7} fill={palette[i]} fillOpacity={mix(.28,.95,go)}/>})}<Label x={583} y={220+i*(location?93:0)} size={33} anchor="end" color={palette[i]}>{d.count} 次</Label></g>)}
  {!location&&<g><Label x={56} y={342} size={33} color={C.muted}>未出现的 39 个候选</Label>{Array.from({length:39},(_,j)=><circle key={j} cx={63+j%13*32} cy={385+Math.floor(j/13)*31} r={4+3*segment(t,.4,.93)} fill={C.cyan} fillOpacity={.5}/>)}<Label x={56} y={534} size={31} color={C.cyan}>每个候选 + 0.1</Label></g>}
  </g>}
  <path d="M627 146V557" stroke={C.line} strokeOpacity={.35}/>
  {rows.map((d,i)=><ProbabilityColumn key={d.token} x={688+i*(540/rows.length)} base={474} value={d.probability} label={d.token} width={rows.length>3?72:145} scale={325} color={palette[i%4]} highlight={i===0?1:.3}/>)}
  <LatexFormula id="legacy-probability-sum" x={925} y={116} size={31} maxWidth={350} color={C.gold}/>
  {phase==='counts'?<g><Label x={650} y={571} anchor="middle" size={27} color={C.muted}>每个候选增加少量计数，再除以新的总数</Label><LatexFormula id="legacy-smoothing" x={650} y={618} size={25} maxWidth={740} color={C.gold}/></g>:<Label x={650} y={625} anchor="middle" size={33} color={C.gold}>{phase==='temperature'?'低温更集中 ← 同一上下文 → 高温更分散':window?'窗口外的颜色改变，当前分布保持相同':'计数和概率来自已保存的字符模型实验'}</Label>}
 </g>;
};

export const ClipMechanism:React.FC<SceneProps>=p=>{
 const t=progress(p),f=spoken(p),matrix=['pairs','contrastive'].includes(p.phase||''),src=['media/v2/01-umbrella.png','media/v2/candidate-red-car.png','media/v2/candidate-umbrella-grass.png'],names=['红伞 · 蓝门','红车 · 街道','雨伞 · 草地'];
 if(matrix){const a=segment(t,.07,.95),sweep=mix(0,2,a),two=p.focus==='对比目标';return <g><Label x={50} y={48} size={33} color={C.muted}>行：图像向量　列：文本向量</Label>
  {names.map((s,i)=><g key={s}><Picture src={src[i]} x={52} y={135+i*146} w={196} h={111} cover position="right center"/><Label x={448+i*290} y={96} anchor="middle" size={32} color={palette[i]}>{s}</Label></g>)}
  {Array.from({length:9},(_,i)=>{const r=Math.floor(i/3),c=i%3,v=mix(.35,r===c?.93:.08,a),focus=1-clamp(Math.abs(sweep-r));return <g key={i}><rect x={316+c*290} y={129+r*146} width={252} height={119} rx={5} fill={r===c?C.gold:C.cyan} fillOpacity={.045+v*.3} stroke={r===c?C.gold:C.line} strokeOpacity={.2+.5*focus}/><circle cx={442+c*290} cy={188+r*146} r={14+v*34} fill={r===c?C.gold:C.cyan} fillOpacity={.36+v*.5}/>{r===c&&<path d={`M${425+c*290} ${189+r*146}l11 12 25-28`} stroke={C.ink} strokeWidth={4} fill="none"/>}</g>})}
  <rect x={306} y={121+sweep*146} width={842} height={135} rx={6} fill="none" stroke={C.gold} strokeWidth={2.5}/>
  {two&&<rect x={307+sweep*290} y={120} width={272} height={432} rx={6} fill="none" stroke={C.cyan} strokeWidth={2.5}/>}
  <Label x={650} y={595} anchor="middle" size={35} color={C.gold}>{two?'图找文 + 文找图：两个方向共同训练':'同批两两比较，正确配对沿对角线增强'}</Label><MechanismNote/>
 </g>;}
 const align=p.focus==='坐标对齐'?segment(f,.08,.94):p.focus==='CLIP双编码器'?1:segment(t,.08,.94),theta=mix(1.02,.34,align),ox=1058,oy=345,r=161;
 return <g><Label x={42} y={46} size={33} color={C.cyan}>图像</Label><Label x={43} y={385} size={33} color={C.gold}>描述</Label>
  {Array.from({length:16},(_,i)=>{const col=i%4,row=Math.floor(i/4),z=segment(t,.08,.82);return <PhotoPatch key={i} src={src[0]} x={43+col*(65+4*z)} y={83+row*(47+3*z)} w={65} h={47} col={col} row={row}/>})}
  {['红伞','靠在','蓝色','门边'].map((w,i)=><TokenBlock key={w} x={43+i%2*148} y={416+Math.floor(i/2)*88} word={w} width={130} height={62} color={C.gold} active={.8}/>)}
  <WeightTensor x={451} y={105} w={183} h={143} t={align} color={C.cyan} label="图像编码器"/><WeightTensor x={451} y={416} w={183} h={143} t={align} color={C.gold} label="文本编码器"/>
  {[0,1].map(mod=><g key={mod}>{Array.from({length:6},(_,i)=>{const a=segment(t,.08+i*.025,.75+i*.025),x=mix(349,751,a),y=mix(122+i*24+mod*306,296+i*19,a);return <rect key={i} x={x} y={y} width={35} height={9} rx={2} fill={mod?C.gold:C.cyan} fillOpacity={.8}/>})}</g>)}
  <g transform={`translate(${ox} ${oy})`}><ellipse rx={r+9} ry={r+9} fill={C.cyan} fillOpacity={.035} stroke={C.line}/><ellipse rx={r+9} ry={51} fill="none" stroke={C.line} strokeOpacity={.5}/><ellipse rx={57} ry={r+9} fill="none" stroke={C.line} strokeOpacity={.35}/><path d={`M${-r-14} 0H${r+14}M0 ${-r-14}V${r+14}`} stroke={C.line} strokeOpacity={.4}/></g>
  <Arrow a={[ox,oy]} b={[ox+r*Math.cos(.23),oy-r*Math.sin(.23)]} color={C.cyan} width={5}/><Arrow a={[ox,oy]} b={[ox+r*Math.cos(theta),oy-r*Math.sin(theta)]} color={C.gold} width={5}/>
  <path d={`M${ox+81*Math.cos(.23)} ${oy-81*Math.sin(.23)}A81 81 0 0 0 ${ox+81*Math.cos(theta)} ${oy-81*Math.sin(theta)}`} fill="none" stroke={C.gold} strokeWidth={3}/>
  <Label x={ox} y={90} anchor="middle" size={34}>可比较的表示空间</Label><Label x={ox} y={563} anchor="middle" size={33} color={C.gold}>对应图文，方向接近</Label><MechanismNote>空间投影</MechanismNote>
 </g>;
};
