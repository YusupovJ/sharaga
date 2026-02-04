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
    // Получаем начало и конец сегодняшнего дня
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Считаем количество студентов и общежитий
    const [studentsCount, dormitoriesCount, presentTodayCount] = await Promise.all([
      this.prisma.students.count(),
      this.prisma.dormitory.count(),
      // Считаем уникальных студентов, посетивших сегодня (через history)
      this.prisma.history.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
    ]);

    // Отсутствующие = все студенты - присутствующие
    const absentToday = studentsCount - presentTodayCount;

    return {
      studentsCount,
      dormitoriesCount,
      presentToday: presentTodayCount,
      absentToday: absentToday > 0 ? absentToday : 0,
    };
  }
}
