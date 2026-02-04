import { createBrowserRouter } from "react-router";
import { PrivateRoute } from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";

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
            <h1>Dashboard (Protected)</h1>
          </div>
        ),
      },
    ],
  },
]);

export default router;
