import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserRole } from "generated/prisma/enums";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/role.guard";
import { PrismaService } from "src/common/services/prisma.service";

@Controller("users")
@Roles(UserRole.admin)
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("moderators")
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
}
