import { DashboardOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

export interface SidebarItem {
  key: string;
  label: string;
  path: string;
  icon: ReactNode;
  roles: Array<"superAdmin" | "admin" | "moderator">;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    key: "dashboard",
    label: "Bosh sahifa",
    path: "/",
    icon: <DashboardOutlined />,
    roles: ["superAdmin", "admin", "moderator"],
  },
  {
    key: "users",
    label: "Foydalanuvchilar",
    path: "/super-admin",
    icon: <UserOutlined />,
    roles: ["superAdmin"],
  },
  {
    key: "dormitories",
    label: "Yotoqxonalar",
    path: "/dormitories",
    icon: <HomeOutlined />,
    roles: ["superAdmin", "admin"],
  },
  {
    key: "students",
    label: "Talabalar",
    path: "/students",
    icon: <UserOutlined />,
    roles: ["moderator"],
  },
];
