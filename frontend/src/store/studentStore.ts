import { create } from "zustand";

interface StudentStore {
  isAttendanceMode: boolean;
  attendanceData: Record<number, boolean>;
  toggleMode: () => void;
  setAttendance: (studentId: number, isPresent: boolean) => void;
  resetAttendance: () => void;
}

export const useStudentStore = create<StudentStore>((set) => ({
  isAttendanceMode: false,
  attendanceData: {},
  toggleMode: () =>
    set((state) => ({
      isAttendanceMode: !state.isAttendanceMode,
      attendanceData: {}, // Reset data when toggling? Or keep it? Requirement says "temporary Map ... before saving". Resetting on toggle seems safer to avoid stale data.
    })),
  setAttendance: (studentId, isPresent) =>
    set((state) => ({
      attendanceData: {
        ...state.attendanceData,
        [studentId]: isPresent,
      },
    })),
  resetAttendance: () => set({ attendanceData: {}, isAttendanceMode: false }),
}));
