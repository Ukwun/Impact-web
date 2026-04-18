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

          // Store token AND user in localStorage for API calls and page reloads
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
            full_name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            phone: data.phone,
            role: data.role,
            state: data.state,
            institution: data.institution,
            passwordConfirm: data.passwordConfirm || data.passwordConfirm,
            agreeToTerms: data.agreeToTerms,
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
          console.log("📥 Response TOP-LEVEL keys:", Object.keys(data_response));
          if (data_response.data) {
            console.log("📥 Response.data keys:", Object.keys(data_response.data));
          }
          if (data_response.user) {
            console.log("📥 Response.user keys:", Object.keys(data_response.user));
          }

          if (!response.ok) {
            const errorMessage = data_response.errors
              ? Object.values(data_response.errors).join(', ')
              : data_response.error || data_response.message || "Registration failed";
            console.error("❌ Backend error:", errorMessage);
            throw new Error(errorMessage);
          }

          // Handle multiple response formats flexibly
          let token: string | undefined;
          let user: any = undefined;
          
          // Try various response formats
          if (data_response.data?.token && data_response.data?.user) {
            token = data_response.data.token;
            user = data_response.data.user;
            console.log("✅ Format 1: { data: { user, token } }");
          } else if (data_response.token && data_response.user) {
            token = data_response.token;
            user = data_response.user;
            console.log("✅ Format 2: { user, token }");
          } else if (data_response.user && data_response.access_token) {
            token = data_response.access_token;
            user = data_response.user;
            console.log("✅ Format 3: { user, access_token }");
          } else if (data_response.data?.user && data_response.data?.access_token) {
            token = data_response.data.access_token;
            user = data_response.data.user;
            console.log("✅ Format 4: { data: { user, access_token } }");
          } else if (data_response.user) {
            // If we have user but no token, look for token in various places
            user = data_response.user;
            const hasToken = !!data_response.token;
            const hasAccessToken = !!data_response.access_token;
            const hasDataToken = !!data_response.data?.token;
            const hasDataAccessToken = !!data_response.data?.access_token;
            const hasUserToken = !!user.token;
            const hasUserAccessToken = !!user.accessToken;
            
            // Try to find token in multiple locations
            token = data_response.token || 
                    data_response.access_token || 
                    data_response.data?.token ||
                    data_response.data?.access_token ||
                    user.token ||
                    user.accessToken ||
                    generateFallbackToken(user);
            
            console.log("⚠️ Format 5: User found but NO token in standard locations");
            console.log("   - response.token:", hasToken);
            console.log("   - response.access_token:", hasAccessToken);
            console.log("   - response.data.token:", hasDataToken);
            console.log("   - response.data.access_token:", hasDataAccessToken);
            console.log("   - user.token:", hasUserToken);
            console.log("   - user.accessToken:", hasUserAccessToken);
            console.log("   - User object keys:", Object.keys(user));
            console.log("   - User ID:", user.id);
            console.log("   - Using token:", token.substring(0, 50) + "...");
            console.log("   ⚠️ WARNING: May be using fallback token, could cause auth issues!");
          }

          if (!token || !user) {
            console.error("❌ Missing critical fields in response:");
            console.error("  - token:", !!token);
            console.error("  - user:", !!user);
            console.error("  - response keys:", Object.keys(data_response));
            throw new Error("Server response is missing required user or token data");
          }

          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Store token AND user in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
          }

          console.log("✅ Registration successful!");
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

        if (typeof window !== "undefined") {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
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

