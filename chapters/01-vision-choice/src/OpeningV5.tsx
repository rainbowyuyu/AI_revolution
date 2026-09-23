import React from 'react';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Sequence,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import config from './opening-v5.json';
import timeline from './timeline.json';
import data from './experiments.json';
import mark from './rainbow-mark.json';
import {Film} from './Film';
import {Teaching} from './scenes/Teaching';

const sat=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(x:number)=>{x=sat(x);return x*x*(3-2*x)};
const mix=(a:number,b:number,u:number)=>a+(b-a)*u;

// Centerline paths reveal the user's exact vector silhouette through a mask.
// The wide reveal brush avoids replacing the logo with a different outline.
const strokes=[
 {d:'M60 111 L60 56 L96 4 C235 -2 326 63 323 142 C320 195 282 235 257 258 L340 406 L135 406',a:12,b:107},
 {d:'M135 406 C46 407 4 330 4 239 C2 160 56 91 123 89 C179 87 220 119 231 158 C208 211 161 242 107 242 C105 305 102 364 128 372 C177 387 202 335 203 305 C205 365 219 398 248 406',a:49,b:143},
 {d:'M96 4 L96 88 M166 91 L166 61 C218 58 254 100 231 158',a:102,b:154},
 {d:'M206 156 A12 12 0 1 1 182 156 A12 12 0 1 1 206 156',a:140,b:168},
];

export function OpeningV5({overview=false}:{overview?:boolean}){
 const f=useCurrentFrame(),{width}=useVideoConfig();
 const revealAt=config.clips[overview?2:1].start*30;
 const move=smooth((f-revealAt+8)/52),draw=smooth((f-158)/28);
 const name=smooth((f-169)/34);
 const handoff=smooth((f-(config.duration-36))/36);
 const cap=config.captions.find(c=>f>=c.from&&f<c.to);
 const diagram=smooth((f-revealAt-10)/45);
 const taskProgress=sat((f-revealAt)/(config.duration-revealAt))*config.cut/timeline.beats[3].to;
 const layout=smooth((f-(config.duration-90))/54);
 const taskFrame=mix(taskProgress*timeline.beats[3].to,config.cut-config.duration+f,layout);
 const chapterTitle='第一章 · 看见与选择';
 const questions=[{text:'计算机如何看见？',from:0,to:168},{text:'计算机如何控制？',from:168,to:272},{text:'计算机如何选择？',from:272,to:revealAt}];
 return <AbsoluteFill style={{background:'#050b11'}}>
  <div style={{position:'absolute',width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'0 0',fontFamily:'NotoSansSC',overflow:'hidden'}}>
   <AbsoluteFill><Img src={staticFile('media/scene-vision.png')} style={{width:1920,height:1080,objectFit:'cover',opacity:.34,transform:`scale(${1.035+f*.000006}) translateX(${Math.sin(f/900)*8}px)`}}/><AbsoluteFill style={{background:'linear-gradient(90deg,#050e16ef,#07131bb9 62%,#06111b96),radial-gradient(ellipse at 68% 43%,#29404a33,transparent 65%)'}}/></AbsoluteFill>
   {overview&&f<450&&<AbsoluteFill style={{opacity:1-smooth((f-415)/35)}}><OffthreadVideo src={staticFile('media/v6-overview-selected.mp4')} muted style={{width:1920,height:1080,objectFit:'cover'}}/><AbsoluteFill style={{background:'linear-gradient(90deg,#050e16a8,transparent 64%),linear-gradient(0deg,#030a13b0,transparent 25%,transparent 78%,#040b1370)'}}/></AbsoluteFill>}
   <svg width={1920} height={1080} style={{position:'absolute',inset:0,opacity:.16}}>{Array.from({length:34},(_,i)=><circle key={i} cx={(i*317+Math.sin(f/330+i)*24)%1920} cy={(i*193+Math.cos(f/410+i)*16)%1000} r={i%7===0?1.5:.8} fill={i%7===0?'#dec28e':'#89cbd0'}/>)}</svg>
   <div style={{position:'absolute',inset:0,clipPath:handoff>0?`inset(0 ${handoff*100}% 0 0)`:undefined}}>
    <div style={{position:'absolute',left:112,top:overview?mix(70,123,move):123,fontFamily:'NotoSerifSC',fontSize:overview?mix(34,42,move):42,fontWeight:650,letterSpacing:6,color:'#ddc49a',opacity:1-smooth(handoff/.4)}}>{chapterTitle}</div>
    <div style={{position:'absolute',left:112,top:mix(overview?124:264,205,move),color:'#f2e8d2',fontFamily:'NotoSerifSC',fontWeight:600,letterSpacing:3,lineHeight:1.55,opacity:1-smooth(handoff/.4)}}>
     {!overview&&<div style={{fontSize:78,opacity:1-smooth(move/.4),position:'absolute',width:1090,transform:`translateY(${-move*16}px)`}}>计算机如何看见？<br/>又如何学会控制？</div>}
     {overview&&questions.map((q,i)=>{const enter=i===0?1:smooth((f-q.from-3)/12),leave=1-smooth((f-q.to+14)/11);return <div key={q.text} style={{position:'absolute',top:0,fontSize:64,width:1100,opacity:enter*leave,transform:`translateY(${(1-enter)*9-(1-leave)*9}px)`}}>{q.text}</div>})}
     <div style={{fontSize:66,opacity:smooth((move-.48)/.52),transform:`translateY(${(1-move)*20}px)`,whiteSpace:'nowrap'}}>看见、控制，再到选择</div>
    </div>
    {!overview&&<div style={{position:'absolute',left:112,top:575,fontSize:32,color:'#a9bec3',letterSpacing:2,opacity:(1-move)*smooth((f-55)/45)}}>从一张图片，到一次行动。</div>}
    <div style={{position:'absolute',left:120,top:mix(332,285,layout),width:1640,height:mix(530,590,layout),opacity:diagram,transform:`translateY(${(1-diagram)*20}px) perspective(2400px) rotateY(${Math.sin((config.cut-config.duration+f)/1300)*.35*layout}deg)`}}>
     <Teaching beat={timeline.beats[2]} f={taskFrame-timeline.beats[2].from} duration={timeline.beats[2].duration} data={data}/>
    </div>
    <div style={{position:'absolute',left:mix(overview?1010:1380,1608,move),top:mix(overview?65:280,70,move),color:'#d9c6a3'}}>
     <svg width={mix(overview?130:260,40,move)} height={mix(overview?153.6:307.2,48,move)} viewBox={mark.viewBox} style={{display:'block'}}>
      <defs><mask id="brand-path-reveal"><rect width={347} height={410} fill="black"/>{strokes.map((s,i)=><path key={i} d={s.d} fill="none" stroke="white" strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1-smooth((f-s.a)/(s.b-s.a))}/>)}<rect width={347} height={410} fill="white" opacity={draw}/></mask><linearGradient id="brand-metal" x1="0" y1="0" x2=".7" y2="1"><stop stopColor="#f1dfbb"/><stop offset=".56" stopColor="#c7b591"/><stop offset="1" stopColor="#94b5b9"/></linearGradient></defs>
      <path d={mark.path} fill="url(#brand-metal)" fillRule="evenodd" mask="url(#brand-path-reveal)"/>
     </svg>
     <div style={{position:'absolute',left:mix(overview?65:130,50,move),top:mix(overview?168:334,6,move),transform:`translateX(${-50*(1-move)}%) translateY(${(1-name)*7}px)`,fontFamily:'NotoSerifSC',fontSize:mix(overview?32:52,30,move),fontWeight:600,letterSpacing:mix(2,1,move),whiteSpace:'nowrap',opacity:name}}>rainbow鱼</div>
    </div>
    <div style={{position:'absolute',left:112,right:100,top:890,textAlign:'right',fontSize:23,color:'#9caeb1',opacity:diagram*.9*(1-layout)}}>PyTorch Tutorials · Gymnasium · OpenSpiel｜真实实验与原理示意</div>
    {overview&&f<revealAt&&<div style={{position:'absolute',left:112,right:100,top:890,textAlign:'right',fontSize:23,color:'#afbdc0',opacity:.8}}>rainbow鱼 · 原创概念镜头</div>}
    {cap&&<div style={{position:'absolute',left:115,right:115,top:946,textAlign:'center',fontSize:46,lineHeight:1.4,color:'#fff2dc',fontWeight:600,textShadow:'0 2px 7px #000,0 0 20px #000'}}>{cap.text}</div>}
   </div>
   <div style={{position:'absolute',inset:'0 0 auto',height:40,background:'#03080d'}}/><div style={{position:'absolute',inset:'auto 0 0',height:38,background:'#03080d'}}/>
  </div>
  {f>=config.duration-36&&<>
   <AbsoluteFill style={{clipPath:`inset(0 0 0 ${(1-handoff)*100}%)`}}><Sequence from={config.duration-config.cut}><Film audio={false} hideCaptions headerOpacity={0} sourceOpacity={smooth((handoff-.43)/.57)}/></Sequence></AbsoluteFill>
   <div style={{position:'absolute',width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'0 0',opacity:smooth((handoff-.43)/.57)}}><div style={{position:'absolute',left:112,top:112}}><div style={{fontFamily:'NotoSansSC',fontSize:23,fontWeight:550,letterSpacing:5,color:'#a8bfc3',marginBottom:16}}>{timeline.beats[3].section}</div><div style={{fontFamily:'NotoSerifSC',fontSize:77,fontWeight:600,letterSpacing:3,color:'#f2e8d2',lineHeight:1.3}}>{timeline.beats[3].title}</div></div></div>
  </>}
 </AbsoluteFill>;
}

export function FilmV5({audio=true,overview=false}:{audio?:boolean;overview?:boolean}){
 return <AbsoluteFill>
  <Sequence durationInFrames={config.duration}><OpeningV5 overview={overview}/></Sequence>
  <Sequence from={config.duration}><Sequence from={-config.cut}><Film audio={false}/></Sequence></Sequence>
  {audio&&<Audio src={staticFile('audio/v5/master.wav')}/>}
 </AbsoluteFill>;
}
