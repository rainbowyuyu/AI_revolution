import React from 'react';
import {SafeImage} from './SvgImageV11';
import {NewScene} from './ScenesV15';
import {OpusMotionV15} from './OpusMotionV15';
import {FrameVideoV15,sourceFrame} from './FrameVideoV15';
import {Img,staticFile,OffthreadVideo,Sequence} from 'remotion';
import {C,clamp,ease,mix,timing,T,Surface,Line,Head,Footer,Bar,Signal,Thumb,PairImage,Scatter,Curves,sample,OriginalTeachingV6,Props} from './TeachingV15';
import exp from '../results/distributions-v5.json';
import digitMetrics from '../results/digits.json';
import features from './features-v2.json';

import noise from './noise-v15.json';
import prediction from './prediction.json';
import stepData from './step-v15.json';
// Motion is deterministic. These diagrams illustrate the operation; measured values
// are read from saved experiment files and never invented to make curves attractive.
const ganFiles=[0,100,300,600,1000,1500,2000,3000].map(s=>`experiments/digits/gan-${String(s).padStart(4,'0')}.png`);
const phase=(frame:number,period=180,offset=0)=>((frame+offset)%period)/period;
function Packet({path,p,color=C.gold}:{path:number[][];p:number;color?:string}){
 const lengths=path.slice(1).map((point,i)=>Math.hypot(point[0]-path[i][0],point[1]-path[i][1]));
 let distance=clamp(p)*lengths.reduce((a,b)=>a+b,0),i=0;
 while(i<lengths.length-1&&distance>lengths[i]){distance-=lengths[i];i++;}
 const t=clamp(distance/Math.max(1e-6,lengths[i]));
 return <g opacity={ease(p/.04)*ease((1-p)/.04)}><circle cx={mix(path[i][0],path[i+1][0],t)} cy={mix(path[i][1],path[i+1][1],t)} r={10} fill={color} opacity={.12}/><circle cx={mix(path[i][0],path[i+1][0],t)} cy={mix(path[i][1],path[i+1][1],t)} r={4.5} fill={color}/></g>;
}
type XY=[number,number];
type Cubic=[XY,XY,XY,XY];
export function cubicPoint(points:Cubic,t:number):XY{const u=1-clamp(t),v=1-u;return [u*u*u*points[0][0]+3*u*u*v*points[1][0]+3*u*v*v*points[2][0]+v*v*v*points[3][0],u*u*u*points[0][1]+3*u*u*v*points[1][1]+3*u*v*v*points[2][1]+v*v*v*points[3][1]];}
export const cubicD=(points:Cubic)=>`M${points[0].join(' ')}C${points.slice(1).map(p=>p.join(' ')).join(' ')}`;
// A curve and its travelling point share the same geometry. Arc-length lookup
// changes only the speed along that curve; it never interpolates a different line.
export function cubicAtDistance(points:Cubic,p:number):XY{const steps=80,rows=[0];let previous=points[0];for(let i=1;i<=steps;i++){const next=cubicPoint(points,i/steps);rows.push(rows[i-1]+Math.hypot(next[0]-previous[0],next[1]-previous[1]));previous=next;}const distance=clamp(p)*rows[steps];let i=1;while(i<steps&&rows[i]<distance)i++;const t=((i-1)+(distance-rows[i-1])/Math.max(1e-9,rows[i]-rows[i-1]))/steps;return cubicPoint(points,t);}
function Stream({points,p,color=C.gold,reveal=1,width=2}:{points:Cubic;p:number;color?:string;reveal?:number;width?:number}){const at=cubicAtDistance(points,p*clamp(reveal));return <g><Line d={cubicD(points)} color={color} p={reveal} width={width}/><g opacity={ease(p/.035)*ease((1-p)/.035)*ease(reveal*8)}><circle cx={at[0]} cy={at[1]} r={11} fill={color} opacity={.1}/><circle cx={at[0]} cy={at[1]} r={4.5} fill={color}/></g></g>;}
function Camera({children,p,focus=[630,560],zoom=1.045}:{children:React.ReactNode;p:number;focus?:XY;zoom?:number}){const z=mix(1,zoom,ease(p));return <g transform={`translate(${focus[0]} ${focus[1]}) scale(${z}) translate(${-focus[0]} ${-focus[1]})`}>{children}</g>;}
function StageNote({children,color=C.gold}:{children:React.ReactNode;color?:string}){return <T x={148} y={794} size={29} color={color}>{children}</T>;}
function Node({x,y,label,sub,color=C.gold,focus=0,w=142}:{x:number;y:number;label:string;sub?:string;color?:string;focus?:number;w?:number}){return <g><rect x={x-w/2} y={y-48} width={w} height={96} rx={16} fill={C.ink} fillOpacity={.88} stroke={color} strokeOpacity={.25+.65*focus} strokeWidth={1.4+focus}/><T x={x} y={y+11} size={32} anchor="middle" color={color}>{label}</T>{sub&&<T x={x} y={y+94} size={27} anchor="middle">{sub}</T>}</g>;}
function Tile({file,x,y,w,h=w}:{file:string;x:number;y:number;w:number;h?:number}){return <foreignObject x={x} y={y} width={w} height={h}><Img src={staticFile(file)} style={{width:w,height:h,objectFit:'contain',display:'block'}}/></foreignObject>}
function TileBlend({files,p,x,y,w,h=w}:{files:string[];p:number;x:number;y:number;w:number;h?:number}){const t=clamp(p)*(files.length-1),i=Math.floor(t),j=Math.min(i+1,files.length-1);return <g><Tile file={files[i]} x={x} y={y} w={w} h={h}/>{i!==j&&<g opacity={ease(t-i)}><Tile file={files[j]} x={x} y={y} w={w} h={h}/></g>}</g>;}
function MetricLab(props:Props){const {beat,frame}=props,{p,stage}=timing(props),rows=beat.id==='ddpm-results'?exp.ddpm:exp.gan;
 const n=Math.min(2048,Math.floor(ease((frame-20)/Math.max(1,Number(beat.stages['2'])-40))*2048)),max=Math.max(...rows.flatMap(r=>r.metrics.mode_counts));
 const counts=rows.map(r=>{const c=Array(8).fill(0);for(const point of r.samples.slice(0,n)){const ds=exp.centers.map(center=>Math.hypot(point[0]-center[0],point[1]-center[1]));const near=Math.min(...ds);if(near<.36)c[ds.indexOf(near)]++;}return c;});
 const focus=clamp((p-.65)/.35)*7;
 return <Surface><Head>同一把尺子：逐个检查 2048 个生成点</Head>
 <T x={145} y={411} size={27} color={C.gold}>已检查 {n.toLocaleString()} / 2048</T>
 <defs><clipPath id="metric-scatter"><rect x={146} y={444} width={410} height={305}/></clipPath></defs>
 <g clipPath="url(#metric-scatter)">{exp.centers.map((c,i)=><circle key={i} cx={348+c[0]*62} cy={595-c[1]*62} r={.36*62} fill={C.cyan} fillOpacity={.07} stroke={C.cyan} strokeOpacity={.25}/>)}<Scatter points={rows[0].samples.slice(0,n)} cx={348} cy={595} scale={62} n={2048} color={C.gold} opacity={.45}/></g>
 {rows.map((r,j)=><T key={j} x={610+j*170} y={411} size={23} color={[C.gold,C.cyan,C.white][j]}>seed {r.seed}</T>)}
 <path d="M607 732H1130" fill="none" stroke={C.muted} strokeOpacity={.25}/>
 {counts.map((c,j)=>c.map((v,i)=>{const h=v/max*258;return <g key={`${i}-${j}`}><rect x={616+i*64+j*15} y={732-h} width={11} height={h} rx={2} fill={[C.gold,C.cyan,C.white][j]} opacity={1-.35*ease((p-.65)/.12)*(1-Math.exp(-Math.pow(focus-i,2)/.65))}/>{j===0&&<T x={637+i*64} y={775} size={23} anchor="middle">{i+1}</T>}</g>}))}
 <T x={145} y={787} size={28} color={C.gold}>{stage>=2?`平均近邻 ${(rows.reduce((s,r)=>s+r.metrics.near_mode_fraction,0)/3*100).toFixed(1)}% · 覆盖 8 / 8`:'左：seed 12 的 2048 个样本'}</T>
 <Footer>右侧为三个种子的区域计数 · 原始点全部保留，越界点只裁显示范围</Footer></Surface>;
}
function FeatureLab(props:Props){const {frame}=props,{p}=timing(props);const names=['d1','d2','mid','up','out'];const xs=[152,367,582,797,1012],ys=[417,465,517,465,417];const step=Math.min(4,Math.floor(p*5)),scan=phase(frame,210);
 return <><Surface><Head>细节先压缩，再和较早的特征重新汇合</Head>
 <Line d="M217 482L432 530L647 582L862 530L1077 482" color={C.muted}/>
 <Line d="M218 415V384H864V465" color={C.cyan}/>
 <T x={566} y={375} size={24} anchor="middle" color={C.cyan}>跳跃连接</T>
 {names.map((name,i)=>{const f=features.find(r=>r.name===name)!;return <g key={name}>
 <g transform={`translate(${xs[i]+65} ${ys[i]+65}) scale(${1+.16*Math.exp(-Math.pow(p*4-i,2)/.25)}) translate(${-xs[i]-65} ${-ys[i]-65})`}><Tile file={f.maps[0].file} x={xs[i]} y={ys[i]} w={130}/><rect x={xs[i]} y={ys[i]} width={130} height={130} fill="none" stroke={C.gold} strokeOpacity={.2+.65*Math.exp(-Math.pow(p*4-i,2)/.25)}/></g>
 <T x={xs[i]+65} y={ys[i]+165} size={23} anchor="middle">{f.shape.slice(1).join(' × ')}</T>
 <T x={xs[i]+65} y={ys[i]+200} size={25} anchor="middle" color={C.gold}>{['编码细节','缩小空间','整合信息','融合细节','预测噪声'][i]}</T></g>})}
 <Packet path={[[217,482],[432,530],[647,582],[862,530],[1077,482]]} p={p}/>
 <Footer>同一输入的真实响应 · 第 0 通道 · 独立归一化；焦点沿编码与解码移动</Footer></Surface></>;
}
function GoalLab(props:Props){const {frame}=props,{stage,p,phase:local}=timing(props);
 const identity=ease((stage+local-1)*2),learn=ease((stage+local-.35)*2);
 return <Surface><Head>给踏雪创造新场景，保留这位熟悉的主角</Head>
 <defs><clipPath id="goal-photo"><rect x={907} y={432} width={220} height={268} rx={10}/></clipPath></defs>
 {Array.from({length:64},(_,i)=>{const a=Math.sin(i*19.13)*.5+.5,b=Math.sin(i*7.17)*.5+.5;const v=mix(a,b,.5-.5*Math.cos(frame/420*Math.PI*2));return <rect key={i} x={156+i%8*22} y={455+Math.floor(i/8)*22} width={19} height={19} rx={2} fill={C.cyan} opacity={.13+v*.65}/>})}
 <T x={245} y={716} size={28} anchor="middle">随机数</T>
 <Line d="M354 545H470M721 545H887" color={C.muted}/>
 <rect x={485} y={463} width={222} height={160} rx={17} fill={C.ink} stroke={C.gold} strokeOpacity={.3+.7*learn}/>
 {[0,1,2].map(i=><g key={i}>{[0,1,2].map(j=><circle key={j} cx={526+i*68} cy={496+j*43} r={8} fill={C.gold} opacity={.25+.7*learn}/>)}</g>)}
 {[0,1].flatMap(i=>[0,1,2].flatMap(j=>[0,1,2].map(k=><Line key={`${i}-${j}-${k}`} d={`M${534+i*68} ${496+j*43}L${586+i*68} ${496+k*43}`} color={C.gold} width={.8}/>)))}
 <T x={596} y={716} size={28} anchor="middle" color={C.gold}>从数据里学规律</T>
 <g clipPath="url(#goal-photo)"><Tile file="character/v15/canonical.png" x={901} y={423} w={232} h={286}/></g>
 <T x={1017} y={745} size={27} anchor="middle">指定主角：踏雪</T>
 <Stream points={[[354,545],[398,545],[425,545],[470,545]]} p={phase(frame,270)}/><Stream points={[[721,545],[777,545],[824,545],[887,545]]} p={phase(frame,270,105)}/>
 <g opacity={identity}><ellipse cx={1014} cy={487} rx={71} ry={54} fill="none" stroke={C.cyan} strokeWidth={2}/><path d="M966 550Q1017 576 1066 550" fill="none" stroke={C.gold} strokeWidth={3}/><T x={146} y={783} size={29} color={C.gold}>看起来合理</T><T x={522} y={783} size={29} color={C.cyan}>还要保留体型轮廓、面纹与白爪</T></g>
 <Footer>目标角色：小狗踏雪 · 生成与身份，两项要求</Footer>
 </Surface>;
}
function MissionLab(props:Props){const {beat,frame}=props,{p,stage}=timing(props);const n=Math.floor(64+320*p),expMode=beat.id==='experiments';return <Surface><Head>{expMode?'先在小实验里看懂，再回到踏雪的照片':'合理的图像 → 指定的对象 → 可以检查的结果'}</Head>
 <Stream points={[[265,555],[425,418],[596,691],[718,555]]} p={phase(frame,360)} color={C.gold}/><Stream points={[[718,555],[840,419],[1000,477],[1100,555]]} p={phase(frame,360,180)} color={C.cyan}/>
 <Scatter points={exp.target} cx={280} cy={544} scale={48} n={n} color={C.cyan}/>
 <TileBlend files={Array.from({length:41},(_,i)=>`experiments/digits/ddpm-t${String(200-i*5).padStart(3,'0')}.png`)} p={p} x={550} y={481} w={320} h={160}/>
 <Tile file="character/v15/canonical.png" x={962} y={421} w={165} h={229}/>
 {['八团点：生成分布','手写数字：生成结构','踏雪：加入身份条件'].map((s,i)=><T key={s} x={[285,710,1040][i]} y={729} anchor="middle" size={25} color={stage===i?C.gold:C.muted}>{s}</T>)}
 <Footer>左：真实目标样本 · 中：真实 DDPM 反向采样 · 右：小狗踏雪 · 形象参考</Footer></Surface>;
}
function LanguageLab(props:Props){const {frame}=props,{p}=timing(props);const words=['踏雪','站在','柔和的','光里'];
 return <Surface><Head>同一只踏雪，遇见一句描述</Head>
 {words.map((word,i)=><g key={word} transform={`translate(0 ${8*(1-ease(p*5-i*.25))})`}><T x={166+i*190} y={463} size={37} color={i===0?C.gold:C.white}>{word}</T><Line d={`M${166+i*190} 490H${225+i*190}`} p={ease(p*5-i*.25)} color={C.cyan}/></g>)}
 {([[[219,517],[219,665],[541,680],[689,590]],[[401,517],[430,569],[526,595],[689,590]],[[597,517],[618,560],[650,584],[689,590]],[[778,517],[786,554],[756,574],[689,590]]] as Cubic[]).map((curve,i)=><Stream key={i} points={curve} p={phase(frame,360,i*77)} color={i?C.cyan:C.gold}/>)}<Stream points={[[689,590],[752,590],[813,590],[882,590]]} p={phase(frame,360,230)} color={C.gold}/>
 <Tile file="character/v15/canonical.png" x={905} y={514} w={207} h={238}/>
 <T x={156} y={742} size={30} color={C.gold}>词语之间的关系</T><T x={156} y={795} size={29}>怎样成为图像生成的条件？</T>
 <Footer>词语沿着关系汇入同一个画面，下一章继续把语言接进生成过程</Footer>
 </Surface>;
}
function LatentLab(props:Props){const {frame}=props,{p}=timing(props);const centers=[250,620,1010],sizes=[160,70,160];const cycle=phase(frame,270);
 return <Surface><Head>把像素压成小表示，在小空间里逐步修正</Head>
 {centers.map((x,i)=><g key={x}>{Array.from({length:144},(_,j)=>{const v=Math.abs((Math.sin(j*5.61)*497)%1),structured=.2+.65*Math.exp(-Math.pow(j%12-5.5,2)/10-Math.pow(Math.floor(j/12)-5.5,2)/19),gray=i===1?mix(.2+.65*v,structured,ease(p)):i===2?mix(.2+.65*v,structured,ease((p-.3)/.7)):.2+.65*v;return <rect key={j} x={x-sizes[i]/2+(j%12)*sizes[i]/12} y={495-sizes[i]/2+Math.floor(j/12)*sizes[i]/12} width={sizes[i]/12-.4} height={sizes[i]/12-.4} fill={i===1?C.gold:C.cyan} opacity={gray}/>})}<T x={x} y={643} anchor="middle" size={28}>{['像素空间','潜空间','解码图像'][i]}</T></g>)}
 <Stream points={[[345,495],[420,495],[500,495],[572,495]]} p={cycle} color={C.muted}/><Stream points={[[674,495],[741,495],[847,495],[913,495]]} p={phase(frame,270,140)} color={C.gold}/>
 <Stream points={[[620,542],[492,660],[740,729],[676,564]]} p={phase(frame,320)} color={C.cyan}/>
 <T x={468} y={765} size={29} color={C.gold}>压缩 → 在潜空间去噪 → 解码</T><Footer>压缩让网络在更小的表示里工作，再把结构还原到像素</Footer></Surface>;
}

const ddpmFiles=Array.from({length:41},(_,i)=>`experiments/digits/ddpm-t${String(200-i*5).padStart(3,'0')}.png`);
// Four actual fixed samples, cropped from the saved 8×4 sample grids.
function DigitStrip({kind,p,x,y,w=430}:{kind:'gan'|'ddpm';p:number;x:number;y:number;w?:number}){
 const files=kind==='gan'?ganFiles:ddpmFiles,t=clamp(p)*(files.length-1),i=Math.floor(t),j=Math.min(i+1,files.length-1);
 return <svg x={x} y={y} width={w} height={w/4} viewBox="0 0 512 128" overflow="hidden"><SafeImage href={staticFile(files[i])} width={1024} height={512}/>{i!==j&&<SafeImage href={staticFile(files[j])} width={1024} height={512} opacity={ease(t-i)}/>}</svg>;
}
function ResultField({kind,p,cx,cy,scale=56}:{kind:'gan'|'ddpm';p:number;cx:number;cy:number;scale?:number}){
 const row=sample(kind,p),before=sample(kind,Math.max(0,p-.012));
 return <g>{exp.centers.map((v,i)=><circle key={i} cx={cx+v[0]*scale} cy={cy-v[1]*scale} r={.36*scale} fill={C.cyan} fillOpacity={.035} stroke={C.cyan} strokeOpacity={.25}/>)}<Scatter points={exp.target} cx={cx} cy={cy} scale={scale} n={200} color={C.cyan} opacity={.18}/>{row.points.slice(0,42).map((v,i)=><path key={i} d={`M${cx+before.points[i][0]*scale} ${cy-before.points[i][1]*scale}L${cx+v[0]*scale} ${cy-v[1]*scale}`} stroke={C.gold} strokeOpacity={.38}/>)}<Scatter points={row.points} cx={cx} cy={cy} scale={scale} n={200} color={C.gold}/></g>;
}


function ComparisonLab(props:Props){
 const {frame,beat}=props,{stage}=timing(props);
 const {p}=timing(props);const gan=clamp(p*1.18),diff=clamp((p-.08)/.90);
 const gs=sample('gan',gan),ds=sample('ddpm',diff);
 return <Surface><Head>同一批目标点，两种学会生成的方法</Head>
 <defs><clipPath id="comparison-left"><rect x="148" y="425" width="460" height="310"/></clipPath><clipPath id="comparison-right"><rect x="698" y="425" width="460" height="310"/></clipPath></defs>
 <T x={160} y={404} size={33} color={C.gold}>GAN · 更新生成器</T><T x={710} y={404} size={33} color={C.cyan}>Diffusion · 修正样本</T>
 <g clipPath="url(#comparison-left)"><ResultField kind="gan" p={gan} cx={378} cy={582} scale={63}/></g><g clipPath="url(#comparison-right)"><ResultField kind="ddpm" p={diff} cx={928} cy={582} scale={63}/></g>
 <Line d="M646 430V739" color={C.muted} width={1}/>
 <T x={170} y={759} size={26} color={C.gold}>训练快照 · {gs.step} 次更新</T><T x={720} y={759} size={26} color={C.cyan}>一次生成 · t = {ds.step}</T>
 <T x={170} y={800} size={27}>{stage===0?'反馈改变参数，固定输入的输出跟着变':'训练结束后，一次前向得到新样本'}</T><T x={720} y={800} size={27}>固定网络，逐步调整这批噪声点</T>
 <Footer>青色：目标分布 · 金色：模型输出 · 同一二维实验，seed 12</Footer></Surface>;
}

function ConditionLab(props:Props){const {beat,frame}=props,{p,stage}=timing(props),editing=beat.id==='editing';return <Surface>
 <Head>{editing?'场景可以改变，身份要留下':'图像与文字从两条路进入同一个任务'}</Head>
 <Tile file="character/v15/canonical.png" x={149} y={414} w={196} h={230}/>
 <T x={156} y={699} size={27} color={C.cyan}>参考图片</T>
 <T x={156} y={756} size={27}>“踏雪，站在光里”</T>
 <Stream points={[[360,531],[450,531],[485,577],[570,577]]} p={phase(frame,320)} color={C.cyan}/><Stream points={[[396,745],[475,745],[473,598],[570,598]]} p={phase(frame,320,105)} color={C.cyan}/>
 <rect x={570} y={526} width={142} height={129} rx={18} fill={C.ink} stroke={C.gold}/>
 <T x={641} y={578} size={29} anchor="middle" color={C.gold}>条件</T><T x={641} y={620} size={29} anchor="middle">生成</T>
 <Stream points={[[715,589],[747,589],[780,589],[813,589]]} p={phase(frame,320,180)} color={C.gold}/>
 <defs><clipPath id="condition-output"><rect x={835} y={422} width={296} height={302} rx={8}/></clipPath></defs>
 <g clipPath="url(#condition-output)"><SafeImage href={staticFile('character/v15/gallery.png')} x={430} y={408} width={700} height={394} preserveAspectRatio="xMidYMid slice"/></g>
 <T x={967} y={768} size={27} anchor="middle" color={C.gold}>参考编辑的实际返回</T>
 <Footer>条件入口为机制示意 · 右侧是本次参考编辑的实际返回</Footer>
</Surface>}
function TimeLab(props:Props){const {beat,frame}=props,{p}=timing(props);const s={video:'character/v15/loop-studio.mp4',sourceFrames:149};
 return <><Surface><Head>连续看完动作，比只看一帧更重要</Head>
 <T x={150} y={427} size={28} color={C.gold}>本次生成视频 · 保留完整身体观察动作</T>
 {['体型轮廓和镜头，是否稳定？','白胸与面纹，有没有消失？','身体是否落地，白爪是否连续？'].map((text,i)=><g key={text} opacity={.45+.55*ease(p*3-i+.3)}><circle cx={682} cy={516+i*89} r={5} fill={i===1?C.gold:C.cyan}/><T x={705} y={525+i*89} size={26} color={i===1?C.gold:C.white}>{text}</T></g>)}
 <Line d="M160 761H1120" color={C.muted}/><circle cx={160+p*960} cy={761} r={8} fill={C.gold}/>
 {[0,1,2].map((i)=><g key={i}><circle cx={160+i*480} cy={761} r={5} fill={C.cyan}/><T x={160+i*480} y={803} size={24} anchor={i===0?'start':i===2?'end':'middle'}>{['镜头与镜头','白爪是否持续存在','外壳与接地姿态'][i]}</T></g>)}
 </Surface><Sequence from={0} durationInFrames={beat.duration} layout="none"><div style={{position:'absolute',left:153,top:448,width:450,height:292,overflow:'hidden',maskImage:'linear-gradient(90deg,transparent,#000 7%,#000 94%,transparent)'}}><FrameVideoV15 src={s.video} frame={frame%s.sourceFrames} style={{width:520,height:292.5,objectFit:'cover',position:'absolute',left:-155,top:0}} blend/></div></Sequence></>;
}
function SeedLab(props:Props){const {p,frame}=timing(props) as ReturnType<typeof timing>&{frame?:number};const clock=props.frame;
 const seed=(j:number,s:number)=>{const n=Math.sin((j+1)*s)*43758;return n-Math.floor(n)};
 const count=clamp(p*1.5)*6;
 return <Surface><Head>种子固定，抽签顺序就可以再次走一遍</Head>
 {[0,1].map(row=><g key={row}><T x={154+row*535} y={421} size={29} color={row?C.cyan:C.gold}>{row?'换一个种子':'保留同一个种子'}</T>
 {Array.from({length:6},(_,i)=>{const r=seed(i,row?19.8:12.9),h=230*r*ease(count-i);return <g key={i}><rect x={164+row*535+i*66} y={723-h} width={36} height={h} rx={3} fill={row?C.cyan:C.gold}/><T x={182+row*535+i*66} y={766} size={21} anchor="middle">{r.toFixed(2)}</T></g>})}
 <Line d={`M154 797H${154+400*clamp((p-.65)/.35)}`} color={C.gold}/>
 </g>)}<Footer>固定种子只固定随机序列，结构和质量仍由训练结果决定</Footer></Surface>;
}
function SpeedLab(props:Props){const {frame}=props,{p}=timing(props);const d=clamp(p),done=ease((frame-30)/110);return <Surface><Head>训练好的模型，生成时怎样工作</Head>
<T x={148} y={443} size={32} color={C.gold}>GAN</T><T x={148} y={491} size={27}>一次前向</T><Node x={453} y={486} label="G" focus={done} w={108}/><Stream points={[[518,486],[610,486],[682,486],[764,486]]} p={done} color={C.gold}/><g opacity={done}><DigitStrip kind="gan" p={1} x={784} y={418} w={384}/></g><T x={790} y={561} size={25} color={C.gold}>固定模型的输出样本</T>
<T x={148} y={686} size={32} color={C.cyan}>Diffusion</T><T x={148} y={734} size={27}>反复调用网络</T><Node x={453} y={701} label="εθ" focus={1} w={108}/><Stream points={[[487,644],[681,574],[707,807],[487,759]]} p={d} color={C.cyan}/><T x={590} y={712} size={27} color={C.cyan}>{Math.round(200*d)} / 200 步</T><DigitStrip kind="ddpm" p={d} x={784} y={636} w={384}/><T x={790} y={781} size={25} color={C.cyan}>同一次采样 · t = {200-Math.round(200*d)}</T><Footer>生成阶段：GAN 输出整批结果；DDPM 沿保存的轨迹逐步修正</Footer></Surface>}
function ReverseLab(props:Props){
 const {frame}=props,{p}=timing(props);const files=['canonical.png','gallery.png','noise.png'];
 return <Surface><Head>同一种身份，可以出现在不同的光线与空间里</Head>
 <Tile file="character/v15/noise-40.jpg" x={148} y={461} w={245} h={245}/>
 {files.map((file,i)=>{const yy=444+i*141;return <g key={file}>
 <Stream points={[[415,579],[600,579],[683,yy+9],[902,yy+9]]} p={phase(frame,380,i*95)} color={i===1?C.cyan:C.gold}/>
 <foreignObject x={921} y={yy-49} width={214} height={117}><div style={{width:'100%',height:'100%',overflow:'hidden',maskImage:'linear-gradient(90deg,transparent,#000 6%,#000 95%,transparent)'}}><Img src={staticFile('character/v15/'+file)} style={{width:'100%',height:'100%',objectFit:file==='canonical.png'?'contain':'cover',objectPosition:file==='canonical.png'?'50% 50%':'76% 50%',transform:`scale(${1.015+.025*Math.sin(frame/140+i)})`}}/></div></foreignObject>
 </g>})}<T x={150} y={779} size={29} color={C.gold}>随机起点相同，也不能凭空指定唯一答案</T><Footer>踏雪的场景变化示意 · 实际 DDPM 数字采样在后续实验中展开</Footer></Surface>;
}

function DistributionScene(props:Props){const {p,stage,phase:part}=timing(props);const count=Math.round(40+344*ease(p)),target=exp.target;const chosen=Math.min(7,Math.floor(clamp((stage+part)/3)*8)),center=exp.centers[chosen];
 return <Surface><Head>学到一片可能性，才有新的样本</Head><Camera p={p} focus={[500,563]} zoom={1.025}><defs><clipPath id="v4-distribution"><rect x={148} y={394} width={580} height={359}/></clipPath></defs><g clipPath="url(#v4-distribution)"><path d="M151 581H726M438 395V850" stroke={C.muted} strokeOpacity={.16}/>{exp.centers.map((c,i)=><g key={i}><circle cx={439+c[0]*70} cy={572-c[1]*70} r={26} fill={C.cyan} fillOpacity={i===chosen?.1:.035} stroke={i===chosen?C.gold:C.cyan} strokeOpacity={i===chosen?.8:.3}/></g>)}<Scatter points={target} cx={439} cy={572} scale={70} n={count} color={C.cyan}/><circle cx={439+center[0]*70} cy={572-center[1]*70} r={36} stroke={C.gold} fill="none" strokeWidth={2}/></g><Stream points={[[735,562],[766,544],[780,531],[805,513]]} p={phase(props.frame,260)} color={C.gold}/><circle cx={955} cy={524} r={87} fill={C.ink} stroke={C.gold} strokeOpacity={.3}/>{target.filter(v=>Math.hypot(v[0]-center[0],v[1]-center[1])<.36).slice(0,60).map((v,i)=><circle key={i} cx={955+(v[0]-center[0])*195} cy={524-(v[1]-center[1])*195} r={3.7} fill={C.cyan}/>)}<T x={953} y={663} anchor="middle" size={28} color={C.gold}>局部：落在有效区域</T><T x={442} y={794} anchor="middle" size={29}>整体：八个区域都要覆盖</T></Camera><Footer>真实目标样本 · 放大框与主图使用相同坐标</Footer></Surface>;
}

function GeneratorScene(props:Props){
 const {frame}=props,{p,stage}=timing(props);const row=sample('gan',p);
 const path=exp.gan[0].interpolation,k=clamp((frame-99)/132)*(path.length-1),a=Math.floor(k),b=Math.min(a+1,path.length-1),q=k-a;
 const dot=[mix(path[a][0],path[b][0],q),mix(path[a][1],path[b][1],q)];
 return <Surface><Head>同一个网络，把随机输入变成一个输出点</Head><T x={150} y={456} size={30} color={C.gold}>随机向量 z</T>
 {[0,1].map((j)=><g key={j}><Line d={`M168 ${542+j*76}H376`} color={C.muted}/><circle cx={168+208*clamp((j?(.4-.8*k/(path.length-1)):(-1.2+2.2*k/(path.length-1))) /3+.5)} cy={542+j*76} r={9} fill={C.gold}/></g>)}
 <Stream points={[[399,570],[455,570],[458,570],[516,570]]} p={phase(frame,240)}/><Node x={612} y={570} label="G(z)" sub="参数决定映射" focus={1} w={150}/>
 <Stream points={[[698,570],[740,570],[760,570],[798,570]]} p={phase(frame,240,100)} color={C.cyan}/>
 <ResultField kind="gan" p={p} cx={965} cy={564} scale={54}/>{<circle cx={965+dot[0]*54} cy={564-dot[1]*54} r={10} stroke={C.white} strokeWidth={2} fill={C.gold}/>}
 <T x={149} y={760} size={29} color={C.gold}>{stage===0?'移动输入，沿着同一映射观察输出':stage===1?'固定输入，参数更新会改变生成结果':'把输出交给判别器，才能得到改进方向'}</T>
 <Footer>金色点来自保存的 GAN 输出，移动轨迹对应训练中的参数更新</Footer></Surface>;
}


function DiscriminatorScene(props:Props){
 const {p,stage}=timing(props),rows=exp.gan[0].snapshots,k=p*(rows.length-1),a=Math.floor(k),b=Math.min(a+1,rows.length-1),q=ease(k-a);
 const grid=rows[a].discriminator.map((v,i)=>mix(v,rows[b].discriminator[i],q));
 return <Surface><Head>真实点和生成点，共用同一个判别器</Head><defs><clipPath id="disc-field"><rect x="618" y="400" width="500" height="363"/></clipPath></defs>
 <Scatter points={exp.target} cx={277} cy={466} scale={32} n={90} color={C.cyan}/><Scatter points={sample('gan',p).points} cx={277} cy={690} scale={32} n={90} color={C.gold}/><T x={410} y={460} size={27} color={C.cyan}>真实样本</T><T x={410} y={684} size={27} color={C.gold}>生成样本</T>
 <g clipPath="url(#disc-field)">{grid.map((v,i)=><rect key={i} x={858+(Math.floor(i/25)/24*6-3)*58-7.25} y={576-(i%25/24*6-3)*58-7.25} width={14.6} height={14.6} fill={C.cyan} opacity={.06+.68*v}/>)}<Scatter points={exp.target} cx={858} cy={576} scale={58} n={160} color={C.white} opacity={.48}/><Scatter points={sample('gan',p).points} cx={858} cy={576} scale={58} n={120} color={C.gold}/></g>
 <T x={620} y={796} size={26}>亮区：D 更偏向判断为真实数据</T><T x={149} y={796} size={27} color={C.gold}>训练快照 {sample('gan',p).step}</T>
 <Footer>亮度表示判别器给出的分数，点与判断场使用同一坐标系</Footer></Surface>;
}

function UpdateScene(props:Props){const {beat,frame}=props,{stage,phase:part,p}=timing(props),updateG=beat.id==='g-update';const loop=phase(frame,360);const curve:Cubic=[[1010,608],[1003,792],[481,792],[475,608]];
 return <Surface><Head>{updateG?'D 固定，反馈把 G 推向目标':'这一轮只更新 D，把真假分开'}</Head><Camera p={p} zoom={1.025}>
 <Node x={235} y={534} label="z" sub="随机输入" focus={.2}/><Node x={476} y={534} label="G" sub={updateG?'更新参数':'参数保持'} focus={updateG?1:0}/><Node x={1010} y={534} label="D" sub={updateG?'参数保持':'更新参数'} color={C.cyan} focus={updateG?0:1}/><Stream points={[[307,534],[344,534],[364,534],[399,534]]} p={phase(frame,290)}/><Stream points={[[551,534],[678,534],[814,534],[932,534]]} p={phase(frame,290,100)}/><TileBlend files={ganFiles} p={p} x={650} y={489} w={154} h={77}/>
 <Stream points={[[1010,398],[1010,426],[1010,436],[1010,476]]} p={phase(frame,290,180)} color={C.cyan}/><T x={1010} y={389} anchor="middle" size={27} color={C.cyan}>真实样本</T>
 {updateG?<><Stream points={curve} p={loop} color={C.gold}/><T x={736} y={750} size={28} anchor="middle" color={C.gold}>反馈回到 G，D 只读</T><Line d="M965 435H1054" color={C.muted}/></>:<><Line d={cubicD(curve)} color={C.muted}/><path d="M715 729l22 24m0-24l-22 24" stroke={C.gold} strokeWidth={3}/><T x={723} y={788} size={26} anchor="middle" color={C.gold}>D 更新，反馈在这里停止</T><Stream points={[[1056,572],[1179,593],[1179,722],[1061,703]]} p={loop} color={C.cyan}/></>}
 </Camera><Footer>{updateG?'这一轮更新生成器参数 · D 保持不变':'这一轮更新检查者参数 · G 保持不变'}</Footer></Surface>;
}
function LossScene(props:Props){const {p,stage}=timing(props),rows=exp.gan[0].history,k=Math.min(rows.length-1,Math.floor(p*(rows.length-1))),max=Math.max(...rows.flatMap(r=>[r.g_loss,r.d_loss]));return <Surface><Head>两笔账，分别告诉两个网络该改哪里</Head><T x={153} y={412} size={30} color={C.cyan}>检查者：分错来源的代价</T><T x={153} y={459} size={30} color={C.gold}>生成器：让自己的样本获得更高判断</T><Curves values={rows.map(r=>r.d_loss)} x={158} y={499} w={686} h={235} p={p} color={C.cyan} maxValue={max}/><Curves values={rows.map(r=>r.g_loss)} x={158} y={499} w={686} h={235} p={p} color={C.gold} maxValue={max}/><T x={903} y={553} size={28} color={C.cyan}>D  {rows[k].d_loss.toFixed(3)}</T><T x={903} y={634} size={28} color={C.gold}>G  {rows[k].g_loss.toFixed(3)}</T><T x={151} y={793} size={stage===0?27:31} color={C.gold}>{stage===0?'同一训练过程，双方目标一起变化':'生成器目标：Lɢ = −E[log D(G(z))]'}</T><Footer>seed 12 · 保存的原始损失 · 曲线要和整批样本一起看</Footer></Surface>;}
function LatentScene(props:Props){const {p}=timing(props);const rows=exp.gan[0].interpolation,k=p*(rows.length-1),i=Math.floor(k),j=Math.min(i+1,rows.length-1),q=k-i,point=rows[i].map((v,c)=>mix(v,rows[j][c],q));const pos=(v:number[])=>[799+v[0]*70,568-v[1]*70];const pp=pos(point);return <Surface><Head>慢慢改变输入，跟着看输出走哪条路</Head><T x={153} y={429} size={30} color={C.gold}>输入：两组随机向量之间插值</T><Line d="M174 548H467" color={C.muted}/><circle cx={174+293*p} cy={548} r={9} fill={C.gold}/><T x={171} y={603} size={29}>zₐ</T><T x={439} y={603} size={29}>zᵦ</T><T x={159} y={702} size={31} color={C.gold}>α = {p.toFixed(2)}</T><Stream points={[[486,548],[534,548],[558,548],[603,548]]} p={phase(props.frame,310)} color={C.cyan}/><Scatter points={exp.target} cx={799} cy={568} scale={70} n={240} color={C.cyan} opacity={.32}/><polyline points={rows.map(pos).map(v=>v.join(',')).join(' ')} fill="none" stroke={C.gold} strokeWidth={2.5}/><circle cx={pp[0]} cy={pp[1]} r={9} fill={C.white}/><T x={746} y={783} size={27} color={C.gold}>当前输出 ({point[0].toFixed(2)}, {point[1].toFixed(2)})</T><Footer>真实生成器的潜变量插值 · 路径连续，也可能经过数据稀少的地方</Footer></Surface>;}
function CollapseScene(props:Props){const {p,stage}=timing(props);const q=ease(p),destination=exp.centers[0];return <Surface><Head>每一道菜都像样，菜单却只剩一道</Head><Camera p={p} zoom={1.03}><Scatter points={exp.target} cx={450} cy={560} scale={72} n={240} color={C.cyan} opacity={.19}/>{exp.centers.map((c,i)=><circle key={i} cx={450+c[0]*72} cy={560-c[1]*72} r={27} fill="none" stroke={C.cyan} strokeOpacity={.3}/>) }<Scatter points={exp.target.slice(0,240).map(v=>[mix(v[0],destination[0]+(v[0]-destination[0])*.025,q),mix(v[1],destination[1]+v[1]*.025,q)])} cx={450} cy={560} scale={72} n={240}/><T x={829} y={434} size={29} color={C.gold}>八种可能性</T>{exp.centers.map((_,i)=><g key={i}><rect x={829} y={467+i*35} width={266} height={17} rx={6} fill={C.muted} opacity={.07}/><rect x={829} y={467+i*35} width={32+228*(i===0?q:1-q)} height={17} rx={6} fill={i===0?C.gold:C.cyan} opacity={i===0?1:.65}/></g>)}<T x={151} y={786} size={31} color={C.gold}>“像一个”与“有很多种”，是两道不同的要求</T></Camera><Footer>模式坍塌机制示意 · 条形显示多样性怎样集中</Footer></Surface>;}
function NoiseMechanism(props:Props){const {beat,frame}=props,{p,stage,phase:part}=timing(props),id=beat.id;const q=ease(p),k=q*40,a=Math.floor(k),b=Math.min(40,a+1),v=ease(k-a),signal=mix(noise[a].signal,noise[b].signal,v),amount=mix(noise[a].noise,noise[b].noise,v);
 if(id==='bridge-noise')return <Surface><Head>把一次画完整张图，拆成许多次小修正</Head><Camera p={p} zoom={1.035}>{[0,10,20,30,40].map((n,i)=>{const x=151+i*203,y=455+Math.sin(i/4*Math.PI)*43;return <g key={n}><Tile file={noise[n].file} x={x} y={y} w={155} h={175}/><T x={x+77} y={714} size={25} anchor="middle" color={i===0?C.gold:C.cyan}>{['清楚的图','轻微扰动','轮廓减弱','线索稀少','接近噪声'][i]}</T>{i<4&&<Stream points={[[x+159,y+89],[x+177,y+89],[x+177,y+89],[x+195,y+89]]} p={phase(frame,240,i*43)} color={C.cyan}/>}</g>})}</Camera><StageNote>先准备“有答案的练习题”，再学每一步怎样修正</StageNote><Footer>小狗踏雪 · 同一图像的数值加噪状态</Footer></Surface>;
 if(id==='noise-schedule')return <><Surface><Head>两根系数柱，决定画面混入多少噪声</Head><Bar x={578} y={443} w={417} value={signal} label="原图信号" display={signal.toFixed(2)}/><Bar x={578} y={543} w={417} value={amount} label="噪声" display={amount.toFixed(2)} color={C.cyan}/><Curves values={noise.map(n=>n.signal)} x={578} y={604} w={518} h={117} p={q} maxValue={1}/><Curves values={noise.map(n=>n.noise)} x={578} y={604} w={518} h={117} p={q} color={C.cyan} maxValue={1}/><T x={578} y={769} size={27}>时间步 {Math.round(mix(noise[a].t,noise[b].t,v))} / 199</T><Footer>两个系数的平方相加等于 1 · 图像、柱形和曲线读取同一日程</Footer></Surface><PairImage files={noise.map(n=>n.file)} p={q} x={150} y={409} w={347} h={344}/></>;
 if(id==='forward-equation')return <><Surface><Head>一张带噪图，来自两部分的像素计算</Head>{[[225,'原始图像 x₀',C.gold],[620,'固定噪声 ε',C.cyan],[1023,'当前图像 xₜ',C.white]].map(([x,s,c])=><T key={String(s)} x={Number(x)} y={699} size={27} anchor="middle" color={String(c)}>{s}</T>)}<T x={225} y={400} size={27} anchor="middle" color={C.gold}>× {signal.toFixed(2)}</T><T x={620} y={400} size={27} anchor="middle" color={C.cyan}>× {amount.toFixed(2)}</T><T x={412} y={549} size={42} color={C.gold}>＋</T><T x={814} y={549} size={42} color={C.gold}>＝</T><T x={152} y={767} size={34} color={C.white}>xₜ = <tspan fill={C.gold}>√ᾱₜ x₀</tspan> + <tspan fill={C.cyan}>√(1−ᾱₜ) ε</tspan></T><T x={1114} y={766} size={28} anchor="end" color={C.gold}>t = {Math.round(mix(noise[a].t,noise[b].t,v))}</T><Footer>使用闭式加噪直接得到任意时间步 · 上方是同一计算中的图像项</Footer></Surface><Thumb file="character/v15/canonical.png" x={149} y={427} w={192} h={231}/><Thumb file="character/v15/epsilon.jpg" x={517} y={427} w={213} h={231}/><PairImage files={noise.map(n=>n.file)} p={q} x={907} y={427} w={225} h={231}/></>;
 if(id==='strength')return <><Surface><Head>给变化留下空间，也给身份留下线索</Head><T x={146} y={410} size={28} color={C.gold}>较轻扰动：约束更多</T><T x={755} y={410} size={28} color={C.cyan}>较重扰动：变化空间更大</T><Line d="M176 751H1109" color={C.muted}/><circle cx={176+933*p} cy={751} r={9} fill={C.gold}/><T x={614} y={805} size={29} anchor="middle" color={C.gold}>保留原图 ← 扰动强度 → 允许改变</T><Footer>用真实数值加噪说明取舍 · 具体编辑效果取决于工具和模型</Footer></Surface><PairImage files={noise.slice(0,21).map(n=>n.file)} p={p} x={151} y={428} w={336} h={285}/><PairImage files={noise.slice(20).map(n=>n.file)} p={p} x={766} y={428} w={336} h={285}/></>;
 return <><Surface><Head>从面纹与白爪，观察结构怎样被扰动</Head><T x={150} y={405} size={28} color={C.gold}>同一张踏雪</T><Bar x={689} y={491} w={323} value={signal} label="图像信号" display={signal.toFixed(2)}/><Bar x={689} y={617} w={323} value={amount} label="已知噪声" display={amount.toFixed(2)} color={C.cyan}/><Stream points={[[564,584],[600,584],[626,555],[666,555]]} p={phase(frame,240)} color={C.cyan}/><T x={688} y={721} size={29} color={C.gold}>t = {Math.round(mix(noise[a].t,noise[b].t,v))}</T><Footer>固定原图、固定噪声 · 每一个中间状态都由前向公式计算</Footer></Surface><PairImage files={noise.map(n=>n.file)} p={q} x={146} y={425} w={410} h={369}/></>;
}
function PredictionScene(props:Props){const {beat}=props,{p,stage,phase:part}=timing(props);const estimate=beat.id==='why-noise',types=estimate?['noisy','predicted-noise','estimate']:['noisy','predicted-noise','true-noise'];const names=estimate?['当前带噪样本','网络预测噪声','计算得到 x₀ 估计']:['带噪样本','网络预测噪声','我们记录的噪声'];const q=clamp((stage+part-1)/1.9),k=q*2,i=Math.floor(k),j=Math.min(2,i+1),v=ease(k-i);return <><Surface><Head>{estimate?'预测出的噪声，成为下一步修正的依据':'给网络一张题目，把记录下的噪声留作答案'}</Head>{types.map((name,n)=><g key={name}><T x={279+n*347} y={740} size={28} anchor="middle" color={n===1?C.gold:C.cyan}>{names[n]}</T>{n<2&&<Stream points={[[416+n*347,564],[438+n*347,564],[443+n*347,564],[463+n*347,564]]} p={phase(props.frame,290,n*120)} color={n===0?C.gold:C.cyan}/>}</g>)}<T x={150} y={789} size={28} color={C.gold}>保存的验证样本 · t = {prediction[v<.5?i:j].t}</T><T x={809} y={789} size={28}>MSE {prediction[v<.5?i:j].mse.toFixed(4)}</T><Footer>{estimate?'同一输入的预测和单步估计 · 仍需按采样方法继续迭代':'噪声预测与答案逐像素比较 · 图片在保存状态间平滑过渡'}</Footer></Surface>{types.map((type,n)=><div key={type} style={{position:'absolute',transformOrigin:`${279+n*347}px 562px`,transform:`scale(${1+.026*ease(p)})`}}><PairImage files={prediction.map(r=>`experiments/prediction/${r.t}-${type}.png`)} p={q} x={150+n*347} y={424} w={258}/></div>)}</>;
}
function TrainScene(props:Props){const {p,stage,phase:part}=timing(props);const q=clamp((stage+part)/3);const selected=q*40,lo=Math.floor(selected),hi=Math.min(40,lo+1),blend=ease(selected-lo),r={signal:mix(noise[lo].signal,noise[hi].signal,blend),noise:mix(noise[lo].noise,noise[hi].noise,blend),t:Math.round(mix(noise[lo].t,noise[hi].t,blend))};const points=exp.target.slice(0,72);const disturbed=points.map((v,i)=>v.map((x,j)=>r.signal*x+r.noise*exp.ddpm[0].trajectory[0].points[i][j]));return <Surface><Head>同一批目标点，可以造出不同难度的题</Head><Camera p={p} zoom={1.02}><Scatter points={points} cx={279} cy={512} scale={43} n={72} color={C.cyan}/><Scatter points={disturbed} cx={641} cy={512} scale={43} n={72} color={C.gold}/><Stream points={[[411,513],[454,513],[462,513],[505,513]]} p={phase(props.frame,280)}/><Node x={1019} y={512} label="εθ(xₜ,t)" sub="预测已知扰动" focus={1} w={184}/><Stream points={[[777,513],[832,513],[861,513],[914,513]]} p={phase(props.frame,280,150)} color={C.cyan}/><T x={277} y={646} size={27} anchor="middle">抽取目标点</T><T x={641} y={646} size={27} anchor="middle">加噪 · t = {r.t}</T></Camera><Curves values={exp.ddpm[0].history.map(r=>r.noise_mse)} x={156} y={692} w={970} h={89} p={p} color={C.cyan}/><Footer>上：加扰动的流程示意 · 下：实际训练误差，保留每批起伏</Footer></Surface>;}
function ConditioningScene(props:Props){const {p,stage,phase:part}=timing(props);const choices=['类别 3','文字描述','参考图片','轮廓 / 姿态'];return <Surface><Head>把想要的内容，作为额外信息一起交进去</Head><Camera p={p} zoom={1.025}>{choices.map((label,i)=>{const y=433+i*92;const curve:Cubic=[[396,y-7],[547,y-7],[514,577],[655,577]];return <g key={label}><T x={152} y={y} size={29} color={i===stage?C.gold:C.cyan}>{label}</T><Stream points={curve} p={phase(props.frame,330,i*73)} color={i===stage?C.gold:C.cyan} reveal={ease(stage+part+.75-i*.33)}/></g>})}<Node x={742} y={577} label="条件生成" focus={1} w={168}/><Stream points={[[833,577],[881,577],[895,577],[935,577]]} p={phase(props.frame,330,170)}/><Tile file="character/v15/canonical.png" x={950} y={426} w={167} h={259}/><T x={1014} y={742} size={27} anchor="middle" color={C.gold}>朝要求靠近</T></Camera><Footer>条件入口的机制示意 · 是否支持某种条件，取决于模型训练方式</Footer></Surface>;}
function EvaluationScene(props:Props){const {p,stage,phase:part}=timing(props);const labels=['符合任务','身份与结构','动作连续'];const active=Math.min(2,stage);return <Surface><Head>先说清任务，再沿着细节逐项检查</Head><Camera p={p} zoom={1.03}><Tile file="character/v15/canonical.png" x={154} y={412} w={330} h={351}/><Stream points={[[500,488],[573,488],[566,451],[639,451]]} p={phase(props.frame,310)} color={C.gold}/><Stream points={[[498,636],[557,636],[577,591],[639,591]]} p={phase(props.frame,310,100)} color={C.cyan}/>{labels.map((label,i)=><g key={label}><T x={674} y={451+i*131} size={32} color={i===active?C.gold:C.white}>{label}</T><Line d={`M675 ${474+i*131}H1114`} color={C.muted}/><T x={674} y={512+i*131} size={26}>{['场景、主体、动作是否完成','面纹、眼睛、长毛和白爪','相邻帧之间是否接得上'][i]}</T></g>)}</Camera><Footer>小狗踏雪 · 单帧、连续动作与整批结果分别检查</Footer></Surface>;}

function DataScene(props:Props){
 const {p,stage,phase:part}=timing(props),frame=props.frame;
 return <Surface><Head>训练经验，沿着样本写进网络参数</Head>
 {stage<2?<><Tile file="experiments/digits/training-examples.png" x={145} y={440} w={365} h={184}/><Stream points={[[530,530],[564,530],[588,530],[625,530]]} p={phase(frame,280)} color={C.cyan}/><Node x={725} y={530} label="训练" sub="学习笔画规律" focus={1}/><Stream points={[[810,530],[846,530],[863,530],[900,530]]} p={phase(frame,280,120)}/><DigitStrip kind="ddpm" p={clamp(p*1.5)} x={910} y={476} w={272}/><T x={150} y={746} size={30} color={C.gold}>见过的结构，成为生成新样本的基础</T></>:<>
 {['front','side','lying'].map((name,i)=>{const x=150+i*350,h=[110,69,31][i]*ease(part);return <g key={name}><Tile file={name==='lying'?'character/v15/gallery.png':'character/v15/canonical.png'} x={x} y={404} w={248} h={245}/><rect x={x} y={777-h} width={245} height={h} rx={6} fill={i===0?C.gold:C.cyan} opacity={.55}/><T x={x+122} y={811} size={25} anchor="middle">{['经常见到','偶尔见到','很少见到'][i]}</T></g>})}<T x={150} y={392} size={26} color={C.gold}>出现次数影响学习机会</T>
 </>}
 <Footer>{stage<2?'左：训练样本 · 右：实际去噪生成结果':'姿势频率机制示意 · 图中比例用于解释学习机会'}</Footer></Surface>;
}

function ReproduceScene(props:Props){const {p,stage,phase:part}=timing(props);const x=[235,521,813,1089];return <Surface><Head>留下同一份输入，才看得出改变来自哪里</Head><Camera p={p} zoom={1.02}><Scatter points={sample('gan',p).points} cx={275} cy={515} scale={42} n={160}/><Tile file="experiments/digits/ddpm-t000.png" x={643} y={437} w={411} h={205}/><Stream points={[[439,520],[508,520],[540,520],[618,520]]} p={phase(props.frame,310)} color={C.cyan}/><T x={271} y={654} anchor="middle" size={29}>先跑二维实验</T><T x={848} y={654} anchor="middle" size={29}>再看数字的真实采样</T>{['环境','输入与种子','模型参数','保存结果'].map((s,i)=><g key={s}><circle cx={x[i]} cy={733} r={5} fill={C.gold}/>{i<3&&<Line d={`M${x[i]+12} 733H${x[i+1]-12}`} color={C.muted}/>}<T x={x[i]} y={784} anchor="middle" size={26}>{s}</T></g>)}</Camera><Footer>配套资料保留代码、参数与实验产物 · 改一个变量，再比较一次</Footer></Surface>;}
function CodeScene(props:Props){
 const {beat,frame}=props,{p,clip,clipp}=timing(props),ddpm=beat.id==='diffusion-code';
 const code=ddpm?['optimizer.zero_grad(); t = draw_t()','noisy, eps = add_noise(x, t)','pred = net(noisy, t)','loss = mse(pred, eps)','loss.backward()','optimizer.step()']:['fake = G(z)','loss_d = train_D(x, fake.detach())','optimizer_G.zero_grad()','loss_g = bce_logits(D(G(z)), ones)','loss_g.backward()','optimizer_G.step()'];
 const marks=beat.clips.map((c,i)=>({start:c.from,end:c.to,line:Math.min(5,i)}));const row=marks.filter(m=>frame>=m.start).at(-1)?.line??0;
 const focus=Math.min(5,Math.max(0,row))+ease(clipp)*.35;
 return <><Surface><Head>{ddpm?'一份已知的噪声，给每次更新提供答案':'代码里的每一步，都能在生成结果里找到对应'}</Head>
 <rect x={144} y={407} width={584} height={340} rx={11} fill={C.ink} fillOpacity={.38}/>
 <rect x={147} y={428+focus*47} width={577} height={43} rx={5} fill={C.gold} fillOpacity={.08}/>
 {code.map((line,i)=><g key={i}><T x={160} y={458+i*47} size={21} color={C.muted}>{i+1}</T><text x={194} y={458+i*47} fontFamily="Consolas,monospace" fontSize={24.0} fill={Math.abs(focus-i)<.75?C.white:C.muted}>{line}</text></g>)}
 <T x={778} y={420} size={26} color={C.gold}>{ddpm?'预测与答案，逐像素对照':'固定输入，观察训练改变'}</T>
 {ddpm?<><Curves values={digitMetrics.ddpm.map(r=>r.noise_mse)} x={772} y={684} w={374} h={94} p={p} color={C.cyan}/><T x={774} y={813} size={23}>实际 MNIST 训练误差</T><T x={784} y={643} size={24}>网络预测</T><T x={991} y={643} size={24} color={C.cyan}>已知噪声</T></>:<><Line d="M774 712H1147" color={C.muted}/><circle cx={774+373*p} cy={712} r={6} fill={C.gold}/><T x={774} y={773} size={26}>观察笔画与整批多样性</T></>}
 <Footer>{ddpm?'图像与曲线来自保存的 MNIST 预测与训练记录':'固定随机输入 · 保存的 GAN 检查点逐步推进'}</Footer></Surface>
 {ddpm?['predicted-noise','true-noise'].map((type,i)=><PairImage key={type} files={prediction.map(r=>`experiments/prediction/${r.t}-${type}.png`)} p={p} x={772+i*198} y={449} w={177}/>):<PairImage files={ganFiles} p={p} x={773} y={456} w={375} h={187.5}/>}</>;
}
function LocalStepScene(props:Props){const {p,stage,phase:part}=timing(props);const values=[stepData.input,stepData.mean,stepData.output],xlo=Math.min(...values.map(v=>v[0]))-.01,xhi=Math.max(...values.map(v=>v[0]))+.01,ylo=Math.min(...values.map(v=>v[1]))-.015,yhi=Math.max(...values.map(v=>v[1]))+.015;const map=(v:number[])=>[180+(v[0]-xlo)/(xhi-xlo)*520,745-(v[1]-ylo)/(yhi-ylo)*338];const [a,b,c]=values.map(map),one=stage>0?1:ease(part*2.25),two=stage>0?1:ease(part*2.25-1.15),point=two>0?[mix(b[0],c[0],two),mix(b[1],c[1],two)]:[mix(a[0],b[0],one),mix(a[1],b[1],one)];return <Surface><Head>放大一次真实更新，分清两个连续动作</Head><Camera p={p} focus={[461,570]} zoom={1.035}><path d="M163 402V783H742" fill="none" stroke={C.muted} strokeOpacity={.25}/><Line d={`M${a}L${b}`} color={C.gold} p={one}/><Line d={`M${b}L${c}`} color={C.cyan} p={two}/>{[a,b,c].map((v,i)=><g key={i}><circle cx={v[0]} cy={v[1]} r={6} fill={[C.white,C.gold,C.cyan][i]}/><T x={v[0]+16} y={v[1]-19} size={25} color={[C.white,C.gold,C.cyan][i]}>{['当前样本','计算均值','下一状态'][i]}</T></g>)}<circle cx={point[0]} cy={point[1]} r={12} fill={C.white} opacity={.15}/><circle cx={point[0]} cy={point[1]} r={5} fill={C.white}/></Camera><T x={817} y={449} size={31} color={C.gold}>t = 99</T><T x={817} y={526} size={27}>先到更新均值</T><T x={817} y={590} size={27} color={C.cyan}>再加规定的随机项</T><T x={817} y={673} size={26}>方差 {stepData.variance.toFixed(5)}</T><T x={817} y={748} size={27}>最后一步停止加新噪声</T><Footer>seed 12 模型 · 一次真实更新 · 固定随机项</Footer></Surface>;}
/* V5 teaching scenes: each path and travelling point share the same cubic
 * geometry. These scenes keep the left explanation alive while the cinematic
 * background changes underneath. */
function ArrowTip({point,previous,color=C.gold}:{point:XY;previous:XY;color?:string}){
  const angle=Math.atan2(point[1]-previous[1],point[0]-previous[0])*180/Math.PI;
  return <polygon points="0,-8 17,0 0,8" fill={color} transform={`translate(${point[0]} ${point[1]}) rotate(${angle})`}/>;
}

function Flow3DScene(props:Props){
  const {beat,frame}=props; const {p,stage,phase:part}=timing(props);
  const updateD=beat.id==='d-update', updateG=beat.id==='g-update';
  // Keep every route outside node rectangles.  A single sweeping curve used to
  // cross D and ∇D, which made the gradient direction look ambiguous.
  const routes:{points:Cubic;color:string;offset:number}[]=updateD?[
    {points:[[466,490],[545,490],[620,576],[708,576]],color:C.cyan,offset:0},
    {points:[[466,660],[545,660],[620,576],[708,576]],color:C.gold,offset:120},
    {points:[[872,576],[930,576],[947,748],[990,748]],color:C.gold,offset:240},
  ]:updateG?[
    {points:[[520,748],[570,748],[620,748],[670,748]],color:C.gold,offset:0},
    {points:[[850,748],[900,748],[940,620],[1000,462]],color:C.cyan,offset:130},
  ]:[
    // Keep the travelling point and its line between node edges.  The former
    // single straight path visually cut through G and 候选, especially over
    // the perspective background.  Three short arcs read as one hand-off
    // while leaving every node face unobstructed.
    {points:[[348,514],[374,514],[420,514],[446,514]],color:C.gold,offset:0},
    {points:[[608,514],[626,514],[690,514],[733,514]],color:C.gold,offset:120},
    {points:[[907,514],[930,514],[980,514],[1009,514]],color:C.gold,offset:240},
  ];
  const z=ease((p-.15)/.85), focus=updateD||updateG?1:stage>=1?1:0;
  const title=updateD?'D 更新：真实与生成样本 → 判别 → 更新 D':updateG?'G 更新：候选 → D 的反馈 → 更新 G':'候选进入检查者，反馈沿同一条路径返回';
  return <Surface><rect x="112" y="376" width="1170" height="420" rx="30" fill="#061017" fillOpacity=".62" stroke={C.cyan} strokeOpacity=".10"/><defs><linearGradient id="v5flowfloor" x2="1" y2="1"><stop stopColor="#0a1a22"/><stop offset=".55" stopColor="#142f3a"/><stop offset="1" stopColor="#071017"/></linearGradient></defs>
    <Head>{title}</Head>
    <g transform={`translate(${mix(0,-42,z)} ${mix(0,12,z)}) scale(${mix(1,1.06,z)})`}>
      <path d="M150 784 L1134 784 L1260 628 L274 628 Z" fill="url(#v5flowfloor)" opacity=".75"/>
      {[0,1,2,3,4].map(i=><path key={i} d={`M${220+i*205} 784L${350+i*205} 628`} stroke={C.cyan} strokeOpacity=".15"/>)}
      {[0,1,2].map(i=><path key={i} d={`M${260+i*280} ${660-i*16}H${1130-i*80}`} stroke={C.gold} strokeOpacity=".1"/>)}
      {!updateD&&!updateG&&<>
        <Node x={260} y={514} label="z" sub="随机输入" color={C.gold} focus={stage===0?1:.35}/>
        <Node x={527} y={514} label="G" sub="生成器" color={C.gold} focus={stage===1?1:.35} w={162}/>
        <Node x={820} y={514} label="候选" sub="一张新样本" color={C.white} focus={stage===2?1:.35} w={174}/>
        <Node x={1080} y={514} label="D" sub="检查来源" color={C.cyan} focus={stage>=3?1:.35}/>
      </>}
      {updateD&&<><Node x={370} y={490} label="真实样本" sub="数据分布" color={C.cyan} focus={stage===0?1:.35} w={190}/><Node x={370} y={660} label="生成样本" sub="候选分布" color={C.gold} focus={stage===0?1:.35} w={190}/><Node x={790} y={576} label="D" sub="判断来源" color={C.cyan} focus={stage>=1?1:.35} w={164}/><Node x={1080} y={748} label="∇D" sub="更新参数" color={C.gold} focus={stage>=2?1:.35} w={180}/></>}
      {updateG&&<><Node x={430} y={748} label="G" sub="候选参数" color={C.gold} focus={stage===0?1:.35} w={180}/><Node x={760} y={748} label="D" sub="只读反馈" color={C.cyan} focus={stage>=1?1:.35} w={180}/><Node x={1090} y={462} label="∇G" sub="修改作品" color={C.gold} focus={stage>=2?1:.35} w={180}/></>}
      {routes.map((route,i)=>{const pulse=phase(frame,360,route.offset),point=cubicAtDistance(route.points,pulse),end=cubicAtDistance(route.points,.98),before=cubicAtDistance(route.points,.94);return <g key={i}>
        <Stream points={route.points} p={pulse} color={route.color} width={3}/>
        <ArrowTip point={end} previous={before} color={route.color}/>
        <circle cx={point[0]} cy={point[1]} r={15} fill={route.color} opacity={.13}/><circle cx={point[0]} cy={point[1]} r={5.5} fill={route.color}/>
      </g>})}
      {/* The route and node labels already carry this explanation.  Keeping
       * a second sentence here pushed into the source/subtitle safe area. */}
    </g>
    <Footer>{updateD?'真实与生成样本汇入同一检查者，下一轮只更新 D': 'D 保持不变，反馈沿计算图回到 G'}</Footer>
  </Surface>;
}

function Overview3DScene(props:Props){
  const {beat,frame}=props; const {p,stage,phase:part}=timing(props); const pulse=phase(frame,300);
  const orbit=phase(frame,420), ox=635+Math.sin(frame/48)*38, oy=550+Math.cos(frame/53)*24;
  return <Surface><Head>{beat.id==='goal'?'从随机起点，到一位熟悉的主角':'先用小实验，把创造拆成能看见的三步'}</Head>
    <g transform={`translate(${mix(0,-24,ease(p))} 0) scale(${mix(1,1.045,ease(p))})`}>
      <path d="M135 778Q585 628 1102 778" fill="none" stroke={C.cyan} strokeOpacity=".1" strokeWidth="4"/>
      {Array.from({length:80},(_,i)=>{const col=i%10,row=Math.floor(i/10),depth=(row/8);const x=175+col*31+depth*68,y=438+row*25-depth*20;const a=.18+.55*ease((p*2-(i%17)/17));return <rect key={i} x={x} y={y} width={22} height={22} rx={4} fill={i%3?C.cyan:C.gold} opacity={a}/>})}
      <T x={326} y={746} size={28} anchor="middle" color={C.cyan}>随机起点</T>
      <g transform="translate(635 550) rotate(-12) skewX(-10)"><rect x={-145} y={-93} width={290} height={186} rx={16} fill="#08131c" stroke={C.gold} strokeOpacity=".65"/>{[0,1,2].map(r=>[0,1,2].map(c=><circle key={`${r}-${c}`} cx={-78+c*78} cy={-48+r*48} r={10} fill={C.gold} opacity={.3+.65*ease(p*2-r*.23-c*.17)}/>))}</g>
      <T x={635} y={746} size={28} anchor="middle" color={C.gold}>规律与参数</T>
      <g transform={`translate(${1007+Math.sin(frame/72)*7} ${548+Math.cos(frame/80)*5}) rotate(${Math.sin(frame/160)*2})`}><rect x={-105} y={-128} width={210} height={256} rx={14} fill="#10232d" stroke={C.cyan} strokeOpacity=".7"/><SafeImage href={staticFile('character/v15/canonical.png')} x={-91} y={-116} width={182} height={222} preserveAspectRatio="xMidYMid slice" opacity={.92}/><circle cx={0} cy={-40} r={76} fill="none" stroke={C.cyan} strokeOpacity={.25+.5*ease(p*2)}/></g>
      <T x={1007} y={746} size={28} anchor="middle" color={C.cyan}>踏雪的新场景</T>
      {/* Each travelling point stops at the object edge. It never crosses the
       * parameter card or the reference image. */}
      <Stream points={[[430,560],[454,560],[472,550],[490,550]]} p={pulse} color={C.cyan}/>
      <Stream points={[[780,550],[810,550],[852,560],[902,560]]} p={phase(frame,300,120)} color={C.gold}/>
      <circle cx={ox} cy={oy} r={7} fill={C.white} opacity={.9}/><circle cx={635} cy={550} r={26+5*Math.sin(frame/29)**2} fill="none" stroke={C.gold} strokeOpacity={.18}/>
    </g>
    <T x={145} y={802} size={28} color={C.gold}>{stage===0?'先看随机起点怎样被组织':stage===1?'再看网络如何学到结构':'最后检查主角是否还是踏雪'}</T>
    <T x={125} y={858} size={23} color={C.muted}>三维深度只用于帮助看清流程 · 踏雪的参考图保持固定</T>
  </Surface>;
}

function TrainingSampling3D(props:Props){
  const {beat,frame}=props; const {p,stage,phase:part}=timing(props); const sampleP=ease(p), train=beat.id==='training-sampling';
  const imgs=Array.from({length:41},(_,i)=>`experiments/digits/ddpm-t${String(200-i*5).padStart(3,'0')}.png`);
  const history=exp.ddpm[0].history.map(r=>r.noise_mse);
  const curveT=clamp(p)*(history.length-1), curveI=Math.floor(curveT), curveJ=Math.min(history.length-1,curveI+1);
  const curveX=356+curveT/(history.length-1)*625, curveY=474+96-(mix(history[curveI],history[curveJ],ease(curveT-curveI))/Math.max(...history))*96;
  const sampleStep=clamp(p)*5, sampleIndex=Math.min(5,Math.floor(sampleStep)), sampleX=600+sampleStep*96;
  return <Surface><Head>{train?'训练和生成，分别发生在两条时间线上':'两条生成路线，都要把变化交给眼睛'}</Head>
    <g transform={`translate(${mix(0,-35,ease(p))} 0) scale(${mix(1,1.04,ease(p))})`}>
      <T x={148} y={426} size={32} color={C.gold}>训练</T><Line d="M300 414H1110" color={C.gold}/>{[0,1,2,3].map(i=><g key={i}><rect x={360+i*155} y={385-i*9} width={92} height={58} rx={15} fill={C.gold} fillOpacity={.08+.08*Math.sin(frame/20+i)}/><T x={406+i*155} y={421-i*9} size={23} anchor="middle">{['题目','答案','损失','更新'][i]}</T></g>)}<Curves values={history} x={356} y={474} w={625} h={96} p={p} color={C.gold}/><circle cx={curveX} cy={curveY} r={14} fill={C.gold} opacity={.16}/><circle cx={curveX} cy={curveY} r={5} fill={C.gold}/><g clipPath="url(#training-example-lane)"><Tile file="experiments/digits/training-examples.png" x={1003} y={389} w={170} h={102}/></g><T x={1088} y={518} size={23} anchor="middle" color={C.gold}>本批题目</T>
      <T x={148} y={690} size={32} color={C.cyan}>采样</T><Line d="M300 679H1110" color={C.cyan}/><g clipPath="url(#sampling-image-lane)"><TileBlend files={imgs} p={sampleP} x={322} y={596} w={250} h={150}/></g><Stream points={[[585,679],[620,679],[700,679],[1110,679]]} p={phase(frame,420)} color={C.cyan}/>{[0,1,2,3,4,5].map(i=><g key={i}><circle cx={620+i*96} cy={679} r={20+8*ease((p*6-i)%1)} fill={C.cyan} fillOpacity={.08}/><T x={620+i*96} y={727} size={21} anchor="middle">t={200-i*40}</T></g>)}{Array.from({length:6},(_,i)=><circle key={`sample-pulse-${i}`} cx={620+i*96} cy={679} r={12+6*ease((p*5-i)%1)} fill={C.cyan} opacity={(i===sampleIndex ? .75 : .14)}/>)}<circle cx={sampleX+20} cy={679} r={8} fill={C.white} opacity={.9}/>
    </g><defs><clipPath id="training-example-lane"><rect x="1003" y="389" width="170" height="102" rx="10"/></clipPath><clipPath id="sampling-image-lane"><rect x="322" y="596" width="250" height="150" rx="12"/></clipPath></defs><T x={147} y={788} size={29} color={stage===0?C.gold:C.cyan}>{stage===0?'上面更新参数，下面只调用训练好的模型':'上面留下训练误差，下面展开一次实际采样'}</T><Footer>真实训练曲线与真实数字采样 · 速度和步数取决于模型与设备</Footer>
  </Surface>;
}

function Latent3DScene(props:Props){
  const {frame}=props;
  const {p,stage}=timing(props);
  const q=ease(p), spin=Math.sin(frame/140)*5;
  const imgs=Array.from({length:41},(_,i)=>`experiments/digits/ddpm-t${String(200-i*5).padStart(3,'0')}.png`);
  const denoiseStep=Math.round(200-200*q);
  const panel=(x:number,size:number,color:string,kind:'pixel'|'latent'|'decoded')=>{
    const n=kind==='latent'?8:12;
    const cells=kind==='decoded'?[]:Array.from({length:n*n},(_,i)=>{
      const cell=size/n-.8;
      const raw=.16+.68*Math.abs(Math.sin(i*3.77+frame/170));
      const structured=.18+.7*Math.exp(-Math.pow(i%n-(n-1)/2,2)/7-Math.pow(Math.floor(i/n)-(n-1)/2,2)/8);
      const value=kind==='latent'?mix(raw,structured,q):raw;
      return <rect key={i} x={-size/2+(i%n)*size/n} y={-size/2+Math.floor(i/n)*size/n} width={cell} height={cell} fill={color} opacity={value*(kind==='latent' ? .7:1)}/>;
    });
    return <g transform={`translate(${x} 548) rotate(${kind==='latent'?spin:0})`}><rect x={-size/2} y={-size/2} width={size} height={size} rx={18} fill="#08131b" stroke={color} strokeOpacity=".72"/>{cells}</g>;
  };
  return <Surface><defs><clipPath id="latent-decoded"><rect x="955" y="443" width="210" height="210" rx="18"/></clipPath></defs><Head>像素先压缩，潜空间里去噪，再还原图像</Head>
    <g transform={`translate(${mix(0,-22,q)} 0) scale(${mix(1,1.05,q)})`}>
      {panel(245,210,C.cyan,'pixel')}{panel(640,116,C.gold,'latent')}{panel(1060,210,C.cyan,'decoded')}
      <g clipPath="url(#latent-decoded)"><TileBlend files={imgs} p={q} x={955} y={443} w={210} h={210}/><rect x={955} y={443} width={210} height={210} fill={C.cyan} opacity={.08}/></g>
      <Stream points={[[355,548],[426,548],[468,548],[566,548]]} p={phase(frame,310)} color={C.cyan}/><ArrowTip point={[566,548]} previous={[530,548]} color={C.cyan}/>
      <Stream points={[[699,548],[782,548],[900,548],[954,548]]} p={phase(frame,310,120)} color={C.gold}/><ArrowTip point={[954,548]} previous={[918,548]} color={C.gold}/>
      {[245,640,1060].map((x,i)=><T key={x} x={x} y={704} size={29} anchor="middle" color={i===1?C.gold:C.cyan}>{['像素空间 · 1024²','潜空间 · 64²','解码图像 · 1024²'][i]}</T>)}
      <T x={640} y={760} size={27} anchor="middle" color={C.gold}>去噪时间步 t = {denoiseStep}</T><circle cx={640+Math.sin(frame/80)*38} cy={785} r={7} fill={C.gold}/>
    </g><T x={146} y={812} size={29} color={C.gold}>{stage===0?'先把高分辨率的账压小':stage===1?'在中间表示里逐步清理噪声':'最后再还原到像素空间'}</T><Footer>同一批真实数字采样 · 三个空间按左→右传递</Footer></Surface>;
}

function IdentityLockScene(props:Props){
  const {beat,frame}=props; const {p,stage,phase:part}=timing(props); const orbit=phase(frame,360), breathe=1+.012*Math.sin(frame/24);
  const copy=beat.id==='pearl-intro'?'先认识这位主角：她叫踏雪。':beat.id==='farewell'?'故事回到踏雪，身份锚点仍然在这里。':'换场景可以，白色面纹、棕色眼睛和白爪要留下。';
  // These points are measured on the canonical front reference. The moving lens
  // magnifies the same pixels, so the callout never drifts to an invented region.
  const anchors=[
    {name:'体型轮廓',point:[520,480] as XY,color:C.gold},
    {name:'镜头',point:[430,430] as XY,color:C.cyan},
    {name:'白爪',point:[520,575] as XY,color:C.gold},
    {name:'动作',point:[520,642] as XY,color:C.cyan},
  ];
  const focus=anchors[Math.min(3,Math.max(0,stage))];
  const lens=[940+Math.sin(frame/58)*8,535+Math.cos(frame/67)*7] as XY;
  const zoom=1.38+.12*Math.sin(frame/33)**2;
  const pulse=.82+.18*Math.sin(frame/29)**2;
  const link:Cubic=[[focus.point[0]+34,focus.point[1]],[680,focus.point[1]-25],[812,lens[1]-40],[lens[0]-144,lens[1]]];
  return <Surface><defs>
    <clipPath id="pearl-canonical"><rect x="250" y="345" width="540" height="438" rx="24"/></clipPath>
    <clipPath id="pearl-lens"><circle cx={lens[0]} cy={lens[1]} r={148}/></clipPath>
  </defs><Head>{copy}</Head>
    <g transform={`translate(${Math.sin(orbit*Math.PI*2)*10} 0) scale(${breathe})`}>
      <ellipse cx={520} cy={705} rx={300} ry={42} fill={C.cyan} opacity=".09"/>
      <g clipPath="url(#pearl-canonical)"><SafeImage href={staticFile('character/v15/canonical.png')} x={270} y={360} width={500} height={400} preserveAspectRatio="xMidYMid meet" opacity={.97}/></g>
      {anchors.map((a,i)=>{const active=i===Math.min(3,Math.max(0,stage));return <g key={a.name} opacity={active?.98:.25}>
        <circle cx={a.point[0]} cy={a.point[1]} r={active?38+8*pulse:24} fill="none" stroke={a.color} strokeWidth={active?3:1.5} strokeOpacity={active?.85:.32}/>
        <circle cx={a.point[0]} cy={a.point[1]} r={active?7:4} fill={a.color} opacity={active?.95:.45}/>
        <T x={a.point[0]+(i===1?-26:28)} y={a.point[1]-34} size={active?25:21} color={a.color}>{a.name}</T>
      </g>})}
      <circle cx={520} cy={520} r={165+8*Math.sin(frame/45)} fill="none" stroke={C.cyan} strokeOpacity={.13+.17*ease(p*2)}/>
      <circle cx={520} cy={520} r={210+10*Math.cos(frame/54)} fill="none" stroke={C.gold} strokeOpacity=".11" strokeDasharray="10 18"/>
    </g>
    <path d={cubicD(link)} fill="none" stroke={focus.color} strokeOpacity=".45" strokeWidth="2.5"/>
    <Stream points={link} p={phase(frame,300,stage*43)} color={focus.color} width={3}/>
    <g clipPath="url(#pearl-lens)"><rect x={lens[0]-152} y={lens[1]-152} width={304} height={304} fill="#08131c"/><SafeImage href={staticFile('character/v15/canonical.png')} x={270} y={360} width={500} height={400} preserveAspectRatio="xMidYMid meet" transform={`translate(${lens[0]-focus.point[0]*zoom} ${lens[1]-focus.point[1]*zoom}) scale(${zoom})`} opacity=".99"/></g>
    <circle cx={lens[0]} cy={lens[1]} r={151} fill="none" stroke={focus.color} strokeWidth={3} strokeOpacity=".6"/>
    <circle cx={lens[0]} cy={lens[1]} r={136+9*pulse} fill="none" stroke={C.white} strokeOpacity=".16" strokeDasharray="4 15"/>
    <T x={lens[0]} y={lens[1]+191} size={27} anchor="middle" color={focus.color}>{focus.name} · 同一参考区域</T>
    <T x={145} y={786} size={29} color={C.gold}>{stage===0?'稳定的参考图先锁住身份':stage===1?'镜头靠近镜头，检查形状是否连续':stage===2?'换场景时，白爪仍然给出同一条线索':'连续帧还要继续检查动作和比例'}</T>
    <Footer>小狗踏雪 · 镜头正在依次检查体型轮廓、镜头、白爪与动作</Footer>
  </Surface>;
}


function FarewellVisual(props:Props){
 const {frame}=props,{p}=timing(props);const u=clamp((frame-16)/221);
 return <Surface><Head>从规律到作品，把这条路亲手走一遍</Head>
 <ResultField kind="gan" p={clamp(frame/230)} cx={288} cy={541} scale={40}/><Stream points={[[410,540],[459,540],[490,540],[531,540]]} p={u}/><DigitStrip kind="ddpm" p={clamp(frame/270)} x={550} y={484} w={375}/>
 <T x={162} y={714} size={31} color={C.gold}>代码 · 参数 · 保存的结果</T><T x={162} y={766} size={28}>改一个条件，看看会发生什么</T><Footer>第二章完 · 从识别到创造</Footer></Surface>;
}

function SeedLabV5(props:Props){
  const {p,stage}=timing(props); const seeds=[12,25,2003]; const count=clamp(p*1.35)*8; const scan=Math.min(7,Math.floor(clamp(p*1.18)*8));
  const value=(i:number,s:number)=>{const n=Math.sin((i+1)*s)*43758.5453;return n-Math.floor(n)};
  return <Surface><Head>固定种子，让同一条随机起点可以重新走一遍</Head><T x={150} y={414} size={29} color={C.gold}>三组可复现的起点</T><Line d="M150 694H1120" color={C.muted}/>{seeds.map((seed,j)=>{const x=270+j*300,col=[C.gold,C.cyan,C.white][j],scanX=x-91+scan*26;return <g key={seed}><T x={x} y={466} size={31} anchor="middle" color={col}>{seed}</T><T x={x} y={505} size={22} anchor="middle">随机序列</T>{Array.from({length:8},(_,i)=>{const r=value(i,seed),h=184*r*ease(count-i),active=i===scan;return <g key={i}><rect x={x-92+i*26} y={694-h} width={17} height={h} rx={5} fill={col} opacity={active?.98:.28+.62*ease(count-i)}/>{active&&<><rect x={x-98+i*26} y={688-h} width={29} height={h+8} rx={9} fill="none" stroke={col} strokeWidth={2.5} strokeOpacity={.76+.18*Math.sin(props.frame/14)**2}/><circle cx={x-83+i*26} cy={688-h} r={6} fill={C.white} opacity={.9}/></>}</g>})}<circle cx={x} cy={694} r={8+5*Math.sin(props.frame/24)**2} fill={col} opacity={.18+.4*ease(p)}/>{j===Math.min(2,stage)&&<path d={`M${scanX} 532V${Math.max(518,694-184*value(scan,seed))}`} stroke={col} strokeWidth={2} strokeOpacity={.5} strokeDasharray="4 8"/>}</g>})}<T x={150} y={756} size={29} color={C.gold}>{stage===0?'同一个种子，随机序列可以重放':stage===1?'换一个种子，序列会沿另一条路径展开':'换模型、换参数，仍需把条件一并记录'}</T><Footer>随机序列原理示意 · 种子 12 / 25 / 2003 · 固定起点便于比较</Footer></Surface>;
}
export function UpgradedVisual(props:Props){
 const enhanced=NewScene(props); if(enhanced!==null)return <>{enhanced}</>;
 if(['generator','discriminator','d-update','g-update'].includes(props.beat.id))return <OpusMotionV15 kind="gan-feedback" frame={props.frame} duration={props.beat.duration} clips={props.beat.clips} stage={timing(props).stage} variant={props.beat.id} idPrefix={`opus-${props.beat.id}`}/>;
 const {beat}=props;
 if(beat.id==='generator')return <GeneratorScene {...props}/>;
 if(beat.id==='discriminator')return <DiscriminatorScene {...props}/>;
 if(['d-update','g-update'].includes(beat.id))return <UpdateScene {...props}/>;
 if(['goal','experiments'].includes(beat.id))return <Overview3DScene {...props}/>;
 if(beat.id==='training-sampling')return <TrainingSampling3D {...props}/>;
 if(beat.id==='latent-diffusion')return <Latent3DScene {...props}/>;
 if(['gan-pearl','pearl-identity'].includes(beat.id))return <IdentityLockScene {...props}/>;
 if(beat.id==='farewell')return <FarewellVisual {...props}/>;
 if(beat.id==='seed')return <SeedLabV5 {...props}/>;
 if(beat.id==='next')return <LanguageLab {...props}/>;
 if(['gan-code','diffusion-code'].includes(beat.id))return <CodeScene {...props}/>;
 if(beat.id==='sampling-step')return <LocalStepScene {...props}/>;
 if(beat.id==='gan-loss')return <LossScene {...props}/>;
 if(beat.id==='collapse')return <CollapseScene {...props}/>;
 if(beat.id==='latent-walk')return <LatentScene {...props}/>;
 if(['metrics','metrics-ddpm'].includes(beat.visual))return <MetricLab {...props}/>;
 if(beat.visual==='unet')return <FeatureLab {...props}/>;
 if(beat.visual==='mission')return <MissionLab {...props}/>;
 if(beat.id==='evaluation')return <EvaluationScene {...props}/>;
 if(beat.id==='data')return <DataScene {...props}/>;
 if(beat.id==='reproduce')return <ReproduceScene {...props}/>;
 if(beat.visual==='compare')return <ComparisonLab {...props}/>;
 if(beat.id==='conditioning')return <ConditioningScene {...props}/>;
 if(beat.id==='editing')return <ConditionLab {...props}/>;
 if(beat.id==='video')return <TimeLab {...props}/>;
 if(['noise','formula','schedule','edit-strength'].includes(beat.visual))return <NoiseMechanism {...props}/>;
 if(beat.visual==='denoiser')return <PredictionScene {...props}/>;
 if(beat.id==='diffusion-train')return <TrainScene {...props}/>;
 if(beat.id==='speed')return <SpeedLab {...props}/>;
 if(beat.id==='reverse-not-undo')return <ReverseLab {...props}/>;
 return <OriginalTeachingV6 {...props}/>;
}
export {timing,T,Surface,Line,Head,Footer,Bar,Signal,Thumb,PairImage,Curves,sample,Scatter,OriginalTeachingV6};
export function TeachingV6(props:Props){return <UpgradedVisual {...props}/>;}
