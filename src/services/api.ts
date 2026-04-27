import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private retryDelay = 1000; // Start with 1 second
  private maxRetries = 3;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 second timeout
    });

    // Add token to requests if available
    this.client.interceptors.request.use((config) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const config = error.config;

        if (!config) {
          return Promise.reject(error);
        }

        // Retry logic for network errors and 5xx status codes
        if (
          this.shouldRetry(error) &&
          (config as any)._retryCount < this.maxRetries
        ) {
          (config as any)._retryCount = ((config as any)._retryCount || 0) + 1;

          const delay = this.retryDelay * Math.pow(2, (config as any)._retryCount - 1);
          console.warn(`Retrying request (${(config as any)._retryCount}/${this.maxRetries}) after ${delay}ms`);

          await new Promise(resolve => setTimeout(resolve, delay));
          return this.client(config);
        }

        // Enhanced error handling
        const apiError: ApiError = {
          message: this.getErrorMessage(error),
          status: error.response?.status || 0,
          code: error.code,
        };

        // Handle specific error types
        if (error.response?.status === 401) {
          // Token expired or invalid
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Redirect to login if not already there
            if (!window.location.pathname.includes('/auth/login')) {
              window.location.href = '/auth/login';
            }
          }
        } else if (error.response?.status === 403) {
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', apiError.message);
        } else if (error.response && error.response.status >= 500) {
          // Server error
          console.error('Server error:', apiError.message);
        } else if (!error.response) {
          // Network error
          console.error('Network error - please check your connection');
        }

        return Promise.reject(apiError);
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx server errors
    return (
      !error.response || // Network error
      error.response.status >= 500 || // Server error
      error.code === 'ECONNABORTED' || // Timeout
      error.code === 'ENOTFOUND' // DNS resolution failed
    );
  }

  private getErrorMessage(error: AxiosError): string {
    if (error.response?.data) {
      const data = error.response.data as any;
      return data.message || data.error || 'An error occurred';
    }

    if (error.message) {
      return error.message;
    }

    return 'An unknown error occurred';
  }

  // Auth endpoints
  async register(data: any) {
    return this.client.post("/auth/register", data);
  }

  async login(email: string, password: string) {
    return this.client.post("/auth/login", { email, password });
  }

  async logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  // Course endpoints
  async getCourses() {
    return this.client.get("/courses");
  }

  async getCourse(id: string) {
    return this.client.get(`/courses/${id}`);
  }

  // Event endpoints
  async getEvents() {
    return this.client.get("/events");
  }

  async registerForEvent(eventId: string) {
    return this.client.post(`/events/${eventId}/register`, {});
  }

  // Certificate endpoints
  async getCertificates() {
    return this.client.get("/certificates");
  }

  // User endpoints
  async getProfile() {
    return this.client.get("/users/profile");
  }

  async updateProfile(data: any) {
    return this.client.put("/users/profile", data);
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.client.post("/users/change-password", { oldPassword, newPassword });
  }

  async uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.client.post("/users/profile-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  // Search and discovery endpoints
  async searchCourses(query: string, filters?: any) {
    return this.client.get("/courses/search", { params: { q: query, ...filters } });
  }

  async getRecommendedCourses() {
    return this.client.get("/courses/recommended");
  }

  async getCoursesByCategory(category: string) {
    return this.client.get(`/courses/category/${category}`);
  }

  async getTrendingCourses() {
    return this.client.get("/courses/trending");
  }

  // Progress endpoints
  async startCourse(courseId: string) {
    return this.client.post(`/courses/${courseId}/start`, {});
  }

  async updateLessonProgress(courseId: string, lessonId: string, progress: any) {
    return this.client.put(`/courses/${courseId}/lessons/${lessonId}/progress`, progress);
  }

  async completeLessonQuiz(courseId: string, lessonId: string, answers: any) {
    return this.client.post(`/courses/${courseId}/lessons/${lessonId}/quiz`, { answers });
  }

  async getCourseProgress(courseId: string) {
    return this.client.get(`/courses/${courseId}/progress`);
  }

  // Forum/Discussion endpoints
  async getDiscussions(courseId?: string) {
    const params = courseId ? { courseId } : {};
    return this.client.get("/discussions", { params });
  }

  async createDiscussionThread(data: any) {
    return this.client.post("/discussions", data);
  }

  async getDiscussionThread(threadId: string) {
    return this.client.get(`/discussions/${threadId}`);
  }

  async addDiscussionReply(threadId: string, content: string) {
    return this.client.post(`/discussions/${threadId}/replies`, { content });
  }

  async upvoteDiscussionPost(postId: string) {
    return this.client.post(`/discussions/posts/${postId}/upvote`, {});
  }

  // Notification endpoints
  async getNotifications(limit: number = 20, offset: number = 0) {
    return this.client.get("/notifications", { params: { limit, offset } });
  }

  async markNotificationAsRead(notificationId: string) {
    return this.client.put(`/notifications/${notificationId}/read`, {});
  }

  async markAllNotificationsAsRead() {
    return this.client.put("/notifications/read-all", {});
  }

  async deleteNotification(notificationId: string) {
    return this.client.delete(`/notifications/${notificationId}`);
  }

  // Wishlist/Bookmarks endpoints
  async getWishlist() {
    return this.client.get("/wishlist");
  }

  async addToWishlist(courseId: string) {
    return this.client.post("/wishlist", { courseId });
  }

  async removeFromWishlist(courseId: string) {
    return this.client.delete(`/wishlist/${courseId}`);
  }

  // Review and rating endpoints
  async submitCourseReview(courseId: string, review: any) {
    return this.client.post(`/courses/${courseId}/reviews`, review);
  }

  async getCourseReviews(courseId: string, limit: number = 10) {
    return this.client.get(`/courses/${courseId}/reviews`, { params: { limit } });
  }

  async rateCourse(courseId: string, rating: number) {
    return this.client.post(`/courses/${courseId}/rate`, { rating });
  }

  // Analytics endpoints
  async trackEvent(eventType: string, data: any) {
    return this.client.post("/analytics/track", { eventType, data });
  }

  async getLearningStats() {
    return this.client.get("/analytics/learning-stats");
  }

  // Payment and subscription endpoints
  async initiatePayment(data: any) {
    return this.client.post("/payments/initiate", data);
  }

  async verifyPayment(paymentId: string) {
    return this.client.get(`/payments/${paymentId}/verify`);
  }

  async getSubscriptions() {
    return this.client.get("/subscriptions");
  }

  async subscribeToTier(tierId: string) {
    return this.client.post("/subscriptions", { tierId });
  }

  async cancelSubscription(subscriptionId: string) {
    return this.client.delete(`/subscriptions/${subscriptionId}`);
  }

  // Instructor/Content creation endpoints
  async createCourse(data: any) {
    return this.client.post("/instructor/courses", data);
  }

  async updateCourse(courseId: string, data: any) {
    return this.client.put(`/instructor/courses/${courseId}`, data);
  }

  async deleteCourse(courseId: string) {
    return this.client.delete(`/instructor/courses/${courseId}`);
  }

  async addLesson(classroomId: string, lessonData: any, moduleId?: string) {
    const resolvedModuleId = moduleId || lessonData?.moduleId;
    if (!resolvedModuleId) {
      throw new Error("moduleId is required to add a lesson");
    }

    return this.client.post(
      `/facilitator/classroom/${classroomId}/modules/${resolvedModuleId}/lessons`,
      lessonData
    );
  }

  async uploadLessonMedia(_courseId: string, lessonId: string, file: File) {
    const presignRes = await this.client.post('/files', {
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      category: file.type.startsWith('video/') ? 'video' : 'document',
    });

    const { presignedUrl, s3Key, bucket } = presignRes.data || {};
    if (!presignedUrl || !s3Key) {
      throw new Error('Failed to generate upload URL for lesson media');
    }

    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error('Failed to upload lesson media file');
    }

    const fileUrl = bucket
      ? `https://${bucket}.s3.amazonaws.com/${s3Key}`
      : s3Key;

    const updatePayload = file.type.startsWith('video/')
      ? { videoUrl: fileUrl }
      : { content: fileUrl };

    return this.client.put(`/lessons/${lessonId}`, updatePayload);
  }

  async getInstructorDashboard() {
    return this.client.get("/instructor/dashboard");
  }

  // Community and networking endpoints
  async getUserProfile(userId: string) {
    return this.client.get(`/users/${userId}`);
  }

  async searchUsers(query: string) {
    return this.client.get("/users/search", { params: { q: query } });
  }

  async followUser(userId: string) {
    return this.client.post(`/users/${userId}/follow`, {});
  }

  async unfollowUser(userId: string) {
    return this.client.delete(`/users/${userId}/follow`);
  }

  async getFollowers() {
    return this.client.get("/users/followers");
  }

  async getFollowing() {
    return this.client.get("/users/following");
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.client.get("/admin/dashboard");
  }

  async getUsersList(limit: number = 20, offset: number = 0) {
    return this.client.get("/admin/users", { params: { limit, offset } });
  }

  async suspendUser(userId: string, reason: string) {
    return this.client.post(`/admin/users/${userId}/suspend`, { reason });
  }

  async getCourseModeration() {
    return this.client.get("/admin/moderation/courses");
  }

  // Generic method for custom requests
  get(url: string, config?: any) {
    return this.client.get(url, config);
  }

  post(url: string, data?: any, config?: any) {
    return this.client.post(url, data, config);
  }

  put(url: string, data?: any, config?: any) {
    return this.client.put(url, data, config);
  }

  delete(url: string, config?: any) {
    return this.client.delete(url, config);
  }
}

export const apiClient = new ApiClient();
