import { Injectable } from "@nestjs/common";
import { UserRole } from "generated/prisma/enums";
import { PrismaService } from "src/common/services/prisma.service";
import type { IPayload } from "src/common/types";

export interface IStatistics {
  studentsCount: number;
  dormitoriesCount: number;
  presentToday: number;
  absentToday: number;
  hasAttendanceToday: boolean;
}

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatistics(user: IPayload): Promise<IStatistics> {
    // Create date in ISO format (YYYY-MM-DD) to avoid timezone issues
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;
    const today = new Date(todayStr);

    // Build where clause based on user role
    let dormitoryIds: number[] = [];

    if (user.role === UserRole.moderator) {
      // Moderator sees only their dormitories
      const dorms = await this.prisma.dormitory.findMany({
        where: { userId: user.id },
        select: { id: true },
      });
      dormitoryIds = dorms.map((d) => d.id);
    }
    // Admin and superAdmin see all

    const studentWhere: any = { dormitoryId: { not: null } };
    if (dormitoryIds.length > 0) {
      studentWhere.dormitoryId = { in: dormitoryIds };
    }

    const dormitoryWhere: any = {};
    if (user.role === UserRole.moderator) {
      dormitoryWhere.userId = user.id;
    }

    // Check if there's any attendance record for today
    const attendanceWhere: any = { date: today };
    if (dormitoryIds.length > 0) {
      attendanceWhere.dormitoryId = { in: dormitoryIds };
    }

    const hasAttendanceToday = (await this.prisma.history.count({ where: attendanceWhere })) > 0;

    const [studentsCount, dormitoriesCount, presentTodayCount] = await Promise.all([
      this.prisma.students.count({ where: studentWhere }),
      this.prisma.dormitory.count({ where: dormitoryWhere }),
      this.prisma.history.count({
        where: {
          date: today,
          isPresent: true,
          ...(dormitoryIds.length > 0 ? { dormitoryId: { in: dormitoryIds } } : {}),
        },
      }),
    ]);

    const absentToday = studentsCount - presentTodayCount;

    return {
      studentsCount,
      dormitoriesCount,
      presentToday: presentTodayCount,
      absentToday: absentToday > 0 ? absentToday : 0,
      hasAttendanceToday,
    };
  }
}
