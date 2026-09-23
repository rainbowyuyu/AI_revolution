import React from 'react';
const C='#8ad4dd',G='#e4bf85',W='#f4e7ce',M='#aac0c4';
type V=[number,number,number];
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a:V,b:V,p:number):V=>a.map((v,i)=>v+(b[i]-v)*ease(p)) as V;
const P=([x,y,z]:V):[number,number]=>[65+365*x+145*y,289+14*x-112*y-200*z];
const xy=(v:V)=>P(v).join(',');
const path=(v:V[])=>v.map((q,i)=>`${i?'L':'M'} ${xy(q)}`).join(' ');
const txt=(s:string,x:number,y:number,size=23,color=W)=><text x={x} y={y} textAnchor="middle" fontSize={size} fontFamily="NotoSansSC" fill={color}>{s}</text>;
const start:V=[.66,.56,0],target:V=[.86,.19,0],rest:V=[.34,.25,.58],grasp:V=[.66,.56,.25],lift:V=[.66,.56,.59];
function Cup({p,opacity=1,color=G}:{p:V;opacity?:number;color?:string}){
 const [x,y]=P(p),[tx,ty]=P([p[0],p[1],p[2]+.15]);
 return <g opacity={opacity}><ellipse cx={x+3} cy={y+3} rx="23" ry="8" fill="#000" opacity=".32"/><path d={`M ${tx-15} ${ty} L ${x-13} ${y} Q ${x} ${y+8} ${x+13} ${y} L ${tx+15} ${ty} Z`} fill="url(#cup-metal)" stroke={color} strokeWidth="1.2"/><ellipse cx={tx} cy={ty} rx="15" ry="6" fill="#19323a" stroke={color}/><path d={`M ${tx+15} ${ty+5} C ${tx+36} ${ty+2} ${tx+36} ${ty+25} ${tx+14} ${ty+22}`} fill="none" stroke={color} strokeWidth="3"/></g>;
}
function Arm({hand,closed=0,opacity=1}:{hand:V;closed?:number;opacity?:number}){
 const base:V=[.10,.28,0],shoulder:V=[.10,.28,.23];
 const dx=hand[0]-shoulder[0],dy=hand[1]-shoulder[1],dz=hand[2]-shoulder[2],r=Math.hypot(dx,dy),d=Math.hypot(r,dz),L1=.49,L2=.51;
 const a=Math.atan2(dz,r)+Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));
 const elbow:V=[shoulder[0]+dx/r*L1*Math.cos(a),shoulder[1]+dy/r*L1*Math.cos(a),shoulder[2]+L1*Math.sin(a)];
 const joints=[shoulder,elbow,hand].map(P),[wx,wy]=P(hand),[bx,by]=P(base),spread=22-closed*8;
 return <g opacity={opacity}>
  <ellipse cx={bx} cy={by} rx="35" ry="12" fill="#071119" stroke="#72919d"/>
  <path d={path([base,shoulder])} stroke="#2d4856" strokeWidth="28" strokeLinecap="round"/>
  <path d={path([shoulder,elbow,hand])} stroke="#09151c" strokeWidth="24" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
  <path d={path([shoulder,elbow,hand])} stroke="url(#arm-metal)" strokeWidth="18" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
  <path d={path([shoulder,elbow,hand])} stroke="#cae4dc" strokeOpacity=".40" strokeWidth="2" fill="none" transform="translate(-2 -3)"/>
  {joints.map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r={12-i*2} fill="#17323e" stroke={G} strokeWidth="1.8"/><circle cx={x} cy={y} r="3" fill={C}/></g>)}
  <path d={`M ${wx-8} ${wy+3} L ${wx-spread} ${wy+11} V ${wy+29} h 6 M ${wx+8} ${wy+3} L ${wx+spread} ${wy+11} V ${wy+29} h -6`} fill="none" stroke={W} strokeWidth="3.5" strokeLinejoin="round"/>
 </g>;
}
/** A single tabletop task links world prediction, trajectory denoising, VLA and feedback. */
export function EmbodiedLab({id,f,sceneFrame}:{id:number;f:number;sceneFrame:number}){
 const world=id===17,policy=id===12,vla=id===13;
 let hand=rest,object=start,closed=0,stage=0;
 if(vla){
  if(f<40){hand=mix(rest,[.66,.56,.48],f/40);stage=0;}
  else if(f<72){hand=mix([.66,.56,.48],grasp,(f-40)/32);stage=1;}
  else if(f<94){hand=grasp;closed=ease((f-72)/22);stage=1;}
  else{hand=mix(grasp,lift,(f-94)/68);closed=1;object=[start[0],start[1],hand[2]-.25];stage=2;}
 }else if(id===18){
  closed=1;
  if(f<84){hand=mix(lift,[target[0],target[1],.59],f/84);stage=0;}
  else if(f<138){hand=mix([target[0],target[1],.59],[target[0],target[1],.25],(f-84)/54);stage=1;}
  else if(f<168){hand=[target[0],target[1],.25];closed=1-ease((f-138)/30);stage=1;}
  else {hand=mix([target[0],target[1],.25],[target[0]-.16,target[1],.56],(f-168)/58);closed=0;stage=2;}
  object=f<138?[hand[0],hand[1],hand[2]-.25]:target;
 }
 const candidates=Array.from({length:11},(_,k)=>Array.from({length:27},(_,j)=>{
  const u=j/26,anneal=1-ease((f-10)/77),envelope=Math.sin(Math.PI*u);
  return [rest[0]+(grasp[0]-rest[0])*u+Math.sin(u*8+k*1.7)*.10*anneal*envelope,rest[1]+(grasp[1]-rest[1])*u+Math.sin(u*12+k)*.15*anneal*envelope,rest[2]+(grasp[2]-rest[2])*u+Math.sin(Math.PI*u)*.13+Math.cos(u*10+k*.7)*.13*anneal*envelope] as V;
 }));
 const scan=(1-Math.cos(sceneFrame/55))/2;
 const stages=world?['当前观察','动作条件','预测状态']:policy?['采样轨迹','逐步去噪','选取短段']:vla?['定位目标','闭合夹爪','抬起杯子']:['移动到目标','接触与释放','重新观察'];
 const active=world?Math.min(2,Math.floor(f/70)):policy?Math.min(2,Math.floor(f/37)):stage;
 return <svg width="680" height="395" viewBox="0 0 680 395" style={{overflow:'visible'}}>
  <defs>
   <linearGradient id="arm-metal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#99c9ce"/><stop offset=".35" stopColor="#2a4654"/><stop offset=".7" stopColor="#608992"/><stop offset="1" stopColor="#bfdad3"/></linearGradient>
   <linearGradient id="cup-metal"><stop stopColor="#473d31"/><stop offset=".45" stopColor="#b69c71"/><stop offset=".7" stopColor="#eddbb3"/><stop offset="1" stopColor="#5d5140"/></linearGradient>
   <radialGradient id="embodied-ground"><stop stopColor="#05121cf2"/><stop offset="1" stopColor="#05121c00"/></radialGradient>
  </defs>
  <ellipse cx="340" cy="183" rx="396" ry="234" fill="url(#embodied-ground)"/>
  {txt(world?'观察与动作，共同决定预测':policy?'从轨迹候选，到可执行的动作':'“把杯子放到圆环内”',340,27,26,world||policy?W:G)}
  <path d={path([[0,0,0],[1.25,0,0],[1.25,1,0],[0,1,0],[0,0,0]])} fill="#0d283240" stroke="#688c95" strokeWidth="1.1"/>
  {Array.from({length:10},(_,i)=><g key={i}><path d={path([[i*.125,0,0],[i*.125,1,0]])} stroke={C} opacity=".10"/><path d={path([[0,i/9,0],[1.25,i/9,0]])} stroke={C} opacity=".10"/></g>)}
  <path d={path([[scan*1.25,0,.005],[scan*1.25,1,.005]])} stroke={C} strokeWidth="1.5" opacity=".22"/>
  <ellipse cx={P(target)[0]} cy={P(target)[1]} rx="37" ry="13" fill="#e4bf8508" stroke={G} strokeWidth="1.2" strokeDasharray="4 4"/>
  {world&&<>
   {[0,1,2].map(k=>{const p=ease(f/210),end:V=[.72+k*.16,.28+k*.25,0],head=mix(start,end,p),vertices=Array.from({length:28},(_,j)=>mix(start,end,j/27));return <g key={k}>
    <path d={path(vertices)} fill="none" stroke={k===1?G:C} opacity={k===1?.85:.35} strokeWidth={k===1?2:1}/>
    <Cup p={head} color={k===1?G:C} opacity={.20+.25*p}/>
    <circle cx={P(head)[0]} cy={P(head)[1]} r="4" fill={k===1?G:C}/>
   </g>})}
   <path d={path([[.18,.75,.02],[.52,.75,.02]])} stroke={C} opacity=".5" strokeDasharray="3 5"/>
   {txt('动作 A / B / C',206,128,21,C)}
  </>}
  {policy&&<>
   {candidates.map((q,i)=><path key={i} d={path(q)} fill="none" stroke={i===5?G:C} strokeOpacity={i===5?.95:.22} strokeWidth={i===5?2.5:1.2}/>)}
   {candidates.filter((_,i)=>i%2===0).map((q,i)=>{const head=q[Math.min(26,Math.floor(clamp((f-10)/98)*27))];return <circle key={i} cx={P(head)[0]} cy={P(head)[1]} r="3" fill={i===2?G:C}/>})}
  </>}
  {(vla||id===18)&&<>
   <path d={path([start,[start[0],start[1],.34],[target[0],target[1],.34],target])} stroke={G} strokeOpacity=".24" fill="none" strokeDasharray="4 6"/>
   <ellipse cx={P(object)[0]} cy={P([object[0],object[1],0])[1]} rx="29" ry="10" stroke={C} strokeOpacity=".40" fill="none"/>
   {Array.from({length:9},(_,i)=>{const a=sceneFrame*.025+i*Math.PI*2/9;return <circle key={i} cx={P(object)[0]+Math.cos(a)*30} cy={P(object)[1]-17+Math.sin(a)*20} r="1.5" fill={C} opacity=".55"/>})}
  </>}
  <Cup p={object}/>
  {!world&&<Arm hand={hand} closed={closed} opacity={policy?.30*ease(f/20):vla?.30+.70*ease(f/24):1}/>}
  {vla&&f<65&&<g opacity={1-ease((f-45)/20)}><path d={`M ${P(start)[0]-37} ${P(start)[1]-49} v -7 h 17 M ${P(start)[0]+37} ${P(start)[1]-49} v -7 h -17 M ${P(start)[0]-37} ${P(start)[1]+8} v 7 h 17 M ${P(start)[0]+37} ${P(start)[1]+8} v 7 h -17`} stroke={C} strokeWidth="2" fill="none"/></g>}
  {id===18&&<g><path d="M 491 102 H 627" stroke={M} opacity=".3"/>
   <path d={Array.from({length:Math.min(70,Math.floor(f/3)+1)},(_,j)=>`${j?'L':'M'} ${491+j*1.94} ${100-32*Math.exp(-j/17)*(1+.10*Math.sin(j*.55))}`).join(' ')} fill="none" stroke={C} strokeWidth="2"/>
   {txt('位置误差示意',559,132,20,M)}</g>}
  {stages.map((s,i)=><g key={s} opacity={i===active?1:.45}>{txt(s,135+i*205,335,23,i===active?G:M)}<path d={`M ${90+i*205} 345 H ${180+i*205}`} stroke={i===active?G:M} strokeOpacity={i===active?.8:.2}/></g>)}
  {txt(world?'条件预测示意 · 多种未来，不是确定答案':policy?'去噪轨迹示意 · 执行后重新观察':vla?'感知、语言与动作，在同一任务中连接':'闭环执行示意 · 观察结果，再更新动作',340,381,22,M)}
 </svg>;
}
