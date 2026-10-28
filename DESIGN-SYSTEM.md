# 3D Print Dungeon — Design system ("The Forge")

The look borrows from the printer itself: layer lines, the build-plate grid, a nozzle that
sweeps across tiles, parts that "print in" bottom-up while they load, and cut (chamfered)
corners instead of soft pills. Obsidian surfaces, an arcane violet accent and a molten ember
highlight for prices and live states.

Source of truth for tokens: `src/styles.css` (`:root` = light, `[data-theme="dark"]` = dark,
`@theme inline` maps them to Tailwind utilities). Dark is the default theme. Every rule below
applies to both themes; `data-theme="dark"` on a section forces it dark (Home hero).

## Colour tokens

Use the utility in the first column; never raw Tailwind palette colours (`red-500`,
`gray-400`, `white`, `black`) or hex values in components.

| Utility | Token | Light | Dark | Use for |
| --- | --- | --- | --- | --- |
| `bg-page` | `--bg-page` | `#f6f6f7` | `#0a0a0c` | Page background, anything pinned to a screen edge |
| `bg-section` | `--bg-section` | `#ffffff` | `#0f0f12` | Mastheads, bands, dialog footers |
| `bg-muted` | `--bg-muted` | `#ececef` | `#17171c` | Quiet fills, hover rows, skeleton base |
| `bg-surface-card` | `--surface-card` | `#ffffff` | `#141418` | Cards, panels, dialogs |
| `bg-surface-elevated` | `--surface-elevated` | `#f1f1f3` | `#1c1c22` | Dropdowns, popovers |
| `bg-surface-overlay` | `--surface-overlay` | 62% ink | 78% ink | Dialog backdrops (with `backdrop-blur-sm`) |
| `text-txt-primary` | `--txt-primary` | `#0d0d10` | `#f4f4f6` | Body text, headings |
| `text-txt-secondary` | `--txt-secondary` | `#474753` | `#b4b4bf` | Supporting text |
| `text-txt-muted` | `--txt-muted` | `#62626f` | `#8b8b98` | Meta text, captions, mono labels |
| `bg-btn-primary` + `text-btn-primary-text` | `--btn-primary` | `#5b3ef0` | `#6d4dff` | Solid violet fills with white text |
| `text-accent`, `border-accent`, `bg-accent/10` | `--accent` | `#5534e8` | `#a48dff` | Accent text, active markers, tints |
| `bg-accent-soft` | `--accent-soft` | `#efebff` | `#1b1630` | Selected chips, icon tiles |
| `text-ember` | `--ember` | `#b4380b` | `#ff7a45` | Prices and "new" counts as text |
| `bg-ember-fill` + `text-ember-on` | `--ember-fill` | `#ff6b35` | `#ff6b35` | Price tags, the "Buy" button |
| `border-br-subtle` / `-secondary` / `-primary` | `--br-*` | `#e4e4e8` / `#d4d4da` / `#a1a1ac` | `#1f1f26` / `#2a2a33` / `#3b3b46` | Dividers and card edges (decorative) |
| `border-br-input`, `bg-br-input` | `--br-input` | `#82828e` | `#6b6b7a` | Input borders and switch tracks (3:1+) |
| `text-success` / `-warning` / `-error` / `-info` | status | `#15803d` / `#b45309` / `#dc2626` / `#2563eb` | `#34d399` / `#fbbf24` / `#fb7185` / `#60a5fa` | Status text and icons; tints via `/10`–`/15` |
| `outline-focus` | `--focus` | `#5534e8` | `#b3a3ff` | Focus outlines |
| `bg-scrim`, `text-on-scrim` | fixed | `#08080c` / `#ffffff` | same | Text and controls on photos and the 3D viewer (stay dark in both themes) |
| `shadow-popover` | `--popover-shadow` | soft | deep | Menus, dropdowns, dialogs |

Rules:

- Solid violet fills with text use `bg-btn-primary`, never `bg-accent`.
- Text contrast is at least 4.5:1 (3:1 for large text, input borders and icons).
- Captions on images use `from-scrim/85` gradients with `text-on-scrim`, not `black`/`white`.

## Typography

| Family | Utility | Use for |
| --- | --- | --- |
| Unbounded (variable) | `font-display` (h1/h2 by default) | Page titles, section titles, tile names. Short text only. |
| Geist (variable) | `font-sans` | All UI and body text. Use `font-sans` on h2/h3 inside cards and rows. |
| Geist Mono (variable) | `font-mono`, `.label-mono` | Eyebrows, metadata, counts, prices, file info, keyboard hints |

- Fonts are bundled with `@fontsource-variable/*` (imported in `src/main.tsx`); no Google Fonts.
- Page pattern: `.label-mono text-accent` eyebrow, then the h1 (`text-3xl sm:text-4xl` or
  `sm:text-5xl` in mastheads), then a `text-txt-secondary` description.
- One `<h1>` per page; headings descend without skipping levels.

## Shape

- **Chamfer**: `.chamfer` cuts the top-left and bottom-right corners; set the size with
  `[--cut:Npx]` (6–20px). Used on buttons, avatars, icon tiles, price tags, skeleton avatars.
- **Radius scale** (deliberately tight): `rounded-sm` 2px, `rounded-md` 3px (small controls,
  icon buttons), `rounded-lg` 4px (inputs, rows), `rounded-xl` 6px (cards, panels, dialogs),
  `rounded-2xl` 10px (bottom sheets), `rounded-full` (switches, dots, avatar badges only).

## Buttons and fields

- **Button** (`src/components/Button.tsx`) or `buttonClassName({ variant, size })` for links.
  Variants: `primary` (one per view), `secondary` (outlined edge), `ghost`, `ember` (buy/pay),
  `danger` (destructive, outlined in error). Sizes `sm` / `md` / `lg`. Built on `.btn`: a
  chamfered fill with a sheen sweep on hover; the focus outline sits outside the shape.
- **Fields**: `.field` on every input, select and textarea (border `--br-input`, accent focus
  ring, `aria-invalid="true"` turns the border red). Size with `h-10` / `h-11` / `h-12` or `py-3`.
  Labels: `mb-1.5 block text-sm font-medium text-txt-secondary`. Errors sit under the field
  with an id referenced by `aria-describedby`.
- **Switches**: a visually hidden checkbox with `role="switch"` + a `peer` track
  (`bg-br-input`, `peer-checked:bg-btn-primary`) and a `bg-page` knob.

## Motion and texture

All motion respects `prefers-reduced-motion`. Easing: `ease-forge` (`cubic-bezier(.16,1,.3,1)`).

| Class | What it does | Where |
| --- | --- | --- |
| `.skeleton-print` | Loading block that fills bottom-up, layer by layer | Every skeleton, the `Spinner` |
| `.reveal-print` / `.reveal-up` | Scroll-driven print-in / rise-in | Gallery tiles, artist cards |
| `.tile-scan` | A glowing nozzle line sweeps down on hover (needs a `.group` parent) | Gallery tiles, category tiles |
| `.tile-caption` | Caption shown on touch, revealed on hover elsewhere | Gallery tiles |
| `.scroll-progress` | Thin progress line under the header | Navbar |
| `.hero-print`, `.marquee` | Hero art prints in; category ticker | Home hero |
| `.auth-panel` | Bottom sheet on phones, pop-in from `md` | All dialogs |
| `.bg-layer-lines` | Fine horizontal layer lines | Mastheads, covers |
| `.bg-buildplate` (+ `.fade-radial`) | Build-plate grid, optionally faded at the edges | Empty states, dropzones, tiles |

## Layout components

- **PageHeader** (`features/shared/components`): masthead band (eyebrow, title, description,
  `aside` slot, optional children). List and content pages.
- **StatePanel**: icon tile + title + text + actions. Every empty, error, not-found and
  sign-in-required state (`headingLevel="h2"` inside pages that have their own h1).
- **ModelCard / HomeModelsGrid**: edge-to-edge gallery with 4px gaps; use for every model grid.
- **ArtistCard**: generated cover from the username (`profileCoverBackground`), chamfered avatar.
- **Forum UI** (`features/forum/components/ForumUI.tsx`): `ForumHeader`, `ForumTabs`,
  `ThreadRow`, `ThreadListSkeleton`, `ForumAvatar`, `ForumFormShell`.
- **PolicyLayout + `.prose-doc`**: legal documents with numbered sections.
- **Tabs**: underline tabs, `role="tab"` + `aria-selected`; the active line scales in from
  the left (`after:scale-x-100`).
- **Dialogs**: fixed wrapper, `bg-surface-overlay backdrop-blur-sm` backdrop, `FocusLock`,
  panel with `.auth-panel` and `shadow-popover`, Escape closes, `role="dialog"` or
  `alertdialog` with `aria-labelledby`.
- **Containers**: wide pages `max-w-[1600px] px-4 sm:px-6 lg:px-8`; forms `max-w-3xl`;
  reading `max-w-4xl` / `.prose-doc` (70ch). No horizontal scroll at 360px.

## Icons

`lucide-react` only (Font Awesome and react-icons were removed). `size-4` inline with text,
`size-5` in icon buttons. Decorative icons get `aria-hidden="true"`; icon-only buttons need
`aria-label`.

## Focus and accessibility

- Global `:focus-visible` outline in `--focus`; `.btn` offsets it by 3px. Never remove the
  outline without a visible replacement (`.field` uses a ring).
- Hover-only controls (reply actions, tile tools) stay visible on touch screens
  (`[@media(hover:hover)]:opacity-0`) and appear on `focus-visible`.
- Every data view has loading (skeleton), empty and error states.

## Mobile browser chrome

iPhone Safari takes its top and bottom bar colours from `theme-color`, the page background and
elements pinned to the screen edges. `theme-color` is `#0f0f12` (dark) / `#ffffff` (light) and is
updated by `src/features/shared/theme.ts`. Anything pinned to the bottom edge (cookie banner,
model page action bar) stays on `bg-page` and pads for `env(safe-area-inset-bottom)`.

## Content

Never invent business facts (prices, reviews, stats, contacts, service promises, features that
don't exist). If a fact is unknown, hide that UI and add it to `TODO.md`.
