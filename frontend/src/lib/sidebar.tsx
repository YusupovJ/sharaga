import { DashboardOutlined, HomeOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

export interface SidebarItem {
  key: string;
  label: string;
  path: string;
  icon: ReactNode;
  roles: Array<"admin" | "moderator">;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    key: "dashboard",
    label: "Bosh sahifa",
    path: "/",
    icon: <DashboardOutlined />,
    roles: ["admin", "moderator"],
  },
  {
    key: "dormitories",
    label: "Yotoqxonalar",
    path: "/dormitories",
    icon: <HomeOutlined />,
    roles: ["admin"],
  },
];
