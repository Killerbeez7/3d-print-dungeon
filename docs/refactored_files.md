# Full App Refactor

# Goal: 
Track the refactoring progress, keep changes small, working my way up from root to the top, 
keep code clean and readable, refactor only the business logic and leave UI for later


## App root
1. [x] - `index.html`
2. [x] - `src/main.tsx`
3. [x] - `src/features/shared/ErrorBoundary.tsx`
4. [x] - `src/utils/ScrollToTop`
5. [ ] - `src/App.tsx`

## Routes
1. [x] - `src/AppRoutes.tsx`
2. [x] - `src/routes/guards/ProtectedRoute.tsx`
3. [x] - `src/routes/guards/MaintenanceRoute.tsx`
4. [x] - `src/helpers/routeHelpers.tsx` 
5. [x] - `src/components/RouteLoadingIndicator.tsx`

## Maintenance
1. [x] - `src/features/maintenance/services/maintenanceService.ts`
2. [x] - `src/features/maintenance/types/maintenance.ts`
3. [x] - `src/features/maintenance/context/maintenanceContext.ts`
4. [x] - `src/features/maintenance/providers/MaintenanceProvider.tsx`
5. [x] - `src/features/maintenance/hooks/useMaintenance.ts`

## Models
1. [x] - `src/features/models/hooks/useFetchModel.ts`
2. [x] - `src/features/models/hooks/useFetchModels.ts`
3. [x] - `src/features/models/types/models.ts`
4. [x] - `src/features/models/pages/ModelPage.tsx`
5. [x] - `src/features/models/pages/ModelEdit.tsx`
6. [x] - `src/features/models/pages/ModelUpload.tsx`
7. [x] - `src/features/models/services/ModelsFetchService.ts`
8. [x] - `src/features/models/services/ModelsService.ts`
9. [x] - `src/features/models/services/ModelsStatsService.ts`
10. [x] - `src/features/models/services/index.ts`
11. [ ] - `src/features/models/services/likesService.ts`
12. [ ] - `src/features/models/services/favoritesService.ts`
13. [ ] - `src/features/models/services/commentsService.ts`
14. [ ] - `src/features/models/services/viewService.ts`

# Search
1. [x] - `src/features/search/useSearchPage.tsx`
2. [x] - `src/features/search/useArtistsSearchPage.tsx`

### Auth
1. [x] - `src/features/auth/types/auth.ts`
2. [x] - `src/features/auth/context/authContext.tsx`
3. [x] - `src/features/auth/services/authService.ts`
4. [x] - `src/features/auth/utils/refreshIdToken.ts`
5. [x] - `src/features/auth/utils/errorHandling.ts`
6. [x] - `src/features/auth/providers/authProvider.tsx`
7. [x] - `src/features/auth/hooks/useAuth.tsx`
8. [x] - `src/features/auth/hooks/useUserRole.ts`
9. [x] - `src/features/auth/routes/authRoutes.tsx`

### Auth validation
1. [x] - `src/features/auth/utils/inputValidators.tsx`
2. [x] - `src/features/auth/utils/checkAvailability.ts`
3. [x] - `src/features/auth/hooks/useProgressiveValidation.ts`
4. [x] - `src/features/auth/utils/authUtils.ts`

### Cookies
1. [x] - `src/features/cookies/types/cookies.ts`
2. [x] - `src/features/cookies/context/CookiesContext.tsx`
3. [x] - `src/features/cookies/services/cookiesService.ts`
4. [x] - `src/features/cookies/providers/CookiesProvider.tsx`
5. [x] - `src/features/cookies/hooks/useCookies.ts`
6. [x] - `src/features/cookies/hooks/useCookieConsent.ts`
7. [x] - `src/features/cookies/components/ConsentRequiredFeature.tsx`
8. [x] - `src/features/cookies/components/CookieBanner.tsx`
9. [x] - `src/features/cookies/components/CookieSettingsModal.tsx`
10. [x] - `src/features/cookies/routes/policiesRoutes.tsx`

### System Alerts
1. [x] `types/systemAlert.ts`
2. [x] `context/systemAlertContext.ts`
3. [x] `hooks/useSystemAlert.ts`
4. [x] `providers/systemAlertProvider.tsx`
5. [x] `components/SystemAlertContainer.tsx`
6. [x] `index.ts`

### User Notifications
1. [x] `types/userNotification.ts`
2. [x] `context/userNotificationContext.ts`
3. [x] `hooks/useUserNotification.ts`
4. [x] `services/userNotificationService.ts`
5. [x] `providers/userNotificationProvider.tsx`
6. [x] `components/NotificationBadge.tsx`
7. [x] `components/NotificationDropdown.tsx`
8. [x] `components/UserNotificationItem.tsx`
9.  [x] `components/ClearAllConfirmModal.tsx`
10. [x] `pages/NotificationsPage.tsx`
11. [x] `index.ts`