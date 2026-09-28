import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {FilmV18} from './FilmV18';
import timeline from './timeline-v15.json';
registerRoot(()=> <Composition id="Chapter02-V18-1080" component={FilmV18}
  width={1920} height={1080} fps={30} durationInFrames={timeline.duration}
  defaultProps={{audio:true,clean:false}}/>);
