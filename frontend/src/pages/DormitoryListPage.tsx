import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Table, Typography, message } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../lib/axios";
import { queryClient } from "../lib/queryClient";
import type {
  CreateDormitoryDto,
  IDormitory,
  IError,
  IPaginatedResponse,
  IUser,
  UpdateDormitoryDto,
} from "../lib/types";

const { Title } = Typography;
const { Search } = Input;

const DormitoryListPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDormitory, setEditingDormitory] = useState<IDormitory | null>(null);
  const [form] = Form.useForm();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const { data: response, isLoading } = useQuery<IPaginatedResponse<IDormitory>>({
    queryKey: ["dormitories", page, limit, search, sort, order],
    queryFn: async () => {
      const data = await api.get("/dormitory", {
        params: { page, limit, search, sort, order },
      });
      return data as unknown as IPaginatedResponse<IDormitory>;
    },
  });

  const { data: moderators } = useQuery<IUser[]>({
    queryKey: ["moderators"],
    queryFn: async () => {
      const data = await api.get("/users/moderators");
      return data as unknown as IUser[];
    },
  });

  const { mutate: createDormitory, isPending: isCreating } = useMutation<IDormitory, IError, CreateDormitoryDto>({
    mutationFn: (values) => api.post("/dormitory", values),
    onSuccess: () => {
      message.success("Yotoqxona yaratildi");
      queryClient.invalidateQueries({ queryKey: ["dormitories"] });
      handleCloseModal();
    },
    onError: (error) => {
      message.error(error.message || "Yaratishda xatolik yuz berdi");
    },
  });

  const { mutate: updateDormitory, isPending: isUpdating } = useMutation<IDormitory, IError, UpdateDormitoryDto>({
    mutationFn: (values) => api.patch(`/dormitory/${editingDormitory?.id}`, values),
    onSuccess: () => {
      message.success("Yotoqxona yangilandi");
      queryClient.invalidateQueries({ queryKey: ["dormitories"] });
      handleCloseModal();
    },
    onError: (error) => {
      message.error(error.message || "Yangilashda xatolik yuz berdi");
    },
  });

  const { mutate: deleteDormitory } = useMutation<void, IError, number>({
    mutationFn: (id) => api.delete(`/dormitory/${id}`),
    onSuccess: () => {
      message.success("Yotoqxona o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["dormitories"] });
    },
    onError: (error) => {
      message.error(error.message || "O'chirishda xatolik yuz berdi");
    },
  });

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _: Record<string, FilterValue | null>,
    sorter: SorterResult<IDormitory> | SorterResult<IDormitory>[],
  ) => {
    setPage(pagination.current || 1);
    setLimit(pagination.pageSize || 10);

    if (!Array.isArray(sorter)) {
      if (sorter.field) {
        setSort(sorter.field as string);
        setOrder(sorter.order === "ascend" ? "asc" : "desc");
      } else {
        setSort("createdAt");
        setOrder("desc");
      }
    }
  };

  const onSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleOpenCreate = () => {
    setEditingDormitory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: IDormitory) => {
    setEditingDormitory(record);
    form.setFieldsValue({ name: record.name, userId: record.userId });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDormitory(null);
    form.resetFields();
  };

  const onFinish = (values: CreateDormitoryDto) => {
    if (editingDormitory) {
      updateDormitory(values);
    } else {
      createDormitory(values);
    }
  };

  const columns: ColumnsType<IDormitory> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: "100px",
      sorter: true,
    },
    {
      title: "Nomi",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Talabalar soni",
      key: "studentsCount",
      render: (_, record) => record._count?.students || 0,
    },
    {
      title: "Moderator",
      key: "moderator",
      render: (_, record) => record.user?.login || "-",
    },
    {
      title: "Amallar",
      key: "action",
      width: "120px",
      render: (_: unknown, record: IDormitory) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(record);
            }}
          />
          <Popconfirm
            title="Siz haqiqatan ham ushbu yotoqxonani o'chirmoqchimisiz?"
            onConfirm={(e) => [deleteDormitory(record.id), e?.stopPropagation()]}
            onCancel={(e) => e?.stopPropagation()}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <main className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Title level={2} className="mb-0!">
          Yotoqxonalar
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          Yotoqxona qo'shish
        </Button>
      </div>

      <div className="mb-4">
        <Search
          placeholder="Qidirish..."
          allowClear
          onSearch={onSearch}
          onChange={(e) => {
            if (e.target.value === "") onSearch("");
          }}
          className="w-[300px]!"
        />
      </div>

      <Table
        columns={columns}
        dataSource={response?.data}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 600 }}
        pagination={{
          current: page,
          pageSize: limit,
          total: response?.meta.total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => navigate(`/dormitories/${record.id}/students`),
          style: { cursor: "pointer" },
        })}
      />

      <Modal
        title={editingDormitory ? "Yotoqxonani tahrirlash" : "Yotoqxona yaratish"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Nomi" name="name" rules={[{ required: true, message: "Iltimos, nomini kiriting!" }]}>
            <Input placeholder="Masalan: 1-sonli yotoqxona" />
          </Form.Item>

          <Form.Item label="Moderator" name="userId">
            <Select
              placeholder="Moderator tanlang"
              allowClear
              options={moderators?.map((mod) => ({
                label: mod.login,
                value: mod.id,
              }))}
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCloseModal}>Bekor qilish</Button>
              <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                {editingDormitory ? "Saqlash" : "Yaratish"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
};

export default DormitoryListPage;
