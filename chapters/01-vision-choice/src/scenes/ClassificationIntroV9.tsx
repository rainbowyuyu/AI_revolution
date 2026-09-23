import React from 'react';
import {staticFile} from 'remotion';
import {SvgImage} from '../SvgImage';
import data from '../experiments.json';

const gold='#e1c493',cyan='#91d2d4',white='#f4ead7',muted='#adc0c4';
const ease=(v:number)=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const Text=({x,y,children,size=28,color=white,anchor='middle'}:{x:number;y:number;children:React.ReactNode;size?:number;color?:string;anchor?:'middle'|'start'|'end'})=><text x={x} y={y} fontFamily="NotoSansSC" fontSize={size} fontWeight={550} fill={color} textAnchor={anchor} style={{fontVariantNumeric:'tabular-nums'}}>{children}</text>;
const Picture=({path,x,y,size,opacity=1}:{path:string;x:number;y:number;size:number;opacity?:number})=><SvgImage href={staticFile(path)} x={x} y={y} width={size} height={size} opacity={opacity} style={{imageRendering:'pixelated'}}/>;

// Local milestones follow the recorded captions, not a generic scene percentage.
// All held values come from the saved test-set forward passes. Transitions interpolate.
export function ClassificationIntroV9({f}:{f:number}){
 const cat=data.cnn.samples[0],dog=data.cnn.samples[2];
 const change=ease((f-256)/35),returnToCat=ease((f-402)/32),dogWeight=change*(1-returnToCat);
 const input=ease((f-12)/32),result=ease((f-102)/28),allClasses=ease((f-146)/28);
 const pixels=ease((f-419)/72),finish=ease((f-476)/70);
 const x=mix(64,70,pixels),y=mix(112,120,pixels),size=mix(304,290,pixels);
 const active=dogWeight>.5?dog:cat;
 const selectedX=mix(x+30,x+size*.5,pixels),selectedY=mix(y+80,y+size*.5,pixels);
 return <svg viewBox="0 0 1320 610" width="100%" height="100%">
  <defs>
   <clipPath id="intro-photo"><rect x={x} y={y} width={size} height={size} rx={4}/></clipPath>
   <radialGradient id="intro-light"><stop stopColor="#31505c" stopOpacity=".48"/><stop offset="1" stopColor="#10212b" stopOpacity="0"/></radialGradient>
   <linearGradient id="intro-bar"><stop stopColor="#8bbdc3"/><stop offset="1" stopColor="#e1c493"/></linearGradient>
  </defs>
  <ellipse cx={660} cy={270} rx={620} ry={275} fill="url(#intro-light)"/>
  <g opacity={input}>
   <g clipPath="url(#intro-photo)">
    <g transform={`translate(${-dogWeight*(size+18)} 0)`}><Picture path={cat.image} x={x} y={y} size={size}/></g>
    <g transform={`translate(${(1-dogWeight)*(size+18)} 0)`}><Picture path={dog.image} x={x} y={y} size={size}/></g>
   </g>
   <g opacity={pixels*.4}>{Array.from({length:33},(_,i)=><g key={i}><line x1={x+i*size/32} y1={y} x2={x+i*size/32} y2={y+size} stroke={cyan} strokeWidth={.6}/><line x1={x} y1={y+i*size/32} x2={x+size} y2={y+i*size/32} stroke={cyan} strokeWidth={.6}/></g>)}</g>
   <rect x={selectedX} y={selectedY} width={mix(70,size/32,pixels)} height={mix(70,size/32,pixels)} fill="none" stroke={gold} strokeWidth={2} opacity={ease((f-208)/35)}/>
   <g opacity={1-pixels}><Text x={216} y={55} size={32} color={gold}>输入一张新图片</Text><Text x={216} y={469}>真实类别：{data.cnn.classes[active.label]}</Text><Text x={216} y={512} size={23} color={muted}>未参与训练的测试图片</Text></g>
   <g opacity={pixels}><Text x={220} y={485} color={gold}>一个像素，三种强度</Text></g>
  </g>
  <g opacity={input*(1-pixels)}>
   {[0,1].map(i=><g key={i}><path d={`M${i?738:398} 270h${i?66:54}`} stroke={cyan} opacity={.35} fill="none"/><circle cx={(i?738:398)+(i?66:54)*((f/95+i*.45)%1)} cy={270} r={4} fill={gold}/></g>)}
   <Text x={596} y={55} size={32} color={gold}>让网络找线索</Text>
   {[0,1,2].map(i=><g key={i} transform={`translate(${Math.sin(f/110+i)*3} ${Math.cos(f/130+i)*3})`}>
    <rect x={454+i*64} y={160+i*32} width={155} height={155} rx={3} fill="#0b1c25" stroke={cyan} strokeOpacity={.3}/>
    <Picture path={cat.features[i]} x={459+i*64} y={165+i*32} size={145} opacity={1-dogWeight}/>
    <Picture path={dog.features[i]} x={459+i*64} y={165+i*32} size={145} opacity={dogWeight}/>
   </g>)}
   <Text x={596} y={469} size={28}>从图片，到分类</Text>
   <Text x={596} y={512} size={23} color={muted}>已训练网络的真实响应</Text>
  </g>
  <g opacity={result*(1-pixels)}>
   <Text x={1070} y={55} size={32} color={gold}>输出属于哪一类</Text>
   {data.cnn.classes.map((name,i)=>{
    const p=mix(cat.probabilities[i],dog.probabilities[i],dogWeight),animal=i===3||i===5,barY=92+i*39;
    return <g key={name} opacity={animal?1:allClasses*.78}>
     <Text x={875} y={barY+21} anchor="end" size={24} color={animal?gold:muted}>{name}</Text>
     <rect x={898} y={barY} width={285} height={23} rx={5} fill="#29414b" opacity={.48}/>
     <rect x={898} y={barY} width={285*p*result} height={23} rx={5} fill={animal?'url(#intro-bar)':cyan}/>
     <Text x={1296} y={barY+21} size={23} anchor="end">{(p*100).toFixed(1)}%</Text>
    </g>;
   })}
   <Text x={1070} y={529} size={25} color={gold}>十类之中，猫和狗只是两类</Text>
  </g>
  <g opacity={pixels*(1-finish)}>
   <Text x={855} y={189} size={43} color={gold}>程序收到的，是什么？</Text>
   <Text x={855} y={286} size={36}>32 × 32 个像素</Text>
   <Text x={855} y={356} size={30} color={muted}>每个像素，红、绿、蓝三个数</Text>
   {[0,1,2].map(i=><g key={i} transform={`translate(${720+i*112} ${415+Math.sin(f/70+i)*5})`}><rect width={84} height={46} rx={4} fill={['#ab6864','#6d9c88','#658fae'][i]} opacity={.75}/><Text x={42} y={32} size={24}>{['R','G','B'][i]}</Text></g>)}
  </g>
  <g opacity={ease((f-220)/28)*(1-pixels)}><Text x={660} y={589} size={29} color={gold}>换一张图片，依然能找到判断的线索</Text></g>
  <g opacity={finish}><Text x={660} y={585} size={27} color={muted}>32 × 32 × 3 · 同一图片，坐标 (16, 16) 的真实数值</Text></g>
 </svg>;
}
