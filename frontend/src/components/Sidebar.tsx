import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router";
import { SIDEBAR_ITEMS } from "../lib/sidebar";
import { useAuthStore } from "../store/authStore";
import { Logout } from "./Logout";

const { Sider } = Layout;

const Sidebar = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = SIDEBAR_ITEMS.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  }).map((item) => ({
    key: item.path,
    icon: item.icon,
    label: item.label,
  }));

  return (
    <>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        theme="light"
        className="fixed inset-y-0 left-0 z-1000 h-screen border-r border-gray-200"
        style={{ position: "fixed", height: "100vh", left: 0, top: 0 }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex justify-center border-b border-gray-50">
            <h2 className="text-xl font-bold text-blue-600 tracking-wider">SHARAGA</h2>
          </div>

          <div className="flex-1 overflow-y-auto pt-2">
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              className="border-none"
            />
          </div>

          <div className="p-4 border-t border-gray-100">
            <Logout />
          </div>
        </div>
      </Sider>

      <div className="hidden lg:block w-50 shrink-0" />
    </>
  );
};

export default Sidebar;
