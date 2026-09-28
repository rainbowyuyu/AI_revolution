import React from 'react';
import {Img,OffthreadVideo,staticFile,Freeze} from 'remotion';
import cache from './frame-cache-v15.json';

// Restore or rebuild every mapped JPEG before enabling this optional cache.
// The portable default decodes the original video at the nearest source frame.
export const USE_FRAME_CACHE = false;

/** A shared source clock preserves the actual generated bridge endpoints. */
export function sourceFrame(frame:number,duration:number,sourceFrames:number,handle=90){
 const n=Math.max(0,Math.min(duration-1,frame));
 if(duration===sourceFrames)return n;
 const h=Math.min(handle,Math.floor((duration-1)/3),Math.floor((sourceFrames-1)/3));
 if(n<=h)return n;
 if(n>=duration-1-h)return sourceFrames-1-(duration-1-n);
 const span=duration-1-2*h,delta=sourceFrames-1-2*h,u=(n-h)/span;
 // Monotone Hermite curve. The edge rate is 1 where duration allows it.
 const tangent=Math.min(span,delta*2.5);
 return h+(-2*u*u*u+3*u*u)*delta+(2*u*u*u-3*u*u+u)*tangent;
}
export function FrameVideoV15({src,frame,style,blend=false}:{src:string;frame:number;style:React.CSSProperties;blend?:boolean}){
 const row=USE_FRAME_CACHE ? (cache as Record<string,{directory:string;frames:number}>)[src] : undefined;
 if(!row)return <Freeze frame={Math.max(0,Math.round(frame))}><OffthreadVideo muted src={staticFile(src)} style={style}/></Freeze>;
 const n=Math.max(0,Math.min(row.frames-1,frame)),a=Math.floor(n),b=Math.min(a+1,row.frames-1),q=n-a;
 const file=(v:number)=>staticFile(`${row.directory}/${String(v+1).padStart(6,'0')}.jpg`);
 return <><Img src={file(a)} style={style}/>{blend&&b!==a&&q>.005&&<Img src={file(b)} style={{...style,opacity:Number(style.opacity??1)*q}}/>}</>;
}
