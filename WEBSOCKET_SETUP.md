# WebSocket Infrastructure Setup

## Overview

ImpactEdu now includes a comprehensive real-time infrastructure powered by Socket.IO and Redis. This enables:

- ✅ Real-time notifications
- ✅ Live presence awareness
- ✅ Real-time progress updates
- ✅ Instant messaging (future)
- ✅ Multi-instance clustering with Redis

## Installation

Socket.IO and Redis dependencies are already installed:

```bash
npm install socket.io socket.io-client redis
```

## Environment Variables

Add to `.env.local`:

```env
# Socket.IO Configuration
SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Redis Configuration (Optional - for production clustering)
REDIS_URL=redis://localhost:6379
```

## Running with WebSocket Support

### Development (With WebSocket)

```bash
npm run dev:socket
```

This runs the custom server with Socket.IO enabled.

### Development (Without WebSocket)

```bash
npm run dev
```

Standard Next.js development server (notifications won't work).

### Production

Socket.IO will work with standard `npm start` when deployed to services like:
- Vercel (with custom server configuration)
- Self-hosted Node.js server
- Docker containers

## Architecture

### Server-Side (`src/lib/socket-server.ts`)

- Initializes Socket.IO server on HTTP server
- Sets up Redis adapter for multi-instance clustering
- Handles socket connection lifecycle
- Provides functions to emit events

### Client-Side (`src/lib/socket-client.ts`)

- Initializes socket connection with authentication
- Provides utility functions for emitting/listening
- Handles reconnection logic

### React Hooks (`src/hooks/useSocket.ts`)

- `useSocket()` - Initialize socket in component
- `useNotifications()` - Listen to notifications
- `usePresence()` - Track user presence in rooms

### Components (`src/components/notifications/`)

- `NotificationCenter` - Display toast notifications
- `NotificationBell` - Notification icon with dropdown

## Usage Examples

### 1. Send Notification from API Route

```typescript
import { sendNotificationToUser } from '@/lib/socket-events';

// In your API route handler
await sendNotificationToUser(userId, {
  id: `notification-${Date.now()}`,
  title: 'Course Completed',
  message: 'Congratulations on completing the course!',
  type: 'success',
  link: '/dashboard/certificates/123',
});
```

### 2. Listen to Notifications in Component

```typescript
'use client';

import { useNotifications } from '@/hooks/useSocket';

export function MyComponent({ userId }) {
  const { notifications } = useNotifications(userId);

  return (
    <div>
      <p>You have {notifications.length} notifications</p>
    </div>
  );
}
```

### 3. Real-time Progress Updates

```typescript
import { sendRoomUpdate } from '@/lib/socket-events';

// Update all users in a course
sendRoomUpdate(`course:${courseId}`, 'progress:update', {
  userId,
  progress: 75,
  lastUpdate: new Date(),
});
```

### 4. Broadcast System Announcements

```typescript
import { broadcastNotification } from '@/lib/socket-events';

broadcastNotification({
  id: `announcement-${Date.now()}`,
  title: 'Maintenance Scheduled',
  message: 'Server maintenance on Sunday 2-4 PM',
  type: 'warning',
});
```

## Real-World Integration Points

The WebSocket infrastructure integrates with:

1. **Course Completion** → Send certificate notification
2. **Assignment Submission** → Notify teacher + student
3. **Quiz Completion** → Send results notification
4. **Community Posts** → Notify followers
5. **User Progress** → Real-time progress bar updates
6. **Course Enrollment** → Confirmation notification
7. **Event Registration** → Reminder notifications

## Testing the Setup

### 1. Test Endpoint

```bash
# Send to specific user
curl -X POST http://localhost:3000/api/test/notification \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-id", "message": "Test notification"}'

# Broadcast to all
curl -X POST http://localhost:3000/api/test/notification \
  -H "Content-Type: application/json" \
  -d '{"broadcast": true, "message": "Broadcast test"}'
```

### 2. Check Console Logs

When running `npm run dev:socket`, you'll see:

```
✅ Socket.IO initialized with Redis adapter
✅ User connected: abc123xyz
👤 User user-id joined personal room
❌ User disconnected: abc123xyz
```

## Scaling with Redis

For production with multiple server instances:

1. **Install Redis**:
   ```bash
   docker run -d -p 6379:6379 redis
   ```

2. **Set Redis URL**:
   ```env
   REDIS_URL=redis://redis-server:6379
   ```

3. **Automatic Clustering**:
   - Socket.IO automatically uses Redis Adapter
   - Messages are broadcast across all instances
   - Connections are tracked globally

## Performance Considerations

- **Connection Limit**: ~10,000 connections per process
- **Message Throughput**: ~1000 messages/sec per instance
- **Redis Pub/Sub**: Handles multi-instance fan-out
- **Memory**: Each connection ~2-3KB memory

For 10,000+ users, deploy multiple instances behind load balancer with Redis.

## Security

- Authentication via JWT token in socket handshake
- User rooms are isolated (`user:${userId}`)
- Server validates all incoming events
- Rate limiting on socket events (future enhancement)

## Troubleshooting

### Socket Not Connecting

1. Check `npm run dev:socket` is running (not `npm run dev`)
2. Verify `NEXT_PUBLIC_SOCKET_URL` environment variable
3. Check browser console for connection errors

### Notifications Not Appearing

1. Ensure `NotificationCenter` component is in layout
2. Verify `userId` is being passed to hooks
3. Check Socket.IO server logs

### Redis Connection Failed

1. Verify Redis is running: `redis-cli ping`
2. Check `REDIS_URL` is correct
3. Socket.IO will fall back to in-memory adapter (single instance only)

## Next Steps

1. Integrate notifications into course completion flow
2. Add real-time presence on community pages
3. Implement live chat functionality
4. Add real-time leaderboards
5. Set up rate limiting on socket events
