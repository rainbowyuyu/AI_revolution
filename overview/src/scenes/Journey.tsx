import React from 'react';
import {interpolate} from 'remotion';
import timeline from '../timeline.json';
import {LabVisual} from './LabVisual';
const cl={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const gold='#d9bb8e',ivory='#f8efdc',cyan='#91cdd1',serif='NotoSerifSC,serif';
const hash=(i:number)=>{const n=Math.sin(i*127.1+73.7)*43758.5453;return n-Math.floor(n)};
type Scene=typeof timeline.scenes[number];
const detail=[['CNN · 视觉特征','强化学习 · 搜索与选择'],['GAN · 对抗与反馈','Diffusion · 从噪声到结构'],['Transformer · 大语言模型','图文对齐 · 指令与反馈','文字、图像与声音'],['NeRF · 新视角合成','3DGS · 高斯表示','4DGS · 空间中的时间'],['推理 · 更多计算与验证','Agent · 工具与反馈'],['世界模型 · 预测环境','扩散策略 · 动作生成','VLA · 具身智能']];
const topic:Record<number,[string,string]>={1:['CNN','从像素到特征'],3:['Deep RL','神经网络 × 搜索'],2:['GAN','创造，在反馈中发生'],7:['Diffusion','让噪声，逐步成为结构'],4:['Transformer','让上下文建立联系'],5:['大语言模型','从续写到理解任务'],8:['CLIP','让图像与文字相遇'],9:['指令微调 · RLHF','让反馈塑造协作'],10:['多模态','文字 · 图像 · 声音'],6:['NeRF','学习光线，合成新视角'],11:['3D Gaussian Splatting','用空间高斯表示场景'],16:['4D Gaussian Splatting','让重建的空间拥有时间'],14:['推理模型','为复杂问题投入更多计算'],15:['Agent','调用工具，让结果可验证'],17:['世界模型','预测变化，构建环境'],12:['Diffusion Policy','把生成，变成动作'],13:['VLA','看见 → 听懂 → 动手'],18:['Physical AI','能力走进现实，也接受检验']};
const breaks:Record<string,number[]>={vision:[0,223],generation:[0,300],language:[0,139,287,374,483],space:[0,236,401],reasoning:[0,274],physical:[0,244,355,543]};
export function activeTopic(s:Scene,f:number){const local=f-s.start,b=breaks[s.id]||[0];let k=0;while(k<b.length-1&&local>=b[k+1])k++;return {id:s.episodes[k],since:local-b[k],until:(b[k+1]??s.end-s.start)-local};}
function ChapterGlyph({index,f}:{index:number;f:number}){
 const t=f/30;const progress=(f%150)/150;
 return <svg width="480" height="168" viewBox="0 0 480 168" style={{overflow:'visible'}}>
  <defs><radialGradient id={`overview-glow-${index}`}><stop stopColor="#65b9cc" stopOpacity=".1"/><stop offset="1" stopColor="#65b9cc" stopOpacity="0"/></radialGradient></defs>
  <ellipse cx="240" cy="84" rx="200" ry="90" fill={`url(#overview-glow-${index})`}/>
  {index===0&&<>{[0,1,2].map(k=><g key={k} transform={`translate(${66+k*125},30) skewY(-10)`}>{Array.from({length:25},(_,j)=><rect key={j} x={j%5*17} y={Math.floor(j/5)*17} width="11" height="11" rx="1" fill={j%4?cyan:gold} opacity={.2+.6*Math.sin(t*1.5+j*.4-k)**2}/>)}{k<2&&<path d="M 86 36 H 114" stroke={gold} opacity=".6"/>}</g>)}</>}
  {index===1&&<>{Array.from({length:135},(_,j)=>{const u=hash(j)*6.28,v=hash(j+10)*2-1;const p=.55+.2*Math.sin(t*.8);return <circle key={j} cx={240+Math.cos(u)*Math.sqrt(1-v*v)*105+(hash(j+53)-.5)*170*(1-p)} cy={82+v*62+(hash(j+71)-.5)*55*(1-p)} r={j%7?1.9:3.1} fill={j%7?cyan:gold} opacity=".7"/>})}<ellipse cx="240" cy="82" rx="172" ry="65" fill="none" stroke={gold} opacity=".22" strokeDasharray="2 8" strokeDashoffset={-f*.2}/></>}
  {index===2&&<>{Array.from({length:6},(_,j)=><g key={j}><path d={`M ${72+j*64} 128 Q 240 ${-10+j*10} ${392-j*64} 128`} fill="none" stroke={j%2?cyan:gold} strokeWidth="1.3" opacity={.3+.3*Math.sin(t+j)**2}/><circle cx={72+j*64} cy="128" r="7" fill={j%2?cyan:gold}/></g>)}</>}
  {index===3&&<>{Array.from({length:80},(_,j)=>{const u=hash(j)*6.28,v=hash(j+32)*2-1;return <ellipse key={j} cx={240+Math.cos(u+t*.2)*Math.sqrt(1-v*v)*123} cy={79+v*70} rx="8" ry="3" transform={`rotate(${j*31} 240 79)`} fill={j%6?cyan:gold} opacity=".36"/>})}</>}
  {index===4&&<>{[0,1,2,3].map(j=><g key={j}><circle cx={84+j*100} cy={84+(j%2?20:-20)} r="21" fill="#122a32" stroke={j===3?gold:cyan}/>{j<3&&<path d={`M ${106+j*100} ${84+(j%2?20:-20)} Q ${132+j*100} 83 ${161+j*100} ${84+(j%2?-20:20)}`} stroke={cyan} fill="none" opacity=".6"/>}</g>)}<path d="M 86 112 C 161 183 310 180 383 135" fill="none" stroke={gold} opacity=".35"/><circle cx={85+progress*300} cy={140+Math.sin(progress*Math.PI)*24} r="3" fill={gold}/></>}
  {index===5&&<>{[0,1,2,3,4].map(j=><path key={j} d={`M 70 129 C ${157+j*12} ${-3+j*17} ${272-j*9} ${30+j*9} 405 103`} fill="none" stroke={j===2?gold:cyan} opacity={j===2?.85:.2} strokeWidth={j===2?2:1}/>)}<circle cx={70+progress*335} cy={129-Math.sin(progress*Math.PI)*70-progress*26} r="5" fill={gold}/><path d="M 364 137 H 419 M 389 137 V 107" stroke={cyan} opacity=".7"/></>}
 </svg>;
}
export function Overview({f}:{f:number}){
 const a=interpolate(f,[0,25,558,595],[0,1,1,0],cl);
 return <div style={{position:'absolute',inset:0,opacity:a}}>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 46%,#061119aa,#040910ed)'}}/>
  <div style={{position:'absolute',left:110,right:110,top:132,textAlign:'center',fontFamily:serif,fontSize:64,letterSpacing:5,color:ivory}}>六个章节，理解智能如何发生</div>
  {[0,1].map(group=>{const local=f-group*280;const opacity=group===0?interpolate(f,[15,42,275,300],[0,1,1,0],cl):interpolate(f,[290,320,560,585],[0,1,1,0],cl);return <div key={group} style={{position:'absolute',inset:0,opacity,transform:`translateX(${interpolate(local,[0,35],[22,0],cl)}px)`}}>
   {timeline.chapters.slice(group*3,group*3+3).map((c,j)=>{const i=group*3+j;const reveal=interpolate(local,[j*12+20,j*12+48],[0,1],cl);return <div key={c.id} style={{position:'absolute',left:115+j*581,top:292,width:526,opacity:reveal,transform:`translateY(${(1-reveal)*14}px)`}}>
    <div style={{color:gold,fontSize:27,letterSpacing:5,marginBottom:16}}>0{i+1}<span style={{display:'inline-block',width:68,height:1,background:gold,marginLeft:18,verticalAlign:'middle',opacity:.5}}/></div>
    <div style={{fontFamily:serif,fontSize:51,fontWeight:500,letterSpacing:2,color:ivory,whiteSpace:'nowrap'}}>{c.title}</div>
    <div style={{marginTop:26,marginBottom:22}}><ChapterGlyph index={i} f={f}/></div>
    {detail[i].map(d=><div key={d} style={{fontSize:31,lineHeight:1.85,letterSpacing:.3,color:'#c1d1ce'}}>{d}</div>)}
   </div>})}
  </div>})}
  <svg width="1920" height="1080" style={{position:'absolute',inset:0,pointerEvents:'none'}}>
   <path d="M 322 861 H 1597" stroke={cyan} strokeOpacity=".18"/>
   <path d="M 322 861 H 1597" pathLength="1" stroke={gold} strokeOpacity=".65" strokeDasharray={`${Math.min(1,Math.max(0,(f-30)/505))} 1`}/>
   {['看见','创造','语言','空间','推理','行动'].map((v,i)=><g key={v} opacity={f>280?i>=3?1:.45:i<3?1:.35}><circle cx={322+i*255} cy="861" r="4" fill={gold}/><text x={322+i*255} y="835" textAnchor="middle" fontSize="24" fontFamily="NotoSansSC" fill={ivory}>{v}</text></g>)}
  </svg>
 </div>;
}
export function ChapterType({scene,index,f}:{scene:Scene;index:number;f:number}){
 const {id,since,until}=activeTopic(scene,f),[name,desc]=topic[id];
 const alpha=interpolate(f,[scene.start,scene.start+32,scene.end-25,scene.end],[0,1,1,0],cl);
 const topicAlpha=Math.min(interpolate(since,[0,18],[0,1],cl),interpolate(until,[0,14],[0,1],cl));
 return <div style={{position:'absolute',left:105,top:119,width:910,opacity:alpha,color:ivory}}>
  <div style={{fontSize:28,letterSpacing:7,color:gold,marginBottom:14}}>第{['一','二','三','四','五','六'][index]}章</div>
  <div style={{fontFamily:serif,fontSize:76,fontWeight:500,lineHeight:1.4,letterSpacing:4,textShadow:'0 2px 22px #0007'}}>{scene.title}</div>
  <div style={{marginTop:42,opacity:topicAlpha,transform:`translateY(${(1-topicAlpha)*8}px)`}}><div style={{fontFamily:name.includes('Gaussian')?'NotoSansSC':serif,fontSize:name.length>20?44:57,letterSpacing:1.4,lineHeight:1.35,color:'#ebddc4'}}>{name}</div><div style={{fontSize:32,lineHeight:1.5,letterSpacing:2,marginTop:13,color:'#b6ccd0'}}>{desc}</div></div>
 </div>;
}
// Geometry follows the narrated topic; the full-frame environment remains continuous.
export function Teaching({scene,f}:{scene:Scene;f:number}){
 const {id,since,until}=activeTopic(scene,f);
 const a=scene.id==='physical'?Math.min(interpolate(f-scene.start,[18,39],[0,1],cl),interpolate(scene.end-f,[0,18],[0,1],cl)):Math.min(interpolate(since,[18,39],[0,1],cl),interpolate(until,[0,18],[0,1],cl));
 const cinematicScale=[15,17,12,13,18].includes(id)?1:1.07;
 return <div style={{position:'absolute',left:92,top:464,opacity:a,transform:`translateY(${(1-a)*7}px) scale(${cinematicScale})`,transformOrigin:'left top'}}><LabVisual id={id} f={since} sceneFrame={f-scene.start}/></div>;
}
