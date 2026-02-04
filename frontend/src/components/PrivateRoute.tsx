import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/authStore";

export const PrivateRoute = () => {
  const token = useAuthStore((state) => state.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};
