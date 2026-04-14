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
          // Guardamos el token en una cookie para que el middleware lo pueda leer.
          // max-age=86400 = 24 horas (igual que la expiración del JWT)
          // SameSite=Strict = la cookie solo se envía en requests del mismo sitio (seguridad)
          document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Strict`;

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
          document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Strict`;

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
        // Eliminamos la cookie seteando max-age=0 (expira inmediatamente)
        document.cookie = "token=; path=/; max-age=0; SameSite=Strict";

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