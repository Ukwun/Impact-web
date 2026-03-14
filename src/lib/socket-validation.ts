import { z, ZodSchema } from 'zod';
import { Socket } from 'socket.io';

type EventValidator = {
  schema: ZodSchema;
  handler: (data: any, socket: Socket) => Promise<void> | void;
};

const eventValidators = new Map<string, EventValidator>();

/**
 * Register event validator
 */
export function registerEventValidator(
  eventName: string,
  schema: ZodSchema,
  handler: (data: any, socket: Socket) => Promise<void> | void
) {
  eventValidators.set(eventName, { schema, handler });
  console.log(`✅ Registered validator for event: ${eventName}`);
}

/**
 * Validate and handle socket event
 */
export async function validateAndHandle(
  socket: Socket,
  eventName: string,
  data: any
): Promise<{ valid: boolean; error?: string }> {
  const validator = eventValidators.get(eventName);

  if (!validator) {
    return { valid: true }; // No validator = allow
  }

  try {
    const validated = await validator.schema.parseAsync(data);
    await validator.handler(validated, socket);
    return { valid: true };
  } catch (err) {
    const message = err instanceof z.ZodError
      ? `Validation error: ${err.errors[0].message}`
      : err instanceof Error
      ? err.message
      : 'Validation failed';

    console.warn(
      `⚠️ Event validation failed for "${eventName}":`,
      message
    );
    return { valid: false, error: message };
  }
}

// Predefined schemas for common events
export const eventSchemas = {
  userTyping: z.object({
    roomId: z.string().min(1).max(100),
  }),

  userStopTyping: z.object({
    roomId: z.string().min(1).max(100),
  }),

  joinRoom: z.object({
    roomId: z.string().min(1).max(100),
  }),

  leaveRoom: z.object({
    roomId: z.string().min(1).max(100),
  }),

  messageSend: z.object({
    roomId: z.string().min(1).max(100),
    message: z.string().min(1).max(5000),
    replyTo: z.string().optional(),
  }),

  progressUpdate: z.object({
    courseId: z.string().min(1).max(100),
    enrollmentId: z.string().min(1).max(100),
    completionPercentage: z.number().min(0).max(100),
    lessonsCompleted: z.number().min(0),
    totalLessons: z.number().min(0),
  }),

  quizSubmit: z.object({
    quizId: z.string().min(1).max(100),
    enrollmentId: z.string().min(1).max(100),
    answers: z.record(z.string(), z.any()),
    timeSpent: z.number().min(0),
  }),

  assignmentSubmit: z.object({
    assignmentId: z.string().min(1).max(100),
    enrollmentId: z.string().min(1).max(100),
    content: z.string().min(1).max(10000),
    files: z.array(z.object({
      name: z.string(),
      size: z.number(),
      mimeType: z.string(),
    })).optional(),
  }),

  courseEnroll: z.object({
    courseId: z.string().min(1).max(100),
  }),

  certificateRequest: z.object({
    enrollmentId: z.string().min(1).max(100),
    courseId: z.string().min(1).max(100),
  }),
};

/**
 * Setup standard event validators on socket connection
 */
export function setupStandardValidators(socket: Socket) {
  // User typing
  socket.on('user:typing', async (data) => {
    const result = await validateAndHandle(socket, 'user:typing', data);
    if (!result.valid) {
      socket.emit('error', { message: result.error });
    }
  });

  // User stop typing
  socket.on('user:stop-typing', async (data) => {
    const result = await validateAndHandle(socket, 'user:stop-typing', data);
    if (!result.valid) {
      socket.emit('error', { message: result.error });
    }
  });

  // Join room
  socket.on('join:room', async (data) => {
    const result = await validateAndHandle(socket, 'join:room', data);
    if (!result.valid) {
      socket.emit('error', { message: result.error });
      return;
    }
    socket.join(`room:${data.roomId}`);
  });

  // Leave room
  socket.on('leave:room', async (data) => {
    const result = await validateAndHandle(socket, 'leave:room', data);
    if (!result.valid) {
      socket.emit('error', { message: result.error });
      return;
    }
    socket.leave(`room:${data.roomId}`);
  });

  // Progress update
  socket.on('progress:update', async (data) => {
    const result = await validateAndHandle(socket, 'progress:update', data);
    if (!result.valid) {
      socket.emit('error', { message: result.error });
    }
  });

  // Quiz submit
  socket.on('quiz:submit', async (data) => {
    const result = await validateAndHandle(socket, 'quiz:submit', data);
    if (!result.valid) {
      socket.emit('error', { message: result.error });
    }
  });

  // Assignment submit
  socket.on('assignment:submit', async (data) => {
    const result = await validateAndHandle(socket, 'assignment:submit', data);
    if (!result.valid) {
      socket.emit('error', { message: result.error });
    }
  });
}

/**
 * Input sanitization helper
 */
export function sanitizeInput(input: string, maxLength = 10000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '');
}

/**
 * Validate userId matches authenticated user
 */
export function validateUserIdMatch(socket: Socket, userId: string): boolean {
  const authenticatedUserId = socket.handshake.auth.userId;
  if (authenticatedUserId !== userId) {
    console.warn(
      `⚠️ UserId mismatch: ${authenticatedUserId} vs ${userId}`
    );
    return false;
  }
  return true;
}

/**
 * Validate courseId belongs to user's enrollments
 */
export async function validateCourseAccess(
  userId: string,
  courseId: string
): Promise<boolean> {
  // This would check against database
  // For now, return true
  // TODO: Implement actual validation
  return true;
}
