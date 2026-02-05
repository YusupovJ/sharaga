import { Module } from "@nestjs/common";
import { PrismaService } from "src/common/services/prisma.service";
import { AuthModule } from "./auth/auth.module";
import { DormitoryModule } from "./dormitory/dormitory.module";
import { StatisticsModule } from "./statistics/statistics.module";
import { StudentsModule } from "./students/students.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [AuthModule, StudentsModule, DormitoryModule, StatisticsModule, UsersModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
