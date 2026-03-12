import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Identity, SecurityGate } from "@/types";

interface AuthState {
  token: string | null;
  identity: Identity | null;
  securityGate: SecurityGate | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  mustChangePassword: boolean;
  login: (token: string, identity: Identity, securityGate?: SecurityGate, email?: string, mustChangePassword?: boolean) => void;
  clearMustChangePassword: () => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
}

function cookieStorage() {
  return {
    getItem: (name: string): string | null => {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
      return match ? decodeURIComponent(match[2]) : null;
    },
    setItem: (name: string, value: string) => {
      if (typeof document === "undefined") return;
      document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=86400; SameSite=Lax`;
    },
    removeItem: (name: string) => {
      if (typeof document === "undefined") return;
      document.cookie = `${name}=; path=/; max-age=0`;
    },
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      identity: null,
      securityGate: null,
      isAuthenticated: false,
      hasHydrated: false,
      mustChangePassword: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      login: (token, identity, securityGate, email, mustChangePassword) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("sanctum_token", token);
        }
        const enriched = email ? { ...identity, _email: email } : identity;
        set({ token, identity: enriched, securityGate: securityGate ?? null, isAuthenticated: true, mustChangePassword: mustChangePassword ?? false });
      },
      clearMustChangePassword: () => set({ mustChangePassword: false }),
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("sanctum_token");
        }
        set({ token: null, identity: null, securityGate: null, isAuthenticated: false, mustChangePassword: false });
      },
    }),
    {
      name: "chereh-auth",
      storage: createJSONStorage(() => cookieStorage()),
      partialize: (state) => ({
        token: state.token,
        identity: state.identity,
        securityGate: state.securityGate,
        isAuthenticated: state.isAuthenticated,
        mustChangePassword: state.mustChangePassword,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
