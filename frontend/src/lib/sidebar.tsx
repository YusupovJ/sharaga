import { DashboardOutlined, SafetyCertificateOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

export interface SidebarItem {
  key: string;
  label: string;
  path: string;
  icon: ReactNode;
  roles: Array<"admin" | "moderator">; // Кому доступен пункт
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    key: "dashboard",
    label: "Главная",
    path: "/",
    icon: <DashboardOutlined />,
    roles: ["admin", "moderator"],
  },
  {
    key: "users",
    label: "Пользователи",
    path: "/users",
    icon: <UserOutlined />,
    roles: ["admin"],
  },
  {
    key: "moderation",
    label: "Модерация",
    path: "/moderation",
    icon: <SafetyCertificateOutlined />,
    roles: ["admin", "moderator"],
  },
  {
    key: "settings",
    label: "Настройки",
    path: "/settings",
    icon: <SettingOutlined />,
    roles: ["admin"],
  },
];
