import cueRows from './visual-cues.json';
type Cue={frame:number;value:number;phrase:string};
const rows=cueRows as Record<string,Cue[]>;
export function speechProgress(index:number,frame:number){
 const cues=rows[String(index)];if(!cues?.length)return 0;
 let before=cues[0];
 for(const next of cues.slice(1)){
  if(frame<next.frame){const u=Math.max(0,Math.min(1,(frame-before.frame)/Math.max(1,next.frame-before.frame)));return before.value+(next.value-before.value)*u;}
  before=next;
 }
 return before.value;
}
