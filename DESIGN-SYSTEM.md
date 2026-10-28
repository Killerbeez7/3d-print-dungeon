# 3D Print Dungeon — Design system

Source of truth for tokens: `src/styles.css` (`:root` = light, `[data-theme="dark"]` =
dark, `@theme` maps them to Tailwind utilities). Dark is the default theme. Every rule
below applies to both themes.

## Colour tokens

Use the utility in the first column; never raw Tailwind palette colours (`red-500`,
`gray-400`) or hex values in components.

| Utility | Token | Light | Dark | Use for |
| --- | --- | --- | --- | --- |
| `bg-page` | `--bg-page` | `#f7f8fa` | `#0b0b0f` | Page background |
| `bg-section` | `--bg-section` | `#ffffff` | `#111218` | Navbar, footer, page bands |
| `bg-muted` | `--bg-muted` | `#eef0f3` | `#151821` | Quiet fills, hover rows |
| `bg-surface-card` | `--surface-card` | `#ffffff` | `#1a1d26` | Cards, inputs |
| `bg-surface-elevated` | `--surface-elevated` | `#f3f4f6` | `#212432` | Dropdowns, popovers |
| `text-txt-primary` | `--txt-primary` | `#15171c` | `#f4f4f5` | Body text, headings |
| `text-txt-secondary` | `--txt-secondary` | `#4b5563` | `#c3c7cf` | Supporting text |
| `text-txt-muted` | `--txt-muted` | `#646a77` | `#8f96a3` | Meta text, captions |
| `bg-btn-primary` | `--btn-primary` | `#705dd6` | `#7360e6` | Solid primary fills with white text |
| `hover:bg-btn-primary-hover` | `--btn-primary-hover` | `#624fc8` | `#6550dc` | Hover of primary fills |
| `text-accent`, `border-accent`, `ring-accent` | `--accent` | `#705dd6` | `#8b7af6` | Accent text, borders, rings, tints (`bg-accent/10`) |
| `text-accent-text` | `--accent-text` | `#5140ad` | `#cbc3ff` | Accent text on accent-soft fills |
| `bg-accent-soft` | `--accent-soft` | `#f0edff` | `#1a172d` | Selected chips, highlights |
| `border-br-subtle` / `-secondary` / `-primary` | `--br-*` | `#e5e7eb` / `#d1d5db` / `#9ca3af` | `#252934` / `#303541` / `#414757` | Dividers and card borders (decorative only) |
| `text-success` / `-warning` / `-error` / `-info` | status | `#15803d` / `#b45309` / `#dc2626` / `#2563eb` | `#34d399` / `#fbbf24` / `#fb7185` / `#60a5fa` | Status text and icons; tints via `/10` |
| `outline-focus`, `ring-focus` | `--focus` | `#705dd6` | `#a395ff` | Focus indicators |

Rules:

- Solid violet fills with text use `bg-btn-primary`, never `bg-accent` (`--accent` fails
  AA under white text in dark mode).
- Text contrast is at least 4.5:1 (3:1 for 24px+ or 19px+ bold). Form field borders are at
  least 3:1 against their background; `br-*` tokens are too faint for that (see TODO.md).

## Typography

- Font: Inter (`font-sans`) for everything. Michroma (`font-display`) only for short display
  titles, never for body text or long headings.
- Scale (Tailwind): `text-xs` 12px meta and badges · `text-sm` 14px default UI text ·
  `text-base` 16px long-form reading · `text-lg` 18px card titles · `text-xl` 20px section
  titles · `text-2xl` 24px page sections · `text-3xl` 30px page H1 (`text-2xl` on phones) ·
  `text-4xl` 36px hero only.
- One `<h1>` per page; headings descend without skipping levels.

## Spacing and layout

- Tailwind 4px scale only; avoid arbitrary values like `[44px]` except touch targets
  (`min-h-11` = 44px).
- Page container: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`; reading pages `max-w-4xl`.
- Vertical rhythm: `py-8` page top/bottom on phones, `py-12` from `md`; `gap-4` / `gap-6` in
  grids.
- No horizontal scroll at 360px width.

## Radius

| Utility | Size | Use for |
| --- | --- | --- |
| `rounded-md` | 6px | Buttons, inputs, small controls |
| `rounded-lg` | 8px | Cards, panels, menu items |
| `rounded-xl` | 12px | Dropdowns, modals, large media |
| `rounded-full` | — | Pills, chips, avatars, icon buttons |

## Icons

`lucide-react` for all new code, `h-4 w-4` inline with text, `h-5 w-5` in icon buttons.
Decorative icons get `aria-hidden="true"`; icon-only buttons need `aria-label`. Existing Font
Awesome and react-icons uses are migrated over time (TODO.md).

## Components

- **Button** (`src/components/Button.tsx`): variants `primary` (one per view), `secondary`,
  `ghost`; sizes `sm` 36px, `md` 40px, `lg` 44px. Use it instead of styling `<button>`
  by hand.
- **Focus**: every interactive element shows `focus-visible:outline-2
  focus-visible:outline-offset-2 focus-visible:outline-focus` (or a `ring-focus` ring). Never
  `outline-none` without a replacement.
- **States**: every data view has loading (skeleton), empty (message + action) and error
  (message + retry) states.
- **ModelCard** (`src/features/home/components/ModelCard.tsx`): square image (lazy, fades
  in, icon on error), name and "by creator" always visible below, price badge for paid
  models. Use it for every model grid (`HomeModelsGrid`).
- **Chips** (`CategoryChips`): `h-9` pills, selected = `bg-btn-primary`; one row that
  scrolls sideways on phones, wraps from `lg`. Use `aria-pressed`.
- **Header**: `h-16`, max width 1600px, direct links for top sections, at most one menu
  (Community). Mobile menu is a left panel (focus trapped, Escape closes, 48px rows).
- **Forced-dark bands**: put `data-theme="dark"` on a section to keep it dark in both
  themes (used by the Home hero, whose artwork has a black background).

## Mobile browser chrome

iPhone Safari takes its top and bottom bar colours from `theme-color`, the page background and
elements pinned to the screen edges. `theme-color` follows the navbar surface (`#111218` dark,
`#ffffff` light) and is updated by `src/features/shared/theme.ts`; keep anything pinned to the
top or bottom edge on `bg-section` or `bg-page`.
