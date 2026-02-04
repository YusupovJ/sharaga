import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/common/services/prisma.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createStudentDto: CreateStudentDto) {
    return this.prisma.students.create({
      data: createStudentDto,
    });
  }

  findAll() {
    return this.prisma.students.findMany({
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

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.students.delete({
      where: { id },
    });
  }
}
