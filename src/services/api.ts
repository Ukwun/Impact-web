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
