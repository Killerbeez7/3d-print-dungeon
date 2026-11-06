# Stash: things we built and set aside

This branch holds no app code, only this index (and a few small files under `snapshots/`). Every
item has a **tag** that points at the code exactly as it was, so nothing is lost even if the
branch it was made on is deleted. The live work happens on `claude/redesign-v2`.

- See an item: GitHub → the tag (e.g. `stash/roll-for-a-model`) → browse files, or
  `git show stash/roll-for-a-model`.
- Bring one back: tell Claude "bring back `stash/<name>`". By hand: on `claude/redesign-v2`,
  `git cherry-pick <commit>` (or `git revert <undo commit>` where one is listed), then test as usual.
- Set something aside: tag its commit `stash/<short-name>` (annotated, with a one-line
  description), push the tag, and add a row here.

## Features

| Tag | What it is | Commit | Bring back |
| --- | --- | --- | --- |
| `stash/roll-for-a-model` | Roll for a model: throw the die, get a random model | `7c1a0a5` | `git revert 7f32f1f` |
| `stash/print-details` | Model page: print size, volume and a 28 mm scale check from the model file | `1daa378` | `git cherry-pick 1daa378` (never merged) |
| `stash/new-features-branch` | Branch `claude/new-features` as it was: currency setting, Makes, print details, Roll (earlier versions of what's now on redesign-v2) | `4a2c37d` | Reference only |

## Logo, animation and style

| Tag | What it is | Commit | Bring back |
| --- | --- | --- | --- |
| `stash/homepage-print-intro` | Homepage hero led by the print-head intro (die folds into a print head and prints the name), headline "Models for your tabletop" | `7c49660` | The intro is on the coming-soon page now (`src/features/prelaunch/intro/`); for the homepage put `<PrintIntro />` (plays once per session) in `HomeHero.tsx` |
| `stash/coming-soon-layer-logo` | Coming-soon logo that prints in layer by layer (CSS only), before the print-head intro | `f95d5ca` | `snapshots/coming-soon-layer-logo/` |
| `stash/header-die-looks-around` | The header die sways left and right on its own | `44871fc` | `git revert 9f0ab77` (also brings back soft buttons) or `git cherry-pick 44871fc` |
| `stash/soft-buttons-b1` | Softer buttons: gentler gradient, smaller cut corners, quiet secondary | `d8e85a0` | `git cherry-pick d8e85a0` |
| `stash/logo-layered-keep` | Logo: the layered keep, with tab and home-screen icons | `a9d5898` | Reference |
| `stash/logo-keep-dragon-eye` | Logo: keep badge, DUNGEON with a dragon-eye O | `f793c72` | Reference |
| `stash/logo-keep-plain-o` | Logo: keep badge, DUNGEON with a plain O | `f52eb45` | Reference |
| `stash/wordmark-unbounded` | Wordmark: DUNGEON in Unbounded with a redrawn E and G (before Chakra Petch) | `559098a^` | Reference; the generator is `design/brand/scripts/wordmark_letters.py` |

Also kept on `claude/redesign-v2`, not in this list because they never left: `design/brand/`
(logo, die and intro sources, the intro and die videos) and the logo explorations canvas,
https://claude.ai/artifact/YXZPzuJjAnSTjaFKLLHo6T

## Ideas, not built yet

From the 5 Nov 2026 brainstorm (sizes are rough):

1. Filters mini printers search by: pre-supported, resin/FDM, scale (28/32/75 mm, bust), single or set (small)
2. "Open in slicer" (Bambu Studio, OrcaSlicer, PrusaSlicer) and the creator's tested print settings (medium)
3. Print check on upload: holes, inside-out faces, size, thin walls; a "Print check passed" badge (medium)
4. Bundles and sale prices, priced on the server (medium)
5. Personal vs commercial licence (medium)
6. Artist memberships: monthly subscription for an artist's new releases; needs creator payouts first (large)
7. Per-model stats for creators: views → downloads → sales (small to medium)
8. Monthly print challenge using Makes photos, with a winner badge (small to medium)
9. Wishlist with sale and new-release alerts (medium)
10. Remix credits: "Remix of …" links and a Remixes row (small)

Preview defense (turntable frames for paid models, etc.) is in `TODO.md` on `claude/redesign-v2`.
