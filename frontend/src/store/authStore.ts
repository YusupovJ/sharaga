import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface IUser {
  id: string;
  login: string;
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
        return set({ user });
      },
      logout: () => {
        set({ user: null });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
