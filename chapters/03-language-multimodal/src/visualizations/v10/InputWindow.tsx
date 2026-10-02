import React from 'react';
import {C,Label,Picture,SceneProps,progress,segment,mix} from './primitives';

/** Animate the actual preprocessor geometry, then show its saved 224px result. */
export const InputWindow:React.FC<SceneProps>=p=>{
 const letterbox=p.phase==='letterbox',t=progress(p),cut=segment(t,.05,.42),transfer=segment(t,.30,.80);
 const x=43,y=157,w=714,h=w*9/16,pad=(w-h)/2;
 const target={x:887,y:196,size:302};
 const a={x:letterbox?x:x+pad*cut,y,w:letterbox?w:w-2*pad*cut,h};
 const sx=mix(a.x,target.x,transfer),sy=mix(a.y,letterbox?target.y+(target.size-target.size*9/16)/2:target.y,transfer);
 const sw=mix(a.w,target.size,transfer),sh=mix(h,letterbox?target.size*9/16:target.size,transfer);
 const settle=segment(t,.8,.94);
 return <g>
  <Label x={47} y={49} size={38} color={C.gold}>{letterbox?'把整张图保留下来，再交给模型':'模型收到的照片，被裁掉了哪里？'}</Label>
  <Picture src="media/v2/candidate-red-car.png" x={x} y={y} w={w} h={h}/>
  <rect x={x} y={y} width={w} height={h} fill={C.ink} fillOpacity={.14+.25*transfer}/>
  {!letterbox&&<>
   <rect x={x} y={y} width={pad*cut} height={h} fill={C.ink} fillOpacity={.77}/>
   <rect x={x+w-pad*cut} y={y} width={pad*cut} height={h} fill={C.ink} fillOpacity={.77}/>
  </>}
  <rect x={a.x} y={a.y} width={a.w} height={h} fill="none" stroke={letterbox?C.cyan:C.gold} strokeWidth={2.5} strokeOpacity={.65}/>
  <rect x={target.x} y={target.y} width={target.size} height={target.size} fill={letterbox?'rgb(123,117,104)':C.ink} stroke={C.line}/>
  <path d={`M${a.x+a.w} ${y+8}Q822 ${y+8} ${target.x} ${target.y+8}M${a.x+a.w} ${y+h-8}Q822 ${y+h} ${target.x} ${target.y+target.size-8}`} fill="none" stroke={C.cyan} strokeOpacity={.27} strokeWidth={1.5}/>
  <g opacity={1-settle}>
   <svg x={sx} y={sy} width={sw} height={sh} viewBox={`${letterbox?0:pad/w*1920*cut} 0 ${letterbox?1920:1920*(1-2*pad/w*cut)} 1080`} preserveAspectRatio="none">
    <Picture src="media/v2/candidate-red-car.png" x={0} y={0} w={1920} h={1080}/>
   </svg>
   <rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke={C.gold} strokeWidth={2}/>
  </g>
  <g opacity={settle}><Picture src={`evidence/v2/clip/${letterbox?'letterbox':'center-crop'}-red_car.png`} x={target.x} y={target.y} w={target.size} h={target.size}/></g>
  <Label x={target.x+target.size/2} y={141} anchor="middle" size={33} color={C.gold}>模型实际输入</Label>
  <Label x={target.x+target.size/2} y={559} anchor="middle" size={36}>224 × 224</Label>
  <Label x={401} y={610} anchor="middle" size={35}>{letterbox?'等比缩小，边缘留白':'保留中央正方形'}</Label>
 </g>;
};
