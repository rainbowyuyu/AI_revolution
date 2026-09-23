import React from 'react';
import {interpolate} from 'remotion';
import {MonteCarlo} from './MonteCarlo';
import {EmbodiedLab} from './EmbodiedLab';
const G='#e5bf80',C='#85d5de',W='#f5ead6',M='#99b7c0';
const cl={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const h=(i:number)=>{const n=Math.sin(i*127.1+73.7)*43758.5453;return n-Math.floor(n)};
const bez=(p:number,a:number,b:number,c:number,d:number)=>(1-p)**3*a+3*(1-p)**2*p*b+3*(1-p)*p*p*c+p**3*d;
const label=(text:string,x:number,y:number,size=24,color=W)=><text x={x} y={y} textAnchor="middle" fontFamily="NotoSansSC" fontSize={size} fill={color}>{text}</text>;
function Flow({d,f,color=C,delay=0}:{d:string;f:number;color?:string;delay?:number}){return <><path d={d} fill="none" stroke={color} strokeWidth="1.5" opacity=".27"/><path d={d} fill="none" stroke={color} strokeWidth="2.5" pathLength="1" strokeDasharray=".08 .92" strokeDashoffset={-(f/110+delay)%1}/></>}
export function LabVisual({id,f,sceneFrame=f}:{id:number;f:number;sceneFrame?:number}){
 if(id===15)return <MonteCarlo f={f}/>;
 if([17,12,13,18].includes(id))return <EmbodiedLab id={id} f={f} sceneFrame={sceneFrame}/>;
 const t=f/30,cycle=(f%150)/150,p=interpolate(f,[0,130],[0,1],cl);let body:React.ReactNode;
 if(id===1){
  const img=Array.from({length:49},(_,i)=>{const x=i%7,y=Math.floor(i/7);return (x===2||y===4||x===5&&y>1)?1:.07;});
  const scan=Math.floor(f/12)%25,sx=scan%5,sy=Math.floor(scan/5);
  body=<>{[0,1,2].map(k=><g key={k} transform={`translate(${35+k*225},65)`}>
   {img.map((v,i)=>{const x=i%7,y=Math.floor(i/7);const edge=Math.abs(v-(x?img[i-1]:0));return <rect key={i} x={x*21} y={y*21} width="17" height="17" rx="2" fill={k===2?G:C} opacity={k===0?.15+.8*v:k===1?.12+.78*edge:.12+.65*(v>.5&&i%3!==0?1:0)}/>})}
   {k===0&&<rect x={sx*21-3} y={sy*21-3} width="64" height="64" rx="3" fill="#e5bf8018" stroke={G} strokeWidth="2"/>}
   {label(['局部感受野','边缘响应','组合特征'][k],73,193,23)}
  </g>)}<Flow d="M 188 140 C 208 125 230 125 251 140" f={f}/><Flow d="M 414 140 C 438 125 455 125 477 140" f={f}/>{label('共享卷积核，沿图像扫描',340,321,26,G)}</>;
 }else if(id===3){
  body=<>{Array.from({length:7},(_,i)=><g key={i}><line x1={60+i*22} y1="62" x2={60+i*22} y2="194" stroke={M} opacity=".32"/><line x1="60" y1={62+i*22} x2="192" y2={62+i*22} stroke={M} opacity=".32"/></g>)}{[0,1,2,3,4].map(i=><circle key={i} cx={82+[0,2,1,3,2][i]*22} cy={84+[1,0,3,2,2][i]*22} r="9" fill={i%2?W:'#122431'} stroke={M}/>)}<circle cx="170" cy="172" r={11+Math.sin(t*3)*2} fill="none" stroke={G}/>{label('当前局面',127,247,24)}<Flow d="M 211 135 C 255 135 251 135 297 135" f={f}/>{[0,1,2].map((j)=><g key={j}><Flow d={`M 307 135 C 365 135 360 ${65+j*83} 419 ${65+j*83}`} f={f} delay={j*.25} color={j===1?G:C}/><circle cx="430" cy={65+j*83} r="12" fill={j===1?G:'#355967'}/>{[0,1].map(k=><Flow key={k} d={`M 445 ${65+j*83} C 498 ${65+j*83} 496 ${44+j*83+k*36} 560 ${44+j*83+k*36}`} f={f} delay={j*.21+k*.12}/> )}</g>)}{label('策略网络 + 价值评估',470,296,24,G)}{label('搜索候选，反馈选择',340,341,25)}</>;
 }else if(id===2){
  const mean=interpolate(f,[0,125],[.23,.64],cl);
  body=<>{label('生成器',132,41,28,C)}{label('判别器',523,41,28,G)}<path d="M 42 216 H 260 M 414 216 H 635" stroke={M} opacity=".35"/>
   {Array.from({length:23},(_,i)=>{const x=i/22;const real=Math.exp(-(((x-.64)/.15)**2)),fake=Math.exp(-(((x-mean)/.17)**2));return <g key={i}><rect x={45+i*9} y={213-fake*130} width="6" height={fake*130+1} fill={C} opacity=".8"/><circle cx={45+i*9} cy={213-real*130} r="2.1" fill={G}/><circle cx={447+(i%7)*26} cy={94+Math.floor(i/7)*28} r={4+real*3} fill={i%2?G:C} opacity={.45+.3*Math.sin(t*2+i)**2}/></g>})}
   <Flow d="M 240 87 C 308 52 362 54 421 87" f={f} color={C}/><Flow d="M 425 235 C 342 298 245 288 205 235" f={f} color={G}/>{label('候选样本',328,41,22,C)}{label('真实 / 生成',525,254,23)}{label('反馈优化生成分布',322,319,25,G)}{label('金色：目标分布    青色：生成分布',337,360,22,M)}</>;
 }else if(id===7){
  body=<>{[0,1,2].map(k=><g key={k} transform={`translate(${128+k*210},155)`}>{Array.from({length:160},(_,i)=>{const u=h(i)*6.28,v=h(i+100)*2-1;const a=k/2*(.75+.25*p);const x=(1-a)*(h(i+20)-.5)*165+a*Math.cos(u)*Math.sqrt(1-v*v)*65;const y=(1-a)*(h(i+50)-.5)*165+a*v*65;return <circle key={i} cx={x} cy={y} r="1.9" fill={i%7?C:G} opacity=".8"/>})}{label(['初始噪声 xT','中间状态 xₜ','生成样本 x₀'][k],0,147,23,k===2?G:W)}</g>)}<Flow d="M 210 153 H 250" f={f}/><Flow d="M 420 153 H 460" f={f}/>{label('预测噪声 εθ，逐步更新 xₜ₋₁',340,357,25,G)}</>;
 }else if(id===4){
  const tokens=['机器人','抓起','杯子'];const weights=[.16,.25,.59];
  body=<>{tokens.map((v,i)=><g key={v}>{label(v,116+i*219,226,32,i===2?G:W)}<path d={`M 116 187 Q ${180+i*150} ${65-i*16} ${116+i*219} 187`} fill="none" stroke={i===2?G:C} strokeWidth={1+weights[i]*4} opacity=".8"/>{label(`${Math.round(weights[i]*100)}%`,116+i*219,273,22,M)}<circle cx={116+i*219} cy="310" r={8+weights[i]*19} fill={i===2?G:C} opacity=".6"/></g>)}<circle cx={bez(cycle,116,230,360,554)} cy={bez(cycle,187,40,40,187)} r="4" fill={W}/>{label('softmax(QKᵀ / √dₖ)V',340,53,32,G)}{label('示意权重归一化，关注相关上下文',340,370,23,M)}</>;
 }else if(id===5){
  const words=['抓起','观察','移动','等待'],v=[.56,.23,.14,.07];
  body=<>{label('机器人伸出手，准备…',335,42,30)}{words.map((s,i)=><g key={s}>{label(s,86,106+i*54,25,i===0?G:W)}<rect x="151" y={85+i*54} width={v[i]*690*p} height="21" rx="4" fill={i===0?G:C} opacity={i===0?.9:.45}/>{label(`${Math.round(v[i]*100)}%`,610,105+i*54,22,M)}</g>)}{label('上下文 → 下一个词的概率',340,350,26,G)}</>;
 }else if(id===8){
  body=<><ellipse cx="343" cy="177" rx="139" ry="110" fill="none" stroke={M} opacity=".3"/>{Array.from({length:45},(_,i)=><circle key={i} cx={343+(h(i)-.5)*245} cy={177+(h(i+71)-.5)*183} r="2" fill={C} opacity=".3"/>)}{[0,1,2].map(i=>{const a=t*.07+i*2.1,x=343+Math.cos(a)*82,y=177+Math.sin(a)*55;return <g key={i}><circle cx={x-12} cy={y} r="8" fill={C}/><path d={`M ${x+8} ${y-8} l 13 8 -13 8 z`} fill={G}/><line x1={x-12} y1={y} x2={x+10} y2={y} stroke={W} opacity=".55"/></g>})}<Flow d="M 78 167 C 155 99 171 124 214 151" f={f}/><Flow d="M 604 167 C 539 103 495 127 465 154" f={f} color={G}/>{label('图像编码',94,252,24,C)}{label('文本编码',591,252,24,G)}{label('共享嵌入空间',343,317,28)}{label('语义相近的图文，在表示中靠近',340,368,24,M)}</>;
 }else if(id===9){
  body=<>{['示例指令','偏好反馈','策略优化'].map((s,i)=><g key={s}><path d={`M ${75+i*229} 72 h 120 v 112 h -120 z`} fill="#0b1c253d" stroke={i===2?G:C} opacity=".8"/>{[0,1,2,3].map(j=><line key={j} x1={93+i*229} y1={94+j*21} x2={163+i*229-(j%2)*22} y2={94+j*21} stroke={j===Math.floor(f/20)%4?G:C} opacity=".7"/>)}{label(s,135+i*229,240,25)}{i<2&&<Flow d={`M ${199+i*229} 129 H ${290+i*229}`} f={f}/>}</g>)}<Flow d="M 592 272 C 580 331 182 331 135 271" f={f} color={G}/>{label('示范教任务，偏好塑造行为',340,374,25,G)}</>;
 }else if(id===10){
  body=<>{[0,1,2].map(i=><g key={i}><Flow d={`M 103 ${71+i*94} C 213 ${71+i*94} 275 166 354 166`} f={f} delay={i*.3} color={i===1?G:C}/>{label(['文字','图像 / 视频','声音'][i],93,49+i*94,23)}{i===0?['A','B','C'].map((s,j)=><text key={s} x={65+j*25} y="97" fill={G} fontSize="20">{s}</text>):i===1?<path d="M 58 189 L 83 154 105 176 126 148 151 189 Z" fill="none" stroke={C}/>:Array.from({length:20},(_,j)=><line key={j} x1={54+j*5} x2={54+j*5} y1={263-Math.abs(Math.sin(t*4+j*.6))*18} y2={263+Math.abs(Math.sin(t*4+j*.6))*18} stroke={C}/>)}</g>)}<circle cx="405" cy="166" r="48" fill="#17333b77" stroke={G}/>{Array.from({length:18},(_,i)=><circle key={i} cx={405+Math.cos(i*2.4+t*.2)*34} cy={166+Math.sin(i*2.4+t*.2)*34} r="2" fill={C}/>)}<Flow d="M 455 166 H 579" f={f} color={G}/>{label('协作',613,176,27)}{label('多种输入，围绕同一个任务',342,351,26,G)}</>;
 }else if([6,11,16].includes(id)){
  body=<>{Array.from({length:160},(_,i)=>{const u=h(i)*6.28,v=h(i+50)*2-1;const x=Math.cos(u)*Math.sqrt(1-v*v)*100,z=Math.sin(u)*Math.sqrt(1-v*v)*100;const angle=t*.24;const scale=440/(490+z*Math.cos(angle)-x*Math.sin(angle));const xx=392+(x*Math.cos(angle)+z*Math.sin(angle))*scale;const yy=163+(v*100+(id===16?Math.sin(t*1.5+u)*18:0))*scale;return <ellipse key={i} cx={xx} cy={yy} rx={id===6?1.8:7*scale} ry={id===6?1.8:3.2*scale} fill={i%8?C:G} opacity={id===6?.8:.27} transform={`rotate(${i*17},${xx},${yy})`}/>})}
   {id===6?<>{Array.from({length:7},(_,i)=><g key={i}><Flow d={`M 90 185 L ${355+i*11} ${80+i*29}`} f={f} delay={i*.07}/>{Array.from({length:6},(_,j)=><circle key={j} cx={90+(265+i*11)*(j+1)/7} cy={185+(i*29-105)*(j+1)/7} r="2.5" fill={G} opacity=".6"/>)}</g>)}<path d="M 51 164 h 38 v 42 h -38 z M 89 171 l 22 -10 v 44 l -22 -9" fill="none" stroke={G}/>{label('沿光线采样与累积',340,320,26,G)}</>:<><path d="M 168 246 Q 360 330 562 246" fill="none" stroke={G} opacity=".4"/><circle cx={168+cycle*394} cy={246+Math.sin(cycle*Math.PI)*42} r="5" fill={G}/>{label(id===11?'高斯核：位置、协方差、颜色、透明度':'时变表示：位置与外观随时间变化',340,337,24,G)}</>}{label('表示与渲染原理示意',340,378,22,M)}</>;
 }else if(id===14){
  body=<>{['分解任务','调用计算','检查结果'].map((s,i)=><g key={s}><circle cx={117+i*220} cy="151" r="56" fill="none" stroke={i===2?G:C} strokeWidth="1.5"/>{i===0?Array.from({length:3},(_,j)=><line key={j} x1="87" y1={132+j*20} x2={135+(j%2)*12} y2={132+j*20} stroke={C} strokeWidth="3"/>):i===1?Array.from({length:9},(_,j)=><rect key={j} x={310+j%3*19} y={124+Math.floor(j/3)*19} width="11" height="11" fill={j===Math.floor(f/7)%9?G:C} opacity=".8"/>):<path d={`M 531 152 L 550 171 L 584 126`} fill="none" stroke={G} strokeWidth="4" pathLength="1" strokeDasharray={`${p} 1`}/>}{label(s,117+i*220,260,25)}{i<2&&<Flow d={`M ${174+i*220} 151 H ${274+i*220}`} f={f}/>}</g>)}{label('展示可观察步骤，不呈现内部思维',340,349,24,M)}</>;
 }

 return <svg width="680" height="395" viewBox="0 0 680 395" style={{overflow:'visible'}}>
  <defs><radialGradient id={`lab-${id}`}><stop stopColor="#05141be6"/><stop offset="1" stopColor="#05141b00"/></radialGradient></defs>
  <ellipse cx="340" cy="189" rx="386" ry="238" fill={`url(#lab-${id})`}/>
  {body}
 </svg>;
}
