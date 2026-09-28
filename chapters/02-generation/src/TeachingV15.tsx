import React from 'react';
import {SafeImage} from './SvgImageV11';
import {Img,staticFile} from 'remotion';
import exp from '../results/distributions-v5.json';
import prediction from './prediction.json';
import noise from './noise-v15.json';
import features from './features-v2.json';
const videoEvidence={ready:false,files:['character/v15/canonical.png','character/v15/gallery.png','character/v15/noise.png']};
import stepData from './step-v15.json';
import {UpgradedVisual} from './VisualV15';
export const C={white:'#f8efdb',gold:'#d9bb8e',cyan:'#91cdd1',muted:'#b6ccd0',ink:'#050b11'};
export const clamp=(n:number)=>Math.min(1,Math.max(0,n));
export const ease=(n:number)=>{n=clamp(n);return n*n*(3-2*n)};
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export type Beat={id:string;visual:string;title:string;subtitle:string;source:string;from:number;duration:number;stages:Record<string,number>;clips:{id:string;text:string;stage:number;from:number;to:number}[]};
export type Props={beat:Beat;frame:number};
function timing({beat,frame}:Props){
 const stages=Object.entries(beat.stages).map(([s,f])=>({s:Number(s),f}));
 const current=stages.filter(x=>frame>=x.f).at(-1)??{s:0,f:0};
 const next=stages.find(x=>x.s>current.s)?.f??beat.duration-30;
 const clip=beat.clips.find(c=>frame>=c.from&&frame<c.to)??beat.clips.filter(c=>frame>=c.from).at(-1);
 return {stage:current.s,phase:clamp((frame-current.f)/Math.max(1,next-current.f)),p:clamp((frame-(stages[0]?.f??0))/Math.max(1,beat.duration-50)),clip,clipp:clip?clamp((frame-clip.from)/Math.max(1,clip.to-clip.from)):0};
}
function T({x,y,children,size=29,color=C.muted,anchor='start',weight=550}:{x:number;y:number;children:React.ReactNode;size?:number;color?:string;anchor?:'start'|'middle'|'end';weight?:number}){return <text x={x} y={y} fill={color} fontSize={size} fontFamily="NotoSansSC" fontWeight={weight} textAnchor={anchor}>{children}</text>}
function Surface({children}:{children:React.ReactNode}){return <svg width={1920} height={1080} style={{position:'absolute',inset:0}}>{children}</svg>}
function Line({d,p=1,color=C.gold,width=2.5}:{d:string;p?:number;color?:string;width?:number}){return <path d={d} fill="none" stroke={color} strokeWidth={width} pathLength={1} strokeDasharray="1" strokeDashoffset={1-clamp(p)} strokeLinecap="round" strokeLinejoin="round"/>}
function Head({children}:{children:React.ReactNode}){return <T x={125} y={348} size={String(children).length>30?29:33} color={C.gold}>{children}</T>}
function Footer({children}:{children:React.ReactNode}){return <T x={125} y={846} size={String(children).length>44?22:25}>{children}</T>}
function Bar({x,y,w=370,value,label,color=C.gold,display}:{x:number;y:number;w?:number;value:number;label:string;color?:string;display?:string}){return <g><T x={x} y={y-19} size={27}>{label}</T><rect x={x} y={y} width={w} height={17} rx={8} fill="#adc2c519"/><rect x={x} y={y} width={w*clamp(value)} height={17} rx={8} fill={color}/>{display&&<T x={x+w+20} y={y+17} size={26} color={color}>{display}</T>}</g>}
function Signal({from,to,p,color=C.gold}:{from:number[];to:number[];p:number;color?:string}){const alpha=ease(p/.08)*ease((1-p)/.08);return <g opacity={alpha}><circle cx={mix(from[0],to[0],p)} cy={mix(from[1],to[1],p)} r={11} fill={color} opacity={.12}/><circle cx={mix(from[0],to[0],p)} cy={mix(from[1],to[1],p)} r={4.5} fill={color}/></g>}
function Thumb({file,x,y,w,h=w,opacity=1}:{file:string;x:number;y:number;w:number;h?:number;opacity?:number}){return <Img src={staticFile(file)} style={{position:'absolute',left:x,top:y,width:w,height:h,objectFit:'contain',opacity}}/>}
function PairImage({files,p,x,y,w,h=w}:{files:string[];p:number;x:number;y:number;w:number;h?:number}){const v=clamp(p)*(files.length-1),i=Math.floor(v),j=Math.min(i+1,files.length-1),q=ease(v-i);return <><Thumb file={files[i]} x={x} y={y} w={w} h={h}/>{i!==j&&<Thumb file={files[j]} x={x} y={y} w={w} h={h} opacity={q}/>}</>}
function Curves({values,x=150,y=510,w=880,h=240,p=1,color=C.gold,maxValue}:{values:number[];x?:number;y?:number;w?:number;h?:number;p?:number;color?:string;maxValue?:number}){
 const max=maxValue??Math.max(...values,.001);const z=clamp(p)*(values.length-1),n=Math.floor(z),pts=values.slice(0,n+1).map((v,i)=>[x+i/(values.length-1)*w,y+h-v/max*h]);
 if(n<values.length-1)pts.push([x+z/(values.length-1)*w,y+h-mix(values[n],values[n+1],z-n)/max*h]);
 const last=pts.at(-1)!;return <g><path d={`M${x} ${y}V${y+h}H${x+w}`} stroke={C.muted} strokeOpacity={.22} fill="none"/>{[.25,.5,.75].map(v=><path key={v} d={`M${x} ${y+h*v}H${x+w}`} stroke={C.muted} strokeOpacity={.07}/>)}<polyline points={pts.map(a=>a.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round"/><circle cx={last[0]} cy={last[1]} r={6} fill={color}/></g>
}
function sample(kind:string,p:number,seed=0){
 if(kind==='gan'){const rows=exp.gan[seed].snapshots,k=clamp(p)*(rows.length-1),i=Math.floor(k),j=Math.min(i+1,rows.length-1),q=ease(k-i);return {points:rows[i].points.map((v,n)=>v.map((x,c)=>mix(x,rows[j].points[n][c],q))),step:Math.round(mix(rows[i].step,rows[j].step,q))}}
 if(kind==='ddpm'){const rows=exp.ddpm[seed].trajectory,k=clamp(p)*(rows.length-1),i=Math.floor(k),j=Math.min(i+1,rows.length-1),q=ease(k-i);return {points:rows[i].points.map((v,n)=>v.map((x,c)=>mix(x,rows[j].points[n][c],q))),step:Math.round(mix(rows[i].t,rows[j].t,q))}}
 return {points:exp.target,step:0};
}
function Scatter({points,cx,cy,scale=75,color=C.gold,n=256,opacity=.85}:{points:number[][];cx:number;cy:number;scale?:number;color?:string;n?:number;opacity?:number}){return <g opacity={opacity}>{points.slice(0,n).map((v,i)=><circle key={i} cx={cx+v[0]*scale} cy={cy-v[1]*scale} r={3.4} fill={color}/>)}</g>}
function PointLab(props:Props){
 const {beat,frame}=props,{stage,phase,p}=timing(props),id=beat.id;
 const kind=['gan-run'].includes(id)?'gan':['sampling','sampling-step'].includes(id)?'ddpm':'target';
 const progress=id==='sampling-step'?.3+p*.15:p;
 const result=sample(kind,progress),cx=459,cy=575,scale=80;
 const points=id==='collapse'?exp.target.map(v=>[mix(v[0],exp.centers[0][0]+(v[0]-exp.centers[0][0])*.055,ease(p)),mix(v[1],exp.centers[0][1]+v[1]*.055,ease(p))]):result.points;
 const latent=id==='latent-walk'||id==='randomness',walk=exp.gan[0].interpolation,k=clamp(p)*(walk.length-1),i=Math.floor(k),j=Math.min(i+1,walk.length-1),q=k-i;
 return <Surface><defs><clipPath id="field-v2"><rect x={160} y={360} width={610} height={415}/></clipPath></defs><g clipPath="url(#field-v2)">
 {[1,2,3].map(r=><circle key={r} cx={cx} cy={cy} r={r*scale} fill="none" stroke={C.muted} strokeOpacity={.085}/>)}<path d={`M160 ${cy}H765M${cx} 340V800`} stroke={C.muted} strokeOpacity={.18}/>
 {exp.centers.map((c,i)=><g key={i}><circle cx={cx+c[0]*scale} cy={cy-c[1]*scale} r={.36*scale} fill={C.cyan} fillOpacity={.045} stroke={C.cyan} strokeOpacity={.35}/><T x={cx+c[0]*scale} y={cy-c[1]*scale-30} size={20} anchor="middle">{i+1}</T></g>)}
 {kind==='gan'&&(()=>{const rows=exp.gan[0].snapshots,z=progress*(rows.length-1),i=Math.floor(z),j=Math.min(i+1,rows.length-1),q=ease(z-i);return rows[i].discriminator.map((v,k)=>{const value=mix(v,rows[j].discriminator[k],q);return <rect key={k} x={cx+(Math.floor(k/25)/24*6-3)*scale-11} y={cy-(k%25/24*6-3)*scale-11} width={22.5} height={22.5} fill={C.cyan} opacity={value*.17}/>})})()}
 <Scatter points={exp.target} cx={cx} cy={cy} scale={scale} color={C.cyan} opacity={.24}/>
 {!latent&&<Scatter points={points} cx={cx} cy={cy} scale={scale} color={kind==='target'&&id!=='collapse'?C.cyan:C.gold} n={id==='distribution'?Math.round(24+360*ease(p)):384}/>}
 {kind!=='target'&&result.points.slice(0,18).map((v,i)=>{const prev=sample(kind,Math.max(0,progress-.018)).points[i];return <path key={i} d={`M${cx+prev[0]*scale} ${cy-prev[1]*scale}L${cx+v[0]*scale} ${cy-v[1]*scale}`} stroke={C.gold} strokeOpacity={.3}/>})}
 {latent&&<><polyline points={walk.map(v=>`${cx+v[0]*scale},${cy-v[1]*scale}`).join(' ')} stroke={C.gold} fill="none" strokeWidth={2.5}/><circle cx={cx+mix(walk[i][0],walk[j][0],q)*scale} cy={cy-mix(walk[i][1],walk[j][1],q)*scale} r={8} fill={C.white}/></>}
 </g><Head>{latent?'同一生成器 · 输入连续改变':id==='collapse'?'多样性丢失 · 单独的机制示意':kind==='gan'?'固定随机输入 · 模型逐次更新':kind==='ddpm'?'实际反向计算 · 同一批点':'八个有效区域 · 一片可能性'}</Head>
 <T x={812} y={418} size={30} color={C.gold}>{kind==='gan'?`${result.step} / 6000 步`:kind==='ddpm'?`t = ${result.step}`:latent?'沿潜变量的一条路':id==='collapse'?'合理，也要多样':'生成的两道关'}</T>
 {(id==='sampling-step'?['当前样本与时间步','计算预测与均值','按方差加入随机项','t = 0 不再加噪']:latent?[`z₁ = ${mix(-1.2,1,p).toFixed(2)}`,`z₂ = ${mix(.4,-.8,p).toFixed(2)}`,`G(z) = (${mix(walk[i][0],walk[j][0],q).toFixed(2)}, ${mix(walk[i][1],walk[j][1],q).toFixed(2)})`]:['落在区域附近','不同区域都覆盖','检查一整批样本']).map((s,i)=><g key={i}><circle cx={824} cy={478+i*79} r={5} fill={i<=stage?C.gold:C.muted}/><T x={845} y={487+i*79} size={25}>{s}</T></g>)}
 <Bar x={812} y={755} w={280} value={p} label={kind==='gan'?'训练推进':kind==='ddpm'?'采样推进':'观察路径'} display={`${Math.round(p*100)}%`}/>
 <Footer>{kind==='target'?'有效区域里的结构，与多种合理的可能性':kind==='gan'?'金点：实际输出 · 青色底纹：D 的实际判断场 · seed 12 / 25 / 2003':'本章实跑 · seed 12 / 25 / 2003 · 保存状态之间平滑插值'}</Footer></Surface>
}
function Metrics(props:Props){
 const {beat}=props,{stage,phase,p}=timing(props),ddpm=beat.id==='ddpm-results',rows=ddpm?exp.ddpm:exp.gan;
 const v=ease((stage+phase)/1.45),max=Math.max(...rows.flatMap(r=>r.metrics.mode_counts)),mean=rows.reduce((s,r)=>s+r.metrics.near_mode_fraction,0)/3;
 return <Surface><Head>每组 2048 个点 · 三个独立种子</Head><path d="M145 725H1120" stroke={C.muted} strokeOpacity={.35}/>
 {rows.map((r,j)=>r.metrics.mode_counts.map((n,i)=>{const h=n/max*310*v;return <g key={`${j}-${i}`}><rect x={163+i*120+j*27} y={725-h} width={21} height={h} rx={3} fill={[C.gold,C.cyan,C.white][j]}/>{j===0&&<T x={200+i*120} y={765} anchor="middle" size={24}>{`区域${i+1}`}</T>}</g>}))}
 {rows.map((r,i)=><g key={r.seed}><circle cx={190+i*303} cy={382} r={5} fill={[C.gold,C.cyan,C.white][i]}/><T x={208+i*303} y={391} size={25}>{r.seed} · 近邻 {(r.metrics.near_mode_fraction*100).toFixed(1)}%</T></g>)}
 <Footer>平均近邻 {(mean*100).toFixed(1)}% · 三次均覆盖 8 / 8 · 当前任务和参数下的结果</Footer></Surface>
}
function Flow(props:Props){
 const {beat,frame}=props,{stage,phase,p}=timing(props),id=beat.id;
 const updateD=id==='d-update',updateG=id==='g-update',on=stage+phase;
 const nodes=[[200,515,'z','随机输入'],[450,515,'G','生成器'],[700,515,'G(z)','候选'],[1000,515,'D','判别器']] as const;
 const flow=clamp((frame%210)/210),back=ease(phase),result=sample('gan',p);
 return <Surface><Head>{updateD?'让检查者学会区分来源':updateG?'固定尺子，修改作品':'输出可计算，反馈才有方向'}</Head>
 <Line d="M245 515H385M515 515H635M765 515H935" color={C.muted}/>
 <Line d="M1000 423V460" color={C.cyan} p={ease(on/1.2)}/>
 {nodes.map(([x,y,label,sub],i)=><g key={label}><rect x={x-55} y={y-50} width={110} height={100} rx={20} fill={(i===3?C.cyan:C.gold)+'0c'} stroke={i===3?C.cyan:C.gold} strokeWidth={i===1&&updateG||i===3&&updateD?3:1.5} strokeOpacity={.7}/><T x={x} y={y+11} size={34} anchor="middle" color={i===3?C.cyan:C.white}>{label}</T><T x={x} y={y+98} size={28} anchor="middle">{sub}</T></g>)}
 <T x={1000} y={391} size={27} anchor="middle" color={C.cyan}>真实数据</T><Signal from={[252,515]} to={[929,515]} p={flow}/>
 <Line d="M1000 569V695H450V569" color={updateD?C.muted:C.gold} p={ease(on/1.8)}/>
 <T x={710} y={740} size={29} anchor="middle" color={C.gold}>{updateD?'只更新 D · 返回 G 的梯度断开':updateG?'梯度经过 D · 最后更新 G':'通过计算图，把反馈传回参数'}</T>
 {(updateG||id==='generator')&&<Signal from={[996,695]} to={[450,695]} p={back}/>}
 {updateD&&<><Line d="M1000 578Q1130 600 1090 672Q1060 725 1000 691" color={C.cyan} p={ease(phase*2)}/><path d="M645 682L672 709M672 682L645 709" stroke={C.gold} strokeWidth={3}/></>}
 <g transform="translate(0 -15)">{Array.from({length:6},(_,i)=>{const v=Math.sin((i+2)*17)*.5+.5;return <rect key={i} x={160+i*15} y={447-v*32} width={9} height={v*32} fill={C.gold} opacity={.5+.35*ease(phase)}/>})}</g>
 <Footer>{updateD?'detach 切断梯度，样本仍然送入判别器':updateG?'固定参数 ≠ 切断计算':'反馈沿计算图回到参数，下一段用保存的训练结果把变化画出来'}</Footer></Surface>
}
function Loss(props:Props){const {p}=timing(props);const rows=exp.gan[0].history,max=Math.max(...rows.flatMap(r=>[r.g_loss,r.d_loss]));return <Surface>
 <T x={125} y={369} size={35} color={C.cyan}>Lᴅ = −E[log D(x)] − E[log(1−D(G(z)))]</T><T x={125} y={430} size={35} color={C.gold}>Lɢ = −E[log D(G(z))]</T>
 <Curves values={rows.map(r=>r.d_loss)} p={p} color={C.cyan} maxValue={max}/><Curves values={rows.map(r=>r.g_loss)} p={p} maxValue={max}/>
 <Footer>真实训练损失 · 双方的目标都在变，曲线不是美学评分</Footer></Surface>}
function Noise(props:Props){const {beat}=props,{stage,phase,p}=timing(props);const q=ease(clamp((stage+phase)/2.3)),k=q*40,a=Math.floor(k),b=Math.min(a+1,40),v=ease(k-a);const signal=mix(noise[a].signal,noise[b].signal,v),n=mix(noise[a].noise,noise[b].noise,v);
 return <><PairImage files={noise.map(n=>n.file)} p={q} x={140} y={376} w={402}/><Surface><Head>{beat.id==='strength'?'保留线索，还是允许更大变化':'同一张完整场景 · 按公式直接加噪'}</Head>
 <Bar x={608} y={470} w={370} value={signal} label="原图信号系数" display={signal.toFixed(2)}/><Bar x={608} y={589} w={370} value={n} color={C.cyan} label="噪声系数" display={n.toFixed(2)}/>
 <T x={608} y={694} size={29} color={C.gold}>{`时间步 ${Math.round(mix(noise[a].t,noise[b].t,v))} / 199`}</T><T x={140} y={790} size={beat.visual==='formula'?35:26} color={beat.visual==='formula'?C.white:C.muted}>{beat.visual==='formula'?'xₜ = √ᾱₜ x₀ + √(1−ᾱₜ) ε':'前向过程把已知噪声加入场景，用来构造训练题'}</T></Surface></>
}
const ganFiles=[0,100,300,600,1000,1500,2000,3000].map(s=>`experiments/digits/gan-${String(s).padStart(4,'0')}.png`);
const ddpmFiles=Array.from({length:41},(_,i)=>`experiments/digits/ddpm-t${String(200-i*5).padStart(3,'0')}.png`);
function Digits(props:Props){const {beat}=props,{stage,phase,p}=timing(props);const ddpm=beat.visual==='digits-ddpm';return <><Surface><Head>{ddpm?'从新的随机起点，逐步形成笔画':'一次输出 784 个像素 · 组成 28 × 28 图像'}</Head>
 <T x={140} y={405} size={28} color={C.cyan}>{ddpm?'初始状态':'真实训练样本'}</T><T x={690} y={405} size={28} color={C.gold}>{ddpm?'实际反向采样':'同一批随机输入的输出'}</T>
 <Line d="M603 576H657" p={ease(phase)} color={C.gold}/><Bar x={140} y={732} w={1000} value={p} label={ddpm?`反向时间步 ${Math.round(200*(1-p))} / 200`:'真实训练快照 · 没有挑出漂亮的个例'}/><Footer>二维数字实验先把生成步骤拆开，踏雪的身份条件随后单独加入</Footer></Surface>
 <Thumb file={ddpm?ddpmFiles[0]:'experiments/digits/training-examples.png'} x={140} y={443} w={460} h={230}/><PairImage files={ddpm?ddpmFiles:ganFiles} p={p} x={690} y={443} w={460} h={230}/></>}
function Prediction(props:Props){const {beat}=props,{stage,phase,p}=timing(props);const q=clamp(p)*2,a=Math.floor(q),b=Math.min(2,a+1),v=ease(q-a);const types=beat.id==='why-noise'?['noisy','predicted-noise','estimate']:['noisy','predicted-noise','true-noise'];const labels=beat.id==='why-noise'?['当前带噪图','噪声预测','单步 x₀ 估计']:['带噪输入','网络预测','已知噪声'];return <>
 <Surface><Head>{beat.id==='why-noise'?'预测不是终点，它参与下一步计算':'同一验证样本 · 模型实际输出'}</Head>{types.map((t,i)=><g key={t}><T x={145+i*344} y={713} size={29} color={i===1?C.gold:C.muted}>{labels[i]}</T>{i<2&&<Line d={`M${414+i*344} 559H${458+i*344}`} p={ease(stage+phase-i*.25)}/>}</g>)}<Bar x={145} y={790} w={605} value={1-p} label={`时间步 ${Math.round(mix(prediction[a].t,prediction[b].t,v))} · 改变噪声难度`}/><T x={798} y={794} size={26} color={C.gold}>MSE {mix(prediction[a].mse,prediction[b].mse,v).toFixed(4)}</T></Surface>
 {types.map((t,i)=><PairImage key={t} files={prediction.map(r=>`experiments/prediction/${r.t}-${t}.png`)} p={p} x={145+i*344} y={418} w={258}/>)}
 </>}
function Training(props:Props){const {stage,phase,p}=timing(props);const nodes=[['x₀','干净数据'],['xₜ','随机加噪'],['εθ','网络预测'],['ε','比较答案'],['θ','更新参数']];return <Surface><Head>把已知噪声当答案，练习不同难度</Head>
 <Line d="M200 492H1080" color={C.muted}/>{nodes.map(([a,b],i)=><g key={a}><circle cx={200+i*210} cy={492} r={48} fill={i%2?C.cyan+'14':C.gold+'14'} stroke={i%2?C.cyan:C.gold}/><T x={200+i*210} y={505} size={33} anchor="middle" color={C.white}>{a}</T><T x={200+i*210} y={588} size={26} anchor="middle">{b}</T></g>)}<Signal from={[200,492]} to={[1040,492]} p={phase}/>
 <Curves values={exp.ddpm[0].history.map(r=>r.noise_mse)} x={145} y={650} w={970} h={136} p={p} color={C.cyan}/><Footer>下方为真实噪声预测误差 · 样本和时间步随机抽取</Footer></Surface>}
function Code(props:Props){const {beat}=props,{stage,phase,p}=timing(props),ddpm=beat.id==='diffusion-code';const lines=ddpm?['t = randint(0, T, (batch,))','noisy, eps = add_noise(clean, t)','pred = net(noisy, t)','loss = mean((pred - eps) ** 2)','loss.backward(); optim.step()']:['fake = g(z)','loss_d = bce(d(real), ones)','loss_d += bce(d(fake.detach()), zeros)','loss_d.backward(); opt_d.step()','loss_g = bce(d(g(z)), ones)','loss_g.backward(); opt_g.step()'];
 const a=ddpm?(stage===0?clamp(phase)*4:stage===1?1.5:4):(stage===0?phase*3:stage===1?3+phase*2:5);const active=Math.min(lines.length-1,Math.floor(a));return <>
 <div style={{position:'absolute',left:125,top:389,width:780}}><div style={{position:'absolute',left:-13,top:a*56-4,width:766,height:52,background:'linear-gradient(90deg,#d9bb8e12,transparent)',borderLeft:'2px solid #d9bb8e'}}/>{lines.map((l,i)=><div key={l} style={{position:'relative',fontFamily:'Consolas',fontSize:30,lineHeight:'56px',color:i===active?C.white:C.muted,opacity:i===active?1:.65}}>{l}</div>)}</div>
 {ddpm?<><PairImage files={prediction.map(r=>`experiments/prediction/${r.t}-noisy.png`)} p={p} x={930} y={407} w={190}/><PairImage files={prediction.map(r=>`experiments/prediction/${r.t}-predicted-noise.png`)} p={p} x={1160} y={407} w={190}/><PairImage files={prediction.map(r=>`experiments/prediction/${r.t}-true-noise.png`)} p={p} x={1390} y={407} w={190}/></>:<PairImage files={ganFiles} p={p} x={958} y={448} w={662} h={331}/>}
 <Surface><Head>{ddpm?'训练：构造题目 → 预测 → 比较 → 更新':'训练：先更新检查者，再更新生成器'}</Head>{ddpm&&['带噪输入','预测噪声','已知答案'].map((s,i)=><T key={s} x={930+i*230} y={647} size={28}>{s}</T>)}<Footer>{ddpm?'右侧是验证样本的输入、预测与误差，完整代码随资料提供':'右侧来自此训练脚本保存的模型 · 固定一批随机输入'}</Footer></Surface></>
}
function Unet(props:Props){const {stage,phase,p}=timing(props);const xs=[155,370,580,790,1000],ys=[422,481,543,481,422],names=['d1','d2','mid','up','out'];const progress=clamp((stage+phase)/2.6)*4;
 return <><Surface><Head>缩小空间，组合整体，再接回细节</Head><Line d="M225 481L440 540L650 602L860 540L1070 481" color={C.muted}/><Line d="M225 417V408H860V461" color={C.cyan} p={ease(stage+phase-.8)}/><T x={533} y={398} size={25} anchor="middle" color={C.cyan}>跳跃连接 · 保留较早的高分辨率特征</T>
 {names.map((name,i)=>{const f=features.find(r=>r.name===name)!;return <g key={name}><rect x={xs[i]-9} y={ys[i]-9} width={156} height={156} rx={4} fill="none" stroke={C.gold} strokeWidth={Math.abs(progress-i)<.8?2:1} strokeOpacity={Math.abs(progress-i)<.8?.85:.15}/><T x={xs[i]+70} y={ys[i]+180} size={25} anchor="middle">{f.shape.slice(1).join(' × ')}</T><T x={xs[i]+70} y={ys[i]+218} size={25} anchor="middle" color={C.gold}>{['高分辨率','下采样后','中间层','上采样融合','噪声预测'][i]}</T></g>})}<Footer>同一验证输入的真实激活 · 展示第 0 通道，各图独立归一化</Footer></Surface>
 {names.map((name,i)=><Thumb key={name} file={features.find(r=>r.name===name)!.maps[0].file} x={xs[i]} y={ys[i]} w={138}/>)}
 </>
}
function Intro(props:Props){const {beat}=props,{stage,phase,p,clip}=timing(props);const id=beat.id,first=id==='pearl-intro';const question=first&&stage===0&&(clip?.text.includes('计算机')??false);const title=first?['你好，踏雪。','一张没有拍过的新照片','从识别，到创造'][question?1:Math.min(stage,2)]:id==='gan-pearl'?'会画小狗，还要像踏雪':id==='return-pearl'?'让新画面，经得起检查':id==='farewell'?'把问题带回你的电脑':'踏雪，有自己的样子';return <>
 <div style={{position:'absolute',left:125,top:378,width:1000,fontFamily:'NotoSerifSC',fontSize:first&&stage===0?86:57,color:C.white,lineHeight:1.5}}>{title}</div>
 <Surface><Line d="M130 554H1100" color={C.gold} p={ease((p+.05)*3)}/>
 {(first&&stage===0?['棕色眼睛','白色胸口','额头白色火焰纹']:id==='pearl-identity'?['体型与比例','眼睛与黑白毛色','白胸和面纹']:['生成规律','身份条件','检查结果']).map((s,i)=><g key={s} opacity={.55+.45*ease((stage+phase)*1.5-i*.35)}><circle cx={153+i*323} cy={617} r={6} fill={i===1?C.cyan:C.gold}/><T x={177+i*323} y={627} size={30}>{s}</T></g>)}
 <T x={130} y={750} size={34} color={C.gold}>{first?'GAN · 对抗反馈     Diffusion · 逐步去噪':id==='farewell'?'代码 / 参数 / 论文 / 保存的真实结果':'同一个角色，在新的空间里'}</T>
 <Footer>小狗踏雪 · 原始形象与场景编辑</Footer></Surface></>}
function Mission(props:Props){const {beat}=props,{stage,phase,p}=timing(props);const expMode=beat.id==='experiments';return <><Surface><Head>{expMode?'先缩小任务，再把方法带回真实画面':'生成结构 → 提供条件 → 检查是否完成'}</Head>
 <Line d="M250 526C430 385 608 665 780 526S991 435 1110 526" color={C.gold} p={ease(p*1.5)}/>
 {[270,660,1030].map((x,i)=><g key={i}><circle cx={x} cy={528} r={i===stage?94:86} fill={C.ink} fillOpacity={.8} stroke={i===stage?C.gold:C.cyan} strokeOpacity={.45}/><T x={x} y={687} size={31} anchor="middle" color={i===stage?C.gold:C.muted}>{(expMode?['八团点','手写数字','踏雪的场景']:['学会分布','指定对象','完成任务'])[i]}</T><T x={x} y={738} size={24} anchor="middle">{(expMode?['覆盖与准确','真实训练与采样','身份与时间一致性']:['合理而且多样','参考图与文字','逐项检查结果'])[i]}</T></g>)}
 <Scatter points={exp.target} cx={270} cy={528} scale={24} n={112} color={C.cyan}/><Footer>教学小模型负责拆过程 · 现成大模型负责角色场景应用</Footer></Surface>
 <Thumb file="experiments/digits/ddpm-t000.png" x={585} y={490} w={150} h={75}/><Thumb file="character/v15/canonical.png" x={965} y={463} w={130}/></>}
function Randomness(props:Props){const {stage,phase,p}=timing(props);const reach=ease(stage+phase-.7);return <><Surface><Head>随机数提供变化，网络学来的参数提供结构</Head>
 {Array.from({length:400},(_,i)=>{const v=Math.sin(i*127.1+91.7)*43758.5453,r=v-Math.floor(v);const at=(k:number)=>{const z=Math.sin(i*127.1+91.7+k)*43758.5453;return z-Math.floor(z)};const k=Math.floor(p*5);const color=Math.round(35+mix(at(k),at(k+1),ease((p*5)%1))*200);return <rect key={i} x={148+i%20*12} y={433+Math.floor(i/20)*12} width={12.2} height={12.2} fill={`rgb(${color},${color},${color})`}/>})}
 <Line d="M416 553H569M730 553H869" color={C.gold} p={reach}/><rect x={580} y={486} width={137} height={134} rx={23} fill={C.gold+'10'} stroke={C.gold}/><T x={648} y={542} anchor="middle" size={30} color={C.gold}>已训练</T><T x={648} y={586} anchor="middle" size={30}>生成器</T><Signal from={[420,553]} to={[867,553]} p={phase}/>
 <T x={147} y={735} size={29}>随机填像素：没有结构</T><T x={850} y={735} size={29} color={C.gold}>本章网络的真实输出</T><Footer>左侧为固定随机像素示意 · 右侧为 MNIST 模型的整批样本</Footer></Surface>
 <Thumb file={ganFiles[ganFiles.length-1]} x={858} y={487} w={306} h={153}/></>}
function Conditional(props:Props){const {beat,frame}=props,{stage,phase,p}=timing(props);const id=beat.id;
 if(id==='guidance'){
  const w=mix(.5,3.0,ease(p)),base=[205,720],u=[530,655],c=[575,575];const end=[u[0]+w*(c[0]-u[0]),u[1]+w*(c[1]-u[1])];
  return <Surface><Head>两个预测方向，共同决定更新</Head><Line d={`M${base}L${u}`} color={C.muted}/><Line d={`M${base}L${c}`} color={C.cyan}/><Line d={`M${base}L${end}`} color={C.gold} width={4}/><circle cx={end[0]} cy={end[1]} r={8} fill={C.gold}/><T x={565} y={699} size={27}>无条件预测</T><T x={620} y={578} size={27} color={C.cyan}>有条件预测</T><T x={832} y={398} size={30} color={C.gold}>w = {w.toFixed(1)}</T><Bar x={825} y={479} w={260} value={(w-.5)/2.5} label="引导强度 · 示意"/><T x={825} y={625} size={27}>更强，不一定更自然</T><T x={145} y={788} size={31}>ε̂ = ε无条件 + w · (ε有条件 − ε无条件)</T><Footer>方向组合的机制示意 · 用向量合成说明引导强度怎样改变更新方向</Footer></Surface>
 }
 if(id==='latent-diffusion')return <Surface><Head>在更小的表示里工作，最后还原像素</Head>{[[240,510,155,'像素'],[560,510,74,'潜空间'],[990,510,155,'像素']].map(([x,y,w,s],i)=><g key={i}><rect x={Number(x)-Number(w)/2} y={Number(y)-Number(w)/2} width={Number(w)} height={Number(w)} fill={i===1?C.gold+'12':C.cyan+'12'} stroke={i===1?C.gold:C.cyan}/>{Array.from({length:6},(_,j)=><path key={j} d={`M${Number(x)-Number(w)/2+j*Number(w)/5} ${Number(y)-Number(w)/2}V${Number(y)+Number(w)/2}`} stroke={C.muted} strokeOpacity={.2}/>)}<T x={Number(x)} y={659} anchor="middle" size={30}>{s}</T></g>)}<Line d="M330 510H504M606 510H901"/><Signal from={[330,510]} to={[899,510]} p={phase}/><T x={370} y={453} size={27}>编码</T><T x={740} y={453} size={27}>解码</T><Line d="M540 552Q470 690 610 695Q734 683 590 555" color={C.gold} p={ease(stage+phase-.5)}/><T x={455} y={757} size={30} color={C.gold}>在潜空间逐步去噪</T><Footer>结构示意 · 压缩与解码都有能力边界</Footer></Surface>;
 const labels=id==='editing'?['参考图片','修改指令','新的场景']:id==='conditioning'?['参考 / 姿态','类别 / 文字','条件生成']:['相邻帧','共同约束','连续动作'];
 return <><Surface><Head>{id==='video'?'画面要合理，前后还得接得上':id==='editing'?'想改变的：场景 · 想留下的：踏雪':'把“想画什么”，变成额外输入'}</Head>
 <Line d="M410 483C550 483 545 575 660 575M410 713C550 713 545 575 660 575M790 575H1100" color={C.muted}/>
 <rect x={655} y={509} width={138} height={132} rx={23} fill={C.gold+'0b'} stroke={C.gold}/><T x={724} y={565} size={32} anchor="middle" color={C.gold}>{id==='video'?'时间':'条件'}</T><T x={724} y={610} size={29} anchor="middle">生成</T>
 <T x={165} y={438} size={29} color={C.cyan}>{labels[0]}</T><T x={165} y={751} size={29} color={C.cyan}>{labels[1]}</T><T x={911} y={692} size={29} color={C.gold}>{labels[2]}</T>
 <Signal from={[409,483]} to={[655,575]} p={phase} color={C.cyan}/><Signal from={[790,575]} to={[1120,575]} p={phase}/><Footer>{id==='video'?'右侧为本次生成视频 · 动作与身份需要一起检查':'参考图与文字一起进入生成，右侧展示条件变化后的画面'}</Footer></Surface>
 <Thumb file="character/v15/canonical.png" x={164} y={460} w={214}/><div style={{position:'absolute',left:170,top:680,fontSize:27,color:C.white}}>{id==='video'?'镜头 · 白爪 · 身体':id==='editing'?'“换到深色实验室”':'“踏雪，站在光里”'}</div></>
}
function Compare(props:Props){const {beat}=props,{stage,phase,p}=timing(props);const compare=beat.id==='comparison';return <Surface><Head>{compare?'同一个目标，两条不同的路径':'训练时有答案，生成时只有新的起点'}</Head>
 {[0,1].map(row=>{const labels=compare?(row?['噪声','多步网络调用','样本']:['随机输入','生成器一次前向','样本']):(row?['新噪声','已训练网络','生成样本']:['干净样本','已知加噪 / 比较','更新参数']);return <g key={row}><T x={143} y={430+row*230} size={32} color={row?C.cyan:C.gold}>{compare?(row?'Diffusion':'GAN'):(row?'生成':'训练')}</T><Line d={`M315 ${454+row*230}H1110`} color={C.muted}/>{labels.map((s,i)=><g key={s}><circle cx={350+i*365} cy={454+row*230} r={18} fill={row?C.cyan:C.gold} fillOpacity={.18}/><T x={350+i*365} y={515+row*230} size={27} anchor="middle">{s}</T></g>)}<Signal from={[350,454+row*230]} to={[1080,454+row*230]} p={phase} color={row?C.cyan:C.gold}/></g>})}<Footer>{compare?'学习方式与使用成本不同 · 没有适用于所有任务的单一赢家':'反向采样来自实际计算，不是把加噪录像倒放'}</Footer></Surface>}
function LocalStep(props:Props){const {stage,phase,clip,clipp}=timing(props);const values=[stepData.input,stepData.mean,stepData.output],xlo=Math.min(...values.map(v=>v[0]))-.01,xhi=Math.max(...values.map(v=>v[0]))+.01,ylo=Math.min(...values.map(v=>v[1]))-.015,yhi=Math.max(...values.map(v=>v[1]))+.015;
 const map=(v:number[])=>[180+(v[0]-xlo)/(xhi-xlo)*520,753-(v[1]-ylo)/(yhi-ylo)*347];const [a,b,c]=values.map(map),one=stage>0?1:clip?.text.includes('先计算')?ease(clipp*2):0,two=stage>0?1:clip?.text.includes('先计算')?ease(clipp*2-1):0;const point=two>0?[mix(b[0],c[0],two),mix(b[1],c[1],two)]:[mix(a[0],b[0],one),mix(a[1],b[1],one)];
 return <Surface><Head>把真实一步放大：先到均值，再加入随机项</Head><path d="M164 393V875H730" stroke={C.muted} strokeOpacity={.25} fill="none"/><Line d={`M${a}L${b}`} color={C.gold} p={one} width={3}/><Line d={`M${b}L${c}`} color={C.cyan} p={two} width={3}/>
 {[a,b,c].map((v,i)=><g key={i}><circle cx={v[0]} cy={v[1]} r={8} fill={[C.white,C.gold,C.cyan][i]} opacity={i===0?1:i===1?.25+.75*one:.25+.75*two}/><T x={v[0]+15} y={v[1]-17} size={25} color={[C.white,C.gold,C.cyan][i]}>{['当前样本','更新均值','下一状态'][i]}</T></g>)}<circle cx={point[0]} cy={point[1]} r={13} fill={C.white} opacity={.2}/><circle cx={point[0]} cy={point[1]} r={5} fill={C.white}/>
 <T x={824} y={429} size={32} color={C.gold}>t = 99 · 局部放大</T><T x={824} y={510} size={27}>下一状态 = 均值 + 随机项</T><T x={824} y={584} size={26}>随机项方差 {stepData.variance.toFixed(5)}</T><T x={824} y={670} size={26}>最后一步不再加新噪声</T><Footer>seed 12 模型 · 一次真实更新 · 固定随机项</Footer></Surface>
}
function VideoTime(props:Props){const {p}=timing(props);const files=videoEvidence.ready?videoEvidence.files:['character/v15/canonical.png','character/v15/canonical.png','character/v15/canonical.png'];return <>
 <Surface><Head>同一条生成视频，停在三个真实时刻</Head><Line d="M170 746H1110" color={C.muted}/><Signal from={[170,746]} to={[1110,746]} p={p}/>
 {[1,5,9].map((t,i)=><g key={t}><T x={160+i*344} y={402} size={28} color={C.gold}>{t} 秒</T><T x={160+i*344} y={786} size={27}>{['看镜头与镜头','看白爪与身体','看四肢动作与接地'][i]}</T></g>)}<Footer>{videoEvidence.ready?'生成视频的三个时刻：镜头、白爪与悬浮动作':'等待本次视频的真实截帧 · 此时仅显示角色参考'}</Footer></Surface>
 {files.map((file,i)=><Thumb key={i} file={file} x={160+i*344} y={430} w={281} h={283}/>)}
 </>}
function General(props:Props){const {beat}=props,{stage,phase,p}=timing(props);const id=beat.id;
 if(id==='reverse-not-undo')return <><Surface><Head>倒放已存答案 ≠ 从随机数真正生成</Head><Line d="M400 577C650 577 670 442 915 442M400 577H915M400 577C650 577 670 712 915 712" color={C.gold} p={ease(stage+phase)}/><T x={730} y={790} size={30} color={C.gold}>多个合理的可能结果</T><Footer>分支用来说明多个合理结果如何从同一随机起点展开</Footer></Surface><Thumb file="character/v15/noise-40.jpg" x={150} y={440} w={268}/>{['front','side','lying'].map((name,i)=><Thumb key={name} file={`character/v15/${["canonical","gallery","noise"][i]}.png`} x={920} y={365+i*151} w={187} h={138}/>)}</>;
 if(id==='speed')return <Surface><Head>网络调用次数，是计算成本的一部分</Head>{[0,1].map(row=><g key={row}><T x={140} y={447+row*235} size={34} color={row?C.cyan:C.gold}>{row?'逐步修正':'一次前向'}</T><Line d={`M402 ${427+row*235}H1140`} color={C.muted}/>{Array.from({length:row?10:1},(_,i)=><g key={i}><rect x={425+i*70} y={399+row*235} width={40} height={57} rx={6} fill={row?C.cyan:C.gold} fillOpacity={.1+.5*ease(p*12-i)}/><T x={445+i*70} y={499+row*235} size={23} anchor="middle">{row?i+1:'G'}</T></g>)}</g>)}<Footer>DDIM 等方法改变采样路径 · 不能直接删循环冒充等价计算</Footer></Surface>;
 if(id==='seed')return <Surface><Head>种子记录抽签顺序，不保证作品质量</Head>{[0,1].map(row=><g key={row}><T x={155+row*535} y={417} size={30} color={row?C.cyan:C.gold}>{row?'更换随机种子':'固定种子 · 相同序列'}</T>{Array.from({length:6},(_,i)=>{const x=Math.sin((i+1)*(row?19.8:12.9))*43758,r=x-Math.floor(x),h=220*r*ease(p*7-i);return <g key={i}><rect x={160+row*535+i*66} y={704-h} width={35} height={h} fill={row?C.cyan:C.gold} rx={4}/><T x={160+row*535+i*66} y={754} size={20}>{r.toFixed(2)}</T></g>})}</g>)}<Footer>随机序列示意 · 复现还需要模型、参数、软件与设备条件</Footer></Surface>;
 const labels=id==='evaluation'?['任务符合','结构合理','身份保持','时间连续','多样性']:id==='data'?['数据范围','训练目标','网络能力','来源权限','能力边界']:id==='reproduce'?['运行环境','固定种子','模型参数','保存轨迹','对照结果']:['词语','上下文','图文关系'];
 return <Surface><Head>{id==='next'?'一句话，怎样成为模型的条件？':id==='data'?'训练经验决定能做什么':'让结果可以检查，也可以重新运行'}</Head>
 <Line d="M182 530H1096" color={C.muted}/>{labels.map((s,i)=>{const x=183+i*(900/(labels.length-1)),a=ease((stage+phase)/3*labels.length-i);return <g key={s}><circle cx={x} cy={530} r={45} fill={C.ink} stroke={i%2?C.cyan:C.gold} strokeOpacity={.25}/><circle cx={x} cy={530} r={45} fill="none" stroke={i%2?C.cyan:C.gold} strokeWidth={3} pathLength={1} strokeDasharray="1" strokeDashoffset={1-a} transform={`rotate(-90 ${x} 530)`}/><T x={x} y={541} size={31} anchor="middle" color={C.white}>{i+1}</T><T x={x} y={665} size={28} anchor="middle">{s}</T></g>})}<T x={145} y={774} size={32} color={C.gold}>{id==='data'?'数字模型只练过数字，不会忽然画出踏雪':id==='evaluation'?'先说清目标，再检查具体哪里完成了':id==='reproduce'?'只改一个变量，留下完整的对照':'下一章 · 语言连接万物'}</T></Surface>
}
function OriginalTeachingV6(props:Props){const {beat}=props;const id=beat.id;
 if(id==='randomness')return <Randomness {...props}/>;
 if(id==='video')return <VideoTime {...props}/>;
 if(id==='sampling-step')return <LocalStep {...props}/>;
 if(['pearl','pearl-details'].includes(beat.visual))return <Intro {...props}/>;
 if(beat.visual==='mission')return <Mission {...props}/>;
 if(['distribution','latent','collapse','gan-points','ddpm-points','sampling-step'].includes(beat.visual))return <PointLab {...props}/>;
 if(['gan-flow','gan-update'].includes(beat.visual))return <Flow {...props}/>;
 if(['metrics','metrics-ddpm'].includes(beat.visual))return <Metrics {...props}/>;
 if(beat.visual==='loss')return <Loss {...props}/>;
 if(['noise','formula','schedule','edit-strength'].includes(beat.visual))return <Noise {...props}/>;
 if(['digits-gan','digits-ddpm'].includes(beat.visual))return <Digits {...props}/>;
 if(beat.visual==='denoiser')return <Prediction {...props}/>;
 if(beat.visual==='ddpm-train')return <Training {...props}/>;
 if(['code-gan','code-ddpm'].includes(beat.visual))return <Code {...props}/>;
 if(beat.visual==='unet')return <Unet {...props}/>;
 if(['condition','edit','guidance','video','latent-image'].includes(beat.visual))return <Conditional {...props}/>;
 if(beat.visual==='compare')return <Compare {...props}/>;
 return <General {...props}/>;
}

export {timing,T,Surface,Line,Head,Footer,Bar,Signal,Thumb,PairImage,Curves,sample,Scatter,OriginalTeachingV6};
export function TeachingV15(props:Props){return <UpgradedVisual {...props}/>;}
