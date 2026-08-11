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



### Modal
1. [x] `types/modal.ts`
2. [x] `context/modalContext.ts`
3. [x] `hooks/useModal.ts`
4. [x] `providers/ModalProvider.tsx`
5. [x] `index.ts`

====================================================================================================

---

## User - Notifications

### Data layer
- [x] `notifications/types/userNotification.ts`
- [x] `notifications/context/userNotificationContext.ts`
- [x] `notifications/hooks/useUserNotification.ts`
- [x] `notifications/services/userNotificationService.ts`
- [x] `notifications/providers/userNotificationProvider.tsx`
- [x] `notifications/index.ts` 

### Components
- [x] `notifications/components/NotificationBadge.tsx`
- [x] `notifications/components/NotificationDropdown.tsx`
- [x] `notifications/components/UserNotificationItem.tsx`
- [x] `notifications/components/ClearAllConfirmModal.tsx`

### Pages 
- [x] `notifications/pages/NotificationsPage.tsx`

---

## User - Profile

### Data layer
- [x] `profile/types/profile.ts`
- [x] `profile/services/profileService.ts`
- [x] `profile/hooks/usePublicProfile.ts`
- [x] `profile/index.ts`

### Pages
- [x] `profile/pages/PublicProfilePage.tsx`
- [x] `profile/pages/ProfileRedirect.tsx`

### Components
- [x] `profile/components/UserHeader.tsx`
- [x] `profile/components/UserPortfolio.tsx`
- [x] `profile/components/UserStats.tsx`
- [x] `profile/components/PrivateStats.tsx`
- [x] `profile/components/ProfileSettingsPanel.tsx`

---

## User - Settings

### Data layer
- [x] `settings/types/settings.ts`
- [x] `settings/services/settingsService.ts`
- [x] `settings/services/profileService.ts`

### Shared components
- [x] `settings/components/parts/SaveChanges.tsx`

### Components
- [x] `settings/components/AccountSettings.tsx`
- [x] `settings/components/NotificationSettings.tsx`
- [x] `settings/components/PrivacySettings.tsx`
- [x] `settings/components/SecuritySettings.tsx`
- [x] `settings/components/SettingsPageSkeleton.tsx`
- [x] `settings/components/ProfileSettings.tsx`

### Pages
- [x] `settings/pages/SettingsPage.tsx`

### Final cleanup
- [ ] `settings/index.ts` if present
- [ ] Remove Settings types from `user/types/user.ts` when no longer used
- [ ] Verify privacy settings are actually enforced by Profile / messaging / Firestore rules
- [ ] Revisit `friends` visibility when Follow/Social is audited
- [ ] Add real MFA/session security features only when backend/auth enforcement exists
- [ ] Fix profile avatar not loading in Settings
- [ ] Fix password change flow
- [ ] when user click on settings/account current theme is by default dark and if theme is set to light it switches visibly make it persistent ..

--- 

## User - Follow

### Data layer
- [x] `follow/types/follow.ts`
- [x] `follow/services/followService.ts`
- [x] `follow/hooks/useFollow.ts`

### Components
- [x] `follow/components/FollowButton.tsx`

---

