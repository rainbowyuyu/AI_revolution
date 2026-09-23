import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia, renderStill} from '@remotion/renderer';

const root = process.cwd();
const mode = process.argv[2] || 'stills';
const out = path.join(root, 'output/v9');
fs.mkdirSync(out, {recursive:true});
const pub = path.join(out, 'public');
fs.mkdirSync(pub, {recursive:true});
function linkTree(a,b){fs.mkdirSync(b,{recursive:true});for(const e of fs.readdirSync(a,{withFileTypes:true})){const s=path.join(a,e.name),t=path.join(b,e.name);if(e.isDirectory())linkTree(s,t);else if(!fs.existsSync(t))fs.linkSync(s,t);}}
for(const e of fs.readdirSync('public',{withFileTypes:true})){if(e.name==='audio')continue;const a=path.join(root,'public',e.name),b=path.join(pub,e.name);if(e.isDirectory())linkTree(a,b);else if(!fs.existsSync(b))fs.linkSync(a,b);}
const url = await bundle({entryPoint:path.join(root,'src/index.ts'), publicDir:pub, outDir:path.join(out,'bundle-'+mode), webpackOverride:c=>({...c,cache:false})});
const opt={serveUrl:url,chromiumOptions:{gl:'angle'},logLevel:'error'};
const props={audio:false};
const opening = await selectComposition({...opt,id:'OpeningV9-1080',inputProps:{}});
if(mode==='stills'){
  const frames=[0,35,120,240,360,448,500,620,750,820,980,1120,1300,1450,1660,1740,1810,1870,1949];
  for(const frame of frames){await renderStill({...opt,composition:opening,inputProps:{},frame,imageFormat:'jpeg',output:path.join(out,`opening-${String(frame).padStart(4,'0')}.jpg`)});console.log('STILL',frame);}
}else if(mode==='opening'){
  await renderMedia({...opt,composition:opening,inputProps:{},frameRange:[0,opening.durationInFrames-1],muted:true,codec:'h264',crf:19,imageFormat:'jpeg',jpegQuality:92,concurrency:4,outputLocation:path.join(out,'V9片头总览预览1080p.mp4')});
  console.log('OPENING COMPLETE');
}else if(mode==='classification-stills'||mode==='classification-patch'){
  const comp=await selectComposition({...opt,id:'ChapterV9-1080',inputProps:props});
  if(mode==='classification-stills'){
    for(const frame of [1980,2070,2150,2250,2380,2440,2505,2540]){
      await renderStill({...opt,composition:comp,inputProps:props,frame,imageFormat:'jpeg',output:path.join(out,`classification-${frame}.jpg`)});
      console.log('STILL',frame);
    }
  }else{
    await renderMedia({...opt,composition:comp,inputProps:props,frameRange:[1950,2699],muted:true,codec:'h264',crf:20,imageFormat:'jpeg',jpegQuality:92,concurrency:6,outputLocation:path.join(out,'classification-patch-1950-2699.mp4')});
    console.log('CLASSIFICATION PATCH COMPLETE');
  }
}else if(mode==='full'){
  const comp=await selectComposition({...opt,id:'ChapterV9-1080',inputProps:props});
  await renderMedia({...opt,composition:comp,inputProps:props,frameRange:[0,comp.durationInFrames-1],muted:true,codec:'h264',crf:20,imageFormat:'jpeg',jpegQuality:92,concurrency:6,outputLocation:path.join(out,'第一章_看见与选择_V9_无声1080p.mp4')});
  console.log('FULL VIDEO COMPLETE');
}
