import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/common/services/prisma.service";
import { StatisticsController } from "./statistics.controller";
import { StatisticsService } from "./statistics.service";

@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService, PrismaService, JwtService],
})
export class StatisticsModule {}
