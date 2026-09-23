import React, {useLayoutEffect,useRef,useContext,createContext} from 'react';
import {useVideoConfig} from 'remotion';
export const C={bg:'#050b12',cyan:'#79e8ea',gold:'#d7b583',white:'#f3f0e8',muted:'#81979f'};
export const CleanContext=createContext(false);
const tau=Math.PI*2;
const hash=(i:number)=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n)};
export function Field({kind,f}:{kind:string;f:number}){
 const ref=useRef<HTMLCanvasElement>(null);const {width}=useVideoConfig();const clean=useContext(CleanContext);
 useLayoutEffect(()=>{
  const canvas=ref.current!;const ctx=canvas.getContext('2d')!;const scale=width/1920;
  canvas.width=width;canvas.height=width*9/16;ctx.scale(scale,scale);
  const t=f/30;ctx.fillStyle=C.bg;ctx.fillRect(0,0,1920,1080);
  const glow=ctx.createRadialGradient(1230,490,20,1100,490,1050);glow.addColorStop(0,'#122c37');glow.addColorStop(.56,'#08141e');glow.addColorStop(1,C.bg);ctx.fillStyle=glow;ctx.fillRect(0,0,1920,1080);
  const dot=(x:number,y:number,r:number,color:string,alpha=1)=>{ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,tau);ctx.fill();ctx.globalAlpha=1};
  const line=(x:number,y:number,x2:number,y2:number,color=C.cyan,alpha=.3,w=1)=>{ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();ctx.globalAlpha=1};
  const text=(s:string,x:number,y:number,size=20,color=C.muted)=>{if(clean&&size<29)return;ctx.font=`${size}px "NotoSansSC", sans-serif`;ctx.fillStyle=color;ctx.fillText(s,x,y)};
  for(let i=0;i<85;i++){dot((hash(i)*2000+t*(4+hash(i+2)*8))%2000-40,hash(i+500)*1080,.4+hash(i+7),C.white,.1+hash(i)*.3)}
  const project=(x:number,y:number,z:number,angle:number,cx=1250,cy=510)=>{const X=x*Math.cos(angle)+z*Math.sin(angle);const Z=z*Math.cos(angle)-x*Math.sin(angle);const p=870/(1200+Z);return {x:cx+X*p,y:cy+y*p,s:p,z:Z}};
  if(kind==='vision'){
   const layers=[{x:680,n:13},{x:905,n:10},{x:1130,n:7},{x:1360,n:5},{x:1560,n:3}];
   layers.forEach((l,li)=>{const spacing=li===0?39:52;const top=540-(l.n-1)*spacing/2;
    for(let j=0;j<l.n;j++){const y=top+j*spacing+Math.sin(t*.6+li)*8;
     if(li<layers.length-1){const next=layers[li+1];for(let k=0;k<next.n;k++){const yy=540-(next.n-1)*52/2+k*52+Math.sin(t*.6+li+1)*8;line(l.x,y,next.x,yy,C.cyan,.055+hash(j*7+k)*.07);const p=(t*.3+hash(j*7+k))%1;if(k%3===0)dot(l.x+(next.x-l.x)*p,y+(yy-y)*p,2,C.gold,.75)}}
     dot(l.x,y,5+Math.sin(t*2+j)*1.6,li===4?C.gold:C.cyan,.5+Math.sin(t*2-j*.4-li)*.3);
    }
    text(['PIXELS','EDGES','PATTERNS','FEATURES','DECISION'][li],l.x-35,850,17);
   });
   for(let r=0;r<14;r++)for(let c=0;c<14;c++){const v=Math.sin(r*.7+t)*Math.cos(c*.65+t*.3);ctx.fillStyle=v>.1?`rgba(121,232,234,${.05+v*.4})`:`rgba(215,181,131,${.05-v*.25})`;ctx.fillRect(290+c*14,437+r*14,10,10)}
   text('学习特征，而非手写规则',290,700,25,C.white);
  }else if(kind==='generation'){
   const p=(Math.sin(t*.24)+1)/2;const a=t*.09;
   for(let i=0;i<1800;i++){const u=hash(i)*tau;const v=hash(i+400)*2-1;const r=Math.sqrt(1-v*v);const noise=(1-p)*200;const x=310*r*Math.cos(u)+(hash(i+33)-.5)*noise;const y=220*v+(hash(i+9)-.5)*noise;const z=310*r*Math.sin(u);const q=project(x,y,z,a,1250,505);dot(q.x,q.y,1+q.s*1.5,i%11===0?C.gold:C.cyan,.22+q.s*.4)}
   for(let i=0;i<5;i++){ctx.strokeStyle=`rgba(121,232,234,${.04+i*.025})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(1240,525,150+i*63,65+i*28,-.25,0,tau);ctx.stroke()}
   text('NOISE',815,870,18);line(880,865,1510,865,C.cyan,.45);text('STRUCTURE',1530,870,18);
   dot(880+((t*.06)%1)*630,865,5,C.gold);
  }else if(kind==='language'){
   const tokens=['它','听见','声音','看见','世界'];const positions=tokens.map((_,i)=>({x:760+i*190,y:470+Math.sin(t*.35+i*.6)*25}));
   positions.forEach((p,i)=>{positions.forEach((q,j)=>{if(i>=j)return;ctx.strokeStyle=`rgba(121,232,234,${i===2||j===2?.6:.12})`;ctx.lineWidth=i===2||j===2?2:1;ctx.beginPath();ctx.moveTo(p.x,p.y-25);ctx.quadraticCurveTo((p.x+q.x)/2,170-(j-i)*15,q.x,q.y-25);ctx.stroke();const a=(t*.22+hash(i*9+j))%1;const x=(1-a)**2*p.x+2*(1-a)*a*(p.x+q.x)/2+a*a*q.x;const y=(1-a)**2*(p.y-25)+2*(1-a)*a*(170-(j-i)*15)+a*a*(q.y-25);dot(x,y,3,C.gold)});text(tokens[i],p.x-32,p.y,44,i===2?C.gold:C.white)});
   for(let i=0;i<(f>330?100:0);i++){const x=735+i*10;const y=785+Math.sin(i*.27+t*3)*Math.sin(i*.05+t)*32;line(x,785- Math.abs(y-785),x,785+Math.abs(y-785),C.cyan,.55,2)}
   text('TEXT',770,870,18);text('VISION',1140,870,18);text('AUDIO',1510,870,18);
  }else if(kind==='space'){
   const a=-.45+t*.14;const pts:{x:number;y:number;z:number;c:string}[]=[];
   for(let i=0;i<1800;i++){const u=hash(i),v=hash(i+50);const wall=i%4;
    if(wall===0)pts.push({x:(u-.5)*850,y:220,z:(v-.5)*850,c:C.cyan});
    if(wall===1)pts.push({x:(u-.5)*850,y:220-v*550,z:425,c:C.white});
    if(wall===2)pts.push({x:-425,y:220-v*550,z:(u-.5)*850,c:C.muted});
    if(wall===3){const theta=u*tau;const r=Math.pow(v,.35)*145;pts.push({x:120+r*Math.cos(theta),y:-80+Math.sin(v*14+u*6)*80+Math.sin(t+u*8)*8,z:r*Math.sin(theta),c:C.gold})}
   }
   pts.map(p=>({...project(p.x,p.y,p.z,a,1220,540),c:p.c})).sort((a,b)=>b.z-a.z).forEach((p,i)=>{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(hash(i)*3);ctx.fillStyle=p.c;ctx.globalAlpha=.22+p.s*.3;ctx.beginPath();ctx.ellipse(0,0,2+p.s*2,1+p.s,0,0,tau);ctx.fill();ctx.restore()});
   for(let i=0;i<9;i++){const x=(i-4)*100;const p=project(x,220,-400,a,1220,540),q=project(x,220,400,a,1220,540);line(p.x,p.y,q.x,q.y,C.cyan,.15)}
   text('MULTI-VIEW → RADIANCE → GAUSSIANS → TIME',720,886,17);
  }else if(kind==='reasoning'){
   const steps=['提出问题','检索证据','运行代码','检查结果'];const active=Math.floor(t*.5)%4;
   const xs=[650,950,1250,1550];
   xs.forEach((x,i)=>{const y=475;ctx.strokeStyle=i===active?C.gold:'#29434d';ctx.lineWidth=1.5;ctx.strokeRect(x-85,y-85,170,170);text('0'+(i+1),x-65,y-46,16,C.muted);text(steps[i],x-60,y+7,36,i===active?C.white:'#c2d3d6');for(let j=0;j<5;j++)line(x-60,y+34+j*7,x+20+hash(j+i)*40,y+34+j*7,C.cyan,.1+j*.08);if(i<3){line(x+85,y,xs[i+1]-85,y,C.cyan,.45);dot(x+85+((t*.5)%1)*130,y,3,C.gold)}});
   ctx.strokeStyle='#37545a';ctx.beginPath();ctx.moveTo(1550,560);ctx.bezierCurveTo(1550,740,650,740,650,560);ctx.stroke();
   text('OBSERVABLE ACTIONS · TESTABLE RESULTS',710,825,20,C.cyan);
   text('查证，而非只相信回答',880,900,28,C.white);
  }else if(kind==='physical'){
   // Forward kinematics of a simple planar two-link arm, shown as a mechanism illustration.
   const base={x:1030,y:735};const a=-1.05+Math.sin(t*.65)*.17,b=-.65+Math.sin(t*.65+.8)*.25;
   const elbow={x:base.x+280*Math.cos(a),y:base.y+280*Math.sin(a)};const tip={x:elbow.x+245*Math.cos(b),y:elbow.y+245*Math.sin(b)};
   for(let i=0;i<14;i++)line(710,740+i*16,1800,740+i*16,C.cyan,.07);for(let i=0;i<14;i++)line(900+i*50,740,630+i*100,970,C.cyan,.07);
   for(let i=0;i<7;i++){ctx.strokeStyle=`rgba(121,232,234,${.1+i*.03})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tip.x,tip.y);ctx.bezierCurveTo(1570+i*9,280,1710,410+i*12,1650,685);ctx.stroke()}
   const limb=(p:typeof base,q:typeof base)=>{line(p.x,p.y,q.x,q.y,'#314958',1,38);line(p.x-3,p.y-3,q.x-3,q.y-3,'#a8b6ba',1,25);line(p.x-7,p.y-7,q.x-7,q.y-7,C.white,.4,3)};
   limb(base,elbow);limb(elbow,tip);[base,elbow,tip].forEach((p,i)=>{dot(p.x,p.y,27-i*5,'#102b39');ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,20-i*4,0,tau);ctx.stroke()});
   line(tip.x,tip.y,tip.x+35,tip.y+32,C.white,.9,8);line(tip.x+35,tip.y+32,tip.x+28,tip.y+58,C.white,.9,6);line(tip.x-9,tip.y+12,tip.x+12,tip.y+46,C.white,.9,6);
   dot(1650,685,30,C.gold);text('OBSERVE',755,845,18);text('PREDICT',1140,845,18);text('ACT',1550,845,18);
  }else{
   const a=t*.09;for(let i=0;i<1300;i++){const u=hash(i)*tau,v=hash(i+500)*2-1,r=Math.sqrt(1-v*v);const p=project(r*Math.cos(u)*420,v*350,r*Math.sin(u)*420,a,1200,550);dot(p.x,p.y,.7+p.s, i%8===0?C.gold:C.cyan,.2+p.s*.5)}
  }

 },[f,kind,width,clean]);
 return <canvas ref={ref} style={{position:'absolute',width:1920,height:1080}}/>;
}
