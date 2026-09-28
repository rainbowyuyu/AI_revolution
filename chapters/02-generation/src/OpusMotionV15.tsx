import React from 'react';
import {staticFile} from 'remotion';
import {GanLesson} from './opus-v15/GanLesson';
import {DiffusionLesson} from './opus-v15/DiffusionLesson';
import {TemporalLesson} from './opus-v15/TemporalLesson';
import {LatentLesson} from './opus-v15/LatentLesson';
import noise from './noise-v15.json';
import experiments from '../results/distributions-v5.json';
import {GuidanceLesson} from './opus-v15/GuidanceLesson';
/** Opus 5.5 production candidates, retained with original response and request logs.
 * Local integration handles time normalization, safe bounds, asset URLs and fonts. */
export type OpusMotionKindV15='gan-feedback'|'diffusion-field'|'condition-guidance'|'latent-space'|'temporal';
export type OpusMotionPropsV15={kind:OpusMotionKindV15;frame:number;duration:number;stage?:number;variant?:string;idPrefix?:string;progressOverride?:number;clips?:{text:string;from:number;to:number}[]};
export const OpusMotionV15:React.FC<OpusMotionPropsV15>=({kind,frame,duration,variant,idPrefix='opus-v15',progressOverride,clips=[]})=>{
 const p=Math.max(0,Math.min(1,(frame-16)/Math.max(1,duration-64)));
 const smooth=(v:number)=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
 const ramp=(rx:RegExp,to=1,from=0)=>{const c=clips.find(c=>rx.test(c.text));return c?from+(to-from)*smooth((frame-c.from)/Math.max(1,c.to-c.from)):smooth(p);};
 let narrated=smooth(p);
 if(kind==='condition-guidance'){
  const pair=clips.find(c=>/带条件与不带条件/.test(c.text)),strong=clips.find(c=>/调味|旋钮/.test(c.text)),over=clips.find(c=>/过强/.test(c.text));
  narrated=pair&&frame<pair.from?0:strong&&frame<strong.from?ramp(/带条件与不带条件/,1/3):over&&frame<over.from?ramp(/调味|旋钮/,2/3,1/3):ramp(/过强/,1,2/3);
 }else if(kind==='latent-space'){
  const c=clips.find(c=>/潜空间扩散先/.test(c.text));narrated=c?(frame<c.from?.08*smooth(frame/c.from):.08+.92*smooth((frame-c.from)/Math.max(1,c.to-c.from))):smooth(p);
 }else if(kind==='gan-feedback'){
  // This first explanation is still an untrained/early generator. Do not
  // finish an entire training run before the narrator calls it a beginner.
  narrated=smooth(p);
 }
 const progress=Math.max(0,Math.min(1,progressOverride??narrated));
 const k=progress*40,lo=Math.floor(k),hi=Math.min(40,lo+1),q=k-lo,r=q*q*(3-2*q);
 const signal=noise[lo].signal+(noise[hi].signal-noise[lo].signal)*r,amount=noise[lo].noise+(noise[hi].noise-noise[lo].noise)*r;
 const snapshots=experiments.gan[0].snapshots;
 const dataProgress=variant==='generator'?progress/(snapshots.length-1):variant==='g-update'?progress*3/(snapshots.length-1):variant==='d-update'?progress*6/(snapshots.length-1):progress;
 const sk=dataProgress*(snapshots.length-1),si=Math.floor(sk),sj=Math.min(si+1,snapshots.length-1),sq=sk-si;
 const liveSamples=snapshots[si].points.slice(0,150).map((v,i)=>v.map((x,j)=>x+(snapshots[sj].points[i][j]-x)*sq));
 const liveField=snapshots[si].discriminator.map((v,i)=>v+(snapshots[sj].discriminator[i]-v)*sq);
 const samplePoints=variant==='d-update'?snapshots[Math.floor(snapshots.length*.42)].points.slice(0,150):liveSamples;
 const fieldValues=variant==='g-update'?snapshots.at(-1)!.discriminator:liveField;
 const title=kind==='diffusion-field'?'同一张带噪图，来自两部分的逐像素计算':kind==='latent-space'?'压缩图像，在小表示里逐步生成，再解码回来':kind==='temporal'?'同一个动作，如何跨过相邻帧保持连续？':kind==='condition-guidance'?'把条件带来的差别，加到更新方向里':variant==='d-update'?'这一轮固定生成样本，让判别边界接受训练':variant==='g-update'?'固定判别场，让生成样本沿着反馈改善':variant==='discriminator'?'真实与生成样本，进入同一张判断场':'随机输入，怎样变成一个有结构的候选？';
 return <svg width={1920} height={1080} style={{position:'absolute',inset:0}}>
 <defs><clipPath id={idPrefix+'-safe'}><rect x={125} y={382} width={1040} height={440}/></clipPath></defs>
 <text x={125} y={348} fontFamily="NotoSansSC" fontSize={33} fontWeight={550} fill="#d9bb8e">{title}</text>
 <g clipPath={`url(#${idPrefix}-safe)`}><g transform="translate(125 382)">{kind==='temporal'?<TemporalLesson progress={progress} frame={frame} idPrefix={idPrefix} images={[0,1,2,3,4].map(i=>staticFile(`visual-v15/temporal-${i}.jpg`))} imageSrc={staticFile('character/v15/canonical.png')}/>:kind==='diffusion-field'?<DiffusionLesson progress={progress} frame={frame} idPrefix={idPrefix} imageSrc={staticFile('character/v15/canonical.png')} noiseSrc={staticFile('character/v15/epsilon.jpg')} mixedSrc={staticFile(noise[lo].file)} nextMixedSrc={staticFile(noise[hi].file)} mixProgress={r} signalCoefficient={signal} noiseCoefficient={amount}/>:kind==='latent-space'?<LatentLesson progress={progress} frame={frame} idPrefix={idPrefix} imageSrc={staticFile('character/v15/canonical.png')}/>:kind==='condition-guidance'?<GuidanceLesson progress={progress} frame={frame} idPrefix={idPrefix} imageSrc={staticFile('character/v15/canonical.png')}/>:<GanLesson progress={progress} frame={frame} variant={variant} idPrefix={idPrefix} samplePoints={samplePoints} nextSamplePoints={snapshots[sj].points.slice(0,150)} referencePoints={experiments.target.slice(0,180)} fieldValues={fieldValues}/>}</g></g>
 <text x={125} y={846} fontFamily="NotoSansSC" fontSize={25} fill="#b6ccd0">{kind==='diffusion-field'?'固定图像和固定噪声 · 中间图像与系数来自同一份前向计算':kind==='latent-space'?'潜空间结构示意 · 压缩让更多计算发生在较小的表示中':kind==='temporal'?'同一段回头动作的真实截帧 · 毛色、面纹与身体沿时间连续变化':kind==='condition-guidance'?'条件与无条件预测的向量组合 · ε̂ = εᵤ + w(ε𝚌 − εᵤ)':variant==='d-update'?'固定候选点，对照保存的判别场变化 · 更新方向示意':variant==='g-update'?'固定判别场，对照保存的生成输出变化 · 更新方向示意':'金色输出与青色判别场来自保存的训练快照，使用同一套空间坐标'}</text>
 </svg>;
};
