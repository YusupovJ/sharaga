import { CheckOutlined, CloseOutlined, PlusOutlined, SearchOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Checkbox, Input, Modal, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useParams } from "react-router";
import { api } from "../lib/axios";
import { queryClient } from "../lib/queryClient";
import { useAuthStore } from "../store/authStore";
import { useStudentStore } from "../store/studentStore";

const { Title } = Typography;

interface IStudent {
  id: number;
  fullName: string;
  passport: string;
  faculty: string;
  roomNumber: string;
  job?: string;
  dormitoryId?: number;
  dormitory?: {
    id: number;
    name: string;
  };
}

const StudentsPage = () => {
  const { dormId } = useParams();
  const user = useAuthStore((state) => state.user);
  const { isAttendanceMode, attendanceData, toggleMode, setAttendance, resetAttendance } = useStudentStore();

  const [filters, setFilters] = useState({
    fullName: "",
    passport: "",
    faculty: "",
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [foundStudents, setFoundStudents] = useState<IStudent[]>([]);

  // --- Queries ---
  const { data: students, isLoading } = useQuery<IStudent[]>({
    queryKey: ["students", dormId, filters],
    queryFn: async () => {
      const params: any = { ...filters };
      if (dormId) params.dormitoryId = dormId;
      return api.get("/students", { params });
    },
  });

  const { mutate: searchGlobal, isPending: isSearching } = useMutation({
    mutationFn: (passport: string) => api.get("/students/search-global", { params: { passport } }),
    onSuccess: (data: any) => {
      setFoundStudents(data);
    },
  });

  const { mutate: assignStudent } = useMutation({
    mutationFn: ({ studentId, dormitoryId }: { studentId: number; dormitoryId: number }) =>
      api.patch(`/students/${studentId}/assign`, { dormitoryId }),
    onSuccess: () => {
      message.success("Talaba yotoqxonaga qo'shildi");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsAddModalOpen(false);
      setFoundStudents([]);
      setGlobalSearch("");
    },
    onError: (err: any) => message.error(err.message),
  });

  const { mutate: unassignStudent } = useMutation({
    mutationFn: (studentId: number) => api.patch(`/students/${studentId}/unassign`),
    onSuccess: () => {
      message.success("Talaba yotoqxonadan chiqarildi");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const { mutate: saveAttendance, isPending: isSavingAttendance } = useMutation({
    mutationFn: (records: { studentId: number; isPresent: boolean }[]) =>
      api.post("/students/attendance/bulk", { records }),
    onSuccess: () => {
      message.success("Davomat saqlandi");
      resetAttendance();
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
    onError: (err: any) => message.error(err.message),
  });

  // --- Handlers ---
  const handleSaveAttendance = () => {
    if (!students) return;
    const records = students.map((s) => ({
      studentId: s.id,
      isPresent: !!attendanceData[s.id],
    }));
    saveAttendance(records);
  };

  const handleGlobalSearch = () => {
    if (globalSearch) searchGlobal(globalSearch);
  };

  const currentDormId = dormId ? +dormId : undefined;

  // --- Columns ---
  const columns: ColumnsType<IStudent> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "F.I.O",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Pasport",
      dataIndex: "passport",
      key: "passport",
    },
    {
      title: "Fakultet",
      dataIndex: "faculty",
      key: "faculty",
    },
    {
      title: "Xona",
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: "Ish joyi",
      dataIndex: "job",
      key: "job",
      render: (job) => job || "-",
    },
  ];

  if (isAttendanceMode) {
    columns.push({
      title: "Davomat",
      key: "attendance",
      render: (_, record) => (
        <Checkbox checked={!!attendanceData[record.id]} onChange={(e) => setAttendance(record.id, e.target.checked)} />
      ),
    });
  } else if (user?.role === "admin") {
    columns.push({
      title: "Amallar",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Talabani yotoqxonadan chiqarmoqchimisiz?"
          onConfirm={() => unassignStudent(record.id)}
          okText="Ha"
          cancelText="Yo'q"
        >
          <Button danger icon={<UserDeleteOutlined />} size="small">
            Chiqarish
          </Button>
        </Popconfirm>
      ),
    });
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Talabalar</Title>
        <Space>
          {isAttendanceMode ? (
            <>
              <Button onClick={resetAttendance} icon={<CloseOutlined />}>
                Bekor qilish
              </Button>
              <Button
                type="primary"
                onClick={handleSaveAttendance}
                loading={isSavingAttendance}
                icon={<CheckOutlined />}
              >
                Saqlash
              </Button>
            </>
          ) : (
            <>
              <Button onClick={toggleMode}>Davomat qilish</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                Talaba qo'shish
              </Button>
            </>
          )}
        </Space>
      </div>

      <Space wrap className="mb-3">
        <Input
          placeholder="F.I.O bo'yicha"
          value={filters.fullName}
          onChange={(e) => setFilters({ ...filters, fullName: e.target.value })}
        />
        <Input
          placeholder="Pasport bo'yicha"
          value={filters.passport}
          onChange={(e) => setFilters({ ...filters, passport: e.target.value })}
        />
        <Input
          placeholder="Fakultet bo'yicha"
          value={filters.faculty}
          onChange={(e) => setFilters({ ...filters, faculty: e.target.value })}
        />
      </Space>

      <Table dataSource={students} columns={columns} rowKey="id" loading={isLoading} pagination={{ pageSize: 20 }} />

      <Modal
        title="Talaba qo'shish"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          setFoundStudents([]);
          setGlobalSearch("");
        }}
        footer={null}
        width={700}
      >
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Pasport seriyasini kiriting"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleGlobalSearch} loading={isSearching}>
            Qidirish
          </Button>
        </div>

        {foundStudents.length > 0 && (
          <Table
            dataSource={foundStudents}
            rowKey="id"
            pagination={false}
            columns={[
              { title: "F.I.O", dataIndex: "fullName" },
              { title: "Pasport", dataIndex: "passport" },
              {
                title: "Hozirgi yotoqxonasi",
                dataIndex: ["dormitory", "name"],
                render: (val) => val || <Tag color="green">Biriktirilmagan</Tag>,
              },
              {
                title: "Amal",
                render: (_, record) => (
                  <Button
                    type="primary"
                    disabled={!!record.dormitoryId}
                    onClick={() => {
                      if (currentDormId) {
                        assignStudent({ studentId: record.id, dormitoryId: currentDormId });
                      } else {
                        message.warning("Iltimos, avval biror yotoqxonani tanlang (Admin)");
                      }
                    }}
                  >
                    Qo'shish
                  </Button>
                ),
              },
            ]}
          />
        )}
        {foundStudents.length === 0 && globalSearch && !isSearching && (
          <div className="text-center text-gray-500">Talaba topilmadi</div>
        )}
      </Modal>
    </main>
  );
};

export default StudentsPage;
