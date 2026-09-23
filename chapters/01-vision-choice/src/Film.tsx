import React from 'react';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Sequence,staticFile,useCurrentFrame,useVideoConfig,interpolate,Easing} from 'remotion';
import timeline from './timeline.json';
import assets from './assets.json';
import data from './experiments.json';
import captionRows from './captions.json';
const captions=captionRows as {from:number;to:number;text:string}[];
import mark from './rainbow-mark.json';
import {Teaching} from './scenes/Teaching';
import {Paper} from './scenes/Paper';
const cl={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const,easing:Easing.bezier(.45,0,.55,1)};
const shotFor=(n:number)=>n<26?'vision':n<44?'control':n<61?'search':'archive';
export type FilmProps={clean?:boolean;audio?:boolean;hideCaptions?:boolean;titleOverride?:string;headerOpacity?:number;sourceOpacity?:number};
export function Film({clean=false,audio=true,hideCaptions=false,titleOverride,headerOpacity=1,sourceOpacity=1}:FilmProps){
 const f=useCurrentFrame(),{width}=useVideoConfig();const beat=timeline.beats.find(b=>f>=b.from&&f<b.to)??timeline.beats[timeline.beats.length-1];const local=f-beat.from,duration=beat.to-beat.from;const env=shotFor(beat.index);const cap=captions.find(c=>f>=c.from&&f<c.to);
 const a=interpolate(f,[0,24,timeline.duration-35,timeline.duration],[0,1,1,0],cl);
 const previous=timeline.beats[Math.max(0,beat.index-1)];
 const sameFamily=beat.index<4 || (beat.index===10);
 const handoff=beat.index===0||sameFamily?1:interpolate(local,[0,28],[0,1],cl);
 const bridges=timeline.bridges as {id:string;from:number;to:number;firstFrame:number;lastFrame:number}[];
 const bridge=bridges.find(b=>f>=b.from&&f<b.to&&assets.videos.includes(b.id+'.mp4'));
 const teachingVisibility=Math.min(1,...bridges.filter(b=>assets.videos.includes(b.id+'.mp4')).map(b=>f<b.from?interpolate(f,[b.from-32,b.from],[1,0],cl):f<b.to?0:interpolate(f,[b.to,b.to+32],[0,1],cl)));
 const hero=(timeline.heroStarts as {name:string;from:number}[]).find(b=>f>=b.from&&f<b.from+150&&assets.videos.includes('hero-'+b.name+'.mp4'));
 const isReal=['hook','pixels','features','samples','occlusion','probability','state','qvalues','cnnchart','cnnresults','confusion','cartpole','cartcompare','dqnchart','dqnresults','connect','tree','mcts','selection','rollout','backup','searchresults'].includes(beat.visual);
 const mathMap:Record<number,string>={};const mathName=mathMap[beat.index];const mathActive=!!mathName&&local>=240&&local<480;
 const source=beat.index<26?'PyTorch Tutorials · CIFAR-10':beat.index<44?'PyTorch Tutorials · Gymnasium':beat.index<53?'Google DeepMind · OpenSpiel':'Silver 等 · Nature 2016 / 2017';
 return <AbsoluteFill style={{background:'#050b11'}}><div style={{position:'absolute',width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'0 0',fontFamily:'NotoSansSC',overflow:'hidden'}}>
  <AbsoluteFill><Img src={staticFile(`media/scene-${env}.png`)} style={{width:1920,height:1080,objectFit:'cover',opacity:.48,transform:`scale(${1.025+.012*Math.sin(f/1400)}) translateX(${Math.sin(f/900)*8}px)`}}/><AbsoluteFill style={{background:'linear-gradient(90deg,#050e16d9, #07131b9c 62%,#06111b44),radial-gradient(ellipse at 37% 54%,#18364233,transparent 70%)'}}/></AbsoluteFill>
  <svg width="1920" height="1080" style={{position:'absolute',inset:0,opacity:.22}}>{Array.from({length:60},(_,i)=>{const x=(i*317+Math.sin(f/330+i)*24)%1920,y=(i*193+Math.cos(f/410+i)*16)%1000;return <circle key={i} cx={x} cy={y} r={i%7===0?1.6:.8} fill={i%7===0?'#dec28e':'#89cbd0'}/>;})}</svg>
  {hero&&<Sequence from={hero.from} durationInFrames={150}><AbsoluteFill style={{opacity:interpolate(local,[0,30,110,150],[0,1,1,0],cl)}}><OffthreadVideo src={staticFile('media/hero-'+hero.name+'.mp4')} muted style={{width:1920,height:1080,objectFit:'cover'}}/></AbsoluteFill></Sequence>}
  {bridge&&<Sequence from={bridge.from} durationInFrames={bridge.to-bridge.from}><AbsoluteFill style={{opacity:interpolate(f,[bridge.from,bridge.from+20,bridge.to-30,bridge.to],[0,1,1,0],cl)}}><OffthreadVideo src={staticFile('media/'+bridge.id+'.mp4')} muted style={{width:1920,height:1080,objectFit:'cover'}}/></AbsoluteFill></Sequence>}
  {!clean&&<>
   <div style={{position:'absolute',left:112,top:112,opacity:a*teachingVisibility*headerOpacity,transform:`translateY(${(1-handoff)*9}px)`}}><div style={{fontSize:23,fontWeight:550,letterSpacing:5,color:'#a8bfc3',marginBottom:16}}>{beat.section}</div><div style={{fontFamily:'NotoSerifSC',fontSize:(titleOverride??beat.title).length>19?63:77,fontWeight:600,letterSpacing:3,color:'#f2e8d2',lineHeight:1.3}}>{titleOverride??beat.title}</div></div>
   {handoff<1&&previous.visual!=='paper'&&beat.visual!=='paper'&&<div style={{position:'absolute',left:120,top:285,width:1640,height:590,opacity:a*teachingVisibility,clipPath:`inset(0 ${handoff*100}% 0 0)`,transform:`translateX(${-handoff*20}px)`}}><Teaching beat={previous} f={previous.duration-1} duration={previous.duration} data={data}/></div>}
   <div style={{opacity:a*teachingVisibility*(hero ? .12 : 1),mixBlendMode:mathActive?'screen':undefined}}>{beat.visual==='paper'?<Paper index={beat.index} f={local} duration={duration}/>:<div style={{position:'absolute',left:120,top:285,width:1640,height:590,clipPath:handoff<1&&previous.visual!=='paper'?`inset(0 0 0 ${(1-handoff)*100}%)`:undefined,transform:`translateX(${(1-handoff)*20}px) perspective(2400px) rotateY(${Math.sin(f/1300)*.35}deg)`}}>{mathActive?<Sequence from={beat.from+240} durationInFrames={240}><OffthreadVideo src={staticFile(`media/math-${mathName}.mp4`)} muted style={{width:'100%',height:'100%',mixBlendMode:'screen',objectFit:'contain'}}/></Sequence>:<Teaching beat={beat} f={local} duration={duration} data={data}/>}</div>}</div>
   <div style={{position:'absolute',right:90,top:70,display:'flex',gap:10,alignItems:'center',height:52,color:'#c5bea8',opacity:.88}}><svg width="40" height="48" viewBox={mark.viewBox}><path d={mark.path} fill="currentColor" fillRule="evenodd"/></svg><span style={{fontFamily:'NotoSerifSC',fontSize:30,fontWeight:600,letterSpacing:1}}>rainbow鱼</span></div>
   <div style={{position:'absolute',left:112,right:100,top:890,textAlign:'right',fontSize:23,color:'#9caeb1',opacity:a*.9*sourceOpacity}}>{beat.visual==='paper'?'原始论文页面 · 详见随片参考文献':source+'｜'+(['tree','mcts','selection','rollout','backup'].includes(beat.visual)?'真实棋谱与逐次搜索记录':([6,7,8,9,10,11,12,13,14,16,17,19,22,28,29,33,34,35,37].includes(beat.index))?'真实计算 · 教学展开':isReal&&!mathActive?'真实实验／数据回放':'原理示意')}{hero||bridge?' · 环境为教学重构':''}</div>
   {cap&&!hideCaptions&&<div style={{position:'absolute',left:115,right:115,top:946,textAlign:'center',fontSize:46,lineHeight:1.4,color:'#fff2dc',fontWeight:600,textShadow:'0 2px 7px #000,0 0 20px #000'}}>{cap.text}</div>}
   <div style={{position:'absolute',inset:'0 0 auto 0',height:40,background:'#03080d'}}/><div style={{position:'absolute',inset:'auto 0 0 0',height:38,background:'#03080d'}}/>
   {audio&&assets.audio&&<Audio src={staticFile('audio/master.wav')}/>}
  </>}
 </div></AbsoluteFill>;
}
