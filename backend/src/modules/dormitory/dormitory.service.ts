import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/common/services/prisma.service";
import { CreateDormitoryDto } from "./dto/create-dormitory.dto";
import { UpdateDormitoryDto } from "./dto/update-dormitory.dto";

@Injectable()
export class DormitoryService {
  constructor(private readonly prisma: PrismaService) {}

  create(createDormitoryDto: CreateDormitoryDto) {
    return this.prisma.dormitory.create({
      data: createDormitoryDto,
    });
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    sort: string = "createdAt",
    order: "asc" | "desc" = "desc",
  ) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          name: { contains: search, mode: "insensitive" as const },
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.dormitory.findMany({
        skip,
        take: limit,
        where,
        include: {
          students: true,
          user: true,
          _count: {
            select: { students: true },
          },
        },
        orderBy: {
          [sort]: order,
        },
      }),
      this.prisma.dormitory.count({ where }),
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
    const dormitory = await this.prisma.dormitory.findUnique({
      where: { id },
      include: {
        students: true,
      },
    });

    if (!dormitory) throw new NotFoundException(`Dormitory #${id} not found`);

    return dormitory;
  }

  async update(id: number, updateDormitoryDto: UpdateDormitoryDto) {
    await this.findOne(id);
    return this.prisma.dormitory.update({
      where: { id },
      data: updateDormitoryDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.dormitory.delete({
      where: { id },
    });
  }
}
