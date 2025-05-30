## 📱 Mobile Breakpoint Audit Checklist

### General Layout
  - [ ] No horizontal scroll at 320px, 375px, or 768px 
  // components to fix at 320px:
  model page
  events home
  forum home

   // components to fix at 375px:
   forum home
   
   // components to fix at 768px:
   forum home


  - [ ] Content fits within the viewport (no clipped text/images)
  - [ ] Padding and margins are comfortable (not too tight or too wide)
  - [ ] No fixed widths that break on small screens

### Navigation
  - [ ] Navigation/menu is accessible and usable
  - [ ] Hamburger menu or mobile nav works as expected
  - [ ] All links/tabs are tappable and not too small

### Typography
  - [ ] Headings are not too large or overflowing
  - [ ] Body text is readable (not too small or too large)
  - [ ] No text overlaps or is cut off

### Buttons & Inputs
  - [ ] Buttons are large enough to tap (min 44x44px)
  - [ ] Inputs are full width or fit the screen
  - [ ] No elements are too close together

### Images & Cards
  - [ ] Images scale down and keep aspect ratio
  - [ ] Cards wrap and fill the space (no overflow)
  - [ ] No fixed heights/widths that break layout

### Grids & Lists
  - [ ] Grids auto-wrap (e.g., use grid-cols-[repeat(auto-fill,minmax(14rem,1fr))])
  - [ ] Lists are readable and not squished

### Modals & Popups
  - [ ] Modals fit the screen and are scrollable if needed
  - [ ] No content is hidden off-screen

### Special Components
  - [ ] Carousels/swipers are swipeable and not clipped
  - [ ] Custom components (e.g., model viewer) are usable on mobile

### Accessibility
  - [ ] Sufficient color contrast
  - [ ] All images have alt text
  - [ ] Can be navigated with keyboard (tab key)

---













- [ ] **CV-first roadmap**
  - Focus on visible polish + code quality first; leave deep refactors until you need them.

  🔥 **Do in the next 1-2 weeks**
  - [ ] **1. Finish mobile breakpoints**
    - [ ] Audit every page at 320 px / 375 px / 768 px.
    - [ ] Replace fixed h-40, w-[300px], large paddings with aspect-[4/5], max-w-xs, p-2 md:p-4.
    - [ ] Use grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] patterns so cards auto-wrap.
    - [ ] A full design-system refactor (e.g. moving to Tailwind or Chakra) can wait—small CSS utils get you 90% there.
  - [ ] **2. Lazy-load heavy bundles**
    - [ ] Dynamic‐import <ModelViewer> and Three.js only on the model details page (import(/* webpackChunkName: "viewer" */ '...')).
    - [ ] Add React 18 <Suspense> fallback.
    - [ ] Code splitting the entire app with Route level chunks (Vite PWA plugin) is nice but not urgent.
  - [ ] **3. Add Lighthouse-clean PWA basics**
    - [ ] @vite-pwa/plugin + manifest.webmanifest so the site installs on a phone.
    - [ ] A 192×192 and 512×512 icon.
    - [ ] Full offline mode (background syncing) is future work.
  - [ ] **4. README + Architecture doc**
    - [ ] Explain "why React-Query over Redux", the Storage resize pipeline, and folder layout. Recruiters love clear docs.
    - [ ] Auto-generated Storybook docs—great later, not critical now.
  - [ ] **5. GitHub Actions CI**
    - [ ] On every push: npm ci && npm run lint && npm run test.
    - [ ] Deploy preview to Firebase Hosting --channel pr-<num>.
    - [ ] End-to-end Cypress tests running in CI—valuable, but after the basics are green.
  - [ ] **6. Strong sample data & screenshots**
    - [ ] Populate Firestore with 3-5 "showcase" models and events.
    - [ ] Add gif/videos of upload flow to the repo's README.
    - [ ] Admin dashboard for editing data can wait.
  - [ ] **7. Accessibility pass (a11y)**
    - [ ] npm i -D @axe-core/react, run in dev, fix obvious colour contrast & missing alt.
    - [ ] Full WCAG 2.1 AA audit could be future freelance work.
  - [ ] **8. Unit-test one slice**
    - [ ] Pick modelsService.js; mock Firebase and test upload logic. Shows real-world testing skill in small time.
    - [ ] 100% coverage everywhere is not needed for a portfolio.
  - [ ] **9. Error boundaries & toast feedback**
    - [ ] Wrap routes in <ErrorBoundary>; show a toast on Firestore errors. Polished UX for little code.
    - [ ] Ce

⏳ **Park for later** 


# Maintenance Mode Enhancements

## 1. Maintenance Mode Settings UI
- [ ] Create admin panel section for managing maintenance mode
- [ ] Add ability to set maintenance duration/ETA
- [ ] Allow custom maintenance messages
- [ ] Add scheduled maintenance mode
- [ ] Implement maintenance mode history/logs
- [ ] Add maintenance mode status indicators
- [ ] Create maintenance mode calendar view

## 2. Enhanced Maintenance Page
- [ ] Add countdown timer showing maintenance end time
- [ ] Include contact form for urgent issues
- [ ] Add status page showing affected services
- [ ] Show maintenance history/logs
- [ ] Implement maintenance mode announcements
- [ ] Add service status indicators
- [ ] Create maintenance mode timeline

## 3. Advanced Access Control
- [ ] Add different admin roles (super admin, maintenance admin)
- [ ] Implement IP whitelisting for emergency access
- [ ] Add maintenance mode bypass tokens
- [ ] Create maintenance mode audit log
- [ ] Implement role-based access control
- [ ] Add access token management
- [ ] Create detailed access logs

## 4. User Communication
- [ ] Add email notifications for maintenance mode changes
- [ ] Create maintenance mode announcement system
- [ ] Add maintenance mode status API endpoint
- [ ] Implement maintenance mode RSS feed
- [ ] Add in-app notifications
- [ ] Create maintenance mode status page
- [ ] Implement maintenance mode alerts

## 5. Automation Features
- [ ] Add automatic maintenance mode scheduling
- [ ] Create maintenance mode health checks
- [ ] Implement automatic rollback if issues detected
- [ ] Add maintenance mode status monitoring
- [ ] Create maintenance mode automation rules
- [ ] Add maintenance mode triggers
- [ ] Implement maintenance mode alerts system

## 6. Documentation
- [ ] Create maintenance mode user guide
- [ ] Add maintenance mode API documentation
- [ ] Create maintenance mode admin guide
- [ ] Add maintenance mode troubleshooting guide
- [ ] Create maintenance mode best practices
- [ ] Add maintenance mode security guidelines
- [ ] Create maintenance mode deployment guide

# Maintenance Scheduling Implementation

## Core Functionality
- [x] Create maintenance service for handling scheduled maintenance
  - [x] Implement real-time listener for maintenance settings
  - [x] Add automatic maintenance mode activation based on schedule
  - [x] Add automatic maintenance mode deactivation based on end time
  - [x] Handle both scheduled and manual maintenance modes

## Integration
- [x] Update auth context to use maintenance service
  - [x] Add maintenance mode state
  - [x] Set up maintenance listener
  - [x] Provide maintenance state to application

## Testing
- [ ] Test scheduled maintenance activation
- [ ] Test scheduled maintenance deactivation
- [ ] Test manual maintenance with end time
- [ ] Test admin access during maintenance

## UI/UX Improvements
- [ ] Add countdown timer for scheduled maintenance
- [ ] Add maintenance schedule preview
- [ ] Improve maintenance mode transition animations
- [ ] Add maintenance history log

# Performance Optimization Tasks

## High Priority
- [x] Code Splitting & Lazy Loading
  - [x] Implement React.lazy() for route-based code splitting
  - [x] Move heavy components into separate chunks
  - [ ] Optimize initial bundle size

- [ ] Context Optimization
  - [ ] Consolidate contexts to reduce re-renders
  - [ ] Implement context selectors
  - [ ] Consider state management alternatives

- [ ] Image Optimization
  - [ ] Implement next-gen image formats
  - [ ] Add lazy loading for images
  - [ ] Use responsive images with srcset
  - [ ] Set up CDN for static assets

- [ ] CSS Optimization
  - [ ] Remove unused CSS
  - [ ] Implement CSS modules
  - [ ] Use CSS containment
  - [ ] Optimize CSS-in-JS solution

## Medium Priority
- [ ] API Optimization
  - [ ] Implement request caching
  - [ ] Add request debouncing
  - [ ] Implement error boundaries
  - [ ] Add retry logic

- [ ] Build Optimization
  - [ ] Configure tree-shaking
  - [ ] Implement module/nomodule pattern
  - [ ] Optimize build configuration
  - [ ] Add proper source maps

- [ ] Performance Monitoring
  - [ ] Add performance monitoring
  - [ ] Implement Core Web Vitals tracking
  - [ ] Set up error tracking
  - [ ] Define performance budgets

## Low Priority
- [ ] Security Enhancements
  - [ ] Implement CSP headers
  - [ ] Add rate limiting
  - [ ] Improve authentication flow
  - [ ] Add input sanitization

- [ ] Accessibility Improvements
  - [ ] Add ARIA labels
  - [ ] Implement keyboard navigation
  - [ ] Ensure color contrast
  - [ ] Add screen reader support

- [ ] Caching Strategy
  - [ ] Implement service worker
  - [ ] Add cache headers
  - [ ] Implement stale-while-revalidate
  - [ ] Add cache invalidation strategy

