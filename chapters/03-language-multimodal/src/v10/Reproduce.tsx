import React from 'react';
import {Img,staticFile} from 'remotion';
import {attentionEvidence,nextTokenEvidence} from '../visualizations/v10/evidence';
const ease=(v:number)=>{const x=Math.max(0,Math.min(1,v));return x*x*(3-2*x)};
const gold='#d9bb8e',cyan='#91cdd1',white='#f8efdb';
export function Reproduce({frame}:{frame:number}){
 const t=ease(frame/180),prob=nextTokenEvidence.contexts[0].distribution[0].probability;
 return <svg width={1300} height={650} viewBox='0 0 1300 650' style={{fontFamily:'NotoSansSC'}}>
  <g transform={`translate(${8*(1-t)} 0)`}>
   <path d='M76 212L35 253L76 294M224 212L265 253L224 294M180 183L122 323' fill='none' stroke={cyan} strokeWidth={6} strokeLinecap='round'/>
   <text x={34} y={395} fontSize={34} fill={white}>输入 → 程序 → 结果</text>
   <text x={34} y={451} fontSize={32} fill={gold}>在你的电脑上再跑一遍</text>
  </g>
  <path d='M414 324C465 324 465 324 521 324' fill='none' stroke={cyan} strokeWidth={3}/>
  <circle cx={414+107*t} cy={324} r={7} fill={gold}/>
  <g transform='translate(570 80)'>
   <g opacity={ease(frame/30)}><text x={0} y={0} fontSize={34} fill={white}>分词</text>
    {['红','伞'].map((s,i)=><g key={s} transform={`translate(${i*(130-64*t)} 30)`}><rect width={60} height={68} rx={8} fill={cyan} fillOpacity={.13}/><text x={30} y={48} textAnchor='middle' fontSize={34} fill={cyan}>{s}</text></g>)}
   </g>
   <g transform='translate(350 0)' opacity={ease((frame-30)/35)}><text fontSize={34} fill={white}>注意力</text>
    {attentionEvidence.weights.flatMap((row,i)=>row.map((v,j)=><rect key={`${i}-${j}`} x={j*38} y={24+i*32} width={32} height={26} rx={3} fill={j>i?'#14303c':cyan} opacity={j>i?.3:.15+.85*v*ease((frame-30-i*10)/55)}/>))}
   </g>
   <g transform='translate(0 310)' opacity={ease((frame-65)/35)}><text fontSize={34} fill={white}>下一字概率</text><text y={46} fontSize={30} fill={cyan}>雨后的红 →</text>
    {[prob,1-prob].map((v,i)=><g key={i}><rect x={i*110} y={175-v*145*ease((frame-65)/90)} width={65} height={v*145*ease((frame-65)/90)} rx={4} fill={i===0?gold:cyan}/><text x={i*110+32} y={217} textAnchor='middle' fontSize={30} fill={white}>{i===0?'伞':'其余'}</text></g>)}
   </g>
   <g transform='translate(350 310)' opacity={ease((frame-95)/35)}><text fontSize={34} fill={white}>图文检索</text><foreignObject x={0} y={28} width={270} height={174}><Img src={staticFile('media/v2/01-umbrella.png')} style={{width:270,height:174,objectFit:'cover',objectPosition:'right center',borderRadius:8}}/></foreignObject></g>
  </g>
 </svg>;
}
