import {
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  PlusOutlined,
  SearchOutlined,
  UserDeleteOutlined,
} from "@ant-design/icons";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Button, Checkbox, Input, Modal, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDebounce } from "../hooks/useDebounce";
import { api, baseURL } from "../lib/axios";
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

interface IMonthAttendance {
  month: number;
  year: number;
  records: {
    id: number;
    createdAt: string;
    updatedAt: string;
    userId: number;
    date: string;
    dormitory: {
      id: number;
      name: string;
    };
    dormitoryId: number;
    isPresent: boolean;
    studentId: number;
    roomNumber?: string;
  }[];
  student: IStudent;
}

const StudentsPage = () => {
  const { dormId } = useParams();
  const user = useAuthStore((state) => state.user);

  // Attendan states
  const { attendanceData, setAttendance, resetAttendance, clearAttendanceData, isAttendanceMode, toggleMode } =
    useStudentStore();

  // Filters & sorting
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [sort, setSort] = useState({ field: "id", order: "asc" });

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [triggeredSearch, setTriggeredSearch] = useState("");
  const [loadMoreRef, setLoadMoreRef] = useState<HTMLDivElement | null>(null);
  const [searchLoadMoreRef, setSearchLoadMoreRef] = useState<HTMLDivElement | null>(null);

  // --- Queries ---
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["students", dormId, debouncedSearch, sort],
    queryFn: async ({ pageParam = 1 }) => {
      const params: any = { search: debouncedSearch, sort: sort.field, order: sort.order, page: pageParam, limit: 30 };
      if (dormId) params.dormitoryId = dormId;
      const res = await api.get("/students", { params });
      return res as any;
    },
    getNextPageParam: (lastPage: any) => {
      // Check if we have meta, if not (e.g. error or old api) return undefined
      if (!lastPage?.meta) return undefined;
      const { page, totalPages } = lastPage.meta;
      // Ensure we compare numbers
      return Number(page) < Number(totalPages) ? Number(page) + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const students = data?.pages.flatMap((page) => page.data) || [];

  const { data: todayAttendance = [] } = useQuery<{ studentId: number; isPresent: boolean }[]>({
    queryKey: ["todayAttendance", dormId],
    queryFn: async () => {
      const params: any = {};
      if (dormId) params.dormitoryId = dormId;
      return api.get("/students/attendance/today", { params });
    },
  });

  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);
  const [assignForm, setAssignForm] = useState({ roomNumber: "", job: "" });
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Edit room/job modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<IStudent | null>(null);
  const [editForm, setEditForm] = useState({ roomNumber: "", job: "" });

  const {
    data: searchData,
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingNextSearchPage,
    isLoading: isSearching,
  } = useInfiniteQuery({
    queryKey: ["students-global-search", triggeredSearch],
    queryFn: async ({ pageParam = 1 }) => {
      if (!triggeredSearch) return { data: [], meta: { total: 0, totalPages: 0 } };
      return api.get("/students/search-global", {
        params: { passport: triggeredSearch, page: pageParam, limit: 30 },
      }) as any;
    },
    getNextPageParam: (lastPage: any) => {
      if (!lastPage?.meta) return undefined;
      const { page, totalPages } = lastPage.meta;
      return Number(page) < Number(totalPages) ? Number(page) + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!triggeredSearch && isAddModalOpen && !selectedStudent,
  });

  const foundStudents = searchData?.pages.flatMap((p) => p.data) || [];

  // Scroll detection for main list
  useEffect(() => {
    if (!loadMoreRef || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { root: null, threshold: 0.1 },
    );

    observer.observe(loadMoreRef);
    return () => observer.disconnect();
  }, [loadMoreRef, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Scroll detection for search list
  useEffect(() => {
    if (!searchLoadMoreRef || !hasNextSearchPage || isFetchingNextSearchPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextSearchPage();
        }
      },
      { root: null, threshold: 0.1 },
    );

    observer.observe(searchLoadMoreRef);
    return () => observer.disconnect();
  }, [searchLoadMoreRef, hasNextSearchPage, isFetchingNextSearchPage, fetchNextSearchPage]);

  const { data: monthAttendance, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["monthAttendance", selectedStudentForHistory],
    queryFn: async () => {
      if (!selectedStudentForHistory) return null;
      return api.get(`/students/${selectedStudentForHistory}/attendance/month`) as unknown as IMonthAttendance;
    },
    enabled: !!selectedStudentForHistory && historyModalOpen,
  });

  const { mutate: assignStudent } = useMutation({
    mutationFn: ({
      studentId,
      dormitoryId,
      roomNumber,
      job,
    }: {
      studentId: number;
      dormitoryId: number;
      roomNumber: string;
      job?: string;
    }) => api.patch(`/students/${studentId}/assign`, { dormitoryId, roomNumber, job }),
    onSuccess: () => {
      message.success("Talaba yotoqxonaga qo'shildi");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students-global-search"] }); // Refresh search results to update UI state
      // Do not close modal or clear search so user can see updated status
      setSelectedStudent(null);
      setAssignForm({ roomNumber: "", job: "" });
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

  const { mutate: updateRoomJob, isPending: isUpdatingRoomJob } = useMutation({
    mutationFn: ({ id, roomNumber, job }: { id: number; roomNumber?: string; job?: string }) =>
      api.patch(`/students/${id}/room-job`, { roomNumber, job }),
    onSuccess: () => {
      message.success("Xona va ish joyi yangilandi");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setEditModalOpen(false);
      setEditingStudent(null);
      setEditForm({ roomNumber: "", job: "" });
    },
  });

  const { mutate: saveAttendance, isPending: isSavingAttendance } = useMutation({
    mutationFn: (records: { studentId: number; isPresent: boolean }[]) =>
      api.post("/students/attendance/bulk", { records }),
    onSuccess: () => {
      message.success("Davomat saqlandi");
      clearAttendanceData();
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
      // Invalidate both potential query keys to be safe
      queryClient.invalidateQueries({ queryKey: ["todayAttendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] }); // This matches ["attendance", "today", ...]
      queryClient.invalidateQueries({ queryKey: ["monthAttendance"] });
    },
    onError: (err: any) => message.error(err.message),
  });

  // --- Handlers ---
  const handleSaveAttendance = () => {
    if (!students) return;

    const records = students
      .map((student) => {
        // Check if attendance already exists
        const existingAttendance = todayAttendance.find((a) => a.studentId === student.id);

        // If moderator and already exists, skip (cannot change)
        if (existingAttendance && user?.role === "moderator") {
          return null;
        }

        // Get value from manual input, or existing value (for admin edit), or default to false
        let isPresent = false;
        if (attendanceData[student.id] !== undefined) {
          isPresent = attendanceData[student.id];
        } else if (user?.role === "admin" && existingAttendance) {
          // Admin keeps existing status if not changed
          isPresent = existingAttendance.isPresent;
        }

        // Special case: if admin hasn't touched a record that doesn't exist yet, it defaults to false.

        return {
          studentId: student.id,
          isPresent,
        };
      })
      .filter((r) => r !== null) as { studentId: number; isPresent: boolean }[];

    if (records.length === 0) {
      message.warning("O'zgarishlar yo'q");
      return;
    }
    saveAttendance(records);
  };

  const handleGlobalSearch = () => {
    if (globalSearch) setTriggeredSearch(globalSearch);
  };

  const handleTableChange = (_pagination: any, _filters: any, sorter: any) => {
    if (sorter.order) {
      setSort({
        field: sorter.field as string,
        order: sorter.order === "ascend" ? "asc" : "desc",
      });
    } else {
      setSort({ field: "id", order: "asc" }); // Reset to default
    }
  };

  const handleDownloadFullHistory = async () => {
    if (!selectedStudentForHistory) return;
    setIsDownloading(true);
    try {
      const response = await axios.get(`${baseURL}/students/${selectedStudentForHistory}/attendance/export`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      let fileName = "Attendance_History.xlsx";
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="?([^"]+)"?/);
        if (matches && matches[1]) {
          fileName = matches[1];
        }
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      message.error("Tarixni yuklab olishda xatolik yuz berdi");
    } finally {
      setIsDownloading(false);
    }
  };

  // Prefill attendance for admin when entering attendance mode
  useEffect(() => {
    if (isAttendanceMode && user?.role === "admin" && todayAttendance.length > 0) {
      const prefilled: Record<number, boolean> = {};
      todayAttendance.forEach((record) => {
        prefilled[record.studentId] = record.isPresent;
      });
      // Set prefilled data to store
      Object.entries(prefilled).forEach(([studentId, isPresent]) => {
        setAttendance(Number(studentId), isPresent);
      });
    }
  }, [isAttendanceMode, user?.role, todayAttendance, setAttendance]);

  const currentDormId = dormId ? +dormId : undefined;

  // --- Columns ---
  const columns: ColumnsType<IStudent> = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "F.I.O",
      dataIndex: "fullName",
      key: "fio", // Backend expects 'fio'
      sorter: true,
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
      key: "xona", // Backend expects 'xona'
      sorter: true,
    },
    {
      title: "Ish joyi",
      dataIndex: "job",
      key: "job",
      render: (job) => job || "-",
    },
  ];

  if (isAttendanceMode) {
    columns.unshift({
      title: "Davomat",
      key: "attendance",
      fixed: "left",
      width: 100,
      render: (_, record) => {
        const existingAttendance = todayAttendance.find((a) => a.studentId === record.id);
        const isLocked = existingAttendance && user?.role === "moderator";

        let isChecked = false;
        if (attendanceData[record.id] !== undefined) {
          isChecked = attendanceData[record.id];
        } else if (isLocked && existingAttendance) {
          isChecked = existingAttendance.isPresent;
        }

        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              className="attendance-checkbox"
              checked={isChecked}
              onChange={(e) => {
                e.stopPropagation();
                setAttendance(record.id, e.target.checked);
              }}
              disabled={isLocked}
            />
            {existingAttendance && user?.role === "moderator" && (
              <Tag color={existingAttendance.isPresent ? "green" : "red"}>
                {existingAttendance.isPresent ? "Bor" : "Yo'q"}
              </Tag>
            )}
          </div>
        );
      },
    });
  }

  if (!isAttendanceMode && user?.role === "admin") {
    columns.push({
      title: "Amallar",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setEditingStudent(record);
              setEditForm({ roomNumber: record.roomNumber || "", job: record.job || "" });
              setEditModalOpen(true);
            }}
          >
            Tahrirlash
          </Button>
          <Popconfirm
            title="Talabani yotoqxonadan chiqarmoqchimisiz?"
            onConfirm={(e) => [unassignStudent(record.id), e?.stopPropagation()]}
            okText="Ha"
            cancelText="Yo'q"
            onCancel={(e) => e?.stopPropagation()}
          >
            <Button danger icon={<UserDeleteOutlined />} size="small" onClick={(e) => e.stopPropagation()}>
              Chiqarish
            </Button>
          </Popconfirm>
        </Space>
      ),
    });
  }

  // --- Render ---
  return (
    <main className="p-4 md:p-6 pb-24">
      <style>
        {`
          .attendance-checkbox .ant-checkbox-inner {
            width: 24px;
            height: 24px;
          }
          .attendance-checkbox .ant-checkbox-inner::after {
            width: 8px;
            height: 12px;
          }
          .attendance-row {
            cursor: pointer;
          }
          .attendance-row:hover {
            background-color: #f0f0f0;
          }
        `}
      </style>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Title level={2} className="mb-0!">
          Talabalar
        </Title>
        <Space wrap>
          {!isAttendanceMode && (
            <>
              <Button onClick={toggleMode}>Davomat qilish</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                Talaba qo'shish
              </Button>
            </>
          )}
        </Space>
      </div>

      {isAttendanceMode && (
        <div className="fixed bottom-0 right-0 left-0 lg:left-[240px] p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex justify-end gap-3 z-30">
          <Button onClick={resetAttendance} icon={<CloseOutlined />} size="large">
            Bekor qilish
          </Button>
          <Button
            type="primary"
            onClick={handleSaveAttendance}
            loading={isSavingAttendance}
            icon={<CheckOutlined />}
            size="large"
          >
            Saqlash
          </Button>
        </div>
      )}

      <Space wrap className="mb-3 w-full">
        <Input
          placeholder="F.I.O, pasport yoki fakultet bo'yicha qidirish"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-[300px]"
          allowClear
        />
      </Space>

      <Table
        dataSource={students}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
        onRow={(record) => {
          if (isAttendanceMode) {
            const existingAttendance = todayAttendance.find((a) => a.studentId === record.id);
            const isLocked = existingAttendance && user?.role === "moderator";

            if (!isLocked) {
              return {
                onClick: () => {
                  const currentValue = attendanceData[record.id];
                  setAttendance(record.id, !currentValue);
                },
                className: "attendance-row",
              };
            }
            return {};
          }

          return {
            onClick: () => {
              setSelectedStudentForHistory(record.id);
              setHistoryModalOpen(true);
            },
            style: { cursor: "pointer" },
          };
        }}
      />
      {/* Sentinel for infinite scroll */}
      {/* Ensure it has dimension so observer can see it */}
      <div ref={setLoadMoreRef} className="h-10 w-full flex items-center justify-center py-4 text-gray-500">
        {(hasNextPage || isFetchingNextPage) && (isFetchingNextPage ? "Yuklanmoqda..." : "Yana yuklash...")}
      </div>

      <Modal
        title="Talaba qo'shish"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          setTriggeredSearch("");
          setGlobalSearch("");
          setSelectedStudent(null);
          setAssignForm({ roomNumber: "", job: "" });
        }}
        footer={null}
        width={700}
      >
        {selectedStudent ? (
          <div className="flex flex-col gap-4">
            <Typography.Text strong>Talaba: {selectedStudent.fullName}</Typography.Text>
            <Input
              placeholder="Xona raqami (Majburiy)"
              value={assignForm.roomNumber}
              onChange={(e) => setAssignForm({ ...assignForm, roomNumber: e.target.value })}
            />
            <Input
              placeholder="Ish joyi (Ixtiyoriy)"
              value={assignForm.job}
              onChange={(e) => setAssignForm({ ...assignForm, job: e.target.value })}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => setSelectedStudent(null)}>Orqaga</Button>
              <Button
                type="primary"
                disabled={!assignForm.roomNumber}
                onClick={() => {
                  if (currentDormId && assignForm.roomNumber) {
                    assignStudent({
                      studentId: selectedStudent.id,
                      dormitoryId: currentDormId,
                      roomNumber: assignForm.roomNumber,
                      job: assignForm.job,
                    });
                  }
                }}
              >
                Tasdiqlash
              </Button>
            </div>
          </div>
        ) : (
          <>
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
              <>
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
                      render: (val: any) => val || <Tag color="green">Biriktirilmagan</Tag>,
                    },
                    {
                      title: "Amal",
                      render: (_: any, record: IStudent) => (
                        <Button
                          type="primary"
                          disabled={!!record.dormitoryId}
                          onClick={() => {
                            if (currentDormId) {
                              setSelectedStudent(record);
                              setAssignForm({ roomNumber: "", job: "" });
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
                {/* Search Sentinel */}
                <div
                  ref={setSearchLoadMoreRef}
                  className="h-10 w-full flex items-center justify-center py-2 text-gray-500"
                >
                  {(hasNextSearchPage || isFetchingNextSearchPage) &&
                    (isFetchingNextSearchPage ? "Yuklanmoqda..." : "...")}
                </div>
              </>
            )}
            {foundStudents.length === 0 && globalSearch && !isSearching && (
              <div className="text-center text-gray-500">Talaba topilmadi</div>
            )}
          </>
        )}
      </Modal>

      {/* Edit Room/Job Modal */}
      <Modal
        title="Xona va Ish joyini tahrirlash"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingStudent(null);
          setEditForm({ roomNumber: "", job: "" });
        }}
        onOk={() => {
          if (editingStudent && editForm.roomNumber) {
            updateRoomJob({
              id: editingStudent.id,
              roomNumber: editForm.roomNumber,
              job: editForm.job,
            });
          } else {
            message.warning("Xona raqamini kiriting");
          }
        }}
        confirmLoading={isUpdatingRoomJob}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        {editingStudent && (
          <div className="flex flex-col gap-4">
            <div>
              <Typography.Text strong>Talaba: </Typography.Text>
              <Typography.Text>{editingStudent.fullName}</Typography.Text>
            </div>
            <Input
              placeholder="Xona raqami (Majburiy)"
              value={editForm.roomNumber}
              onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
            />
            <Input
              placeholder="Ish joyi (Ixtiyoriy)"
              value={editForm.job}
              onChange={(e) => setEditForm({ ...editForm, job: e.target.value })}
            />
          </div>
        )}
      </Modal>

      {/* History Modal */}
      <Modal
        title="Davomat tarixi"
        open={historyModalOpen}
        onCancel={() => {
          setHistoryModalOpen(false);
          setSelectedStudentForHistory(null);
        }}
        footer={null}
        width={800}
      >
        {isLoadingHistory ? (
          <div className="text-center py-4">Yuklanmoqda...</div>
        ) : monthAttendance ? (
          <div>
            <div className="mb-4 flex justify-between items-start">
              <div>
                <Typography.Title level={4}>{monthAttendance.student?.fullName}</Typography.Title>
                <Typography.Text type="secondary">
                  Hozirgi yotoqxona: {monthAttendance.student?.dormitory?.name || "Tayinlanmagan"}
                </Typography.Text>
              </div>
              <Button icon={<DownloadOutlined />} onClick={handleDownloadFullHistory} loading={isDownloading}>
                Yuklab olish
              </Button>
            </div>

            {monthAttendance.records && monthAttendance.records.length > 0 ? (
              <Table
                dataSource={monthAttendance.records}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: "Sana",
                    dataIndex: "date",
                    key: "date",
                    render: (date: string) => {
                      const d = new Date(date);
                      const year = d.getUTCFullYear();
                      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
                      const day = String(d.getUTCDate()).padStart(2, "0");
                      return `${day}.${month}.${year}`;
                    },
                  },
                  {
                    title: "Yotoqxona",
                    dataIndex: ["dormitory", "name"],
                    key: "dormitory",
                    render: (name: string, record: any) => {
                      const isCurrentDorm = record.dormitory?.id === monthAttendance.student?.dormitory?.id;
                      return (
                        <div className="flex items-center gap-2">
                          <span>{name}</span>
                          {!isCurrentDorm && <Tag color="orange">Ko'chirilgan</Tag>}
                        </div>
                      );
                    },
                  },
                  {
                    title: "Xona",
                    dataIndex: "roomNumber",
                    key: "roomNumber",
                    render: (roomNumber: string) => {
                      const isCurrentRoom = roomNumber === monthAttendance.student?.roomNumber;
                      return (
                        <div className="flex items-center gap-2">
                          <span>{roomNumber || "-"}</span>
                          {roomNumber && !isCurrentRoom && <Tag color="orange">Ko'chirilgan</Tag>}
                        </div>
                      );
                    },
                  },
                  {
                    title: "Holat",
                    dataIndex: "isPresent",
                    key: "isPresent",
                    render: (isPresent: boolean) => (
                      <Tag color={isPresent ? "green" : "red"}>{isPresent ? "Bor edi" : "Yo'q edi"}</Tag>
                    ),
                  },
                ]}
              />
            ) : (
              <div className="text-center text-gray-500 py-4">Bu oy uchun yozuvlar yo'q</div>
            )}
          </div>
        ) : null}
      </Modal>
    </main>
  );
};

export default StudentsPage;
