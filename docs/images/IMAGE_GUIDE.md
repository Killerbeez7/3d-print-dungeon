# README Image Guide

This folder is reserved for README screenshots and demo media. The root README intentionally does not reference missing local images yet, so it will not show broken image icons.

## Recommended Files

| File | Priority | What to capture | Suggested size |
| --- | --- | --- | --- |
| `print-dungeon-hero.png` | Required | Home page or marketplace view with the brand, model cards, and navigation visible | 1600 x 900 |
| `model-details.png` | Required | A model detail page showing the 3D viewer, render images, metadata, and action buttons | 1600 x 900 |
| `upload-flow.png` | Required | Model upload flow showing file/details/pricing steps | 1600 x 900 |
| `search-results.png` | Recommended | Search page with filters and model results visible | 1600 x 900 |
| `forum.png` | Recommended | Forum home or thread page | 1600 x 900 |
| `admin-dashboard.png` | Recommended | Admin dashboard with analytics/settings/user management visible | 1600 x 900 |
| `mobile.png` | Recommended | Mobile home, model detail, or search view | 390 x 844 or similar |
| `marketplace-demo.gif` | Optional | Short walkthrough of search, model preview, and purchase/upload flow | Under 10 MB |

## Capture Guidelines

- Use real app screens from the local dev server or verified Firebase deployment.
- Avoid screenshots that expose private keys, admin-only user data, payment secrets, or real customer information.
- Prefer desktop screenshots at 16:9 and one mobile screenshot for responsiveness.
- Keep browser chrome out of the image unless it helps prove the live URL.
- Use PNG for screenshots and optimized GIF/WebM for short demos.
- Crop tightly enough that UI is readable, but leave enough context to show navigation and layout.
- If a screen uses demo data, make sure it looks intentional and professional.

## Suggested README Placement

Once images exist, add them to the root README in this order:

```md
![3D Print Dungeon hero](docs/images/print-dungeon-hero.png)
![Model detail with 3D preview](docs/images/model-details.png)
![Upload flow](docs/images/upload-flow.png)
```

For a collapsible gallery:

```md
<details>
  <summary>Screenshots</summary>

  ![Search results](docs/images/search-results.png)
  ![Forum](docs/images/forum.png)
  ![Admin dashboard](docs/images/admin-dashboard.png)
  ![Mobile layout](docs/images/mobile.png)
</details>
```

Do not add these image references to the README until the files are actually present.
