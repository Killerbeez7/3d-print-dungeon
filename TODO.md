# TODO

Items waiting on the owner's input, or planned for a later round. Full audit:
https://claude.ai/artifact/LuGUKVXqRe6iGmgMEUY5cZ

## Needed from you

- [ ] Legal operator: your name or company, a contact address, registration/VAT numbers if
      you sell as a business
- [ ] Correct support email (`support@3dprintdungeon.com` vs the `printdungeon.com` site)
- [ ] Are Enterprise, Bulk Orders, Custom Solutions and Printed Figures real services? If
      yes: what's offered, prices, and whether 24/7 support or an SLA is actually provided
- [ ] Real model images and files (currently placeholders)
- [ ] Selling currency or currencies, platform commission %, refund terms for downloads
- [ ] Google Analytics 4 measurement ID, or a decision to drop analytics
- [ ] Newsletter: a provider and a sending plan, or remove the form
- [ ] Social profile URLs for the footer icons
- [ ] Stripe publishable key for the production build (`VITE_STRIPE_PUBLISHABLE_KEY`)
- [ ] Preview deploys: add the GitHub secrets listed in `.github/workflows/preview.yml`

## Design system follow-ups

- [ ] Footer still links to the hidden Marketplace and Business pages; align it with the
      new navigation
- [ ] Replace AI-generated hero/carousel artwork with real photos of printed models

- [ ] Add a `--br-input` token (about `#868c98` light, `#6b7282` dark, 3:1+) and use it on
      all 106 inputs, selects and textareas
- [ ] Migrate Font Awesome and react-icons to `lucide-react`
- [ ] Replace raw palette colours (`red-*`, `green-*`, `blue-*`, `gray-*` …) with status and
      surface tokens
- [ ] Collapse radius usage to the four sizes in DESIGN-SYSTEM.md
- [ ] Load fonts from one source (currently Google Fonts CSS, bundled files and
      `public/fonts`)
