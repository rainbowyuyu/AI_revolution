import React from 'react';
import {Img,staticFile} from 'remotion';
import papers from '../papers.json';
const ease=(n:number)=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n)};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export function PaperV7({index,f,duration}:{index:number;f:number;duration:number}){
 const which:Record<number,number>={25:1,43:2,57:3,64:0,65:1,66:2,67:3,68:4},p=papers[which[index]??0];
 const focus=ease((f-65)/Math.min(260,duration*.35)),entry=ease((f+8)/36);
 const [x0,y0,x1,y1]=p.focus,w=p.pageWidth,h=p.pageHeight;
 const scale=mix(565/h,Math.min(905/(x1-x0),480/(y1-y0)),focus),cx=mix(w/2,(x0+x1)/2,focus),cy=mix(h/2,(y0+y1)/2,focus);
 // The actual PDF remains sharp within and beyond the complete figure, including its caption.
 const mask=`linear-gradient(90deg,transparent ${x0-30}px,black ${x0-8}px,black ${x1+8}px,transparent ${x1+30}px),linear-gradient(180deg,transparent ${y0-30}px,black ${y0-8}px,black ${y1+8}px,transparent ${y1+30}px)`;
 return <div style={{position:'absolute',inset:0,opacity:entry}}>
  <div style={{position:'absolute',left:75,top:278,width:1060,height:590,perspective:2400,overflow:'hidden',maskImage:'linear-gradient(180deg,transparent,black 4%,black 96%,transparent)'}}>
   <div style={{position:'absolute',left:532,top:296,transformStyle:'preserve-3d',transform:`translateY(${(1-entry)*13}px) rotateY(${mix(-10,-1.2,focus)+Math.sin(f/380)*.22}deg) rotateX(${mix(3,.3,focus)}deg) rotateZ(${mix(-1.8,-.12,focus)}deg)`}}>
    <div style={{position:'relative',width:w,height:h,transformOrigin:'0 0',transform:`scale(${scale}) translate(${-cx}px,${-cy}px)`,boxShadow:'4px 5px 0 #a9a799,9px 19px 40px #0009,0 0 75px #96b9c011'}}>
     <Img src={staticFile(p.image)} style={{width:w,height:h,display:'block',filter:`blur(${focus*.85}px)`}}/>
     <Img src={staticFile(p.image)} style={{position:'absolute',inset:0,width:w,height:h,maskImage:mask,maskComposite:'intersect'}}/>
    </div>
   </div>
  </div>
  <div style={{position:'absolute',left:1200,top:342,width:535,transform:`translateY(${(1-entry)*12}px)`}}>
   <div style={{fontFamily:'NotoSerifSC',fontSize:p.short.length>10?58:68,fontWeight:600,lineHeight:1.2,color:'#f3e8d2'}}>{p.short}</div>
   <div style={{fontFamily:'Georgia',fontSize:29,lineHeight:1.45,marginTop:30,color:'#d5dedb'}}>{p.title}</div>
   <div style={{width:92,height:1,background:'linear-gradient(90deg,#dec28e,transparent)',margin:'30px 0'}}/>
   <div style={{fontSize:29,color:'#adc2c5'}}>{p.authors}</div>
   <div style={{fontFamily:'Georgia',fontSize:25,color:'#dec28e',marginTop:18}}>{p.venue}</div>
  </div>
 </div>;
}
