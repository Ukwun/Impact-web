import { NextRequest, NextResponse } from 'next/server';
import {
  sendNotificationToUser,
  broadcastNotification,
} from '@/lib/socket-events';

/**
 * Test endpoint to demonstrate WebSocket notifications
 * POST /api/test/notification
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, message, broadcast } = body;

    if (broadcast) {
      // Broadcast to all users
      broadcastNotification({
        id: `test-${Date.now()}`,
        title: 'System Notification',
        message: message || 'This is a test broadcast notification',
        type: type || 'info',
      });

      return NextResponse.json({
        success: true,
        message: 'Broadcast sent to all connected users',
      });
    } else if (userId) {
      // Send to specific user
      sendNotificationToUser(userId, {
        id: `test-${Date.now()}`,
        title: 'Test Notification',
        message: message || 'This is a test notification',
        type: type || 'info',
      });

      return NextResponse.json({
        success: true,
        message: `Notification sent to user ${userId}`,
      });
    } else {
      return NextResponse.json(
        { error: 'userId or broadcast flag required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
