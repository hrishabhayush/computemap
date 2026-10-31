# AI Atlas — context for coding agents

AI Atlas is an interactive 3D map of the physical stack behind an AI prompt: a laptop, Wi‑Fi, fiber, a data center, racks, a GPU server, software, power, cooling and chip fabrication. It has two outputs that share the same 3D world:

1. **Playground**: a Vite + React 19 + React Three Fiber site. Live at https://hrishabhayush.github.io/computemap/, deployed by GitHub Actions on every push to `main`.
2. **Film**: a roughly 4:40 explainer video rendered with Remotion. It reuses the playground's `World` and uses ElevenLabs for narration.

Repo: `git@github.com:hrishabhayush/computemap.git`. Default branch: `main`.

## Commands

```bash
npm run dev            # playground at http://127.0.0.1:5173
npm run build          # tsc + vite build (CI runs this)
npm run check          # validates graph/exploration data (src/graph.check.ts)
npm run film           # Remotion Studio: scrub scenes s01–s12 and FullFilm (port 3123)
npm run film:render    # full film → film/out/ai-atlas-film-1080p.mp4 (~4 min)
npm run film:narration # regenerate missing narration clips + word timings (ElevenLabs)
npx remotion still s07 film/out/x.png --frame=575   # quick check of one frame
```

## Layout

- `src/graph.ts`: every component (id, name, summary, sources) plus the old prompt `journey`. Labels show `name`. Short forms use the pattern "Host processor · CPU".
- `src/exploration.ts`: `focus` tree (position, width, parent, parts), station anchors `A`, `at()`, and `spread(id)` for world positions. `SPREAD` pushes stations apart.
- `src/Scene.tsx`: the whole 3D world, written in a dense one-line style (match it). Contains:
  - `World` (scene without camera), the default `Scene` (Canvas + orbit camera), and `partLabelLayout()` (shared label placement).
  - `FilmClock` / `FilmEmphasis` contexts: when the film sets them, animations become pure functions of the frame, and the talked-about part scales up.
- `src/App.tsx`: map-only UI with small icon buttons (back / show all / reset / explode). Esc goes back.
- `src/style.css`: Tailwind plus layered style blocks. The latest blocks at the bottom win.
- `film/`:
  - `script.ts`: **source of truth for narration**.
  - `narration.mjs`: makes per-line MP3s + `index.json` word timings.
  - `kit.tsx`: camera keyframes, packets, chat screen, label overlay and `FilmScene`.
  - `scenes.tsx`: the 12 scenes, cued to narration words with `T.sXX.at(line,'word')`.
  - `Root.tsx`: compositions.
  - `labels.css`: label styles at 1080p.
  - `film/script.md` and `film/scene1/` are older drafts. Ignore them.
- `remotion.config.ts`: entry `film/index.ts`, public dir `film/public`, ports 3123/3124 (3000 is used by another app).
- `.github/workflows/pages.yml`: GitHub Pages deploy. Vite `base:'./'`.

## Design decisions (keep these)

- **Clay look:** matte materials, no tone mapping (`Canvas flat`), exact Figma palette hexes written at each call site. Cream plinths `#F3E9DC`. Resource colours: data `#0A9B6E`, power `#E7A93B`, cooling `#4FA3E0`. Figma concepts live at https://www.figma.com/design/SPNcTCdVQnmwARvbB4HflF.
- **Labels:** white pills with a coloured dot, leader line to an anchor dot, spread evenly round a ring sized to the system. A view only labels its own children (`focus[id].parent===owner`).
- **Camera:** clicking a leaf part doesn't move the camera. It only moves when a label opens a deeper level with more labels. Zoom fits the label ring (`ZOOM_IN`, `w+5` margins).
- **Electrical vs Energy:** kept as separate stations. Energy = off-site plants + grid. Electrical = on-site transformer, switchgear, UPS, generators.
- **Film labels:** drawn as a 2D overlay projected from the film camera (`PartLabelOverlay`), not drei `<Html>`, which doesn't update during Remotion capture.
- **Film transitions:** each scene opens on the previous scene's last camera (continuity in `scenes.tsx`).
- **Remotion gotchas:**
  - Compositions must close over scene defs, never pass them as props; functions get dropped by JSON serialization.
  - Don't name a composition `Film`: on case-insensitive macOS it collides with the `film/` folder.
- **Narration voice:** ElevenLabs "Jessica Anne Bogart – A VO Professional" (`lxYfHSkYm1EzQzGhdbfc`), model `eleven_v4`. To change a line: edit `film/script.ts`, delete that line's `film/public/narration/sXX-N.mp3` + `.json`, then run `npm run film:narration`.

## Secrets

`ELEVENLABS_API_KEY` lives in `.env.local` (gitignored). Never print it, commit it or put it in code. Load it with `node --env-file=.env.local`.

## User preferences

- Commit messages are 4–7 words with **no** Claude/AI co-author trailer.
- Show the visual result: take screenshots or render stills and check them before saying something is done.
- Prefer small diffs that match the existing code style.

## State as of 2026-10-30

- `main` = `a9db313` (clay map, Figma labels, Pages deploy). Live site matches `main`.
- **Uncommitted on `main`:**
  - Leaf clicks don't zoom (`src/App.tsx`, `Camera` in `src/Scene.tsx`).
  - Short-form names (CPU, NIC, PSU, HBM, ToR, CDU, ASIC, ISP) in `src/graph.ts`.
  - Film refactors in `src/Scene.tsx` (`World`, `FilmClock`, `FilmEmphasis`, `partLabelLayout`, numeric `exploded`, `screen`/`view`/`partLabels`/`wifiFrom` props).
  - The whole `film/` folder, `remotion.config.ts`, and the Remotion + ElevenLabs deps.
  - Suggested commits: (1) playground changes, (2) film.
- Latest film render: `film/out/ai-atlas-film-1080p.mp4` (1080p, 4:42, no end title card). `film/out/` is gitignored; older drafts are in `film/out/old/`.

## Open items / ideas

- **Film:** scene 5's server parts snap instead of sliding out. There's no music or extra sound effects yet. Scene 8 says "coal" but there's no coal plant. The 17% / 50% stats come from the user's script and haven't been checked against a source.
- **Rack realism:** the model lacks an NVLink spine, busbar/PDU, management switch/BMC, and multiple compute trays per rack.
- **Playground:** some labels overlap in busy views. The prompt-journey UI was removed; the `journey` data still exists in `graph.ts`.
