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
  students?: any[];
  _count?: {
    students: number;
  };
}

export interface CreateDormitoryDto {
  name: string;
}

export interface UpdateDormitoryDto {
  name?: string;
}

export interface IStatistics {
  studentsCount: number;
  dormitoriesCount: number;
  presentToday: number;
  absentToday: number;
}
