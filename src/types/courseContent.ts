/**
 * Course Content Types
 * Defines types for rich-text course content with media support
 */

export type ContentBlockType =
  | 'paragraph'
  | 'heading'
  | 'code'
  | 'image'
  | 'video'
  | 'pdf'
  | 'quote'
  | 'list';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: string; // HTML or data depending on block type
  metadata?: Record<string, unknown>;
  order: number;
}

export interface CourseLesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: ContentBlock[];
  objectives: string[];
  learningOutcomes: string[];
  estimatedDuration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseContent {
  id: string;
  courseId: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
  thumbnail?: string;
  duration: number; // total minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  published: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  draftVersion?: CourseContentDraft;
}

export interface CourseContentDraft {
  id: string;
  courseContentId: string;
  content: Partial<CourseContent>;
  lastSaved: Date;
  version: number;
}

export interface MediaUpload {
  id: string;
  type: 'image' | 'video' | 'pdf' | 'document';
  url: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    pages?: number;
    thumbnail?: string;
  };
}

export interface EditorState {
  lessonId: string;
  title: string;
  description: string;
  content: ContentBlock[];
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: Date;
  autoSaveEnabled: boolean;
}

// Rich Text Editor Formats
export enum TextFormat {
  BOLD = 'bold',
  ITALIC = 'italic',
  UNDERLINE = 'underline',
  CODE = 'code',
  STRIKETHROUGH = 'strikethrough',
  SUPERSCRIPT = 'superscript',
  SUBSCRIPT = 'subscript',
}

// Heading Levels
export enum HeadingLevel {
  H1 = 1,
  H2 = 2,
  H3 = 3,
  H4 = 4,
  H5 = 5,
  H6 = 6,
}

// Code Languages
export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'csharp',
  'cpp',
  'sql',
  'html',
  'css',
  'json',
  'xml',
  'yaml',
  'bash',
  'shell',
  'r',
  'ruby',
  'php',
  'go',
  'rust',
  'kotlin',
];

// Media Constraints
export const MEDIA_CONSTRAINTS = {
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxWidth: 4096,
    maxHeight: 4096,
  },
  video: {
    maxSize: 500 * 1024 * 1024, // 500MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/mpeg'],
    maxDuration: 3600, // 60 minutes in seconds
  },
  pdf: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['application/pdf'],
  },
  document: {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
};

// Helper Functions

/**
 * Validate media file
 */
export function validateMediaFile(
  file: File,
  type: 'image' | 'video' | 'pdf' | 'document'
): { valid: boolean; error?: string } {
  const constraints = MEDIA_CONSTRAINTS[type];

  if (!constraints) {
    return { valid: false, error: 'Unsupported media type' };
  }

  if (file.size > constraints.maxSize) {
    const maxSizeMB = constraints.maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  if ('allowedTypes' in constraints && !constraints.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not supported`,
    };
  }

  return { valid: true };
}

/**
 * Create empty content block
 */
export function createContentBlock(
  type: ContentBlockType,
  content: string = '',
  order: number = 0
): ContentBlock {
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    content,
    order,
  };
}

/**
 * Create lesson
 */
export function createLesson(courseId: string, title: string): CourseLesson {
  return {
    id: `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    courseId,
    title,
    description: '',
    content: [],
    objectives: [],
    learningOutcomes: [],
    estimatedDuration: 0,
    difficulty: 'beginner',
    order: 0,
    published: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Format content for storage
 */
export function formatContentForStorage(content: ContentBlock[]): string {
  return JSON.stringify(content);
}

/**
 * Parse content from storage
 */
export function parseContentFromStorage(data: string): ContentBlock[] {
  try {
    return JSON.parse(data) as ContentBlock[];
  } catch {
    return [];
  }
}

/**
 * Calculate reading time
 */
export function calculateReadingTime(content: ContentBlock[]): number {
  const textContent = content
    .filter((block) => block.type === 'paragraph')
    .map((block) => block.content)
    .join(' ');

  // Average reading speed: 200 words per minute
  const wordCount = textContent.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}
