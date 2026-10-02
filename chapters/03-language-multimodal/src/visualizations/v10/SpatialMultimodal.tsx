import React from 'react';
import {C,Label,Picture,SceneProps,progress,spoken,segment,mix,palette,clamp,bezier,Arrow} from './primitives';
import {PhotoPatch,appliedClock,WeightTensor} from './AppliedObjects';
import {Trace,StageRule,XY} from './CoreGeometry';
const photo='media/v2/01-umbrella.png';
const feature=(i:number,j:number)=>.55*Math.sin(i*.81+j*.7)+.17*Math.cos(i+j*.63);

/** The sixteen source patches retain identity throughout lifting and permutation. */
export const SpatialPatches:React.FC<SceneProps>=p=>{
 const u=progress(p),f=spoken(p),whole=appliedClock(p,'s18-01','s18-03'),lift=segment(whole,.025,.5),isProjector=p.phase==='projector',project=isProjector?segment(f,.04,.94):0,
 shuffle=p.data?.unitId==='s18-02'?Math.sin(Math.PI*segment(f,.03,.96)):0,tilt=mix(-.17,-.075,segment(whole,.08,.93)),scan=segment(whole,.05,.91)*15;
 const order=[0,7,2,11,4,13,6,1,8,15,10,3,12,5,14,9];
 return <g><Label x={60} y={61} size={37} color={C.gold}>{isProjector?'先转换表示，再接进语言模型':'一张照片，分成带位置的小块'}</Label>
  <g transform={`translate(73 176) matrix(.94 ${tilt} .16 1 0 0)`}>
   <path d="M-17-17H452V342H-17Z" fill={C.cyan} fillOpacity={.025} stroke={C.line} strokeOpacity={.26}/>
   {Array.from({length:16},(_,i)=>{const c=i%4,r=Math.floor(i/4),to=order[i],nc=mix(c,to%4,shuffle),nr=mix(r,Math.floor(to/4),shuffle),depth=8*lift*(1+Math.sin(i*.73)**2),x=nc*(105+6*lift),y=nr*(74+7*lift)-depth,lit=1-clamp(Math.abs(scan-i)/2);return <g key={i}>
    <path d={`M${x} ${y}l${depth*.6} ${-depth*.5}h102v71l${-depth*.6} ${depth*.5}Z`} fill={C.cyan} fillOpacity={.12}/>
    <PhotoPatch src={photo} x={x} y={y} w={102} h={71} col={c} row={r} outline={.17+.6*lit}/>
   </g>})}
  </g>
  <Label x={298} y={555} anchor="middle" size={30} color={C.cyan}>{shuffle>.25?'位置打乱，关系就难以读清':'每一块，都带着它来自哪里'}</Label>
  {Array.from({length:16},(_,i)=>{const c=i%4,r=Math.floor(i/4),x=659+c*42,y=207+r*78,lit=1-clamp(Math.abs(scan-i)/2);return <g key={i}>
   <path d={`M${x-2} ${y}l9-6h31v57l-9 6Z`} fill={C.cyan} fillOpacity={.055+.08*lit}/>
   {[0,1,2,3].map(j=><rect key={j} x={x+2} y={y+4+j*13} width={24} height={9} fill={feature(i,j)<0?C.rose:C.cyan} fillOpacity={.14+Math.abs(feature(i,j))*.6}/>)}</g>})}
  <Trace a={[536,318]} b={[641,318]} t={segment(whole,.05,.7)} color={C.cyan} width={2}/><Label x={731} y={555} anchor="middle" size={30} color={C.cyan}>视觉编码</Label>
  <g opacity={.25+.75*project}><WeightTensor x={919} y={233} w={99} h={179} t={project} color={C.gold}/><Label x={975} y={460} anchor="middle" size={29} color={C.gold}>连接器</Label></g>
  <Trace a={[831,320]} b={[906,320]} t={project} color={C.cyan}/>
  {Array.from({length:8},(_,i)=>{const x=1111+(i%2)*61,y=212+Math.floor(i/2)*71,z=segment(project,.025*i,.75+.025*i);return <g key={i}>{[0,1,2,3,4,5].map(j=><rect key={j} x={x} y={y+j*9} width={43} height={6} fill={feature(i,j)<0?C.rose:C.gold} fillOpacity={z*(.12+Math.abs(feature(i,j))*.65)}/>)}<Trace a={[1034,320]} b={[x-6,y+26]} t={z} color={C.gold} width={.7}/></g>})}
  <Label x={1161} y={555} anchor="middle" size={30} color={C.gold}>语言输入</Label><StageRule t={whole} y={620}/>
 </g>;
};

/** The visible feature parcels join the text sequence; the photograph stays as context. */
export const SpatialSequence:React.FC<SceneProps>=p=>{
 const u=progress(p),bring=segment(u,.04,.72),read=segment(u,.46,.96),words=['红伞','在哪','里？'],selected=segment(u,.04,.94)*11;
 return <g><Label x={59} y={61} size={37} color={C.gold}>图像和问题，进入同一条输入序列</Label>
  <Picture src={photo} x={62} y={119} w={392} h={264} cover position="right center"/>
  <g><Label x={808} y={169} anchor="middle" size={38} color={C.gold}>红伞在哪里？</Label><path d="M581 196H1042" stroke={C.gold} strokeOpacity={.2}/><Label x={1043} y={312} anchor="middle" size={37} color={C.ivory} opacity={read}>蓝色门边。</Label></g>
  <path d="M62 494H1225L1203 557H84Z" fill={C.cyan} fillOpacity={.025} stroke={C.line} strokeOpacity={.25}/>
  {Array.from({length:8},(_,i)=>{const t=segment(bring,i*.025,.75+i*.025),sx=86+i%4*85,sy=154+Math.floor(i/4)*113,x=mix(sx,92+i*75,t),y=mix(sy,448,t),size=mix(78,50,t),lift=Math.sin(t*Math.PI)*85,lit=1-clamp(Math.abs(selected-i));return <g key={i}>
   <g opacity={1-segment(t,.5,.95)}><PhotoPatch src={photo} x={x} y={y-lift} w={size} h={size*2/3} col={i%4} row={Math.floor(i/4)*2}/></g>
   {[0,1,2,3].map(j=><rect key={j} x={x} y={y-lift+j*16} width={size} height={12} fill={feature(i,j)<0?C.rose:C.cyan} fillOpacity={t*(.18+.35*Math.abs(feature(i,j))+.16*lit)}/>)}
  </g>})}
  {words.map((word,i)=>{const t=segment(bring,.05+i*.065,.83+i*.03),x=mix(707+i*149,821+i*155,t),y=mix(239,479,t),lit=1-clamp(Math.abs(selected-(i+8)));return <g key={word}><Label x={x} y={y} anchor="middle" size={36} color={C.gold}>{word}</Label><path d={`M${x-58} ${y+21}h116`} stroke={C.gold} strokeWidth={2+2*lit} strokeOpacity={.3+.65*t}/></g>})}
  <Trace a={[1202,430]} b={[1155,330]} bend={60} t={read} color={C.gold}/><Label x={355} y={602} anchor="middle" size={31} color={C.cyan}>视觉表示 · 保留位置</Label><Label x={985} y={602} anchor="middle" size={31} color={C.gold}>文字表示 · 提出任务</Label>
 </g>;
};

/** A shared cropped photograph and camera keep pixel evidence aligned to the callout. */
export const SpatialPhotoEvidence:React.FC<SceneProps>=p=>{
 const u=spoken(p),relation=segment(u,.4,.86),zoom=mix(1.02,1.1,segment(u,.03,.9)),px=71,py=110,w=721,h=468;
 // Coordinates are in the source picture's local 721 x 468 display.
 const ux=504,uy=282,doorX=607,doorY=188;
 return <g><Label x={59} y={61} size={37} color={C.gold}>问题改变，就去取不同的证据</Label>
  <svg x={px} y={py} width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow:'hidden'}}><g transform={`translate(${w/2} ${h/2}) scale(${zoom}) translate(${-w/2} ${-h/2})`}><Picture src={photo} x={0} y={0} w={w} h={h} cover position="right center"/>
   <ellipse cx={ux} cy={uy} rx={mix(70,128,relation)} ry={mix(63,150,relation)} fill={C.gold} fillOpacity={.035} stroke={C.gold} strokeWidth={3}/><rect x={doorX-45} y={doorY-125} width={90} height={250} fill={C.cyan} fillOpacity={.025*relation} stroke={C.cyan} strokeWidth={2.5} strokeOpacity={relation}/>
  </g></svg>
  <Label x={1016} y={185} anchor="middle" size={36} color={C.gold}>{relation<.5?'先看伞面':'再看伞与门'}</Label>
  <Label x={1016} y={286} anchor="middle" size={43}>{relation<.5?'红色':'蓝色门边'}</Label>
  <path d={`M${px+w-8} ${py+h*.5}Q849 ${py+h*.5} 858 277`} stroke={C.gold} strokeOpacity={.5} fill="none" strokeWidth={2.5}/>
  <Label x={1016} y={440} anchor="middle" size={30} color={C.muted}>{relation<.5?'颜色 → 物体属性':'在哪里 → 空间关系'}</Label><Label x={1016} y={502} anchor="middle" size={30} color={C.muted}>同一张照片</Label>
 </g>;
};
