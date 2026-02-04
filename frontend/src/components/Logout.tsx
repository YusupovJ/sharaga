import { LogoutOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Modal } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../lib/axios";
import { useAuthStore } from "../store/authStore";

export const Logout = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { mutate } = useMutation<string, string, null>({
    mutationFn: () => api.post("/auth/logout"),
  });

  const handleLogout = () => {
    mutate(null, {
      onSettled() {
        logout();
        navigate("/login");
        setOpen(false);
      },
    });
  };

  return (
    <>
      <Modal
        open={open}
        onOk={handleLogout}
        onCancel={() => setOpen(false)}
        title="Chiqish"
        okText="Ha"
        cancelText="Yo'q"
      >
        Haqiqatan ham tizimdan chiqmoqchimisiz?
      </Modal>
      <Button
        danger
        type="text"
        icon={<LogoutOutlined />}
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-start h-11 px-4 text-base rounded-lg hover:bg-red-50"
      >
        Chiqish
      </Button>
    </>
  );
};
