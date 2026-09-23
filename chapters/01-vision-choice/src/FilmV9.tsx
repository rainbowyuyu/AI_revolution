import React from 'react';
import {AbsoluteFill,Audio,Freeze,Img,OffthreadVideo,Sequence,staticFile,useCurrentFrame} from 'remotion';
import config from './timeline-v9.json';
import original from './timeline.json';
import data from './experiments.json';
import mark from './rainbow-mark.json';
import {OpeningV9} from './OpeningV9';
import {Teaching} from './scenes/Teaching';
import {ClassificationIntroV9} from './scenes/ClassificationIntroV9';
import {PaperV7} from './scenes/PaperV7';
import {AlphaV7} from './scenes/AlphaV7';
import {captionLines, captionStyle} from './captionLayout';
const ease=(n:number)=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n)};
type Beat=typeof config.beats[number];
const env=(i:number)=>i<26?'vision':i<44?'control':i<61?'search':'archive';
function oldFrame(b:Beat,f:number){
 const a=b.anchors;for(let i=1;i<a.length;i++)if(f<a[i][0]){const u=Math.max(0,(f-a[i-1][0])/Math.max(1,a[i][0]-a[i-1][0]));return a[i-1][1]+(a[i][1]-a[i-1][1])*u;}return b.oldDuration-1;
}
function Background({name,f,opacity=1}:{name:string;f:number;opacity?:number}){return <AbsoluteFill style={{opacity}}><Img src={staticFile(`media/scene-${name}.png`)} style={{width:1920,height:1080,objectFit:'cover',opacity:.43,transform:`scale(${1.027+.008*Math.sin(f/1400)}) translateX(${Math.sin(f/900)*7}px)`}}/><AbsoluteFill style={{background:'linear-gradient(90deg,#050e16df,#07131bae 62%,#06111b77),radial-gradient(ellipse at 37% 54%,#18364222,transparent 70%)'}}/></AbsoluteFill>}
export function BrandV8({f,closing=false}:{f:number;closing?:boolean}){
 const progress=closing?ease((f-24)/160):1,opacity=closing?ease((f-8)/35)*(1-ease((f-245)/25)):.88;
 const strokes=[{d:'M60 111 L60 56 L96 4 C235 -2 326 63 323 142 C320 195 282 235 257 258 L340 406 L135 406',a:0,b:.58},{d:'M135 406 C46 407 4 330 4 239 C2 160 56 91 123 89 C179 87 220 119 231 158 C208 211 161 242 107 242 C105 305 102 364 128 372 C177 387 202 335 203 305 C205 365 219 398 248 406',a:.17,b:.86},{d:'M96 4 L96 88 M166 91 L166 61 C218 58 254 100 231 158',a:.57,b:.96},{d:'M206 156 A12 12 0 1 1 182 156 A12 12 0 1 1 206 156',a:.83,b:1}];
 return <div style={{position:'absolute',left:closing?960:1608,top:closing?296:70,transform:closing?`translateX(-50%) translateY(${(1-opacity)*8}px)`:undefined,display:'flex',flexDirection:closing?'column':'row',gap:closing?35:10,alignItems:'center',color:'#d4c3a1',opacity}}>
  <svg width={closing?192:40} height={closing?227:48} viewBox={mark.viewBox}>
   <defs><mask id="v7-closing-mask"><rect width={347} height={410} fill="black"/>{strokes.map((s,i)=><path key={i} d={s.d} fill="none" stroke="white" strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1-ease((progress-s.a)/(s.b-s.a))}/>)}<rect width={347} height={410} fill="white" opacity={ease((progress-.94)/.06)}/></mask><linearGradient id="v7-brand-gold" x2=".7" y2="1"><stop stopColor="#efdfbc"/><stop offset=".55" stopColor="#c5b89d"/><stop offset="1" stopColor="#94b9bd"/></linearGradient></defs>
   <path d={mark.path} fill="url(#v7-brand-gold)" fillRule="evenodd" mask={closing?'url(#v7-closing-mask)':undefined}/>
  </svg>
  <div style={{fontFamily:'NotoSerifSC',fontSize:closing?62:30,fontWeight:600,letterSpacing:closing?4:1,opacity:closing?ease((f-164)/40):1}}>rainbow鱼</div>
 </div>;
}
function Scene({b,local,clock,opacity=1}:{b:Beat;local:number;clock:number;opacity?:number}){
 const f=oldFrame(b,local),ob=original.beats[b.index];
 const source=b.index<26?'PyTorch Tutorials · CIFAR-10':b.index<44?'PyTorch Tutorials · Gymnasium':b.index<53?'Google DeepMind · OpenSpiel':'Silver 等 · Nature 2016 / 2017';
 return <AbsoluteFill style={{opacity}}>
  <div style={{position:'absolute',left:112,top:112}}><div style={{fontSize:23,fontWeight:550,letterSpacing:5,color:'#a8bfc3',marginBottom:16}}>{b.section}</div><div style={{fontFamily:'NotoSerifSC',fontSize:b.title.length>19?63:77,fontWeight:600,letterSpacing:3,color:'#f2e8d2',lineHeight:1.3}}>{b.title}</div></div>
  {b.visual==='paper'?<PaperV7 index={b.index} f={local} duration={b.duration}/>:<div style={{position:'absolute',left:120,top:285,width:1640,height:590,transform:`perspective(2400px) rotateY(${Math.sin(clock/1300)*.35}deg)`}}>{[53,54,55,56,58].includes(b.index)?<AlphaV7 index={b.index} f={f} clock={clock}/>:<>{b.index===3?<ClassificationIntroV9 f={local}/>:<Teaching beat={ob} f={f} duration={ob.duration} data={data}/>}</>}</div>}
  <div style={{position:'absolute',left:112,right:100,top:890,textAlign:'right',fontSize:23,color:'#9caeb1',opacity:.9}}>{b.visual==='paper'?'原始论文页面 · 详见随片参考文献':source+'｜'+(b.index>=53?'原理示意':(['tree','mcts','selection','rollout','backup'].includes(b.visual)?'真实棋谱与逐次搜索记录':'真实实验与教学可视化'))}</div>
 </AbsoluteFill>;
}
export function FilmV9({audio=true}:{audio?:boolean}){
 const f=useCurrentFrame(),idx=config.beats.findIndex(b=>f>=b.from&&f<b.to),b=config.beats[Math.max(0,idx)],local=f-b.from;
 const previous=config.beats[Math.max(0,idx-1)];const transition=idx>0?ease(local/22):1;
 const paperChange=b.visual==='paper'||previous.visual==='paper';
 const cap=config.captions.find(c=>f>=c.from&&f<c.to),closing=f>=config.outroFrom;
 const lines=cap?captionLines(cap.text):[];
 const capLayout=captionStyle(lines.length);
 return <AbsoluteFill style={{background:'#050b11',fontFamily:'NotoSansSC'}}>
   {f<config.opening?<Sequence durationInFrames={config.opening}><OpeningV9/></Sequence>:<>
   <Background name={closing?'archive':env(b.index)} f={f}/>
   {f<config.opening+30&&<Sequence from={config.opening} durationInFrames={30}><AbsoluteFill style={{opacity:1-ease((f-config.opening)/30)}}><Freeze frame={149}><OffthreadVideo src={staticFile('media/hero-vision.mp4')} muted style={{width:1920,height:1080,objectFit:'cover'}}/></Freeze><AbsoluteFill style={{background:'linear-gradient(90deg,#040c14d8,#07141d77 58%,#06121d88)'}}/></AbsoluteFill></Sequence>}
   {!closing&&env(previous.index)!==env(b.index)&&transition<1&&<Background name={env(previous.index)} f={f} opacity={1-transition}/>}
   {!closing&&<>
    {transition<1&&<AbsoluteFill style={{clipPath:`inset(0 ${transition*100}% 0 0)`,transform:`translateY(${-transition*4}px)`}}><Scene b={previous} local={previous.duration+local} clock={f}/></AbsoluteFill>}
    <AbsoluteFill style={transition>=1?{}:{clipPath:`inset(0 0 0 ${(1-transition)*100}%)`,transform:`translateY(${(1-transition)*4}px)`}}><Scene b={b} local={local} clock={f}/></AbsoluteFill>
    <BrandV8 f={f}/>
   </>}
   {closing&&<>
    {f<config.outroFrom+30&&<Scene b={config.beats[config.beats.length-1]} local={config.beats[config.beats.length-1].duration+f-config.outroFrom} clock={f} opacity={1-ease((f-config.outroFrom)/30)}/>}
    <BrandV8 f={f-config.outroFrom} closing/>
   </>}
   {cap&&!closing&&<div style={{position:'absolute',left:115,right:115,top:capLayout.top,textAlign:'center',fontSize:capLayout.fontSize,lineHeight:capLayout.lineHeight,color:'#fff2dc',fontWeight:600,textShadow:'0 2px 7px #000,0 0 20px #000'}}>{lines.map((line,i)=><div key={i}>{line}</div>)}</div>}

   <div style={{position:'absolute',inset:'0 0 auto',height:40,background:'#03080d'}}/><div style={{position:'absolute',inset:'auto 0 0',height:38,background:'#03080d'}}/>
  </>}
  {audio&&<Audio src={staticFile('audio/v8/master.wav')}/>}
 </AbsoluteFill>;
}
