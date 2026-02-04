import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface IUser {
  id: string;
  role: "admin" | "moderator";
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: IUser | null;
  setAuth: (user: IUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setAuth: (user: IUser) => {
        localStorage.setItem("accessToken", user.accessToken);
        localStorage.setItem("refreshToken", user.refreshToken);
        return set({ user });
      },
      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
