import {Config} from '@remotion/cli/config';
// The film lives in film/; its audio and assets in film/public (kept out of the site's build).
Config.setEntryPoint('./film/index.ts');
Config.setPublicDir('./film/public');
Config.setChromiumOpenGlRenderer('angle');
// Port 3000 is often taken by other local apps.
Config.setStudioPort(3123);
Config.setRendererPort(3124);
