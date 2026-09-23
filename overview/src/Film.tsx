import React from 'react';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Sequence,staticFile,useCurrentFrame,useVideoConfig,interpolate} from 'remotion';
import timeline from './timeline.json';
import media from './media.json';
import captions from './captions.json';
import {Continuum} from './scenes/Continuum';
import {ChapterType,Overview,Teaching} from './scenes/Journey';
import route from './route.json';
import {SignatureTitle} from './scenes/Brand';
import {LiteratureRoom} from './scenes/LiteratureRoom';
export type FilmProps={clean?:boolean;audio?:boolean};
const cl={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
export const fade=(f:number,a:number,b:number,r=24)=>interpolate(f,[a,a+r,b-r,b],[0,1,1,0],cl);
function Environment({name,fallback}:{name:string;fallback:string}){
 const f=useCurrentFrame();const ready=media.files.includes(`${name}.mp4`);
 return <AbsoluteFill>{ready?<OffthreadVideo src={staticFile(`media/${name}.mp4`)} muted style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<Img src={staticFile(`media/v4-${fallback}.png`)} style={{width:'100%',height:'100%',objectFit:'cover',transform:`scale(${1+f*.00004})`}}/>}</AbsoluteFill>;
}
function HeroType({from,to,title,sub,top=375,size=102,align='center',kicker}:{from:number;to:number;title:string;sub?:string;top?:number;size?:number;align?:'left'|'center';kicker?:string}){
 const f=useCurrentFrame();if(f<from||f>=to)return null;
 const a=to===timeline.duration?interpolate(f,[from,from+40],[0,1],cl):fade(f,from,to,28);
 const left=align==='left';
 return <div style={{position:'absolute',left:left?110:110,right:left?'auto':110,width:left?1000:'auto',top,textAlign:left?'left':'center',opacity:a,transform:`translateY(${(1-Math.min(1,(f-from)/55))*18}px)`}}>
  {left&&<div style={{position:'absolute',left:0,top:4,width:3,height:Math.max(82,size*.88),background:'linear-gradient(180deg,#e0be82,transparent)',opacity:.9}}/>}
  <div style={{paddingLeft:left?28:0}}>
   {kicker&&<div style={{fontFamily:'Georgia,serif',fontSize:22,letterSpacing:5,color:'#d9bb8e',marginBottom:16,opacity:.82}}>{kicker}</div>}
   <div style={{fontFamily:'NotoSerifSC',fontSize:size,fontWeight:500,letterSpacing:left?4:8,lineHeight:1.35,color:'#f8efdb',whiteSpace:'nowrap',textShadow:'0 2px 30px #000a,0 0 50px #cfb98d20'}}>{title}</div>
   {sub&&<div style={{fontSize:left?31:36,letterSpacing:left?3:5,marginTop:20,color:'#d9c5a5'}}>{sub}</div>}
  </div>
 </div>;
}
export function Film({clean=false,audio=true}:FilmProps){
 const f=useCurrentFrame(),{width}=useVideoConfig();const caption=captions.find(c=>f/30>=c.start&&f/30<c.end);
 const current=timeline.scenes.find(s=>f>=s.start&&f<s.end)!;const chapter=timeline.scenes.indexOf(current)-1;
 const shot=route.find(s=>f>=s.from&&f<s.from+s.duration);
 return <AbsoluteFill style={{background:'#050b11',fontFamily:'NotoSansSC,sans-serif'}}>
  <div style={{position:'absolute',width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'0 0',overflow:'hidden'}}>
   {(f<960||f>=4800)&&<Continuum f={f}/>}
   {f<330&&<div style={{position:'absolute',inset:0,opacity:interpolate(f,[240,330],[1,0],cl)}}><Sequence from={0} durationInFrames={330}><Environment name="v4-intro" fallback="robot"/></Sequence></div>}
   {route.map(s=><Sequence key={s.name} from={s.from} durationInFrames={s.duration} premountFor={12}><div style={{position:'absolute',inset:0,opacity:s.from===900?interpolate(f,[900,960],[0,1],cl):1}}><Environment name={s.name} fallback={s.fallback}/></div></Sequence>)}
   {f>=4770&&f<4800&&<div style={{position:'absolute',inset:0,opacity:interpolate(f,[4770,4800],[0,1],cl)}}><Continuum f={f}/></div>}
   <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,#03070b44 0%,transparent 42%,transparent 74%,#03070bdb 100%)'}}/>
   {chapter>=0&&chapter<6&&<div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,#03080fc9 0%,#03080f91 31%,#03080f20 55%,transparent 72%)'}}/>}
   {!clean&&<>
    <SignatureTitle placement="opening"/>
    <SignatureTitle placement="ending"/>
    <HeroType from={248} to={375} title="我想做一个完整的 AI 系列" sub="六个章节，走完这段能力跃迁" top={315} size={83}/>
    {f>=365&&f<960&&<Overview f={f-365}/>}
    {chapter>=0&&chapter<6&&<><ChapterType scene={current} index={chapter} f={f}/><Teaching scene={current} f={f}/></>}
    {shot&&f>=960&&f<4800&&<div style={{position:'absolute',left:105,right:105,top:867,textAlign:'right',fontSize:26,letterSpacing:.5,color:'#c7d3ce',textShadow:'0 2px 8px #000'}}>{shot.source}</div>}
    {f<230&&<div style={{position:'absolute',left:105,right:105,top:866,textAlign:'right',fontSize:26,color:'#c7d3ce'}}>视觉参考：Google DeepMind · Gemini Robotics｜教学重构</div>}
    {f>=5250&&<LiteratureRoom f={f-5250}/>}
    <div style={{position:'absolute',top:0,width:1920,height:48,background:'#020408'}}/>
    <div style={{position:'absolute',bottom:0,width:1920,height:48,background:'#020408'}}/>
    {caption&&<div style={{position:'absolute',left:100,right:100,bottom:85,textAlign:'center',fontSize:46,lineHeight:1.5,fontWeight:500,color:'#fff5e6',letterSpacing:1.4,textShadow:'0 2px 5px #000,0 0 18px #000'}}>{caption.text}</div>}
    {audio&&media.audio&&<Audio src={staticFile('audio/master.wav')}/>}
   </>}
  </div>
 </AbsoluteFill>;
}
