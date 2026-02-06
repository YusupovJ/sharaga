import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "generated/prisma/enums";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/role.guard";
import { PrismaService } from "src/common/services/prisma.service";
import { CreateUserDto, UpdateUserDto } from "./dto/user.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  @Get("moderators")
  @Roles(UserRole.admin, UserRole.superAdmin)
  @UseGuards(RolesGuard)
  async getModerators() {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.moderator,
      },
      select: {
        id: true,
        login: true,
      },
    });
  }

  @Post()
  @Roles(UserRole.superAdmin)
  @UseGuards(RolesGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.superAdmin)
  @UseGuards(RolesGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @Roles(UserRole.superAdmin)
  @UseGuards(RolesGuard)
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(":id")
  @Roles(UserRole.superAdmin)
  @UseGuards(RolesGuard)
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(":id")
  @Roles(UserRole.superAdmin)
  @UseGuards(RolesGuard)
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }
}
