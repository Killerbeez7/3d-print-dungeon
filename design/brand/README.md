# Brand sources

Everything needed to regenerate the logo, the die and the print-head intro. Nothing in this
folder ships to the site; the generated files land in `src/` and `public/`.

The design explorations (all logo rounds, the die board and the interactive intro prototype)
live on the logo canvas: https://claude.ai/artifact/YXZPzuJjAnSTjaFKLLHo6T

## What is here

| File | What it does |
| --- | --- |
| `print-dungeon-intro-1080p.mp4` | The print-head intro as a video (1920 x 1080, 60 fps, 6.6 s) |
| `die-rolling-1080.mp4` | The header die: quarter turns and a throw (1080 x 1080, 60 fps, 8.3 s seamless loop) |
| `die-loader-1080.mp4` | The loading die: thrown over and over (1080 x 1080, 60 fps, 5 s seamless loop) |
| `die/render-die-videos.cjs` | Renders both die videos with the site's faces, angles, timings and easings |
| `intro/engine.js` | The intro animation (prototype version, used for the video and the canvas board) |
| `intro/data.json` | Wordmark and die-face outlines the prototype draws |
| `intro/render-video.cjs` | Renders the video from `engine.js` |
| `intro/site/` | The site version of the intro (React component + TypeScript engine), not in use |
| `scripts/make_logo_assets.py` | Writes `src/features/shared/components/brandPaths.ts`: the "3D PRINT / DUNGEON" wordmark, DUNGEON in Chakra Petch Bold and "3D PRINT" in Geist Mono |
| `scripts/make_die_assets.py` | Writes `src/features/shared/components/dieFaces.ts` and the tab icon `public/assets/icons/pd-die-v4.svg` |
| `scripts/die_icons.cjs` | Renders the PNG tab and home-screen icons from the die |
| `scripts/wordmark_letters.py` | The earlier DUNGEON (Unbounded with a redrawn E and G); the intro in `intro/` still draws this version |
| `fonts/ChakraPetch-Bold.ttf` | The wordmark font (SIL Open Font License 1.1, `fonts/ChakraPetch-OFL.txt`); only the outlines ship |
| `scripts/die_faces.py`, `scripts/maze.py` | The six die faces; the maze is a seeded 6 x 6 perfect maze |
| `scripts/fontword.py`, `scripts/lockups.py`, `scripts/geo.py` | Shared helpers (font outlines, path transforms, geometry) |

The intro is not on the site for now. Its site version is kept in `intro/site/`: `printIntro.ts`
(a TypeScript port of `intro/engine.js`, colours from theme tokens, no background) and
`PrintIntro.tsx` (plays once per browser session at 1.3x, click to skip, finished logo for reduced
motion). To use it, move both files to `src/features/home/intro/` and put `<PrintIntro />` in the
homepage hero. Keep it in step with `intro/engine.js` when changing the motion.

## Regenerating

```sh
npm install                      # the scripts read Geist Mono and Unbounded from node_modules
pip install shapely fonttools brotli uharfbuzz skia-pathops
python3 design/brand/scripts/make_logo_assets.py
python3 design/brand/scripts/make_die_assets.py
node design/brand/scripts/die_icons.cjs
node design/brand/intro/render-video.cjs       # needs ffmpeg
node design/brand/die/render-die-videos.cjs    # needs ffmpeg
```

`/assets` is cached for a year, so a changed icon needs a new file name (and the link in
`index.html` updated).
