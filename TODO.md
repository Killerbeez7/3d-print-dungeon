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

## Security fixes: deploy in this order (owner)

Today anyone can download every original STL, grant themselves any paid model, choose the price
they pay, make themselves admin and post as other users. The fixes are on the branch; nothing
reaches the live site until these steps. Steps 3 and 4 belong together: the new site uploads to a
folder the old rules don't allow, and the old site uploads to a folder the new rules don't allow.

1. [ ] Let the functions sign download links: Google Cloud console → IAM & Admin → Service
       accounts → `PROJECT_NUMBER-compute@developer.gserviceaccount.com` → Permissions → grant
       that same account the role **Service Account Token Creator**. Also enable the
       **IAM Service Account Credentials API**. (Project number: Firebase console → Project
       settings.)
2. [ ] `firebase deploy --only functions`. It also stops logging new users' passwords. Say yes
       when it asks to delete `testStripeConnection` and `createSubscription`.
3. [ ] `firebase deploy --only firestore:rules,storage`
4. [ ] Deploy the site (merge the branch, then `firebase deploy --only hosting`)
5. [ ] Move the existing originals out of the public folder, from `functions/`:
       `GOOGLE_APPLICATION_CREDENTIALS=../src/keys/service_key.json node scripts/protect-original-files.js`
       (dry run), then the same with `--apply`. Add `--delete-orphans` to also delete originals no
       listing uses.
6. [ ] Give the existing listings light 3D previews and delete their full-detail viewer files,
       from the repo root:
       `GOOGLE_APPLICATION_CREDENTIALS=src/keys/service_key.json npx tsx scripts/make-light-previews.ts`
       (dry run), then the same with `--apply`. Run it after step 5.
7. [ ] Stripe dashboard → Developers → Webhooks → the `stripeWebhook` endpoint: add the
       `payment_intent.succeeded` event, so purchases are recorded even if the buyer closes the tab

## Firebase console / deploys (owner)

- [ ] Account clean-up: move billing to the main Google account, then remove fawin.angel7 from
      Project settings → Users and permissions
- [ ] Service account keys: `firebase-adminsdk` has 4 active keys (2 from June 2025, 2 from
      28 Oct 2026); each one gives full control of the project. Delete the ones not in use (keep
      the one stored in GitHub for preview builds)

- [ ] Deploy the new Firestore index for profile models (`uploaderId` + `createdAt`):
      `firebase deploy --only firestore:indexes`
- [ ] GitHub → Settings → Secrets: delete `FIREBASE_WEB_CONFIG`. It held an invalid API key
      and previews now read the web config from Firebase Hosting instead
- [ ] Firebase Auth → Authorized domains: add each new preview domain
      (`print-dungeon-3d--<branch>-*.web.app`) so Google sign-in works there; v1 and v2 are added
- [ ] Firebase Auth → Templates → password reset → action URL: set it to
      `https://printdungeon.com/reset-password` to use the site's own reset page (now routed)

## Engineering follow-ups

- [ ] Light previews show fine detail with fewer triangles if the detail is baked into a
      normal map; that would allow a lower triangle count (more protection) at the same look
- [ ] Add `.3mf` (common for Bambu printers) to the allowed upload formats; most other formats
      in the list can't be previewed in 3D
- [ ] `checkEmailAvailability` lets anyone check whether an email has an account (needed for the
      sign-up form; consider rate limiting)
- [ ] Following/unfollowing or liking/unliking repeatedly sends a notification each time
- [ ] Anyone signed in can delete anyone's forum thread like (`forumThreadLikes` rules)
- [ ] Creator payouts: sales go to the platform's Stripe account; nothing pays creators yet
      (Stripe Connect destination charges)
- [ ] New listings still default to US dollars; the plan says euro
- [ ] Deleting a listing removes it for its buyers too; keep purchased files available
- [ ] Admin "delete all models" script still uses the old file paths
- [ ] Artists list loads up to 200 user documents one by one (`fetchArtistsForSearch`); move to
      a single query on public profiles with `isArtist == true`
- [ ] Search sorting: the old sort menu was removed because `fetchModels` ignores `sortBy`;
      add server-side sorting before bringing it back
- [ ] Pre-existing lint errors (6) and warnings (14), e.g. unused `ModelData` in
      `useFetchUserModels`, `no-console` disables

## Design system follow-ups

- [ ] Replace AI-generated hero artwork with real photos of printed models
- [ ] Hidden demo pages (marketplace, business, printed figures) still use the old styles
- [ ] `stateMonitor.tsx` (3D viewer debug overlay) still uses raw black/white
