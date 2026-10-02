import React from 'react';
/** A foreground architectural surface passes the lens, concealing a verified
 * generated-shot jump without double exposure or freezing either endpoint. */
export function CameraPass({frame,center,duration=90,width=3900}:{frame:number;center:number;duration?:number;width?:number}){
 const p=(frame-center)/duration+.5;if(p<=0||p>=1)return null;
 const x=1920-(1920+width)*p;
 return <div style={{position:'absolute',left:x,top:-100,width,height:1280,filter:'blur(9px)',boxShadow:'-12px 0 24px #040b12c0,12px 0 22px #040b12b0',background:'linear-gradient(90deg,#253d48 0%,#112432 1.5%,#07131f 5%,#0b1924 46%,#06121d 91%,#193543 98.7%,#253c44 100%)'}}>
  <div style={{position:'absolute',left:37,top:0,bottom:0,width:4,background:'linear-gradient(180deg,#91cdd106,#d9bb8e60 46%,#91cdd109)',opacity:.45}}/>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 44% 43%,#24455322,transparent 60%)'}}/>
 </div>;
}
