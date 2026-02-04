import { message } from "antd";
import axios, { AxiosError } from "axios";

export const baseURL = import.meta.env.VITE_APP_BASE_URL;

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
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

    const refreshToken = localStorage.getItem("refreshToken");

    // @ts-ignore
    if (refreshToken && error.response?.status === 403 && originalConfig && !originalConfig?.isRetry) {
      // @ts-ignore
      originalConfig.isRetry = true;

      try {
        const response = await axios.post(`${baseURL}/auth/refresh`, { token: refreshToken });
        const tokens = response.data;

        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
      } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }

      return api.request(originalConfig);
    }

    return Promise.reject(error.response?.data || error);
  },
);
