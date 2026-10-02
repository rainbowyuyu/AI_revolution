import React from 'react';
import {Img,staticFile} from 'remotion';
import pages from './papers.json';
import timeline from './timeline.json';
import overrides from './paper-overrides.json';
const e=(x:number)=>{const t=Math.min(1,Math.max(0,x));return t*t*t*(t*(t*6-15)+10)};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export type PaperCue={id:string;from:number;to:number;phase:string;focus:string;text?:string;speechTo?:number;paper?:{id:string;page:number;cameraBox?:number[]}|null;sourceId?:string;cameraFrames?:number};
function pick(id:string){
 const [section,nstr]=id.split('-');const n=Number(nstr);
 if(section==='s21')return {id:'transformer',page:n===1||n===6?1:n<=3?3:4};
 if(section==='s22')return n<=3?{id:'gpt3',page:n===1?1:n===2?3:4}:{id:'clip',page:n===4?1:2};
 if(section==='s23')return n<=3?{id:'instructgpt',page:n===1?1:3}:{id:'dpo',page:n===4?1:2};
 return n<=2?{id:'llava',page:4}:{id:'bpe',page:n===3?4:1};
}
const selection=(cue:PaperCue)=>cue.paper?{id:cue.paper.id,page:cue.paper.page}:pick(cue.id);
const key=(cue:PaperCue)=>JSON.stringify(selection(cue));
/** Real PDF page; projection and focus crop share exact PDF coordinates. */
const cameraBox=(cue:PaperCue,p:typeof pages[number])=>cue.paper?.cameraBox??(cue.focus.includes('注意力公式')?overrides.cameraBoxes.attentionEquation:p.page===1?[40,30,p.width-40,440]:p.focus);
const normalized=(text:string)=>text.replace(/[\s，。！？、：；“”‘’《》,.!?:;]/g,'');

/** Use aligned caption phrases after every audio rebuild; character interpolation
 * only locates an anchor inside that already aligned caption, not the full film. */
function phraseFrame(cue:PaperCue,phrases:string[],fallback=.65){
 const captions=timeline.captions.filter(c=>c.unitId===cue.id),text=captions.map(c=>normalized(c.text)).join('');
 for(const phrase of phrases){
  const index=text.indexOf(normalized(phrase));if(index<0)continue;
  let offset=0;
  for(const c of captions){const n=normalized(c.text).length;if(index<offset+n)return Math.round(mix(c.from,c.to,(index-offset)/Math.max(1,n)));offset+=n;}
 }
 return Math.round(mix(cue.from,cue.speechTo??cue.to,fallback));
}

/** Internal camera beats preserve the public narration IDs and audio timeline. */
export function buildPaperSequence(cues:PaperCue[]):PaperCue[]{
 return cues.flatMap(cue=>{
  if(!cue.paper)return [cue];
  const base={...cue,sourceId:cue.id};
  if(cue.id==='s21-04')return [{...base,cameraFrames:52,paper:{...cue.paper,cameraBox:overrides.cameraBoxes.attentionEquation}}];
  if(cue.id==='s21-05')return [{...base,cameraFrames:58,paper:{...cue.paper,cameraBox:overrides.cameraBoxes.multiheadDiagram}}];
  let at=0,paper=cue.paper,cameraFrames=60;
  if(cue.id==='s21-01'){
   at=phraseFrame(cue,['真正值得拿来对照的','标题很有名'],.72)-24;
   paper={...cue.paper,page:3,cameraBox:overrides.cameraBoxes.transformerDiagram};cameraFrames=58;
  }else if(cue.id==='s21-03'){
   at=phraseFrame(cue,['再往上看','这个位置和上面的'],.64)-12;
   paper={...cue.paper,cameraBox:overrides.cameraBoxes.decoderCrossAttention};cameraFrames=54;
  }else if(cue.id==='s23-01'){
   at=phraseFrame(cue,['看这张图','页面上的流程图'],.51)-20;
   paper={...cue.paper,page:3,cameraBox:overrides.cameraBoxes.instructgptProcess};cameraFrames=58;
  }else return [base];
  at=Math.max(cue.from+36,Math.min(cue.to-45,at));
  return [{...base,to:at},{...base,id:`${cue.id}:focus`,from:at,paper,phase:'focus',cameraFrames}];
 });
}

type View={scale:number;cx:number;cy:number};
const interpolateView=(a:View,b:View,t:number):View=>({scale:mix(a.scale,b.scale,t),cx:mix(a.cx,b.cx,t),cy:mix(a.cy,b.cy,t)});
function viewFor(cue:PaperCue,p:typeof pages[number]):View{
 const box=cameraBox(cue,p),z=Math.min(1120/(box[2]-box[0]),570/(box[3]-box[1])),amount=p.page===1?.32:1;
 return {scale:mix(590/p.height,z,amount),cx:mix(p.width/2,(box[0]+box[2])/2,amount),cy:mix(p.height/2,(box[1]+box[3])/2,amount)};
}

/** Sample the previous camera at each internal boundary. A new spoken beat
 * continues from that exact pose, including when the previous move is unfinished. */
function cameraState(cues:PaperCue[],index:number,frame:number,p:typeof pages[number]){
 let first=index;while(first>0&&cues[first-1].paper&&key(cues[first-1])===key(cues[index]))first--;
 let view:View={scale:590/p.height,cx:p.width/2,cy:p.height/2};
 for(let i=first;i<=index;i++){
  const cue=cues[i],until=i<index?cues[i+1].from:frame;
  view=interpolateView(view,viewFor(cue,p),e((until-cue.from)/(cue.cameraFrames??(i===first?110:85))));
 }
 return {...view,first,stageFrom:cues[first].from};
}

function Sheet({cue,cues,index,frame,opacity=1}:{cue:PaperCue;cues:PaperCue[];index:number;frame:number;opacity?:number}){
 const choice=selection(cue),p=pages.find(p=>p.id===choice.id&&p.page===choice.page)!;
 const {scale:s,cx,cy,stageFrom}=cameraState(cues,index,frame,p),t=e((frame-stageFrom)/110);
 return <div style={{position:'absolute',inset:0,opacity}}>
  <div style={{position:'absolute',left:104,top:236,width:1200,height:645,perspective:3000,overflow:'hidden',maskImage:'linear-gradient(180deg,transparent,black 2%,black 98%,transparent)'}}>
   <div style={{position:'absolute',left:600,top:322,transformStyle:'preserve-3d',transform:`rotateY(${mix(-6,-.3,t)}deg) rotateX(${mix(2,0,t)}deg) rotateZ(${mix(-.7,0,t)}deg)`}}>
    <div style={{width:p.width*s,height:p.height*s,transform:`translate(${-cx*s}px,${-cy*s}px)`,boxShadow:'2px 4px 1px #aaa28f,0 22px 44px #000b',background:'#fff'}}>
     <Img src={staticFile(p.image)} style={{display:'block',width:'100%',height:'100%'}}/>
      {/* papers.json contains one default high-resolution focus crop.  Once a
       * cue supplies a custom camera box, the old crop would land at the wrong
       * PDF coordinates and briefly show an unrelated Figure/formula. */}
      {!cue.paper?.cameraBox&&<Img src={staticFile(p.focusImage)} style={{position:'absolute',left:p.focus[0]*s,top:p.focus[1]*s,width:(p.focus[2]-p.focus[0])*s,height:(p.focus[3]-p.focus[1])*s}}/>}
     {overrides.additionalLayers.filter(layer=>layer.id===p.id&&layer.page===p.page).map(layer=><Img key={layer.image} src={staticFile(layer.image)} style={{position:'absolute',left:layer.box[0]*s,top:layer.box[1]*s,width:(layer.box[2]-layer.box[0])*s,height:(layer.box[3]-layer.box[1])*s}}/>)}
    </div>
   </div>
  </div>
  <div style={{position:'absolute',left:1370,top:330,width:420,fontFamily:'NotoSansSC'}}>
   <div style={{fontSize:48,color:'#d9bb8e',fontWeight:650}}>{({transformer:'Transformer',gpt3:'GPT-3',clip:'CLIP',instructgpt:'InstructGPT',dpo:'DPO',llava:'LLaVA',bpe:'BPE'} as Record<string,string>)[p.id]}</div>
   <div style={{fontSize:32,lineHeight:1.5,marginTop:30,color:'#f8efdb'}}>{p.title}</div>
   <div style={{width:100,height:1,background:'#d9bb8e70',margin:'28px 0'}}/>
   <div style={{fontSize:32,color:'#b6ccd0',lineHeight:1.6}}>{p.authors}<br/>{p.year}</div>
  </div>
 </div>;
}
export function PaperStage({cue,cues,frame}:{cue:PaperCue;cues:PaperCue[];frame:number}){
 const sequence=buildPaperSequence(cues),eligible=sequence.map((c,i)=>({c,i})).filter(({c})=>(c.sourceId??c.id)===cue.id&&frame>=c.from),index=eligible.at(-1)?.i??sequence.findIndex(c=>(c.sourceId??c.id)===cue.id),active=sequence[index];
 let first=index;while(first>0&&sequence[first-1].paper&&key(sequence[first-1])===key(active))first--;
 const previousIndex=first-1,previous=sequence[previousIndex],changed=!!previous?.paper&&key(previous)!==key(active),t=e((frame-sequence[first].from)/28);
 return <>{changed&&t<1&&<Sheet cue={previous} cues={sequence} index={previousIndex} frame={previous.to-1} opacity={1-t}/>}<Sheet cue={active} cues={sequence} index={index} frame={frame} opacity={changed?t:1}/></>;
}
