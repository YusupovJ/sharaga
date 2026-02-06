import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserRole } from "generated/prisma/enums";
import { Roles } from "src/common/decorators/roles.decorator";
import { CurrentUser } from "src/common/decorators/user.decorator";
import { RolesGuard } from "src/common/guards/role.guard";
import type { IPayload } from "src/common/types";
import { StatisticsService } from "./statistics.service";

@Controller("statistics")
@Roles(UserRole.admin, UserRole.moderator, UserRole.superAdmin)
@UseGuards(RolesGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  getStatistics(@CurrentUser() user: IPayload) {
    return this.statisticsService.getStatistics(user);
  }
}
