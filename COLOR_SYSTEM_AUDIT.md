# Color System Audit

## Scope

Audited the website color system across the central CSS tokens, Tailwind `@theme` semantic colors, shared components, home/marketplace cards, auth/reset flows, navigation, footer, notifications, maintenance, model viewer controls, payment provider styling, policy pages, and high-traffic action states.

The route set in this repo does not include dedicated `services`, service category, useful/articles, or contact pages. The closest reviewed areas were business solution pages, blog/articles, policy contact sections, auth/contact-adjacent support options, homepage, navigation, footer, cards, CTAs, hero/carousel surfaces, notifications, and forms.

## Problems Found

- Purple and adjacent saturated colors were being used as broad UI atmosphere instead of controlled emphasis. The prior dark token stack used purple-tinted surfaces (`#15151f`, `#1c1b29`, purple text grays), and multiple components added fuchsia/purple active states.
- Light theme was still based on teal accent tokens, while the requested brand direction called for purple as the controlled accent in both themes.
- Several backgrounds were too color-coded for a premium/professional site: auth reset screens used blue/indigo gradients, profile/contact actions mixed bright blue/pink/purple surfaces, and notification/admin states used raw Tailwind colors.
- Secondary buttons and neutral surfaces were sometimes purple-tinted, making normal UI chrome compete with actual CTAs.
- Hardcoded colors appeared in shared UI and high-traffic views: `bg-white`, `text-gray-*`, `bg-gray-*`, raw red/blue/purple status classes, fuchsia thumbnail rings, carousel arrow RGBA values, and Stripe appearance hex values.
- Contrast was mostly acceptable for primary text, but some muted text and gray-on-light combinations were too weak for important copy. Focus styles were also split across raw blue, accent, and border utilities.

## Why The Previous System Felt Too Colorful

The system made purple part of the base environment. Cards, elevated surfaces, borders, text hierarchy, active states, badges, and shadows all leaned purple at once. That meant the brand color stopped functioning as a signal and became the default ambience. The new system makes neutral black/gray/white layers do the structural work, then reserves purple for CTAs, links, active selections, focus rings, icons, and small highlights.

## New Semantic Palette

| Token | Role |
| --- | --- |
| `--bg-page` | Page background |
| `--bg-section` | Section and navigation background |
| `--bg-muted` | Muted blocks, skeletons, subtle controls |
| `--surface-card` | Card and input surface |
| `--surface-elevated` | Lifted panels and elevated surfaces |
| `--bg-inverse` | Inverse surface when needed |
| `--txt-primary` | Primary text |
| `--txt-secondary` | Secondary text |
| `--txt-muted` | Metadata and low-emphasis labels |
| `--txt-inverse` | Text on status/action fills |
| `--br-subtle` | Subtle dividers |
| `--br-secondary` | Default borders |
| `--br-primary` | Strong borders |
| `--accent` | Brand accent |
| `--accent-hover` | Accent hover and stronger accent states |
| `--accent-soft` | Small soft accent backgrounds only |
| `--accent-muted` | Muted accent layer |
| `--accent-text` | Accent/link text |
| `--link`, `--link-hover` | Links |
| `--btn-primary`, `--btn-primary-hover`, `--btn-primary-text` | Primary buttons |
| `--btn-secondary`, `--btn-secondary-hover` | Neutral secondary buttons |
| `--focus` | Focus rings |
| `--success`, `--warning`, `--error`, `--info` | Status colors |

## Light Theme Palette

| Token | Value |
| --- | --- |
| `--bg-page` | `#f7f8fa` |
| `--bg-section` | `#ffffff` |
| `--bg-muted` | `#eef0f3` |
| `--surface-card` | `#ffffff` |
| `--surface-elevated` | `#f3f4f6` |
| `--bg-inverse` | `#0b0c0f` |
| `--txt-primary` | `#15171c` |
| `--txt-secondary` | `#4b5563` |
| `--txt-muted` | `#737987` |
| `--txt-inverse` | `#ffffff` |
| `--br-subtle` | `#e5e7eb` |
| `--br-secondary` | `#d1d5db` |
| `--br-primary` | `#9ca3af` |
| `--accent` | `#6d28d9` |
| `--accent-hover` | `#4c1d95` |
| `--accent-soft` | `#f3efff` |
| `--accent-muted` | `#e8ddff` |
| `--accent-text` | `#5b21b6` |
| `--btn-primary` | `#6d28d9` |
| `--btn-primary-hover` | `#4c1d95` |
| `--btn-secondary` | `#f3f4f6` |
| `--btn-secondary-hover` | `#e5e7eb` |
| `--focus` | `#6d28d9` |
| `--success` | `#15803d` |
| `--warning` | `#b45309` |
| `--error` | `#dc2626` |
| `--info` | `#2563eb` |

## Dark Theme Palette

| Token | Value |
| --- | --- |
| `--bg-page` | `#050608` |
| `--bg-section` | `#0b0c0f` |
| `--bg-muted` | `#13151a` |
| `--surface-card` | `#181a20` |
| `--surface-elevated` | `#20232b` |
| `--bg-inverse` | `#f7f8fa` |
| `--txt-primary` | `#f4f4f5` |
| `--txt-secondary` | `#c3c7cf` |
| `--txt-muted` | `#8f96a3` |
| `--txt-inverse` | `#0b0c0f` |
| `--br-subtle` | `#20232a` |
| `--br-secondary` | `#2a2d35` |
| `--br-primary` | `#3b404a` |
| `--accent` | `#a78bfa` |
| `--accent-hover` | `#c4b5fd` |
| `--accent-soft` | `#1c1429` |
| `--accent-muted` | `#2a1f3a` |
| `--accent-text` | `#ddd6fe` |
| `--btn-primary` | `#7c3aed` |
| `--btn-primary-hover` | `#6d28d9` |
| `--btn-secondary` | `#24262e` |
| `--btn-secondary-hover` | `#2e313a` |
| `--focus` | `#c4b5fd` |
| `--success` | `#34d399` |
| `--warning` | `#fbbf24` |
| `--error` | `#fb7185` |
| `--info` | `#60a5fa` |

## Files Changed

- `src/styles.css`
- `src/styles/buttons.css`
- `src/styles/utilities.css`
- `src/components/Button.tsx`
- `src/features/auth/components/AuthModal.tsx`
- `src/features/auth/components/PasswordResetModal.tsx`
- `src/features/auth/components/PasswordResetPage.tsx`
- `src/features/auth/components/SignInForm.tsx`
- `src/features/auth/components/SignUpForm.tsx`
- `src/features/auth/components/ValidityIndicator.tsx`
- `src/features/home/pages/HomePage.tsx`
- `src/features/home/components/CarouselCard.tsx`
- `src/features/home/components/HomeModelsGrid.tsx`
- `src/features/home/components/TrendingCarousel.tsx`
- `src/features/home/utils/getBadgeColorClass.tsx`
- `src/features/maintenance/pages/MaintenancePage.tsx`
- `src/features/models/components/model-view/ModelSidebar.tsx`
- `src/features/models/components/model-view/ModelThumbnails.tsx`
- `src/features/payment/providers/LazyStripeProvider.tsx`
- `src/features/policies/pages/CookiePolicyPage.tsx`
- `src/features/shared/ScrollToTopButton.tsx`
- `src/features/shared/Skeleton.tsx`
- `src/features/shared/navbar/AuthButtons.tsx`
- `src/features/shared/reusable/LazyImage.tsx`
- `src/features/shared/reusable/SequentialImage.tsx`
- `src/features/shared/reusable/carousel/ReusableCarousel.tsx`
- `src/features/system-alerts/components/SystemAlertContainer.tsx`
- `src/features/user/notifications/components/UserNotificationContainer.tsx`
- `src/features/user/profile/components/UserHeader.tsx`
- `src/features/user/profile/components/tabs/AboutTab.tsx`
- `COLOR_SYSTEM_AUDIT.md`

Pre-existing unrelated dirty file still present and not part of this color pass: `src/keys/service_key.example.json`.

## Hardcoded Colors Removed

- Removed primary button hardcoded text color usage and mapped button text to `--btn-primary-text`.
- Replaced blue/indigo auth reset page backgrounds with semantic page/surface tokens.
- Replaced auth form `bg-white`, `text-gray-*`, `border-gray-*`, raw blue focus rings, and red error blocks with semantic tokens.
- Replaced fuchsia model thumbnail active rings with `accent` and semantic borders.
- Replaced gray skeleton/loading surfaces with `bg-bg-muted`.
- Replaced carousel arrow hardcoded RGBA and white icon styles with overlay/text tokens.
- Replaced Stripe appearance hex values with theme variables.
- Replaced system alert raw status palettes with semantic status tokens on neutral surfaces.
- Replaced notification dropdown hardcoded white/gray/red/blue classes with surface, border, text, link, and status tokens.
- Replaced cookie policy blue highlights and dots with accent tokens.

## Components And Sections Adjusted

- Central token system and Tailwind `@theme` color exports.
- Shared buttons, CTA button CSS, secondary buttons, focus rings, and accent shadows.
- Homepage cards, carousel overlays, model grid overlays, badges, and error state.
- Navigation auth skeletons, footer CTA compatibility, scroll-to-top CTA.
- Auth modal, sign-in/sign-up forms, password reset modal/page.
- User profile website/contact accent treatment and About tab icons.
- Model thumbnails and owner/admin model actions.
- Notifications and system alerts.
- Maintenance page.
- Stripe Elements provider.
- Cookie policy analytic highlights.

## Manual Visual Review Still Needed

- Forum legacy screens still contain raw `gray-*`, `blue-*`, and dark-mode utility classes.
- Model upload and model viewer controls still have overlay-specific white/black utilities; most are intentional over-canvas/media, but they should be checked visually.
- Admin scripts/test panels still contain some raw gray/blue utility classes.
- Payment seller verification modal still contains a blue-to-purple icon gradient and light hardcoded surfaces.
- Public Firebase fallback page in `public/index.html` still uses hardcoded colors.
- Social provider icons and social network profile buttons retain provider brand colors by design.

## Accessibility Checks

Computed contrast ratios for the new core tokens:

- Light `txt-primary` on page: `16.87:1`
- Light `txt-secondary` on page: `7.11:1`
- Light `txt-muted` on page: `4.11:1`; use only for metadata/labels, not long body copy.
- Light link/accent text on page: `8.45:1`
- Light primary button text on fill: `7.10:1`
- Light focus color on page: `6.69:1`
- Dark `txt-primary` on page: `18.44:1`
- Dark `txt-secondary` on page: `11.96:1`
- Dark `txt-muted` on page: `6.81:1`
- Dark link/accent text on page: `14.60:1`
- Dark primary button text on fill: `5.70:1`
- Dark focus color on page: `10.98:1`

## Verification

- `npm run build` completed successfully.
- Build emitted a network warning from `vite-plugin-webfont-dl` because `fonts.gstatic.com` could not be resolved in the restricted environment; the build still exited successfully.
- `npm run type-check` still fails on an existing non-color issue in `src/features/models/hooks/useModelLoader.ts` where `Uint8Array<ArrayBufferLike>[]` is passed as `BlobPart[]`.
- Code-wise review covered homepage, business pages, blog/articles, policy contact areas, navigation/header, footer, cards, CTAs, carousel/hero-style sections, auth/forms, notifications, and model cards/view controls.

## Risks And Tradeoffs

- The new palette is calmer and more neutral, but pages that relied on saturated color for separation now depend more on border, elevation, and spacing.
- Dark `accent-soft` remains slightly purple by necessity, but it is now reserved for selected/highlight states rather than general surfaces.
- Some raw colors remain where they are either brand-provider colors, media/canvas overlays, or lower-priority legacy/admin/forum areas. They are documented above for follow-up.
- Muted light text is intentionally subdued; avoid using `text-txt-muted` for critical form copy or body paragraphs.

## Recommended Next Steps

- Run a browser visual pass across dark and light themes after the dev server is available, especially forum, model upload, seller verification, and notification flows.
- Convert the remaining legacy forum/admin/model upload raw colors to semantic tokens in a follow-up.
- Add a small color-token usage guideline to project docs so new components use neutral surfaces by default and reserve purple for action and focus.
