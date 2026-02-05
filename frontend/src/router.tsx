import { createBrowserRouter } from "react-router";
import { PrivateRoute } from "./components/PrivateRoute";
import DormitoryListPage from "./pages/DormitoryListPage";
import LoginPage from "./pages/LoginPage";
import StudentsPage from "./pages/StudentsPage";

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
        element: (
          <div className="p-4">
            <h1>Bosh sahifa (Himoyalangan)</h1>
          </div>
        ),
      },
      {
        path: "/dormitories",
        element: <DormitoryListPage />,
      },
      {
        path: "/students",
        element: <StudentsPage />,
      },
      {
        path: "/dormitories/:dormId/students",
        element: <StudentsPage />,
      },
    ],
  },
  {
    path: "*",
    element: "Sahifa topilmadi",
  },
]);

export default router;
