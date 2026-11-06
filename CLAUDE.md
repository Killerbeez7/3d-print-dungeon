# 3D Print Dungeon — project rules

Personal project: marketplace and community for 3D-printable models. Live: https://printdungeon.com.
Stack: React 19 + TypeScript + Vite + Tailwind v4, Firebase (Auth, Firestore, Storage,
Cloud Functions in `functions/`), Stripe. Hosted on Firebase Hosting (`firebase.json`).
Site content is in English.

## Working rules

- Never commit to `main`. Work on the session's feature branch; one logical change per
  commit, prefixed `feat:` / `fix:` / `style:` / `content:` / `refactor:` / `docs:` /
  `chore:`, so any single change can be reverted.
- Do not open a pull request, deploy hosting, deploy functions or deploy rules unless the
  owner asks. Firestore/Storage rules and Cloud Functions are shared with production.
- Rules are deployed only by the Deploy rules workflow, on the owner's go: commit
  `.github/deploy-rules.json` `{ "targets": "firestore,storage", "commit": "<HEAD sha>" }` on
  `claude/redesign-v2`. Never deploy rules from a local checkout.
- Before every push: `npm run lint`, `npm run type-check`, `npm run build`, then check
  changed pages at 390px and 1440px for console errors, broken links and horizontal scroll.
- Never invent business facts (prices, reviews, ratings, stats, company details, service
  promises). If a fact is unknown, hide that UI and add it to `TODO.md`.
- Model files and images in the database are placeholders; model listings are real.
- Set-aside work (features, logos, animations, styles, ideas) is indexed on the `stash` branch
  in `STASH.md`. Before removing or replacing something we built, add it there and anchor its
  commit (see STASH.md), so it can be brought back. Check the stash before rebuilding an idea.

## Design system

- Source of truth: `DESIGN-SYSTEM.md` and the tokens in `src/styles.css` (`:root`,
  `[data-theme="dark"]`, `@theme`). Dark is the default theme; both must work.
- Use token utilities (`bg-page`, `bg-surface-card`, `text-txt-primary`,
  `text-txt-secondary`, `text-txt-muted`, `bg-accent`, `border-br-*`, `text-success`,
  `text-error`, …). Do not add raw Tailwind palette colours (`red-500`, `gray-400`) or hex
  values in components.
- Text contrast must meet WCAG AA (4.5:1 body, 3:1 large text and input borders) in both
  themes.
- Icons: `lucide-react` only for new code.
- Every interactive element needs a visible `:focus-visible` style; no bare `outline-none`.
- iPhone Safari takes its top/bottom bar colours from the page background and from
  elements pinned to the screen edges; keep those on `--bg-page`.

## Security

- Prices, purchase state and counters are decided on the server (Cloud Functions), never
  trusted from the client.
- Never log passwords, tokens, auth objects or full request bodies.
- `src/keys/*.json` is git-ignored; never commit real keys.
