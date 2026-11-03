# Brand sources

Everything needed to regenerate the logo, the die and the print-head intro. Nothing in this
folder ships to the site; the generated files land in `src/` and `public/`.

The design explorations (all logo rounds, the die board and the interactive intro prototype)
live on the logo canvas: https://claude.ai/artifact/YXZPzuJjAnSTjaFKLLHo6T

## What is here

| File | What it does |
| --- | --- |
| `print-dungeon-intro-1080p.mp4` | The print-head intro as a video (1920 x 1080, 60 fps, 6.6 s) |
| `intro/engine.js` | The intro animation (prototype version, used for the video and the canvas board) |
| `intro/data.json` | Wordmark and die-face outlines the prototype draws |
| `intro/render-video.cjs` | Renders the video from `engine.js` |
| `scripts/make_logo_assets.py` | Writes `src/features/shared/components/brandPaths.ts` (the "3D PRINT / DUNGEON" wordmark) |
| `scripts/make_die_assets.py` | Writes `src/features/shared/components/dieFaces.ts` and the tab icon `public/assets/icons/pd-die-v4.svg` |
| `scripts/die_icons.cjs` | Renders the PNG tab and home-screen icons from the die |
| `scripts/wordmark_letters.py` | Outlines DUNGEON from Unbounded and redraws the E (straight spine) and G (no spur) |
| `scripts/die_faces.py`, `scripts/maze.py` | The six die faces; the maze is a seeded 6 x 6 perfect maze |
| `scripts/fontword.py`, `scripts/lockups.py`, `scripts/geo.py` | Shared helpers (font outlines, path transforms, geometry) |

The site's version of the intro is `src/features/home/intro/printIntro.ts` (TypeScript port of
`intro/engine.js`, colours from theme tokens, no background). Keep the two in step when changing
the motion.

## Regenerating

```sh
npm install                      # the scripts read the fonts from node_modules
pip install shapely fonttools brotli uharfbuzz skia-pathops
python3 design/brand/scripts/make_logo_assets.py
python3 design/brand/scripts/make_die_assets.py
node design/brand/scripts/die_icons.cjs
node design/brand/intro/render-video.cjs   # needs ffmpeg
```

`/assets` is cached for a year, so a changed icon needs a new file name (and the link in
`index.html` updated).
