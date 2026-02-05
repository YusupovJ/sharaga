import { message } from "antd";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "../store/authStore";

export const baseURL = import.meta.env.VITE_APP_BASE_URL;

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const { user } = useAuthStore.getState();

  if (user?.accessToken) {
    config.headers.Authorization = `Bearer ${user.accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalConfig = error.config;
    if (error.message === "Network Error") {
      message.error("Network error");
      return Promise.reject(new Error("Network Error"));
    }
    const { setAuth, user, logout } = useAuthStore.getState();

    // @ts-ignore
    if (user?.refreshToken && error.response?.status === 403 && originalConfig && !originalConfig?.isRetry) {
      // @ts-ignore
      originalConfig.isRetry = true;

      try {
        const response = await axios.post(`${baseURL}/auth/refresh`, { token: user.refreshToken });
        const tokens = response.data;
        setAuth(tokens);
      } catch (error) {
        logout();
      }

      return api.request(originalConfig);
    }

    return Promise.reject(error.response?.data || error);
  },
);
