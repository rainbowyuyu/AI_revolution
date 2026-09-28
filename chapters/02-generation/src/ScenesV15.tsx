import React from 'react';
import {Img,staticFile} from 'remotion';
import {C,clamp,ease,mix,timing,T,Surface,Line,Head,Footer,Bar,Scatter,Curves,sample,Props} from './TeachingV15';
import {FrameVideoV15,sourceFrame} from './FrameVideoV15';
import exp from '../results/distributions-v5.json';
import digits from '../results/digits.json';
import featureData from './features-v2.json';
import noise from './noise-v15.json';
import voiceAnchors from './voice-visual-anchors-v15.json';
import actionStudy from './action-study-v15.json';

import {OpusMotionV15} from './OpusMotionV15';


const canonical='character/v15/canonical.png';
const gan=[0,100,300,600,1000,1500,2000,3000].map(s=>`experiments/digits/gan-${String(s).padStart(4,'0')}.png`);
const ddpm=Array.from({length:41},(_,i)=>`experiments/digits/ddpm-t${String(200-i*5).padStart(3,'0')}.png`);
const smooth=(n:number)=>{const p=clamp(n);return p*p*p*(p*(p*6-15)+10)};
// Every diagram shares the same safe content rectangle. Images wait for decoding.
function Pic({file,x,y,w,h=w,fit='contain'}:{file:string;x:number;y:number;w:number;h?:number;fit?:'contain'|'cover'}){
 return <foreignObject x={x} y={y} width={w} height={h}><Img src={staticFile(file)} style={{width:'100%',height:'100%',objectFit:fit,display:'block',maskImage:file===canonical?'linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent),linear-gradient(180deg,transparent,#000 6%,#000 94%,transparent)':undefined,maskComposite:'intersect'}}/></foreignObject>;
}
function Images({files,p,x,y,w,h=w}:{files:string[];p:number;x:number;y:number;w:number;h?:number}){
 const t=clamp(p)*(files.length-1),i=Math.floor(t),j=Math.min(i+1,files.length-1);
 return <g><Pic file={files[i]} x={x} y={y} w={w} h={h}/>{j!==i&&<g opacity={smooth(t-i)}><Pic file={files[j]} x={x} y={y} w={w} h={h}/></g>}</g>;
}
function Sweep({points,p,color=C.gold}:{points:number[][];p:number;color?:string}){
 const lengths=points.slice(1).map((v,i)=>Math.hypot(v[0]-points[i][0],v[1]-points[i][1]));
 const length=lengths.reduce((a,b)=>a+b,0);let d=clamp(p)*length,j=0;
 while(j<lengths.length-1&&d>lengths[j]){d-=lengths[j];j++}
 const q=clamp(d/Math.max(1e-8,lengths[j])),x=mix(points[j][0],points[j+1][0],q),y=mix(points[j][1],points[j+1][1],q);
 return <g><polyline points={points.map(v=>v.join(',')).join(' ')} stroke={color} strokeOpacity={.28} fill="none" strokeWidth={2}/><circle cx={x} cy={y} r={6} fill={color}/></g>;
}
function Field({kind,p,x,y,scale=53,n=240}:{kind:'gan'|'ddpm'|'target';p:number;x:number;y:number;scale?:number;n?:number}){
 const row=sample(kind,p);return <g>{exp.centers.map((c,i)=><circle key={i} cx={x+c[0]*scale} cy={y-c[1]*scale} r={.36*scale} stroke={C.cyan} strokeOpacity={.28} fill={C.cyan} fillOpacity={.025}/>)}<Scatter points={exp.target} cx={x} cy={y} scale={scale} n={n} color={C.cyan} opacity={.18}/><Scatter points={row.points} cx={x} cy={y} scale={scale} n={n} color={kind==='target'?C.cyan:C.gold}/></g>;
}
function Clip({id,children,x=135,y=392,w=1020,h=415}:{id:string;children:React.ReactNode;x?:number;y?:number;w?:number;h?:number}){
 return <><defs><clipPath id={id}><rect x={x} y={y} width={w} height={h}/></clipPath></defs><g clipPath={`url(#${id})`}>{children}</g></>;
}
function PhotoPlane({file,x,y,w,h,angle=0,scale=1}:{file:string;x:number;y:number;w:number;h:number;angle?:number;scale?:number}){
 return <foreignObject x={x-28} y={y-25} width={w+56} height={h+55} style={{overflow:'visible'}}><div style={{padding:25,perspective:1400}}><Img src={staticFile(file)} style={{width:w,height:h,objectFit:'contain',display:'block',transform:`rotateY(${angle}deg) rotateX(2deg) scale(${scale})`,transformOrigin:'center',maskImage:'linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent),linear-gradient(180deg,transparent,#000 5%,#000 95%,transparent)',maskComposite:'intersect'}}/></div></foreignObject>;
}
// Normalized points use the same square raster as the magnifier; update once when reference changes.
export const TAXUE_ANCHORS=[
 {x:.262,y:.255,r:.085,label:'鼻梁白纹',detail:'鼻梁到额头的白色线索'},
 {x:.261,y:.218,r:.100,label:'棕色眼睛',detail:'眼睛的颜色与位置'},
 {x:.337,y:.920,r:.115,label:'白色脚爪',detail:'四肢的白色毛发'},
 {x:.510,y:.510,r:.480,label:'黑白长毛',detail:'身体比例和完整轮廓'},
 {x:.824,y:.640,r:.160,label:'蓬松尾巴',detail:'自然下垂的长毛尾巴'},
];
function Identity({beat,frame}:Props){
 const featurePatterns=[/鼻梁|白纹|额头|面纹/,/棕色|眼睛|棕眼/,/白爪|四爪|脚爪/,/黑白|长毛|毛色|身体|比例|轮廓/,/尾巴|蓬松尾/];
 // Build the camera route from the spoken line, including multiple anchors within one sentence.
 // Between lines the last focus is held; entering a new line never resets the camera to zero.
 const targets:{start:number;span:number;from:number;to:number}[]=[];let previous=3;
 const words=voiceAnchors.filter(c=>c.scene===beat.id).flatMap(c=>c.markers).map(m=>({m,index:featurePatterns.findIndex(rx=>rx.test(m.term))})).filter(v=>v.index>=0).sort((a,b)=>a.m.fromFrame-b.m.fromFrame);
 for(let k=0;k<words.length;k++){
  const {m,index}=words[k];if(index===previous&&k>0)continue;
  const next=words.slice(k+1).find(w=>w.index!==index)?.m.fromFrame??m.toFrame+40;
  targets.push({start:Math.max(0,m.fromFrame-beat.from-5),span:Math.max(20,next-m.fromFrame),from:previous,to:index});previous=index;
 }
 if(!targets.length)for(const c of beat.clips){
  const names=featurePatterns.map((rx,index)=>({index,at:c.text.search(rx)})).filter(x=>x.at>=0).sort((a,b)=>a.at-b.at);
  if(!names.length&&/合在一起|多个可见|具体的外形|哪一种外形|先看场景|是否符合任务/.test(c.text))names.push({index:3,at:0});
  const span=(c.to-c.from)/Math.max(1,names.length);
  for(let k=0;k<names.length;k++){targets.push({start:c.from+k*span,span,from:previous,to:names[k].index});previous=names[k].index;}
 }
 const step=targets.filter(x=>x.start<=frame).at(-1);
 const i=step?.from??3,j=step?.to??3,v=step?smooth((frame-step.start)/Math.min(28,step.span*.70)):1;
 const a=TAXUE_ANCHORS[i],b=TAXUE_ANCHORS[j];
 const anchor={x:mix(a.x,b.x,v),y:mix(a.y,b.y,v),r:mix(a.r,b.r,v)};
 const x=150,y=397,w=390,h=390,cx=x+anchor.x*w,cy=y+anchor.y*h;
 const lx=925,ly=570,lr=162,z=Math.min(3,lr/(anchor.r*w)*1.03);
 const uid=`taxue-focus-${beat.id}`,label=v<.25?a.label:b.label;
 return <Surface><Head>{beat.id==='pearl-intro'?'她叫踏雪。新场景里，也要留下熟悉的特征':'换一个世界，仍然认得出踏雪'}</Head>
 <defs><clipPath id={uid}><circle cx={lx} cy={ly} r={lr}/></clipPath><radialGradient id={`${uid}-floor`}><stop stopColor={C.cyan} stopOpacity=".14"/><stop offset="1" stopColor={C.cyan} stopOpacity="0"/></radialGradient></defs>
 <ellipse cx={344} cy={783} rx={226} ry={31} fill={`url(#${uid}-floor)`}/>
 <Pic file={canonical} x={x} y={y} w={w} h={h}/>
 <circle cx={cx} cy={cy} r={anchor.r*w} stroke={C.gold} strokeWidth={2.3} fill="none"/>

 <path d={`M${cx+anchor.r*w} ${cy}C${cx+anchor.r*w+65} ${cy} 678 ${ly-28} ${lx-lr-6} ${ly}`} fill="none" stroke={C.gold} strokeOpacity={.35} strokeWidth={1.8}/>
 <g clipPath={`url(#${uid})`}><rect x={lx-lr} y={ly-lr} width={lr*2} height={lr*2} fill="#07111a"/><g transform={`translate(${lx-cx*z} ${ly-cy*z}) scale(${z})`}><Pic file={canonical} x={x} y={y} w={w} h={h}/></g></g>
 <circle cx={lx} cy={ly} r={lr+1} stroke={C.gold} strokeOpacity={.58} strokeWidth={1.8} fill="none"/>
 <T x={lx} y={777} size={31} color={C.gold} anchor="middle">{label}</T>
 <Footer>场景可以改变，面纹、棕眼和白爪仍然属于同一个她</Footer></Surface>;
}

function Intro(props:Props){
 const {frame,beat}=props,{p}=timing(props);
 const methods=beat.clips.find(c=>/生成对抗|生成式对抗|GAN|两条路/.test(c.text));
 const start=methods?.from??beat.duration*.70,q=smooth((frame-start)/32);
 const progress=clamp((frame-start)/Math.max(1,beat.duration-start-35));
 const ganWord=methods?.text.indexOf('扩散')??-1;
 const split=methods?methods.from+(methods.to-methods.from)*(ganWord>0?ganWord/methods.text.length:.5):start+120;
 const ganp=clamp((frame-start)/Math.max(1,split-start));
 const diffp=clamp((frame-split)/Math.max(1,(methods?.to??beat.duration)-split));
 return <><div style={{position:'absolute',inset:0,clipPath:`inset(0 0 ${q*100}% 0)`}}><Identity {...props}/></div>
 <div style={{position:'absolute',inset:0,clipPath:`inset(${(1-q)*100}% 0 0 0)`}}><Surface>
 <Head>两条路线，把随机输入组织成有结构的结果</Head>
 <Field kind="gan" p={ganp} x={376} y={552} scale={64}/>
 <Field kind="ddpm" p={diffp} x={898} y={552} scale={64}/>
 <T x={376} y={732} size={36} anchor="middle" color={C.gold}>GAN · 从反馈中学习</T>
 <T x={898} y={732} size={36} anchor="middle" color={C.cyan}>Diffusion · 逐步修正</T>
 <T x={376} y={789} size={26} anchor="middle">同一输入，参数更新改变输出</T>
 <T x={898} y={789} size={26} anchor="middle">同一批噪声，结构逐步出现</T>
 <Footer>二维实验的保存轨迹 · 青色：目标分布 · 金色：模型输出</Footer>
 </Surface></div></>;
}

function GoalScene(props:Props){
 const {p,clip,clipp}=timing(props),reveal=smooth(clamp(p*1.6)),glow=.18+.08*Math.sin(props.frame/100);
 const uid='taxue-goal-reveal',scan=672+475*reveal;
 return <Surface><Head>从辨认图片，到创造新的场景</Head>
 <defs><clipPath id={uid}><rect x={672} y={426} width={475*reveal} height={290}/></clipPath><radialGradient id="goal-ground"><stop stopColor={C.cyan} stopOpacity=".16"/><stop offset="1" stopColor={C.cyan} stopOpacity="0"/></radialGradient></defs>
 <ellipse cx={673} cy={751} rx={485} ry={42} fill="url(#goal-ground)"/>
 <PhotoPlane file={canonical} x={161} y={421} w={286} h={286} angle={-4+4*smooth(p)} scale={1+.025*smooth(p)}/>
 <T x={302} y={785} size={29} anchor="middle" color={C.cyan}>保留她的外观</T>
 <path d="M475 565C531 565 569 565 636 565" stroke={C.gold} strokeOpacity={.38} strokeWidth={2} fill="none"/>
 {Array.from({length:30},(_,i)=>{const u=(i+.5)/30,x=485+138*u,y=565+Math.sin(i*8.71)*mix(61,9,reveal),r=2+1.5*(.5+.5*Math.sin(i*2.2+props.frame/50));return <circle key={i} cx={x} cy={y} r={r} fill={i%2?C.gold:C.cyan} opacity={.25+.45*reveal}/>})}
 <g clipPath={`url(#${uid})`}><foreignObject x={672} y={426} width={475} height={290}><div style={{width:475,height:290,overflow:'hidden',maskImage:'linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent),linear-gradient(180deg,transparent,#000 4%,#000 96%,transparent)',maskComposite:'intersect'}}><Img src={staticFile('character/v15/gallery.png')} style={{width:475,height:290,objectFit:'cover',transform:'scale(1.55) translateX(-137px)'}}/></div></foreignObject></g>
 <path d={`M${scan} 426V716`} stroke={C.gold} strokeWidth={2} strokeOpacity={.45*Math.sin(Math.PI*reveal)}/>
 <T x={910} y={785} size={29} anchor="middle" color={C.gold}>改变场景与动作</T>
 <T x={677} y={403} size={24} color={C.muted}>图像结构 + 身份条件</T>
 <Footer>先学会生成合理结构，再让新的画面保留踏雪的辨识特征</Footer></Surface>;
}

function Overview(props:Props){
 const {p,clip,clipp}=timing(props),experiment=props.beat.id==='experiments';
 const target=clip?.text.includes('踏雪')||clip?.text.includes('角色')?2:clip?.text.includes('数字')||clip?.text.includes('笔画')?1:0;
 const to=target===0?0:target===1?smooth(clipp):1+smooth(clipp);
 const xs=[296,680,1043],f=clamp(p*1.1);
 return <Surface><Head>{experiment?'从生成点，到生成笔画，再控制一个具体对象':'生成合理的结构，再给它明确的创作条件'}</Head>
 <g transform={`translate(${xs[0]} 553) scale(${1+.05*Math.exp(-to*to)}) translate(${-xs[0]} -553)`}><Field kind="gan" p={f} x={xs[0]} y={553} scale={48} n={210}/></g>
 <g transform={`translate(${xs[1]} 553) scale(${1+.07*Math.exp(-((to-1)**2))}) translate(${-xs[1]} -553)`}><Images files={ddpm} p={f} x={518} y={466} w={324} h={162}/></g>
 <Pic file={canonical} x={909} y={415} w={270} h={270}/>
 <path d="M434 562C463 562 473 553 492 553M859 553C876 553 878 549 893 549" stroke={C.gold} strokeOpacity={.4} strokeWidth={2} fill="none"/>
 <T x={xs[0]} y={738} size={29} anchor="middle" color={C.gold}>一片分布</T><T x={xs[1]} y={738} size={29} anchor="middle" color={C.cyan}>像素的结构</T><T x={xs[2]} y={738} size={29} anchor="middle">指定的主角</T>
 <path d="M158 789H1150" fill="none" stroke={C.muted} strokeOpacity={.15}/><path d={`M158 789H${158+992*f}`} fill="none" stroke={C.gold} strokeOpacity={.6} strokeWidth={2}/><circle cx={158+992*f} cy={789} r={6} fill={C.gold}/>
 <Footer>二维分布与数字来自本章实验 · 踏雪用于参考条件创作</Footer></Surface>;
}

function FeatureStack(props:Props){
 const {p,stage,phase}=timing(props),progress=clamp((stage+phase)/2.5)*4;
 const names=['d1','d2','mid','up','out'],xs=[153,362,577,790,1002],ys=[441,502,553,502,441],sizes=[145,115,102,145,145];
 const centers=xs.map((x,i)=>[x+sizes[i]/2,ys[i]+sizes[i]/2]);
 return <Surface><defs><radialGradient id="unet-local-shade"><stop stopColor="#02070c" stopOpacity=".75"/><stop offset="1" stopColor="#02070c" stopOpacity="0"/></radialGradient></defs><ellipse cx={920} cy={590} rx={290} ry={220} fill="url(#unet-local-shade)"/><Head>缩小空间看整体，再把较早的细节接回来</Head>
 <Sweep points={[[227,429],[227,391],[862,391],[862,482]]} p={clamp((progress-1)/2.3)} color={C.cyan}/>
 <T x={546} y={382} size={23} anchor="middle" color={C.cyan}>同尺度特征 · 跳跃连接</T>
 {names.map((name,i)=>{const f=featureData.find(r=>r.name===name)!,s=sizes[i],active=Math.exp(-(((progress-i)/.68)**2));return <g key={name}>
 {f.maps.slice(0,3).reverse().map((m,j)=><g key={m.channel} transform={`translate(${j*9} ${-j*9})`} opacity={.34+j*.22}><Pic file={m.file} x={xs[i]} y={ys[i]} w={s} h={s}/></g>)}
 <rect x={xs[i]-4} y={ys[i]-4} width={s+8} height={s+8} fill="none" stroke={C.gold} strokeWidth={1.5+active} strokeOpacity={.18+.75*active}/>
 <T x={xs[i]+s/2} y={731} size={25} anchor="middle">{f.shape.slice(2).join(' × ')}</T>
 <T x={xs[i]+s/2} y={779} size={25} anchor="middle" color={C.gold}>{['局部细节','缩小空间','整合结构','接回细节','噪声预测'][i]}</T>
 {i<4&&<Sweep points={[[xs[i]+s+24,ys[i]+s/2],[xs[i+1]-13,ys[i+1]+sizes[i+1]/2]]} p={clamp(progress-i)} color={C.gold}/>}</g>})}
 <Footer>同一输入的真实特征通道 · 各通道独立归一化显示</Footer></Surface>;
}
function TrainingPair(props:Props){
 const {p}=timing(props),q=clamp(p*1.15),t=Math.round(200*(1-q));
 return <Surface><Head>一边造题学参数，一边用学会的参数生成</Head>
 <T x={145} y={431} size={34} color={C.gold}>训练</T><T x={145} y={660} size={34} color={C.cyan}>生成</T>
 <Images files={['150-noisy.png','75-noisy.png','20-noisy.png'].map(f=>'experiments/prediction/'+f)} p={p} x={307} y={400} w={175} h={174}/>
 <Curves values={digits.ddpm.map(x=>x.noise_mse)} x={636} y={415} w={460} h={140} p={p} color={C.gold}/>
 <T x={398} y={598} size={25} anchor="middle">数字原图 + 已知噪声</T><T x={861} y={598} size={25} anchor="middle">比较答案，更新参数</T>
 <Images files={ddpm} p={q} x={311} y={650} w={450} h={112.5}/>
 <Field kind="ddpm" p={q} x={988} y={696} scale={27} n={120}/>
 <T x={525} y={797} size={25} anchor="middle" color={C.cyan}>新随机起点 → 连续调用网络 · t = {t}</T>
 <Footer>真实数字输入、训练曲线与采样序列 · 训练更新参数，生成调用参数</Footer></Surface>;
}
function LatentSpace(props:Props){
 const {p}=timing(props),u=smooth(p),size=mix(215,92,smooth((p-.12)/.45));
 return <Surface><Head>先压缩，再在更小的表示里逐步生成</Head>
 <PhotoPlane file={canonical} x={168} y={431} w={212} h={250} angle={mix(-6,0,p)}/>
 <g transform={`translate(647 548) rotate(${mix(-8,0,p)})`}>
 {[2,1,0].map(i=><g key={i} transform={`translate(${i*14} ${-i*14})`}><rect x={-size/2} y={-size/2} width={size} height={size} fill="#0d2530" stroke={C.cyan} strokeOpacity={.4}/>{Array.from({length:144},(_,j)=>{const xx=j%12,yy=Math.floor(j/12),v=.3+.55*(.5+.5*Math.sin(j*7.12+u*2.1));return <rect key={j} x={-size/2+xx*size/12} y={-size/2+yy*size/12} width={size/12-.6} height={size/12-.6} fill={i===0?C.gold:C.cyan} opacity={v}/>})}</g>)}
 </g><PhotoPlane file={canonical} x={940} y={431} w={200} h={250} angle={mix(6,0,p)} scale={.96+.04*p}/>
 <Sweep points={[[407,553],[506,553]]} p={u} color={C.cyan}/><Sweep points={[[780,553],[927,553]]} p={u} color={C.gold}/>
 <T x={275} y={738} anchor="middle" size={29}>像素图像</T><T x={647} y={738} anchor="middle" size={29} color={C.gold}>较小的潜表示</T><T x={1045} y={738} anchor="middle" size={29}>解码回图像</T>
 <T x={647} y={790} anchor="middle" size={25}>压缩 → 逐步去噪 → 解码</T><Footer>潜空间结构示意 · 网格表示压缩信息，不等同于原始像素</Footer></Surface>;
}
function ContextScene(props:Props){
 const {p,clip,clipp}=timing(props),editing=props.beat.id==='editing',next=props.beat.id==='next',a=smooth(p);
 const x=150,y=419,w=287;
 return <Surface><Head>{next?'一句话，怎样把同一个主角带进另一个世界？':editing?'参考图保留主角，文字改变场景':'把外观与要求，一起交给模型'}</Head>
 <Pic file={canonical} x={x} y={y} w={w} h={w}/>
 <T x={x+w/2} y={765} size={28} anchor="middle">同一份外观参考</T>
 <path d="M457 556C499 556 490 542 538 542" fill="none" stroke={C.gold} strokeOpacity={.4} strokeWidth={2}/>
 <T x={565} y={421} size={32} color={C.gold}>踏雪，坐在柔和的光里</T>
 <foreignObject x={557} y={447} width={603} height={308}><div style={{width:'100%',height:'100%',overflow:'hidden',maskImage:'linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent),linear-gradient(180deg,transparent,#000 8%,#000 92%,transparent)',maskComposite:'intersect'}}><Img src={staticFile('character/v15/gallery.png')} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'70% center',transform:`scale(${1.45+.025*a}) translateX(-160px)`}}/></div></foreignObject>
 <T x={861} y={795} size={27} anchor="middle" color={C.gold}>光线和空间改变，辨识特征继续保留</T>
 <Footer>踏雪 · 本次参考图生成素材；外观与场景分别作为创作条件</Footer></Surface>;
}

function VideoStudy(props:Props){
 if(actionStudy.ready)return <ContinuousVideoStudy {...props}/>;
 const {frame,beat}=props,{p}=timing(props);
 // Each narrated action uses the corresponding approved source motion, never a held last frame.
 const cuts=[0,142,338,517,652,757,beat.duration];
 const files=['look-back.mp4','tongue.mp4','look-back.mp4','stand-to-sit.mp4','stand-to-sit.mp4','tongue.mp4'];
 const sizes=[300,300,300,360,360,300],starts=[0,0,86,0,135,30];
 let part=0;while(part<5&&frame>=cuts[part+1])part++;
 const local=frame-cuts[part],span=cuts[part+1]-cuts[part];
 const sf=starts[part]+sourceFrame(local,span,Math.min(sizes[part]-starts[part],span+80),24);
 const close=part===1?smooth(local/40):part===5?1-smooth(local/90):0,z=.57+.16*close,tx=1539-85*close,ty=575-155*close;
 const video=(i:number,at:number)=> <FrameVideoV15 src={`character/v15/${files[i]}`} frame={at} style={{position:'absolute',width:1920*z,height:1080*z,objectFit:'cover',left:322-tx*z,top:186-ty*z}}/>;
 const cut=smooth(local/24),previous=Math.max(0,part-1),prevAt=starts[previous]+Math.min(sizes[previous]-starts[previous]-1,cuts[previous+1]-cuts[previous]+70);
 return <><Surface><Head>同一个身体，跨过每一个相邻时刻</Head>
 <T x={842} y={454} size={29} color={C.gold}>面纹与棕眼</T><T x={842} y={500} size={25}>跟随头部一起转动</T>
 <T x={842} y={588} size={29} color={C.cyan}>脚爪与身体</T><T x={842} y={634} size={25}>落地、弯曲、自然承重</T>
 <T x={842} y={719} size={29}>舌头与耳朵</T><T x={842} y={765} size={25}>小动作仍要保持结构</T>
 <path d="M156 806H778" fill="none" stroke={C.gold} strokeOpacity={.25}/><circle cx={156+622*p} cy={806} r={6} fill={C.gold}/>
 <Footer>面纹随头部移动，脚爪持续接地，耳朵和舌头都有自然的动作范围</Footer></Surface>
 <div style={{position:'absolute',left:146,top:402,width:645,height:372,overflow:'hidden',maskImage:'linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent),linear-gradient(180deg,transparent,#000 7%,#000 94%,transparent)',maskComposite:'intersect'}}>
 {part>0&&local<24&&<div style={{position:'absolute',inset:0,clipPath:`inset(0 ${cut*100}% 0 0)`}}>{video(previous,prevAt)}</div>}
 <div style={{position:'absolute',inset:0,clipPath:part>0?`inset(0 0 0 ${(1-cut)*100}%)`:'none'}}>{video(part,sf)}</div>
 </div></>;
}

function ContinuousVideoStudy(props:Props){
 const {frame}=props,pauseAt=actionStudy.pauseAt,inspect=smooth((frame-pauseAt)/45);
 const source=Math.min(frame,pauseAt,actionStudy.sourceFrames-1);
 const zoom=1+.08*smooth((frame-142)/40)*(1-smooth((frame-265)/40));
 const z=.50*zoom,tx=1539,ty=575-110*(zoom-1);
 const status=frame<142?0:frame<235?1:frame<338?2:frame<517?3:frame<757?4:5;
 return <><Surface><Head>{status<5?'同一个身体，连续完成一个动作':'停在这段视频的关键时刻，逐帧比较'}</Head>
 {['面纹与棕眼','脚爪与身体','舌头与耳朵'].map((s,i)=><g key={s} opacity={.45+.55*(status===1&&i===2||status===2&&i===1||status===3&&i===2||status===0&&i===0||status>=4?1:0)}><T x={842} y={454+i*133} size={29} color={i===1?C.cyan:C.gold}>{s}</T><T x={842} y={500+i*133} size={25}>{['随头部一起移动','弯曲、落地、自然承重','小动作也保留原有结构'][i]}</T></g>)}
 <Footer>{status<5?'一条原速连续镜头 · 面纹、舌头、耳位与脚爪随动作变化':'下方三帧截取自当前视频 · 比较动作前后，保留同一只踏雪'}</Footer></Surface>
 <div style={{position:'absolute',left:146,top:402,width:645,height:372,overflow:'hidden',maskImage:'linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent),linear-gradient(180deg,transparent,#000 7%,#000 94%,transparent)',maskComposite:'intersect',transform:`translateY(${-50*inspect}px) scale(${1-.13*inspect})`,transformOrigin:'center'}}>
 <FrameVideoV15 src={actionStudy.video} frame={source} style={{position:'absolute',width:1920*z,height:1080*z,objectFit:'cover',left:322-tx*z,top:186-ty*z}}/>
 </div>
 <div style={{position:'absolute',left:162,top:710,display:'flex',gap:17,opacity:inspect,transform:`translateY(${20*(1-inspect)}px)`}}>
 {actionStudy.inspectFrames.map((f,i)=><div key={f} style={{width:183,height:95,overflow:'hidden',position:'relative',borderBottom:`1px solid ${C.gold}55`,boxShadow:'0 12px 25px #0004'}}><FrameVideoV15 src={actionStudy.video} frame={f} style={{position:'absolute',width:280,height:157.5,left:-104,top:-32,objectFit:'cover'}}/><div style={{position:'absolute',top:2,left:8,fontSize:16,color:C.white,textShadow:'0 1px 5px #000'}}>{['收舌','重心下降','安稳坐下'][i]}</div></div>)}
 </div></>;
}

function DistributionStory(props:Props){
 const {frame,beat}=props,{p}=timing(props),switchAt=beat.clips.find(c=>/八组/.test(c.text))?.from??771,q=smooth((frame-switchAt)/64);
 const files=['ref-front-three-quarter.png','ref-sitting.png','ref-relaxed-ears.png'],labels=['站立 · 四肢承重','坐下 · 身体弯曲','耳位 · 自然放松'];
 const photoProgress=clamp(frame/Math.max(1,switchAt));
 return <Surface><Head>{q<.5?'从一张张合理的画面，找到共同的规律':'把复杂画面缩成点，观察分布的形状'}</Head>
 <g opacity={1-q} transform={`translate(0 ${-12*q})`}>
 {files.map((file,i)=>{const reveal=smooth((frame-18-i*44)/80),x=158+i*335,focus=.5+.5*Math.cos((photoProgress*2-i)*Math.PI);return <g key={file} transform={`translate(${x+139} 568) scale(${.965+.045*focus}) translate(${-x-139} -568)`} opacity={reveal}>
 <PhotoPlane file={'character/v15/'+file} x={x} y={415} w={278} h={315} angle={mix(i===0?-4:i===2?4:0,0,photoProgress)}/>
 <T x={x+139} y={785} size={26} anchor="middle" color={i===Math.min(2,Math.floor(photoProgress*3))?C.gold:C.cyan}>{labels[i]}</T>
 </g>})}</g>
 <g opacity={q} transform={`translate(0 ${18*(1-q)})`}>
 <Field kind="target" p={p} x={414} y={561} scale={73} n={Math.floor(100+150*q)}/>
 {exp.centers.map((c,i)=><g key={i}><circle cx={414+c[0]*73} cy={561-c[1]*73} r={26+3*Math.sin(frame/70+i)} stroke={C.cyan} strokeOpacity={.3} fill="none"/></g>)}
 <T x={777} y={452} size={32} color={C.gold}>落得准</T><T x={777} y={505} size={27}>符合有效区域里的结构</T>
 <T x={777} y={615} size={32} color={C.cyan}>种类全</T><T x={777} y={668} size={27}>覆盖多种合理的可能性</T>
 <T x={151} y={794} size={28}>青色点：我们希望模型学会的目标分布</T>
 </g><Footer>{q<.5?'耳朵、四肢与比例共同约束姿态，许多合理结果组成数据分布':'生成既要符合结构，也要覆盖多样性；后面的实验用这两点来比较'}</Footer></Surface>;
}

function DatasetScene(props:Props){
 const {p}=timing(props),isData=props.beat.id==='data',q=clamp(p*1.1);
 return <Surface><Head>{isData?'看过的例子，决定模型学得到哪些结构':'先跑小实验，再把每次改变留下来'}</Head>
 <Field kind="gan" p={q} x={305} y={548} scale={52}/><Images files={gan} p={q} x={581} y={441} w={540} h={270}/>
 <T x={304} y={766} size={29} anchor="middle" color={C.gold}>二维分布 · 保存每次模型</T><T x={850} y={766} size={29} anchor="middle" color={C.cyan}>数字笔画 · 检查整批结果</T>
 <Footer>{isData?'数字实验练习笔画，角色模型需要图像经验':'代码、种子、模型参数与保存轨迹，共同组成复现记录'}</Footer></Surface>;
}
function Guidance(props:Props){
 const {p}=timing(props),w=mix(.5,3,smooth(p)),origin=[279,683],u=[508,620],c=[548,537],e=[u[0]+w*(c[0]-u[0]),u[1]+w*(c[1]-u[1])];
 return <Surface><Head>把条件带来的差别，加到更新方向里</Head>
 <path d="M164 711H755M224 393V734" stroke={C.muted} strokeOpacity={.18}/>
 <Sweep points={[origin,u]} p={1} color={C.muted}/><Sweep points={[origin,c]} p={1} color={C.cyan}/><Sweep points={[origin,e]} p={1} color={C.gold}/>
 <path d={`M${u}L${c}`} stroke={C.cyan} strokeDasharray="5 8" strokeOpacity={.5}/>
 <T x={514} y={657} size={25}>无条件</T><T x={591} y={553} size={25} color={C.cyan}>有条件</T>
 <T x={825} y={455} size={32} color={C.gold}>w = {w.toFixed(2)}</T><Bar x={825} y={529} w={252} value={(w-.5)/2.5} label="引导强度"/>
 <T x={825} y={633} size={28}>要求更突出</T><T x={825} y={687} size={28}>也要留住自然感</T>
 <T x={163} y={793} size={31}>ε̂ = εᵤ + w · (ε𝚌 − εᵤ)</T><Footer>条件引导的向量合成示意 · 端点随同一个 w 连续移动</Footer></Surface>;
}
export function NewScene(props:Props):React.ReactNode|null{
 const id=props.beat.id;
 if(id==='pearl-intro')return <Intro {...props}/>;
 if(['gan-pearl','pearl-identity','evaluation','return-pearl'].includes(id))return <Identity {...props}/>;
 if(id==='goal')return <GoalScene {...props}/>;
 if(id==='experiments')return <Overview {...props}/>;
 if(id==='distribution')return <DistributionStory {...props}/>;
 if(id==='unet')return <FeatureStack {...props}/>;
 if(id==='training-sampling')return <TrainingPair {...props}/>;
 if(id==='latent-diffusion')return <OpusMotionV15 kind="latent-space" frame={props.frame} duration={props.beat.duration} clips={props.beat.clips} idPrefix="latent-v15"/>;
 if(id==='forward-equation')return <OpusMotionV15 kind="diffusion-field" frame={props.frame} duration={props.beat.duration} clips={props.beat.clips} idPrefix="forward-v15"/>;
 if(['conditioning','editing','next'].includes(id))return <ContextScene {...props}/>;
 if(id==='video'){
 const c=props.beat.clips.find(c=>c.text.includes('跨时间'))!,f=props.frame,enter=smooth((f-c.from)/22),leave=smooth((f-c.to+22)/22),amount=enter*(1-leave);
 return <><div style={{position:'absolute',inset:0,clipPath:`inset(0 0 ${amount*100}% 0)`}}><VideoStudy {...props}/></div>{f>=c.from&&f<c.to&&<div style={{position:'absolute',inset:0,clipPath:`inset(${(1-amount)*100}% 0 0 0)`}}><OpusMotionV15 kind="temporal" frame={f-c.from} duration={c.to-c.from} idPrefix="temporal-v15"/></div>}</>;
 }
 if(['data','reproduce'].includes(id))return <DatasetScene {...props}/>;
 if(id==='guidance')return <OpusMotionV15 kind="condition-guidance" frame={props.frame} duration={props.beat.duration} clips={props.beat.clips} stage={timing(props).stage} idPrefix="guidance-v15"/>;
 return null;
}
