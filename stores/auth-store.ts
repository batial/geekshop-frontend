// stores/auth-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";
import type { AuthResponse, RegisterRequest } from "@/types";

interface AuthState {
  user: AuthResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const { data } = await api.post<AuthResponse>("/auth/login", {
            email,
            password,
          });
          localStorage.setItem("token", data.token!);

          set({
            user: data,
            token: data.token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Error en login:", error);
          throw error;
        }
      },

      register: async (registerData: RegisterRequest) => {
        try {
          const { data } = await api.post<AuthResponse>(
            "/auth/register",
            registerData
          );

          localStorage.setItem("token", data.token!);

          set({
            user: data,
            token: data.token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Error en registro:", error);
          throw error;
        }
      },

      logout: () => {

        localStorage.removeItem("token");

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      loadUser: async () => {
        try {
          const { data } = await api.get<AuthResponse>("/auth/me");

          set({
            user: data,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Error al cargar usuario:", error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),

    {
      name: "auth-storage", 
      partialize: (state) => ({ token: state.token }),
    }
  )
);