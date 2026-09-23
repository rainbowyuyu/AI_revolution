import React from 'react';
import {Img,staticFile} from 'remotion';
import papers from '../literature-v11.json';
const ease=(n:number)=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n)};
// Back-to-front positions share a single camera. These are original PDF pixels.
const pages=[
 {id:'clip',x:30,y:42,w:260,z:-210,r:-12,blur:1.7},
 {id:'genie',x:790,y:55,w:260,z:-190,r:11,blur:1.5},
 {id:'react',x:550,y:-4,w:280,z:-165,r:6,blur:1.2},
 {id:'gan',x:244,y:-13,w:270,z:-145,r:-5,blur:1.2},
 {id:'diffusion-policy',x:10,y:215,w:280,z:-90,r:-9,blur:.9},
 {id:'3dgs',x:797,y:210,w:280,z:-65,r:8,blur:.7},
 {id:'ddpm',x:592,y:100,w:300,z:-40,r:6,blur:.5},
 {id:'alexnet',x:145,y:103,w:310,z:-20,r:-8,blur:.4},
 {id:'nerf',x:570,y:193,w:326,z:40,r:5,blur:0},
 {id:'attention',x:298,y:164,w:352,z:75,r:-3,blur:0},
];
export function LiteratureOverviewV11({f,duration}:{f:number;duration:number}){
 const enter=ease(f/45),leave=ease((f-duration+65)/65),p=Math.min(1,f/duration);
 return <div style={{position:'absolute',inset:0,background:'#060e15'}}>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 35% 53%,#203d463c,transparent 66%),linear-gradient(115deg,#0d1e27,#060e15 75%)',opacity:1-leave*.55}}/>
  <div style={{position:'absolute',inset:0,opacity:enter*(1-leave),transform:`translateY(${(1-enter)*12-leave*4}px)`}}>
   <div style={{position:'absolute',left:112,top:116,fontFamily:'NotoSerifSC',fontWeight:600,fontSize:65,letterSpacing:4,color:'#f2e5ce'}}>每一次跃迁，都有来处</div>
   <div style={{position:'absolute',left:116,top:216,fontSize:27,letterSpacing:3,color:'#b9c6c3'}}>原始论文 · 系列研究线索</div>
   <div style={{position:'absolute',left:105,top:290,width:1090,height:620,perspective:2200,transform:'scale(.8)',transformOrigin:'0 0'}}>
    <div style={{position:'absolute',inset:0,transformStyle:'preserve-3d',transform:`translateZ(${p*30-leave*75}px) rotateY(${-4+p*2}deg) translateY(${-p*9}px)`}}>
     {pages.map((slot,i)=>{const paper=papers.find(p=>p.id===slot.id)!;return <div key={slot.id} style={{position:'absolute',left:slot.x,top:slot.y,width:slot.w,transform:`translateZ(${slot.z}px) rotateZ(${slot.r+Math.sin(f/280+i)*.3}deg) rotateY(${-9+slot.r*.25}deg) translateY(${Math.sin(f/160+i)*3+(1-enter)*(i%2?15:24)}px)`,filter:`blur(${slot.blur+leave*1.5}px)`,boxShadow:'8px 20px 45px #0008',opacity:slot.z<0?.86:1}}>
      <Img src={staticFile(paper.image)} style={{display:'block',width:'100%',height:'auto',borderRadius:1}}/>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(130deg,#e2c4930c,transparent 60%,#6e9faa13)'}}/>
     </div>})}
    </div>
   </div>
   <div style={{position:'absolute',left:1130,top:305,width:680,color:'#ced9d6'}}>
    <div style={{fontFamily:'NotoSerifSC',fontSize:36,color:'#e0c69a',marginBottom:28}}>从论文，走向可以验证的理解</div>
    {papers.map((paper,i)=><div key={paper.id} style={{display:'grid',gridTemplateColumns:'1fr auto',alignItems:'baseline',gap:14,padding:'7px 0',borderBottom:i===papers.length-1?'none':'1px solid #a8bec016'}}>
     <div><span style={{fontFamily:'Georgia,serif',fontSize:24,color:'#f0e4cc'}}>{paper.short}</span><span style={{fontSize:20,marginLeft:15,color:'#adbfbe'}}>{paper.authors.split(' · ')[0].replace(' 等','')} 等</span></div>
     <span style={{fontFamily:'Georgia',fontSize:22,color:'#d6bc91'}}>{paper.year}</span>
    </div>)}
    <div style={{fontSize:21,lineHeight:1.5,marginTop:25,color:'#9eb0b3'}}>完整书目信息与来源链接随片提供</div>
   </div>
  </div>
 </div>;
}
