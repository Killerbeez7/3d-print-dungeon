model viewer component problems

26/04/2025
- [x] fix: fullscreen button in mobile model viewer
- [x] fix: menu buttons are clickable even when the menu is closed in full screen
- [x] add: roles and aria labels for menu buttons for better SEO
- [x] add: menu close after 5 sec of not hovering in full screen mode 
- [x] add: custom full screen  
- [x] add: cutom sript for deploy hosting only "npm run hosting": "npm run build && firebase deploy --only hosting"
- [x] fix: auto close not trigering in mobile full screen mode + add more time before close
- [x] fix: render images not properly centered in full screen mode



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


- [ ] Fix carousel on mobile to scroll only 1 tile not 4
- [ ] add username is taken check - https://www.youtube.com/watch?v=_l5Q5kKHtR8


1-since we have a daily cleanup function for viewTrackers, 
we can potentially simplify by only keeping userViews and 
the view count on the model documents themselves.


### Update the styles of this components while keeping all the existing functionality the same!
- [x] ModelView
- [ ] 

### General
- [ ] Fill other pages with content (Buy 3D models, For Business)
- [ ] Analytics Dashboard
- [ ] Monitor Analytics
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
- [ ] Fix styles
- [ ] Create likes functionality
- [ ] Display number of likes and downloads
- [ ] Display liked models in user's profile
- [ ] Review comment / ratings

### UploadModel
- [ ] Fix styles
- [ ] Improve general structure - bigger previews for example

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