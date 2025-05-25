# 3D Print Dungeon

A platform for sharing and discovering 3D printable models.
You can access it on: https://print-dungeon-3d.web.app/


# Features

### Authentication & Role-Based Access Control
- Firebase Authentication (email, Google) with session-aware AuthProvider using React context.
- User roles stored in Firestore as roles: string[] (supports multiple roles per user).
- Access control logic centralized via:
- ProtectedRoute component for guarding pages based on auth and roles
- withProtected, withRole, and withProtectedMaintenance helpers for clean route definitions
- Roles supported: admin, artist, moderator, user, premium, etc.
- UI and routes conditionally render based on user permissions using a custom useUserRole() hook.
- Unauthorized users are redirected automatically to login or home, with fallback protection for maintenance mode.
#### Example: /admin is only accessible to users with the admin role, while /model-upload is available to admin and artist


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

### Deploying for Production
```bash
npm run deploy
``` 

## Testing

### Setup
The project uses Vitest and React Testing Library for testing. The test environment is configured in `vitest.config.ts`.

### Running Tests
```bash
# Run all tests
npm test

# Run tests in ui mode
npm run test:ui

### Test Structure
- Tests are located in the `__tests__` directory
- Component tests are organized in `__tests__/components`
- Mock implementations are in `__tests__/mocks`

### Writing Tests
- Use `describe` blocks to group related tests
- Each test should be independent and isolated
- Mock external dependencies (Firebase, contexts, etc.)
- Follow the Arrange-Act-Assert pattern

Example test structure:
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something specific', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Testing Best Practices
1. Mock external services and contexts
2. Test both success and error cases
3. Use meaningful test descriptions
4. Keep tests focused and maintainable
5. Test user interactions and component behavior
6. Use appropriate query methods from Testing Library
7. Follow accessibility testing guidelines 
