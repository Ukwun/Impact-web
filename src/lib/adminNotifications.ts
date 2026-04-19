/**
 * Admin Notifications System
 * Automated notifications for admin events
 */

export type AdminEventType =
  | 'refund_requested'
  | 'refund_approved'
  | 'refund_rejected'
  | 'course_published'
  | 'course_unpublished'
  | 'user_registered'
  | 'payment_failed'
  | 'enrollment_drop'
  | 'new_review'
  | 'critical_alert';

export interface AdminEvent {
  id: string;
  type: AdminEventType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
}

// In-memory admin notifications (in production, use database)
const _adminNotificationsStore: AdminEvent[] = [];
const adminObservers: Set<(event: AdminEvent) => void> = new Set();

/**
 * Create and broadcast admin event
 */
export function createAdminEvent(
  type: AdminEventType,
  title: string,
  message: string,
  data: Record<string, unknown>,
  options?: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    actionUrl?: string;
  }
): AdminEvent {
  const event: AdminEvent = {
    id: `admin-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    data,
    severity: options?.severity || 'medium',
    read: false,
    timestamp: new Date(),
    actionUrl: options?.actionUrl,
  };

  _adminNotificationsStore.unshift(event);

  // Notify all observers (real-time listeners)
  adminObservers.forEach((observer) => observer(event));

  return event;
}

/**
 * Subscribe to admin events (real-time)
 */
export function subscribeToAdminEvents(callback: (event: AdminEvent) => void): () => void {
  adminObservers.add(callback);

  // Return unsubscribe function
  return () => {
    adminObservers.delete(callback);
  };
}

/**
 * Get recent admin events
 */
export async function getAdminEvents(limit = 50): Promise<AdminEvent[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return _adminNotificationsStore.slice(0, limit);
}

/**
 * Get unread admin events count
 */
export async function getUnreadAdminEventsCount(): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return _adminNotificationsStore.filter((e) => !e.read).length;
}

/**
 * Mark admin event as read
 */
export async function markAdminEventAsRead(eventId: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const event = _adminNotificationsStore.find((e) => e.id === eventId);
  if (event) {
    event.read = true;
    return true;
  }
  return false;
}

/**
 * Mark all admin events as read
 */
export async function markAllAdminEventsAsRead(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  _adminNotificationsStore.forEach((e) => {
    e.read = true;
  });
}

/**
 * Get critical alerts
 */
export async function getCriticalAlerts(): Promise<AdminEvent[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return _adminNotificationsStore.filter((e) => e.severity === 'critical' && !e.read);
}

/**
 * Specific event triggers for common admin scenarios
 */

export function notifyRefundRequested(
  refundId: string,
  userId: string,
  amount: number,
  reason: string
): AdminEvent {
  return createAdminEvent(
    'refund_requested',
    'Refund Request Received',
    `User requested a refund of $${amount.toFixed(2)} for reason: ${reason}`,
    { refundId, userId, amount, reason },
    {
      severity: 'medium',
      actionUrl: `/dashboard/admin/refunds?id=${refundId}`,
    }
  );
}

export function notifyRefundApproved(refundId: string, userId: string, amount: number): AdminEvent {
  return createAdminEvent(
    'refund_approved',
    'Refund Approved',
    `Refund of $${amount.toFixed(2)} approved and processing`,
    { refundId, userId, amount },
    {
      severity: 'low',
      actionUrl: `/dashboard/admin/refunds?id=${refundId}`,
    }
  );
}

export function notifyRefundRejected(refundId: string, userId: string, reason: string): AdminEvent {
  return createAdminEvent(
    'refund_rejected',
    'Refund Rejected',
    `Refund request rejected. Reason: ${reason}`,
    { refundId, userId, reason },
    {
      severity: 'low',
      actionUrl: `/dashboard/admin/refunds?id=${refundId}`,
    }
  );
}

export function notifyPaymentFailed(orderId: string, amount: number, error: string): AdminEvent {
  return createAdminEvent(
    'payment_failed',
    'Payment Failed',
    `Payment of $${amount.toFixed(2)} failed: ${error}`,
    { orderId, amount, error },
    {
      severity: 'high',
      actionUrl: `/dashboard/admin/orders?id=${orderId}`,
    }
  );
}

export function notifyCoursPublished(data: {
  courseId: string;
  courseTitle: string;
  publishedAt: Date;
  enrollmentCount: number;
}): AdminEvent {
  return createAdminEvent(
    'course_published',
    'Course Published',
    `"${data.courseTitle}" is now available to ${data.enrollmentCount} enrolled student(s)`,
    { 
      courseId: data.courseId, 
      courseTitle: data.courseTitle,
      publishedAt: data.publishedAt,
      enrollmentCount: data.enrollmentCount
    },
    {
      severity: 'low',
      actionUrl: `/dashboard/courses/${data.courseId}/edit-enhanced`,
    }
  );
}

export function notifyEnrollmentDrop(
  courseId: string,
  userId: string,
  courseTitle: string
): AdminEvent {
  return createAdminEvent(
    'enrollment_drop',
    'Student Dropped Course',
    `Student dropped "${courseTitle}"`,
    { courseId, userId, courseTitle },
    {
      severity: 'low',
      actionUrl: `/dashboard/admin/courses?id=${courseId}`,
    }
  );
}

export function notifyNewReview(
  courseId: string,
  courseTitle: string,
  rating: number,
  review: string
): AdminEvent {
  return createAdminEvent(
    'new_review',
    'New Course Review',
    `${rating}-star review for "${courseTitle}": "${review.substring(0, 100)}..."`,
    { courseId, courseTitle, rating, review },
    {
      severity: 'low',
      actionUrl: `/dashboard/admin/courses?id=${courseId}&tab=reviews`,
    }
  );
}

export function notifyUserRegistration(userId: string, email: string, name: string): AdminEvent {
  return createAdminEvent(
    'user_registered',
    'New User Registration',
    `${name} (${email}) signed up`,
    { userId, email, name },
    {
      severity: 'low',
      actionUrl: `/dashboard/admin/users?userId=${userId}`,
    }
  );
}

/**
 * Student-facing notifications (sent via course facilitator)
 */
export function notifyStudentMessage(data: {
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  message: string;
  messageType: 'announcement' | 'reminder' | 'alert';
  sentAt: Date;
}): void {
  // In production, this would send an email/push notification to the student
  // and log to a student_notifications table
  // For now, we just log it for audit trail
  console.log(`[Student Notification] ${data.studentName}: ${data.message}`);
  
  // Create an event for the admin dashboard to track what was sent
  createAdminEvent(
    'critical_alert',
    `Message Sent: ${data.messageType.charAt(0).toUpperCase() + data.messageType.slice(1)}`,
    `Sent message to ${data.studentName} in "${data.courseTitle}": "${data.message.substring(0, 50)}..."`,
    {
      studentId: data.studentId,
      studentName: data.studentName,
      courseId: data.courseId,
      courseTitle: data.courseTitle,
      messageType: data.messageType,
      fullMessage: data.message,
    },
    {
      severity: 'low',
      actionUrl: `/dashboard/courses/${data.courseId}/edit-enhanced?tab=students`,
    }
  );
}

/**
 * Export adminNotifications object for direct access
 */
export const adminNotifications = {
  notifyRefundRequested,
  notifyRefundApproved,
  notifyRefundRejected,
  notifyPaymentFailed,
  notifyCoursPublished,
  notifyEnrollmentDrop,
  notifyNewReview,
  notifyUserRegistration,
  notifyStudentMessage,
  createAdminEvent,
  subscribeToAdminEvents,
  getAdminEvents,
  getUnreadAdminEventsCount,
  markAdminEventAsRead,
  markAllAdminEventsAsRead,
  getCriticalAlerts,
};
