# Test Coverage Plan: 3D Print Dungeon

This document lists all tests to add or improve to achieve ~90% coverage. Tests are grouped by feature/module. Each section includes specific cases, edge scenarios, and integration points.

---

## 1. Authentication & AuthProvider
- [ ] AuthProvider: context value, role logic, error handling
- [ ] Login/Signup: success, failure, validation, redirects
- [ ] Google/Facebook/Twitter sign-in: stub/failure, success (if implemented)
- [ ] ProtectedRoute, withProtected, withRole: access control, redirects
- [ ] Password change: success, error, validation

## 2. Models & Model Upload
- [ ] ModelUpload: step navigation, validation, upload success/failure, seller verification
- [ ] FilesUpload, InfoForm, PricingForm: field validation, state updates
- [ ] ModelSidebar: edit/save/cancel, owner vs. non-owner
- [ ] ModelViewer: render switching, fullscreen, screenshot, error fallback
- [ ] ModelCard, ModelCardSkeleton: display, loading, click

## 3. Store & Featured
- [ ] Featured: category filtering, empty state, image fallback
- [ ] BestSellers, NewArrivals: sorting, display, edge cases

## 4. Artists & Profiles
- [ ] ArtistProfile: sections, likes, uploads, about
- [ ] ArtistsList: filtering, display

## 5. Community (Forum, Blog, Events, Competitions)
- [ ] ForumHome, ForumCategory, ForumThread: thread/reply CRUD, permissions, error
- [ ] ThreadEditor, ReplyEditor: validation, submit, cancel
- [ ] ForumSidebar, ForumDashboard: navigation, stats
- [ ] Blog, Events, Competitions: list, details, entry forms

## 6. Payment & Checkout
- [ ] CheckoutForm: payment intent, error, success, cancel
- [ ] PaymentModal, PurchaseButton: modal open/close, payment flow
- [ ] SellerVerification: onboarding, error, redirect

## 7. Search & Filtering
- [ ] GlobalSearch, DynamicSearch: input, results, debounce
- [ ] ArtworksTab, ArtistsTab: filter logic, edge cases, empty state

## 8. Settings
- [ ] AccountSettings, ProfileSettings, SecuritySettings: update, validation, error

## 9. Shared Components
- [ ] Navbar, Footer: links, auth buttons, mobile/desktop
- [ ] Layout, ErrorBoundary, Spinner, Skeleton: render, fallback
- [ ] AlertModal, InfiniteScrollList, ScrollToTopButton: open/close, scroll, loading

## 10. Hooks
- [ ] useAuth, useModels, useSearch, useForum, useModal, useUserRole: state, context, edge

## 11. Services
- [ ] modelsService, paymentService, authService, forumService, etc.: API calls, error, edge

## 12. Contexts & Providers
- [ ] All context providers: value, updates, error
- [ ] StripeProvider: context, error

## 13. Routes & Guards
- [ ] All route files: navigation, protection, fallback
- [ ] MaintenanceRoute, ProtectedRoute: access, redirect

---

## Notes
- Prioritize critical flows (auth, upload, payment, forum thread/reply)
- Add integration tests for flows spanning multiple components (e.g., upload to purchase)
- Mock external services (Firebase, Stripe) in all tests
- Ensure accessibility and user interaction coverage
- Update this file as coverage improves or requirements change 