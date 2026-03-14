import { getSocketServer } from './socket-server';

/**
 * Send real-time notification to user via Socket.IO
 */
export function sendNotificationToUser(userId: string, notification: {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
  link?: string;
  timestamp?: Date;
}) {
  const io = getSocketServer();
  if (!io) {
    console.warn('Socket.IO not initialized, queuing notification');
    // In production, queue to Redis for later delivery
    return;
  }

  io.to(`user:${userId}`).emit('notification', {
    ...notification,
    timestamp: notification.timestamp || new Date(),
  });
}

/**
 * Send notification to multiple users
 */
export function sendNotificationToUsers(userIds: string[], notification: any) {
  userIds.forEach((userId) => {
    sendNotificationToUser(userId, notification);
  });
}

/**
 * Broadcast notification to all users
 */
export function broadcastNotification(notification: any) {
  const io = getSocketServer();
  if (!io) return;

  io.emit('notification', {
    ...notification,
    timestamp: new Date(),
  });
}

/**
 * Send real-time update to a room
 */
export function sendRoomUpdate(roomId: string, event: string, data: any) {
  const io = getSocketServer();
  if (!io) return;

  io.to(`room:${roomId}`).emit(event, {
    ...data,
    timestamp: new Date(),
  });
}

/**
 * Send presence update for a room
 */
export function updateRoomPresence(roomId: string, users: any[]) {
  const io = getSocketServer();
  if (!io) return;

  io.to(`room:${roomId}`).emit('presence:update', {
    roomId,
    users,
    timestamp: new Date(),
  });
}

/**
 * Send course progress update
 */
export function notifyCourseProgress(userId: string, courseId: string, progress: {
  enrollmentId: string;
  completionPercentage: number;
  lessonsCompleted: number;
  totalLessons: number;
}) {
  sendNotificationToUser(userId, {
    id: `course-progress-${courseId}`,
    title: 'Course Progress Updated',
    message: `You've completed ${progress.completionPercentage}% of the course`,
    type: 'info',
    link: `/dashboard/courses/${courseId}`,
  });
}

/**
 * Notify assignment submission
 */
export function notifyAssignmentSubmitted(userId: string, assignmentData: {
  assignmentId: string;
  submissionId: string;
  title: string;
}) {
  sendNotificationToUser(userId, {
    id: `assignment-${assignmentData.assignmentId}`,
    title: 'Assignment Submitted',
    message: `Your submission for "${assignmentData.title}" is being reviewed`,
    type: 'success',
    link: `/dashboard/learn/assignment/${assignmentData.submissionId}`,
  });
}

/**
 * Notify new message in community
 */
export function notifyNewCommunityPost(userId: string, postData: {
  postId: string;
  authorName: string;
  title: string;
}) {
  sendNotificationToUser(userId, {
    id: `post-${postData.postId}`,
    title: 'New Community Post',
    message: `${postData.authorName} posted: "${postData.title}"`,
    type: 'info',
    link: `/dashboard/community/${postData.postId}`,
  });
}

/**
 * Notify enrollment confirmation
 */
export function notifyEnrollmentConfirmed(userId: string, courseData: {
  courseId: string;
  courseName: string;
}) {
  sendNotificationToUser(userId, {
    id: `enrollment-${courseData.courseId}`,
    title: 'Enrollment Confirmed',
    message: `You've successfully enrolled in "${courseData.courseName}"`,
    type: 'success',
    link: `/dashboard/courses/${courseData.courseId}`,
  });
}

/**
 * Notify quiz results
 */
export function notifyQuizResults(userId: string, quizData: {
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
}) {
  sendNotificationToUser(userId, {
    id: `quiz-${quizData.quizId}`,
    title: 'Quiz Results',
    message: `You scored ${quizData.score}/${quizData.totalQuestions} on "${quizData.quizTitle}"`,
    type: quizData.passed ? 'success' : 'warning',
  });
}

/**
 * Notify certificate awarded
 */
export function notifyCertificateAwarded(userId: string, certData: {
  certificateId: string;
  courseName: string;
}) {
  sendNotificationToUser(userId, {
    id: `cert-${certData.certificateId}`,
    title: 'Certificate Awarded',
    message: `Congratulations! You've earned a certificate for "${certData.courseName}"`,
    type: 'success',
    link: `/dashboard/certificates/${certData.certificateId}`,
  });
}

/**
 * Emit leaderboard update to all connected clients
 */
export function emitLeaderboardUpdate(updateData: {
  userId: string;
  newScore: number;
  activityType: string;
  timestamp?: Date;
}) {
  const io = getSocketServer();
  if (!io) {
    console.warn('Socket.IO not initialized, skipping leaderboard update');
    return;
  }

  // Emit to all clients listening for leaderboard updates
  io.emit('leaderboard:updated', {
    ...updateData,
    timestamp: updateData.timestamp || new Date(),
  });

  // Also emit rank change event for the specific user
  io.to(`user:${updateData.userId}`).emit('leaderboard:rank-changed', {
    userId: updateData.userId,
    newScore: updateData.newScore,
    activityType: updateData.activityType,
    timestamp: updateData.timestamp || new Date(),
  });
}

/**
 * Notify achievement unlocked
 */
export function notifyAchievementUnlocked(userId: string, achievementData: {
  achievementId: string;
  badge: string;
  title: string;
  description: string;
  icon: string;
  points?: number;
}) {
  sendNotificationToUser(userId, {
    id: `achievement-${achievementData.achievementId}`,
    title: 'Achievement Unlocked!',
    message: `🏆 ${achievementData.title}: ${achievementData.description}`,
    type: 'success',
    icon: achievementData.icon,
    link: '/achievements',
  });

  // Also emit achievement unlock event
  const io = getSocketServer();
  if (io) {
    io.to(`user:${userId}`).emit('achievement:unlocked', {
      ...achievementData,
      timestamp: new Date(),
    });
  }
}
