# 3D Print Dungeon

A platform for sharing and discovering 3D printable models.

## Features

### View Tracking System
- Tracks views for each model
- 30-minute cooldown period between views from the same user
- Supports both anonymous and authenticated users
- Real-time view count updates
- Automatic cleanup of old view trackers

### Analytics Dashboard
- Real-time statistics for administrators
- Time range filtering (week/month/year)
- Displays:
  - Total users, models, views, and likes
  - Recent uploads with thumbnails
  - Popular models ranked by views
  - Most active users based on upload count

## Technical Details

### View Tracking Implementation
- Uses Firestore for storing view data
- Cloud Functions for processing views
- Prevents duplicate views within cooldown period
- Cleanup function runs daily to remove old trackers

### Security
- Public read access for models
- Protected write access for view tracking
- Admin-only access to analytics
- Rate limiting on view tracking

### Performance Considerations
- Indexed queries for efficient data retrieval
- Batched updates for cleanup operations
- Client-side caching of view states

## Setup

1. Install dependencies:
```bash
npm install
```

2. Deploy Firestore rules and indexes:
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

3. Deploy Cloud Functions:
```bash
firebase deploy --only functions
```

## Development

### Environment Variables
Create a `.env` file with your Firebase configuration:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running Locally
```bash
npm run dev
```

### Building for Production
```bash
npm run build
``` 