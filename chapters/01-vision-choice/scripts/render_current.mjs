// Full current composition, including its verified master audio. No patch assembly required.
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia, renderStill} from '@remotion/renderer';
const root=process.cwd(), mode=process.argv[2]||'stills';
if(!['stills','intro','full'].includes(mode)) throw new Error('Use stills, intro or full');
const out=path.join(root,'output/current');fs.mkdirSync(out,{recursive:true});
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts'),publicDir:path.join(root,'public')});
const options={serveUrl,chromiumOptions:{gl:'angle'},logLevel:'error'};
const composition=await selectComposition({...options,id:'ChapterV9-1080'});
if(mode==='stills'){
  for(const frame of [150,900,2000,2280,2480,15000,30000,44000,52000,59500]){
    await renderStill({...options,composition,inputProps:{audio:false},frame,imageFormat:'jpeg',output:path.join(out,`frame-${frame}.jpg`)});
    console.log('STILL',frame);
  }
}else{
  let last=-1;
  await renderMedia({...options,composition,inputProps:{audio:true},frameRange:mode==='intro'?[0,2699]:undefined,
    codec:'h264',crf:20,imageFormat:'jpeg',jpegQuality:92,concurrency:4,audioCodec:'aac',audioBitrate:'320k',timeoutInMilliseconds:120000,
    outputLocation:path.join(out,mode==='intro'?'第一章_V9_片头90秒_1080p.mp4':'第一章_看见与选择_V9_1080p.mp4'),
    onProgress:({progress})=>{const p=Math.floor(progress*100);if(p!==last&&p%5===0){last=p;console.log('RENDER',p+'%');}}});
}
