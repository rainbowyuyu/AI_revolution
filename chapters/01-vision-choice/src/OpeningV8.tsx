import React from 'react';
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import config from './opening-v8.json';
import timeline from './timeline.json';
import data from './experiments.json';
import mark from './rainbow-mark.json';
import {Teaching} from './scenes/Teaching';
import {captionLines, captionStyle} from './captionLayout';

const clamp = (n:number) => Math.max(0, Math.min(1, n));
const ease = (n:number) => {n = clamp(n); return n*n*(3-2*n);};
const lerp = (a:number,b:number,n:number) => a+(b-a)*n;

const chapters = [
  ['看见与选择','像素 · 特征 · 动作','CNN · DQN · AlphaGo'],
  ['生成与创造','对抗 · 去噪 · 内容','GAN · Diffusion'],
  ['语言与交流','上下文 · 对齐 · 协作','Transformer · CLIP · RLHF'],
  ['重建空间','视角 · 三维 · 时间','NeRF · 3DGS · 4DGS'],
  ['推理与工具','检索 · 代码 · 反馈','Reasoning · Agent'],
  ['预测并行动','世界 · 轨迹 · 具身','World Model · VLA'],
];

const strokes = [
  'M60 111 L60 56 L96 4 C235 -2 326 63 323 142 C320 195 282 235 257 258 L340 406 L135 406',
  'M135 406 C46 407 4 330 4 239 C2 160 56 91 123 89 C179 87 220 119 231 158 C208 211 161 242 107 242 C105 305 102 364 128 372 C177 387 202 335 203 305 C205 365 219 398 248 406',
  'M96 4 L96 88 M166 91 L166 61 C218 58 254 100 231 158',
  'M206 156 A12 12 0 1 1 182 156 A12 12 0 1 1 206 156',
];

function Brand({f}:{f:number}) {
  const reveal = ease((f-8)/120);
  const name = ease((f-95)/45);
  return <div style={{position:'absolute',right:110,top:72,display:'flex',alignItems:'center',gap:12,color:'#e1cfaa',opacity:.96}}>
    <svg width={42} height={50} viewBox={mark.viewBox}>
      <defs>
        <mask id="v8-brand-mask"><rect width="347" height="410" fill="black"/>
          {strokes.map((d,i)=><path key={i} d={d} fill="none" stroke="white" strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1-ease((reveal-(i*.08))/(.34))}/>)}
          <rect width="347" height="410" fill="white" opacity={ease((reveal-.84)/.16)}/>
        </mask>
        <linearGradient id="v8-brand-fill" x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#f0dfbb"/><stop offset=".55" stopColor="#c6b897"/><stop offset="1" stopColor="#95b6bb"/></linearGradient>
      </defs>
      <path d={mark.path} fill="url(#v8-brand-fill)" fillRule="evenodd" mask="url(#v8-brand-mask)"/>
    </svg>
    <div style={{fontFamily:'NotoSerifSC',fontSize:32,fontWeight:650,letterSpacing:1.5,opacity:name}}>rainbow鱼</div>
  </div>;
}

function ChapterRoute({f}:{f:number}) {
  const pathProgress = ease((f-95)/330);
  return <div style={{position:'absolute',left:94,right:94,top:516,height:370,opacity:1-ease((f-430)/110)}}>
    <svg width="1732" height="330" viewBox="0 0 1732 330" style={{position:'absolute',left:0,top:0,overflow:'visible'}}>
      <defs><linearGradient id="v8-route" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#d8bd84"/><stop offset=".5" stopColor="#83c9cf"/><stop offset="1" stopColor="#d8bd84"/></linearGradient></defs>
      <path d="M56 186 C170 112 250 106 350 132 S540 205 650 160 S850 78 950 112 S1130 224 1250 176 S1430 88 1550 112" fill="none" stroke="#8bc2c588" strokeWidth="2"/>
      <path d="M56 186 C170 112 250 106 350 132 S540 205 650 160 S850 78 950 112 S1130 224 1250 176 S1430 88 1550 112" fill="none" stroke="url(#v8-route)" strokeWidth="4" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1-pathProgress}/>
    </svg>
    {chapters.map(([title,detail,tech],i)=>{
      const u=ease((f-(120+i*48))/35);
      const anchors=[[56,186],[350,132],[650,160],[950,112],[1250,176],[1550,112]];
      const [x,y]=anchors[i];
      return <div key={title} style={{position:'absolute',left:x-92,top:y-10,width:184,opacity:u,transform:`translateY(${(1-u)*14}px)`,textAlign:'center'}}>
        <div style={{width:18,height:18,borderRadius:99,background:i===0?'#e3c98f':'#8acbd0',boxShadow:`0 0 ${12+u*14}px ${i===0?'#e3c98f99':'#8acbd099'}`,margin:'0 auto 17px'}}/>
        <div style={{fontFamily:'NotoSerifSC',fontSize:30,fontWeight:650,letterSpacing:2,color:'#f1e6d1',whiteSpace:'nowrap'}}>{title}</div>
        <div style={{fontSize:18,letterSpacing:1.4,color:'#b8c9c9',marginTop:7,whiteSpace:'nowrap'}}>{detail}</div>
        <div style={{fontSize:15,letterSpacing:1.1,color:'#d7bf8d',marginTop:8,whiteSpace:'nowrap',opacity:.9}}>{tech}</div>
      </div>;
    })}
  </div>;
}

function QuestionRoute({f}:{f:number}) {
  const route = [
    ['看见','从像素找到特征','#d4b57d'],
    ['控制','从反馈修正动作','#82c9cf'],
    ['选择','把未来展开比较','#d4b57d'],
  ];
  return <div style={{position:'absolute',left:122,top:185,width:1680,height:220,opacity:ease((f-430)/42)}}>
    <div style={{fontSize:25,letterSpacing:5,color:'#adc1c3',marginBottom:20}}>第一章 · 看见与选择</div>
    <div style={{fontFamily:'NotoSerifSC',fontSize:70,fontWeight:650,letterSpacing:3,color:'#f2e8d2'}}>三个问题，三次实验</div>
    <svg width="1650" height="120" style={{position:'absolute',top:122,left:0}}><path d="M25 42 L1610 42" stroke="#6e8b8e66" strokeWidth="2"/><path d="M25 42 L1610 42" stroke="#d2bd8b" strokeWidth="3" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1-ease((f-470)/280)}/></svg>
    {route.map(([title,detail,color],i)=>{const u=ease((f-(480+i*88))/36);return <div key={title} style={{position:'absolute',left:20+i*540,top:278,opacity:u,transform:`translateX(${(1-u)*20}px)`}}><div style={{display:'flex',alignItems:'center',gap:15}}><div style={{width:14,height:14,borderRadius:10,background:color,boxShadow:`0 0 18px ${color}`}}/><div style={{fontFamily:'NotoSerifSC',fontSize:41,fontWeight:650,color:'#f0e6d2'}}>{title}</div></div><div style={{fontSize:23,color:'#afc1c2',marginLeft:29,marginTop:7,letterSpacing:1.5}}>{detail}</div></div>;})}
  </div>;
}

function ExperimentLead({f}:{f:number}) {
  const local = f-720;
  const phase = local<330?0:local<650?1:2;
  const progress = phase===0?local/330:(phase===1?(local-330)/320:(local-650)/430);
  const beats=[timeline.beats[3],timeline.beats[26],timeline.beats[44]];
  const labels=[['图片分类','像素 → 特征 → 判断'],['平衡控制','观察 → 反馈 → 动作'],['树搜索','局面 → 分支 → 选择']];
  const b=beats[phase];
  const inner=Math.round(25+clamp(progress)*(b.duration-55));
  const entering=ease((f-710)/35), leaving=1-ease((f-1780)/70);
  return <div style={{position:'absolute',left:110,top:420,width:1700,height:500,opacity:entering*leaving}}>
    <div style={{position:'absolute',left:10,top:0,fontSize:32,color:'#d7c398',letterSpacing:2}}>{labels[phase][0]}</div>
    <div style={{position:'absolute',left:10,top:48,fontFamily:'NotoSerifSC',fontSize:33,color:'#edf0e4',letterSpacing:2}}>{labels[phase][1]}</div>
    <div style={{position:'absolute',left:420,top:0,width:1240,height:470,overflow:'hidden',borderRadius:10,background:'linear-gradient(135deg,#07141cfa,#0a1c24ee)',boxShadow:'0 20px 60px #0008'}}><Teaching key={`opening-preview-${phase}`} beat={b} f={inner} duration={b.duration} data={data}/></div>
    <div style={{position:'absolute',left:10,top:157,width:290,height:2,background:'linear-gradient(90deg,#d4bc87,#82c9cf)',transform:`scaleX(${clamp(progress)})`,transformOrigin:'left'}}/>
    <div style={{position:'absolute',left:10,top:183,fontSize:22,color:'#aabfc1',lineHeight:1.7,width:320}}>每一次实验都留下可复现的结果：预测、反馈，和下一步动作。</div>
  </div>;
}

export function OpeningV8(){
  const f=useCurrentFrame();
  const {width}=useVideoConfig();
  // Let the six-chapter map leave the stage before the experiment route arrives.
  // The previous overlap made the old title remain visible behind the new card.
  const overviewOut=ease((f-350)/55);
  const introIn=ease((f-420)/55);
  const questionOut=1-ease((f-650)/90);
  const handoff=ease((f-config.handoffFrom)/90);
  const cap=config.captions.find(c=>f>=c.from&&f<c.to);
  const lines=cap?captionLines(cap.text):[];
  const capLayout=captionStyle(lines.length);
  const bridgeStart=config.handoffFrom-120;
  const bridgeOpacity=ease((f-bridgeStart)/90);
  return <AbsoluteFill style={{background:'#050b11'}}>
    <div style={{position:'absolute',width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'0 0',fontFamily:'NotoSansSC',overflow:'hidden'}}>
      <AbsoluteFill><Img src={staticFile('media/scene-vision.png')} style={{width:1920,height:1080,objectFit:'cover',opacity:.44,transform:`scale(${1.035+f*.000004}) translateX(${Math.sin(f/800)*8}px)`}}/><AbsoluteFill style={{background:'linear-gradient(90deg,#040c14ee,#07141dcc 60%,#06121aaa),radial-gradient(ellipse at 70% 40%,#2d4c5430,transparent 64%)'}}/></AbsoluteFill>
      <AbsoluteFill style={{opacity:(1-overviewOut)*.98}}><OffthreadVideo src={staticFile('media/v6-overview-3.mp4')} muted startFrom={0} style={{width:1920,height:1080,objectFit:'cover',opacity:.86,transform:`scale(${1.03+f*.00002})`}}/><AbsoluteFill style={{background:'linear-gradient(90deg,#040c14c8,#07141d70 58%,#06121d99),linear-gradient(0deg,#040b13d0,transparent 26%,transparent 78%,#040b1370)'}}/></AbsoluteFill>
      <svg width={1920} height={1080} style={{position:'absolute',inset:0,opacity:.2}}>{Array.from({length:32},(_,i)=><circle key={i} cx={(i*317+Math.sin(f/330+i)*24)%1920} cy={(i*193+Math.cos(f/410+i)*16)%1000} r={i%7===0?1.6:.8} fill={i%7===0?'#dec28e':'#89cbd0'}/>)}</svg>
      <div style={{position:'absolute',inset:0,opacity:1-overviewOut}}>
        <div style={{position:'absolute',left:122,top:152,opacity:ease((f-18)/42),transform:`translateY(${(1-ease((f-18)/42))*12}px)`}}><div style={{fontFamily:'NotoSerifSC',fontSize:82,fontWeight:650,letterSpacing:8,color:'#f1e6d1'}}>AI 进化史</div><div style={{marginTop:20,fontSize:28,letterSpacing:4,color:'#d0c3a6'}}>用六章，讲清智能怎样一步步走到今天</div></div>
        <ChapterRoute f={f}/>
      </div>
      <div style={{position:'absolute',inset:0,opacity:introIn}}>
        <div style={{opacity:questionOut}}><QuestionRoute f={f}/></div>
        <ExperimentLead f={f}/>
        <div style={{position:'absolute',left:120,top:890,fontSize:24,color:'#afc1c2',letterSpacing:1.2,opacity:ease((f-1450)/50)}}>三个实验，先从第一张图片开始。</div>
      </div>
      <Brand f={f}/>
      {cap&&<div style={{position:'absolute',left:145,right:145,top:capLayout.top,textAlign:'center',fontSize:capLayout.fontSize,lineHeight:capLayout.lineHeight,color:'#fff1d8',fontWeight:600,textShadow:'0 2px 10px #000,0 0 22px #000',opacity:1-ease((f-config.handoffFrom)/40)}}>{lines.map((line,i)=><div key={i}>{line}</div>)}</div>}
      <div style={{position:'absolute',inset:'0 0 auto',height:40,background:'#03080d'}}/><div style={{position:'absolute',inset:'auto 0 0',height:38,background:'#03080d'}}/>
      <AbsoluteFill style={{background:'#061019',opacity:handoff}}><div style={{position:'absolute',left:120,top:170,fontSize:26,letterSpacing:5,color:'#afc2c3'}}>第一章 · 看见与选择</div><div style={{position:'absolute',left:120,top:225,fontFamily:'NotoSerifSC',fontSize:76,color:'#f2e8d2',fontWeight:650}}>任务一：认出没见过的图片</div><div style={{position:'absolute',left:123,top:355,width:520,height:2,background:'linear-gradient(90deg,#d6bd85,transparent)'}}/></AbsoluteFill>
      {f>=bridgeStart&&<AbsoluteFill style={{opacity:bridgeOpacity}}><OffthreadVideo src={staticFile('media/bridge-01.mp4')} muted startFrom={Math.min(149,Math.max(0,f-bridgeStart))} style={{width:1920,height:1080,objectFit:'cover'}}/><AbsoluteFill style={{background:'linear-gradient(90deg,#040c14a8,#07141d55 58%,#06121d88),linear-gradient(0deg,#040b13b8,transparent 28%,transparent 78%,#040b1370)'}}/></AbsoluteFill>}
    </div>
  </AbsoluteFill>;
}
