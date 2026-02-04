import { Outlet } from "react-router";
import Sidebar from "./Sidebar";

export const App = () => {
  return (
    <main className="flex">
      <Sidebar />
      <Outlet />
    </main>
  );
};
