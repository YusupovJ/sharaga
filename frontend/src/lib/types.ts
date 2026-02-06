export interface IError {
  error: string;
  message: string;
  statusCode: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IDormitory {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId?: number;
  user?: {
    id: number;
    login: string;
  };
  students?: any[];
  _count?: {
    students: number;
  };
}

export interface CreateDormitoryDto {
  name: string;
  userId?: number;
}

export interface UpdateDormitoryDto {
  name?: string;
  userId?: number;
}

export interface IStatistics {
  studentsCount: number;
  dormitoriesCount: number;
  presentToday: number;
  absentToday: number;
  hasAttendanceToday: boolean;
}

export interface IUser {
  id: number;
  login: string;
  role: "superAdmin" | "admin" | "moderator";
}
