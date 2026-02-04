import { Controller, Get, UseGuards } from "@nestjs/common";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/role.guard";
import { StatisticsService } from "./statistics.service";

@Controller("statistics")
@Roles("admin", "moderator")
@UseGuards(RolesGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  getStatistics() {
    return this.statisticsService.getStatistics();
  }
}
