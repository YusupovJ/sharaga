import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/authStore";

interface RoleRouteProps {
  roles: string[];
  children?: React.ReactNode;
}

export const RoleRoute = ({ roles, children }: RoleRouteProps) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
