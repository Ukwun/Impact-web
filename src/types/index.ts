// User Roles
export type UserRole =
  | "student"
  | "parent"
  | "facilitator"
  | "school_admin"
  | "uni_member"
  | "circle_member"
  | "mentor"
  | "admin";

// User Type
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  state: string;
  institution?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Response
export interface AuthResponse {
  token: string;
  user: User;
}

// Course Type
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  modules: Module[];
  duration: number; // in minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  createdAt: string;
}

// Module Type
export interface Module {
  id: string;
  courseId: string;
  title: string;
  lessons: Lesson[];
  order: number;
  createdAt: string;
}

// Lesson Type
export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  duration: number;
  createdAt: string;
}

// Event Type
export interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  venue: string;
  location: string;
  image?: string;
  type: "national" | "state" | "school" | "circle";
  capacity: number;
  registered: number;
  createdAt: string;
}

// Certificate Type
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  certificateNumber: string;
  issuedDate: string;
  expiryDate?: string;
  qrCode: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
