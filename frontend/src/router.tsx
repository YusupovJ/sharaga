import { createBrowserRouter } from "react-router";
import { PrivateRoute } from "./components/PrivateRoute";
import { RoleRoute } from "./components/RoleRoute";
import DormitoryListPage from "./pages/DormitoryListPage";
import LoginPage from "./pages/LoginPage";
import StatisticsPage from "./pages/StatisticsPage";
import StudentsPage from "./pages/StudentsPage";
import SuperAdminPage from "./pages/SuperAdminPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        index: true,
        element: <StatisticsPage />,
      },
      {
        path: "super-admin",
        element: (
          <RoleRoute roles={["superAdmin"]}>
            <SuperAdminPage />
          </RoleRoute>
        ),
      },
      {
        path: "dormitories",
        element: (
          <RoleRoute roles={["admin", "superAdmin"]}>
            <DormitoryListPage />
          </RoleRoute>
        ),
      },
      {
        path: "dormitories/:dormId/students",
        element: (
          <RoleRoute roles={["admin", "superAdmin"]}>
            <StudentsPage />
          </RoleRoute>
        ),
      },
      {
        path: "students",
        element: (
          <RoleRoute roles={["moderator"]}>
            <StudentsPage />
          </RoleRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: "Sahifa topilmadi",
  },
]);

export default router;
