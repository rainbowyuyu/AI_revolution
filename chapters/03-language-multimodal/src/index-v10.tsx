import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {FilmV10} from './v10/Film';
import timeline from './v10/timeline.json';
const Root=()=> <Composition id='Chapter03-V10-1080' component={FilmV10} fps={30} width={1920} height={1080} durationInFrames={timeline.durationFrames} defaultProps={{audio:true,clean:false}}/>;
registerRoot(Root);
