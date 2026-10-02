import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Freeze,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import timeline from './timeline.json';
import media from './media.json';
import mark from './rainbow-mark.json';
import {TeachingVisual} from '../visualizations/v10/TeachingVisual';
import {AttentionFormulaLessonV8} from '../visualizations/v10/AttentionFormulaLessonV8';
import {tokenRowIdentity} from '../visualizations/v10/TokenEmbedding';
import {visualLayoutKey} from '../visualizations/v10/layoutKey';
import {PaperStage} from './PaperStage';
import {Reproduce} from './Reproduce';
import {CameraPass} from './CameraPass';
const ease=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t)};
type Unit=typeof timeline.units[number];
type MediaGroup={env:string;from:number;to:number;image:string;ready:boolean;video?:string;frames?:number;playbackRate?:number};
type Bridge={from:number;to:number;video:string;frames?:number;ready:boolean;occlusionCenter?:number;occlusionDuration?:number;occlusionWidth?:number};
type SourceMeta={title:string;authors:string};
// Keep source labels legible on a 16:9 frame.  Long paper titles are split at
// word boundaries instead of being squeezed into a single moving line, which
// used to collide with the caption safe area and made the text appear to
// shimmer as it reflowed.
function wrapSourceTitle(title:string,maxChars=42){
 const words=title.split(/\s+/).filter(Boolean),lines:string[]=[];let line='';
 for(const word of words){
  const next=line?`${line} ${word}`:word;
  if(line&&next.length>maxChars){lines.push(line);line=word;}else line=next;
 }
 if(line)lines.push(line);
 return lines.length?lines:[title];
}
// Public edition decodes the selected videos directly; production JPEG caches are omitted.
function VideoFrame({video,frame,frames}:{video?:string;frame:number;frames?:number}){
 const f=Math.max(0,Math.min(Math.floor(frame),(frames??Infinity)-1));
 return video?<Freeze frame={f}><OffthreadVideo src={staticFile(video)} muted style={{width:1920,height:1080,objectFit:'cover'}}/></Freeze>:null;
}
function Environment({frame}:{frame:number}){
 const groups=media.groups as MediaGroup[],bridges=media.bridges as Bridge[];
 const g=[...groups].reverse().find(g=>frame>=g.from)??groups[0];
 const b=bridges.find(b=>b.ready&&frame>=b.from&&frame<b.to);
 return <AbsoluteFill style={{background:'#050b11'}}>
  {b?<VideoFrame video={b.video} frames={b.frames} frame={frame-b.from}/>:g.ready?<VideoFrame video={g.video} frames={g.frames} frame={((frame-g.from)*(g.playbackRate??1))%(g.frames??600)}/>:<Img src={staticFile(g.image)} style={{width:1920,height:1080,objectFit:'cover'}}/>}
  {b&&b.occlusionCenter!==undefined&&<CameraPass frame={frame-b.from} center={b.occlusionCenter} duration={b.occlusionDuration} width={b.occlusionWidth}/>}
  <AbsoluteFill style={{background:'linear-gradient(180deg,#050b1138,transparent 38%,transparent 75%,#050b11f5 97%)'}}/>
 </AbsoluteFill>;
}
function Brand({frame,ending=false}:{frame:number;ending?:boolean}){
 // Closing reserves 4.5 s for the stroke, then completes the fill/signature
 // before a 3.5 s unobstructed hold. The final fade only begins at 9 s.
 const draw=ease(frame/(ending?135:105));
 const fill=ease((frame-(ending?110:85))/(ending?55:65));
 const signature=ease((frame-(ending?120:65))/(ending?45:55));
 return <div style={{position:'absolute',...(ending?{left:156,top:452}:{right:83,top:63}),display:'flex',gap:ending?27:16,alignItems:'center',color:'#d9bb8e',filter:'drop-shadow(0 2px 12px rgba(0,0,0,.38))'}}>
  <svg width={ending?114:60} height={ending?135:70} viewBox={mark.viewBox}><path d={mark.path} stroke='#e2c391' strokeWidth={ending?1.6:2.1} pathLength={1} strokeDasharray='1' strokeDashoffset={1-draw} fill='#e2c391' fillOpacity={fill*.9} fillRule='evenodd'/></svg>
  <span style={{fontFamily:'NotoSerifSC',fontSize:ending?58:42,fontWeight:700,letterSpacing:1.8,opacity:signature,backgroundImage:'linear-gradient(105deg,#f9f0dc 0%,#d8b77e 55%,#fff7e4 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textShadow:'0 2px 16px rgba(0,0,0,.50)'}}>rainbow鱼</span>
  {!ending&&<span style={{position:'absolute',right:-3,top:70,width:118,height:1,opacity:ease((frame-90)/55)*.55,background:'linear-gradient(90deg,transparent,#d9bb8e 55%,transparent)',transformOrigin:'right'}}/>}
  {!ending&&<span style={{position:'absolute',right:119,top:66,width:4,height:4,borderRadius:'50%',background:'#e2c391',opacity:ease((frame-90)/55)*.8,boxShadow:'0 0 12px #e2c391'}}/>}
 </div>;
}
function Mechanism({u,frame}:{u:Unit;frame:number}){
 if(u.id==='s24-04')return <Reproduce frame={frame-u.from}/>;
 if(u.visual==='paper')u={...u,visual:'recap',phase:u.id==='s24-06'?'bridge':'route'};
 const s=timeline.sections.find(s=>s.id===u.section)!;
 const i=timeline.units.findIndex(v=>v.id===u.id),prior=timeline.units[i-1];
 const tokenContinuation=!!prior&&tokenRowIdentity(u)!==null&&tokenRowIdentity(prior)===tokenRowIdentity(u);
 const stageKey=(v:Unit)=>{
  const phase=v.visual==='sft'&&['loss','behavior'].includes(v.phase)?'learning':v.phase;
  return `${v.section}|${v.visual}|${phase}|${mechanismKey(v)}`;
 };
 let lo=i,hi=i;const key=stageKey(u);
 while(lo>0&&stageKey(timeline.units[lo-1])===key)lo--;
 while(hi+1<timeline.units.length&&stageKey(timeline.units[hi+1])===key)hi++;
 const stageProgress=Math.max(0,Math.min(1,(frame-timeline.units[lo].from)/Math.max(1,timeline.units[hi].to-timeline.units[lo].from-15)));
 const unitProgress=Math.max(0,Math.min(1,(frame-u.from)/Math.max(1,u.to-u.from-15)));
 const data={globalFrame:frame,unitId:u.id,indexInSection:u.indexInSection,unitDuration:u.to-u.from,dataRef:u.dataRef,tokenContinuation,progress:ease(unitProgress),unitProgress,stageProgress,timelineUnits:timeline.units,timelineSections:timeline.sections};
 const p={frame:Math.max(0,frame-s.from),durationInFrames:s.to-s.from,phase:u.phase,focus:u.focus,cue:u.text,phaseFrame:Math.max(0,frame-u.from),data};
 if(u.visual==='formula')return <svg width={1300} height={650} viewBox="0 0 1300 650" role="img" aria-label="注意力公式逐步演示" style={{overflow:'visible'}}><AttentionFormulaLessonV8 {...p}/></svg>;
 return <TeachingVisual scene={u.visual} {...p} width={1300} height={650}/>;
}
function mechanismKey(u:Unit){
 if(u.visual==='formula')return `formula:${u.phase}`;
 if(u.id==='s24-04')return 'reproduction';
 const token=tokenRowIdentity(u);if(token)return token;
 return u.visual==='paper'?`recap:${u.id==='s24-06'?'bridge':'route'}`:visualLayoutKey(u.visual,u.phase,u.focus,u.id);
}
export function FilmV10({audio=true,clean=false}:{audio?:boolean;clean?:boolean}){
 const frame=useCurrentFrame(),[handle]=useState(()=>delayRender('Load licensed Chinese fonts'));
 useEffect(()=>{Promise.all([
  ['NotoSansSC','NotoSansSC.ttf'],
  ['NotoSerifSC','NotoSerifSC.ttf'],
 ].map(async([family,file])=>{const font=new FontFace(family,`url(${staticFile('fonts/'+file)})`,{weight:'100 900'});await font.load();(document.fonts as unknown as {add:(f:FontFace)=>void}).add(font)})).then(()=>continueRender(handle)).catch(cancelRender)},[handle]);
 const u=[...timeline.units].reverse().find(u=>frame>=u.from)??timeline.units[0];
 const idx=timeline.units.indexOf(u);
 const s=timeline.sections.find(s=>s.id===u.section)!,previous=timeline.units[Math.max(0,idx-1)],next=timeline.units[idx+1];
 const secEnter=ease((frame-s.from)/24);
 // Transition only when the visual construction changes. Numeric updates retain their objects.
 const changed=idx>0&&mechanismKey(previous)!==mechanismKey(u);
 // A shared token sentence is one persistent object. Other layouts leave
 // before the boundary and arrive after it: never two drifting copies of text.
 const nextChanged=!!next&&mechanismKey(u)!==mechanismKey(next);
 const introHandoffIn=previous.id==='s01-01'&&u.id==='s01-02';
 const introHandoffOut=u.id==='s01-01'&&next?.id==='s01-02';
 const layoutEnter=changed&&!introHandoffIn?ease((frame-u.from)/6):1;
 const layoutExit=nextChanged&&!introHandoffOut?1-ease((frame-(next.from-6))/6):1;
 const mechanismOpacity=layoutEnter*layoutExit;
 const caption=timeline.captions.find(c=>frame>=c.from&&frame<c.to);
 const closing=frame>=timeline.units.at(-1)!.from,closeFrame=frame-timeline.units.at(-1)!.from;
 const isPaper=u.visual==='paper'&&'paper' in u&&!!u.paper;
 const paperUnits=timeline.units.filter(u=>'paper' in u&&u.paper),paperAmount=paperUnits.length?ease((frame-paperUnits[0].from)/40)*ease((paperUnits.at(-1)!.to+40-frame)/40):0;
 const closingAmount=ease(closeFrame/50);
 const bridge=(media.bridges as Bridge[]).find(b=>b.ready&&frame>=b.from&&frame<b.to);
 const bridgeP=bridge?(frame-bridge.from)/(bridge.to-bridge.from):0;
 const fg=bridge?1-.12*Math.sin(Math.PI*bridgeP)**4:1;
 // Keep provenance readable and consistent: the first line is the exact paper
 // title, the second line identifies the authors and publication year.  This
 // also avoids the former one-line author/year shorthand, which was easy to
 // confuse with a source title when the scene was moving.
 const sourceBySection:Record<string,SourceMeta>={
  s01:{title:'Attention Is All You Need',authors:'Vaswani et al. · 2017'},
  s02:{title:'Neural Machine Translation of Rare Words with Subword Units',authors:'Sennrich, Haddow & Birch · 2016'},
  s03:{title:'Neural Machine Translation of Rare Words with Subword Units',authors:'Sennrich, Haddow & Birch · 2016'},
  s04:{title:'Attention Is All You Need',authors:'Vaswani et al. · 2017'},
  s05:{title:'RoFormer: Enhanced Transformer with Rotary Position Embedding',authors:'Su et al. · 2021'},
  s06:{title:'Attention Is All You Need',authors:'Vaswani et al. · 2017'},
  s07:{title:'Attention Is All You Need',authors:'Vaswani et al. · 2017'},
  s08:{title:'Attention Is All You Need',authors:'Vaswani et al. · 2017'},
  s09:{title:'Attention Is All You Need',authors:'Vaswani et al. · 2017'},
  s10:{title:'Language Models are Few-Shot Learners',authors:'Brown et al. · 2020'},
  s11:{title:'Language Models are Few-Shot Learners',authors:'Brown et al. · 2020'},
  s12:{title:'The Curious Case of Neural Text Degeneration',authors:'Holtzman et al. · 2020'},
  s13:{title:'Learning Transferable Visual Models From Natural Language Supervision',authors:'Radford et al. · 2021'},
  s14:{title:'Learning Transferable Visual Models From Natural Language Supervision',authors:'Radford et al. · 2021'},
  s15:{title:'Training Language Models to Follow Instructions with Human Feedback',authors:'Ouyang et al. · 2022'},
  s16:{title:'Training Language Models to Follow Instructions with Human Feedback',authors:'Ouyang et al. · 2022'},
  s17:{title:'Direct Preference Optimization: Your Language Model is Secretly a Reward Model',authors:'Rafailov et al. · 2023'},
  s18:{title:'Visual Instruction Tuning',authors:'Liu et al. · 2023'},
  s19:{title:'Whisper: Robust Speech Recognition via Large-Scale Weak Supervision',authors:'Radford et al. · 2022'},
  s20:{title:'Visual Instruction Tuning',authors:'Liu et al. · 2023'},
 };
 const source=sourceBySection[s.id];
  // Provenance is a short, quiet annotation: bring it in after the opening
  // beat, hold it for a few seconds, then let it leave.  Keeping it local to
  // the section prevents a source line from sitting under every later scene.
  const sourceLocal=frame-s.from;
  const sourceOpacity=!isPaper&&!closing&&source
   ?ease((sourceLocal-24)/18)*(1-ease((sourceLocal-180)/36))
   :0;
  const sourceLines=source?wrapSourceTitle(source.title):[];
  const titles:Record<string,string>={s01:'一句话，怎样找到一张图？',s02:'先把文字变成数字',s03:'让词表从语料里长出来',s04:'一个词，一组可以计算的数',s05:'词序改变，意思也会改变',s06:'注意力：让词语交换信息',s07:'续写时，未来必须遮住',s08:'多个视角，一起寻找联系',s09:'走过一层 Transformer',s10:'猜错以后，模型怎样学习？',s11:'亲手做一个接话模型',s12:'同一个问题，为什么答案不同？',s13:'让文字找到图片',s14:'看见整幅图，结果会怎样？',s15:'从接话，到按要求回答',s16:'人的偏好，怎样进入训练？',s17:'让模型更倾向于好回答',s18:'把图像接进语言模型',s19:'声音也能成为输入',s20:'把这些能力接起来',s21:'回到 Transformer 原论文',s22:'从语言预测，到图文联系',s23:'从示范，到人的偏好',s24:'从图像走向空间'};
  // A title should enter once per section and remain steady.  The former
  // triangular fade around frame 195 made the first title disappear and
  // reappear in the middle of the intro, which read as a flicker.
  const titleOpacity=ease((frame-s.from)/18);
  // Once the opening montage hands off to the first teaching beat, retain the
  // chapter identity as a restrained kicker above the title rule.  It moves
  // into the same typographic rail used by the following scene instead of
  // vanishing abruptly with the montage card.
  const introEnd=timeline.units.find(x=>x.id==='s01-01')?.to??392;
  // The chapter identity lands on the title rail when the opening montage
  // hands off to the first teaching beat.  It then stays in that rail across
  // every section so the viewer always knows where this episode sits in the
  // series; the closing card takes over only for the final title treatment.
  const introDock=ease((frame-(introEnd-60))/60);
  const introTitleScale=(72+(25-72)*introDock)/72;
  const introRuleOpacity=frame<introEnd?1-ease((introDock-.08)/.12)*(1-ease((introDock-.92)/.08)):1;
  const chapterKicker=frame>=introEnd?1:0;
  const chapterKickerY=58;
 return <AbsoluteFill style={{background:'#050b11',color:'#f8efdb',fontFamily:'NotoSansSC',overflow:'hidden'}}>
  <Environment frame={frame}/>
  {!clean&&<>
   <AbsoluteFill style={{background:`linear-gradient(90deg,rgba(2,9,15,${.92-.36*closingAmount}),rgba(2,9,15,${.91-.47*closingAmount}) 67%,rgba(2,9,15,${.48+.42*paperAmount}) 82%,rgba(2,9,15,${.18+.74*paperAmount})),linear-gradient(180deg,rgba(0,0,0,.16),transparent 42%,transparent 82%,rgba(0,0,0,.45))`}}/>
   {!closing&&<>
     {frame<introEnd&&<div style={{position:'absolute',left:108,top:119+(chapterKickerY-119)*introDock,width:1500,fontFamily:'NotoSerifSC',fontSize:72,fontWeight:700-100*introDock,letterSpacing:2.8+(2.2*72/25-2.8)*introDock,lineHeight:1.24,color:'#d9bb8e',opacity:titleOpacity,transform:`scale(${introTitleScale})`,transformOrigin:'left top',backgroundImage:'linear-gradient(105deg,#fff9e7 0%,#e3c693 52%,#fff4d8 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textShadow:'0 3px 30px rgba(0,0,0,.45)'}}>AI 进化史 · 第三章 / 语言连接万物</div>}
     {chapterKicker>0&&<div style={{position:'absolute',left:108,top:chapterKickerY,fontFamily:'NotoSerifSC',fontSize:25,fontWeight:600,letterSpacing:2.2,color:'#d9bb8e',opacity:chapterKicker,textShadow:'0 2px 16px rgba(0,0,0,.45)'}}>AI 进化史 · 第三章 / 语言连接万物</div>}
    <div style={{position:'absolute',left:108,top:96,width:1220,opacity:titleOpacity,transform:`translateY(${(1-secEnter)*7}px)`}}>
     <div style={{height:4,width:92,marginBottom:19,opacity:introRuleOpacity,background:'linear-gradient(90deg,#e2c391,#91cdd166,transparent)',transformOrigin:'left',transform:`scaleX(${ease((frame-s.from)/22)})`,boxShadow:'0 0 18px rgba(226,195,145,.22)'}}/>
     <div style={{fontFamily:'NotoSerifSC',fontSize:titles[s.id]?.length>18?63:72,fontWeight:700,letterSpacing:2.8,lineHeight:1.24,opacity:s.id==='s01'?ease((frame-(introEnd-14))/28):1,backgroundImage:'linear-gradient(105deg,#fff9e7 0%,#e3c693 52%,#fff4d8 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textShadow:'0 3px 30px rgba(0,0,0,.45)'}}>{titles[s.id]??s.title.replace(/^第三章：|^论文：/,'')}</div>
    </div>
    {isPaper?<AbsoluteFill style={{opacity:mechanismOpacity}}><PaperStage cue={u} cues={timeline.units} frame={frame}/></AbsoluteFill>:<div style={{position:'absolute',left:100,top:230,width:1300,height:650,opacity:fg*mechanismOpacity}}><Mechanism u={u} frame={frame}/></div>}
     {sourceOpacity>0&&source&&<div style={{position:'absolute',left:110,right:118,top:854,opacity:sourceOpacity*.9,textAlign:'right',lineHeight:1.15,pointerEvents:'none'}}>
       {sourceLines.map((line,i)=><div key={`${source.title}-${i}`} style={{fontFamily:'NotoSerifSC',fontSize:22,fontWeight:600,color:'#eee4cf',letterSpacing:.25,whiteSpace:'nowrap',textShadow:'0 2px 13px rgba(0,0,0,.55)'}}>{i===0?'来源 · ':''}{line}</div>)}
       <div style={{fontSize:19,color:'#a7c2c7',letterSpacing:.2,marginTop:4,whiteSpace:'nowrap',textShadow:'0 2px 12px rgba(0,0,0,.50)'}}>{source.authors}</div>
    </div>}
   </>}
   {closing&&closeFrame<30&&<AbsoluteFill style={{opacity:1-ease(closeFrame/30)}}>
    <div style={{position:'absolute',left:108,top:96,width:1500}}>
     <div style={{height:4,width:92,marginBottom:19,background:'linear-gradient(90deg,#e2c391,#91cdd166,transparent)',transformOrigin:'left',transform:`scaleX(${ease((frame-s.from)/22)})`,boxShadow:'0 0 18px rgba(226,195,145,.22)'}}/>
     <div style={{fontFamily:'NotoSerifSC',fontSize:titles[s.id]?.length>18?63:72,fontWeight:700,letterSpacing:2.8,lineHeight:1.24,backgroundImage:'linear-gradient(105deg,#fff9e7 0%,#e3c693 52%,#fff4d8 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textShadow:'0 3px 25px rgba(0,0,0,.45)'}}>{titles[s.id]}</div>
    </div>
   </AbsoluteFill>}
   {closing?<><div style={{position:'absolute',left:153,top:262,opacity:ease((closeFrame-18)/30)}}>
    <div style={{fontSize:24,color:'#d9bb8e',letterSpacing:5,marginBottom:18}}>AI 进化史 · 第三章</div>
    <div style={{fontFamily:'NotoSerifSC',fontWeight:650,fontSize:84,letterSpacing:4,lineHeight:1.28,textShadow:'0 3px 30px #0008'}}>语言连接万物</div>
    <div style={{height:1,width:430,marginTop:16,background:'linear-gradient(90deg,#d9bb8e88,#91cdd133,transparent)',transform:`scaleX(${ease((closeFrame-18)/70)})`,transformOrigin:'left'}}/>
   </div><Brand frame={closeFrame} ending/></>:<Brand frame={frame}/>}
   {caption&&<div style={{position:'absolute',left:120,right:120,top:918,height:110,display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,fontWeight:500,lineHeight:1.22,textAlign:'center',textShadow:'0 2px 12px #000,0 0 24px #000',whiteSpace:'normal',padding:'0 26px',boxSizing:'border-box'}}>{caption.text}</div>}
   {frame>=timeline.durationFrames-60&&<AbsoluteFill style={{background:'#050b11',opacity:ease((frame-timeline.durationFrames+60)/59)}}/>}
  </>}
  {audio&&!timeline.draft&&<Audio src={staticFile('audio/v10/master.flac')}/>}
 </AbsoluteFill>;
}
