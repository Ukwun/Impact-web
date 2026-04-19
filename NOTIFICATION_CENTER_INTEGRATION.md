# Notification Center Integration Guide

## Overview

The Notification Center provides a complete notification system for your application, including:
- In-app notification center with dropdown menu
- Toast notifications for quick feedback
- Persistent notification storage with Context API
- Mark as read/unread functionality
- Auto-dismiss notifications
- Unread badge counter
- Search and filter support

## Architecture

### Component Structure

```
src/
├── types/
│   └── notification.ts            # Notification types & interfaces
├── context/
│   └── NotificationContext.tsx    # NotificationProvider & useNotifications hook
├── components/
│   ├── NotificationCenter.tsx     # Bell icon + dropdown menu
│   └── ToastNotifications.tsx     # Toast notifications (bottom-right)
└── lib/
    └── notificationUtils.ts       # Utility functions (TO BE CREATED)
```

### Type System

```typescript
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;                    // Unique identifier
  title: string;                 // Notification title
  message: string;               // Notification body
  type: NotificationType;        // Visual type (affects color/icon)
  priority: NotificationPriority;// Priority level
  timestamp: Date;               // When notification was created
  read: boolean;                 // Read/unread status
  actionUrl?: string;            // Optional link to navigate to
  actionLabel?: string;          // Label for action button
  dismissible?: boolean;         // Can user dismiss it?
  duration?: number;             // Auto-dismiss after N milliseconds
  metadata?: {                   // Custom data
    userId?: string;
    courseId?: string;
    eventId?: string;
    [key: string]: any;
  };
}
```

## Components

### 1. NotificationCenter
**File:** `src/components/NotificationCenter.tsx`

Main UI component showing:
- Bell icon with unread badge counter
- Dropdown menu with all notifications
- Mark as read/unread functionality
- Auto-dismiss on outside click
- Notification type indicators (colors/icons)
- Formatted timestamps ("5m ago", "2h ago")
- Clear all notifications button

**Props:** None (uses context automatically)

**Example:**
```tsx
import { NotificationCenter } from '@/components/NotificationCenter';

export function Navbar() {
  return (
    <nav>
      <div className="flex items-center gap-4">
        {/* Other navbar content */}
        <NotificationCenter />
      </div>
    </nav>
  );
}
```

### 2. ToastNotifications
**File:** `src/components/ToastNotifications.tsx`

Displays floating toast notifications at bottom-right. Auto-dismisses based on notification `duration` property.

**Usage:**
```tsx
import { ToastNotifications } from '@/components/ToastNotifications';

export function Layout() {
  return (
    <>
      {/* Main content */}
      <ToastNotifications />
    </>
  );
}
```

### 3. NotificationProvider
**File:** `src/context/NotificationContext.tsx`

Context provider that manages all notifications. Must wrap your app.

## Integration Steps

### Step 1: Wrap App with Provider

```tsx
// app/layout.tsx
import { NotificationProvider } from '@/context/NotificationContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
```

### Step 2: Add Components to Layout

```tsx
// components/Navbar.tsx (or your header component)
'use client';

import { NotificationCenter } from '@/components/NotificationCenter';

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-4 py-3 border-b border-dark-600">
      <div>{/* Logo */}</div>
      
      <div className="flex items-center gap-4">
        {/* Other icons/buttons */}
        <NotificationCenter />
      </div>
    </nav>
  );
}
```

```tsx
// app/layout.tsx
import { ToastNotifications } from '@/components/ToastNotifications';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Navbar />
        {children}
        <ToastNotifications />
      </body>
    </html>
  );
}
```

### Step 3: Use Notifications in Components

```tsx
'use client';

import { useNotifications, createNotification } from '@/context/NotificationContext';
import { createNotification } from '@/types/notification';

export function MyComponent() {
  const { addNotification } = useNotifications();

  const handleSuccess = () => {
    addNotification(
      createNotification(
        'Success!',
        'Your changes have been saved',
        'success',
        {
          priority: 'low',
          duration: 3000, // Auto-dismiss after 3 seconds
        }
      )
    );
  };

  const handleError = () => {
    addNotification(
      createNotification(
        'Error',
        'Failed to save changes. Please try again.',
        'error',
        {
          priority: 'high',
          dismissible: true,
        }
      )
    );
  };

  return (
    <>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </>
  );
}
```

## Usage Examples

### Basic Toast Notification

```tsx
const { addNotification } = useNotifications();

// Success toast
addNotification({
  title: 'Course Enrolled!',
  message: 'You have successfully enrolled in Advanced React',
  type: 'success',
  priority: 'medium',
  duration: 4000, // Auto-dismiss after 4 seconds
  dismissible: true,
});
```

### Persistent Notification with Action

```tsx
// Notification that stays until user dismisses it
addNotification({
  title: 'New Message',
  message: 'John sent you a message in the community forum',
  type: 'info',
  priority: 'high',
  actionUrl: '/messages/john',
  actionLabel: 'View Message',
  dismissible: true,
});
```

### Error Notification

```tsx
addNotification({
  title: 'Payment Failed',
  message: 'Your payment could not be processed. Please check your card details.',
  type: 'error',
  priority: 'urgent',
  dismissible: true,
});
```

### With Metadata

```tsx
addNotification({
  title: 'Course Updated',
  message: 'New content available in Financial Literacy 101',
  type: 'info',
  priority: 'medium',
  actionUrl: '/courses/financial-literacy',
  metadata: {
    courseId: 'course-123',
    newLessons: 3,
  },
});
```

## API Integration (When Ready)

Currently, the notifications are stored in memory via React Context. To persist notifications to a database:

### 1. Create API Endpoints

```typescript
// GET /api/notifications
// Returns: Notification[]
// Fetches all user notifications

// POST /api/notifications
// Body: Notification (without id, timestamp, read)
// Creates new notification

// PUT /api/notifications/:id/read
// Marks notification as read

// PUT /api/notifications/read-all
// Marks all notifications as read

// DELETE /api/notifications/:id
// Deletes notification

// DELETE /api/notifications
// Deletes all notifications
```

### 2. Update NotificationContext

In `src/context/NotificationContext.tsx`, uncomment the API calls:

```tsx
const addNotification = useCallback(async (notification) => {
  // ... create local notification ...
  
  // Uncomment to persist to API:
  const response = await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newNotification),
  });
  
  if (!response.ok) throw new Error('Failed to save notification');
}, []);
```

## Real-Time Updates (WebSocket Integration)

To receive real-time notifications from the server:

```tsx
// In NotificationContext.tsx, add WebSocket connection:
useEffect(() => {
  const ws = new WebSocket('wss://your-server.com/notifications');
  
  ws.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    addNotification(notification);
  };
  
  return () => ws.close();
}, []);
```

Or use the polling approach similar to Admin Alerts:

```tsx
// Check for new notifications every 30 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch('/api/notifications');
    const newNotifications = await response.json();
    // Compare with current notifications and add new ones
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

## Styling & Customization

### Colors & Icons

Edit the `getNotificationIcon()` and `getBgColor()` functions to customize styles:

```tsx
const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    // ... etc
  }
};
```

### Notification Position

To change toast position from bottom-right:

```tsx
// In ToastNotifications.tsx, change this line:
<div className="fixed bottom-4 right-4 z-50 space-y-2">

// To one of these:
<div className="fixed bottom-4 left-4 z-50 space-y-2">    {/* Bottom-left */}
<div className="fixed top-4 right-4 z-50 space-y-2">      {/* Top-right */}
<div className="fixed top-4 left-4 z-50 space-y-2">       {/* Top-left */}
<div className="fixed top-1/2 left-1/2 z-50 space-y-2"> {/* Center */}
```

### Max Visible Toasts

Control how many toast notifications display:

```tsx
// In ToastNotifications.tsx:
const toasts = notifications
  .filter((n) => n.duration && n.duration <= 5000)
  .slice(0, 5); // Change from 3 to 5
```

## Testing

### Manual Testing

1. **Unread Badge:** Add a notification, verify badge appears and shows count
2. **Mark as Read:** Click notification, verify blue dot disappears
3. **Auto-dismiss:** Create toast with 3s duration, verify it disappears
4. **Clear All:** Click "Clear All", verify all notifications removed
5. **Outside Click:** Open menu, click outside, verify menu closes
6. **Keyboard:** Test with VoiceOver/NVDA for accessibility

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationProvider, useNotifications } from '@/context/NotificationContext';

function TestComponent() {
  const { addNotification } = useNotifications();
  return (
    <button onClick={() => addNotification({
      title: 'Test',
      message: 'Test message',
      type: 'info',
      priority: 'medium',
    })}>
      Add Notification
    </button>
  );
}

test('adds notification when button clicked', async () => {
  const user = userEvent.setup();
  render(
    <NotificationProvider>
      <TestComponent>
      <NotificationCenter />
    </NotificationProvider>
  );
  
  const button = screen.getByRole('button', { name: /Add Notification/ });
  await user.click(button);
  
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

## Performance Optimization

1. **Memoization:** Components memoized to prevent unnecessary re-renders
2. **Filtered Notifications:** Toasts only show 3 notifications max
3. **Context Optimization:** Notification context separate from reducer to prevent cascading updates
4. **LocalStorage:** Consider caching read/unread state in localStorage

## Troubleshooting

### Notifications Not Showing

- Verify `NotificationProvider` wraps your entire app
- Check that `ToastNotifications` component is rendered in layout
- Verify `useNotifications()` is called within Provider scope

### Context Error: "useNotifications must be used within NotificationProvider"

- Ensure component using hook is wrapped with `NotificationProvider`
- Check `'use client'` directive is present in client components

### Styling Issues

- Verify Tailwind CSS dark theme classes are available
- Check `.dark-800`, `.dark-700`, `.dark-600` are defined in tailwind.config.ts
- Review z-index values (50-51) don't conflict with other elements

### Performance Issues

- Reduce maximum visible notifications
- Increase toast display duration (less frequent DOM updates)
- Use `React.memo()` for NotificationCenter if re-rendering frequently

## File Structure Summary

```
✅ Types
  - src/types/notification.ts           (60 lines)

✅ Context
  - src/context/NotificationContext.tsx (90 lines)

✅ Components
  - src/components/NotificationCenter.tsx    (220 lines)
  - src/components/ToastNotifications.tsx    (100 lines)

📋 Documentation
  - NOTIFICATION_CENTER_INTEGRATION.md (this file)
```

## Related Features

- **Global Search:** `GLOBAL_SEARCH_INTEGRATION.md`
- **Admin Alerts:** See Admin Alerts dashboard for WebSocket/polling pattern
- **User Preferences:** Notification settings (do not disturb, notification types, etc.)

---

**Last Updated:** Latest session
**Status:** ✅ Ready for implementation
**Next Steps:** API endpoint creation, WebSocket integration, notification settings panel
