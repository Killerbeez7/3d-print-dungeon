# Full App Refactor

Purpose: To track the refactoring progress, keep changes small, working my up from root to the top, keep code clean and readable

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

## Auth
1. [x] - `src/features/auth/context/authContext.tsx`
2. [x] - `src/features/auth/hooks/useAuth.tsx`
3. [ ] - `src/features/auth/providers/authProvider.tsx`
4. [ ] - `src/features/auth/hooks/useUserRole.ts`
5. [ ] - `src/features/auth/types/auth.ts`
6. [ ] - `src/features/auth/services/authService.ts`