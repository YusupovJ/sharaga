import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { hashSync } from "bcrypt";
import { PrismaService } from "src/common/services/prisma.service";
import { CreateUserDto, UpdateUserDto } from "./dto/user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { login: createUserDto.login },
    });

    if (existingUser) {
      throw new BadRequestException("Bunday loginli foydalanuvchi mavjud");
    }

    const hashedPassword = hashSync(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        login: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        login: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        login: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("Foydalanuvchi topilmadi");
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("Foydalanuvchi topilmadi");
    }

    if (updateUserDto.login && updateUserDto.login !== user.login) {
      const existingUser = await this.prisma.user.findUnique({
        where: { login: updateUserDto.login },
      });
      if (existingUser) {
        throw new BadRequestException("Bunday loginli foydalanuvchi mavjud");
      }
    }

    const data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password = hashSync(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        login: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async remove(id: number) {
    await this.prisma.user.delete({
      where: { id },
    });
    return { message: "Foydalanuvchi o'chirildi" };
  }
}
