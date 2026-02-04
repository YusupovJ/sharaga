import { message } from "antd";
import axios, { AxiosError } from "axios";

export const api = axios.create({ baseURL: "http://localhost:7777" });

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  ({ data, config, headers, statusText }) => ({ ...data, config, headers, statusText }),
  async (error: AxiosError) => {
    const originalConfig = error.config;
    if (error.message === "Network Error") {
      message.error("Tarmoq xatosi");
      return Promise.reject(new Error("Network Error"));
    }

    const refreshToken = localStorage.getItem("refreshToken");

    // @ts-ignore
    if (refreshToken && error.response?.status === 401 && originalConfig && !originalConfig?.isRetry) {
      // @ts-ignore
      originalConfig.isRetry = true;

      try {
        const response = await axios.post("/auth/refresh", { refreshToken });
        const tokens = response.data;

        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
      } catch (error) {
        localStorage.setItem("accessToken", "refreshToken");
      }

      return api.request(originalConfig);
    }

    return Promise.reject(error);
  },
);
