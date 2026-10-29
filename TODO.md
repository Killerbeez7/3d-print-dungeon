# TODO

Items waiting on the owner's input, or planned for a later round. Full audit:
https://claude.ai/artifact/LuGUKVXqRe6iGmgMEUY5cZ

## Needed from you

- [ ] Legal operator: your name or company, a contact address, registration/VAT numbers if
      you sell as a business
- [ ] Correct contact emails. The policies use `privacy@`, `legal@` and `support@3dprintdungeon.com`,
      but the site is `printdungeon.com`. Do these inboxes exist?
- [ ] Review the legal texts (privacy, terms, cookies, refund). The cookie policy lists things the
      site doesn't have (shopping cart, language setting, advertising integrations); the refund
      policy promises 7-day refunds and 3–5 day processing.
- [ ] Are Enterprise, Bulk Orders, Custom Solutions, Printed Figures and the Marketplace real?
      Their pages still show demo products and prices and are only hidden from the navigation.
- [ ] Events and Blog: the demo content was removed and both pages now say "nothing yet". Bring
      them back to the navigation when there is real content (or remove the routes).
- [ ] Forum moderation: the rules mention warnings and suspensions, but there is no report
      button and no way to contact moderators. Add one, or adjust the rules.
- [ ] Real model images and files (currently placeholders)
- [ ] Selling currency or currencies and the platform commission (the upload form says 5%)
- [ ] Google Analytics 4 measurement ID, or a decision to drop analytics
- [ ] Social profile URLs if you want them in the footer
- [ ] Stripe publishable key for the production build (`VITE_STRIPE_PUBLISHABLE_KEY`)

## Firebase console / deploys (owner)

- [ ] Deploy the new Firestore index for profile models (`uploaderId` + `createdAt`):
      `firebase deploy --only firestore:indexes`
- [ ] Deploy the Cloud Functions fix (stops logging new users' passwords in plain text):
      `firebase deploy --only functions`
- [ ] GitHub → Settings → Secrets: delete `FIREBASE_WEB_CONFIG`. It held an invalid API key
      and previews now read the web config from Firebase Hosting instead
- [ ] Firebase Auth → Authorized domains: add each new preview domain
      (`print-dungeon-3d--<branch>-*.web.app`) so Google sign-in works there; v1 and v2 are added
- [ ] Firebase Auth → Templates → password reset → action URL: set it to
      `https://printdungeon.com/reset-password` to use the site's own reset page (now routed)

## Engineering follow-ups

- [ ] Artists list loads up to 200 user documents one by one (`fetchArtistsForSearch`); move to
      a single query on public profiles with `isArtist == true`
- [ ] Search sorting: the old sort menu was removed because `fetchModels` ignores `sortBy`;
      add server-side sorting before bringing it back
- [ ] Pre-existing lint errors (7) and warnings (14), e.g. unused `ModelData` in
      `useFetchUserModels`, `no-console` disables

## Design system follow-ups

- [ ] Replace AI-generated hero artwork with real photos of printed models
- [ ] Hidden demo pages (marketplace, business, printed figures) still use the old styles
- [ ] `stateMonitor.tsx` (3D viewer debug overlay) still uses raw black/white
