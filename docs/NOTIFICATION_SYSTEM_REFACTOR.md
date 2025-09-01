# 🔔 Notification System Refactor

## Overview

The notification system has been refactored to separate **system alerts** (success/error popups) from **user notifications** (persistent notifications like purchases, messages, etc.).

## 🚨 System Alerts (Formerly "Notifications")

**Purpose**: Temporary popup alerts for user feedback (success, error, warning, info)

**Location**: `src/features/system-alerts/`

**Components**:
- `SystemAlertContainer` - Displays system alerts
- `SystemAlertProvider` - Manages alert state
- `useSystemAlert` - Hook to trigger alerts

**Usage**:
```tsx
import { useSystemAlert } from "../features/system-alerts";

const MyComponent = () => {
  const { success, error, warning, info } = useSystemAlert();
  
  const handleSuccess = () => {
    success("Success!", "Operation completed successfully");
  };
  
  const handleError = () => {
    error("Error!", "Something went wrong");
  };
  
  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
};
```

## 🔔 User Notifications (New Feature)

**Purpose**: Persistent notifications for user events (purchases, messages, likes, etc.)

**Location**: `src/features/user-notifications/`

**Components**:
- `UserNotificationContainer` - Full notification panel
- `UserNotificationItem` - Individual notification display
- `NotificationBadge` - Simple badge for navbar
- `UserNotificationProvider` - Manages notification state
- `useUserNotification` - Hook to access notifications

**Types**:
- `purchase` - Model purchases
- `sale` - Model sales (for sellers)
- `message` - New messages
- `like` - Model likes
- `comment` - Model comments
- `follow` - New followers
- `download` - Model downloads
- `system` - System announcements

**Usage**:
```tsx
import { useUserNotification } from "../features/user-notifications";

const MyComponent = () => {
  const { addNotification, notifications, unreadCount } = useUserNotification();
  
  const handlePurchase = async () => {
    await addNotification({
      userId: "user123",
      type: "purchase",
      title: "Purchase Successful!",
      message: "You've purchased 'Cool Model' for $5.99",
      relatedId: "model123",
      relatedType: "model",
      metadata: { price: 5.99, modelName: "Cool Model" }
    });
  };
  
  return (
    <div>
      <p>Unread: {unreadCount}</p>
      <button onClick={handlePurchase}>Simulate Purchase</button>
    </div>
  );
};
```

## 🔄 Migration Steps

### 1. Update Imports

**Before**:
```tsx
import { useNotification } from "../features/notifications";
import { NotificationContainer } from "../features/notifications";
```

**After**:
```tsx
// For system alerts (success/error popups)
import { useSystemAlert } from "../features/system-alerts";
import { SystemAlertContainer } from "../features/system-alerts";

// For user notifications (purchases, messages, etc.)
import { useUserNotification } from "../features/user-notifications";
import { UserNotificationContainer } from "../features/user-notifications";
```

### 2. Update Hook Usage

**Before**:
```tsx
const { success, error } = useNotification();
```

**After**:
```tsx
const { success, error } = useSystemAlert();
```

### 3. Update Component Names

**Before**:
```tsx
<NotificationContainer />
```

**After**:
```tsx
<SystemAlertContainer />
```

### 4. Add User Notification Provider

In your main app provider:

```tsx
import { SystemAlertProvider } from "../features/system-alerts";
import { UserNotificationProvider } from "../features/user-notifications";

function App() {
  return (
    <SystemAlertProvider>
      <UserNotificationProvider>
        {/* Your app content */}
      </UserNotificationProvider>
    </SystemAlertProvider>
  );
}
```

## 🎯 Integration Examples

### Navbar Integration

```tsx
import { NotificationBadge } from "../features/user-notifications";

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  
  return (
    <nav>
      <NotificationBadge onClick={() => setShowNotifications(true)} />
      {showNotifications && (
        <UserNotificationContainer />
      )}
    </nav>
  );
};
```

### Payment Success Integration

```tsx
import { useSystemAlert } from "../features/system-alerts";
import { useUserNotification } from "../features/user-notifications";

const PaymentHandler = () => {
  const { success } = useSystemAlert();
  const { addNotification } = useUserNotification();
  
  const handlePaymentSuccess = async (modelId: string, modelName: string, price: number) => {
    // Show immediate success alert
    success("Payment Successful!", `You've purchased ${modelName}`);
    
    // Create persistent notification
    await addNotification({
      userId: currentUser.uid,
      type: "purchase",
      title: "Purchase Successful!",
      message: `You've purchased "${modelName}" for $${price.toFixed(2)}`,
      relatedId: modelId,
      relatedType: "model",
      metadata: { price, modelName }
    });
  };
  
  return <div>...</div>;
};
```

## 🗄️ Database Schema

The user notifications are stored in Firestore with the following structure:

```typescript
interface UserNotification {
  id: string;
  userId: string;
  type: UserNotificationType;
  title: string;
  message: string;
  status: "unread" | "read" | "archived";
  relatedId?: string;
  relatedType?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  readAt?: Date;
}
```

## 🚀 Benefits

1. **Clear Separation**: System alerts vs. user notifications
2. **Better UX**: Persistent notifications for important events
3. **Scalable**: Easy to add new notification types
4. **Performance**: Separate concerns, better optimization
5. **Maintainable**: Cleaner code structure

## 🔧 Future Enhancements

- [ ] Push notifications
- [ ] Email notifications
- [ ] Notification preferences
- [ ] Notification categories
- [ ] Bulk actions
- [ ] Notification history
- [ ] Real-time updates with Firebase listeners
