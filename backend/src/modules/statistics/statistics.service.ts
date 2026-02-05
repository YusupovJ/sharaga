import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/services/prisma.service";

export interface IStatistics {
  studentsCount: number;
  dormitoriesCount: number;
  presentToday: number;
  absentToday: number;
}

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatistics(): Promise<IStatistics> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const [studentsCount, dormitoriesCount, presentTodayCount] = await Promise.all([
      this.prisma.students.count({ where: { dormitoryId: { not: null } } }),
      this.prisma.dormitory.count(),
      this.prisma.history.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
    ]);

    const absentToday = studentsCount - presentTodayCount;

    return {
      studentsCount,
      dormitoriesCount,
      presentToday: presentTodayCount,
      absentToday: absentToday > 0 ? absentToday : 0,
    };
  }
}
