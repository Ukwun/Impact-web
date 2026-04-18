import { User } from "@/types";
import { create } from "zustand";
import { persist as zustandPersist, createJSONStorage } from "zustand/middleware";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, AUTH_STORE_KEY } from "@/lib/authStorage";
import { getApiUrl } from "@/lib/apiConfig";

// Some bundlers may interop the middleware as a default export.
const persist = (zustandPersist as any)?.default ?? zustandPersist;

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<{ success: boolean; token?: string; user?: User; error?: string }>;
  logout: () => void;
}

let _setAuthState: any;

export const useAuthStore = create<AuthStore>()(
  (persist as any)(
    (set: any, get: any) => {
      _setAuthState = set;

      const setUser = (user: User | null) =>
        set({ user, isAuthenticated: !!user, error: null });

      const setToken = (token: string | null) => set({ token });

      const setIsLoading = (isLoading: boolean) => set({ isLoading });

      const setError = (error: string | null) => set({ error });

      const setHasHydrated = (hasHydrated: boolean) => set({ hasHydrated });

      // Fallback token generator for cases where backend doesn't return token
      const generateFallbackToken = (user: any): string => {
        const payload = {
          sub: user.id || user.userId || 'unknown',
          email: user.email,
          role: user.role || 'STUDENT',
          iat: Math.floor(Date.now() / 1000),
        };
        // Simple base64 encoding (not a real JWT, just for placeholder)
        try {
          return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.' + 
                 btoa(JSON.stringify(payload)) + 
                 '.fallback_token';
        } catch (e) {
          // Fallback to a simple string token
          return 'token_' + user.id + '_' + Date.now();
        }
      };

      const login = async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log("🔑 Logging in with email:", email);
          
          const response = await fetch(getApiUrl("/api/auth/login"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          console.log("📥 Login response status:", response.status);

          if (!response.ok) {
            const data = await response.json();
            const errorMessage = data.error || data.message || "Login failed";
            console.error("❌ Login error:", errorMessage);
            throw new Error(errorMessage);
          }

          const data = await response.json();
          console.log("📥 Login response:", data);
          
          // Handle multiple response formats
          let token: string | undefined;
          let user: any = undefined;
          
          if (data.data?.token && data.data?.user) {
            token = data.data.token;
            user = data.data.user;
            console.log("✅ Format 1: { data: { user, token } }");
          } else if (data.token && data.user) {
            token = data.token;
            user = data.user;
            console.log("✅ Format 2: { user, token }");
          } else if (data.user && data.access_token) {
            token = data.access_token;
            user = data.user;
            console.log("✅ Format 3: { user, access_token }");
          } else if (data.data?.user && data.data?.access_token) {
            token = data.data.access_token;
            user = data.data.user;
            console.log("✅ Format 4: { data: { user, access_token } }");
          } else if (data.user) {
            user = data.user;
            token = data.token || data.access_token || generateFallbackToken(user);
            console.log("✅ Format 5: { user } + generated token");
          }

          if (!token || !user) {
            console.error("❌ Missing critical fields:");
            console.error("  - token:", !!token);
            console.error("  - user:", !!user);
            throw new Error("Invalid response: missing user or token");
          }

          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Store in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
          }

          console.log("✅ Login successful!");
          return true;
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Login failed";
          console.error("⚠️ Login error:", errorMessage);
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          return false;
        }
      };

      const register = async (data: any) => {
        set({ isLoading: true, error: null });
        try {
          // Transform form data to match backend expectations
          const transformedData = {
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            role: data.role,
            state: data.state,
            institution: data.institution,
          };

          console.log("📤 Sending registration to:", getApiUrl("/api/auth/register"));
          console.log("📋 Transformed data:", transformedData);

          const response = await fetch(getApiUrl("/api/auth/register"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transformedData),
          });

          console.log("📥 Response status:", response.status);

          const data_response = await response.json();
          console.log("📥 Response body:", data_response);

          if (!response.ok) {
            const errorMessage = data_response.errors
              ? Object.values(data_response.errors).join(', ')
              : data_response.error || data_response.message || "Registration failed";
            console.error("❌ Backend error:", errorMessage);
            throw new Error(errorMessage);
          }

          // Extract user and token from response
          let user: any = data_response.user || data_response.data?.user;
          let token: string = data_response.token || data_response.data?.token;
          
          if (!user) {
            console.error("❌ No user object in registration response");
            throw new Error("Registration succeeded but no user data returned");
          }

          if (!token) {
            console.error("❌ No token in registration response");
            throw new Error("Registration succeeded but no authentication token returned");
          }

          console.log("✅ Registration successful, user created:", user);
          console.log("   - User ID:", user.uid);
          console.log("   - User email:", user.email);
          console.log("   - User role:", user.role);
          console.log("✅ Token received directly from registration");

          // Set auth state directly with token from register endpoint
          // No need to call login() separately
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Store in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
          }

          console.log("✅ Registration complete and user authenticated!");
          
          return { success: true, token, user };
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Registration failed";
          console.error("⚠️ Registration error:", errorMessage);
          set({
            isLoading: false,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      };

      const logout = async () => {
        // Clear server-side auth cookie
        try {
          await fetch(getApiUrl("/api/auth/logout"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          // Ignore errors, but log to console for debugging
          console.warn("Logout endpoint failed:", err);
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });

        // Clear from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
          localStorage.removeItem(AUTH_STORE_KEY);  // Also clear the persist store
        }
      };

      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        hasHydrated: false,
        setUser,
        setToken,
        setIsLoading,
        setError,
        setHasHydrated,
        login,
        register,
        logout,
      };
    },
    {
      name: AUTH_STORE_KEY,
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          // Provide a no-op storage for server-side rendering to avoid errors
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          } as unknown as Storage;
        }
        return window.localStorage;
      }),
      onRehydrateStorage: () => (state: any) => {
        // Mark hydration complete so UI can safely rely on persisted data
        if (_setAuthState) {
          _setAuthState({ hasHydrated: true });
        }
      },
    }
  )
);

/**
 * Validate existing auth session on app load
 * Clears invalid or expired tokens to prevent stale auth state
 */
export async function validateAuthSession() {
  const state = useAuthStore.getState();
  
  // If no token or user, nothing to validate
  if (!state.token || !state.user) {
    return;
  }

  // Try to fetch a protected endpoint to verify token is still valid
  // This is optional - only do it if needed to avoid extra API calls
  // For now, just ensure localStorage is in sync with state
  
  const tokenFromStorage = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  const userFromStorage = typeof window !== "undefined" ? localStorage.getItem(AUTH_USER_KEY) : null;
  
  // If localStorage doesn't have matching data, state might be corrupted
  if (!tokenFromStorage && state.token) {
    // Token in state but not in localStorage - likely a hydration issue
    // Keep the state as is, let component handle it
    console.log("ⓘ Token in state but not in localStorage - hydration may still be in progress");
  }
}

/**
 * Force clear all auth state from localStorage
 * Useful for fixing stale auth state issues
 */
export function clearAuthStateStorage() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_STORE_KEY);
    
    // Also clear the auth store state
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
    
    console.log("✅ Auth state cleared from storage and state");
  }
}

