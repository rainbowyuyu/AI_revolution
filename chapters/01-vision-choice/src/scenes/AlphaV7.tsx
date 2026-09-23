import React from 'react';
import {speechProgress} from '../speechMotion';
const G='#dec28e',C='#8acdd1',W='#f3e8d2',M='#a3bcc2';
const sat=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{n=sat(n);return n*n*(3-2*n)};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const T=({x,y,s,size=27,c=W}:{x:number;y:number;s:string;size?:number;c?:string})=><text x={x} y={y} textAnchor="middle" fill={c} fontFamily="NotoSansSC" fontSize={size} fontWeight={550}>{s}</text>;
// Legal non-capturing placements on a reduced illustrative board, not AlphaGo logs.
const moves=[[2,2],[6,6],[6,2],[2,6],[4,3],[3,4],[5,4],[4,5],[3,2],[5,6],[5,2],[3,6],[4,2],[4,6],[2,3],[6,5]];
const candidates=[[3,3],[5,3],[3,5],[5,5]];
function Board({f,play=0,chosen=-1,heat=false,scale=1}:{f:number;play?:number;chosen?:number;heat?:boolean;scale?:number}){
 const count=8+play;
 return <g transform={`translate(35 57) scale(${scale})`}>
  <defs><linearGradient id="go-table" x2=".6" y2="1"><stop stopColor="#80674a"/><stop offset="1" stopColor="#352d27"/></linearGradient><radialGradient id="go-white" cx=".32" cy=".25"><stop stopColor="#fff8e9"/><stop offset="1" stopColor="#b6ac94"/></radialGradient><radialGradient id="go-black" cx=".32" cy=".25"><stop stopColor="#40515a"/><stop offset="1" stopColor="#07121a"/></radialGradient></defs>
  <path d="M0 436L20 456H457V20L436 0" fill="#1e221f"/>
  <rect width={436} height={436} rx={6} fill="url(#go-table)" stroke={G} strokeOpacity={.5}/>
  {Array.from({length:9},(_,i)=><g key={i}><path d={`M26 ${26+i*48}H410M${26+i*48} 26V410`} stroke={G} strokeOpacity={.43} strokeWidth={1.15}/></g>)}
  {[2,4,6].flatMap(x=>[2,4,6].map(y=><circle key={x+'-'+y} cx={26+x*48} cy={26+y*48} r={3.4} fill="#bfa581"/>))}
  {moves.map(([x,y],i)=>{const u=ease(count-i);return u>0&&<g key={i} transform={`translate(${26+x*48} ${26+y*48-(1-u)*40}) scale(${.85+.15*u})`} opacity={u}><ellipse cx={3} cy={6} rx={20} ry={18} fill="#0005"/><circle r={20.5} fill={i%2?'url(#go-white)':'url(#go-black)'} stroke={i%2?'#dccdae':'#66747b'} strokeWidth={.8}/></g>})}
  {candidates.map(([x,y],i)=>{const select=chosen===i;return <g key={i}>{heat&&<circle cx={26+x*48} cy={26+y*48} r={12+4*Math.sin(f/70+i)} fill={select?G:C} opacity={select?.5:.20}/>}<circle cx={26+x*48} cy={26+y*48} r={select?20:13} fill={select?'url(#go-black)':'none'} stroke={select?G:C} strokeWidth={select?2:1} strokeOpacity={.8}/><T x={26+x*48} y={31+y*48} s={'ABCD'[i]} size={17} c={select?G:W}/></g>})}
 </g>;
}
function Wire({x,y,tx,ty,f,active=true}:{x:number;y:number;tx:number;ty:number;f:number;active?:boolean}){
 const u=(f%110+110)%110/110;
 const q=1-u,cx=q*q*q*x+3*q*q*u*lerp(x,tx,.45)+3*q*u*u*lerp(x,tx,.55)+u*u*u*tx,cy=q*q*q*y+3*q*q*u*y+3*q*u*u*ty+u*u*u*ty;
 return <g><path d={`M${x} ${y} C${lerp(x,tx,.45)} ${y},${lerp(x,tx,.55)} ${ty},${tx} ${ty}`} fill="none" stroke={active?G:C} strokeWidth={active?2.4:1.2} opacity={active?.65:.25}/><circle cx={cx} cy={cy} r={active?4.5:2.5} fill={active?G:C}/></g>;
}
export function AlphaV7({index,f,clock}:{index:number;f:number;clock:number}){
 const p=speechProgress(index,f),zero=index===58,flow=index===56;
 const choice=flow&&p>.75?1:Math.min(3,Math.floor(p*3.99));
 const stage=zero?Math.min(3,Math.floor(p*4)):choice;
 const turn=ease((p-.52)/.45)*7.8;
 const policy=[.42,.28,.18,.12],searched=[.26,.46,.17,.11];
 const updating=zero?ease((p-.76)/.2):flow?ease((p-.5)/.38):0;
 return <svg viewBox="0 0 1320 610" style={{width:'100%',height:'100%',overflow:'visible'}}>
  <Board f={clock} play={zero?turn:index===53?ease(p)*5:0} chosen={choice} heat={index!==53}/>
  <T x={253} y={548} s={zero?'自我对弈：一次落子改变下一次输入':'同一局面，先提出候选，再比较后果'} size={24} c={G}/>
  {zero?<g>
   {[[690,105,'网络 fθ','同一网络 → 策略 p ＋ 价值 v'],[1110,105,'树搜索','比较候选 → 搜索分布 π'],[1110,380,'自我对弈','记录状态 s、分布 π、胜负 z'],[690,380,'更新网络','策略学习 π · 价值学习 z']].map(([x,y,label,sub],i)=><g key={i}><rect x={Number(x)-174} y={Number(y)-63} width={348} height={131} rx={12} fill={stage===i?'#23404b':'#102630'} stroke={stage===i?G:C} strokeOpacity={.55}/><T x={Number(x)} y={Number(y)-8} s={String(label)} size={34} c={stage===i?G:W}/><T x={Number(x)} y={Number(y)+37} s={String(sub)} size={19} c={M}/></g>)}
   <Wire x={870} y={105} tx={928} ty={105} f={clock} active={stage===0}/><Wire x={1110} y={179} tx={1110} ty={307} f={clock-25} active={stage===1}/><Wire x={928} y={380} tx={870} ty={380} f={clock-55} active={stage===2}/><Wire x={690} y={307} tx={690} ty={179} f={clock-75} active={stage===3}/>
   <T x={606} y={249} s="p → π" size={27} c={G}/>
   {policy.map((v,i)=><g key={i}><rect x={766+i*87} y={256-v*105} width={18} height={v*105} rx={3} fill={C}/><rect x={788+i*87} y={256-lerp(v,searched[i],ease((p-.23)/.18))*105} width={18} height={lerp(v,searched[i],ease((p-.23)/.18))*105} rx={3} fill={G}/></g>)}
   <T x={900} y={291} s={['网络提出初始判断','搜索给出更充分的比较','棋局结果成为训练目标','更新后的网络进入下一轮'][stage]} size={24} c={G}/>
   <T x={907} y={516} s="不依赖人类棋谱 · 仍需要规则与计算" size={25} c={M}/>
  </g>:index===55?<g>
   <T x={900} y={44} s="策略选落点，价值看整个局面" size={34} c={G}/>
   <Wire x={492} y={265} tx={663} ty={265} f={clock}/>
   {candidates.map((_,i)=>{const u=ease(sat(p*4-i)),v=[.22,-.16,.41,-.08][i];return <g key={i}><T x={701} y={142+i*91} s={'局面 '+ 'ABCD'[i]} size={26}/><line x1={807} y1={134+i*91} x2={1235} y2={134+i*91} stroke={C} strokeOpacity={.25}/><line x1={1021} y1={117+i*91} x2={1021} y2={151+i*91} stroke={M}/><rect x={v<0?1021+v*370*u:1021} y={123+i*91} width={Math.abs(v)*370*u} height={22} rx={5} fill={i===choice?G:C}/><T x={1260} y={143+i*91} s={(v*u).toFixed(2)} size={24}/></g>})}
   <T x={1000} y={504} s="−1 ← 对当前执子方的胜负估计 → +1" size={23} c={M}/>
  </g>:flow?<g>
   <T x={920} y={37} s="策略引导探索，价值与模拟评估叶节点" size={30} c={G}/>
   <circle cx={895} cy={104} r={22} fill={G}/>
   {[0,1,2,3].map(i=>{const x=636+i*173,y=262,sel=i===choice;return <g key={i}><Wire x={895} y={126} tx={x} ty={y-20} f={clock-i*12} active={sel}/><circle cx={x} cy={y} r={20} fill={sel?G:'#173442'} stroke={C}/><T x={x} y={y+8} s={'ABCD'[i]} size={21} c={sel?'#10202b':W}/>{[-1,1].map((d,j)=><g key={d}><Wire x={x} y={y+20} tx={x+d*42} ty={355} f={clock+i*12+j*24} active={sel&&j===1}/><circle cx={x+d*42} cy={363} r={9} fill={sel&&j===1?G:C}/></g>)}<rect x={x-53} y={437} width={106} height={12} rx={6} fill="#1d3540"/><rect x={x-53} y={437} width={106*lerp(policy[i],searched[i],updating)/.46} height={12} rx={6} fill={i===1?G:C}/><T x={x} y={490} s={p>.75?'回传后的偏好':'先验与评估'} size={20} c={M}/></g>})}
   <T x={908} y={548} s="树中统计改变 → 根部重新比较 → 选择 B" size={26} c={G}/>
  </g>:<g>
   <T x={912} y={55} s={index===53?'候选越多，怎样集中有限计算？':'策略输出：对合法落点的初始偏好'} size={33} c={G}/>
   <Wire x={490} y={266} tx={642} ty={266} f={clock}/>
   {policy.map((v,i)=><g key={i}><T x={701} y={150+i*97} s={'候选 '+ 'ABCD'[i]} size={27}/><rect x={792} y={126+i*97} width={373} height={31} rx={8} fill="#19343e"/><rect x={792} y={126+i*97} width={373*v/.5*ease((p+.1)*2.8)} height={31} rx={8} fill={i===choice?G:C}/><T x={1231} y={150+i*97} s={`${Math.round(v*100)}%`} size={28} c={i===choice?G:W}/></g>)}
   <T x={943} y={551} s="提出候选，不等于证明这一手最好" size={28} c={M}/>
  </g>}
  <T x={660} y={604} s={zero?'AlphaGo Zero · 2017 · 自我对弈训练循环示意':'AlphaGo · 2016 · 缩小棋盘与输出均为机制示意，非原始模型实测'} size={22} c={M}/>
 </svg>;
}
