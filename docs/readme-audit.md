# 3D Print Dungeon README Audit

Audit date: 2026-08-05

This audit records what is actually present in the repository so the root README can be confident, recruiter-friendly, and honest. It is documentation-only and does not change app code, Firebase rules, dependencies, deployment config, or tests.

## 1. Project Identity

**Project name:** 3D Print Dungeon

**Project type:** Web marketplace and community platform for 3D printable models.

**Best concise description:**

> A Firebase-backed 3D model marketplace built with React, Vite, TypeScript, Firebase, Cloud Functions, Google Model Viewer, Stripe, and Vitest.

**Live URLs found and verified:**

- https://print-dungeon-3d.web.app/
- https://print-dungeon-3d.firebaseapp.com/

Both returned `200 OK` during the audit.

**Primary repository areas:**

| Area | Purpose |
| --- | --- |
| `src/` | React frontend, feature modules, routing, services, providers, shared UI |
| `functions/` | Firebase Cloud Functions for payments, roles, likes, follows, analytics, notifications, auth helpers, and model admin tasks |
| `public/` | Public assets, static SEO files, manifest, icons |
| `docs/` | Existing project documentation and this audit |
| `scripts/` | Utility scripts for sitemap/PWA and admin-style maintenance |
| `__tests__/` | Vitest and React Testing Library setup/tests |
| `firebase.json` | Firebase Hosting, Firestore, Storage, Functions, Extensions, and emulator config |

## 2. Verified Tech Stack

| Layer | Verified technology | Evidence |
| --- | --- | --- |
| Frontend framework | React 19 | `package.json` |
| Build tool | Vite 6 | `package.json`, `vite.config.js` |
| Language | TypeScript 5 | `package.json`, `tsconfig.json` |
| Styling | Tailwind CSS 4 via Vite plugin | `package.json`, `vite.config.js`, `src/index.css` |
| Routing | React Router DOM 7 | `package.json`, `src/AppRoutes.tsx` |
| Data fetching | TanStack React Query | `package.json`, hooks under `src/features/**/hooks` |
| Backend platform | Firebase | `firebase.json`, `src/config/firebaseConfig.ts` |
| Database | Cloud Firestore | services under `src/features/**/services`, `firestore.rules`, `firestore.indexes.json` |
| Authentication | Firebase Authentication | `src/features/auth/context/AuthContext.tsx`, `src/features/auth/providers/AuthProvider.tsx` |
| File storage | Firebase Storage | `storage.rules`, model upload services |
| Serverless backend | Firebase Cloud Functions | `functions/index.js`, `functions/src/**` |
| Payments | Stripe.js, React Stripe.js, Stripe Node SDK | root and `functions/package.json`, payment services/functions |
| 3D preview | Google Model Viewer plus Three.js conversion utilities | `@google/model-viewer`, `three`, model viewer/converter files |
| Testing | Vitest, React Testing Library, jsdom | `vitest.config.ts`, `__tests__/setup.ts` |
| Linting | ESLint 9 with TypeScript, React, Hooks, React Refresh plugins | `eslint.config.js` |
| Hosting | Firebase Hosting | `firebase.json`, `.firebaserc` |
| Container option | Docker, Docker Compose, Nginx | `Dockerfile`, `docker-compose.yml`, `nginx.conf` |
| PWA/optimization | Vite PWA and compression plugins | `package.json`, `vite.config.js` |

## 3. Cloud Functions Usage

Yes, the app uses Firebase Cloud Functions.

Verified functions include:

| Function area | Examples |
| --- | --- |
| Authentication/user setup | `createValidatedUser`, `ensureUserDocument`, role helpers |
| Roles/admin | `setUserRole`, claims and role synchronization helpers |
| Payments | Stripe customer/payment intent/subscription helpers, Connect onboarding, webhook handling, purchase/sales retrieval |
| User actions | Like and follow callable functions |
| Analytics | Model view tracking and scheduled analytics processing |
| Notifications | User notification helpers |
| Models/admin | Model cleanup/deletion helpers |

The frontend calls Cloud Functions through Firebase Functions, mostly in `us-central1`.

## 4. Verified User-Facing Features

| Feature | Status | Evidence and notes |
| --- | --- | --- |
| Public home page | Implemented | Home page uses Firestore-backed model lists plus some configured/featured sections |
| Model browsing | Implemented | Firestore model queries and infinite loading are present |
| Model detail page | Implemented | Includes model metadata, comments, sidebars, view tracking, and preview support |
| 3D model preview | Implemented | Uses `@google/model-viewer`, poster images, lazy loading, progress UI, fullscreen behavior, and model caching |
| Model upload | Implemented | Multi-step file/details/pricing flow with Storage upload and Firestore model creation |
| STL/OBJ conversion | Implemented | Client-side conversion utility dynamically imports Three.js loaders/exporter and creates GLB output |
| Paid model purchase flow | Implemented with caveats | Stripe PaymentIntent and purchase recording exist; see security caveats below |
| Stripe Connect seller onboarding | Implemented/partial | Connect account and onboarding link functions exist; production readiness depends on Stripe secrets/webhooks |
| Firebase Authentication | Implemented | Email/password, Google sign-in, password reset/change; social handlers for Facebook/Twitter are not implemented |
| Public user profiles | Implemented | Username lookup and public profile documents are used |
| Settings page | Implemented | Profile, account, notifications, privacy, and security settings exist |
| Like/favorite actions | Implemented | Client services and Cloud Functions exist |
| Follow actions | Implemented | Cloud Function-backed follow/unfollow and counters exist |
| User notifications | Implemented/partial | In-app notification storage and UI exist; some helper types are broader than current hooks |
| Search | Implemented/partial | Model and artist search exist; model sorting state is present but not fully applied in query code |
| Forum | Implemented with caveats | Categories, threads, replies, edit/delete flows exist; direct client view increment may conflict with Firestore update rules |
| Admin dashboard | Implemented | User management, moderation, settings, analytics, maintenance, and scripts tabs exist |
| Maintenance mode | Implemented | Maintenance settings and protected route behavior exist, with admin bypass |
| Marketplace landing areas | Partial/prototype | Marketplace home has mock product/recommendation data; featured is partly data-backed; new arrivals and best sellers are placeholders |
| Events | Mock/prototype | Uses mock event data and in-memory creation/entries |
| Blog | Mock/static | Uses mock blog posts |
| Collections | Placeholder | Route and page exist, but feature content is not fully implemented |
| Printed figures | Mock/static | Uses hardcoded demo data; some referenced public images appear absent |
| Business pages | Static/presentational | Business and seller-oriented pages exist |
| Cookie/policy pages | Implemented/static | Static policy pages and cookie consent UI exist |

## 5. User Roles and Permissions

Verified role names across the app include:

- `user`
- `artist`
- `moderator`
- `admin`
- `superadmin`
- Additional UI/admin role labels include `contributor` and `premium`

Role and permission enforcement exists in several layers:

| Layer | Enforcement |
| --- | --- |
| Client routing | `ProtectedRoute` checks authentication, role arrays, and admin state for protected pages |
| Firebase Auth claims | Admin/moderator/super role claims are used by functions/rules in sensitive paths |
| Firestore rules | Owner/admin checks protect user private data, payment records, admin settings, and moderation data |
| Storage rules | Public read for model/profile assets; authenticated/admin ownership checks for writes |
| Cloud Functions | Admin and authenticated checks exist around roles, payments, likes, follows, and analytics |

Important nuance: role data is split across Firebase custom claims, private user documents, and public profile flags. The README should describe role-based access generally, not imply every role path is fully unified.

## 6. Marketplace and Model Flow

Verified model upload flow:

1. User must be authenticated.
2. User selects 3D model file(s).
3. User enters name, categories, description, tags, AI flag, and render images.
4. User chooses free or paid pricing.
5. Paid uploads require seller verification/Stripe Connect status.
6. App uploads original file and images to Firebase Storage.
7. STL/OBJ files can be converted to GLB for preview.
8. App writes model metadata to Firestore.
9. Model detail page renders preview, metadata, comments, likes, purchases/download options, and view tracking.

Supported upload extensions include common 3D/CAD formats such as STL, OBJ, FBX, GLB-related conversion outputs, STEP/STP, SVG, SKP, SLDPRT/SLDASM, BLEND, and others.

Important caveat: there is no clearly enforced publish/approval queue in the inspected upload flow. A successful model creation writes directly to Firestore.

## 7. Payment Flow

Verified payment pieces:

- Stripe.js is loaded lazily from `VITE_STRIPE_PUBLISHABLE_KEY`.
- The frontend calls Firebase Functions for PaymentIntent creation, Connect account creation, onboarding links, Connect status checks, purchase confirmation, purchase history, and seller sales.
- Cloud Functions use Stripe secrets through Firebase Secret Manager style `defineSecret` values.
- Paid model purchase UI exists through a payment modal and Stripe Elements checkout form.
- Successful payment handling writes purchase records and updates model sales/revenue counters.

Secrets and environment names found:

- Frontend: `VITE_STRIPE_PUBLISHABLE_KEY`
- Functions: `STRIPE_SECRET_KEY`
- Functions: `STRIPE_WEBHOOK_SECRET`
- Local Firebase config: `src/keys/firebase_key.json`
- Local service key: `src/keys/service_key.json`

Security and production-readiness caveats:

1. Paid model files appear publicly readable through Storage rules, and original file URLs are stored on public model documents. The UI enforces purchase/download behavior, but Storage rules do not appear to enforce paid file access.
2. The `createPaymentIntent` function verifies that the model exists, but the audited implementation appears to trust the caller-supplied amount instead of comparing it against the Firestore model price.
3. Model creation rules allow any signed-in user to create model documents. The upload UI has seller checks for paid uploads, but the rules are broader than an artist-only marketplace claim.
4. Existing payment docs contain some outdated setup language compared with the current Secret Manager based implementation.

## 8. Main Route Inventory

| Route | Purpose | Status |
| --- | --- | --- |
| `/` | Home page | Implemented |
| `/search` | Model search | Implemented/partial sorting |
| `/search/artists` | Artist search | Implemented/partial pagination |
| `/marketplace` | Marketplace home | Prototype/mock-heavy |
| `/marketplace/featured` | Featured marketplace | Partial/data-backed |
| `/marketplace/new-arrivals` | New arrivals | Placeholder |
| `/marketplace/best-sellers` | Best sellers | Placeholder |
| `/model/upload` | Upload model | Implemented/protected |
| `/model/:modelId` | Model detail | Implemented |
| `/model/:modelId/edit` | Edit model | Protected artist/admin |
| `/profile` | Current user profile area | Protected |
| `/settings` | Account/settings | Protected |
| `/notifications` | User notifications | Protected |
| `/:username` | Public profile | Implemented |
| `/admin-dashboard` | Admin dashboard | Protected admin route |
| `/forum` | Forum home | Implemented |
| `/forum/new` | Create forum thread | Protected |
| `/forum/thread/:threadId` | Forum thread detail | Implemented |
| `/forum/thread/:threadId/edit` | Edit forum thread | Protected |
| `/forum/reply/:replyId/edit` | Edit reply | Protected |
| `/forum/my-threads` | User forum threads | Protected |
| `/artists` | Artists page | Implemented/partial pagination |
| `/collections` | Collections | Placeholder |
| `/events` | Events | Mock/prototype |
| `/events/:eventId` | Event detail | Mock/prototype |
| `/blog` | Blog | Mock/static |
| `/printed-figures` | Printed figures page | Mock/static |
| `/business/*` | Business/static pages | Presentational |
| `/privacy-policy`, `/terms-of-service`, `/cookie-policy`, `/licenses` | Policy pages | Static |
| `/reset-password` | Password reset | Implemented |
| `/maintenance` | Maintenance page | Implemented |

## 9. Local Development and Commands

Root scripts verified in `package.json`:

```bash
npm run dev
npm run build
npm run preview
npm run type-check
npm run lint
npm run lint:fix
npm test
npm run test:ui
npm run firebase:emulators-start
npm run firebase:emulators
npm run firebase:prod
npm run hosting
npm run generate-sitemap
npm run pwa:generate
```

Functions scripts verified in `functions/package.json`:

```bash
cd functions
npm run lint
npm run serve
npm run shell
npm run deploy
npm run logs
```

Node version notes:

- Firebase Functions specify Node 20.
- Docker images use Node 20 Alpine.
- The root package does not define an `engines.node` requirement.

## 10. Deployment and Infrastructure

Verified deployment pieces:

| File | Purpose |
| --- | --- |
| `.firebaserc` | Default Firebase project: `print-dungeon-3d` |
| `firebase.json` | Hosting site `print-dungeon-3d`, SPA rewrite, headers, functions, rules, indexes, emulators, and image resize extension |
| `firestore.rules` | Firestore security rules |
| `firestore.indexes.json` | Firestore indexes |
| `storage.rules` | Firebase Storage rules |
| `functions/` | Cloud Functions source |
| `Dockerfile` | Multi-stage frontend build and Nginx production image |
| `docker-compose.yml` | Dev/prod/dev-hot container profiles |
| `nginx.conf` | SPA fallback, gzip, security headers, health endpoint |
| `apphosting.yaml` | Firebase App Hosting/Cloud Run style skeleton config |

## 11. Validation Results

Commands run during the audit:

| Command | Result | Notes |
| --- | --- | --- |
| `npm run build` | Passed | Vite production build completed |
| `npm run type-check` | Passed | Required escalated execution because sandbox access to user home failed |
| `npm run lint` | Failed | 27 problems: 11 errors and 16 warnings |
| `npm test -- --run` | Failed | 10 failed suites; most are empty/no-test suites, one active auth provider suite fails on duplicate Firebase app initialization |

Lint issues observed include:

- Unused variables in Functions/model and marketplace placeholder components.
- `any` types in admin notifications and user notification types.
- Unescaped text in `PricingForm`.
- React hooks dependency warnings.
- `vitest.config.ts` ESLint project inclusion/parsing issue.

Test issues observed include:

- Several test files contain no active test suites.
- `authProvider.test.tsx` fails because Firebase app initialization conflicts in the test environment.

## 12. Documentation Risks Found

Existing docs contain useful background, but several details are stale or overstated:

| Document/source | Risk |
| --- | --- |
| `docs/README.md` | Mentions older env names, old routes such as `/admin` and `/model-upload`, a 30-minute view cooldown, and a deploy command not present in root scripts |
| `docs/PAYMENT_SETUP.md` | Uses older Firebase Functions config language while current code uses Secret Manager style secrets |
| `docs/PAYMENT_INTEGRATION_STATUS.md` | Overstates production readiness and seller dashboard completeness |
| `docs/PROJECT_STRUCTURE_ANALYSIS.md` | Mentions React 18/Router v6 and older structure; current app uses React 19/Router v7 style packages |
| `public/sitemap.xml` | Contains placeholder or stale URLs such as sample model/forum/user IDs and `/competitions` |
| `public/robots.txt` | References old admin paths and routes that do not fully match current routing |
| Root `index.html` | References `/src/main.jsx`, while the actual entry file is `src/main.tsx`; build still passed |
| Mock data/assets | Some mock pages reference image paths that do not appear in `public/assets` |

## 13. README Positioning Recommendation

Recommended recruiter-facing positioning:

> 3D Print Dungeon is a full-stack marketplace for 3D printable models, built with React, TypeScript, Vite, Firebase, Cloud Functions, Firestore, Google Model Viewer, and Stripe. It includes authentication, role-based access, model uploads, 3D previews, search, forum discussions, admin tooling, payments, follows/likes, notifications, and responsive UI.

Recommended honesty note:

> The core marketplace, upload, preview, auth, forum, payment, and admin systems are implemented, while some showcase sections such as events, blog posts, collections, and marketplace subpages use mock or placeholder content.

Recommended shorter CV line:

> 3D model marketplace built with React, TypeScript, Vite, Firebase, Cloud Functions, Firestore, Google Model Viewer, Stripe, and Vitest, featuring auth, uploads, 3D previews, search, payments, forums, admin tools, and responsive UI.
