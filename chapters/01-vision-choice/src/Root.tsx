import React from 'react';
import {Composition} from 'remotion';
import {Film,FilmProps} from './Film';
import {FontGate} from './FontGate';
import timeline from './timeline.json';
import data from './experiments.json';
import {Teaching} from './scenes/Teaching';
import {FilmV5} from './OpeningV5';
import opening from './opening-v5.json';
import v7 from './timeline-v7.json';
import {FilmV7} from './FilmV7';
import v8 from './timeline-v8.json';
import {FilmV8} from './FilmV8';
import {OpeningV8} from './OpeningV8';
import v9 from './timeline-v9.json';
import {FilmV9} from './FilmV9';
import {OpeningV9} from './OpeningV9';
const LoadedV7=(p:{audio?:boolean})=><FontGate><FilmV7 {...p}/></FontGate>;
const LoadedV8=(p:{audio?:boolean})=><FontGate><FilmV8 {...p}/></FontGate>;
const LoadedV9=(p:{audio?:boolean})=><FontGate><FilmV9 {...p}/></FontGate>;
const LoadedV5=(p:{audio?:boolean})=><FontGate><FilmV5 {...p}/></FontGate>;
const LoadedV6=(p:{audio?:boolean})=><FontGate><FilmV5 {...p} overview/></FontGate>;
const MotionAudit=({beatIndex,progress}:{beatIndex:number;progress:number})=>{const b=timeline.beats[beatIndex];return <FontGate><div style={{width:1320,height:610,background:'#07121a',fontFamily:'NotoSansSC'}}><Teaching beat={b} f={Math.round(30+progress*(b.duration-80))} duration={b.duration} data={data}/></div></FontGate>};
const Loaded=(p:FilmProps)=><FontGate><Film {...p}/></FontGate>;
export const Root=()=> <>
 <Composition id="ChapterV7-1080" component={LoadedV7} width={1920} height={1080} fps={30} durationInFrames={v7.duration} defaultProps={{audio:true}}/>
 <Composition id="ChapterV8-1080" component={LoadedV8} width={1920} height={1080} fps={30} durationInFrames={v8.duration} defaultProps={{audio:true}}/>
 <Composition id="ChapterV9-1080" component={LoadedV9} width={1920} height={1080} fps={30} durationInFrames={v9.duration} defaultProps={{audio:true}}/>
 <Composition id="OpeningV8-1080" component={()=><FontGate><OpeningV8/></FontGate>} width={1920} height={1080} fps={30} durationInFrames={v8.opening} defaultProps={{}}/>
 <Composition id="OpeningV9-1080" component={()=><FontGate><OpeningV9/></FontGate>} width={1920} height={1080} fps={30} durationInFrames={v9.opening} defaultProps={{}}/>
 <Composition id="ChapterV6-1080" component={LoadedV6} width={1920} height={1080} fps={30} durationInFrames={opening.total} defaultProps={{audio:true}}/>
 <Composition id="OpeningV6-1080" component={LoadedV6} width={1920} height={1080} fps={30} durationInFrames={opening.duration+240} defaultProps={{audio:true}}/>
 <Composition id="ChapterV5-1080" component={LoadedV5} width={1920} height={1080} fps={30} durationInFrames={opening.total} defaultProps={{audio:true}}/>
 <Composition id="OpeningV5-1080" component={LoadedV5} width={1920} height={1080} fps={30} durationInFrames={opening.duration+240} defaultProps={{audio:true}}/>
 <Composition id="MotionAudit" component={MotionAudit} width={1320} height={610} fps={30} durationInFrames={1} defaultProps={{beatIndex:0,progress:.5}}/>
 <Composition id="Chapter1080" component={Loaded} width={1920} height={1080} fps={30} durationInFrames={timeline.duration} defaultProps={{clean:false,audio:true}}/>
 <Composition id="Chapter4K" component={Loaded} width={3840} height={2160} fps={30} durationInFrames={timeline.duration} defaultProps={{clean:false,audio:true}}/>
 <Composition id="Clean" component={Loaded} width={1920} height={1080} fps={30} durationInFrames={timeline.duration} defaultProps={{clean:true,audio:false}}/>
</>;
