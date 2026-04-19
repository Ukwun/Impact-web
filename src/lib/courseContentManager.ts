/**
 * Course Content Manager
 * Server-side functions for managing course content and lessons
 */

import {
  CourseContent,
  CourseLesson,
  ContentBlock,
  CourseContentDraft,
  createLesson,
  createContentBlock,
} from '@/types/courseContent';

// Mock Data
const mockContentBlocks: ContentBlock[] = [
  {
    id: 'block-1',
    type: 'heading',
    content: '<h2>Introduction to Financial Literacy</h2>',
    order: 0,
  },
  {
    id: 'block-2',
    type: 'paragraph',
    content: `<p>Financial literacy is the foundation of personal and economic empowerment. 
    In this lesson, we'll explore the fundamental concepts that drive financial decision-making 
    and discover how to build a strong financial future.</p>`,
    order: 1,
  },
  {
    id: 'block-3',
    type: 'heading',
    content: '<h3>Key Concepts</h3>',
    order: 2,
  },
  {
    id: 'block-4',
    type: 'list',
    content: `<ul>
      <li>Understanding budgeting and income tracking</li>
      <li>Managing debt and credit scores</li>
      <li>Saving and emergency funds</li>
      <li>Investment fundamentals</li>
    </ul>`,
    order: 3,
  },
  {
    id: 'block-5',
    type: 'quote',
    content: `<blockquote>"An investment in knowledge pays the best interest." - Benjamin Franklin</blockquote>`,
    order: 4,
  },
  {
    id: 'block-6',
    type: 'code',
    content: `const calculateInterest = (principal, rate, time) => {
  return principal * rate * time / 100;
};

// Example
const investment = calculateInterest(1000, 5, 10);
console.log(investment); // 500`,
    metadata: { language: 'javascript' },
    order: 5,
  },
];

const mockLessons: CourseLesson[] = [
  {
    id: 'lesson-1',
    courseId: 'course-1',
    title: 'Introduction to Financial Literacy',
    description: 'Learn the basics of personal finance and money management',
    content: mockContentBlocks,
    objectives: [
      'Understand financial concepts',
      'Learn budgeting principles',
      'Explore investment basics',
    ],
    learningOutcomes: [
      'Create a personal budget',
      'Understand credit scores',
      'Identify investment opportunities',
    ],
    estimatedDuration: 45,
    difficulty: 'beginner',
    order: 1,
    published: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'lesson-2',
    courseId: 'course-1',
    title: 'Budgeting and Money Management',
    description: 'Master practical budgeting techniques',
    content: [createContentBlock('paragraph', '<p>Budgeting is the cornerstone of financial success.</p>')],
    objectives: ['Create effective budgets', 'Track spending', 'Adjust spending as needed'],
    learningOutcomes: ['Master 50/30/20 rule', 'Use budgeting tools', 'Monitor progress'],
    estimatedDuration: 60,
    difficulty: 'intermediate',
    order: 2,
    published: false,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
  },
];

const mockCourseContent: CourseContent = {
  id: 'course-1',
  courseId: 'course-1',
  title: 'Personal Finance Fundamentals',
  description: 'Complete guide to managing your money effectively',
  lessons: mockLessons,
  thumbnail: 'https://images.unsplash.com/photo-1579520494973-146ee413a56e?w=500&h=300&fit=crop',
  duration: 240,
  level: 'beginner',
  tags: ['finance', 'budgeting', 'investment', 'savings'],
  published: true,
  createdBy: 'facilitator-1',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-25'),
  version: 3,
};

// API Functions

/**
 * Get course content by ID
 */
export async function getCourseContent(courseId: string): Promise<CourseContent | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (courseId === 'course-1') {
    return mockCourseContent;
  }

  return null;
}

/**
 * Get lesson by ID
 */
export async function getLesson(lessonId: string): Promise<CourseLesson | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 150));

  return mockLessons.find((l) => l.id === lessonId) || null;
}

/**
 * Get all lessons for a course
 */
export async function getLessonsByCourse(courseId: string): Promise<CourseLesson[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 250));

  return mockLessons.filter((l) => l.courseId === courseId);
}

/**
 * Create new lesson
 */
export async function createNewLesson(courseId: string, lessonData: Partial<CourseLesson>) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newLesson = createLesson(courseId, lessonData.title || 'Untitled Lesson');

  if (lessonData.description) newLesson.description = lessonData.description;
  if (lessonData.difficulty) newLesson.difficulty = lessonData.difficulty;
  if (lessonData.estimatedDuration) newLesson.estimatedDuration = lessonData.estimatedDuration;
  if (lessonData.objectives) newLesson.objectives = lessonData.objectives;
  if (lessonData.learningOutcomes) newLesson.learningOutcomes = lessonData.learningOutcomes;

  mockLessons.push(newLesson);
  return newLesson;
}

/**
 * Update lesson
 */
export async function updateLesson(lessonId: string, updates: Partial<CourseLesson>) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const lesson = mockLessons.find((l) => l.id === lessonId);
  if (!lesson) return null;

  Object.assign(lesson, {
    ...updates,
    updatedAt: new Date(),
  });

  return lesson;
}

/**
 * Update lesson content
 */
export async function updateLessonContent(lessonId: string, content: ContentBlock[]) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const lesson = mockLessons.find((l) => l.id === lessonId);
  if (!lesson) return null;

  lesson.content = content;
  lesson.updatedAt = new Date();

  return lesson;
}

/**
 * Publish lesson
 */
export async function publishLesson(lessonId: string): Promise<CourseLesson | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 250));

  return updateLesson(lessonId, { published: true });
}

/**
 * Unpublish lesson
 */
export async function unpublishLesson(lessonId: string): Promise<CourseLesson | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 250));

  return updateLesson(lessonId, { published: false });
}

/**
 * Delete lesson
 */
export async function deleteLesson(lessonId: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 250));

  const index = mockLessons.findIndex((l) => l.id === lessonId);
  if (index === -1) return false;

  mockLessons.splice(index, 1);
  return true;
}

/**
 * Save draft
 */
export async function saveDraft(
  courseContentId: string,
  content: Partial<CourseContent>
): Promise<CourseContentDraft> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const draft: CourseContentDraft = {
    id: `draft-${Date.now()}`,
    courseContentId,
    content,
    lastSaved: new Date(),
    version: mockCourseContent.version + 1,
  };

  return draft;
}

/**
 * Upload media
 */
export async function uploadMedia(file: File): Promise<{ url: string; id: string }> {
  // Simulate API delay and upload
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

  // In production, this would upload to a CDN or storage service
  const url = URL.createObjectURL(file);

  return {
    id: `media-${Date.now()}`,
    url,
  };
}

/**
 * Delete media
 */
export async function deleteMedia(mediaId: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 150));

  return true;
}

/**
 * Get course analytics
 */
export async function getCourseAnalytics(courseId: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    courseId,
    totalEnrollments: 245,
    activeLearners: 89,
    completionRate: 68,
    averageLessonTime: 32,
    ratings: 4.7,
    totalReviews: 42,
  };
}
