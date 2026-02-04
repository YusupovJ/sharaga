import { Navigate } from "react-router";
import { useAuthStore } from "../store/authStore";
import { App } from "./App";

export const PrivateRoute = () => {
  const { user } = useAuthStore();
  return user ? <App /> : <Navigate to="/login" replace />;
};
