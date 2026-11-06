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

1. [x] Let the functions sign download links: Google Cloud console → IAM & Admin → Service
       accounts → `PROJECT_NUMBER-compute@developer.gserviceaccount.com` → Permissions → grant
       that same account the role **Service Account Token Creator**. Also enable the
       **IAM Service Account Credentials API**. (Project number: Firebase console → Project
       settings.) Then Cloud Storage → bucket `print-dungeon-3d.firebasestorage.app` →
       Permissions → grant the same account **Storage Object Admin**: links only work if the
       account that signs them can read the file, and `deleteModel` deletes files as it
2. [x] `firebase deploy --only functions`. It also stops logging new users' passwords. Say yes
       when it asks to delete `testStripeConnection` and `createSubscription`.
3. [x] `firebase deploy --only firestore:rules,storage`
4. [x] Deploy the site (`firebase deploy --only hosting`, 2 Nov 2026)
   - [ ] The build had no Stripe publishable key, so paying is broken on the live site: put
         `VITE_STRIPE_PUBLISHABLE_KEY=pk_...` in `.env` (not `.env.txt`), then `npm run build` and
         `firebase deploy --only hosting` again
5. [x] (done 2 Nov 2026: 13 private copies, 10 public originals deleted; `Barbarian4.stl` in
       `models/original/` is unused and still public) `firebase deploy --only functions:deleteModel`, so deleting a listing keeps an original
       file other listings still use, then move the existing originals out of the public folder.
       This runs on GitHub: set `.github/data-maintenance.json` and push. By hand, from `functions/`:
       `GOOGLE_APPLICATION_CREDENTIALS=../src/keys/service_key.json node scripts/protect-original-files.js`
       (dry run), then the same with `--apply`. Add `--delete-orphans` to also delete originals no
       listing uses.
6. [x] Give the existing listings light 3D previews (done 2 Nov 2026: 13 previews, 10 old files deleted) and delete their full-detail viewer files,
       from the repo root:
       `GOOGLE_APPLICATION_CREDENTIALS=src/keys/service_key.json npx tsx scripts/make-light-previews.ts`
       (dry run), then the same with `--apply`. Run it after step 5.
7. [ ] Stripe dashboard → Developers → Webhooks → the `stripeWebhook` endpoint: add the
       `payment_intent.succeeded` event, so purchases are recorded even if the buyer closes the tab

## Firebase console / deploys (owner)

- How to deploy rules and functions (owner, from your PC): in an up-to-date checkout of
  `claude/redesign-v2` (`git checkout claude/redesign-v2`, `git pull`; on a fresh clone run
  `npm ci` in the root and in `functions/` first), then
  `firebase deploy --only firestore:rules,storage --project print-dungeon-3d` and/or
  `firebase deploy --only functions:<name> --project print-dungeon-3d`. Never from `main`: it
  has the old October rules. (The Deploy rules workflow stays in the repo but only works once its
  service account has the Firebase Rules Admin and Service Usage Consumer roles.)

- [x] Deploy the security round of 4 Nov 2026 (done 5 Nov 2026 from `7cd386b`):
      - Rules: (upload size/type limits and own-folder uploads in Storage,
        forum likes, `rateLimits`). Tested in the emulator.
      - Functions: from an up-to-date checkout of the branch,
        `firebase deploy --only functions:getModelDownloadUrl,functions:checkEmailAvailability`
        (download links: 30 per person per hour; email checks: 30 per network address per
        10 minutes)
      - Firestore → TTL policies → collection group `rateLimits`, field `expireAt`, so old
        counters delete themselves
- [ ] Coming-soon mode (6 Nov 2026): after the next publish, printdungeon.com shows a coming-soon
      page to everyone except admins and testers. Before or right after publishing, from an
      up-to-date checkout of `claude/redesign-v2`:
      - `firebase deploy --only firestore:rules --project print-dungeon-3d` (the `devlog`
        collection; until then the Dev log tab says it couldn't load and Admin > Dev log can't save)
      - `firebase deploy --only functions:setUserRole --project print-dungeon-3d` (so Admin > Users
        can give someone the **tester** role; they may need to sign out and in once)
- [ ] Launch, when the site is ready (payments, real images, legal operator details):
      1. GitHub → Settings → Secrets and variables → Actions → Variables → `VITE_SITE_LAUNCHED` =
         `true`. The next preview build has no coming-soon page and no noindex; then publish it.
      2. A real sitemap on `printdungeon.com` (static pages + every model), linked from robots.txt
      3. Per-page titles and descriptions (model name, artist, image) and noindex on the
         "not found" page and the hidden demo pages
      4. Google Search Console: verify `printdungeon.com`, submit the sitemap, and check that no
         preview or `print-dungeon-3d.web.app` pages are indexed
- [ ] App Check, so only the site (not scripts) can call the functions. In this order:
      1. Google Cloud console → Security → reCAPTCHA → Create key: Website; domains
         `printdungeon.com`, `print-dungeon-3d.web.app`,
         `print-dungeon-3d--claude-redesign-v2-6mscel08.web.app` (each preview domain), `localhost`
      2. Firebase console → App Check → Apps → the web app → reCAPTCHA Enterprise → paste the
         site key → Save. Do not press "Enforce" for any product yet.
      3. GitHub → Settings → Secrets and variables → Actions → Variables → New variable
         `VITE_APP_CHECK_SITE_KEY` = the site key (it's public, not a secret). The next preview
         build includes App Check; then publish live.
      4. A few days later, Cloud Logging for the functions: calls should show
         `"app":"VALID"` in "Callable request verification passed". Then set
         `ENFORCE_APP_CHECK = true` in `functions/src/shared/globalOptions.js` and deploy all
         functions. Enforcing Firestore/Storage in the console is a later, separate step.
- [ ] Google sign-in on iPhone Safari ("missing initial state"): the site now signs in through its own
      domain. Google Cloud console → APIs & Services → Credentials → OAuth 2.0 Client IDs →
      "Web client (auto created by Google Service)" → Authorized redirect URIs: add
      `https://printdungeon.com/__/auth/handler`, `https://print-dungeon-3d.web.app/__/auth/handler`
      and each preview domain's `/__/auth/handler` (wildcards aren't allowed), before deploying hosting

- [ ] Stripe test secret key: it was printed by `firebase deploy --debug` (1 Nov 2026). Roll it in
      Stripe (test mode → Developers → API keys), store the new one with
      `firebase functions:secrets:set STRIPE_SECRET_KEY`, then remove the old copy from the
      retired runtime config with `firebase functions:config:unset stripe`

- [ ] Account clean-up: move billing to the main Google account, then remove fawin.angel7 from
      Project settings → Users and permissions
- [ ] Service account keys: `firebase-adminsdk` has 4 active keys (2 from June 2025, 2 from
      28 Oct 2026); each one gives full control of the project. Delete the ones not in use (keep
      the one stored in GitHub for preview builds)

- [x] Deploy the Firestore indexes (`firebase deploy --only firestore:indexes`, 5 Nov 2026). Profiles no longer
      need them (they load a creator's listings with a plain filter), but other queries may
- [ ] Profile totals (models, views, likes) are counted from up to 500 listings per creator; past
      that, move the totals to the server
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
- [x] `checkEmailAvailability` lets anyone check whether an email has an account: now limited
      per network address (deploy pending, see above)
- [ ] Following/unfollowing or liking/unliking repeatedly sends a notification each time
- [x] Anyone signed in can delete anyone's forum thread like (`forumThreadLikes` rules; deploy
      pending)
- [ ] Theft, later: a per-buyer watermark in downloaded files (the main leak is buyers
      re-sharing originals); fingerprinting uploads to catch re-uploads; a report button and a
      copyright/DMCA page (a registered DMCA agent is needed for US safe harbour; owner's
      details)
- [ ] Preview defense, later (discussed 5 Nov 2026). Anything drawn in 3D in the browser can be
      captured from the GPU, so only previews that send no geometry are safe. Options:
  - [ ] **Recommended:** turntable for paid models. 48–72 frames rendered from the full original
        in the browser at upload (where the cover renders are made), scrubbed by drag/swipe, slow
        spin when idle. No 3D data sent; better looking than today's 100k-triangle copy. Costs
        ~+15 s upload, 1–3 MB per model, a one-off script for existing models; no free orbit or
        deep zoom. Optional second ring from ~35° above. Try it on one model first.
  - [ ] **With it:** full 3D viewer stays for free models and for buyers of paid ones.
  - [ ] **With it:** stop bulk scraping: App Check on Storage (after the App Check setup above),
        and paid models' previews through short-lived links instead of a public path.
  - [ ] **In reserve:** low-poly mesh (~5k triangles) + baked normal map. Looks close to the
        original in the viewer, ripped copy is a blob. Needs UV unwrapping and baking on a
        server (e.g. headless Blender on Cloud Run); the most work.
  - [ ] **Stopgap only:** fewer triangles (`PREVIEW_TRIANGLES` in
        `src/features/models/utils/lightPreview.ts`, 100k → 50k, then re-run
        `scripts/make-light-previews.ts`). Weak for miniatures: at 28 mm a 25–50k mesh still
        prints almost fine, while the viewer gets softer.
  - Not worth it: encrypting or hiding the preview file; the browser must decode it to draw it.
- [ ] Creator payouts: sales go to the platform's Stripe account; nothing pays creators yet
      (Stripe Connect destination charges)
- [x] New listings default to euro; sellers can switch to US dollars in Settings → Account (branch `claude/new-features`).
- [x] Deploy `firestore.rules` from `claude/redesign-v2` (5 Nov 2026): listings may only be priced in `eur` or `usd`, and the new `makes` collection (photos of prints) becomes readable and postable. Until then the Makes section shows empty and posting says it isn't switched on yet.
- [ ] Deleting a listing removes it for its buyers too; keep purchased files available
- [ ] Admin "delete all models" script still uses the old file paths
- [x] Artists list no longer reads 200 user documents one by one: one models query, cached
      (see "Later: artists and collections")
- [ ] Search sorting: the old sort menu was removed because `fetchModels` ignores `sortBy`;
      add server-side sorting before bringing it back
- [ ] Pre-existing lint errors (6) and warnings (14), e.g. unused `ModelData` in
      `useFetchUserModels`, `no-console` disables

## Admin dashboard: next steps

- [ ] Reports: a real moderation queue (report button on models and comments, reasons,
      resolve/dismiss with a note); the Reports section still uses the old screen
- [ ] Users: a detail panel per user (their listings, sales, purchases) and suspend/ban
- [ ] Audit log of admin actions (deletes, role changes)
- [ ] Sales: per-creator totals once creator payouts exist
- [ ] The models table loads up to 1000 listings at once; page it from the server past that

## Checks after the next deploy

- [ ] View counts go up on the live site (`trackModelView`; could not be tested from the dev
      sandbox)
- [ ] The scroll-to-top button covers the cookie banner's "Manage" link on desktop
- [ ] Page HTML is revalidated on every visit: `curl -sI https://printdungeon.com/model/x` should
      show `cache-control: no-cache`, and `/assets/...` files `max-age=31536000, immutable`
- [ ] `theme-color` (#0f0f12 / #ffffff) doesn't match the page background (#0a0a0c / #f6f6f7),
      so iPhone Safari's bars are a slightly different shade; decide which to keep
- [ ] `public/assets/images/logo.svg` and `logo.png` are no longer used by the site; delete them if
      nothing outside the site (emails, social posts) links to them

## Design system follow-ups

- [ ] Replace AI-generated hero artwork with real photos of printed models
- [ ] Hidden demo pages (marketplace, business, printed figures) still use the old styles
- [ ] `stateMonitor.tsx` (3D viewer debug overlay) still uses raw black/white

## Later: artists and collections

- [ ] The Artists page and artist search build their list from the newest 1000 models (one
      read per model, then one profile read per artist), cached for 5 minutes. Past a few
      hundred models, keep an `artists` index on the server (a Cloud Function updating model
      count, newest upload and preview images when a model is added or removed) and read that.
- [ ] Two accounts with models are not listed because their public profile has no username
      registered to them (shown as "Pacman" and as "Anonymous" with someone else's username on
      their models). Fix their `users/{uid}/public/data.username` + `usernames/{name}` entries,
      or leave them off.
- [ ] Public collections (step 3): needs its own Firestore collection and rules. Collections are
      private for now, stored in `users/{uid}/settings/collections`.
