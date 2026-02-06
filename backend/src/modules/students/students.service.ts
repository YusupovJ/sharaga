import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UserRole } from "generated/prisma/enums";
import { PrismaService } from "src/common/services/prisma.service";
import type { IPayload } from "src/common/types";
import * as xlsx from "xlsx";
import { AssignStudentDto } from "./dto/assign-student.dto";
import { CreateStudentDto } from "./dto/create-student.dto";
import { GetMonthAttendanceDto } from "./dto/get-month-attendance.dto";
import { BulkAttendanceDto } from "./dto/mark-attendance.dto";
import { StudentQueryDto } from "./dto/student-query.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createStudentDto: CreateStudentDto) {
    return this.prisma.students.create({
      data: createStudentDto,
    });
  }

  async findAll(user: IPayload, query: StudentQueryDto) {
    const where: any = {};

    if (user.role === UserRole.moderator) {
      const dormitory = await this.prisma.dormitory.findMany({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!dormitory) {
        return [];
      }
      where.dormitoryId = { in: dormitory.map((d) => d.id) };
    } else if ((user.role === UserRole.admin || user.role === UserRole.superAdmin) && query.dormitoryId) {
      where.dormitoryId = Number(query.dormitoryId);
    }

    // Global search across multiple fields
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: "insensitive" } },
        { passport: { contains: query.search, mode: "insensitive" } },
        { faculty: { contains: query.search, mode: "insensitive" } },
        { roomNumber: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (query.sort && query.order) {
      const fieldMap: Record<string, string> = {
        fio: "fullName",
        fullName: "fullName",
        xona: "roomNumber",
        roomNumber: "roomNumber",
        id: "id",
      };
      const field = fieldMap[query.sort] || "id";
      orderBy[field] = query.order;
    } else {
      orderBy.id = "asc";
    }

    const page = query.page || 1;
    const limit = query.limit || 30;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.students.findMany({
        where,
        include: {
          dormitory: true,
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      this.prisma.students.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async searchGlobal(passport: string, page = 1, limit = 30) {
    if (!passport) return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.students.findMany({
        where: {
          passport: { contains: passport, mode: "insensitive" },
        },
        include: {
          dormitory: true,
        },
        skip,
        take: limit,
      }),
      this.prisma.students.count({
        where: {
          passport: { contains: passport, mode: "insensitive" },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const student = await this.prisma.students.findUnique({
      where: { id },
      include: {
        dormitory: true,
      },
    });

    if (!student) throw new NotFoundException(`Student #${id} not found`);

    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    await this.findOne(id);
    return this.prisma.students.update({
      where: { id },
      data: updateStudentDto,
    });
  }

  async assignDormitory(id: number, dto: AssignStudentDto) {
    await this.findOne(id);
    const dorm = await this.prisma.dormitory.findUnique({ where: { id: dto.dormitoryId } });
    if (!dorm) throw new NotFoundException("Dormitory not found");

    return this.prisma.students.update({
      where: { id },
      data: {
        dormitoryId: dto.dormitoryId,
        roomNumber: dto.roomNumber,
        job: dto.job,
      },
    });
  }

  async updateRoomJob(id: number, dto: { roomNumber?: string; job?: string }) {
    await this.findOne(id);
    return this.prisma.students.update({
      where: { id },
      data: {
        roomNumber: dto.roomNumber,
        job: dto.job,
      },
    });
  }

  async unassignDormitory(id: number) {
    await this.findOne(id);
    return this.prisma.students.update({
      where: { id },
      data: { dormitoryId: null },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.students.delete({
      where: { id },
    });
  }

  async getTodayAttendance(user: IPayload, query: { dormitoryId?: number }) {
    // Create date in ISO format (YYYY-MM-DD) to avoid timezone issues
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;
    const today = new Date(todayStr);

    const dormitoryId = Number(query.dormitoryId);
    let dormitoryIds: number[] = [];

    if (user.role === UserRole.moderator) {
      const dorms = await this.prisma.dormitory.findMany({ where: { userId: user.id }, select: { id: true } });
      if (!dorms.length) throw new ForbiddenException("Moderator has no dormitory");
      dormitoryIds = dorms.map((d) => d.id);
    } else if (dormitoryId) {
      dormitoryIds = [dormitoryId];
    }

    const where: any = {
      date: today,
    };

    if (dormitoryIds.length > 0) {
      where.student = {
        dormitoryId: { in: dormitoryIds },
      };
    }

    const records = await this.prisma.history.findMany({
      where,
      select: {
        studentId: true,
        isPresent: true,
      },
    });

    return records;
  }

  async getMonthAttendance(studentId: number, query: GetMonthAttendanceDto) {
    // Use current year/month if not specified
    const now = new Date();
    const year = query.year ?? now.getFullYear();
    const month = query.month ?? now.getMonth() + 1; // getMonth() returns 0-11

    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, month, 0); // Last day of the month
    endDate.setHours(23, 59, 59, 999);

    // Fetch attendance records for this month
    const records = await this.prisma.history.findMany({
      where: {
        studentId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        dormitory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Get student info to see current dormitory and room
    const student = await this.prisma.students.findUnique({
      where: { id: studentId },
      include: {
        dormitory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      student,
      records,
      month,
      year,
    };
  }

  async bulkAttendance(user: IPayload, dto: BulkAttendanceDto) {
    // Create date in ISO format (YYYY-MM-DD) to avoid timezone issues
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;
    const today = new Date(todayStr);

    let modDormIds: number[] = [];
    if (user.role === UserRole.moderator) {
      const dorms = await this.prisma.dormitory.findMany({ where: { userId: user.id }, select: { id: true } });
      if (!dorms.length) throw new ForbiddenException("Moderator has no dormitory");
      modDormIds = dorms.map((d) => d.id);
    }

    const results: number[] = [];

    for (const rec of dto.records) {
      const student = await this.prisma.students.findUnique({ where: { id: rec.studentId } });
      if (!student || !student.dormitoryId) continue;

      if (user.role === UserRole.moderator && !modDormIds.includes(student.dormitoryId)) {
        continue;
      }

      // Check if attendance already exists
      if (user.role === UserRole.moderator) {
        const existing = await this.prisma.history.findUnique({
          where: {
            studentId_date: {
              studentId: rec.studentId,
              date: today,
            },
          },
        });

        // If attendance already exists, moderators cannot change it
        if (existing) {
          continue;
        }
      }

      await this.prisma.history.upsert({
        where: {
          studentId_date: {
            studentId: rec.studentId,
            date: today,
          },
        },
        update: {
          isPresent: rec.isPresent,
          userId: user.id,
          roomNumber: student.roomNumber,
        },
        create: {
          studentId: rec.studentId,
          isPresent: rec.isPresent,
          userId: user.id,
          dormitoryId: student.dormitoryId,
          roomNumber: student.roomNumber,
          date: today,
        },
      });

      results.push(rec.studentId);
    }

    return { success: true, updated: results };
  }

  async getStudentAttendanceExcel(studentId: number) {
    const student = await this.prisma.students.findUnique({
      where: { id: studentId },
      include: {
        dormitory: true,
        history: {
          orderBy: { date: "desc" },
          include: { dormitory: true },
        },
      },
    });

    if (!student) {
      throw new NotFoundException("Student not found");
    }

    const data = student.history.map((record) => {
      // @ts-ignore
      const dormName = record.dormitory?.name || student.dormitory?.name || "-";
      return {
        Sana: record.date.toISOString().split("T")[0],
        Yotoqxona: dormName,
        Xona: record.roomNumber || student.roomNumber || "-",
        Holat: record.isPresent ? "Bor" : "Yo'q",
      };
    });

    const ws = xlsx.utils.json_to_sheet(data);

    // Auto-width columns
    const wscols = [
      { wch: 15 }, // Sana
      { wch: 20 }, // Yotoqxona
      { wch: 10 }, // Xona
      { wch: 10 }, // Holat
    ];
    ws["!cols"] = wscols;

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Attendance");

    const fileName = `Attendance_${student.fullName.replace(/\s+/g, "_")}.xlsx`;
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    return { buffer, fileName };
  }
}
