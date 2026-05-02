# Color Refinement Report

## What Felt Wrong After The First Update

- The dark theme became too close to pure black, which made large areas feel empty and flat.
- Neutralization removed too much atmosphere, so the UI lost depth and brand character.
- The purple accent read like a default Tailwind violet instead of a custom premium identity.
- The navbar blended into the page background and needed clearer persistent-chrome separation.
- Cards were more readable after the first pass; the goal was to preserve that and add subtle depth, not add loud color.

## Tokens Changed

Dark theme layer separation was lifted from near-black into a graphite stack:

| Token | New Value | Use |
| --- | --- | --- |
| `--bg-page` | `#0b0b0f` | Page foundation |
| `--bg-section` | `#111218` | Large sections and persistent chrome |
| `--bg-muted` | `#151821` | Muted blocks, skeletons, subtle controls |
| `--surface-card` | `#1a1d26` | Default cards and inputs |
| `--surface-elevated` | `#212432` | Dropdowns, modals, overlays |
| `--br-subtle` | `#252934` | Subtle dividers |
| `--br-secondary` | `#303541` | Default borders |
| `--br-primary` | `#414757` | Strong borders |

Purple identity was updated to a custom controlled accent:

| Token | Dark Value | Light Value |
| --- | --- | --- |
| `--accent-dark` | `#6b4eff` | `#5d3df5` |
| `--accent` | `#7c5cff` | `#6b4eff` |
| `--accent-hover` | `#9277ff` | `#5538e8` |
| `--accent-text` | `#cbc2ff` | `#4f35d5` |
| `--accent-soft` | `#19162a` | `#f1efff` |
| `--accent-muted` | `#25213f` | `#e4ddff` |

Added a subtle global brand atmosphere through `--ambient-brand`, applied to the page background with a low-opacity radial gradient. It is intentionally global and restrained rather than repeated as one-off section decoration.

## Components And Styles Adjusted

- `src/styles.css`: refined dark graphite layers, updated purple identity, added ambient brand background, and added token usage comments/rules.
- `src/features/shared/navbar/Navbar.tsx`: changed header to `bg-bg-section/95`, added bottom border, subtle shadow, backdrop blur, and moved dropdowns to `surface-elevated`.
- `src/features/home/components/CarouselCard.tsx`: preserved overlay readability and added semantic border/shadow depth.
- `src/features/home/components/HomeModelsGrid.tsx`: added subtle card border/shadow, retained readable overlays, and kept accent treatment limited to hover/indicator details.
- `src/features/home/utils/getBadgeColorClass.tsx`: made primary/accent badges livelier with compact accent treatment while keeping large surfaces neutral.

## Intentionally Preserved

- The cleaner neutral-first direction from the first update.
- Improved carousel/card readability.
- Purple remains limited to CTAs, active states, links, focus rings, badges, and small selected/highlight details.
- Light theme structure remains stable; only the purple identity was aligned.
- No layout, spacing, or component structure changes were made.

## Accessibility / Verification

Core contrast checks after refinement:

- Light primary text on page: `16.87:1`
- Light secondary text on page: `7.11:1`
- Light accent text on page: `7.05:1`
- Light primary button text on fill: `5.05:1`
- Dark primary text on page: `17.87:1`
- Dark secondary text on page: `11.59:1`
- Dark muted text on page: `6.60:1`
- Dark accent text on page: `11.88:1`
- Dark primary button text on fill: `5.05:1`
- Dark focus color on page: `5.90:1`

`npm run build` completed successfully. The build still logs a restricted-network warning from `vite-plugin-webfont-dl` because `fonts.gstatic.com` cannot be resolved in this environment, but the build exits successfully.

## Remaining Manual Visual Review

- Forum legacy screens still contain several raw Tailwind gray/blue utilities.
- Model upload and model viewer controls still use some media/canvas overlay colors intentionally; verify against real model content.
- Seller verification/payment modal still has a blue-to-purple icon gradient and light hardcoded surfaces.
- Admin/test panels still contain lower-priority raw utility colors.
- The ambient gradient should be reviewed on very tall pages to confirm it adds top-area atmosphere without making lower content feel tinted.
