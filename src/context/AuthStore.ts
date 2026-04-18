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

      const login = async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(getApiUrl("/api/auth/login"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Login failed");
          }

          const data = await response.json();
          const { token, user } = data.data;

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

          return true;
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Login failed";
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
          const response = await fetch(getApiUrl("/api/auth/register"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const responseData = await response.json();
            const errorMessage = responseData.errors
              ? Object.values(responseData.errors).join(', ')
              : responseData.error || "Registration failed";
            throw new Error(errorMessage);
          }

          const data_response = await response.json();
          const { token, user } = data_response.data;

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

          return { success: true, token, user };
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Registration failed";
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

