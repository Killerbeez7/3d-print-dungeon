# Forum Functional Audit

## What Already Worked

- Forum routes existed for home, category, thread detail, dashboard, my threads, rules, help, create thread, edit thread, and edit reply.
- Auth-gated create/edit routes were already wired through protected route helpers.
- Thread creation, reply creation, thread detail loading, reply pagination, and category listing had real Firestore-backed service calls.
- Thread owner edit/delete actions were visible on thread detail, and reply owner edit/delete actions were visible on replies.
- Home tabs for recent, popular, and unanswered were connected to data filters rather than static markup.

## Broken Or Incomplete

- Search only queried thread title prefixes, so content, tags, and category matches did not work despite the search bar implying broader forum search.
- The home search no-results UI was effectively bypassed when an empty result page existed.
- Creating a thread returned users to the forum home instead of opening the created thread, so success was ambiguous.
- Category thread sorting was cached only by category id, so changing sort order could show stale results.
- My Threads displayed a delete button that did nothing.
- Dashboard claimed to show replies, but `getUserReplies` returned an empty array by design.
- Edit reply depended on `currentThread.replies`, so direct navigation or refresh on `/forum/reply/:replyId/edit` could not load the reply.
- Client-side thread update/delete permission checks were inconsistent with the UI; service calls now reject non-owner edits/deletes before Firestore does.
- Several empty states were passive and did not offer useful next actions.
- Sidebar category active styling had a malformed class string and top-level nav active states were inconsistent.

## Implemented

- Expanded forum search to match thread title, content, category id/name, and tags within the latest query window.
- Added useful search empty states with clear-search and create-thread actions.
- Added better empty states for recent/popular/unanswered lists, category lists, thread replies, and My Threads filtering.
- Changed thread creation success behavior to navigate directly to the new thread.
- Added create-thread cancel behavior.
- Added category-aware creation from category pages and empty category states through `?category=...`.
- Reworked category thread list loading to use query filters directly, so sort changes fetch the correct data.
- Implemented real user reply fetching through Firestore.
- Updated dashboard to show actual recent replies and removed the dead "view all replies" link.
- Connected My Threads delete action and invalidated thread queries after deletion.
- Added direct reply edit loading with `getReplyById`.
- Added owner checks for thread edit, thread update, reply edit, and reply delete paths.
- Added unauthenticated and locked-thread reply states that explain what action is available.
- Fixed sidebar active-state behavior and malformed category link class.

## Removed Or Hidden

- Removed the non-functional My Threads delete placeholder behavior by replacing it with real deletion logic.
- Removed the dashboard "View all my replies" link because there is not yet a real replies index route.
- Removed passive placeholder-style empty messages where a concrete action is available.

## Remaining Missing Functionality

- There is still no dedicated "My Replies" route with pagination and filtering.
- There is no saved/followed threads feature exposed, which is preferable to showing unfinished saved/follow UI.
- Moderator/admin forum actions are not implemented in the UI, beyond owner actions.
- Search is functional but still not a full server-side text index; large-scale forum search should move to a search service or denormalized searchable fields.
- Thread list counts by category are not maintained or displayed as real live counts.
- Reply deletion decrements `replyCount`, but `lastActivity` is not recalculated when deleting the latest reply.

## Recommended Visual Polish Later

- Refine density and spacing of forum cards, stats panels, and filters without changing the now-working flows.
- Normalize remaining legacy blue/red utility colors to the product token palette where appropriate.
- Improve mobile sidebar discoverability and compact sidebar tooltips.
- Add clearer category descriptions and count badges once counts are backed by real data.
