import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { api } from "../lib/axios";
import { queryClient } from "../lib/queryClient";
import type { IError, IUser } from "../lib/types";

const { Title } = Typography;

interface CreateUserDto {
  login: string;
  password?: string;
  role: string;
}

const SuperAdminPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [form] = Form.useForm();

  const { data: users, isLoading } = useQuery<IUser[]>({
    queryKey: ["users"],
    queryFn: async () => {
      return api.get("/users");
    },
  });

  const { mutate: createUser, isPending: isCreating } = useMutation<IUser, IError, CreateUserDto>({
    mutationFn: (values) => api.post("/users", values),
    onSuccess: () => {
      message.success("Foydalanuvchi yaratildi");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      handleCloseModal();
    },
    onError: (error) => {
      message.error(error.message || "Yaratishda xatolik yuz berdi");
    },
  });

  const { mutate: updateUser, isPending: isUpdating } = useMutation<IUser, IError, { id: number; data: CreateUserDto }>(
    {
      mutationFn: ({ id, data }) => api.patch(`/users/${id}`, data),
      onSuccess: () => {
        message.success("Foydalanuvchi yangilandi");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        handleCloseModal();
      },
      onError: (error) => {
        message.error(error.message || "Yangilashda xatolik yuz berdi");
      },
    },
  );

  const { mutate: deleteUser } = useMutation<void, IError, number>({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      message.success("Foydalanuvchi o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      message.error(error.message || "O'chirishda xatolik yuz berdi");
    },
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: IUser) => {
    setEditingUser(record);
    form.setFieldsValue({ login: record.login, role: record.role });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const onFinish = (values: CreateUserDto) => {
    if (editingUser) {
      updateUser({ id: editingUser.id, data: values });
    } else {
      createUser(values);
    }
  };

  const columns: ColumnsType<IUser> = [
    {
      title: "#",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Login",
      dataIndex: "login",
      key: "login",
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const colors: Record<string, string> = {
          superAdmin: "red",
          admin: "blue",
          moderator: "green",
        };
        return <Tag color={colors[role]}>{role}</Tag>;
      },
    },
    {
      title: "Amallar",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Popconfirm
            title="Siz haqiqatan ham o'chirmoqchimisiz?"
            onConfirm={() => deleteUser(record.id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <main className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="mb-0!">
          Foydalanuvchilar
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          Qo'shish
        </Button>
      </div>

      <Table columns={columns} dataSource={users} rowKey="id" loading={isLoading} scroll={{ x: 600 }} />

      <Modal
        title={editingUser ? "Tahrirlash" : "Yaratish"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Login" name="login" rules={[{ required: true, message: "Loginni kiriting" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Parol" name="password" rules={[{ required: !editingUser, message: "Parolni kiriting" }]}>
            <Input.Password placeholder={editingUser ? "O'zgartirish uchun kiriting" : ""} />
          </Form.Item>

          <Form.Item label="Rol" name="role" rules={[{ required: true, message: "Rolni tanlang" }]}>
            <Select>
              <Select.Option value="superAdmin">Super Admin</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="moderator">Moderator</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCloseModal}>Bekor qilish</Button>
              <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                Saqlash
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
};

export default SuperAdminPage;
