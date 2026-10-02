import React from 'react';
import {AssistantWalkthrough} from './AssistantWalkthrough';
import {AttentionMechanism,TransformerMechanism} from './AttentionTransformer';
import {MultimodalMechanism} from './AlignmentMultimodal';
import {Img, OffthreadVideo, Freeze, staticFile} from 'remotion';
import {C,Label,Picture,Vector,Transfer,SceneProps,clamp,segment,mix,palette} from './primitives';

// Overview annotations belong to the current visual stage, not to the
// individual spoken unit.  Reading the stage clock first keeps labels and
// leader lines continuous when a caption boundary is crossed.
const sceneProgress=(p:SceneProps)=>clamp(Number(p.data?.stageProgress??p.data?.progress??(p.phaseFrame||0)/360));

/**
 * Three real lesson excerpts, held in a quiet spatial gallery.  The camera
 * stops while each mechanism develops, then moves to the next depth plane.
 * The final pose is still the first pose of the next umbrella task.
 */
const IntroMontage:React.FC<SceneProps>=p=>{
  const units=p.data?.timelineUnits as Array<Record<string,unknown>>|undefined;
  const introUnit=units?.find(u=>u.id==='s01-01');
  // Use the full unit clock. stageProgress deliberately ends before the unit
  // boundary in Film; using it here shortened already scarce reading time.
  const start=Number(introUnit?.from??36),duration=Number(introUnit?.to??392)-start;
  const local=clamp((Number(p.data?.globalFrame??start+(p.phaseFrame||0))-start)/Math.max(1,duration-1))*(duration-1);
  const smooth=(value:number,a:number,b:number)=>{const x=clamp((value-a)/(b-a));return x*x*x*(x*(x*6-15)+10);};
  // 78+ frame clear holds; two 33-frame camera moves; 46-frame photo settle.
  // Quintic interpolation has zero velocity and acceleration at each stop.
  const hero=smooth(local,86,119)+smooth(local,197,230);
  const settle=smooth(local,308,354),copyOpacity=1-smooth(local,302,337);
  const samples=[
   {id:'s06-01',label:'Q · K · V',color:C.gold,kind:'attention',holdFrom:0,holdTo:86},
   {id:'s09-06',label:'Transformer · 信息逐层流动',color:C.cyan,kind:'transformer',holdFrom:119,holdTo:197},
   {id:'s18-03',label:'让画面进入语言',color:'#abc296',kind:'multimodal',holdFrom:230,holdTo:308},
  ] as const;
  const stage=(sample:(typeof samples)[number])=>{
   const unit=units?.find(u=>u.id===sample.id);
   // Replay a measured lesson excerpt in its own source clock.  Passing the
   // opening's globalFrame froze mechanisms that consult their original cues.
   // Only the inner mechanism advances during a hold. Keep this clock smooth,
   // without flooring to a source frame or resetting at a camera stop.
   const sp=mix(.09,.91,smooth(local,sample.holdFrom-22,sample.holdTo+22));
   const section=(p.data?.timelineSections as Array<Record<string,unknown>>|undefined)?.find(s=>s.id===unit?.section);
   const duration=Number(unit?.to??650)-Number(unit?.from??0);
   const sourceFrame=Number(unit?.from??0)+sp*(duration-1);
   const q={...p,frame:sourceFrame-Number(section?.from??0),durationInFrames:Number(section?.to??duration)-Number(section?.from??0),phaseFrame:sourceFrame-Number(unit?.from??0),phase:String(unit?.phase??''),focus:String(unit?.focus??''),cue:String(unit?.text??''),data:{...(p.data||{}),globalFrame:sourceFrame,stageProgress:sp,progress:sp,unitProgress:sp,unitDuration:duration,unitId:sample.id,dataRef:unit?.dataRef??null}};
   if(sample.kind==='attention')return <AttentionMechanism {...q}/>;
   if(sample.kind==='transformer')return <TransformerMechanism {...q}/>;
   return <MultimodalMechanism {...q}/>;
  };
  const point=(i:number)=>{
   const d=i-hero,focus=Math.exp(-((d/.7)**2));
   // Rear planes recede and turn gently. The reading plane is exactly frontal;
   // there is no continuous wobble or synthetic blur on its live text.
   return {x:640+d*795,y:365+(Math.sqrt(d*d+.16)-.4)*30,s:mix(.44,.91,focus),a:mix(.16,1,focus),skew:d*.036*(1-focus),focus};
  };
  const nextUnit=(p.data?.timelineUnits as Array<Record<string,unknown>>|undefined)?.find(u=>u.id==='s01-02');
  // Reuse the next teaching composition at its exact first pose.  The final
  // montage frame and the next unit therefore have the same photo and labels.
  const handoff={...p,phase:String(nextUnit?.phase??'task'),focus:String(nextUnit?.focus??'任务照片'),phaseFrame:0,data:{...(p.data||{}),unitId:'s01-02',stageProgress:0,progress:0,unitProgress:0}};
  return <g>
   <defs>
    <linearGradient id="intro-hero-vignette" x1="0" x2="1"><stop offset="0" stopColor="#02070d" stopOpacity=".64"/><stop offset=".5" stopColor="#18313c" stopOpacity=".04"/><stop offset="1" stopColor="#02070d" stopOpacity=".64"/></linearGradient>
    <linearGradient id="intro-plane-face" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#10232d"/><stop offset=".5" stopColor="#07131c"/><stop offset="1" stopColor="#041019"/></linearGradient>
    <linearGradient id="intro-plane-side" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#52717b" stopOpacity=".55"/><stop offset="1" stopColor="#061019" stopOpacity=".9"/></linearGradient>
    <filter id="intro-hero-glow"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="intro-plane-shadow" x="-20%" y="-30%" width="150%" height="170%"><feGaussianBlur stdDeviation="13"/></filter>
    <clipPath id="intro-rail-safe"><rect x={0} y={122} width={1300} height={492}/></clipPath>
   </defs>
   <g opacity={copyOpacity}>
    <Label x={50} y={52} size={42} color={C.gold}>六章，拆开 AI 怎样学会理解世界</Label>
    <Label x={50} y={91} size={25} color={C.muted}>从一句话出发，看信息怎样流动，再回到真实的画面</Label>
   </g>
   <g opacity={1-settle} clipPath="url(#intro-rail-safe)">
    <path d="M55 610Q650 532 1245 610" fill="none" stroke="#8bcbd6" strokeOpacity=".10" strokeWidth="18" filter="url(#intro-hero-glow)"/>
    <path d="M55 610Q650 532 1245 610" fill="none" stroke={C.cyan} strokeOpacity=".32" strokeWidth="2"/>
    {samples.map((sample,i)=>{
      const q=point(i),id=`intro-hero-window-${i}`;
      const clipWidth=960,clipHeight=460;
      const px=q.x-clipWidth*q.s/2,py=q.y-clipHeight*q.s/2;
      const depth=q.focus,edge=sample.color,thickness=mix(27,18,depth);
      return <g key={sample.id} opacity={q.a} transform={`translate(${px} ${py}) scale(${q.s}) matrix(1 ${q.skew} 0 1 0 0)`}>
       <clipPath id={id}><rect width={clipWidth} height={clipHeight} rx={26}/></clipPath>
       <clipPath id={`${id}-content`}><rect x={22} y={82} width={916} height={356}/></clipPath>
       <rect x={15} y={30} width={clipWidth} height={clipHeight} rx={26} fill="#000" opacity={.62} filter="url(#intro-plane-shadow)"/>
       <rect x={thickness} y={thickness*.65} width={clipWidth} height={clipHeight} rx={26} fill="#050d13" stroke={edge} strokeOpacity={.18} strokeWidth={1.3}/>
       <path d={`M${clipWidth-25} 1L${clipWidth+thickness-25} ${thickness*.65+1}Q${clipWidth+thickness} ${thickness*.65+1} ${clipWidth+thickness} ${thickness*.65+26}V${clipHeight+thickness*.65-26}L${clipWidth} ${clipHeight-26}V26Q${clipWidth} 1 ${clipWidth-25} 1Z`} fill="url(#intro-plane-side)"/>
       <path d={`M26 ${clipHeight}H${clipWidth-26}L${clipWidth+thickness-26} ${clipHeight+thickness*.65}H${26+thickness}Z`} fill="url(#intro-plane-side)"/>
       <g clipPath={`url(#${id})`}>
        <rect width={clipWidth} height={clipHeight} fill="url(#intro-plane-face)"/>
        {/* Native headings occupy y<96.  Keep them outside this viewport,
            contain the complete mechanism below the single window title. */}
        <g clipPath={`url(#${id}-content)`}>
         <g transform="translate(64 20.56) scale(.64)">{stage(sample)}</g>
        </g>
        <rect width={clipWidth} height={clipHeight} fill="url(#intro-hero-vignette)" opacity={.28-depth*.12}/>
        <path d={`M0 66H${clipWidth}`} stroke={edge} strokeOpacity={.24+.28*depth} strokeWidth="1.5"/>
        <Label x={30} y={44} size={32} color={edge}>{sample.label}</Label>
       </g>
       <rect width={clipWidth} height={clipHeight} rx={26} fill="none" stroke={edge} strokeOpacity={.18+.56*depth} strokeWidth={mix(1.2,2.4,depth)}/>
      </g>;
    })}
    {[0,1].map(i=>{const t=smooth(local,8+i*106,182+i*106),x=55*(1-t)**2+2*650*(1-t)*t+1245*t*t,y=610*(1-t)**2+2*532*(1-t)*t+610*t*t;return <g key={`intro-light-${i}`} opacity={segment(t,0,.12)*(1-segment(t,.88,1))}>
      <circle cx={x} cy={y} r={7} fill={i?C.cyan:C.gold}/><circle cx={x} cy={y} r={19} fill="none" stroke={i?C.cyan:C.gold} strokeOpacity=".22" strokeWidth="1.6"/>
    </g>})}
   </g>
   <g opacity={settle} transform={`translate(${70*(1-settle)} ${65*(1-settle)}) scale(${mix(.9,1,settle)})`}>
    <OverviewScene {...handoff}/>
   </g>
  </g>;
};

// The photographed umbrella and door remain in one camera coordinate system.
// All annotations move with that system rather than with the screen.
const Photo:React.FC<{p:SceneProps;x:number;y:number;w:number;h:number;focus?:number;annotate?:boolean}>=({p,x,y,w,h,focus=0,annotate=false})=>{
 const f=sceneProgress(p),g=Number(p.data?.globalFrame??p.frame),z=1+focus*.18;
 // Match the original cache frame clock while decoding the source video directly.
 const videoFrame=Math.max(0,Math.floor((g*.9825726141078838)%600));
 return <svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${1920} ${1080}`} preserveAspectRatio="xMidYMid meet" style={{overflow:'hidden'}}>
  <g transform={`translate(${1480*(1-z)} ${560*(1-z)}) scale(${z})`}>
   <foreignObject width={1920} height={1080}>{annotate?<Img src={staticFile('media/v2/01-umbrella.png')} style={{width:1920,height:1080,display:'block'}}/>:<Freeze frame={videoFrame}><OffthreadVideo src={staticFile('media/v2/01-umbrella-loop.mp4')} muted style={{width:1920,height:1080,display:'block'}}/></Freeze>}</foreignObject>
   {annotate&&<>
    <g fill="none" stroke={C.gold} strokeWidth={4} opacity={segment(f,.02,.36)}><path d="M1335 143h-70v70M1560 143h70v70M1265 930v70h70M1630 930v70h-70"/></g>
    <path d="M1690 840V225H1810" fill="none" stroke={C.cyan} strokeWidth={4} pathLength={1} strokeDasharray={`${segment(f,.38,.69)} 1`}/>
   </>}
  </g>
 </svg>;
};
const DepthPlane:React.FC<{children:React.ReactNode;t:number;x?:number;y?:number}>=({children,t,x=0,y=0})=> <g transform={`translate(${x} ${y}) matrix(1 ${mix(-.025,0,t)} ${mix(-.045,0,t)} 1 0 0)`}>{children}</g>;

const Route:React.FC<SceneProps>=p=>{
 const f=sceneProgress(p),t=sceneProgress(p),technical=p.focus==='三项技术';
 const steps=['变成数字','利用前文','找到画面'];
 return <g>
  <Label x={50} y={52} size={42} color={C.gold}>红伞，靠在蓝色门边</Label>
  <path d="M83 540Q625 640 1257 531" stroke={C.line} strokeWidth={1.5} fill="none" opacity={.25}/>
  {steps.map((label,i)=>{const x=66+i*427,local=segment(f,i*.22,.42+i*.22);return <g key={label}>
   <ellipse cx={x+141} cy={487} rx={134} ry={20} fill={palette[i]} opacity={.035+.03*local}/>
   {i===0?<DepthPlane t={local} x={x} y={132}>{['红伞','靠在','蓝色','门边'].map((word,j)=>{
    const ty=48+j*73,dx=mix(0,115,segment(local,.18,.84));return <g key={word}>
     <Label x={0} y={ty} size={35} color={palette[j]}>{word}</Label>
     <path d={`M86 ${ty-12}H${112+dx*.18}`} fill="none" stroke={palette[j]} strokeWidth={2} opacity={.6}/>
     {[.23,.62,.4,.87].map((v,k)=><rect key={k} x={117+k*29} y={ty-27} width={22} height={30} rx={3} fill={palette[j]} opacity={.16+v*local*.7}/>)}</g>;
   })}</DepthPlane>:i===1?<g transform={`translate(${x} 127)`}>
    {[0,1,2,3].map(j=><g key={j} transform={`translate(${j*72} ${Math.sin(j)*14})`}>
     <Vector x={0} y={177} w={42} h={172} values={[.2+j*.1,.8-j*.12,.4,.64]} color={palette[j]} showValues={false}/>
     <circle cx={21} cy={131} r={10} fill={palette[j]}/>
    </g>)}
    {[0,1,2].map(j=><Transfer key={j} color={palette[j]} points={[[j*72+21,131],[j*72+21,12],[237,12],[237,131]]} t={segment(f,.09+j*.14,.48+j*.15)}/>)}
   </g>:<DepthPlane t={local} x={x-3} y={141}><Photo p={p} x={0} y={0} w={291} h={277} focus={local}/><path d={`M0 293H${291*local}`} stroke={C.gold} strokeWidth={4}/></DepthPlane>}
   {i<2&&<Transfer points={[[x+309,325],[x+355,304],[x+375,304],[x+410,325]]} t={segment(t,.05+i*.22,.66+i*.23)} color={C.gold}/>}
   <Label x={x+132} y={569} anchor="middle" size={36} color={local>.5?C.ivory:C.muted}>{technical?['Transformer','上下文与预测','CLIP'][i]:label}</Label>
   </g>;})}
 </g>;
};

const SeriesMap:React.FC<SceneProps>=p=>{
 const f=sceneProgress(p),names=['看见与选择','从识别到创造','语言连接万物','重建空间与时间','推理与使用工具','预测世界并行动'];
 const nodes=[[159,156],[587,156],[1090,156],[1090,417],[587,417],[159,417]];
 return <g>
  {nodes.slice(0,-1).map(([x,y],i)=>{const [nx,ny]=nodes[i+1];return <Transfer key={i} points={[[x,y],[x+(nx-x)*.4,y],[nx,ny-(ny-y)*.4],[nx,ny]]} t={segment(f,i*.075,.35+i*.075)} color={i<2?C.gold:C.cyan}/>;})}
  {nodes.map(([x,y],i)=>{const k=segment(f,i*.05,.33+i*.075),active=i===2;return <g key={names[i]} transform={`translate(${x} ${y})`}>
   <ellipse cy={37} rx={active?67:48} ry={14} fill={active?C.gold:C.cyan} opacity={.055}/>
   <g transform={`scale(${mix(.84,1,k)})`}>
    <circle r={active?55:42} fill={C.ink} stroke={active?C.gold:C.line} strokeWidth={active?2.5:1.5}/>
    <path d={i===0?'M-21 7Q0-21 21 7Q0 30-21 7':i===1?'M-22-16L22-16L16 24H-16Z':i===2?'M-22-16H22V14H4L-9 28V14H-22Z':i===3?'M-22-7L0-21L22-7V17L0 30L-22 17ZM0-21V5M-22-7L0 5L22-7M0 5V30':i===4?'M-21-14H-3V3H19M-3 3V22H-21':'M-23 20V-7Q0-30 23-7V20M-14 3H14'} fill="none" stroke={active?C.gold:C.cyan} strokeWidth={3} strokeLinejoin="round"/>
   </g>
   <Label x={0} y={99} size={32} color={active?C.gold:C.ivory} anchor="middle">{names[i]}</Label>
  </g>})}
 </g>;
};

export const OverviewScene:React.FC<SceneProps>=p=>{
 // Overview annotations should follow the composition clock.  Using the
 // per-unit speech clock here made labels snap back whenever a caption unit
 // changed, which read as text jitter in the opening montage.
 const f=sceneProgress(p),focus=p.focus||'';
 if(p.data?.unitId==='s01-01')return <IntroMontage {...p}/>;
 if(String(p.data?.unitId||'').startsWith('s20')&&p.data?.unitId!=='s20-08')return <AssistantWalkthrough {...p}/>;
 if(focus==='系列地图')return <SeriesMap {...p}/>;
 if(p.phase==='route'||p.phase==='pipeline')return <Route {...p}/>;
 if(/论文/.test(focus))return <g>{['transformer','clip','instructgpt'].map((id,i)=>{
  const move=segment(f,0,.9),x=70+i*418;return <g key={id} transform={`translate(${x} ${85-i*12}) matrix(1 ${mix((i-1)*.05,0,move)} ${mix(.04,0,move)} 1 0 0)`}>
   <rect x={12} y={20} width={317} height={422} fill="#000" opacity={.35}/><Picture src={`papers/v2/${id}-1.jpg`} x={0} y={0} w={326} h={422}/><Label x={163} y={489} anchor="middle" size={34}>{['Transformer','CLIP','InstructGPT'][i]}</Label>
  </g>;
 })}</g>;
 if(/空间/.test(focus)||p.phase==='bridge')return <g>
  {[0,1,2].map(i=>{const angle=mix((i-1)*.1,(i-1)*.02,segment(f,.05,.95)),x=51+i*426;return <g key={i} transform={`translate(${x} ${90+Math.abs(i-1)*50}) matrix(1 ${angle} 0 1 0 0)`}>
   <Photo p={p} x={0} y={0} w={340} h={330} focus={segment(f,.1,.9)*i*.25}/><path d="M-7 332H347" stroke={palette[i]} strokeWidth={3}/><Label x={170} y={418} anchor="middle" size={34}>{['观察','建立联系','追问空间'][i]}</Label>
  </g>})}<Label x={650} y={620} anchor="middle" size={36}>下一步：把多次观察放进同一个空间</Label>
 </g>;
 if(focus==='颜色干扰'){
  const a=segment(f,.1,.4),b=segment(f,.52,.88);const weights=[b,1-a,a*(1-b)];
  return <g>
   <Label x={50} y={53} size={39} color={C.gold}>红伞 · 靠在 · 蓝色门边</Label>
   {['01-umbrella','candidate-red-car','candidate-umbrella-grass'].map((id,i)=>{const w=weights[i],x=44+i*426;return <g key={id} transform={`translate(${x} ${mix(174,145,w)})`}>
    <g transform={`translate(${182*(1-mix(.92,1,w))} 0) scale(${mix(.92,1,w)})`} opacity={mix(.54,1,w)}>
     <Picture src={`media/v2/${id}.png`} x={0} y={0} w={362} h={290} cover position="right center"/>
     <rect x={0} y={290} width={362} height={4} fill={i===0?C.gold:C.cyan} opacity={.2+.8*w}/>
    </g><Label x={181} y={364} anchor="middle" size={34} color={i===0?C.gold:C.ivory}>{['整个关系匹配','只有颜色相近','物体对，位置不同'][i]}</Label>
   </g>})}
  </g>;
 }
 if(focus==='从检索到描述')return <g>
  <Photo p={p} x={40} y={83} w={747} h={461} focus={segment(f,.08,.88)}/>
  {['红伞','靠在','蓝色','门边'].map((word,i)=>{const a=segment(f,i*.16,i*.16+.27);return <g key={word} transform={`translate(${mix(772,844+(i%2)*204,a)} ${198+Math.floor(i/2)*158})`} opacity={a}>
   <Label x={0} y={0} size={45} color={palette[i]}>{word}</Label><path d="M0 20h112" stroke={palette[i]} strokeWidth={2}/>
  </g>})}<Label x={650} y={613} size={38} anchor="middle">把物体、颜色和关系一起说清楚</Label>
 </g>;
 if(focus==='进入输入')return <g>
  <Photo p={p} x={35} y={115} w={530} h={380} focus={segment(f,0,.9)}/>
  <Transfer points={[[588,303],[665,266],[703,266],[759,303]]} t={segment(f,.06,.61)} color={C.gold}/>
  {['红','伞'].map((word,i)=>{const a=segment(f,.12,.85);return <g key={word} transform={`translate(${mix(820+i*143,817+i*240,a)} 297)`}>
   <Label x={0} y={0} size={77} color={palette[i]}>{word}</Label>
   {[0,1,2,3].map(k=><rect key={k} x={k*25-8} y={51} width={18} height={mix(2,25+(k+i)%3*15,a)} rx={2} fill={palette[i]} opacity={a*.65}/>)}
  </g>})}<Label x={650} y={600} anchor="middle" size={38}>让汉字成为可计算的输入</Label>
 </g>;
 const close=focus==='任务照片';
 return <g>
  <DepthPlane t={segment(f,0,.88)}><Photo p={p} x={38} y={68} w={890} h={501} focus={close?segment(f,.05,.91):segment(f,0,1)*.3} annotate={close}/></DepthPlane>
  {['红伞','蓝色门','靠在门边'].map((w,i)=>{const a=segment(f,close?i*.25:0,close?.2+i*.27:.4);return <g key={w} transform={`translate(${mix(18,0,a)} 0)`} opacity={.24+.76*a}>
   {/* Keep the leader and label in one coordinate system.  Animating the
       leader's width independently made its endpoint drift away from the
       moving word and read as a jittering dash. */}
   <path d={`M960 ${170+i*151}h41`} stroke={palette[i]} strokeWidth={3}/><Label x={1018} y={185+i*151} size={41} color={palette[i]}>{w}</Label>
  </g>})}
 </g>;
};
