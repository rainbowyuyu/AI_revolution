import path from 'node:path';
import {selectComposition,renderStill} from '@remotion/renderer';
const options={serveUrl:path.join(process.cwd(),'output/v11/bundle'),chromiumOptions:{gl:'angle'},logLevel:'error'};
const composition=await selectComposition({...options,id:'TrailerV11-1080'});
for(const frame of [300,350,412,467,980,997,5360,5577]){
 await renderStill({...options,composition,inputProps:{audio:false},frame,output:`output/v11/final-check-${frame}.jpg`,imageFormat:'jpeg'});
 console.log('CHECK FRAME',frame);
}
