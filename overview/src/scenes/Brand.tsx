import React from 'react';
import {interpolate,Easing,useCurrentFrame} from 'remotion';
import mark from '../rainbow-mark.json';
const cl={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const,easing:Easing.inOut(Easing.cubic)};
/** A title lockup: signature, film title and subtitle share one optical envelope. */
export function SignatureTitle({placement}:{placement:'opening'|'ending'}){
 const f=useCurrentFrame(),opening=placement==='opening';
 const from=opening?8:4810,to=opening?245:5250;
 if(f<from||f>=to)return null;
 const enter=interpolate(f,[from,from+58],[0,1],cl);
 const leave=interpolate(f,[to-48,to],[0,1],cl);
 const settle=interpolate(f,[from,from+100],[0,1],cl);
 const id=`rainbow-title-${placement}`;
 const material='linear-gradient(115deg,#f4e8cf 5%,#e6d3ae 55%,#d4e1d8 100%)';
 return <div data-title-lockup={placement} style={{position:'absolute',left:opening?134:210,right:opening?'auto':210,top:opening?622:330,width:opening?1160:'auto',textAlign:opening?'left':'center',opacity:enter*(1-leave),transformOrigin:opening?'left center':'center center',transform:`translateY(${(1-settle)*8-leave*3}px) scale(${1.008-settle*.008-leave*.004})`,filter:`blur(${(1-enter)*1.2+leave*.6}px)`,fontFamily:'NotoSerifSC,serif'}}>
  <div style={{display:'flex',alignItems:'center',justifyContent:opening?'flex-start':'center',gap:12,height:opening?42:48,marginBottom:opening?14:18,color:'#d8c5a4'}}>
   <svg width={opening?34:39} height={opening?40:46} viewBox={mark.viewBox} style={{flexShrink:0}}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ecddbd"/><stop offset=".65" stopColor="#d8c5a4"/><stop offset="1" stopColor="#b9cfc7"/></linearGradient></defs>
    <path d={mark.path} fill={`url(#${id})`} fillRule="evenodd"/>
   </svg>
   <span style={{fontSize:opening?27:29,letterSpacing:2,lineHeight:1}}>rainbow鱼</span>
  </div>
  <div style={{fontSize:opening?76:150,fontWeight:500,letterSpacing:opening?4:8,lineHeight:1.3,whiteSpace:'nowrap',color:'#f1e5cf',backgroundImage:material,backgroundClip:'text',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',filter:'drop-shadow(0 2px 16px #0005)'}}>{opening?'当智能，开始改变现实':'AI 进化史'}</div>
  {!opening&&<div style={{marginTop:22,fontSize:36,letterSpacing:4,lineHeight:1.5,color:'#cfbfa4'}}>六个章节，一起拆解智能如何发生</div>}
 </div>;
}
