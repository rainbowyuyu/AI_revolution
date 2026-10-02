import {SpatialPatches,SpatialSequence,SpatialPhotoEvidence} from './SpatialMultimodal';
import React from 'react';
import {C,Label,Picture,Arrow,SceneProps,progress,spoken,segment,mix,palette,clamp,bezier} from './primitives';
import {TokenBlock,WeightTensor,PhotoPatch,appliedClock} from './AppliedObjects';
const photo='media/v2/01-umbrella.png';
const answer=['红伞','靠在','蓝色','门边'];
const Sentence:React.FC<{x:number;y:number;chosen?:boolean;short?:boolean;value?:number}>=({x,y,chosen=false,short=false,value=1})=><g>
 <path d={`M${x-17} ${y-48}l15-12h477v76l-15 12Z`} fill={chosen?C.gold:C.cyan} fillOpacity={.035+.06*value}/>
 <Label x={x} y={y} size={36} color={chosen?C.gold:C.ivory}>{short?'这是一把伞。':'红伞靠在蓝色门边。'}</Label>
 <path d={`M${x} ${y+28}h452`} stroke={chosen?C.gold:C.line} strokeWidth={chosen?3:1.5}/>
 </g>;

export const AlignmentMechanism:React.FC<SceneProps&{mode?:string}>=p=>{
 const t=progress(p),f=spoken(p),phase=p.phase||'examples',focus=p.focus||'',sft=p.mode==='sft';
 if(sft&&phase==='examples'){
  const fmt=/格式/.test(focus),initial=focus==='接话与回答',advance=segment(f,.08,.92),scan=advance*3;
  return <g><Picture src={photo} x={48} y={89} w={479} h={325} cover position="right center"/>
   <path d="M48 414l17 13h479V89l-17-12" fill="none" stroke={C.cyan} strokeOpacity={.35}/>
   <Label x={49} y={51} size={33} color={C.muted}>同一张照片</Label><Label x={49} y={488} size={34} color={C.gold}>{fmt?'分两点写出颜色和位置':'请说明伞在哪里'}</Label>
   <Label x={697} y={68} size={35} color={C.gold}>指令对应的示范答案</Label>
   {fmt?<g><Label x={694} y={183} size={39}>1. 颜色：红色</Label><Label x={694} y={253} size={39}>2. 位置：蓝色门边</Label><path d={`M689 206H${mix(700,1168,advance)}`} stroke={C.gold} strokeWidth={2}/><path d={`M689 276H${mix(700,1168,advance)}`} stroke={C.gold} strokeWidth={2}/></g>:<g><Label x={694} y={192} size={39} color={C.ivory}>红伞靠在蓝色门边。</Label><path d={`M693 220h${445*advance}`} stroke={C.gold} strokeWidth={3}/></g>}
   {answer.map((w,i)=>{const a=1-clamp(Math.abs(scan-i)),x=688+i%2*261,y=349+Math.floor(i/2)*122;return <g key={w}><TokenBlock x={x} y={y} word={w} width={212} height={77} color={palette[i]} active={.3+.7*a}/><path d={`M${x+22} ${y+87}h${166*(.2+.8*a)}`} stroke={palette[i]} strokeWidth={5}/></g>})}
   <Arrow a={[560,268]} b={[645,268]} color={C.gold} opacity={.4+.6*advance}/>
   <Label x={50} y={597} size={32} color={C.muted}>{initial?'把“继续接话”，组织成对任务的回答':'指令改变，示范的内容与格式跟着改变'}</Label>
  </g>;
 }
 if(sft){
  const learning=appliedClock(p,'s15-04','s15-08'),at=mix(0,3,segment(learning,.01,.92)),update=segment(learning,.1,.93),prob=mix(.22,.69,update),loss=-Math.log(prob);
  return <g><Label x={48} y={51} size={35} color={C.gold}>把任务和示范，组织成一条训练序列</Label>
   <TokenBlock x={48} y={105} word="伞在哪里？" width={302} height={83} active={.2}/>
   {answer.map((w,i)=><g key={w}><TokenBlock x={428+i*208} y={105} word={w} width={167} height={83} color={C.gold} active={.2+.8*(1-clamp(Math.abs(at-i)))}/><path d={`M${511+i*208} 199V${263+(1-clamp(Math.abs(at-i)))*20}`} stroke={C.gold} strokeOpacity={.2+.7*(1-clamp(Math.abs(at-i)))} strokeWidth={3}/><circle cx={511+i*208} cy={285} r={mix(18,9,update)+(i%2)*2} fill={C.gold} fillOpacity={.25+.5*(1-clamp(Math.abs(at-i)))}/></g>)}
   <path d="M48 221v14h302v-14M428 327v15h791v-15" fill="none" stroke={C.line} strokeWidth={2}/>
   <Label x={199} y={285} anchor="middle" size={31} color={C.muted}>提示提供上下文</Label><Label x={823} y={393} anchor="middle" size={34} color={C.gold}>在回答目标词元上计算损失</Label>
   <WeightTensor x={92} y={407} w={234} h={143} t={update} color={C.cyan} label="继续更新模型参数"/>
   <path d="M1198 446C1198 590 481 608 386 501" fill="none" stroke={C.gold} strokeOpacity={.32} strokeWidth={2}/>
   {Array.from({length:4},(_,i)=>{const q=bezier([[1198,446],[1198,590],[481,608],[386,501]],segment(learning,.05+i*.04,.87+i*.04));return <circle key={i} cx={q[0]} cy={q[1]} r={6} fill={C.gold}/>})}
   <Label x={578} y={476} size={33} color={C.muted}>正确目标的概率</Label><Label x={579} y={535} size={43} color={C.gold}>{(prob*100).toFixed(1)}%</Label>
   <Label x={1043} y={476} anchor="middle" size={33} color={C.muted}>目标损失</Label><Label x={1043} y={535} anchor="middle" size={43} color={C.gold}>{loss.toFixed(2)}</Label>
  </g>;
 }
 if(phase==='pairs'){
  const short=focus==='任务决定偏好',choice=short?0:1,z=segment(f,.08,.9),hy=choice?426:215;
  return <g><Label x={49} y={55} size={36} color={C.gold}>{short?'任务：只报出物体类别':'任务：说明伞放在哪里'}</Label><Picture src={photo} x={48} y={117} w={475} h={357} cover position="right center"/>
   <Sentence x={682} y={213} short chosen={choice===0} value={choice===0?z:0}/><Sentence x={682} y={424} chosen={choice===1} value={choice===1?z:0}/>
   <path d={`M552 300Q608 300 625 ${hy-10}`} fill="none" stroke={C.gold} strokeWidth={2.5}/>{(()=>{const a:[number,number]=[552,300],c:[number,number]=[608,300],b:[number,number]=[625,hy-10],q:[number,number]=[(1-z)*(1-z)*a[0]+2*(1-z)*z*c[0]+z*z*b[0],(1-z)*(1-z)*a[1]+2*(1-z)*z*c[1]+z*z*b[1]];return <circle cx={q[0]} cy={q[1]} r={8} fill={C.gold}/>})()}
   <path d={`M${1176} ${hy-23}l12 12 27-34`} fill="none" stroke={C.gold} strokeWidth={4.5} pathLength={1} strokeDasharray={`${z} 1`}/>
   <Label x={672} y={562} size={33} color={C.gold}>{short?'类别已说明，简洁更贴合要求':'位置关系更具体，更贴合当前问题'}</Label>
   <Label x={49} y={594} size={32} color={C.muted}>偏好随任务而变</Label>
  </g>;
 }
 if(phase==='reward'){
  const colors=[C.cyan,C.gold],a=segment(t,.08,.95),vals=[mix(.6,.25,a),mix(.45,.85,a)];
  return <g><Label x={49} y={50} size={36} color={C.gold}>问题：伞放在哪里？</Label><Label x={51} y={112} size={32} color={C.muted}>比较标注：更偏好位置说明</Label>
   {['这是一把伞。','红伞靠在蓝色门边。'].map((s,i)=><g key={s}><Label x={54} y={220+i*238} size={35} color={colors[i]}>{s}</Label>{Array.from({length:i?9:6},(_,j)=>{const z=segment(t,.02+j*.014,.77+j*.014);return <rect key={j} x={mix(65+j*39,547,z)} y={mix(251+i*238,255+j*14,z)} width={24} height={8} fill={colors[i]} fillOpacity={.75}/>})}</g>)}
   <WeightTensor x={612} y={214} w={196} h={209} t={a} color={C.gold} label="奖励模型"/>
   {vals.map((v,i)=><g key={i}><Arrow a={[852,303]} b={[963,203+i*239]} color={colors[i]} opacity={.6}/><rect x={978} y={253+i*239-v*139} width={204} height={v*139} fill={colors[i]} fillOpacity={.4}/><path d={`M978 ${253+i*239}h204`} stroke={C.line}/><Label x={1080} y={303+i*239} anchor="middle" size={42} color={colors[i]}>{v.toFixed(2)}</Label></g>)}
   <Label x={655} y={591} anchor="middle" size={33}>成对比较 → 参数调整 → 相对评分</Label>
  </g>;
 }
 if(phase==='dpo'){
  const a=segment(t,.06,.95),chosen=mix(.29,.65,a),rejected=mix(.41,.17,a),reference=.29/.41,ratio=chosen/rejected,logAdv=Math.log(ratio/reference);
  return <g><Label x={49} y={53} size={36} color={C.gold}>同一提示：伞放在哪里？</Label><Label x={49} y={111} size={31} color={C.muted}>比较完整回答的相对概率</Label>
   <Sentence x={52} y={202} chosen/><Sentence x={52} y={390} short/>
   {[chosen,rejected].map((v,i)=><g key={i}><rect x={51} y={244+i*188} width={552} height={32} fill={C.line} fillOpacity={.17}/><rect x={51} y={244+i*188} width={552*v} height={32} fill={palette[i]} fillOpacity={.72}/><Label x={619} y={272+i*188} size={34} color={palette[i]}>{v.toFixed(2)}</Label></g>)}
   <path d="M796 464V158M796 464H1222" stroke={C.line} strokeWidth={2}/><path d="M798 426H1222" stroke={C.cyan} strokeDasharray="7 7" strokeWidth={2}/>
   <path d={`M798 426C937 426 1065 ${426-logAdv*112} 1202 ${426-logAdv*112}`} fill="none" stroke={C.gold} strokeWidth={4}/><circle cx={1202} cy={426-logAdv*112} r={9} fill={C.gold}/>
   <Label x={1011} y={107} anchor="middle" size={34}>相对参考策略的优势</Label><Label x={1011} y={521} anchor="middle" size={35} color={C.gold}>log 比值变化：+{logAdv.toFixed(2)}</Label><Label x={1011} y={574} anchor="middle" size={31} color={C.cyan}>参考策略固定为基准</Label>
  </g>;
 }
 // s16-05 narrates the complete PPO cycle; later units explain constraints
 // while retaining that completed state, rather than restarting or delaying it.
 const unitId=String(p.data?.unitId||''),cycle=unitId&&unitId!=='s16-05'?1:f,generated=segment(cycle,.02,.24),graded=segment(cycle,.05,.24),updated=segment(cycle,.4,.94);
 return <g><Label x={51} y={51} size={35} color={C.gold}>语言模型生成 → 奖励评分 → 调整生成倾向</Label>
  <WeightTensor x={62} y={218} w={205} h={163} t={updated} color={C.cyan} label="生成策略"/><WeightTensor x={581} y={225} w={180} h={149} t={1} color={C.gold} label="已训练奖励模型"/><WeightTensor x={1013} y={222} w={190} h={159} t={updated} color={C.gold} label="参数更新"/>
  <Label x={339} y={183} size={33} color={C.ivory}>红伞靠在</Label><Label x={339} y={237} size={33} color={C.ivory}>蓝色门边。</Label>
  <path d={`M336 262h${174*generated}`} stroke={C.cyan} strokeWidth={3}/><Arrow a={[333,311]} b={[547,311]} color={C.cyan}/>
  <circle cx={889} cy={312} r={53} fill={C.gold} fillOpacity={.08} stroke={C.gold} strokeOpacity={.4}/><Label x={889} y={325} size={37} anchor="middle" color={C.gold} opacity={segment(graded,.1,.35)}>0.85</Label>
  <path d="M1102 456C1102 587 172 587 172 466" fill="none" stroke={C.gold} strokeOpacity={.4} strokeWidth={2}/>{[0,1,2].map(i=>{const q=bezier([[1102,456],[1102,587],[172,587],[172,466]],segment(cycle,.4+i*.03,.89+i*.03));return <circle key={i} cx={q[0]} cy={q[1]} r={6} fill={C.gold}/>})}
  <path d="M114 143H1169" stroke={C.cyan} strokeOpacity={.3} strokeDasharray="6 8"/><Label x={50} y={606} size={33} color={C.cyan}>参考策略提供约束，限制偏离过大</Label>
 </g>;
};

/** A stable positional lattice: fragments of the same image travel into model inputs. */
export const MultimodalMechanism:React.FC<SceneProps>=p=>{
 const t=progress(p),f=spoken(p),phase=p.phase||'patches',focus=p.focus||'',sound=String(p.data?.unitId||'').startsWith('s19')||/音频|声音|雨声/.test(focus);
 if(sound)return <AudioMechanism {...p}/>;
 if(phase==='evidence')return <SpatialPhotoEvidence {...p}/>;
 if(phase==='sequence')return <SpatialSequence {...p}/>;
 if(phase==='patches'||phase==='projector')return <SpatialPatches {...p}/>;
 if(phase==='evidence'){
  const relation=segment(f,.37,.77),zoom=1+.035*segment(f,.04,.94);
  return <g><g transform={`translate(${48-390*(zoom-1)} ${77-245*(zoom-1)}) scale(${zoom})`}><Picture src={photo} x={0} y={0} w={740} h={478} cover position="right center"/><ellipse cx={531} cy={315} rx={mix(66,144,relation)} ry={mix(100,190,relation)} fill={C.gold} fillOpacity={.05} stroke={C.gold} strokeWidth={3}/><rect x={617} y={47} width={87} height={300} fill={C.cyan} fillOpacity={.07*relation} stroke={C.cyan} strokeWidth={2} strokeOpacity={relation}/></g>
   <Label x={917} y={165} size={39} color={C.gold}>{relation>.5?'伞在哪里？':'伞是什么颜色？'}</Label><Label x={917} y={352} size={45}>{relation>.5?'蓝色门边':'红色'}</Label>
   <path d={`M${relation>.5?715:577} ${relation>.5?236:387}Q847 365 882 343`} fill="none" stroke={C.gold} strokeWidth={2}/><Label x={50} y={619} size={34} color={C.muted}>问题改变，要组合的视觉线索也改变</Label>
  </g>;
 }
 if(phase==='sequence'){
  const z=segment(t,.03,.83),use=segment(t,.48,.97);
  return <g><Picture src={photo} x={47} y={51} w={383} h={255} cover position="right center"/><Label x={661} y={129} size={39} color={C.gold}>红伞在哪里？</Label>
   {Array.from({length:8},(_,i)=>{const a=segment(t,.04+i*.018,.76+i*.018),x=mix(64+i%4*87,53+i*78,a),y=mix(66+Math.floor(i/4)*116,402,a),s=mix(80,62,a);return <g key={i}><PhotoPatch src={photo} x={x} y={y} w={s} h={s*2/3} col={i%4} row={Math.floor(i/4)*2} rows={4}/>{[0,1,2,3].map(j=><rect key={j} x={x+5} y={y+s*2/3+9+j*16} width={s-10} height={12} fill={C.cyan} fillOpacity={a*(.2+.55*Math.sin(i+j*.7)**2)}/>)}<path d={`M${x+4} ${y+124}h${s-8}`} stroke={C.cyan} strokeWidth={3}/></g>})}
   {['红伞','在哪里','？'].map((w,i)=>{const a=segment(t,.12+i*.05,.79+i*.05);return <TokenBlock key={w} x={mix(660+i*185,737+i*162,a)} y={mix(181,402,a)} word={w} width={138} height={118} color={C.gold} active={.65}/>})}
   <path d="M48 557H1225" stroke={C.line} strokeWidth={2}/><Label x={345} y={612} anchor="middle" size={34} color={C.cyan}>视觉表示保留位置</Label><Label x={970} y={612} anchor="middle" size={34} color={C.gold}>文字表示</Label>
   <g opacity={use}><Label x={810} y={263} size={37} color={C.gold}>蓝色门边。</Label><path d={`M1185 382Q1194 279 1063 279`} fill="none" stroke={C.gold} strokeWidth={2}/></g>
  </g>;
 }
 const projector=phase==='projector',overall=appliedClock(p,'s18-01','s18-03'),split=segment(overall,.02,.63),turn=mix(-.13,-.025,segment(overall,.3,.96)),project=projector?segment(f,.03,.96):0;
 return <g><Label x={47} y={48} size={35} color={C.cyan}>{projector?'把视觉表示投影到语言模型的输入维度':'图像块带着原来的空间位置'}</Label>
  <g transform={`translate(57 137) matrix(.95 ${turn} .1 .91 0 0)`}>
   {Array.from({length:16},(_,i)=>{const c=i%4,r=Math.floor(i/4),depth=(c+r)*7*split,x=c*(105+12*split)+depth*.7,y=r*(73+10*split)-depth*.4;return <g key={i}><path d={`M${x} ${y}l9-9h105v73l-9 9Z`} fill={C.cyan} fillOpacity={.06}/><PhotoPatch src={photo} x={x} y={y} w={105} h={73} col={c} row={r} outline={.55}/></g>})}
  </g>
  <Label x={271} y={552} size={32} anchor="middle" color={C.muted}>小块来自同一张照片</Label>
  <g transform="translate(668 166) matrix(.92 -.12 .12 .93 0 0)">{Array.from({length:16},(_,i)=>{const c=i%4,r=Math.floor(i/4),a=.16+.65*Math.abs(Math.sin(i*.81));return <g key={i}><rect x={c*39} y={r*71} width={28} height={57} fill={C.cyan} fillOpacity={a}/><path d={`M${c*39} ${r*71}l9-7h28v57l-9 7`} fill={C.cyan} fillOpacity={.12}/></g>})}</g>
  <Label x={757} y={527} anchor="middle" size={33} color={C.cyan}>视觉特征</Label>
  <WeightTensor x={968} y={218} w={147} h={188} t={project} color={C.gold}/><Label x={1049} y={466} anchor="middle" size={33} color={C.gold}>可训练连接器</Label>
  {Array.from({length:8},(_,i)=>{const a=segment(project,0,.75),x=mix(817,1175,a),y=200+i*40;return <rect key={i} x={x} y={y} width={40} height={12} rx={2} fill={project>.4?C.gold:C.cyan} fillOpacity={.35+.45*Math.sin(i*.7)**2}/>})}
  <Label x={651} y={583} anchor="middle" size={34} color={C.gold}>{projector?'位置随表示一起进入语言模型':'图像块的二维位置，随表示保留'}</Label>
 </g>;
};

const AudioMechanism:React.FC<SceneProps>=p=>{
 const t=progress(p),f=spoken(p),phase=p.phase,focus=p.focus||'',wave=(j:number)=>Math.sin(j*.29)*Math.sin(j*.047+1)+.35*Math.sin(j*.67),scan=segment(t,.03,.95),windowX=58+scan*948;
 if(phase==='sequence'){
  const a=segment(f,.02,.94);
  return <g><Picture src={photo} x={48} y={71} w={340} h={226} cover position="right center"/><Label x={216} y={356} anchor="middle" size={33} color={C.cyan}>照片：观察内容</Label>
   <path d={Array.from({length:100},(_,j)=>`${j?'L':'M'}${475+j*3.3} ${183+wave(j)*57}`).join(' ')} fill="none" stroke={C.gold} strokeWidth={3}/><Label x={641} y={356} anchor="middle" size={33} color={C.gold}>语音：提出要求</Label>
   <Label x={944} y={167} size={38}>请用一句话</Label><Label x={944} y={230} size={38}>说明位置</Label><Label x={1078} y={356} anchor="middle" size={33} color={palette[2]}>文字：限制格式</Label>
   {[0,1,2].map(mod=>Array.from({length:6},(_,i)=>{const z=segment(a,i*.035,.7+i*.04),x=mix(76+mod*426+i*41,124+(mod*6+i)*58,z),y=mix(385,470,z);return <rect key={`${mod}-${i}`} x={x} y={y} width={39} height={75} fill={palette[mod]} fillOpacity={.15+.45*Math.sin(i*.9+mod)**2}/>}))}
   <Label x={650} y={623} anchor="middle" size={35} color={C.gold}>多种输入，服务同一个任务</Label>
  </g>;
 }
 if(phase==='evidence'){
  const ambiguous=focus==='不要默认共同空间',a=segment(f,.05,.94);
  return <g><path d={Array.from({length:260},(_,j)=>`${j?'L':'M'}${56+j*4.5} ${125+wave(j)*57}`).join(' ')} fill="none" stroke={C.cyan} strokeWidth={3}/><rect x={56+995*a} y={48} width={168} height={157} fill={C.gold} fillOpacity={.05} stroke={C.gold} strokeOpacity={.6}/>
   <Picture src={photo} x={61} y={276} w={427} h={285} cover position="right center"/><Label x={627} y={314} size={39} color={C.gold}>雨落地面</Label><Label x={992} y={314} size={39} color={C.cyan}>风吹树叶</Label>
   {Array.from({length:16},(_,i)=>{const y=359+i%4*42,x=650+Math.floor(i/4)*29;return <path key={i} d={`M${x} ${y+mix(0,24,a)}l-8 22`} stroke={C.gold} strokeWidth={2} strokeOpacity={.35}/>})}
   {Array.from({length:9},(_,i)=>{const x=989+i%3*64,y=372+Math.floor(i/3)*58;return <ellipse key={i} cx={x+7*Math.sin(a*3+i)} cy={y} rx={22} ry={8} transform={`rotate(${mix(-28,26,a)} ${x} ${y})`} fill={C.cyan} fillOpacity={.32}/>})}
   <Label x={650} y={616} anchor="middle" size={34} color={C.gold}>{ambiguous?'音频参与匹配，还需要相应结构与训练':'声音有歧义，回到画面核对来源'}</Label>
  </g>;
 }
 return <g><Label x={48} y={48} size={35} color={C.gold}>沿时间取窗，再观察频率成分</Label>
  <path d={Array.from({length:280},(_,j)=>`${j?'L':'M'}${53+j*4.25} ${172+wave(j)*57}`).join(' ')} fill="none" stroke={C.cyan} strokeWidth={3}/><rect x={windowX} y={89} width={172} height={166} fill={C.gold} fillOpacity={.065} stroke={C.gold} strokeWidth={2}/>
  <g transform="translate(67 354) matrix(1 -.055 .13 .93 0 0)">{Array.from({length:240},(_,i)=>{const c=i%40,r=Math.floor(i/40),v=.12+.73*Math.abs(wave(c*7+r*19)),seen=clamp((scan*40-c)/2);return <rect key={i} x={c*18} y={r*32} width={16} height={29} fill={r<3?C.cyan:C.gold} fillOpacity={v*(.2+.8*seen)}/>})}</g>
  <path d={`M${windowX+86} 264Q${windowX+86} 315 ${85+scan*690} 339`} fill="none" stroke={C.gold} strokeWidth={2} strokeOpacity={.6}/>
  <WeightTensor x={970} y={345} w={182} h={175} t={scan} color={C.gold}/><Label x={435} y={591} anchor="middle" size={34}>时频特征</Label><Label x={1074} y={591} anchor="middle" size={34} color={C.gold}>音频表示</Label>
 </g>;
};
