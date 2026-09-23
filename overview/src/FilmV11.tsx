import React from 'react';
import {AbsoluteFill,Audio,OffthreadVideo,Sequence,staticFile,useCurrentFrame} from 'remotion';
import {Film} from './Film';
import {Overview} from './scenes/Journey';
import {Continuum} from './scenes/Continuum';
import {LiteratureOverviewV11} from './scenes/LiteratureOverviewV11';
import mark from './rainbow-mark.json';
import config from './timeline-v11.json';
import captions from './captions-v11.json';
const ease=(n:number)=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n)};

function IntroV11({f}:{f:number}){
 const enter=ease((f-8)/42),mapIn=ease((f-config.overviewFrom+28)/55);
 const second=config.overviewSecond;
 const mapFrame=f<second?Math.max(0,(f-config.overviewFrom)/(second-config.overviewFrom)*285):300+(f-second)/(config.opening-second)*295;
 const question=ease((f-config.questionsFrom)/36);
 return <AbsoluteFill>
  <Continuum f={f}/>
  <Sequence from={0} durationInFrames={352}>
   <OffthreadVideo src={staticFile('media/v11-intro-smooth.mp4')} muted style={{width:1920,height:1080,objectFit:'cover',opacity:1-mapIn}}/>
  </Sequence>
  <Sequence from={326} durationInFrames={config.overviewFrom+30-326}><AbsoluteFill style={{opacity:ease((f-326)/26)*(1-mapIn)}}><OffthreadVideo src={staticFile('media/v4-world.mp4')} muted style={{width:1920,height:1080,objectFit:'cover'}}/></AbsoluteFill></Sequence>
  <Sequence from={368} durationInFrames={config.overviewFrom+30-368}><AbsoluteFill style={{opacity:ease((f-368)/32)*(1-mapIn)}}><OffthreadVideo src={staticFile('media/v4-robot.mp4')} muted style={{width:1920,height:1080,objectFit:'cover'}}/></AbsoluteFill></Sequence>
  <AbsoluteFill style={{background:'linear-gradient(90deg,#040c16dd,#06121c6b 60%,#07131c25),linear-gradient(0deg,#040b13e8,transparent 33%,transparent 74%,#050b1360)'}}/>
  <svg width={1920} height={1080} style={{position:'absolute',inset:0,opacity:.20}}>
   <path d={`M 120 800 C 560 ${780-f*.03} 1120 440 1810 420`} stroke="#91cdd1" strokeWidth={1} fill="none"/>
   {Array.from({length:18},(_,i)=><circle key={i} cx={120+i*96+Math.sin(f/180+i)*8} cy={810-i*22+Math.cos(f/150+i)*10} r={i%4===0?2.3:1.1} fill={i%4===0?'#dcc396':'#91cdd1'}/>)}
  </svg>
  <div style={{position:'absolute',left:122,top:125,opacity:enter*(1-mapIn),transform:`translateY(${(1-enter)*12}px)`,width:1010}}>
   <div style={{display:'flex',alignItems:'center',gap:12,color:'#d8c5a4',marginBottom:40}}><svg width={38} height={45} viewBox={mark.viewBox}><path d={mark.path} fill="#d8c5a4" fillRule="evenodd"/></svg><div style={{fontFamily:'NotoSerifSC',fontSize:30,fontWeight:600,letterSpacing:2}}>rainbow鱼</div></div>
   <div style={{fontFamily:'NotoSerifSC',fontSize:99,fontWeight:600,lineHeight:1.45,letterSpacing:5,color:'#f4e8ce'}}>把 AI 的历史<br/>拆开，看清楚</div>
   <div style={{fontSize:31,color:'#becdcc',letterSpacing:3,marginTop:30}}>从能力的变化，找到背后的方法</div>
   <div style={{display:'flex',gap:37,marginTop:66,opacity:question,transform:`translateY(${(1-question)*8}px)`}}>{['怎样发展','究竟是什么','能用来做什么'].map((s,i)=><div key={s} style={{color:'#ebd4ac',fontSize:34,paddingTop:16,borderTop:'1px solid #d6be8d60'}}>{s}</div>)}</div>
  </div>
  {f>=config.overviewFrom-28&&<div style={{position:'absolute',inset:0,opacity:mapIn}}><Overview f={mapFrame}/></div>}
  {f<config.overviewFrom&&<div style={{position:'absolute',right:110,top:862,color:'#aebfc1',fontSize:23,opacity:enter*(1-mapIn)}}>视觉概念 · rainbow鱼</div>}
  {f>=config.opening-60&&<Sequence from={config.opening-60} durationInFrames={60}><AbsoluteFill style={{opacity:ease((f-config.opening+60)/60)}}><OffthreadVideo src={staticFile('media/v4-cut-vision.mp4')} muted style={{width:1920,height:1080,objectFit:'cover'}}/><AbsoluteFill style={{background:'linear-gradient(180deg,#03070b44,transparent 42%,transparent 74%,#03070bdb)'}}/></AbsoluteFill></Sequence>}
 </AbsoluteFill>;
}

export function FilmV11({audio=true}:{audio?:boolean}){
 const f=useCurrentFrame();
 const caption=captions.find(c=>f>=Math.round(c.start*30)&&f<Math.round(c.end*30));
 const custom=f<config.opening||f>=config.literatureFrom;
 return <AbsoluteFill style={{background:'#050b11',fontFamily:'NotoSansSC'}}>
  {f<config.opening&&<IntroV11 f={f}/>}
  {f>=config.opening&&f<config.literatureFrom&&<Sequence from={config.opening-960} durationInFrames={5250}><Film audio={false}/></Sequence>}
  {f>=config.literatureFrom&&<LiteratureOverviewV11 f={f-config.literatureFrom} duration={config.duration-config.literatureFrom}/>}
  {custom&&<>
   <div style={{position:'absolute',top:0,height:48,width:'100%',background:'#020408'}}/>
   <div style={{position:'absolute',bottom:0,height:48,width:'100%',background:'#020408'}}/>
   {caption&&<div style={{position:'absolute',left:105,right:105,bottom:85,textAlign:'center',fontSize:44,lineHeight:1.45,fontWeight:550,color:'#fff3df',textShadow:'0 2px 8px #000,0 0 20px #000'}}>{caption.text}</div>}
  </>}
  {audio&&<Audio src={staticFile('audio/v11/master.wav')}/>}
 </AbsoluteFill>;
}
