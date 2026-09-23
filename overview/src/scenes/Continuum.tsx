import React,{useLayoutEffect,useRef} from 'react';
import {useVideoConfig} from 'remotion';
import timeline from '../timeline.json';
const hash=(i:number)=>{const n=Math.sin(i*127.1+73.7)*43758.5453;return n-Math.floor(n)};
// Same particles for the entire film, with a continuous camera and smooth morphs.
export function Continuum({f}:{f:number}){
 const ref=useRef<HTMLCanvasElement>(null);const {width}=useVideoConfig();
 useLayoutEffect(()=>{
  const c=ref.current!,g=c.getContext('2d')!;c.width=width;c.height=width*9/16;g.scale(width/1920,width/1920);
  g.fillStyle='#040a11';g.fillRect(0,0,1920,1080);
  const glow=g.createRadialGradient(960,510,0,960,510,950);glow.addColorStop(0,'#16313a');glow.addColorStop(.6,'#091620');glow.addColorStop(1,'#040a11');g.fillStyle=glow;g.fillRect(0,0,1920,1080);
  const t=f/30,angle=t*.052;
  const shape=(i:number,k:number)=>{
   const u=hash(i)*Math.PI*2,v=hash(i+80)*2-1,r=Math.sqrt(1-v*v),q=hash(i+600);
   if(k===1)return [(i%36-17.5)*28,(Math.floor(i/36)%23-11)*25,(q-.5)*220];
   if(k===2)return [Math.cos(u)*390*r,v*290,Math.sin(u)*390*r];
   if(k===3)return [Math.cos(u)*460,Math.sin(u*3)*130+(q-.5)*90,Math.sin(u)*330];
   if(k===4)return [(q-.5)*850,i%3===0?220:(v*250),i%3===1?350:(hash(i+300)-.5)*700];
   if(k===5)return [(i%4-1.5)*240+Math.cos(u)*65,Math.sin(u)*65+(q-.5)*50,Math.sin(u*2)*80];
   if(k===6)return [Math.cos(u)*460,v*210,Math.sin(u)*460];
   return [Math.cos(u)*430*r,v*340,Math.sin(u)*430*r];
  };
  const times=[...timeline.scenes.map(s=>s.start/30),timeline.duration/30];let k=0;while(k<7&&t>times[k+1])k++;
  const raw=Math.max(0,Math.min(1,(t-times[k])/3)),p=raw*raw*(3-2*raw);
  for(let i=0;i<1300;i++){
   const a=shape(i,Math.max(0,k-1)),b=shape(i,k);let [x,y,z]=a.map((v,j)=>v+(b[j]-v)*p);
   y+=Math.sin(t*.35+i*.4)*5;const X=x*Math.cos(angle)+z*Math.sin(angle),Z=z*Math.cos(angle)-x*Math.sin(angle),s=1100/(1500+Z);
   g.globalAlpha=.22+s*.38;g.fillStyle=i%9===0?'#d7b583':'#91dadd';g.beginPath();g.arc(960+X*s,515+y*s,.65+s*1.25,0,Math.PI*2);g.fill();
  }
  g.globalAlpha=1;
 },[f,width]);
 return <canvas ref={ref} style={{position:'absolute',width:1920,height:1080}}/>;
}
