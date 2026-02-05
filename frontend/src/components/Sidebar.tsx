import { LogoutOutlined, MenuOutlined } from "@ant-design/icons";
import { Drawer } from "antd";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { SIDEBAR_ITEMS } from "../lib/sidebar";
import { useAuthStore } from "../store/authStore";
import { Logout } from "./Logout";

const Sidebar = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filteredItems = SIDEBAR_ITEMS.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-600">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-blue-200 shadow-lg">
          T
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight m-0">
          TTJ <span className="text-blue-600">URDU</span>
        </h2>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {filteredItems.map((item) => {
          const isActive =
            location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <button
              key={item.key}
              onClick={() => {
                navigate(item.path);
                setIsMobileOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }
              `}
            >
              <span
                className={`
                text-xl transition-colors duration-200
                ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}
              `}
              >
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-100 mx-3 mb-3">
        <div className="bg-slate-50 rounded-xl p-3 mb-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase shadow-sm">
            {user?.login?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate m-0">{user?.login}</p>
            <p className="text-xs text-slate-500 truncate m-0 capitalize">{user?.role}</p>
          </div>
        </div>
        <Logout>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-slate-500 text-sm font-medium transition-colors">
            <LogoutOutlined /> Chiqish
          </button>
        </Logout>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <MenuOutlined />
      </button>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        open={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        size="large"
        styles={{ body: { padding: 0 } }}
        closable={false}
      >
        <NavContent />
      </Drawer>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 w-[240px] bg-white border-r border-slate-200 h-screen shadow-sm">
        <NavContent />
      </aside>

      {/* Desktop Spacer */}
      <div className="hidden lg:block w-[240px] shrink-0 transition-all duration-300" />
    </>
  );
};

export default Sidebar;
