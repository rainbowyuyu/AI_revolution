import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
const root=process.cwd(),out=path.join(root,'output/v11'),mode=process.argv[2]||'stills';
const timeline=JSON.parse(fs.readFileSync('src/timeline-v11.json','utf8'));
fs.mkdirSync(out,{recursive:true});
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts'),publicDir:path.join(root,'public'),outDir:path.join(out,'bundle'),webpackOverride:c=>({...c,cache:false})});
const options={serveUrl,chromiumOptions:{gl:'angle'},logLevel:'error'};
const composition=await selectComposition({...options,id:'TrailerV11-1080'});
if(mode==='stills'){
 for(const frame of [75,210,360,440,490,620,760,910,970,990,timeline.literatureFrom+15,timeline.literatureFrom+100,timeline.literatureFrom+300,timeline.duration-35]){
  await renderStill({...options,composition,inputProps:{audio:false},frame,output:path.join(out,`frame-${frame}.jpg`),imageFormat:'jpeg'});
  console.log('STILL',frame);
 }
}else{
 const range=mode==='intro'?[0,timeline.opening+89]:mode==='papers'?[timeline.literatureFrom-60,timeline.duration-1]:undefined;
 let last=-1;
 await renderMedia({...options,composition,inputProps:{audio:true},frameRange:range,codec:'h264',crf:20,imageFormat:'jpeg',jpegQuality:92,concurrency:6,audioCodec:'aac',audioBitrate:'320k',timeoutInMilliseconds:120000,outputLocation:mode==='full'?path.join(root,'output/AI进化史_V11_预览1080p.mp4'):path.join(out,`V11_${mode==='intro'?'片头':'文献汇总'}预览1080p.mp4`),onProgress:({progress})=>{const p=Math.floor(progress*100);if(p!==last&&p%5===0){console.log('RENDER',mode,p+'%');last=p}}});
 console.log('COMPLETE',mode);
}
