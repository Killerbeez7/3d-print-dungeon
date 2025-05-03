desktop 
- use search in layout for all components and pass different searchResults for diff components

mobile
- only button should appear on close side menu
- side menu takes whole screen, disable the rest on open and vise versa






03/05/2025
MARKETPLACE UPDATES
Requirements & Features
- [ ] Core Marketplace Features:
- [ ] Listings: Users can post items for sale/trade (3D prints, printers, materials, services, etc.).
- [ ] Listing Details: Title, description, price, images, category, location, condition, contact method.
- [ ] Search & Filter: By category, price, location, keywords, etc.
- [ ] User Profiles: View seller’s other listings, ratings, and contact info.
- [ ] Messaging: (Optional) In-app messaging or external contact (email, Discord, etc.).
- [ ] Moderation: Report listings, admin controls for removal.
- [ ] Status: Mark as sold/available.
- [ ] Safety: Warnings about scams, safe trading tips.

UI/UX Structure
Marketplace Home:
- [ ] Search bar, filters, categories grid, featured/newest listings.
Listing Card:
- [ ] Image, title, price, location, status, quick contact.
Listing Details Page:
- [ ] All info, image gallery, seller info, contact button, report button.
Create/Edit Listing Form:
- [ ] Robust validation, image upload, preview.
My Listings:
- [ ] Manage, edit, mark as sold, delete.
Admin Panel:
- [ ] Moderate reported listings.

30/04/25
- [ ] disable scroll over model in modelView mobile version


29/04/25
- [ ] fix forum routes: delete lines [30-40] and add open auth modal if non logged user tries to click
- [ ] add maintenance protection for forum home page - wrap lines [22-24] with {withMaintenance}
- [x] add timestamps for comments
  
28/04/25
Small UX update Navbar, Carousel
- [x] update: mobile carousel slide from 4 to 1
- [x] update: move auth buttons out of navbar in separate component.hide sign up button on mobile, takes too much 
- [x] add: logic to first item from carousel (featured models) now list all models that have the featured tag from admin dashboard


27/04/2025
Contexts refactoring
- [x] split + tsx: authContext: authContext + authProvicer + useAuth
- [x] split + tsx (only context file): modelsContext ==> modelsContext + modelsProvicer + useModels
- [x] split + tsx (only context file): forumContext ==> forumContext + forumProvicer + useForum
- [x] split + tsx (only context file): searchContext ==> searchContext + searchProvicer + useSearch
- [x] split + tsx (only context file): commentsContext ==> commentsContext + commentsProvicer + useComments


26/04/2025
ModelViewer components fix
- [x] fix: fullscreen button in mobile model viewer
- [x] fix: menu buttons are clickable even when the menu is closed in full screen
- [x] add: roles and aria labels for menu buttons for better SEO
- [x] add: menu close after 5 sec of not hovering in full screen mode 
- [x] add: custom full screen  
- [x] add: cutom sript for deploy hosting only "npm run hosting": "npm run build && firebase deploy --only hosting"
- [x] fix: auto close not trigering in mobile full screen mode + add more time before close
- [x] fix: render images not properly centered in full screen mode
- [x] fix: add default image on sign up, but keep image check in model view for better UI (find better solution later)
- [x] call it a day :D


Todays tasks
########################################################################################

Model page improvements

1. Viewer Window Improvements:
- [x] Add a loading spinner or progress indicator
- [x] Improve the 3D viewer controls and interactions
- [ ] Add zoom controls
- [x] Add rotation controls
- [ ] Add a reset view button                                               // fix it
- [x] Add a fullscreen toggle
- [x] Add a screenshot/capture button
  
1. UI/UX Improvements:
- [ ] Make the viewer window more responsive
- [ ] Add better error states
- [ ] Improve the loading states
- [ ] Add tooltips for controls
- [ ] Add keyboard shortcuts
  
1. Performance Improvements:
- [ ] Optimize the 3D model loading
- [ ] Add lazy loading for thumbnails
- [ ] Add progressive loading for large models

########################################################################################








# code optimization
- [ ] add username is taken check - https://www.youtube.com/watch?v=_l5Q5kKHtR8


1-since we have a daily cleanup function for viewTrackers, 
we can potentially simplify by only keeping userViews and 
the view count on the model documents themselves.



### General
- [x] Fill other pages with content (Buy 3D models, For Business)
- [x] Analytics Dashboard
- [x] Monitor Analytics
- [ ] Digital Purchases & Licensing
- [ ] Community Forums or Q&A
- [ ] Messaging & Notifications

- [ ] Content Moderation
- [ ] User Management

### Search engine
- [ ] Search Suggestions/Autocomplete:

### General
- [ ] Fill other pages with content (Buy 3D models, For Business)
- [ ] Analytics Dashboard
- [ ] Monitor Analytics
- [ ] Digital Purchases & Licensing
- [ ] Community Forums or Q&A
- [ ] Messaging & Notifications

### Gallery
- [ ] Overall gallery design (better cards, with hover effects, similar to Artstation)
- [ ] Create working search feature

### Artists
- [ ] Copy the gallery design
- [ ] Add sorting (and filters- optionally)

### ModelView
- [x] Fix styles
- [x] Create likes functionality
- [x] Display number of likes and downloads
- [x] Display liked models in user's profile
- [x] Review comment / ratings

### UploadModel
- [x] Fix styles
- [x] Improve general structure - bigger previews for example

### Profile
- [ ] Order history?
- [ ] Detailed Portfolios

### Settings
- [ ] Fill all sections with content
- [ ] Create option to change user's bio

###########################################

View Tracking System:
- [x] View service implementation is solid
- [x] Cooldown period working correctly
- [x] Proper error handling
- [x] Clean documentation

Cloud Functions:
- [x] View tracking function working
- [x] Cleanup function implemented
- [x] Good logging for debugging
- [x] Proper error handling


Analytics Component:
- [x] Time range filtering working
- [x] All stats displaying correctly
- [x] Proper loading states
- [x] Responsive design

Firestore Rules:
- [x] Proper security for view tracking
- [x] Admin access controls
- [x] Public read access where needed

- [ ] adding charts for view tracking -- https://recharts.org/en-US/




- [ ] on desktop mobile view nav doesnt detect clicks in nav links with hover and press on the carouse; insted of the nav links

