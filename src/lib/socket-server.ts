import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

let io: SocketIOServer | null = null;
let pubClient: ReturnType<typeof createClient> | null = null;
let subClient: ReturnType<typeof createClient> | null = null;

/**
 * Initialize Socket.IO server with Redis adapter
 * Must be called from a custom Next.js server
 */
export async function initializeSocketServer(httpServer: HTTPServer) {
  try {
    // Create Socket.IO instance
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // Try to initialize Redis adapter if Redis available
    if (process.env.REDIS_URL) {
      try {
        pubClient = createClient({ url: process.env.REDIS_URL });
        subClient = createClient({ url: process.env.REDIS_URL });

        await Promise.all([pubClient.connect(), subClient.connect()]);

        // Set up Redis adapter for Socket.IO clustering
        io.adapter(createAdapter(pubClient, subClient));

        console.log('✅ Socket.IO initialized with Redis adapter');
      } catch (redisError) {
        console.warn('⚠️ Redis connection failed, using in-memory adapter:', redisError);
        console.log('Socket.IO will work in single-instance mode without clustering');
      }
    } else {
      console.log('⚠️ REDIS_URL not set, using in-memory Socket.IO adapter');
    }

    // Socket.IO event handlers
    io.on('connection', (socket: Socket) => {
      const socketId = socket.id;
      const userId = socket.handshake.auth.userId;
      const token = socket.handshake.auth.token;

      console.log(`✅ User connected: ${socketId} (userId: ${userId})`);

      // Join user to their personal room for targeted notifications
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`👤 User ${userId} joined personal room`);

        // Notify others that user came online
        socket.broadcast.emit('user:online', { userId, timestamp: new Date() });
      }

      // ===== ENROLLMENT EVENTS =====
      // When a student enrolls in a course
      socket.on('course:enrolled', (data) => {
        const { courseId, courseName, studentId } = data;
        console.log(`📚 Student ${studentId} enrolled in course ${courseId}`);

        // Emit to teacher's room (they teach this course)
        // In production, query DB for teacher ID
        io!.emit('student:enrolled', {
          studentId,
          courseId,
          courseName,
          message: `New student enrolled in ${courseName}`,
          timestamp: new Date(),
        });
      });

      // ===== ASSIGNMENT EVENTS =====
      // When student submits an assignment
      socket.on('assignment:submitted', (data) => {
        const { assignmentId, assignmentTitle, studentId, courseId } = data;
        console.log(`📝 Student ${studentId} submitted assignment ${assignmentId}`);

        // Notify teacher
        io!.emit('assignment:new-submission', {
          assignmentId,
          assignmentTitle,
          studentId,
          courseId,
          message: `Assignment "${assignmentTitle}" submitted by ${studentId}`,
          timestamp: new Date(),
        });
      });

      // When teacher grades an assignment
      socket.on('assignment:graded', (data) => {
        const { assignmentId, studentId, grade, feedback, teacherId } = data;
        console.log(`✅ Assignment ${assignmentId} graded by ${teacherId}`);

        // Notify student their work was graded
        io!.to(`user:${studentId}`).emit('assignment:grade-published', {
          assignmentId,
          grade,
          feedback,
          message: 'Your assignment has been graded!',
          timestamp: new Date(),
        });
      });

      // ===== QUIZ EVENTS =====
      // When student submits quiz
      socket.on('quiz:submitted', (data) => {
        const { quizId, studentId, score, possibleScore, courseId } = data;
        console.log(`✅ Student ${studentId} submitted quiz ${quizId} (Score: ${score}/${possibleScore})`);

        // Notify student of quiz submission
        io!.to(`user:${studentId}`).emit('quiz:submitted-confirmed', {
          quizId,
          score,
          possibleScore,
          percentage: Math.round((score / possibleScore) * 100),
          message: `Quiz completed! Score: ${score}/${possibleScore}`,
          timestamp: new Date(),
        });
      });

      // ===== MENTOR MESSAGING =====
      // Mentor sends message to mentee
      socket.on('mentor:message', (data) => {
        const { senderId, sendName, recipientId, message } = data;
        console.log(`💬 Message from ${senderId} to ${recipientId}`);

        // Send message to recipient
        io!.to(`user:${recipientId}`).emit('mentor:new-message', {
          senderId,
          senderName: sendName,
          message,
          timestamp: new Date(),
        });
      });

      // Mentee responds to mentor
      socket.on('mentee:message', (data) => {
        const { senderId, sendName, recipientId, message } = data;
        console.log(`💬 Mentee message from ${senderId} to mentor ${recipientId}`);

        // Send to mentor
        io!.to(`user:${recipientId}`).emit('mentee:new-message', {
          senderId,
          senderName: sendName,
          message,
          timestamp: new Date(),
        });
      });

      // ===== PRESENCE & TYPING =====
      socket.on('user:typing', (data) => {
        if (userId) {
          io!.to(`room:${data.roomId}`).emit('user:typing', {
            userId,
            userName: data.userName,
            roomId: data.roomId,
            timestamp: new Date(),
          });
        }
      });

      socket.on('user:stop-typing', (data) => {
        if (userId) {
          io!.to(`room:${data.roomId}`).emit('user:stop-typing', {
            userId,
            roomId: data.roomId,
          });
        }
      });

      // User comes online
      socket.on('user:online', () => {
        if (userId) {
          socket.broadcast.emit('user:presence-update', {
            userId,
            status: 'online',
            timestamp: new Date(),
          });
        }
      });

      // User goes away
      socket.on('user:away', () => {
        if (userId) {
          socket.broadcast.emit('user:presence-update', {
            userId,
            status: 'away',
            timestamp: new Date(),
          });
        }
      });

      // ===== PROGRESS & COMPLETION =====
      // When student completes a lesson
      socket.on('lesson:completed', (data) => {
        const { lessonId, lessonTitle, courseId, studentId, percentComplete } = data;
        console.log(`✅ Student ${studentId} completed lesson ${lessonId}`);

        // Can trigger achievement checks, etc.
        io!.to(`user:${studentId}`).emit('progress:updated', {
          lessonId,
          lessonTitle,
          progress: percentComplete,
          message: `Great! You're ${percentComplete}% through the course`,
          timestamp: new Date(),
        });
      });

      // When student completes entire course
      socket.on('course:completed', (data) => {
        const { courseId, courseName, studentId } = data;
        console.log(`🎓 Student ${studentId} completed course ${courseId}`);

        // Notify student and teacher
        io!.to(`user:${studentId}`).emit('course:completion', {
          courseId,
          courseName,
          message: `Congratulations! You completed ${courseName}`,
          certificateEligible: true,
          timestamp: new Date(),
        });
      });

      // ===== DISCONNECT =====
      socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socketId}`);
        if (userId) {
          // Notify others this user is offline
          socket.broadcast.emit('user:presence-update', {
            userId,
            status: 'offline',
            timestamp: new Date(),
          });
        }
      });
    });

    return io;
  } catch (error) {
    console.error('Failed to initialize Socket.IO:', error);
    throw error;
  }
}

/**
 * Get the Socket.IO server instance (for API routes)
 */
export function getSocketServer(): SocketIOServer | null {
  return io;
}

/**
 * Emit event to specific user
 */
export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Emit event to room
 */
export function emitToRoom(roomId: string, event: string, data: any) {
  if (io) {
    io.to(`room:${roomId}`).emit(event, data);
  }
}

/**
 * Emit event to all connected clients
 */
export function broadcastEvent(event: string, data: any) {
  if (io) {
    io.emit(event, data);
  }
}

/**
 * Cleanup on server shutdown
 */
export async function closeSocketServer() {
  if (io) {
    io.close();
  }
  if (pubClient) {
    await pubClient.quit();
  }
  if (subClient) {
    await subClient.quit();
  }
}
