import { createBrowserRouter } from "react-router";
import { PrivateRoute } from "./components/PrivateRoute";
import DormitoryListPage from "./pages/DormitoryListPage";
import LoginPage from "./pages/LoginPage";
import StatisticsPage from "./pages/StatisticsPage";

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
        path: "/",
        element: <StatisticsPage />,
      },
      {
        path: "/dormitories",
        element: <DormitoryListPage />,
      },
    ],
  },
  {
    path: "*",
    element: "Sahifa topilmadi",
  },
]);

export default router;

