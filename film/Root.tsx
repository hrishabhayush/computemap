import {Composition,Series} from 'remotion';
import {FilmScene} from './kit';
import {frames,sceneDefs} from './scenes';
// Scenes hold functions, which Remotion's JSON props would drop — so each composition closes over its scene instead.
const views=sceneDefs.map(d=>()=><FilmScene def={d}/>);
const Film=()=><Series>{sceneDefs.map(d=><Series.Sequence key={d.id} durationInFrames={frames(d)}><FilmScene def={d}/></Series.Sequence>)}</Series>;
export const RemotionRoot=()=><>
 {sceneDefs.map((d,i)=><Composition key={d.id} id={d.id} component={views[i]} durationInFrames={frames(d)} fps={30} width={1920} height={1080}/>)}
 <Composition id="FullFilm" component={Film} durationInFrames={sceneDefs.reduce((a,d)=>a+frames(d),0)} fps={30} width={1920} height={1080}/>
</>;
