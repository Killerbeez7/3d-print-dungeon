1. [ ] - modal not opening when non-logged user try download a model
2. [ ] - no notification when a model is added to favorites
3. [ ] - add no drag to home page model images
4. [ ] - unify all react-icons in the app
5. [ ] - extract helper functions from notificationsDropdown and notificationsItem into separate file
6. [ ] - remove old broken typography system H1, H2 ...
7. [ ] - rename policiesRoute to cookiesRoute
8. [ ] - on model like the text change from "like" to "likes" moves the favorite icon/text
9.  [ ] - add small "x" button in user notifications to be able to delete them from the dropdown, and handle the click notification logic better
10. [ ] - when using search artworks and set sort filter then delete the query and i get all models, it should be empty
11. [ ] - decide if forum categories should live on firestore or in conf file
12. [ ] - navbar -> auth icons -> bell icon is a bit up and its not properly aligned with the rest verticaly

## Performance
1. [ ] !! UserNotificationProvider: should only subscribe after user is logged in.
2. [ ] Profile/private profile listeners: only subscribe when auth user exists.
3. [ ] Admin/user/settings/forum/search/model listeners: should not run globally.

Do not create Google provider / popup logic until auth modal opens.
Do not fetch private profile until auth state confirms a real user.
Do not block page shell rendering on auth profile data.

## Backend / Cloud Functions audit

- [ ] Make like create/delete counter side effects idempotent against function retries
- [ ] Decide whether repeated unlike → like should create repeated notifications
- [ ] Audit `deleteModel` auth handling when `request.auth` is missing
- [ ] Update `deleteModel` admin authorization to use current canonical role/claims architecture
- [ ] Update `deleteModel` favorites cleanup to current private favorites storage
- [ ] Verify deleting a model correctly removes its likes from uploader aggregate `likesCount`
- [ ] Review model Storage deletion path extraction instead of deriving paths from download URLs
- [ ] Replace generic `Error` responses with proper `HttpsError`
- [ ] Audit model deletion for Firestore transaction size / scalability
- [ ] Fix uploader likesCount cleanup when deleting a model with existing likes