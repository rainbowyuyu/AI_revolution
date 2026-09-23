import React from 'react';
import {Img,staticFile,interpolate,Easing} from 'remotion';
import papers from '../literature.json';
const cl={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const,easing:Easing.bezier(.45,0,.55,1)};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
type Paper=typeof papers[number];

function ResearchPage({paper,local}:{paper:Paper;local:number}){
 // Decelerate into the figure, hold it in focus, then withdraw along the optical axis.
 const enter=interpolate(local,[-8,30],[0,1],cl);
 const exit=interpolate(local,[154,196],[0,1],cl);
 const focus=interpolate(local,[22,112],[0,1],cl);
 const retreat=interpolate(local,[151,202],[0,1],cl);
 const defocus=interpolate(local,[178,202],[0,1],cl);
 const [x0,y0,x1,y1]=paper.focus,w=paper.pageWidth,h=paper.pageHeight;
 const initial=640/h,target=Math.min(810/(x1-x0),510/(y1-y0));
 const scale=lerp(initial,target,focus);
 const cx=lerp(w/2,(x0+x1)/2,focus),cy=lerp(h/2,(y0+y1)/2,focus);
 // The clear layer feathers well beyond the figure boundary. PDF pixels are unaltered.
 const feather=24;
 const maskX=`linear-gradient(90deg,transparent ${x0-feather}px,black ${x0-6}px,black ${x1+6}px,transparent ${x1+feather}px)`;
 const maskY=`linear-gradient(180deg,transparent ${y0-feather}px,black ${y0-6}px,black ${y1+6}px,transparent ${y1+feather}px)`;
 return <div style={{position:'absolute',inset:0,opacity:enter*(1-exit)}}>
  <div style={{position:'absolute',inset:0,overflow:'hidden',perspective:2100,maskImage:'linear-gradient(180deg,transparent,black 9%,black 90%,transparent)'}}>
   <div style={{position:'absolute',left:525,top:390,transform:`translateY(${(1-enter)*9-retreat*4}px) translateZ(${-retreat*95}px) rotateY(${lerp(-9,-1.4,focus)}deg) rotateX(${lerp(3,.5,focus)}deg) rotateZ(${lerp(-1.6,-.25,focus)}deg)`,transformStyle:'preserve-3d',filter:`blur(${(1-enter)*1.8+defocus*2.2}px)`}}>
    <div style={{position:'relative',width:w,height:h,transformOrigin:'0 0',transform:`scale(${scale}) translate(${-cx}px,${-cy}px)`,background:'#f4f1e9',boxShadow:'0 25px 65px #0007,1px 1px 0 #c9c9c0'}}>
     <Img src={staticFile(paper.image)} style={{display:'block',width:w,height:h,filter:`blur(${focus*1.35}px)`}}/>
     <Img src={staticFile(paper.image)} style={{position:'absolute',inset:0,width:w,height:h,maskImage:`${maskX},${maskY}`,maskComposite:'intersect'}}/>
     <div style={{position:'absolute',inset:0,background:'linear-gradient(125deg,#e9d9b90c,transparent 52%,#83b3bc08)',pointerEvents:'none'}}/>
    </div>
   </div>
  </div>
 </div>;
}

/** One stable camera stage, original PDF pages, and a gently feathered focal plane. */
export function LiteratureRoom({f}:{f:number}){
 const arrival=interpolate(f,[0,35],[0,1],cl);
 const close=interpolate(f,[1115,1169],[0,1],cl);
 return <div style={{position:'absolute',inset:0,opacity:arrival,background:'#060e15'}}>
  <div style={{position:'absolute',inset:0,opacity:1-close*.82,background:`radial-gradient(ellipse at ${41+Math.sin(f*.002)*1.5}% 49%,#1b343d,#091720 58%,#060e15)`}}/>
  <div style={{position:'absolute',inset:0,opacity:1-close}}>
   <div style={{position:'absolute',left:116,top:92,fontFamily:'NotoSerifSC,serif',fontSize:48,letterSpacing:5,color:'#efdfc3'}}>回到原始论文</div>
   <div style={{position:'absolute',left:78,top:162,width:1050,height:780}}>
    <div style={{position:'absolute',left:105,top:645,width:820,height:80,background:'radial-gradient(ellipse,#0006,transparent 68%)',filter:'blur(22px)'}}/>
    {papers.map((paper,i)=>{const local=f-22-i*190;return local>=-8&&local<=202?<ResearchPage key={paper.id} paper={paper} local={local}/>:null;})}
   </div>
   {papers.map((paper,i)=>{const local=f-22-i*190;
    if(local<0||local>196)return null;
    const a=interpolate(local,[0,30,156,192],[0,1,1,0],cl);
    return <div key={paper.id} style={{position:'absolute',left:1160,top:300,width:610,opacity:a,transform:`translateY(${interpolate(local,[0,45],[6,0],cl)}px)`}}>
     <div style={{fontFamily:'NotoSerifSC,serif',fontSize:paper.short.length>10?64:80,lineHeight:1.25,letterSpacing:2,color:'#f4e7ce'}}>{paper.short}</div>
     <div style={{fontFamily:'Georgia,serif',fontSize:33,lineHeight:1.4,marginTop:28,color:'#d5ddd7'}}>{paper.title}</div>
     <div style={{height:1,width:76,background:'linear-gradient(90deg,#cfb586,transparent)',margin:'32px 0',opacity:.7}}/>
     <div style={{fontFamily:'NotoSansSC,sans-serif',fontSize:27,lineHeight:1.6,color:'#b4c7c8'}}>{paper.authors.includes(' 等')?paper.authors.split(' · ')[0].replace(' 等','')+' 等':paper.authors}</div>
     <div style={{fontFamily:'Georgia,serif',fontSize:26,letterSpacing:2,marginTop:19,color:'#d9bb8e'}}>{paper.venue} · {paper.year}</div>
    </div>;
   })}
  </div>
 </div>;
}
