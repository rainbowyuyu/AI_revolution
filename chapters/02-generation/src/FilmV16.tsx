import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Img,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import timeline from './timeline-v15.json';
import captions from './captions-v16.json';
import media from './media-v15.json';
import mark from './rainbow-mark.json';
import {TeachingV15,C,ease,Beat} from './TeachingV15';
import {PaperV8} from './PaperV8';
import {FrameVideoV15,sourceFrame} from './FrameVideoV15';

const videoStyle:React.CSSProperties={position:'absolute',inset:0,width:1920,height:1080,objectFit:'cover'};
function Brand({frame,opacity=1}:{frame:number;opacity?:number}){
 return <div style={{position:'absolute',right:87,top:67,display:'flex',alignItems:'center',gap:15,color:C.gold,opacity}}>
 <svg width={49} height={57} viewBox={mark.viewBox}><path d={mark.path} fill={C.gold} fillOpacity={ease((frame-100)/55)*.85} stroke={C.gold} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1-ease(frame/130)} fillRule="evenodd"/></svg>
 <div style={{fontFamily:'NotoSerifSC',fontWeight:700,fontSize:34,letterSpacing:1,opacity:ease((frame-85)/70)}}>rainbow鱼</div></div>;
}
function Closing({frame}:{frame:number}){
 const p=ease(frame/70),draw=ease((frame-24)/146),name=ease((frame-116)/66);
 return <div style={{position:'absolute',left:136,top:295,width:475,opacity:p,transform:`translateY(${(1-p)*12}px) scale(${1.006-.006*p})`,transformOrigin:'left center'}}>
 <div style={{position:'absolute',left:-100,top:45,width:880,height:410,background:'radial-gradient(ellipse,#a88c5014,transparent 65%)',pointerEvents:'none'}}/>
 <div style={{fontSize:26,color:C.gold,letterSpacing:7,marginBottom:24}}>AI 进化史 · 第二章</div>
 <div style={{fontFamily:'NotoSerifSC',fontSize:76,fontWeight:620,letterSpacing:6,lineHeight:1.35}}>从识别<br/>到创造</div>
 <div style={{height:1,width:410,marginTop:29,background:'linear-gradient(90deg,#d9bb8e66,#91cdd11a,transparent)',transform:`scaleX(${ease(frame/100)})`,transformOrigin:'left'}}/>
 <div style={{display:'flex',alignItems:'center',gap:27,marginTop:34,color:C.gold}}>
 <svg width={79} height={93} viewBox={mark.viewBox}><defs><linearGradient id="signature-material" x2=".4" y2="1"><stop stopColor="#efe2c8"/><stop offset="1" stopColor="#a99471"/></linearGradient></defs><path d={mark.path} fill="url(#signature-material)" fillOpacity={ease((frame-150)/65)*.85} stroke="url(#signature-material)" strokeWidth={1.5} pathLength={1} strokeDasharray="1" strokeDashoffset={1-draw} fillRule="evenodd"/></svg>
 <div style={{fontFamily:'NotoSerifSC',fontSize:45,fontWeight:650,letterSpacing:1,opacity:name}}>rainbow鱼</div></div>
 </div>;
}
function Environment({frame}:{frame:number}){
 const shot=media.shots.find(b=>frame>=b.from&&frame<b.from+b.duration)??media.shots.at(-1)!;
 const bridge=media.bridges.find(b=>frame>=b.from&&frame<b.from+b.duration);
 const bf=bridge?frame-bridge.from:0;
 // The bridge is a frame-preserved shot in its own right. Keeping it opaque
 // avoids the ghosted double exposure that appeared when the first/last
 // frames were crossfaded over the source clips.
 const bridgeOpacity=bridge?1:0;
 return <AbsoluteFill style={{background:C.ink}}>
 {shot.ready?<FrameVideoV15 src={shot.video} frame={shot.loop?(frame-shot.from+((shot as typeof shot&{phaseOffset?:number}).phaseOffset??0))%(shot.sourceFrames-1):sourceFrame(frame-shot.from,shot.duration,shot.sourceFrames)} style={videoStyle}/>:<Img src={staticFile(shot.image)} style={videoStyle}/>}
 {bridge?.ready&&bridge.method!=='continuous-source'&&(bridge.method==='procedural-occlusion'?<div style={{position:'absolute',top:-90,bottom:-90,left:1920-(1920+2660)*bf/(bridge.duration-1),width:2660,background:'linear-gradient(90deg,#10232d,#10212b 4%,#07131c 11%,#08141c 83%,#142e3a 95%,#193641)',boxShadow:'-32px 0 65px #050b1199,32px 0 65px #050b1199',filter:'blur(14px)'}}><div style={{position:'absolute',left:82,top:0,bottom:0,width:5,background:'#a6936b',opacity:.11}}/></div>:<div style={{position:'absolute',inset:0,opacity:bridgeOpacity}}><FrameVideoV15 src={bridge.video} frame={bf} style={videoStyle}/></div>)}
 <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(5,11,17,.24),rgba(5,11,17,.10) 55%,transparent 75%),linear-gradient(180deg,rgba(5,11,17,.2),transparent 32%,transparent 72%,rgba(5,11,17,.96) 94%)'}}/>
 </AbsoluteFill>;
}
function shade(b:Beat){
 if(b.visual==='brand')return [.30,.26,.17,.12];
 if(b.id==='pearl-intro')return [.64,.60,.24,.12];
 if(b.visual==='paper'||b.id.includes('code'))return [.83,.79,.68,.48];
 return [.90,.88,.64,.31];
}
function foreground(beat:Beat,frame:number){return beat.visual==='paper'?<PaperV8 beat={beat} frame={frame}/>:beat.visual!=='brand'?<TeachingV15 beat={beat} frame={frame}/>:null;}
export function FilmV16({audio=true,clean=false}:{audio?:boolean;clean?:boolean}){
 const f=useCurrentFrame();const [handle]=useState(()=>delayRender('Load rainbow Chinese fonts'));
 useEffect(()=>{Promise.all([['NotoSerifSC','NotoSerifSC.ttf'],['NotoSansSC','NotoSansSC.ttf']].map(async([family,file])=>{const font=new FontFace(family,`url(${staticFile('fonts/'+file)})`,{weight:'100 900'});await font.load();(document.fonts as unknown as {add:(f:FontFace)=>void}).add(font);})).then(()=>continueRender(handle)).catch(cancelRender)},[handle]);
 const i=timeline.beats.findIndex(b=>f>=b.from&&f<b.from+b.duration),beat=timeline.beats[Math.max(0,i)] as Beat,previous=timeline.beats[Math.max(0,i-1)] as Beat,local=f-beat.from;
 const enter=ease(local/28),caption=captions.find(c=>f>=c.from&&f<c.to);
 const farewell=timeline.beats.find(b=>b.id==='farewell')!;
 const closeStart=farewell.from+farewell.clips.at(-1)!.from-15,closing=ease((f-closeStart)/50);
 const a=shade(previous),b=shade(beat),t=ease(local/45),alpha=a.map((v,j)=>v+(b[j]-v)*t);
 const shot=media.shots.find(s=>f>=s.from&&f<s.from+s.duration)??media.shots.at(-1)!;
 const source=beat.source.replace(/用户提供角色参考|用户原始角色参考|用户提供的参考角色|用户角色参考|用户参考图|用户参考/g,'小狗踏雪');
 const foregroundOpacity=ease(local/18)*ease((beat.duration-1-local)/18);
 return <AbsoluteFill style={{fontFamily:'NotoSansSC',color:C.white,overflow:'hidden'}}>
 <Environment frame={f}/>
 {!clean&&<>
 <AbsoluteFill style={{background:`linear-gradient(90deg,${[0,52,72,100].map((x,j)=>`rgba(0,0,0,${alpha[j]*(1-closing)+[.40,.32,.18,.10][j]*closing}) ${x}%`).join(',')})`}}/>
 <div style={{position:'absolute',inset:0,opacity:1-ease((f-closeStart)/18)}}>
 <div style={{position:'absolute',inset:0,opacity:i===0?ease((beat.duration-1-local)/18):foregroundOpacity,transform:beat.visual==='paper'?'none':`translateY(${(1-ease(local/24))*6}px)`}}>{foreground(beat,local)}</div>
 {beat.visual!=='brand'&&<div style={{position:'absolute',left:118,top:127,width:1500,opacity:enter*ease((beat.duration-1-local)/18)}}>
 <div style={{fontSize:24,color:C.gold,letterSpacing:3,marginBottom:16}}>AI 进化史 · 第二章 / 从识别到创造</div>
 <div style={{fontFamily:'NotoSerifSC',fontSize:beat.title.length>23?55:beat.title.length>18?61:70,fontWeight:650,letterSpacing:2,lineHeight:1.24,textShadow:'0 3px 30px #0006'}}>{beat.title}</div></div>}
 </div>
 {f>=closeStart&&<Closing frame={Math.max(0,f-closeStart-18)}/>}
 <Brand frame={f} opacity={1-closing}/>
 {closing<.99&&beat.visual!=='brand'&&<div style={{position:'absolute',left:125,right:115,top:889,fontSize:23,color:C.muted,opacity:.82*(1-closing),display:'flex',justifyContent:'space-between',gap:35}}><div style={{maxWidth:870}}>来源：{source}</div><div style={{whiteSpace:'nowrap',fontSize:21,maxWidth:655,overflow:'hidden',textOverflow:'ellipsis'}}>{shot.description}</div></div>}
 {caption&&<div style={{position:'absolute',left:125,right:125,top:956,height:65,display:'flex',alignItems:'center',justifyContent:'center',fontSize:caption.text.length>34?37:caption.text.length>29?41:45,fontWeight:550,lineHeight:1.35,textAlign:'center',textShadow:'0 2px 13px #000,0 0 25px #000',whiteSpace:'nowrap'}}>{caption.text}</div>}
 {f>timeline.duration-55&&<AbsoluteFill style={{background:C.ink,opacity:ease((f-timeline.duration+55)/54)}}/>}
 </>}
 {audio&&!timeline.draft&&<Audio src={staticFile('audio/v16/master.wav')}/>}
 </AbsoluteFill>;
}
