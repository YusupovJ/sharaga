import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UserRole } from "generated/prisma/enums";
import { PrismaService } from "src/common/services/prisma.service";
import { IPayload } from "src/common/types";
import { AssignStudentDto } from "./dto/assign-student.dto";
import { CreateStudentDto } from "./dto/create-student.dto";
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
      const dormitory = await this.prisma.dormitory.findUnique({
        where: { userId: user.id },
      });
      if (!dormitory) {
        return [];
      }
      where.dormitoryId = dormitory.id;
    } else if (user.role === UserRole.admin && query.dormitoryId) {
      where.dormitoryId = Number(query.dormitoryId);
    }

    if (query.fullName) where.fullName = { contains: query.fullName, mode: "insensitive" };
    if (query.passport) where.passport = { contains: query.passport, mode: "insensitive" };
    if (query.faculty) where.faculty = { contains: query.faculty, mode: "insensitive" };

    return this.prisma.students.findMany({
      where,
      include: {
        dormitory: true,
      },
      orderBy: { fullName: "asc" },
    });
  }

  async searchGlobal(passport: string) {
    if (!passport) return [];
    return this.prisma.students.findMany({
      where: {
        passport: { contains: passport, mode: "insensitive" },
      },
      include: {
        dormitory: true,
      },
    });
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
      data: { dormitoryId: dto.dormitoryId },
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

  async bulkAttendance(user: IPayload, dto: BulkAttendanceDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let modDormId: number | null = null;
    if (user.role === UserRole.moderator) {
      const dorm = await this.prisma.dormitory.findUnique({ where: { userId: user.id } });
      if (!dorm) throw new ForbiddenException("Moderator has no dormitory");
      modDormId = dorm.id;
    }

    const results: number[] = [];

    for (const rec of dto.records) {
      const student = await this.prisma.students.findUnique({ where: { id: rec.studentId } });
      if (!student || !student.dormitoryId) continue;

      if (modDormId && student.dormitoryId !== modDormId) {
        continue;
      }

      await this.prisma.history.upsert({
        where: {
          studentId_date: {
            studentId: rec.studentId,
            date: today,
          },
        },
        create: {
          studentId: rec.studentId,
          dormitoryId: student.dormitoryId,
          userId: user.id,
          isPresent: rec.isPresent,
          date: today,
        },
        update: {
          isPresent: rec.isPresent,
          userId: user.id,
        },
      });
      results.push(rec.studentId);
    }
    return { count: results.length };
  }
}
