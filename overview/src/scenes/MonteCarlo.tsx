import React from 'react';
import experiment from '../experiment.json';
const C='#85d5de',G='#e5bf80',W='#f5ead6',M='#a4bcc2';
const prefix=[0];for(const p of experiment.points)prefix.push(prefix[prefix.length-1]+p[2]);
const text=(s:string,x:number,y:number,size=24,color=W)=><text x={x} y={y} textAnchor="middle" fill={color} fontSize={size} fontFamily="NotoSansSC">{s}</text>;
export const sampleCount=(f:number)=>Math.min(10000,Math.floor(Math.max(0,Math.min(1,(f-32)/268))**1.65*10000));
export function MonteCarlo({f}:{f:number}){
 const n=sampleCount(f),inside=prefix[n],estimate=n?4*inside/n:0;
 const paths=['',''];
 for(let i=0;i<n;i++){const p=experiment.points[i];paths[p[2]]+=`M${(40+p[0]*284).toFixed(1)} ${(34+p[1]*284).toFixed(1)}h.01 `;}
 const curve=experiment.samples.filter(r=>r.n<=n).map((r,i)=>`${i?'L':'M'} ${375+r.n/10000*263} ${261-(r.estimate-Math.PI)*280}`).join(' ');
 const xx=375+n/10000*263,yy=Math.max(217,Math.min(300,261-(estimate-Math.PI)*280));
 return <svg width="680" height="395" viewBox="0 0 680 395">
  <defs><radialGradient id="pi-ground"><stop stopColor="#07131bee"/><stop offset="1" stopColor="#07131b00"/></radialGradient><clipPath id="pi-square"><rect x="40" y="34" width="284" height="284"/></clipPath><clipPath id="pi-chart"><rect x="370" y="208" width="275" height="99"/></clipPath></defs>
  <ellipse cx="340" cy="190" rx="390" ry="245" fill="url(#pi-ground)"/>
  {text('均匀随机采样',181,18,23,M)}
  <rect x="40" y="34" width="284" height="284" fill="#06101865" stroke="#80999d" strokeWidth="1"/>
  <circle cx="182" cy="176" r="142" fill="#85d5de08" stroke={G} strokeWidth="1.5"/>
  <g clipPath="url(#pi-square)">
   {[0,1].map(k=><path key={k} d={paths[k]} stroke={k?C:G} strokeWidth="1.4" strokeLinecap="round" opacity=".42"/>)}
   {experiment.points.slice(Math.max(0,n-180),n).map((q,j)=>{const idx=Math.max(0,n-180)+j,born=32+268*((idx+1)/10000)**(1/1.65),age=f-born,a=Math.max(0,1-age/9);return <g key={idx} opacity={a}><circle cx={40+q[0]*284} cy={34+q[1]*284-8*a*a} r={1.4+2.5*a} fill={q[2]?C:G}/><circle cx={40+q[0]*284} cy={34+q[1]*284} r={3+6*(1-a)} fill="none" stroke={q[2]?C:G} strokeWidth=".7"/></g>})}
  </g>
  {text(`N = ${n.toLocaleString()}`,506,49,29)}
  {text(`圆内 ${inside.toLocaleString()}`,506,94,24,C)}
  {text(n?`π ≈ ${estimate.toFixed(4)}`:'π ≈ …',506,155,39,G)}
  {text('4 × 圆内点数 / 总点数',506,195,22,M)}
  <path d="M 375 216 V 305 H 638" fill="none" stroke={M} opacity=".35"/>
  <path d="M 375 261 H 638" stroke={G} strokeDasharray="4 5" opacity=".6"/>
  <g clipPath="url(#pi-chart)"><path d={curve} fill="none" stroke={C} strokeWidth="2"/>{n>99&&<circle cx={xx} cy={yy} r="4" fill={W}/>}</g>
  {text('π 参考值 3.14159',518,329,21,G)}
  {text('新样本持续落入，估计随统计更新',340,369,25)}
 </svg>;
}
